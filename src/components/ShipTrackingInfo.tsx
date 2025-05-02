
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship } from "lucide-react";

interface ShipStatus {
  name: string;
  status: string;
  location: string;
  eta: string;
  route: string;
  line: string;
}

export function ShipTrackingInfo() {
  const [shipTrackingId, setShipTrackingId] = useState("");
  const [shipStatus, setShipStatus] = useState<ShipStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
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
        eta: "May 10, 2025",
        route: "Myanmar to Singapore to Saudi", 
        line: "Maersk Line"
      };
      
      setShipStatus(mockShipData);
      setIsTracking(false);
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
              <span className="text-muted-foreground">Route:</span>
              <span className="font-medium truncate max-w-[120px]">{shipStatus.route}</span>
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
            <p className="flex justify-between">
              <span className="text-muted-foreground">Line:</span>
              <span className="font-medium">{shipStatus.line}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
