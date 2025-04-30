
export interface FishPurchase {
  id: string;
  fishName: string;
  sizeKg: number;
  quantity: number;
  pricePerUnit: number;
  purchaseDate: Date | string;
  totalPrice?: number; // Calculated field
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export type TimeFrame = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';
export type ChartType = 'bar' | 'line' | 'pie' | 'area';
export type SortDirection = 'asc' | 'desc';
export type ExportFormat = 'xlsx' | 'csv' | 'pdf';
