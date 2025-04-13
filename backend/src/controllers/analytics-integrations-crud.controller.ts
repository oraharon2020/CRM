import { Request, Response } from 'express';
import { analyticsIntegrationSettingsModel } from '../models/analytics-integration-settings.model';

/**
 * Get all analytics integrations
 */
export const getAllAnalyticsIntegrations = async (req: Request, res: Response) => {
  try {
    const integrations = await analyticsIntegrationSettingsModel.getAll();
    
    return res.status(200).json(integrations);
  } catch (error) {
    console.error('Error fetching analytics integrations:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics integrations' });
  }
};

/**
 * Get analytics integrations by store ID
 */
export const getAnalyticsIntegrationsByStore = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    
    const integrations = await analyticsIntegrationSettingsModel.getAll(parseInt(storeId));
    
    return res.status(200).json(integrations);
  } catch (error) {
    console.error('Error fetching analytics integrations by store:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics integrations by store' });
  }
};

/**
 * Get analytics integration by ID
 */
export const getAnalyticsIntegrationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const integration = await analyticsIntegrationSettingsModel.getById(parseInt(id));
    
    if (!integration) {
      return res.status(404).json({ message: 'Analytics integration not found' });
    }
    
    return res.status(200).json(integration);
  } catch (error) {
    console.error('Error fetching analytics integration by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics integration by ID' });
  }
};

/**
 * Create a new analytics integration
 */
export const createAnalyticsIntegration = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      api_key,
      store_id,
      is_enabled,
      settings
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !api_key) {
      return res.status(400).json({ message: 'Name, type, and API key are required' });
    }
    
    // Create the integration
    const integrationId = await analyticsIntegrationSettingsModel.create({
      name,
      type,
      store_id: store_id || null,
      credentials: { api_key },
      is_enabled: is_enabled !== undefined ? is_enabled : true,
      settings: settings || {}
    });
    
    const integration = await analyticsIntegrationSettingsModel.getById(integrationId);
    
    return res.status(201).json(integration);
  } catch (error) {
    console.error('Error creating analytics integration:', error);
    return res.status(500).json({ message: 'Failed to create analytics integration' });
  }
};

/**
 * Update an analytics integration
 */
export const updateAnalyticsIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      api_key,
      store_id,
      is_enabled,
      settings
    } = req.body;
    
    // Find the integration
    const integration = await analyticsIntegrationSettingsModel.getById(parseInt(id));
    
    if (!integration) {
      return res.status(404).json({ message: 'Analytics integration not found' });
    }
    
    // Update the integration
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (store_id !== undefined) updateData.store_id = store_id;
    if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
    if (settings !== undefined) updateData.settings = settings;
    
    if (api_key !== undefined) {
      updateData.credentials = {
        ...integration.credentials,
        api_key
      };
    }
    
    const success = await analyticsIntegrationSettingsModel.update(parseInt(id), updateData);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to update analytics integration' });
    }
    
    const updatedIntegration = await analyticsIntegrationSettingsModel.getById(parseInt(id));
    
    return res.status(200).json(updatedIntegration);
  } catch (error) {
    console.error('Error updating analytics integration:', error);
    return res.status(500).json({ message: 'Failed to update analytics integration' });
  }
};

/**
 * Delete an analytics integration
 */
export const deleteAnalyticsIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the integration
    const integration = await analyticsIntegrationSettingsModel.getById(parseInt(id));
    
    if (!integration) {
      return res.status(404).json({ message: 'Analytics integration not found' });
    }
    
    // Delete the integration
    const success = await analyticsIntegrationSettingsModel.delete(parseInt(id));
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete analytics integration' });
    }
    
    return res.status(200).json({ message: 'Analytics integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting analytics integration:', error);
    return res.status(500).json({ message: 'Failed to delete analytics integration' });
  }
};
