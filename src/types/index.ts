export interface FishPurchase {
  id: string;
  fishName: string;
  sizeKg: number;
  quantity: number;
  pricePerUnit: number;
  purchaseDate: string;
  totalPrice: number;
  companyName?: string;
  buyerName?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export type TimeFrame = "week" | "month" | "3months" | "6months" | "year" | "all";
export type ChartType = "bar" | "line" | "pie" | "area";
export type SortDirection = "asc" | "desc";
export type ExportFormat = "xlsx" | "csv" | "pdf";

export type DateFilter = "all" | "today" | "yesterday" | "week" | "month" | "3months" | "year" | "custom";

export type TableStyle = "default" | "striped" | "bordered" | "compact" | "modern";
