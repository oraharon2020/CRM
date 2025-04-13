# Store Statistics Components

This directory contains components for displaying real-time WooCommerce store statistics on the dashboard.

## Components

### StoreSelector

A dropdown component that allows users to select which WooCommerce store to view statistics for.

- Fetches available stores from the API
- Filters to show only active stores
- Automatically selects the first store if none is selected
- Provides error handling and loading states

### StoreStats

A component that displays statistics for a selected WooCommerce store.

- Shows key metrics:
  - Number of orders
  - Revenue
  - Average order value
  - Number of products sold
- Allows filtering by time period (week, month, year)
- Provides a refresh button to update the data in real-time
- Handles loading states and errors

## Usage

These components are used on the Dashboard page to display real-time data from WooCommerce stores. The implementation follows these steps:

1. The Dashboard component maintains state for the selected store and time period
2. The StoreSelector component allows the user to choose which store to view
3. The StoreStats component fetches and displays statistics for the selected store and time period

## API Integration

The components are designed to work with the following API endpoints:

- `GET /stores` - Get a list of all stores
- `GET /stores/:id/stats` - Get statistics for a specific store

The API calls are abstracted through the `storesAPI` service in `src/services/api.ts`.

## Example

```tsx
// In Dashboard.tsx
const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'year'>('month');

// ...

{/* Store Selector */}
<StoreSelector 
  selectedStoreId={selectedStoreId} 
  onStoreChange={setSelectedStoreId} 
/>

{/* Store Statistics */}
{selectedStoreId && (
  <StoreStats 
    storeId={selectedStoreId} 
    period={statsPeriod} 
    onPeriodChange={setStatsPeriod} 
  />
)}
