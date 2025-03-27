import { Lead, User } from '../types/lead.types';
import { STATUS_LABELS } from '../constants/lead.constants';

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate CSV content from leads
 */
export const generateLeadsCsv = (leads: Lead[]): string => {
  const headers = ['שם', 'אימייל', 'טלפון', 'מקור', 'סטטוס', 'הערות', 'משויך ל', 'חנות'];
  const rows = leads.map(lead => [
    lead.name,
    lead.email,
    lead.phone,
    lead.source,
    STATUS_LABELS[lead.status] || lead.status,
    lead.notes || '',
    lead.assigned_to_name || '',
    lead.storeId ? lead.storeId.toString() : ''
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCsv = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Filter leads based on filter criteria
 */
export const filterLeads = (
  leads: Lead[],
  searchTerm: string,
  statusFilter: string,
  sourceFilter: string,
  assigneeFilter: string
): Lead[] => {
  let result = [...leads];
  
  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter(
      lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.phone.toLowerCase().includes(searchLower) ||
        (lead.notes && lead.notes.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply status filter
  if (statusFilter) {
    result = result.filter(lead => lead.status === statusFilter);
  }
  
  // Apply source filter
  if (sourceFilter) {
    result = result.filter(lead => lead.source === sourceFilter);
  }
  
  // Apply assignee filter
  if (assigneeFilter) {
    if (assigneeFilter === 'unassigned') {
      result = result.filter(lead => !lead.assigned_to);
    } else {
      const assigneeId = parseInt(assigneeFilter);
      result = result.filter(lead => lead.assigned_to === assigneeId);
    }
  }
  
  return result;
};

/**
 * Get assigned user name from user list
 */
export const getAssignedUserName = (userId: number | null | undefined, users: User[]): string | null => {
  if (!userId) return null;
  const user = users.find(user => user.id === userId);
  return user ? user.name : 'משתמש לא ידוע';
};

/**
 * Create a new lead with assigned user name
 */
export const createLeadWithAssignedName = (
  leadData: Partial<Lead>,
  users: User[],
  existingLeads: Lead[] = []
): Lead => {
  const newId = existingLeads.length > 0 
    ? Math.max(...existingLeads.map(lead => lead.id)) + 1 
    : 1;
  
  const now = new Date().toISOString();
  
  return {
    id: newId,
    name: leadData.name || '',
    email: leadData.email || '',
    phone: leadData.phone || '',
    source: leadData.source || '',
    status: leadData.status || 'new',
    notes: leadData.notes,
    assigned_to: leadData.assigned_to,
    assigned_to_name: leadData.assigned_to 
      ? getAssignedUserName(leadData.assigned_to, users) 
      : null,
    created_at: now,
    updated_at: now,
    storeId: leadData.storeId // Include storeId if provided
  };
};

/**
 * Update a lead with assigned user name
 */
export const updateLeadWithAssignedName = (
  lead: Lead,
  leadData: Partial<Lead>,
  users: User[]
): Lead => {
  return {
    ...lead,
    ...leadData,
    assigned_to_name: leadData.assigned_to !== undefined
      ? getAssignedUserName(leadData.assigned_to, users)
      : lead.assigned_to_name,
    updated_at: new Date().toISOString()
  };
};

/**
 * Filter leads by store ID
 */
export const filterLeadsByStore = (
  leads: Lead[],
  storeId: number
): Lead[] => {
  console.log('Filtering leads by store ID:', storeId);
  console.log('Leads before filtering:', leads);
  
  // If no store is selected, show all leads
  if (storeId == null) {
    console.log('No store selected, showing all leads');
    return leads;
  }
  
  // Convert storeId to number for comparison to ensure type consistency
  const filterStoreId = Number(storeId);
  
  // First try to find leads that match the store ID
  const matchingLeads = leads.filter(lead => {
    // For debugging, log the lead and its storeId
    console.log('Checking lead:', lead.id, 'with storeId:', lead.storeId);
    
    if ('storeId' in lead && lead.storeId !== null && lead.storeId !== undefined) {
      const leadStoreId = Number(lead.storeId);
      const isMatch = leadStoreId === filterStoreId;
      console.log(`Lead ${lead.id}: Comparing lead storeId ${leadStoreId} with filter storeId ${filterStoreId}, match: ${isMatch}`);
      return isMatch;
    }
    return false;
  });
  
  // If we found matching leads, return them
  if (matchingLeads.length > 0) {
    console.log('Found leads matching store ID:', matchingLeads.length);
    return matchingLeads;
  }
  
  // If no matching leads were found, return all leads without a storeId
  console.log('No matching leads found, returning leads without storeId');
  const leadsWithoutStoreId = leads.filter(lead => 
    !('storeId' in lead) || lead.storeId === null || lead.storeId === undefined
  );
  console.log('Leads without storeId count:', leadsWithoutStoreId.length);
  return leadsWithoutStoreId;
};
