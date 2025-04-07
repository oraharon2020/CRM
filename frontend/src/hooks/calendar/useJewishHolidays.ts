import { useState, useEffect } from 'react';
import { JewishHoliday, HolidayCategory } from '../../types/calendar.types';
import { calendarAPI } from '../../services/api';
import { createDateString } from '../../utils/calendar.utils';

interface UseJewishHolidaysProps {
  month: number;
  year: number;
  enabled: boolean;
  categories?: HolidayCategory[];
}

/**
 * Hook for fetching and managing Jewish holidays
 * @param props Object containing month, year, and enabled flag
 * @returns Object containing holidays, loading state, and selected holidays
 */
export const useJewishHolidays = ({ 
  month, 
  year, 
  enabled,
  categories = ['major', 'minor', 'modern', 'roshchodesh']
}: UseJewishHolidaysProps) => {
  const [holidays, setHolidays] = useState<JewishHoliday[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateHolidays, setSelectedDateHolidays] = useState<JewishHoliday[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // State for holiday categories
  const [selectedCategories, setSelectedCategories] = useState<HolidayCategory[]>(categories);
  const [allHolidays, setAllHolidays] = useState<JewishHoliday[]>([]);

  // Fetch Jewish holidays
  useEffect(() => {
    const fetchJewishHolidays = async () => {
      try {
        setLoading(true);
        
        // Sample data for fallback
        const sampleHolidays: JewishHoliday[] = [
          {
            id: 'purim',
            title: 'פורים',
            date: `${year}-03-14`,
            hebrew: 'פורים',
            description: 'חג פורים'
          },
          {
            id: 'pesach',
            title: 'פסח',
            date: `${year}-04-13`,
            hebrew: 'פסח',
            description: 'חג הפסח'
          },
          {
            id: 'shavuot',
            title: 'שבועות',
            date: `${year}-06-01`,
            hebrew: 'שבועות',
            description: 'חג השבועות'
          },
          {
            id: 'rosh-hashana',
            title: 'ראש השנה',
            date: `${year}-09-26`,
            hebrew: 'ראש השנה',
            description: 'ראש השנה'
          },
          {
            id: 'yom-kippur',
            title: 'יום כיפור',
            date: `${year}-10-05`,
            hebrew: 'יום כיפור',
            description: 'יום הכיפורים'
          },
          {
            id: 'sukkot',
            title: 'סוכות',
            date: `${year}-10-10`,
            hebrew: 'סוכות',
            description: 'חג הסוכות'
          },
          {
            id: 'simchat-torah',
            title: 'שמחת תורה',
            date: `${year}-10-18`,
            hebrew: 'שמחת תורה',
            description: 'שמחת תורה'
          },
          {
            id: 'hanukkah',
            title: 'חנוכה',
            date: `${year}-12-15`,
            hebrew: 'חנוכה',
            description: 'חג החנוכה'
          }
        ];
        
        try {
          // Call the API to get Jewish holidays for the current month
          const response = await calendarAPI.getJewishHolidays(month, year);
          
          if (response.success && response.data && response.data.holidays) {
            // Set all holidays from API response
            setAllHolidays(response.data.holidays);
          } else {
            console.warn('API response format unexpected, using sample data');
            // Fallback to sample data if API response is not as expected
            const monthStr = String(month).padStart(2, '0');
            const holidaysForMonth = sampleHolidays.filter(holiday => 
              holiday.date.startsWith(`${year}-${monthStr}`) || 
              holiday.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)
            );
            
            setAllHolidays(holidaysForMonth);
          }
        } catch (error) {
          console.error('Error fetching Jewish holidays from API:', error);
          console.warn('API call failed, using sample data');
          
          // Fallback to sample data if API fails
          const monthStr = String(month).padStart(2, '0');
          const holidaysForMonth = sampleHolidays.filter(holiday => 
            holiday.date.startsWith(`${year}-${monthStr}`) || 
            holiday.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)
          );
          
          setAllHolidays(holidaysForMonth);
        }
      } catch (error) {
        console.error('Error in fetchJewishHolidays:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (enabled) {
      fetchJewishHolidays();
    } else {
      setAllHolidays([]);
    }
  }, [month, year, enabled]);

  // Filter holidays by selected categories
  useEffect(() => {
    if (enabled && allHolidays.length > 0) {
      // If no categories are selected or the holiday doesn't have a category, show all
      if (selectedCategories.length === 0) {
        setHolidays([]);
        return;
      }

      const filtered = allHolidays.filter(holiday => {
        // If the holiday doesn't have a category, include it by default
        if (!holiday.category) return true;
        
        // Map the API category to our HolidayCategory type
        let mappedCategory: HolidayCategory;
        if (holiday.category === 'major' || holiday.isYomTov) {
          mappedCategory = 'major';
        } else if (holiday.category === 'minor') {
          mappedCategory = 'minor';
        } else if (holiday.category === 'modern') {
          mappedCategory = 'modern';
        } else if (holiday.category === 'roshchodesh') {
          mappedCategory = 'roshchodesh';
        } else {
          // Default to minor for other categories
          mappedCategory = 'minor';
        }
        
        return selectedCategories.includes(mappedCategory);
      });
      
      setHolidays(filtered);
    } else {
      setHolidays([]);
    }
  }, [allHolidays, selectedCategories, enabled]);

  // Update holidays for selected date when date or holidays change
  useEffect(() => {
    if (selectedDate && enabled) {
      const holidaysForDay = holidays.filter(holiday => holiday.date === selectedDate);
      setSelectedDateHolidays(holidaysForDay);
    } else {
      setSelectedDateHolidays([]);
    }
  }, [selectedDate, holidays, enabled]);

  /**
   * Get holidays for a specific date
   * @param date Date string in ISO format (YYYY-MM-DD)
   * @returns Array of holidays for the date
   */
  const getHolidaysForDate = (date: string): JewishHoliday[] => {
    if (!enabled) return [];
    return holidays.filter(holiday => holiday.date === date);
  };

  /**
   * Get upcoming holidays
   * @param limit Maximum number of holidays to return
   * @returns Array of upcoming holidays
   */
  const getUpcomingHolidays = (limit: number = 3): JewishHoliday[] => {
    if (!enabled || holidays.length === 0) return [];
    
    const today = new Date();
    return holidays
      .filter(holiday => new Date(holiday.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  };

  /**
   * Set the selected date and update selected holidays
   * @param date Date string in ISO format (YYYY-MM-DD)
   */
  const selectDate = (date: string | null) => {
    setSelectedDate(date);
  };

  /**
   * Update selected holiday categories
   * @param categories Array of holiday categories to display
   */
  const updateCategories = (categories: HolidayCategory[]) => {
    setSelectedCategories(categories);
  };

  return {
    holidays,
    loading,
    selectedDateHolidays,
    selectedDate,
    selectDate,
    getHolidaysForDate,
    getUpcomingHolidays,
    selectedCategories,
    updateCategories
  };
};
