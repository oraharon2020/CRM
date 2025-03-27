import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { integrationSettingsModel } from '../models/integration-settings.model';
import wooCommerceService from '../services/woocommerce.service';

/**
 * Controller for analytics endpoints
 */
export class AnalyticsController {
  /**
   * Get available integration types
   */
  async getAvailableIntegrationTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = analyticsService.getAvailableIntegrationTypes();
      
      res.status(200).json({
        success: true,
        data: types
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get available integration types'
      });
    }
  }

  /**
   * Validate integration settings
   */
  async validateIntegration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const integration = await integrationSettingsModel.getById(parseInt(id));
      
      if (!integration) {
        res.status(404).json({
          success: false,
          message: `Integration with ID ${id} not found`
        });
        return;
      }
      
      const validation = await analyticsService.validateIntegration(integration);
      
      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to validate integration'
      });
    }
  }

  /**
   * Sync campaigns for an integration
   */
  async syncCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campaigns = await analyticsService.syncCampaigns(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to sync campaigns'
      });
    }
  }

  /**
   * Sync performance data for an integration
   */
  async syncPerformanceData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate, campaignIds } = req.body;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }
      
      const performanceData = await analyticsService.syncPerformanceData(
        parseInt(id),
        new Date(startDate),
        new Date(endDate),
        campaignIds
      );
      
      res.status(200).json({
        success: true,
        data: performanceData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to sync performance data'
      });
    }
  }

  /**
   * Run a full sync for an integration
   */
  async runFullSync(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }
      
      const result = await analyticsService.runFullSync(
        parseInt(id),
        new Date(startDate),
        new Date(endDate)
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to run full sync'
      });
    }
  }

  /**
   * Get campaigns for an integration
   */
  async getCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { storeId } = req.query;
      
      if (!storeId) {
        res.status(400).json({
          success: false,
          message: 'Store ID is required'
        });
        return;
      }
      
      const campaigns = await analyticsService.getCampaigns(
        parseInt(id),
        parseInt(storeId as string)
      );
      
      res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get campaigns'
      });
    }
  }

  /**
   * Get performance data for an integration
   */
  async getPerformanceData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { storeId, startDate, endDate, campaignId } = req.query;
      
      if (!storeId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Store ID, start date, and end date are required'
        });
        return;
      }
      
      const performanceData = await analyticsService.getPerformanceData(
        parseInt(id),
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string),
        campaignId as string
      );
      
      res.status(200).json({
        success: true,
        data: performanceData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get performance data'
      });
    }
  }

  /**
   * Get aggregated performance data
   */
  async getAggregatedPerformanceData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { storeId, startDate, endDate, groupBy } = req.query;
      
      if (!storeId || !startDate || !endDate || !groupBy) {
        res.status(400).json({
          success: false,
          message: 'Store ID, start date, end date, and group by are required'
        });
        return;
      }
      
      const validGroupBy = ['day', 'week', 'month', 'campaign', 'platform'];
      if (!validGroupBy.includes(groupBy as string)) {
        res.status(400).json({
          success: false,
          message: `Invalid group by: ${groupBy}. Valid values are: ${validGroupBy.join(', ')}`
        });
        return;
      }
      
      const performanceData = await analyticsService.getAggregatedPerformanceData(
        parseInt(id),
        parseInt(storeId as string),
        new Date(startDate as string),
        new Date(endDate as string),
        groupBy as 'day' | 'week' | 'month' | 'campaign' | 'platform'
      );
      
      res.status(200).json({
        success: true,
        data: performanceData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get aggregated performance data'
      });
    }
  }

  /**
   * Get alerts for a store
   */
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { isEnabled } = req.query;
      
      const alerts = await analyticsService.getAlerts(
        parseInt(storeId),
        isEnabled === 'true'
      );
      
      res.status(200).json({
        success: true,
        data: alerts
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get alerts'
      });
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const alert = req.body;
      
      if (!alert.store_id || !alert.name || !alert.metric || !alert.condition || alert.threshold === undefined || !alert.period || !alert.notification_method) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }
      
      const id = await analyticsService.createAlert(alert);
      
      res.status(201).json({
        success: true,
        data: { id }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create alert'
      });
    }
  }

  /**
   * Update an existing alert
   */
  async updateAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = req.body;
      
      const success = await analyticsService.updateAlert(parseInt(id), alert);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: `Alert with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: { id: parseInt(id) }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update alert'
      });
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const success = await analyticsService.deleteAlert(parseInt(id));
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: `Alert with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: { id: parseInt(id) }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete alert'
      });
    }
  }

  /**
   * Get sync logs for an integration
   */
  async getSyncLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      
      const logs = await analyticsService.getSyncLogs(
        parseInt(id),
        limit ? parseInt(limit as string) : undefined
      );
      
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get sync logs'
      });
    }
  }

  /**
   * Get the latest sync log for an integration
   */
  async getLatestSyncLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const log = await analyticsService.getLatestSyncLog(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: log
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get latest sync log'
      });
    }
  }

  /**
   * Check alerts for all stores
   */
  async checkAlerts(req: Request, res: Response): Promise<void> {
    try {
      const results = await analyticsService.checkAlerts();
      
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check alerts'
      });
    }
  }

  /**
   * Get products directly from WooCommerce (bypassing cache)
   */
  async getProductsDirectFromWooCommerce(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const params = req.query;
      
      if (!storeId) {
        res.status(400).json({
          success: false,
          message: 'Store ID is required'
        });
        return;
      }
      
      const products = await wooCommerceService.getProducts(parseInt(storeId), params);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get products from WooCommerce'
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
