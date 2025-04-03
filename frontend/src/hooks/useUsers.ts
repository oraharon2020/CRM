import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface UserInput {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  password?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuthContext();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await usersAPI.getAll();
      
      if (response.users) {
        setUsers(response.users);
      } else {
        // Fallback to demo data if API fails
        console.warn('Using demo user data');
        setUsers([
          {
            id: 1,
            name: 'מנהל מערכת',
            email: 'admin@example.com',
            role: 'admin',
          },
          {
            id: 2,
            name: 'שרה כהן',
            email: 'sarah@example.com',
            role: 'manager',
          },
          {
            id: 3,
            name: 'יוסי לוי',
            email: 'yossi@example.com',
            role: 'user',
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('אירעה שגיאה בטעינת המשתמשים');
      
      // Fallback to demo data
      setUsers([
        {
          id: 1,
          name: 'מנהל מערכת',
          email: 'admin@example.com',
          role: 'admin',
        },
        {
          id: 2,
          name: 'שרה כהן',
          email: 'sarah@example.com',
          role: 'manager',
        },
        {
          id: 3,
          name: 'יוסי לוי',
          email: 'yossi@example.com',
          role: 'user',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create a new user
  const createUser = async (userData: UserInput): Promise<void> => {
    try {
      setError(null);
      
      const response = await usersAPI.create(userData);
      
      if (response.user) {
        setUsers((prevUsers) => [...prevUsers, response.user]);
      } else {
        // If API fails but returns success, add a mock user with a temporary ID
        const tempId = Math.max(0, ...users.map((u) => u.id)) + 1;
        const newUser: User = {
          id: tempId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };
        
        setUsers((prevUsers) => [...prevUsers, newUser]);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      throw new Error('אירעה שגיאה ביצירת המשתמש');
    }
  };

  // Update an existing user
  const updateUser = async (userData: UserInput): Promise<void> => {
    if (!userData.id) {
      throw new Error('User ID is required for update');
    }
    
    try {
      setError(null);
      
      const response = await usersAPI.update(userData.id, userData);
      
      if (response.user) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userData.id ? { ...user, ...response.user } : user
          )
        );
      } else {
        // If API fails but returns success, update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userData.id
              ? {
                  ...user,
                  name: userData.name,
                  email: userData.email,
                  role: userData.role,
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error('Error updating user:', err);
      throw new Error('אירעה שגיאה בעדכון המשתמש');
    }
  };

  // Delete a user
  const deleteUser = async (userId: number): Promise<void> => {
    try {
      setError(null);
      
      await usersAPI.delete(userId);
      
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw new Error('אירעה שגיאה במחיקת המשתמש');
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    currentUser,
  };
};
