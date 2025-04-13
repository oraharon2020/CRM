/**
 * Shared types for CashFlow components
 */

/**
 * Expenses structure
 */
export interface Expenses {
  vatDeductible: number;
  nonVatDeductible: number;
  salary: number;
  vat: number;
  marketingFacebook: number;
  marketingGoogle: number;
  marketingTikTok: number;
  shipping: number;
  productCost: number; // Added product cost field
  total: number;
}

/**
 * Product cost detail structure
 */
export interface ProductCostDetail {
  product_id: number;
  product_name: string;
  variation_id?: number;
  variation_name?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier_id?: number;
  supplier_name?: string;
  // New fields for editing functionality
  order_id?: number;
  order_item_id?: number;
  is_custom_cost?: boolean;
  standard_cost?: number;
  custom_cost?: number;
}

/**
 * Shipping cost detail structure
 */
export interface ShippingCostDetail {
  order_id: number;
  order_number: string;
  shipping_method: string;
  cost: number;
  supplier_id?: number;
  supplier_name?: string;
  // New field for editing functionality
  order_item_id?: number;
}

/**
 * CashFlow data structure for a single day
 */
export interface CashFlowData {
  date: string;
  revenue: number;
  orderCount: number;
  productCount: number;
  expenses?: Expenses;
  profit?: number;
  roi?: number;
}

/**
 * Props for the CashFlowTable component
 */
export interface CashFlowTableProps {
  data: CashFlowData[];
  loading: boolean;
  error: string | null;
  storeId?: number;
  month?: number;
  year?: number;
  totals?: {
    revenue: number;
    orderCount: number;
    productCount: number;
    expenses?: Expenses;
    profit?: number;
    roi?: number;
  };
}

/**
 * Order data structure
 */
export interface Order {
  id: number;
  number: string;
  date: string;
  customer_name: string;
  total: number;
  status: string;
}

/**
 * Forecast result with metadata
 */
export interface ForecastResult {
  date: string;
  revenue: number;
  orderCount: number;
  productCount: number;
  expenses: Expenses;  // Required in forecast result
  profit: number;      // Required in forecast result
  roi: number;         // Required in forecast result
  meta: {
    daysInMonth: number;
    daysWithData: number;
    daysRemaining: number;
    dailyAvg: {
      revenue: number;
      orderCount: number;
      productCount: number;
      expenses: Expenses;
    };
  };
}
