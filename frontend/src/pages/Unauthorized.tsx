import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuthContext();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m0 0V6m0 2h2m-2 0H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">אין הרשאה</h1>
        <p className="mt-2 text-lg text-gray-600">
          אין לך הרשאה לצפות בדף זה.
        </p>
        {user && (
          <p className="mt-1 text-sm text-gray-500">
            אתה מחובר כ{user.role === 'admin' ? 'מנהל' : user.role === 'manager' ? 'מנהל צוות' : 'עובד'}.
          </p>
        )}
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            חזרה ללוח הבקרה
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
