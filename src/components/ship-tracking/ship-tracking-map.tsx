'use client';

import { useState, useEffect, useMemo } from 'react';
import { Ship } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { VesselPosition } from './vessel-results-display';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name: string;
  timestamp?: string;
}

export interface Route {
  name: string;
  waypoints: RouteWaypoint[];
}

interface ShipTrackingMapProps {
  vessels: VesselPosition[];
  selectedRoute?: Route;
  className?: string;
}

// Lazy load the Map component
const DynamicMap = lazy(() => import('../Map'));

// Loading component for the map
const MapLoadingComponent = () => (
  <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-muted">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Ship className="h-6 w-6 animate-pulse" />
      <span>Loading map...</span>
    </div>
  </div>
);

const ShipTrackingMap = ({ vessels, selectedRoute, className }: ShipTrackingMapProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const center = useMemo(() => {
    // If there's a selected route, center on the first waypoint
    if (selectedRoute?.waypoints.length) {
      return [selectedRoute.waypoints[0].lat, selectedRoute.waypoints[0].lng] as [number, number];
    }
    
    // If there are vessels, center on the first one
    if (vessels.length > 0) {
      return [vessels[0].latitude, vessels[0].longitude] as [number, number];
    }
    
    // Default center - Myanmar region
    return [16.8661, 96.1951] as [number, number];
  }, [vessels, selectedRoute]);

  // Convert route to format expected by Map component
  const mapRoute = useMemo(() => {
    if (!selectedRoute) return undefined;
    
    return {
      name: selectedRoute.name,
      waypoints: selectedRoute.waypoints
    };
  }, [selectedRoute]);

  if (!mounted) return null;

  return (
    <div className={`relative h-[600px] w-full ${className || ''}`}>
      <Suspense fallback={<MapLoadingComponent />}>
        <DynamicMap
          latitude={center[0]}
          longitude={center[1]}
          zoom={5}
          vessels={vessels}
          route={mapRoute}
        />
      </Suspense>
    </div>
  );
};

export default ShipTrackingMap;
