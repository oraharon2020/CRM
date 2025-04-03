import React from 'react';
import Spinner from '../Spinner';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  csvFile: File | null;
  setCsvFile: (file: File | null) => void;
  loading: boolean;
  error: string;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  csvFile,
  setCsvFile,
  loading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-medium text-gray-900">ייבוא לידים מקובץ CSV</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={onSubmit}>
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              העלה קובץ CSV עם הלידים שברצונך לייבא. הקובץ צריך לכלול את העמודות הבאות: שם, אימייל, טלפון, מקור, סטטוס, הערות.
            </p>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>העלה קובץ</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCsvFile(file);
                      }}
                      disabled={loading}
                    />
                  </label>
                  <p className="pr-1">או גרור ושחרר</p>
                </div>
                <p className="text-xs text-gray-500">CSV עד 5MB</p>
              </div>
            </div>
            
            {csvFile && (
              <div className="mt-2 text-sm text-gray-600">
                <p>קובץ נבחר: {csvFile.name}</p>
                <p>גודל: {(csvFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-sm text-red-600">
                <p>{error}</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t flex justify-end space-x-2 space-x-reverse">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              disabled={!csvFile || loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  מייבא...
                </>
              ) : (
                'ייבא'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
