import React from 'react';

const BackupTab: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">גיבוי ושחזור</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">גיבוי נתונים</h3>
          <p className="text-sm text-gray-500 mb-4">
            צור גיבוי של כל נתוני המערכת. הגיבוי כולל הזמנות, לקוחות, מוצרים, הגדרות ועוד.
          </p>
          <div className="flex space-x-4 space-x-reverse">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              גיבוי מלא
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              גיבוי הגדרות בלבד
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">שחזור מגיבוי</h3>
          <p className="text-sm text-gray-500 mb-4">
            שחזר את המערכת מקובץ גיבוי קיים. שים לב: פעולה זו תחליף את כל הנתונים הקיימים במערכת.
          </p>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">
              בחר קובץ גיבוי
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>העלה קובץ</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pr-1">או גרור ושחרר</p>
                </div>
                <p className="text-xs text-gray-500">קובץ ZIP או JSON עד 50MB</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              שחזר מגיבוי
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">גיבוי אוטומטי</h3>
          <p className="text-sm text-gray-500 mb-4">
            הגדר גיבוי אוטומטי של המערכת במרווחי זמן קבועים.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="auto-backup" className="block text-sm font-medium text-gray-700">
                תדירות גיבוי
              </label>
              <select
                id="auto-backup"
                name="auto-backup"
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                defaultValue="weekly"
              >
                <option value="daily">יומי</option>
                <option value="weekly">שבועי</option>
                <option value="monthly">חודשי</option>
                <option value="never">לעולם לא</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="enable-auto-backup"
                name="enable-auto-backup"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="enable-auto-backup" className="mr-2 block text-sm text-gray-900">
                הפעל גיבוי אוטומטי
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              שמור הגדרות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupTab;
