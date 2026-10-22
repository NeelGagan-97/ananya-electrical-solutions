import React from 'react';
import { ASSETS } from '../data/constants';

interface AboutScreenProps {
  onOpenConsultation: (topic?: string) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onOpenConsultation }) => {
  const leadership = [
    {
      name: 'Er. R. S. Gowda, M.Tech (Power Systems)',
      role: 'Chief Technical Director & Super Grade Licensee',
      experience: '22+ Years in High Voltage Substation Engineering & KPTCL Liaison',
      desc: 'Expertise in primary substation grid design up to 110kV, protection coordination, and statutory liaison with the Chief Electrical Inspector to Government (CEIG).'
    },
    {
      name: 'Er. Sandeep V., B.E. (Electrical)',
      role: 'Head of Solar EPC & Clean Energy Solutions',
      experience: '14+ Years in Multi-Megawatt Ground Mount & C&I Rooftop Solar EPC',
      desc: 'Supervised over 45 MWp of cumulative solar PV capacity across Karnataka industrial belts, managing KERC net metering and bidirectional metering synchronization.'
    },
    {
      name: 'Naveen Kumar, B.E., Certified Safety Auditor',
      role: 'Lead Testing & Commissioning Engineer',
      experience: '12+ Years in Megger, Hi-Pot, and Protective Relay Injection Testing',
      desc: 'Certified electrical safety supervisor ensuring zero deviation protocols and 100% first-pass clearance in statutory government electrical inspections.'
    }
  ];

  const credentials = [
    {
      title: 'Super Grade Electrical Contractor License',
      authority: 'Government of Karnataka • Electrical Inspectorate',
      validity: 'Authorized for all High Tension & Extra High Tension (HT/EHT) works statewide',
      icon: 'bolt'
    },
    {
      title: 'Class-1 PWD Registered Contractor',
      authority: 'Public Works Department, Karnataka',
      validity: 'Eligible for large infrastructure public and private sector turnkey tenders',
      icon: 'engineering'
    },
    {
      title: 'ISO 9001:2015 Quality Management',
      authority: 'International Organization for Standardization',
      validity: 'Standardized procurement, fabrication, and testing documentation',
      icon: 'verified'
    },
    {
      title: 'ISO 45001 / OHSAS Occupational Safety',
      authority: 'Occupational Health & Safety Standards',
      validity: 'Zero-tolerance protocols, PPE enforcement, and live-circuit isolation drills',
      icon: 'health_and_safety'
    }
  ];

  const districts = [
    { region: 'Bengaluru Urban & Rural', hubs: 'Peenya, Bommasandra, Electronic City, Whitefield, Hosakote, Dabaspet' },
    { region: 'Mysuru & Mandya Corridor', hubs: 'Hebbal Industrial Area, Nanjangud, Kadakola, Thandya' },
    { region: 'Hubballi-Dharwad & Belagavi', hubs: 'Belur Industrial Area, Tarihal, Rayapur, Kakati' },
    { region: 'Coastal Mangaluru & Udupi', hubs: 'Baikampady, Karnad, Manipal Industrial Estate' },
    { region: 'Tumakuru & Hassan', hubs: 'Vasanthanarasapura Industrial Park, KIADB Phase 1-3' },
    { region: 'Ballari & Central Karnataka', hubs: 'Toranagallu, Mundargi, Davanagere, Shivamogga' }
  ];

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7]/15 text-[#F59E0B] text-[12px] font-semibold w-fit border border-[#F59E0B]/30">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            About Ananya Electrical Solutions
          </div>
          <h1 className="font-display-xl text-white font-extrabold max-w-3xl">
            Precision Infrastructure Built on Trust and Rigor
          </h1>
          <p className="font-body-lg text-slate-300 max-w-3xl leading-relaxed">
            Ananya Electrical Solutions is a Super Grade Electrical Contractor with over 5 years of verified field excellence, aimed at maximizing customer satisfaction through disciplined engineering and clean energy leadership.
          </p>
        </div>
      </section>

      {/* Main Narrative & Execution Photo */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col gap-5">
            <span className="text-[14px] uppercase font-bold text-[#0284C7] tracking-wider">
              Our Journey Since 2020
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              Engineering Reliability for Karnataka's Industrial Growth
            </h2>
            <p className="text-[15px] text-[#44474c] leading-relaxed">
              Founded in 2020, Ananya Electrical Solutions was established to address a persistent challenge in industrial infrastructure: the friction between intricate statutory government compliance and rapid plant construction.
            </p>
            <p className="text-[15px] text-[#44474c] leading-relaxed">
              As a licensed <strong className="text-[#0B192C]">Super Grade Electrical Contractor</strong> under the Karnataka Electrical Inspectorate, we take single-window ownership from the initial Single Line Diagram (SLD) approval to the live closing of circuit breakers and ongoing 24/7 grid dispatch support.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex flex-col">
                <span className="font-stat-counter text-[#0B192C]">150+ MVA</span>
                <span className="text-[13px] text-slate-500">Connected Power Commissioned</span>
              </div>
              <div className="w-px h-12 bg-[#CBD5E1]"></div>
              <div className="flex flex-col">
                <span className="font-stat-counter text-[#0284C7]">45+ MWp</span>
                <span className="text-[13px] text-slate-500">Clean Solar Capacity</span>
              </div>
              <div className="w-px h-12 bg-[#CBD5E1]"></div>
              <div className="flex flex-col">
                <span className="font-stat-counter text-[#F59E0B]">0</span>
                <span className="text-[13px] text-slate-500">Safety Protocol Deviations</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#CBD5E1]">
              <img
                src={ASSETS.aboutExecution}
                alt="Engineers executing electrical safety protocol"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
                <div>
                  <span className="text-[12px] uppercase font-bold text-[#5bb8fe]">Zero-Deviation Field Protocol</span>
                  <h4 className="font-headline-sm font-bold">100% In-House Master Engineers</h4>
                </div>
                <span className="px-3 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[12px] font-bold">
                  SUPER GRADE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Statutory Accreditations */}
        <div className="flex flex-col gap-8">
          <div>
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Statutory Standing
            </span>
            <h3 className="font-headline-lg text-[#0B192C] font-bold">
              Official Licensing &amp; Industry Certifications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {credentials.map((cred, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#e5eeff] text-[#0284C7] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">{cred.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline-sm text-[17px] text-[#0B192C] font-bold">{cred.title}</h4>
                  <span className="text-[12px] font-bold text-[#006398]">{cred.authority}</span>
                  <p className="text-[13px] text-[#44474c] mt-1">{cred.validity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Engineering Leadership */}
        <div className="flex flex-col gap-8">
          <div>
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Technical Governance
            </span>
            <h3 className="font-headline-lg text-[#0B192C] font-bold">
              Master In-House Engineering Leadership
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadership.map((leader, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[#0B192C] text-white flex items-center justify-center font-bold font-display text-[16px]">
                    {leader.name.slice(0, 2)}
                  </div>
                  <h4 className="font-headline-sm text-[16px] text-[#0B192C] font-bold">{leader.name}</h4>
                  <span className="text-[12px] text-[#0284C7] font-semibold">{leader.role}</span>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">{leader.experience}</span>
                  <p className="text-[13px] text-[#44474c] leading-relaxed pt-2 border-t border-[#E2E8F0]">
                    {leader.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pan-Karnataka Geographic Coverage Map */}
        <div className="rounded-2xl bg-white border border-[#CBD5E1] p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[12px] uppercase font-bold text-[#0284C7] tracking-wider">
                Statewide Footprint
              </span>
              <h3 className="font-headline-sm text-[#0B192C] font-bold">
                Rapid Mobilization Across Karnataka Industrial Corridors
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>All 31 Districts Supported • &lt; 48 Hour Site Mobilization</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map((d, dIdx) => (
              <div key={dIdx} className="p-4 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col gap-1.5">
                <span className="font-semibold text-[#0B192C] text-[14px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0284C7]">location_on</span>
                  {d.region}
                </span>
                <span className="text-[12px] text-[#44474c]">Hubs: {d.hubs}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <button
              onClick={() => onOpenConsultation('Karnataka State Contract')}
              className="px-6 py-2.5 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold transition-colors"
            >
              Consult with a Regional Engineer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
