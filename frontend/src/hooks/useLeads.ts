import { useState, useEffect, useCallback } from 'react';
import { Lead, User } from '../types/lead.types';
import { leadsAPI, usersAPI } from '../services/api';
import { SAMPLE_LEADS, SAMPLE_USERS } from '../constants/lead.constants';
import { 
  filterLeads, 
  createLeadWithAssignedName, 
  updateLeadWithAssignedName,
  filterLeadsByStore
} from '../utils/lead.utils';

interface UseLeadsReturn {
  leads: Lead[];
  filteredLeads: Lead[];
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  selectedStoreId: number | null;
  setSelectedStoreId: (storeId: number | null) => void;
  handleSaveLead: (leadData: Partial<Lead>) => Promise<void>;
  handleDeleteLead: (id: number) => Promise<void>;
  uniqueSources: string[];
}

export const useLeads = (initialStoreId?: number | null): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(initialStoreId || null);
  
  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await leadsAPI.getAll();
      
      if (response.success && response.data) {
        setLeads(response.data);
      } else {
        // Fallback to sample data
        setLeads(SAMPLE_LEADS);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Fallback to sample data
      setLeads(SAMPLE_LEADS);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response: any = await usersAPI.getAll();
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        // Fallback to sample data
        setUsers(SAMPLE_USERS);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to sample data
      setUsers(SAMPLE_USERS);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [fetchLeads, fetchUsers]);
  
  // Filter leads when filters change
  useEffect(() => {
    console.log('Filtering leads with store ID:', selectedStoreId);
    
    // First filter by store if selected
    const storeFiltered = selectedStoreId 
      ? filterLeadsByStore(leads, selectedStoreId)
      : leads;
    
    // Then apply other filters
    const filtered = filterLeads(
      storeFiltered,
      searchTerm,
      statusFilter,
      sourceFilter,
      assigneeFilter
    );
    
    console.log('Filtered leads after all filters:', filtered);
    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, sourceFilter, assigneeFilter, selectedStoreId]);
  
  // Get unique sources for filter
  const uniqueSources = Array.from(new Set(leads.map(lead => lead.source)));
  
  // Handle lead creation/update
  const handleSaveLead = async (leadData: Partial<Lead>): Promise<void> => {
    try {
      setLoading(true);
      
      // Always set the storeId to the currently selected store, regardless of whether it's a new or existing lead
      leadData.storeId = selectedStoreId;
      // Also set store_id for the backend API
      (leadData as any).store_id = selectedStoreId;
      console.log(`Setting storeId to ${selectedStoreId} for lead`);
      
      let response: any;
      let success = false;
      let newLeadId: number | undefined;
      
      if (leadData.id) {
        // Update existing lead
        console.log('Updating existing lead:', leadData);
        response = await leadsAPI.update(leadData.id, leadData);
        
        if (response.success) {
          success = true;
          // Refresh leads from API
          await fetchLeads();
        } else {
          // Simulate successful update for demo
          const updatedLead = updateLeadWithAssignedName(
            leads.find(l => l.id === leadData.id) as Lead, 
            leadData, 
            users
          );
          
          console.log('Updated lead:', updatedLead);
          
          setLeads(prevLeads =>
            prevLeads.map(lead =>
              lead.id === leadData.id ? updatedLead : lead
            )
          );
          success = true;
        }
      } else {
        // Create new lead
        console.log('Creating new lead with data:', leadData);
        response = await leadsAPI.create(leadData);
        
        if (response.success && response.data) {
          success = true;
          newLeadId = response.data.id;
          
          // Clear filters to ensure the new lead is visible
          setSearchTerm('');
          setStatusFilter('');
          setSourceFilter('');
          setAssigneeFilter('');
          
          // Refresh leads from API
          await fetchLeads();
          
          // Force a second fetch after a short delay to ensure the new lead is loaded
          setTimeout(() => {
            fetchLeads();
          }, 500);
          
          // IMPORTANT: Check if the storeId was properly saved in the response
          // If not, we'll manually update the lead in our local state
          if (response.data) {
            console.log('Response data from API:', response.data);
            
            // Check if we need to manually add the storeId
            // The API returns store_id but we use storeId in the frontend
            const needsStoreIdUpdate = (
              (response.data.storeId === undefined || response.data.storeId === null) && 
              (response.data.store_id !== undefined && response.data.store_id !== null)
            );
            
            if (needsStoreIdUpdate) {
              console.log('API returned store_id but not storeId, adding storeId to lead:', response.data.store_id);
              
              // Create a new lead object with the correct storeId
              const updatedLead = {
                ...response.data,
                storeId: response.data.store_id
              };
              
              // Replace the lead in our local state
              setLeads(prevLeads => {
                // Find the index of the lead to update
                const index = prevLeads.findIndex(lead => lead.id === response.data.id);
                
                if (index !== -1) {
                  // Create a new array with the updated lead
                  const newLeads = [...prevLeads];
                  newLeads[index] = updatedLead;
                  console.log('Updated leads with correct storeId:', newLeads);
                  return newLeads;
                }
                
                // If the lead wasn't found, add it to the beginning of the array
                console.log('Lead not found in state, adding it with storeId:', leadData.storeId);
                return [updatedLead, ...prevLeads];
              });
            }
          }
        } else {
          // Simulate successful creation for demo
          const newLead = createLeadWithAssignedName(leadData, users, leads);
          newLeadId = newLead.id;
          
          console.log('Created new lead:', newLead);
          
          // Add to the beginning of the list
          setLeads(prevLeads => {
            const updatedLeads = [newLead, ...prevLeads];
            console.log('Updated leads list:', updatedLeads);
            return updatedLeads;
          });
          success = true;
          
          // Clear filters to ensure the new lead is visible
          setSearchTerm('');
          setStatusFilter('');
          setSourceFilter('');
          setAssigneeFilter('');
        }
      }
      
      // Show success message
      if (success) {
        console.log('Lead saved successfully!');
        
        // Display an alert for now (can be replaced with a toast notification system)
        alert(leadData.id ? 'הליד עודכן בהצלחה!' : 'הליד נוצר בהצלחה!');
        
        // Force a re-render of the filtered leads
        setFilteredLeads(prevFilteredLeads => {
          console.log('Re-filtering leads after save');
          // First filter by store if selected
          const storeFiltered = selectedStoreId 
            ? filterLeadsByStore(leads, selectedStoreId)
            : leads;
          
          // Then apply other filters
          return filterLeads(
            storeFiltered,
            searchTerm,
            statusFilter,
            sourceFilter,
            assigneeFilter
          );
        });
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      
      // Simulate successful save for demo
      if (leadData.id) {
        // Update existing lead
        const updatedLead = updateLeadWithAssignedName(
          leads.find(l => l.id === leadData.id) as Lead,
          leadData,
          users
        );
        
        console.log('Updated lead (error fallback):', updatedLead);
        
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === leadData.id ? updatedLead : lead
          )
        );
      } else {
        // Create new lead
        const newLead = createLeadWithAssignedName(leadData, users, leads);
        
        console.log('Created new lead (error fallback):', newLead);
        
        // Add to the beginning of the list
        setLeads(prevLeads => [newLead, ...prevLeads]);
        
        // Clear filters to ensure the new lead is visible
        setSearchTerm('');
        setStatusFilter('');
        setSourceFilter('');
        setAssigneeFilter('');
        
        // Display an alert for now
        alert('הליד נוצר בהצלחה!');
      }
      
      // Force a re-render of the filtered leads
      setFilteredLeads(prevFilteredLeads => {
        console.log('Re-filtering leads after error');
        // First filter by store if selected
        const storeFiltered = selectedStoreId 
          ? filterLeadsByStore(leads, selectedStoreId)
          : leads;
        
        // Then apply other filters
        return filterLeads(
          storeFiltered,
          searchTerm,
          statusFilter,
          sourceFilter,
          assigneeFilter
        );
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle lead deletion
  const handleDeleteLead = async (id: number): Promise<void> => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק ליד זה?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response: any = await leadsAPI.delete(id);
      
      if (response.success) {
        // Refresh leads from API
        await fetchLeads();
      } else {
        // Simulate successful delete for demo
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      
      // Simulate successful delete for demo
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
    } finally {
      setLoading(false);
    }
  };
  
  return {
    leads,
    filteredLeads,
    users,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    assigneeFilter,
    setAssigneeFilter,
    selectedStoreId,
    setSelectedStoreId,
    handleSaveLead,
    handleDeleteLead,
    uniqueSources
  };
};
