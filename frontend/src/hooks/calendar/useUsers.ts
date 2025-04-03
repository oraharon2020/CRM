import { useState, useEffect } from 'react';
import { User } from '../../types/calendar.types';

/**
 * Hook for fetching and managing users
 * @returns Object containing users and loading state
 */
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would call the API
        // For now, we'll simulate the data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Sample data
        const sampleUsers: User[] = [
          { id: 1, name: 'מנהל מערכת', email: 'admin@example.com', role: 'admin' },
          { id: 2, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'manager' },
          { id: 3, name: 'שרה כהן', email: 'sarah@example.com', role: 'user' },
        ];
        
        setUsers(sampleUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User object or null if not found
   */
  const getUserById = (userId?: number) => {
    if (!userId) return null;
    return users.find(user => user.id === userId) || null;
  };

  return {
    users,
    loading,
    getUserById
  };
};
