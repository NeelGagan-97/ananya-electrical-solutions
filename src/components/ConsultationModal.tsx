import React, { useState, useEffect } from 'react';
import { EngineeringInquiry } from '../types';

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
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');

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
    const newId = `AES-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    setInquiryId(newId);

    const inquiry: EngineeringInquiry = {
      id: newId,
      name,
      phone,
      email,
      category,
      location,
      loadDetails,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      complianceConfirmed: complianceCheck
    };

    onSaveInquiry(inquiry);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setLocation('');
    setLoadDetails('');
    setSubmitted(false);
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
                <span className="text-[12px] text-slate-300">Karnataka Electrical Inspectorate</span>
              </div>
              <h3 className="font-display text-[18px] sm:text-[20px] font-bold">
                Request Engineering Proposal &amp; Feasibility
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-mono text-[#0284C7] font-bold tracking-wider">
                  REFERENCE NUMBER: {inquiryId}
                </span>
                <h4 className="font-display text-[22px] font-bold text-[#0B192C]">
                  Technical Inquiry Registered
                </h4>
                <p className="text-[14px] text-[#44474c] max-w-md mt-1 leading-relaxed">
                  Thank you, <strong className="text-[#0B192C]">{name}</strong>. Your facility requirements have been dispatched to our Super Grade engineering desk. A certified engineer will contact you at <strong className="text-[#0B192C]">{phone}</strong> within 4 business hours with an initial single-line feasibility review.
                </p>
              </div>

              <div className="w-full bg-[#f8f9ff] border border-[#E2E8F0] rounded-xl p-4 text-left text-[13px] text-[#44474c] flex flex-col gap-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-semibold text-[#0B192C]">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location in Karnataka:</span>
                  <span className="font-semibold text-[#0B192C]">{location || 'Peenya / Bengaluru'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspectorate Compliance:</span>
                  <span className="font-semibold text-emerald-600">Standard CEIG / KERC Protocol</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 rounded-lg bg-[#0B192C] text-white text-[14px] font-semibold hover:bg-[#006398] transition-colors"
              >
                Close &amp; Return to Workspace
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <p className="text-[13px] text-[#44474c]">
                Submit your project parameters for an immediate feasibility check, transformer sizing, statutory sanction guidance, and budgetary engineering estimate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Your Name / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Precision Components Pvt Ltd"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Project Category <span className="text-red-500">*</span>
                  </label>
                  <select
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
                      <option value="statutory">CEIG / KPTCL Statutory Liaison &amp; Sanctions</option>
                      <option value="testing">Pre-Commissioning Hi-Pot &amp; Relay Testing</option>
                      <option value="amc">Industrial AMC &amp; Preventive Maintenance</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Project Location in Karnataka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Peenya / Bommasandra / Hosakote"
                    className="h-11 px-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Project Scope &amp; Connected Load Details
                </label>
                <textarea
                  rows={3}
                  value={loadDetails}
                  onChange={(e) => setLoadDetails(e.target.value)}
                  placeholder="Specify connected load (e.g. 1.5 MVA, 500 kWp solar), transformer specs, site voltage level, target energization timeline..."
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
                  I request technical compliance review according to Karnataka Inspectorate guidelines.
                </label>
              </div>

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
