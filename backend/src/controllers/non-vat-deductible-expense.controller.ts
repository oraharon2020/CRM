import { Request, Response } from 'express';
import { nonVatDeductibleExpenseModel, NonVatDeductibleExpense } from '../models/non-vat-deductible-expense.model';

/**
 * Controller for Non-VAT deductible expenses
 */
export class NonVatDeductibleExpenseController {
  /**
   * Get all Non-VAT deductible expenses
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const expenses = await nonVatDeductibleExpenseModel.getAll();
      
      res.status(200).json({
        success: true,
        message: 'Non-VAT deductible expenses retrieved successfully',
        data: expenses
      });
    } catch (error: any) {
      console.error('Error retrieving Non-VAT deductible expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Non-VAT deductible expenses',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get Non-VAT deductible expenses by store ID
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
      
      const expenses = await nonVatDeductibleExpenseModel.getByStoreId(storeId);
      
      res.status(200).json({
        success: true,
        message: 'Non-VAT deductible expenses retrieved successfully',
        data: expenses
      });
    } catch (error: any) {
      console.error(`Error retrieving Non-VAT deductible expenses for store ${req.params.storeId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Non-VAT deductible expenses',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get Non-VAT deductible expenses by store ID and date range
   */
  async getByStoreIdAndDateRange(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.storeId);
      const { startDate, endDate } = req.query;
      
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }
      
      const expenses = await nonVatDeductibleExpenseModel.getByStoreIdAndDateRange(
        storeId,
        startDate,
        endDate
      );
      
      // Calculate total
      const total = Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + expense.amount, 0) : 0;
      
      res.status(200).json({
        success: true,
        message: 'Non-VAT deductible expenses retrieved successfully',
        data: expenses,
        total
      });
    } catch (error: any) {
      console.error(`Error retrieving Non-VAT deductible expenses for store ${req.params.storeId} in date range:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Non-VAT deductible expenses',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get Non-VAT deductible expense by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid expense ID'
        });
        return;
      }
      
      const expense = await nonVatDeductibleExpenseModel.getById(id);
      
      if (!expense) {
        res.status(404).json({
          success: false,
          message: 'Non-VAT deductible expense not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Non-VAT deductible expense retrieved successfully',
        data: expense
      });
    } catch (error: any) {
      console.error(`Error retrieving Non-VAT deductible expense with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Non-VAT deductible expense',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Create a new Non-VAT deductible expense
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { store_id, description, amount, expense_date } = req.body;
      
      // Validate required fields
      if (!store_id || !description || amount === undefined || !expense_date) {
        res.status(400).json({
          success: false,
          message: 'Store ID, description, amount, and expense date are required'
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
      
      // Validate amount
      const expenseAmount = parseFloat(amount);
      if (isNaN(expenseAmount)) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
        return;
      }
      
      // Check for numeric overflow (DECIMAL(10,2) can store up to 99,999,999.99)
      const maxAmount = 99999999.99;
      if (expenseAmount > maxAmount) {
        res.status(400).json({
          success: false,
          message: `Amount exceeds maximum allowed value (${maxAmount})`
        });
        return;
      }
      
      // Create expense
      const expense: NonVatDeductibleExpense = {
        store_id: storeId,
        description,
        amount: expenseAmount,
        expense_date
      };
      
      const id = await nonVatDeductibleExpenseModel.create(expense);
      
      res.status(201).json({
        success: true,
        message: 'Non-VAT deductible expense created successfully',
        data: { id, ...expense }
      });
    } catch (error: any) {
      console.error('Error creating Non-VAT deductible expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Non-VAT deductible expense',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Update an existing Non-VAT deductible expense
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid expense ID'
        });
        return;
      }
      
      // Check if expense exists
      const existingExpense = await nonVatDeductibleExpenseModel.getById(id);
      
      if (!existingExpense) {
        res.status(404).json({
          success: false,
          message: 'Non-VAT deductible expense not found'
        });
        return;
      }
      
      // Prepare update data
      const updateData: Partial<NonVatDeductibleExpense> = {};
      
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
      
      if (req.body.description !== undefined) {
        updateData.description = req.body.description;
      }
      
      if (req.body.amount !== undefined) {
        const amount = parseFloat(req.body.amount);
        if (isNaN(amount)) {
          res.status(400).json({
            success: false,
            message: 'Invalid amount'
          });
          return;
        }
        
        // Check for numeric overflow (DECIMAL(10,2) can store up to 99,999,999.99)
        const maxAmount = 99999999.99;
        if (amount > maxAmount) {
          res.status(400).json({
            success: false,
            message: `Amount exceeds maximum allowed value (${maxAmount})`
          });
          return;
        }
        
        updateData.amount = amount;
      }
      
      if (req.body.expense_date !== undefined) {
        updateData.expense_date = req.body.expense_date;
      }
      
      // Update expense
      const success = await nonVatDeductibleExpenseModel.update(id, updateData);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to update Non-VAT deductible expense'
        });
        return;
      }
      
      // Get updated expense
      const updatedExpense = await nonVatDeductibleExpenseModel.getById(id);
      
      res.status(200).json({
        success: true,
        message: 'Non-VAT deductible expense updated successfully',
        data: updatedExpense
      });
    } catch (error: any) {
      console.error(`Error updating Non-VAT deductible expense with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Non-VAT deductible expense',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Delete a Non-VAT deductible expense
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid expense ID'
        });
        return;
      }
      
      // Check if expense exists
      const existingExpense = await nonVatDeductibleExpenseModel.getById(id);
      
      if (!existingExpense) {
        res.status(404).json({
          success: false,
          message: 'Non-VAT deductible expense not found'
        });
        return;
      }
      
      // Delete expense
      const success = await nonVatDeductibleExpenseModel.delete(id);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete Non-VAT deductible expense'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Non-VAT deductible expense deleted successfully'
      });
    } catch (error: any) {
      console.error(`Error deleting Non-VAT deductible expense with ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete Non-VAT deductible expense',
        error: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get total Non-VAT deductible expenses for a store in a date range
   */
  async getTotalByStoreIdAndDateRange(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.storeId);
      const { startDate, endDate } = req.query;
      
      if (isNaN(storeId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid store ID'
        });
        return;
      }
      
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
        return;
      }
      
      const total = await nonVatDeductibleExpenseModel.getTotalByStoreIdAndDateRange(
        storeId,
        startDate,
        endDate
      );
      
      res.status(200).json({
        success: true,
        message: 'Total Non-VAT deductible expenses retrieved successfully',
        data: { total }
      });
    } catch (error: any) {
      console.error(`Error retrieving total Non-VAT deductible expenses for store ${req.params.storeId} in date range:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve total Non-VAT deductible expenses',
        error: error.message || 'Unknown error'
      });
    }
  }
}

export const nonVatDeductibleExpenseController = new NonVatDeductibleExpenseController();
