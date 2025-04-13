import React, { useState } from 'react';
import { HiInformationCircle } from 'react-icons/hi';

interface TableHeaderProps {
  showExpenses: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({ showExpenses }) => {
  const [showVatTooltip, setShowVatTooltip] = useState(false);

  return (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          תאריך
        </th>
        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          הכנסות
        </th>
        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          מספר הזמנות
        </th>
        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          מספר מוצרים
        </th>
        
        {showExpenses && (
          <>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              עלות מוצר
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              הובלות
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              הוצאות עם מע"מ
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              הוצאות ללא מע"מ
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              שכר עובדים
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              פייסבוק
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              גוגל
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              טיקטוק
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider relative"
              onClick={() => setShowVatTooltip(!showVatTooltip)}
              style={{ cursor: 'pointer' }}
            >
              מע"מ
              <HiInformationCircle className="inline-block mr-1 h-4 w-4 text-gray-400" />
              
              {showVatTooltip && (
                <div className="absolute z-10 top-full right-0 mt-1 w-72 p-3 bg-white rounded-md shadow-lg border border-gray-200 text-xs text-gray-700 text-right">
                  <p className="font-bold mb-1">אופן חישוב המע"מ:</p>
                  <p>מע"מ = (הכנסות היום × 18% ÷ 1.18) - (הוצאות עם מע"מ × 18% ÷ 1.18)</p>
                  <p className="mt-2 text-xs text-gray-500">* ההכנסות וההוצאות כבר כוללות מע"מ</p>
                  <p className="mt-1 text-gray-500">לחץ שוב כדי לסגור</p>
                </div>
              )}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              סה"כ הוצאות
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              רווח נקי
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              ROI
            </th>
          </>
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;
