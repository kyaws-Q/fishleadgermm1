import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ship, Search, Loader, CircleAlert, Navigation } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { toast } from "sonner";
import { PREDEFINED_ROUTES } from '@/data/routes';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useApp } from "@/contexts/AppContext";
import Map from "@/components/Map";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from '@/hooks/use-theme';

interface VesselPosition {
  mmsi: string;
  imo: string;
  ship_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  status: string;
  timestamp: string;
  dsrc: string;
  eta: string;
}

interface Container {
  number: string;
  status: string;
  location: string;
  temperature: number;
  lastUpdate: string;
}

interface JourneyProgress {
  departurePort: string;
  destinationPort: string;
  departureDate: string;
  estimatedArrival: string;
  distanceTraveled: number;
  totalDistance: number;
  percentComplete: number;
  daysAtSea: number;
  daysToDestination: number;
}

interface RouteData {
  name: string;
  description: string;
  waypoints: Array<{
    name: string;
    lat: number;
    lng: number;
    timestamp: string;
  }>;
}

interface TrackingInfo {
  vessel: VesselPosition;
  container: Container;
  events: TrackingEvent[];
  route: RouteData;
  journeyProgress: JourneyProgress;
}

interface TrackingEvent {
  timestamp: string;
  location: string;
  event: string;
  details: string;
}

export default function TrackerPage() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  // We'll use this state to track if the sidebar is open from DashboardLayout
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // This effect detects when the sidebar is opened/closed by checking for DOM changes
  useEffect(() => {
    // Function to check if sidebar is visible
    const checkSidebarVisibility = () => {
      // Look for the sidebar element that has both z-50 and fixed classes
      const sidebarEl = document.querySelector('div.z-50.fixed');
      setIsMenuOpen(!!sidebarEl && window.getComputedStyle(sidebarEl).transform !== 'matrix(1, 0, 0, 1, -100, 0)');
    };
    
    // Set up a mutation observer to detect changes to the DOM
    const observer = new MutationObserver(checkSidebarVisibility);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    
    // Initial check
    checkSidebarVisibility();
    
    return () => observer.disconnect();
  }, []);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeVessels, setActiveVessels] = useState<VesselPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate active vessels on the route (in production, this would come from the API)
    const mockVessels = [
      {
        mmsi: "123456789",
        imo: "9876543",
        ship_name: "FISH CARRIER 1",
        latitude: 10.7743,
        longitude: 98.5462,
        speed: 12,
        course: 165,
        status: "En Route to Singapore",
        timestamp: new Date().toISOString(),
        dsrc: "AIS",
        eta: "2024-05-15T14:00:00Z"
      },
      {
        mmsi: "987654321",
        imo: "1234567",
        ship_name: "SEAFOOD EXPRESS",
        latitude: 3.1390,
        longitude: 101.6869,
        speed: 15,
        course: 45,
        status: "En Route to Dubai",
        timestamp: new Date().toISOString(),
        dsrc: "AIS",
        eta: "2024-05-20T08:00:00Z"
      }
    ];
    setActiveVessels(mockVessels);
  }, []);

  const fetchTrackingInfo = async () => {
    setIsLoading(true);
    setError(null);
    setTrackingInfo(null); // Clear previous tracking info

    const query = searchQuery.trim();

    if (!query) {
      setError("Please enter a vessel name or IMO number.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      // In a real application, you would call the Maritime API here
      // For example: `https://maritime-ships-and-ports-database.p.rapidapi.com/api/v0/vessel_find?imo=${query}`
      
      // Mock response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Determine which route to use based on the query
      // For demo purposes, we'll use the IMO number to decide which route to show
      const routeKey = query.startsWith("9") ? "MYANMAR_TO_DUBAI" : "MYANMAR_TO_SINGAPORE";
      const selectedRoute = PREDEFINED_ROUTES[routeKey];
      
      // Calculate current position along the route
      const routeWaypoints = selectedRoute.waypoints;
      const departureDate = new Date(routeWaypoints[0].timestamp);
      const arrivalDate = new Date(routeWaypoints[routeWaypoints.length - 1].timestamp);
      const totalJourneyTime = arrivalDate.getTime() - departureDate.getTime();
      const elapsedTime = Date.now() - departureDate.getTime();
      const journeyProgress = Math.min(100, Math.max(0, (elapsedTime / totalJourneyTime) * 100));
      
      // Calculate the current position interpolation between waypoints
      let currentWaypointIndex = 0;
      for (let i = 0; i < routeWaypoints.length - 1; i++) {
        const wpTime = new Date(routeWaypoints[i].timestamp).getTime();
        const nextWpTime = new Date(routeWaypoints[i + 1].timestamp).getTime();
        
        if (Date.now() >= wpTime && Date.now() <= nextWpTime) {
          currentWaypointIndex = i;
          break;
        }
      }
      
      // Interpolate position between waypoints
      const currentWp = routeWaypoints[currentWaypointIndex];
      const nextWp = routeWaypoints[currentWaypointIndex + 1] || routeWaypoints[currentWaypointIndex];
      const wpTime = new Date(currentWp.timestamp).getTime();
      const nextWpTime = new Date(nextWp.timestamp).getTime();
      const segmentProgress = (Date.now() - wpTime) / (nextWpTime - wpTime);
      
      // Simple linear interpolation between points
      const latitude = currentWp.lat + (nextWp.lat - currentWp.lat) * Math.min(1, Math.max(0, segmentProgress));
      const longitude = currentWp.lng + (nextWp.lng - currentWp.lng) * Math.min(1, Math.max(0, segmentProgress));
      
      // Calculate total distance (simplified)
      const totalDistance = 1200; // nautical miles (simplified example)
      const distanceTraveled = totalDistance * (journeyProgress / 100);
      
      const mockVesselData: VesselPosition = {
        mmsi: query.startsWith("9") ? query : "352002000",
        imo: query.startsWith("9") ? query : "9780783",
        ship_name: query.toUpperCase(),
        latitude: latitude,
        longitude: longitude,
        speed: 15,
        course: 180,
        status: journeyProgress < 100 ? "En Route" : "Arrived",
        timestamp: new Date().toISOString(),
        dsrc: "AIS",
        eta: arrivalDate.toISOString(),
      };

      // Create more detailed events based on the route
      const events: TrackingEvent[] = [];
      
      // Add past waypoints as events
      for (let i = 0; i < routeWaypoints.length; i++) {
        const wp = routeWaypoints[i];
        const wpTime = new Date(wp.timestamp);
        
        if (wpTime.getTime() < Date.now()) {
          events.push({
            timestamp: wp.timestamp,
            location: wp.name,
            event: i === 0 ? "Departed" : "Passed Waypoint",
            details: i === 0 ? "Vessel departed with cargo" : `Vessel passed through ${wp.name}`
          });
        }
      }
      
      // Add container loading event
      events.push({
        timestamp: new Date(departureDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: routeWaypoints[0].name,
        event: "Container Loaded",
        details: "Container loaded onto vessel and sealed. Temperature set to -18°C for fish preservation."
      });
      
      // Add temperature check event
      events.push({
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        location: "At Sea",
        event: "Temperature Check",
        details: "Refrigeration system functioning normally. Product temperature stable at -18°C."
      });
      
      // Sort events by timestamp (newest first)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const mockTrackingInfo: TrackingInfo = {
        vessel: mockVesselData,
        container: {
          number: "FSCU1234567",
          status: "Onboard Vessel",
          location: mockVesselData.ship_name,
          temperature: -18,
          lastUpdate: new Date().toISOString(),
        },
        events: events,
        route: selectedRoute,
        journeyProgress: {
          departurePort: routeWaypoints[0].name,
          destinationPort: routeWaypoints[routeWaypoints.length - 1].name,
          departureDate: departureDate.toISOString(),
          estimatedArrival: arrivalDate.toISOString(),
          distanceTraveled: Math.round(distanceTraveled),
          totalDistance: totalDistance,
          percentComplete: Math.round(journeyProgress),
          daysAtSea: Math.max(0, differenceInDays(new Date(), departureDate)),
          daysToDestination: Math.max(0, differenceInDays(arrivalDate, new Date()))
        }
      };

      setTrackingInfo(mockTrackingInfo);
      toast.success(`Tracking info loaded for ${mockVesselData.ship_name}`);

    } catch (err) {
      console.error("Error fetching tracking info:", err);
      setError("Failed to fetch tracking info. Please check the vessel details or API key.");
      toast.error("Failed to fetch tracking info.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-ocean-900 text-slate-50">
      {/* Page Header - Hidden on mobile when sidebar is open */}
      <header className={`bg-ocean-900 text-white py-4 sticky top-0 shadow-md transition-all duration-300 ${isMenuOpen ? 'md:block hidden' : 'block'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="h-8 w-8 text-ocean-400" />
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-ocean-400 to-teal-300">
              Cargo Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {}} 
              className="md:hidden text-ocean-500 hover:text-ocean-600 hover:bg-ocean-100/50 invisible"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6 space-y-6 flex-grow">
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded flex items-center gap-2 mb-4">
            <CircleAlert className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {/* Search Card */}
        <Card className="bg-slate-800/60 border-slate-700 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
              <Search className="w-6 h-6" />
              Track Your Shipment
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter vessel name or IMO number to get live tracking information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="flex-1 flex gap-2 w-full">
                <Input
                  type="text"
                  placeholder={"Enter Vessel Name or IMO Number"}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setError(null);
                  }}
                  className="flex-1 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:ring-ocean-500 focus:border-ocean-500"
                />
                <Button
                  onClick={fetchTrackingInfo} 
                  disabled={isLoading || !searchQuery.trim()}
                  className="bg-ocean-600 hover:bg-ocean-700 text-white focus:ring-ocean-500 shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
            <CardContent className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-12 h-12 animate-spin text-ocean-400" />
                <p className="text-slate-400">Fetching tracking information...</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Placeholder before search */}
        {!isLoading && !trackingInfo && !searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ship className="w-16 h-16 text-ocean-400 mb-4" />
            <h2 className="text-2xl font-semibold text-ocean-200 mb-2">Track Your Shipment</h2>
            <p className="text-slate-400 max-w-md mb-2">
              Enter a vessel name or IMO number above to get live tracking information for your fish cargo shipment.
            </p>
            <p className="text-slate-500 text-sm">Tip: You can search by vessel name, IMO, or destination port.</p>
          </div>
        )}
        
        {/* Active Vessels Table (only shown after search) */}
        {!isLoading && trackingInfo && (
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
                <Ship className="w-6 h-6" />
                Active Vessels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vessel Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVessels.map((vessel) => (
                    <TableRow key={vessel.mmsi}>
                      <TableCell className="font-medium">{vessel.ship_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{vessel.status}</Badge>
                      </TableCell>
                      <TableCell>{`${vessel.latitude.toFixed(4)}°, ${vessel.longitude.toFixed(4)}°`}</TableCell>
                      <TableCell>{vessel.speed} knots</TableCell>
                      <TableCell>{new Date(vessel.eta).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Tracking Information Display */}
        {!isLoading && trackingInfo && (
          <div className="space-y-6">
            {/* Journey Progress Card */}
            <Card className="bg-slate-800/60 border-slate-700 shadow-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
                  <Navigation className="w-6 h-6" />
                  Journey Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackingInfo.journeyProgress && (
                  <div className="space-y-6">
                    {/* Route Information */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-ocean-900/70 p-2 rounded-full">
                          <Navigation className="w-5 h-5 text-ocean-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Origin</p>
                          <p className="text-slate-100 font-medium">{trackingInfo.journeyProgress.departurePort}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {format(new Date(trackingInfo.journeyProgress.departureDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 px-4 hidden md:block">
                        <div className="relative">
                          <div className="h-1 bg-slate-700 rounded-full w-full">
                            <div 
                              className="h-1 bg-ocean-500 rounded-full" 
                              style={{ width: `${trackingInfo.journeyProgress.percentComplete}%` }}
                            />
                          </div>
                          <div 
                            className="absolute top-0 -mt-2"
                            style={{ left: `${trackingInfo.journeyProgress.percentComplete}%` }}
                          >
                            <div className="relative -ml-2.5">
                              <Ship className="w-5 h-5 text-ocean-300" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-ocean-900/70 p-2 rounded-full">
                          <Navigation className="w-5 h-5 text-ocean-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Destination</p>
                          <p className="text-slate-100 font-medium">{trackingInfo.journeyProgress.destinationPort}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {format(new Date(trackingInfo.journeyProgress.estimatedArrival), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}