/**
 * Purchase domain types
 */

export type PaymentStatus = 'paid' | 'unpaid' | 'pending';

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
  paymentStatus: PaymentStatus;
  deletedAt?: string;
  toasterId?: string;
}

export interface FishPurchaseInput {
  companyName: string;
  buyerName: string;
  date: string;
  purchaseDate?: string;
  fishName: string;
  sizeKg: number;
  quantity: number;
  pricePerUnit: number;
  paymentStatus?: PaymentStatus;
}

export interface FishEntryFormData {
  fish_name: string;
  description: string;
  net_kg_per_mc: number;
  qty_mc: number;
  qty_kgs: number;
  price_per_kg: number;
  total_usd: number;
}

export interface PurchaseGroup {
  key: string;
  companyName: string;
  buyerName: string;
  date: string;
  purchases: FishPurchase[];
  totalAmount: number;
}

export interface PurchaseStats {
  totalPurchases: number;
  totalAmount: number;
  averageAmount: number;
  topFishType: string;
  topBuyer: string;
}

export interface PurchaseFilters {
  dateRange?: [Date | null, Date | null];
  companyName?: string;
  buyerName?: string;
  fishName?: string;
  paymentStatus?: PaymentStatus;
}

export interface PurchaseSorting {
  field: keyof FishPurchase;
  direction: 'asc' | 'desc';
}

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'xlsx';
