import React from 'react';
import { User } from '../../types/lead.types';
import { STATUS_LABELS } from '../../constants/lead.constants';

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  uniqueSources: string[];
  users: User[];
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  assigneeFilter,
  setAssigneeFilter,
  uniqueSources,
  users
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            חיפוש
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש לפי שם, אימייל, טלפון..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Status filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
            סטטוס
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">כל הסטטוסים</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Source filter */}
        <div>
          <label htmlFor="sourceFilter" className="block text-sm font-medium text-gray-700">
            מקור
          </label>
          <select
            id="sourceFilter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">כל המקורות</option>
            {uniqueSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        
        {/* Assignee filter */}
        <div>
          <label htmlFor="assigneeFilter" className="block text-sm font-medium text-gray-700">
            משויך ל
          </label>
          <select
            id="assigneeFilter"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">כל המשתמשים</option>
            <option value="unassigned">לא משויך</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;
