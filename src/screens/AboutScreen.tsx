import React from 'react';
import { ASSETS } from '../data/constants';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';

interface AboutScreenProps {
  onOpenConsultation: (topic?: string) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onOpenConsultation }) => {
  const engineeringDivisions = [
    {
      code: 'DIV-01',
      name: 'HT / EHT Substation & Statutory Liaison Division',
      role: 'Super Grade Electrical Licensing & CEIG / KPTCL Coordination',
      scope: '11kV – 110kV Substations • SLD Sanctions • CEIG Safety Certificates',
      desc: 'Handles Single Line Diagram (SLD) engineering, protection relay coordination, 11kV–110kV transformer and VCB switchyard erection, and direct statutory representation with the Karnataka Electrical Inspectorate (CEIG), KPTCL, and BESCOM.',
      placeholderNote: 'Super Grade License Authority • CEIG Karnataka & Chief Supervisor Cell'
    },
    {
      code: 'DIV-02',
      name: 'Solar EPC & Clean Energy Integration Division',
      role: 'Commercial, Industrial & Residential Solar Power Systems',
      scope: 'Rooftop & Ground-Mount PV • String/Central Inverters • KERC Net-Metering',
      desc: 'Executes turnkey solar photovoltaic plants across Bengaluru and Karnataka including shadow-free 3D array layout, wind-rated HDG mounting structures, ACDB/DCDB protection, bidirectional metering, and BESCOM net-metering synchronization.',
      placeholderNote: 'Solar EPC Technical Cell • KERC & DISCOM Grid Interconnection Engineers'
    },
    {
      code: 'DIV-03',
      name: 'Testing, Commissioning, Safety & 24/7 AMC Division',
      role: 'Pre-Commissioning Diagnostics, Industrial Wiring & Preventive AMC',
      scope: 'Megger & VLF Hi-Pot • Relay Injection • IS 3043 Earthing • 24/7 Dispatch',
      desc: 'Operates NABL-calibrated testing instruments for insulation resistance, primary/secondary injection, transformer oil BDV, FLIR thermal imaging, LOTO safety enforcement, and 24/7 emergency breakdown support.',
      placeholderNote: 'NABL-Calibrated HV Test Cell • Certified Relay & Diagnostic Field Engineers'
    }
  ];

  const credentials = [
    {
      title: 'Super Grade Electrical Contractor License',
      authority: 'Government of Karnataka • Department of Electrical Inspectorate (CEIG)',
      validity: 'Authorized for High Tension & Extra High Tension (11kV, 33kV, 66kV, 110kV) and Low Tension electrical installations across Karnataka.',
      badge: 'SUPER GRADE',
      icon: 'bolt'
    },
    {
      title: 'Class-1 PWD Registered Electrical Contractor',
      authority: 'Public Works Department (PWD), Government of Karnataka',
      validity: 'Qualified for institutional, industrial, commercial, and public-sector turnkey electrical infrastructure works.',
      badge: 'CLASS-1 PWD',
      icon: 'engineering'
    },
    {
      title: 'CEA & Indian Electricity Rules Compliance',
      authority: 'Central Electricity Authority (Measures Relating to Safety & Electric Supply)',
      validity: 'All substation clearances, earthing grids (IS 3043), switchgear panels (IEC 61439), and wiring (IS 732) strictly follow statutory codes.',
      badge: 'CEA / BIS',
      icon: 'verified'
    },
    {
      title: 'Zero-Deviation Occupational Safety Protocol',
      authority: 'Lockout-Tagout (LOTO) & Arc-Flash PPE Field Governance',
      validity: 'Mandatory Permit-to-Work (PTW) system, calibrated HV discharge rods, insulated mat verification, and pre-energization safety audits.',
      badge: 'SAFETY FIRST',
      icon: 'health_and_safety'
    }
  ];

  const safetyPractices = [
    {
      title: 'Lockout-Tagout (LOTO) & Permit-to-Work',
      desc: 'Strict de-energization, physical breaker padlocking, line earthing discharge rods, and multi-stage voltage verification prior to any HT/LT panel or transformer intervention.',
      icon: 'lock'
    },
    {
      title: 'IS 3043 Dual-Grid Electrical Earthing',
      desc: 'Dedicated maintenance-free copper-bonded and GI earthing electrodes with bentonite backfill, ensuring earth grid resistance below 1 Ohm for substations and neutral grounding.',
      icon: 'shield'
    },
    {
      title: 'NABL-Calibrated Pre-Commissioning Testing',
      desc: 'Every cable, transformer, and breaker undergoes 5kV/10kV digital Megger insulation tests, VLF Hi-Pot dielectric tests, contact resistance (CRM), and relay trip-curve verification.',
      icon: 'biotech'
    },
    {
      title: 'Arc-Flash PPE & Insulated Tooling',
      desc: 'Field technicians operate with Class-2/Class-4 electrical insulated gloves, arc-flash face shields, flame-retardant harnesses, and 1000V VDE-certified insulated tools.',
      icon: 'health_and_safety'
    }
  ];

  const districts = [
    { region: 'Bengaluru North & Sahakarnagar HQ', hubs: 'Sahakarnagar, Hebbal, Yelahanka, Jakkur, Devanahalli Aerospace Park, Doddaballapur' },
    { region: 'Bengaluru Industrial & IT Corridors', hubs: 'Peenya Phase 1–4, Yeshwanthpur, Whitefield, Electronic City, Bommasandra, Hosakote, Bidadi' },
    { region: 'Mysuru & Mandya Corridor', hubs: 'Hebbal Industrial Area, Nanjangud, Kadakola, Thandya' },
    { region: 'Hubballi-Dharwad & Belagavi', hubs: 'Belur Industrial Area, Tarihal, Rayapur, Kakati' },
    { region: 'Coastal Mangaluru & Udupi', hubs: 'Baikampady, Karnad, Manipal Industrial Estate' },
    { region: 'Tumakuru, Ballari & Central Karnataka', hubs: 'Vasanthanarasapura KIADB Phase 1–3, Toranagallu, Davanagere, Shivamogga' }
  ];

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-14 lg:py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7]/15 text-[#F59E0B] text-[12px] font-semibold w-fit border border-[#F59E0B]/30 leading-none">
              <span className="material-symbols-outlined text-[16px] leading-none">verified_user</span>
              <span>Headquartered at Sahakarnagar, Bengaluru • Serving All 31 Districts</span>
            </div>
            <h1 className="font-display-xl text-white font-extrabold tracking-tight">
              About Ananya Electrical Solutions — Super Grade Electrical Contractor in Bengaluru
            </h1>
            <p className="font-body-lg text-slate-300 max-w-2xl leading-relaxed">
              Headquartered at {BUSINESS_NAP.fullAddress}, <strong className="text-white">Ananya Electrical Solutions</strong> is a Government of Karnataka Licensed Super Grade Electrical Contractor delivering turnkey HT/LT substations, industrial &amp; commercial wiring, CEIG approvals, and rooftop solar EPC across Karnataka.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onOpenConsultation('Company Credentials & Turnkey Inquiry')}
                className="h-11 px-5 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-[#2a1700] text-[13.5px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">request_quote</span>
                <span>Request Company Profile &amp; Quote</span>
              </button>
              <a
                href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'AboutScreen Hero')}
                className="h-11 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[13.5px] font-bold inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>Call {BUSINESS_NAP.primaryPhone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-[#1E293B]/90 border border-slate-700/80 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5bb8fe] font-bold">
                  Statutory Profile
                </span>
                <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold uppercase tracking-wider leading-none">
                  Est. 2020
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">License Grade</span>
                  <span className="text-[15px] font-bold text-white">Super Grade (HT/EHT)</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">PWD Standing</span>
                  <span className="text-[15px] font-bold text-white">Class-1 Registered</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Voltage Scope</span>
                  <span className="text-[15px] font-bold text-[#38bdf8]">11kV – 110kV</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">State Coverage</span>
                  <span className="text-[15px] font-bold text-emerald-400">All 31 Districts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Narrative & Execution Photo */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <span className="text-[13px] uppercase font-bold text-[#0284C7] tracking-wider">
                Our Journey Since 2020
              </span>
              <h2 className="font-headline-lg text-[#0B192C] font-bold">
                Engineering Reliability for Karnataka&apos;s Industrial, Commercial &amp; Residential Growth
              </h2>
              <p className="text-[15px] text-[#44474c] leading-relaxed">
                Founded in 2020 and headquartered in Sahakarnagar, Bengaluru, <strong className="text-[#0B192C]">Ananya Electrical Solutions</strong> was established to solve a critical challenge in Karnataka&apos;s infrastructure development: bridging strict government statutory electrical compliance with dependable, on-schedule engineering execution.
              </p>
              <p className="text-[15px] text-[#44474c] leading-relaxed">
                As a Government of Karnataka Licensed <strong className="text-[#0B192C]">Super Grade Electrical Contractor</strong> under the Department of Electrical Inspectorate, <strong className="text-[#0B192C]">Ananya Electrical Solutions</strong> takes single-window responsibility from initial Single Line Diagram (SLD) design and CEIG drawing sanctions to equipment erection, pre-commissioning testing, BESCOM/KPTCL energization, and 24/7 preventive maintenance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0]">
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-center">
                <span className="font-stat-counter text-[#0B192C] text-[24px] lg:text-[28px]">Est. 2020</span>
                <span className="text-[12px] text-slate-500 font-medium mt-1">5+ Years in Karnataka</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-center">
                <span className="font-stat-counter text-[#0284C7] text-[24px] lg:text-[28px]">11kV–110kV</span>
                <span className="text-[12px] text-slate-500 font-medium mt-1">HT/EHT &amp; LT Scope</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-center">
                <span className="font-stat-counter text-[#F59E0B] text-[24px] lg:text-[28px]">100%</span>
                <span className="text-[12px] text-slate-500 font-medium mt-1">CEA &amp; CEIG Safety Compliance</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="relative w-full min-h-[360px] lg:min-h-full rounded-2xl overflow-hidden shadow-xl border border-[#CBD5E1] flex flex-col justify-end">
              <img
                src={ASSETS.aboutExecution}
                alt="Ananya Electrical Solutions engineers executing electrical safety and testing protocol"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-[#0B192C]/30 to-transparent"></div>
              <div className="relative z-10 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] uppercase tracking-wider font-bold text-[#5bb8fe]">
                    Zero-Deviation Field Protocol
                  </span>
                  <h3 className="font-headline-sm font-bold text-white">
                    Licensed Electrical Supervisors &amp; Testing Teams
                  </h3>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-[#FEF3C7] text-[#2a1700] text-[12px] font-bold tracking-wider uppercase w-fit shrink-0">
                  SUPER GRADE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Statutory Accreditations */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Statutory Standing
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              Official Licensing &amp; Regulatory Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {credentials.map((cred, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-[#e5eeff] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[26px] leading-none">{cred.icon}</span>
                </div>
                <div className="flex flex-col flex-1 gap-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-headline-sm text-[17px] text-[#0B192C] font-bold leading-snug">
                      {cred.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded bg-[#f8f9ff] border border-[#CBD5E1] text-[#006398] text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5">
                      {cred.badge}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-[#0284C7]">{cred.authority}</span>
                  <p className="text-[13px] text-[#44474c] leading-relaxed pt-1">{cred.validity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Electrical Safety Practices & Quality Assurance */}
        <div className="rounded-2xl bg-[#0B192C] text-white p-6 sm:p-8 lg:p-10 border border-slate-700 shadow-lg flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div>
              <span className="text-[12px] uppercase font-bold text-[#F59E0B] tracking-wider">
                Safety &amp; Quality Assurance
              </span>
              <h2 className="font-headline-md text-white font-bold">
                Field Safety Practices &amp; Testing Standards
              </h2>
            </div>
            <span className="text-[12px] font-mono text-[#38bdf8]">
              CEA Regulations • IS 3043 • IEC 61439 • IS 732
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {safetyPractices.map((practice, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#1E293B]/90 border border-slate-700 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0284C7]/20 text-[#38bdf8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{practice.icon}</span>
                </div>
                <h3 className="text-[15px] font-bold text-white leading-snug">{practice.title}</h3>
                <p className="text-[12.5px] text-slate-300 leading-relaxed">{practice.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* In-House Engineering & Supervision Divisions */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Technical Governance
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              In-House Engineering &amp; Supervision Divisions
            </h2>
            <p className="text-[13.5px] text-[#44474c]">
              Structured technical cells at our Sahakarnagar headquarters managing design, statutory approvals, field execution, and pre-commissioning testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {engineeringDivisions.map((div, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4 h-full"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#0B192C] text-[#F59E0B] flex items-center justify-center font-bold font-mono text-[12px] shrink-0 shadow-xs">
                      {div.code}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-headline-sm text-[16px] text-[#0B192C] font-bold leading-snug">
                        {div.name}
                      </h3>
                      <span className="text-[12px] text-[#0284C7] font-semibold leading-snug mt-0.5">
                        {div.role}
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f8f9ff] border border-[#E2E8F0] text-[11px] font-mono text-slate-600 w-fit">
                    <span className="material-symbols-outlined text-[14px] text-[#0284C7] leading-none">workspace_premium</span>
                    <span>{div.scope}</span>
                  </div>
                </div>

                <p className="text-[13px] text-[#44474c] leading-relaxed pt-3 border-t border-[#E2E8F0]">
                  {div.desc}
                </p>

                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#2a1700] font-mono">
                  {div.placeholderNote}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pan-Karnataka Geographic Coverage Map */}
        <div className="rounded-2xl bg-white border border-[#CBD5E1] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold text-[#0284C7] tracking-wider">
                Statewide Footprint
              </span>
              <h2 className="font-headline-sm text-[#0B192C] font-bold">
                Rapid Mobilization Across Bengaluru &amp; Karnataka Industrial Corridors
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-900 font-medium w-fit shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>All 31 Districts Supported • &lt; 48 Hour Site Mobilization</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {districts.map((d, dIdx) => (
              <div
                key={dIdx}
                className="p-4 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col justify-between gap-2 h-full"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0284C7] shrink-0 leading-none">
                    location_on
                  </span>
                  <span className="font-bold text-[#0B192C] text-[14px] leading-snug">
                    {d.region}
                  </span>
                </div>
                <p className="text-[12px] text-[#44474c] leading-relaxed pl-[26px]">
                  <span className="font-semibold text-slate-700">Key Hubs:</span> {d.hubs}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-[13px] text-[#44474c]">
              Need an on-site load survey, CEIG drawing sanction, or turnkey quote in Bengaluru or anywhere in Karnataka?
            </span>
            <button
              onClick={() => onOpenConsultation('Karnataka State Contract')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[17px] leading-none">engineering</span>
              <span>Consult with Our Engineering Desk</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
