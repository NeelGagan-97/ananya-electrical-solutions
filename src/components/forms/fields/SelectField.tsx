import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | SelectOption)[];
  error?: string;
  helperText?: string;
  icon?: string;
  required?: boolean;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  helperText,
  icon,
  required,
  placeholder = 'Select an option...',
  className = '',
  id,
  value,
  ...rest
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-[13px] font-semibold text-[#0B192C] flex items-center justify-between">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </span>
      </label>

      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400 pointer-events-none select-none">
            {icon}
          </span>
        )}
        <select
          id={selectId}
          required={required}
          value={value}
          className={`w-full py-2.5 px-3.5 text-[14px] text-slate-800 bg-[#F8FAFC] border rounded-lg transition-all outline-none appearance-none cursor-pointer pr-10
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 focus:bg-white'
            }
            ${!value ? 'text-slate-400' : 'text-slate-800'}
            ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-800 py-1 bg-white">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 text-[20px] text-slate-400 pointer-events-none">
          expand_more
        </span>
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
