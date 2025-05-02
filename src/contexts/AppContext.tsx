import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppTheme, FishPurchase, TableStyle } from "@/types";
import { mockPurchases } from "@/services/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AppContextProps {
  user: { id: string; email: string } | null;
  companyName: string;
  setCompanyName: (name: string) => void;
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  tableStyle: TableStyle;
  setTableStyle: (style: TableStyle) => void;
  addPurchase: (purchase: Omit<FishPurchase, "id" | "total" | "totalPrice">) => void;
  addMultiplePurchases: (companyName: string, buyerName: string, date: string, entries: Array<{
    fishName: string;
    sizeKg: number;
    quantity: number;
    pricePerUnit: number;
  }>) => void;
  purchases: FishPurchase[];
  setPurchases: (purchases: FishPurchase[]) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [companyName, setCompanyName] = useState("Fish Export Company");
  const [appTheme, setAppTheme] = useState<AppTheme>("light");
  const [tableStyle, setTableStyle] = useState<TableStyle>("excel"); // Updated to match the TableStyle type
  const [purchases, setPurchases] = useState<FishPurchase[]>(mockPurchases);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
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
      purchaseDate: purchase.date, // Make sure purchaseDate is set
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
    const newPurchases = entries.map((entry) => {
      const total = entry.sizeKg * entry.quantity * entry.pricePerUnit;
      return {
        id: `purchase_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        companyName,
        buyerName,
        date,
        purchaseDate: date, // Make sure purchaseDate is set
        fishName: entry.fishName,
        sizeKg: entry.sizeKg,
        quantity: entry.quantity,
        pricePerUnit: entry.pricePerUnit,
        total,
        totalPrice: total // Make sure totalPrice is set
      };
    });
    
    setPurchases([...purchases, ...newPurchases]);
    toast.success(`Added ${newPurchases.length} purchase records!`);
  };

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
      setPurchases
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
