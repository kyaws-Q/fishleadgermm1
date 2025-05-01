
import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useApp } from "@/contexts/AppContext";
import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Menu, Ship } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [shipTrackingId, setShipTrackingId] = useState("");
  const [shipStatus, setShipStatus] = useState<null | {
    name: string;
    status: string;
    location: string;
    eta: string;
  }>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // If still loading, don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  // If not logged in, redirect to home page
  if (!user) {
    return <Navigate to="/" />;
  }

  // Handle ship tracking
  const handleTrackShip = () => {
    if (!shipTrackingId.trim()) return;
    
    setIsTracking(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      const mockShipData = {
        name: `Cargo Ship ${shipTrackingId}`,
        status: "In Transit",
        location: "Pacific Ocean, 34.0522° N, 118.2437° W",
        eta: "May 10, 2025"
      };
      
      setShipStatus(mockShipData);
      setIsTracking(false);
    }, 1500);
  };
  
  return (
    <div className="flex min-h-screen bg-[#f8f9fd]">
      {/* Mobile sidebar toggle */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen || isDesktop ? 'block' : 'hidden'} w-64 shrink-0`}>
        <Sidebar />
        
        {/* Ship Tracking Widget */}
        <div className="p-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Ship className="h-4 w-4 mr-2" />
                Container Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center gap-2">
                <Input 
                  value={shipTrackingId}
                  onChange={(e) => setShipTrackingId(e.target.value)}
                  placeholder="Enter ship/container ID"
                  size={6}
                  className="h-8 text-xs"
                />
                <Button 
                  onClick={handleTrackShip} 
                  disabled={isTracking || !shipTrackingId.trim()}
                  className="h-8 px-2 text-xs"
                >
                  Track
                </Button>
              </div>
              
              {isTracking && (
                <div className="text-xs text-center py-2 animate-pulse">
                  Tracking...
                </div>
              )}
              
              {shipStatus && !isTracking && (
                <div className="text-xs space-y-1 border-t pt-2 mt-2">
                  <p className="font-medium">{shipStatus.name}</p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{shipStatus.status}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium truncate max-w-[120px]" title={shipStatus.location}>
                      {shipStatus.location}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">ETA:</span>
                    <span className="font-medium">{shipStatus.eta}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 pt-4">
        {children}
      </main>
    </div>
  );
}
