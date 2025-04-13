// Lead status enum
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  CLOSED = 'closed'
}

// Lead source enum
export enum LeadSource {
  WEBSITE = 'website',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
  REFERRAL = 'referral',
  EXHIBITION = 'exhibition',
  PHONE = 'phone',
  OTHER = 'other'
}

// Lead category enum
export enum LeadCategory {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold'
}

// Status options for display
export const STATUS_LABELS: Record<string, string> = {
  'new': 'חדש',
  'contacted': 'נוצר קשר',
  'qualified': 'מתאים',
  'converted': 'הומר ללקוח',
  'closed': 'סגור'
};

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  'new': 'bg-blue-100 text-blue-800',
  'contacted': 'bg-yellow-100 text-yellow-800',
  'qualified': 'bg-green-100 text-green-800',
  'converted': 'bg-purple-100 text-purple-800',
  'closed': 'bg-gray-100 text-gray-800'
};

// Source options
export const SOURCE_OPTIONS = [
  'אתר אינטרנט',
  'פייסבוק',
  'גוגל',
  'הפניה',
  'תערוכה',
  'שיחת טלפון',
  'אחר'
];

// Sample leads for fallback - empty array as requested by the user
// Each new lead will be associated with the store it was created in
export const SAMPLE_LEADS = [];

// Sample users for fallback
export const SAMPLE_USERS = [
  { id: 1, name: 'מנהל מערכת', email: 'admin@example.com', role: 'admin' },
  { id: 2, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'manager' },
  { id: 3, name: 'שרה כהן', email: 'sarah@example.com', role: 'user' }
];
