import React from 'react';
import { InfoBox, CodeBlock, Step } from '../common';

export const facebookAdsSteps: Step[] = [
  {
    title: 'יצירת חשבון Facebook Business',
    content: (
      <div>
        <p>אם אין לך עדיין חשבון Facebook Business, צור חשבון חדש:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Facebook Business</a></li>
          <li>לחץ על "צור חשבון"</li>
          <li>הזן את פרטי העסק שלך ועקוב אחר ההוראות</li>
        </ol>
      </div>
    )
  },
  {
    title: 'יצירת חשבון מודעות',
    content: (
      <div>
        <p>צור חשבון מודעות בתוך חשבון ה-Business שלך:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>בחשבון ה-Business, עבור ל"הגדרות עסקיות"</li>
          <li>לחץ על "חשבונות" ואז "חשבונות מודעות"</li>
          <li>לחץ על "הוסף" ובחר "צור חשבון מודעות חדש"</li>
          <li>מלא את הפרטים הנדרשים ולחץ על "הבא"</li>
          <li>בחר את מטרת הפרסום שלך ולחץ על "צור"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'יצירת אפליקציית Facebook',
    content: (
      <div>
        <p>צור אפליקציית Facebook כדי לקבל גישה ל-API:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Facebook for Developers</a></li>
          <li>לחץ על "התחל" או "הוסף אפליקציה חדשה"</li>
          <li>בחר "עסק" כסוג האפליקציה</li>
          <li>הזן שם לאפליקציה ואימייל קשר</li>
          <li>לחץ על "צור מזהה אפליקציה"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'הגדרת הרשאות API',
    content: (
      <div>
        <p>הגדר את ההרשאות הנדרשות לאפליקציה:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>באפליקציה שיצרת, עבור ל"הגדרות" ואז "הרשאות בסיסיות"</li>
          <li>הוסף את התחום של מערכת ה-CRM שלך תחת "תחומים מורשים"</li>
          <li>עבור ל"כלים" ואז "Marketing API"</li>
          <li>לחץ על "הוסף" או "הגדר"</li>
          <li>בחר את חשבון המודעות שלך</li>
        </ol>
        
        <InfoBox type="info">
          האפליקציה תצטרך את ההרשאות הבאות: ads_read, ads_management, business_management
        </InfoBox>
      </div>
    )
  },
  {
    title: 'קבלת מזהה אפליקציה ומפתח סודי',
    content: (
      <div>
        <p>קבל את מזהה האפליקציה והמפתח הסודי:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>באפליקציה שלך, עבור ל"הגדרות" ואז "הרשאות בסיסיות"</li>
          <li>העתק את "מזהה אפליקציה"</li>
          <li>לחץ על "הצג" ליד "מפתח סודי" והעתק אותו</li>
        </ol>
        
        <CodeBlock 
          title="דוגמה למזהי Facebook"
          code={`מזהה אפליקציה: 123456789012345
מפתח סודי: abcdef0123456789abcdef0123456789`}
        />
      </div>
    )
  },
  {
    title: 'קבלת Access Token',
    content: (
      <div>
        <p>קבל Access Token ארוך טווח:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>באפליקציה שלך, עבור ל"כלים" ואז "Graph API Explorer"</li>
          <li>בחר את האפליקציה שלך מהתפריט הנפתח</li>
          <li>לחץ על "Generate Access Token"</li>
          <li>אשר את ההרשאות הנדרשות</li>
          <li>העתק את ה-Access Token שנוצר</li>
        </ol>
        
        <InfoBox type="warning" title="אזהרת אבטחה">
          שמור על ה-Access Token שלך בצורה מאובטחת. כל מי שיש לו גישה לטוקן זה יכול לגשת לנתוני המודעות שלך.
        </InfoBox>
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
          <li>לחץ על "הוסף אינטגרציה" ובחר "Facebook Ads"</li>
          <li>הזן את מזהה האפליקציה, המפתח הסודי וה-Access Token</li>
          <li>הזן את מזהה חשבון המודעות שלך</li>
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
          <li>ודא שהנתונים מ-Facebook Ads מוצגים כראוי</li>
          <li>בדוק את הדוחות של ביצועי הקמפיינים</li>
        </ol>
        
        <InfoBox type="tip">
          אם אתה נתקל בבעיות, ודא שה-Access Token עדיין תקף. טוקנים ארוכי טווח בדרך כלל תקפים למשך 60 יום.
        </InfoBox>
      </div>
    )
  }
];

export default facebookAdsSteps;
