import React from 'react';

interface MultiSelectFieldProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (newSelected: string[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  error,
  helperText,
  required,
}) => {
  const toggleOption = (opt: string) => {
    if (selectedValues.includes(opt)) {
      onChange(selectedValues.filter((v) => v !== opt));
    } else {
      onChange([...selectedValues, opt]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px] font-semibold text-[#0B192C]">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
          {selectedValues.length > 0 && (
            <span className="ml-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#0284C7]/15 text-[#0284C7]">
              {selectedValues.length} selected
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-[11px] text-[#0284C7] hover:underline font-medium cursor-pointer"
        >
          {selectedValues.length === options.length ? 'Clear all' : 'Select all'}
        </button>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-xl border transition-all ${
          error
            ? 'border-red-400 bg-red-50/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggleOption(opt)}
              className={`flex items-center gap-2.5 p-2 rounded-lg text-left text-[12.5px] transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-white border-[#0284C7] text-[#0B192C] shadow-sm font-medium'
                  : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                  isSelected ? 'bg-[#0284C7] border-[#0284C7] text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && (
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                )}
              </div>
              <span className="flex-1 leading-tight">{opt}</span>
            </button>
          );
        })}
      </div>

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
