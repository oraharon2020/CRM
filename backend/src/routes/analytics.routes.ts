import express, { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Integration types
router.get('/integration-types', analyticsController.getAvailableIntegrationTypes.bind(analyticsController));

// Integration validation
router.get('/integrations/:id/validate', analyticsController.validateIntegration.bind(analyticsController));

// Campaigns
router.get('/integrations/:id/campaigns', analyticsController.getCampaigns.bind(analyticsController));
router.post('/integrations/:id/campaigns/sync', analyticsController.syncCampaigns.bind(analyticsController));

// Performance data
router.get('/integrations/:id/performance', analyticsController.getPerformanceData.bind(analyticsController));
router.post('/integrations/:id/performance/sync', analyticsController.syncPerformanceData.bind(analyticsController));
router.get('/integrations/:id/performance/aggregated', analyticsController.getAggregatedPerformanceData.bind(analyticsController));

// Full sync
router.post('/integrations/:id/sync', analyticsController.runFullSync.bind(analyticsController));

// Sync logs
router.get('/integrations/:id/sync-logs', analyticsController.getSyncLogs.bind(analyticsController));
router.get('/integrations/:id/sync-logs/latest', analyticsController.getLatestSyncLog.bind(analyticsController));

// Alerts
router.get('/stores/:storeId/alerts', analyticsController.getAlerts.bind(analyticsController));
router.post('/alerts', analyticsController.createAlert.bind(analyticsController));
router.put('/alerts/:id', analyticsController.updateAlert.bind(analyticsController));
router.delete('/alerts/:id', analyticsController.deleteAlert.bind(analyticsController));
router.post('/alerts/check', analyticsController.checkAlerts.bind(analyticsController));

export default router;
