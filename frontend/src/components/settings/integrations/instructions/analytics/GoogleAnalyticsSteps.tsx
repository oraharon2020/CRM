import React from 'react';
import { InfoBox, CodeBlock, Step } from '../common';

export const googleAnalyticsSteps: Step[] = [
  {
    title: 'יצירת חשבון Google Analytics',
    content: (
      <div>
        <p>אם אין לך עדיין חשבון Google Analytics, צור חשבון חדש:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Analytics</a></li>
          <li>לחץ על "התחל מדידה"</li>
          <li>עקוב אחר ההוראות ליצירת חשבון חדש</li>
        </ol>
        
        <InfoBox type="info" title="מידע חשוב">
          ודא שאתה משתמש ב-Google Analytics 4 (GA4) ולא בגרסה הישנה (Universal Analytics),
          שכן Google מפסיקה את התמיכה בגרסה הישנה.
        </InfoBox>
      </div>
    )
  },
  {
    title: 'הגדרת נכס (Property) ב-Google Analytics',
    content: (
      <div>
        <p>הגדר נכס חדש עבור האתר שלך:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>בחר את החשבון שיצרת</li>
          <li>לחץ על "צור נכס"</li>
          <li>הזן את שם האתר שלך ובחר את אזור הזמן והמטבע המתאימים</li>
          <li>לחץ על "הבא" ועקוב אחר ההוראות להשלמת ההגדרה</li>
        </ol>
      </div>
    )
  },
  {
    title: 'קבלת מזהה מדידה (Measurement ID)',
    content: (
      <div>
        <p>לאחר יצירת הנכס, תצטרך לקבל את מזהה המדידה:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>בתפריט הימני, לחץ על "זרם נתונים" (Data Streams)</li>
          <li>בחר את זרם הנתונים של האתר שלך או צור חדש</li>
          <li>העתק את מזהה המדידה (מתחיל ב-G-)</li>
        </ol>
        
        <CodeBlock 
          title="דוגמה למזהה מדידה"
          code="G-XXXXXXXXXX"
        />
      </div>
    )
  },
  {
    title: 'יצירת חשבון שירות (Service Account)',
    content: (
      <div>
        <p>כדי לאפשר למערכת ה-CRM לגשת לנתונים שלך, תצטרך ליצור חשבון שירות:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Cloud Console</a></li>
          <li>צור פרויקט חדש או בחר פרויקט קיים</li>
          <li>בתפריט הימני, עבור ל-"IAM & Admin" ואז "Service Accounts"</li>
          <li>לחץ על "צור חשבון שירות"</li>
          <li>הזן שם לחשבון השירות ולחץ על "צור"</li>
          <li>הענק לחשבון השירות את התפקיד "Analytics Viewer"</li>
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
        
        <InfoBox type="warning" title="אזהרת אבטחה">
          שמור על המפתח ה-JSON שלך בצורה מאובטחת. כל מי שיש לו גישה למפתח זה יכול לגשת לנתוני האנליטיקה שלך.
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
          <li>לחץ על "הוסף אינטגרציה" ובחר "Google Analytics"</li>
          <li>הזן את מזהה המדידה (G-XXXXXXXXXX)</li>
          <li>העלה את קובץ ה-JSON שיצרת</li>
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
          <li>ודא שהנתונים מ-Google Analytics מוצגים כראוי</li>
          <li>אם אין נתונים, ייתכן שתצטרך להמתין מספר שעות עד שהנתונים יסונכרנו</li>
        </ol>
        
        <InfoBox type="tip">
          אם אתה לא רואה נתונים לאחר 24 שעות, בדוק את הגדרות האינטגרציה ואת ההרשאות של חשבון השירות.
        </InfoBox>
      </div>
    )
  }
];

export default googleAnalyticsSteps;
