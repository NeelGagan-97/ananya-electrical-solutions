import React from 'react';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  name,
  prefix,
  suffix,
  className = '',
  containerClassName = '',
  ...rest
}) => {
  const inputId = id || name || label.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      <label htmlFor={inputId} className="text-[13px] font-semibold text-slate-800 flex items-center justify-between">
        <span>
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </span>
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 flex items-center pointer-events-none text-slate-500 text-sm">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-lg border text-sm text-slate-900 bg-white px-3.5 py-2.5 transition-all outline-none placeholder:text-slate-400 ${
            prefix ? 'pl-9' : ''
          } ${suffix ? 'pr-9' : ''} ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 hover:border-slate-400'
          } ${className}`}
          {...rest}
        />
        {suffix && (
          <div className="absolute right-3 flex items-center text-slate-500 text-sm">
            {suffix}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-[12px] text-red-600 flex items-center gap-1 font-medium mt-0.5">
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
