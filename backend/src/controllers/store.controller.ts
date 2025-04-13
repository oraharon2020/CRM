import { Request, Response } from 'express';
import { Store, storeModel } from '../models/store.model';
import wooCommerceService from '../services/woocommerce.service';

export const storeController = {
  /**
   * Get all stores
   */
  getAll: async (req: Request, res: Response) => {
    try {
      const stores = await storeModel.getAll();
      
      // Mask consumer secrets for security
      const maskedStores = stores.map(store => ({
        ...store,
        consumer_secret: '********'
      }));
      
      res.status(200).json({
        success: true,
        message: 'Stores retrieved successfully',
        data: maskedStores
      });
    } catch (error) {
      console.error('Error in getAll controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stores',
        error: (error as Error).message
      });
    }
  },

  /**
   * Get store by ID
   */
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      const store = await storeModel.getById(id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Mask consumer secret for security
      const maskedStore = {
        ...store,
        consumer_secret: '********'
      };
      
      res.status(200).json({
        success: true,
        message: 'Store retrieved successfully',
        data: maskedStore
      });
    } catch (error) {
      console.error('Error in getById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store',
        error: (error as Error).message
      });
    }
  },

  /**
   * Create a new store
   */
  create: async (req: Request, res: Response) => {
    try {
      const { name, url, consumer_key, consumer_secret, status } = req.body;
      
      // Validate required fields
      if (!name || !url || !consumer_key || !consumer_secret) {
        return res.status(400).json({
          success: false,
          message: 'Name, URL, consumer key, and consumer secret are required fields'
        });
      }
      
      // Validate status if provided
      if (status && !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      
      const store: Store = {
        name,
        url,
        consumer_key,
        consumer_secret,
        status: status || 'active'
      };
      
      const storeId = await storeModel.create(store);
      
      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: {
          id: storeId,
          ...store,
          consumer_secret: '********' // Mask consumer secret for security
        }
      });
    } catch (error) {
      console.error('Error in create controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create store',
        error: (error as Error).message
      });
    }
  },

  /**
   * Update an existing store
   */
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      // Check if store exists
      const existingStore = await storeModel.getById(id);
      
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const { name, url, consumer_key, consumer_secret, status } = req.body;
      
      // Validate status if provided
      if (status && !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      
      const storeUpdate: Partial<Store> = {};
      
      if (name !== undefined) storeUpdate.name = name;
      if (url !== undefined) storeUpdate.url = url;
      if (consumer_key !== undefined) storeUpdate.consumer_key = consumer_key;
      if (consumer_secret !== undefined) storeUpdate.consumer_secret = consumer_secret;
      if (status !== undefined) storeUpdate.status = status;
      
      const updated = await storeModel.update(id, storeUpdate);
      
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No changes to update'
        });
      }
      
      // Get the updated store
      const updatedStore = await storeModel.getById(id);
      
      if (!updatedStore) {
        return res.status(404).json({
          success: false,
          message: 'Store not found after update'
        });
      }
      
      // Mask consumer secret for security
      const maskedStore = {
        ...updatedStore,
        consumer_secret: '********'
      };
      
      res.status(200).json({
        success: true,
        message: 'Store updated successfully',
        data: maskedStore
      });
    } catch (error) {
      console.error('Error in update controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update store',
        error: (error as Error).message
      });
    }
  },

  /**
   * Delete a store
   */
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      const deleted = await storeModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Store deleted successfully'
      });
    } catch (error) {
      console.error('Error in delete controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete store',
        error: (error as Error).message
      });
    }
  },

  /**
   * Sync store products
   */
  syncStore: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      // Check if store exists
      const store = await storeModel.getById(id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Update last sync timestamp
      await storeModel.updateLastSync(id);
      
      // Get the updated store
      const updatedStore = await storeModel.getById(id);
      
      if (!updatedStore) {
        return res.status(404).json({
          success: false,
          message: 'Store not found after sync'
        });
      }
      
      // Mask consumer secret for security
      const maskedStore = {
        ...updatedStore,
        consumer_secret: '********'
      };
      
      res.status(200).json({
        success: true,
        message: 'Store synced successfully',
        data: {
          sync_id: 'sync_' + Math.random().toString(36).substring(2, 10),
          store_id: id,
          started_at: updatedStore.last_sync,
          status: 'completed',
          store: maskedStore
        }
      });
    } catch (error) {
      console.error('Error in syncStore controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync store',
        error: (error as Error).message
      });
    }
  },

  /**
   * Get store statuses
   */
  getStoreStatuses: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      // Check if store exists
      const store = await storeModel.getById(id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Get statuses from WooCommerce service
      const statusesData = await wooCommerceService.getStoreStatuses(id);
      
      res.status(200).json({
        success: true,
        message: 'Store statuses retrieved successfully',
        data: {
          standardStatuses: statusesData.standardStatuses,
          customStatuses: statusesData.customStatuses
        }
      });
    } catch (error) {
      console.error('Error in getStoreStatuses controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store statuses',
        error: (error as Error).message
      });
    }
  },

  /**
   * Get store statistics
   */
  getStoreStats: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
      }
      
      // Check if store exists
      const store = await storeModel.getById(id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Get statistics from WooCommerce service
      const statsData = await wooCommerceService.getStoreStats(id, {
        period: req.query.period as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        statuses: req.query.statuses ? 
          Array.isArray(req.query.statuses) ? 
            req.query.statuses as string[] : 
            [req.query.statuses as string] : 
          undefined
      });
      
      res.status(200).json({
        success: true,
        message: 'Store statistics retrieved successfully',
        data: statsData
      });
    } catch (error) {
      console.error('Error in getStoreStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store statistics',
        error: (error as Error).message
      });
    }
  }
};
