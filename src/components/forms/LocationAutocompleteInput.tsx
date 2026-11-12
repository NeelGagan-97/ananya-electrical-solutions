import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import {
  KARNATAKA_PROJECT_LOCATIONS,
  getMatchingKarnatakaLocations,
  KarnatakaLocationItem,
} from '../../data/karnatakaLocations';

// Code-split heavy Google Maps Platform dependencies so they are never in the initial critical path
const GoogleMapLocationPicker = lazy(() =>
  import('./GoogleMapLocationPicker').then((m) => ({ default: m.GoogleMapLocationPicker }))
);

export interface LocationAutocompleteInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
}

const POPULAR_QUICK_PICKS = [
  'Bangalore',
  'Kolar',
  'Peenya Industrial Area',
  'Devanahalli',
  'Tumakuru',
  'Whitefield',
];

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  id = 'location-input',
  name = 'location',
  value = '',
  onChange,
  placeholder = 'e.g. Bangalore, Kolar, Peenya, Devanahalli...',
  required = false,
  className = '',
  autoFocus = false,
  disabled = false,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchingLocations: KarnatakaLocationItem[] = getMatchingKarnatakaLocations(value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (selectedLocation: string) => {
    onChange(selectedLocation);
    setIsOpen(false);
    setHighlightIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matchingLocations.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        setHighlightIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < matchingLocations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : matchingLocations.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < matchingLocations.length) {
        e.preventDefault();
        handleSelect(matchingLocations[highlightIndex].name);
      }
    } else if (e.key === 'Tab') {
      // Auto-fill top match on Tab if typing a query
      if (matchingLocations.length > 0 && value.trim().length >= 2) {
        const topItem = matchingLocations[0].name;
        if (topItem.toLowerCase().startsWith(value.trim().toLowerCase())) {
          handleSelect(topItem);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  const lowerQuery = value.trim().toLowerCase();

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative w-full flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none select-none z-10">
          location_on
        </span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={placeholder}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            if (val.trim().length > 0) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
            setHighlightIndex(0);
          }}
          onFocus={() => {
            if (value.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            if (onBlur) onBlur();
          }}
          onKeyDown={handleKeyDown}
          className={`w-full h-12 pl-11 pr-10 text-[14.5px] text-slate-800 bg-[#F8FAFC] border border-slate-300 rounded-lg outline-none transition-all hover:border-slate-400 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 focus:bg-white placeholder:text-slate-400 ${className}`}
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded"
            title="Clear location"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Interactive Google Map Location Picker (Code-split on demand) */}
      {showMapPicker && (
        <Suspense fallback={null}>
          <GoogleMapLocationPicker
            currentLocation={value}
            onSelectLocation={(loc) => {
              handleSelect(loc);
            }}
            onClose={() => setShowMapPicker(false)}
          />
        </Suspense>
      )}

      {/* Autocomplete Dropdown with instant mouse click, keyboard enter/tab */}
      {isOpen && value.trim().length > 0 && matchingLocations.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
          {/* Filtered Matches List */}
          <div className="divide-y divide-slate-100">
            {matchingLocations.length > 0 ? (
              matchingLocations.map((item, index) => {
                const isHighlighted = index === highlightIndex;
                const lowerName = item.name.toLowerCase();
                const matchPos = lowerQuery ? lowerName.indexOf(lowerQuery) : -1;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onMouseEnter={() => setHighlightIndex(index)}
                    onMouseDown={(e) => {
                      // Prevent input blur before click registers
                      e.preventDefault();
                      handleSelect(item.name);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(item.name);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer select-none active:bg-sky-100 ${
                      isHighlighted ? 'bg-sky-50 text-[#0284C7]' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="truncate text-[13.5px] min-w-0">
                      {matchPos >= 0 && lowerQuery ? (
                        <>
                          {item.name.slice(0, matchPos)}
                          <strong className="text-[#0B192C] font-bold bg-amber-100/80 px-1 py-0.5 rounded">
                            {item.name.slice(matchPos, matchPos + lowerQuery.length)}
                          </strong>
                          {item.name.slice(matchPos + lowerQuery.length)}
                        </>
                      ) : (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </div>

                    <div className="shrink-0 ml-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          item.category === 'Major City'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.category === 'Industrial Hub'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-[12.5px] text-slate-500">
                No matching Karnataka district or industrial hub found for &quot;{value}&quot;. You can still use this location.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
