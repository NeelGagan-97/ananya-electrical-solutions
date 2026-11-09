import React, { useState, useRef, useEffect } from 'react';
import {
  KARNATAKA_PROJECT_LOCATIONS,
  getMatchingKarnatakaLocations,
  KarnatakaLocationItem,
} from '../../../data/karnatakaLocations';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: string;
  required?: boolean;
  suggestions?: string[];
  enableLocationSuggestions?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  icon,
  required,
  className = '',
  id,
  suggestions,
  enableLocationSuggestions,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const isLocationField =
    enableLocationSuggestions !== undefined
      ? enableLocationSuggestions
      : label.toLowerCase().includes('location') || label.toLowerCase().includes('site');

  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputValue = typeof value === 'string' ? value : '';

  // Get matching suggestions
  const matchingLocations: KarnatakaLocationItem[] = isLocationField
    ? getMatchingKarnatakaLocations(inputValue)
    : [];

  const customFilteredSuggestions: string[] = suggestions
    ? suggestions.filter((s) => s.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 8)
    : [];

  const hasSuggestions = isLocationField
    ? matchingLocations.length > 0
    : customFilteredSuggestions.length > 0;

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectSuggestion = (selectedText: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: selectedText, name: rest.name },
        currentTarget: { value: selectedText, name: rest.name },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setHighlightIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) onKeyDown(e);

    if (!isOpen || !hasSuggestions) {
      if (e.key === 'ArrowDown' && (isLocationField || suggestions)) {
        setIsOpen(true);
        setHighlightIndex(0);
        e.preventDefault();
      }
      return;
    }

    const itemsCount = isLocationField ? matchingLocations.length : customFilteredSuggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < itemsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : itemsCount - 1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < itemsCount) {
        e.preventDefault();
        const selected = isLocationField
          ? matchingLocations[highlightIndex].name
          : customFilteredSuggestions[highlightIndex];
        selectSuggestion(selected);
      }
    } else if (e.key === 'Tab') {
      // If typing "Ban" or "Kol", pressing tab can auto-fill the top prefix match
      if (itemsCount > 0 && inputValue.trim().length >= 2) {
        const topItem = isLocationField ? matchingLocations[0].name : customFilteredSuggestions[0];
        if (topItem.toLowerCase().startsWith(inputValue.trim().toLowerCase())) {
          selectSuggestion(topItem);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1.5 relative">
      <label htmlFor={inputId} className="text-[13px] font-semibold text-[#0B192C] flex items-center justify-between">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </span>
        {isLocationField && (
          <span className="text-[11px] text-[#0284C7] font-medium hidden sm:inline-block">
            Auto-suggests Karnataka districts &amp; hubs
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400 pointer-events-none select-none z-10">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          required={required}
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e);
            if (!isOpen) setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={(e) => {
            if (onFocus) onFocus(e);
            if (isLocationField || suggestions) {
              setIsOpen(true);
            }
          }}
          onBlur={(e) => {
            if (onBlur) onBlur(e);
          }}
          onKeyDown={handleInputKeyDown}
          autoComplete={isLocationField ? 'off' : rest.autoComplete}
          list={isLocationField ? 'karnataka-project-locations-list' : undefined}
          className={`w-full py-2.5 px-3.5 text-[14px] text-slate-800 bg-[#F8FAFC] border rounded-lg transition-all outline-none placeholder:text-slate-400
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 focus:bg-white'
            }
            ${className}`}
          {...rest}
        />
      </div>

      {/* Interactive Autocomplete Suggestions Dropdown */}
      {isOpen && (isLocationField || suggestions) && hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>{isLocationField ? 'Select Project Location' : 'Suggested Values'}</span>
            <span className="text-[10px] text-slate-400 font-normal">Press Tab / Enter or click to fill</span>
          </div>

          {isLocationField
            ? matchingLocations.map((item, index) => {
                const isHighlighted = index === highlightIndex;
                const lowerName = item.name.toLowerCase();
                const lowerQuery = inputValue.trim().toLowerCase();
                const matchPos = lowerQuery ? lowerName.indexOf(lowerQuery) : -1;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectSuggestion(item.name)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isHighlighted ? 'bg-sky-50 text-[#0284C7]' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 ${
                          isHighlighted ? 'text-[#0284C7]' : 'text-slate-400'
                        }`}
                      >
                        location_on
                      </span>
                      <div className="truncate text-[13.5px]">
                        {matchPos >= 0 && lowerQuery ? (
                          <>
                            {item.name.slice(0, matchPos)}
                            <strong className="text-[#0B192C] font-bold bg-amber-100/70 px-0.5 rounded">
                              {item.name.slice(matchPos, matchPos + lowerQuery.length)}
                            </strong>
                            {item.name.slice(matchPos + lowerQuery.length)}
                          </>
                        ) : (
                          <span>{item.name}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10.5px] px-2 py-0.5 rounded font-medium shrink-0 ml-2 ${
                        item.category === 'Major City'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.category === 'Industrial Hub'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.category}
                    </span>
                  </button>
                );
              })
            : customFilteredSuggestions.map((item, index) => {
                const isHighlighted = index === highlightIndex;
                return (
                  <button
                    key={item}
                    type="button"
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectSuggestion(item)}
                    className={`w-full px-3.5 py-2.5 text-left text-[13.5px] flex items-center gap-2 transition-colors cursor-pointer ${
                      isHighlighted ? 'bg-sky-50 text-[#0284C7]' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-400">check</span>
                    <span>{item}</span>
                  </button>
                );
              })}
        </div>
      )}

      {/* Fallback Native HTML Datalist for universal browser autofill */}
      {isLocationField && (
        <datalist id="karnataka-project-locations-list">
          {KARNATAKA_PROJECT_LOCATIONS.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.category}
            </option>
          ))}
        </datalist>
      )}

      {error ? (
        <p className="text-[11.5px] font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11.5px] text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
