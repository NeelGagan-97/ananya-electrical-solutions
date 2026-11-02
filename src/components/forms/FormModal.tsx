import React, { useEffect } from 'react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  description: string;
  children: React.ReactNode;
  icon?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  badge = 'Engineering Service Request',
  description,
  children,
  icon = 'engineering',
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aes-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#0B192C]/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 animate-scaleUp">
        {/* Dark Navy-Blue Header */}
        <div className="bg-[#0B192C] px-6 py-5 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-start gap-3.5 pr-4">
            <div className="w-11 h-11 rounded-xl bg-[#0284C7]/20 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                  {badge}
                </span>
                <span className="text-[11px] text-slate-400">Govt. Super Grade Contractor</span>
              </div>
              <h2 id="aes-form-modal-title" className="text-[19px] sm:text-[21px] font-bold text-white tracking-tight leading-snug">
                {title}
              </h2>
              <p className="text-[12.5px] sm:text-[13px] text-slate-300 mt-1 max-w-xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-700"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
