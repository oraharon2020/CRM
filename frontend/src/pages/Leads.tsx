import React, { useState, useEffect, useRef } from 'react';
import { HiOutlinePlus, HiOutlineUpload, HiOutlineDownload } from 'react-icons/hi';
import { Lead } from '../types/lead.types';
import { useLeads } from '../hooks/useLeads';
import { useLeadImport } from '../hooks/useLeadImport';
import { generateLeadsCsv, downloadCsv } from '../utils/lead.utils';
import { useModals } from '../contexts/ModalsContext';
import LeadModal from '../components/LeadModal';
import LeadFilters from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import ImportModal from '../components/leads/ImportModal';
import StoreSelector from '../components/StoreSelector';

const Leads: React.FC = () => {
  const { leadFilters, updateLeadFilters } = useModals();
  const {
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
  } = useLeads(leadFilters.storeId);
  
  // Sync with ModalsContext - using a ref to prevent infinite loops
  const prevFiltersRef = useRef({
    storeId: selectedStoreId,
    searchTerm,
    status: statusFilter,
    source: sourceFilter,
    assignee: assigneeFilter
  });
  
  useEffect(() => {
    const currentFilters = {
      storeId: selectedStoreId,
      searchTerm,
      status: statusFilter,
      source: sourceFilter,
      assignee: assigneeFilter
    };
    
    // Only update if filters have actually changed
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(currentFilters)) {
      prevFiltersRef.current = currentFilters;
      updateLeadFilters(currentFilters);
    }
  }, [selectedStoreId, searchTerm, statusFilter, sourceFilter, assigneeFilter]);

  // Lead modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Import functionality
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    csvFile,
    setCsvFile,
    importLoading,
    importError,
    handleImport
  } = useLeadImport((newLeads) => {
    // This function will be called when import is successful
    // We don't need to do anything here as the useLeads hook will handle the state update
  });

  // Handle CSV export
  const handleExport = () => {
    const csvContent = generateLeadsCsv(filteredLeads);
    downloadCsv(csvContent, `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ניהול לידים</h1>
        <div className="flex space-x-2 space-x-reverse">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              setSelectedLead(null);
              setIsModalOpen(true);
            }}
          >
            <HiOutlinePlus className="ml-1 -mr-0.5 h-4 w-4" />
            ליד חדש
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setIsImportModalOpen(true)}
          >
            <HiOutlineUpload className="ml-1 -mr-0.5 h-4 w-4" />
            ייבוא
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleExport}
          >
            <HiOutlineDownload className="ml-1 -mr-0.5 h-4 w-4" />
            ייצוא
          </button>
        </div>
      </div>
      
      {/* Store selector and filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">סינון לידים</h2>
          <StoreSelector 
            selectedStoreId={selectedStoreId} 
            onStoreChange={setSelectedStoreId} 
          />
        </div>
        
        <LeadFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          uniqueSources={uniqueSources}
          users={users}
        />
      </div>
      
      {/* Leads table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <LeadTable
          leads={filteredLeads}
          loading={loading}
          onEdit={(lead) => {
            setSelectedLead(lead);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteLead}
        />
      </div>
      
      {/* Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveLead}
        lead={selectedLead || undefined}
        title={selectedLead ? 'עריכת ליד' : 'ליד חדש'}
        selectedStoreId={selectedStoreId}
      />
      
      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImport}
        csvFile={csvFile}
        setCsvFile={setCsvFile}
        loading={importLoading}
        error={importError}
      />
    </div>
  );
};

export default Leads;
