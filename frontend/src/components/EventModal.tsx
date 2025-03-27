import React, { useState, useEffect } from 'react';
import { HiX, HiCheck, HiCalendar, HiClock, HiUser } from 'react-icons/hi';
import Spinner from './Spinner';
import { calendarAPI, usersAPI } from '../services/api';

interface EventModalProps {
  eventId: number | null; // null for new event
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  date?: string; // Optional date for new events
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
  description: string;
  completed: boolean;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
}

const EventModal: React.FC<EventModalProps> = ({ eventId, isOpen, onClose, onSave, date }) => {
  const [event, setEvent] = useState<CalendarEvent>({
    id: 0,
    title: '',
    date: date || new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'meeting',
    description: '',
    completed: false,
    priority: 'medium',
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Event type options
  const eventTypes = [
    { value: 'meeting', label: 'פגישה' },
    { value: 'task', label: 'משימה' },
    { value: 'reminder', label: 'תזכורת' },
  ];
  
  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'נמוכה', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'בינונית', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'גבוהה', color: 'bg-red-100 text-red-800' },
  ];
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingUsers(true);
        
        // Call the API to get users
        const response = await usersAPI.getAll();
        
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          // Fallback to sample data if API fails
          const sampleUsers: User[] = [
            { id: 1, name: 'מנהל מערכת', email: 'admin@example.com', role: 'admin' },
            { id: 2, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'manager' },
            { id: 3, name: 'שרה כהן', email: 'sarah@example.com', role: 'user' },
          ];
          
          setUsers(sampleUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        
        // Fallback to sample data if API fails
        const sampleUsers: User[] = [
          { id: 1, name: 'מנהל מערכת', email: 'admin@example.com', role: 'admin' },
          { id: 2, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'manager' },
          { id: 3, name: 'שרה כהן', email: 'sarah@example.com', role: 'user' },
        ];
        
        setUsers(sampleUsers);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [isOpen]);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return; // New event
      
      try {
        setLoading(true);
        
        // Call the API to get the event
        const response = await calendarAPI.getEventById(eventId);
        
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          // Fallback to sample data if API fails
          console.warn('Failed to fetch event from API, using sample data');
          
          // Sample data
          const sampleEvent: CalendarEvent = {
            id: eventId,
            title: 'פגישה עם לקוח',
            date: '2025-02-26',
            time: '10:00',
            type: 'meeting',
            description: 'פגישה עם ישראל ישראלי לגבי הזמנה #1001',
            completed: false,
          };
          
          setEvent(sampleEvent);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        
        // Fallback to sample data if API fails
        const sampleEvent: CalendarEvent = {
          id: eventId,
          title: 'פגישה עם לקוח',
          date: '2025-02-26',
          time: '10:00',
          type: 'meeting',
          description: 'פגישה עם ישראל ישראלי לגבי הזמנה #1001',
          completed: false,
        };
        
        setEvent(sampleEvent);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      // Reset form for new events
      if (!eventId) {
        setEvent({
          id: 0,
          title: '',
          date: date || new Date().toISOString().split('T')[0],
          time: '09:00',
          type: 'meeting',
          description: '',
          completed: false,
          priority: 'medium',
        });
      } else {
        fetchEvent();
      }
    }
  }, [eventId, isOpen, date]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEvent(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (eventId) {
        // Update existing event
        // Format the event data to match what the backend expects
        const eventData = {
          title: event.title,
          date: event.date,
          time: event.time,
          type: event.type,
          description: event.description,
          completed: event.completed,
          is_completed: event.completed, // Add is_completed field to ensure backend compatibility
          userId: event.userId,
          priority: event.priority
        };
        
        console.log('Sending update with data:', eventData);
        const response = await calendarAPI.updateEvent(eventId, eventData);
        console.log('Update response:', response);
      } else {
        // Create new event
        const { id, ...eventData } = event;
        await calendarAPI.createEvent(eventData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('שגיאה בשמירת האירוע. אנא נסה שנית.');
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {eventId ? 'עריכת אירוע' : 'אירוע חדש'}
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">סגור</span>
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      כותרת
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={event.title}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        תאריך
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <HiCalendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          value={event.date}
                          onChange={handleInputChange}
                          className="input pr-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        שעה
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <HiClock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="time"
                          name="time"
                          id="time"
                          value={event.time}
                          onChange={handleInputChange}
                          className="input pr-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      סוג אירוע
                    </label>
                    <select
                      name="type"
                      id="type"
                      value={event.type}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* User Assignment */}
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                      משתמש אחראי
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <HiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="userId"
                        id="userId"
                        value={event.userId || ''}
                        onChange={handleInputChange}
                        className="input pr-10"
                        disabled={loadingUsers}
                      >
                        <option value="">בחר משתמש</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      עדיפות
                    </label>
                    <select
                      name="priority"
                      id="priority"
                      value={event.priority || 'medium'}
                      onChange={handleInputChange}
                      className="input"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      תיאור
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={event.description}
                      onChange={handleInputChange}
                      className="input"
                    ></textarea>
                  </div>
                  
                  {/* Completed */}
                  {eventId && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="completed"
                        id="completed"
                        checked={event.completed}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="completed" className="mr-2 block text-sm text-gray-900">
                        הושלם
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Spinner size="sm" color="white" /> : <HiCheck className="h-5 w-5 ml-1" />}
              {saving ? 'שומר...' : 'שמור'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={saving}
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
