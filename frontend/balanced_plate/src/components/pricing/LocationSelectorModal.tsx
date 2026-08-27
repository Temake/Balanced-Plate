import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  Check,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePriceAreas, useLocatePriceArea } from '@/hooks/useMealPlan';
import type { PriceArea } from '@/api/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArea?: PriceArea | null;
  onSelectArea?: (area: PriceArea) => void;
}

// Regional town to Hub metadata for quick search convenience
const REGIONAL_TOWNS: { town: string; state: string; hubName: string }[] = [
  { town: 'Ile-Ife', state: 'Osun', hubName: 'Ibadan' },
  { town: 'Osogbo', state: 'Osun', hubName: 'Ibadan' },
  { town: 'Abeokuta', state: 'Ogun', hubName: 'Ibadan' },
  { town: 'Akure', state: 'Ondo', hubName: 'Ibadan' },
  { town: 'Ado-Ekiti', state: 'Ekiti', hubName: 'Ibadan' },
  { town: 'Warri', state: 'Delta', hubName: 'Benin City' },
  { town: 'Asaba', state: 'Delta', hubName: 'Benin City' },
  { town: 'Uyo', state: 'Akwa Ibom', hubName: 'Port Harcourt' },
  { town: 'Calabar', state: 'Cross River', hubName: 'Port Harcourt' },
  { town: 'Onitsha', state: 'Anambra', hubName: 'Aba' },
  { town: 'Awka', state: 'Anambra', hubName: 'Aba' },
  { town: 'Owerri', state: 'Imo', hubName: 'Aba' },
  { town: 'Nsukka', state: 'Enugu', hubName: 'Enugu' },
  { town: 'Jos', state: 'Plateau', hubName: 'Abuja' },
  { town: 'Minna', state: 'Niger', hubName: 'Abuja' },
  { town: 'Keffi', state: 'Nasarawa', hubName: 'Abuja' },
  { town: 'Kaduna', state: 'Kaduna', hubName: 'Kano' },
  { town: 'Zaria', state: 'Kaduna', hubName: 'Kano' },
];

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentArea,
  onSelectArea,
}) => {
  const [search, setSearch] = useState('');
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  const { data: areas, isLoading: loadingAreas } = usePriceAreas();
  const locateMutation = useLocatePriceArea();

  const filteredAreas = useMemo(() => {
    if (!areas) return [];
    const query = search.trim().toLowerCase();
    if (!query) return areas;

    // Check if query matches a regional town
    const matchedTowns = REGIONAL_TOWNS.filter(
      (t) =>
        t.town.toLowerCase().includes(query) ||
        t.state.toLowerCase().includes(query)
    ).map((t) => t.hubName.toLowerCase());

    return areas.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.state.toLowerCase().includes(query) ||
        matchedTowns.includes(a.name.toLowerCase())
    );
  }, [areas, search]);

  if (!isOpen) return null;

  const handleSelectArea = (area: PriceArea) => {
    locateMutation.mutate(
      { area_id: area.id },
      {
        onSuccess: (data) => {
          if (data.price_area) {
            onSelectArea?.(data.price_area);
            toast.success(`Market prices set to ${data.price_area.name}.`);
          }
          onClose();
        },
        onError: () => {
          toast.error('Failed to update price location.');
        },
      }
    );
  };

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        locateMutation.mutate(
          { latitude, longitude },
          {
            onSuccess: (data) => {
              setIsLocatingGPS(false);
              if (data.is_outside_nigeria) {
                toast.info(
                  'Detected location is outside Nigeria. Using Lagos market prices.'
                );
              } else if (data.price_area) {
                toast.success(
                  `📍 Located nearest market hub: ${data.price_area.name}${
                    data.distance_km != null ? ` (${data.distance_km} km)` : ''
                  }`
                );
              }
              if (data.price_area) {
                onSelectArea?.(data.price_area);
              }
              onClose();
            },
            onError: () => {
              setIsLocatingGPS(false);
              toast.error('Failed to map GPS location to market hub.');
            },
          }
        );
      },
      (error) => {
        setIsLocatingGPS(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please select your city manually.');
        } else {
          toast.error('Could not determine your GPS location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Select Market Price Location
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* GPS Quick Action */}
          <Button
            onClick={handleGPSDetect}
            disabled={isLocatingGPS || locateMutation.isPending}
            variant="outline"
            className="w-full justify-center gap-2.5 h-11 rounded-xl border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          >
            {isLocatingGPS || locateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="font-semibold text-sm">Use Current GPS Location</span>
          </Button>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city, town, or state (e.g. 'Ile-Ife', 'Warri')..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Market Hub List */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {loadingAreas ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                <AlertCircle className="h-6 w-6 mb-1 text-gray-300" />
                <p className="text-xs">No matching commercial price hubs found.</p>
              </div>
            ) : (
              filteredAreas.map((area) => {
                const isSelected = currentArea?.id === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => handleSelectArea(area)}
                    disabled={locateMutation.isPending}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors border',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-semibold'
                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{area.name}</span>
                        {area.is_default && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {area.state} State Hub
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-800/40 px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
          Meal plans and budget forecasts are calibrated against open market surveys in your selected economic zone.
        </div>
      </div>
    </div>
  );
};
