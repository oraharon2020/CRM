// update-enum.js
const { Client } = require('pg');

async function updateEnum() {
  // חיבור למסד הנתונים עם SSL
  const client = new Client({
    connectionString: 'postgresql://global_crm_db_user:55rMFvN3oVFfogjLSmBE75uqhX06C5zq@dpg-cv4avo5ds78s73ds7gjg-a.frankfurt-postgres.render.com/global_crm_db',
    ssl: {
      rejectUnauthorized: false // דרוש עבור Render.com
    }
  });

  try {
    await client.connect();
    console.log('מחובר למסד הנתונים!');

    // בדיקה אם הערך כבר קיים ב-enum
    const checkQuery = `
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'integration_type'
      AND e.enumlabel = 'multi-supplier-manager';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('הערך multi-supplier-manager כבר קיים ב-enum integration_type');
      return;
    }

    // ניסיון להוסיף את הערך ל-enum
    try {
      const addValueQuery = `
        ALTER TYPE integration_type ADD VALUE 'multi-supplier-manager';
      `;
      
      await client.query(addValueQuery);
      console.log('הערך multi-supplier-manager התווסף בהצלחה ל-enum integration_type');
    } catch (addError) {
      console.error('שגיאה בהוספת הערך ל-enum:', addError.message);
      
      // במקרה שלא ניתן להוסיף את הערך, נשתמש בגישה חלופית
      console.log('משתמש בגישה חלופית...');
      
      // יצירת סוג enum חדש עם כל הערכים כולל החדש
      await client.query(`
        -- יצירת סוג enum חדש עם כל הערכים כולל החדש
        CREATE TYPE integration_type_new AS ENUM (
          'elementor', 'contact-form-7', 'facebook', 'custom', 'generic',
          'google-ads', 'facebook-ads', 'google-analytics', 'google-search-console',
          'multi-supplier-manager'
        );
        
        -- עדכון העמודה לשימוש בסוג החדש
        ALTER TABLE integration_settings 
        ALTER COLUMN type TYPE integration_type_new 
        USING type::text::integration_type_new;
        
        -- מחיקת הסוג הישן
        DROP TYPE integration_type;
        
        -- שינוי שם הסוג החדש לשם הישן
        ALTER TYPE integration_type_new RENAME TO integration_type;
      `);
      
      console.log('הערך multi-supplier-manager התווסף בהצלחה ל-enum integration_type באמצעות הגישה החלופית');
    }
  } catch (error) {
    console.error('שגיאה:', error.message);
  } finally {
    await client.end();
    console.log('החיבור למסד הנתונים נסגר');
  }
}

updateEnum().catch(console.error);
