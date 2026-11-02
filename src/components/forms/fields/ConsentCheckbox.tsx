import React from 'react';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onChange,
  error,
  label = 'I agree to allow Ananya Electrical Solutions to review my technical details and contact me regarding this electrical enquiry via phone, WhatsApp, or official email.',
  required = true,
}) => {
  return (
    <div className="w-full flex flex-col gap-1 pt-1">
      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded transition-all flex items-center justify-center border ${
              checked
                ? 'bg-[#0284C7] border-[#0284C7] text-white shadow-xs'
                : error
                ? 'border-red-400 bg-red-50/50 group-hover:border-red-500'
                : 'border-slate-300 bg-white group-hover:border-[#0284C7]'
            }`}
          >
            {checked && (
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
            )}
          </div>
        </div>
        <span className="text-[12px] leading-relaxed text-slate-600 group-hover:text-slate-900">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </span>
      </label>

      {error ? (
        <p className="text-[11.5px] font-medium text-red-600 flex items-center gap-1 mt-0.5 ml-6 animate-fadeIn">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
};
