// Define types for analytics integrations
export interface AnalyticsIntegration {
  id: number;
  store_id: number;
  name: string;
  type: 'google-ads' | 'facebook-ads' | 'google-analytics' | 'google-search-console';
  credentials: Record<string, any>;
  settings?: Record<string, any>;
  is_enabled: boolean;
  last_sync?: {
    status: 'pending' | 'completed' | 'failed';
    start_time: string;
    end_time?: string;
    records_processed?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface IntegrationFormData {
  store_id: number;
  name: string;
  type: 'google-ads' | 'facebook-ads' | 'google-analytics' | 'google-search-console';
  credentials: Record<string, any>;
  settings?: Record<string, any>;
  is_enabled: boolean;
}

export interface ToastMessage {
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
