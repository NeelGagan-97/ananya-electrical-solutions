import React, { useState } from 'react';
import { NavigationTab, EngineeringInquiry, ProjectItem } from '../types';
import { ASSETS, SERVICES, PROJECTS, ESCOMS } from '../data/constants';
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
      desc: 'On-site engineering inspection, connected load calculations, short-circuit levels assessment, and feasibility studies for grid interconnection or rooftop solar.',
      deliverables: ['Load profiling log', 'Fault level study', 'Soil resistivity report', 'Site layout CAD']
    },
    {
      num: 'STAGE 02',
      title: 'CAD Design & Sanctions',
      icon: 'design_services',
      desc: 'Drafting precision Single Line Diagrams (SLD), equipment layouts, and statutory drawings for CEIG approval and BESCOM load sanctioning.',
      deliverables: ['Single Line Diagram (SLD)', 'CEIG Drawing Sanction File', 'Substation Earth Grid CAD', 'Cable Schedule']
    },
    {
      num: 'STAGE 03',
      title: 'Precision Installation',
      icon: 'construction',
      desc: 'Deployment of transformers, cabling, HT/LT panels, solar arrays, and high-integrity earth pits adhering strictly to CPWD and CEA installation standards.',
      deliverables: ['Transformer positioning', 'Busduct joint torquing', 'Cable termination & glanding', 'Solar array tilt alignment']
    },
    {
      num: 'STAGE 04',
      title: 'Commissioning & AMC',
      icon: 'verified',
      desc: 'Rigorous pre-commissioning Megger/Hi-Pot tests, government safety inspection pass, plant energization, followed by 24/7 preventative maintenance support.',
      deliverables: ['Hi-Pot breakdown test', 'CEIG Safety Certificate', 'Discom Energization Letter', '24/7 Emergency Dispatch']
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full bg-[#0B192C] text-white overflow-hidden py-16 lg:py-24">
        {/* Ambient Technical Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="48" id="hero-grid" patternUnits="userSpaceOnUse" width="48">
                <path className="text-[#0284C7]" d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#hero-grid)" height="100%" width="100%" />
          </svg>
        </div>

        {/* Soft Glow Accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
          {/* Top Monospace Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] text-[#2a1700] text-[12px] uppercase tracking-wider font-semibold shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">verified</span>
              Karnataka Electrical Inspectorate • Super Grade Licensed Contractor
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[12px] text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HT/LT Dispatch &amp; Solar EPC Active across Karnataka</span>
            </div>
          </div>

          {/* Main Hero Split Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[14px] uppercase tracking-widest text-[#0284C7] font-bold">
                  Engineering Infrastructure • Est. 2020
                </span>
                <h1 className="font-display-xl text-white tracking-tight font-extrabold leading-tight">
                  Powering Progress with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5bb8fe] via-[#0284C7] to-sky-300">
                    Precision Engineering
                  </span>{' '}
                  &amp; Clean Energy
                </h1>
              </div>

              <p className="font-body-lg text-slate-300 leading-relaxed max-w-2xl">
                Welcome to Ananya Electrical Solutions. We specialize in delivering safe, efficient, and innovative electrical services tailored to meet the needs of homes, businesses, and industrial facilities. From design and installation to maintenance and troubleshooting, our expert team is committed to powering your world with precision, professionalism, and care. Whether you're upgrading your system, building from the ground up, or looking for energy-efficient alternatives — we bring the expertise and reliability you can trust.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onSelectTab('services')}
                  className="inline-flex items-center justify-center h-12 px-7 rounded-lg bg-[#0284C7] hover:bg-[#2563EB] text-white text-[14px] font-bold shadow-lg shadow-[#0284C7]/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] mr-2">precision_manufacturing</span>
                  Explore Industrial Services
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('consultation');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else onOpenConsultation();
                  }}
                  className="inline-flex items-center justify-center h-12 px-7 rounded-lg bg-[#1E293B]/90 hover:bg-[#1E293B] text-white text-[14px] font-bold shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] mr-2 text-[#F59E0B]">request_quote</span>
                  Request Technical Consultation
                </button>
              </div>

              {/* Micro Spec Tags */}
              <div className="flex flex-wrap items-center gap-3 pt-4 text-slate-400 text-[12px]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0284C7]">offline_bolt</span> 11kV – 110kV Transmission
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">solar_power</span> Net-Metered Solar EPC
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">gavel</span> KPTCL &amp; BESCOM Approved
                </span>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#1E293B] border border-slate-700">
                <img
                  className="w-full h-80 object-cover"
                  alt="High-voltage power transmission tower with electrical switchgear substation and solar panels"
                  src={ASSETS.hero}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0B192C]/90 backdrop-blur-md flex items-center justify-between border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0284C7]/20 flex items-center justify-center text-[#5bb8fe]">
                      <span className="material-symbols-outlined text-[22px]">electrical_services</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white">Utility &amp; Grid EPC</span>
                      <span className="text-[13px] text-slate-400">Substations &amp; Rooftop PV</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-[12px] font-semibold uppercase">
                    Super Grade
                  </span>
                </div>
              </div>

              {/* Quick Telemetry Ticker */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#1E293B] text-white flex flex-col gap-1 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-400 uppercase tracking-wider">Substations Delivered</span>
                    <span className="material-symbols-outlined text-[#0284C7] text-[18px]">domain</span>
                  </div>
                  <span className="font-stat-counter text-white">150+ MVA</span>
                  <span className="text-[13px] text-slate-400">Aggregated Connected Load</span>
                </div>
                <div className="p-4 rounded-xl bg-[#1E293B] text-white flex flex-col gap-1 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-400 uppercase tracking-wider">Solar Capacity</span>
                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">wb_sunny</span>
                  </div>
                  <span className="font-stat-counter text-white">45+ MWp</span>
                  <span className="text-[13px] text-slate-400">Clean Industrial Energy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges & Stat Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/40 border border-slate-800/60">
              <span className="material-symbols-outlined text-[#F59E0B] text-[28px] shrink-0">verified_user</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">Super Grade License</span>
                <span className="text-[13px] text-slate-400">Govt. of Karnataka</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/40 border border-slate-800/60">
              <span className="material-symbols-outlined text-[#5bb8fe] text-[28px] shrink-0">calendar_month</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">5+ Years Excellence</span>
                <span className="text-[13px] text-slate-400">Serving Since 2020</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/40 border border-slate-800/60">
              <span className="material-symbols-outlined text-emerald-400 text-[28px] shrink-0">security</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">100% Safety Compliance</span>
                <span className="text-[13px] text-slate-400">Zero Deviation Protocols</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/40 border border-slate-800/60">
              <span className="material-symbols-outlined text-[#0284C7] text-[28px] shrink-0">map</span>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">Pan-Karnataka Reach</span>
                <span className="text-[13px] text-slate-400">Rapid Response Mobilization</span>
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

      {/* ================= 3 CORE CAPABILITY PILLARS ================= */}
      <section className="w-full bg-[#f8f9ff] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
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

      {/* ================= FEATURED SERVICES GRID (6 CARDS) ================= */}
      <section className="w-full bg-[#F8FAFC] py-20" id="services">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
            <span className="text-[14px] uppercase tracking-wider text-[#006398] font-bold">
              Turnkey Capabilities
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              Comprehensive Engineering Services
            </h2>
            <p className="font-body-md text-[#44474c]">
              Serving industrial manufacturing corridors, IT tech parks, pharmaceutical plants, commercial high-rises, and greenfield solar installations throughout Karnataka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="p-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 group hover:-translate-y-1 border border-[#E2E8F0]"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#dce9ff] flex items-center justify-center text-[#0B192C] group-hover:bg-[#0B192C] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-[#0B192C] font-bold">{service.title}</h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  <span className="text-[12px] text-slate-500 uppercase font-semibold">
                    {service.badge}
                  </span>
                  <button
                    onClick={() => onOpenConsultation(service.title)}
                    className="text-[14px] text-[#006398] hover:text-[#0B192C] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Inquire <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onSelectTab('services')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#0B192C] text-[#0B192C] hover:bg-[#0B192C] hover:text-white font-semibold text-[14px] transition-colors cursor-pointer"
            >
              <span>Explore All 8 Detailed Engineering Services &amp; Testing Capabilities</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= OUR ELECTRICAL SERVICES (NEW SECTION) ================= */}
      <ElectricalServicesSection onEnquire={(service) => onOpenConsultation(service)} />

      {/* ================= ABOUT ANANYA & TECHNICAL METRICS ================= */}
      <section className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Collage */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#CBD5E1]">
                <img
                  className="w-full h-80 object-cover"
                  alt="Electrical engineers in reflective vests and hard hats inspecting high-power breaker equipment"
                  src={ASSETS.aboutExecution}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[12px] uppercase tracking-wider text-[#5bb8fe] font-semibold">
                    Field Execution
                  </span>
                  <p className="font-headline-sm font-bold">Rigorous Safety &amp; Zero Deviation Protocols</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#e5eeff] flex items-center justify-between gap-4 border border-[#CBD5E1]/60">
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#44474c] uppercase font-semibold">Licensing Authority</span>
                  <span className="font-headline-sm font-bold text-[#0B192C]">
                    Electrical Inspectorate, Karnataka
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#FEF3C7] text-[#2a1700] text-[13px] font-bold">
                  SUPER GRADE
                </span>
              </div>
            </div>

            {/* Copy & Metrics */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] uppercase tracking-wider text-[#0284C7] font-bold">
                  About Our Enterprise
                </span>
                <h2 className="font-headline-lg text-[#0B192C] font-bold">
                  Precision Infrastructure Built on Trust and Rigor
                </h2>
              </div>
              <p className="font-body-lg text-[#44474c] leading-relaxed">
                Founded in 2020, Ananya Electrical Solutions has swiftly become one of Karnataka's most trusted Super Grade electrical engineering partners. We bridge the critical gap between complex utility requirements and reliable industrial power systems.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3 border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[24px] shrink-0">workspace_premium</span>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[16px] text-[#0B192C] font-bold">Super Grade Certified</span>
                    <span className="font-body-sm text-[#44474c]">Authorized for multi-megawatt high-voltage works throughout Karnataka state.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3 border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#0284C7] text-[24px] shrink-0">engineering</span>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[16px] text-[#0B192C] font-bold">Master In-House Engineers</span>
                    <span className="font-body-sm text-[#44474c]">Qualified electrical supervisors and certified solar project technicians.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3 border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px] shrink-0">health_and_safety</span>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[16px] text-[#0B192C] font-bold">100% Safety Compliance</span>
                    <span className="font-body-sm text-[#44474c]">Strict compliance with Indian Electricity Rules (IER) and CEA safety standards.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3 border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#006398] text-[24px] shrink-0">handshake</span>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[16px] text-[#0B192C] font-bold">Single-Window Delivery</span>
                    <span className="font-body-sm text-[#44474c]">Concept to commissioning, including complete board and ESCOM approvals.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="font-stat-counter text-[#0B192C]">5+</span>
                  <span className="font-body-sm text-[#44474c]">Years Industry Leadership</span>
                </div>
                <div className="w-px h-12 bg-[#E2E8F0]"></div>
                <div className="flex flex-col">
                  <span className="font-stat-counter text-[#0284C7]">100%</span>
                  <span className="font-body-sm text-[#44474c]">Client Safety Record</span>
                </div>
                <div className="w-px h-12 bg-[#E2E8F0]"></div>
                <div className="flex flex-col">
                  <span className="font-stat-counter text-[#F59E0B]">24/7</span>
                  <span className="font-body-sm text-[#44474c]">Emergency Grid Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP PRECISION PROCESS ================= */}
      <section className="w-full bg-[#0B192C] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-3">
            <span className="text-[14px] uppercase tracking-wider text-[#5bb8fe] font-bold">
              Execution Methodology
            </span>
            <h2 className="font-headline-lg text-white font-bold">How We Power Your Facilities</h2>
            <p className="font-body-md text-slate-300">
              A disciplined, zero-shortcut process tested over half a decade across Karnataka's industrial and clean energy landscapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, idx) => (
              <div
                key={stage.num}
                onClick={() => setActiveStage(activeStage === idx ? null : idx)}
                className={`p-6 rounded-xl bg-[#1E293B] text-white flex flex-col gap-4 relative border transition-all cursor-pointer ${
                  activeStage === idx ? 'border-[#0284C7] ring-2 ring-[#0284C7]/30 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#F59E0B] font-mono font-bold">{stage.num}</span>
                  <span className="material-symbols-outlined text-slate-400 text-[24px]">{stage.icon}</span>
                </div>
                <h3 className="font-headline-sm font-bold">{stage.title}</h3>
                <p className="font-body-sm text-slate-300 leading-relaxed">
                  {stage.desc}
                </p>

                {/* Expanded deliverables breakdown */}
                <div className="pt-3 border-t border-slate-700/80 mt-auto">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                    Key Deliverables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stage.deliverables.map((item, dIdx) => (
                      <span key={dIdx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-[#0B192C] font-bold">100%</span>
              <span className="font-body-sm text-[#44474c]">Statutory Clearance Rate</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-[#0284C7] font-bold">&lt; 48 Hrs</span>
              <span className="font-body-sm text-[#44474c]">Rapid Site Mobilization</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-[#0B192C] font-bold">Class-1</span>
              <span className="font-body-sm text-[#44474c]">PWD Registered Contractor</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-[#F59E0B] font-bold">Tier-1</span>
              <span className="font-body-sm text-[#44474c]">Certified Solar Components</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
