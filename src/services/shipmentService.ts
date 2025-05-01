
import { supabase } from '@/integrations/supabase/client';
import { Shipment, FishEntry, ShipmentWithDetails } from '@/types';

export async function getShipments() {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        buyer:buyers(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Shipment & { buyer: { name: string } })[];
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
}

export async function getShipmentWithDetails(shipmentId: string): Promise<ShipmentWithDetails | null> {
  try {
    // Fetch shipment
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (shipmentError) throw shipmentError;
    if (!shipment) return null;

    // Fetch buyer
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', shipment.buyer_id)
      .single();

    if (buyerError) throw buyerError;

    // Fetch all entries
    const { data: entries, error: entriesError } = await supabase
      .from('fish_entries')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('fish_name');

    if (entriesError) throw entriesError;

    // Group entries by fish_name for reporting
    const entriesByFish = entries.reduce((groups: Record<string, FishEntry[]>, entry) => {
      const group = groups[entry.fish_name] || [];
      group.push(entry);
      groups[entry.fish_name] = group;
      return groups;
    }, {});

    // Create grouped entries with totals
    const grouped_entries = Object.keys(entriesByFish).map(fish_name => {
      const fishEntries = entriesByFish[fish_name];
      const total_usd = fishEntries.reduce((sum, entry) => sum + entry.total_usd, 0);
      
      return {
        fish_name,
        entries: fishEntries,
        total_usd
      };
    });

    // Calculate grand total
    const grand_total = entries.reduce((sum, entry) => sum + entry.total_usd, 0);

    return {
      shipment: shipment as Shipment,
      buyer: buyer as any,
      entries: entries as FishEntry[],
      grouped_entries,
      grand_total
    };
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    return null;
  }
}

export async function createShipment(
  shipment: Omit<Shipment, 'id' | 'user_id' | 'created_at'>, 
  entries: Omit<FishEntry, 'id' | 'shipment_id' | 'created_at' | 'total_usd'>[]
) {
  try {
    // Create shipment
    const { data: newShipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        ...shipment,
      })
      .select()
      .single();

    if (shipmentError) throw shipmentError;
    
    // Prepare entries with shipment_id
    const shipmentEntries = entries.map(entry => ({
      ...entry,
      shipment_id: newShipment.id,
    }));

    // Create entries
    const { data: newEntries, error: entriesError } = await supabase
      .from('fish_entries')
      .insert(shipmentEntries)
      .select();

    if (entriesError) throw entriesError;

    return {
      shipment: newShipment,
      entries: newEntries
    };
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
}
