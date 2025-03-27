import * as express from 'express';
import { Router } from 'express';
import { authenticate, isAdmin, isManager } from '../middleware/auth.middleware';
import { storeController } from '../controllers/store.controller';

const router: Router = express.Router();

// Get all stores
router.get('/', authenticate, storeController.getAll);

// Get store by ID
router.get('/:id', authenticate, storeController.getById);

// Create new store (admin only)
router.post('/', authenticate, isAdmin, storeController.create);

// Update store (admin only)
router.put('/:id', authenticate, isAdmin, storeController.update);

// Delete store (admin only)
router.delete('/:id', authenticate, isAdmin, storeController.delete);

// Sync store products (admin or manager)
router.post('/:id/sync', authenticate, isManager, storeController.syncStore);

// Get store statuses
router.get('/:id/statuses', authenticate, storeController.getStoreStatuses);

// Get store statistics
router.get('/:id/stats', authenticate, storeController.getStoreStats);

export default router;
