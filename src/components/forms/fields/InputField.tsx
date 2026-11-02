import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  icon,
  required,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[13px] font-semibold text-[#0B192C] flex items-center justify-between">
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
        <input
          id={inputId}
          required={required}
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
