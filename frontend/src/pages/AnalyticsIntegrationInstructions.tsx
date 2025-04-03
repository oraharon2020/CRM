import React, { useState } from 'react';
import {
  InstructionHeader,
  InfoBox,
  StepsList,
  SupportSection,
  CategoryTabs,
  Category
} from '../components/settings/integrations/instructions/common';
import {
  googleAnalyticsSteps,
  googleAdsSteps,
  facebookAdsSteps,
  googleSearchConsoleSteps
} from '../components/settings/integrations/instructions/analytics';

const AnalyticsIntegrationInstructions: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('google-analytics');

  const categories: Category[] = [
    { id: 'google-analytics', name: 'Google Analytics', color: 'blue' },
    { id: 'google-ads', name: 'Google Ads', color: 'red' },
    { id: 'facebook-ads', name: 'Facebook Ads', color: 'indigo' },
    { id: 'google-search-console', name: 'Google Search Console', color: 'green' }
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'google-analytics':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h2 className="text-lg font-medium text-blue-900">Google Analytics</h2>
                <p className="mt-1 text-sm text-blue-700">
                  חיבור Google Analytics למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={googleAnalyticsSteps} />
              </div>
            </div>
          </>
        );
      case 'google-ads':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-red-50">
                <h2 className="text-lg font-medium text-red-900">Google Ads</h2>
                <p className="mt-1 text-sm text-red-700">
                  חיבור Google Ads למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={googleAdsSteps} />
              </div>
            </div>
          </>
        );
      case 'facebook-ads':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                <h2 className="text-lg font-medium text-indigo-900">Facebook Ads</h2>
                <p className="mt-1 text-sm text-indigo-700">
                  חיבור Facebook Ads למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={facebookAdsSteps} />
              </div>
            </div>
          </>
        );
      case 'google-search-console':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-green-50">
                <h2 className="text-lg font-medium text-green-900">Google Search Console</h2>
                <p className="mt-1 text-sm text-green-700">
                  חיבור Google Search Console למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={googleSearchConsoleSteps} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <InstructionHeader title="הוראות התקנה - שירותי אנליטיקה" />

      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h2 className="text-lg font-medium text-blue-900">מידע כללי</h2>
          <p className="mt-1 text-sm text-blue-700">
            שירותי אנליטיקה מאפשרים לך לקבל נתונים מפלטפורמות פרסום ואנליטיקה שונות ישירות למערכת ה-CRM.
            כך תוכל לנתח את הביצועים של הקמפיינים שלך ולקבל החלטות מבוססות נתונים.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">דרישות מקדימות</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>חשבונות פעילים בפלטפורמות הרלוונטיות</li>
            <li>הרשאות מנהל בחשבונות אלו</li>
            <li>חנות מוגדרת במערכת ה-CRM</li>
          </ul>
          
          <InfoBox type="info" title="מידע חשוב">
            כל אינטגרציה דורשת הגדרות שונות. בחר את האינטגרציה הרצויה מהלשוניות למטה כדי לראות את ההוראות הספציפיות.
          </InfoBox>
        </div>
      </div>

      <CategoryTabs 
        categories={categories} 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {renderContent()}

      <SupportSection 
        contacts={[
          { type: 'email', value: 'support@example.com' },
          { type: 'phone', value: '03-1234567' }
        ]}
      />
    </div>
  );
};

export default AnalyticsIntegrationInstructions;
