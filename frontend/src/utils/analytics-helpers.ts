/**
 * Helper functions for analytics data generation and processing
 */

interface StatsData {
  orders: number;
  revenue: number;
  avg_order: number;
  products_sold: number;
}

/**
 * Generate sample time series data based on period and stats
 */
export const generateSampleTimeSeries = (period: string, stats: StatsData) => {
  const result = [];
  const now = new Date();
  let numPoints = 0;
  
  // Determine number of data points based on period
  if (period === 'today') {
    numPoints = 24; // Hours in a day
  } else if (period === 'week') {
    numPoints = 7; // Days in a week
  } else if (period === 'month') {
    numPoints = 30; // Approx days in a month
  } else if (period === 'year') {
    numPoints = 12; // Months in a year
  } else {
    numPoints = 14; // Default for custom
  }
  
  // Calculate average values per point
  const avgOrders = stats.orders / numPoints;
  const avgRevenue = stats.revenue / numPoints;
  const avgProducts = stats.products_sold / numPoints;
  
  // Generate data points
  for (let i = 0; i < numPoints; i++) {
    const date = new Date(now);
    
    if (period === 'today') {
      date.setHours(date.getHours() - i);
    } else if (period === 'week' || period === 'custom') {
      date.setDate(date.getDate() - i);
    } else if (period === 'month') {
      date.setDate(date.getDate() - i);
    } else if (period === 'year') {
      date.setMonth(date.getMonth() - i);
    }
    
    // Add some randomness to make it look realistic
    const randomFactor = 0.5 + Math.random();
    
    result.push({
      date: date.toISOString().split('T')[0],
      orders: Math.round(avgOrders * randomFactor),
      revenue: Math.round(avgRevenue * randomFactor),
      products_sold: Math.round(avgProducts * randomFactor)
    });
  }
  
  // Sort by date ascending
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Generate sample product performance data
 */
export const generateSampleProductPerformance = (stats: StatsData) => {
  // Real product names for better representation
  const productNames = [
    'מארז מתנה פרימיום',
    'חולצת כותנה אורגנית',
    'תיק צד מעוצב',
    'סט כלי מטבח מנירוסטה',
    'מנורת שולחן מעוצבת',
    'אוזניות בלוטות׳ אלחוטיות',
    'שמיכת פליז איכותית',
    'סט כוסות קריסטל',
    'שעון יד יוקרתי',
    'מחברת עור אמיתי',
    'סט טיפוח לפנים',
    'רמקול נייד עמיד במים',
    'תמונת קנבס מעוצבת',
    'סט תבלינים גורמה',
    'כרית אורתופדית'
  ];
  
  const result = [];
  const totalProducts = Math.min(15, Math.max(5, Math.round(stats.products_sold / 10)));
  
  for (let i = 0; i < totalProducts; i++) {
    const quantity = Math.round((stats.products_sold / totalProducts) * (0.5 + Math.random()));
    const avgPrice = stats.avg_order * (0.3 + Math.random() * 0.7);
    const revenue = quantity * avgPrice;
    
    result.push({
      id: 1000 + i,
      name: productNames[i % productNames.length],
      sku: `SKU-${1000 + i}`,
      quantity,
      revenue,
      average_price: avgPrice
    });
  }
  
  // Sort by revenue descending
  return result.sort((a, b) => b.revenue - a.revenue);
};

/**
 * Generate sample customer segments data
 */
export const generateSampleCustomerSegments = (stats: StatsData) => {
  // Estimate total customers based on orders and average 1.5 orders per customer
  const totalCustomers = Math.max(1, Math.round(stats.orders / 1.5));
  
  // Distribute customers across segments
  const oneTimeCustomers = Math.round(totalCustomers * 0.6); // 60% one-time
  const returningCustomers = Math.round(totalCustomers * 0.3); // 30% returning
  const loyalCustomers = totalCustomers - oneTimeCustomers - returningCustomers; // Rest are loyal
  
  // Calculate orders per segment
  const oneTimeOrders = oneTimeCustomers; // 1 order per one-time customer
  const returningOrders = returningCustomers * 2.5; // 2-3 orders per returning customer
  const loyalOrders = stats.orders - oneTimeOrders - returningOrders; // Rest of orders
  
  // Calculate revenue per segment
  const totalRevenue = stats.revenue;
  const oneTimeRevenue = totalRevenue * 0.4; // 40% of revenue
  const returningRevenue = totalRevenue * 0.35; // 35% of revenue
  const loyalRevenue = totalRevenue - oneTimeRevenue - returningRevenue; // Rest of revenue
  
  return [
    {
      segment: 'one_time',
      customers: oneTimeCustomers,
      orders: Math.round(oneTimeOrders),
      revenue: Math.round(oneTimeRevenue),
      average_order: Math.round(oneTimeRevenue / oneTimeOrders)
    },
    {
      segment: 'returning',
      customers: returningCustomers,
      orders: Math.round(returningOrders),
      revenue: Math.round(returningRevenue),
      average_order: Math.round(returningRevenue / returningOrders)
    },
    {
      segment: 'loyal',
      customers: loyalCustomers,
      orders: Math.round(loyalOrders),
      revenue: Math.round(loyalRevenue),
      average_order: Math.round(loyalRevenue / loyalOrders)
    }
  ];
};

/**
 * Format date to YYYY-MM-DD for API
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Generate empty analytics data
 */
export const generateEmptyAnalyticsData = () => {
  return {
    summary: {
      orders: 0,
      revenue: 0,
      avg_order: 0,
      products_sold: 0
    },
    time_series: [],
    product_performance: [],
    customer_segments: [],
    forecasts: {
      next_period: {
        orders: 0,
        revenue: 0
      },
      trend: 'stable',
      confidence: 0
    }
  };
};
