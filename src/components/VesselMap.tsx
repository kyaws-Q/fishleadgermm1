'use client';

import { useEffect, useState, useMemo } from 'react';
import { Ship } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Types from react-leaflet
interface MapContainerProps {
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  style: React.CSSProperties;
  children?: React.ReactNode;
}

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

interface RouteWaypoint {
  lat: number;
  lng: number;
  name: string;
}

interface Route {
  name: string;
  waypoints: RouteWaypoint[];
}

interface VesselMapProps {
  vessels: VesselPosition[];
  route?: Route;
  className?: string;
}

// Dynamically import Map component
const DynamicMap = dynamic(
  () => import('./Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border bg-muted">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Ship className="h-6 w-6 animate-pulse" />
          <span>Loading map...</span>
        </div>
      </div>
    )
  }
);

const VesselMap = ({ vessels, route, className }: VesselMapProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const center = useMemo(() => {
    if (vessels.length > 0) {
      return [vessels[0].latitude, vessels[0].longitude] as [number, number];
    }
    if (route?.waypoints.length) {
      return [route.waypoints[0].lat, route.waypoints[0].lng] as [number, number];
    }
    return [0, 0] as [number, number];
  }, [vessels, route]);

  if (!mounted) return null;

  return (
    <div className={`relative h-[600px] w-full ${className || ''}`}>
      <DynamicMap
        latitude={center[0]}
        longitude={center[1]}
        zoom={6}
        vessels={vessels}
        route={route}
      />
    </div>
  );
};

export default VesselMap; 