import { pool, formatQuery } from '../config/database';

export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  notes?: string;
  assigned_to?: number;
  store_id?: number;  // Added store_id field
  created_at?: string;
  updated_at?: string;
}

export interface LeadWithUser extends Lead {
  assigned_to_name?: string;
}

class LeadModel {
  /**
   * Create leads table if it doesn't exist
   */
  async createTable(): Promise<void> {
    // First create the lead_status enum type if it doesn't exist
    const createEnumQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
          CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'closed');
        END IF;
      END
      $$;
    `;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(100) NOT NULL,
        status lead_status NOT NULL DEFAULT 'new',
        notes TEXT,
        assigned_to INT,
        store_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (store_id) REFERENCES woocommerce_stores(id) ON DELETE SET NULL
      );
    `;

    const createTriggerQuery = `
      -- Create trigger if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_timestamp') THEN
          CREATE TRIGGER update_leads_timestamp
          BEFORE UPDATE ON leads
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        END IF;
      END
      $$;
    `;

    try {
      // First create the enum type
      await pool.query(createEnumQuery);
      
      // Then create the table
      await pool.query(createTableQuery);
      
      // Then create the trigger
      try {
        await pool.query(createTriggerQuery);
      } catch (triggerError) {
        console.error('Error creating trigger (non-critical):', triggerError);
        // Continue even if trigger creation fails
      }
      
      console.log('Leads table created or already exists');
    } catch (error) {
      console.error('Error creating leads table:', error);
      throw error;
    }
  }

  /**
   * Get all leads with optional filtering
   */
  async getAll(filters: {
    status?: string;
    source?: string;
    assigned_to?: number;
    store_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<LeadWithUser[]> {
    try {
      let query = `
        SELECT l.*, u.name as assigned_to_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (filters.status) {
        query += ` AND l.status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      
      if (filters.source) {
        query += ` AND l.source = $${paramIndex++}`;
        queryParams.push(filters.source);
      }
      
      if (filters.assigned_to) {
        query += ` AND l.assigned_to = $${paramIndex++}`;
        queryParams.push(filters.assigned_to);
      }
      
      if (filters.store_id) {
        query += ` AND l.store_id = $${paramIndex++}`;
        queryParams.push(filters.store_id);
      }
      
      if (filters.search) {
        query += ` AND (l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex} OR l.notes ILIKE $${paramIndex})`;
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm);
        paramIndex++;
      }
      
      query += ' ORDER BY l.created_at DESC';
      
      if (filters.limit) {
        query += ` LIMIT $${paramIndex++}`;
        queryParams.push(filters.limit);
        
        if (filters.offset) {
          query += ` OFFSET $${paramIndex++}`;
          queryParams.push(filters.offset);
        }
      }
      
      const result = await pool.query(query, queryParams);
      return result.rows as LeadWithUser[];
    } catch (error) {
      console.error('Error getting leads:', error);
      throw error;
    }
  }

  /**
   * Get lead by ID
   */
  async getById(id: number): Promise<LeadWithUser | null> {
    try {
      const query = `
        SELECT l.*, u.name as assigned_to_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE l.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as LeadWithUser;
    } catch (error) {
      console.error(`Error getting lead with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new lead
   */
  async create(lead: Lead): Promise<number> {
    try {
      const query = `
        INSERT INTO leads (name, email, phone, source, status, notes, assigned_to, store_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        lead.name,
        lead.email,
        lead.phone,
        lead.source,
        lead.status,
        lead.notes || null,
        lead.assigned_to || null,
        lead.store_id || null
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Update an existing lead
   */
  async update(id: number, lead: Partial<Lead>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (lead.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(lead.name);
      }
      
      if (lead.email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(lead.email);
      }
      
      if (lead.phone !== undefined) {
        fields.push(`phone = $${paramIndex++}`);
        values.push(lead.phone);
      }
      
      if (lead.source !== undefined) {
        fields.push(`source = $${paramIndex++}`);
        values.push(lead.source);
      }
      
      if (lead.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(lead.status);
      }
      
      if (lead.notes !== undefined) {
        fields.push(`notes = $${paramIndex++}`);
        values.push(lead.notes);
      }
      
      if (lead.assigned_to !== undefined) {
        fields.push(`assigned_to = $${paramIndex++}`);
        values.push(lead.assigned_to);
      }
      
      if (lead.store_id !== undefined) {
        fields.push(`store_id = $${paramIndex++}`);
        values.push(lead.store_id);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const query = `UPDATE leads SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      const result = await pool.query(query, values);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating lead with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a lead
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM leads WHERE id = $1';
      
      const result = await pool.query(query, [id]);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting lead with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get lead sources statistics
   */
  async getSourceStats(): Promise<{ source: string; count: number }[]> {
    try {
      const query = `
        SELECT source, COUNT(*) as count
        FROM leads
        GROUP BY source
        ORDER BY count DESC
      `;
      
      const result = await pool.query(query);
      
      return result.rows as { source: string; count: number }[];
    } catch (error) {
      console.error('Error getting lead source statistics:', error);
      throw error;
    }
  }

  /**
   * Get lead status statistics
   */
  async getStatusStats(): Promise<{ status: string; count: number }[]> {
    try {
      const query = `
        SELECT status, COUNT(*) as count
        FROM leads
        GROUP BY status
        ORDER BY CASE 
          WHEN status = 'new' THEN 1
          WHEN status = 'contacted' THEN 2
          WHEN status = 'qualified' THEN 3
          WHEN status = 'converted' THEN 4
          WHEN status = 'closed' THEN 5
          ELSE 6
        END
      `;
      
      const result = await pool.query(query);
      
      return result.rows as { status: string; count: number }[];
    } catch (error) {
      console.error('Error getting lead status statistics:', error);
      throw error;
    }
  }

  /**
   * Import leads from array
   */
  async importLeads(leads: Lead[]): Promise<number> {
    try {
      if (leads.length === 0) {
        return 0;
      }
      
      const values = leads.map(lead => [
        lead.name,
        lead.email || null,
        lead.phone || null,
        lead.source,
        lead.status || 'new',
        lead.notes || null,
        lead.assigned_to || null,
        lead.store_id || null
      ]);
      
      // Use pg-format to safely create a multi-row insert
      const sql = formatQuery(
        `INSERT INTO leads (name, email, phone, source, status, notes, assigned_to, store_id)
         VALUES %L
         RETURNING id`,
        values
      );
      
      const result = await pool.query(sql);
      
      return result.rowCount;
    } catch (error) {
      console.error('Error importing leads:', error);
      throw error;
    }
  }
}

export const leadModel = new LeadModel();
