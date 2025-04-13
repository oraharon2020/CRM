import React, { useState, useEffect } from 'react';
import { HiClipboardCopy, HiCheck, HiInformationCircle, HiOutlineExternalLink, HiCode, HiRefresh } from 'react-icons/hi';
import Tooltip from '../../../Tooltip';

interface WebhookApiKeyGeneratorProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  webhookUrl: string;
  setWebhookUrl: (value: string) => void;
  integrationType: string;
  primaryColor: string;
  storeId?: number | null;
}

const WebhookApiKeyGenerator: React.FC<WebhookApiKeyGeneratorProps> = ({
  apiKey,
  setApiKey,
  webhookUrl,
  setWebhookUrl,
  integrationType,
  primaryColor,
  storeId
}) => {
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true); // Default to showing instructions
  const [showCodeExamples, setShowCodeExamples] = useState(false);
  const [showHtmlForm, setShowHtmlForm] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const generateApiKey = () => {
    const prefix = integrationType.substring(0, 3).toLowerCase();
    const randomKey = `${prefix}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(randomKey);
  };
  
  const generateWebhookUrl = () => {
    // Use the API URL from environment variables instead of window.location.origin
    const baseUrl = import.meta.env.VITE_API_URL || 'https://crm-d30s.onrender.com/api';
    // Remove the trailing '/api' if it exists since we're adding it in the path
    const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    
    // Always generate a store-specific webhook URL if storeId is available
    if (storeId) {
      setWebhookUrl(`${apiBaseUrl}/api/leads/webhook/store/${storeId}`);
    } else {
      setWebhookUrl(`${apiBaseUrl}/api/leads/webhook`);
    }
  };

  const copyToClipboard = (text: string, setCopied: (value: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Auto-generate API key and webhook URL if they're empty
  useEffect(() => {
    if (!apiKey) {
      generateApiKey();
    }
    if (!webhookUrl) {
      generateWebhookUrl();
    }
  }, []);

  // Generate HTML form example
  const getHtmlFormExample = () => {
    return `<form action="${webhookUrl}" method="POST">
  <div>
    <label for="name">שם מלא *</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div>
    <label for="email">אימייל</label>
    <input type="email" id="email" name="email">
  </div>
  <div>
    <label for="phone">טלפון</label>
    <input type="tel" id="phone" name="phone">
  </div>
  <div>
    <label for="message">הודעה</label>
    <textarea id="message" name="message"></textarea>
  </div>
  <button type="submit">שלח</button>
</form>`;
  };

  // Generate HTML form with JavaScript example
  const getHtmlFormWithJsExample = () => {
    return `<form id="leadForm">
  <div>
    <label for="name">שם מלא *</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div>
    <label for="email">אימייל</label>
    <input type="email" id="email" name="email">
  </div>
  <div>
    <label for="phone">טלפון</label>
    <input type="tel" id="phone" name="phone">
  </div>
  <div>
    <label for="message">הודעה</label>
    <textarea id="message" name="message"></textarea>
  </div>
  <button type="submit">שלח</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    alert('תודה! הפנייה נשלחה בהצלחה');
    this.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('אירעה שגיאה בשליחת הטופס');
  });
});
</script>`;
  };

  const getInstructionsForType = () => {
    // If storeId is available, show simplified instructions for all integration types
    if (storeId) {
      return (
        <>
          <h4 className="font-medium mb-2">הגדרה פשוטה - העתק והדבק את כתובת ה-Webhook</h4>
          
          <div className="p-3 bg-green-50 border border-green-100 rounded-md mb-4">
            <p className="text-sm text-green-700 font-medium">פתרון פשוט!</p>
            <p className="text-sm text-green-600">
              כתובת ה-Webhook כוללת את מזהה החנות, כך שאין צורך להוסיף כותרות HTTP נוספות או מפתח API.
            </p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm mb-2">
              פשוט העתק את כתובת ה-Webhook והשתמש בה בטופס או במערכת שלך. הנה כמה אפשרויות:
            </p>
            
            <div className="flex space-x-4 space-x-reverse mb-2">
              <button
                type="button"
                onClick={() => {
                  setShowHtmlForm(!showHtmlForm);
                  if (showHtmlForm) setShowCodeExamples(false);
                }}
                className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 text-sm flex items-center`}
              >
                <HiCode className="h-4 w-4 ml-1" />
                {showHtmlForm ? 'הסתר טופס HTML' : 'הצג טופס HTML פשוט'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowCodeExamples(!showCodeExamples);
                  if (showCodeExamples) setShowHtmlForm(false);
                }}
                className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 text-sm flex items-center`}
              >
                <HiCode className="h-4 w-4 ml-1" />
                {showCodeExamples ? 'הסתר דוגמת JavaScript' : 'הצג דוגמת JavaScript'}
              </button>
            </div>
          </div>
          
          {showHtmlForm && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">טופס HTML פשוט:</p>
              <div className="p-3 bg-gray-800 text-gray-100 rounded-md text-xs overflow-x-auto">
                <pre>{getHtmlFormExample()}</pre>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                העתק את הקוד הזה והדבק אותו באתר שלך. הטופס ישלח את הנתונים ישירות למערכת.
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(getHtmlFormExample(), () => {})}
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                העתק את הטופס
              </button>
            </div>
          )}
          
          {showCodeExamples && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">טופס HTML עם JavaScript:</p>
              <div className="p-3 bg-gray-800 text-gray-100 rounded-md text-xs overflow-x-auto">
                <pre>{getHtmlFormWithJsExample()}</pre>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                גרסה מתקדמת יותר עם JavaScript שמטפל בשליחת הטופס ומציג הודעות למשתמש.
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(getHtmlFormWithJsExample(), () => {})}
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                העתק את הטופס עם JavaScript
              </button>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-700 font-medium">טיפ!</p>
            <p className="text-sm text-blue-600">
              אם אתה משתמש במערכת טפסים כמו אלמנטור, Contact Form 7 או Gravity Forms, פשוט הדבק את כתובת ה-Webhook בהגדרות הטופס.
            </p>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 text-sm flex items-center`}
            >
              <HiInformationCircle className="h-4 w-4 ml-1" />
              {showAdvancedOptions ? 'הסתר אפשרויות מתקדמות' : 'הצג אפשרויות מתקדמות'}
            </button>
            
            {showAdvancedOptions && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700 mb-2">
                  אם אתה צריך לשלוט בצורה מתקדמת יותר בשליחת הלידים, אתה יכול להשתמש במפתח ה-API.
                </p>
                <p className="text-sm text-gray-700">
                  מפתח ה-API: <code className="bg-gray-100 px-1 py-0.5 rounded">{apiKey}</code>
                </p>
              </div>
            )}
          </div>
        </>
      );
    }
    
    // Default instructions for each integration type (when storeId is not available)
    switch (integrationType) {
      case 'elementor':
        return (
          <>
            <h4 className="font-medium mb-2">איך להגדיר את החיבור באלמנטור:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>התקן את התוסף "Elementor Pro" אם עדיין לא התקנת</li>
              <li>צור טופס חדש או ערוך טופס קיים</li>
              <li>לחץ על "Actions After Submit" בהגדרות הטופס</li>
              <li>הוסף פעולה חדשה מסוג "Webhook"</li>
              <li>הדבק את כתובת ה-Webhook שנוצרה כאן</li>
              <li>הוסף שדה "X-API-KEY" בכותרות עם הערך של מפתח ה-API שנוצר כאן</li>
              <li>שמור את הטופס ובדוק שהוא עובד כראוי</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-700 font-medium">חשוב!</p>
              <p className="text-sm text-blue-600">
                אם כתובת ה-Webhook מתחילה ב-localhost, היא לא תעבוד עם אלמנטור. יש להשתמש בכתובת ציבורית או להשתמש בכלי כמו ngrok להפניית בקשות לשרת המקומי.
              </p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-700 font-medium">טיפ!</p>
              <p className="text-sm text-blue-600">
                ודא שהשדות בטופס האלמנטור תואמים לשדות שהגדרת במיפוי השדות למטה.
              </p>
            </div>
          </>
        );
      case 'contact-form-7':
        return (
          <>
            <h4 className="font-medium mb-2">איך להגדיר את החיבור ב-Contact Form 7:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>התקן את התוסף "Contact Form 7" ואת התוסף "Contact Form 7 Webhook"</li>
              <li>צור טופס חדש או ערוך טופס קיים</li>
              <li>עבור ללשונית "Webhook" בהגדרות הטופס</li>
              <li>הדבק את כתובת ה-Webhook שנוצרה כאן</li>
              <li>הוסף שדה "X-API-KEY" בכותרות עם הערך של מפתח ה-API שנוצר כאן</li>
              <li>שמור את הטופס ובדוק שהוא עובד כראוי</li>
            </ol>
            <div className="mt-4">
              <p className="text-sm font-medium">דוגמת קוד טופס:</p>
              <div className="mt-2 p-3 bg-gray-800 text-gray-100 rounded-md text-xs overflow-x-auto">
                <pre>{`<label>שם <span>*</span>
[text* your-name]</label>

<label>אימייל <span>*</span>
[email* your-email]</label>

<label>טלפון <span>*</span>
[tel* your-tel]</label>

<label>הודעה
[textarea your-message]</label>

[submit "שלח"]`}</pre>
              </div>
            </div>
          </>
        );
      case 'facebook':
        return (
          <>
            <h4 className="font-medium mb-2">איך להגדיר את החיבור בפייסבוק:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>היכנס למנהל המודעות של פייסבוק</li>
              <li>עבור להגדרות הלידים</li>
              <li>בחר "CRM Setup" ולחץ על "Create New Integration"</li>
              <li>הדבק את כתובת ה-Webhook שנוצרה כאן</li>
              <li>הוסף את מפתח ה-API בשדה "Access Token"</li>
              <li>בהגדרות ה-Webhook, בחר את האירוע "leadgen"</li>
              <li>ודא שהאפליקציה מקבלת הרשאות מתאימות: pages_manage_ads, pages_show_list, leads_retrieval</li>
              <li>שמור את ההגדרות ובדוק שהחיבור עובד כראוי</li>
            </ol>
            <div className="mt-4">
              <a 
                href="https://developers.facebook.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                Facebook Developers
                <HiOutlineExternalLink className="mr-1 h-4 w-4" />
              </a>
            </div>
          </>
        );
      case 'custom':
        return (
          <>
            <h4 className="font-medium mb-2">איך להגדיר את החיבור המותאם אישית:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>השתמש בכתובת ה-Webhook שנוצרה כאן כדי לשלוח נתונים למערכת</li>
              <li>הוסף כותרת HTTP בשם "X-API-KEY" עם הערך של מפתח ה-API שנוצר כאן</li>
              <li>שלח את הנתונים בפורמט JSON</li>
              <li>ודא שהשדות במיפוי השדות תואמים לשדות ב-JSON שאתה שולח</li>
            </ol>
            <div className="mt-4 flex items-center">
              <button
                type="button"
                onClick={() => setShowCodeExamples(!showCodeExamples)}
                className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 text-sm flex items-center`}
              >
                <HiCode className="h-4 w-4 ml-1" />
                {showCodeExamples ? 'הסתר דוגמאות קוד' : 'הצג דוגמאות קוד'}
              </button>
            </div>
            
            {showCodeExamples && (
              <div className="mt-4">
                <p className="text-sm font-medium">מבנה JSON:</p>
                <div className="mt-2 p-3 bg-gray-800 text-gray-100 rounded-md text-xs overflow-x-auto">
                  <pre>{`{
  "name": "שם הלקוח",
  "email": "email@example.com",
  "phone": "0501234567",
  "message": "הודעה מהלקוח",
  "source": "מקור הליד",
  "custom_fields": {
    "field1": "value1",
    "field2": "value2"
  }
}`}</pre>
                </div>
                
                <p className="text-sm font-medium mt-4">דוגמת קוד - JavaScript:</p>
                <div className="mt-2 p-3 bg-gray-800 text-gray-100 rounded-md text-xs overflow-x-auto">
                  <pre>{`// נתוני הליד
const leadData = {
  name: 'שם הלקוח',
  email: 'email@example.com',
  phone: '0501234567',
  message: 'הודעה מהלקוח',
  source: 'אתר החברה'
};

// הגדרת ה-Webhook URL
const webhookUrl = '${webhookUrl}';

// שליחת הבקשה
fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': '${apiKey}'
  },
  body: JSON.stringify(leadData),
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error);
});`}</pre>
                </div>
              </div>
            )}
          </>
        );
      default:
        return (
          <p className="text-sm">
            השתמש בכתובת ה-Webhook ובמפתח ה-API כדי לחבר את המערכת החיצונית למערכת שלנו.
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Main content section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Webhook URL section - moved to the top for emphasis */}
        <div>
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-1">
            כתובת Webhook
          </label>
          <div className="flex flex-col sm:flex-row">
            <input
              type="text"
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className={`flex-1 px-3 py-2 border border-gray-300 rounded-md sm:rounded-r-md sm:rounded-l-none shadow-sm focus:outline-none focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 mb-2 sm:mb-0`}
              placeholder={`https://example.com/api/leads/webhook`}
            />
            <div className="flex">
              <button
                type="button"
                onClick={() => copyToClipboard(webhookUrl, setWebhookCopied)}
                className={`px-2 py-2 border border-gray-300 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 rounded-r-md sm:rounded-none sm:border-r-0 sm:border-l-0`}
                title="העתק למטמון"
              >
                {webhookCopied ? (
                  <div className="flex items-center">
                    <HiCheck className="h-5 w-5 text-green-500" />
                    <span className="text-green-500 text-xs mr-1 hidden sm:inline">הועתק!</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <HiClipboardCopy className="h-5 w-5" />
                    <span className="text-gray-700 text-xs mr-1 hidden sm:inline">העתק</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={generateWebhookUrl}
                className={`px-3 py-2 border border-gray-300 rounded-l-md bg-${primaryColor}-50 text-sm text-${primaryColor}-700 hover:bg-${primaryColor}-100 flex items-center`}
              >
                <HiRefresh className="h-4 w-4 ml-1" />
                <span className="hidden sm:inline">צור webhook</span>
                <span className="inline sm:hidden">צור</span>
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            הזן כתובת זו בהגדרות המערכת החיצונית
          </p>
        </div>
        
        {/* API Key section - moved down and made less prominent */}
        <div className={storeId ? "opacity-50" : ""}>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              מפתח API {storeId && <span className="text-xs text-gray-500">(לא נדרש)</span>}
            </label>
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 text-xs flex items-center`}
            >
              <HiInformationCircle className="h-4 w-4 ml-1" />
              {showInstructions ? 'הסתר הוראות' : 'הצג הוראות'}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row">
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`flex-1 px-3 py-2 border border-gray-300 rounded-md sm:rounded-r-md sm:rounded-l-none shadow-sm focus:outline-none focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 mb-2 sm:mb-0`}
              placeholder={`${integrationType}_abc123def456`}
              required={!storeId}
            />
            <div className="flex">
              <button
                type="button"
                onClick={() => copyToClipboard(apiKey, setApiKeyCopied)}
                className={`px-2 py-2 border border-gray-300 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 rounded-r-md sm:rounded-none sm:border-r-0 sm:border-l-0`}
                title="העתק למטמון"
              >
                {apiKeyCopied ? (
                  <div className="flex items-center">
                    <HiCheck className="h-5 w-5 text-green-500" />
                    <span className="text-green-500 text-xs mr-1 hidden sm:inline">הועתק!</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <HiClipboardCopy className="h-5 w-5" />
                    <span className="text-gray-700 text-xs mr-1 hidden sm:inline">העתק</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={generateApiKey}
                className={`px-3 py-2 border border-gray-300 rounded-l-md bg-${primaryColor}-50 text-sm text-${primaryColor}-700 hover:bg-${primaryColor}-100 flex items-center`}
              >
                <HiRefresh className="h-4 w-4 ml-1" />
                <span className="hidden sm:inline">צור מפתח</span>
                <span className="inline sm:hidden">צור</span>
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {storeId 
              ? "מפתח זה אינו נדרש כאשר משתמשים בכתובת Webhook עם מזהה חנות"
              : "מפתח זה ישמש לאימות הבקשות מהמערכת החיצונית"
            }
          </p>
        </div>
      </div>

      {/* Instructions section */}
      {showInstructions && (
        <div className={`bg-${primaryColor}-50 p-3 sm:p-4 rounded-lg border border-${primaryColor}-100 mt-4 text-sm sm:text-base overflow-auto`}>
          {getInstructionsForType()}
        </div>
      )}
    </div>
  );
};

export default WebhookApiKeyGenerator;
