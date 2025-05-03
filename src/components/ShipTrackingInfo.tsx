
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Anchor, Map, Calendar, CircleAlert, Globe, Navigation, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
  imo?: string;
}

export function ShipTrackingInfo() {
  const [shipStatus, setShipStatus] = useState<ShipStatus | null>({
    name: "MSC VIVIANA",
    status: "In Transit",
    location: "Pacific Ocean",
    eta: "May 10, 2025",
    route: "Myanmar to Singapore to Saudi", 
    line: "Maersk Line",
    originPort: "Yangon Port, Myanmar",
    destinationPort: "Jeddah Islamic Port, Saudi Arabia",
    vessel: "MSC VIVIANA",
    loadDate: "April 15, 2025",
    imo: "IMO9831669"
  });
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm font-medium">
          <Ship className="h-4 w-4 mr-2" />
          Latest Shipment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {shipStatus && (
          <div className="text-xs space-y-1">
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
                  <Calendar className="h-3 w-3 mr-1" />
                  ETA:
                </p>
                <p className="font-medium">{shipStatus.eta}</p>
              </div>
            </div>

            <div className="text-center mt-3">
              <Link to="/tracker">
                <div className="text-xs text-primary hover:underline cursor-pointer">
                  View detailed tracking
                </div>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
