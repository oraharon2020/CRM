/**
 * Types for application settings
 */

/**
 * Status interface
 * Represents a status with its value and label
 */
export interface Status {
  value: string;
  label: string;
}

/**
 * Status settings interface
 * Stores which statuses are included for each store
 */
export interface StatusSettings {
  included_statuses: {
    [storeId: number]: Status[];
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
