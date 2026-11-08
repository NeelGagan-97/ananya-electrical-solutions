import React, { useEffect, useState } from 'react';
import { BaseEnquirySubmission, FormId } from './types';
import { SubmissionService, AES_CONTACT_DETAILS } from './submissionService';

interface FormWrapperProps {
  formId: FormId;
  title: string;
  badge?: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  submissionSuccess?: BaseEnquirySubmission | null;
  onReset?: () => void;
  variant?: 'modal' | 'section' | 'inline';
  safetyNotice?: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  badge = 'Engineering Solutions',
  description,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'SUBMIT ENQUIRY',
  submissionSuccess = null,
  onReset,
  variant = 'modal',
  safetyNotice,
}) => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    const handleSubmissionError = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      setSubmissionError(customEvent.detail?.message || 'Your enquiry could not be sent to CRM. Please try again.');
    };
    window.addEventListener('aes:zoho-submission-error', handleSubmissionError);
    return () => window.removeEventListener('aes:zoho-submission-error', handleSubmissionError);
  }, []);

  // If submitted successfully, show branded Success Confirmation View matching image_9da76995.png
  if (submissionSuccess) {
    const waUrl = SubmissionService.buildWhatsAppUrl(submissionSuccess);
    const mailtoUrl = SubmissionService.buildMailtoUrl(submissionSuccess);

    return (
      <div className="p-5 sm:p-6 flex flex-col gap-4 animate-fadeIn bg-white rounded-2xl text-left">
        {/* Exact Success Confirmation Banner matching image */}
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-body-sm flex flex-col gap-3 border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>
              <strong>Inquiry Logged ({submissionSuccess.referenceNumber}):</strong> Our Class 1 engineering team will contact you within 4 business hours. Click below to immediately transmit your structured enquiry to our engineering desk:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Send on WhatsApp ({AES_CONTACT_DETAILS.phone})</span>
            </a>
            <a
              href={mailtoUrl}
              className="h-10 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Send via Official Email</span>
            </a>
          </div>
        </div>

        {/* Detailed Reference Summary */}
        <div className="w-full p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
              Enquiry Summary &bull; {submissionSuccess.formTitle}
            </span>
            <span className="text-[12.5px] font-mono font-bold text-[#0284C7] bg-[#0284C7]/10 px-2.5 py-0.5 rounded">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12.5px] text-slate-700">
            <div>
              <span className="text-slate-400 block text-[11px]">Customer / Entity</span>
              <span className="font-medium text-[#0B192C]">{submissionSuccess.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Contact</span>
              <span className="font-medium text-[#0B192C]">{submissionSuccess.contactNumber}</span>
            </div>
            {submissionSuccess.email && (
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-medium truncate block text-[#0B192C]">{submissionSuccess.email}</span>
              </div>
            )}
            {submissionSuccess.location && (
              <div>
                <span className="text-slate-400 block text-[11px]">Project Location</span>
                <span className="font-medium text-[#0B192C]">{submissionSuccess.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-[12.5px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Submit Another Request
            </button>
          )}
          <a
            href={`tel:${AES_CONTACT_DETAILS.phoneDial}`}
            className="text-[12.5px] text-[#0284C7] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Direct Call {AES_CONTACT_DETAILS.phone}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`w-full flex flex-col ${
        variant === 'section'
          ? 'bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden'
          : variant === 'inline'
          ? 'bg-white rounded-xl border border-slate-200 p-5 md:p-6'
          : 'bg-white'
      }`}
    >
      {/* Header (for section and inline variants) */}
      {variant !== 'modal' && (
        <div className="bg-[#0B192C] px-6 py-5 text-white border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
              {badge}
            </span>
          </div>
          <h2 className="text-[20px] md:text-[22px] font-bold text-white tracking-tight">{title}</h2>
          <p className="text-[13px] text-slate-300 mt-1 max-w-2xl leading-relaxed">{description}</p>
        </div>
      )}

      {submissionError && (
        <div role="alert" className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Enquiry not sent to CRM.</strong> {submissionError}
        </div>
      )}

      {/* Safety Notice Banner (used in Emergency Form) */}
      {safetyNotice && <div className="px-6 pt-4">{safetyNotice}</div>}

      {/* Scrollable Form Body */}
      <div className={`flex-1 ${variant === 'modal' ? 'p-6 md:p-8 space-y-5' : 'p-6 md:p-8 space-y-5'}`}>
        {children}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Official Contractor License: Super Grade (Karnataka)
          </span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#075985] text-white font-bold text-[13px] tracking-wide uppercase shadow-lg shadow-[#0284C7]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>PROCESSING...</span>
            </>
          ) : (
            <>
              <span>{submitButtonText}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
