import { useState } from 'react';
import { authAPI } from '../services/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authAPI.login(credentials.email, credentials.password);
      
      if (data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return {
          success: true,
          token: data.token,
          user: data.user
        };
      } else {
        setError(data.message || 'אירעה שגיאה בהתחברות');
        return {
          success: false,
          message: data.message || 'אירעה שגיאה בהתחברות'
        };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'אירעה שגיאה בהתחברות';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(data.name, data.email, data.password);
      
      if (response.token) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return {
          success: true,
          token: response.token,
          user: response.user
        };
      } else {
        setError(response.message || 'אירעה שגיאה בהרשמה');
        return {
          success: false,
          message: response.message || 'אירעה שגיאה בהרשמה'
        };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'אירעה שגיאה בהרשמה';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  };
  
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  };
  
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };
  
  return {
    login,
    register,
    logout,
    getUser,
    isAuthenticated,
    loading,
    error
  };
};
