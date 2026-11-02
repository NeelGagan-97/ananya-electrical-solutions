import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | SelectOption)[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  containerClassName?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  error,
  helperText,
  required,
  placeholder = 'Select an option...',
  id,
  name,
  className = '',
  containerClassName = '',
  ...rest
}) => {
  const selectId = id || name || label.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      <label htmlFor={selectId} className="text-[13px] font-semibold text-slate-800 flex items-center justify-between">
        <span>
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </span>
      </label>

      <div className="relative flex items-center">
        <select
          id={selectId}
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`w-full rounded-lg border text-sm text-slate-900 bg-white px-3.5 py-2.5 pr-10 appearance-none cursor-pointer transition-all outline-none ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 hover:border-slate-400'
          } ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val} className="text-slate-900">
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-slate-500 flex items-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-[12px] text-red-600 flex items-center gap-1 font-medium mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
