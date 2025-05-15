/**
 * Main types index file
 * Re-exports all types from domain-specific files
 */

// Explicitly import and re-export types needed by AppContextProps and to resolve conflicts
import type { FishPurchase, PaymentStatus, PurchaseGroup, ExportFormat, PurchaseFilters, PurchaseSorting, FishPurchaseInput, FishEntryFormData, PurchaseStats } from './purchase';
import type { User, UserPreferences, AuthState, AuthAction, LoginCredentials, SignupCredentials, AuthResponse } from './user';
import type { AppTheme, TableStyle, TimeFrame, ThemeColors, ThemeState, ThemeAction } from './theme';
import type { ApiState, ApiResponse, PaginatedResponse, QueryParams, DateFilter, SortDirection, ApiStatus } from './api';
import type { AppError, ErrorType, ValidationError, ErrorState, ErrorAction, ErrorHandlerOptions } from './error';
import type { Buyer as ShipmentBuyer, Shipment as ShipmentTS, FishEntry as ShipmentFishEntry, GroupedFishEntries, ShipmentWithEntries } from './shipment';

export type {
  FishPurchase, PaymentStatus, PurchaseGroup, ExportFormat, PurchaseFilters, PurchaseSorting, FishPurchaseInput, FishEntryFormData, PurchaseStats,
  User, UserPreferences, AuthState, AuthAction, LoginCredentials, SignupCredentials, AuthResponse,
  AppTheme, TableStyle, TimeFrame, ThemeColors, ThemeState, ThemeAction,
  ApiState, ApiResponse, PaginatedResponse, QueryParams, DateFilter, SortDirection, ApiStatus,
  AppError, ErrorType, ValidationError, ErrorState, ErrorAction, ErrorHandlerOptions,
  ShipmentBuyer, ShipmentTS, ShipmentFishEntry, GroupedFishEntries, ShipmentWithEntries
};

// Continue to re-export other types from domain files if needed (be cautious of conflicts)
export * from './purchase';
export * from './user';
export * from './theme';
export * from './api';
export * from './error';
export * from './shipment';

// Export types that haven't been moved to domain files yet (or are defined here)
// Buyer types
export interface Buyer {
  id: string;
  name: string;
  address?: string;
  created_at: string;
}

// Shipment types (Note: some shipment types are now in ./shipment.ts, check for duplication)
export interface Shipment {
  id: string;
  user_id: string;
  buyer_id: string;
  shipment_date: string;
  container_number?: string;
  status?: string;
  tracking_number?: string;
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

// Date range type for filtering
export interface DateRange {
  start: Date;
  end: Date;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
}

// Extended AppContextProps to include all properties used in components
export interface AppContextProps {
  user: User | null;
  companyName: string;
  setCompanyName: (name: string) => void;
  tableStyle: TableStyle;
  setTableStyle: (style: TableStyle) => void;
  addPurchase: (purchase: Omit<FishPurchase, "id" | "total" | "totalPrice">) => Promise<void>;
  addMultiplePurchases: (companyName: string, buyerName: string, date: string, entries: Array<{
    fishName: string;
    sizeKg: number;
    quantity: number;
    pricePerUnit: number;
    paymentStatus?: PaymentStatus;
  }>) => Promise<void>;
  updatePurchase?: (purchaseId: string, purchaseData: Partial<Omit<FishPurchase, "id">>) => Promise<void>;
  purchases: FishPurchase[];
  setPurchases?: (purchases: FishPurchase[]) => void;
  updatePurchasePaymentStatus?: (id: string, status: PaymentStatus) => Promise<void>;
  deletePurchase?: (id: string) => Promise<void>;
  deletePurchaseGroup?: (groupKey: string) => Promise<void>;
  recoverPurchase?: (id: string) => Promise<void>;
  recoverPurchaseGroup?: (groupKey: string) => Promise<void>;
  deletedPurchases?: FishPurchase[];
  fetchDeletedPurchases?: () => void;

  login?: (email: string, password: string) => Promise<void>;
  signup?: (email: string, password: string, name?: string) => Promise<void>;
  logout?: () => Promise<void>;
  updateProfile?: (name: string, email: string) => Promise<void>;
  isLoading?: boolean;

  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;

  spendingByFishType?: Record<string, number>;
  purchasesByMonth?: Record<string, number>;
  filteredPurchases: FishPurchase[];

  lastUpdated?: Date;
  isRealTimeEnabled?: boolean;
  toggleRealTime?: () => void;
  
  refreshData?: () => Promise<void>;
  currency: string;
  setCurrency: (currency: string) => void;
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
