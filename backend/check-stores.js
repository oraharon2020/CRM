// check-stores.js
const { Client } = require('pg');

async function checkStores() {
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

    // בדיקת מבנה טבלת החנויות
    console.log('\n--- בדיקת מבנה טבלת החנויות ---');
    const tableStructureQuery = `
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'woocommerce_stores'
      ORDER BY ordinal_position;
    `;
    
    const tableStructureResult = await client.query(tableStructureQuery);
    
    if (tableStructureResult.rows.length > 0) {
      console.log('מבנה טבלת woocommerce_stores:');
      tableStructureResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('לא ניתן לקבל מידע על מבנה הטבלה או שהטבלה לא קיימת');
    }

    // בדיקת החנויות הקיימות
    console.log('\n--- בדיקת החנויות הקיימות ---');
    const storesQuery = `
      SELECT * FROM woocommerce_stores
      ORDER BY id;
    `;
    
    try {
      const storesResult = await client.query(storesQuery);
      
      if (storesResult.rows.length > 0) {
        console.log(`נמצאו ${storesResult.rows.length} חנויות:`);
        storesResult.rows.forEach(row => {
          console.log(`\nחנות #${row.id}:`);
          Object.entries(row).forEach(([key, value]) => {
            console.log(`- ${key}: ${value}`);
          });
        });
      } else {
        console.log('לא נמצאו חנויות במסד הנתונים');
      }
    } catch (error) {
      console.error('שגיאה בבדיקת החנויות:', error.message);
      console.log('ייתכן שטבלת woocommerce_stores לא קיימת');
      
      // בדיקה אם הטבלה קיימת
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'woocommerce_stores'
        );
      `;
      
      const tableExistsResult = await client.query(tableExistsQuery);
      console.log(`האם טבלת woocommerce_stores קיימת: ${tableExistsResult.rows[0].exists ? 'כן' : 'לא'}`);
    }

    // בדיקת מפתחות זרים
    console.log('\n--- בדיקת מפתחות זרים ---');
    const foreignKeysQuery = `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'integration_settings';
    `;
    
    const foreignKeysResult = await client.query(foreignKeysQuery);
    
    if (foreignKeysResult.rows.length > 0) {
      console.log('מפתחות זרים בטבלת integration_settings:');
      foreignKeysResult.rows.forEach(row => {
        console.log(`- ${row.constraint_name}: ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('לא נמצאו מפתחות זרים בטבלת integration_settings');
    }

    // בדיקה ספציפית למזהה החנות 1734219687
    console.log('\n--- בדיקה ספציפית למזהה החנות 1734219687 ---');
    try {
      const specificStoreQuery = `
        SELECT * FROM woocommerce_stores
        WHERE id = 1734219687;
      `;
      
      const specificStoreResult = await client.query(specificStoreQuery);
      
      if (specificStoreResult.rows.length > 0) {
        console.log('נמצאה חנות עם מזהה 1734219687:');
        Object.entries(specificStoreResult.rows[0]).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      } else {
        console.log('לא נמצאה חנות עם מזהה 1734219687');
      }
    } catch (error) {
      console.error('שגיאה בבדיקת החנות הספציפית:', error.message);
    }

    // בדיקת הטבלה שמכילה את רשימת החנויות בממשק
    console.log('\n--- בדיקת טבלאות נוספות שעשויות להכיל מידע על חנויות ---');
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%store%';
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    if (tablesResult.rows.length > 0) {
      console.log('טבלאות שעשויות להכיל מידע על חנויות:');
      for (const row of tablesResult.rows) {
        console.log(`\nטבלה: ${row.table_name}`);
        
        try {
          // בדיקת מבנה הטבלה
          const tableStructureQuery = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = '${row.table_name}'
            ORDER BY ordinal_position;
          `;
          
          const tableStructureResult = await client.query(tableStructureQuery);
          
          console.log(`מבנה טבלת ${row.table_name}:`);
          tableStructureResult.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type}`);
          });
          
          // בדיקת הנתונים בטבלה
          const dataQuery = `
            SELECT * FROM ${row.table_name}
            LIMIT 5;
          `;
          
          const dataResult = await client.query(dataQuery);
          
          if (dataResult.rows.length > 0) {
            console.log(`נתונים בטבלת ${row.table_name} (עד 5 שורות):`);
            dataResult.rows.forEach((dataRow, index) => {
              console.log(`\nשורה ${index + 1}:`);
              Object.entries(dataRow).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
              });
            });
          } else {
            console.log(`אין נתונים בטבלת ${row.table_name}`);
          }
        } catch (error) {
          console.error(`שגיאה בבדיקת טבלת ${row.table_name}:`, error.message);
        }
      }
    } else {
      console.log('לא נמצאו טבלאות שעשויות להכיל מידע על חנויות');
    }

  } catch (error) {
    console.error('שגיאה:', error.message);
  } finally {
    await client.end();
    console.log('\nהחיבור למסד הנתונים נסגר');
  }
}

checkStores().catch(console.error);
