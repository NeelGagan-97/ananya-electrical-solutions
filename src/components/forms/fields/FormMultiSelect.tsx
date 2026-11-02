import React from 'react';

export interface FormMultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
}

export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  error,
  helperText,
  required,
  containerClassName = '',
}) => {
  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold text-slate-800">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {selectedValues.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                isSelected
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                  isSelected
                    ? 'bg-white text-[#0284C7] border-white'
                    : 'border-slate-400 bg-white'
                }`}
              >
                {isSelected ? '✓' : ''}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-[12px] text-red-600 flex items-center gap-1 font-medium mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
