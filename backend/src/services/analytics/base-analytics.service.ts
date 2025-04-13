import { IntegrationSettings } from '../../models/integration-settings.model';
import { AnalyticsCampaign, analyticsCampaignModel } from '../../models/analytics-campaign.model';
import { AnalyticsPerformance, analyticsPerformanceModel } from '../../models/analytics-performance.model';
import { analyticsSyncLogModel } from '../../models/analytics-sync-log.model';

/**
 * Base class for all analytics services
 */
export abstract class BaseAnalyticsService {
  /**
   * The type of integration this service handles
   */
  abstract readonly integrationType: string;

  /**
   * Validate integration settings
   */
  abstract validateSettings(settings: IntegrationSettings): Promise<{ isValid: boolean; message?: string }>;

  /**
   * Sync campaigns from the analytics service
   */
  abstract syncCampaigns(integration: IntegrationSettings): Promise<AnalyticsCampaign[]>;

  /**
   * Sync performance data from the analytics service
   */
  abstract syncPerformanceData(
    integration: IntegrationSettings,
    startDate: Date,
    endDate: Date,
    campaignIds?: string[]
  ): Promise<AnalyticsPerformance[]>;

  /**
   * Run a full sync for an integration
   */
  async runFullSync(integration: IntegrationSettings, startDate: Date, endDate: Date): Promise<{
    success: boolean;
    campaignsCount: number;
    performanceRecordsCount: number;
    error?: string;
  }> {
    // Start sync log
    const syncLogId = await analyticsSyncLogModel.startSync(integration.id!);
    
    try {
      // Validate settings
      const validation = await this.validateSettings(integration);
      if (!validation.isValid) {
        await analyticsSyncLogModel.failSync(syncLogId, validation.message || 'Invalid integration settings');
        return {
          success: false,
          campaignsCount: 0,
          performanceRecordsCount: 0,
          error: validation.message
        };
      }
      
      // Sync campaigns
      const campaigns = await this.syncCampaigns(integration);
      
      // Sync performance data for all campaigns
      const campaignIds = campaigns.map(campaign => campaign.campaign_id);
      const performanceData = await this.syncPerformanceData(integration, startDate, endDate, campaignIds);
      
      // Complete sync log
      await analyticsSyncLogModel.completeSync(syncLogId, campaigns.length + performanceData.length);
      
      return {
        success: true,
        campaignsCount: campaigns.length,
        performanceRecordsCount: performanceData.length
      };
    } catch (error: any) {
      // Log error and mark sync as failed
      const errorMessage = error.message || 'Unknown error during sync';
      await analyticsSyncLogModel.failSync(syncLogId, errorMessage);
      
      return {
        success: false,
        campaignsCount: 0,
        performanceRecordsCount: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Save campaign data to the database
   */
  protected async saveCampaign(campaign: AnalyticsCampaign): Promise<number> {
    return await analyticsCampaignModel.upsert(campaign);
  }

  /**
   * Save performance data to the database
   */
  protected async savePerformanceData(performance: AnalyticsPerformance): Promise<number> {
    return await analyticsPerformanceModel.upsert(performance);
  }

  /**
   * Get campaigns for an integration
   */
  async getCampaigns(integrationId: number, storeId: number): Promise<AnalyticsCampaign[]> {
    return await analyticsCampaignModel.getAll({
      integration_id: integrationId,
      store_id: storeId
    });
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
    return await analyticsPerformanceModel.getAll({
      integration_id: integrationId,
      store_id: storeId,
      campaign_id: campaignId,
      start_date: startDate,
      end_date: endDate
    });
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
    return await analyticsPerformanceModel.getAggregated({
      integration_id: integrationId,
      store_id: storeId,
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy
    });
  }
}
