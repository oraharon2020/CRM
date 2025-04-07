import { CashFlowData, Expenses, ForecastResult } from './types';

/**
 * Calculate a forecast for the end of the month based on existing data
 * 
 * @param data Array of CashFlowData for the current month
 * @param month Current month (1-12)
 * @param year Current year
 * @returns Forecast result with metadata or null if no data
 */
export const calculateForecast = (
  data: CashFlowData[],
  month: number,
  year: number
): ForecastResult | null => {
  if (!data || data.length === 0) {
    console.log('No data available for forecast calculation');
    return null;
  }

  // Log input parameters for debugging
  console.log(`Calculating forecast for ${month}/${year} with ${data.length} data points`);
  
  // Calculate total days in the selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  console.log(`Days in month: ${daysInMonth}`);
  
  // Get current date to determine how many days have passed
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // If we're viewing a past month, assume all days have data
  // If we're viewing the current month, use the current day
  // If we're viewing a future month, assume no days have data yet
  let daysWithData: number;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    // Past month - all days should have data
    daysWithData = daysInMonth;
  } else if (year === currentYear && month === currentMonth) {
    // Current month - use current day
    daysWithData = currentDate.getDate();
  } else {
    // Future month - no days have data yet
    daysWithData = 0;
  }
  
  // Ensure we don't exceed the days in the month
  daysWithData = Math.min(daysWithData, daysInMonth);
  console.log(`Days with data: ${daysWithData}`);
  
  // Calculate days remaining in the month
  const daysRemaining = daysInMonth - daysWithData;
  console.log(`Days remaining: ${daysRemaining}`);
  
  // If no days remaining, just return the sum of existing data
  if (daysRemaining <= 0) {
    console.log('No days remaining in month, returning sum of existing data');
    
    // Sum up all existing data
    const existingTotals = sumExistingData(data);
    
    // Calculate profit and ROI
    const profit = existingTotals.revenue - existingTotals.expenses.total;
    const roi = existingTotals.expenses.total > 0 ? (profit / existingTotals.expenses.total) * 100 : 0;
    
    return {
      date: `${year}-${month.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`,
      revenue: existingTotals.revenue,
      orderCount: existingTotals.orderCount,
      productCount: existingTotals.productCount,
      expenses: existingTotals.expenses,
      profit,
      roi,
      meta: {
        daysInMonth,
        daysWithData,
        daysRemaining,
        dailyAvg: {
          revenue: existingTotals.revenue / Math.max(1, data.length),
          orderCount: existingTotals.orderCount / Math.max(1, data.length),
          productCount: existingTotals.productCount / Math.max(1, data.length),
          expenses: {
            vatDeductible: existingTotals.expenses.vatDeductible / Math.max(1, data.length),
            nonVatDeductible: existingTotals.expenses.nonVatDeductible / Math.max(1, data.length),
            salary: existingTotals.expenses.salary / Math.max(1, data.length),
            vat: existingTotals.expenses.vat / Math.max(1, data.length),
            marketingFacebook: existingTotals.expenses.marketingFacebook / Math.max(1, data.length),
            marketingGoogle: existingTotals.expenses.marketingGoogle / Math.max(1, data.length),
            marketingTikTok: existingTotals.expenses.marketingTikTok / Math.max(1, data.length),
            shipping: existingTotals.expenses.shipping / Math.max(1, data.length),
            total: existingTotals.expenses.total / Math.max(1, data.length)
          }
        }
      }
    };
  }
  
  // Filter data to only include days with actual data (non-zero values)
  const daysWithActualData = data.filter(item => 
    item.revenue > 0 || 
    item.orderCount > 0 || 
    (item.expenses && Object.values(item.expenses).some(val => val > 0))
  );
  
  console.log(`Days with actual data (non-zero values): ${daysWithActualData.length}`);
  
  // If no days with actual data, return zeros
  if (daysWithActualData.length === 0) {
    console.log('No days with actual data, returning zeros');
    
    const emptyExpenses: Expenses = {
      vatDeductible: 0,
      nonVatDeductible: 0,
      salary: 0,
      vat: 0,
      marketingFacebook: 0,
      marketingGoogle: 0,
      marketingTikTok: 0,
      shipping: 0,
      total: 0
    };
    
    return {
      date: `${year}-${month.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`,
      revenue: 0,
      orderCount: 0,
      productCount: 0,
      expenses: emptyExpenses,
      profit: 0,
      roi: 0,
      meta: {
        daysInMonth,
        daysWithData,
        daysRemaining,
        dailyAvg: {
          revenue: 0,
          orderCount: 0,
          productCount: 0,
          expenses: emptyExpenses
        }
      }
    };
  }
  
  // Sum up all values from days with actual data
  const actualDataTotals = sumExistingData(daysWithActualData);
  
  // Calculate daily averages based on days with actual data
  const effectiveDays = daysWithActualData.length;
  console.log(`Using ${effectiveDays} days for daily average calculation`);
  
  const dailyAvg = {
    revenue: actualDataTotals.revenue / effectiveDays,
    orderCount: actualDataTotals.orderCount / effectiveDays,
    productCount: actualDataTotals.productCount / effectiveDays,
    expenses: {
      vatDeductible: actualDataTotals.expenses.vatDeductible / effectiveDays,
      nonVatDeductible: actualDataTotals.expenses.nonVatDeductible / effectiveDays,
      salary: actualDataTotals.expenses.salary / effectiveDays,
      vat: actualDataTotals.expenses.vat / effectiveDays,
      marketingFacebook: actualDataTotals.expenses.marketingFacebook / effectiveDays,
      marketingGoogle: actualDataTotals.expenses.marketingGoogle / effectiveDays,
      marketingTikTok: actualDataTotals.expenses.marketingTikTok / effectiveDays,
      shipping: actualDataTotals.expenses.shipping / effectiveDays,
      total: actualDataTotals.expenses.total / effectiveDays
    }
  };
  
  console.log(`Daily averages: Revenue=${dailyAvg.revenue}, Orders=${dailyAvg.orderCount}, Total Expenses=${dailyAvg.expenses.total}`);
  
  // Get the total of all existing data (including days with zero values)
  const existingTotals = sumExistingData(data);
  
  // Project to end of month by adding the daily average for remaining days
  const forecast = {
    revenue: existingTotals.revenue + (dailyAvg.revenue * daysRemaining),
    orderCount: Math.round(existingTotals.orderCount + (dailyAvg.orderCount * daysRemaining)),
    productCount: Math.round(existingTotals.productCount + (dailyAvg.productCount * daysRemaining)),
    expenses: {
      vatDeductible: existingTotals.expenses.vatDeductible + (dailyAvg.expenses.vatDeductible * daysRemaining),
      nonVatDeductible: existingTotals.expenses.nonVatDeductible + (dailyAvg.expenses.nonVatDeductible * daysRemaining),
      salary: existingTotals.expenses.salary + (dailyAvg.expenses.salary * daysRemaining),
      vat: existingTotals.expenses.vat + (dailyAvg.expenses.vat * daysRemaining),
      marketingFacebook: existingTotals.expenses.marketingFacebook + (dailyAvg.expenses.marketingFacebook * daysRemaining),
      marketingGoogle: existingTotals.expenses.marketingGoogle + (dailyAvg.expenses.marketingGoogle * daysRemaining),
      marketingTikTok: existingTotals.expenses.marketingTikTok + (dailyAvg.expenses.marketingTikTok * daysRemaining),
      shipping: existingTotals.expenses.shipping + (dailyAvg.expenses.shipping * daysRemaining),
      total: existingTotals.expenses.total + (dailyAvg.expenses.total * daysRemaining)
    }
  };
  
  console.log(`Forecast: Revenue=${forecast.revenue}, Orders=${forecast.orderCount}, Total Expenses=${forecast.expenses.total}`);
  
  // Calculate profit and ROI
  const profit = forecast.revenue - forecast.expenses.total;
  const roi = forecast.expenses.total > 0 ? (profit / forecast.expenses.total) * 100 : 0;
  
  // Return forecast with metadata
  return {
    date: `${year}-${month.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`,
    revenue: forecast.revenue,
    orderCount: forecast.orderCount,
    productCount: forecast.productCount,
    expenses: forecast.expenses,
    profit,
    roi,
    meta: {
      daysInMonth,
      daysWithData,
      daysRemaining,
      dailyAvg
    }
  };
};

/**
 * Sum up all values from the provided data
 */
const sumExistingData = (data: CashFlowData[]) => {
  return data.reduce((acc, item) => {
    return {
      revenue: acc.revenue + (isNaN(item.revenue) ? 0 : item.revenue),
      orderCount: acc.orderCount + (isNaN(item.orderCount) ? 0 : item.orderCount),
      productCount: acc.productCount + (isNaN(item.productCount) ? 0 : item.productCount),
      expenses: {
        vatDeductible: acc.expenses.vatDeductible + (item.expenses?.vatDeductible || 0),
        nonVatDeductible: acc.expenses.nonVatDeductible + (item.expenses?.nonVatDeductible || 0),
        salary: acc.expenses.salary + (item.expenses?.salary || 0),
        vat: acc.expenses.vat + (item.expenses?.vat || 0),
        marketingFacebook: acc.expenses.marketingFacebook + (item.expenses?.marketingFacebook || 0),
        marketingGoogle: acc.expenses.marketingGoogle + (item.expenses?.marketingGoogle || 0),
        marketingTikTok: acc.expenses.marketingTikTok + (item.expenses?.marketingTikTok || 0),
        shipping: acc.expenses.shipping + (item.expenses?.shipping || 0),
        total: acc.expenses.total + (item.expenses?.total || 0)
      }
    };
  }, {
    revenue: 0,
    orderCount: 0,
    productCount: 0,
    expenses: {
      vatDeductible: 0,
      nonVatDeductible: 0,
      salary: 0,
      vat: 0,
      marketingFacebook: 0,
      marketingGoogle: 0,
      marketingTikTok: 0,
      shipping: 0,
      total: 0
    }
  });
};
