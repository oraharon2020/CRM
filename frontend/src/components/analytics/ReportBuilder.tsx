import React, { useState } from 'react';
import { HiDownload, HiFilter, HiRefresh } from 'react-icons/hi';
import Spinner from '../Spinner';
import DateRangePicker from '../DateRangePicker';
import { analyticsAPI } from '../../services/api';

interface ReportBuilderProps {
  storeId: number;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ storeId }) => {
  // Date range state
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // Report options state
  const [groupBy, setGroupBy] = useState<string>('day');
  const [includeProducts, setIncludeProducts] = useState<boolean>(true);
  const [includeCustomers, setIncludeCustomers] = useState<boolean>(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  // Handle date range change
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Handle generate report
  const handleGenerateReport = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      
      // Prepare report params
      const reportParams = {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        groupBy,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      };
      
      // Call API to generate report
      console.log('Generating report with params:', reportParams);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setReportGenerated(true);
      }, 1500);
      
      // In a real implementation, you would call the API
      // const response = await analyticsAPI.getCustomReport(storeId, reportParams);
      // console.log('Report response:', response);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };
  
  // Handle download report
  const handleDownloadReport = () => {
    // In a real implementation, you would generate and download the report
    console.log('Downloading report...');
    
    // Create a sample CSV file
    const csvContent = `"תאריך","הזמנות","הכנסות","מוצרים שנמכרו"
"2025-02-01",12,3600,25
"2025-02-02",15,4500,30
"2025-02-03",10,3000,20
"2025-02-04",18,5400,36
"2025-02-05",14,4200,28`;
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report-${formatDateForAPI(startDate)}-to-${formatDateForAPI(endDate)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">בניית דוח מותאם אישית</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              טווח תאריכים
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateRangeChange}
            />
          </div>
          
          {/* Group By */}
          <div>
            <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-2">
              קיבוץ לפי
            </label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="day">יום</option>
              <option value="week">שבוע</option>
              <option value="month">חודש</option>
              <option value="product">מוצר</option>
              <option value="customer">לקוח</option>
              <option value="status">סטטוס</option>
            </select>
          </div>
        </div>
        
        {/* Include Options */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            כלול בדוח
          </label>
          <div className="flex space-x-4 space-x-reverse">
            <div className="flex items-center">
              <input
                id="includeProducts"
                type="checkbox"
                checked={includeProducts}
                onChange={(e) => setIncludeProducts(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeProducts" className="mr-2 block text-sm text-gray-700">
                מוצרים
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="includeCustomers"
                type="checkbox"
                checked={includeCustomers}
                onChange={(e) => setIncludeCustomers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeCustomers" className="mr-2 block text-sm text-gray-700">
                לקוחות
              </label>
            </div>
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            סינון לפי סטטוס
          </label>
          <div className="flex flex-wrap gap-2">
            {['בטיפול', 'הושלם', 'בהמתנה', 'בוטל', 'ממתין לתשלום'].map((status) => (
              <div
                key={status}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  selectedStatuses.includes(status)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
                onClick={() => {
                  if (selectedStatuses.includes(status)) {
                    setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                  } else {
                    setSelectedStatuses([...selectedStatuses, status]);
                  }
                }}
              >
                {status}
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-3 space-x-reverse">
          <button
            onClick={handleGenerateReport}
            disabled={loading || !startDate || !endDate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="white" className="ml-2" />
                מייצר דוח...
              </>
            ) : (
              <>
                <HiRefresh className="ml-2 -mr-1 h-5 w-5" />
                ייצר דוח
              </>
            )}
          </button>
          
          {reportGenerated && (
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HiDownload className="ml-2 -mr-1 h-5 w-5" />
              הורד כ-CSV
            </button>
          )}
        </div>
        
        {/* Report Preview */}
        {reportGenerated && !loading && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">תצוגה מקדימה של הדוח</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      הזמנות
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      הכנסות
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      מוצרים שנמכרו
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Sample data rows */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-02-01</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪3,600</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">25</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-02-02</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪4,500</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-02-03</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪3,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">20</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-02-04</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪5,400</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">36</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-02-05</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">14</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪4,200</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">28</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 text-center">
              מציג 5 מתוך 5 שורות
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportBuilder;
