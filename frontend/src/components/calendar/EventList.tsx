import React from 'react';
import { CalendarEvent } from '../../types/calendar.types';
import { formatDate } from '../../utils/calendar.utils';
import EventItem from './EventItem';

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: string | null;
  getUserName: (userId?: number) => string | undefined;
  onToggleComplete: (eventId: number) => void;
  onEditEvent: (eventId: number) => void;
  onAddEvent: () => void;
}

/**
 * Event list component for displaying events for a selected date
 */
const EventList: React.FC<EventListProps> = ({
  events,
  selectedDate,
  getUserName,
  onToggleComplete,
  onEditEvent,
  onAddEvent,
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {selectedDate ? (
            `אירועים ל-${formatDate(selectedDate)}`
          ) : (
            'אירועים'
          )}
        </h2>
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          onClick={onAddEvent}
        >
          אירוע חדש
        </button>
      </div>
      
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {selectedDate ? (
          events.length > 0 ? (
            <div className="space-y-4">
              {events.map(event => (
                <EventItem
                  key={event.id}
                  event={event}
                  userName={getUserName(event.userId)}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditEvent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              אין אירועים לתאריך זה
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            בחר תאריך כדי לראות אירועים
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
