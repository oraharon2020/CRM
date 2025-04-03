import React, { useState } from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import {
  InstructionHeader,
  InfoBox,
  StepsList,
  CodeBlock,
  SupportSection,
  CategoryTabs,
  WebhookGenerator,
  Step,
  Category
} from '../components/settings/integrations/instructions/common';

const LeadIntegrationInstructions: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('elementor');

  const categories: Category[] = [
    { id: 'elementor', name: 'אלמנטור', color: 'pink' },
    { id: 'contact-form-7', name: 'Contact Form 7', color: 'blue' },
    { id: 'facebook', name: 'פייסבוק', color: 'indigo' },
    { id: 'custom', name: 'מותאם אישית', color: 'purple' }
  ];

  // Elementor Steps
  const elementorSteps: Step[] = [
    {
      title: 'התקנת תוסף Elementor Pro',
      content: (
        <div>
          <p>ודא שמותקן אצלך Elementor Pro, שכן רק בגרסה זו יש תמיכה ב-Webhooks.</p>
        </div>
      )
    },
    {
      title: 'יצירת טופס באלמנטור',
      content: (
        <div>
          <p>צור טופס חדש או השתמש בטופס קיים באלמנטור.</p>
          <p className="mt-2">ודא שהטופס כולל את השדות הבאים:</p>
          <ul className="list-disc list-inside mr-4 mt-1">
            <li>שם</li>
            <li>אימייל</li>
            <li>טלפון</li>
            <li>הודעה (אופציונלי)</li>
          </ul>
        </div>
      )
    },
    {
      title: 'הגדרת Webhook באלמנטור',
      content: (
        <div>
          <p>בהגדרות הטופס, עבור ללשונית "Actions After Submit".</p>
          <p className="mt-2">הוסף פעולה חדשה מסוג "Webhook".</p>
          <p className="mt-2">בשדה URL הזן את כתובת ה-Webhook:</p>
          
          <WebhookGenerator 
            baseUrl="https://your-domain.com"
            path="/api/webhooks/elementor"
            label="Webhook URL לאלמנטור"
          />
        </div>
      )
    },
    {
      title: 'מיפוי שדות',
      content: (
        <div>
          <p>במערכת ה-CRM, צור אינטגרציה חדשה מסוג "אלמנטור".</p>
          <p className="mt-2">מפה את שדות הטופס לשדות המתאימים במערכת:</p>
          
          <CodeBlock 
            title="מיפוי שדות"
            code={`שדה באלמנטור | שדה ב-CRM
name          | שם
email         | אימייל
tel / phone   | טלפון
message       | הודעה`}
          />
        </div>
      )
    },
    {
      title: 'בדיקת החיבור',
      content: (
        <div>
          <p>שלח טופס לבדיקה דרך האתר שלך.</p>
          <p className="mt-2">ודא שהליד התקבל במערכת ה-CRM.</p>
          
          <InfoBox type="tip" title="טיפ!">
            אם אתה משתמש במספר טפסים שונים, מומלץ ליצור אינטגרציה נפרדת לכל טופס
            כדי לעקוב בקלות אחר מקור הלידים.
          </InfoBox>
        </div>
      )
    }
  ];

  // Contact Form 7 Steps
  const cf7Steps: Step[] = [
    {
      title: 'התקנת תוסף Contact Form 7',
      content: (
        <div>
          <p>ודא שמותקן אצלך תוסף Contact Form 7.</p>
        </div>
      )
    },
    {
      title: 'התקנת תוסף CF7 Webhook',
      content: (
        <div>
          <p>התקן את התוסף "Contact Form 7 Webhook Integration".</p>
          <a 
            href="https://wordpress.org/plugins/contact-form-7-webhook-integration/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
          >
            הורד את התוסף
            <HiOutlineExternalLink className="mr-1 h-4 w-4" />
          </a>
        </div>
      )
    },
    {
      title: 'יצירת טופס ב-Contact Form 7',
      content: (
        <div>
          <p>צור טופס חדש או השתמש בטופס קיים.</p>
          <p className="mt-2">ודא שהטופס כולל את השדות הבאים:</p>
          
          <CodeBlock 
            title="דוגמת קוד טופס"
            code={`<label>שם <span>*</span>
[text* your-name]</label>

<label>אימייל <span>*</span>
[email* your-email]</label>

<label>טלפון <span>*</span>
[tel* your-tel]</label>

<label>הודעה
[textarea your-message]</label>

[submit "שלח"]`}
            showLineNumbers
          />
        </div>
      )
    },
    {
      title: 'הגדרת Webhook ב-Contact Form 7',
      content: (
        <div>
          <p>בהגדרות הטופס, עבור ללשונית "Webhook Integration".</p>
          <p className="mt-2">הפעל את האפשרות "Enable webhook integration for this form".</p>
          <p className="mt-2">בשדה URL הזן את כתובת ה-Webhook:</p>
          
          <WebhookGenerator 
            baseUrl="https://your-domain.com"
            path="/api/webhooks/contact-form-7"
            label="Webhook URL ל-Contact Form 7"
          />
        </div>
      )
    },
    {
      title: 'מיפוי שדות',
      content: (
        <div>
          <p>במערכת ה-CRM, צור אינטגרציה חדשה מסוג "Contact Form 7".</p>
          <p className="mt-2">מפה את שדות הטופס לשדות המתאימים במערכת:</p>
          
          <CodeBlock 
            title="מיפוי שדות"
            code={`שדה ב-CF7    | שדה ב-CRM
your-name     | שם
your-email    | אימייל
your-tel      | טלפון
your-message  | הודעה`}
          />
        </div>
      )
    },
    {
      title: 'בדיקת החיבור',
      content: (
        <div>
          <p>שלח טופס לבדיקה דרך האתר שלך.</p>
          <p className="mt-2">ודא שהליד התקבל במערכת ה-CRM.</p>
          
          <InfoBox type="error" title="פתרון בעיות נפוצות">
            <ul className="list-disc list-inside mt-2">
              <li>אם הלידים לא מגיעים, ודא שה-API Key שהזנת נכון.</li>
              <li>ודא שהשרת שלך מאפשר בקשות POST חיצוניות.</li>
              <li>בדוק את לוגים של התוסף CF7 Webhook לאיתור שגיאות.</li>
            </ul>
          </InfoBox>
        </div>
      )
    }
  ];

  // Facebook Steps
  const facebookSteps: Step[] = [
    {
      title: 'הגדרת אפליקציית פייסבוק',
      content: (
        <div>
          <p>היכנס ל-Facebook Developers וצור אפליקציה חדשה.</p>
          <a 
            href="https://developers.facebook.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
          >
            Facebook Developers
            <HiOutlineExternalLink className="mr-1 h-4 w-4" />
          </a>
        </div>
      )
    },
    {
      title: 'הגדרת Lead Ads',
      content: (
        <div>
          <p>הוסף את המוצר "Lead Ads" לאפליקציה שלך.</p>
          <p className="mt-2">הגדר את ה-Webhook URL:</p>
          
          <WebhookGenerator 
            baseUrl="https://your-domain.com"
            path="/api/webhooks/facebook"
            label="Webhook URL לפייסבוק"
          />
        </div>
      )
    },
    {
      title: 'הגדרת אירועים',
      content: (
        <div>
          <p>בהגדרות ה-Webhook, בחר את האירוע "leadgen".</p>
          <p className="mt-2">ודא שהאפליקציה מקבלת הרשאות מתאימות:</p>
          <ul className="list-disc list-inside mr-4 mt-1">
            <li>pages_manage_ads</li>
            <li>pages_show_list</li>
            <li>leads_retrieval</li>
          </ul>
        </div>
      )
    },
    {
      title: 'חיבור דף הפייסבוק',
      content: (
        <div>
          <p>חבר את דף הפייסבוק שלך לאפליקציה.</p>
          <p className="mt-2">ודא שהדף מאשר את ההרשאות הנדרשות.</p>
        </div>
      )
    },
    {
      title: 'הגדרת אינטגרציה במערכת ה-CRM',
      content: (
        <div>
          <p>במערכת ה-CRM, צור אינטגרציה חדשה מסוג "פייסבוק".</p>
          <p className="mt-2">הזן את פרטי האפליקציה:</p>
          <ul className="list-disc list-inside mr-4 mt-1">
            <li>App ID</li>
            <li>App Secret</li>
            <li>Access Token</li>
            <li>Page ID</li>
          </ul>
        </div>
      )
    },
    {
      title: 'בדיקת החיבור',
      content: (
        <div>
          <p>צור מודעת Lead Ad בפייסבוק.</p>
          <p className="mt-2">מלא את הטופס כדי לבדוק את החיבור.</p>
          <p className="mt-2">ודא שהליד התקבל במערכת ה-CRM.</p>
          
          <InfoBox type="info" title="מידע נוסף">
            פייסבוק מאפשר לך לקבל לידים מכמה סוגי מודעות. ודא שאתה משתמש ב-Lead Ads
            ולא בסוגי מודעות אחרים אם ברצונך לקבל את הלידים ישירות למערכת.
          </InfoBox>
        </div>
      )
    }
  ];

  // Custom Integration Steps
  const customSteps: Step[] = [
    {
      title: 'קבלת Webhook URL',
      content: (
        <div>
          <p>במערכת ה-CRM, צור אינטגרציה חדשה מסוג "מותאם אישית".</p>
          <p className="mt-2">המערכת תספק לך Webhook URL ו-API Key:</p>
          
          <WebhookGenerator 
            baseUrl="https://your-domain.com"
            path="/api/webhooks/custom"
            label="Webhook URL מותאם אישית"
          />
        </div>
      )
    },
    {
      title: 'הגדרת שליחת נתונים',
      content: (
        <div>
          <p>במערכת שלך, הגדר שליחת בקשת POST ל-Webhook URL בכל פעם שנוצר ליד חדש.</p>
          <p className="mt-2">פורמט הנתונים צריך להיות JSON עם המבנה הבא:</p>
          
          <CodeBlock 
            title="מבנה JSON"
            language="json"
            code={`{
  "name": "שם הלקוח",
  "email": "email@example.com",
  "phone": "0501234567",
  "message": "הודעה מהלקוח",
  "source": "מקור הליד",
  "custom_fields": {
    "field1": "value1",
    "field2": "value2"
  }
}`}
            showLineNumbers
          />
        </div>
      )
    },
    {
      title: 'מיפוי שדות',
      content: (
        <div>
          <p>במערכת ה-CRM, הגדר את מיפוי השדות בין המערכת שלך למערכת ה-CRM.</p>
          <p className="mt-2">ודא שכל השדות החשובים ממופים כראוי.</p>
        </div>
      )
    },
    {
      title: 'בדיקת החיבור',
      content: (
        <div>
          <p>שלח בקשת POST לבדיקה ל-Webhook URL.</p>
          <p className="mt-2">ודא שהליד התקבל במערכת ה-CRM.</p>
          
          <div className="mt-8">
            <h4 className="font-medium text-gray-900">דוגמת קוד - PHP</h4>
            <CodeBlock 
              language="php"
              code={`<?php
// נתוני הליד
$lead_data = array(
  'name' => 'שם הלקוח',
  'email' => 'email@example.com',
  'phone' => '0501234567',
  'message' => 'הודעה מהלקוח',
  'source' => 'אתר החברה',
  'custom_fields' => array(
    'product' => 'מוצר A',
    'campaign' => 'קמפיין קיץ'
  )
);

// הגדרת ה-Webhook URL
$webhook_url = 'https://your-domain.com/api/webhooks/custom?api_key=YOUR_API_KEY';

// הגדרת בקשת cURL
$ch = curl_init($webhook_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($lead_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
  'Content-Type: application/json',
  'Content-Length: ' . strlen(json_encode($lead_data))
));

// שליחת הבקשה
$response = curl_exec($ch);
curl_close($ch);

// בדיקת התגובה
echo $response;
?>`}
              showLineNumbers
            />
          </div>
          
          <div className="mt-8">
            <h4 className="font-medium text-gray-900">דוגמת קוד - JavaScript</h4>
            <CodeBlock 
              language="javascript"
              code={`// נתוני הליד
const leadData = {
  name: 'שם הלקוח',
  email: 'email@example.com',
  phone: '0501234567',
  message: 'הודעה מהלקוח',
  source: 'אתר החברה',
  custom_fields: {
    product: 'מוצר A',
    campaign: 'קמפיין קיץ'
  }
};

// הגדרת ה-Webhook URL
const webhookUrl = 'https://your-domain.com/api/webhooks/custom?api_key=YOUR_API_KEY';

// שליחת הבקשה
fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(leadData),
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error);
});`}
              showLineNumbers
            />
          </div>
        </div>
      )
    }
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'elementor':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-pink-50">
                <h2 className="text-lg font-medium text-pink-900">אלמנטור</h2>
                <p className="mt-1 text-sm text-pink-700">
                  חיבור טפסי אלמנטור למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={elementorSteps} />
              </div>
            </div>
          </>
        );
      case 'contact-form-7':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h2 className="text-lg font-medium text-blue-900">Contact Form 7</h2>
                <p className="mt-1 text-sm text-blue-700">
                  חיבור טפסי Contact Form 7 למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={cf7Steps} />
              </div>
            </div>
          </>
        );
      case 'facebook':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                <h2 className="text-lg font-medium text-indigo-900">פייסבוק</h2>
                <p className="mt-1 text-sm text-indigo-700">
                  חיבור לידים מפייסבוק למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={facebookSteps} />
              </div>
            </div>
          </>
        );
      case 'custom':
        return (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 bg-purple-50">
                <h2 className="text-lg font-medium text-purple-900">אינטגרציה מותאמת אישית</h2>
                <p className="mt-1 text-sm text-purple-700">
                  חיבור מערכות מותאמות אישית למערכת ה-CRM
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <StepsList steps={customSteps} />
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
      <InstructionHeader title="הוראות התקנה - חיבורי לידים" />

      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h2 className="text-lg font-medium text-blue-900">מידע כללי</h2>
          <p className="mt-1 text-sm text-blue-700">
            חיבורי לידים מאפשרים לך לקבל לידים ישירות מהאתר שלך למערכת ה-CRM.
            כך תוכל לנהל את כל הלידים במקום אחד ולעקוב אחר התקדמותם בתהליך המכירה.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">דרישות מקדימות</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>גישה לניהול האתר שלך</li>
            <li>הרשאות להתקנת תוספים או עריכת קוד</li>
            <li>חנות מוגדרת במערכת ה-CRM</li>
          </ul>
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

export default LeadIntegrationInstructions;
