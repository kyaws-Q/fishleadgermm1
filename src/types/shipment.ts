
export interface Buyer {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  email?: string;
}

export interface Shipment {
  id: string;
  userId: string;
  buyerId: string;
  buyerName: string;
  date: string;
  vesselName?: string;
  containerNumber?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  tracking_number?: string;
  shipping_line?: string;
  route?: string;
}

export interface FishEntry {
  id: string;
  shipmentId: string;
  fishName: string;
  size: string;
  netKgPerMc: number;
  qtyMc: number;
  qtyKgs: number;
  pricePerKg: number;
  totalUsd: number;
}

export interface GroupedFishEntries {
  fishName: string;
  entries: FishEntry[];
  subtotal: number;
}

export interface ShipmentWithEntries {
  shipment: Shipment;
  entries: FishEntry[];
  groupedEntries: GroupedFishEntries[];
  grandTotal: number;
}
