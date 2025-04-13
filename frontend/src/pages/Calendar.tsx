import React, { useState } from 'react';
import { HolidayCategory } from '../types/calendar.types';
import Spinner from '../components/Spinner';
import EventModal from '../components/EventModal';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import EventList from '../components/calendar/EventList';
import HolidayDetails from '../components/calendar/HolidayDetails';
import UpcomingHolidays from '../components/calendar/UpcomingHolidays';
import { useUsers } from '../hooks/calendar/useUsers';
import { useJewishHolidays } from '../hooks/calendar/useJewishHolidays';
import { useCalendarEvents } from '../hooks/calendar/useCalendarEvents';
import { createDateString } from '../utils/calendar.utils';

/**
 * Calendar page component
 */
const Calendar: React.FC = () => {
  // State for current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showHolidays, setShowHolidays] = useState(true);
  const [holidayCategories, setHolidayCategories] = useState<HolidayCategory[]>(['major', 'minor', 'modern', 'roshchodesh']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  // Custom hooks
  const { users, loading: loadingUsers, getUserById } = useUsers();
  
  const { 
    holidays, 
    loading: loadingHolidays, 
    selectedDateHolidays,
    selectedDate: holidaySelectedDate,
    selectDate: selectHolidayDate,
    selectedCategories,
    updateCategories
  } = useJewishHolidays({
    month: currentMonth,
    year: currentYear,
    enabled: showHolidays,
    categories: holidayCategories
  });
  
  const {
    events,
    selectedEvents,
    loading: loadingEvents,
    selectedDate,
    selectDate,
    toggleEventComplete,
    createEvent,
    updateEvent,
    deleteEvent
  } = useCalendarEvents({
    month: currentMonth,
    year: currentYear
  });
  
  // Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    selectDate(null);
    selectHolidayDate(null);
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    selectDate(null);
    selectHolidayDate(null);
  };
  
  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    selectDate(today.toISOString().split('T')[0]);
    selectHolidayDate(today.toISOString().split('T')[0]);
  };
  
  const handleToggleHolidays = () => {
    setShowHolidays(!showHolidays);
  };
  
  const handleCategoryChange = (categories: HolidayCategory[]) => {
    setHolidayCategories(categories);
    updateCategories(categories);
  };
  
  const handleDateClick = (day: number) => {
    const date = createDateString(currentYear, currentMonth, day);
    selectDate(date);
    selectHolidayDate(date);
  };
  
  const handleEditEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };
  
  const handleAddEvent = () => {
    setSelectedEventId(null);
    setIsModalOpen(true);
  };
  
  const handleSaveEvent = () => {
    setIsModalOpen(false);
  };
  
  // Get user name by ID
  const getUserName = (userId?: number) => {
    if (!userId) return undefined;
    const user = getUserById(userId);
    return user?.name;
  };
  
  // Loading state
  const isLoading = loadingUsers || loadingEvents;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">יומן</h1>
        <p className="text-gray-500">ניהול פגישות ומשימות</p>
      </div>
      
      {/* Upcoming Holidays */}
      {showHolidays && (
        <UpcomingHolidays holidays={holidays} />
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="lg:w-2/3 bg-white shadow rounded-lg overflow-hidden">
          {/* Calendar header */}
          <CalendarHeader
            month={currentMonth}
            year={currentYear}
            showHolidays={showHolidays}
            loadingHolidays={loadingHolidays}
            selectedCategories={selectedCategories}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onTodayClick={handleTodayClick}
            onToggleHolidays={handleToggleHolidays}
            onCategoryChange={handleCategoryChange}
          />
          
          {/* Calendar grid */}
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner />
            </div>
          ) : (
            <CalendarGrid
              month={currentMonth}
              year={currentYear}
              selectedDate={selectedDate}
              events={events}
              holidays={holidays}
              showHolidays={showHolidays}
              onDateClick={handleDateClick}
            />
          )}
        </div>
        
        {/* Events for selected date */}
        <div className="lg:w-1/3 space-y-4">
          <EventList
            events={selectedEvents}
            selectedDate={selectedDate}
            getUserName={getUserName}
            onToggleComplete={toggleEventComplete}
            onEditEvent={handleEditEvent}
            onAddEvent={handleAddEvent}
          />
          
          {/* Holiday Details */}
          <HolidayDetails
            holidays={selectedDateHolidays}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        eventId={selectedEventId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        date={selectedDate || undefined}
      />
    </div>
  );
};

export default Calendar;
