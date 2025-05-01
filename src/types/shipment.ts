
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
