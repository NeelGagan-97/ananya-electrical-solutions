import React, { useState } from 'react';
import { EngineeringInquiry } from '../types';
import {
  BUSINESS_NAP,
  trackConversionEvent,
  buildWhatsAppInquiryUrl,
  buildMailtoInquiryUrl,
} from '../utils/seo';

interface ContactScreenProps {
  inquiries: EngineeringInquiry[];
  onSaveInquiry: (inquiry: EngineeringInquiry) => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ inquiries, onSaveInquiry }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('11kV-110kV Substation');
  const [location, setLocation] = useState('');
  const [loadDetails, setLoadDetails] = useState('');
  const [complianceCheck, setComplianceCheck] = useState(true);
  const [preferredChannel, setPreferredChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedInquiry, setLastSubmittedInquiry] = useState<EngineeringInquiry | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(cleanedPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g., +91 96320 25123).');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError(null);
    const newId = `AES-REQ-${Math.floor(100000 + Math.random() * 900000)}`;

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
      preferredChannel,
    };

    onSaveInquiry(inquiry);
    setLastSubmittedInquiry(inquiry);
    trackConversionEvent('quote_form_submit', `${category} - ${location || 'Bengaluru'}`, 'ContactScreen');
    setSubmitted(true);
    setName('');
    setPhone('');
    setEmail('');
    setLocation('');
    setLoadDetails('');
  };

  const faqs = [
    {
      q: 'What is the advantage of hiring a Super Grade Electrical Contractor in Bengaluru, Karnataka?',
      a: 'A Super Grade License is the highest category awarded by the Electrical Inspectorate, Government of Karnataka. It authorizes Ananya Electrical Solutions to execute electrical works of all voltages (from Low Tension 415V up to 11kV, 33kV, 66kV, and 110kV+ Extra High Tension) without restriction, and represent clients directly for CEIG drawing sanctions and BESCOM/KPTCL safety clearance certificates.',
    },
    {
      q: 'Where is Ananya Electrical Solutions located and which areas in Bengaluru & Karnataka do you serve?',
      a: 'Our registered headquarters is at 59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru, Karnataka 560092. We serve all residential, commercial, and industrial corridors across Bengaluru (Sahakarnagar, Hebbal, Yelahanka, Peenya, Yeshwanthpur, Whitefield, Mahadevapura, Electronic City, Bommasandra, Devanahalli, Hosakote) and all 31 districts of Karnataka.',
    },
    {
      q: 'How long does it take to obtain CEIG Drawing Sanction & BESCOM Safety Clearance?',
      a: 'With properly prepared Single Line Diagrams (SLD), physical equipment clearances, and certified earth pit test reports, CEIG drawing sanction is typically obtained within 10–14 working days, and final safety inspection certification within 5–7 days following installation completion.',
    },
    {
      q: 'What is the maximum rooftop solar capacity allowed under BESCOM Net Metering?',
      a: 'Under current KERC and BESCOM regulations, industrial, commercial, and residential consumers can install grid-interactive rooftop solar up to 100% of their sanctioned connected load with bidirectional net metering.',
    },
    {
      q: 'How does an APFC panel eliminate BESCOM power factor penalty surcharges?',
      a: 'Electricity supply companies (BESCOM, MESCOM, HESCOM, GESCOM, CESC) penalize facilities whose average monthly power factor drops below 0.90. By installing microprocessor-controlled Automatic Power Factor Correction (APFC) panels with 7% detuned harmonic reactors, we maintain power factor between 0.98 and 0.99 unity, eliminating penalties and reducing kVA demand charges.',
    },
    {
      q: 'How can I schedule an on-site electrical inspection or request a quotation?',
      a: 'You can call or WhatsApp our primary engineering desk at +91 9632025123, call our 24/7 emergency breakdown hotline at +91 8660121438, email ananyaelectricalsolutions@gmail.com, or submit the engineering proposal form on this page.',
    },
  ];

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-14 lg:py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7]/15 text-[#F59E0B] text-[12px] font-semibold w-fit border border-[#F59E0B]/30 leading-none">
              <span className="material-symbols-outlined text-[16px] leading-none">contact_support</span>
              <span>Sahakarnagar Headquarters, Bengaluru • Pan-Karnataka Dispatch</span>
            </div>
            <h1 className="font-display-xl text-white font-extrabold tracking-tight">
              Contact Ananya Electrical Solutions — Sahakarnagar Headquarters, Bengaluru
            </h1>
            <p className="font-body-lg text-slate-300 max-w-2xl leading-relaxed">
              Connect directly with our Government Licensed Super Grade electrical engineers in Bengaluru for 11kV–110kV substations, HT/LT panels, commercial &amp; industrial wiring, rooftop solar EPC, CEIG approvals, and 24/7 emergency support.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-[#1E293B]/90 border border-slate-700/80 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5bb8fe] font-bold">
                  Direct Engineering Desk
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Response &lt; 4 Hrs
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Primary / WhatsApp</span>
                  <a
                    href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                    onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Contact Hero Card')}
                    className="text-[14px] font-bold text-[#F59E0B] hover:underline"
                  >
                    {BUSINESS_NAP.primaryPhone}
                  </a>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">24/7 Grid Hotline</span>
                  <a
                    href={`tel:${BUSINESS_NAP.secondaryPhoneTel}`}
                    onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.secondaryPhone, 'Contact Hero Card')}
                    className="text-[14px] font-bold text-white hover:underline"
                  >
                    {BUSINESS_NAP.secondaryPhone}
                  </a>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Headquarters</span>
                  <span className="text-[14px] font-bold text-[#38bdf8]">Sahakarnagar, BLR</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">PIN Code</span>
                  <span className="text-[14px] font-bold text-white">560092</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Contact info & Form */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Contact Details & Verified NAP */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="bg-[#0B192C] text-white p-8 rounded-2xl flex flex-col gap-6 shadow-md border border-slate-700">
              <span className="text-[12px] uppercase font-bold text-[#F59E0B] tracking-wider">
                Verified Business Contact Details (NAP)
              </span>

              {/* Primary Phone & WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">
                  Primary Engineering Desk &amp; WhatsApp
                </span>
                <a
                  href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                  onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Contact Card Primary')}
                  className="font-headline-md text-[22px] font-bold text-white hover:text-[#5bb8fe] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px] text-[#F59E0B]">call</span>
                  {BUSINESS_NAP.primaryPhone}
                </a>
              </div>

              {/* Secondary 24/7 Emergency Hotline */}
              <div className="pt-4 border-t border-slate-700/80 flex flex-col gap-1.5">
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">
                  24/7 Emergency Grid &amp; Breakdown Dispatch
                </span>
                <a
                  href={`tel:${BUSINESS_NAP.secondaryPhoneTel}`}
                  onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.secondaryPhone, 'Contact Card Secondary')}
                  className="text-[18px] font-bold text-slate-200 hover:text-[#5bb8fe] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-400">phone_in_talk</span>
                  {BUSINESS_NAP.secondaryPhone}
                </a>
              </div>

              {/* Official Email */}
              <div className="pt-4 border-t border-slate-700/80 flex flex-col gap-1.5">
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">Official Email</span>
                <a
                  href={`mailto:${BUSINESS_NAP.email}`}
                  onClick={() => trackConversionEvent('email_click', BUSINESS_NAP.email, 'Contact Card Email')}
                  className="text-[15px] font-bold text-white hover:text-[#5bb8fe] flex items-center gap-2 transition-colors break-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#5bb8fe]">mail</span>
                  {BUSINESS_NAP.email}
                </a>
              </div>

              {/* Direct WhatsApp & Google Maps Buttons */}
              <div className="pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/${BUSINESS_NAP.whatsappNumber}?text=Hello%20Ananya%20Electrical%20Solutions%2C%20I%20would%20like%20to%20request%20an%20electrical%20or%20solar%20quotation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackConversionEvent('whatsapp_click', BUSINESS_NAP.primaryPhone, 'Contact Card WhatsApp')}
                  className="p-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 transition-colors text-[13px] font-bold shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>WhatsApp Us</span>
                </a>
                <a
                  href={BUSINESS_NAP.googleMapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white flex items-center justify-center gap-2 transition-colors text-[13px] font-bold shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  <span>Google Maps</span>
                </a>
              </div>

              {/* Registered Office Address */}
              <address className="not-italic pt-4 border-t border-slate-700/80 flex flex-col gap-1.5">
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">
                  Registered Office &amp; Operations Headquarters
                </span>
                <p className="text-[14px] text-slate-200 leading-relaxed font-medium">
                  <strong className="text-white block">{BUSINESS_NAP.name}</strong>
                  {BUSINESS_NAP.fullAddress}
                </p>
                <span className="text-[12px] text-slate-400 mt-1">{BUSINESS_NAP.openingHours}</span>
              </address>
            </div>

            {/* Key Service Corridors in Bengaluru & Karnataka */}
            <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] flex flex-col gap-4 shadow-sm">
              <h2 className="font-headline-sm text-[#0B192C] font-bold">
                Bengaluru &amp; Karnataka Service Coverage
              </h2>
              <div className="flex flex-col gap-2.5 text-[13px] text-[#44474c]">
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Bengaluru North &amp; Airport Corridor (HQ Zone):</strong>
                  <span>Sahakarnagar, Hebbal, Yelahanka, Jakkur, Devanahalli KIADB, Doddaballapur</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Bengaluru West &amp; Manufacturing Belt:</strong>
                  <span>Peenya Industrial Area (Phases 1–4), Yeshwanthpur, Nelamangala, Dabaspet, Bidadi</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Bengaluru East, South &amp; Tech Corridors:</strong>
                  <span>Whitefield, Mahadevapura, Hosakote, Electronic City, Bommasandra, Jigani</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Statewide Karnataka Industrial Hubs:</strong>
                  <span>Mysuru, Tumakuru, Hubballi-Dharwad, Mangaluru, Belagavi, Ballari, Shivamogga</span>
                </div>
              </div>
            </div>

            {/* Inquiries saved in this session */}
            {inquiries.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-[16px] text-[#0B192C] font-bold">Your Logged Inquiries</h3>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {inquiries.length} Saved
                  </span>
                </div>
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0] text-[12px]">
                      <div className="flex justify-between font-mono font-bold text-[#0284C7]">
                        <span>{inq.id}</span>
                        <span className="text-slate-400 font-normal">{inq.timestamp}</span>
                      </div>
                      <div className="font-semibold text-[#0B192C] mt-1">{inq.category}</div>
                      <div className="text-slate-500">{inq.location} • {inq.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#CBD5E1] shadow-sm flex flex-col justify-center">
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[12px] uppercase font-bold text-[#0284C7] tracking-wider">
                Request a Quote or Site Inspection
              </span>
              <h2 className="font-headline-md text-[#0B192C] font-bold">
                Submit an Engineering Proposal Request
              </h2>
              <p className="text-[14px] text-[#44474c]">
                Provide your electrical load requirements, substation/panel specifications, or rooftop solar site details for a certified technical estimate from our Sahakarnagar engineering desk.
              </p>
            </div>

            {submitted && lastSubmittedInquiry && (
              <div className="mb-6 p-5 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px] shrink-0">check_circle</span>
                  <div className="flex flex-col text-[13.5px]">
                    <strong className="font-bold">
                      Inquiry Registered (Ref: {lastSubmittedInquiry.id})
                    </strong>
                    <span>
                      Your project parameters have been logged. Click below to also send this inquiry directly to our WhatsApp or Official Email for immediate priority action:
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={buildWhatsAppInquiryUrl(lastSubmittedInquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackConversionEvent('whatsapp_click', `Form WhatsApp ${lastSubmittedInquiry.id}`, 'ContactScreen')
                    }
                    className="h-11 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Send via WhatsApp ({BUSINESS_NAP.primaryPhone})</span>
                  </a>
                  <a
                    href={buildMailtoInquiryUrl(lastSubmittedInquiry)}
                    onClick={() =>
                      trackConversionEvent('email_click', `Form Email ${lastSubmittedInquiry.id}`, 'ContactScreen')
                    }
                    className="h-11 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    <span>Send via Email</span>
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Contact Person / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Precision Components Ltd."
                    className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Mobile Phone (+91) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 96320 25123"
                    className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Site Location in Bengaluru / Karnataka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sahakarnagar / Peenya / Whitefield"
                    className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Required Electrical or Solar Service <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white cursor-pointer"
                >
                  <option value="11kV-110kV Substation">11kV – 110kV Substation &amp; Transformer Erection</option>
                  <option value="HT / LT Switchgear Panels">HT / LT Distribution Panels (PCC, MCC, APFC, VCB, ACB)</option>
                  <option value="Statutory CEIG & BESCOM Approvals">BESCOM / KPTCL Liaison &amp; CEIG Statutory Approvals</option>
                  <option value="Commercial & Industrial Wiring">Commercial, Industrial &amp; Residential Turnkey Wiring</option>
                  <option value="Earthing, Energy Audit & AMC">Chemical Earthing, Lightning Protection &amp; 24/7 AMC</option>
                  <option value="Solar EPC Turnkey">Turnkey Rooftop / Ground-Mount Solar EPC &amp; Net Metering</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Connected Load or Project Scope Details
                </label>
                <textarea
                  rows={4}
                  value={loadDetails}
                  onChange={(e) => setLoadDetails(e.target.value)}
                  placeholder="Specify transformer kVA rating, HT voltage level, building/factory area, target energization timeline, or questions for our engineers..."
                  className="p-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Preferred Instant Dispatch Channel
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('whatsapp')}
                    className={`h-10 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      preferredChannel === 'whatsapp'
                        ? 'bg-[#25D366]/15 border-[#25D366] text-[#0B192C]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#44474c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#16a34a]">chat</span>
                    <span>WhatsApp ({BUSINESS_NAP.primaryPhone})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('email')}
                    className={`h-10 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      preferredChannel === 'email'
                        ? 'bg-[#0284C7]/15 border-[#0284C7] text-[#0B192C]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#44474c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0284C7]">mail</span>
                    <span>Official Email</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="contact-compliance"
                  checked={complianceCheck}
                  onChange={(e) => setComplianceCheck(e.target.checked)}
                  className="w-4 h-4 accent-[#0284C7] rounded cursor-pointer"
                />
                <label htmlFor="contact-compliance" className="text-[13px] text-[#44474c] cursor-pointer">
                  Request Single Line Diagram (SLD) &amp; compliance review per Karnataka Electrical Inspectorate norms.
                </label>
              </div>

              {formError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[13px] font-medium flex items-center gap-2" role="alert">
                  <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                className="h-12 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white font-semibold text-[14px] shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Submit Engineering Proposal Request
              </button>
            </form>
          </div>
        </div>

        {/* Interactive Google Map Section for Verified Sahakarnagar HQ */}
        <div className="rounded-2xl bg-white border border-[#CBD5E1] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 p-8 flex flex-col justify-between gap-6 bg-[#f8f9ff] border-b lg:border-b-0 lg:border-r border-[#CBD5E1]">
            <div className="flex flex-col gap-3">
              <span className="text-[12px] uppercase font-bold text-[#0284C7] tracking-wider">
                Verified Local Headquarters
              </span>
              <h2 className="font-headline-md text-[#0B192C] font-bold">
                Visit Our Sahakarnagar Office in Bengaluru
              </h2>
              <p className="text-[14px] text-[#44474c] leading-relaxed">
                Conveniently located on Sahakarnagar Main Road (Opposite Bank of India, G-Block) with rapid access to Hebbal, Yelahanka, Peenya Industrial Area, Devanahalli, and all major Bengaluru arterial highways.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-[13px] text-[#0B192C]">
              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="text-[11px] uppercase text-slate-500 font-semibold block">Registered Address</span>
                <strong>{BUSINESS_NAP.fullAddress}</strong>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="text-[11px] uppercase text-slate-500 font-semibold block">Primary Phone</span>
                  <a
                    href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                    onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Contact Map Section')}
                    className="font-bold text-[#0284C7] hover:underline"
                  >
                    {BUSINESS_NAP.primaryPhone}
                  </a>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                  <span className="text-[11px] uppercase text-slate-500 font-semibold block">24/7 Emergency</span>
                  <a
                    href={`tel:${BUSINESS_NAP.secondaryPhoneTel}`}
                    onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.secondaryPhone, 'Contact Map Section')}
                    className="font-bold text-[#0B192C] hover:underline"
                  >
                    {BUSINESS_NAP.secondaryPhone}
                  </a>
                </div>
              </div>
            </div>

            <a
              href={BUSINESS_NAP.googleMapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-xl bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>Open Verified Location in Google Maps</span>
            </a>
          </div>

          <div className="lg:col-span-7 min-h-[360px] w-full bg-slate-100 relative">
            <iframe
              title="Ananya Electrical Solutions Sahakarnagar Bengaluru Office Location Map"
              src={BUSINESS_NAP.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[360px] border-0"
            />
          </div>
        </div>

        {/* Technical & Customer FAQ Accordion */}
        <div className="flex flex-col gap-6 pt-8 border-t border-[#E2E8F0]">
          <div>
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              Electrical Contracting, CEIG Approvals &amp; Solar EPC FAQs
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-[#CBD5E1] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#f8f9ff]"
                  >
                    <h3 className="font-semibold text-[#0B192C] text-[15px]">{faq.q}</h3>
                    <span className="material-symbols-outlined text-[#0284C7] text-[20px] shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[14px] text-[#44474c] leading-relaxed border-t border-[#E2E8F0]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
