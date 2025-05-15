import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Ship, Anchor, Clock, Calendar, Navigation, Flag, MapPin, Thermometer, Package, AlertTriangle } from 'lucide-react';
import { VesselPosition } from './vessel-results-display';

interface VesselTrackingCardProps {
  vessel: VesselPosition;
}

export default function VesselTrackingCard({ vessel }: VesselTrackingCardProps) {
  // Additional tracking data (in a real app, this would come from API)
  const containerData = {
    number: `FSCU${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: vessel.status === 'Docked' ? 'Unloading' : 'Onboard Vessel',
    temperature: '-18°C',
    weight: '24,500 kg',
    type: 'Refrigerated',
    lastScanned: new Date('2025-05-14T10:30:00+06:30').toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  // Calculate journey progress and remaining time
  const calculateProgress = () => {
    if (!vessel.eta || vessel.status === 'Docked') return 100;
    
    const startTime = new Date(vessel.timestamp).getTime();
    const endTime = new Date(vessel.eta).getTime();
    const currentTime = new Date('2025-05-14T14:59:37+06:30').getTime();
    
    const totalDuration = endTime - startTime;
    const elapsed = currentTime - startTime;
    
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  };

  const getRemainingTime = () => {
    if (!vessel.eta || vessel.status === 'Docked') return 'Arrived';
    
    const currentTime = new Date('2025-05-14T14:59:37+06:30').getTime();
    const etaTime = new Date(vessel.eta).getTime();
    
    if (currentTime >= etaTime) return 'Arrived';
    
    const remainingMs = etaTime - currentTime;
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return days + 'd ' + hours + 'h remaining';
  };

  const getStatusColor = () => {
    switch (vessel.status?.toLowerCase()) {
      case 'en route':
        return 'text-green-500';
      case 'docked':
        return 'text-blue-500';
      case 'anchored':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const progress = calculateProgress();

  return (
    <Card className="bg-slate-800/60 border-slate-700 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-ocean-300">
          <Ship className="w-6 h-6" />
          {vessel.ship_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status and Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Anchor className={getStatusColor()} />
              <span className={getStatusColor() + " font-semibold"}>
                {vessel.status || 'Unknown'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {getRemainingTime()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Journey Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Departure</span>
            </div>
            <p className="font-medium">{vessel.origin || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(vessel.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Expected Arrival</span>
            </div>
            <p className="font-medium">{vessel.destination || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">
              {vessel.eta ? new Date(vessel.eta).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Navigation Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="w-4 h-4" />
              <span>Speed & Course</span>
            </div>
            <p className="font-medium">{vessel.speed} knots</p>
            <p className="text-sm text-muted-foreground">
              Course: {vessel.course}°
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flag className="w-4 h-4" />
              <span>Cargo Details</span>
            </div>
            <p className="font-medium">{vessel.cargo_type || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">
              IMO: {vessel.imo}
            </p>
          </div>
        </div>
        
        {/* Container Tracking Details */}
        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-lg font-medium text-ocean-300 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Container Tracking
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>Container Number</span>
              </div>
              <p className="font-medium">{containerData.number}</p>
              <p className="text-sm text-muted-foreground">
                Type: {containerData.type}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>Status</span>
              </div>
              <p className="font-medium text-green-400">{containerData.status}</p>
              <p className="text-sm text-muted-foreground">
                Last scanned: {containerData.lastScanned}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Thermometer className="w-4 h-4" />
                <span>Temperature</span>
              </div>
              <p className="font-medium">{containerData.temperature}</p>
              <p className="text-sm text-muted-foreground">
                Refrigerated cargo
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Current Location</span>
              </div>
              <p className="font-medium">Onboard {vessel.ship_name}</p>
              <p className="text-sm text-muted-foreground">
                Weight: {containerData.weight}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
