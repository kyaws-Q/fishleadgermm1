'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as Record<string, any>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

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

interface MapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  vessels?: VesselPosition[];
  route?: Route;
}

// Create custom ship icon
const createShipIcon = (course: number) => {
  return L.divIcon({
    className: 'custom-ship-icon',
    html: `<div style="transform: rotate(${course}deg);">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 21c.6.5 1.2 1 2.4 1 2.4 0 2.4-1.5 4.8-1.5 2.4 0 2.4 1.5 4.8 1.5 2.4 0 2.4-1.5 4.8-1.5 1.2 0 1.8.5 2.4 1"/>
        <path d="M19 17.1c1-.6 1.8-1.4 2.3-2.3"/>
        <path d="M21.9 14.4C22 13.6 22 12.8 22 12c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 .8 0 1.6.1 2.4"/>
        <path d="M2 16.1c.5.9 1.3 1.7 2.3 2.3"/>
        <path d="M2 12h20"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function Map({ latitude, longitude, zoom, vessels = [], route }: MapProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Force a resize event after mounting to ensure proper rendering
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={['a', 'b', 'c']}
            maxZoom={19}
            detectRetina={true}
          />

          {route && (
            <Polyline
              positions={route.waypoints.map(wp => [wp.lat, wp.lng])}
              pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.7 }}
            />
          )}

          {route?.waypoints.map((waypoint, index) => (
            <Marker
              key={`waypoint-${index}`}
              position={[waypoint.lat, waypoint.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium">{waypoint.name}</h3>
                  <p className="text-sm text-muted-foreground">Route Waypoint</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {vessels.map((vessel) => (
            <Marker
              key={vessel.mmsi}
              position={[vessel.latitude, vessel.longitude]}
              icon={createShipIcon(vessel.course)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium">{vessel.ship_name}</h3>
                  <p className="text-sm text-muted-foreground">Status: {vessel.status}</p>
                  <p className="text-sm text-muted-foreground">
                    Speed: {vessel.speed} knots
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Position: {vessel.latitude.toFixed(4)}°, {vessel.longitude.toFixed(4)}°
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ETA: {new Date(vessel.eta).toLocaleDateString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      </MapContainer>
    </div>
  );
}

export default Map;