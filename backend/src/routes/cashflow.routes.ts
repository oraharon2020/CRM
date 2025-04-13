import express, { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { cashFlowController } from '../controllers/cashflow.controller';
import { cashFlowSummaryController } from '../controllers/cashflow-summary.controller';
import { vatDeductibleExpenseController } from '../controllers/vat-deductible-expense.controller';
import { nonVatDeductibleExpenseController } from '../controllers/non-vat-deductible-expense.controller';
import { employeeSalaryController } from '../controllers/employee-salary.controller';

const router = Router();

// Get cash flow data
router.get('/', authenticate, (req, res) => cashFlowController.getCashFlowData(req, res));

// Get orders for a specific date
router.get('/orders/store/:storeId', authenticate, (req, res) => cashFlowController.getOrdersByDate(req, res));

// Cash flow summary routes
router.get('/summary/store/:storeId', authenticate, (req, res) => cashFlowSummaryController.getSummary(req, res));
router.get('/summary/daily/store/:storeId', authenticate, (req, res) => cashFlowSummaryController.getDailySummary(req, res));

// VAT deductible expenses routes
router.get('/vat-expenses', authenticate, (req, res) => vatDeductibleExpenseController.getAll(req, res));
router.get('/vat-expenses/store/:storeId', authenticate, (req, res) => vatDeductibleExpenseController.getByStoreId(req, res));
router.get('/vat-expenses/store/:storeId/date-range', authenticate, (req, res) => vatDeductibleExpenseController.getByStoreIdAndDateRange(req, res));
router.get('/vat-expenses/store/:storeId/total', authenticate, (req, res) => vatDeductibleExpenseController.getTotalByStoreIdAndDateRange(req, res));
router.get('/vat-expenses/:id', authenticate, (req, res) => vatDeductibleExpenseController.getById(req, res));
router.post('/vat-expenses', authenticate, (req, res) => vatDeductibleExpenseController.create(req, res));
router.put('/vat-expenses/:id', authenticate, (req, res) => vatDeductibleExpenseController.update(req, res));
router.delete('/vat-expenses/:id', authenticate, (req, res) => vatDeductibleExpenseController.delete(req, res));

// Non-VAT deductible expenses routes
router.get('/non-vat-expenses', authenticate, (req, res) => nonVatDeductibleExpenseController.getAll(req, res));
router.get('/non-vat-expenses/store/:storeId', authenticate, (req, res) => nonVatDeductibleExpenseController.getByStoreId(req, res));
router.get('/non-vat-expenses/store/:storeId/date-range', authenticate, (req, res) => nonVatDeductibleExpenseController.getByStoreIdAndDateRange(req, res));
router.get('/non-vat-expenses/store/:storeId/total', authenticate, (req, res) => nonVatDeductibleExpenseController.getTotalByStoreIdAndDateRange(req, res));
router.get('/non-vat-expenses/:id', authenticate, (req, res) => nonVatDeductibleExpenseController.getById(req, res));
router.post('/non-vat-expenses', authenticate, (req, res) => nonVatDeductibleExpenseController.create(req, res));
router.put('/non-vat-expenses/:id', authenticate, (req, res) => nonVatDeductibleExpenseController.update(req, res));
router.delete('/non-vat-expenses/:id', authenticate, (req, res) => nonVatDeductibleExpenseController.delete(req, res));

// Employee salaries routes
router.get('/salaries', authenticate, (req, res) => employeeSalaryController.getAll(req, res));
router.get('/salaries/store/:storeId', authenticate, (req, res) => employeeSalaryController.getByStoreId(req, res));
router.get('/salaries/store/:storeId/month-year', authenticate, (req, res) => employeeSalaryController.getByStoreIdAndMonthYear(req, res));
router.get('/salaries/store/:storeId/total', authenticate, (req, res) => employeeSalaryController.getTotalByStoreIdAndMonthYear(req, res));
router.get('/salaries/:id', authenticate, (req, res) => employeeSalaryController.getById(req, res));
router.post('/salaries', authenticate, (req, res) => employeeSalaryController.create(req, res));
router.put('/salaries/:id', authenticate, (req, res) => employeeSalaryController.update(req, res));
router.delete('/salaries/:id', authenticate, (req, res) => employeeSalaryController.delete(req, res));
router.post('/salaries/store/:storeId/copy-from-previous', authenticate, (req, res) => employeeSalaryController.copyFromPreviousMonth(req, res));

export default router;
