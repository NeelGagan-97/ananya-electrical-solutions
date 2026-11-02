import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  helperText,
  required,
  maxLength = 1000,
  value = '',
  className = '',
  id,
  ...rest
}) => {
  const textareaId = id || `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[13px] font-semibold text-[#0B192C]">
        <label htmlFor={textareaId} className="flex items-center gap-1 cursor-pointer">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {maxLength && (
          <span className="text-[11px] font-mono text-slate-400">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={textareaId}
        required={required}
        value={value}
        maxLength={maxLength}
        rows={3}
        className={`w-full py-2.5 px-3.5 text-[14px] text-slate-800 bg-[#F8FAFC] border rounded-lg transition-all outline-none resize-y placeholder:text-slate-400
          ${
            error
              ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-300 hover:border-slate-400 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 focus:bg-white'
          }
          ${className}`}
        {...rest}
      />

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
