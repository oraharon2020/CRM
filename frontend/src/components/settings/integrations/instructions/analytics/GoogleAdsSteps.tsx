import React from 'react';
import { InfoBox, CodeBlock, Step } from '../common';

export const googleAdsSteps: Step[] = [
  {
    title: 'יצירת חשבון Google Ads',
    content: (
      <div>
        <p>אם אין לך עדיין חשבון Google Ads, צור חשבון חדש:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://ads.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Ads</a></li>
          <li>לחץ על "התחל עכשיו"</li>
          <li>עקוב אחר ההוראות ליצירת חשבון חדש</li>
        </ol>
      </div>
    )
  },
  {
    title: 'קישור Google Ads ל-Google Analytics',
    content: (
      <div>
        <p>קשר את חשבון ה-Google Ads שלך לחשבון ה-Google Analytics:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס לחשבון Google Analytics שלך</li>
          <li>עבור להגדרות הנכס (Property Settings)</li>
          <li>תחת "קישורי Google Ads", לחץ על "קשר חשבונות"</li>
          <li>בחר את חשבון Google Ads שברצונך לקשר</li>
          <li>הפעל את האפשרויות "כל הקמפיינים" ו"אפשר ייבוא מטרות ועסקאות"</li>
          <li>לחץ על "קשר חשבונות"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'הפעלת ה-API של Google Ads',
    content: (
      <div>
        <p>הפעל את ה-API של Google Ads בפרויקט Google Cloud שלך:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס ל-<a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Cloud Console</a></li>
          <li>בחר את הפרויקט שבו יצרת את חשבון השירות</li>
          <li>עבור ל-"API & Services" ואז "Library"</li>
          <li>חפש "Google Ads API" ולחץ עליו</li>
          <li>לחץ על "הפעל"</li>
        </ol>
      </div>
    )
  },
  {
    title: 'קבלת מזהה לקוח (Client ID)',
    content: (
      <div>
        <p>קבל את מזהה הלקוח של חשבון Google Ads שלך:</p>
        <ol className="list-decimal list-inside mr-4 mt-2 space-y-2">
          <li>היכנס לחשבון Google Ads שלך</li>
          <li>לחץ על סמל ההגדרות (גלגל שיניים) בפינה הימנית העליונה</li>
          <li>תחת "הגדרות", בחר "גישה וביטחון"</li>
          <li>מזהה הלקוח יופיע בחלק העליון של הדף</li>
        </ol>
        
        <CodeBlock 
          title="דוגמה למזהה לקוח"
          code="123-456-7890"
        />
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
          <li>לחץ על "הוסף אינטגרציה" ובחר "Google Ads"</li>
          <li>הזן את מזהה הלקוח של Google Ads</li>
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
          <li>ודא שהנתונים מ-Google Ads מוצגים כראוי</li>
          <li>בדוק את הדוחות של ביצועי הקמפיינים</li>
        </ol>
        
        <InfoBox type="warning">
          ייתכן שיעברו עד 24 שעות עד שכל הנתונים יסונכרנו במלואם.
        </InfoBox>
      </div>
    )
  }
];

export default googleAdsSteps;
