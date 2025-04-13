import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck, HiChevronDown, HiChevronUp, HiSelector } from 'react-icons/hi';
import Spinner from '../Spinner';
import { vatExpensesAPI, nonVatExpensesAPI } from '../../services/expenses-api';

interface Expense {
  id?: number;
  store_id: number;
  description: string;
  amount: number;
  expense_date: string;
}

interface ExpenseManagerProps {
  storeId: number;
  month: number;
  year: number;
  type: 'vat' | 'non-vat';
  onExpenseChange?: () => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  storeId,
  month,
  year,
  type,
  onExpenseChange
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // New expense form state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    store_id: storeId,
    description: '',
    amount: 0,
    expense_date: ''
  });
  
  // Edit expense state
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editedExpense, setEditedExpense] = useState<Expense | null>(null);
  
  // Multi-selection state
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'תאריך לא תקין';
      }
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      return 'תאריך לא תקין';
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate start and end dates for the month
  const getMonthDateRange = () => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  // Fetch expenses
  const fetchExpenses = async () => {
    if (!storeId || !month || !year) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getMonthDateRange();
      
      const api = type === 'vat' ? vatExpensesAPI : nonVatExpensesAPI;
      const response = await api.getByStoreIdAndDateRange(storeId, startDate, endDate);
      
      if (response.success && response.data) {
        setExpenses(response.data);
      } else {
        setExpenses([]);
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (error: any) {
      console.error(`Error fetching ${type} expenses:`, error);
      setError(`Failed to fetch expenses: ${error.message || 'Unknown error'}`);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new expense
  const createExpense = async () => {
    if (!storeId || !newExpense.description || !newExpense.amount || !newExpense.expense_date) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const api = type === 'vat' ? vatExpensesAPI : nonVatExpensesAPI;
      const response = await api.create({
        ...newExpense,
        store_id: storeId,
        amount: parseFloat(newExpense.amount.toString())
      });
      
      if (response.success && response.data) {
        // Reset form
        setNewExpense({
          store_id: storeId,
          description: '',
          amount: 0,
          expense_date: ''
        });
        setIsAddingExpense(false);
        
        // Refresh expenses
        fetchExpenses();
        
        // Notify parent
        if (onExpenseChange) {
          onExpenseChange();
        }
      } else {
        setError(response.message || 'Failed to create expense');
      }
    } catch (error: any) {
      console.error(`Error creating ${type} expense:`, error);
      setError(`Failed to create expense: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update an expense
  const updateExpense = async () => {
    if (!editedExpense || !editedExpense.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const api = type === 'vat' ? vatExpensesAPI : nonVatExpensesAPI;
      const response = await api.update(editedExpense.id, {
        description: editedExpense.description,
        amount: parseFloat(editedExpense.amount.toString()),
        expense_date: editedExpense.expense_date
      });
      
      if (response.success) {
        // Reset edit state
        setEditingExpenseId(null);
        setEditedExpense(null);
        
        // Refresh expenses
        fetchExpenses();
        
        // Notify parent
        if (onExpenseChange) {
          onExpenseChange();
        }
      } else {
        setError(response.message || 'Failed to update expense');
      }
    } catch (error: any) {
      console.error(`Error updating ${type} expense:`, error);
      setError(`Failed to update expense: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an expense
  const deleteExpense = async (id: number) => {
    if (!id) return;
    
    if (!confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const api = type === 'vat' ? vatExpensesAPI : nonVatExpensesAPI;
      const response = await api.delete(id);
      
      if (response.success) {
        // Refresh expenses
        fetchExpenses();
        
        // Notify parent
        if (onExpenseChange) {
          onExpenseChange();
        }
      } else {
        setError(response.message || 'Failed to delete expense');
      }
    } catch (error: any) {
      console.error(`Error deleting ${type} expense:`, error);
      setError(`Failed to delete expense: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete multiple expenses
  const deleteSelectedExpenses = async () => {
    if (selectedExpenses.length === 0) return;
    
    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedExpenses.length} הוצאות?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const api = type === 'vat' ? vatExpensesAPI : nonVatExpensesAPI;
      
      // Delete each selected expense
      for (const id of selectedExpenses) {
        try {
          const response = await api.delete(id);
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }
      
      // Clear selection
      setSelectedExpenses([]);
      
      // Refresh expenses
      fetchExpenses();
      
      // Notify parent
      if (onExpenseChange) {
        onExpenseChange();
      }
      
      // Show result message
      if (errorCount > 0) {
        setError(`נמחקו ${successCount} הוצאות בהצלחה, ${errorCount} הוצאות נכשלו`);
      }
    } catch (error: any) {
      console.error(`Error deleting ${type} expenses:`, error);
      setError(`Failed to delete expenses: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle selection of a single expense
  const toggleExpenseSelection = (id: number) => {
    setSelectedExpenses(prev => {
      if (prev.includes(id)) {
        return prev.filter(expenseId => expenseId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Toggle selection of all expenses
  const toggleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      // If all are selected, unselect all
      setSelectedExpenses([]);
    } else {
      // Otherwise, select all
      setSelectedExpenses(expenses.filter(expense => expense.id !== undefined).map(expense => expense.id!) || []);
    }
  };
  
  // Start editing an expense
  const startEditing = (expense: Expense) => {
    if (expense.id !== undefined) {
      setEditingExpenseId(expense.id);
      setEditedExpense({ ...expense });
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingExpenseId(null);
    setEditedExpense(null);
  };
  
  // Handle new expense form changes
  const handleNewExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Limit amount to prevent numeric overflow (DECIMAL(10,2) can store up to 99,999,999.99)
      const parsedAmount = parseFloat(value) || 0;
      const maxAmount = 99999999.99;
      
      if (parsedAmount > maxAmount) {
        setError(`הסכום המקסימלי המותר הוא ${maxAmount.toLocaleString()}`);
        setNewExpense(prev => ({
          ...prev,
          [name]: maxAmount
        }));
      } else {
        setError(null);
        setNewExpense(prev => ({
          ...prev,
          [name]: parsedAmount
        }));
      }
    } else {
      setNewExpense(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle edited expense form changes
  const handleEditedExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedExpense) return;
    
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Limit amount to prevent numeric overflow (DECIMAL(10,2) can store up to 99,999,999.99)
      const parsedAmount = parseFloat(value) || 0;
      const maxAmount = 99999999.99;
      
      if (parsedAmount > maxAmount) {
        setError(`הסכום המקסימלי המותר הוא ${maxAmount.toLocaleString()}`);
        setEditedExpense(prev => ({
          ...prev!,
          [name]: maxAmount
        }));
      } else {
        setError(null);
        setEditedExpense(prev => ({
          ...prev!,
          [name]: parsedAmount
        }));
      }
    } else {
      setEditedExpense(prev => ({
        ...prev!,
        [name]: value
      }));
    }
  };
  
  // Calculate total expenses with proper numeric handling
  const totalExpenses = expenses.reduce((sum, expense) => {
    // Parse amount to number if it's a string
    let amount = 0;
    if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
      amount = expense.amount;
    } else if (typeof expense.amount === 'string') {
      amount = parseFloat(expense.amount) || 0;
    }
    return sum + amount;
  }, 0);
  
  // Fetch expenses when component mounts or when storeId, month, or year changes
  useEffect(() => {
    if (storeId && month && year) {
      fetchExpenses();
      
      // Set default expense date to the first day of the month
      const defaultDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      setNewExpense(prev => ({
        ...prev,
        expense_date: defaultDate
      }));
    }
  }, [storeId, month, year]);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {type === 'vat' ? 'הוצאות עם מע"מ' : 'הוצאות ללא מע"מ'}
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isExpanded ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsAddingExpense(true)}
            className="p-1 rounded-full text-blue-500 hover:text-blue-700 focus:outline-none"
            disabled={loading || isAddingExpense}
          >
            <HiPlus className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Add expense form */}
          {isAddingExpense && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">הוספת הוצאה חדשה</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    תיאור
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={newExpense.description}
                    onChange={handleNewExpenseChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    סכום
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={newExpense.amount}
                    onChange={handleNewExpenseChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך
                  </label>
                  <input
                    type="date"
                    id="expense_date"
                    name="expense_date"
                    value={newExpense.expense_date}
                    onChange={handleNewExpenseChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end space-x-2 space-x-reverse">
                  <button
                    onClick={createExpense}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'שמור'}
                  </button>
                  <button
                    onClick={() => setIsAddingExpense(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Expenses table */}
          {loading && !expenses.length ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                {selectedExpenses.length > 0 && (
                  <button
                    onClick={deleteSelectedExpenses}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                    disabled={loading}
                  >
                    <HiTrash className="h-4 w-4 ml-1" />
                    מחק נבחרים ({selectedExpenses.length})
                  </button>
                )}
                <div className="flex-grow"></div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={expenses.length > 0 && selectedExpenses.length === expenses.length}
                        onChange={toggleSelectAll}
                        disabled={loading || expenses.length === 0}
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תיאור
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סכום
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      {editingExpenseId === expense.id ? (
                        // Edit mode
                        <>
                          <td className="px-2 py-4 whitespace-nowrap text-center">
                            <div className="h-4 w-4"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              name="description"
                              value={editedExpense?.description || ''}
                              onChange={handleEditedExpenseChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              name="amount"
                              value={editedExpense?.amount || 0}
                              onChange={handleEditedExpenseChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="date"
                              name="expense_date"
                              value={editedExpense?.expense_date || ''}
                              onChange={handleEditedExpenseChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={updateExpense}
                              className="text-green-600 hover:text-green-900 ml-2"
                              disabled={loading}
                            >
                              <HiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-900"
                              disabled={loading}
                            >
                              <HiX className="h-5 w-5" />
                            </button>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-2 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={expense.id !== undefined && selectedExpenses.includes(expense.id)}
                              onChange={() => expense.id !== undefined && toggleExpenseSelection(expense.id)}
                              disabled={loading || expense.id === undefined}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(expense.expense_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => startEditing(expense)}
                              className="text-blue-600 hover:text-blue-900 ml-2"
                              disabled={loading}
                            >
                              <HiPencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => expense.id !== undefined && deleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={loading || expense.id === undefined}
                            >
                              <HiTrash className="h-5 w-5" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  
                  {/* Total row */}
                  <tr className="bg-gray-50">
                    <td></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      סה"כ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">אין הוצאות להצגה</p>
              <button
                onClick={() => setIsAddingExpense(true)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                הוסף הוצאה חדשה
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
