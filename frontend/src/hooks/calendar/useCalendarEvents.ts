import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/calendar.types';
import { calendarAPI } from '../../services/api';
import { createDateString } from '../../utils/calendar.utils';

interface UseCalendarEventsProps {
  month: number;
  year: number;
}

/**
 * Hook for fetching and managing calendar events
 * @param props Object containing month and year
 * @returns Object containing events, loading state, and event management functions
 */
export const useCalendarEvents = ({ month, year }: UseCalendarEventsProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch events for the current month
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Sample data for fallback
        const sampleEvents = [
          {
            id: 1,
            title: 'פגישה עם לקוח',
            date: `${year}-${String(month).padStart(2, '0')}-15`,
            time: '10:00',
            type: 'meeting' as const,
            description: 'פגישה עם ישראל ישראלי לגבי הזמנה #1001',
            completed: false,
            userId: 2,
            priority: 'high' as const
          },
          {
            id: 2,
            title: 'משלוח הזמנה #1002',
            date: `${year}-${String(month).padStart(2, '0')}-18`,
            time: '12:00',
            type: 'task' as const,
            description: 'לוודא שההזמנה נשלחה ללקוח',
            completed: true,
            userId: 1,
            priority: 'medium' as const
          },
          {
            id: 3,
            title: 'תזכורת: תשלום לספק',
            date: `${year}-${String(month).padStart(2, '0')}-22`,
            time: '09:00',
            type: 'reminder' as const,
            description: 'לשלם לספק עבור המוצרים שהתקבלו',
            completed: false,
            userId: 3,
            priority: 'low' as const
          },
          {
            id: 4,
            title: 'פגישת צוות',
            date: `${year}-${String(month).padStart(2, '0')}-25`,
            time: '14:00',
            type: 'meeting' as const,
            description: 'פגישת צוות שבועית',
            completed: false,
            userId: 1,
            priority: 'medium' as const
          },
          {
            id: 5,
            title: 'בדיקת מלאי',
            date: `${year}-${String(month).padStart(2, '0')}-28`,
            time: '11:00',
            type: 'task' as const,
            description: 'לבדוק את המלאי ולהזמין מוצרים חסרים',
            completed: false,
            userId: 2,
            priority: 'high' as const
          }
        ];
        
        try {
          const response = await calendarAPI.getEvents({ month, year });
          if (response.success && response.data && response.data.events) {
            setEvents(response.data.events);
            
            // If a date is selected, filter events for that date
            if (selectedDate) {
              const eventsForDate = response.data.events.filter((event: CalendarEvent) => event.date === selectedDate);
              setSelectedEvents(eventsForDate);
            }
          } else {
            // Fallback to sample data if API response is not as expected
            console.warn('API response format unexpected, using sample data');
            setEvents(sampleEvents);
            
            // If a date is selected, filter events for that date
            if (selectedDate) {
              const eventsForDate = sampleEvents.filter(event => event.date === selectedDate);
              setSelectedEvents(eventsForDate);
            }
          }
        } catch (error) {
          console.error('Error fetching events from API:', error);
          // Fallback to sample data if API fails
          setEvents(sampleEvents);
          
          // If a date is selected, filter events for that date
          if (selectedDate) {
            const eventsForDate = sampleEvents.filter(event => event.date === selectedDate);
            setSelectedEvents(eventsForDate);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [month, year, selectedDate]);

  /**
   * Select a date and filter events for that date
   * @param date Date string in ISO format (YYYY-MM-DD)
   */
  const selectDate = (date: string | null) => {
    setSelectedDate(date);
    
    if (date) {
      const eventsForDate = events.filter(event => event.date === date);
      setSelectedEvents(eventsForDate);
    } else {
      setSelectedEvents([]);
    }
  };

  /**
   * Toggle the completed status of an event
   * @param eventId Event ID
   */
  const toggleEventComplete = async (eventId: number) => {
    try {
      // Find the event to toggle
      const eventToToggle = events.find(event => event.id === eventId);
      if (!eventToToggle) return;
      
      console.log('Toggling completion status for event:', eventId);
      console.log('Current completion status:', eventToToggle.completed);
      
      // Update the event in the API
      // Use any type to bypass TypeScript checking for backend compatibility
      const updateData: any = { 
        completed: !eventToToggle.completed,
        is_completed: !eventToToggle.completed // Send both fields to ensure backend compatibility
      };
      
      const response = await calendarAPI.updateEvent(eventId, updateData);
      
      if (response.success && response.data) {
        const updatedEvent = response.data;
        console.log('Received updated event from API:', updatedEvent);
        
        // Make a deep copy of the updated event to ensure we're not modifying the original
        const updatedEventCopy = { ...updatedEvent };
        
        // Update local state with the complete updated event from the API
        setEvents(prevEvents => {
          console.log('Previous events:', prevEvents);
          const newEvents = prevEvents.map(event => 
            event.id === eventId ? updatedEventCopy : event
          );
          console.log('New events after toggle completion:', newEvents);
          return newEvents;
        });
        
        setSelectedEvents(prevEvents => {
          console.log('Previous selected events:', prevEvents);
          const newSelectedEvents = prevEvents.map(event => 
            event.id === eventId ? updatedEventCopy : event
          );
          console.log('New selected events after toggle completion:', newSelectedEvents);
          return newSelectedEvents;
        });
        
        console.log('Event completion status toggled successfully');
        return updatedEventCopy;
      } else {
        console.error('API returned error:', response.message);
        // If API call fails, don't update the UI
      }
    } catch (error) {
      console.error('Error toggling event completion status:', error);
      // If API call fails, don't update the UI
    }
  };

  /**
   * Get events for a specific date
   * @param date Date string in ISO format (YYYY-MM-DD)
   * @returns Array of events for the date
   */
  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date);
  };

  /**
   * Create a new event
   * @param event Event data
   */
  const createEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      console.log('Creating event with data:', event);
      
      // Ensure both completed and is_completed fields are sent
      // Use any type to bypass TypeScript checking for backend compatibility
      const eventData: any = {
        ...event,
        is_completed: event.completed // Add is_completed field to ensure backend compatibility
      };
      
      console.log('Sending create with data:', eventData);
      
      // Call the API to create the event
      const response = await calendarAPI.createEvent(eventData);
      
      if (response.success && response.data) {
        const newEvent = response.data;
        console.log('Received new event from API:', newEvent);
        
        // Make a deep copy of the new event to ensure we're not modifying the original
        const newEventCopy = { ...newEvent };
        
        // Update local state
        setEvents(prevEvents => {
          console.log('Previous events:', prevEvents);
          const updatedEvents = [...prevEvents, newEventCopy];
          console.log('New events after create:', updatedEvents);
          return updatedEvents;
        });
        
        // If the new event is for the selected date, add it to selected events
        if (selectedDate && newEventCopy.date === selectedDate) {
          setSelectedEvents(prevEvents => {
            console.log('Previous selected events:', prevEvents);
            const updatedSelectedEvents = [...prevEvents, newEventCopy];
            console.log('New selected events after create:', updatedSelectedEvents);
            return updatedSelectedEvents;
          });
        }
        
        console.log('Event created successfully');
        return newEventCopy;
      } else {
        console.error('API returned error:', response.message);
        throw new Error('Failed to create event: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  /**
   * Update an existing event
   * @param eventId Event ID
   * @param eventData Updated event data
   */
  const updateEvent = async (eventId: number, eventData: Partial<CalendarEvent>) => {
    try {
      console.log('Updating event with ID:', eventId);
      console.log('Update data:', eventData);
      
      // Ensure both completed and is_completed fields are sent if one is present
      // Use any type to bypass TypeScript checking for backend compatibility
      const updatedData: any = { ...eventData };
      if (eventData.completed !== undefined) {
        updatedData.is_completed = eventData.completed;
      }
      
      console.log('Sending update with data:', updatedData);
      
      // Call the API to update the event
      const response = await calendarAPI.updateEvent(eventId, updatedData);
      
      if (response.success && response.data) {
        const updatedEvent = response.data;
        console.log('Received updated event from API:', updatedEvent);
        
        // Make a deep copy of the updated event to ensure we're not modifying the original
        const updatedEventCopy = { ...updatedEvent };
        
        // Update local state with the complete updated event from the API
        setEvents(prevEvents => {
          console.log('Previous events:', prevEvents);
          const newEvents = prevEvents.map(event => 
            event.id === eventId ? updatedEventCopy : event
          );
          console.log('New events after update:', newEvents);
          return newEvents;
        });
        
        setSelectedEvents(prevEvents => {
          console.log('Previous selected events:', prevEvents);
          const newSelectedEvents = prevEvents.map(event => 
            event.id === eventId ? updatedEventCopy : event
          );
          console.log('New selected events after update:', newSelectedEvents);
          return newSelectedEvents;
        });
        
        console.log('Event updated successfully');
        return updatedEventCopy;
      } else {
        console.error('API returned error:', response.message);
        throw new Error('Failed to update event: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  /**
   * Delete an event
   * @param eventId Event ID
   */
  const deleteEvent = async (eventId: number) => {
    try {
      // Call the API to delete the event
      const response = await calendarAPI.deleteEvent(eventId);
      
      if (response.success) {
        // Update local state
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        setSelectedEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } else {
        throw new Error('Failed to delete event: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  return {
    events,
    selectedEvents,
    loading,
    selectedDate,
    selectDate,
    toggleEventComplete,
    getEventsForDate,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
