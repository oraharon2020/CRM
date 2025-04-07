import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface User {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: User) => Promise<void>;
  user?: User | null;
  title: string;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, title }) => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    role: 'user',
  });
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      setPassword('');
    } else if (isOpen) {
      // New user
      setFormData({
        name: '',
        email: '',
        role: 'user',
      });
      setPassword('');
    }
    setError(null);
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.name.trim()) {
      setError('שם הוא שדה חובה');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('דוא"ל הוא שדה חובה');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('כתובת דוא"ל לא תקינה');
      return;
    }
    
    // Password is required for new users
    if (!user?.id && !password) {
      setError('סיסמה היא שדה חובה למשתמש חדש');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Include password only if it's provided
      const userData = {
        ...formData,
        ...(password ? { password } : {}),
      };
      
      await onSave(userData);
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('אירעה שגיאה בשמירת המשתמש');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" dir="rtl">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          
          <form className="mt-4 text-right" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                שם
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                דוא"ל
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה {user?.id ? '(השאר ריק לשמירת הסיסמה הקיימת)' : ''}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required={!user?.id}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                תפקיד
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admin">מנהל מערכת</option>
                <option value="manager">מנהל צוות</option>
                <option value="user">משתמש רגיל</option>
              </select>
            </div>
            
            {error && (
              <div className="mb-4 text-sm text-red-600">{error}</div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {isSubmitting ? <Spinner size="sm" color="white" /> : 'שמור'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
