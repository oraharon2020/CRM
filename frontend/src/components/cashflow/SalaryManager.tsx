import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck, HiChevronDown, HiChevronUp, HiDocumentDuplicate, HiSelector } from 'react-icons/hi';
import Spinner from '../Spinner';
import { salariesAPI } from '../../services/expenses-api';

interface Salary {
  id?: number;
  store_id: number;
  employee_name: string;
  position?: string;
  gross_salary: number;
  employer_costs: number;
  month: number;
  year: number;
}

interface SalaryManagerProps {
  storeId: number;
  month: number;
  year: number;
  onSalaryChange?: () => void;
}

const SalaryManager: React.FC<SalaryManagerProps> = ({
  storeId,
  month,
  year,
  onSalaryChange
}) => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // New salary form state
  const [isAddingSalary, setIsAddingSalary] = useState(false);
  const [newSalary, setNewSalary] = useState<Omit<Salary, 'id'>>({
    store_id: storeId,
    employee_name: '',
    position: '',
    gross_salary: 0,
    employer_costs: 0,
    month: month,
    year: year
  });
  
  // Edit salary state
  const [editingSalaryId, setEditingSalaryId] = useState<number | null>(null);
  const [editedSalary, setEditedSalary] = useState<Salary | null>(null);
  
  // Multi-selection state
  const [selectedSalaries, setSelectedSalaries] = useState<number[]>([]);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Fetch salaries
  const fetchSalaries = async () => {
    if (!storeId || !month || !year) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await salariesAPI.getByStoreIdAndMonthYear(storeId, month, year);
      
      if (response.success && response.data) {
        setSalaries(response.data);
      } else {
        setSalaries([]);
        setError(response.message || 'Failed to fetch salaries');
      }
    } catch (error: any) {
      console.error('Error fetching salaries:', error);
      setError(`Failed to fetch salaries: ${error.message || 'Unknown error'}`);
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new salary
  const createSalary = async () => {
    if (!storeId || !newSalary.employee_name || !newSalary.gross_salary) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Log the data being sent to the API
      const salaryData = {
        ...newSalary,
        store_id: storeId,
        gross_salary: parseFloat(newSalary.gross_salary.toString()),
        employer_costs: parseFloat(newSalary.employer_costs.toString()),
        month: month,
        year: year
      };
      
      console.log('Sending salary data to API:', salaryData);
      
      const response = await salariesAPI.create(salaryData);
      
      if (response.success && response.data) {
        // Reset form
        setNewSalary({
          store_id: storeId,
          employee_name: '',
          position: '',
          gross_salary: 0,
          employer_costs: 0,
          month: month,
          year: year
        });
        setIsAddingSalary(false);
        
        // Refresh salaries
        fetchSalaries();
        
        // Notify parent
        if (onSalaryChange) {
          onSalaryChange();
        }
      } else {
        setError(response.message || 'Failed to create salary');
      }
    } catch (error: any) {
      console.error('Error creating salary:', error);
      setError(`Failed to create salary: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update a salary
  const updateSalary = async () => {
    if (!editedSalary || !editedSalary.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await salariesAPI.update(editedSalary.id, {
        employee_name: editedSalary.employee_name,
        position: editedSalary.position,
        gross_salary: parseFloat(editedSalary.gross_salary.toString()),
        employer_costs: parseFloat(editedSalary.employer_costs.toString())
      });
      
      if (response.success) {
        // Reset edit state
        setEditingSalaryId(null);
        setEditedSalary(null);
        
        // Refresh salaries
        fetchSalaries();
        
        // Notify parent
        if (onSalaryChange) {
          onSalaryChange();
        }
      } else {
        setError(response.message || 'Failed to update salary');
      }
    } catch (error: any) {
      console.error('Error updating salary:', error);
      setError(`Failed to update salary: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a salary
  const deleteSalary = async (id: number) => {
    if (!id) return;
    
    if (!confirm('האם אתה בטוח שברצונך למחוק שכר זה?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await salariesAPI.delete(id);
      
      if (response.success) {
        // Refresh salaries
        fetchSalaries();
        
        // Notify parent
        if (onSalaryChange) {
          onSalaryChange();
        }
      } else {
        setError(response.message || 'Failed to delete salary');
      }
    } catch (error: any) {
      console.error('Error deleting salary:', error);
      setError(`Failed to delete salary: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete multiple salaries
  const deleteSelectedSalaries = async () => {
    if (selectedSalaries.length === 0) return;
    
    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedSalaries.length} שכר עובדים?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Delete each selected salary
      for (const id of selectedSalaries) {
        try {
          const response = await salariesAPI.delete(id);
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
      setSelectedSalaries([]);
      
      // Refresh salaries
      fetchSalaries();
      
      // Notify parent
      if (onSalaryChange) {
        onSalaryChange();
      }
      
      // Show result message
      if (errorCount > 0) {
        setError(`נמחקו ${successCount} שכר עובדים בהצלחה, ${errorCount} נכשלו`);
      }
    } catch (error: any) {
      console.error('Error deleting salaries:', error);
      setError(`Failed to delete salaries: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle selection of a single salary
  const toggleSalarySelection = (id: number) => {
    setSelectedSalaries(prev => {
      if (prev.includes(id)) {
        return prev.filter(salaryId => salaryId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Toggle selection of all salaries
  const toggleSelectAll = () => {
    if (selectedSalaries.length === salaries.length) {
      // If all are selected, unselect all
      setSelectedSalaries([]);
    } else {
      // Otherwise, select all
      setSelectedSalaries(salaries.filter(salary => salary.id !== undefined).map(salary => salary.id!) || []);
    }
  };
  
  // Copy salaries from previous month
  const copySalariesFromPreviousMonth = async () => {
    if (!storeId || !month || !year) return;
    
    if (!confirm('האם אתה בטוח שברצונך להעתיק את השכר מהחודש הקודם?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await salariesAPI.copyFromPreviousMonth(storeId, month, year);
      
      if (response.success) {
        // Refresh salaries
        fetchSalaries();
        
        // Notify parent
        if (onSalaryChange) {
          onSalaryChange();
        }
      } else {
        setError(response.message || 'Failed to copy salaries from previous month');
      }
    } catch (error: any) {
      console.error('Error copying salaries from previous month:', error);
      setError(`Failed to copy salaries: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing a salary
  const startEditing = (salary: Salary) => {
    if (salary.id !== undefined) {
      setEditingSalaryId(salary.id);
      setEditedSalary({ ...salary });
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingSalaryId(null);
    setEditedSalary(null);
  };
  
  // Handle new salary form changes
  const handleNewSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSalary(prev => ({
      ...prev,
      [name]: ['gross_salary', 'employer_costs'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };
  
  // Handle edited salary form changes
  const handleEditedSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedSalary) return;
    
    const { name, value } = e.target;
    setEditedSalary(prev => ({
      ...prev!,
      [name]: ['gross_salary', 'employer_costs'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };
  
  // Calculate total salaries with proper numeric handling
  const calculateTotals = () => {
    const grossTotal = salaries.reduce((sum, salary) => {
      // Parse gross_salary to number if it's a string
      let grossSalary = 0;
      if (typeof salary.gross_salary === 'number' && !isNaN(salary.gross_salary)) {
        grossSalary = salary.gross_salary;
      } else if (typeof salary.gross_salary === 'string') {
        grossSalary = parseFloat(salary.gross_salary) || 0;
      }
      return sum + grossSalary;
    }, 0);
    
    const employerCostsTotal = salaries.reduce((sum, salary) => {
      // Parse employer_costs to number if it's a string
      let employerCosts = 0;
      if (typeof salary.employer_costs === 'number' && !isNaN(salary.employer_costs)) {
        employerCosts = salary.employer_costs;
      } else if (typeof salary.employer_costs === 'string') {
        employerCosts = parseFloat(salary.employer_costs) || 0;
      }
      return sum + employerCosts;
    }, 0);
    
    const total = grossTotal + employerCostsTotal;
    
    return { grossTotal, employerCostsTotal, total };
  };
  
  const { grossTotal, employerCostsTotal, total } = calculateTotals();
  
  // Fetch salaries when component mounts or when storeId, month, or year changes
  useEffect(() => {
    if (storeId && month && year) {
      fetchSalaries();
      
      // Update new salary form with current month and year
      setNewSalary(prev => ({
        ...prev,
        month: month,
        year: year
      }));
    }
  }, [storeId, month, year]);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          שכר עובדים
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isExpanded ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
          </button>
          <button
            onClick={copySalariesFromPreviousMonth}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={loading}
            title="העתק שכר מחודש קודם"
          >
            <HiDocumentDuplicate className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsAddingSalary(true)}
            className="p-1 rounded-full text-blue-500 hover:text-blue-700 focus:outline-none"
            disabled={loading || isAddingSalary}
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
          
          {/* Add salary form */}
          {isAddingSalary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">הוספת שכר עובד חדש</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700 mb-1">
                    שם העובד <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employee_name"
                    name="employee_name"
                    value={newSalary.employee_name}
                    onChange={handleNewSalaryChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    תפקיד
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={newSalary.position}
                    onChange={handleNewSalaryChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="gross_salary" className="block text-sm font-medium text-gray-700 mb-1">
                    שכר ברוטו <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="gross_salary"
                    name="gross_salary"
                    value={newSalary.gross_salary}
                    onChange={handleNewSalaryChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="employer_costs" className="block text-sm font-medium text-gray-700 mb-1">
                    עלויות מעסיק
                  </label>
                  <input
                    type="number"
                    id="employer_costs"
                    name="employer_costs"
                    value={newSalary.employer_costs}
                    onChange={handleNewSalaryChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end space-x-2 space-x-reverse">
                  <button
                    onClick={createSalary}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'שמור'}
                  </button>
                  <button
                    onClick={() => setIsAddingSalary(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Salaries table */}
          {loading && !salaries.length ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : salaries.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                {selectedSalaries.length > 0 && (
                  <button
                    onClick={deleteSelectedSalaries}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                    disabled={loading}
                  >
                    <HiTrash className="h-4 w-4 ml-1" />
                    מחק נבחרים ({selectedSalaries.length})
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
                        checked={salaries.length > 0 && selectedSalaries.length === salaries.length}
                        onChange={toggleSelectAll}
                        disabled={loading || salaries.length === 0}
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם העובד
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תפקיד
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שכר ברוטו
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עלויות מעסיק
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סה"כ עלות
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaries.map((salary) => (
                    <tr key={salary.id} className="hover:bg-gray-50">
                      {editingSalaryId === salary.id ? (
                        // Edit mode
                        <>
                          <td className="px-2 py-4 whitespace-nowrap text-center">
                            <div className="h-4 w-4"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              name="employee_name"
                              value={editedSalary?.employee_name || ''}
                              onChange={handleEditedSalaryChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              name="position"
                              value={editedSalary?.position || ''}
                              onChange={handleEditedSalaryChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              name="gross_salary"
                              value={editedSalary?.gross_salary || 0}
                              onChange={handleEditedSalaryChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              name="employer_costs"
                              value={editedSalary?.employer_costs || 0}
                              onChange={handleEditedSalaryChange}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency((editedSalary?.gross_salary || 0) + (editedSalary?.employer_costs || 0))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={updateSalary}
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
                              checked={salary.id !== undefined && selectedSalaries.includes(salary.id)}
                              onChange={() => salary.id !== undefined && toggleSalarySelection(salary.id)}
                              disabled={loading || salary.id === undefined}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {salary.employee_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {salary.position || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(salary.gross_salary)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(salary.employer_costs)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(salary.gross_salary + salary.employer_costs)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => startEditing(salary)}
                              className="text-blue-600 hover:text-blue-900 ml-2"
                              disabled={loading}
                            >
                              <HiPencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => salary.id !== undefined && deleteSalary(salary.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={loading || salary.id === undefined}
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
                    <td></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(grossTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(employerCostsTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(total)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">אין שכר עובדים להצגה</p>
              <div className="mt-4 flex justify-center space-x-2 space-x-reverse">
                <button
                  onClick={() => setIsAddingSalary(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  הוסף שכר עובד חדש
                </button>
                <button
                  onClick={copySalariesFromPreviousMonth}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  העתק מחודש קודם
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryManager;
