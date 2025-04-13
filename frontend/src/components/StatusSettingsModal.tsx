import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Spinner from './Spinner';
import { settingsAPI } from '../services/api';
import { useStatusSettings } from '../contexts/StatusSettingsContext';
import { Status } from '../types/settings.types';

interface StatusSettingsModalProps {
  storeId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const StatusSettingsModal: React.FC<StatusSettingsModalProps> = ({
  storeId,
  isOpen,
  onClose,
  onSave
}) => {
  const { statusSettings, updateStatusSettings } = useStatusSettings();
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [selectedStatusValues, setSelectedStatusValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available statuses for the store
  useEffect(() => {
    const fetchStoreStatuses = async () => {
      if (!storeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await settingsAPI.getStoreStatuses(storeId);
        
        if (response.success && response.data) {
          // Combine standard and custom statuses
          const allStatuses = [
            ...response.data.standardStatuses,
            ...response.data.customStatuses
          ];
          
          setAvailableStatuses(allStatuses);
          
          // Set selected statuses from context
          if (statusSettings.included_statuses[storeId]) {
            // Extract just the values from the status objects
            const statusValues = statusSettings.included_statuses[storeId].map(status => status.value);
            setSelectedStatusValues(statusValues);
          } else {
            // Default to all statuses if none are selected
            const allStatusValues = allStatuses.map(status => status.value);
            setSelectedStatusValues(allStatusValues);
          }
        } else {
          throw new Error(response.error || 'Failed to fetch store statuses');
        }
      } catch (error) {
        console.error('Error fetching store statuses:', error);
        setError('שגיאה בטעינת סטטוסים');
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && storeId) {
      fetchStoreStatuses();
    }
  }, [isOpen, storeId, statusSettings]);

  // Handle status toggle
  const handleStatusToggle = (statusValue: string) => {
    setSelectedStatusValues(prev => {
      if (prev.includes(statusValue)) {
        return prev.filter(value => value !== statusValue);
      } else {
        return [...prev, statusValue];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    const allStatusValues = availableStatuses.map(status => status.value);
    setSelectedStatusValues(allStatusValues);
  };

  // Handle clear all
  const handleClearAll = () => {
    setSelectedStatusValues([]);
  };

  // Create Status objects from selected values
  const getSelectedStatusObjects = (): Status[] => {
    return selectedStatusValues.map(value => {
      // Find the full status object for this value
      const statusObj = availableStatuses.find(status => status.value === value);
      if (statusObj) {
        return statusObj;
      }
      // Fallback if not found (shouldn't happen in normal circumstances)
      return { value, label: value };
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert selected values to Status objects before saving
      const selectedStatusObjects = getSelectedStatusObjects();
      await updateStatusSettings(storeId, selectedStatusObjects);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving status settings:', error);
      setError('שגיאה בשמירת הגדרות');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">הגדרות סטטוס</h3>
          <button 
            className="text-gray-400 hover:text-gray-500" 
            onClick={onClose}
            aria-label="סגור"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">בחר סטטוסים לחישוב</label>
                <div className="flex space-x-2 space-x-reverse">
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={handleSelectAll}
                  >
                    בחר הכל
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={handleClearAll}
                  >
                    נקה הכל
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-60 overflow-y-auto">
                {availableStatuses.map(status => (
                  <div key={status.value} className="flex items-center mb-2 last:mb-0">
                    <input
                      type="checkbox"
                      id={`status-${status.value}`}
                      checked={selectedStatusValues.includes(status.value)}
                      onChange={() => handleStatusToggle(status.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={`status-${status.value}`}
                      className="mr-2 block text-sm text-gray-700"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
                
                {availableStatuses.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    אין סטטוסים זמינים
                  </p>
                )}
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                הסטטוסים שנבחרו ישמשו לחישוב הנתונים בדף הבית ובדוחות
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            onClick={onClose}
          >
            ביטול
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" color="white" /> : 'שמור'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusSettingsModal;
