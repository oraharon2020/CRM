import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://crm-d30s.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log token for debugging (remove in production)
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('Using auth token:', token);
    } else {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('No auth token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Check if the error is due to network issues (server not available)
    if (!error.response) {
      console.warn('Network error detected, server may be unavailable:', error.message);
      // We'll let the calling code handle this error
      return Promise.reject(error);
    }
    
    console.error('API Response Error:', error.config?.url, error.response?.status, error.response?.data);
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response.status === 401) {
      // Check if we're using demo token
      const token = localStorage.getItem('token');
      const isDemoMode = token === 'demo-token';
      
      // Check if we're already on the login page
      const isLoginPage = window.location.pathname === '/login';
      
      if (isDemoMode) {
        console.warn('401 Unauthorized error with demo token, not redirecting to login');
        // Don't redirect to login for demo token
      } else if (isLoginPage) {
        console.warn('401 Unauthorized error on login page, not redirecting');
        // Don't redirect if we're already on the login page
      } else {
        console.warn('401 Unauthorized error detected, redirecting to login');
        
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle 429 Too Many Requests errors
    if (error.response.status === 429) {
      console.warn('Rate limit exceeded (429 Too Many Requests)');
      
      // Add a user-friendly message to the error
      error.userMessage = 'Rate limit exceeded. Please try again in a few moments.';
      
      // Get retry-after header if available
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        const seconds = parseInt(retryAfter);
        if (!isNaN(seconds)) {
          error.retryAfter = seconds;
          error.userMessage = `Rate limit exceeded. Please try again in ${seconds} seconds.`;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  update: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  getDefaultStore: async (userId: number) => {
    const response = await api.get(`/users/${userId}/default-store`);
    return response.data;
  },
  
  setDefaultStore: async (userId: number, storeId: number | null) => {
    const response = await api.put(`/users/${userId}/default-store`, { store_id: storeId });
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getByStore: async (storeId: number, params?: any) => {
    const queryParams = { ...params, storeId };
    console.log('ordersAPI.getByStore called with params:', queryParams);
    const response = await api.get('/orders', { params: queryParams });
    console.log('ordersAPI.getByStore response:', response.data);
    return response.data;
  },
  
  getByDateRange: async (startDate: string, endDate: string, params?: any) => {
    const queryParams = { ...params, startDate, endDate };
    const response = await api.get('/orders', { params: queryParams });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  update: async (id: number, orderData: any) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: async (params?: any) => {
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },
  
  getEventById: async (id: number) => {
    const response = await api.get(`/calendar/events/${id}`);
    return response.data;
  },
  
  createEvent: async (eventData: any) => {
    const response = await api.post('/calendar/events', eventData);
    return response.data;
  },
  
  updateEvent: async (id: number, eventData: any) => {
    const response = await api.put(`/calendar/events/${id}`, eventData);
    return response.data;
  },
  
  deleteEvent: async (id: number) => {
    const response = await api.delete(`/calendar/events/${id}`);
    return response.data;
  },
  
  // Jewish Holidays
  getJewishHolidays: async (month: number, year: number) => {
    const response = await api.get('/calendar/jewish-holidays', { params: { month, year } });
    return response.data;
  },
  
  getUpcomingJewishHolidays: async (limit: number = 5) => {
    const response = await api.get('/calendar/jewish-holidays/upcoming', { params: { limit } });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecentOrders: async () => {
    const response = await api.get('/dashboard/recent-orders');
    return response.data;
  },
  
  getUpcomingTasks: async () => {
    const response = await api.get('/dashboard/upcoming-tasks');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAdvancedAnalytics: async (storeId: number, params?: any) => {
    const response = await api.get(`/analytics/stores/${storeId}`, { params });
    return response.data;
  },
  
  getCustomReport: async (storeId: number, reportParams: any) => {
    const response = await api.post(`/analytics/stores/${storeId}/reports`, reportParams);
    return response.data;
  },
  
  getSalesForecasts: async (storeId: number, params?: any) => {
    const response = await api.get(`/analytics/stores/${storeId}/forecasts`, { params });
    return response.data;
  },
  
  // Direct product performance data method (bypasses cache)
  getProductPerformanceDirect: async (storeId: number, params?: any) => {
    try {
      // First try to get products directly from WooCommerce
      const response = await api.get(`/woocommerce/stores/${storeId}/products`, { params });
      
      if (response.data && response.data.success && response.data.data) {
        // Transform WooCommerce product data to the format expected by ProductPerformance component
        const products = response.data.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          quantity: product.total_sales || 0,
          revenue: (product.total_sales || 0) * (parseFloat(product.price) || 0),
          average_price: parseFloat(product.price) || 0
        }));
        
        return {
          success: true,
          data: products
        };
      }
      
      // If direct WooCommerce API fails, fall back to analytics API
      const analyticsResponse = await api.get(`/analytics/stores/${storeId}`, { 
        params: { 
          ...params,
          includeProducts: true 
        } 
      });
      
      if (analyticsResponse.data && analyticsResponse.data.success && analyticsResponse.data.data && analyticsResponse.data.data.product_performance) {
        return {
          success: true,
          data: analyticsResponse.data.data.product_performance
        };
      }
      
      // If both methods fail, return empty array
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('Error getting product performance data:', error);
      // Return empty array on error
      return {
        success: false,
        message: 'Error fetching product data',
        data: []
      };
    }
  },
  
  // Product cache methods
  syncProductCache: async (storeId: number, params?: any) => {
    const response = await api.post(`/analytics/stores/${storeId}/cache/sync`, {}, { params });
    return response.data;
  },
  
  incrementalUpdateCache: async (storeId: number, params?: any) => {
    const response = await api.post(`/analytics/stores/${storeId}/cache/incremental`, {}, { params });
    return response.data;
  },
  
  syncAllProductCaches: async () => {
    const response = await api.post('/analytics/cache/sync-all');
    return response.data;
  },
  
  clearProductCache: async (storeId: number) => {
    const response = await api.delete(`/analytics/stores/${storeId}/cache`);
    return response.data;
  },
  
  // Cache configuration and statistics
  getCacheStats: async (storeId: number) => {
    const response = await api.get(`/analytics/stores/${storeId}/cache/stats`);
    return response.data;
  },
  
  getCacheConfig: async (storeId: number) => {
    const response = await api.get(`/analytics/stores/${storeId}/cache/config`);
    return response.data;
  },
  
  updateCacheConfig: async (storeId: number, config: { cache_ttl_hours?: number, sync_frequency_hours?: number }) => {
    const response = await api.put(`/analytics/stores/${storeId}/cache/config`, config);
    return response.data;
  }
};

// CashFlow API
export const cashFlowAPI = {
  // Main cash flow data
  getAll: async (params?: any) => {
    const response = await api.get('/cashflow', { params });
    return response.data;
  },
  
  getByStore: async (storeId: number, params?: any) => {
    const queryParams = { ...params, storeId };
    const response = await api.get('/cashflow', { params: queryParams });
    return response.data;
  },
  
  create: async (cashFlowData: any) => {
    const response = await api.post('/cashflow', cashFlowData);
    return response.data;
  },
  
  update: async (id: number, cashFlowData: any) => {
    const response = await api.put(`/cashflow/${id}`, cashFlowData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/cashflow/${id}`);
    return response.data;
  },
  
  // Fixed expenses
  getFixedExpenses: async (storeId: number, month: string) => {
    const response = await api.get('/cashflow/fixed-expenses', { 
      params: { storeId, month } 
    });
    return response.data;
  },
  
  createFixedExpense: async (expenseData: any) => {
    const response = await api.post('/cashflow/fixed-expenses', expenseData);
    return response.data;
  },
  
  updateFixedExpense: async (id: number, expenseData: any) => {
    const response = await api.put(`/cashflow/fixed-expenses/${id}`, expenseData);
    return response.data;
  },
  
  deleteFixedExpense: async (id: number) => {
    const response = await api.delete(`/cashflow/fixed-expenses/${id}`);
    return response.data;
  },
  
  // Employee salaries
  getEmployeeSalaries: async (storeId: number, month: string) => {
    const response = await api.get('/cashflow/employee-salaries', { 
      params: { storeId, month } 
    });
    return response.data;
  },
  
  createEmployeeSalary: async (salaryData: any) => {
    const response = await api.post('/cashflow/employee-salaries', salaryData);
    return response.data;
  },
  
  updateEmployeeSalary: async (id: number, salaryData: any) => {
    const response = await api.put(`/cashflow/employee-salaries/${id}`, salaryData);
    return response.data;
  },
  
  deleteEmployeeSalary: async (id: number) => {
    const response = await api.delete(`/cashflow/employee-salaries/${id}`);
    return response.data;
  },
  
  // Export to Excel
  exportToExcel: async (storeId: number, startDate: string, endDate: string) => {
    const response = await api.get('/cashflow/export', { 
      params: { storeId, startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  }
};

import { getStandardStatuses, getCustomStatuses } from '../utils/status-mapping.utils';

// Stores API
export const storesAPI = {
  getAll: async () => {
    const response = await api.get('/stores');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },
  
  create: async (storeData: any) => {
    const response = await api.post('/stores', storeData);
    return response.data;
  },
  
  update: async (id: number, storeData: any) => {
    const response = await api.put(`/stores/${id}`, storeData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  },
  
  syncStore: async (id: number) => {
    const response = await api.post(`/stores/${id}/sync`);
    return response.data;
  },
  
  getStoreStats: async (id: number, params: { 
    period?: string, 
    startDate?: string, 
    endDate?: string,
    statuses?: string[] | { value: string, label: string }[]
  } = { period: 'month' }) => {
    console.log('API call getStoreStats with params:', params);
    const response = await api.get(`/stores/${id}/stats`, { params });
    console.log('API response from getStoreStats:', response.data);
    return response.data;
  },
  
  getStoreStatuses: async (id: number) => {
    try {
      const response = await api.get(`/stores/${id}/statuses`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching statuses for store ${id}:`, error);
      
      // Return sample data if API fails
      return {
        success: true,
        message: 'Using sample status data',
        data: {
          standardStatuses: [
            { value: 'processing', label: 'בטיפול' },
            { value: 'completed', label: 'הושלם' },
            { value: 'on-hold', label: 'בהמתנה' },
            { value: 'cancelled', label: 'בוטל' }
          ],
          customStatuses: id === 1734091091 
            ? [
                { value: 'pending', label: 'ממתין לתשלום' },
                { value: 'refunded', label: 'זוכה' },
                { value: 'failed', label: 'נכשל' }
              ]
            : id === 1734219687
              ? [
                  { value: 'pending', label: 'ממתין לתשלום' },
                  { value: 'refunded', label: 'זוכה' },
                  { value: 'failed', label: 'נכשל' }
                ]
              : []
        }
      };
    }
  }
};

// Leads API
export const leadsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },
  
  create: async (leadData: any) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },
  
  update: async (id: number, leadData: any) => {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/leads/stats');
    return response.data;
  },
  
  importFromCsv: async (formData: FormData) => {
    const response = await api.post('/leads/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Settings API
export const settingsAPI = {
  // Get status settings
  getStatusSettings: async () => {
    // Check if we're on the login page
    const isLoginPage = window.location.pathname === '/login';
    if (isLoginPage) {
      console.log('On login page, skipping status settings fetch');
      return {
        success: true,
        message: 'Skipped on login page',
        settings: { included_statuses: {} }
      };
    }
    
    try {
      const response = await api.get('/settings/statuses');
      return response.data;
    } catch (error) {
      console.error('Error fetching status settings:', error);
      
      // If API fails, try to get from localStorage
      const savedSettings = localStorage.getItem('statusSettings');
      if (savedSettings) {
        return {
          success: true,
          message: 'Status settings retrieved from localStorage',
          settings: JSON.parse(savedSettings)
        };
      }
      
      // Return default settings if nothing is found
      return {
        success: true,
        message: 'Using default status settings',
        settings: { included_statuses: {} }
      };
    }
  },
  
  // Save status settings
  saveStatusSettings: async (settings: any) => {
    try {
      // Save to localStorage as backup
      localStorage.setItem('statusSettings', JSON.stringify(settings));
      
      // Save to API
      const response = await api.post('/settings/statuses', { settings });
      return response.data;
    } catch (error) {
      console.error('Error saving status settings:', error);
      
      // If API fails, at least we saved to localStorage
      return {
        success: true,
        message: 'Status settings saved to localStorage only',
        settings
      };
    }
  },
  
  // Get store statuses
  getStoreStatuses: async (storeId: number) => {
    try {
      const response = await api.get(`/stores/${storeId}/statuses`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching statuses for store ${storeId}:`, error);
      
      // Return sample data using our status mapping utility
      return {
        success: true,
        message: 'Using sample status data',
        data: {
          standardStatuses: getStandardStatuses(),
          customStatuses: getCustomStatuses()
        }
      };
    }
  }
};

// Integration Settings API
export const integrationSettingsAPI = {
  getAll: async () => {
    console.log('integrationSettingsAPI.getAll called');
    try {
      const response = await api.get('/leads/integrations');
      console.log('integrationSettingsAPI.getAll response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.getAll:', error);
      throw error;
    }
  },
  
  getById: async (id: number) => {
    console.log('integrationSettingsAPI.getById called with id:', id);
    try {
      const response = await api.get(`/leads/integrations/${id}`);
      console.log('integrationSettingsAPI.getById response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.getById:', error);
      throw error;
    }
  },
  
  create: async (integrationData: any) => {
    console.log('integrationSettingsAPI.create called with data:', integrationData);
    try {
      const response = await api.post('/leads/integrations', integrationData);
      console.log('integrationSettingsAPI.create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.create:', error);
      throw error;
    }
  },
  
  update: async (id: number, integrationData: any) => {
    console.log('integrationSettingsAPI.update called with id:', id, 'and data:', integrationData);
    try {
      const response = await api.put(`/leads/integrations/${id}`, integrationData);
      console.log('integrationSettingsAPI.update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.update:', error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    console.log('integrationSettingsAPI.delete called with id:', id);
    try {
      const response = await api.delete(`/leads/integrations/${id}`);
      console.log('integrationSettingsAPI.delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.delete:', error);
      throw error;
    }
  },
  
  regenerateApiKey: async (id: number) => {
    console.log('integrationSettingsAPI.regenerateApiKey called with id:', id);
    try {
      const response = await api.post(`/leads/integrations/${id}/regenerate-api-key`);
      console.log('integrationSettingsAPI.regenerateApiKey response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.regenerateApiKey:', error);
      throw error;
    }
  },
  
  getWebhookUrl: async (id: number) => {
    console.log('integrationSettingsAPI.getWebhookUrl called with id:', id);
    try {
      const response = await api.get(`/leads/integrations/${id}/webhook-url`);
      console.log('integrationSettingsAPI.getWebhookUrl response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.getWebhookUrl:', error);
      throw error;
    }
  },
  
  getWebhookLogs: async (id: number, limit: number = 100) => {
    console.log('integrationSettingsAPI.getWebhookLogs called with id:', id, 'and limit:', limit);
    try {
      const response = await api.get(`/leads/integrations/${id}/logs`, { params: { limit } });
      console.log('integrationSettingsAPI.getWebhookLogs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in integrationSettingsAPI.getWebhookLogs:', error);
      throw error;
    }
  }
};

export default api;
