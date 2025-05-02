
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
export type TableStyle = "default" | "bordered" | "striped" | "compact";
export type TimeFrame = "today" | "week" | "month" | "year" | "all";
export type DateFilter = "all" | "today" | "week" | "month" | "custom";
export type SortDirection = "asc" | "desc";
export type ExportFormat = "excel" | "pdf" | "csv";

export interface FishPurchase {
  id: string;
  companyName: string;
  buyerName: string;
  date: string;
  fishName: string;
  sizeKg: number;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
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
