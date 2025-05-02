
import { supabase } from '@/integrations/supabase/client';
import { Shipment, FishEntry, ShipmentWithDetails } from '@/types';

// Get all shipments with buyer information
export async function getShipments() {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        buyer:buyer_id(name)
      `)
      .order('shipment_date', { ascending: false });

    if (error) throw error;
    
    // Convert the Supabase response to match our application's type structure
    const transformedData = data?.map(item => ({
      id: String(item.id),
      user_id: item.user_id || "unknown",
      buyer_id: String(item.buyer_id),
      shipment_date: item.shipment_date,
      container_number: item.tracking_number,
      status: item.status,
      created_at: item.created_at || new Date().toISOString(),
      buyer: { name: item.buyer?.name || "Unknown Buyer" }
    }));
    
    return transformedData || [];
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
}

// Get a single shipment with all related data
export async function getShipmentDetails(shipmentId: string) {
  try {
    // Get the shipment
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        *,
        buyer:buyer_id(*)
      `)
      .eq('id', parseInt(shipmentId, 10))
      .single();

    if (shipmentError) throw shipmentError;
    
    // Since fish_entries table isn't available in the Supabase schema,
    // we'll mock this data for now
    const mockFishEntries: FishEntry[] = [
      {
        id: `entry_${Date.now()}_1`,
        shipment_id: shipmentId,
        fish_name: "ROHU-G",
        description: "2 UP",
        net_kg_per_mc: 20,
        qty_mc: 5,
        qty_kgs: 100,
        price_per_kg: 1.75,
        total_usd: 175,
        created_at: new Date().toISOString()
      },
      {
        id: `entry_${Date.now()}_2`,
        shipment_id: shipmentId,
        fish_name: "KATLA-G",
        description: "3 UP",
        net_kg_per_mc: 25,
        qty_mc: 8,
        qty_kgs: 200,
        price_per_kg: 2.10,
        total_usd: 420,
        created_at: new Date().toISOString()
      }
    ];

    // Group entries by fish name
    const grouped_entries = mockFishEntries.reduce((groups: any[], entry: FishEntry) => {
      const existingGroup = groups.find(g => g.fish_name === entry.fish_name);
      if (existingGroup) {
        existingGroup.entries.push(entry);
        existingGroup.total_usd += entry.total_usd;
      } else {
        groups.push({
          fish_name: entry.fish_name,
          entries: [entry],
          total_usd: entry.total_usd
        });
      }
      return groups;
    }, []);

    // Calculate grand total
    const grand_total = mockFishEntries.reduce((sum: number, entry: FishEntry) => sum + entry.total_usd, 0);
    
    // Transform shipment data to match our application structure
    const shipment: Shipment = {
      id: String(shipmentData.id),
      user_id: shipmentData.user_id || "unknown",
      buyer_id: String(shipmentData.buyer_id),
      shipment_date: shipmentData.shipment_date,
      container_number: shipmentData.tracking_number,
      status: shipmentData.status,
      created_at: shipmentData.created_at || new Date().toISOString()
    };
    
    // Transform buyer data
    const buyer = {
      id: String(shipmentData.buyer.id),
      user_id: shipmentData.buyer.user_id || "unknown",
      name: shipmentData.buyer.name,
      address: shipmentData.buyer.address,
      created_at: shipmentData.buyer.created_at || new Date().toISOString()
    };

    // Return transformed data
    return {
      shipment,
      buyer,
      entries: mockFishEntries,
      grouped_entries,
      grand_total
    } as ShipmentWithDetails;
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    return null;
  }
}

// Create a new shipment with fish entries
export async function createShipment(shipmentData: Omit<Shipment, 'id' | 'created_at'>, entriesData: Omit<FishEntry, 'id' | 'created_at' | 'shipment_id'>[]) {
  try {
    // Prepare data for Supabase format
    const supabaseShipmentData = {
      buyer_id: parseInt(shipmentData.buyer_id, 10),
      shipment_date: shipmentData.shipment_date,
      status: shipmentData.status || 'pending',
      tracking_number: shipmentData.container_number,
      user_id: shipmentData.user_id
    };
    
    // Insert the shipment first
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert([supabaseShipmentData])
      .select()
      .single();

    if (shipmentError) throw shipmentError;
    
    // Since we don't have a fish_entries table in Supabase schema yet,
    // we'll simulate the response for now
    const mockEntries = entriesData.map((entry, index) => ({
      id: `entry_${Date.now()}_${index}`,
      shipment_id: String(shipment.id),
      fish_name: entry.fish_name,
      description: entry.description,
      net_kg_per_mc: entry.net_kg_per_mc,
      qty_mc: entry.qty_mc,
      qty_kgs: entry.qty_kgs,
      price_per_kg: entry.price_per_kg,
      total_usd: entry.total_usd,
      created_at: new Date().toISOString()
    }));

    return {
      shipment: {
        id: String(shipment.id),
        user_id: shipment.user_id || "unknown",
        buyer_id: String(shipment.buyer_id),
        shipment_date: shipment.shipment_date,
        container_number: shipment.tracking_number,
        status: shipment.status,
        created_at: shipment.created_at || new Date().toISOString()
      },
      entries: mockEntries
    };
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
}
