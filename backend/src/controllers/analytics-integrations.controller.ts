/**
 * Re-export all functions from the CRUD and data controllers
 * This maintains backward compatibility with any code that imports from this file
 */

// Export CRUD operations
export {
  getAllAnalyticsIntegrations,
  getAnalyticsIntegrationsByStore,
  getAnalyticsIntegrationById,
  createAnalyticsIntegration,
  updateAnalyticsIntegration,
  deleteAnalyticsIntegration
} from './analytics-integrations-crud.controller';

// Export data operations
export {
  getAnalyticsData,
  syncAnalyticsData
} from './analytics-integrations-data.controller';
