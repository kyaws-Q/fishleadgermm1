import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { AppTheme, FishPurchase, TableStyle, AppContextProps, TimeFrame, DateRange, ChartDataPoint, PurchaseGroup } from "@/types";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format, parseISO, isWithinInterval, subDays, subMonths } from "date-fns";
import { purchaseService } from "@/services/purchaseService";
import { useNavigate } from 'react-router-dom';

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Sample purchase data for offline mode
const samplePurchases = [
  {
    id: 'sample-1',
    fishName: 'Salmon',
    sizeKg: 5,
    quantity: 10,
    pricePerUnit: 20,
    total: 200,
    totalPrice: 200,
    companyName: 'Ocean Fresh',
    buyerName: 'John Doe',
    date: new Date().toISOString(),
    purchaseDate: new Date().toISOString(),
    paymentStatus: 'paid' as const,
    userId: 'demo-user-id',
    notes: 'Fresh catch from Norway',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'sample-2',
    fishName: 'Tuna',
    sizeKg: 8,
    quantity: 5,
    pricePerUnit: 30,
    total: 150,
    totalPrice: 150,
    companyName: 'Sea Delights',
    buyerName: 'Jane Smith',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    purchaseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentStatus: 'pending' as const,
    userId: 'demo-user-id',
    notes: 'Premium quality',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'sample-3',
    fishName: 'Cod',
    sizeKg: 3,
    quantity: 15,
    pricePerUnit: 15,
    total: 225,
    totalPrice: 225,
    companyName: 'Ocean Fresh',
    buyerName: 'John Doe',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    purchaseDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    paymentStatus: 'unpaid' as const,
    userId: 'demo-user-id',
    notes: 'From Atlantic waters',
    lastUpdated: new Date().toISOString()
  }
];

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
    if (!user || !user.id) {
      console.log('fetchUserCurrency: No user logged in');
      return;
    }
    
    try {
      console.log('Fetching currency for user:', user.id);
      
      // First check if the users table and currency column exist
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
        
      if (tableError) {
        console.warn('Users table check error:', tableError.message);
        // Table might not exist, create it
        await createUserTableIfNeeded();
      }
      
      // Now try to get the currency
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
      
      console.log('Currency fetch result:', data);
      
      // Check if we got any results and use the first one
      if (data && data.length > 0 && data[0].currency) {
        setCurrencyState(data[0].currency);
        console.log('Set currency to:', data[0].currency);
      } else {
        // No currency set for this user, create a default entry
        await setDefaultUserCurrency();
      }
    } catch (err) {
      console.error('Exception in fetchUserCurrency:', err);
      // Ignore error, fallback to default
    }
  };
  
  // Helper function to create the users table if it doesn't exist
  const createUserTableIfNeeded = async () => {
    try {
      // This is a simplified approach - in a real app, you'd use migrations
      // Check if we can insert a row with the current user
      if (user && user.id) {
        const { error } = await supabase
          .from('users')
          .upsert({ id: user.id, currency: 'USD' })
          .select();
          
        if (error) {
          console.error('Error creating user entry:', error);
        } else {
          console.log('Created default user entry');
          setCurrencyState('USD');
        }
      }
    } catch (err) {
      console.error('Error in createUserTableIfNeeded:', err);
    }
  };
  
  // Set a default currency for the user
  const setDefaultUserCurrency = async () => {
    try {
      if (user && user.id) {
        const { error } = await supabase
          .from('users')
          .upsert({ id: user.id, currency: 'USD' })
          .select();
          
        if (error) {
          console.error('Error setting default currency:', error);
        } else {
          console.log('Set default currency to USD');
          setCurrencyState('USD');
        }
      }
    } catch (err) {
      console.error('Error in setDefaultUserCurrency:', err);
    }
  };

  // Initialize auth and check connection
  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | undefined;
    
    const initializeAuth = async () => {
      try {
        // First check if Supabase is accessible
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error('Supabase connection failed - check network or credentials');
          toast.error('Database connection failed. Check your internet connection.');
          setIsLoading(false);
          return;
        }
        
        console.log('Supabase connection successful, proceeding with auth');
        
        // Set up auth state listener
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
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
        
        // Store subscription for cleanup
        authSubscription = data.subscription;
        
        // Check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData?.session, sessionError);
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          toast.error('Authentication error. Please try logging in again.');
          setIsLoading(false);
          return;
        }
        
        if (sessionData?.session) {
          setUser({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || '',
            name: sessionData.session.user.user_metadata?.name || sessionData.session.user.user_metadata?.full_name,
            profileUrl: sessionData.session.user.user_metadata?.avatar_url || sessionData.session.user.user_metadata?.picture
          });
          
          // Force fetch data on mount
          setTimeout(() => {
            if (sessionData.session?.user.id) {
              console.log("Force fetching data for user:", sessionData.session.user.id);
              fetchUserPurchases();
              fetchDeletedPurchases();
              fetchUserCurrency();
            }
          }, 1000);
        } else {
          // No session found
          console.log('No active session found');
        }
        
        setIsLoading(false);
        
      } catch (err) {
        console.error('Auth initialization error:', err);
        toast.error('Authentication error. Please try logging in again.');
        setIsLoading(false);
      }
    };
    
    // Start the auth initialization process
    initializeAuth();
    
    // Cleanup function
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
      // First check connection to Supabase
      console.log('Checking Supabase connection before login...');
      const isConnected = await checkSupabaseConnection();
      console.log('Connection check result:', isConnected);
      if (!isConnected) {
        toast.error('Database connection failed. Check your internet connection.');
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting login with email:', email);
      try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful, session:', data?.session);
      
      // Force a refresh of user data
      if (data?.session) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name,
          profileUrl: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture
        });
        
        // Immediately fetch user data
        setTimeout(() => {
          fetchUserPurchases();
          fetchDeletedPurchases();
          fetchUserCurrency();
        }, 500);
        }
      } catch (loginErr) {
        // Check if this is a network error
        console.error('Login fetch error:', loginErr);
        
        if (loginErr instanceof Error && 
            (loginErr.message.includes('Failed to fetch') || 
             loginErr.message.includes('Network Error') ||
             loginErr.message.includes('ERR_NAME_NOT_RESOLVED') ||
             loginErr.toString().includes('TypeError'))) {
          
          console.log('Network error during login - activating demo mode');
          toast.info('Network connection error. Using demo mode.', {
            duration: 5000,
            description: 'You can still explore the app with sample data.'
          });
          
          // Set a demo user for offline testing
          setUser({
            id: 'demo-user-id',
            email: email || 'demo@example.com',
            name: 'Demo User',
            profileUrl: null
          });
          
          // Load sample data
          setPurchases(samplePurchases);
          setDeletedPurchases([]);
          setCurrencyState('USD');
          setLastUpdated(new Date());
          setIsLoading(false);
          return;
        }
        
        // If it's another type of error, rethrow it
        throw loginErr;
      }

    } catch (error) {
      console.error('Login exception:', error);
      toast.error(error instanceof Error ? error.message : "Login failed. Please check your internet connection.");
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
