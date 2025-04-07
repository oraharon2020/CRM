import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// PWA Install Prompt
import PwaInstallPrompt from './components/PwaInstallPrompt';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { StatusSettingsProvider } from './contexts/StatusSettingsContext';
import { ModalsProvider } from './contexts/ModalsContext';
import { StoreProvider } from './contexts/StoreContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Calendar from './pages/Calendar';
import Stores from './pages/Stores';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import ExternalAnalytics from './pages/ExternalAnalytics';
import CashFlow from './pages/CashFlow';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import LeadIntegrationInstructions from './pages/LeadIntegrationInstructions';
import AnalyticsIntegrationInstructions from './pages/AnalyticsIntegrationInstructions';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StatusSettingsProvider>
        <ModalsProvider>
          <StoreProvider>
          <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          
          {/* PWA Install Prompt - will only show on supported browsers */}
          <PwaInstallPrompt />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="stores" element={<Navigate to="/settings?tab=stores" replace />} />
              <Route path="leads" element={<Leads />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="external-analytics" element={<ExternalAnalytics />} />
              <Route path="cashflow" element={<CashFlow />} />
              <Route path="lead-integration-instructions" element={<LeadIntegrationInstructions />} />
              <Route path="analytics-integration-instructions" element={<AnalyticsIntegrationInstructions />} />
              
              {/* Admin-only routes */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </StoreProvider>
        </ModalsProvider>
      </StatusSettingsProvider>
    </AuthProvider>
  );
};

export default App;
