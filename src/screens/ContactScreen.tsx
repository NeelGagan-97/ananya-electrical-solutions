import React, { useState } from 'react';
import { EngineeringInquiry } from '../types';

interface ContactScreenProps {
  inquiries: EngineeringInquiry[];
  onSaveInquiry: (inquiry: EngineeringInquiry) => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ inquiries, onSaveInquiry }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('substation');
  const [location, setLocation] = useState('');
  const [loadDetails, setLoadDetails] = useState('');
  const [complianceCheck, setComplianceCheck] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `AES-REQ-${Math.floor(100000 + Math.random() * 900000)}`;

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
    setName('');
    setPhone('');
    setEmail('');
    setLocation('');
    setLoadDetails('');
  };

  const faqs = [
    {
      q: 'What is the advantage of hiring a Super Grade Electrical Contractor in Karnataka?',
      a: 'A Super Grade License is the highest category awarded by the Electrical Inspectorate, Government of Karnataka. It authorizes the holder to execute electrical works of all voltages (from Low Tension up to 110kV/220kV Extra High Tension) without restriction. It also empowers direct administrative representation for CEIG drawing sanctions and safety clearance certificates.'
    },
    {
      q: 'How long does it take to obtain CEIG Drawing Sanction & Safety Clearance?',
      a: 'With properly prepared Single Line Diagrams (SLD), physical equipment clearances, and certified earth pit test reports, drawing sanction is typically obtained within 10–14 working days, and final safety inspection certification within 5–7 days following installation completion.'
    },
    {
      q: 'What is the maximum rooftop solar capacity allowed under BESCOM Net Metering?',
      a: 'Under current KERC regulations, industrial and commercial consumers can install grid-interactive rooftop solar up to 100% of their sanctioned connected load. For capacities above 1000 kWp, open access or dedicated express feeders may be utilized.'
    },
    {
      q: 'How does APFC eliminate utility penalty surcharges?',
      a: 'Electricity supply companies (BESCOM, MESCOM, HESCOM) penalize facilities whose average monthly power factor drops below 0.90 (or 0.85 in certain tariffs). By installing microprocessor-controlled Automatic Power Factor Correction (APFC) panels with detuned harmonic reactors, we maintain power factor between 0.98 and 0.99 unity, eliminating penalties and reducing kVA demand charges.'
    }
  ];

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7]/15 text-[#F59E0B] text-[12px] font-semibold w-fit border border-[#F59E0B]/30">
            <span className="material-symbols-outlined text-[16px]">contact_support</span>
            Technical Helpdesk &amp; Dispatch
          </div>
          <h1 className="font-display-xl text-white font-extrabold max-w-3xl">
            Contact Ananya Electrical Solutions
          </h1>
          <p className="font-body-lg text-slate-300 max-w-3xl leading-relaxed">
            Reach our master electrical engineers for high-voltage tenders, rooftop solar feasibility studies, statutory CEIG drawing approvals, and 24/7 industrial emergency breakdown response.
          </p>
        </div>
      </section>

      {/* Main Grid: Contact info & Form */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details & Operational Hubs */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-[#0B192C] text-white p-8 rounded-2xl flex flex-col gap-6 shadow-md border border-slate-700">
              <span className="text-[12px] uppercase font-bold text-[#F59E0B] tracking-wider">
                Emergency Hotline &amp; Dispatch
              </span>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] text-slate-400">24/7 Grid Breakdown &amp; Substation Support</span>
                <a
                  href="tel:+918660121438"
                  className="font-headline-md text-[22px] font-bold text-white hover:text-[#5bb8fe] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px] text-[#F59E0B]">phone_in_talk</span>
                  +91 8660121438
                </a>
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex flex-col gap-2">
                <span className="text-[13px] text-slate-400">Chief Engineering Email</span>
                <a
                  href="mailto:contact@ananyaelectricalsolutions.in"
                  className="text-[16px] font-bold text-white hover:text-[#5bb8fe] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#5bb8fe]">mail</span>
                  contact@ananyaelectricalsolutions.in
                </a>
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex flex-col gap-1">
                <span className="text-[13px] text-slate-400">Corporate Headquarters</span>
                <p className="text-[14px] text-slate-300 leading-relaxed">
                  Ananya Electrical Solutions<br />
                  Peenya Industrial Area, Phase 2, Bengaluru, Karnataka 560058, India
                </p>
              </div>
            </div>

            {/* Regional Hubs */}
            <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] flex flex-col gap-4 shadow-sm">
              <h3 className="font-headline-sm text-[#0B192C] font-bold">Regional Service Hubs</h3>
              <div className="flex flex-col gap-3 text-[13px] text-[#44474c]">
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Bengaluru South &amp; Hosur Belt:</strong>
                  <span>Bommasandra Industrial Area, KIADB 3rd Phase</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Bengaluru East &amp; Logistics Corridor:</strong>
                  <span>Hosakote Industrial Estate, NH 75</span>
                </div>
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#E2E8F0]">
                  <strong className="text-[#0B192C] block">Mysuru Regional Base:</strong>
                  <span>Hebbal Industrial Area, Mysuru 570018</span>
                </div>
              </div>
            </div>

            {/* Inquiries saved in this session */}
            {inquiries.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-[16px] text-[#0B192C] font-bold">Your Active RFPs</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {inquiries.length} Active
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
                Direct Engineering Desk
              </span>
              <h2 className="font-headline-md text-[#0B192C] font-bold">
                Submit an Engineering Proposal Request
              </h2>
              <p className="text-[14px] text-[#44474c]">
                Provide your electrical load requirements, transformer specifications, or solar site metrics for a certified technical assessment.
              </p>
            </div>

            {submitted && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[24px] shrink-0">check_circle</span>
                <div className="flex flex-col text-[13px]">
                  <strong className="font-bold">Inquiry Dispatched Successfully!</strong>
                  <span>An Ananya Super Grade Engineer has been assigned to your project parameters and will contact you shortly.</span>
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
                    placeholder="+91 98765 43210"
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
                    Facility Location in Karnataka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Peenya Phase 1, Bengaluru"
                    className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Project Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 px-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white cursor-pointer"
                >
                  <option value="11kV-110kV Substation">11kV – 110kV Substation &amp; Transformer Erection</option>
                  <option value="Solar EPC Turnkey">Turnkey Rooftop / Ground-Mount Solar EPC</option>
                  <option value="HT / LT Switchgear Panels">HT / LT Distribution Panels &amp; Busduct Systems</option>
                  <option value="Energy Audit & APFC">Energy Audit &amp; APFC Harmonic Correction</option>
                  <option value="Statutory CEIG Approvals">CEIG Drawing Sanctions &amp; Statutory Approvals</option>
                  <option value="Industrial AMC Contract">Preventative Electrical AMC &amp; Testing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Connected Load or Project Details
                </label>
                <textarea
                  rows={4}
                  value={loadDetails}
                  onChange={(e) => setLoadDetails(e.target.value)}
                  placeholder="Specify transformer kVA rating, HT voltage level, plant floor area, target energization timeline, or questions for our engineers..."
                  className="p-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                />
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
                  Request single-line diagram review according to Karnataka Electrical Inspectorate rules.
                </label>
              </div>

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

        {/* Technical FAQ Accordion */}
        <div className="flex flex-col gap-6 pt-8 border-t border-[#E2E8F0]">
          <div>
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Knowledge Base
            </span>
            <h3 className="font-headline-lg text-[#0B192C] font-bold">
              Frequently Asked Technical Questions
            </h3>
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
                    <span className="font-semibold text-[#0B192C] text-[15px]">{faq.q}</span>
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
