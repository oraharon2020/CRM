import { query } from '../config/database';

export interface EmployeeSalary {
  id?: number;
  store_id: number;
  employee_name: string;
  position?: string;
  gross_salary: number;
  employer_costs: number;
  month: number;
  year: number;
  created_at?: string;
  updated_at?: string;
}

class EmployeeSalaryModel {
  /**
   * Create employee_salaries table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS employee_salaries (
        id SERIAL PRIMARY KEY,
        store_id INTEGER NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        gross_salary DECIMAL(10, 2) NOT NULL,
        employer_costs DECIMAL(10, 2) NOT NULL,
        salary_month INTEGER NOT NULL,
        salary_year INTEGER NOT NULL,
        month VARCHAR(255) NOT NULL,
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
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employee_salaries_timestamp') THEN
          CREATE TRIGGER update_employee_salaries_timestamp
          BEFORE UPDATE ON employee_salaries
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
      
      console.log('Employee salaries table created or already exists');
    } catch (error) {
      console.error('Error creating employee salaries table:', error);
      throw error;
    }
  }

  /**
   * Get all employee salaries
   */
  async getAll(): Promise<EmployeeSalary[]> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'employee_salaries'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('Employee salaries table does not exist, creating it...');
        await this.createTable();
        return [];
      }
      
      const result = await query('SELECT * FROM employee_salaries ORDER BY salary_year DESC, salary_month DESC');
      return result as EmployeeSalary[];
    } catch (error) {
      console.error('Error getting employee salaries:', error);
      return [];
    }
  }

  /**
   * Get employee salaries by store ID
   */
  async getByStoreId(storeId: number): Promise<EmployeeSalary[]> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'employee_salaries'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('Employee salaries table does not exist, creating it...');
        await this.createTable();
        return [];
      }
      
      const result = await query(
        'SELECT * FROM employee_salaries WHERE store_id = $1 ORDER BY salary_year DESC, salary_month DESC',
        [storeId]
      );
      return result as EmployeeSalary[];
    } catch (error) {
      console.error(`Error getting employee salaries for store ${storeId}:`, error);
      return [];
    }
  }

  /**
   * Get employee salaries by store ID and month/year
   */
  async getByStoreIdAndMonthYear(
    storeId: number,
    month: number,
    year: number
  ): Promise<EmployeeSalary[]> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'employee_salaries'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('Employee salaries table does not exist, creating it...');
        await this.createTable();
        return [];
      }
      
      const result = await query(
        'SELECT * FROM employee_salaries WHERE store_id = $1 AND salary_month = $2 AND salary_year = $3 ORDER BY employee_name',
        [storeId, month, year]
      );
      return result as EmployeeSalary[];
    } catch (error) {
      console.error(`Error getting employee salaries for store ${storeId} in ${month}/${year}:`, error);
      return [];
    }
  }

  /**
   * Get employee salary by ID
   */
  async getById(id: number): Promise<EmployeeSalary | null> {
    try {
      const result = await query('SELECT * FROM employee_salaries WHERE id = $1', [id]);
      
      if (result && result.length > 0) {
        return result[0] as EmployeeSalary;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting employee salary with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new employee salary
   */
  async create(salary: EmployeeSalary): Promise<number> {
    try {
      console.log('Creating employee salary with data:', JSON.stringify(salary, null, 2));
      
      // Format month as string (e.g., "2023-04")
      const monthString = `${salary.year}-${salary.month.toString().padStart(2, '0')}`;
      
      // Check if store exists
      console.log('Checking if store with ID', salary.store_id, 'exists...');
      const storeExistsQuery = `
        SELECT EXISTS (
          SELECT FROM woocommerce_stores 
          WHERE id = $1
        );
      `;
      
      const storeExists = await query(storeExistsQuery, [salary.store_id]);
      console.log('Store exists check result:', storeExists);
      
      if (!storeExists || !storeExists[0] || !storeExists[0].exists) {
        console.error(`Store with ID ${salary.store_id} does not exist!`);
        throw new Error(`Store with ID ${salary.store_id} does not exist!`);
      }
      
      console.log('Inserting employee salary with values:', {
        store_id: salary.store_id,
        employee_name: salary.employee_name,
        position: salary.position || null,
        gross_salary: salary.gross_salary,
        employer_costs: salary.employer_costs,
        salary_month: salary.month,
        salary_year: salary.year,
        month: monthString,
        salary: salary.gross_salary
      });
      
      // Use a simpler insert query that matches the actual table structure
      const result = await query(
        `INSERT INTO employee_salaries (
          store_id, 
          employee_name, 
          position, 
          gross_salary, 
          employer_costs, 
          salary_month, 
          salary_year,
          month,
          salary
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          salary.store_id,
          salary.employee_name,
          salary.position || null,
          salary.gross_salary,
          salary.employer_costs,
          salary.month,
          salary.year,
          monthString,
          salary.gross_salary
        ]
      );
      
      console.log('Insert query result:', result);
      
      // Check if result has rows property (PostgreSQL client format)
      if (result && result.rows && result.rows.length > 0) {
        console.log('Successfully created employee salary with ID:', result.rows[0].id);
        return result.rows[0].id;
      } 
      // Check if result is an array (our modified format)
      else if (result && result.length > 0) {
        console.log('Successfully created employee salary with ID:', result[0].id);
        return result[0].id;
      }
      
      console.error('Failed to create employee salary: No ID returned', result);
      throw new Error('Failed to create employee salary: No ID returned');
    } catch (error) {
      console.error('Error creating employee salary:', error);
      throw error;
    }
  }

  /**
   * Update an existing employee salary
   */
  async update(id: number, salary: Partial<EmployeeSalary>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (salary.store_id !== undefined) {
        fields.push(`store_id = $${paramIndex++}`);
        values.push(salary.store_id);
      }
      
      if (salary.employee_name !== undefined) {
        fields.push(`employee_name = $${paramIndex++}`);
        values.push(salary.employee_name);
      }
      
      if (salary.position !== undefined) {
        fields.push(`position = $${paramIndex++}`);
        values.push(salary.position);
      }
      
      if (salary.gross_salary !== undefined) {
        fields.push(`gross_salary = $${paramIndex++}`);
        values.push(salary.gross_salary);
        // Also update the salary field
        fields.push(`salary = $${paramIndex++}`);
        values.push(salary.gross_salary);
      }
      
      if (salary.employer_costs !== undefined) {
        fields.push(`employer_costs = $${paramIndex++}`);
        values.push(salary.employer_costs);
      }
      
      // Track if month or year is being updated
      let updateMonth = false;
      let monthValue = 0;
      let yearValue = 0;
      
      if (salary.month !== undefined) {
        fields.push(`salary_month = $${paramIndex++}`);
        values.push(salary.month);
        updateMonth = true;
        monthValue = salary.month;
      }
      
      if (salary.year !== undefined) {
        fields.push(`salary_year = $${paramIndex++}`);
        values.push(salary.year);
        updateMonth = true;
        yearValue = salary.year;
      }
      
      // If either month or year is being updated, we need to update the month column too
      if (updateMonth) {
        // First get the current values if needed
        if (monthValue === 0 || yearValue === 0) {
          const currentSalary = await this.getById(id);
          if (currentSalary) {
            if (monthValue === 0) monthValue = currentSalary.month;
            if (yearValue === 0) yearValue = currentSalary.year;
          }
        }
        
        // Format month as string (e.g., "2023-04")
        const monthString = `${yearValue}-${monthValue.toString().padStart(2, '0')}`;
        fields.push(`month = $${paramIndex++}`);
        values.push(monthString);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      const sql = `UPDATE employee_salaries SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      values.push(id);
      
      const result = await query(sql, values);
      
      // Check if result has rowCount property (PostgreSQL client format)
      if (result && result.rowCount !== undefined) {
        return result.rowCount > 0;
      }
      // Check if result is an array (our modified format)
      else if (result && result.length !== undefined) {
        return result.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating employee salary with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete an employee salary
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query('DELETE FROM employee_salaries WHERE id = $1', [id]);
      
      // Check if result has rowCount property (PostgreSQL client format)
      if (result && result.rowCount !== undefined) {
        return result.rowCount > 0;
      }
      // Check if result is an array (our modified format)
      else if (result && result.length !== undefined) {
        return result.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting employee salary with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Get total employee salaries for a store in a month/year
   */
  async getTotalByStoreIdAndMonthYear(
    storeId: number,
    month: number,
    year: number
  ): Promise<{ grossTotal: number; employerCostsTotal: number; total: number }> {
    try {
      // First check if the table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'employee_salaries'
        );
      `;
      
      const tableExists = await query(tableExistsQuery);
      
      // If table doesn't exist, create it
      if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
        console.log('Employee salaries table does not exist, creating it...');
        await this.createTable();
        return { grossTotal: 0, employerCostsTotal: 0, total: 0 };
      }
      
      const result = await query(
        `SELECT 
          COALESCE(SUM(gross_salary), 0) as gross_total,
          COALESCE(SUM(employer_costs), 0) as employer_costs_total,
          COALESCE(SUM(gross_salary + employer_costs), 0) as total
         FROM employee_salaries 
         WHERE store_id = $1 AND salary_month = $2 AND salary_year = $3`,
        [storeId, month, year]
      );
      
      if (result && result.length > 0) {
        return {
          grossTotal: parseFloat(result[0].gross_total) || 0,
          employerCostsTotal: parseFloat(result[0].employer_costs_total) || 0,
          total: parseFloat(result[0].total) || 0
        };
      }
      
      return { grossTotal: 0, employerCostsTotal: 0, total: 0 };
    } catch (error) {
      console.error(`Error getting total employee salaries for store ${storeId} in ${month}/${year}:`, error);
      return { grossTotal: 0, employerCostsTotal: 0, total: 0 };
    }
  }

  /**
   * Copy employee salaries from one month to another
   */
  async copyFromPreviousMonth(
    storeId: number,
    targetMonth: number,
    targetYear: number
  ): Promise<boolean> {
    try {
      // Calculate the previous month and year
      let previousMonth = targetMonth - 1;
      let previousYear = targetYear;
      
      if (previousMonth === 0) {
        previousMonth = 12;
        previousYear--;
      }
      
      // Get salaries from the previous month
      const previousSalaries = await this.getByStoreIdAndMonthYear(
        storeId,
        previousMonth,
        previousYear
      );
      
      if (previousSalaries.length === 0) {
        console.log(`No salaries found for store ${storeId} in ${previousMonth}/${previousYear}`);
        return false;
      }
      
      // Insert new salaries for the target month
      for (const salary of previousSalaries) {
        await this.create({
          store_id: storeId,
          employee_name: salary.employee_name,
          position: salary.position,
          gross_salary: salary.gross_salary,
          employer_costs: salary.employer_costs,
          month: targetMonth,
          year: targetYear
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error copying employee salaries for store ${storeId} from previous month:`, error);
      return false;
    }
  }
}

export const employeeSalaryModel = new EmployeeSalaryModel();
