import React, { useState, useEffect } from 'react';
import { ProductCostDetail } from '../utils/types';
import { formatCurrency, formatDate } from '../utils/formatters';
import Spinner from '../../Spinner';
import { HiOutlineX, HiPencilAlt, HiCheck, HiX } from 'react-icons/hi';

interface ProductCostsPopupProps {
  selectedDate: string | null;
  productCosts: ProductCostDetail[];
  loading: boolean;
  error: string | null;
  storeId?: number;
  onClose: () => void;
  onUpdateCost?: (orderId: number, itemId: number, customCostPrice: number) => Promise<boolean>;
  onRefresh?: () => void;
}

/**
 * Popup component to display and edit detailed product costs for a specific date
 */
const ProductCostsPopup: React.FC<ProductCostsPopupProps> = ({
  selectedDate,
  productCosts,
  loading,
  error,
  storeId,
  onClose,
  onUpdateCost,
  onRefresh
}) => {
  // State for edited items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Reset editing state when product costs change
  useEffect(() => {
    setEditingItemId(null);
    setSavingItemId(null);
    setSaveError(null);
  }, [productCosts]);
  
  if (!selectedDate) return null;
  
  // Generate a unique ID for an item
  const getItemId = (item: ProductCostDetail, index: number) => 
    `${item.product_id}-${item.variation_id || 0}-${index}`;
  
  // Start editing an item
  const handleEditClick = (item: ProductCostDetail, index: number) => {
    const itemId = getItemId(item, index);
    setEditingItemId(itemId);
    // Use custom cost if available, otherwise use standard cost
    const costToEdit = item.is_custom_cost ? item.total_cost : (item.standard_cost || item.total_cost);
    setEditValue(costToEdit.toString());
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditValue('');
    setSaveError(null);
  };
  
  // Save edited value
  const handleSaveEdit = async (item: ProductCostDetail, index: number) => {
    const itemId = getItemId(item, index);
    
    // Debug logging
    console.log('Debug - ProductCostsPopup - handleSaveEdit - item:', item);
    console.log('Debug - ProductCostsPopup - handleSaveEdit - order_item_id:', item.order_item_id);
    
    // Validate input
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue < 0) {
      setSaveError('יש להזין ערך מספרי חיובי');
      return;
    }
    
    // Check if we have the necessary props and data
    if (!onUpdateCost || !item.order_id) {
      setSaveError('לא ניתן לעדכן את העלות - חסרים נתונים');
      return;
    }
    
    // Check if order_item_id is missing or zero
    if (!item.order_item_id) {
      console.error('Missing or zero order_item_id:', item);
      setSaveError('מזהה פריט הזמנה חסר או לא תקין');
      return;
    }
    
    try {
      setSavingItemId(itemId);
      setSaveError(null);
      
      // Call the update function
      const success = await onUpdateCost(
        item.order_id,
        item.order_item_id || 0,
        numValue
      );
      
      if (success) {
        // Reset editing state
        setEditingItemId(null);
        setEditValue('');
        
        // Refresh data if callback provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setSaveError('שגיאה בעדכון העלות');
      }
    } catch (error) {
      console.error('Error saving custom cost:', error);
      setSaveError('שגיאה בעדכון העלות');
    } finally {
      setSavingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            פירוט עלויות מוצר - {formatDate(selectedDate)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          ) : productCosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">אין נתוני עלויות מוצר לתאריך זה</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {saveError && (
                <div className="bg-red-50 p-3 mb-4 rounded-lg border border-red-200 text-center">
                  <p className="text-red-700 text-sm">{saveError}</p>
                </div>
              )}
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מוצר
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      וריאציה
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      כמות
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עלות ליחידה
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עלות כוללת
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ספק
                    </th>
                    {onUpdateCost && (
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productCosts.map((item, index) => {
                    const itemId = getItemId(item, index);
                    const isEditing = editingItemId === itemId;
                    const isSaving = savingItemId === itemId;
                    
                    return (
                      <tr key={itemId} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.variation_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right"
                                step="0.01"
                                min="0"
                                disabled={isSaving}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className={`${item.is_custom_cost ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                              {formatCurrency(item.total_cost)}
                              {item.is_custom_cost && (
                                <span className="ml-2 text-xs text-blue-500">(מותאם)</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.supplier_name || '-'}
                        </td>
                        {onUpdateCost && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isEditing ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveEdit(item, index)}
                                  disabled={isSaving}
                                  className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                  title="שמור"
                                >
                                  {isSaving ? <Spinner size="sm" /> : <HiCheck className="h-5 w-5" />}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                  title="בטל"
                                >
                                  <HiX className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditClick(item, index)}
                                className="text-blue-600 hover:text-blue-800"
                                title="ערוך עלות"
                              >
                                <HiPencilAlt className="h-5 w-5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      סה"כ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(
                        productCosts.reduce((sum, item) => sum + item.total_cost, 0)
                      )}
                    </td>
                    <td></td>
                    {onUpdateCost && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none"
              disabled={loading}
            >
              רענן נתונים
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCostsPopup;
