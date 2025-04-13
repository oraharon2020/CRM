import React, { useState, useEffect } from 'react';
import { HiRefresh, HiPlus } from 'react-icons/hi';
import { useStores } from '../hooks/useStores';
import StoreSelector from '../components/StoreSelector';
import Spinner from '../components/Spinner';
import { Integration } from '../components/settings/integrations/types';
import { getIntegrationTypeName } from '../components/settings/integrations/IntegrationUtils';
import DateRangePicker from '../components/DateRangePicker';

// Mock data for analytics integrations
const mockIntegrations: Integration[] = [
  {
    id: 1,
    name: 'Google Analytics',
    type: 'google-analytics',
    api_key: 'ga_mock_key',
    is_enabled: true,
    store_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      view_id: '123456789',
      property_id: 'UA-12345678-1'
    }
  },
  {
    id: 2,
    name: 'Google Ads',
    type: 'google-ads',
    api_key: 'gads_mock_key',
    is_enabled: true,
    store_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      customer_id: '123-456-7890'
    }
  },
  {
    id: 3,
    name: 'Facebook Ads',
    type: 'facebook-ads',
    api_key: 'fb_mock_key',
    is_enabled: true,
    store_id: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    settings: {
      account_id: '1234567890'
    }
  }
];

// Mock data for analytics metrics
const mockMetrics = {
  'google-analytics': {
    users: 12543,
    sessions: 18721,
    pageviews: 42156,
    bounce_rate: 45.2,
    avg_session_duration: 124,
    conversion_rate: 3.8,
    top_sources: [
      { source: 'google', sessions: 8432 },
      { source: 'direct', sessions: 5621 },
      { source: 'facebook', sessions: 2341 },
      { source: 'instagram', sessions: 1254 },
      { source: 'email', sessions: 1073 }
    ],
    top_pages: [
      { page: '/', pageviews: 12543 },
      { page: '/products', pageviews: 8721 },
      { page: '/about', pageviews: 3254 },
      { page: '/contact', pageviews: 2187 },
      { page: '/blog', pageviews: 1876 }
    ]
  },
  'google-ads': {
    impressions: 254321,
    clicks: 12543,
    cost: 4532.21,
    conversions: 432,
    ctr: 4.93,
    cpc: 0.36,
    conversion_rate: 3.44,
    cost_per_conversion: 10.49,
    top_campaigns: [
      { campaign: 'Summer Sale', impressions: 98765, clicks: 4321, cost: 1543.21, conversions: 187 },
      { campaign: 'New Products', impressions: 76543, clicks: 3456, cost: 1234.56, conversions: 132 },
      { campaign: 'Brand Awareness', impressions: 54321, clicks: 2345, cost: 876.54, conversions: 76 },
      { campaign: 'Retargeting', impressions: 24567, clicks: 2421, cost: 878.90, conversions: 37 }
    ]
  },
  'facebook-ads': {
    impressions: 187654,
    reach: 98765,
    clicks: 8765,
    cost: 3456.78,
    conversions: 321,
    ctr: 4.67,
    cpc: 0.39,
    conversion_rate: 3.66,
    cost_per_conversion: 10.77,
    top_campaigns: [
      { campaign: 'Summer Collection', impressions: 76543, reach: 43210, clicks: 3456, cost: 1234.56, conversions: 143 },
      { campaign: 'Special Offer', impressions: 54321, reach: 32109, clicks: 2345, cost: 876.54, conversions: 98 },
      { campaign: 'New Arrivals', impressions: 34567, reach: 23456, clicks: 1987, cost: 765.43, conversions: 80 }
    ]
  }
};

const ExternalAnalytics: React.FC = () => {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  
  const { stores } = useStores();
  
  useEffect(() => {
    // In a real app, we would fetch integrations from the API
    // For now, we'll use mock data
    const filteredIntegrations = mockIntegrations.filter(
      integration => selectedStoreId === null || integration.store_id === selectedStoreId
    );
    setIntegrations(filteredIntegrations);
    
    // Reset selected integration if it's not in the filtered list
    if (selectedIntegration && !filteredIntegrations.some(i => i.id === selectedIntegration.id)) {
      setSelectedIntegration(null);
    }
  }, [selectedStoreId, selectedIntegration]);
  
  const fetchAnalyticsData = async () => {
    if (!selectedIntegration) return;
    
    setLoading(true);
    
    try {
      // In a real app, we would fetch data from the API
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      setMetrics(mockMetrics[selectedIntegration.type as keyof typeof mockMetrics]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedIntegration) {
      fetchAnalyticsData();
    } else {
      setMetrics(null);
    }
  }, [selectedIntegration, dateRange]);
  
  const handleStoreChange = (storeId: number | null) => {
    setSelectedStoreId(storeId);
    setSelectedIntegration(null);
  };
  
  const handleIntegrationSelect = (integration: Integration) => {
    setSelectedIntegration(integration);
  };
  
  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
  };
  
  const renderMetrics = () => {
    if (!selectedIntegration || !metrics) return null;
    
    switch (selectedIntegration.type) {
      case 'google-analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">משתמשים</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.users ? metrics.users.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">צפיות בדף</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.pageviews ? metrics.pageviews.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">אחוז נטישה</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.bounce_rate !== undefined ? `${metrics.bounce_rate}%` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">מקורות מובילים</h3>
                <div className="space-y-2">
                  {metrics.top_sources.map((source: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{source.source}</span>
                      <span className="text-sm font-medium text-gray-900">{source.sessions ? source.sessions.toLocaleString() : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">דפים מובילים</h3>
                <div className="space-y-2">
                  {metrics.top_pages.map((page: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{page.page}</span>
                      <span className="text-sm font-medium text-gray-900">{page.pageviews ? page.pageviews.toLocaleString() : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'google-ads':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">חשיפות</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.impressions ? metrics.impressions.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">קליקים</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.clicks ? metrics.clicks.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">עלות</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.cost ? `₪${metrics.cost.toLocaleString()}` : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">המרות</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversions ? metrics.conversions.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">CTR</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.ctr !== undefined ? `${metrics.ctr}%` : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">עלות לקליק</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.cpc !== undefined ? `₪${metrics.cpc.toFixed(2)}` : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">אחוז המרה</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversion_rate !== undefined ? `${metrics.conversion_rate}%` : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">עלות להמרה</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.cost_per_conversion !== undefined ? `₪${metrics.cost_per_conversion.toFixed(2)}` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">קמפיינים מובילים</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קמפיין</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">חשיפות</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קליקים</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">עלות</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">המרות</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.top_campaigns.map((campaign: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.campaign}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.impressions ? campaign.impressions.toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.clicks ? campaign.clicks.toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.cost ? `₪${campaign.cost.toLocaleString()}` : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.conversions ? campaign.conversions.toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'facebook-ads':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">חשיפות</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.impressions ? metrics.impressions.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">הגעה</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.reach ? metrics.reach.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">קליקים</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.clicks ? metrics.clicks.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">עלות</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.cost ? `₪${metrics.cost.toLocaleString()}` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">המרות</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversions ? metrics.conversions.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">CTR</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.ctr !== undefined ? `${metrics.ctr}%` : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">עלות לקליק</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.cpc !== undefined ? `₪${metrics.cpc.toFixed(2)}` : 'N/A'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">עלות להמרה</h3>
                <p className="text-2xl font-bold text-gray-900">{metrics.cost_per_conversion !== undefined ? `₪${metrics.cost_per_conversion.toFixed(2)}` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">קמפיינים מובילים</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קמפיין</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">חשיפות</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הגעה</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קליקים</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">עלות</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">המרות</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.top_campaigns.map((campaign: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.campaign}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.impressions ? campaign.impressions.toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.reach ? campaign.reach.toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.clicks ? campaign.clicks.toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.cost ? `₪${campaign.cost.toLocaleString()}` : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.conversions ? campaign.conversions.toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">אין נתונים זמינים עבור סוג אינטגרציה זה</p>
          </div>
        );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">אנליטיקה חיצונית</h1>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreChange={handleStoreChange}
            includeAllStores={true}
          />
          
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={(startDate, endDate) => {
              if (startDate && endDate) {
                setDateRange({ startDate, endDate });
              }
            }}
          />
        </div>
      </div>
      
      {integrations.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">אין אינטגרציות אנליטיקה מוגדרות עבור החנות הנבחרת</p>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <HiPlus className="ml-2 -mr-1 h-5 w-5" />
            הוסף אינטגרציה
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">אינטגרציות</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {integrations.map(integration => (
                  <button
                    key={integration.id}
                    className={`w-full px-4 py-4 flex items-center text-right hover:bg-gray-50 focus:outline-none ${
                      selectedIntegration?.id === integration.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleIntegrationSelect(integration)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                      <p className="text-xs text-gray-500">{getIntegrationTypeName(integration.type)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-9">
            {selectedIntegration ? (
              <div className="bg-gray-50 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {selectedIntegration.name} - {getIntegrationTypeName(selectedIntegration.type)}
                  </h2>
                  
                  <button
                    onClick={fetchAnalyticsData}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      <HiRefresh className="ml-2 -mr-0.5 h-4 w-4" />
                    )}
                    רענן נתונים
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  renderMetrics()
                )}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500">בחר אינטגרציה מהרשימה כדי לצפות בנתונים</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalAnalytics;
