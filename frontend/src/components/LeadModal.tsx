import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usersAPI, storesAPI } from '../services/api';
import Spinner from './Spinner';
import StoreSelector from './StoreSelector';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: any) => void;
  lead?: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    source: string;
    status: string;
    notes?: string;
    assigned_to?: number | null;
    storeId?: number | null;
  };
  title?: string;
  selectedStoreId?: number | null;
}

const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lead,
  title = 'ליד חדש',
  selectedStoreId: initialStoreId
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null | undefined>(undefined);
  const [storeId, setStoreId] = useState<number | null>(initialStoreId || null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { getUser } = useAuth();
  const currentUser = getUser();
  
  // Sources options
  const sourceOptions = [
    'אתר אינטרנט',
    'פייסבוק',
    'גוגל',
    'הפניה',
    'תערוכה',
    'שיחת טלפון',
    'אחר'
  ];
  
  // Status options
  const statusOptions = [
    { value: 'new', label: 'חדש' },
    { value: 'contacted', label: 'נוצר קשר' },
    { value: 'qualified', label: 'מתאים' },
    { value: 'converted', label: 'הומר ללקוח' },
    { value: 'closed', label: 'סגור' }
  ];
  
  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAll();
        
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          // Fallback to sample data
          setUsers([
            { id: 1, name: 'מנהל מערכת', email: 'admin@example.com', role: 'admin' },
            { id: 2, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'manager' },
            { id: 3, name: 'שרה כהן', email: 'sarah@example.com', role: 'user' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to sample data
        setUsers([
          { id: 1, name: 'מנהל מערכת', email: 'admin@example.com', role: 'admin' },
          { id: 2, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'manager' },
          { id: 3, name: 'שרה כהן', email: 'sarah@example.com', role: 'user' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);
  
  // Set form values when lead prop changes
  useEffect(() => {
    if (lead) {
      setName(lead.name || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setSource(lead.source || '');
      setStatus(lead.status || 'new');
      setNotes(lead.notes || '');
      setAssignedTo(lead.assigned_to);
      setStoreId(lead.storeId || null);
    } else {
      // Default values for new lead
      setName('');
      setEmail('');
      setPhone('');
      setSource('');
      setStatus('new');
      setNotes('');
      // Only set assignedTo to currentUser.id when it's undefined
      // This prevents the infinite loop by not updating state on every render
      if (assignedTo === undefined) {
        setAssignedTo(currentUser?.id);
      }
      // Use the initialStoreId if provided, otherwise null
      setStoreId(initialStoreId || null);
    }
  }, [lead, isOpen, initialStoreId]); // Include initialStoreId in dependencies
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData: any = {
      name,
      email,
      phone,
      source,
      status,
      notes,
      assigned_to: assignedTo,
      store_id: storeId,
      storeId: storeId // Include both formats to ensure compatibility
    };
    
    if (lead?.id) {
      leadData.id = lead.id;
    }
    
    console.log('Saving lead with data:', leadData);
    onSave(leadData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-medium text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                שם <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                אימייל
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                טלפון
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                מקור <span className="text-red-500">*</span>
              </label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">בחר מקור</option>
                {sourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                סטטוס
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Store */}
            <div>
              <label htmlFor="store" className="block text-sm font-medium text-gray-700">
                חנות
              </label>
              <div className="mt-1">
                <StoreSelector 
                  selectedStoreId={storeId} 
                  onStoreChange={setStoreId} 
                />
              </div>
            </div>
            
            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                משויך ל
              </label>
              {loading ? (
                <div className="mt-1 flex items-center">
                  <Spinner size="sm" />
                  <span className="mr-2 text-sm text-gray-500">טוען משתמשים...</span>
                </div>
              ) : (
                <select
                  id="assignedTo"
                  value={assignedTo || ''}
                  onChange={(e) => setAssignedTo(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">לא משויך</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                הערות
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t flex justify-end space-x-2 space-x-reverse">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
