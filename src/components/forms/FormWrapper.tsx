import React from 'react';
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
  // If submitted successfully, show branded Success Confirmation View
  if (submissionSuccess) {
    const waUrl = SubmissionService.buildWhatsAppUrl(submissionSuccess);
    const mailtoUrl = SubmissionService.buildMailtoUrl(submissionSuccess);

    return (
      <div className="p-6 md:p-8 flex flex-col items-center text-center animate-fadeIn bg-white rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50">
          <span className="material-symbols-outlined text-[36px]">verified</span>
        </div>

        <span className="text-[12px] uppercase tracking-widest font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
          Enquiry Registered Successfully
        </span>

        <h3 className="text-[22px] md:text-[24px] font-bold text-[#0B192C]">
          Thank You, {submissionSuccess.customerName}!
        </h3>

        <p className="text-[14px] text-slate-600 max-w-lg mt-2 leading-relaxed">
          Your enquiry for <strong className="text-[#0B192C]">{submissionSuccess.formTitle}</strong> has been received by our senior electrical engineering team.
        </p>

        {/* Reference ID Card */}
        <div className="w-full max-w-md my-6 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
              Enquiry Reference No.
            </span>
            <span className="text-[14px] font-mono font-bold text-[#0284C7] bg-[#0284C7]/10 px-2.5 py-0.5 rounded">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12.5px] text-slate-700">
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Contact</span>
              <span className="font-medium">{submissionSuccess.contactNumber}</span>
            </div>
            {submissionSuccess.email && (
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-medium truncate block">{submissionSuccess.email}</span>
              </div>
            )}
            {submissionSuccess.location && (
              <div>
                <span className="text-slate-400 block text-[11px]">Project Location</span>
                <span className="font-medium">{submissionSuccess.location}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                {submissionSuccess.status}
              </span>
            </div>
          </div>
        </div>

        {/* Fast Action Buttons */}
        <div className="w-full max-w-md flex flex-col gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Send Details to Engineering WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${AES_CONTACT_DETAILS.phoneDial}`}
              className="py-2.5 px-3 rounded-xl bg-[#0B192C] hover:bg-[#132A46] text-white font-semibold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#38BDF8]">call</span>
              <span>Call +91 9632025123</span>
            </a>

            <a
              href={mailtoUrl}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">email</span>
              <span>Official Email</span>
            </a>
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="mt-2 text-[12.5px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Submit Another Request
            </button>
          )}
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
