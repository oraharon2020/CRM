import React, { useState } from 'react';
import { HiOutlineExclamationCircle, HiOutlineX, HiOutlineCog } from 'react-icons/hi';
import { Link } from 'react-router-dom';

interface CashFlowErrorHandlerProps {
  error: string;
  storeId: number | null;
}

/**
 * Component to handle and display specific error messages in the CashFlow component
 * with helpful instructions for resolution
 */
const CashFlowErrorHandler: React.FC<CashFlowErrorHandlerProps> = ({ error, storeId }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Check if this is a Multi-Supplier Manager integration error
  const isMsmError = error.includes('No active Multi-Supplier Manager integration found');

  if (!isMsmError) {
    // For other errors, just display the error message
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <HiOutlineExclamationCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 mr-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => setDismissed(true)}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
              >
                <span className="sr-only">סגור</span>
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For Multi-Supplier Manager integration errors, provide helpful instructions
  return (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <HiOutlineExclamationCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 mr-2">
          <h3 className="text-sm font-medium text-yellow-800">
            לא נמצאה אינטגרציית Multi-Supplier Manager פעילה לחנות זו
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              כדי להציג נתוני עלויות מוצר וספקים, יש להגדיר אינטגרציה עם פלאגין Multi-Supplier Manager.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>ודא שפלאגין Multi-Supplier Manager מותקן ומופעל בחנות הוורדפרס שלך</li>
              <li>הגדר אינטגרציה חדשה בהגדרות המערכת</li>
              <li>ודא שהאינטגרציה משויכת לחנות הנוכחית (מזהה חנות: {storeId})</li>
              <li>ודא שהאינטגרציה מופעלת (סטטוס: פעיל)</li>
            </ul>
            <div className="mt-3">
              <Link
                to="/settings?tab=integrations&category=inventory"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none"
              >
                <HiOutlineCog className="mr-2 -ml-0.5 h-4 w-4" />
                הגדר אינטגרציה
              </Link>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none"
            >
              <span className="sr-only">סגור</span>
              <HiOutlineX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowErrorHandler;
