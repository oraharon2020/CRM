import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StatusSettings, Status } from '../types/settings.types';
import { settingsAPI } from '../services/api';

interface StatusSettingsContextType {
  statusSettings: StatusSettings;
  isLoading: boolean;
  error: string | null;
  updateStatusSettings: (storeId: number, statuses: Status[]) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: StatusSettings = {
  included_statuses: {}
};

const StatusSettingsContext = createContext<StatusSettingsContextType>({
  statusSettings: defaultSettings,
  isLoading: false,
  error: null,
  updateStatusSettings: async () => {},
  refreshSettings: async () => {}
});

export const useStatusSettings = () => useContext(StatusSettingsContext);

interface StatusSettingsProviderProps {
  children: ReactNode;
}

export const StatusSettingsProvider: React.FC<StatusSettingsProviderProps> = ({ children }) => {
  const [statusSettings, setStatusSettings] = useState<StatusSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await settingsAPI.getStatusSettings();
      
      if (response.success && response.settings) {
        setStatusSettings(response.settings);
      } else {
        throw new Error(response.error || 'Failed to load status settings');
      }
    } catch (err) {
      console.error('Error loading status settings:', err);
      setError('Failed to load status settings');
      
      // Try to load from localStorage as fallback
      const savedSettings = localStorage.getItem('statusSettings');
      if (savedSettings) {
        try {
          setStatusSettings(JSON.parse(savedSettings));
        } catch (parseErr) {
          console.error('Error parsing saved settings:', parseErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatusSettings = async (storeId: number, statuses: Status[]) => {
    try {
      setError(null);
      
      // Create a copy of the current settings
      const updatedSettings: StatusSettings = {
        included_statuses: { ...statusSettings.included_statuses }
      };
      
      // Update the settings for this store
      updatedSettings.included_statuses[storeId] = statuses;
      
      // Save the updated settings
      const response = await settingsAPI.saveStatusSettings(updatedSettings);
      
      if (response.success) {
        setStatusSettings(updatedSettings);
      } else {
        throw new Error(response.error || 'Failed to save status settings');
      }
    } catch (err) {
      console.error('Error updating status settings:', err);
      setError('Failed to save status settings');
      throw err;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <StatusSettingsContext.Provider
      value={{
        statusSettings,
        isLoading,
        error,
        updateStatusSettings,
        refreshSettings
      }}
    >
      {children}
    </StatusSettingsContext.Provider>
  );
};
