import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapMouseEvent,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  getMatchingKarnatakaLocations,
  KarnatakaLocationItem,
} from '../../data/karnatakaLocations';

// Usage attribution ID as mandated by google-maps-platform skill
const ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

declare const google: any;

const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Bengaluru Core & Suburbs
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  sahakarnagar: { lat: 13.0628, lng: 77.5873 },
  hebbal: { lat: 13.0358, lng: 77.597 },
  yelahanka: { lat: 13.1007, lng: 77.5963 },
  whitefield: { lat: 12.9698, lng: 77.7499 },
  'electronic city': { lat: 12.8399, lng: 77.677 },
  peenya: { lat: 13.0315, lng: 77.5186 },
  manyata: { lat: 13.0475, lng: 77.6206 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  'jp nagar': { lat: 12.9063, lng: 77.5857 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  bellandur: { lat: 12.926, lng: 77.6762 },
  sarjapur: { lat: 12.8601, lng: 77.7865 },
  kengeri: { lat: 12.9177, lng: 77.4838 },
  'kr puram': { lat: 13.0075, lng: 77.6959 },
  rajajinagar: { lat: 12.9982, lng: 77.553 },
  malleshwaram: { lat: 13.0031, lng: 77.5643 },
  banashankari: { lat: 12.9255, lng: 77.5468 },
  yeshwanthpur: { lat: 13.0238, lng: 77.5489 },
  jalahalli: { lat: 13.0528, lng: 77.5414 },
  nagavara: { lat: 13.0422, lng: 77.6231 },

  // Kolar District & Malur
  kolar: { lat: 13.1367, lng: 78.1291 },
  malur: { lat: 13.0034, lng: 77.9392 },
  'malur industrial area': { lat: 13.0034, lng: 77.9392 },
  narasapura: { lat: 13.1517, lng: 78.1882 },
  'kolar gold fields': { lat: 12.9596, lng: 78.2721 },
  kgf: { lat: 12.9596, lng: 78.2721 },
  bangarapet: { lat: 12.9798, lng: 78.1963 },
  srinivaspur: { lat: 13.3364, lng: 78.2142 },
  mulbagal: { lat: 13.1633, lng: 78.3965 },

  // Industrial Hubs & Corridors
  devanahalli: { lat: 13.2484, lng: 77.7126 },
  hosakote: { lat: 13.0706, lng: 77.7981 },
  doddaballapur: { lat: 13.2929, lng: 77.5431 },
  nelamangala: { lat: 13.0978, lng: 77.3917 },
  bidadi: { lat: 12.8016, lng: 77.3828 },
  jigani: { lat: 12.7844, lng: 77.6396 },
  bommasandra: { lat: 12.8184, lng: 77.6897 },
  attibele: { lat: 12.7783, lng: 77.7719 },
  harohalli: { lat: 12.6713, lng: 77.4727 },
  kanakapura: { lat: 12.5517, lng: 77.4208 },
  anekal: { lat: 12.7107, lng: 77.6974 },

  // Tumakuru & Chikkaballapur
  tumakuru: { lat: 13.3409, lng: 77.101 },
  tumkur: { lat: 13.3409, lng: 77.101 },
  vasanthanarasapura: { lat: 13.4475, lng: 77.0628 },
  kunigal: { lat: 13.0242, lng: 77.0289 },
  tiptur: { lat: 13.2574, lng: 76.4786 },
  chikkaballapur: { lat: 13.4325, lng: 77.7275 },
  bagepalli: { lat: 13.7844, lng: 77.7936 },
  chintamani: { lat: 13.4004, lng: 78.0583 },
  gauribidanur: { lat: 13.6133, lng: 77.5186 },
  sidlaghatta: { lat: 13.3914, lng: 77.8631 },

  // Ramanagara & Mandya & Mysuru
  ramanagara: { lat: 12.7209, lng: 77.2799 },
  channapatna: { lat: 12.6517, lng: 77.2025 },
  mandya: { lat: 12.5242, lng: 76.8958 },
  maddur: { lat: 12.5847, lng: 77.0458 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  nanjangud: { lat: 12.1194, lng: 76.6806 },

  // Hassan & Shivamogga & Central Karnataka
  hassan: { lat: 13.0033, lng: 76.1004 },
  sakleshpur: { lat: 12.9439, lng: 75.7869 },
  shivamogga: { lat: 13.9299, lng: 75.5681 },
  shimoga: { lat: 13.9299, lng: 75.5681 },
  bhadravati: { lat: 13.8436, lng: 75.7042 },
  davanagere: { lat: 14.4644, lng: 75.9218 },
  davangere: { lat: 14.4644, lng: 75.9218 },
  chitradurga: { lat: 14.2251, lng: 76.398 },

  // Coastal Karnataka
  mangalore: { lat: 12.9141, lng: 74.856 },
  mangaluru: { lat: 12.9141, lng: 74.856 },
  udupi: { lat: 13.3409, lng: 74.7421 },
  manipal: { lat: 13.3525, lng: 74.7868 },
  kundapura: { lat: 13.6268, lng: 74.6917 },
  karwar: { lat: 14.8136, lng: 74.1297 },
  gokarna: { lat: 14.5479, lng: 74.3188 },
  bhatkal: { lat: 13.9858, lng: 74.5558 },

  // North Karnataka
  hubballi: { lat: 15.3647, lng: 75.124 },
  hubli: { lat: 15.3647, lng: 75.124 },
  dharwad: { lat: 15.4589, lng: 75.0078 },
  belagavi: { lat: 15.8497, lng: 74.4977 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
  ballari: { lat: 15.1394, lng: 76.9214 },
  bellary: { lat: 15.1394, lng: 76.9214 },
  hospet: { lat: 15.2689, lng: 76.3909 },
  hampi: { lat: 15.335, lng: 76.46 },
  kalaburagi: { lat: 17.3297, lng: 76.8343 },
  gulbarga: { lat: 17.3297, lng: 76.8343 },
  vijayapura: { lat: 16.8302, lng: 75.71 },
  bijapur: { lat: 16.8302, lng: 75.71 },
  bidar: { lat: 17.9104, lng: 77.5199 },
  raichur: { lat: 16.212, lng: 77.3439 },
  bagalkot: { lat: 16.1691, lng: 75.6615 },
  gadag: { lat: 15.4297, lng: 75.631 },
  haveri: { lat: 14.7954, lng: 75.4024 },
  koppal: { lat: 15.3533, lng: 76.1555 },
  yadgir: { lat: 16.7644, lng: 77.1378 },

  // Major Indian Cities
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  goa: { lat: 15.2993, lng: 74.124 },
  hosur: { lat: 12.7409, lng: 77.8253 },
};

interface GoogleMapLocationPickerProps {
  currentLocation: string;
  onSelectLocation: (locationText: string) => void;
  onClose?: () => void;
}

// Sub-component to manage map camera & geocoding inside APIProvider
const MapController: React.FC<{
  markerPos: { lat: number; lng: number } | null;
  zoomLevel?: number;
}> = ({ markerPos, zoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (map && markerPos) {
      map.panTo(markerPos);
      if (zoomLevel) {
        map.setZoom(zoomLevel);
      }
    }
  }, [map, markerPos, zoomLevel]);

  return null;
};

export const GoogleMapLocationPicker: React.FC<GoogleMapLocationPickerProps> = ({
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof window !== 'undefined' ? (window as any).GOOGLE_MAPS_API_KEY : '') ||
    'AIzaSyBDO36MIjftqDWUzaTmkAwCQuNbdeLoyHI';

  const defaultCenter = { lat: 13.0628, lng: 77.5873 }; // Bengaluru Sahakarnagar default
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [selectedAddress, setSelectedAddress] = useState<string>(currentLocation || 'Sahakarnagar, Bengaluru');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Search state replacing preset chips
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);

  const searchSuggestions: KarnatakaLocationItem[] = searchQuery.trim().length > 1
    ? getMatchingKarnatakaLocations(searchQuery).slice(0, 5)
    : [];

  // Reverse geocode lat/lng to human-readable address
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      try {
        if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results.length > 0) {
            const bestResult = response.results[0];
            const formatted = bestResult.formatted_address;
            setSelectedAddress(formatted);
            onSelectLocation(formatted);
            setIsGeocoding(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Geocoder reverse lookup warning:', err);
      }

      // Nominatim reverse lookup fallback
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { Accept: 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            setSelectedAddress(data.display_name);
            onSelectLocation(data.display_name);
            setIsGeocoding(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      // Fallback coordinate representation if offline or geocoder not accessible
      const coordName = `Site @ ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Karnataka)`;
      setSelectedAddress(coordName);
      onSelectLocation(coordName);
      setIsGeocoding(false);
    },
    [onSelectLocation]
  );

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setMarkerPos({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const handleSearchLocation = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setShowSearchSuggestions(false);

    // 1. Check fast known coordinates dictionary
    const lower = trimmed.toLowerCase();
    for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
      if (lower === key || lower.includes(key) || key.includes(lower)) {
        setMarkerPos(coords);
        setZoomLevel(14);
        const resolvedAddress =
          lower.includes('malur')
            ? 'Malur, Karnataka'
            : trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        setSelectedAddress(resolvedAddress);
        onSelectLocation(resolvedAddress);
        setIsSearching(false);
        return;
      }
    }

    // 2. Try Google Maps Geocoder API for any place, street, or landmark
    try {
      if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();

        // Try direct query first
        let response = await geocoder.geocode({ address: trimmed });

        // If no direct result, try with regional context
        if (!response.results || response.results.length === 0) {
          response = await geocoder.geocode({
            address: `${trimmed}, Karnataka, India`,
          });
        }

        // If still no result, try with India
        if (!response.results || response.results.length === 0) {
          response = await geocoder.geocode({
            address: `${trimmed}, India`,
          });
        }

        if (response.results && response.results.length > 0) {
          const first = response.results[0];
          const lat = first.geometry.location.lat();
          const lng = first.geometry.location.lng();
          const formatted = first.formatted_address;
          setMarkerPos({ lat, lng });
          setZoomLevel(15);
          setSelectedAddress(formatted);
          onSelectLocation(formatted);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Google Maps Geocoding search warning:', err);
    }

    // 3. Fallback to OpenStreetMap Nominatim for any place worldwide
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&limit=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMarkerPos({ lat, lng });
            setZoomLevel(14);
            const address = first.display_name || trimmed;
            setSelectedAddress(address);
            onSelectLocation(address);
            setIsSearching(false);
            return;
          }
        }
      }
    } catch (nomErr) {
      console.warn('Nominatim fallback geocode note:', nomErr);
    }

    // 4. Default fallback: still update selected location to user text
    setSelectedAddress(trimmed);
    onSelectLocation(trimmed);
    setIsSearching(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full mt-2 rounded-xl border border-sky-300 bg-white shadow-xl overflow-hidden animate-fadeIn"
    >
      {/* Top Header / Bar */}
      <div className="bg-[#0B192C] px-3.5 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#38BDF8]">
            map
          </span>
          <span className="text-[12.5px] font-bold tracking-tight">
            Pin Precise Project Site on Google Map
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-[11.5px] flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            <span>Close Map</span>
          </button>
        )}
      </div>

      {/* Map Search Bar (Safe div without nested form to prevent parent form submission) */}
      <div className="bg-slate-50 p-2.5 border-b border-slate-200">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 1) {
                  setShowSearchSuggestions(true);
                } else {
                  setShowSearchSuggestions(false);
                }
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 1) {
                  setShowSearchSuggestions(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchLocation(searchQuery);
                }
              }}
              placeholder="Search area, landmark, industrial hub, city, or PIN code on map..."
              className="w-full h-9.5 pl-9 pr-8 text-[13px] bg-white border border-slate-300 rounded-lg outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery('');
                  setShowSearchSuggestions(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}

            {/* Quick Suggestions Dropdown */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                {searchSuggestions.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSearchQuery(item.name);
                      setShowSearchSuggestions(false);
                      handleSearchLocation(item.name);
                    }}
                    className="w-full px-3 py-2 text-left text-[12.5px] hover:bg-sky-50 text-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearchLocation(searchQuery);
            }}
            disabled={isSearching || !searchQuery.trim()}
            className="h-9.5 px-3.5 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-2xs"
          >
            {isSearching ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">search</span>
            )}
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Google Map Viewport */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-100">
        <APIProvider apiKey={apiKey}>
          <Map
            id="property-location-map"
            mapId="DEMO_MAP_ID"
            defaultCenter={defaultCenter}
            defaultZoom={11}
            onClick={handleMapClick}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={ATTRIBUTION_IDS}
            className="w-full h-full"
          >
            <MapController markerPos={markerPos} zoomLevel={zoomLevel} />
            {markerPos && (
              <AdvancedMarker position={markerPos} title="Selected Project Location" />
            )}
          </Map>
        </APIProvider>

        {/* Floating Instruction Overlay */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-md flex items-center gap-1.5 text-[11px] text-slate-700">
          <span className="material-symbols-outlined text-[15px] text-[#0284C7]">
            touch_app
          </span>
          <span>Click anywhere on the map to pin exact site</span>
        </div>
      </div>

      {/* Selected Location Summary Bar & Confirm */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
            Selected Pin Location:
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
              check_circle
            </span>
            <span className="text-[13px] font-semibold text-[#0B192C] truncate">
              {isGeocoding ? 'Detecting address...' : selectedAddress}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (selectedAddress) {
                onSelectLocation(selectedAddress);
              }
              onClose?.();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">done</span>
            <span>Confirm Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
