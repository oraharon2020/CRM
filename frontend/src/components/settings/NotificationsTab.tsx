import React from 'react';

const NotificationsTab: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">הגדרות התראות</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">הזמנה חדשה</h3>
            <p className="text-sm text-gray-500">קבל התראה כאשר מתקבלת הזמנה חדשה</p>
          </div>
          <div className="flex items-center">
            <input
              id="notification-new-order"
              name="notification-new-order"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">שינוי סטטוס הזמנה</h3>
            <p className="text-sm text-gray-500">קבל התראה כאשר סטטוס הזמנה משתנה</p>
          </div>
          <div className="flex items-center">
            <input
              id="notification-order-status"
              name="notification-order-status"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">מלאי נמוך</h3>
            <p className="text-sm text-gray-500">קבל התראה כאשר מלאי מוצר נמוך</p>
          </div>
          <div className="flex items-center">
            <input
              id="notification-low-stock"
              name="notification-low-stock"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">תזכורת יומן</h3>
            <p className="text-sm text-gray-500">קבל תזכורות לאירועים ביומן</p>
          </div>
          <div className="flex items-center">
            <input
              id="notification-calendar"
              name="notification-calendar"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
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

export default NotificationsTab;
