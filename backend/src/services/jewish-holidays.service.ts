import axios from 'axios';

interface HebcalHoliday {
  title: string;
  date: string;
  hebrew: string;
  memo?: string;
  category: string;
  subcat?: string;
  yomtov?: boolean;
  link?: string;
}

interface HebcalResponse {
  title: string;
  date: string;
  location: {
    geo: string;
  };
  items: HebcalHoliday[];
}

export interface JewishHoliday {
  id: string;
  title: string;
  date: string;
  hebrew: string;
  description?: string;
  category: string;
  isYomTov: boolean;
}

class JewishHolidaysService {
  private cache: Map<string, JewishHoliday[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Fetches Jewish holidays for a specific year
   * @param year The year to fetch holidays for
   * @returns Array of Jewish holidays
   */
  async getHolidaysForYear(year: number): Promise<JewishHoliday[]> {
    // Check cache first
    const cacheKey = `holidays-${year}`;
    const cachedData = this.cache.get(cacheKey);
    const cacheTimestamp = this.cacheExpiry.get(cacheKey) || 0;
    
    // If we have cached data and it's not expired, return it
    if (cachedData && Date.now() < cacheTimestamp) {
      console.log(`Using cached Jewish holidays for year ${year}`);
      return cachedData;
    }
    
    try {
      // Fetch from Hebcal API
      const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}&month=x&mod=on&maj=on&min=off&nx=off&mf=off&ss=off&mod=on&s=off&c=off&geo=none&m=0&s=off`;
      
      const response = await axios.get<HebcalResponse>(url);
      
      if (!response.data || !response.data.items) {
        throw new Error('Invalid response from Hebcal API');
      }
      
      // Transform the data
      const holidays: JewishHoliday[] = response.data.items.map(item => ({
        id: `jewish-holiday-${item.title}-${item.date}`,
        title: item.title,
        date: item.date,
        hebrew: item.hebrew || '',
        description: item.memo,
        category: item.category,
        isYomTov: item.yomtov || false
      }));
      
      // Cache the data
      this.cache.set(cacheKey, holidays);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
      
      return holidays;
    } catch (error) {
      console.error('Error fetching Jewish holidays:', error);
      throw new Error('Failed to fetch Jewish holidays');
    }
  }

  /**
   * Gets holidays for a specific date range
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @returns Holidays within the date range
   */
  async getHolidaysForDateRange(startDate: string, endDate: string): Promise<JewishHoliday[]> {
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    
    // Get unique years in the range
    const years = new Set<number>();
    for (let year = startYear; year <= endYear; year++) {
      years.add(year);
    }
    
    // Fetch holidays for all years in the range
    const holidaysPromises = Array.from(years).map(year => this.getHolidaysForYear(year));
    const holidaysArrays = await Promise.all(holidaysPromises);
    
    // Flatten the arrays and filter by date range
    const allHolidays = holidaysArrays.flat();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    return allHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= startDateObj && holidayDate <= endDateObj;
    });
  }

  /**
   * Gets upcoming holidays
   * @param limit Maximum number of holidays to return
   * @returns Array of upcoming holidays
   */
  async getUpcomingHolidays(limit: number = 5): Promise<JewishHoliday[]> {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Fetch holidays for current and next year to ensure we have enough upcoming holidays
    const currentYearHolidays = await this.getHolidaysForYear(currentYear);
    const nextYearHolidays = await this.getHolidaysForYear(currentYear + 1);
    
    const allHolidays = [...currentYearHolidays, ...nextYearHolidays];
    
    // Filter for upcoming holidays and sort by date
    return allHolidays
      .filter(holiday => new Date(holiday.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const jewishHolidaysService = new JewishHolidaysService();
