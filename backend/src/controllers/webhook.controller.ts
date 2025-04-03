import { Request, Response } from 'express';
import { Lead, leadModel } from '../models/lead.model';
import { integrationSettingsModel } from '../models/integration-settings.model';
import { storeModel, Store } from '../models/store.model';
import wooCommerceService from '../services/woocommerce.service';
import crypto from 'crypto';
import { query } from '../config/database';

export const webhookController = {
  /**
   * Handle lead webhook from external sources
   */
  handleLeadWebhook: async (req: Request, res: Response) => {
    try {
      // Get API key from request header
      const apiKey = req.header('X-API-Key');
      
      // Validate API key
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: 'API key is required'
        });
      }
      
      // Get integration settings by API key
      const integration = await integrationSettingsModel.getByApiKey(apiKey);
      
      if (!integration) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key'
        });
      }
      
      // Check if integration is enabled
      if (!integration.is_enabled) {
        return res.status(403).json({
          success: false,
          message: 'This integration is disabled'
        });
      }
      
      // Log the webhook request
      const requestId = crypto.randomUUID();
      await integrationSettingsModel.logWebhookRequest({
        integration_id: integration.id as number, // Type assertion to fix TypeScript error
        request_id: requestId,
        source: integration.name,
        payload: JSON.stringify(req.body),
        ip_address: req.ip,
        user_agent: req.header('User-Agent') || 'Unknown',
        created_at: new Date().toISOString()
      });
      
      // Extract lead data based on the integration type
      let leadData: Lead;
      
      switch (integration.type) {
        case 'elementor':
          leadData = extractElementorLeadData(req.body, integration);
          break;
        case 'contact-form-7':
          leadData = extractContactForm7LeadData(req.body, integration);
          break;
        case 'facebook':
          leadData = extractFacebookLeadData(req.body, integration);
          break;
        case 'custom':
          leadData = extractCustomLeadData(req.body, integration);
          break;
        default:
          leadData = extractGenericLeadData(req.body, integration);
      }
      
      // Add store_id to the lead data if the integration is store-specific
      if (integration.store_id) {
        leadData.store_id = integration.store_id;
      }
      
      // Validate required fields
      if (!leadData.name || !leadData.source) {
        return res.status(400).json({
          success: false,
          message: 'Name and source are required fields',
          request_id: requestId
        });
      }
      
      // Create the lead
      const leadId = await leadModel.create(leadData);
      
      // Update the webhook log with the lead ID
      await integrationSettingsModel.updateWebhookLog(requestId, {
        lead_id: leadId,
        status: 'success'
      });
      
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: {
          request_id: requestId,
          lead_id: leadId
        }
      });
    } catch (error) {
      console.error('Error in handleLeadWebhook controller:', error);
      
      // Log the error if we have a request ID
      const requestId = req.body.request_id || crypto.randomUUID();
      
      try {
        await integrationSettingsModel.updateWebhookLog(requestId, {
          status: 'error',
          error_message: (error as Error).message
        });
      } catch (logError) {
        console.error('Error updating webhook log:', logError);
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: (error as Error).message,
        request_id: requestId
      });
    }
  },

  /**
   * Handle lead webhook with store ID in URL (no authentication required)
   */
  handleStoreWebhook: async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      if (isNaN(storeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      // Log detailed information about the request
      console.log('Received store webhook for store ID:', storeId);
      console.log('Request headers:', req.headers);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Content-Type:', req.headers['content-type']);
      
      // Extract lead data from request body with enhanced field detection
      let name = '';
      let email = '';
      let phone = '';
      let message = '';
      
      // Handle different data formats
      if (typeof req.body === 'object') {
        // Direct properties - including Hebrew field names
        if (req.body.name) name = req.body.name;
        else if (req.body.fullName) name = req.body.fullName;
        else if (req.body.full_name) name = req.body.full_name;
        else if (req.body['שם']) name = req.body['שם'];
        else if (req.body['שם מלא']) name = req.body['שם מלא'];
        else if (req.body['שם ']) name = req.body['שם ']; // With trailing space
        
        if (req.body.email) email = req.body.email;
        else if (req.body.emailAddress) email = req.body.emailAddress;
        else if (req.body.email_address) email = req.body.email_address;
        else if (req.body['אימייל']) email = req.body['אימייל'];
        else if (req.body['מייל']) email = req.body['מייל'];
        else if (req.body['דוא"ל']) email = req.body['דוא"ל'];
        
        if (req.body.phone) phone = req.body.phone;
        else if (req.body.phoneNumber) phone = req.body.phoneNumber;
        else if (req.body.phone_number) phone = req.body.phone_number;
        else if (req.body.tel) phone = req.body.tel;
        else if (req.body['טלפון']) phone = req.body['טלפון'];
        else if (req.body['מספר טלפון']) phone = req.body['מספר טלפון'];
        else if (req.body['נייד']) phone = req.body['נייד'];
        
        if (req.body.message) message = req.body.message;
        else if (req.body.notes) message = req.body.notes;
        else if (req.body.comments) message = req.body.comments;
        else if (req.body['הודעה']) message = req.body['הודעה'];
        else if (req.body['תוכן']) message = req.body['תוכן'];
        else if (req.body['הערות']) message = req.body['הערות'];
        
        // Handle Elementor form data format
        // Elementor sometimes sends data in form_fields or fields array/object
        if (!name && req.body.form_fields) {
          const fields = Array.isArray(req.body.form_fields) 
            ? req.body.form_fields 
            : Object.values(req.body.form_fields);
          
          fields.forEach((field: any) => {
            if (field.id === 'name' || field.name === 'name') {
              name = field.value || '';
            } else if (field.id === 'email' || field.name === 'email') {
              email = field.value || '';
            } else if (field.id === 'phone' || field.name === 'phone' || field.id === 'tel' || field.name === 'tel') {
              phone = field.value || '';
            } else if (field.id === 'message' || field.name === 'message') {
              message = field.value || '';
            }
          });
        }
        
        // Handle form data where fields might be nested under 'fields' property
        if (!name && req.body.fields) {
          const fields = Array.isArray(req.body.fields) 
            ? req.body.fields 
            : Object.values(req.body.fields);
          
          fields.forEach((field: any) => {
            if (typeof field === 'object') {
              if (field.id === 'name' || field.name === 'name') {
                name = field.value || '';
              } else if (field.id === 'email' || field.name === 'email') {
                email = field.value || '';
              } else if (field.id === 'phone' || field.name === 'phone' || field.id === 'tel' || field.name === 'tel') {
                phone = field.value || '';
              } else if (field.id === 'message' || field.name === 'message') {
                message = field.value || '';
              }
            }
          });
        }
        
        // Last resort: try to find any property that might contain the name
        if (!name) {
          // Look for any property that might contain 'name' in its key
          Object.entries(req.body).forEach(([key, value]) => {
            if (!name && 
                (key.toLowerCase().includes('name') || 
                 key.toLowerCase().includes('שם')) && 
                typeof value === 'string') {
              name = value;
            }
          });
        }
      }
      
      // Create lead data object
      const leadData: Lead = {
        name,
        email,
        phone,
        source: 'Form Webhook',
        status: 'new',
        notes: message
        // Not setting store_id yet - will check if it exists first
      };
      
      console.log('Extracted lead data:', leadData);
      
      // If name is still empty, try to use any non-empty field as name
      if (!leadData.name && (leadData.email || leadData.phone)) {
        leadData.name = leadData.email || leadData.phone || 'Unknown';
        console.log('Using alternative field as name:', leadData.name);
      }
      
      // Validate required fields - more lenient now
      if (!leadData.name && !leadData.email && !leadData.phone) {
        console.log('Validation failed: No identifying information found');
        return res.status(400).json({
          success: false,
          message: 'At least one of name, email, or phone is required',
          received_data: req.body
        });
      }
      
      try {
        // First ensure the stores table exists
        await storeModel.createTable();
        
        // Check if the store exists in the database
        let store = await storeModel.getById(storeId);
        
        // If store doesn't exist in the database but exists in WooCommerce service, add it to the database
        if (!store) {
          try {
            // Try to get store from WooCommerce service
            const wcStore = wooCommerceService.getStore(storeId);
            console.log('Found store in WooCommerce service:', wcStore);
            
            // Create the store in the database with the same ID
            const storeData: Store = {
              name: wcStore.name,
              url: wcStore.url,
              consumer_key: wcStore.consumer_key,
              consumer_secret: wcStore.consumer_secret,
              status: wcStore.status as 'active' | 'inactive'
            };
            
            // Insert the store directly with the specific ID
            const insertStoreQuery = `
              INSERT INTO woocommerce_stores (id, name, url, consumer_key, consumer_secret, status)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO UPDATE
              SET name = EXCLUDED.name,
                  url = EXCLUDED.url,
                  consumer_key = EXCLUDED.consumer_key,
                  consumer_secret = EXCLUDED.consumer_secret,
                  status = EXCLUDED.status
              RETURNING id
            `;
            
            const insertResult = await query(insertStoreQuery, [
              storeId,
              storeData.name,
              storeData.url,
              storeData.consumer_key,
              storeData.consumer_secret,
              storeData.status
            ]);
            
            console.log(`Created/updated store in database with ID: ${insertResult.rows[0].id}`);
            
            // Now the store exists in the database, we can associate the lead with it
            leadData.store_id = storeId;
            const leadId = await leadModel.create(leadData);
            
            res.status(201).json({
              success: true,
              message: 'Lead created successfully with new store',
              data: {
                lead_id: leadId,
                store_id: storeId
              }
            });
            return; // Exit early
          } catch (storeError) {
            console.error('Error getting/creating store:', storeError);
            
            // If we can't get/create the store, create the lead without store association
            delete leadData.store_id;
            const leadId = await leadModel.create(leadData);
            
            res.status(201).json({
              success: true,
              message: 'Lead created successfully (without store association)',
              data: {
                lead_id: leadId
              }
            });
            return; // Exit early
          }
        } else {
          // Store exists, create lead with store association
          leadData.store_id = storeId;
          const leadId = await leadModel.create(leadData);
          
          res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: {
              lead_id: leadId,
              store_id: storeId
            }
          });
          return; // Exit early
        }
      } catch (error) {
        console.error('Error in store webhook (store handling):', error);
        
        // Last resort: create lead without store association
        try {
          delete leadData.store_id;
          const leadId = await leadModel.create(leadData);
          
          res.status(201).json({
            success: true,
            message: 'Lead created successfully (without store association - fallback)',
            data: {
              lead_id: leadId
            }
          });
        } catch (finalError) {
          console.error('Final error creating lead:', finalError);
          res.status(500).json({
            success: false,
            message: 'Failed to process webhook',
            error: (finalError as Error).message
          });
        }
      }
    } catch (error) {
      console.error('Error in store webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: (error as Error).message
      });
    }
  }
};

/**
 * Extract lead data from Elementor form submission
 */
function extractElementorLeadData(data: any, integration: any): Lead {
  // Default field mapping for Elementor
  const fieldMapping = integration.field_mapping || {
    name: 'name',
    email: 'email',
    phone: 'phone',
    message: 'message'
  };
  
  return {
    name: data[fieldMapping.name] || '',
    email: data[fieldMapping.email] || '',
    phone: data[fieldMapping.phone] || '',
    source: `Elementor - ${integration.name}`,
    status: 'new',
    notes: data[fieldMapping.message] || '',
    assigned_to: integration.default_assignee || undefined
  };
}

/**
 * Extract lead data from Contact Form 7 submission
 */
function extractContactForm7LeadData(data: any, integration: any): Lead {
  // Default field mapping for Contact Form 7
  const fieldMapping = integration.field_mapping || {
    name: 'your-name',
    email: 'your-email',
    phone: 'your-phone',
    message: 'your-message'
  };
  
  return {
    name: data[fieldMapping.name] || '',
    email: data[fieldMapping.email] || '',
    phone: data[fieldMapping.phone] || '',
    source: `Contact Form 7 - ${integration.name}`,
    status: 'new',
    notes: data[fieldMapping.message] || '',
    assigned_to: integration.default_assignee || undefined
  };
}

/**
 * Extract lead data from Facebook Lead Ads
 */
function extractFacebookLeadData(data: any, integration: any): Lead {
  // Facebook sends leads in a specific format
  const leadData = data.entry?.[0]?.changes?.[0]?.value?.leadgen_id 
    ? data.entry[0].changes[0].value 
    : data;
  
  // Get form data from the lead
  const formData = leadData.form_data || [];
  
  // Create a map of field names to values
  const fieldMap: Record<string, string> = {};
  formData.forEach((field: any) => {
    fieldMap[field.name] = field.values?.[0] || '';
  });
  
  // Default field mapping for Facebook
  const fieldMapping = integration.field_mapping || {
    name: 'full_name',
    email: 'email',
    phone: 'phone_number',
    message: 'message'
  };
  
  return {
    name: fieldMap[fieldMapping.name] || '',
    email: fieldMap[fieldMapping.email] || '',
    phone: fieldMap[fieldMapping.phone] || '',
    source: `Facebook - ${integration.name}`,
    status: 'new',
    notes: fieldMap[fieldMapping.message] || `Facebook Lead ID: ${leadData.leadgen_id || 'Unknown'}`,
    assigned_to: integration.default_assignee || undefined
  };
}

/**
 * Extract lead data from custom webhook format
 */
function extractCustomLeadData(data: any, integration: any): Lead {
  // Use the custom field mapping defined in the integration
  const fieldMapping = integration.field_mapping || {
    name: 'name',
    email: 'email',
    phone: 'phone',
    message: 'message'
  };
  
  return {
    name: getNestedValue(data, fieldMapping.name) || '',
    email: getNestedValue(data, fieldMapping.email) || '',
    phone: getNestedValue(data, fieldMapping.phone) || '',
    source: `Custom - ${integration.name}`,
    status: 'new',
    notes: getNestedValue(data, fieldMapping.message) || '',
    assigned_to: integration.default_assignee || undefined
  };
}

/**
 * Extract lead data from generic webhook format
 */
function extractGenericLeadData(data: any, integration: any): Lead {
  // Try to intelligently extract lead data from common field names
  return {
    name: data.name || data.fullName || data.full_name || data.customerName || '',
    email: data.email || data.emailAddress || data.email_address || '',
    phone: data.phone || data.phoneNumber || data.phone_number || data.mobile || '',
    source: `Webhook - ${integration.name}`,
    status: 'new',
    notes: data.message || data.notes || data.comments || '',
    assigned_to: integration.default_assignee || undefined
  };
}

/**
 * Get a nested value from an object using a dot-notation path
 */
function getNestedValue(obj: any, path: string): any {
  if (!path) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}
