import api from './api';

// VAT Deductible Expenses API
export const vatExpensesAPI = {
  getAll: async () => {
    const response = await api.get('/cashflow/vat-expenses');
    return response.data;
  },
  
  getByStoreId: async (storeId: number) => {
    const response = await api.get(`/cashflow/vat-expenses/store/${storeId}`);
    return response.data;
  },
  
  getByStoreIdAndDateRange: async (storeId: number, startDate: string, endDate: string) => {
    const response = await api.get(`/cashflow/vat-expenses/store/${storeId}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  getTotalByStoreIdAndDateRange: async (storeId: number, startDate: string, endDate: string) => {
    const response = await api.get(`/cashflow/vat-expenses/store/${storeId}/total`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/cashflow/vat-expenses/${id}`);
    return response.data;
  },
  
  create: async (expense: any) => {
    const response = await api.post('/cashflow/vat-expenses', expense);
    return response.data;
  },
  
  update: async (id: number, expense: any) => {
    const response = await api.put(`/cashflow/vat-expenses/${id}`, expense);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/cashflow/vat-expenses/${id}`);
    return response.data;
  }
};

// Non-VAT Deductible Expenses API
export const nonVatExpensesAPI = {
  getAll: async () => {
    const response = await api.get('/cashflow/non-vat-expenses');
    return response.data;
  },
  
  getByStoreId: async (storeId: number) => {
    const response = await api.get(`/cashflow/non-vat-expenses/store/${storeId}`);
    return response.data;
  },
  
  getByStoreIdAndDateRange: async (storeId: number, startDate: string, endDate: string) => {
    const response = await api.get(`/cashflow/non-vat-expenses/store/${storeId}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  getTotalByStoreIdAndDateRange: async (storeId: number, startDate: string, endDate: string) => {
    const response = await api.get(`/cashflow/non-vat-expenses/store/${storeId}/total`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/cashflow/non-vat-expenses/${id}`);
    return response.data;
  },
  
  create: async (expense: any) => {
    const response = await api.post('/cashflow/non-vat-expenses', expense);
    return response.data;
  },
  
  update: async (id: number, expense: any) => {
    const response = await api.put(`/cashflow/non-vat-expenses/${id}`, expense);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/cashflow/non-vat-expenses/${id}`);
    return response.data;
  }
};

// Employee Salaries API
export const salariesAPI = {
  getAll: async () => {
    const response = await api.get('/cashflow/salaries');
    return response.data;
  },
  
  getByStoreId: async (storeId: number) => {
    const response = await api.get(`/cashflow/salaries/store/${storeId}`);
    return response.data;
  },
  
  getByStoreIdAndMonthYear: async (storeId: number, month: number, year: number) => {
    const response = await api.get(`/cashflow/salaries/store/${storeId}/month-year`, {
      params: { month, year }
    });
    return response.data;
  },
  
  getTotalByStoreIdAndMonthYear: async (storeId: number, month: number, year: number) => {
    const response = await api.get(`/cashflow/salaries/store/${storeId}/total`, {
      params: { month, year }
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/cashflow/salaries/${id}`);
    return response.data;
  },
  
  create: async (salary: any) => {
    const response = await api.post('/cashflow/salaries', salary);
    return response.data;
  },
  
  update: async (id: number, salary: any) => {
    const response = await api.put(`/cashflow/salaries/${id}`, salary);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/cashflow/salaries/${id}`);
    return response.data;
  },
  
  copyFromPreviousMonth: async (storeId: number, month: number, year: number) => {
    const response = await api.post(`/cashflow/salaries/store/${storeId}/copy-from-previous`, {
      month,
      year
    });
    return response.data;
  }
};

// Cash Flow Summary API
export const cashFlowSummaryAPI = {
  getSummary: async (storeId: number, month: number, year: number, statuses?: string[]) => {
    const response = await api.get(`/cashflow/summary/store/${storeId}`, {
      params: { month, year, statuses }
    });
    return response.data;
  },
  
  getDailySummary: async (storeId: number, month: number, year: number, statuses?: string[]) => {
    const response = await api.get(`/cashflow/summary/daily/store/${storeId}`, {
      params: { month, year, statuses }
    });
    return response.data;
  }
};

// Cash Flow Orders API
export const cashFlowOrdersAPI = {
  getOrdersByDate: async (storeId: number, date: string, statuses?: string[]) => {
    const response = await api.get(`/cashflow/orders/store/${storeId}`, {
      params: { date, statuses }
    });
    return response.data;
  }
};
