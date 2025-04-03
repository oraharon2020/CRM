import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        console.log('Checking authentication status on initial load');
        
        // In a real app, we would call the API to check auth status
        // For now, we'll check if there's a token in localStorage
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? 'exists' : 'missing');
        
        if (token) {
          // Simulate API call to get user data
          // In a real app, we would validate the token with the server
          const userDataStr = localStorage.getItem('user');
          console.log('User data in localStorage:', userDataStr ? 'exists' : 'missing');
          
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              console.log('Parsed user data:', userData);
              
              if (userData && userData.id) {
                console.log('Valid user data found, setting authenticated state');
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                console.warn('Invalid user data (missing ID), clearing localStorage');
                // Invalid user data, clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              // Invalid user data, clear localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } else {
            console.warn('No user data found, clearing token');
            // No user data found, clear token
            localStorage.removeItem('token');
          }
        } else {
          console.log('No token found, user is not authenticated');
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setError('אירעה שגיאה בבדיקת מצב ההתחברות');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null);
      
      try {
        // Try to call the real API to login
        console.log('Attempting to login with API');
        const response = await authAPI.login(credentials.email, credentials.password);
        
        if (response.token && response.user) {
          console.log('API login successful, saving token and user data');
          
          // Store token and user data in localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Verify data was saved correctly
          const savedToken = localStorage.getItem('token');
          const savedUser = localStorage.getItem('user');
          console.log('Saved token:', savedToken);
          console.log('Saved user:', savedUser);
          
          setUser(response.user);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error('API login failed: No token or user data received', response);
          // Fall through to demo credentials
        }
      } catch (apiError) {
        console.error('API login error, falling back to demo credentials:', apiError);
        // Fall through to demo credentials
      }
      
      // Fallback to demo credentials if API call fails
      console.log('Falling back to demo credentials');
      
      // Demo credentials
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        const userData: User = {
          id: 1,
          name: 'מנהל מערכת',
          email: 'admin@example.com',
          role: 'admin',
        };
        
        console.log('Demo login successful, saving token and user data');
        
        // Store token and user data in localStorage
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Verify data was saved correctly
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        console.log('Saved token:', savedToken);
        console.log('Saved user:', savedUser);
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else if (credentials.email === 'manager@example.com' && credentials.password === 'manager123') {
        const userData: User = {
          id: 2,
          name: 'מנהל צוות',
          email: 'manager@example.com',
          role: 'manager',
        };
        
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else if (credentials.email === 'user@example.com' && credentials.password === 'user123') {
        const userData: User = {
          id: 3,
          name: 'משתמש רגיל',
          email: 'user@example.com',
          role: 'user',
        };
        
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Demo login failed: Invalid credentials');
        setError('שם משתמש או סיסמה שגויים');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('אירעה שגיאה בהתחברות');
      return false;
    }
  };
  
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    clearError,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};
