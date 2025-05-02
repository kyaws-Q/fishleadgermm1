import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppTheme, FishPurchase, TableStyle, AppContextProps, TimeFrame } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mockPurchases as initialMockPurchases } from "@/services/mockData";

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [companyName, setCompanyName] = useState("Fish Export Company");
  const [appTheme, setAppTheme] = useState<AppTheme>("light");
  const [tableStyle, setTableStyle] = useState<TableStyle>("excel"); 
  const [purchases, setPurchases] = useState<FishPurchase[]>(initialMockPurchases);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email || '',
          name: session.user.user_metadata?.name
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email || '',
          name: session.user.user_metadata?.name
        });
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add a new purchase
  const addPurchase = (purchase: Omit<FishPurchase, "id" | "total" | "totalPrice">) => {
    const newPurchase: FishPurchase = {
      ...purchase,
      id: `purchase_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      total: purchase.sizeKg * purchase.quantity * purchase.pricePerUnit,
      totalPrice: purchase.sizeKg * purchase.quantity * purchase.pricePerUnit,
    };
    setPurchases([...purchases, newPurchase]);
    toast.success("Purchase added successfully!");
  };

  // Add multiple purchases at once (from the PurchaseForm)
  const addMultiplePurchases = (companyName: string, buyerName: string, date: string, entries: Array<{
    fishName: string;
    sizeKg: number;
    quantity: number;
    pricePerUnit: number;
  }>) => {
    const newPurchases: FishPurchase[] = entries.map((entry) => {
      const total = entry.sizeKg * entry.quantity * entry.pricePerUnit;
      return {
        id: `purchase_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        companyName,
        buyerName,
        date,
        purchaseDate: date,
        fishName: entry.fishName,
        sizeKg: entry.sizeKg,
        quantity: entry.quantity,
        pricePerUnit: entry.pricePerUnit,
        total,
        totalPrice: total
      };
    });
    
    setPurchases([...purchases, ...newPurchases]);
    toast.success(`Added ${newPurchases.length} purchase records!`);
  };

  // Login functionality using Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Login successful!");
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup functionality using Supabase
  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Signup successful! Please check your email.");
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout functionality using Supabase
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.success("Logout successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder data for charts
  const spendingByFishType = [
    { name: 'ROHU-G', value: 4500 },
    { name: 'KATLA-G', value: 3200 },
    { name: 'TILAPIA-W', value: 2800 },
    { name: 'MRIGAL', value: 2000 },
    { name: 'PANGUS', value: 1500 }
  ];

  const purchasesByMonth = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 4000 },
    { name: 'May', amount: 6000 },
    { name: 'Jun', amount: 3500 }
  ];

  return (
    <AppContext.Provider value={{
      user,
      companyName,
      setCompanyName,
      appTheme,
      setAppTheme,
      tableStyle,
      setTableStyle,
      addPurchase,
      addMultiplePurchases,
      purchases,
      setPurchases,
      login,
      signup,
      logout,
      isLoading,
      timeFrame,
      setTimeFrame,
      spendingByFishType,
      purchasesByMonth
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
