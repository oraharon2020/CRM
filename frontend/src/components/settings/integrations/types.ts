export interface Integration {
  id: number;
  name: string;
  type: 'elementor' | 'contact-form-7' | 'facebook' | 'custom' | 'generic' | 
        'google-analytics' | 'google-ads' | 'facebook-ads' | 'google-search-console' |
        'multi-supplier-manager';
  api_key?: string; // Made optional to match with modules.ts
  is_enabled: boolean;
  store_id: number | null;
  default_assignee?: number;
  field_mapping?: Record<string, string>;
  webhook_url?: string;
  created_at?: string; // Made optional to match with modules.ts
  updated_at?: string; // Made optional to match with modules.ts
  leads_count?: number;
  settings?: Record<string, any>;
  config?: any; // Added to match with modules.ts
}

export interface Store {
  id: number;
  name: string;
  url: string;
  status: 'active' | 'inactive';
}

export type IntegrationType = 
  'elementor' | 
  'contact-form-7' | 
  'facebook' | 
  'custom' | 
  'google-analytics' | 
  'google-ads' | 
  'facebook-ads' | 
  'google-search-console' |
  'multi-supplier-manager';

export interface Category {
  id: string;
  name: string;
  count: number;
}
