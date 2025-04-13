/**
 * API Rate Limiter
 * 
 * This utility helps prevent 429 Too Many Requests errors by:
 * 1. Queuing requests and processing them at a controlled rate
 * 2. Implementing automatic retry with exponential backoff
 * 3. Prioritizing certain API endpoints
 */

interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  priority: number;
  endpoint: string;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
}

class ApiRateLimiter {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private concurrentRequests = 0;
  private maxConcurrentRequests = 3;
  private requestsPerSecond = 5;
  private lastRequestTime = 0;
  private minRequestInterval = 1000 / this.requestsPerSecond; // ms between requests
  
  // Endpoint-specific configurations
  private endpointConfigs: Record<string, { priority: number; maxRetries: number }> = {
    // High priority endpoints
    '/auth': { priority: 10, maxRetries: 3 },
    '/users': { priority: 8, maxRetries: 3 },
    
    // Medium priority endpoints
    '/leads': { priority: 5, maxRetries: 2 },
    '/stores': { priority: 5, maxRetries: 2 },
    '/calendar': { priority: 5, maxRetries: 2 },
    
    // Lower priority endpoints
    '/analytics': { priority: 3, maxRetries: 1 },
    '/dashboard': { priority: 2, maxRetries: 1 },
    
    // Default configuration
    'default': { priority: 1, maxRetries: 1 }
  };
  
  /**
   * Enqueue a request to be executed when rate limits allow
   */
  enqueue<T>(endpoint: string, executeRequest: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Determine priority and retry settings based on endpoint
      const config = this.getEndpointConfig(endpoint);
      
      // Create queued request object
      const queuedRequest: QueuedRequest = {
        execute: executeRequest,
        resolve,
        reject,
        priority: config.priority,
        endpoint,
        retryCount: 0,
        maxRetries: config.maxRetries,
        retryDelay: 1000 // Start with 1 second delay, will increase exponentially
      };
      
      // Add to queue and sort by priority (higher numbers = higher priority)
      this.queue.push(queuedRequest);
      this.queue.sort((a, b) => b.priority - a.priority);
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process the queue of requests at a controlled rate
   */
  private async processQueue() {
    if (this.queue.length === 0 || this.processing) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      // If we've reached max concurrent requests, wait for some to complete
      if (this.concurrentRequests >= this.maxConcurrentRequests) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      
      // Calculate time to wait before next request to maintain rate limit
      const now = Date.now();
      const timeToWait = Math.max(0, this.lastRequestTime + this.minRequestInterval - now);
      
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
      
      // Get next request from queue
      const request = this.queue.shift();
      if (!request) continue;
      
      // Update last request time and increment concurrent count
      this.lastRequestTime = Date.now();
      this.concurrentRequests++;
      
      // Execute the request
      this.executeRequest(request).finally(() => {
        this.concurrentRequests--;
      });
    }
    
    this.processing = false;
  }
  
  /**
   * Execute a request with retry logic
   */
  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error: any) {
      // Check if error is a 429 Too Many Requests
      const is429Error = error?.response?.status === 429;
      
      // Get retry-after header if available
      let retryAfter = 0;
      if (is429Error && error?.response?.headers?.['retry-after']) {
        retryAfter = parseInt(error.response.headers['retry-after']) * 1000;
      }
      
      // Determine if we should retry
      if (is429Error && request.retryCount < request.maxRetries) {
        // Calculate backoff delay (exponential with jitter)
        const exponentialDelay = request.retryDelay * Math.pow(2, request.retryCount);
        const jitter = Math.random() * 1000;
        const delay = Math.max(retryAfter, exponentialDelay) + jitter;
        
        console.warn(
          `Rate limit exceeded for ${request.endpoint}. Retrying in ${Math.round(delay / 1000)}s ` +
          `(retry ${request.retryCount + 1}/${request.maxRetries})`
        );
        
        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increment retry count and requeue
        request.retryCount++;
        this.queue.unshift(request);
        this.processQueue();
      } else {
        // Max retries reached or not a 429 error, reject the promise
        request.reject(error);
      }
    }
  }
  
  /**
   * Get configuration for an endpoint
   */
  private getEndpointConfig(endpoint: string): { priority: number; maxRetries: number } {
    // Find the matching endpoint config
    const matchingEndpoint = Object.keys(this.endpointConfigs)
      .find(key => endpoint.includes(key) && key !== 'default');
    
    return matchingEndpoint 
      ? this.endpointConfigs[matchingEndpoint] 
      : this.endpointConfigs.default;
  }
  
  /**
   * Update rate limiter configuration
   */
  configure(options: {
    maxConcurrentRequests?: number;
    requestsPerSecond?: number;
    endpointConfigs?: Record<string, { priority: number; maxRetries: number }>;
  }) {
    if (options.maxConcurrentRequests) {
      this.maxConcurrentRequests = options.maxConcurrentRequests;
    }
    
    if (options.requestsPerSecond) {
      this.requestsPerSecond = options.requestsPerSecond;
      this.minRequestInterval = 1000 / this.requestsPerSecond;
    }
    
    if (options.endpointConfigs) {
      this.endpointConfigs = {
        ...this.endpointConfigs,
        ...options.endpointConfigs
      };
    }
  }
}

// Create and export a singleton instance
export const apiRateLimiter = new ApiRateLimiter();
