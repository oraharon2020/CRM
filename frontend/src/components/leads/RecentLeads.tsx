import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineExternalLink, HiOutlinePencil } from 'react-icons/hi';
import Spinner from '../Spinner';
import { Lead } from '../../types/lead.types';
import { useModals } from '../../contexts/ModalsContext';
import { STATUS_LABELS } from '../../constants/lead.constants';
import { leadsAPI } from '../../services/api';

interface RecentLeadsProps {
  storeId: number | null;
  limit?: number;
}

const RecentLeads: React.FC<RecentLeadsProps> = ({ storeId, limit = 5 }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { openExistingLead } = useModals();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        
        // Prepare API parameters
        const params: any = {
          limit: limit
        };
        
        // Add storeId filter if provided
        if (storeId) {
          params.store_id = storeId;
        }
        
        try {
          // Call the API to get leads
          const response = await leadsAPI.getAll(params);
          
          if (response && response.success && response.data) {
            // Sort by created_at (newest first)
            const sortedLeads = response.data
              .sort((a: Lead, b: Lead) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setLeads(sortedLeads);
          } else {
            console.warn('API response format unexpected, using fallback data');
            setLeads([]);
          }
        } catch (error) {
          console.error('Error fetching leads from API:', error);
          
          // Fallback to empty array if API fails
          setLeads([]);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [storeId, limit]);

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          אין לידים להצגה
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שם
                </th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מקור
                </th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך
                </th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.source}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => openExistingLead(lead)}
                        className="text-blue-600 hover:text-blue-900"
                        title="ערוך ליד"
                      >
                        <HiOutlinePencil className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/leads?id=${lead.id}`}
                        className="text-gray-600 hover:text-gray-900"
                        title="צפה בפרטים"
                      >
                        <HiOutlineExternalLink className="h-5 w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentLeads;
