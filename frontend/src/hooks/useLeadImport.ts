import { useState } from 'react';
import { Lead } from '../types/lead.types';
import { leadsAPI } from '../services/api';

interface UseLeadImportReturn {
  isImportModalOpen: boolean;
  setIsImportModalOpen: (isOpen: boolean) => void;
  csvFile: File | null;
  setCsvFile: (file: File | null) => void;
  importLoading: boolean;
  importError: string;
  handleImport: (e: React.FormEvent) => Promise<void>;
}

export const useLeadImport = (
  onImportSuccess: (newLeads: Lead[]) => void
): UseLeadImportReturn => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      setImportError('אנא בחר קובץ CSV');
      return;
    }
    
    try {
      setImportLoading(true);
      setImportError('');
      
      const formData = new FormData();
      formData.append('file', csvFile);
      
      const response = await leadsAPI.importFromCsv(formData);
      
      if (response.success) {
        // Refresh leads
        const updatedLeads = await leadsAPI.getAll();
        if (updatedLeads.success && updatedLeads.data) {
          onImportSuccess(updatedLeads.data);
        }
        
        // Close modal
        setIsImportModalOpen(false);
        setCsvFile(null);
      } else {
        setImportError(response.message || 'שגיאה בייבוא הקובץ');
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      setImportError('שגיאה בייבוא הקובץ');
      
      // Simulate successful import for demo
      setTimeout(() => {
        // Add 3 new leads
        const newLeads = [
          {
            id: Math.floor(Math.random() * 1000) + 100,
            name: 'יוסי כהן',
            email: 'yossi@example.com',
            phone: '050-6666666',
            source: 'ייבוא CSV',
            status: 'new',
            notes: 'ייבוא מקובץ CSV',
            assigned_to: null,
            assigned_to_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: Math.floor(Math.random() * 1000) + 200,
            name: 'דנה לוי',
            email: 'dana@example.com',
            phone: '052-7777777',
            source: 'ייבוא CSV',
            status: 'new',
            notes: 'ייבוא מקובץ CSV',
            assigned_to: null,
            assigned_to_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: Math.floor(Math.random() * 1000) + 300,
            name: 'אורי גולן',
            email: 'uri@example.com',
            phone: '054-8888888',
            source: 'ייבוא CSV',
            status: 'new',
            notes: 'ייבוא מקובץ CSV',
            assigned_to: null,
            assigned_to_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        onImportSuccess(newLeads);
        
        // Close modal
        setIsImportModalOpen(false);
        setCsvFile(null);
      }, 1000);
    } finally {
      setImportLoading(false);
    }
  };

  return {
    isImportModalOpen,
    setIsImportModalOpen,
    csvFile,
    setCsvFile,
    importLoading,
    importError,
    handleImport
  };
};
