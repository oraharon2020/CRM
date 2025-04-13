# Settings Components

This directory contains modular components for the Settings page of the CRM system.

## Structure

- `index.ts` - Exports all components for easy importing
- `UsersTab.tsx` - User management component
- `GeneralTab.tsx` - General system settings component
- `NotificationsTab.tsx` - Notification settings component
- `IntegrationsTab.tsx` - External integrations component
- `BackupTab.tsx` - Backup and restore functionality component

## Usage

The components are designed to be used with the main Settings page. Each component represents a tab in the settings interface.

```tsx
import { 
  UsersTab, 
  GeneralTab, 
  NotificationsTab, 
  IntegrationsTab, 
  BackupTab 
} from '../components/settings';

// Then in your component:
{activeTab === 'users' && <UsersTab />}
{activeTab === 'general' && <GeneralTab />}
// etc.
```

## Adding New Settings Tabs

To add a new settings tab:

1. Create a new component file in this directory (e.g., `NewFeatureTab.tsx`)
2. Export the component in `index.ts`
3. Add the tab button and conditional rendering in the main Settings page

## Styling

All components use Tailwind CSS for styling and maintain a consistent look and feel with the rest of the application.

## RTL Support

All components are designed with RTL (Right-to-Left) support for Hebrew language.
