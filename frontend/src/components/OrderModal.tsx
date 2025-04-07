import React, { useState, useEffect } from 'react';
import { HiX, HiCheck, HiTrash, HiPlus } from 'react-icons/hi';
import Spinner from './Spinner';
import { ordersAPI } from '../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  products: Product[];
  total: number;
  status: string;
  date: string;
  notes: string;
}

interface OrderModalProps {
  orderId: number | null; // null for new order
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ orderId, isOpen, onClose, onSave }) => {
  const [order, setOrder] = useState<Order>({
    id: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    products: [],
    total: 0,
    status: 'בטיפול',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Status options
  const statuses = [
    { value: 'בטיפול', label: 'בטיפול' },
    { value: 'הושלם', label: 'הושלם' },
    { value: 'בהמתנה', label: 'בהמתנה' },
    { value: 'בוטל', label: 'בוטל' },
  ];
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return; // New order
      
      try {
        setLoading(true);
        
        // In a real app, we would call the API
        // For now, we'll simulate the data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sample data
        const sampleOrder: Order = {
          id: orderId,
          customerName: 'ישראל ישראלי',
          customerPhone: '050-1234567',
          customerEmail: 'israel@example.com',
          address: 'רחוב הרצל 1, תל אביב',
          products: [
            { id: 1, name: 'מוצר 1', price: 100, quantity: 2 },
            { id: 2, name: 'מוצר 2', price: 150, quantity: 1 },
          ],
          total: 350,
          status: 'בטיפול',
          date: '2025-02-20',
          notes: 'הערות להזמנה',
        };
        
        setOrder(sampleOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchOrder();
    }
  }, [orderId, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = [...order.products];
    
    if (field === 'price' || field === 'quantity') {
      updatedProducts[index][field] = Number(value);
    } else {
      updatedProducts[index][field as 'name'] = value as string;
    }
    
    // Recalculate total
    const total = updatedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    setOrder(prev => ({
      ...prev,
      products: updatedProducts,
      total,
    }));
  };
  
  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now(), // Temporary ID
      name: '',
      price: 0,
      quantity: 1,
    };
    
    setOrder(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };
  
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...order.products];
    updatedProducts.splice(index, 1);
    
    // Recalculate total
    const total = updatedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    setOrder(prev => ({
      ...prev,
      products: updatedProducts,
      total,
    }));
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // In a real app, we would call the API
      // For now, we'll simulate the API call
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {orderId ? `עריכת הזמנה #${orderId}` : 'הזמנה חדשה'}
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">סגור</span>
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mt-4">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                <button
                  className={`${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('details')}
                >
                  פרטי הזמנה
                </button>
                <button
                  className={`${
                    activeTab === 'products'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('products')}
                >
                  מוצרים
                </button>
                <button
                  className={`${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('notes')}
                >
                  הערות
                </button>
              </nav>
            </div>
            
            {/* Content */}
            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                          שם לקוח
                        </label>
                        <input
                          type="text"
                          name="customerName"
                          id="customerName"
                          value={order.customerName}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          טלפון
                        </label>
                        <input
                          type="text"
                          name="customerPhone"
                          id="customerPhone"
                          value={order.customerPhone}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          דוא"ל
                        </label>
                        <input
                          type="email"
                          name="customerEmail"
                          id="customerEmail"
                          value={order.customerEmail}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                          תאריך
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={order.date}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          כתובת
                        </label>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={order.address}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          סטטוס
                        </label>
                        <select
                          name="status"
                          id="status"
                          value={order.status}
                          onChange={handleInputChange}
                          className="input"
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* Products Tab */}
                  {activeTab === 'products' && (
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <h4 className="text-md font-medium text-gray-700">מוצרים</h4>
                        <button
                          type="button"
                          onClick={handleAddProduct}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                          <HiPlus className="h-4 w-4 ml-1" />
                          הוסף מוצר
                        </button>
                      </div>
                      
                      {order.products.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          אין מוצרים בהזמנה
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  מוצר
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  מחיר
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  כמות
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  סה"כ
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  פעולות
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {order.products.map((product, index) => (
                                <tr key={product.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={product.name}
                                      onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                      className="input"
                                      placeholder="שם המוצר"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={product.price}
                                      onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                      className="input"
                                      min="0"
                                      step="0.01"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={product.quantity}
                                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                      className="input"
                                      min="1"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ₪{(product.price * product.quantity).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProduct(index)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <HiTrash className="h-5 w-5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                                  סה"כ
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ₪{order.total.toLocaleString()}
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        הערות
                      </label>
                      <textarea
                        name="notes"
                        id="notes"
                        rows={6}
                        value={order.notes}
                        onChange={handleInputChange}
                        className="input"
                      ></textarea>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Spinner size="sm" color="white" /> : <HiCheck className="h-5 w-5 ml-1" />}
              {saving ? 'שומר...' : 'שמור'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={saving}
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
