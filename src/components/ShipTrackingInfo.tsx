
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Anchor, Map, Calendar, CircleAlert, Search, Globe, Navigation, Package } from "lucide-react";
import { toast } from "sonner";

interface ShipStatus {
  name: string;
  status: string;
  location: string;
  eta: string;
  route: string;
  line: string;
  originPort: string;
  destinationPort: string;
  vessel: string;
  loadDate: string;
}

export function ShipTrackingInfo() {
  const [shipTrackingId, setShipTrackingId] = useState("");
  const [shipStatus, setShipStatus] = useState<ShipStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const handleTrackShip = () => {
    if (!shipTrackingId.trim()) return;
    
    setIsTracking(true);
    toast.loading("Tracking shipment...");
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      const mockShipData = {
        name: `Cargo Ship ${shipTrackingId}`,
        status: "In Transit",
        location: "Pacific Ocean, 34.0522° N, 118.2437° W",
        eta: "May 10, 2025",
        route: "Myanmar to Singapore to Saudi", 
        line: "Maersk Line",
        originPort: "Yangon Port, Myanmar",
        destinationPort: "Jeddah Islamic Port, Saudi Arabia",
        vessel: "MSC VIVIANA",
        loadDate: "April 15, 2025"
      };
      
      setShipStatus(mockShipData);
      setIsTracking(false);
      toast.dismiss();
      toast.success(`Tracking information found for ${shipTrackingId}`);
    }, 1500);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm font-medium">
          <Ship className="h-4 w-4 mr-2" />
          Ship Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="flex items-center gap-2">
          <Input 
            value={shipTrackingId}
            onChange={(e) => setShipTrackingId(e.target.value)}
            placeholder="Enter ship/container ID"
            className="h-8 text-xs"
          />
          <Button 
            onClick={handleTrackShip} 
            disabled={isTracking || !shipTrackingId.trim()}
            className="h-8 px-2 text-xs"
          >
            <Search className="h-3 w-3 mr-1" />
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
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <p className="flex items-center text-muted-foreground">
                <CircleAlert className="h-3 w-3 mr-1" />
                Status:
              </p>
              <p className="font-medium">{shipStatus.status}</p>
              
              <p className="flex items-center text-muted-foreground">
                <Ship className="h-3 w-3 mr-1" />
                Vessel:
              </p>
              <p className="font-medium">{shipStatus.vessel}</p>
              
              <p className="flex items-center text-muted-foreground">
                <Anchor className="h-3 w-3 mr-1" />
                Line:
              </p>
              <p className="font-medium">{shipStatus.line}</p>
              
              <p className="flex items-center text-muted-foreground">
                <Globe className="h-3 w-3 mr-1" />
                Route:
              </p>
              <p className="font-medium truncate max-w-[120px]" title={shipStatus.route}>{shipStatus.route}</p>
            </div>
            
            <div className="mt-2 pt-1 border-t">
              <p className="font-medium mb-1">Journey Details</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <p className="flex items-center text-muted-foreground">
                  <Navigation className="h-3 w-3 mr-1" />
                  Origin:
                </p>
                <p className="font-medium truncate max-w-[120px]" title={shipStatus.originPort}>{shipStatus.originPort}</p>
                
                <p className="flex items-center text-muted-foreground">
                  <Map className="h-3 w-3 mr-1" />
                  Destination:
                </p>
                <p className="font-medium truncate max-w-[120px]" title={shipStatus.destinationPort}>{shipStatus.destinationPort}</p>
                
                <p className="flex items-center text-muted-foreground">
                  <Package className="h-3 w-3 mr-1" />
                  Load Date:
                </p>
                <p className="font-medium">{shipStatus.loadDate}</p>
                
                <p className="flex items-center text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  ETA:
                </p>
                <p className="font-medium">{shipStatus.eta}</p>
                
                <p className="flex items-center text-muted-foreground">
                  <Map className="h-3 w-3 mr-1" />
                  Current:
                </p>
                <p className="font-medium truncate max-w-[120px]" title={shipStatus.location}>{shipStatus.location}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
