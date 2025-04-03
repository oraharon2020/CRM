/**
 * Maps WooCommerce order status to our internal status format
 * @param wooStatus The WooCommerce status string
 * @returns The mapped internal status
 */
export function mapWooCommerceStatus(wooStatus: string): string {
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
  return statusMap[wooStatus.toLowerCase()] || wooStatus;
}
