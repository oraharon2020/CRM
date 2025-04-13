import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { setTimeout } from 'timers/promises';

// Define interface for WooCommerce API response
interface WooCommerceResponse {
  data: any;
  [key: string]: any;
}

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  version: string;
}

interface WooCommerceStore {
  id: number;
  name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
  status: string;
}

class WooCommerceService {
  private clients: Map<number, WooCommerceRestApi>;
  private stores: Map<number, WooCommerceStore>;

  constructor() {
    this.clients = new Map();
    this.stores = new Map();
  }

  /**
   * Register a WooCommerce store
   */
  registerStore(store: WooCommerceStore): void {
    // Create a new WooCommerce client for this store
    const client = new WooCommerceRestApi({
      url: store.url,
      consumerKey: store.consumer_key,
      consumerSecret: store.consumer_secret,
      version: 'wc/v3',
      queryStringAuth: true // Force Basic Authentication as query string for legacy servers
    });

    // Store the client and store info
    this.clients.set(store.id, client);
    this.stores.set(store.id, store);
  }

  /**
   * Get a WooCommerce client for a specific store
   */
  getClient(storeId: number): WooCommerceRestApi {
    const client = this.clients.get(storeId);
    if (!client) {
      throw new Error(`No WooCommerce client found for store ID: ${storeId}`);
    }
    return client;
  }

  /**
   * Get store information
   */
  getStore(storeId: number): WooCommerceStore {
    const store = this.stores.get(storeId);
    if (!store) {
      throw new Error(`Store not found with ID: ${storeId}`);
    }
    return store;
  }

  /**
   * Get all registered stores
   */
  getAllStores(): WooCommerceStore[] {
    return Array.from(this.stores.values());
  }

  /**
   * Remove a WooCommerce store
   */
  removeStore(storeId: number): void {
    console.log(`Removing WooCommerce store with ID: ${storeId}`);
    this.clients.delete(storeId);
    this.stores.delete(storeId);
  }

  /**
   * Execute a WooCommerce API request with retry logic and rate limiting
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<WooCommerceResponse> {
    let retries = 0;
    let delay = initialDelay;
    
    while (true) {
      try {
        const result = await operation();
        
        // Check if result is null or undefined
        if (result === null || result === undefined) {
          console.warn('WooCommerce API returned null or undefined result');
          // Return empty response object
          return { data: [] } as WooCommerceResponse;
        }
        
        // Cast the result to WooCommerceResponse
        return result as unknown as WooCommerceResponse;
      } catch (error: any) {
        console.error('WooCommerce API error:', error.message);
        
        // Check if it's a rate limiting error (429)
        const isRateLimitError = error.response && error.response.status === 429;
        
        // Check for specific error types that indicate invalid JSON
        const isJsonError = error.message && (
          error.message.includes('Unexpected token') || 
          error.message.includes('JSON') ||
          error.message.includes('SyntaxError')
        );
        
        // If it's a JSON parsing error, return an empty result
        if (isJsonError) {
          console.warn('JSON parsing error from WooCommerce API, returning empty result');
          return { data: [] } as WooCommerceResponse;
        }
        
        // If we've reached max retries or it's not a rate limit error and we've tried at least once
        if (retries >= maxRetries || (!isRateLimitError && retries > 0)) {
          // For certain errors, return empty result instead of throwing
          if (error.response && (error.response.status === 404 || error.response.status === 400)) {
            console.warn(`WooCommerce API returned ${error.response.status}, returning empty result`);
            return { data: [] } as WooCommerceResponse;
          }
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const retryDelay = isRateLimitError 
          ? (error.response?.headers?.['retry-after'] ? parseInt(error.response.headers['retry-after']) * 1000 : delay)
          : delay;
        
        console.log(`Rate limit hit or error occurred. Retrying in ${retryDelay}ms (Attempt ${retries + 1}/${maxRetries})`);
        
        // Wait before retrying
        await setTimeout(retryDelay);
        
        // Increase delay for next potential retry (exponential backoff)
        delay *= 2;
        retries++;
      }
    }
  }

  /**
   * Get orders from a specific store
   */
  async getOrders(storeId: number, params: any = {}): Promise<any> {
    try {
      console.log(`WooCommerce service getOrders called for store ${storeId} with params:`, params);
      const client = this.getClient(storeId);
      
      try {
        const response = await this.executeWithRetry(
          () => client.get('orders', params)
        );
        
        // Check if response or response.data is null/undefined
        if (!response || !response.data) {
          console.warn(`WooCommerce API returned empty response for store ${storeId}`);
          return [];
        }
        
      // Ensure response.data is an array
      if (!Array.isArray(response.data)) {
        console.warn(`WooCommerce API returned non-array data for store ${storeId}:`, response.data);
        // If it's a single object, wrap it in an array
        return response.data && typeof response.data === 'object' ? [response.data] : [];
      }
      
      console.log(`WooCommerce service getOrders response for store ${storeId}:`, response.data.length, 'orders');
      return response.data;
      } catch (error) {
        console.error(`Error in executeWithRetry for store ${storeId}:`, error);
        
        // Return empty array for orders as fallback
        console.warn(`Returning empty orders array for store ${storeId} due to API error`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching orders from store ${storeId}:`, error);
      
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get a specific order from a store
   */
  async getOrder(storeId: number, orderId: number): Promise<any> {
    try {
      const client = this.getClient(storeId);
      
      const response = await this.executeWithRetry(
        () => client.get(`orders/${orderId}`)
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId} from store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get products from a specific store
   */
  async getProducts(storeId: number, params: any = {}): Promise<any> {
    try {
      const client = this.getClient(storeId);
      
      const response = await this.executeWithRetry(
        () => client.get('products', params)
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching products from store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get customers from a specific store
   */
  async getCustomers(storeId: number, params: any = {}): Promise<any> {
    try {
      const client = this.getClient(storeId);
      
      const response = await this.executeWithRetry(
        () => client.get('customers', params)
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching customers from store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get store order statuses
   */
  async getStoreStatuses(storeId: number): Promise<any> {
    try {
      const client = this.getClient(storeId);
      const store = this.getStore(storeId);
      
      // Try different API endpoints to get statuses
      const endpoints = [
        'orders/statuses',
        'reports/orders/totals'
      ];
      
      let statuses: { value: string; label: string }[] = [];
      
      // Try each endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch statuses from endpoint: ${endpoint}`);
          const response = await this.executeWithRetry(
            () => client.get(endpoint)
          );
          
          if (response.data) {
            if (endpoint === 'orders/statuses') {
              // Process statuses from orders/statuses endpoint
              const statusData = response.data;
              for (const [key, status] of Object.entries(statusData)) {
                if (typeof status === 'object' && status !== null && 'name' in status) {
                  const statusKey = key.replace('wc-', '');
                  statuses.push({
                    value: statusKey,
                    label: (status as any).name
                  });
                }
              }
              
              if (statuses.length > 0) {
                break; // Exit the loop if we found statuses
              }
            } else if (endpoint === 'reports/orders/totals') {
              // Process statuses from reports/orders/totals endpoint
              const totals = response.data;
              if (Array.isArray(totals)) {
                for (const total of totals) {
                  if (total.slug && total.name) {
                    const statusKey = total.slug.replace('wc-', '');
                    statuses.push({
                      value: statusKey,
                      label: total.name
                    });
                  }
                }
              }
              
              if (statuses.length > 0) {
                break; // Exit the loop if we found statuses
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching statuses from endpoint ${endpoint}:`, error);
          // Continue to the next endpoint
        }
      }
      
      // If no statuses found, use defaults with Hebrew labels
      if (statuses.length === 0) {
        statuses = [
          { value: 'pending', label: 'ממתין לתשלום' },
          { value: 'processing', label: 'בטיפול' },
          { value: 'on-hold', label: 'בהמתנה' },
          { value: 'completed', label: 'הושלם' },
          { value: 'cancelled', label: 'בוטל' },
          { value: 'refunded', label: 'זוכה' },
          { value: 'failed', label: 'נכשל' }
        ];
      }
      
      // Categorize statuses
      const standardStatuses = [
        { value: 'processing', label: 'בטיפול' },
        { value: 'completed', label: 'הושלם' },
        { value: 'on-hold', label: 'בהמתנה' },
        { value: 'cancelled', label: 'בוטל' }
      ];
      
      // Find statuses that are not in the standard list
      const customStatuses = statuses.filter(status => 
        !standardStatuses.some(std => std.value === status.value)
      );
      
      return {
        store_id: storeId,
        standardStatuses,
        customStatuses
      };
    } catch (error) {
      console.error(`Error fetching store statuses for store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get store statistics for a specific period
   */
  async getStoreStats(storeId: number, params: any = {}): Promise<any> {
    try {
      console.log('WooCommerce service getStoreStats called with params:', params);
      const client = this.getClient(storeId);
      
      // Handle Status objects with value and label properties
      if (params.statuses && params.statuses.length > 0) {
        console.log('Got statuses, checking format...', JSON.stringify(params.statuses).substring(0, 100) + '...');
        
        // Case 1: We got an array containing a single object with numeric keys
        if (params.statuses.length === 1 && typeof params.statuses[0] === 'object' && params.statuses[0] !== null) {
          // Check if it's the specific format we're dealing with (object with numeric keys)
          const firstStatus = params.statuses[0];
          const hasNumericKeys = Object.keys(firstStatus).some(key => !isNaN(Number(key)));
          
          if (hasNumericKeys) {
            console.log('Got object with numeric keys, extracting values...');
            const extractedStatuses = [];
            
            // Extract each Status object from the numeric keys
            for (const key in firstStatus) {
              if (firstStatus[key] && typeof firstStatus[key] === 'object' && 'value' in firstStatus[key]) {
                extractedStatuses.push(firstStatus[key].value);
              }
            }
            
            params.statuses = extractedStatuses;
            console.log('Extracted status values from numeric keys:', params.statuses);
          } else if ('value' in firstStatus) {
            // Case 2: Regular array of Status objects with value/label
            console.log('Got Status objects, extracting values...');
            params.statuses = params.statuses.map((status: any) => 
              status && typeof status === 'object' && 'value' in status 
                ? status.value 
                : status
            );
            console.log('Extracted status values:', params.statuses);
          }
        } else if (Array.isArray(params.statuses) && typeof params.statuses[0] === 'object' && 'value' in params.statuses[0]) {
          // Case 3: Regular array of Status objects with value/label
          console.log('Got array of Status objects, extracting values...');
          params.statuses = params.statuses.map((status: any) => 
            status && typeof status === 'object' && 'value' in status 
              ? status.value 
              : status
          );
          console.log('Extracted status values:', params.statuses);
        }
        // Case 4: Already an array of strings, no need to extract
      }
      
      // Check if statuses array is empty or contains only invalid statuses
      if (params.statuses && params.statuses.length === 0) {
        console.log('No statuses selected, returning empty stats');
        // Return empty stats if no statuses are selected
        return {
          store_id: storeId,
          period: params.period || 'custom',
          startDate: params.startDate,
          endDate: params.endDate,
          stats: {
            orders: 0,
            revenue: 0,
            avg_order: 0,
            products_sold: 0
          }
        };
      }
      
      // Prepare date parameters for filtering
      let dateQuery: any = {};
      
      if (params.startDate && params.endDate) {
        // Custom date range
        // Always normalize dates to ensure consistent format
        const startDate = new Date(params.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        console.log('Custom date range - start:', startDate.toISOString(), 'end:', endDate.toISOString());
        
        // Calculate the number of days in the range
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`Date range spans ${daysDiff} days`);
        
        dateQuery = {
          after: startDate.toISOString(),
          before: endDate.toISOString()
        };
      } else if (params.period) {
        // Predefined period
        const now = new Date();
        let startDate = new Date();
        
        if (params.period === 'today') {
          // For 'today', set start date to beginning of today (00:00:00)
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          // Set end date to end of today (23:59:59)
          const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          
          console.log('Today period - start:', startDate.toISOString(), 'end:', endDate.toISOString());
          
          dateQuery = {
            after: startDate.toISOString(),
            before: endDate.toISOString()
          };
        } else if (params.period === 'week') {
          startDate.setDate(now.getDate() - 7);
          dateQuery = {
            after: startDate.toISOString(),
            before: now.toISOString()
          };
        } else if (params.period === 'month') {
          startDate.setMonth(now.getMonth() - 1);
          dateQuery = {
            after: startDate.toISOString(),
            before: now.toISOString()
          };
        } else if (params.period === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
          dateQuery = {
            after: startDate.toISOString(),
            before: now.toISOString()
          };
        } else {
          dateQuery = {
            after: startDate.toISOString(),
            before: now.toISOString()
          };
        }
      }
      
      // Prepare API request parameters
      const requestParams: any = {
        after: dateQuery.after,
        before: dateQuery.before,
        per_page: 100 // Get more orders to calculate accurate stats
      };
      
      // Add status filter if provided
      // Include all statuses, including custom ones
      if (params.statuses && params.statuses.length > 0) {
        requestParams.status = params.statuses;
      }
      
      // Get orders for the specified period
      let orders = [];
      
      try {
        // Check if we need to chunk the request due to date range size
        const daysDiff = params.startDate && params.endDate ? 
          Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        if (daysDiff > 14) {
          // For large date ranges, chunk the requests by week to avoid API limitations
          console.log(`Large date range detected (${daysDiff} days). Chunking requests by week.`);
          orders = await this.fetchOrdersByChunks(client, requestParams, dateQuery);
        } else {
          // For smaller ranges, try the normal approach
          console.log('Using standard request for smaller date range');
          const ordersResponse = await this.executeWithRetry(
            () => client.get('orders', requestParams)
          );
          orders = ordersResponse.data;
        }
      } catch (error) {
        console.error(`Error fetching orders with standard approach:`, error);
        console.log('Falling back to alternative fetching methods');
        
        // Try alternative fetching methods
        try {
          // First try chunking by date
          console.log('Trying to fetch orders by date chunks');
          orders = await this.fetchOrdersByChunks(client, requestParams, dateQuery);
        } catch (chunkError) {
          console.error('Error fetching orders by date chunks:', chunkError);
          
          // If that fails, try fetching orders for each status individually
          if (params.statuses && params.statuses.length > 0) {
            console.log('Trying to fetch orders by individual status');
            // Create a copy of the request params without the status
            const baseParams = { ...requestParams };
            delete baseParams.status;
            
            // Fetch orders for each status individually and combine the results
            const orderPromises = params.statuses.map(async (status: string) => {
              try {
                const response = await this.executeWithRetry(
                  () => client.get('orders', { 
                    ...baseParams, 
                    status: status 
                  })
                );
                return response.data;
              } catch (statusError) {
                console.error(`Error fetching orders for status ${status}:`, statusError);
                
                // Try with search parameter instead
                try {
                  const searchResponse = await this.executeWithRetry(
                    () => client.get('orders', { 
                      ...baseParams, 
                      search: status 
                    })
                  );
                  return searchResponse.data;
                } catch (searchError) {
                  console.error(`Error searching orders for status ${status}:`, searchError);
                  return [];
                }
              }
            });
            
            // Wait for all promises to resolve
            const orderArrays = await Promise.all(orderPromises);
            
            // Combine all order arrays, removing duplicates by ID
            const orderMap = new Map<number, any>();
            orderArrays.forEach((orderArray: any[]) => {
              orderArray.forEach((order: any) => {
                orderMap.set(order.id, order);
              });
            });
            
            orders = Array.from(orderMap.values());
          } else {
            // If no statuses are specified, return empty stats
            return {
              store_id: storeId,
              period: params.period || 'custom',
              startDate: dateQuery.after,
              endDate: dateQuery.before,
              stats: {
                orders: 0,
                revenue: 0,
                avg_order: 0,
                products_sold: 0
              }
            };
          }
        }
      }
      
      // Calculate statistics
      const stats = {
        orders: orders.length,
        revenue: 0,
        avg_order: 0,
        products_sold: 0
      };
      
      // Calculate total revenue and products sold
      if (orders.length > 0) {
        stats.revenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0);
        stats.avg_order = stats.revenue / orders.length;
        
        // Count products sold
        stats.products_sold = orders.reduce((sum: number, order: any) => {
          return sum + order.line_items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
        }, 0);
      }
      
      return {
        store_id: storeId,
        period: params.period || 'custom',
        startDate: dateQuery.after,
        endDate: dateQuery.before,
        stats
      };
    } catch (error) {
      console.error(`Error fetching store stats for store ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Get sales data by date using the custom endpoint
   */
  async getSalesByDate(storeId: number, year: number, month: number, statuses?: string[]): Promise<any> {
    try {
      console.log(`[WOOCOMMERCE] getSalesByDate called for store ${storeId}, year ${year}, month ${month}`);
      const client = this.getClient(storeId);
      const store = this.getStore(storeId);
      
      // Log the store URL and credentials (mask the secret)
      console.log(`[WOOCOMMERCE] Store URL: ${store.url}`);
      console.log(`[WOOCOMMERCE] Consumer Key: ${store.consumer_key.substring(0, 5)}...`);
      
      // Construct the full URL for debugging
      const fullUrl = `${store.url}/wp-json/wc-analytics/v1/sales-by-date`;
      console.log(`[WOOCOMMERCE] Full endpoint URL: ${fullUrl}`);
      
      // Prepare parameters
      const params: any = {
        year: year,
        month: month
      };
      
      // Add statuses if provided
      if (statuses && statuses.length > 0) {
        params.statuses = statuses;
        console.log(`[WOOCOMMERCE] Including statuses:`, statuses);
      }
      
      console.log(`[WOOCOMMERCE] Parameters:`, params);
      
      // Use the custom endpoint
      console.log(`[WOOCOMMERCE] Calling custom endpoint: wc-analytics/v1/sales-by-date`);
      let response;
      try {
        // Try with direct fetch to the endpoint
        const queryParams = new URLSearchParams();
        queryParams.append('year', year.toString());
        queryParams.append('month', month.toString());
        
        // Add statuses if provided
        if (statuses && statuses.length > 0) {
          statuses.forEach(status => {
            queryParams.append('statuses[]', status);
          });
        }
        
        const url = `${store.url}/wp-json/wc-analytics/v1/sales-by-date?${queryParams.toString()}`;
        console.log(`[WOOCOMMERCE] Direct fetch URL: ${url}`);
        
        // Add authentication
        const auth = Buffer.from(`${store.consumer_key}:${store.consumer_secret}`).toString('base64');
        
        const fetchResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const data = await fetchResponse.json();
        response = { data };
        
        // Log the raw response for debugging
        console.log(`[WOOCOMMERCE] Raw response:`, JSON.stringify(response));
      } catch (apiError) {
        console.error(`[WOOCOMMERCE] API call error:`, apiError);
        throw apiError;
      }
      
      if (!response || !response.data) {
        console.warn(`[WOOCOMMERCE] Custom endpoint returned empty response for store ${storeId}`);
        return {
          success: false,
          data: [],
          totals: {
            total_revenue: 0,
            total_orders: 0,
            total_products: 0
          }
        };
      }
      
      console.log(`[WOOCOMMERCE] Response status:`, response.status);
      console.log(`[WOOCOMMERCE] Response headers:`, response.headers);
      console.log(`[WOOCOMMERCE] Custom endpoint success: ${response.data.data ? response.data.data.length : 0} days of data`);
      
      // Check if the response has the expected format
      if (response.data.success === true && 
          response.data.data && 
          Array.isArray(response.data.data) && 
          response.data.data.length > 0) {
        console.log(`[WOOCOMMERCE] Custom endpoint returned valid data format`);
        console.log(`[WOOCOMMERCE] First day of data:`, JSON.stringify(response.data.data[0]));
      } else {
        console.warn(`[WOOCOMMERCE] Custom endpoint response format unexpected:`, 
          response.data.success, 
          Array.isArray(response.data.data), 
          response.data.data ? response.data.data.length : 0);
        console.warn(`[WOOCOMMERCE] Response data:`, JSON.stringify(response.data));
      }
      
      return {
        success: true,
        data: response.data.data || [],
        totals: response.data.totals || {
          total_revenue: 0,
          total_orders: 0,
          total_products: 0
        }
      };
    } catch (error) {
      console.error(`[WOOCOMMERCE] Custom endpoint error for store ${storeId}:`, error);
      
      // Return empty object in case of error
      return {
        success: false,
        message: error.message || 'Unknown error',
        data: [],
        totals: {
          total_revenue: 0,
          total_orders: 0,
          total_products: 0
        }
      };
    }
  }

  /**
   * Fetch orders by breaking the date range into smaller chunks
   * This helps avoid API limitations for large date ranges
   */
  private async fetchOrdersByChunks(
    client: WooCommerceRestApi, 
    requestParams: any, 
    dateQuery: { after: string; before: string }
  ): Promise<any[]> {
    console.log('Fetching orders by chunks');
    
    // Parse the start and end dates
    const startDate = new Date(dateQuery.after);
    const endDate = new Date(dateQuery.before);
    
    // Calculate the total number of days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Use 7-day chunks (one week at a time)
    const chunkSize = 7;
    const numberOfChunks = Math.ceil(totalDays / chunkSize);
    
    console.log(`Breaking ${totalDays} days into ${numberOfChunks} chunks of ${chunkSize} days each`);
    
    // Create an array to hold all orders
    const allOrders: any[] = [];
    const orderMap = new Map<number, any>();
    
    // Process each chunk
    for (let i = 0; i < numberOfChunks; i++) {
      // Calculate the chunk's start date
      const chunkStartDate = new Date(startDate);
      chunkStartDate.setDate(startDate.getDate() + (i * chunkSize));
      
      // Calculate the chunk's end date
      let chunkEndDate = new Date(chunkStartDate);
      chunkEndDate.setDate(chunkStartDate.getDate() + chunkSize - 1);
      
      // Make sure the chunk end date doesn't exceed the overall end date
      if (chunkEndDate > endDate) {
        chunkEndDate = new Date(endDate);
      }
      
      // Set the hours to ensure we get the full day
      chunkStartDate.setHours(0, 0, 0, 0);
      chunkEndDate.setHours(23, 59, 59, 999);
      
      console.log(`Fetching chunk ${i + 1}/${numberOfChunks}: ${chunkStartDate.toISOString()} to ${chunkEndDate.toISOString()}`);
      
      // Create params for this chunk
      const chunkParams = {
        ...requestParams,
        after: chunkStartDate.toISOString(),
        before: chunkEndDate.toISOString()
      };
      
      try {
        // Fetch orders for this chunk
        const response = await this.executeWithRetry(
          () => client.get('orders', chunkParams)
        );
        const chunkOrders = response.data;
        
        console.log(`Chunk ${i + 1}/${numberOfChunks} returned ${chunkOrders.length} orders`);
        
        // Add orders to the map to avoid duplicates
        chunkOrders.forEach((order: any) => {
          orderMap.set(order.id, order);
        });
      } catch (error) {
        console.error(`Error fetching chunk ${i + 1}/${numberOfChunks}:`, error);
        // Continue with the next chunk even if this one fails
      }
    }
    
    // Convert the map values to an array
    return Array.from(orderMap.values());
  }
}

// Create a singleton instance
const wooCommerceService = new WooCommerceService();

// Register the sample stores
wooCommerceService.registerStore({ 
  id: 1734091091, 
  name: 'bellano', 
  url: 'https://www.bellano.co.il', 
  consumer_key: 'ck_bcf06dd966c850b80accd1004f2a2545443251c4',
  consumer_secret: 'cs_cf3ea36e6b49cacfaa326ce96a803716f4c42c9f',
  status: 'active'
});

wooCommerceService.registerStore({ 
  id: 1734219687, 
  name: 'Nalla', 
  url: 'https://www.nalla.co.il', 
  consumer_key: 'ck_6991eeb4b3532be9db091ee32d19b0c0e7225b4f',
  consumer_secret: 'cs_6349b5aa2214c738b064f54cb88e7eb2cb304cfb',
  status: 'active'
});

export default wooCommerceService;
