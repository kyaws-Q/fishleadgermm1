import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { AppTheme, FishPurchase, TableStyle, AppContextProps, TimeFrame, DateRange, ChartDataPoint, PurchaseGroup } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format, parseISO, isWithinInterval } from "date-fns";
import { purchaseService } from "@/services/purchaseService";

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string; profileUrl?: string } | null>(null);
  const [companyName, setCompanyName] = useState("Fish Export Company");
  const [tableStyle, setTableStyle] = useState<TableStyle>("excel");
  const [purchases, setPurchases] = useState<FishPurchase[]>([]);
  const [deletedPurchases, setDeletedPurchases] = useState<FishPurchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState<boolean>(false);
  const [currency, setCurrencyState] = useState<string>("USD");

  // Theme is now completely handled by ThemeProvider

  // Fetch data from Supabase on initial load and when user logs in
  useEffect(() => {
    if (user && user.id) {
      fetchUserPurchases();
      fetchDeletedPurchases(); // Fetch deleted purchases on user load as well
      fetchUserCurrency();
    } else {
      setPurchases([]);
      setDeletedPurchases([]);
    }
  }, [user]);

  // Fetch user purchases from Supabase
  const fetchUserPurchases = async () => {
    if (!user || !user.id) {
      setPurchases([]);
      return;
    }
    try {
      setIsLoading(true);
      const userPurchases = await purchaseService.fetchUserPurchases(user.id);
      setPurchases(userPurchases);
      setLastUpdated(new Date());
    } catch (error) {
      // Error is handled by the service, toast is shown there.
      // Keep existing data if there's an error to avoid UI flicker if purchases were already loaded
      if (purchases.length === 0) {
          setPurchases([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch deleted purchases for recovery
  const fetchDeletedPurchases = async () => {
    if (!user || !user.id) {
      setDeletedPurchases([]);
      return;
    }
    console.log("AppContext: Fetching deleted purchases via service");
    try {
      const userDeletedPurchases = await purchaseService.fetchDeletedPurchases(user.id);
      setDeletedPurchases(userDeletedPurchases);
    } catch (error) {
      // Error is handled by the service
      console.error('AppContext: Error fetching deleted purchases via service', error);
    }
  };

  // Fetch user currency from Supabase on login
  const fetchUserCurrency = async () => {
    if (!user || !user.id) return;
    try {
      // Use maybeSingle() instead of single() to handle cases where there might be no rows
      // or we can use .limit(1) to get at most one row instead of expecting exactly one
      const { data, error } = await supabase
        .from('users')
        .select('currency')
        .eq('id', user.id)
        .limit(1);
      
      if (error) {
        console.warn('Currency fetch error:', error.message);
        // If the column doesn't exist or there's another issue, we'll just use the default
        return;
      }
      
      // Check if we got any results and use the first one
      if (data && data.length > 0 && data[0].currency) {
        setCurrencyState(data[0].currency);
      }
    } catch (err) {
      console.error('Exception in fetchUserCurrency:', err);
      // Ignore error, fallback to default
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
          profileUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        });
      } else {
        setUser(null);
        // Clear purchases when user logs out
        setPurchases([]);
        setDeletedPurchases([]);
      }
      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
          profileUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        });
        
        // Force fetch data on mount
        setTimeout(() => {
          if (session.user.id) {
            console.log("Force fetching data for user:", session.user.id);
            fetchUserPurchases();
            fetchDeletedPurchases();
          }
        }, 1000);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add a function to manually refresh data
  const refreshData = async () => {
    if (user && user.id) {
      setIsLoading(true);
      toast.info("Refreshing data...");
      try {
        await fetchUserPurchases();
        await fetchDeletedPurchases();
        toast.success("Data refreshed successfully!");
      } catch (error) {
        toast.error("Failed to refresh data");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("You must be logged in to refresh data");
    }
  };

  // Add a new purchase
  const addPurchase = async (purchase: Omit<FishPurchase, "id" | "total" | "totalPrice">) => {
    if (!user || !user.id) {
      toast.error("You must be logged in to add purchases");
      return;
    }
    try {
      // The Omit type for purchase in the function signature needs to align with what purchaseService.addPurchase expects.
      // The service expects Omit<FishPurchase, "id" | "total" | "totalPrice" | "user_id" | "is_deleted" | "deleted_at" | "created_at">
      // Let's assume the input `purchase` here matches the service's expectation for simplicity,
      // or that it's transformed before calling this function.
      // The key difference is that user_id, is_deleted etc. are handled by the service.
      const newPurchase = await purchaseService.addPurchase(user.id, purchase);
      setPurchases(prevPurchases => [...prevPurchases, newPurchase].sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
      setLastUpdated(new Date());
      toast.success("Purchase added successfully!");
    } catch (error) {
      // Error is handled by the service, toast is shown there.
      console.error('AppContext: Error adding purchase via service', error);
    }
  };

  // Add multiple purchases at once (from the PurchaseForm)
  const addMultiplePurchases = async (companyNameInput: string, buyerNameInput: string, dateInput: string, entries: Array<{
    fishName: string;
    sizeKg: number;
    quantity: number;
    pricePerUnit: number;
    paymentStatus?: 'paid' | 'unpaid' | 'pending';
  }>) => {
    if (!user || !user.id) {
      toast.error("You must be logged in to add purchases");
      return;
    }
    try {
      const newPurchases = await purchaseService.addMultiplePurchases(user.id, companyNameInput, buyerNameInput, dateInput, entries);
      setPurchases(prevPurchases => [...prevPurchases, ...newPurchases].sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
      setLastUpdated(new Date());
      toast.success(`${newPurchases.length} purchases added successfully!`);
    } catch (error) {
      console.error('AppContext: Error adding multiple purchases via service', error);
    }
  };

  // Update payment status for a purchase
  const updatePurchasePaymentStatus = async (id: string, status: 'paid' | 'unpaid' | 'pending'): Promise<void> => {
    if (!user || !user.id) {
      toast.error("User not logged in.");
      return;
    }
    try {
      const updatedPurchase = await purchaseService.updatePurchasePaymentStatus(id, user.id, status);
      setPurchases(prev => prev.map(p => p.id === id ? updatedPurchase : p).sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
      // Also update deletedPurchases if the item was there
      setDeletedPurchases(prevDeleted => prevDeleted.map(p => p.id === id ? updatedPurchase : p));
      setLastUpdated(new Date());
      toast.success(`Payment status for purchase ${id.substring(0,6)}... updated to ${status}.`);
    } catch (error) {
      console.error('AppContext: Error updating payment status via service', error);
    }
  };

  // Delete a single purchase
  const deletePurchase = async (id: string): Promise<void> => {
    if (!user || !user.id) {
      toast.error("User not logged in.");
      return;
    }
    try {
      const deletedItem = await purchaseService.deletePurchase(id, user.id);
      setPurchases(prev => prev.filter(p => p.id !== id));
      setDeletedPurchases(prevDeleted => [...prevDeleted, deletedItem].sort((a,b) => new Date(b.deletedAt || 0).getTime() - new Date(a.deletedAt || 0).getTime()));
      setLastUpdated(new Date());
      toast.success(`Purchase ${id.substring(0,6)}... moved to trash.`);
    } catch (error) {
      console.error('AppContext: Error deleting purchase via service', error);
    }
  };

  // Soft delete purchases by group
  const deletePurchaseGroup = async (groupKey: string): Promise<void> => {
    if (!user || !user.id) {
      toast.error("User not logged in.");
      return;
    }
    try {
      const [companyName, purchaseDate, buyerName] = groupKey.split('-');
      const purchasesToDelete = purchases.filter(p => 
        p.companyName === companyName && 
        p.purchaseDate === purchaseDate && 
        p.buyerName === buyerName
      );

      if (purchasesToDelete.length === 0) {
        toast(`No purchases found to delete for group: ${groupKey}`);
        return;
      }

      await Promise.all(purchasesToDelete.map(p => deletePurchase(p.id)));
      
      toast.success(`${purchasesToDelete.length} purchases in group ${groupKey} moved to trash.`);
    } catch (error) {
      console.error('AppContext: Error deleting purchase group', error);
      toast.error(`Failed to delete purchase group ${groupKey}.`);
    }
  };

  // Recover purchases by group
  const recoverPurchaseGroup = async (groupKey: string): Promise<void> => {
    if (!user || !user.id) {
      toast.error("User not logged in.");
      return;
    }
    try {
      const [companyName, purchaseDate, buyerName] = groupKey.split('-');
      const purchasesToRecover = deletedPurchases.filter(p => 
        p.companyName === companyName && 
        p.purchaseDate === purchaseDate && 
        p.buyerName === buyerName
      );

      if (purchasesToRecover.length === 0) {
        toast(`No purchases found to recover for group: ${groupKey}`);
        return;
      }

      await Promise.all(purchasesToRecover.map(p => recoverPurchase(p.id)));

      toast.success(`${purchasesToRecover.length} purchases in group ${groupKey} recovered.`);
    } catch (error) {
      console.error('AppContext: Error recovering purchase group', error);
      toast.error(`Failed to recover purchase group ${groupKey}.`);
    }
  };

  // Login functionality using Supabase
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      setIsLoading(false);
      throw error;
    }
  };

  // Signup functionality using Supabase
  const signup = async (email: string, password: string, name?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      setIsLoading(false);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        email: email !== user.email ? email : undefined,
        data: { name }
      });

      if (error) throw error;

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        email: email !== user.email ? email : prev.email,
        name
      } : null);

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed");
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

  // Toggle real-time updates
  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  // Filter purchases based on date range
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const purchaseDate = parseISO(purchase.date);
      return isWithinInterval(purchaseDate, {
        start: dateRange.start,
        end: dateRange.end
      });
    });
  }, [purchases, dateRange]);

  // Calculate spending by fish type
  const spendingByFishType = useMemo(() => {
    const spendingMap: Record<string, number> = {};

    filteredPurchases.forEach(purchase => {
      const fishName = purchase.fishName;
      const total = purchase.totalPrice;

      if (spendingMap[fishName]) {
        spendingMap[fishName] += total;
      } else {
        spendingMap[fishName] = total;
      }
    });

    return spendingMap;
  }, [filteredPurchases]);

  // Calculate purchases by month
  const purchasesByMonth = useMemo(() => {
    const monthlyData: Record<string, number> = {};

    filteredPurchases.forEach(purchase => {
      const date = parseISO(purchase.date);
      const monthKey = format(date, 'MMM/yyyy');

      if (monthlyData[monthKey]) {
        monthlyData[monthKey] += purchase.totalPrice;
      } else {
        monthlyData[monthKey] = purchase.totalPrice;
      }
    });

    return monthlyData;
  }, [filteredPurchases]);

  const updatePurchase = async (purchaseId: string, purchaseData: Partial<Omit<FishPurchase, "id">>) => {
    if (!user || !user.id) {
      toast.error("You must be logged in to update purchases");
      return;
    }
    try {
      // Ensure purchaseData matches what purchaseService.updatePurchase expects.
      // The service expects Partial<Omit<FishPurchase, "id" | "user_id" | "created_at" | "deleted_at">>
      // We remove properties that shouldn't be sent or are handled by the service.
      const { toasterId, ...updateDataForService } = purchaseData;

      const updatedPurchase = await purchaseService.updatePurchase(purchaseId, user.id, updateDataForService);
      setPurchases(prevPurchases => prevPurchases.map(p => p.id === purchaseId ? updatedPurchase : p).sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
      // Also update deletedPurchases if the item was there (e.g. if payment status was updated on a deleted item, which is unlikely but possible)
      setDeletedPurchases(prevDeleted => prevDeleted.map(p => p.id === purchaseId ? updatedPurchase : p));
      setLastUpdated(new Date());
      toast.success("Purchase updated successfully!");
    } catch (error) {
      console.error('AppContext: Error updating purchase via service', error);
    }
  };

  const recoverPurchase = async (id: string): Promise<void> => {
    if (!user || !user.id) {
      toast.error("User not logged in.");
      return;
    }
    try {
      const recoveredItem = await purchaseService.recoverPurchase(id, user.id);
      setDeletedPurchases(prev => prev.filter(p => p.id !== id));
      setPurchases(prevPurchases => [...prevPurchases, recoveredItem].sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
      setLastUpdated(new Date());
      toast.success(`Purchase ${id.substring(0,6)}... recovered.`);
    } catch (error) {
      console.error('AppContext: Error recovering purchase via service', error);
    }
  };

  // Set currency in context and update Supabase
  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    if (user && user.id) {
      await supabase.from('users').update({ currency: newCurrency }).eq('id', user.id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        companyName,
        setCompanyName,
        tableStyle,
        setTableStyle,
        purchases,
        filteredPurchases,
        deletedPurchases,
        isLoading,
        timeFrame,
        setTimeFrame,
        dateRange,
        setDateRange,
        addPurchase,
        addMultiplePurchases,
        updatePurchasePaymentStatus,
        deletePurchase,
        deletePurchaseGroup,
        updatePurchase,
        recoverPurchase,
        recoverPurchaseGroup,
        login,
        signup,
        logout,
        updateProfile,
        isRealTimeEnabled,
        toggleRealTime,
        lastUpdated,
        refreshData,
        spendingByFishType,
        purchasesByMonth,
        currency,
        setCurrency
      }}
    >
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
