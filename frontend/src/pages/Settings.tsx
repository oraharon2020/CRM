import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  UsersTab,
  GeneralTab,
  NotificationsTab,
  IntegrationsTab,
  StoresTab,
  BackupTab
} from '../components/settings';

const Settings: React.FC = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('users');
  const location = useLocation();
  
  // Set active tab based on URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam && ['users', 'general', 'notifications', 'integrations', 'stores', 'backup'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">הגדרות מערכת</h1>
        <p className="text-gray-500">ניהול משתמשים והגדרות מערכת</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('users')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            משתמשים
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            הגדרות כלליות
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            התראות
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            חיבורים
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'stores'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            חנויות
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'backup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            גיבוי ושחזור
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'stores' && <StoresTab />}
        {activeTab === 'backup' && <BackupTab />}
      </div>
    </div>
  );
};

export default Settings;
