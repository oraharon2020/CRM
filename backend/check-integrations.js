// check-integrations.js
const { Client } = require('pg');

async function checkIntegrations() {
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

    // בדיקה אם הערך קיים ב-enum
    console.log('\n--- בדיקת ערכי ה-enum ---');
    const enumQuery = `
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'integration_type'
      ORDER BY e.enumsortorder;
    `;
    
    const enumResult = await client.query(enumQuery);
    
    if (enumResult.rows.length > 0) {
      console.log('ערכי ה-enum integration_type:');
      enumResult.rows.forEach(row => {
        console.log(`- ${row.enumlabel}`);
      });
    } else {
      console.log('לא נמצאו ערכים ב-enum integration_type');
    }

    // בדיקת האינטגרציות הקיימות
    console.log('\n--- בדיקת האינטגרציות הקיימות ---');
    const integrationsQuery = `
      SELECT id, name, type, store_id, is_enabled, settings, created_at, updated_at
      FROM integration_settings
      ORDER BY id;
    `;
    
    const integrationsResult = await client.query(integrationsQuery);
    
    if (integrationsResult.rows.length > 0) {
      console.log(`נמצאו ${integrationsResult.rows.length} אינטגרציות:`);
      integrationsResult.rows.forEach(row => {
        console.log(`\nאינטגרציה #${row.id}:`);
        console.log(`- שם: ${row.name}`);
        console.log(`- סוג: ${row.type}`);
        console.log(`- חנות: ${row.store_id || 'גלובלי'}`);
        console.log(`- פעיל: ${row.is_enabled ? 'כן' : 'לא'}`);
        console.log(`- נוצר ב: ${row.created_at}`);
        console.log(`- עודכן ב: ${row.updated_at}`);
        
        if (row.settings) {
          console.log('- הגדרות:');
          const settings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
          Object.entries(settings).forEach(([key, value]) => {
            console.log(`  * ${key}: ${JSON.stringify(value)}`);
          });
        }
      });
    } else {
      console.log('לא נמצאו אינטגרציות במסד הנתונים');
    }

    // בדיקה ספציפית לאינטגרציות מסוג multi-supplier-manager
    console.log('\n--- בדיקת אינטגרציות מסוג Multi-Supplier Manager ---');
    const msmQuery = `
      SELECT id, name, type, store_id, is_enabled, settings, created_at, updated_at
      FROM integration_settings
      WHERE type = 'multi-supplier-manager'
      ORDER BY id;
    `;
    
    const msmResult = await client.query(msmQuery);
    
    if (msmResult.rows.length > 0) {
      console.log(`נמצאו ${msmResult.rows.length} אינטגרציות מסוג Multi-Supplier Manager:`);
      msmResult.rows.forEach(row => {
        console.log(`\nאינטגרציה #${row.id}:`);
        console.log(`- שם: ${row.name}`);
        console.log(`- חנות: ${row.store_id || 'גלובלי'}`);
        console.log(`- פעיל: ${row.is_enabled ? 'כן' : 'לא'}`);
        console.log(`- נוצר ב: ${row.created_at}`);
        console.log(`- עודכן ב: ${row.updated_at}`);
        
        if (row.settings) {
          console.log('- הגדרות:');
          const settings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
          Object.entries(settings).forEach(([key, value]) => {
            console.log(`  * ${key}: ${JSON.stringify(value)}`);
          });
        }
      });
    } else {
      console.log('לא נמצאו אינטגרציות מסוג Multi-Supplier Manager במסד הנתונים');
    }

    // בדיקת מבנה הטבלה
    console.log('\n--- בדיקת מבנה טבלת האינטגרציות ---');
    const tableStructureQuery = `
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'integration_settings'
      ORDER BY ordinal_position;
    `;
    
    const tableStructureResult = await client.query(tableStructureQuery);
    
    if (tableStructureResult.rows.length > 0) {
      console.log('מבנה טבלת integration_settings:');
      tableStructureResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('לא ניתן לקבל מידע על מבנה הטבלה');
    }

  } catch (error) {
    console.error('שגיאה:', error.message);
  } finally {
    await client.end();
    console.log('\nהחיבור למסד הנתונים נסגר');
  }
}

checkIntegrations().catch(console.error);
