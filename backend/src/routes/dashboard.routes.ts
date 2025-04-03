import express, { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { dashboardController } from '../controllers/dashboard.controller';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Dashboard routes
router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/recent-orders', dashboardController.getRecentOrders.bind(dashboardController));
router.get('/upcoming-tasks', dashboardController.getUpcomingTasks.bind(dashboardController));

export default router;
