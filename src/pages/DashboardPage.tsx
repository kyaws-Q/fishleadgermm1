import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SummaryCards } from "@/components/SummaryCards";
import { SummaryCardsSkeleton } from "@/components/SummaryCardsSkeleton";
import { SpendingChart } from "@/components/SpendingChart";
import { PurchaseForm } from "@/components/PurchaseForm";
import { PaymentStatusSummary } from "@/components/PaymentStatusSummary";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useApp } from "@/contexts/AppContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, WifiOff, RefreshCcw, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<"area" | "bar" | "pie">("area");
  const [chartPeriod, setChartPeriod] = useState<string>("6month");

  const {
    purchases,
    filteredPurchases,
    timeFrame,
    setTimeFrame,
    dateRange,
    setDateRange,
    isRealTimeEnabled,
    toggleRealTime,
    lastUpdated,
    isLoading,
    refreshData
  } = useApp();

  const { isConnected } = useWebSocket();

  // Calculate some additional metrics
  const totalPurchases = filteredPurchases.length;
  const totalSpent = filteredPurchases.reduce((sum, p) => sum + p.totalPrice, 0);
  const paidAmount = filteredPurchases.filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.totalPrice, 0);
  const paymentProgress = totalSpent > 0 ? (paidAmount / totalSpent) * 100 : 0;

  // Get recent activity
  const recentActivity = useMemo(() => {
    return [...filteredPurchases]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);
  }, [filteredPurchases]);

  // Skeleton for Chart
  const ChartSkeleton = () => (
    <Card className="col-span-2 shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="pl-2 pr-0 sm:pr-2">
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
  
  // Skeleton for Payment Status
  const PaymentStatusSkeleton = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced real-time data state
  const [lastDataReceived, setLastDataReceived] = useState<Date | null>(null);
  const [dataStreamingStats, setDataStreamingStats] = useState({
    messagesReceived: 0,
    bytesReceived: 0,
    connectedSince: null as Date | null,
    connectionStatus: 'disconnected' as 'connecting' | 'connected' | 'disconnected' | 'error',
    lastError: null as string | null
  });

  // Simulate data streaming
  const [dataSimulationInterval, setDataSimulationInterval] = useState<NodeJS.Timeout | null>(null);

  const startDataSimulation = useCallback(() => {
    // Clear any existing interval
    if (dataSimulationInterval) {
      clearInterval(dataSimulationInterval);
    }
    
    // Create new interval for data simulation
    const interval = setInterval(() => {
      const bytesReceived = Math.floor(Math.random() * 100) + 50; // 50-150 bytes
      
      setDataStreamingStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
        bytesReceived: prev.bytesReceived + bytesReceived
      }));
      
      setLastDataReceived(new Date());
      
      // Occasionally simulate a purchase update
      if (Math.random() > 0.7) {
        refreshData(); // Refresh data to simulate new data arriving
      }
    }, 3000); // Every 3 seconds
    
    setDataSimulationInterval(interval);
  }, [refreshData, dataSimulationInterval]); // Added dataSimulationInterval

  const stopDataSimulation = useCallback(() => {
    if (dataSimulationInterval) {
      clearInterval(dataSimulationInterval);
      setDataSimulationInterval(null);
    }
  }, [dataSimulationInterval]); // Dependency was already correct

  // Enhance the real-time connection toggle
  const toggleRealTimeEnhanced = useCallback(() => {
    if (!isRealTimeEnabled) {
      // Start connection
      setDataStreamingStats(prev => ({
        ...prev,
        connectionStatus: 'connecting'
      }));
      
      // Simulate connection process
      setTimeout(() => {
        const now = new Date();
        setDataStreamingStats(prev => ({
          ...prev,
          connectionStatus: 'connected',
          connectedSince: now,
        }));
        toggleRealTime(); // Call the original toggle function
        
        // Start the simulated data streaming
        startDataSimulation();
      }, 1500);
    } else {
      // Stop connection
      setDataStreamingStats(prev => ({
        ...prev,
        connectionStatus: 'disconnected',
        connectedSince: null
      }));
      toggleRealTime(); // Call the original toggle function
      
      // Stop the simulated data streaming
      stopDataSimulation();
    }
  }, [isRealTimeEnabled, toggleRealTime, startDataSimulation, stopDataSimulation]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (dataSimulationInterval) {
        clearInterval(dataSimulationInterval);
      }
    };
  }, [dataSimulationInterval]);
  
  // Format connection duration
  const getConnectionDuration = useCallback(() => {
    if (!dataStreamingStats.connectedSince) return 'Not connected';
    
    const now = new Date();
    const diff = now.getTime() - dataStreamingStats.connectedSince.getTime();
    
    // Convert to minutes and seconds
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }, [dataStreamingStats.connectedSince]);

  return (
    <div className="pb-4 animate-in fade-in duration-500 bg-[#f6f7f9] min-h-screen font-sans">
      {/* Header with welcome message and animated wave */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <DashboardHeader 
          onNewPurchaseClick={() => setIsAddPurchaseOpen(true)}
          onRefreshDataClick={refreshData}
          isDataLoading={isLoading}
          userName={useApp().user?.name}
          lastUpdated={lastUpdated}
        />
        {/* Modern, clean dashboard title and actions (smoky background, only one instance) */}
        <div className="bg-white px-2 sm:px-4 md:px-6 py-4 border border-gray-100 rounded-2xl shadow-xl mx-auto max-w-6xl mt-[1px] flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans leading-tight">Dashboard</h1>
              <p className="mt-0.5 text-gray-500 text-base font-sans">Track and manage your fish purchases</p>
            </div>
            <div className="flex gap-2 items-center mt-2 sm:mt-0">
              <Button
                onClick={() => setIsAddPurchaseOpen(true)}
                variant="default"
                size="lg"
                className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 shadow-xl text-base font-sans"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                New Purchase
              </Button>
                  <Button
                onClick={refreshData}
                    variant="outline"
                size="lg"
                disabled={isLoading}
                className="rounded-full border-gray-300 text-gray-700 bg-white hover:bg-gray-100 font-semibold px-6 py-2 shadow-xl text-base font-sans"
              >
                <RefreshCcw className={`mr-1.5 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
                      </Button>
            </div>
          </div>
          {/* Time range selector below title/subtitle, less margin */}
          <div className="mt-2">
            <TimeRangeSelector />
          </div>
        </div>
      </motion.div>

      {/* Summary Cards - unified card design and alignment */}
      <div className="pt-3 pb-0 mx-auto max-w-6xl w-full px-2 sm:px-4 md:px-6">
        {isLoading ? (
          <SummaryCardsSkeleton />
        ) : (
            <SummaryCards />
        )}
      </div>

      {/* Main Dashboard Content: Chart and Payment Status - unified card design and alignment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 max-w-6xl mx-auto mt-3 w-full px-2 sm:px-4 md:px-6">
        {/* Left Side: Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="col-span-1 md:col-span-2 mb-2 md:mb-0">
            {filteredPurchases.length > 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-xl px-2 sm:px-4 md:px-6 py-4 h-full">
              <SpendingChart 
                title="Spending Overview"
                description="Fish purchases by type and trends over time"
                showControls={true}
              />
              </div>
            ) : (
              <Card className="col-span-2 shadow-xl rounded-2xl bg-white border border-gray-100 px-2 sm:px-4 md:px-6 py-4">
                <CardHeader>
                  <CardTitle>Spending Overview</CardTitle>
                  <CardDescription>No purchase data available</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[250px]">
                  <p className="text-muted-foreground text-center mb-4">
                    No purchase data found. Try adding some purchases or refreshing the data.
                  </p>
                  <Button 
                    onClick={refreshData} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {/* Right Side: Payment Status Cards */}
        <div className="col-span-1 mb-2 md:mb-0">
          {isLoading ? (
            <PaymentStatusSkeleton /> 
          ) : (
            <div className="rounded-2xl shadow-xl bg-white border border-gray-100 px-2 sm:px-4 md:px-6 py-4 h-full">
            <PaymentStatusSummary />
            </div>
          )}
        </div>
      </div>
      {/* AddPurchaseForm Dialog - conditionally rendered, not part of skeleton loading generally */}
      {isAddPurchaseOpen && (
        <PurchaseForm
          isOpen={isAddPurchaseOpen}
          onClose={() => setIsAddPurchaseOpen(false)}
        />
      )}
    </div>
  );
}
