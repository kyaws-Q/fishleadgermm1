'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Anchor, ArrowRight, Calendar, Globe, MapPin } from "lucide-react";

interface ContainerInfo {
  containerId: string;
  status: string;
  location: string;
  vessel: string;
  line: string;
  route: string;
  originPort: string;
  destinationPort: string;
  eta: string;
  imo: string;
  latitude: number;
  longitude: number;
}

interface ShipTrackingInfoProps {
  containerId?: string;
}

export default function ShipTrackingInfo({ containerId }: ShipTrackingInfoProps) {
  const [containerInfo, setContainerInfo] = useState<ContainerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContainerInfo = async () => {
      if (!containerId) {
        setLoading(false);
        setError(null);
        setContainerInfo(null);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(
          `https://container.vesselfinder.com/api/1.0/container/${import.meta.env.NEXT_PUBLIC_VESSELFINDER_API_KEY}/${containerId}/AUTO`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Origin': window.location.origin,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setContainerInfo({
          containerId: data.general.containerNumber,
          status: data.general.progress === 100 ? "Arrived" : "In Transit",
          location: data.general.currentLocation?.vessel?.name || "At sea",
          vessel: data.general.currentLocation?.vessel?.name || "-",
          line: data.general.carrier,
          route: `${data.general.origin.name} to ${data.general.destination.name}`,
          originPort: data.general.origin.name,
          destinationPort: data.general.destination.name,
          eta: new Date(data.general.destination.date * 1000).toLocaleDateString(),
          imo: data.general.currentLocation?.vessel?.imo?.toString() || "",
          latitude: data.general.currentLocation?.vessel?.latitude || 0,
          longitude: data.general.currentLocation?.vessel?.longitude || 0,
        });
      } catch (err) {
        console.error('Error fetching container info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch container information');
      } finally {
        setLoading(false);
      }
    };

    fetchContainerInfo();
  }, [containerId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'arrived':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!containerId) {
    return null;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-2.5 sm:px-3">
        <CardTitle className="text-base sm:text-lg">Container Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2 p-2.5 sm:p-3">
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading real-time status...</div>
        ) : containerInfo && (
          <div className="text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-xs sm:text-sm">{containerInfo.containerId}</p>
              <Badge variant="outline" className={cn("text-[10px] sm:text-xs px-1.5 py-0.5", getStatusColor(containerInfo.status))}>
                {containerInfo.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="flex items-center text-muted-foreground text-[10px] sm:text-xs">
                <Anchor className="h-2.5 w-2.5 mr-1 text-ocean-500" />
                Vessel:
              </p>
              <p className="font-medium text-[10px] sm:text-xs">{containerInfo.vessel}</p>
              <p className="flex items-center text-muted-foreground text-[10px] sm:text-xs">
                <Anchor className="h-2.5 w-2.5 mr-1 text-ocean-500" />
                Line:
              </p>
              <p className="font-medium text-[10px] sm:text-xs">{containerInfo.line}</p>
              <p className="flex items-center text-muted-foreground text-[10px] sm:text-xs">
                <Globe className="h-2.5 w-2.5 mr-1 text-ocean-500" />
                Route:
              </p>
              <p className="font-medium truncate max-w-full text-[10px] sm:text-xs" title={containerInfo.route}>
                {containerInfo.route}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-border/60">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p className="flex items-center text-muted-foreground text-[10px] sm:text-xs">
                  <MapPin className="h-2.5 w-2.5 mr-1 text-ocean-500" />
                  Origin:
                </p>
                <p className="font-medium truncate max-w-full text-[10px] sm:text-xs" title={containerInfo.originPort}>
                  {containerInfo.originPort}
                </p>
                <p className="flex items-center text-muted-foreground text-[10px] sm:text-xs">
                  <MapPin className="h-2.5 w-2.5 mr-1 text-ocean-500" />
                  Dest:
                </p>
                <p className="font-medium truncate max-w-full text-[10px] sm:text-xs" title={containerInfo.destinationPort}>
                  {containerInfo.destinationPort}
                </p>
                <p className="flex items-center text-muted-foreground text-[10px] sm:text-xs">
                  <Calendar className="h-2.5 w-2.5 mr-1 text-ocean-500" />
                  ETA:
                </p>
                <p className="font-medium text-[10px] sm:text-xs">{containerInfo.eta}</p>
              </div>
            </div>
            <a
              href={`https://www.marinetraffic.com/en/ais/details/ships/imo:${containerInfo.imo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center text-[10px] sm:text-xs text-primary hover:underline cursor-pointer group"
            >
              <span>View detailed tracking</span>
              <ArrowRight className="ml-1 h-2.5 w-2.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
