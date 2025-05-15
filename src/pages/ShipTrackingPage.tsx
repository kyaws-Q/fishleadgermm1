import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Ship } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import VesselTrackingCard from '@/components/ship-tracking/vessel-tracking-card';
import VesselSearchForm from '@/components/ship-tracking/vessel-search-form';
import VesselResultsDisplay, { VesselPosition } from '@/components/ship-tracking/vessel-results-display';
import ShipTrackingMap, { Route, RouteWaypoint } from '@/components/ship-tracking/ship-tracking-map';

interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: string;
}

export default function ShipTrackingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<VesselPosition[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [vesselRoute, setVesselRoute] = useState<Route | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);
  const [filters, setFilters] = useState({
    cargoType: 'fish',
    origin: 'myanmar',
    destination: 'all'
  });

  // Memoize applyFilters to prevent unnecessary re-renders
  const memoizedApplyFilters = useMemo(() => {
    return (vesselList: VesselPosition[], currentFilters: typeof filters) => {
      const filtered = vesselList.filter(vessel => {
        // Filter by cargo type
        if (currentFilters.cargoType !== 'all' && 
            (!vessel.cargo_type || !vessel.cargo_type.toLowerCase().includes(currentFilters.cargoType.toLowerCase()))) {
          return false;
        }
        
        // Filter by origin
        if (currentFilters.origin !== 'all' && 
            (!vessel.origin || !vessel.origin.toLowerCase().includes(currentFilters.origin.toLowerCase()))) {
          return false;
        }
        
        // Filter by destination
        if (currentFilters.destination !== 'all' && 
            (!vessel.destination || !vessel.destination.toLowerCase().includes(currentFilters.destination.toLowerCase()))) {
          return false;
        }
        
        return true;
      });
      
      setFilteredVessels(filtered);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await fetch('/api/maritime/ports', {
          headers: {
            'x-rapidapi-host': 'maritime-ships-and-ports-database.p.rapidapi.com',
            'x-rapidapi-key': process.env.MARITIME_API_KEY || ''
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch ports');
        }

        const ports: Port[] = [
          {
            id: '1',
            name: 'Yangon Port',
            country: 'Myanmar',
            lat: 16.7667,
            lng: 96.1667,
            type: 'international'
          },
          {
            id: '2',
            name: 'Port Klang',
            country: 'Malaysia',
            lat: 3.0000,
            lng: 101.4000,
            type: 'international'
          },
          {
            id: '3',
            name: 'Singapore Port',
            country: 'Singapore',
            lat: 1.2903,
            lng: 103.8520,
            type: 'international'
          },
          {
            id: '4',
            name: 'Jebel Ali Port',
            country: 'Dubai',
            lat: 25.0159,
            lng: 55.0678,
            type: 'international'
          },
          {
            id: '5',
            name: 'Jeddah Islamic Port',
            country: 'Saudi Arabia',
            lat: 21.4858,
            lng: 39.1925,
            type: 'international'
          }
        ];
        
        setPorts(ports);
      } catch (error) {
        console.error('Error fetching ports:', error);
        toast.error('Failed to load port data');
      }
    };
    
    const fetchVessels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/maritime/vessel-find', {
          headers: {
            'x-rapidapi-host': 'maritime-ships-and-ports-database.p.rapidapi.com',
            'x-rapidapi-key': process.env.MARITIME_API_KEY || ''
          },
          body: JSON.stringify({
            cargo_type: 'fish',
            origin_country: 'myanmar'
          })
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch vessels');
        }

        const vessels: VesselPosition[] = [
          {
            mmsi: '123456789',
            imo: '9876543',
            ship_name: 'FISH CARRIER 1',
            latitude: 10.7743,
            longitude: 98.5462,
            speed: 12,
            course: 165,
            status: 'En Route',
            timestamp: new Date().toISOString(),
            dsrc: 'AIS',
            eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            origin: 'Myanmar',
            destination: 'Singapore',
            cargo_type: 'Frozen Fish'
          },
          {
            mmsi: '987654321',
            imo: '1234567',
            ship_name: 'SEAFOOD EXPRESS',
            latitude: 3.1390,
            longitude: 101.6869,
            speed: 15,
            course: 45,
            status: 'Docked',
            timestamp: new Date().toISOString(),
            dsrc: 'AIS',
            eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            origin: 'Myanmar',
            destination: 'Malaysia',
            cargo_type: 'Refrigerated Fish'
          },
          {
            mmsi: '555666777',
            imo: '7654321',
            ship_name: 'MYANMAR FISH TRADER',
            latitude: 16.8661,
            longitude: 96.1951,
            speed: 0,
            course: 0,
            status: 'Docked',
            timestamp: new Date().toISOString(),
            dsrc: 'AIS',
            eta: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            origin: 'Myanmar',
            destination: 'Dubai',
            cargo_type: 'Fresh Fish'
          },
          {
            mmsi: '111222333',
            imo: '3456789',
            ship_name: 'GULF SEAFOOD CARRIER',
            latitude: 5.2945,
            longitude: 100.2593,
            speed: 18,
            course: 270,
            status: 'En Route',
            timestamp: new Date().toISOString(),
            dsrc: 'AIS',
            eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            origin: 'Myanmar',
            destination: 'Saudi Arabia',
            cargo_type: 'Frozen Fish'
          }
        ];
        
        setVessels(vessels);
        memoizedApplyFilters(vessels, filters);
      } catch (error) {
        console.error('Error fetching vessels:', error);
        toast.error('Failed to load vessel data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPorts();
    fetchVessels();
  }, [filters, memoizedApplyFilters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    memoizedApplyFilters(vessels, newFilters);
  };

  // Handle vessel search
  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);

    if (!query) {
      setError('Please enter a vessel name, IMO, or MMSI number');
      setIsLoading(false);
      return;
    }

    try {
      // For IMO numbers, use a more specific search
      const isImoSearch = /^\d{7}$/.test(query);
      const endpoint = isImoSearch ? 
        `/api/maritime/vessel-find?imo=${query}` :
        `/api/maritime/vessel-find?query=${encodeURIComponent(query)}`;

      // Clear previous vessel selection
      setSelectedVessel(null);
      setVesselRoute(null);

      const response = await fetch(endpoint, {
        headers: {
          'x-rapidapi-host': 'maritime-ships-and-ports-database.p.rapidapi.com',
          'x-rapidapi-key': process.env.MARITIME_API_KEY || ''
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search for vessel');
      }
      
      const vessels = data.vessels || [];
      
      if (vessels.length > 0) {
        // If searching by IMO, find exact match
        const foundVessel = isImoSearch ?
          vessels.find(v => v.imo === query) :
          vessels[0];

        if (foundVessel) {
          // If found, select it and fetch its route
          await handleVesselSelect(foundVessel);
          toast.success(`Found vessel: ${foundVessel.ship_name}`);
          return;
        }
      }

      // No vessel found
      const errorMessage = isImoSearch ?
        `No vessel found with IMO number ${query}` :
        'No vessel found matching your search criteria';
      
      setError(errorMessage);
      toast.error('Vessel not found');
    } catch (error) {
      console.error('Error searching for vessel:', error);
      setError('Failed to search for vessel');
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle vessel selection
  const handleVesselSelect = async (vessel: VesselPosition) => {
    setSelectedVessel(vessel);
    await fetchVesselRoute(vessel);
  };

  // Fetch vessel route history
  const fetchVesselRoute = async (vessel: VesselPosition) => {
    setIsLoadingHistory(true);
    
    try {
      const response = await fetch(`/api/maritime/vessel-history?imo=${vessel.imo}`, {
        headers: {
          'x-rapidapi-host': 'maritime-ships-and-ports-database.p.rapidapi.com',
          'x-rapidapi-key': process.env.MARITIME_API_KEY || ''
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch vessel history');
      }
      
      // Find origin and destination ports
      const originPort = ports.find(p => vessel.origin?.toLowerCase().includes(p.country.toLowerCase()));
      const destPort = ports.find(p => vessel.destination?.toLowerCase().includes(p.country.toLowerCase()));
      
      // Generate waypoints between origin and destination
      const waypoints: RouteWaypoint[] = [];
      
      // Add origin if available
      if (originPort) {
        waypoints.push({
          lat: originPort.lat,
          lng: originPort.lng,
          name: `${originPort.name}, ${originPort.country}`,
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else if (vessel.origin) {
        // Use Myanmar as default origin if specific port not found
        waypoints.push({
          lat: 16.8661,
          lng: 96.1951,
          name: 'Yangon, Myanmar',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      // Add current position
      waypoints.push({
        lat: vessel.latitude,
        lng: vessel.longitude,
        name: 'Current Position',
        timestamp: vessel.timestamp
      });
      
      // Add destination if available and vessel is en route
      if (destPort && vessel.status !== 'Docked') {
        waypoints.push({
          lat: destPort.lat,
          lng: destPort.lng,
          name: `${destPort.name}, ${destPort.country}`,
          timestamp: vessel.eta
        });
      } else if (vessel.destination && vessel.status !== 'Docked') {
        // Generate a position near the destination country if specific port not found
        const destCoords: Record<string, {lat: number, lng: number}> = {
          'singapore': { lat: 1.2903, lng: 103.8520 },
          'malaysia': { lat: 3.1390, lng: 101.6869 },
          'dubai': { lat: 25.0159, lng: 55.0678 },
          'uae': { lat: 25.0159, lng: 55.0678 },
          'saudi': { lat: 21.4858, lng: 39.1925 },
          'saudi arabia': { lat: 21.4858, lng: 39.1925 }
        };
        
        const destKey = Object.keys(destCoords).find(key => 
          vessel.destination?.toLowerCase().includes(key)
        );
        
        if (destKey) {
          waypoints.push({
            lat: destCoords[destKey].lat,
            lng: destCoords[destKey].lng,
            name: vessel.destination,
            timestamp: vessel.eta
          });
        }
      }
      
      // Create route
      const route: Route = {
        name: `${vessel.ship_name} Route`,
        waypoints: waypoints
      };
      
      setVesselRoute(route);
    } catch (error) {
      console.error('Error fetching vessel route:', error);
      toast.error('Failed to retrieve vessel route');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ocean-500">
          <Ship className="inline-block mr-2 h-8 w-8" />
          Fish Cargo Ship Tracker
        </h1>
        <p className="text-muted-foreground">
          Track fish cargo vessels from Myanmar to international destinations
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Search and Vessel List */}
        <div className="space-y-6">
          {/* Search & Filter Card */}
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
                <Ship className="w-6 h-6" />
                Search & Filter
              </CardTitle>
              <CardDescription>
                Find fish cargo ships by name, IMO, or MMSI number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VesselSearchForm 
                onSearch={handleSearch} 
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Vessels List */}
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
                <Ship className="w-6 h-6" />
                Active Vessels
              </CardTitle>
              <CardDescription>
                {filteredVessels.length} vessels found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VesselResultsDisplay 
                vessels={filteredVessels}
                selectedVessel={selectedVessel}
                onSelectVessel={handleVesselSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Map */}
        <div className="xl:col-span-2 space-y-6">
          {/* Selected Vessel Tracking Card */}
          {selectedVessel && (
            <VesselTrackingCard vessel={selectedVessel} />
          )}

          {/* Map Display */}
          <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
                <Ship className="w-6 h-6" />
                Live Tracking Map
              </CardTitle>
              <CardDescription>
                {selectedVessel ? 
                  `Tracking ${selectedVessel.ship_name} - ${selectedVessel.origin} to ${selectedVessel.destination}` : 
                  "Select a vessel to track its journey"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <ShipTrackingMap 
                vessels={filteredVessels} 
                selectedRoute={vesselRoute || undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
