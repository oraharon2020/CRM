import { Request, Response } from 'express';
import { employeeSalaryModel, EmployeeSalary } from '../models/employee-salary.model';

/**
 * Controller for employee salaries
 */
export class EmployeeSalaryController {
  /**
   * Get all employee salaries
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const salaries = await employeeSalaryModel.getAll();
      
      res.status(200).json({
        success: true,
        message: 'Employee salaries retrieved successfully',
        data: salaries
      });
    } catch (error: any) {
      console.error('Error retrieving employee salaries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee salaries',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get employee salaries by store ID
   */
  async getByStoreId(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.storeId);
      
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      const salaries = await employeeSalaryModel.getByStoreId(storeId);
      
      res.status(200).json({
        success: true,
        message: 'Employee salaries retrieved successfully',
        data: salaries
      });
    } catch (error: any) {
      console.error(`Error retrieving employee salaries for store ${req.params.storeId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee salaries',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get employee salaries by store ID and month/year
   */
  async getByStoreIdAndMonthYear(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.storeId);
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);
      
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      if (isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          message: 'Invalid month'
        });
        return;
      }
      
      if (isNaN(year) || year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          message: 'Invalid year'
        });
        return;
      }
      
      const salaries = await employeeSalaryModel.getByStoreIdAndMonthYear(
        storeId,
        month,
        year
      );
      
      // Calculate totals
      const grossTotal = salaries.reduce((sum, salary) => sum + salary.gross_salary, 0);
      const employerCostsTotal = salaries.reduce((sum, salary) => sum + salary.employer_costs, 0);
      const total = grossTotal + employerCostsTotal;
      
      res.status(200).json({
        success: true,
        message: 'Employee salaries retrieved successfully',
        data: salaries,
        totals: {
          grossTotal,
          employerCostsTotal,
          total
        }
      });
    } catch (error: any) {
      console.error(`Error retrieving employee salaries for store ${req.params.storeId} in month/year:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee salaries',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get employee salary by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid salary ID'
        });
        return;
      }
      
      const salary = await employeeSalaryModel.getById(id);
      
      if (!salary) {
        res.status(404).json({
          success: false,
          message: 'Employee salary not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Employee salary retrieved successfully',
        data: salary
      });
    } catch (error: any) {
      console.error(`Error retrieving employee salary with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employee salary',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Create a new employee salary
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        store_id,
        employee_name,
        position,
        gross_salary,
        employer_costs,
        month,
        year
      } = req.body;
      
      // Validate required fields
      if (
        !store_id ||
        !employee_name ||
        gross_salary === undefined ||
        employer_costs === undefined ||
        month === undefined ||
        year === undefined
      ) {
        res.status(400).json({
          success: false,
          message: 'Store ID, employee name, gross salary, employer costs, month, and year are required'
        });
        return;
      }
      
      // Validate store ID
      const storeId = parseInt(store_id);
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      // Validate gross salary
      const grossSalaryAmount = parseFloat(gross_salary);
      if (isNaN(grossSalaryAmount)) {
        res.status(400).json({
          success: false,
          message: 'Invalid gross salary'
        });
        return;
      }
      
      // Validate employer costs
      const employerCostsAmount = parseFloat(employer_costs);
      if (isNaN(employerCostsAmount)) {
        res.status(400).json({
          success: false,
          message: 'Invalid employer costs'
        });
        return;
      }
      
      // Validate month
      const monthValue = parseInt(month);
      if (isNaN(monthValue) || monthValue < 1 || monthValue > 12) {
        res.status(400).json({
          success: false,
          message: 'Invalid month'
        });
        return;
      }
      
      // Validate year
      const yearValue = parseInt(year);
      if (isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
        res.status(400).json({
          success: false,
          message: 'Invalid year'
        });
        return;
      }
      
      // Create salary
      const salary: EmployeeSalary = {
        store_id: storeId,
        employee_name,
        position,
        gross_salary: grossSalaryAmount,
        employer_costs: employerCostsAmount,
        month: monthValue,
        year: yearValue
      };

      // Log the salary object for debugging
      console.log('Creating employee salary with data:', JSON.stringify(salary, null, 2));
      
      const id = await employeeSalaryModel.create(salary);
      
      res.status(201).json({
        success: true,
        message: 'Employee salary created successfully',
        data: { id, ...salary }
      });
    } catch (error: any) {
      console.error('Error creating employee salary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create employee salary',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Update an existing employee salary
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid salary ID'
        });
        return;
      }
      
      // Check if salary exists
      const existingSalary = await employeeSalaryModel.getById(id);
      
      if (!existingSalary) {
        res.status(404).json({
          success: false,
          message: 'Employee salary not found'
        });
        return;
      }
      
      // Prepare update data
      const updateData: Partial<EmployeeSalary> = {};
      
      if (req.body.store_id !== undefined) {
        const storeId = parseInt(req.body.store_id);
        if (isNaN(storeId)) {
          res.status(400).json({
            success: false,
            message: 'Invalid store ID'
          });
          return;
        }
        updateData.store_id = storeId;
      }
      
      if (req.body.employee_name !== undefined) {
        updateData.employee_name = req.body.employee_name;
      }
      
      if (req.body.position !== undefined) {
        updateData.position = req.body.position;
      }
      
      if (req.body.gross_salary !== undefined) {
        const grossSalary = parseFloat(req.body.gross_salary);
        if (isNaN(grossSalary)) {
          res.status(400).json({
            success: false,
            message: 'Invalid gross salary'
          });
          return;
        }
        updateData.gross_salary = grossSalary;
      }
      
      if (req.body.employer_costs !== undefined) {
        const employerCosts = parseFloat(req.body.employer_costs);
        if (isNaN(employerCosts)) {
          res.status(400).json({
            success: false,
            message: 'Invalid employer costs'
          });
          return;
        }
        updateData.employer_costs = employerCosts;
      }
      
      if (req.body.month !== undefined) {
        const monthValue = parseInt(req.body.month);
        if (isNaN(monthValue) || monthValue < 1 || monthValue > 12) {
          res.status(400).json({
            success: false,
            message: 'Invalid month'
          });
          return;
        }
        updateData.month = monthValue;
      }
      
      if (req.body.year !== undefined) {
        const yearValue = parseInt(req.body.year);
        if (isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
          res.status(400).json({
            success: false,
            message: 'Invalid year'
          });
          return;
        }
        updateData.year = yearValue;
      }
      
      // Update salary
      const success = await employeeSalaryModel.update(id, updateData);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to update employee salary'
        });
        return;
      }
      
      // Get updated salary
      const updatedSalary = await employeeSalaryModel.getById(id);
      
      res.status(200).json({
        success: true,
        message: 'Employee salary updated successfully',
        data: updatedSalary
      });
    } catch (error: any) {
      console.error(`Error updating employee salary with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update employee salary',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Delete an employee salary
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid salary ID'
        });
        return;
      }
      
      // Check if salary exists
      const existingSalary = await employeeSalaryModel.getById(id);
      
      if (!existingSalary) {
        res.status(404).json({
          success: false,
          message: 'Employee salary not found'
        });
        return;
      }
      
      // Delete salary
      const success = await employeeSalaryModel.delete(id);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete employee salary'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Employee salary deleted successfully'
      });
    } catch (error: any) {
      console.error(`Error deleting employee salary with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete employee salary',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get total employee salaries for a store in a month/year
   */
  async getTotalByStoreIdAndMonthYear(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.storeId);
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);
      
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      if (isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          message: 'Invalid month'
        });
        return;
      }
      
      if (isNaN(year) || year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          message: 'Invalid year'
        });
        return;
      }
      
      const totals = await employeeSalaryModel.getTotalByStoreIdAndMonthYear(
        storeId,
        month,
        year
      );
      
      res.status(200).json({
        success: true,
        message: 'Total employee salaries retrieved successfully',
        data: totals
      });
    } catch (error: any) {
      console.error(`Error retrieving total employee salaries for store ${req.params.storeId} in month/year:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve total employee salaries',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Copy employee salaries from previous month
   */
  async copyFromPreviousMonth(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.storeId);
      const month = parseInt(req.body.month);
      const year = parseInt(req.body.year);
      
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      if (isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          message: 'Invalid month'
        });
        return;
      }
      
      if (isNaN(year) || year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          message: 'Invalid year'
        });
        return;
      }
      
      const success = await employeeSalaryModel.copyFromPreviousMonth(
        storeId,
        month,
        year
      );
      
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'No salaries found in the previous month to copy'
        });
        return;
      }
      
      // Get the copied salaries
      const salaries = await employeeSalaryModel.getByStoreIdAndMonthYear(
        storeId,
        month,
        year
      );
      
      res.status(200).json({
        success: true,
        message: 'Employee salaries copied successfully from previous month',
        data: salaries
      });
    } catch (error: any) {
      console.error(`Error copying employee salaries for store ${req.params.storeId} from previous month:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to copy employee salaries from previous month',
        error: error.message || 'Unknown error'
      });
    }
  }
}

export const employeeSalaryController = new EmployeeSalaryController();
