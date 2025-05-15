import { useState } from 'react';
import { Search, Ship, Package, MapPin, Thermometer } from 'lucide-react';

export default function CargoTracker() {
  const [searchQuery, setSearchQuery] = useState('9619907');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    vesselName: '9619907',
    containerNumber: 'FSCU1234567',
    containerStatus: 'Onboard Vessel',
    containerLocation: '9619907',
    containerTemperature: '-18°C'
  });
  const [showTrackingInfo, setShowTrackingInfo] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, we would fetch data from the API
      // For now, we'll just simulate a successful search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTrackingInfo({
        vesselName: searchQuery,
        containerNumber: 'FSCU1234567',
        containerStatus: 'Onboard Vessel',
        containerLocation: searchQuery,
        containerTemperature: '-18°C'
      });
      
      setShowTrackingInfo(true);
    } catch (error) {
      console.error('Error fetching tracking info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-slate-800">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-cyan-400">
            <Ship className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Cargo Tracker</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 space-y-6">
        {/* Search Box */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-cyan-400">Track Your Shipment</h2>
          </div>
          <p className="text-slate-400 mb-4 text-sm">
            Enter vessel name or IMO number to get live tracking information.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded px-4 py-2 text-white"
              placeholder="Enter IMO number or vessel name"
            />
            <button 
              type="submit" 
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={isLoading}
            >
              <Search className="h-4 w-4" />
              Track
            </button>
          </form>
        </div>

        {/* Tracking Information */}
        {showTrackingInfo && (
          <div className="bg-slate-800/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ship className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-medium text-cyan-400">Tracking Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Vessel Name:</p>
                <p className="text-white">{trackingInfo.vesselName}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Container Number:</p>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-cyan-400" />
                  <p className="text-white">{trackingInfo.containerNumber}</p>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Container Status:</p>
                <p className="text-white">{trackingInfo.containerStatus}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Container Location:</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <p className="text-white">{trackingInfo.containerLocation}</p>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Container Temperature:</p>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-cyan-400" />
                  <p className="text-white">{trackingInfo.containerTemperature}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
