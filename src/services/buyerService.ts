
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
    // Get the user ID from the auth context
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('buyers')
      .insert({
        ...buyer,
        user_id: user.id
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
