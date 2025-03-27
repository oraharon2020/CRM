import { IntegrationSettings } from '../models/integration-settings.model';
import { BaseAnalyticsService } from './analytics/base-analytics.service';
import { googleAdsService } from './analytics/google-ads.service';
import { facebookAdsService } from './analytics/facebook-ads.service';
import { googleAnalyticsService } from './analytics/google-analytics.service';
import { googleSearchConsoleService } from './analytics/google-search-console.service';
import { integrationSettingsModel } from '../models/integration-settings.model';
import { AnalyticsCampaign } from '../models/analytics-campaign.model';
import { AnalyticsPerformance } from '../models/analytics-performance.model';
import { analyticsAlertModel, AnalyticsAlert } from '../models/analytics-alert.model';
import { analyticsSyncLogModel } from '../models/analytics-sync-log.model';

/**
 * Main service for analytics integrations
 */
class AnalyticsService {
  private services: Map<string, BaseAnalyticsService> = new Map();

  constructor() {
    // Register available analytics services
    this.registerService(googleAdsService);
    this.registerService(facebookAdsService);
    this.registerService(googleAnalyticsService);
    this.registerService(googleSearchConsoleService);
  }

  /**
   * Register an analytics service
   */
  private registerService(service: BaseAnalyticsService): void {
    this.services.set(service.integrationType, service);
  }

  /**
   * Get an analytics service by integration type
   */
  getService(integrationType: string): BaseAnalyticsService | null {
    return this.services.get(integrationType) || null;
  }

  /**
   * Get an analytics service for an integration
   */
  getServiceForIntegration(integration: IntegrationSettings): BaseAnalyticsService | null {
    if (!integration.type) {
      return null;
    }
    
    return this.getService(integration.type);
  }

  /**
   * Get all available analytics services
   */
  getAllServices(): BaseAnalyticsService[] {
    return Array.from(this.services.values());
  }

  /**
   * Get all available integration types
   */
  getAvailableIntegrationTypes(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Validate integration settings
   */
  async validateIntegration(integration: IntegrationSettings): Promise<{ isValid: boolean; message?: string }> {
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      return { isValid: false, message: `Unsupported integration type: ${integration.type}` };
    }
    
    return await service.validateSettings(integration);
  }

  /**
   * Sync campaigns for an integration
   */
  async syncCampaigns(integrationId: number): Promise<AnalyticsCampaign[]> {
    const integration = await integrationSettingsModel.getById(integrationId);
    
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      throw new Error(`Unsupported integration type: ${integration.type}`);
    }
    
    return await service.syncCampaigns(integration);
  }

  /**
   * Sync performance data for an integration
   */
  async syncPerformanceData(
    integrationId: number,
    startDate: Date,
    endDate: Date,
    campaignIds?: string[]
  ): Promise<AnalyticsPerformance[]> {
    const integration = await integrationSettingsModel.getById(integrationId);
    
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      throw new Error(`Unsupported integration type: ${integration.type}`);
    }
    
    return await service.syncPerformanceData(integration, startDate, endDate, campaignIds);
  }

  /**
   * Run a full sync for an integration
   */
  async runFullSync(
    integrationId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    success: boolean;
    campaignsCount: number;
    performanceRecordsCount: number;
    error?: string;
  }> {
    const integration = await integrationSettingsModel.getById(integrationId);
    
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      throw new Error(`Unsupported integration type: ${integration.type}`);
    }
    
    return await service.runFullSync(integration, startDate, endDate);
  }

  /**
   * Get campaigns for an integration
   */
  async getCampaigns(integrationId: number, storeId: number): Promise<AnalyticsCampaign[]> {
    const integration = await integrationSettingsModel.getById(integrationId);
    
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      throw new Error(`Unsupported integration type: ${integration.type}`);
    }
    
    return await service.getCampaigns(integrationId, storeId);
  }

  /**
   * Get performance data for an integration
   */
  async getPerformanceData(
    integrationId: number,
    storeId: number,
    startDate: Date,
    endDate: Date,
    campaignId?: string
  ): Promise<AnalyticsPerformance[]> {
    const integration = await integrationSettingsModel.getById(integrationId);
    
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      throw new Error(`Unsupported integration type: ${integration.type}`);
    }
    
    return await service.getPerformanceData(integrationId, storeId, startDate, endDate, campaignId);
  }

  /**
   * Get aggregated performance data
   */
  async getAggregatedPerformanceData(
    integrationId: number,
    storeId: number,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' | 'campaign' | 'platform'
  ): Promise<any[]> {
    const integration = await integrationSettingsModel.getById(integrationId);
    
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const service = this.getServiceForIntegration(integration);
    
    if (!service) {
      throw new Error(`Unsupported integration type: ${integration.type}`);
    }
    
    return await service.getAggregatedPerformanceData(integrationId, storeId, startDate, endDate, groupBy);
  }

  /**
   * Get alerts for a store
   */
  async getAlerts(storeId: number, isEnabled?: boolean): Promise<AnalyticsAlert[]> {
    return await analyticsAlertModel.getAll({ store_id: storeId, is_enabled: isEnabled });
  }

  /**
   * Create a new alert
   */
  async createAlert(alert: AnalyticsAlert): Promise<number> {
    return await analyticsAlertModel.create(alert);
  }

  /**
   * Update an existing alert
   */
  async updateAlert(id: number, alert: Partial<AnalyticsAlert>): Promise<boolean> {
    return await analyticsAlertModel.update(id, alert);
  }

  /**
   * Delete an alert
   */
  async deleteAlert(id: number): Promise<boolean> {
    return await analyticsAlertModel.delete(id);
  }

  /**
   * Get sync logs for an integration
   */
  async getSyncLogs(integrationId: number, limit?: number): Promise<any[]> {
    return await analyticsSyncLogModel.getAll({
      integration_id: integrationId,
      limit
    });
  }

  /**
   * Get the latest sync log for an integration
   */
  async getLatestSyncLog(integrationId: number): Promise<any | null> {
    return await analyticsSyncLogModel.getLatestByIntegrationId(integrationId);
  }

  /**
   * Check alerts for all stores
   */
  async checkAlerts(): Promise<{ alertId: number; triggered: boolean; message: string }[]> {
    const results: { alertId: number; triggered: boolean; message: string }[] = [];
    const alerts = await analyticsAlertModel.getAlertsToCheck();
    
    for (const alert of alerts) {
      try {
        // Get the relevant performance data
        const performanceData = await this.getAggregatedPerformanceData(
          alert.integration_id!,
          alert.store_id,
          this.getStartDateForPeriod(alert.period),
          new Date(),
          'day'
        );
        
        // Check if the alert condition is met
        const isTriggered = this.checkAlertCondition(alert, performanceData);
        
        if (isTriggered) {
          // Update the last triggered timestamp
          await analyticsAlertModel.updateLastTriggered(alert.id!);
          
          // Add to results
          results.push({
            alertId: alert.id!,
            triggered: true,
            message: `Alert "${alert.name}" triggered: ${alert.metric} is ${alert.condition} ${alert.threshold}`
          });
        } else {
          results.push({
            alertId: alert.id!,
            triggered: false,
            message: `Alert "${alert.name}" not triggered`
          });
        }
      } catch (error: any) {
        results.push({
          alertId: alert.id!,
          triggered: false,
          message: `Error checking alert "${alert.name}": ${error.message}`
        });
      }
    }
    
    return results;
  }

  /**
   * Get the start date for a period
   */
  private getStartDateForPeriod(period: string): Date {
    const now = new Date();
    
    switch (period) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 1));
    }
  }

  /**
   * Check if an alert condition is met
   */
  private checkAlertCondition(alert: AnalyticsAlert, performanceData: any[]): boolean {
    if (!performanceData || performanceData.length === 0) {
      return false;
    }
    
    // Calculate the metric value
    let metricValue = 0;
    
    switch (alert.metric) {
      case 'impressions':
      case 'clicks':
      case 'cost':
      case 'conversions':
      case 'conversion_value':
        metricValue = performanceData.reduce((sum, data) => sum + (data[alert.metric] || 0), 0);
        break;
      case 'ctr':
        const clicks = performanceData.reduce((sum, data) => sum + (data.clicks || 0), 0);
        const impressions = performanceData.reduce((sum, data) => sum + (data.impressions || 0), 0);
        metricValue = impressions > 0 ? (clicks / impressions) * 100 : 0;
        break;
      case 'cpc':
        const cost = performanceData.reduce((sum, data) => sum + (data.cost || 0), 0);
        const clicksForCpc = performanceData.reduce((sum, data) => sum + (data.clicks || 0), 0);
        metricValue = clicksForCpc > 0 ? cost / clicksForCpc : 0;
        break;
      case 'conversion_rate':
        const conversions = performanceData.reduce((sum, data) => sum + (data.conversions || 0), 0);
        const clicksForCr = performanceData.reduce((sum, data) => sum + (data.clicks || 0), 0);
        metricValue = clicksForCr > 0 ? (conversions / clicksForCr) * 100 : 0;
        break;
      default:
        return false;
    }
    
    // Check the condition
    switch (alert.condition) {
      case 'above':
        return metricValue > alert.threshold;
      case 'below':
        return metricValue < alert.threshold;
      case 'change_by':
        // For change_by, we would need historical data to compare
        // This is a simplified implementation
        return Math.abs(metricValue - alert.threshold) / alert.threshold > 0.1; // 10% change
      default:
        return false;
    }
  }
}

export const analyticsService = new AnalyticsService();
