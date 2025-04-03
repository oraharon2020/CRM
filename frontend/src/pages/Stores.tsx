import React, { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiRefresh } from 'react-icons/hi';
import Spinner from '../components/Spinner';
import StoreModal from '../components/StoreModal';
import { useStores, Store } from '../hooks/useStores';
import ConfirmDialog from '../components/ConfirmDialog';

const Stores: React.FC = () => {
  const {
    stores,
    filteredStores,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleSaveStore,
    handleDeleteStore,
    handleSyncStore,
    syncingStore
  } = useStores();
  
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleAddStore = () => {
    setSelectedStore(null);
    setIsModalOpen(true);
  };
  
  const handleEditStore = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };
  
  const openDeleteConfirm = (store: Store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!storeToDelete) return;
    
    await handleDeleteStore(storeToDelete.id);
    setIsDeleteModalOpen(false);
    setStoreToDelete(null);
  };
  
  const handleSaveStoreAndClose = async (storeData: Partial<Store>) => {
    await handleSaveStore(storeData);
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">חנויות WooCommerce</h1>
        <p className="text-gray-500">ניהול וסנכרון חנויות WooCommerce</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 md:space-x-reverse">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="sr-only">חיפוש</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="חיפוש לפי שם או כתובת URL"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="status" className="sr-only">סטטוס</label>
            <select
              id="status"
              name="status"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="all">כל הסטטוסים</option>
              <option value="active">פעיל</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              onClick={handleAddStore}
            >
              <HiPlus className="h-5 w-5 ml-1" />
              חנות חדשה
            </button>
          </div>
        </div>
      </div>
      
      {/* Stores table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner />
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם החנות
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    כתובת URL
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סנכרון אחרון
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={store.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                        {store.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        store.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.status === 'active' ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {store.last_sync || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleSyncStore(store.id)}
                        className="text-green-600 hover:text-green-900 ml-3"
                        disabled={syncingStore === store.id}
                      >
                        {syncingStore === store.id ? (
                          <Spinner size="sm" color="green" />
                        ) : (
                          <HiRefresh className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditStore(store)}
                        className="text-blue-600 hover:text-blue-900 ml-3"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(store)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            לא נמצאו חנויות
          </div>
        )}
      </div>
      
      {/* Store Modal */}
      <StoreModal 
        store={selectedStore}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStoreAndClose}
        title={selectedStore ? 'עריכת חנות' : 'חנות חדשה'}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="מחיקת חנות"
        message={`האם אתה בטוח שברצונך למחוק את החנות "${storeToDelete?.name}"? פעולה זו לא ניתנת לביטול.`}
        confirmText="מחק"
        cancelText="ביטול"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default Stores;
