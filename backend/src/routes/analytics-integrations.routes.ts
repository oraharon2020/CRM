import express, { Router } from 'express';
import { 
  getAllAnalyticsIntegrations,
  getAnalyticsIntegrationById,
  createAnalyticsIntegration,
  updateAnalyticsIntegration,
  deleteAnalyticsIntegration,
  syncAnalyticsData,
  getAnalyticsData
} from '../controllers/analytics-integrations.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router: Router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Get all analytics integrations
router.get('/', getAllAnalyticsIntegrations);

// Get analytics integration by ID
router.get('/:id', getAnalyticsIntegrationById);

// Create a new analytics integration
router.post('/', createAnalyticsIntegration);

// Update an existing analytics integration
router.put('/:id', updateAnalyticsIntegration);

// Delete an analytics integration
router.delete('/:id', deleteAnalyticsIntegration);

// Sync an analytics integration
router.post('/:id/sync', syncAnalyticsData);

// Get analytics data for an integration
router.get('/:id/data', getAnalyticsData);

export default router;
