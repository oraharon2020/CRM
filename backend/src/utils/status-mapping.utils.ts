/**
 * Maps WooCommerce order status to our internal status format
 * @param wooStatus The WooCommerce status (can be string, number, or undefined)
 * @returns The mapped internal status
 */
export function mapWooCommerceStatus(wooStatus: string | number | undefined | null): string {
  // If status is undefined or null, return a default value
  if (wooStatus === undefined || wooStatus === null) {
    return 'לא ידוע';
  }
  
  // Convert status to string (in case it's a number)
  const statusStr = String(wooStatus);
  
  // Map WooCommerce statuses to our internal statuses
  const statusMap: Record<string, string> = {
    'pending': 'בהמתנה',
    'processing': 'בטיפול',
    'on-hold': 'בהמתנה',
    'completed': 'הושלם',
    'cancelled': 'בוטל',
    'refunded': 'הוחזר',
    'failed': 'נכשל',
    'trash': 'נמחק'
  };

  // Return the mapped status or the original if no mapping exists
  return statusMap[statusStr.toLowerCase()] || statusStr;
}
