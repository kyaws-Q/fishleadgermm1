
import { supabase } from "@/integrations/supabase/client";
import { Buyer, FishEntry, GroupedFishEntry, Shipment, ShipmentWithDetails } from "@/types";

// Get all shipments with buyer information
export async function getShipments() {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        *,
        buyer:buyer_id(*)
      `)
      .order('shipment_date', { ascending: false });

    if (error) {
      console.error("Error fetching shipments:", error);
      throw new Error(error.message);
    }

    // Type assertion to match what Supabase returns with our application types
    return data as unknown as (Shipment & { buyer: Buyer })[];
  } catch (error) {
    console.error("Shipment service error:", error);
    throw error;
  }
}

// Get a specific shipment with all related information
export async function getShipmentDetails(id: string | number): Promise<ShipmentWithDetails> {
  try {
    // Convert id to number if it's a string
    const shipmentId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    // Get the shipment and buyer information using the correct foreign key syntax
    const { data: shipmentData, error: shipmentError } = await supabase
      .from("shipments")
      .select(`
        *,
        buyer:buyer_id(*)
      `)
      .eq('id', shipmentId)
      .single();

    if (shipmentError) {
      throw new Error(shipmentError.message);
    }

    if (!shipmentData) {
      throw new Error("Shipment not found");
    }

    // Make sure buyer data exists
    if (!shipmentData.buyer) {
      console.error("Buyer data not found for shipment:", shipmentId);
    }

    // Mock data for fish entries since the fish_entries table doesn't exist in Supabase yet
    // In a real implementation, you would fetch this from the database
    const entriesData: FishEntry[] = [
      {
        id: "1",
        shipment_id: shipmentData.id.toString(),
        fish_name: "ROHU-G",
        description: "Fresh",
        net_kg_per_mc: 20,
        qty_mc: 50,
        qty_kgs: 1000,
        price_per_kg: 5.5,
        total_usd: 5500,
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        shipment_id: shipmentData.id.toString(),
        fish_name: "KATLA-G",
        description: "Frozen",
        net_kg_per_mc: 15,
        qty_mc: 30,
        qty_kgs: 450,
        price_per_kg: 6.2,
        total_usd: 2790,
        created_at: new Date().toISOString()
      }
    ];

    const entries = entriesData || [];

    // Group fish entries by fish_name
    const groupedEntries: GroupedFishEntry[] = entries.reduce((groups: GroupedFishEntry[], entry: FishEntry) => {
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

    // Extract buyer data safely with typed fallbacks
    const buyerData = shipmentData.buyer as Buyer || {
      id: "unknown",
      name: "Unknown Buyer",
      address: "",
      created_at: new Date().toISOString()
    };
    
    const shipmentWithDetails: ShipmentWithDetails = {
      shipment: {
        id: shipmentData.id.toString(),
        user_id: "mock-user-id", // Assuming this is required by your type but not in DB
        buyer_id: shipmentData.buyer_id.toString(),
        shipment_date: shipmentData.shipment_date,
        container_number: shipmentData.tracking_number || undefined, // Using tracking_number as container_number
        status: shipmentData.status || undefined,
        tracking_number: shipmentData.tracking_number || undefined,
        created_at: shipmentData.created_at || new Date().toISOString()
      },
      buyer: {
        id: buyerData.id || "unknown",
        name: buyerData.name || "Unknown Buyer",
        address: buyerData.address || "",
        created_at: buyerData.created_at || new Date().toISOString()
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
        buyer_id: parseInt(shipmentData.buyer_id, 10),
        shipment_date: shipmentData.shipment_date,
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

    // Log successful shipment creation
    console.log("Created new shipment:", newShipment);
    
    // In a real implementation, you would insert fish entries into the database
    // Since there's no fish_entries table yet, we'll just return the shipment
    
    return {
      ...newShipment,
      id: newShipment.id.toString()
    };
  } catch (error) {
    console.error("Error creating shipment:", error);
    throw error;
  }
}
