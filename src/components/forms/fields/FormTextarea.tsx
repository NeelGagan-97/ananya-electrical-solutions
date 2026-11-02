import React from 'react';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  showCharCount?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  name,
  rows = 3,
  maxLength,
  value,
  showCharCount = false,
  className = '',
  containerClassName = '',
  ...rest
}) => {
  const textareaId = id || name || label.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const currentLen = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={textareaId} className="text-[13px] font-semibold text-slate-800">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {showCharCount && maxLength && (
          <span className="text-[11px] text-slate-400 font-mono">
            {currentLen}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={`w-full rounded-lg border text-sm text-slate-900 bg-white p-3 transition-all outline-none placeholder:text-slate-400 resize-y min-h-[80px] ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 hover:border-slate-400'
        } ${className}`}
        {...rest}
      />

      {error ? (
        <p id={`${textareaId}-error`} className="text-[12px] text-red-600 flex items-center gap-1 font-medium mt-0.5">
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
