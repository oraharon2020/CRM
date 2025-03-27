export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  notes?: string;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  created_at: string;
  updated_at: string;
  storeId?: number | null; // Added for store filtering, can be null
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LeadFilters {
  searchTerm: string;
  statusFilter: string;
  sourceFilter: string;
  assigneeFilter: string;
}
