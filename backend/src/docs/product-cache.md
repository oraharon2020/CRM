# Product Cache System

The product cache system is designed to improve performance and reduce API calls to WooCommerce by caching product performance data. This document explains how the cache system works and how to use it.

## Overview

The product cache system stores product performance data (sales, revenue, etc.) in a local database to avoid making repeated API calls to WooCommerce. This is especially useful for analytics and reporting features that need to access product data frequently.

## Key Features

- **Automatic Caching**: Product data is automatically cached when requested for the first time.
- **Incremental Updates**: The system can perform incremental updates to add new data without replacing the entire cache.
- **Configurable TTL**: The cache has a configurable Time-To-Live (TTL) setting that determines how long cached data is considered fresh.
- **Scheduled Sync**: A scheduled job runs daily to keep the cache up-to-date.
- **Admin UI**: Administrators can manage the cache through the Analytics page.

## Components

### Backend

1. **Product Cache Model** (`product-cache.model.ts`):
   - Manages the database tables for storing cached product data.
   - Provides methods for saving, updating, and retrieving cached data.
   - Handles cache freshness checks and configuration.

2. **Product Cache Service** (`product-cache.service.ts`):
   - Provides high-level methods for interacting with the cache.
   - Implements request queuing to prevent overwhelming the WooCommerce API.
   - Handles retry logic with exponential backoff.

3. **Analytics Controller** (`analytics.controller.ts`):
   - Exposes REST API endpoints for managing the cache.
   - Provides endpoints for syncing, clearing, and configuring the cache.

4. **Scheduled Job** (`sync-product-cache.job.ts`):
   - Runs daily at 3:00 AM to sync the cache for all stores.
   - Uses the cron package to schedule the job.

### Frontend

1. **Cache Manager Component** (`CacheManager.tsx`):
   - Provides a UI for administrators to manage the cache.
   - Displays cache statistics and allows manual sync operations.
   - Allows configuration of cache TTL and sync frequency.

## API Endpoints

The following API endpoints are available for managing the cache:

- `GET /api/analytics/stores/:storeId/cache/stats`: Get cache statistics for a store.
- `GET /api/analytics/stores/:storeId/cache/config`: Get cache configuration for a store.
- `PUT /api/analytics/stores/:storeId/cache/config`: Update cache configuration for a store.
- `POST /api/analytics/stores/:storeId/cache/sync`: Perform a full sync of the cache for a store.
- `POST /api/analytics/stores/:storeId/cache/incremental`: Perform an incremental update of the cache for a store.
- `POST /api/analytics/cache/sync-all`: Sync the cache for all stores.
- `DELETE /api/analytics/stores/:storeId/cache`: Clear the cache for a store.

## Database Schema

The cache system uses two tables:

1. **product_cache**: Stores the cached product data.
   - `id`: Primary key.
   - `store_id`: ID of the store the product belongs to.
   - `product_id`: ID of the product.
   - `name`: Name of the product.
   - `sku`: SKU of the product.
   - `quantity`: Quantity sold.
   - `revenue`: Revenue generated.
   - `last_updated`: Timestamp of the last update.
   - `created_at`: Timestamp of when the record was created.

2. **product_cache_config**: Stores the cache configuration for each store.
   - `id`: Primary key.
   - `store_id`: ID of the store.
   - `cache_ttl_hours`: Time-to-live in hours for the cache.
   - `sync_frequency_hours`: Frequency of full syncs in hours.
   - `last_full_sync`: Timestamp of the last full sync.
   - `last_incremental_sync`: Timestamp of the last incremental update.
   - `created_at`: Timestamp of when the record was created.
   - `updated_at`: Timestamp of the last update.

## Usage

### Automatic Caching

The cache is automatically used when requesting product performance data through the Analytics API. If the cache is fresh, the cached data is returned. If the cache is stale, a background sync is initiated and the current cache is returned.

### Manual Management

Administrators can manage the cache through the Cache Manager component on the Analytics page. The component provides the following features:

- **Cache Statistics**: View the number of products in the cache, cache freshness, and last sync time.
- **Manual Sync**: Trigger a full sync or incremental update manually.
- **Clear Cache**: Clear the cache for a store.
- **Configure Cache**: Set the TTL and sync frequency for the cache.

## Best Practices

1. **Set Appropriate TTL**: Set the cache TTL based on how frequently your product data changes. For most stores, 72 hours (3 days) is a good default.

2. **Use Incremental Updates**: For frequent updates, use incremental updates instead of full syncs to reduce API calls.

3. **Monitor Cache Freshness**: Keep an eye on the cache freshness percentage to ensure your data is up-to-date.

4. **Schedule Syncs During Off-Hours**: The scheduled sync job runs at 3:00 AM by default to minimize impact on system performance during business hours.

## Troubleshooting

If you encounter issues with the cache system, try the following:

1. **Clear the Cache**: Clear the cache for the affected store and perform a full sync.

2. **Check API Limits**: If you're hitting rate limits with the WooCommerce API, increase the sync frequency to spread out API calls.

3. **Check Logs**: Check the server logs for errors related to the cache system.

4. **Verify Database**: Ensure the product_cache and product_cache_config tables exist and have the correct schema.

## Future Improvements

Potential future improvements to the cache system include:

1. **Selective Caching**: Allow caching specific products or categories.

2. **Cache Preloading**: Preload the cache with frequently accessed products.

3. **Cache Invalidation**: Implement more sophisticated cache invalidation strategies.

4. **Performance Metrics**: Add more detailed performance metrics for the cache system.
