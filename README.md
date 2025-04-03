# Global CRM

מערכת ניהול לקוחות מתקדמת המבוססת על טכנולוגיות מודרניות.

## טכנולוגיות

### Frontend
- React 18 עם TypeScript
- Vite כ-bundler
- React Router לניהול ניתוב
- TailwindCSS לעיצוב
- Axios לביצוע בקשות HTTP
- React Query לניהול מצב שרת
- React Hook Form לטיפול בטפסים

### Backend
- Node.js עם TypeScript
- Express.js כמסגרת שרת
- MySQL כבסיס נתונים
- JWT לאימות משתמשים
- Prisma כ-ORM

## תכונות

- ממשק משתמש מודרני ומגיב
- ניהול הזמנות
- יומן פגישות ומשימות
- ניהול משתמשים והרשאות
- דשבורד עם נתונים סטטיסטיים
- ניתוח מתקדם של ביצועי מוצרים עם מערכת מטמון
- ניהול לידים ומעקב אחר התקדמות
- תמיכה מלאה בעברית (RTL)
- תצוגה מותאמת למובייל

## התקנה והפעלה

### דרישות מקדימות
- Node.js (גרסה 18 ומעלה)
- MySQL (גרסה 8 ומעלה)

### התקנת הפרויקט

1. שכפל את המאגר:
```bash
git clone https://github.com/your-username/global-crm.git
cd global-crm
```

2. התקנת תלויות:
```bash
# התקנת תלויות צד שרת
cd backend
npm install

# התקנת תלויות צד לקוח
cd ../frontend
npm install
```

3. הגדרת משתני סביבה:
   - העתק את קובץ `.env.example` לקובץ `.env` בתיקיית `backend`
   - ערוך את הקובץ והגדר את פרטי החיבור לבסיס הנתונים

4. יצירת בסיס נתונים:
```bash
cd backend
npm run db:setup
```

5. הפעלת הפרויקט:
```bash
# הפעלת השרת (מתיקיית backend)
npm run dev

# הפעלת צד לקוח (מתיקיית frontend)
cd ../frontend
npm run dev
```

6. גש לכתובת `http://localhost:5173` בדפדפן כדי לראות את האפליקציה

## פרטי התחברות לדוגמה

- **מנהל מערכת**:
  - דוא"ל: admin@example.com
  - סיסמה: admin123

- **מנהל צוות**:
  - דוא"ל: manager@example.com
  - סיסמה: manager123

- **משתמש רגיל**:
  - דוא"ל: user@example.com
  - סיסמה: user123

## מבנה הפרויקט

```
global-crm/
├── backend/               # קוד צד שרת
│   ├── src/
│   │   ├── config/        # הגדרות
│   │   ├── controllers/   # בקרים
│   │   ├── database/      # הגדרות בסיס נתונים
│   │   ├── docs/          # תיעוד
│   │   ├── jobs/          # משימות מתוזמנות
│   │   ├── middleware/    # מידלוור
│   │   ├── models/        # מודלים
│   │   ├── routes/        # נתיבים
│   │   ├── services/      # שירותים
│   │   ├── utils/         # כלי עזר
│   │   └── index.ts       # נקודת כניסה
│   └── package.json
│
└── frontend/              # קוד צד לקוח
    ├── public/            # קבצים סטטיים
    ├── src/
    │   ├── components/    # רכיבים
    │   ├── contexts/      # קונטקסט
    │   ├── hooks/         # הוקים
    │   ├── pages/         # דפים
    │   ├── services/      # שירותים
    │   ├── types/         # טיפוסים
    │   ├── utils/         # כלי עזר
    │   ├── App.tsx        # רכיב ראשי
    │   └── main.tsx       # נקודת כניסה
    └── package.json
```

## פיתוח עתידי

- [x] אינטגרציה עם מערכות חיצוניות (WooCommerce)
- [x] מודול ניתוח מתקדם עם מטמון מוצרים
- [x] ניהול לידים ומעקב אחר התקדמות
- [ ] אפליקציית מובייל
- [ ] התראות בזמן אמת
- [ ] אפשרויות ייצוא נתונים
- [ ] מערכת ניהול מלאי מתקדמת

## תיעוד

- [מערכת מטמון מוצרים](backend/src/docs/product-cache.md)

## רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה קובץ `LICENSE` לפרטים נוספים.
