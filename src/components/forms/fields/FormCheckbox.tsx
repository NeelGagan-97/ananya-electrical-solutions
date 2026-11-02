import React from 'react';

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  name,
  className = '',
  containerClassName = '',
  ...rest
}) => {
  const checkboxId = id || name || 'checkbox-' + Math.random().toString(36).substring(2, 7);

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer text-[13px] text-slate-700 leading-snug select-none">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          required={required}
          className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7] focus:ring-offset-0 cursor-pointer transition-all ${
            error ? 'border-red-400 ring-1 ring-red-400' : ''
          } ${className}`}
          {...rest}
        />
        <div className="flex-1">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </div>
      </label>

      {error ? (
        <p className="text-[12px] text-red-600 flex items-center gap-1 font-medium pl-6">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 pl-6.5">{helperText}</p>
      ) : null}
    </div>
  );
};
