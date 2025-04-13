import React from 'react';

const GeneralTab: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">הגדרות כלליות</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
            שם החברה
          </label>
          <input
            type="text"
            name="company-name"
            id="company-name"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultValue="Global CRM"
          />
        </div>
        
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            אזור זמן
          </label>
          <select
            id="timezone"
            name="timezone"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultValue="Asia/Jerusalem"
          >
            <option value="Asia/Jerusalem">ישראל (GMT+2)</option>
            <option value="Europe/London">לונדון (GMT+0)</option>
            <option value="America/New_York">ניו יורק (GMT-5)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            שפה
          </label>
          <select
            id="language"
            name="language"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            defaultValue="he"
          >
            <option value="he">עברית</option>
            <option value="en">אנגלית</option>
            <option value="ar">ערבית</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            שמור שינויים
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
