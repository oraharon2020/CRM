export interface Integration {
  id: number;
  name: string;
  type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom' | 'generic' | 
        'google-analytics' | 'google-ads' | 'facebook-ads' | 'google-search-console';
  api_key: string;
  is_enabled: boolean;
  store_id: number | null;
  default_assignee?: number;
  field_mapping?: Record<string, string>;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  name: string;
  url: string;
  status: 'active' | 'inactive';
}

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
}
