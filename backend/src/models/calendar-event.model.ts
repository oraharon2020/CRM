import { query } from '../config/database';

export interface CalendarEvent {
  id?: number;
  title: string;
  start_time: Date | string;
  end_time?: Date | string;
  type: 'meeting' | 'task' | 'reminder';
  description: string;
  is_completed: boolean;
  user_id?: number;
  customer_id?: number;
  order_id?: number;
  priority?: 'low' | 'medium' | 'high';
  created_at?: Date | string;
  updated_at?: Date | string;
}

class CalendarEventModel {
  /**
   * Create calendar_events table if it doesn't exist
   */
  async createTable(): Promise<void> {
    // First create the event_type enum type if it doesn't exist
    const createEventTypeEnumQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
          CREATE TYPE event_type AS ENUM ('meeting', 'task', 'reminder');
        END IF;
      END
      $$;
    `;

    // Create priority_level enum type if it doesn't exist
    const createPriorityLevelEnumQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
          CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
        END IF;
      END
      $$;
    `;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        type event_type NOT NULL,
        description TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        user_id INT,
        customer_id INT,
        order_id INT,
        priority priority_level DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      );
    `;

    const createTriggerQuery = `
      -- Create trigger for updated_at if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calendar_events_timestamp') THEN
          CREATE TRIGGER update_calendar_events_timestamp
          BEFORE UPDATE ON calendar_events
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        END IF;
      END
      $$;
    `;

    try {
      // First create the enum types
      await query(createEventTypeEnumQuery);
      await query(createPriorityLevelEnumQuery);
      
      // Then create the table
      await query(createTableQuery);
      
      // Then create the trigger
      try {
        await query(createTriggerQuery);
      } catch (triggerError) {
        console.error('Error creating trigger (non-critical):', triggerError);
        // Continue even if trigger creation fails
      }
      
      console.log('Calendar events table created or already exists');
    } catch (error) {
      console.error('Error creating calendar events table:', error);
      throw error;
    }
  }

  /**
   * Get all calendar events
   */
  async getAll(): Promise<CalendarEvent[]> {
    try {
      const result = await query('SELECT * FROM calendar_events ORDER BY start_time');
      return result as CalendarEvent[];
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }

  /**
   * Get calendar events for a specific month
   */
  async getByMonth(month: number, year: number): Promise<CalendarEvent[]> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const result = await query(
        'SELECT * FROM calendar_events WHERE start_time BETWEEN $1 AND $2 ORDER BY start_time',
        [startDate, endDate]
      );
      
      return result as CalendarEvent[];
    } catch (error) {
      console.error('Error getting calendar events by month:', error);
      throw error;
    }
  }

  /**
   * Get calendar events for a specific date
   */
  async getByDate(date: string): Promise<CalendarEvent[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const result = await query(
        'SELECT * FROM calendar_events WHERE start_time BETWEEN $1 AND $2 ORDER BY start_time',
        [startOfDay, endOfDay]
      );
      
      return result as CalendarEvent[];
    } catch (error) {
      console.error('Error getting calendar events by date:', error);
      throw error;
    }
  }

  /**
   * Get calendar event by ID
   */
  async getById(id: number): Promise<CalendarEvent | null> {
    try {
      const result = await query('SELECT * FROM calendar_events WHERE id = $1', [id]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as CalendarEvent;
    } catch (error) {
      console.error(`Error getting calendar event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new calendar event
   */
  async create(event: CalendarEvent): Promise<number> {
    try {
      const result = await query(
        `INSERT INTO calendar_events (title, start_time, end_time, type, description, is_completed, user_id, customer_id, order_id, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          event.title,
          event.start_time,
          event.end_time,
          event.type,
          event.description,
          event.is_completed,
          event.user_id,
          event.customer_id,
          event.order_id,
          event.priority || 'medium'
        ]
      );
      
      return result[0].id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an existing calendar event
   */
  async update(id: number, event: Partial<CalendarEvent>): Promise<boolean> {
    try {
      console.log('CalendarEventModel.update called with id:', id);
      console.log('Update data:', event);
      
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (event.title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(event.title);
      }
      
      if (event.start_time !== undefined) {
        fields.push(`start_time = $${paramIndex++}`);
        values.push(event.start_time);
      }
      
      if (event.end_time !== undefined) {
        fields.push(`end_time = $${paramIndex++}`);
        values.push(event.end_time);
      }
      
      if (event.type !== undefined) {
        fields.push(`type = $${paramIndex++}`);
        values.push(event.type);
      }
      
      if (event.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(event.description);
      }
      
      if (event.is_completed !== undefined) {
        fields.push(`is_completed = $${paramIndex++}`);
        values.push(event.is_completed);
        console.log('Setting is_completed in SQL to:', event.is_completed);
      }
      
      if (event.user_id !== undefined) {
        fields.push(`user_id = $${paramIndex++}`);
        values.push(event.user_id);
      }
      
      if (event.customer_id !== undefined) {
        fields.push(`customer_id = $${paramIndex++}`);
        values.push(event.customer_id);
      }
      
      if (event.order_id !== undefined) {
        fields.push(`order_id = $${paramIndex++}`);
        values.push(event.order_id);
      }
      
      if (event.priority !== undefined) {
        fields.push(`priority = $${paramIndex++}`);
        values.push(event.priority);
      }
      
      if (fields.length === 0) {
        console.log('No fields to update');
        return false;
      }
      
      const sql = `UPDATE calendar_events SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      console.log('SQL:', sql);
      console.log('Values:', values);
      
      const result = await query(sql, values);
      console.log('Update result:', result);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating calendar event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a calendar event
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query('DELETE FROM calendar_events WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting calendar event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark a calendar event as completed
   */
  async markAsCompleted(id: number): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE calendar_events SET is_completed = TRUE WHERE id = $1',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error marking calendar event with ID ${id} as completed:`, error);
      throw error;
    }
  }

  /**
   * Get upcoming calendar events
   */
  async getUpcoming(limit: number = 5): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      
      const result = await query(
        `SELECT * FROM calendar_events 
         WHERE start_time >= $1 AND is_completed = FALSE 
         ORDER BY start_time 
         LIMIT $2`,
        [now, limit]
      );
      
      return result as CalendarEvent[];
    } catch (error) {
      console.error('Error getting upcoming calendar events:', error);
      throw error;
    }
  }

  /**
   * Get calendar events for a specific user
   */
  async getByUserId(userId: number): Promise<CalendarEvent[]> {
    try {
      const result = await query(
        'SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY start_time',
        [userId]
      );
      
      return result as CalendarEvent[];
    } catch (error) {
      console.error(`Error getting calendar events for user with ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get calendar events for a specific customer
   */
  async getByCustomerId(customerId: number): Promise<CalendarEvent[]> {
    try {
      const result = await query(
        'SELECT * FROM calendar_events WHERE customer_id = $1 ORDER BY start_time',
        [customerId]
      );
      
      return result as CalendarEvent[];
    } catch (error) {
      console.error(`Error getting calendar events for customer with ID ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Get calendar events for a specific order
   */
  async getByOrderId(orderId: number): Promise<CalendarEvent[]> {
    try {
      const result = await query(
        'SELECT * FROM calendar_events WHERE order_id = $1 ORDER BY start_time',
        [orderId]
      );
      
      return result as CalendarEvent[];
    } catch (error) {
      console.error(`Error getting calendar events for order with ID ${orderId}:`, error);
      throw error;
    }
  }
}

export const calendarEventModel = new CalendarEventModel();
