import express, { Request, Response, Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { leadController } from '../controllers/lead.controller';
import { webhookController } from '../controllers/webhook.controller';
import { integrationSettingsController } from '../controllers/integration-settings.controller';
import { Lead, leadModel } from '../models/lead.model';
import multer from 'multer';

const router: Router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all leads with optional filtering
router.get('/', authenticate, leadController.getAll);

// Get lead statistics
router.get('/stats', authenticate, leadController.getStats);

// Integration settings routes
router.get('/integrations', authenticate, isAdmin, integrationSettingsController.getAll);
router.get('/integrations/:id', authenticate, isAdmin, integrationSettingsController.getById);
router.post('/integrations', authenticate, isAdmin, integrationSettingsController.create);
router.put('/integrations/:id', authenticate, isAdmin, integrationSettingsController.update);
router.delete('/integrations/:id', authenticate, isAdmin, integrationSettingsController.delete);
router.post('/integrations/:id/regenerate-api-key', authenticate, isAdmin, integrationSettingsController.regenerateApiKey);
router.get('/integrations/:id/webhook-url', authenticate, isAdmin, integrationSettingsController.getWebhookUrl);
router.get('/integrations/:id/logs', authenticate, isAdmin, integrationSettingsController.getWebhookLogs);
router.get('/integrations/logs/:requestId', authenticate, isAdmin, integrationSettingsController.getWebhookLogByRequestId);

// Get lead by ID (must come after other specific routes to avoid conflicts)
router.get('/:id', authenticate, leadController.getById);

// Create a new lead
router.post('/', authenticate, leadController.create);

// Update an existing lead
router.put('/:id', authenticate, leadController.update);

// Delete a lead
router.delete('/:id', authenticate, isAdmin, leadController.delete);

// Import leads from CSV
router.post('/import', authenticate, isAdmin, upload.single('file'), leadController.importFromCsv);

// Webhook endpoint for external integrations (no authentication required, uses API key)
router.post('/webhook', webhookController.handleLeadWebhook);

// Webhook endpoint with store ID in URL (no authentication required)
router.post('/webhook/store/:storeId', webhookController.handleStoreWebhook);

// Test webhook endpoint for Elementor (no authentication or API key required)
router.post('/webhook/elementor', (req: Request, res: Response) => {
  try {
    console.log('Received Elementor webhook:', req.body);
    
    // Create a lead with the data from the request
    const leadData: Lead = {
      name: req.body.name || 'Test Lead',
      email: req.body.email || 'test@example.com',
      phone: req.body.phone || '1234567890',
      source: 'Elementor Test',
      status: 'new',
      notes: req.body.message || 'Test lead from Elementor'
    };
    
    // Create the lead
    leadModel.create(leadData)
      .then(leadId => {
        res.status(201).json({
          success: true,
          message: 'Lead created successfully',
          data: {
            lead_id: leadId
          }
        });
      })
      .catch(error => {
        console.error('Error creating lead:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create lead',
          error: error.message
        });
      });
  } catch (error) {
    console.error('Error in test webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: (error as Error).message
    });
  }
});

export default router;
