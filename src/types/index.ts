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
