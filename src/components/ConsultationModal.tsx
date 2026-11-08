import React, { useState, useEffect } from 'react';
import { EngineeringInquiry } from '../types';
import {
  BUSINESS_NAP,
  trackConversionEvent,
  buildWhatsAppInquiryUrl,
  buildMailtoInquiryUrl,
} from '../utils/seo';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  onSaveInquiry: (inquiry: EngineeringInquiry) => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialService = '',
  onSaveInquiry,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(initialService || 'substation');
  const [location, setLocation] = useState('');
  const [loadDetails, setLoadDetails] = useState('');
  const [complianceCheck, setComplianceCheck] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [lastInquiry, setLastInquiry] = useState<EngineeringInquiry | null>(null);

  useEffect(() => {
    if (initialService) {
      const lower = initialService.toLowerCase();
      if (lower.includes('wiring')) {
        setCategory('home-wiring');
      } else if (lower.includes('earth') || lower.includes('ground')) {
        setCategory('earthing-grounding');
      } else if (lower.includes('automat') || lower.includes('smart')) {
        setCategory('home-automation');
      } else if (lower.includes('layout') || lower.includes('electrification')) {
        setCategory('layout-electrification');
      } else if (lower.includes('solar')) {
        setCategory('solar');
      } else if (lower.includes('panel') || lower.includes('switchboard')) {
        setCategory('panels');
      } else if (lower.includes('audit')) {
        setCategory('audit');
      } else if (lower.includes('statutory') || lower.includes('ceig')) {
        setCategory('statutory');
      } else if (lower.includes('testing') || lower.includes('hipot')) {
        setCategory('testing');
      } else if (lower.includes('amc') || lower.includes('maintenance')) {
        setCategory('amc');
      } else {
        setCategory(initialService);
      }
    }
  }, [initialService]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(cleanedPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g., +91 97434 61955).');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError(null);
    const newId = `AES-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    setInquiryId(newId);

    const inquiry: EngineeringInquiry = {
      id: newId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      category,
      location: location.trim(),
      loadDetails: loadDetails.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      complianceConfirmed: complianceCheck,
    };

    onSaveInquiry(inquiry);
    setLastInquiry(inquiry);
    trackConversionEvent('quote_form_submit', `${category} (${location || 'Bengaluru'})`, 'ConsultationModal');
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setLocation('');
    setLoadDetails('');
    setSubmitted(false);
    setLastInquiry(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#CBD5E1]">
        {/* Header */}
        <div className="bg-[#0B192C] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0284C7]/20 flex items-center justify-center text-[#5bb8fe]">
              <span className="material-symbols-outlined text-[24px]">request_quote</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] px-2 py-0.5 rounded bg-[#FEF3C7]/15">
                  Super Grade Desk
                </span>
                <span className="text-[12px] text-slate-300">Sahakarnagar HQ, Bengaluru</span>
              </div>
              <h3 className="font-display text-[18px] sm:text-[20px] font-bold">
                Request Engineering Proposal &amp; Site Quote
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close consultation modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="flex flex-col py-1 gap-4">
              {/* Exact Success Confirmation Banner matching image_9da76995.png */}
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-body-sm flex flex-col gap-3 border border-emerald-200 text-left">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>
                    <strong>Inquiry Logged ({inquiryId}):</strong> Our Class 1 engineering team will contact you within 4 business hours. Click below to immediately transmit your structured enquiry to our engineering desk:
                  </span>
                </div>
                {lastInquiry && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={buildWhatsAppInquiryUrl(lastInquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackConversionEvent('whatsapp_click', `Modal WhatsApp ${lastInquiry.id}`, 'ConsultationModal')
                      }
                      className="h-10 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>Send on WhatsApp ({BUSINESS_NAP.primaryPhone})</span>
                    </a>
                    <a
                      href={buildMailtoInquiryUrl(lastInquiry)}
                      onClick={() =>
                        trackConversionEvent('email_click', `Modal Email ${lastInquiry.id}`, 'ConsultationModal')
                      }
                      className="h-10 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      <span>Send via Official Email</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-xl p-4 text-left text-[13px] text-[#44474c] flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-semibold text-[#0B192C]">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Contact:</span>
                  <span className="font-semibold text-[#0B192C]">{name} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location in Karnataka:</span>
                  <span className="font-semibold text-[#0B192C]">{location || 'Bengaluru, Karnataka'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Engineering Desk:</span>
                  <span className="font-semibold text-[#0284C7]">{BUSINESS_NAP.primaryPhone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[12.5px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Submit Another Consultation Request
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-[#0B192C] text-white text-[13px] font-semibold hover:bg-[#006398] transition-colors cursor-pointer"
                >
                  Close &amp; Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="p-3.5 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-[#44474c]">
                <span>
                  Direct Call / WhatsApp: <strong className="text-[#0B192C]">{BUSINESS_NAP.primaryPhone}</strong>
                </span>
                <span>
                  Email: <strong className="text-[#0284C7]">{BUSINESS_NAP.email}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="consultation-name" className="text-[13px] font-semibold text-[#0B192C]">
                    Your Name / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="consultation-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Precision Components Pvt Ltd"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="consultation-phone" className="text-[13px] font-semibold text-[#0B192C]">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="consultation-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 96320 25123"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="consultation-category" className="text-[13px] font-semibold text-[#0B192C]">
                    Project Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="consultation-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white cursor-pointer"
                  >
                    <optgroup label="Residential Electrical Services">
                      <option value="home-wiring">Home Wiring &amp; Rewiring</option>
                      <option value="earthing-grounding">Earthing and Grounding (Safety Systems)</option>
                      <option value="home-automation">Smart Home Automation &amp; Controls</option>
                      <option value="layout-electrification">New Layout Electrification (Turnkey Residential)</option>
                    </optgroup>
                    <optgroup label="Commercial &amp; Industrial High Voltage">
                      <option value="substation">Substation / HT Distribution (11kV - 110kV)</option>
                      <option value="solar">Turnkey Solar EPC (Rooftop / Ground Mount)</option>
                      <option value="panels">LT Switchboards &amp; Control Panels (PCC/MCC)</option>
                      <option value="audit">Energy Audit &amp; Power Factor Correction (APFC)</option>
                      <option value="statutory">CEIG / BESCOM / KPTCL Statutory Liaison</option>
                      <option value="testing">Pre-Commissioning Hi-Pot &amp; Relay Testing</option>
                      <option value="amc">Industrial AMC &amp; Preventive Maintenance</option>
                    </optgroup>
                    <optgroup label="Solar Services">
                      <option value="solar-rooftop-ongrid">Roof Top On-Grid</option>
                      <option value="solar-hybrid">Hybrid</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="consultation-location" className="text-[13px] font-semibold text-[#0B192C]">
                    Project Location in Bengaluru / Karnataka <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="consultation-location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sahakarnagar / Peenya / Whitefield / Bommasandra"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="consultation-email" className="text-[13px] font-semibold text-[#0B192C]">
                    Official Email (Optional for Formal PDF Quotation)
                  </label>
                  <input
                    id="consultation-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="projects@yourcompany.com"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="consultation-notes" className="text-[13px] font-semibold text-[#0B192C]">
                  Project Scope &amp; Connected Load Details
                </label>
                <textarea
                  id="consultation-notes"
                  rows={3}
                  value={loadDetails}
                  onChange={(e) => setLoadDetails(e.target.value)}
                  placeholder="Specify connected load (e.g. 500 kVA, 100 kWp solar), transformer specs, site voltage level, target energization timeline..."
                  className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-compliance"
                  checked={complianceCheck}
                  onChange={(e) => setComplianceCheck(e.target.checked)}
                  className="w-4 h-4 accent-[#0284C7] rounded cursor-pointer"
                />
                <label htmlFor="modal-compliance" className="text-[13px] text-[#44474c] cursor-pointer">
                  I request technical compliance review according to Karnataka Electrical Inspectorate guidelines.
                </label>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[12.5px] font-medium flex items-center gap-2" role="alert">
                  <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] text-[#44474c] text-[13px] font-semibold hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Submit Engineering Inquiry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
