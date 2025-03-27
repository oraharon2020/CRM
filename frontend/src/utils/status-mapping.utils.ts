/**
 * Status mapping utilities
 * This file contains utilities for mapping WooCommerce statuses to display statuses
 */

// Default status mapping from WooCommerce status to display status
export const DEFAULT_STATUS_MAPPING: Record<string, string> = {
  'pending': 'ממתין לתשלום',
  'processing': 'בטיפול',
  'on-hold': 'בהמתנה',
  'completed': 'הושלם',
  'cancelled': 'בוטל',
  'refunded': 'זוכה',
  'failed': 'נכשל',
  'trash': 'נמחק',
  // Add more mappings as needed
  'ready-for-pickup': 'מוכן לאיסוף',
  'collected': 'נאסף',
  'preparing': 'בהכנה',
  'shipped': 'נשלח'
};

// Default status colors
export const DEFAULT_STATUS_COLORS: Record<string, string> = {
  'ממתין לתשלום': 'bg-yellow-100 text-yellow-800',
  'בטיפול': 'bg-blue-100 text-blue-800',
  'בהמתנה': 'bg-yellow-100 text-yellow-800',
  'הושלם': 'bg-green-100 text-green-800',
  'בוטל': 'bg-red-100 text-red-800',
  'זוכה': 'bg-purple-100 text-purple-800',
  'נכשל': 'bg-red-100 text-red-800',
  'נמחק': 'bg-gray-100 text-gray-800',
  'מוכן לאיסוף': 'bg-indigo-100 text-indigo-800',
  'נאסף': 'bg-green-100 text-green-800',
  'בהכנה': 'bg-blue-100 text-blue-800',
  'נשלח': 'bg-green-100 text-green-800'
};

/**
 * Map a WooCommerce status to a display status
 * @param wooStatus WooCommerce status
 * @returns Display status in Hebrew
 */
export function mapWooCommerceStatus(wooStatus: string): string {
  return DEFAULT_STATUS_MAPPING[wooStatus] || wooStatus;
}

/**
 * Get color for a display status
 * @param displayStatus Display status in Hebrew
 * @returns CSS class for the status color
 */
export function getStatusColor(displayStatus: string): string {
  return DEFAULT_STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-800';
}

/**
 * Get all available statuses with their display names and colors
 * @returns Array of status objects with value, label, and color
 */
export function getAllStatuses(): { value: string; label: string; color: string }[] {
  return Object.entries(DEFAULT_STATUS_MAPPING).map(([value, label]) => ({
    value,
    label,
    color: getStatusColor(label)
  }));
}

/**
 * Get standard statuses (most commonly used)
 * @returns Array of standard status objects
 */
export function getStandardStatuses(): { value: string; label: string; color: string }[] {
  const standardStatusValues = ['processing', 'completed', 'on-hold', 'cancelled'];
  
  return standardStatusValues.map(value => ({
    value,
    label: DEFAULT_STATUS_MAPPING[value],
    color: getStatusColor(DEFAULT_STATUS_MAPPING[value])
  }));
}

/**
 * Get custom statuses (less commonly used)
 * @returns Array of custom status objects
 */
export function getCustomStatuses(): { value: string; label: string; color: string }[] {
  const standardStatusValues = ['processing', 'completed', 'on-hold', 'cancelled'];
  
  return Object.entries(DEFAULT_STATUS_MAPPING)
    .filter(([value]) => !standardStatusValues.includes(value))
    .map(([value, label]) => ({
      value,
      label,
      color: getStatusColor(label)
    }));
}
