import { query } from '../config/database';

export interface VatDeductibleExpense {
  id?: number;
  store_id: number;
  description: string;
  amount: number;
  expense_date: string;
  created_at?: string;
  updated_at?: string;
}

class VatDeductibleExpenseModel {
  /**
   * Create vat_deductible_expenses table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS vat_deductible_expenses (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES woocommerce_stores(id) ON DELETE CASCADE
      );
    `;

    const createTriggerQuery = `
      -- Create function if it doesn't exist
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $BODY$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $BODY$ LANGUAGE plpgsql;
      
      -- Create trigger if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vat_deductible_expenses_timestamp') THEN
          CREATE TRIGGER update_vat_deductible_expenses_timestamp
          BEFORE UPDATE ON vat_deductible_expenses
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        END IF;
      END
      $$;
    `;

    try {
      // Create the table
      await query(createTableQuery);
      
      // Create the trigger
      try {
        await query(createTriggerQuery);
      } catch (triggerError) {
        console.error('Error creating trigger (non-critical):', triggerError);
        // Continue even if trigger creation fails
      }
      
      console.log('VAT deductible expenses table created or already exists');
    } catch (error) {
      console.error('Error creating VAT deductible expenses table:', error);
      throw error;
    }
  }

  /**
   * Get all VAT deductible expenses
   */
  async getAll(): Promise<VatDeductibleExpense[]> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vat_deductible_expenses'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('VAT deductible expenses table does not exist, creating it...');
        await this.createTable();
        return [];
      }
      
      const result = await query('SELECT * FROM vat_deductible_expenses ORDER BY expense_date DESC');
      return result as VatDeductibleExpense[];
    } catch (error) {
      console.error('Error getting VAT deductible expenses:', error);
      return [];
    }
  }

  /**
   * Get VAT deductible expenses by store ID
   */
  async getByStoreId(storeId: number): Promise<VatDeductibleExpense[]> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vat_deductible_expenses'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('VAT deductible expenses table does not exist, creating it...');
        await this.createTable();
        return [];
      }
      
      const result = await query(
        'SELECT * FROM vat_deductible_expenses WHERE store_id = $1 ORDER BY expense_date DESC',
        [storeId]
      );
      return result as VatDeductibleExpense[];
    } catch (error) {
      console.error(`Error getting VAT deductible expenses for store ${storeId}:`, error);
      return [];
    }
  }

  /**
   * Get VAT deductible expenses by store ID and date range
   */
  async getByStoreIdAndDateRange(
    storeId: number,
    startDate: string,
    endDate: string
  ): Promise<VatDeductibleExpense[]> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vat_deductible_expenses'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('VAT deductible expenses table does not exist, creating it...');
        await this.createTable();
        return [];
      }
      
      const result = await query(
        'SELECT * FROM vat_deductible_expenses WHERE store_id = $1 AND expense_date BETWEEN $2 AND $3 ORDER BY expense_date',
        [storeId, startDate, endDate]
      );
      return result as VatDeductibleExpense[];
    } catch (error) {
      console.error(`Error getting VAT deductible expenses for store ${storeId} in date range:`, error);
      return [];
    }
  }

  /**
   * Get VAT deductible expense by ID
   */
  async getById(id: number): Promise<VatDeductibleExpense | null> {
    try {
      const result = await query('SELECT * FROM vat_deductible_expenses WHERE id = $1', [id]);
      
      if (result && result.length > 0) {
        return result[0] as VatDeductibleExpense;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting VAT deductible expense with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new VAT deductible expense
   */
  async create(expense: VatDeductibleExpense): Promise<number> {
    try {
      console.log('Creating VAT deductible expense with data:', JSON.stringify(expense, null, 2));
      
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vat_deductible_expenses'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      console.log('Table exists check result:', tableExists);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('VAT deductible expenses table does not exist, creating it...');
        await this.createTable();
      }
      
      // Check if store exists
      console.log('Checking if store with ID', expense.store_id, 'exists...');
      const storeExistsQuery = `
        SELECT EXISTS (
          SELECT FROM woocommerce_stores 
          WHERE id = $1
        );
      `;
      
      const storeExists = await query(storeExistsQuery, [expense.store_id]);
      console.log('Store exists check result:', storeExists);
      
      if (!storeExists || !storeExists[0] || !storeExists[0].exists) {
        console.error(`Store with ID ${expense.store_id} does not exist!`);
        throw new Error(`Store with ID ${expense.store_id} does not exist!`);
      }
      
      console.log('Inserting expense with values:', {
        store_id: expense.store_id,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expense_date
      });
      
      const result = await query(
        `INSERT INTO vat_deductible_expenses (store_id, description, amount, expense_date)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          expense.store_id,
          expense.description,
          expense.amount,
          expense.expense_date
        ]
      );
      
      console.log('Insert query result:', JSON.stringify(result, null, 2));
      
      // Handle different result formats
      if (result && result.rows && result.rows.length > 0) {
        // PostgreSQL client format
        console.log('Successfully created VAT deductible expense with ID:', result.rows[0].id);
        return result.rows[0].id;
      } else if (result && result.length > 0) {
        // Our modified format (array of rows)
        console.log('Successfully created VAT deductible expense with ID:', result[0].id);
        return result[0].id;
      } else if (result && typeof result === 'object' && 'rowCount' in result && result.rowCount > 0) {
        // It's a result object but we need to extract the ID
        if (result.rows && result.rows.length > 0) {
          console.log('Successfully created VAT deductible expense with ID (from rowCount):', result.rows[0].id);
          return result.rows[0].id;
        }
      }
      
      console.error('Failed to create VAT deductible expense: No ID returned', result);
      throw new Error('Failed to create VAT deductible expense: No ID returned');
    } catch (error) {
      console.error('Error creating VAT deductible expense:', error);
      throw error;
    }
  }

  /**
   * Update an existing VAT deductible expense
   */
  async update(id: number, expense: Partial<VatDeductibleExpense>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (expense.store_id !== undefined) {
        fields.push(`store_id = $${paramIndex++}`);
        values.push(expense.store_id);
      }
      
      if (expense.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(expense.description);
      }
      
      if (expense.amount !== undefined) {
        fields.push(`amount = $${paramIndex++}`);
        values.push(expense.amount);
      }
      
      if (expense.expense_date !== undefined) {
        fields.push(`expense_date = $${paramIndex++}`);
        values.push(expense.expense_date);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const sql = `UPDATE vat_deductible_expenses SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      const result = await query(sql, values);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating VAT deductible expense with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete a VAT deductible expense
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query('DELETE FROM vat_deductible_expenses WHERE id = $1', [id]);
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting VAT deductible expense with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Get total VAT deductible expenses for a store in a date range
   */
  async getTotalByStoreIdAndDateRange(
    storeId: number,
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vat_deductible_expenses'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('VAT deductible expenses table does not exist, creating it...');
        await this.createTable();
        return 0;
      }
      
      const result = await query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM vat_deductible_expenses WHERE store_id = $1 AND expense_date BETWEEN $2 AND $3',
        [storeId, startDate, endDate]
      );
      
      if (result && result.length > 0) {
        return parseFloat(result[0].total) || 0;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error getting total VAT deductible expenses for store ${storeId} in date range:`, error);
      return 0;
    }
  }
}

export const vatDeductibleExpenseModel = new VatDeductibleExpenseModel();
