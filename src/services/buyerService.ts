
import { supabase } from '@/integrations/supabase/client';
import { Buyer } from '@/types';

export async function getBuyers() {
  try {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Buyer[];
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return [];
  }
}

export async function createBuyer(buyer: Omit<Buyer, 'id' | 'user_id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('buyers')
      .insert({
        ...buyer,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Buyer;
  } catch (error) {
    console.error('Error creating buyer:', error);
    throw error;
  }
}
