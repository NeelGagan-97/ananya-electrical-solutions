import React, { useState } from 'react';
import { NavigationTab, EngineeringInquiry, ProjectItem } from '../types';
import { ASSETS, SERVICES, PROJECTS, ESCOMS, ELECTRICAL_EQUIPMENT } from '../data/constants';
import { ElectricalServicesSection } from '../components/ElectricalServicesSection';

interface HomeScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (service?: string) => void;
  onSaveInquiry: (inquiry: EngineeringInquiry) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectTab,
  onOpenConsultation,
  onSaveInquiry,
}) => {
  const [projectFilter, setProjectFilter] = useState<'all' | 'industrial' | 'commercial' | 'solar'>('all');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCategory, setFormCategory] = useState('substation');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [complianceCheck, setComplianceCheck] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects = projectFilter === 'all'
    ? PROJECTS.slice(0, 3)
    : PROJECTS.filter(p => p.category === projectFilter).slice(0, 3);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry: EngineeringInquiry = {
      id: `AES-HOM-${Math.floor(100000 + Math.random() * 900000)}`,
      name: formName,
      phone: formPhone,
      category: formCategory,
      location: formLocation,
      loadDetails: formNotes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      complianceConfirmed: complianceCheck
    };
    onSaveInquiry(newInquiry);
    setFormSubmitted(true);
  };

  const stages = [
    {
      num: 'STAGE 01',
      title: 'Site Survey & Load Audit',
      icon: 'troubleshoot',
      image: ASSETS.pillarTesting,
      equipmentTag: 'Class-A Power Analyzers & Soil Resistivity Meters',
      desc: 'On-site engineering inspection, connected load calculations, short-circuit levels assessment, and feasibility studies for grid interconnection or rooftop solar.',
      deliverables: ['Load profiling log', 'Fault level study', 'Soil resistivity report', 'Site layout CAD']
    },
    {
      num: 'STAGE 02',
      title: 'CAD Design & Sanctions',
      icon: 'design_services',
      image: ASSETS.hero,
      equipmentTag: 'SLD Blueprints, CT/PT Sizing & Protection Relay Curves',
      desc: 'Drafting precision Single Line Diagrams (SLD), equipment layouts, and statutory drawings for CEIG approval and BESCOM load sanctioning.',
      deliverables: ['Single Line Diagram (SLD)', 'CEIG Drawing Sanction File', 'Substation Earth Grid CAD', 'Cable Schedule']
    },
    {
      num: 'STAGE 03',
      title: 'Equipment Erection & Cabling',
      icon: 'construction',
      image: ASSETS.pillarHighVoltage,
      equipmentTag: 'Power Transformers, 11kV/33kV VCBs, PCC/MCC & XLPE Trays',
      desc: 'Deployment of transformers, heavy XLPE cabling, HT/LT switchgear panels, solar arrays, and chemical earth pits adhering strictly to CPWD and CEA standards.',
      deliverables: ['Transformer positioning', 'Busduct joint torquing', 'Cable termination & glanding', 'Solar array tilt alignment']
    },
    {
      num: 'STAGE 04',
      title: 'Testing, Commissioning & AMC',
      icon: 'verified',
      image: ASSETS.aboutExecution,
      equipmentTag: '10kV Megger, Primary Injection, VLF Hi-Pot & Thermal Cameras',
      desc: 'Rigorous pre-commissioning Megger/Hi-Pot tests, government safety inspection pass, plant energization, followed by 24/7 preventative maintenance support.',
      deliverables: ['Hi-Pot breakdown test', 'CEIG Safety Certificate', 'Discom Energization Letter', '24/7 Emergency Dispatch']
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full bg-[#071120] text-white overflow-hidden py-16 lg:py-24">
        {/* Background Image & Cinematic Atmospheric Layers */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/assets/aistudio/Electrical_transmission_lines_on__2K_20261025145912_944acc49.jpg"
            alt="High-voltage electrical transmission lines across golden-hour hills"
            className="w-full h-full object-cover object-center scale-[1.03] brightness-95 contrast-110 saturate-110"
          />
          {/* Directional Readability Gradient: Rich Navy on Left, Clearer Tower Showcase on Right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060f1e]/92 via-[#0B192C]/75 to-[#0B192C]/40" />
          {/* Top & Bottom Vignette for Seamless Section Framing */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060f1e]/65 via-transparent to-[#071120]/90" />
          {/* Golden-Hour Sunburst & High-Voltage Sky Glow */}
          <div className="absolute -top-24 left-1/4 w-[32rem] h-[32rem] bg-[#F59E0B]/15 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0284C7]/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl" />
        </div>

        {/* Ambient Technical Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none">
          <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="48" id="hero-grid" patternUnits="userSpaceOnUse" width="48">
                <path className="text-[#38BDF8]" d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#hero-grid)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
          {/* Top Monospace Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7]/95 backdrop-blur-md text-[#2a1700] text-[12px] uppercase tracking-wider font-semibold shadow-lg shadow-black/25 border border-[#F59E0B]/40">
              <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">verified</span>
              Karnataka Electrical Inspectorate • Super Grade Licensed Contractor
            </div>
          </div>

          {/* Main Hero Split Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[14px] uppercase tracking-widest text-[#38BDF8] font-bold drop-shadow-sm">
                  Engineering Infrastructure • Est. 2020
                </span>
                <h1 className="font-display-xl text-white tracking-tight font-extrabold leading-tight drop-shadow-md">
                  Powering Progress with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7dd3fc] via-[#38bdf8] to-[#fcd34d]">
                    Precision Engineering
                  </span>{' '}
                  &amp; Clean Energy
                </h1>
              </div>

              <p className="font-body-lg text-slate-200 leading-relaxed max-w-2xl drop-shadow-sm">
                Welcome to Ananya Electrical Solutions. We specialize in delivering safe, efficient, and innovative electrical services tailored to meet the needs of homes, businesses, and industrial facilities. From design and installation to maintenance and troubleshooting, our expert team is committed to powering your world with precision, professionalism, and care. Whether you're upgrading your system, building from the ground up, or looking for energy-efficient alternatives — we bring the expertise and reliability you can trust.
              </p>

              {/* CTAs: Structured 3D Twin Launchers + Primary Actions */}
              <div className="flex flex-col gap-3 pt-2 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => onSelectTab('residential-layout-3d')}
                    className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0f172a] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-[13px] font-bold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 cursor-pointer border border-[#38bdf8]/40 whitespace-nowrap backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5 text-[#38bdf8] leading-none shrink-0">map</span>
                    <span>3D Layout &amp; Infra</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('residential-3d')}
                    className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] hover:from-[#059669] hover:to-[#10b981] text-white text-[13px] font-bold shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 cursor-pointer border border-[#34d399]/40 whitespace-nowrap backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5 text-[#a7f3d0] leading-none shrink-0">home</span>
                    <span>3D 2BHK Interior</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('twin-3d')}
                    className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-gradient-to-r from-[#f59e0b] via-[#d97706] to-[#b45309] hover:from-[#d97706] hover:to-[#f59e0b] text-slate-950 text-[13px] font-bold shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 cursor-pointer border border-[#fde047]/40 whitespace-nowrap backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5 text-slate-950 leading-none shrink-0">electric_meter</span>
                    <span>33kV Substation</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onSelectTab('services')}
                    className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-[#0284C7] hover:bg-[#2563EB] text-white text-[13.5px] font-bold shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5 leading-none shrink-0">precision_manufacturing</span>
                    <span>Explore All Engineering Services</span>
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('consultation');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else onOpenConsultation();
                    }}
                    className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-[#0f1f36]/85 hover:bg-[#1E293B] text-white text-[13.5px] font-bold shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 cursor-pointer border border-white/15 backdrop-blur-md whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5 text-[#F59E0B] leading-none shrink-0">request_quote</span>
                    <span>Request Technical Quote</span>
                  </button>
                </div>
              </div>

              {/* Micro Spec Tags */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-slate-200 text-[12px] font-medium drop-shadow-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#38BDF8] leading-none">offline_bolt</span>
                  <span>11kV – 110kV Transmission</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#F59E0B] leading-none">solar_power</span>
                  <span>Net-Metered Solar EPC</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 leading-none">gavel</span>
                  <span>KPTCL &amp; BESCOM Approved</span>
                </span>
              </div>
            </div>

            {/* Hero Visual Showcase: Video + Telemetry */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-start gap-5 lg:-mt-20">
              <div className="w-full flex items-start justify-center lg:justify-end lg:-mr-12 xl:-mr-16 bg-transparent">
                <video
                  src="/assets/aistudio/Animated_electrical_logo_reveal_transparent.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ aspectRatio: '1.5 / 1.5' }}
                  className="w-full max-w-[260px] sm:max-w-[300px] aspect-[1.5/1.5] object-cover object-center bg-transparent lg:translate-x-12 xl:translate-x-16 lg:-translate-y-4 drop-shadow-[0_2px_12px_rgba(255,255,255,0.5)]"
                />
              </div>

              {/* Status Below Video with Exact Vertical Alignment */}
              <div className="inline-flex items-center justify-center gap-2 text-center px-3.5 py-1.5 rounded-full bg-[#0B192C]/85 backdrop-blur-md border border-white/15 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="text-[13px] sm:text-[14px] font-bold text-white tracking-wide leading-none">
                  HT/LT Dispatch &amp; Solar EPC Active across Karnataka
                </span>
              </div>

              {/* Quick Telemetry Ticker */}
              <div className="grid grid-cols-2 gap-3 w-full items-stretch">
                <div className="p-4 rounded-xl bg-[#0B192C]/80 backdrop-blur-md text-white flex flex-col justify-between gap-1 border border-white/15 shadow-xl h-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Substations Delivered</span>
                    <span className="material-symbols-outlined text-[#38BDF8] text-[18px] leading-none shrink-0">domain</span>
                  </div>
                  <span className="font-stat-counter text-white text-[26px] sm:text-[30px]">150+ MVA</span>
                  <span className="text-[12px] text-slate-300">Aggregated Connected Load</span>
                </div>
                <div className="p-4 rounded-xl bg-[#0B192C]/80 backdrop-blur-md text-white flex flex-col justify-between gap-1 border border-white/15 shadow-xl h-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Solar Capacity</span>
                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px] leading-none shrink-0">wb_sunny</span>
                  </div>
                  <span className="font-stat-counter text-white text-[26px] sm:text-[30px]">45+ MWp</span>
                  <span className="text-[12px] text-slate-300">Clean Industrial Energy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges & Stat Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/15 items-stretch">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B192C]/75 backdrop-blur-md border border-white/15 shadow-lg h-full">
              <span className="material-symbols-outlined text-[#F59E0B] text-[28px] shrink-0 leading-none">verified_user</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white leading-snug">Super Grade License</span>
                <span className="text-[12px] text-slate-300">Govt. of Karnataka</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B192C]/75 backdrop-blur-md border border-white/15 shadow-lg h-full">
              <span className="material-symbols-outlined text-[#5bb8fe] text-[28px] shrink-0 leading-none">calendar_month</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white leading-snug">5+ Years Excellence</span>
                <span className="text-[12px] text-slate-300">Serving Since 2020</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B192C]/75 backdrop-blur-md border border-white/15 shadow-lg h-full">
              <span className="material-symbols-outlined text-emerald-400 text-[28px] shrink-0 leading-none">security</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white leading-snug">100% Safety Compliance</span>
                <span className="text-[12px] text-slate-300">Zero Deviation Protocols</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B192C]/75 backdrop-blur-md border border-white/15 shadow-lg h-full">
              <span className="material-symbols-outlined text-[#38BDF8] text-[28px] shrink-0 leading-none">map</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white leading-snug">Pan-Karnataka Reach</span>
                <span className="text-[12px] text-slate-300">Rapid Response Mobilization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CREDENTIALS SPOTLIGHT BANNER ================= */}
      <section className="w-full bg-[#dce9ff] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="rounded-2xl bg-white p-8 lg:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 border border-[#CBD5E1]/60">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#F59E0B] text-[32px]">bolt</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[12px] uppercase font-bold tracking-wider text-[#006398]">
                  Official Credentials
                </span>
                <h2 className="font-headline-md text-[#0B192C] font-bold">
                  Super Grade Electrical Contractor in Karnataka
                </h2>
                <p className="font-body-md text-[#44474c] max-w-3xl leading-relaxed">
                  Ananya Electrical solutions is a Super Grade Electrical Contractor with an expertise over 5 years with a luminous track record aimed at maximising Customer Satisfaction. From 2020, Ananya Electrical has been constantly excelling in Designing, Installation, Commissioning of Electrical Systems throughout Karnataka catering to various sectors of the Industry.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
              <button
                onClick={() => onOpenConsultation('Super Grade Contract')}
                className="h-11 px-6 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[14px] font-semibold inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                Engage Super Grade Team
              </button>
              <span className="text-[12px] text-[#44474c] text-center font-medium">
                Class-1 PWD &amp; Electrical Inspectorate Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3D DIGITAL TWIN SPOTLIGHT BANNER ================= */}
      <section className="w-full bg-[#071120] text-white py-14 lg:py-16 relative overflow-hidden border-y border-[#334155]/80">
        {/* Multi-Panel Electrical Services & Equipment Background Collage */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 w-full h-full opacity-45">
            <img
              src={ASSETS.pillarHighVoltage}
              alt="33kV Electrical Substation & Power Transformer Equipment"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 brightness-95 contrast-110"
            />
            <img
              src={ASSETS.project1}
              alt="HT/LT Switchgear Panels & Busbar Trunking Equipment"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 brightness-95 contrast-110 hidden md:block"
            />
            <img
              src={ASSETS.transmissionBg}
              alt="High-Voltage Transmission Lines & Grid Infrastructure"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 brightness-95 contrast-110 hidden md:block"
            />
          </div>
          {/* Layered Readability Overlays so Background Images Shine Through Clearly */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060f1e]/92 via-[#0B192C]/80 to-[#060f1e]/88"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#060f1e]/60 via-transparent to-[#060f1e]/80"></div>
          <div className="absolute -top-24 left-1/3 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284c7]/25 border border-[#38bdf8]/40 w-fit backdrop-blur-md">
                <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">3d_rotation</span>
                <span className="text-[12px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold">
                  Interactive Engineering Digital Twins &amp; Equipment Simulators (WebGL 3D)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Explore Our Interactive 3D Twins: Residential, Layout &amp; Substation Equipment
              </h2>
              <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                Step into real-time 3D engineering simulations. Inspect modern Indian 2BHK concealed conduit wiring, TPN distribution boards with RCCBs, township layout transformers, or 33kV substations with vacuum circuit breakers and solar arrays.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => onSelectTab('residential-3d')}
                className="w-full sm:w-auto h-12 px-5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#059669] hover:to-[#10b981] text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 cursor-pointer border border-[#34d399]/50"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span>3D Home Wiring</span>
              </button>
              <button
                onClick={() => onSelectTab('residential-layout-3d')}
                className="w-full sm:w-auto h-12 px-5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-[#2a1700] font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 cursor-pointer border border-[#fbbf24]/60"
              >
                <span className="material-symbols-outlined text-[20px]">apartment</span>
                <span>3D Layout Electrification</span>
              </button>
              <button
                onClick={() => onSelectTab('twin-3d')}
                className="w-full sm:w-auto h-12 px-5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#006398] hover:from-[#006398] hover:to-[#0284C7] text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 cursor-pointer border border-[#38bdf8]/50"
              >
                <span className="material-symbols-outlined text-[20px]">explore</span>
                <span>3D 33kV Substation</span>
              </button>
            </div>
          </div>

          {/* 4 Visual Equipment & Service Highlights Inside the Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-700/70">
            {[
              {
                title: '33kV / 11kV VCB & Transformers',
                spec: 'ONAN Step-Down & Outdoor Switchyard',
                image: ASSETS.pillarHighVoltage,
                badge: 'Substation Equipment',
                tab: 'twin-3d' as NavigationTab
              },
              {
                title: 'PCC / MCC & APFC Switchboards',
                spec: 'Form-4b ACB Panels & Busduct Trunking',
                image: ASSETS.project1,
                badge: 'Industrial Panels',
                tab: 'electrical' as NavigationTab
              },
              {
                title: 'Concealed Conduits & MCB/RCCB DB',
                spec: 'FRLS Wiring, Smart Switches & Earth Pit',
                image: ASSETS.project3,
                badge: 'Residential Equipment',
                tab: 'residential-3d' as NavigationTab
              },
              {
                title: 'Township DTC & Feeder Pillars',
                spec: '11kV Pole-Mounted DTC & UG XLPE Cables',
                image: ASSETS.transmissionBg,
                badge: 'Layout Infrastructure',
                tab: 'residential-layout-3d' as NavigationTab
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTab(item.tab)}
                className="group relative rounded-xl overflow-hidden border border-slate-600/70 bg-[#0B192C]/80 backdrop-blur-md p-3 flex items-center gap-3.5 cursor-pointer hover:border-[#38bdf8] transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-600 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold">
                    {item.badge}
                  </span>
                  <span className="text-[13px] font-bold text-white truncate group-hover:text-[#5bb8fe] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-300 truncate">{item.spec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3 CORE CAPABILITY PILLARS ================= */}
      <section className="w-full bg-[#f8f9ff] py-20 relative overflow-hidden">
        {/* Subtle Electrical Infrastructure Background Layer */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src={ASSETS.transmissionBg}
            alt="Electrical transmission background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-12"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9ff]/94 via-[#f8f9ff]/88 to-[#f8f9ff]/95"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[14px] uppercase tracking-wider text-[#0284C7] font-bold">
                Engineering Domains
              </span>
              <h2 className="font-headline-lg text-[#0B192C] font-bold">Core Capability Pillars</h2>
            </div>
            <p className="font-body-md text-[#44474c] max-w-md">
              End-to-end turnkey engineering spanning high-voltage transmission grids, decentralized renewable microgrids, and rigorous statutory safety design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: High Voltage */}
            <div
              onClick={() => onSelectTab('electrical')}
              className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-[#E2E8F0]"
            >
              <div className="h-52 w-full overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="High voltage electrical substation switchyard"
                  src={ASSETS.pillarHighVoltage}
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#0B192C]/85 text-white text-[12px] uppercase font-semibold">
                  11kV – 110kV
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#0B192C]">
                    <span className="material-symbols-outlined text-[24px]">power</span>
                  </div>
                  <h3 className="font-headline-sm text-[#0B192C] font-bold">
                    High Voltage &amp; Industrial Electrical
                  </h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed">
                    Full-spectrum engineering for utility-grade substations, custom HT &amp; LT distribution panels, industrial transformer installations, heavy feeder cabling, and plant-wide load balancing audits.
                  </p>
                </div>
                <ul className="flex flex-col gap-2 font-body-sm text-[#44474c]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">check_circle</span>
                    Substation &amp; Transformer Erection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">check_circle</span>
                    HT/LT Switchgear &amp; PCC/MCC Panels
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">check_circle</span>
                    Factory Electrification &amp; Cable Trays
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 2: Clean Solar */}
            <div
              onClick={() => onSelectTab('solar-solutions')}
              className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-[#E2E8F0]"
            >
              <div className="h-52 w-full overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Industrial factory rooftop covered with solar panels"
                  src={ASSETS.pillarSolar}
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#F59E0B] text-[#2a1700] text-[12px] uppercase font-semibold">
                  Renewable EPC
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#F59E0B]">
                    <span className="material-symbols-outlined text-[24px]">wb_sunny</span>
                  </div>
                  <h3 className="font-headline-sm text-[#0B192C] font-bold">
                    Clean Solar Energy Solutions
                  </h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed">
                    Turnkey commercial, industrial, and residential solar power plants. Delivering on-grid, off-grid, and hybrid solar infrastructure paired with full Net Metering approval liaisons.
                  </p>
                </div>
                <ul className="flex flex-col gap-2 font-body-sm text-[#44474c]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">check_circle</span>
                    Commercial &amp; Industrial Rooftop Solar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">check_circle</span>
                    Ground-Mount Captive Solar Plants
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">check_circle</span>
                    BESCOM / Discom Net Metering Sanctions
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 3: Design, Testing & Commissioning */}
            <div
              onClick={() => onSelectTab('services')}
              className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-[#E2E8F0]"
            >
              <div className="h-52 w-full overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Certified electrical engineer reviewing single line diagrams"
                  src={ASSETS.pillarTesting}
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#006398] text-white text-[12px] uppercase font-semibold">
                  Statutory Liaisons
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#0284C7]">
                    <span className="material-symbols-outlined text-[24px]">architecture</span>
                  </div>
                  <h3 className="font-headline-sm text-[#0B192C] font-bold">
                    Design, Testing &amp; Commissioning
                  </h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed">
                    Comprehensive engineering modeling, short-circuit current analysis, harmonic suppression, pre-commissioning testing, and hassle-free Chief Electrical Inspector to Government (CEIG) approvals.
                  </p>
                </div>
                <ul className="flex flex-col gap-2 font-body-sm text-[#44474c]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006398] text-[18px]">check_circle</span>
                    CEIG &amp; Electrical Inspectorate Clearance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006398] text-[18px]">check_circle</span>
                    Relay Coordination &amp; Megger/Hi-Pot Testing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006398] text-[18px]">check_circle</span>
                    Power Factor Optimization (APFC Panels)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED SERVICES & ELECTRICAL EQUIPMENT GRID ================= */}
      <section className="w-full bg-[#F8FAFC] py-20 relative overflow-hidden" id="services">
        {/* Background Electrical Services & Equipment Collage */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full opacity-20">
            <img
              src={ASSETS.project1}
              alt="Industrial HT/LT switchboard room background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <img
              src={ASSETS.pillarHighVoltage}
              alt="High voltage substation transformer yard background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center hidden md:block"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/94 via-[#eff4ff]/90 to-[#F8FAFC]/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
            <span className="text-[14px] uppercase tracking-wider text-[#006398] font-bold">
              Turnkey Capabilities &amp; Certified Hardware
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              Comprehensive Electrical Services &amp; Equipment
            </h2>
            <p className="font-body-md text-[#44474c]">
              Serving industrial manufacturing corridors, IT tech parks, pharmaceutical plants, commercial high-rises, and greenfield solar installations throughout Karnataka with Class-1 turnkey services and type-tested electrical equipment.
            </p>
          </div>

          {/* 9 Turnkey Engineering Services Grid with Equipment Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.slice(0, 9).map((service) => (
              <div
                key={service.id}
                className="rounded-xl bg-white/95 backdrop-blur-md shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5 border border-[#CBD5E1]"
              >
                {/* Visual Equipment Banner */}
                <div className="relative h-32 w-full overflow-hidden bg-[#0B192C]">
                  <img
                    src={service.image || ASSETS.pillarHighVoltage}
                    alt={service.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-[#0B192C]/30 to-transparent"></div>
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0B192C]/85 text-[#38bdf8] text-[10px] font-mono font-bold border border-sky-400/30 backdrop-blur-xs">
                      {service.voltageClass || '11kV / 415V'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#2a1700] text-[10px] uppercase font-bold">
                      {service.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-[#0B192C] flex items-center justify-center shrink-0 shadow-md group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{service.icon}</span>
                    </div>
                    <h3 className="text-[15px] text-white font-bold leading-tight line-clamp-1">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] text-[#44474c] leading-snug line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {service.specs.slice(0, 3).map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#f8f9ff] text-[#00476e] border border-[#CBD5E1] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[10.5px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-emerald-600">verified</span>
                      CEIG &amp; IS Compliant
                    </span>
                    <button
                      onClick={() => onOpenConsultation(service.title)}
                      className="text-[12px] text-[#006398] hover:text-[#0B192C] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Inquire <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dedicated Heavy Electrical Equipment & Hardware Supply Showcase */}
          <div className="rounded-3xl bg-[#0B192C] text-white p-8 lg:p-10 relative overflow-hidden border border-slate-700 shadow-xl">
            {/* Background Equipment Image Layer inside the Catalog Box */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <img
                src={ASSETS.transmissionBg}
                alt="Electrical substation equipment background"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060f1e]/95 via-[#0B192C]/88 to-[#060f1e]/92"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/80 pb-6">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-mono uppercase tracking-wider font-bold w-fit">
                    <span className="material-symbols-outlined text-[15px]">precision_manufacturing</span>
                    Heavy Electrical Equipment &amp; Switchgear Supply
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Certified Industrial Electrical Equipment Portfolio
                  </h3>
                  <p className="text-slate-300 text-sm max-w-2xl">
                    Type-tested high-voltage and low-voltage electrical equipment supplied, erected, tested, and commissioned with full manufacturer warranty and CEIG statutory clearances.
                  </p>
                </div>
                <button
                  onClick={() => onSelectTab('services')}
                  className="shrink-0 h-11 px-5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors w-fit"
                >
                  <span>View All 12 Services &amp; Specs</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {ELECTRICAL_EQUIPMENT.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#1E293B]/90 backdrop-blur-md border border-slate-700 hover:border-[#38bdf8] overflow-hidden flex flex-col justify-between group transition-all"
                  >
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/25 to-transparent"></div>
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0B192C]/90 text-[#F59E0B] text-[9.5px] font-mono font-bold uppercase border border-amber-400/30">
                        {item.category}
                      </span>
                      <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-mono text-[#38bdf8] font-bold truncate">
                        {item.voltageRating} • {item.capacityRange}
                      </span>
                    </div>

                    <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-[13px] font-bold text-white leading-tight group-hover:text-[#5bb8fe] transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                          {item.description}
                        </p>
                        <ul className="flex flex-col gap-0.5 pt-0.5">
                          {item.features.slice(0, 2).map((feat, fIdx) => (
                            <li key={fIdx} className="text-[10.5px] text-slate-300 flex items-start gap-1">
                              <span className="material-symbols-outlined text-[12px] text-emerald-400 shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                        <span className="text-[9.5px] font-mono text-slate-400">{item.standard}</span>
                        <button
                          onClick={() => onOpenConsultation(item.name)}
                          className="text-[11px] font-bold text-[#38bdf8] hover:text-white flex items-center gap-0.5 cursor-pointer"
                        >
                          Quote <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OUR ELECTRICAL SERVICES (NEW SECTION) ================= */}
      <ElectricalServicesSection onEnquire={(service) => onOpenConsultation(service)} />

      {/* ================= ABOUT ANANYA & TECHNICAL METRICS ================= */}
      <section className="w-full bg-white py-20" id="about-us">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Visual Collage */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="relative flex-1 min-h-[320px] rounded-2xl overflow-hidden shadow-lg border border-[#CBD5E1] flex flex-col justify-end">
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Electrical engineers in reflective vests and hard hats inspecting high-power breaker equipment"
                  src={ASSETS.aboutExecution}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-[#0B192C]/25 to-transparent"></div>
                <div className="relative z-10 p-5 text-white flex flex-col gap-0.5">
                  <span className="text-[12px] uppercase tracking-wider text-[#5bb8fe] font-semibold">
                    Field Execution
                  </span>
                  <p className="font-headline-sm font-bold text-white">
                    Rigorous Safety &amp; Zero Deviation Protocols
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#e5eeff] flex items-center justify-between gap-4 border border-[#CBD5E1]/60 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[#44474c] uppercase font-bold tracking-wider">
                    Licensing Authority
                  </span>
                  <span className="font-headline-sm text-[17px] font-bold text-[#0B192C]">
                    Electrical Inspectorate, Karnataka
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#FEF3C7] text-[#2a1700] text-[12px] font-bold tracking-wider uppercase shrink-0">
                  SUPER GRADE
                </span>
              </div>
            </div>

            {/* Copy & Metrics */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[13px] uppercase tracking-wider text-[#0284C7] font-bold">
                  About Our Enterprise
                </span>
                <h2 className="font-headline-lg text-[#0B192C] font-bold">
                  Precision Infrastructure Built on Trust and Rigor
                </h2>
                <p className="font-body-lg text-[#44474c] leading-relaxed">
                  Founded in 2020, Ananya Electrical Solutions has swiftly become one of Karnataka&apos;s most trusted Super Grade electrical engineering partners. We bridge the critical gap between complex utility requirements and reliable industrial power systems.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3.5 border border-[#E2E8F0] h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px] leading-none">workspace_premium</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-[15px] text-[#0B192C] font-bold leading-snug">
                      Super Grade Certified
                    </span>
                    <span className="font-body-sm text-[#44474c] leading-relaxed">
                      Authorized for multi-megawatt high-voltage works throughout Karnataka state.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3.5 border border-[#E2E8F0] h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px] leading-none">engineering</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-[15px] text-[#0B192C] font-bold leading-snug">
                      Master In-House Engineers
                    </span>
                    <span className="font-body-sm text-[#44474c] leading-relaxed">
                      Qualified electrical supervisors and certified solar project technicians.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3.5 border border-[#E2E8F0] h-full">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px] leading-none">health_and_safety</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-[15px] text-[#0B192C] font-bold leading-snug">
                      100% Safety Compliance
                    </span>
                    <span className="font-body-sm text-[#44474c] leading-relaxed">
                      Strict compliance with Indian Electricity Rules (IER) and CEA safety standards.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3.5 border border-[#E2E8F0] h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#006398] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px] leading-none">handshake</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-[15px] text-[#0B192C] font-bold leading-snug">
                      Single-Window Delivery
                    </span>
                    <span className="font-body-sm text-[#44474c] leading-relaxed">
                      Concept to commissioning, including complete board and ESCOM approvals.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#E2E8F0]">
                <div className="flex flex-col">
                  <span className="font-stat-counter text-[#0B192C] text-[28px] sm:text-[34px]">5+</span>
                  <span className="font-body-sm text-[#44474c] mt-0.5">Years Industry Leadership</span>
                </div>
                <div className="flex flex-col border-l border-[#E2E8F0] pl-4">
                  <span className="font-stat-counter text-[#0284C7] text-[28px] sm:text-[34px]">100%</span>
                  <span className="font-body-sm text-[#44474c] mt-0.5">Client Safety Record</span>
                </div>
                <div className="flex flex-col border-l border-[#E2E8F0] pl-4">
                  <span className="font-stat-counter text-[#F59E0B] text-[28px] sm:text-[34px]">24/7</span>
                  <span className="font-body-sm text-[#44474c] mt-0.5">Emergency Grid Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP PRECISION PROCESS & FIELD EQUIPMENT ================= */}
      <section className="w-full bg-[#071120] text-white py-20 relative overflow-hidden border-y border-slate-800">
        {/* Full-Bleed Multi-Panel Electrical Services & Equipment Background Images */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full h-full opacity-40">
            <img
              src={ASSETS.pillarHighVoltage}
              alt="33kV substation switchyard background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105"
            />
            <img
              src={ASSETS.project1}
              alt="HT/LT PCC and MCC switchgear panels background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 hidden md:block"
            />
            <img
              src={ASSETS.project3}
              alt="Industrial heavy cable trays and XLPE feeders background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 hidden lg:block"
            />
            <img
              src={ASSETS.aboutExecution}
              alt="Electrical testing and commissioning engineers background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 hidden lg:block"
            />
          </div>
          {/* Atmospheric Dark Navy Readability Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060f1e]/90 via-[#0B192C]/80 to-[#060f1e]/92"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#060f1e]/85 via-transparent to-[#060f1e]/85"></div>
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#F59E0B]/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0284C7]/25 border border-[#38bdf8]/40 text-[12px] uppercase tracking-wider text-[#5bb8fe] font-bold backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px]">electrical_services</span>
              Execution Methodology &amp; Field Equipment
            </span>
            <h2 className="font-headline-lg text-white font-bold">
              How We Power Your Facilities: Turnkey Services &amp; Equipment
            </h2>
            <p className="font-body-md text-slate-200">
              A disciplined, zero-shortcut engineering workflow backed by NABL-calibrated diagnostic instruments, heavy substation machinery, and type-tested switchgear across Karnataka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stages.map((stage, idx) => (
              <div
                key={stage.num}
                onClick={() => setActiveStage(activeStage === idx ? null : idx)}
                className={`rounded-xl bg-[#1E293B]/90 backdrop-blur-md text-white flex flex-col overflow-hidden relative border transition-all cursor-pointer group ${
                  activeStage === idx
                    ? 'border-[#38bdf8] ring-2 ring-[#0284C7]/40 shadow-xl'
                    : 'border-slate-700/90 hover:border-[#38bdf8]/70'
                }`}
              >
                {/* Stage Equipment & Service Image Header */}
                <div className="relative h-28 w-full overflow-hidden bg-[#0B192C]">
                  <img
                    src={stage.image}
                    alt={stage.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#0B192C]/40 to-transparent"></div>
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#0B192C]/90 text-[#F59E0B] text-[10px] font-mono font-bold border border-amber-400/30">
                      {stage.num}
                    </span>
                    <div className="w-7 h-7 rounded-md bg-[#0B192C]/85 border border-slate-600 flex items-center justify-center text-[#38bdf8]">
                      <span className="material-symbols-outlined text-[16px]">{stage.icon}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 left-2.5 right-2.5">
                    <span className="text-[10px] font-mono text-[#38bdf8] font-semibold line-clamp-1">
                      {stage.equipmentTag}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col gap-2 flex-1">
                  <h3 className="text-[15px] font-bold text-white group-hover:text-[#5bb8fe] transition-colors leading-snug">
                    {stage.title}
                  </h3>
                  <p className="text-[11.5px] text-slate-300 leading-snug line-clamp-2">
                    {stage.desc}
                  </p>

                  {/* Expanded deliverables breakdown */}
                  <div className="pt-2 border-t border-slate-700/80 mt-auto">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Key Deliverables &amp; Hardware:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {stage.deliverables.map((item, dIdx) => (
                        <span
                          key={dIdx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-200 border border-slate-600/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Field Service & Testing Equipment Showcase Bar Inside Section 8 */}
          <div className="p-6 rounded-2xl bg-[#0B192C]/85 backdrop-blur-md border border-slate-700/90 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7]/15 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shrink-0">
                  <span className="material-symbols-outlined text-[22px]">handyman</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">
                    Specialized Electrical Equipment &amp; Testing Fleet Deployed On-Site
                  </h3>
                  <p className="text-[12.5px] text-slate-300">
                    Every installation is executed with calibrated primary/secondary testing kits and BIS/IEC certified switchgear components.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenConsultation('Turnkey Electrical Equipment & Testing')}
                className="shrink-0 h-10 px-4 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-[#2a1700] font-bold text-[12.5px] flex items-center gap-1.5 cursor-pointer transition-colors w-fit"
              >
                <span className="material-symbols-outlined text-[17px]">request_quote</span>
                <span>Book Equipment &amp; Service Audit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: '11kV–110kV Transformers', spec: 'ONAN & Dry Cast Resin', img: ASSETS.pillarHighVoltage },
                { name: 'HT VCB & GIS RMU Panels', spec: '25kA / 31.5kA Draw-out', img: ASSETS.transmissionBg },
                { name: 'Form-4b PCC & MCC Panels', spec: 'ACB / MCCB up to 6300A', img: ASSETS.project1 },
                { name: 'Armored XLPE & Busducts', spec: 'HDG Trays & Sandwich Bus', img: ASSETS.project3 },
                { name: 'Tier-1 Solar PV & Inverters', spec: 'Bifacial Modules & String', img: ASSETS.pillarSolar },
                { name: 'Hi-Pot, Megger & Relay Kits', spec: '10kV IR & Thermal Scan', img: ASSETS.aboutExecution }
              ].map((eq, i) => (
                <div
                  key={i}
                  onClick={() => onOpenConsultation(eq.name)}
                  className="rounded-xl overflow-hidden border border-slate-700 bg-[#1E293B]/90 hover:border-[#38bdf8] transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-20 w-full overflow-hidden relative">
                    <img
                      src={eq.img}
                      alt={eq.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent"></div>
                  </div>
                  <div className="p-2.5 flex flex-col gap-0.5">
                    <span className="text-[11.5px] font-bold text-white leading-tight group-hover:text-[#38bdf8] transition-colors">
                      {eq.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{eq.spec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENT EXECUTION HIGHLIGHTS ================= */}
      <section className="w-full bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[14px] uppercase tracking-wider text-[#006398] font-bold">
                Track Record
              </span>
              <h2 className="font-headline-lg text-[#0B192C] font-bold">Key Project Domains</h2>
            </div>
            
            {/* Functional Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E2E8F0]">
              {(['all', 'industrial', 'commercial', 'solar'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProjectFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-semibold capitalize transition-colors cursor-pointer ${
                    projectFilter === cat
                      ? 'bg-[#0B192C] text-white shadow-sm'
                      : 'text-[#44474c] hover:text-[#0B192C]'
                  }`}
                >
                  {cat === 'all' ? 'All Projects' : cat === 'solar' ? 'Solar Parks' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all flex flex-col border border-[#E2E8F0] cursor-pointer group"
              >
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={project.title}
                    src={project.image}
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#0B192C]/80 text-white text-[11px] font-semibold backdrop-blur-sm">
                    {project.completionYear}
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1 justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] text-[#0284C7] uppercase font-bold tracking-wider">
                      {project.tag}
                    </span>
                    <h3 className="font-headline-sm text-[#0B192C] font-bold group-hover:text-[#0284C7] transition-colors">
                      {project.title}
                    </h3>
                    <p className="font-body-sm text-[#44474c] line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[12px] pt-3 border-t border-[#E2E8F0]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {project.location}
                    </span>
                    <span className="text-emerald-600 font-semibold">{project.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => onSelectTab('projects-gallery')}
              className="inline-flex items-center gap-2 text-[14px] text-[#006398] hover:text-[#0B192C] font-bold"
            >
              <span>View All Karnataka Case Studies &amp; Commissioning Approvals</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= PROJECT INSPECTION MODAL ================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]">
            <div className="relative h-56 sm:h-64">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-[#0B192C]/90 text-white flex justify-between items-center backdrop-blur-md">
                <span className="text-[12px] font-bold text-[#F59E0B] uppercase">{selectedProject.tag}</span>
                <span className="text-[12px] text-emerald-400 font-semibold">{selectedProject.status}</span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-headline-md text-[#0B192C] font-bold">{selectedProject.title}</h3>
              <p className="text-[14px] text-[#44474c]">{selectedProject.description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] text-[13px]">
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase">Connected Load</span>
                  <strong className="text-[#0B192C]">{selectedProject.capacity || 'Custom High Voltage'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase">Voltage Class</span>
                  <strong className="text-[#0B192C]">{selectedProject.voltage || '11kV / 33kV'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase">Location</span>
                  <strong className="text-[#0B192C]">{selectedProject.location}</strong>
                </div>
              </div>

              <div>
                <span className="text-[12px] text-slate-500 uppercase font-semibold block mb-1.5">
                  Statutory Clearances &amp; Approvals
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.approvals.map((app, i) => (
                    <span key={i} className="text-[12px] px-2.5 py-1 rounded bg-[#e5eeff] text-[#00476e] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#0284C7]">check</span>
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-[#44474c] text-[13px] font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const title = selectedProject.title;
                    setSelectedProject(null);
                    onOpenConsultation(title);
                  }}
                  className="px-5 py-2 rounded-lg bg-[#0B192C] text-white text-[13px] font-semibold hover:bg-[#006398] transition-colors"
                >
                  Request Similar Installation Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONVERSION & TECHNICAL INQUIRY ================= */}
      <section className="w-full bg-[#e5eeff] py-20" id="consultation">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="rounded-3xl bg-white shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-[#CBD5E1]">
            {/* Direct Contact Column */}
            <div className="lg:col-span-5 bg-[#0B192C] text-white p-8 lg:p-12 flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[12px] uppercase font-bold w-fit">
                  <span className="material-symbols-outlined text-[14px] text-[#F59E0B]">bolt</span>
                  Super Grade Contractor
                </div>
                <h3 className="font-headline-lg text-white font-bold">
                  Initiate Your Project Consultation
                </h3>
                <p className="font-body-md text-slate-300 leading-relaxed">
                  Connect directly with our master electrical engineers. We handle statutory sanctions, load design, technical drawings, and turnkey procurement across all districts of Karnataka.
                </p>
              </div>

              {/* Contact items */}
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-[#5bb8fe]">
                    <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-400 uppercase">Emergency &amp; Grid Dispatch</span>
                    <a href="tel:+918660121438" className="font-headline-sm text-[18px] text-white font-bold hover:text-[#5bb8fe] transition-colors">
                      +91 8660121438
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-[#F59E0B]">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-400 uppercase">Technical Desk</span>
                    <span className="font-headline-sm text-[18px] text-white font-bold">
                      contact@ananyaelectricalsolutions.in
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-emerald-400">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-400 uppercase">Registered Base</span>
                    <span className="font-body-md text-slate-300">
                      Bengaluru &amp; Industrial Corridors, Karnataka, India
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1E293B] text-white flex items-center gap-3 border border-slate-700">
                <span className="material-symbols-outlined text-[#F59E0B] text-[24px]">verified</span>
                <span className="font-body-sm text-slate-300">
                  Government of Karnataka Licensed Super Grade Electrical Contractor.
                </span>
              </div>
            </div>

            {/* Interactive Form Column */}
            <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6" id="quote-form">
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline-sm text-[#0B192C] font-bold">
                    Request an Engineering Proposal
                  </h4>
                  <p className="font-body-sm text-[#44474c]">
                    Submit your facility parameters for a certified feasibility review and cost estimate.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="client-name">
                      Your Name / Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="h-11 px-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                      id="client-name"
                      placeholder="e.g. Precision Components Ltd."
                      required
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="client-phone">
                      Contact Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="h-11 px-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                      id="client-phone"
                      placeholder="+91 98765 43210"
                      required
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="project-type">
                      Project Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="h-11 px-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white cursor-pointer"
                      id="project-type"
                      required
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <optgroup label="Residential Electrical Services">
                        <option value="home-wiring">Home Wiring &amp; Rewiring</option>
                        <option value="earthing-grounding">Earthing and Grounding (Safety Systems)</option>
                        <option value="home-automation">Smart Home Automation &amp; Controls</option>
                        <option value="layout-electrification">New Layout Electrification (Turnkey Residential)</option>
                      </optgroup>
                      <optgroup label="Industrial &amp; Commercial High Voltage">
                        <option value="substation">Substation / HT Distribution (11kV - 110kV)</option>
                        <option value="solar">Turnkey Solar EPC (Rooftop / Ground)</option>
                        <option value="panels">LT Switchboards &amp; Control Panels</option>
                        <option value="audit">Energy Audit &amp; Power Factor Correction</option>
                        <option value="statutory">CEIG / KPTCL Statutory Liaison</option>
                        <option value="amc">Industrial AMC &amp; Preventive Maintenance</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="location">
                      Project Location in Karnataka <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="h-11 px-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                      id="location"
                      placeholder="e.g. Peenya / Bommasandra / Mysuru"
                      required
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="notes">
                    Project Scope &amp; Connected Load Details
                  </label>
                  <textarea
                    className="p-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                    id="notes"
                    placeholder="Specify load requirements (e.g. 500 kVA), building type, timelines, or solar capacity required..."
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    checked={complianceCheck}
                    onChange={(e) => setComplianceCheck(e.target.checked)}
                    className="w-4 h-4 accent-[#0284C7] rounded cursor-pointer"
                    id="compliance-check"
                    required
                    type="checkbox"
                  />
                  <label className="font-body-sm text-[#44474c] cursor-pointer" htmlFor="compliance-check">
                    I request technical compliance review according to Karnataka Inspectorate guidelines.
                  </label>
                </div>

                <button
                  className="h-12 w-full rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[14px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Submit Engineering Inquiry
                </button>

                {formSubmitted && (
                  <div className="p-4 rounded bg-emerald-50 text-emerald-800 font-body-sm flex items-center gap-2 border border-emerald-200">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span>
                      Thank you. Your engineering parameters have been received. An Ananya Super Grade Engineer will reach out within 4 business hours.
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REGULATORY & GEOGRAPHIC FOOTPRINT ================= */}
      <section className="w-full bg-white py-16 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#2a1700] shrink-0">
                <span className="material-symbols-outlined text-[28px] text-[#F59E0B]">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-[#0B192C] font-bold">
                  Statutory Accreditation &amp; Governance
                </span>
                <span className="font-body-sm text-[#44474c]">
                  Full statutory compliance with Central Electricity Authority (CEA) &amp; KERC regulations
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ESCOMS.map((escom) => (
                <span
                  key={escom.name}
                  title={escom.region}
                  className="px-3 py-1 rounded bg-[#f8f9ff] text-[#0B192C] text-[12px] font-semibold border border-[#E2E8F0]"
                >
                  {escom.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center items-stretch">
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col justify-center gap-1">
              <span className="font-headline-md text-[#0B192C] font-bold">100%</span>
              <span className="font-body-sm text-[#44474c]">Statutory Clearance Rate</span>
            </div>
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col justify-center gap-1">
              <span className="font-headline-md text-[#0284C7] font-bold">&lt; 48 Hrs</span>
              <span className="font-body-sm text-[#44474c]">Rapid Site Mobilization</span>
            </div>
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col justify-center gap-1">
              <span className="font-headline-md text-[#0B192C] font-bold">Class-1</span>
              <span className="font-body-sm text-[#44474c]">PWD Registered Contractor</span>
            </div>
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col justify-center gap-1">
              <span className="font-headline-md text-[#F59E0B] font-bold">Tier-1</span>
              <span className="font-body-sm text-[#44474c]">Certified Solar Components</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
