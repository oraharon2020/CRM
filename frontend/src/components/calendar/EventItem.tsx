import React from 'react';
import { HiUser } from 'react-icons/hi';
import { CalendarEvent } from '../../types/calendar.types';
import { typeColors, typeLabels, priorityColors, priorityLabels } from '../../utils/calendar.utils';

interface EventItemProps {
  event: CalendarEvent;
  userName?: string;
  onToggleComplete: (eventId: number) => void;
  onEdit: (eventId: number) => void;
}

/**
 * Event item component for displaying a single event
 */
const EventItem: React.FC<EventItemProps> = ({
  event,
  userName,
  onToggleComplete,
  onEdit,
}) => {
  return (
    <div 
      className={`p-3 rounded-lg border ${typeColors[event.type]} ${event.completed ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${event.completed ? 'line-through' : ''}`}>{event.title}</h3>
          <p className="text-sm text-gray-600">{event.time}</p>
        </div>
        <span className="px-2 py-0.5 text-xs rounded-full bg-white border border-current">
          {typeLabels[event.type]}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{event.description}</p>
      
      {/* User and Priority */}
      <div className="mt-2 flex flex-wrap gap-2">
        {event.userId && userName && (
          <div className="flex items-center text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
            <HiUser className="mr-1" />
            <span>{userName}</span>
          </div>
        )}
        {event.priority && (
          <div className={`text-xs rounded-full px-2 py-1 ${priorityColors[event.priority]}`}>
            {priorityLabels[event.priority]}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-between">
        <button
          onClick={() => onToggleComplete(event.id)}
          className={`text-sm ${event.completed ? 'text-gray-500' : 'text-blue-600'}`}
        >
          {event.completed ? 'סמן כלא הושלם' : 'סמן כהושלם'}
        </button>
        <button 
          className="text-sm text-blue-600"
          onClick={() => onEdit(event.id)}
        >
          ערוך
        </button>
      </div>
    </div>
  );
};

export default EventItem;
