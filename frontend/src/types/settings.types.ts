/**
 * Types for application settings
 */

/**
 * Status settings interface
 * Stores which statuses are included for each store
 */
export interface StatusSettings {
  included_statuses: {
    [storeId: number]: string[];
  };
}

/**
 * Settings response from API
 */
export interface SettingsResponse {
  success: boolean;
  message: string;
  settings?: StatusSettings;
  error?: string;
}
