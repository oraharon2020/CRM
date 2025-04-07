import { Request, Response } from 'express';
import { calendarEventModel, CalendarEvent } from '../models/calendar-event.model';
import { jewishHolidaysService } from '../services/jewish-holidays.service';

/**
 * Calendar controller
 */
class CalendarController {
  /**
   * Get calendar events for a specific month
   */
  async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      // Get events for the month
      const events = await calendarEventModel.getByMonth(month, year);
      
      // Map database fields to frontend fields
      const mappedEvents = events.map(event => {
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
        message: 'Calendar events retrieved successfully',
        data: {
          month,
          year,
          events: mappedEvents
        }
      });
    } catch (error) {
      console.error('Error getting calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve calendar events',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get calendar event by ID
   */
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      
      // Get event by ID
      const event = await calendarEventModel.getById(eventId);
      
      if (!event) {
        res.status(404).json({
          success: false,
          message: `Event with ID ${eventId} not found`
        });
        return;
      }
      
      // Map database fields to frontend fields
      // Extract date and time from start_time for frontend compatibility
      const startDate = new Date(event.start_time);
      const eventDate = startDate.toISOString().split('T')[0];
      const eventTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
      
      const mappedEvent = {
        id: event.id,
        title: event.title,
        date: eventDate,
        time: eventTime,
        type: event.type,
        description: event.description,
        completed: event.is_completed,
        userId: event.user_id,
        priority: event.priority
      };
      
      res.status(200).json({
        success: true,
        message: 'Event retrieved successfully',
        data: mappedEvent
      });
    } catch (error) {
      console.error(`Error getting calendar event with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve calendar event',
        error: (error as Error).message
      });
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const { title, date, time, type, description, userId, priority, completed } = req.body;
      
      console.log('Create event request:', req.body);
      
      // Validate input
      if (!title || !date || !time || !type) {
        res.status(400).json({
          success: false,
          message: 'Please provide title, date, time and type'
        });
        return;
      }
      
      // Create event
      // Convert date and time to start_time and end_time
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // Default to 1 hour duration
      
      const event: CalendarEvent = {
        title,
        start_time: startTime,
        end_time: endTime,
        type,
        description: description || '',
        is_completed: completed || false,
        user_id: userId,
        priority: priority || 'medium'
      };
      
      console.log('Creating event with data:', event);
      
      let eventId: number;
      let createdEvent: CalendarEvent | null = null;
      
      try {
        eventId = await calendarEventModel.create(event);
        
        // Get the created event
        createdEvent = await calendarEventModel.getById(eventId);
        
        if (!createdEvent) {
          res.status(500).json({
            success: false,
            message: 'Failed to retrieve created event'
          });
          return;
        }
        
        // Map database fields to frontend fields
        // Extract date and time from start_time for frontend compatibility
        const startDate = new Date(createdEvent.start_time);
        const eventDate = startDate.toISOString().split('T')[0];
        const eventTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
        
        const mappedEvent = {
          id: createdEvent.id,
          title: createdEvent.title,
          date: eventDate,
          time: eventTime,
          type: createdEvent.type,
          description: createdEvent.description,
          completed: createdEvent.is_completed,
          userId: createdEvent.user_id,
          priority: createdEvent.priority,
          created_by: req.user?.name || 'System',
          created_at: createdEvent.created_at
        };
        
        res.status(201).json({
          success: true,
          message: 'Event created successfully',
          data: mappedEvent
        });
      } catch (createError) {
        console.error('Error in calendarEventModel.create:', createError);
        res.status(500).json({
          success: false,
          message: 'Error creating calendar event',
          error: (createError as Error).message
        });
        return;
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create calendar event',
        error: (error as Error).message
      });
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      const { title, date, time, type, description, completed, is_completed, userId, priority } = req.body;
      
      console.log('Update event request:', req.body);
      console.log('Event ID:', eventId);
      
      // Check if event exists
      const existingEvent = await calendarEventModel.getById(eventId);
      
      if (!existingEvent) {
        console.log(`Event with ID ${eventId} not found`);
        res.status(404).json({
          success: false,
          message: `Event with ID ${eventId} not found`
        });
        return;
      }
      
      console.log('Existing event:', existingEvent);
      
      // Update event
      const event: Partial<CalendarEvent> = {};
      
      // Handle completion status from either completed or is_completed field
      const completionStatus = is_completed !== undefined ? is_completed : completed;
      
      // Only update the is_completed field if we're toggling completion status
      if (completionStatus !== undefined) {
        console.log('Setting is_completed to:', completionStatus);
        event.is_completed = completionStatus;
      }
      
      // Update other fields
      if (title !== undefined) event.title = title;
      if (type !== undefined) event.type = type;
      if (description !== undefined) event.description = description;
      if (userId !== undefined) event.user_id = userId;
      if (priority !== undefined) event.priority = priority;
      
      // Convert date and time to start_time if either is provided
      if (date !== undefined || time !== undefined) {
        // Get current values if not provided
        const currentDate = date || new Date(existingEvent.start_time).toISOString().split('T')[0];
        const currentTime = time || new Date(existingEvent.start_time).toTimeString().split(' ')[0].substring(0, 5);
        
        // Create new start_time
        const startTime = new Date(`${currentDate}T${currentTime}`);
        event.start_time = startTime;
        
        // Update end_time to be 1 hour after start_time if it exists
        if (existingEvent.end_time) {
          const endTime = new Date(startTime);
          const currentDuration = new Date(existingEvent.end_time).getTime() - new Date(existingEvent.start_time).getTime();
          endTime.setTime(startTime.getTime() + currentDuration);
          event.end_time = endTime;
        }
      }
      
      console.log('Update object:', event);
      
      try {
        const success = await calendarEventModel.update(eventId, event);
        console.log('Update result:', success);
        
        if (!success) {
          console.log('Failed to update calendar event');
          res.status(500).json({
            success: false,
            message: 'Failed to update calendar event'
          });
          return;
        }
      } catch (updateError) {
        console.error('Error in calendarEventModel.update:', updateError);
        res.status(500).json({
          success: false,
          message: 'Error updating calendar event',
          error: (updateError as Error).message
        });
        return;
      }
      
      // Get the updated event
      const updatedEvent = await calendarEventModel.getById(eventId);
      
      if (!updatedEvent) {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve updated event'
        });
        return;
      }
      
      // Map database fields to frontend fields
      // Extract date and time from start_time for frontend compatibility
      const startDate = new Date(updatedEvent.start_time);
      const eventDate = startDate.toISOString().split('T')[0];
      const eventTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
      
      const mappedEvent = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        date: eventDate,
        time: eventTime,
        type: updatedEvent.type,
        description: updatedEvent.description,
        completed: updatedEvent.is_completed,
        userId: updatedEvent.user_id,
        priority: updatedEvent.priority,
        updated_by: req.user?.name || 'System',
        updated_at: updatedEvent.updated_at
      };
      
      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: mappedEvent
      });
    } catch (error) {
      console.error(`Error updating calendar event with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update calendar event',
        error: (error as Error).message
      });
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      
      // Check if event exists
      const existingEvent = await calendarEventModel.getById(eventId);
      
      if (!existingEvent) {
        res.status(404).json({
          success: false,
          message: `Event with ID ${eventId} not found`
        });
        return;
      }
      
      // Delete event
      const success = await calendarEventModel.delete(eventId);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete calendar event'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting calendar event with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete calendar event',
        error: (error as Error).message
      });
    }
  }

  /**
   * Mark a calendar event as completed
   */
  async markEventAsCompleted(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.id);
      
      // Check if event exists
      const existingEvent = await calendarEventModel.getById(eventId);
      
      if (!existingEvent) {
        res.status(404).json({
          success: false,
          message: `Event with ID ${eventId} not found`
        });
        return;
      }
      
      // Mark event as completed
      const success = await calendarEventModel.markAsCompleted(eventId);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to mark calendar event as completed'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Event marked as completed',
        data: {
          id: eventId,
          completed: true,
          completed_by: req.user?.name || 'System',
          completed_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Error marking calendar event with ID ${req.params.id} as completed:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark calendar event as completed',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get upcoming calendar events
   */
  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      
      // Get upcoming events
      const events = await calendarEventModel.getUpcoming(limit);
      
      // Map database fields to frontend fields
      const mappedEvents = events.map(event => {
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
          userId: event.user_id,
          priority: event.priority
        };
      });
      
      res.status(200).json({
        success: true,
        message: 'Upcoming events retrieved successfully',
        data: mappedEvents
      });
    } catch (error) {
      console.error('Error getting upcoming calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve upcoming calendar events',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get Jewish holidays for a specific month
   */
  async getJewishHolidays(req: Request, res: Response): Promise<void> {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      // Create date range for the requested month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      // Get holidays for the date range
      const holidays = await jewishHolidaysService.getHolidaysForDateRange(startDate, endDate);
      
      res.status(200).json({
        success: true,
        message: 'Jewish holidays retrieved successfully',
        data: {
          month,
          year,
          holidays
        }
      });
    } catch (error) {
      console.error('Error fetching Jewish holidays:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Jewish holidays',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get upcoming Jewish holidays
   */
  async getUpcomingJewishHolidays(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      
      // Get upcoming holidays
      const holidays = await jewishHolidaysService.getUpcomingHolidays(limit);
      
      res.status(200).json({
        success: true,
        message: 'Upcoming Jewish holidays retrieved successfully',
        data: holidays
      });
    } catch (error) {
      console.error('Error fetching upcoming Jewish holidays:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve upcoming Jewish holidays',
        error: (error as Error).message
      });
    }
  }
}

export const calendarController = new CalendarController();
