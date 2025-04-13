// fix-foreign-key.js
const { Client } = require('pg');

async function fixForeignKey() {
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

    // בדיקת מפתחות זרים קיימים
    console.log('\n--- בדיקת מפתחות זרים קיימים ---');
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
      console.log('מפתחות זרים קיימים בטבלת integration_settings:');
      foreignKeysResult.rows.forEach(row => {
        console.log(`- ${row.constraint_name}: ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('לא נמצאו מפתחות זרים בטבלת integration_settings');
    }

    // מחיקת מפתח זר קיים אם הוא מצביע לטבלה הלא נכונה
    const storeConstraint = foreignKeysResult.rows.find(row => 
      row.column_name === 'store_id' && row.foreign_table_name === 'stores'
    );

    if (storeConstraint) {
      console.log(`\nמוצא מפתח זר שגוי: ${storeConstraint.constraint_name}`);
      console.log('מוחק את המפתח הזר הקיים...');
      
      const dropConstraintQuery = `
        ALTER TABLE integration_settings
        DROP CONSTRAINT ${storeConstraint.constraint_name};
      `;
      
      await client.query(dropConstraintQuery);
      console.log('המפתח הזר נמחק בהצלחה');
    } else {
      console.log('\nלא נמצא מפתח זר שגוי לטבלת stores');
    }

    // בדיקה אם קיים כבר מפתח זר לטבלת woocommerce_stores
    const woocommerceConstraint = foreignKeysResult.rows.find(row => 
      row.column_name === 'store_id' && row.foreign_table_name === 'woocommerce_stores'
    );

    if (!woocommerceConstraint) {
      console.log('\nיוצר מפתח זר חדש לטבלת woocommerce_stores...');
      
      const addConstraintQuery = `
        ALTER TABLE integration_settings
        ADD CONSTRAINT fk_integration_woocommerce_store
        FOREIGN KEY (store_id)
        REFERENCES woocommerce_stores(id)
        ON DELETE SET NULL;
      `;
      
      await client.query(addConstraintQuery);
      console.log('המפתח הזר החדש נוצר בהצלחה');
    } else {
      console.log('\nמפתח זר לטבלת woocommerce_stores כבר קיים');
    }

    // בדיקה שהמפתח הזר החדש נוצר בהצלחה
    console.log('\n--- בדיקת מפתחות זרים לאחר העדכון ---');
    const updatedForeignKeysResult = await client.query(foreignKeysQuery);
    
    if (updatedForeignKeysResult.rows.length > 0) {
      console.log('מפתחות זרים בטבלת integration_settings לאחר העדכון:');
      updatedForeignKeysResult.rows.forEach(row => {
        console.log(`- ${row.constraint_name}: ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('לא נמצאו מפתחות זרים בטבלת integration_settings לאחר העדכון');
    }

  } catch (error) {
    console.error('שגיאה:', error.message);
  } finally {
    await client.end();
    console.log('\nהחיבור למסד הנתונים נסגר');
  }
}

fixForeignKey().catch(console.error);
