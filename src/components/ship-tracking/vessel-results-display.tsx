'use client';

import { Ship, Navigation, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface VesselPosition {
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
  origin?: string;
  destination?: string;
  cargo_type?: string;
}

interface VesselResultsDisplayProps {
  vessels: VesselPosition[];
  selectedVessel: VesselPosition | null;
  onSelectVessel: (vessel: VesselPosition) => void;
}

const VesselResultsDisplay = ({ 
  vessels, 
  selectedVessel, 
  onSelectVessel 
}: VesselResultsDisplayProps) => {
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vessel Name</TableHead>
            <TableHead>Cargo Type</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vessels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No vessels found matching your filters
              </TableCell>
            </TableRow>
          ) : (
            vessels.map((vessel) => (
              <TableRow key={vessel.mmsi} className={selectedVessel?.mmsi === vessel.mmsi ? "bg-ocean-900/30" : ""}>
                <TableCell className="font-medium">{vessel.ship_name}</TableCell>
                <TableCell>{vessel.cargo_type || "Fish"}</TableCell>
                <TableCell>{vessel.origin || "Unknown"}</TableCell>
                <TableCell>{vessel.destination || "Unknown"}</TableCell>
                <TableCell>
                  <Badge variant={vessel.status === "Docked" ? "outline" : "default"}>
                    {vessel.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(vessel.eta).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSelectVessel(vessel)}
                    className="text-ocean-400 hover:text-ocean-300 hover:bg-ocean-950/50"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedVessel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ocean-300">Vessel Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">IMO:</span>
                <span>{selectedVessel.imo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MMSI:</span>
                <span>{selectedVessel.mmsi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline">{selectedVessel.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speed:</span>
                <span>{selectedVessel.speed} knots</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course:</span>
                <span>{selectedVessel.course}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <span>{selectedVessel.latitude.toFixed(4)}°, {selectedVessel.longitude.toFixed(4)}°</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ocean-300">Route Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Origin:</span>
                <span>{selectedVessel.origin || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span>{selectedVessel.destination || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ETA:</span>
                <span>{new Date(selectedVessel.eta).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cargo Type:</span>
                <span>{selectedVessel.cargo_type || "Fish"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span>{new Date(selectedVessel.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ocean-300">Tracking Status</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Route Progress:</span>
                  <span>{selectedVessel.status === "Docked" ? "100%" : "In Progress"}</span>
                </div>
                <Progress value={selectedVessel.status === "Docked" ? 100 : 65} className="h-2 bg-slate-700" />
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Route Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mr-2 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-3 w-3 text-green-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Departed {selectedVessel.origin}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className={`mr-2 ${selectedVessel.status === "Docked" ? "bg-green-500" : "bg-blue-500"} rounded-full p-1`}>
                      {selectedVessel.status === "Docked" ? (
                        <CheckCircle className="h-3 w-3 text-green-100" />
                      ) : (
                        <Ship className="h-3 w-3 text-blue-100" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedVessel.status === "Docked" ? 
                          `Arrived at ${selectedVessel.destination}` : 
                          `En route to ${selectedVessel.destination}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedVessel.status === "Docked" ? 
                          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
                          "In progress"}
                      </p>
                    </div>
                  </div>
                  
                  {selectedVessel.status === "Docked" && (
                    <div className="flex items-start">
                      <div className="mr-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-3 w-3 text-green-100" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cargo Unloaded</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VesselResultsDisplay;
