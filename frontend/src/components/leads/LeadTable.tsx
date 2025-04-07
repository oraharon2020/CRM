import React from 'react';
import { Lead } from '../../types/lead.types';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants/lead.constants';
import { formatDate } from '../../utils/lead.utils';
import Spinner from '../Spinner';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineUserCircle } from 'react-icons/hi';

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: number) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  loading,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        לא נמצאו לידים
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              שם
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              פרטי קשר
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              מקור
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              סטטוס
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              משויך ל
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              חנות
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              תאריך עדכון
            </th>
            <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                {lead.notes && (
                  <div className="text-xs text-gray-500 truncate max-w-xs">{lead.notes}</div>
                )}
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lead.email}</div>
                <div className="text-sm text-gray-500">{lead.phone}</div>
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lead.source}</div>
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                  {STATUS_LABELS[lead.status] || lead.status}
                </span>
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                {lead.assigned_to_name ? (
                  <div className="flex items-center text-sm text-gray-900">
                    <HiOutlineUserCircle className="ml-1 h-4 w-4 text-gray-400" />
                    {lead.assigned_to_name}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">לא משויך</span>
                )}
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                {lead.storeId ? lead.storeId.toString() : 'לא משויך'}
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(lead.updated_at)}
              </td>
              <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-900 ml-3"
                  onClick={() => onEdit(lead)}
                  aria-label="ערוך ליד"
                >
                  <HiOutlinePencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-900"
                  onClick={() => onDelete(lead.id)}
                  aria-label="מחק ליד"
                >
                  <HiOutlineTrash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
