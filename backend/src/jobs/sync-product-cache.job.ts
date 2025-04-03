import productCacheService from '../services/product-cache.service';
import { CronJob } from 'cron';

// Extend the CronJob type to include the running property
interface ExtendedCronJob extends CronJob {
  running: boolean;
}

/**
 * Job to sync product cache for all stores
 * Runs every day at 3:00 AM
 */
export const syncProductCacheJob = new CronJob<null, null>(
  '0 3 * * *', // Cron expression: At 03:00 every day
  async function() {
    console.log('Running scheduled job: Sync product cache for all stores');
    
    try {
      await productCacheService.syncAllStores();
      console.log('Scheduled product cache sync completed successfully');
    } catch (error) {
      console.error('Error in scheduled product cache sync:', error);
    }
  },
  null, // onComplete
  false, // start
  'Asia/Jerusalem' // timezone
);

/**
 * Start the sync product cache job
 */
export function startSyncProductCacheJob() {
  if (!(syncProductCacheJob as ExtendedCronJob).running) {
    syncProductCacheJob.start();
    console.log('Sync product cache job started');
    
    // Log next run time
    const nextRun = syncProductCacheJob.nextDate();
    console.log(`Next sync product cache job run: ${nextRun.toLocaleString()}`);
  } else {
    console.log('Sync product cache job is already running');
  }
}

/**
 * Stop the sync product cache job
 */
export function stopSyncProductCacheJob() {
  if ((syncProductCacheJob as ExtendedCronJob).running) {
    syncProductCacheJob.stop();
    console.log('Sync product cache job stopped');
  } else {
    console.log('Sync product cache job is not running');
  }
}

export default {
  syncProductCacheJob,
  startSyncProductCacheJob,
  stopSyncProductCacheJob
};
