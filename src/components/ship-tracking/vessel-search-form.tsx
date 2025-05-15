'use client';

import { useState, useEffect } from 'react';
import { Search, Fish, MapPin, Navigation, Loader, Ship, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VesselSearchFormProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    cargoType: string;
    origin: string;
    destination: string;
  }) => void;
  isLoading: boolean;
}

const VesselSearchForm = ({ onSearch, onFilterChange, isLoading }: VesselSearchFormProps) => {
  const [searchQuery, setSearchQuery] = useState('9619907'); // Pre-filled with IMO number
  const [searchType, setSearchType] = useState('imo'); // 'imo', 'mmsi', or 'name'
  const [cargoType, setCargoType] = useState('fish');
  const [origin, setOrigin] = useState('myanmar');
  const [destination, setDestination] = useState('all');

  // Auto-search on initial load
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, []);

  const handleSearch = () => {
    // Validate IMO number if that's the search type
    if (searchType === 'imo' && !/^\d{7}$/.test(searchQuery)) {
      alert('IMO numbers must be 7 digits');
      return;
    }
    
    onSearch(searchQuery);
  };

  const handleCargoTypeChange = (value: string) => {
    setCargoType(value);
    onFilterChange({ cargoType: value, origin, destination });
  };

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    onFilterChange({ cargoType, origin: value, destination });
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    onFilterChange({ cargoType, origin, destination: value });
  };

  return (
    <div className="space-y-4">
      {/* Search Type Selector */}
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={searchType === 'imo' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('imo')}
          className={searchType === 'imo' ? 'bg-ocean-600 hover:bg-ocean-700' : ''}
        >
          <Ship className="w-4 h-4 mr-1" />
          IMO Number
        </Button>
        <Button
          type="button"
          variant={searchType === 'name' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('name')}
          className={searchType === 'name' ? 'bg-ocean-600 hover:bg-ocean-700' : ''}
        >
          <Search className="w-4 h-4 mr-1" />
          Vessel Name
        </Button>
        <Button
          type="button"
          variant={searchType === 'container' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('container')}
          className={searchType === 'container' ? 'bg-ocean-600 hover:bg-ocean-700' : ''}
        >
          <Package className="w-4 h-4 mr-1" />
          Container
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchType === 'imo' ? 'Enter 7-digit IMO number (e.g. 9619907)' : 
                         searchType === 'container' ? 'Enter container number' : 
                         'Enter vessel name'}
              className="pl-10 bg-slate-900/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <Button
          className="bg-ocean-600 hover:bg-ocean-700 text-white"
          onClick={handleSearch}
          disabled={isLoading}
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            <Fish className="w-4 h-4 inline mr-1" /> Cargo Type
          </label>
          <Select 
            value={cargoType} 
            onValueChange={handleCargoTypeChange}
          >
            <SelectTrigger className="bg-slate-900/60">
              <SelectValue placeholder="Select cargo type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cargo Types</SelectItem>
              <SelectItem value="fish">Fish (All Types)</SelectItem>
              <SelectItem value="frozen">Frozen Fish</SelectItem>
              <SelectItem value="fresh">Fresh Fish</SelectItem>
              <SelectItem value="refrigerated">Refrigerated Fish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            <MapPin className="w-4 h-4 inline mr-1" /> Origin
          </label>
          <Select 
            value={origin} 
            onValueChange={handleOriginChange}
          >
            <SelectTrigger className="bg-slate-900/60">
              <SelectValue placeholder="Select origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              <SelectItem value="myanmar">Myanmar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            <Navigation className="w-4 h-4 inline mr-1" /> Destination
          </label>
          <Select 
            value={destination} 
            onValueChange={handleDestinationChange}
          >
            <SelectTrigger className="bg-slate-900/60">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              <SelectItem value="singapore">Singapore</SelectItem>
              <SelectItem value="malaysia">Malaysia</SelectItem>
              <SelectItem value="dubai">Dubai/UAE</SelectItem>
              <SelectItem value="saudi">Saudi Arabia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default VesselSearchForm;
