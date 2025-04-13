import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import { cashFlowSummaryAPI, vatExpensesAPI, nonVatExpensesAPI, salariesAPI, cashFlowOrdersAPI } from '../../services/expenses-api';
import { supplierCostsAPI } from '../../services/supplier-costs-api';

// Import utility functions and types
import { calculateForecast } from './utils/forecast';
import { 
  CashFlowData, 
  CashFlowTableProps, 
  Order, 
  Expenses, 
  ForecastResult, 
  ProductCostDetail,
  ShippingCostDetail
} from './utils/types';

// Import components
import SummaryCards from './components/SummaryCards';
import ExpensesToggle from './components/ExpensesToggle';
import TableHeader from './components/TableHeader';
import TableRow from './components/TableRow';
import ForecastRow from './components/ForecastRow';
import OrdersPopup from './components/OrdersPopup';
import ProductCostsPopup from './components/ProductCostsPopup';
import ShippingCostsPopup from './components/ShippingCostsPopup';
import CashFlowErrorHandler from './CashFlowErrorHandler';

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
  
  // Product costs popup state
  const [selectedProductCostDate, setSelectedProductCostDate] = useState<string | null>(null);
  const [productCosts, setProductCosts] = useState<ProductCostDetail[]>([]);
  const [productCostsLoading, setProductCostsLoading] = useState(false);
  const [productCostsError, setProductCostsError] = useState<string | null>(null);
  
  // Shipping costs popup state
  const [selectedShippingCostDate, setSelectedShippingCostDate] = useState<string | null>(null);
  const [shippingCosts, setShippingCosts] = useState<ShippingCostDetail[]>([]);
  const [shippingCostsLoading, setShippingCostsLoading] = useState(false);
  const [shippingCostsError, setShippingCostsError] = useState<string | null>(null);
  
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
        
        // Try to get supplier costs data
        let supplierCostsData: Record<string, { productCost: number, shipping: number }> = {};
        try {
          const costsResponse = await supplierCostsAPI.getCostsByDateRange(storeId, startDate, endDate);
          
          if (costsResponse.success && costsResponse.data) {
            // Create a map of costs by date
            supplierCostsData = costsResponse.data.reduce((acc: any, item: any) => {
              acc[item.date] = {
                productCost: item.product_cost || 0,
                shipping: item.shipping_cost || 0
              };
              return acc;
            }, {});
            
            console.log('Supplier costs data loaded:', supplierCostsData);
          }
        } catch (error) {
          console.error('Error fetching supplier costs:', error);
          // Continue with other data sources
        }
        
        // Try to get daily summary from cashFlowSummaryAPI
        try {
          const summaryResponse = await cashFlowSummaryAPI.getDailySummary(storeId, month, year);
          
          if (summaryResponse.success && summaryResponse.data) {
            // Map the summary data to our data format
            const newData = data.map(item => {
              const dailySummary = summaryResponse.data.find((summary: any) => summary.date === item.date);
              const supplierCost = supplierCostsData[item.date] || { productCost: 0, shipping: 0 };
              
              if (dailySummary) {
                const expenses: Expenses = {
                  vatDeductible: dailySummary.expenses?.vatDeductible || 0,
                  nonVatDeductible: dailySummary.expenses?.nonVatDeductible || 0,
                  salary: dailySummary.expenses?.salary || 0,
                  vat: dailySummary.expenses?.vat || 0,
                  marketingFacebook: dailySummary.expenses?.marketingFacebook || 0,
                  marketingGoogle: dailySummary.expenses?.marketingGoogle || 0,
                  marketingTikTok: dailySummary.expenses?.marketingTikTok || 0,
                  shipping: supplierCost.shipping || dailySummary.expenses?.shipping || 0,
                  productCost: supplierCost.productCost || 0,
                  total: (dailySummary.expenses?.total || 0) + supplierCost.productCost
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
          const supplierCost = supplierCostsData[date] || { productCost: 0, shipping: 0 };
          
          expensesByDate[date] = {
            vatDeductible: 0,
            nonVatDeductible: 0,
            salary: 0,
            vat: 0,
            marketingFacebook: 0,
            marketingGoogle: 0,
            marketingTikTok: 0,
            shipping: supplierCost.shipping,
            productCost: supplierCost.productCost,
            total: supplierCost.productCost + supplierCost.shipping
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
                          expenses.shipping +
                          expenses.productCost;
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
    field: 'marketingFacebook' | 'marketingGoogle' | 'marketingTikTok',
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
        newData[index].expenses!.shipping +
        newData[index].expenses!.productCost;
      
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
  
  // Function to fetch product cost details for a specific date
  const fetchProductCostDetailsByDate = async (date: string) => {
    if (!storeId) return;
    
    setProductCostsLoading(true);
    setProductCostsError(null);
    
    try {
      const response = await supplierCostsAPI.getProductCostDetailsByDate(storeId, date);
      
      if (response.success) {
        setProductCosts(response.data);
      } else {
        setProductCostsError(response.message || 'Failed to fetch product cost details');
        setProductCosts([]);
      }
    } catch (error: any) {
      console.error('Error fetching product cost details:', error);
      setProductCostsError(error.message || 'Failed to fetch product cost details');
      setProductCosts([]);
    } finally {
      setProductCostsLoading(false);
    }
  };
  
  // Function to fetch shipping cost details for a specific date
  const fetchShippingCostDetailsByDate = async (date: string) => {
    if (!storeId) return;
    
    setShippingCostsLoading(true);
    setShippingCostsError(null);
    
    try {
      const response = await supplierCostsAPI.getShippingCostDetailsByDate(storeId, date);
      
      if (response.success) {
        setShippingCosts(response.data);
      } else {
        setShippingCostsError(response.message || 'Failed to fetch shipping cost details');
        setShippingCosts([]);
      }
    } catch (error: any) {
      console.error('Error fetching shipping cost details:', error);
      setShippingCostsError(error.message || 'Failed to fetch shipping cost details');
      setShippingCosts([]);
    } finally {
      setShippingCostsLoading(false);
    }
  };
  
  // Handle date click
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    fetchOrdersByDate(date);
  };
  
  // Handle product cost click
  const handleProductCostClick = (date: string) => {
    setSelectedProductCostDate(date);
    fetchProductCostDetailsByDate(date);
  };
  
  // Handle shipping cost click
  const handleShippingCostClick = (date: string) => {
    setSelectedShippingCostDate(date);
    fetchShippingCostDetailsByDate(date);
  };
  
  // Close orders popup
  const closeOrdersPopup = () => {
    setSelectedDate(null);
    setOrders([]);
  };
  
  // Close product costs popup
  const closeProductCostsPopup = () => {
    setSelectedProductCostDate(null);
    setProductCosts([]);
  };
  
  // Close shipping costs popup
  const closeShippingCostsPopup = () => {
    setSelectedShippingCostDate(null);
    setShippingCosts([]);
  };
  
  // Function to update custom cost price for an order item
  const handleUpdateCustomCost = async (orderId: number, itemId: number, customCostPrice: number): Promise<boolean> => {
    if (!storeId) return false;
    
    try {
      const response = await supplierCostsAPI.updateOrderItemCustomCost(
        storeId,
        orderId,
        itemId,
        customCostPrice
      );
      
      if (response.success) {
        // Refresh the data to show the updated cost
        if (selectedProductCostDate) {
          fetchProductCostDetailsByDate(selectedProductCostDate);
        }
        return true;
      } else {
        console.error('Failed to update custom cost:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating custom cost:', error);
      return false;
    }
  };
  
  // Function to update shipping cost for an order item
  const handleUpdateShippingCost = async (orderId: number, itemId: number, shippingCost: number): Promise<boolean> => {
    if (!storeId) return false;
    
    try {
      const response = await supplierCostsAPI.updateOrderItemShippingCost(
        storeId,
        orderId,
        itemId,
        shippingCost
      );
      
      if (response.success) {
        // Refresh the data to show the updated cost
        if (selectedShippingCostDate) {
          fetchShippingCostDetailsByDate(selectedShippingCostDate);
        }
        return true;
      } else {
        console.error('Failed to update shipping cost:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating shipping cost:', error);
      return false;
    }
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
          productCost: 0,
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
          productCost: acc.expenses.productCost + (item.expenses?.productCost || 0),
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
        productCost: 0,
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
    // Use the error handler component for specific errors
    const errorMessage = error || expensesError || '';
    
    // Check if this is a Multi-Supplier Manager integration error
    if (errorMessage.includes('No active Multi-Supplier Manager integration found')) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8">
          <CashFlowErrorHandler error={errorMessage} storeId={storeId || null} />
          
          {/* Still show the data we have, just without the supplier costs */}
          {dataWithExpenses && dataWithExpenses.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                מציג נתונים ללא עלויות ספקים. הגדר אינטגרציית Multi-Supplier Manager כדי לראות את כל הנתונים.
              </p>
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
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <TableHeader showExpenses={showExpenses && hasExpenses} />
                  
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataWithExpenses.map((item) => (
                      <TableRow 
                        key={item.date}
                        item={item}
                        showExpenses={showExpenses && hasExpenses}
                        onDateClick={handleDateClick}
                        onProductCostClick={handleProductCostClick}
                        onShippingCostClick={handleShippingCostClick}
                        onMarketingExpenseChange={handleMarketingExpenseChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // For other errors, show standard error message
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <CashFlowErrorHandler error={errorMessage} storeId={storeId || null} />
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
                onProductCostClick={handleProductCostClick}
                onShippingCostClick={handleShippingCostClick}
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
      
      {/* Product Costs Popup */}
      <ProductCostsPopup
        selectedDate={selectedProductCostDate}
        productCosts={productCosts}
        loading={productCostsLoading}
        error={productCostsError}
        storeId={storeId}
        onClose={closeProductCostsPopup}
        onUpdateCost={handleUpdateCustomCost}
        onRefresh={() => selectedProductCostDate && fetchProductCostDetailsByDate(selectedProductCostDate)}
      />
      
      {/* Shipping Costs Popup */}
      <ShippingCostsPopup
        selectedDate={selectedShippingCostDate}
        shippingCosts={shippingCosts}
        loading={shippingCostsLoading}
        error={shippingCostsError}
        storeId={storeId}
        onClose={closeShippingCostsPopup}
        onUpdateShippingCost={handleUpdateShippingCost}
        onRefresh={() => selectedShippingCostDate && fetchShippingCostDetailsByDate(selectedShippingCostDate)}
      />
    </div>
  );
};

export default CashFlowTable;
