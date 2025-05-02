
// Buyer types
export interface Buyer {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  created_at: string;
}

// Shipment types
export interface Shipment {
  id: string;
  user_id: string;
  buyer_id: string;
  shipment_date: string;
  container_number?: string;
  created_at: string;
}

// Fish Entry types
export interface FishEntry {
  id: string;
  shipment_id: string;
  fish_name: string;
  description?: string;
  net_kg_per_mc: number;
  qty_mc: number;
  qty_kgs: number;
  price_per_kg: number;
  total_usd: number;
  created_at: string;
}

// Grouped fish entries for reporting
export interface GroupedFishEntry {
  fish_name: string;
  entries: FishEntry[];
  total_usd: number;
}

// Shipment with related data
export interface ShipmentWithDetails {
  shipment: Shipment;
  buyer: Buyer;
  entries: FishEntry[];
  grouped_entries: GroupedFishEntry[];
  grand_total: number;
}

// For the UI components
export interface FishEntryFormData {
  fish_name: string;
  description: string;
  net_kg_per_mc: number;
  qty_mc: number;
  qty_kgs: number;
  price_per_kg: number;
  total_usd: number;
}

// Additional types needed for other components
export type AppTheme = "light" | "dark" | "blue" | "green";
export type TableStyle = "default" | "bordered" | "striped" | "compact" | "modern" | "excel";
export type TimeFrame = "today" | "week" | "month" | "year" | "all" | "3months" | "6months";
export type DateFilter = "all" | "today" | "week" | "month" | "custom" | "yesterday" | "3months" | "year";
export type SortDirection = "asc" | "desc";
export type ExportFormat = "excel" | "pdf" | "csv" | "xlsx";

// FishPurchase interface to match what's being used in the components
export interface FishPurchase {
  id: string;
  companyName: string;
  buyerName: string;
  date: string;
  purchaseDate: string;
  fishName: string;
  sizeKg: number;
  quantity: number;
  pricePerUnit: number;
  total: number;
  totalPrice: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

// Extended AppContextProps to include all properties used in components
export interface AppContextProps {
  user: { id: string; email: string; name?: string } | null;
  companyName: string;
  setCompanyName: (name: string) => void;
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  tableStyle: TableStyle;
  setTableStyle: (style: TableStyle) => void;
  addPurchase: (purchase: Omit<FishPurchase, "id" | "total" | "totalPrice">) => void;
  addMultiplePurchases: (companyName: string, buyerName: string, date: string, entries: Array<{
    fishName: string;
    sizeKg: number;
    quantity: number;
    pricePerUnit: number;
  }>) => void;
  purchases: FishPurchase[];
  setPurchases: (purchases: FishPurchase[]) => void;
  
  // Added properties to fix component errors
  login?: (email: string, password: string) => Promise<void>;
  signup?: (email: string, password: string) => Promise<void>;
  logout?: () => Promise<void>;
  isLoading?: boolean;
  timeFrame?: TimeFrame;
  setTimeFrame?: (timeFrame: TimeFrame) => void;
  spendingByFishType?: any[];
  purchasesByMonth?: any[];
}

// Common fish names for dropdown selection
export const COMMON_FISH_NAMES = [
  "ROHU-G",
  "KATLA-G",
  "TILAPIA-W",
  "MRIGAL",
  "BASA FILLET",
  "PANGUS",
  "SNAPPER",
  "HILSA",
  "PRAWN",
  "CARP"
];

// Common fish sizes for dropdown selection
export const COMMON_FISH_SIZES = [
  "4 UP",
  "3.5 UP",
  "3 UP", 
  "2.5 UP",
  "2 UP",
  "1.5 UP",
  "1 UP",
  "0.5-1",
  "MIXED"
];
