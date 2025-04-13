import fs from 'fs';
import path from 'path';

// Define the data directory path
const DATA_DIR = path.join(__dirname, '../../data');
const STATUS_SETTINGS_FILE = path.join(DATA_DIR, 'status_settings.json');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory at ${DATA_DIR}`);
}

// Define the settings types
export interface StatusSettings {
  included_statuses: {
    [storeId: string]: string[];
  };
}

class SettingsService {
  /**
   * Get status settings from the JSON file
   * @returns Status settings object
   */
  async getStatusSettings(): Promise<StatusSettings> {
    try {
      // Check if the file exists
      if (!fs.existsSync(STATUS_SETTINGS_FILE)) {
        // Return default settings if file doesn't exist
        return { included_statuses: {} };
      }
      
      // Read the file
      const data = await fs.promises.readFile(STATUS_SETTINGS_FILE, 'utf8');
      
      // Parse the JSON data
      const settings = JSON.parse(data) as StatusSettings;
      
      return settings;
    } catch (error) {
      console.error('Error reading status settings:', error);
      // Return default settings in case of error
      return { included_statuses: {} };
    }
  }

  /**
   * Save status settings to the JSON file
   * @param settings Status settings object to save
   * @returns True if successful, false otherwise
   */
  async saveStatusSettings(settings: StatusSettings): Promise<boolean> {
    try {
      // Ensure the data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      
      // Convert settings to JSON string with pretty formatting
      const data = JSON.stringify(settings, null, 2);
      
      // Write to the file
      await fs.promises.writeFile(STATUS_SETTINGS_FILE, data, 'utf8');
      
      return true;
    } catch (error) {
      console.error('Error saving status settings:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const settingsService = new SettingsService();
