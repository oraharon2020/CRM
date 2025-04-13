# Foreign Key Constraint Fix

## Problem Description

We encountered an issue where users were receiving an error message when trying to create an integration with a specific store:

> "החנות שנבחרה אינה קיימת במערכת. האינטגרציה תישמר ללא שיוך לחנות ספציפית."
> (Translation: "The selected store does not exist in the system. The integration will be saved without association to a specific store.")

This error occurred even though the store ID (1734219687) was visible in the dropdown and appeared to be a valid store.

## Investigation

We created diagnostic scripts to investigate the database structure and found a mismatch between the model definition and the actual database schema:

1. The `integration_settings` model defined a foreign key constraint that referenced the `woocommerce_stores` table:
   ```typescript
   FOREIGN KEY (store_id) REFERENCES woocommerce_stores(id) ON DELETE SET NULL
   ```

2. However, the actual database had a foreign key constraint that referenced the `stores` table instead:
   ```
   fk_integration_store: integration_settings.store_id -> stores.id
   ```

3. The store with ID 1734219687 existed in the `woocommerce_stores` table but not in the `stores` table, which only had IDs up to 4.

## Solution

We created a script (`fix-foreign-key.js`) to fix this issue by:

1. Dropping the incorrect foreign key constraint that pointed to the `stores` table
2. Creating a new foreign key constraint that correctly points to the `woocommerce_stores` table

The script was executed successfully and the foreign key constraint was updated:

```
מפתחות זרים בטבלת integration_settings לאחר העדכון:
- fk_integration_woocommerce_store: integration_settings.store_id -> woocommerce_stores.id
- integration_settings_default_assignee_fkey: integration_settings.default_assignee -> users.id
```

## Verification

After fixing the foreign key constraint, users should now be able to create integrations with any store from the `woocommerce_stores` table, including the store with ID 1734219687.

## Future Considerations

To prevent similar issues in the future:

1. Ensure that the model definitions match the actual database schema
2. Consider adding validation in the API to check if a store exists before attempting to create an integration
3. Implement better error handling to provide more specific error messages when foreign key constraints fail
