import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { MailIcon, LockIcon, InfoIcon } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError, error]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with:', { email });
      const success = await login({ email, password });
      
      if (success) {
        console.log('Login successful, navigating to:', from);
        
        // Check if localStorage has the token and user
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        console.log('Token in localStorage:', token ? 'exists' : 'missing');
        console.log('User in localStorage:', user ? 'exists' : 'missing');
        
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        console.error('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8" 
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-0">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">Global CRM</h1>
            </div>
            <CardTitle className="text-center text-2xl">התחברות למערכת</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">כתובת אימייל</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-3"
                    placeholder="הזן את האימייל שלך"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-3"
                    placeholder="הזן את הסיסמה שלך"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    'התחבר'
                  )}
                </Button>
              </div>
            </form>
            
            <div className="rounded-md bg-blue-50 p-3 text-sm border border-blue-100">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700">פרטי התחברות לדוגמה:</span>
              </div>
              <div className="mt-1 text-sm text-blue-600">
                <p>דוא"ל: admin@example.com</p>
                <p>סיסמה: admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
