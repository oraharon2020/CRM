import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import { cashFlowSummaryAPI, vatExpensesAPI, nonVatExpensesAPI, salariesAPI, cashFlowOrdersAPI } from '../../services/expenses-api';

// Import utility functions and types
import { calculateForecast } from './utils/forecast';
import { CashFlowData, CashFlowTableProps, Order, Expenses, ForecastResult } from './utils/types';

// Import components
import SummaryCards from './components/SummaryCards';
import ExpensesToggle from './components/ExpensesToggle';
import TableHeader from './components/TableHeader';
import TableRow from './components/TableRow';
import ForecastRow from './components/ForecastRow';
import OrdersPopup from './components/OrdersPopup';

/**
 * CashFlowTable component displays a table of cash flow data with revenue, expenses, and forecasts
 */
const CashFlowTable: React.FC<CashFlowTableProps> = ({
  data,
  loading,
  error,
  storeId,
  month,
  year,
  totals
}) => {
  // UI state
  const [showExpenses, setShowExpenses] = useState(true);
  
  // Data state
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [dataWithExpenses, setDataWithExpenses] = useState<CashFlowData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastResult | null>(null);
  
  // Orders popup state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  // Calculate forecast whenever data changes
  useEffect(() => {
    if (dataWithExpenses.length > 0 && month && year) {
      console.log('Calculating forecast...');
      const forecast = calculateForecast(dataWithExpenses, month, year);
      setForecastData(forecast);
      console.log('Forecast calculated:', forecast);
    } else {
      setForecastData(null);
    }
  }, [dataWithExpenses, month, year]);

  // Fetch expenses data and merge with revenue data when storeId, month, year, or data changes
  useEffect(() => {
    if (!storeId || !month || !year || !data || data.length === 0) {
      setDataWithExpenses(data);
      return;
    }
    
    const fetchExpensesData = async () => {
      setExpensesLoading(true);
      setExpensesError(null);
      
      try {
        // Get the date range for the month
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = new Date(year, month - 1, lastDay).toISOString().split('T')[0];
        
        // Try to get daily summary from cashFlowSummaryAPI
        try {
          const summaryResponse = await cashFlowSummaryAPI.getDailySummary(storeId, month, year);
          
          if (summaryResponse.success && summaryResponse.data) {
            // Map the summary data to our data format
            const newData = data.map(item => {
              const dailySummary = summaryResponse.data.find((summary: any) => summary.date === item.date);
              
              if (dailySummary) {
                const expenses: Expenses = {
                  vatDeductible: dailySummary.expenses?.vatDeductible || 0,
                  nonVatDeductible: dailySummary.expenses?.nonVatDeductible || 0,
                  salary: dailySummary.expenses?.salary || 0,
                  vat: dailySummary.expenses?.vat || 0,
                  marketingFacebook: dailySummary.expenses?.marketingFacebook || 0,
                  marketingGoogle: dailySummary.expenses?.marketingGoogle || 0,
                  marketingTikTok: dailySummary.expenses?.marketingTikTok || 0,
                  shipping: dailySummary.expenses?.shipping || 0,
                  total: dailySummary.expenses?.total || 0
                };
                
                const profit = item.revenue - expenses.total;
                const roi = expenses.total > 0 ? (profit / expenses.total) * 100 : 0;
                
                return {
                  ...item,
                  expenses,
                  profit,
                  roi
                };
              }
              
              return item;
            });
            
            setDataWithExpenses(newData);
            setExpensesLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching daily summary:', error);
          // Continue to fallback method
        }
        
        // Fallback: Fetch individual expense types and combine them
        const [vatResponse, nonVatResponse, salariesResponse] = await Promise.all([
          vatExpensesAPI.getByStoreIdAndDateRange(storeId, startDate, endDate),
          nonVatExpensesAPI.getByStoreIdAndDateRange(storeId, startDate, endDate),
          salariesAPI.getByStoreIdAndMonthYear(storeId, month, year)
        ]);
        
        // Process VAT expenses
        const vatExpenses = vatResponse.success && vatResponse.data ? vatResponse.data : [];
        const nonVatExpenses = nonVatResponse.success && nonVatResponse.data ? nonVatResponse.data : [];
        const salaries = salariesResponse.success && salariesResponse.data ? salariesResponse.data : [];
        
        // Calculate VAT rate (default to 18% if not available)
        const vatRate = 0.18;
        
        // Create a map of expenses by date
        const expensesByDate: Record<string, Expenses> = {};
        
        // Initialize with all dates in the month
        for (let day = 1; day <= lastDay; day++) {
          const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          expensesByDate[date] = {
            vatDeductible: 0,
            nonVatDeductible: 0,
            salary: 0,
            vat: 0,
            marketingFacebook: 0,
            marketingGoogle: 0,
            marketingTikTok: 0,
            shipping: 0,
            total: 0
          };
        }
        
        // Log summary of expense data for debugging
        console.log(`DEBUG: Found ${vatExpenses.length} VAT expenses, ${nonVatExpenses.length} non-VAT expenses, and ${salaries.length} salary records`);
        
        // Calculate total expenses for each type
        const totalVatDeductible = vatExpenses.reduce((sum: number, expense: any) => {
          // Parse amount to number if it's a string
          let amount = 0;
          if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
            amount = expense.amount;
          } else if (typeof expense.amount === 'string') {
            amount = parseFloat(expense.amount) || 0;
          }
          return sum + amount;
        }, 0);
        
        const totalVat = totalVatDeductible * vatRate;
        
        const totalNonVatDeductible = nonVatExpenses.reduce((sum: number, expense: any) => {
          // Parse amount to number if it's a string
          let amount = 0;
          if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
            amount = expense.amount;
          } else if (typeof expense.amount === 'string') {
            amount = parseFloat(expense.amount) || 0;
          }
          return sum + amount;
        }, 0);
        
        const totalSalary = salaries.reduce((sum: number, salary: any) => {
          // Parse salary amounts to numbers if they're strings
          let grossSalary = 0;
          let employerCosts = 0;
          
          if (typeof salary.gross_salary === 'number' && !isNaN(salary.gross_salary)) {
            grossSalary = salary.gross_salary;
          } else if (typeof salary.gross_salary === 'string') {
            grossSalary = parseFloat(salary.gross_salary) || 0;
          }
          
          if (typeof salary.employer_costs === 'number' && !isNaN(salary.employer_costs)) {
            employerCosts = salary.employer_costs;
          } else if (typeof salary.employer_costs === 'string') {
            employerCosts = parseFloat(salary.employer_costs) || 0;
          }
          
          return sum + grossSalary + employerCosts;
        }, 0);
        
        // Calculate daily amounts
        const vatDeductiblePerDay = totalVatDeductible / lastDay;
        const vatPerDay = totalVat / lastDay;
        const nonVatDeductiblePerDay = totalNonVatDeductible / lastDay;
        const salaryPerDay = totalSalary / lastDay;
        
        console.log(`Distributing expenses evenly across ${lastDay} days:`);
        console.log(`- VAT Deductible: ${totalVatDeductible} total, ${vatDeductiblePerDay} per day`);
        console.log(`- VAT: ${totalVat} total, ${vatPerDay} per day`);
        console.log(`- Non-VAT Deductible: ${totalNonVatDeductible} total, ${nonVatDeductiblePerDay} per day`);
        console.log(`- Salary: ${totalSalary} total, ${salaryPerDay} per day`);
        
        // Distribute all expenses evenly across the month
        for (let day = 1; day <= lastDay; day++) {
          const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          if (expensesByDate[date]) {
            expensesByDate[date].vatDeductible = vatDeductiblePerDay;
            expensesByDate[date].vat = vatPerDay;
            expensesByDate[date].nonVatDeductible = nonVatDeductiblePerDay;
            expensesByDate[date].salary = salaryPerDay;
          }
        }
        
        // Calculate totals
        for (const date in expensesByDate) {
          const expenses = expensesByDate[date];
          expenses.total = expenses.vatDeductible + 
                          expenses.nonVatDeductible + 
                          expenses.salary + 
                          expenses.vat + 
                          expenses.marketingFacebook + 
                          expenses.marketingGoogle + 
                          expenses.marketingTikTok +
                          expenses.shipping;
        }
        
        // Merge with revenue data
        const newData = data.map(item => {
          const expenses = expensesByDate[item.date];
          
          if (expenses) {
            const profit = item.revenue - expenses.total;
            const roi = expenses.total > 0 ? (profit / expenses.total) * 100 : 0;
            
            return {
              ...item,
              expenses,
              profit,
              roi
            };
          }
          
          return item;
        });
        
        setDataWithExpenses(newData);
      } catch (error: any) {
        console.error('Error fetching expenses data:', error);
        setExpensesError(`Error fetching expenses data: ${error.message || 'Unknown error'}`);
        setDataWithExpenses(data);
      } finally {
        setExpensesLoading(false);
      }
    };
    
    fetchExpensesData();
  }, [storeId, month, year, data]);
  
  // Function to handle marketing expense changes
  const handleMarketingExpenseChange = (
    date: string,
    field: 'marketingFacebook' | 'marketingGoogle' | 'marketingTikTok' | 'shipping',
    value: number
  ) => {
    const newData = [...dataWithExpenses];
    const index = newData.findIndex(d => d.date === date);
    
    if (index !== -1 && newData[index].expenses) {
      // Update the specific marketing expense field
      newData[index].expenses![field] = value;
      
      // Recalculate total expenses
      newData[index].expenses!.total = 
        newData[index].expenses!.vatDeductible + 
        newData[index].expenses!.nonVatDeductible + 
        newData[index].expenses!.salary + 
        newData[index].expenses!.vat +
        newData[index].expenses!.marketingFacebook +
        newData[index].expenses!.marketingGoogle +
        newData[index].expenses!.marketingTikTok +
        newData[index].expenses!.shipping;
      
      // Recalculate profit and ROI
      newData[index].profit = newData[index].revenue - newData[index].expenses!.total;
      newData[index].roi = newData[index].expenses!.total > 0 ? 
        (newData[index].profit! / newData[index].expenses!.total) * 100 : 0;
      
      setDataWithExpenses(newData);
    }
  };
  
  // Function to fetch orders for a specific date
  const fetchOrdersByDate = async (date: string) => {
    if (!storeId) return;
    
    setOrdersLoading(true);
    setOrdersError(null);
    
    try {
      const response = await cashFlowOrdersAPI.getOrdersByDate(storeId, date);
      
      if (response.success) {
        setOrders(response.data);
      } else {
        setOrdersError(response.message || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setOrdersError(error.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };
  
  // Handle date click
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    fetchOrdersByDate(date);
  };
  
  // Close orders popup
  const closeOrdersPopup = () => {
    setSelectedDate(null);
    setOrders([]);
  };
  
  // Calculate totals if not provided
  const calculateTotals = () => {
    if (totals) return totals;
    
    if (!dataWithExpenses || dataWithExpenses.length === 0) {
      return {
        revenue: 0,
        orderCount: 0,
        productCount: 0,
        expenses: {
          vatDeductible: 0,
          nonVatDeductible: 0,
          salary: 0,
          vat: 0,
          marketingFacebook: 0,
          marketingGoogle: 0,
          marketingTikTok: 0,
          shipping: 0,
          total: 0
        },
        profit: 0,
        roi: 0
      };
    }
    
    // Calculate the raw totals
    const calculatedTotals = dataWithExpenses.reduce((acc, item) => {
      return {
        revenue: acc.revenue + (isNaN(item.revenue) ? 0 : item.revenue),
        orderCount: acc.orderCount + (isNaN(item.orderCount) ? 0 : item.orderCount),
        productCount: acc.productCount + (isNaN(item.productCount) ? 0 : item.productCount),
        expenses: {
          vatDeductible: acc.expenses.vatDeductible + (item.expenses?.vatDeductible || 0),
          nonVatDeductible: acc.expenses.nonVatDeductible + (item.expenses?.nonVatDeductible || 0),
          salary: acc.expenses.salary + (item.expenses?.salary || 0),
          vat: acc.expenses.vat + (item.expenses?.vat || 0),
          marketingFacebook: acc.expenses.marketingFacebook + (item.expenses?.marketingFacebook || 0),
          marketingGoogle: acc.expenses.marketingGoogle + (item.expenses?.marketingGoogle || 0),
          marketingTikTok: acc.expenses.marketingTikTok + (item.expenses?.marketingTikTok || 0),
          shipping: acc.expenses.shipping + (item.expenses?.shipping || 0),
          total: acc.expenses.total + (item.expenses?.total || 0)
        }
      };
    }, {
      revenue: 0,
      orderCount: 0,
      productCount: 0,
      expenses: {
        vatDeductible: 0,
        nonVatDeductible: 0,
        salary: 0,
        vat: 0,
        marketingFacebook: 0,
        marketingGoogle: 0,
        marketingTikTok: 0,
        shipping: 0,
        total: 0
      }
    });
    
    // Calculate profit and ROI
    const profit = calculatedTotals.revenue - calculatedTotals.expenses.total;
    const roi = calculatedTotals.expenses.total > 0 ? (profit / calculatedTotals.expenses.total) * 100 : 0;
    
    return {
      ...calculatedTotals,
      profit,
      roi
    };
  };
  
  const calculatedTotals = calculateTotals();
  
  // Check if data includes expenses
  const hasExpenses = dataWithExpenses.some(item => item.expenses);
  
  // If loading, show spinner
  if (loading || expensesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // If error, show error message
  if (error || expensesError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {error && <p className="text-red-500 text-lg mb-2">{error}</p>}
        {expensesError && <p className="text-red-500 text-lg">{expensesError}</p>}
      </div>
    );
  }
  
  // If no data, show message
  if (!dataWithExpenses || dataWithExpenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">אין נתונים להצגה</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Summary Cards */}
      <SummaryCards 
        revenue={calculatedTotals.revenue}
        orderCount={calculatedTotals.orderCount}
        productCount={calculatedTotals.productCount}
        expenses={calculatedTotals.expenses}
        profit={calculatedTotals.profit}
        roi={calculatedTotals.roi}
        hasExpenses={hasExpenses}
      />
      
      {/* Toggle Expenses Button */}
      {hasExpenses && (
        <ExpensesToggle 
          showExpenses={showExpenses} 
          onToggle={() => setShowExpenses(!showExpenses)} 
        />
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader showExpenses={showExpenses && hasExpenses} />
          
          <tbody className="bg-white divide-y divide-gray-200">
            {dataWithExpenses.map((item) => (
              <TableRow 
                key={item.date}
                item={item}
                showExpenses={showExpenses && hasExpenses}
                onDateClick={handleDateClick}
                onMarketingExpenseChange={handleMarketingExpenseChange}
              />
            ))}
          </tbody>
          
          {/* Forecast Row */}
          {dataWithExpenses.length > 0 && (
            <tfoot>
              <ForecastRow 
                forecast={forecastData} 
                showExpenses={showExpenses && hasExpenses} 
              />
            </tfoot>
          )}
        </table>
      </div>
      
      {/* Orders Popup */}
      <OrdersPopup
        selectedDate={selectedDate}
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
        onClose={closeOrdersPopup}
      />
    </div>
  );
};

export default CashFlowTable;
