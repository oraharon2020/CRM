import React from 'react';
import { InfoBox, CodeBlock, Step } from '../common';

export const googleSearchConsoleSteps: Step[] = [
  {
    title: 'הוספת אתר ל-Google Search Console',
    content: (
      <div>
        <p>אם האתר שלך עדיין לא מוגדר ב-Google Search Console, הוסף אותו:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Search Console</a></li>
          <li>לחץ על "התחל עכשיו"</li>
          <li>בחר את סוג הנכס (URL prefix או Domain)</li>
          <li>הזן את כתובת האתר שלך</li>
          <li>אמת את הבעלות על האתר באמצעות אחת השיטות המוצעות</li>
        </ol>
      </div>
    )
  },
  {
    title: 'יצירת חשבון שירות (Service Account)',
    content: (
      <div>
        <p>צור חשבון שירות ב-Google Cloud:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Cloud Console</a></li>
          <li>צור פרויקט חדש או בחר פרויקט קיים</li>
          <li>בתפריט הימני, עבור ל-"IAM & Admin" ואז "Service Accounts"</li>
          <li>לחץ על "צור חשבון שירות"</li>
          <li>הזן שם לחשבון השירות ולחץ על "צור"</li>
          <li>הענק לחשבון השירות את התפקיד "Service Account User"</li>
          <li>לחץ על "המשך" ואז "סיום"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'יצירת מפתח JSON',
    content: (
      <div>
        <p>צור מפתח JSON עבור חשבון השירות:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>לחץ על חשבון השירות שיצרת</li>
          <li>עבור ללשונית "מפתחות" (Keys)</li>
          <li>לחץ על "הוסף מפתח" ובחר "צור מפתח חדש"</li>
          <li>בחר בסוג "JSON" ולחץ על "צור"</li>
          <li>קובץ JSON יורד למחשב שלך - שמור אותו במקום בטוח</li>
        </ol>
      </div>
    )
  },
  {
    title: 'הפעלת ה-API של Search Console',
    content: (
      <div>
        <p>הפעל את ה-API של Search Console בפרויקט Google Cloud שלך:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>בקונסולת Google Cloud, עבור ל-"API & Services" ואז "Library"</li>
          <li>חפש "Google Search Console API" ולחץ עליו</li>
          <li>לחץ על "הפעל"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'הוספת חשבון השירות ל-Search Console',
    content: (
      <div>
        <p>הוסף את חשבון השירות כמשתמש ב-Search Console:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>חזור ל-Google Search Console</li>
          <li>בחר את האתר שלך</li>
          <li>לחץ על "הגדרות" (סמל גלגל השיניים)</li>
          <li>תחת "משתמשים והרשאות", לחץ על "הוסף משתמש"</li>
          <li>הזן את כתובת האימייל של חשבון השירות (מסתיימת ב-@gserviceaccount.com)</li>
          <li>בחר "מלאה" כרמת הרשאה</li>
          <li>לחץ על "הוסף"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'הגדרת אינטגרציה במערכת ה-CRM',
    content: (
      <div>
        <p>כעת הגדר את האינטגרציה במערכת ה-CRM:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס למערכת ה-CRM</li>
          <li>עבור להגדרות &gt; אינטגרציות &gt; שירותי אנליטיקה</li>
          <li>לחץ על "הוסף אינטגרציה" ובחר "Google Search Console"</li>
          <li>הזן את כתובת האתר כפי שהיא מופיעה ב-Search Console</li>
          <li>העלה את קובץ ה-JSON של חשבון השירות</li>
          <li>בחר את החנות שברצונך לקשר לאינטגרציה זו</li>
          <li>לחץ על "שמור"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'בדיקת החיבור',
    content: (
      <div>
        <p>בדוק שהאינטגרציה פועלת כראוי:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>במערכת ה-CRM, עבור ללוח הבקרה של האנליטיקה</li>
          <li>ודא שהנתונים מ-Google Search Console מוצגים כראוי</li>
          <li>בדוק את הדוחות של ביצועי החיפוש</li>
        </ol>
        
        <InfoBox type="tip">
          נתוני Search Console עשויים להיות זמינים רק עבור הימים האחרונים. אם אתה צריך נתונים היסטוריים, 
          ייתכן שתצטרך לייצא אותם ידנית מ-Search Console ולייבא אותם למערכת ה-CRM.
        </InfoBox>
      </div>
    )
  }
];

export default googleSearchConsoleSteps;
