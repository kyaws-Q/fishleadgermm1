import { supabase } from "@/integrations/supabase/client";
import { FishPurchase } from "@/types";
import { toast } from "sonner";

// Helper to transform Supabase purchase data to FishPurchase type
const transformSupabasePurchase = (item: any): FishPurchase => ({
  id: item.id,
  companyName: item.company_name,
  buyerName: item.buyer_name,
  date: item.purchase_date,
  purchaseDate: item.purchase_date,
  fishName: item.fish_name,
  sizeKg: item.size_kg,
  quantity: item.quantity,
  pricePerUnit: item.price_per_unit,
  total: item.total_price,
  totalPrice: item.total_price,
  paymentStatus: item.payment_status || 'unpaid',
  deletedAt: item.deleted_at || undefined,
});

export const purchaseService = {
  async fetchUserPurchases(userId: string): Promise<FishPurchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching purchases:', error);
      toast.error("Failed to fetch purchases.");
      throw error;
    }
    return data.map(transformSupabasePurchase);
  },

  async fetchDeletedPurchases(userId: string): Promise<FishPurchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error('Error fetching deleted purchases:', error);
      toast.error("Failed to fetch deleted purchases.");
      throw error;
    }
    return data.map(transformSupabasePurchase);
  },

  async addPurchase(
    userId: string,
    purchase: Omit<FishPurchase, "id" | "total" | "totalPrice" | "user_id" | "is_deleted" | "deleted_at" | "created_at">
  ): Promise<FishPurchase> {
    const totalPrice = (purchase.sizeKg || 0) * (purchase.quantity || 0) * (purchase.pricePerUnit || 0);
    const purchaseData = {
      user_id: userId,
      company_name: purchase.companyName,
      buyer_name: purchase.buyerName,
      purchase_date: purchase.purchaseDate || purchase.date,
      fish_name: purchase.fishName,
      size_kg: purchase.sizeKg,
      quantity: purchase.quantity,
      price_per_unit: purchase.pricePerUnit,
      total_price: totalPrice,
      payment_status: purchase.paymentStatus || 'unpaid',
      is_deleted: false,
    };

    const { data, error } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (error) {
      console.error('Error adding purchase:', error);
      toast.error("Failed to add purchase.");
      throw error;
    }
    return transformSupabasePurchase(data);
  },

  async addMultiplePurchases(
    userId: string,
    companyName: string,
    buyerName: string,
    date: string,
    entries: Array<{
      fishName: string;
      sizeKg: number;
      quantity: number;
      pricePerUnit: number;
      paymentStatus?: 'paid' | 'unpaid' | 'pending';
    }>
  ): Promise<FishPurchase[]> {
    const purchasesToInsert = entries.map(entry => {
      const totalPrice = (entry.sizeKg || 0) * (entry.quantity || 0) * (entry.pricePerUnit || 0);
      return {
        user_id: userId,
        company_name: companyName,
        buyer_name: buyerName,
        purchase_date: date,
        fish_name: entry.fishName,
        size_kg: entry.sizeKg,
        quantity: entry.quantity,
        price_per_unit: entry.pricePerUnit,
        total_price: totalPrice,
        payment_status: entry.paymentStatus || 'unpaid',
        is_deleted: false,
      };
    });

    const { data, error } = await supabase
      .from('purchases')
      .insert(purchasesToInsert)
      .select();

    if (error) {
      console.error('Error adding multiple purchases:', error);
      toast.error("Failed to add multiple purchases.");
      throw error;
    }
    return data.map(transformSupabasePurchase);
  },
  
  async updatePurchase(
    purchaseId: string,
    userId: string,
    updateData: Partial<Omit<FishPurchase, "id" | "user_id" | "created_at" | "deleted_at">>
  ): Promise<FishPurchase> {
    
    const currentPurchase = await supabase
                            .from('purchases')
                            .select('size_kg, quantity, price_per_unit')
                            .eq('id', purchaseId)
                            .eq('user_id', userId)
                            .single();

    if (currentPurchase.error || !currentPurchase.data) {
        console.error('Error fetching current purchase for update:', currentPurchase.error);
        toast.error("Failed to find purchase to update.");
        throw currentPurchase.error || new Error("Purchase not found");
    }
    
    const newSizeKg = updateData.sizeKg ?? currentPurchase.data.size_kg;
    const newQuantity = updateData.quantity ?? currentPurchase.data.quantity;
    const newPricePerUnit = updateData.pricePerUnit ?? currentPurchase.data.price_per_unit;
    
    const purchaseToUpdate: any = { ...updateData };

    if (updateData.sizeKg !== undefined || updateData.quantity !== undefined || updateData.pricePerUnit !== undefined) {
      purchaseToUpdate.total_price = (newSizeKg || 0) * (newQuantity || 0) * (newPricePerUnit || 0);
    }
    
    // Remove fields that should not be directly updated or are part of the primary key/foreign key
    delete purchaseToUpdate.total; // if 'total' is just a getter for 'totalPrice'
    if ('purchaseDate' in purchaseToUpdate && !('date' in purchaseToUpdate)) {
        purchaseToUpdate.purchase_date = purchaseToUpdate.purchaseDate;
        delete purchaseToUpdate.purchaseDate;
    }


    const { data, error } = await supabase
      .from('purchases')
      .update(purchaseToUpdate)
      .eq('id', purchaseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating purchase:', error);
      toast.error("Failed to update purchase.");
      throw error;
    }
    return transformSupabasePurchase(data);
  },


  async updatePurchasePaymentStatus(
    purchaseId: string,
    userId: string,
    status: 'paid' | 'unpaid' | 'pending'
  ): Promise<FishPurchase> {
    const { data, error } = await supabase
      .from('purchases')
      .update({ payment_status: status })
      .eq('id', purchaseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      toast.error("Failed to update payment status.");
      throw error;
    }
    return transformSupabasePurchase(data);
  },

  async deletePurchase(purchaseId: string, userId: string): Promise<FishPurchase> { // Soft delete
    try {
      // Use direct update with better error handling
      const { data, error } = await supabase
        .from('purchases')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', purchaseId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error deleting purchase:', error);
        toast.error("Failed to delete purchase. Please try again or contact support.");
        throw error;
      }
      
      return transformSupabasePurchase(data);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error("Failed to delete purchase.");
      throw error;
    }
  },
  
  // deletePurchasePermanently is an example if you need hard delete
  // async deletePurchasePermanently(purchaseId: string, userId: string): Promise<void> {
  //   const { error } = await supabase
  //     .from('purchases')
  //     .delete()
  //     .eq('id', purchaseId)
  //     .eq('user_id', userId);

  //   if (error) {
  //     console.error('Error permanently deleting purchase:', error);
  //     toast.error("Failed to permanently delete purchase.");
  //     throw error;
  //   }
  // },

  async recoverPurchase(purchaseId: string, userId: string): Promise<FishPurchase> {
    try {
      // Use direct update with better error handling
      const { data, error } = await supabase
        .from('purchases')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', purchaseId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error recovering purchase:', error);
        toast.error("Failed to recover purchase. Please try again or contact support.");
        throw error;
      }
      
      return transformSupabasePurchase(data);
    } catch (error) {
      console.error('Error recovering purchase:', error);
      toast.error("Failed to recover purchase.");
      throw error;
    }
  },
}; 