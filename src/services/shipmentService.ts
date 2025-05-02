
import { supabase } from "@/integrations/supabase/client";
import { Buyer, FishEntry, GroupedFishEntry, Shipment, ShipmentWithDetails } from "@/types";

// Get all shipments with buyer information
export async function getShipments() {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        *,
        buyer:buyer_id(name)
      `)
      .order('shipment_date', { ascending: false });

    if (error) {
      console.error("Error fetching shipments:", error);
      throw new Error(error.message);
    }

    return data as (Shipment & { buyer: { name: string } })[];
  } catch (error) {
    console.error("Shipment service error:", error);
    throw error;
  }
}

// Get a specific shipment with all related information
export async function getShipmentDetails(id: string | number): Promise<ShipmentWithDetails> {
  try {
    // Get the shipment and buyer information
    const { data: shipmentData, error: shipmentError } = await supabase
      .from("shipments")
      .select(`
        *,
        buyer:buyer_id(*)
      `)
      .eq('id', id)
      .single();

    if (shipmentError) {
      throw new Error(shipmentError.message);
    }

    if (!shipmentData) {
      throw new Error("Shipment not found");
    }

    // Get the fish entries for this shipment
    const { data: entriesData, error: entriesError } = await supabase
      .from("fish_entries")
      .select('*')
      .eq('shipment_id', shipmentData.id);

    if (entriesError) {
      throw new Error(entriesError.message);
    }

    const entries = entriesData || [];

    // Group fish entries by fish_name
    const groupedEntries = entries.reduce((groups: GroupedFishEntry[], entry: FishEntry) => {
      // Find if there's already a group for this fish name
      let group = groups.find(g => g.fish_name === entry.fish_name);
      
      if (!group) {
        group = {
          fish_name: entry.fish_name,
          entries: [],
          total_usd: 0
        };
        groups.push(group);
      }
      
      group.entries.push(entry);
      group.total_usd += entry.total_usd;
      
      return groups;
    }, []);

    // Calculate grand total
    const grandTotal = entries.reduce((sum: number, entry: FishEntry) => {
      return sum + entry.total_usd;
    }, 0);

    // Create the complete shipment details object
    const shipmentWithDetails: ShipmentWithDetails = {
      shipment: {
        id: shipmentData.id,
        buyer_id: shipmentData.buyer_id,
        shipment_date: shipmentData.shipment_date,
        container_number: shipmentData.container_number || undefined,
        status: shipmentData.status || undefined,
        tracking_number: shipmentData.tracking_number || undefined,
        created_at: shipmentData.created_at
      },
      buyer: {
        id: shipmentData.buyer.id,
        name: shipmentData.buyer.name,
        address: shipmentData.buyer.address,
        created_at: shipmentData.buyer.created_at
      },
      entries: entries,
      grouped_entries: groupedEntries,
      grand_total: grandTotal
    };

    return shipmentWithDetails;
  } catch (error) {
    console.error("Error getting shipment details:", error);
    throw error;
  }
}

// Create a new shipment with fish entries
export async function createShipment(
  shipmentData: Omit<Shipment, "id" | "created_at">, 
  fishEntries: Omit<FishEntry, "id" | "created_at" | "shipment_id">[]
) {
  try {
    // Insert the shipment
    const { data: newShipment, error: shipmentError } = await supabase
      .from("shipments")
      .insert({
        buyer_id: shipmentData.buyer_id,
        shipment_date: shipmentData.shipment_date,
        container_number: shipmentData.container_number,
        status: shipmentData.status || 'In Process',
        tracking_number: shipmentData.tracking_number
      })
      .select()
      .single();

    if (shipmentError) {
      throw new Error(shipmentError.message);
    }

    if (!newShipment) {
      throw new Error("Failed to create shipment");
    }

    // Insert the fish entries
    if (fishEntries && fishEntries.length > 0) {
      const entriesToInsert = fishEntries.map(entry => ({
        shipment_id: newShipment.id,
        fish_name: entry.fish_name,
        description: entry.description,
        net_kg_per_mc: entry.net_kg_per_mc,
        qty_mc: entry.qty_mc,
        qty_kgs: entry.qty_kgs,
        price_per_kg: entry.price_per_kg,
        total_usd: entry.total_usd
      }));

      const { error: entriesError } = await supabase
        .from("fish_entries")
        .insert(entriesToInsert);

      if (entriesError) {
        // Delete the shipment if entries failed to insert
        await supabase.from("shipments").delete().eq("id", newShipment.id);
        throw new Error(entriesError.message);
      }
    }

    return newShipment;
  } catch (error) {
    console.error("Error creating shipment:", error);
    throw error;
  }
}
