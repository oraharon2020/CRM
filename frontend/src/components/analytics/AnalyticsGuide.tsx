import React, { useState } from 'react';
import { 
  HiChartBar, 
  HiCurrencyDollar, 
  HiDocumentReport, 
  HiLightBulb,
  HiQuestionMarkCircle,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi';
import Tooltip from '../Tooltip';

interface FAQItem {
  question: string;
  answer: string;
}

const AnalyticsGuide: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  const faqs: FAQItem[] = [
    {
      question: "איך אני יכול לראות נתונים לתקופה ספציפית?",
      answer: "בחר את התקופה הרצויה מהאפשרויות בסרגל הסינון (היום, שבוע, חודש, שנה) או בחר באפשרות 'מותאם' כדי להגדיר טווח תאריכים מדויק."
    },
    {
      question: "איך אני יכול לסנן את הנתונים לפי סטטוס הזמנה?",
      answer: "לחץ על כפתור הגדרות (סמל גלגל השיניים) ליד בחירת החנות כדי לפתוח את חלון הגדרות הסטטוס. שם תוכל לבחור אילו סטטוסים לכלול בניתוח."
    },
    {
      question: "איך אני יכול לייצא את הנתונים?",
      answer: "עבור לטאב 'דוחות', הגדר את הפרמטרים הרצויים, לחץ על 'ייצר דוח' ולאחר מכן על 'הורד כ-CSV'."
    },
    {
      question: "מה ההבדל בין הגרפים השונים?",
      answer: "גרף המכירות מציג את המגמות לאורך זמן, ביצועי מוצרים מציג את המוצרים המובילים, פילוח לקוחות מציג נתונים על סוגי הלקוחות, ותחזית המכירות מספקת הערכה לגבי המכירות הצפויות בתקופה הבאה."
    },
    {
      question: "האם אפשר לראות נתונים של כמה חנויות ביחד?",
      answer: "כרגע המערכת מציגה נתונים לחנות אחת בכל פעם. בחר את החנות הרצויה מתפריט בחירת החנות."
    },
    {
      question: "איך אני יכול לראות מידע מפורט יותר על מוצר ספציפי?",
      answer: "בקטגוריית 'ביצועי מוצרים' תוכל לראות את המוצרים המובילים. בקרוב נוסיף אפשרות לחיפוש וניתוח מפורט יותר של מוצרים ספציפיים."
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
            <HiChartBar className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">ברוכים הבאים לאנליטיקה</h2>
        </div>
        <p className="text-gray-600 mb-4">
          מערכת האנליטיקה מאפשרת לך לנתח את ביצועי המכירות שלך, לזהות מגמות, ולקבל תובנות שיעזרו לך לקבל החלטות עסקיות מושכלות.
          דף זה מספק הסבר על הכלים השונים העומדים לרשותך ואיך להשתמש בהם.
        </p>
      </div>
      
      {/* Dashboard Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
            <HiChartBar className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">דשבורד אנליטיקה</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border-r-4 border-blue-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">סיכום מכירות</h3>
            <p className="text-gray-600">
              הצגת נתוני מפתח כמו מספר הזמנות, הכנסות, ערך הזמנה ממוצע ומספר מוצרים שנמכרו בתקופה הנבחרת.
            </p>
          </div>
          
          <div className="border-r-4 border-green-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">גרף מכירות</h3>
            <p className="text-gray-600">
              גרף המציג את מגמות המכירות וההכנסות לאורך זמן. ניתן לשנות את הקיבוץ (יום/שבוע/חודש) כדי לראות תמונה רחבה יותר.
            </p>
          </div>
          
          <div className="border-r-4 border-purple-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">ביצועי מוצרים</h3>
            <p className="text-gray-600">
              הצגת המוצרים המובילים במכירות, כולל נתונים על כמות, הכנסות ומחיר ממוצע. מאפשר לזהות את המוצרים הפופולריים ביותר.
            </p>
          </div>
          
          <div className="border-r-4 border-yellow-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">פילוח לקוחות</h3>
            <p className="text-gray-600">
              ניתוח של סוגי הלקוחות (חד-פעמיים, חוזרים, נאמנים) והתרומה שלהם להכנסות. עוזר להבין את בסיס הלקוחות שלך.
            </p>
          </div>
          
          <div className="border-r-4 border-indigo-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">תחזית מכירות</h3>
            <p className="text-gray-600">
              הערכה של המכירות הצפויות בתקופה הבאה, בהתבסס על נתוני העבר ומגמות. מסייע בתכנון עתידי.
            </p>
          </div>
        </div>
      </div>
      
      {/* Reports Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 mr-4">
            <HiDocumentReport className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">דוחות מותאמים אישית</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          טאב הדוחות מאפשר לך ליצור דוחות מותאמים אישית לפי הצרכים שלך ולייצא אותם לשימוש חיצוני.
        </p>
        
        <div className="space-y-4">
          <div className="border-r-4 border-yellow-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">יצירת דוח</h3>
            <p className="text-gray-600">
              בחר את הפרמטרים הרצויים כמו טווח תאריכים, קיבוץ (יום/שבוע/חודש/מוצר/לקוח/סטטוס) ואילו נתונים לכלול בדוח.
            </p>
          </div>
          
          <div className="border-r-4 border-yellow-500 pr-4 py-2">
            <h3 className="font-medium text-gray-900 mb-1">ייצוא דוח</h3>
            <p className="text-gray-600">
              לאחר יצירת הדוח, תוכל לייצא אותו בפורמט CSV לשימוש בתוכנות אחרות כמו Excel או Google Sheets.
            </p>
          </div>
        </div>
      </div>
      
      {/* Tips Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mr-4">
            <HiLightBulb className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">טיפים לשימוש יעיל</h2>
        </div>
        
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-500 font-bold ml-2">•</span>
            <span>השתמש בסינון לפי תקופות שונות כדי לזהות מגמות עונתיות או שינויים לאורך זמן.</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 font-bold ml-2">•</span>
            <span>בדוק את ביצועי המוצרים המובילים כדי לזהות הזדמנויות למבצעים או הגדלת מלאי.</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 font-bold ml-2">•</span>
            <span>השתמש בפילוח הלקוחות כדי לזהות את הלקוחות הנאמנים ולשקול תוכניות נאמנות או הטבות.</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 font-bold ml-2">•</span>
            <span>ייצא דוחות באופן קבוע כדי לעקוב אחר ביצועים לאורך זמן ולשתף עם בעלי עניין אחרים.</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 font-bold ml-2">•</span>
            <span>השתמש בתחזית המכירות לתכנון רכש, מלאי וכוח אדם לתקופות עתידיות.</span>
          </li>
        </ul>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 mr-4">
            <HiQuestionMarkCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">שאלות נפוצות</h2>
        </div>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openFAQ === index}
              >
                <span className="font-medium text-gray-900 text-right">{faq.question}</span>
                {openFAQ === index ? (
                  <HiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <HiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {openFAQ === index && (
                <div className="px-4 py-3 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100">
        <div className="text-center">
          <p className="text-gray-700 mb-3">
            יש לך שאלות נוספות או הצעות לשיפור? אנחנו כאן לעזור!
          </p>
          <Tooltip content="לחץ כדי לפתוח טופס יצירת קשר">
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
              צור קשר עם התמיכה
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsGuide;
