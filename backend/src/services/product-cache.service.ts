import productCacheModel from '../models/product-cache.model';
import { analyticsService } from './analytics.service';
import wooCommerceService from './woocommerce.service';
import { setTimeout } from 'timers/promises';

// Request queue for throttling API requests
interface QueuedRequest {
  storeId: number;
  params: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

/**
 * Service for managing product cache
 */
class ProductCacheService {
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private maxConcurrentRequests = 1; // Maximum number of concurrent requests
  private activeRequests = 0;
  private requestDelay = 1000; // Delay between requests in ms
  private isSyncInProgress = false; // Flag to indicate if a sync operation is in progress
  
  constructor() {
    // Start the queue processor
    this.processQueue();
  }
  
  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const request = this.requestQueue.shift();
      if (!request) continue;
      
      this.activeRequests++;
      
      try {
        // Process the request
        const result = await this.fetchProductData(request.storeId, request.params);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      } finally {
        this.activeRequests--;
        
        // Add a delay before processing the next request
        await setTimeout(this.requestDelay);
      }
    }
    
    this.isProcessingQueue = false;
    
    // If there are still items in the queue, process them
    if (this.requestQueue.length > 0) {
      this.processQueue();
    }
  }
  
  /**
   * Add a request to the queue
   */
  private queueRequest(storeId: number, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        storeId,
        params,
        resolve,
        reject
      });
      
      // Start processing the queue if it's not already running
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Initialize the product cache table
   */
  async initCache(): Promise<void> {
    try {
      await productCacheModel.initTable();
    } catch (error) {
      console.error('Error initializing product cache:', error);
      throw error;
    }
  }
  
  /**
   * Get cache configuration for a store
   */
  async getCacheConfig(storeId: number): Promise<any> {
    try {
      // Ensure cache tables exist
      await this.initCache();
      return await productCacheModel.getCacheConfig(storeId);
    } catch (error) {
      console.error(`Error getting cache config for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update cache configuration for a store
   */
  async updateCacheConfig(storeId: number, config: any): Promise<void> {
    try {
      // Ensure cache tables exist
      await this.initCache();
      await productCacheModel.updateCacheConfig(storeId, config);
    } catch (error) {
      console.error(`Error updating cache config for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cache statistics for a store
   */
  async getCacheStats(storeId: number): Promise<any> {
    try {
      // Ensure cache tables exist
      await this.initCache();
      return await productCacheModel.getCacheStats(storeId);
    } catch (error) {
      console.error(`Error getting cache stats for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch product data from API
   * This is the actual implementation that fetches data from the API
   * It's used by the queue processor
   */
  private async fetchProductData(storeId: number, params: any = {}): Promise<any[]> {
    try {
      console.log(`Fetching product data for store ${storeId}`);
      
      // Get orders from WooCommerce (using its retry logic)
      // Note: wooCommerceService.getOrders now returns an empty array instead of throwing on error
      let orders: any[] = [];
      
      try {
        orders = await wooCommerceService.getOrders(storeId, params);
      } catch (orderError: any) {
        console.error(`Error fetching orders for store ${storeId}:`, orderError);
        
        // Check for JSON parsing errors
        const isJsonError = orderError instanceof Error && (
          orderError.message.includes('Unexpected token') || 
          orderError.message.includes('JSON') ||
          orderError.message.includes('SyntaxError') ||
          orderError.message.includes('null is not valid JSON')
        );
        
        if (isJsonError) {
          console.warn('JSON parsing error detected in order retrieval, returning empty array');
          return [];
        }
        
        // For other errors, return empty array
        return [];
      }
      
      if (!orders || orders.length === 0) {
        console.log(`No orders found for store ${storeId}`);
        return [];
      }
      
      // If a sync operation is in progress, calculate product performance directly from orders
      // to avoid circular dependencies with analyticsService
      if (this.isSyncInProgress) {
        console.log(`Sync in progress for store ${storeId}, calculating product performance directly from orders`);
        return this.calculateProductPerformanceFromOrders(orders);
      }
      
      try {
        // Get product performance from analytics service
        const analyticsParams = {
          storeId,
          includeProducts: true,
          ...params
        };
        
        const analyticsResult = await analyticsService.getPerformanceData(
          analyticsParams.storeId,
          analyticsParams.storeId,
          new Date(params.after || new Date().setDate(new Date().getDate() - 30)),
          new Date()
        );
        
        // Enhanced null/undefined checking
        if (!analyticsResult) {
          console.warn(`Null or undefined response from analytics service for store ${storeId}`);
          return this.calculateProductPerformanceFromOrders(orders);
        }
        
        // Check if analyticsResult is an array
        if (Array.isArray(analyticsResult)) {
          return analyticsResult;
        } else {
          console.warn(`No product performance data returned for store ${storeId}`);
          
          // Calculate product performance directly from orders as fallback
          return this.calculateProductPerformanceFromOrders(orders);
        }
      } catch (analyticsError: any) {
        console.error(`Error getting product performance from analytics service for store ${storeId}:`, analyticsError);
        
        // Check for JSON parsing errors
        const isJsonError = analyticsError instanceof Error && (
          analyticsError.message.includes('Unexpected token') || 
          analyticsError.message.includes('JSON') ||
          analyticsError.message.includes('SyntaxError') ||
          analyticsError.message.includes('null is not valid JSON')
        );
        
        if (isJsonError) {
          console.warn('JSON parsing error detected in analytics service, falling back to direct calculation');
        }
        
        // Log detailed error information for debugging
        if (analyticsError instanceof Error) {
          console.error('Analytics error details:', {
            message: analyticsError.message,
            stack: analyticsError.stack,
            name: analyticsError.name
          });
        }
        
        // Calculate product performance directly from orders as fallback
        return this.calculateProductPerformanceFromOrders(orders);
      }
    } catch (error: any) {
      console.error(`Error fetching product data for store ${storeId}:`, error);
      
      // Check for JSON parsing errors
      const isJsonError = error instanceof Error && (
        error.message.includes('Unexpected token') || 
        error.message.includes('JSON') ||
        error.message.includes('SyntaxError') ||
        error.message.includes('null is not valid JSON')
      );
      
      if (isJsonError) {
        console.warn('JSON parsing error detected in fetchProductData, returning empty array');
      }
      
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Return empty array instead of throwing
      return [];
    }
  }
  
  /**
   * Calculate product performance directly from orders
   * This is a fallback method when the analytics service fails
   */
  private calculateProductPerformanceFromOrders(orders: any[]): any[] {
    try {
      console.log('Calculating product performance directly from orders');
      
      // Group products by ID
      const productMap = new Map<number, any>();
      
      // Process each order
      orders.forEach(order => {
        // Skip if line_items is not an array
        if (!Array.isArray(order.line_items)) return;
        
        // Process each line item
        order.line_items.forEach((item: any) => {
          const productId = item.product_id;
          if (!productId) return;
          
          const quantity = parseInt(item.quantity) || 0;
          const total = parseFloat(item.total) || 0;
          
          // If product not in map, add it
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              product_id: productId,
              name: item.name || `Product #${productId}`,
              sku: item.sku || '',
              quantity: 0,
              revenue: 0
            });
          }
          
          // Update product stats
          const product = productMap.get(productId);
          product.quantity += quantity;
          product.revenue += total;
        });
      });
      
      // Convert map to array
      return Array.from(productMap.values());
    } catch (error) {
      console.error('Error calculating product performance from orders:', error);
      return [];
    }
  }
  
  /**
   * Get product performance data for a store
   * Uses cache if available and fresh, otherwise fetches from WooCommerce
   */
  async getProductPerformance(storeId: number, params: any = {}): Promise<any[]> {
    try {
      console.log(`Getting product performance for store ${storeId}`);
      
      // Ensure cache tables exist
      await this.initCache();
      
      // Check if cache is fresh
      const isCacheFresh = await productCacheModel.isCacheFresh(storeId);
      console.log(`Cache freshness for store ${storeId}: ${isCacheFresh}`);
      
      if (isCacheFresh) {
        // Use cached data
        console.log(`Using cached product data for store ${storeId}`);
        const cachedProducts = await productCacheModel.getByStoreId(storeId);
        return cachedProducts;
      }
      
      // Check if a full sync is needed or if we can do an incremental update
      const isFullSyncNeeded = await productCacheModel.isFullSyncNeeded(storeId);
      
      if (isFullSyncNeeded) {
        console.log(`Full sync needed for store ${storeId}`);
        // Queue a full sync in the background
        this.syncStore(storeId, params).catch(error => {
          console.error(`Background sync failed for store ${storeId}:`, error);
        });
      } else {
        console.log(`Incremental update for store ${storeId}`);
        // Queue an incremental update in the background
        this.incrementalUpdate(storeId, params).catch(error => {
          console.error(`Background incremental update failed for store ${storeId}:`, error);
        });
      }
      
      // Return the current cache even if it's not fresh
      // The background sync will update it for next time
      console.log(`Returning current cache for store ${storeId} while updating in background`);
      const cachedProducts = await productCacheModel.getByStoreId(storeId);
      
      if (cachedProducts && cachedProducts.length > 0) {
        return cachedProducts;
      }
      
      // If no cache exists, wait for the data to be fetched
      console.log(`No cache exists for store ${storeId}, waiting for data to be fetched`);
      const productPerformance = await this.queueRequest(storeId, params);
      
      // Save to cache
      if (productPerformance && productPerformance.length > 0) {
        await this.updateCache(storeId, productPerformance);
      }
      
      return productPerformance;
    } catch (error) {
      console.error(`Error getting product performance for store ${storeId}:`, error);
      
      // Try to get from cache even if it's not fresh
      try {
        console.log(`Trying to get stale cache for store ${storeId}`);
        const cachedProducts = await productCacheModel.getByStoreId(storeId);
        
        if (cachedProducts && cachedProducts.length > 0) {
          console.log(`Using stale cached product data for store ${storeId}`);
          return cachedProducts;
        }
      } catch (cacheError) {
        console.error(`Error getting stale cache for store ${storeId}:`, cacheError);
      }
      
      // If all else fails, return empty array
      return [];
    }
  }
  
  /**
   * Update product cache for a store (full replacement)
   */
  async updateCache(storeId: number, products: any[]): Promise<void> {
    try {
      console.log(`Updating product cache for store ${storeId} with ${products.length} products`);
      // Ensure cache tables exist
      await this.initCache();
      await productCacheModel.saveProducts(storeId, products);
    } catch (error) {
      console.error(`Error updating product cache for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update product cache incrementally for a store
   */
  async incrementalUpdate(storeId: number, params: any = {}): Promise<void> {
    // Set sync flag to prevent circular dependencies
    this.isSyncInProgress = true;
    
    try {
      console.log(`Incrementally updating product cache for store ${storeId}`);
      
      // Ensure cache tables exist
      await this.initCache();
      
      // Default to last 7 days for incremental updates
      if (!params.after && !params.startDate) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        params.after = sevenDaysAgo.toISOString();
      }
      
      // Get product data
      const productPerformance = await this.queueRequest(storeId, params);
      
      if (!productPerformance || productPerformance.length === 0) {
        console.log(`No product data found for incremental update of store ${storeId}`);
        return;
      }
      
      // Update cache incrementally
      await productCacheModel.updateProducts(storeId, productPerformance);
      
      console.log(`Successfully updated ${productPerformance.length} products in cache for store ${storeId}`);
    } catch (error) {
      console.error(`Error incrementally updating product cache for store ${storeId}:`, error);
      throw error;
    } finally {
      // Reset sync flag
      this.isSyncInProgress = false;
    }
  }
  
  /**
   * Clear product cache for a store
   */
  async clearCache(storeId: number): Promise<void> {
    try {
      console.log(`Clearing product cache for store ${storeId}`);
      // Ensure cache tables exist
      await this.initCache();
      await productCacheModel.clearCache(storeId);
    } catch (error) {
      console.error(`Error clearing product cache for store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Sync product cache for all stores
   * This can be called by a scheduled job
   */
  async syncAllStores(): Promise<void> {
    // Set sync flag to prevent circular dependencies
    this.isSyncInProgress = true;
    
    try {
      console.log('Syncing product cache for all stores');
      
      // Ensure cache tables exist
      await this.initCache();
      
      // Get all stores
      const stores = wooCommerceService.getAllStores();
      
      // Sync each store
      for (const store of stores) {
        try {
          // Check if a full sync is needed
          const isFullSyncNeeded = await productCacheModel.isFullSyncNeeded(store.id);
          
          if (isFullSyncNeeded) {
            console.log(`Full sync needed for store ${store.id}`);
            
            // Default to last 30 days for full sync
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const params = {
              after: thirtyDaysAgo.toISOString()
            };
            
            // Queue the sync
            this.syncStore(store.id, params).catch(error => {
              console.error(`Sync failed for store ${store.id}:`, error);
            });
          } else {
            console.log(`Incremental update for store ${store.id}`);
            
            // Default to last 7 days for incremental updates
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const params = {
              after: sevenDaysAgo.toISOString()
            };
            
            // Queue the incremental update
            this.incrementalUpdate(store.id, params).catch(error => {
              console.error(`Incremental update failed for store ${store.id}:`, error);
            });
          }
          
          // Add a delay between stores to avoid overwhelming the queue
          await setTimeout(5000);
        } catch (error) {
          console.error(`Error syncing product cache for store ${store.id}:`, error);
          // Continue with next store after a delay
          await setTimeout(5000);
        }
      }
      
      console.log('Finished queuing sync tasks for all stores');
    } catch (error) {
      console.error('Error syncing product cache for all stores:', error);
      throw error;
    } finally {
      // Reset sync flag
      this.isSyncInProgress = false;
    }
  }
  
  /**
   * Sync product cache for a specific store with retries
   */
  async syncStore(storeId: number, params: any = {}): Promise<void> {
    const maxRetries = 3;
    let retries = 0;
    let baseDelay = 2000; // Start with 2 seconds
    
    // Set sync flag to prevent circular dependencies
    this.isSyncInProgress = true;
    
    try {
      // Ensure cache tables exist
      try {
        await this.initCache();
      } catch (error) {
        console.error(`Error initializing cache tables before syncing store ${storeId}:`, error);
        // Continue with sync attempt even if initialization fails
      }
      
      while (retries <= maxRetries) {
        try {
          console.log(`Syncing product cache for store ${storeId} (attempt ${retries + 1}/${maxRetries + 1})`);
          
          // Default to last 30 days if no date range provided
          if (!params.after && !params.startDate) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            params.after = thirtyDaysAgo.toISOString();
          }
          
          // Get product data through the queue
          const productPerformance = await this.queueRequest(storeId, params);
          
          if (!productPerformance || productPerformance.length === 0) {
            console.log(`No product data found for store ${storeId}`);
            return;
          }
          
          // Save to cache (full replacement)
          await this.updateCache(storeId, productPerformance);
          
          console.log(`Successfully synced product cache for store ${storeId}`);
          return;
        } catch (error: any) {
          retries++;
          
          // Check if it's a rate limiting error (429)
          const isRateLimitError = error.response && error.response.status === 429;
          
          if (retries > maxRetries) {
            console.error(`Failed to sync product cache for store ${storeId} after ${maxRetries + 1} attempts:`, error);
            throw error;
          }
          
          // Calculate delay with exponential backoff and jitter
          let delay = isRateLimitError 
            ? (error.response?.headers?.['retry-after'] ? parseInt(error.response.headers['retry-after']) * 1000 : baseDelay)
            : baseDelay;
          
          // Add jitter (±20%)
          const jitter = delay * 0.2 * (Math.random() * 2 - 1);
          delay = Math.max(1000, delay + jitter);
          
          console.log(`Error syncing product cache for store ${storeId}. Retrying in ${Math.round(delay)}ms (Attempt ${retries}/${maxRetries})`);
          
          // Wait before retrying
          await setTimeout(delay);
          
          // Increase base delay for next potential retry (exponential backoff)
          baseDelay *= 2;
        }
      }
    } finally {
      // Reset sync flag
      this.isSyncInProgress = false;
    }
  }
}

export default new ProductCacheService();
