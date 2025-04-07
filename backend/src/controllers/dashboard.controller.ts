import { Request, Response } from 'express';
import { calendarEventModel } from '../models/calendar-event.model';

/**
 * Dashboard controller
 */
class DashboardController {
  /**
   * Get upcoming tasks for the dashboard
   */
  async getUpcomingTasks(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      // Get upcoming events from the calendar model
      let events = await calendarEventModel.getUpcoming(limit);
      
      // Filter by user ID if provided
      if (userId) {
        events = events.filter(event => event.user_id === userId);
      }
      
      // Map database fields to frontend fields
      const tasks = events.map(event => {
        // Extract date and time from start_time for frontend compatibility
        const startDate = new Date(event.start_time);
        const date = startDate.toISOString().split('T')[0];
        const time = startDate.toTimeString().split(' ')[0].substring(0, 5);
        
        return {
          id: event.id,
          title: event.title,
          date: date,
          time: time,
          type: event.type,
          description: event.description,
          completed: event.is_completed,
          userId: event.user_id,
          priority: event.priority
        };
      });
      
      res.status(200).json({
        success: true,
        message: 'Upcoming tasks retrieved successfully',
        tasks: tasks
      });
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve upcoming tasks',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get dashboard statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      // This is a placeholder for future implementation
      // In a real implementation, you would fetch actual statistics from various models
      
      const stats = {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalCustomers: 0,
      };
      
      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        stats: stats
      });
    } catch (error) {
      console.error('Error getting dashboard statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get recent orders for the dashboard
   */
  async getRecentOrders(req: Request, res: Response): Promise<void> {
    try {
      // This is a placeholder for future implementation
      // In a real implementation, you would fetch recent orders from the order model
      
      const recentOrders = [];
      
      res.status(200).json({
        success: true,
        message: 'Recent orders retrieved successfully',
        orders: recentOrders
      });
    } catch (error) {
      console.error('Error getting recent orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent orders',
        error: (error as Error).message
      });
    }
  }
}

export const dashboardController = new DashboardController();
