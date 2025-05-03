
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Ship, Globe, Navigation, Map, Calendar, Anchor, Package, CircleAlert } from "lucide-react";

interface ShipDetails {
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

export default function TrackerPage() {
  const [trackingId, setTrackingId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [shipDetails, setShipDetails] = useState<ShipDetails | null>(null);

  // Mock shipping lines data
  const shippingLines = [
    {
      name: "Maersk Line",
      routes: ["Myanmar to Singapore to Saudi Arabia", "China to UAE to Egypt"],
      vessels: ["MSC VIVIANA", "MAERSK HONAM", "EVER GIVEN"]
    },
    {
      name: "MSC",
      routes: ["Thailand to Malaysia to Saudi Arabia", "Vietnam to Singapore to Saudi Arabia"],
      vessels: ["MSC GULSUN", "MSC OSCAR", "MSC ZOE"]
    },
    {
      name: "CMA CGM",
      routes: ["Myanmar to India to Saudi Arabia", "Myanmar to Singapore to Qatar"],
      vessels: ["CMA CGM ANTOINE DE SAINT EXUPERY", "CMA CGM BOUGAINVILLE"]
    }
  ];

  const handleSearch = () => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID or IMO number");
      return;
    }

    setIsSearching(true);
    toast.loading("Searching vessel information...");

    // Simulate API call delay
    setTimeout(() => {
      // Mock data based on tracking ID
      const mockShipData: ShipDetails = {
        name: `Cargo Ship ${trackingId.substring(0, 4)}`,
        status: "In Transit",
        location: "Pacific Ocean, 34.0522° N, 118.2437° W",
        eta: "May 15, 2025",
        route: "Myanmar to Singapore to Saudi Arabia",
        line: "Maersk Line",
        originPort: "Yangon Port, Myanmar",
        destinationPort: "Jeddah Islamic Port, Saudi Arabia",
        vessel: "MSC VIVIANA",
        loadDate: "April 18, 2025",
        imo: trackingId.startsWith("IMO") ? trackingId : `IMO ${Math.floor(Math.random() * 1000000) + 9000000}`
      };

      setShipDetails(mockShipData);
      setIsSearching(false);
      toast.dismiss();
      toast.success("Vessel information found");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ship Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your shipments across major shipping routes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Ship className="h-5 w-5 mr-2" />
              Track Shipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter tracking ID or IMO number"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !trackingId.trim()}
                className="w-full md:w-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                Track Shipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="animate-pulse text-center">
            <Ship className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p>Searching for vessel information...</p>
          </div>
        </div>
      )}

      {shipDetails && !isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Ship className="h-5 w-5 mr-2" />
                {shipDetails.vessel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-y-2">
                  <p className="flex items-center text-muted-foreground">
                    <CircleAlert className="h-4 w-4 mr-2" />
                    Status:
                  </p>
                  <p className="font-medium">{shipDetails.status}</p>
                  
                  <p className="flex items-center text-muted-foreground">
                    <Anchor className="h-4 w-4 mr-2" />
                    Line:
                  </p>
                  <p className="font-medium">{shipDetails.line}</p>
                  
                  <p className="flex items-center text-muted-foreground">
                    <Package className="h-4 w-4 mr-2" />
                    IMO Number:
                  </p>
                  <p className="font-medium">{shipDetails.imo}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2" /> 
                    Shipping Route
                  </h3>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {shipDetails.route}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Map className="h-5 w-5 mr-2" />
                Journey Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Navigation className="h-4 w-4 mr-2" /> Origin
                    </p>
                    <p className="font-medium">{shipDetails.originPort}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Navigation className="h-4 w-4 mr-2" /> Destination
                    </p>
                    <p className="font-medium">{shipDetails.destinationPort}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Package className="h-4 w-4 mr-2" /> Load Date
                      </p>
                      <p className="font-medium">{shipDetails.loadDate}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> ETA
                      </p>
                      <p className="font-medium">{shipDetails.eta}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Map className="h-4 w-4 mr-2" /> Current Location
                    </p>
                    <p className="font-medium">{shipDetails.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 mt-8">Major Shipping Lines</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shippingLines.map((line, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{line.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Routes
                  </h3>
                  <ul className="mt-1 text-sm space-y-1">
                    {line.routes.map((route, idx) => (
                      <li key={idx} className="text-muted-foreground">{route}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm flex items-center">
                    <Ship className="h-4 w-4 mr-2" />
                    Vessels
                  </h3>
                  <ul className="mt-1 text-sm space-y-1">
                    {line.vessels.map((vessel, idx) => (
                      <li key={idx} className="text-muted-foreground">{vessel}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
