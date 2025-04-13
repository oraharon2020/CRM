import express, { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

/**
 * @route   GET /api/woocommerce/stores/:storeId/products
 * @desc    Get products directly from WooCommerce (bypassing cache)
 * @access  Public (Temporarily for testing)
 */
router.get('/stores/:storeId/products', analyticsController.getProductsDirectFromWooCommerce);

export default router;
