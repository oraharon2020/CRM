import axios from 'axios';
import { integrationSettingsAPI } from './api';
import { ProductCostDetail, ShippingCostDetail } from '../components/cashflow/utils/types';

/**
 * Interface for supplier costs data
 */
export interface DailyCostData {
  date: string;
  product_cost: number;
  shipping_cost: number;
  order_count: number;
}

/**
 * Interface for integration configuration
 */
export interface SupplierCostsIntegrationConfig {
  api_url: string;
  api_key: string;
  api_secret: string;
  include_cost_prices: boolean;
  include_shipping_costs: boolean;
}

/**
 * API service for interacting with the Multi-Supplier Manager plugin
 */
export const supplierCostsAPI = {
  /**
   * Get integration configuration for a specific store
   * 
   * @param storeId - The store ID
   * @returns The integration configuration or null if not found
   */
  getIntegrationConfig: async (storeId: number): Promise<SupplierCostsIntegrationConfig | null> => {
    try {
      const integrations = await integrationSettingsAPI.getAll();
      if (!integrations.success) return null;
      
      // Find the integration for the current store
      const integration = integrations.data.find((i: any) => 
        i.type === 'multi-supplier-manager' && 
        i.store_id === storeId && 
        i.is_enabled
      );
      
      // Check for data in both settings and config fields (for backward compatibility)
      const config = integration?.settings || integration?.config || null;
      
      // Normalize the API URL to ensure it doesn't end with a slash
      if (config && config.api_url) {
        config.api_url = config.api_url.replace(/\/$/, '');
      }
      
      return config;
    } catch (error) {
      console.error('Error fetching MSM integration config:', error);
      return null;
    }
  },

  /**
   * Get costs data for a specific date range
   * 
   * @param storeId - The store ID
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns The costs data
   */
  getCostsByDateRange: async (storeId: number, startDate: string, endDate: string) => {
    try {
      // Get integration configuration
      const config = await supplierCostsAPI.getIntegrationConfig(storeId);
      if (!config) {
        return { 
          success: false, 
          message: 'No active Multi-Supplier Manager integration found for this store' 
        };
      }
      
      // Make request to the plugin API
      const response = await axios.get(`${config.api_url}/costs/by-date-range`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          store_id: storeId,
          api_key: config.api_key // Send API key as query parameter instead of header to avoid CORS issues
        },
        // Include auth only if api_secret is provided
        ...(config.api_secret ? {
          auth: {
            username: config.api_key,
            password: config.api_secret
          }
        } : {})
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier costs:', error);
      return { 
        success: false, 
        message: 'Failed to fetch supplier costs data' 
      };
    }
  },

  /**
   * Get detailed product costs for a specific date
   * 
   * @param storeId - The store ID
   * @param date - Date in YYYY-MM-DD format
   * @returns Detailed product costs for the date
   */
  getProductCostDetailsByDate: async (storeId: number, date: string) => {
    try {
      console.log('Debug - getProductCostDetailsByDate - params:', { storeId, date });
      
      // Get integration configuration
      const config = await supplierCostsAPI.getIntegrationConfig(storeId);
      if (!config) {
        console.error('No active Multi-Supplier Manager integration found');
        return { 
          success: false, 
          message: 'No active Multi-Supplier Manager integration found for this store' 
        };
      }
      
      console.log('Debug - getProductCostDetailsByDate - config:', config);
      
      const url = `${config.api_url}/products/costs-by-date`;
      console.log('Debug - getProductCostDetailsByDate - request URL:', url);
      console.log('Debug - getProductCostDetailsByDate - request params:', {
        date,
        store_id: storeId,
        api_key: config.api_key
      });
      
      // Make request to the plugin API
      const response = await axios.get(url, {
        params: {
          date: date,
          store_id: storeId,
          api_key: config.api_key // Send API key as query parameter instead of header to avoid CORS issues
        },
        // Include auth only if api_secret is provided
        ...(config.api_secret ? {
          auth: {
            username: config.api_key,
            password: config.api_secret
          }
        } : {})
      });
      
      console.log('Debug - getProductCostDetailsByDate - response data:', response.data);
      
      // Check if order_item_id is included in the response
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        console.log('Debug - getProductCostDetailsByDate - first item:', response.data.data[0]);
        console.log('Debug - getProductCostDetailsByDate - order_item_id present:', response.data.data[0].hasOwnProperty('order_item_id'));
      }
      
      // Process the response to ensure order_item_id is properly included
      if (response.data.success && response.data.data) {
        // Map the response data to ensure all fields are properly included
        const mappedData = response.data.data.map((item: any) => ({
          order_id: item.order_id,
          order_number: item.order_number,
          order_item_id: item.order_item_id, // Explicitly map this field
          product_id: item.product_id,
          variation_id: item.variation_id,
          product_name: item.product_name,
          supplier_id: item.supplier_id,
          supplier_name: item.supplier_name,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          is_custom_cost: item.is_custom_cost,
          standard_cost: item.standard_cost,
          custom_cost: item.custom_cost
        }));
        
        console.log('Debug - getProductCostDetailsByDate - mapped data:', mappedData);
        console.log('Debug - getProductCostDetailsByDate - order_item_id in mapped data:', 
          mappedData.length > 0 ? mappedData[0].order_item_id : 'No items');
        
        return {
          success: response.data.success,
          message: response.data.message,
          data: mappedData
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching product cost details:', error);
      return { 
        success: false, 
        message: 'Failed to fetch product cost details',
        data: [] as ProductCostDetail[]
      };
    }
  },

  /**
   * Get detailed shipping costs for a specific date
   * 
   * @param storeId - The store ID
   * @param date - Date in YYYY-MM-DD format
   * @returns Detailed shipping costs for the date
   */
  getShippingCostDetailsByDate: async (storeId: number, date: string) => {
    try {
      console.log('Debug - getShippingCostDetailsByDate - params:', { storeId, date });
      
      // Get integration configuration
      const config = await supplierCostsAPI.getIntegrationConfig(storeId);
      if (!config) {
        console.error('No active Multi-Supplier Manager integration found');
        return { 
          success: false, 
          message: 'No active Multi-Supplier Manager integration found for this store' 
        };
      }
      
      console.log('Debug - getShippingCostDetailsByDate - config:', config);
      
      const url = `${config.api_url}/shipping/costs-by-date`;
      console.log('Debug - getShippingCostDetailsByDate - request URL:', url);
      console.log('Debug - getShippingCostDetailsByDate - request params:', {
        date,
        store_id: storeId,
        api_key: config.api_key
      });
      
      // Make request to the plugin API
      const response = await axios.get(url, {
        params: {
          date: date,
          store_id: storeId,
          api_key: config.api_key // Send API key as query parameter instead of header to avoid CORS issues
        },
        // Include auth only if api_secret is provided
        ...(config.api_secret ? {
          auth: {
            username: config.api_key,
            password: config.api_secret
          }
        } : {})
      });
      
      console.log('Debug - getShippingCostDetailsByDate - response data:', response.data);
      
      // Check if order_item_id is included in the response
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        console.log('Debug - getShippingCostDetailsByDate - first item:', response.data.data[0]);
        console.log('Debug - getShippingCostDetailsByDate - order_item_id present:', response.data.data[0].hasOwnProperty('order_item_id'));
      }
      
      // Process the response to ensure order_item_id is properly included
      if (response.data.success && response.data.data) {
        // Map the response data to ensure all fields are properly included
        const mappedData = response.data.data.map((item: any) => ({
          order_id: item.order_id,
          order_number: item.order_number,
          order_item_id: item.order_item_id, // Explicitly map this field
          cost: item.cost,
          shipping_method: item.shipping_method,
          supplier_id: item.supplier_id,
          supplier_name: item.supplier_name
        }));
        
        console.log('Debug - getShippingCostDetailsByDate - mapped data:', mappedData);
        console.log('Debug - getShippingCostDetailsByDate - order_item_id in mapped data:', 
          mappedData.length > 0 ? mappedData[0].order_item_id : 'No items');
        
        return {
          success: response.data.success,
          message: response.data.message,
          data: mappedData
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping cost details:', error);
      return { 
        success: false, 
        message: 'Failed to fetch shipping cost details',
        data: [] as ShippingCostDetail[]
      };
    }
  },

  /**
   * Update custom cost price for an order item
   * 
   * @param storeId - The store ID
   * @param orderId - The order ID
   * @param itemId - The order item ID
   * @param customCostPrice - The custom cost price
   * @param supplierId - Optional supplier ID (required if no supplier is set for the item)
   * @returns Response from the API
   */
  updateOrderItemCustomCost: async (
    storeId: number, 
    orderId: number, 
    itemId: number, 
    customCostPrice: number,
    supplierId?: number
  ) => {
    try {
      console.log('Debug - updateOrderItemCustomCost - params:', {
        storeId,
        orderId,
        itemId,
        customCostPrice,
        supplierId
      });
      
      // Get integration configuration
      const config = await supplierCostsAPI.getIntegrationConfig(storeId);
      if (!config) {
        console.error('No active Multi-Supplier Manager integration found');
        return { 
          success: false, 
          message: 'No active Multi-Supplier Manager integration found for this store' 
        };
      }
      
      console.log('Debug - updateOrderItemCustomCost - config:', config);
      
      // Prepare request data
      const data: any = {
        custom_cost_price: customCostPrice
      };
      
      // Add supplier_id if provided
      if (supplierId) {
        data.supplier_id = supplierId;
      }
      
      const url = `${config.api_url}/orders/${orderId}/items/${itemId}/custom-cost`;
      console.log('Debug - updateOrderItemCustomCost - request URL:', url);
      console.log('Debug - updateOrderItemCustomCost - request data:', data);
      
      // Make request to the plugin API
      const response = await axios.put(
        url, 
        data,
        {
          params: {
            api_key: config.api_key // Send API key as query parameter instead of header to avoid CORS issues
          },
          // Include auth only if api_secret is provided
          ...(config.api_secret ? {
            auth: {
              username: config.api_key,
              password: config.api_secret
            }
          } : {})
        }
      );
      
      console.log('Debug - updateOrderItemCustomCost - response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating custom cost price:', error);
      return { 
        success: false, 
        message: 'Failed to update custom cost price' 
      };
    }
  },

  /**
   * Update shipping cost for an order item
   * 
   * @param storeId - The store ID
   * @param orderId - The order ID
   * @param itemId - The order item ID
   * @param shippingCost - The shipping cost
   * @returns Response from the API
   */
  updateOrderItemShippingCost: async (
    storeId: number, 
    orderId: number, 
    itemId: number, 
    shippingCost: number
  ) => {
    try {
      console.log('Debug - updateOrderItemShippingCost - params:', {
        storeId,
        orderId,
        itemId,
        shippingCost
      });
      
      // Get integration configuration
      const config = await supplierCostsAPI.getIntegrationConfig(storeId);
      if (!config) {
        console.error('No active Multi-Supplier Manager integration found');
        return { 
          success: false, 
          message: 'No active Multi-Supplier Manager integration found for this store' 
        };
      }
      
      console.log('Debug - updateOrderItemShippingCost - config:', config);
      
      const url = `${config.api_url}/orders/${orderId}/items/${itemId}/shipping-cost`;
      console.log('Debug - updateOrderItemShippingCost - request URL:', url);
      console.log('Debug - updateOrderItemShippingCost - request data:', { shipping_cost: shippingCost });
      
      // Make request to the plugin API
      const response = await axios.put(
        url, 
        {
          shipping_cost: shippingCost
        },
        {
          params: {
            api_key: config.api_key // Send API key as query parameter instead of header to avoid CORS issues
          },
          // Include auth only if api_secret is provided
          ...(config.api_secret ? {
            auth: {
              username: config.api_key,
              password: config.api_secret
            }
          } : {})
        }
      );
      
      console.log('Debug - updateOrderItemShippingCost - response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating shipping cost:', error);
      return { 
        success: false, 
        message: 'Failed to update shipping cost' 
      };
    }
  },

  /**
   * Update both custom cost price and shipping cost for an order item
   * 
   * @param storeId - The store ID
   * @param orderId - The order ID
   * @param itemId - The order item ID
   * @param customCostPrice - Optional custom cost price
   * @param shippingCost - Optional shipping cost
   * @param supplierId - Optional supplier ID (required if no supplier is set for the item)
   * @returns Response from the API
   */
  updateOrderItemCosts: async (
    storeId: number, 
    orderId: number, 
    itemId: number, 
    customCostPrice?: number,
    shippingCost?: number,
    supplierId?: number
  ) => {
    try {
      // Get integration configuration
      const config = await supplierCostsAPI.getIntegrationConfig(storeId);
      if (!config) {
        return { 
          success: false, 
          message: 'No active Multi-Supplier Manager integration found for this store' 
        };
      }
      
      // Prepare request data
      const data: any = {};
      
      // Add parameters only if they are provided
      if (customCostPrice !== undefined) {
        data.custom_cost_price = customCostPrice;
      }
      
      if (shippingCost !== undefined) {
        data.shipping_cost = shippingCost;
      }
      
      if (supplierId) {
        data.supplier_id = supplierId;
      }
      
      // Make request to the plugin API
      const response = await axios.put(
        `${config.api_url}/orders/${orderId}/items/${itemId}/costs`, 
        data,
        {
          params: {
            api_key: config.api_key // Send API key as query parameter instead of header to avoid CORS issues
          },
          // Include auth only if api_secret is provided
          ...(config.api_secret ? {
            auth: {
              username: config.api_key,
              password: config.api_secret
            }
          } : {})
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating order item costs:', error);
      return { 
        success: false, 
        message: 'Failed to update order item costs' 
      };
    }
  }
};
