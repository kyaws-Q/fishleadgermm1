
import React, { createContext, useContext, useState, useEffect } from "react";
import { FishPurchase, User, TimeFrame } from "@/types";
import { 
  initialMockPurchases, 
  calculateTotalSpending,
  calculateSpendingByFishType,
  getPurchasesByMonth 
} from "@/services/mockData";
import { toast } from "sonner";

interface AppContextType {
  user: User | null;
  purchases: FishPurchase[];
  isLoading: boolean;
  timeFrame: TimeFrame;
  totalSpending: number;
  spendingByFishType: Record<string, number>;
  purchasesByMonth: Record<string, number>;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  addPurchase: (purchase: Omit<FishPurchase, "id" | "totalPrice">) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<FishPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [totalSpending, setTotalSpending] = useState(0);
  const [spendingByFishType, setSpendingByFishType] = useState<Record<string, number>>({});
  const [purchasesByMonth, setPurchasesByMonth] = useState<Record<string, number>>({});

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('fishLedgerUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Load purchase data when user changes
  useEffect(() => {
    if (user) {
      // In a real app, we'd fetch from API based on user ID
      // For now, use mock data
      setPurchases(initialMockPurchases);
    } else {
      setPurchases([]);
    }
  }, [user]);

  // Calculate derived data when purchases or timeframe changes
  useEffect(() => {
    setTotalSpending(calculateTotalSpending(purchases));
    setSpendingByFishType(calculateSpendingByFishType(purchases));
    setPurchasesByMonth(getPurchasesByMonth(purchases));
  }, [purchases, timeFrame]);

  // Add a new purchase
  const addPurchase = (purchase: Omit<FishPurchase, "id" | "totalPrice">) => {
    const newPurchase: FishPurchase = {
      ...purchase,
      id: `purchase-${Date.now()}`,
      totalPrice: purchase.sizeKg * purchase.quantity * purchase.pricePerUnit
    };
    
    setPurchases(prev => [newPurchase, ...prev]);
    toast.success("Purchase added successfully");
  };

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation
    if (!email || !password) {
      setIsLoading(false);
      throw new Error("Email and password are required");
    }
    
    // Mock successful login
    const mockUser: User = {
      id: "user-1",
      email,
      name: email.split('@')[0]
    };
    
    setUser(mockUser);
    localStorage.setItem('fishLedgerUser', JSON.stringify(mockUser));
    setIsLoading(false);
    toast.success("Logged in successfully");
  };

  // Mock signup function
  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation
    if (!email || !password) {
      setIsLoading(false);
      throw new Error("Email and password are required");
    }
    
    // Mock successful signup
    const mockUser: User = {
      id: "user-1",
      email,
      name: name || email.split('@')[0]
    };
    
    setUser(mockUser);
    localStorage.setItem('fishLedgerUser', JSON.stringify(mockUser));
    setIsLoading(false);
    toast.success("Account created successfully");
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('fishLedgerUser');
    toast.success("Logged out successfully");
  };

  return (
    <AppContext.Provider value={{
      user,
      purchases,
      isLoading,
      timeFrame,
      totalSpending,
      spendingByFishType,
      purchasesByMonth,
      setTimeFrame,
      addPurchase,
      login,
      signup,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
