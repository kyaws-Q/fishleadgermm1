
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
    
    // Use type assertion to handle the response
    return data as unknown as (Shipment & { buyer: { name: string } })[];
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
}

// Get a single shipment with all related data
export async function getShipmentDetails(shipmentId: string) {
  try {
    // Get the shipment
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        *,
        buyer:buyer_id(*)
      `)
      .eq('id', shipmentId)
      .single();

    if (shipmentError) throw shipmentError;

    // Get the fish entries for this shipment
    const { data: entries, error: entriesError } = await supabase
      .from('fish_entries')
      .select('*')
      .eq('shipment_id', shipment.id);

    if (entriesError) throw entriesError;

    // Use explicit typing to handle the entries data
    const fishEntries = entries as unknown as FishEntry[];

    // Group entries by fish name with proper type handling
    const grouped_entries = fishEntries.reduce((groups: any[], entry: FishEntry) => {
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

    // Calculate grand total with proper type handling
    const grand_total = fishEntries.reduce((sum: number, entry: FishEntry) => sum + entry.total_usd, 0);

    // Return properly structured data
    return {
      shipment,
      buyer: shipment.buyer,
      entries: fishEntries,
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
    // Insert the shipment first
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert([shipmentData])
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    // Now insert the fish entries with the new shipment ID
    const fishEntriesWithShipmentId = entriesData.map(entry => ({
      ...entry,
      shipment_id: shipment.id
    }));

    const { data: entries, error: entriesError } = await supabase
      .from('fish_entries')
      .insert(fishEntriesWithShipmentId)
      .select();

    if (entriesError) throw entriesError;

    return {
      shipment,
      entries
    };
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
}
