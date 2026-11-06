import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, EngineeringInquiry, ProjectItem } from '../types';
import { ASSETS, SERVICES, PROJECTS, ESCOMS, ELECTRICAL_EQUIPMENT } from '../data/constants';
import { ElectricalServicesSection } from '../components/ElectricalServicesSection';
import { RealisticLightningBackground } from '../components/RealisticLightningBackground';
import { openAesEnquiryModal, FormId } from '../components/forms';
import {
  BUSINESS_NAP,
  trackConversionEvent,
  buildWhatsAppInquiryUrl,
  buildMailtoInquiryUrl,
} from '../utils/seo';

const SERVICE_TO_FORM_MAP: Record<string, FormId> = {
  'industrial-automation': 'industrial-commercial',
  'substations-transformers': 'ht-lt-works',
  'cable-trays-xlpe-cabling': 'ht-lt-works',
  'testing-commissioning': 'safety-audit',
  'statutory-liaison': 'design-consultancy',
  'industrial-amc': 'maintenance-amc',
  'energy-audits-apfc': 'safety-audit',
  'vcb-acb-switchgear': 'ht-lt-works',
  'dg-sync-ups-backup': 'industrial-commercial',
  'lightning-earthing-protection': 'safety-audit',
};

const EQUIPMENT_TO_FORM_MAP: Record<string, FormId> = {
  'eq-power-transformers': 'ht-lt-works',
  'eq-vcb-rmu-switchgear': 'ht-lt-works',
  'eq-pcc-mcc-panels': 'industrial-commercial',
  'eq-sandwich-busduct': 'industrial-commercial',
  'eq-apfc-harmonic': 'safety-audit',
  'eq-solar-inverters-pv': 'solar-rooftop',
  'eq-testing-diagnostics': 'safety-audit',
  'eq-substation-yard-hardware': 'ht-lt-works',
};

const STAGE_TO_FORM_MAP: Record<string, FormId> = {
  'STAGE 01': 'site-visit',
  'STAGE 02': 'design-consultancy',
  'STAGE 03': 'ht-lt-works',
  'STAGE 04': 'maintenance-amc',
};

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
  const [formEmail, setFormEmail] = useState('');
  const [formCategory, setFormCategory] = useState('substation');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [formError, setFormError] = useState<string | null>(null);
  const [complianceCheck, setComplianceCheck] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [lastHomeInquiry, setLastHomeInquiry] = useState<EngineeringInquiry | null>(null);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const logoVideoRef = useRef<HTMLVideoElement | null>(null);
  const [logoAnimPhase, setLogoAnimPhase] = useState<'charging' | 'surge' | 'energized'>('energized');

  const handleImgFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = 'true';
      target.src = ASSETS.hero;
    }
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (!vid) return;
    const t = vid.currentTime;
    const dur = vid.duration || 8.0;
    if (t < 1.85 || t > dur - 0.35) {
      setLogoAnimPhase(prev => (prev !== 'charging' ? 'charging' : prev));
    } else if (t >= 1.85 && t < 2.45) {
      setLogoAnimPhase(prev => (prev !== 'surge' ? 'surge' : prev));
    } else {
      setLogoAnimPhase(prev => (prev !== 'energized' ? 'energized' : prev));
    }
  };

  const filteredProjects = projectFilter === 'all'
    ? PROJECTS.slice(0, 3)
    : PROJECTS.filter(p => p.category === projectFilter).slice(0, 3);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = formPhone.replace(/[\s\-()]/g, '');
    if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(cleanedPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g., +91 97434 61955).');
      return;
    }
    if (formEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      setFormError('Please enter a valid official email address.');
      return;
    }
    setFormError(null);
    const newInquiry: EngineeringInquiry = {
      id: `AES-HOM-${Math.floor(100000 + Math.random() * 900000)}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      category: formCategory,
      location: formLocation.trim(),
      loadDetails: formNotes.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      complianceConfirmed: complianceCheck,
      preferredChannel,
    };
    onSaveInquiry(newInquiry);
    setLastHomeInquiry(newInquiry);
    trackConversionEvent('quote_form_submit', `${formCategory} - ${formLocation || 'Bengaluru'}`, 'HomeScreen');
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
      desc: 'Deployment of transformers, heavy XLPE cabling, HT/LT switchgear panels, solar arrays, and dedicated earth pits adhering strictly to CPWD and CEA standards.',
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
          <picture>
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/assets/aistudio/Electrical_transmission_lines_hero_mobile_480.webp 480w, /assets/aistudio/Electrical_transmission_lines_hero_mobile.webp 768w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/assets/aistudio/Electrical_transmission_lines_hero.webp"
            />
            <img
              src="/assets/aistudio/Electrical_transmission_lines_hero.webp"
              alt="High-voltage electrical transmission lines across golden-hour hills"
              fetchPriority="high"
              decoding="async"
              width={1920}
              height={1080}
              className="w-full h-full object-cover object-center scale-[1.03] brightness-95 contrast-110 saturate-110"
            />
          </picture>
          {/* Directional Readability Gradient: Rich Navy on Left, Clearer Tower Showcase on Right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060f1e]/92 via-[#0B192C]/75 to-[#0B192C]/40" />
          {/* Top & Bottom Vignette for Seamless Section Framing */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060f1e]/65 via-transparent to-[#071120]/90" />
          {/* Golden-Hour Sunburst & High-Voltage Sky Glow */}
          <div className="absolute -top-24 left-1/4 w-[32rem] h-[32rem] bg-[#F59E0B]/15 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0284C7]/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl" />

          {/* Continuous Rolling Thunder-Cloud Illumination Overlays (Dimmed) */}
          <div
            className="absolute inset-0 mix-blend-screen animate-thunder-flash-1 opacity-45"
            style={{
              background:
                'radial-gradient(ellipse 68% 52% at 72% 16%, rgba(186, 230, 253, 0.18) 0%, rgba(56, 189, 248, 0.09) 45%, rgba(15, 23, 42, 0) 78%)'
            }}
          />
          <div
            className="absolute inset-0 mix-blend-screen animate-thunder-flash-2 opacity-45"
            style={{
              background:
                'radial-gradient(ellipse 64% 48% at 28% 14%, rgba(224, 242, 254, 0.16) 0%, rgba(59, 130, 246, 0.08) 46%, rgba(15, 23, 42, 0) 76%)'
            }}
          />

          {/* Continuous Procedural High-DPI Fractal Lightning, Anvil Crawlers & Sheet-Lightning Engine */}
          <RealisticLightningBackground />
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
          {/* Main Hero Split Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="font-display-xl tracking-tight font-extrabold drop-shadow-md bg-[linear-gradient(90deg,#EA580C_0%,#F97316_26%,#F59E0B_44%,#DC2626_64%,#2563EB_82%,#EA580C_100%)] bg-[length:200%_auto] animate-brand-shimmer bg-clip-text text-transparent [text-wrap:balance]">
                  Powering Karnataka with Reliable Electrical &amp; Solar Solutions
                </h1>
              </div>

              <p className="font-body-lg text-slate-200 max-w-2xl drop-shadow-sm [text-wrap:pretty]">
                Welcome to <strong className="text-white">Ananya Electrical Solutions</strong> — Government of Karnataka Licensed Super Grade Electrical Contractors headquartered in Sahakarnagar, Bengaluru. We deliver turnkey 11kV–110kV Substations, HT/LT power transformers and switchgear panels, BESCOM &amp; CEIG statutory approvals, industrial plant wiring, and high-efficiency rooftop solar installations across Karnataka.
              </p>

              {/* Primary Lead Conversion CTAs: Get a Quote, Call Now, WhatsApp */}
              <div className="flex flex-col gap-3 pt-2 max-w-2xl w-full min-w-0 min-h-[148px] sm:min-h-[152px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full min-w-0">
                  <button
                    onClick={() => {
                      const el = document.getElementById('consultation');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else onOpenConsultation();
                    }}
                    className="inline-flex items-center justify-center h-12 min-h-[48px] max-h-[48px] px-4 sm:px-3 lg:px-5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#2a1700] text-[13.5px] font-extrabold shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[19px] w-[19px] h-[19px] min-w-[19px] max-w-[19px] overflow-hidden mr-1.5 leading-none shrink-0 inline-flex items-center justify-center">request_quote</span>
                    <span>Get a Quote</span>
                  </button>
                  <a
                    href="tel:+919632025123"
                    onClick={() => trackConversionEvent('phone_click', '+91 9632025123', 'Hero Call Now CTA')}
                    className="inline-flex items-center justify-center h-12 min-h-[48px] max-h-[48px] px-3 sm:px-2 md:px-3 lg:px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[13px] sm:text-[12.5px] lg:text-[13.5px] font-bold shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[19px] w-[19px] h-[19px] min-w-[19px] max-w-[19px] overflow-hidden mr-1.5 leading-none shrink-0 inline-flex items-center justify-center">call</span>
                    <span className="truncate">Call: +91 9632025123</span>
                  </a>
                  <a
                    href={`https://wa.me/${BUSINESS_NAP.whatsappNumber}?text=Hello%20Ananya%20Electrical%20Solutions%2C%20I%20would%20like%20to%20enquire%20about%20electrical%20contracting%20or%20solar%20installation%20in%20Bengaluru.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackConversionEvent('whatsapp_click', BUSINESS_NAP.primaryPhone, 'Hero WhatsApp CTA')}
                    className="inline-flex items-center justify-center h-12 min-h-[48px] max-h-[48px] px-4 sm:px-3 lg:px-5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 text-[13.5px] font-extrabold shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[19px] w-[19px] h-[19px] min-w-[19px] max-w-[19px] overflow-hidden mr-1.5 leading-none shrink-0 inline-flex items-center justify-center">chat</span>
                    <span>WhatsApp Us</span>
                  </a>
                </div>

                {/* Interactive 3D Engineering Models & Services Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full min-w-0">
                  <button
                    onClick={() => onSelectTab('services')}
                    className="inline-flex items-center justify-center h-10 min-h-[40px] max-h-[40px] px-2.5 sm:px-3 rounded-lg bg-[#0f1f36]/90 hover:bg-[#1E293B] text-white text-[12px] font-bold transition-all cursor-pointer border border-white/20 backdrop-blur-md whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden mr-1.5 text-[#38bdf8] leading-none shrink-0 inline-flex items-center justify-center">precision_manufacturing</span>
                    <span>All 12 Services</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('residential-layout-3d')}
                    className="inline-flex items-center justify-center h-10 min-h-[40px] max-h-[40px] px-2.5 sm:px-3 rounded-lg bg-[#0f1f36]/90 hover:bg-[#1E293B] text-white text-[12px] font-semibold transition-all cursor-pointer border border-[#38bdf8]/35 backdrop-blur-md whitespace-nowrap overflow-hidden"
                    title="Residential Layout & Infrastructure"
                  >
                    <span className="material-symbols-outlined text-[15px] w-[15px] h-[15px] min-w-[15px] max-w-[15px] overflow-hidden mr-1.5 text-[#38bdf8] leading-none shrink-0 inline-flex items-center justify-center">map</span>
                    <span className="truncate">Residential Layout Infra</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('residential-3d')}
                    className="inline-flex items-center justify-center h-10 min-h-[40px] max-h-[40px] px-2.5 sm:px-3 rounded-lg bg-[#0f1f36]/90 hover:bg-[#1E293B] text-white text-[12px] font-semibold transition-all cursor-pointer border border-[#34d399]/35 backdrop-blur-md whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden mr-1.5 text-[#34d399] leading-none shrink-0 inline-flex items-center justify-center">home</span>
                    <span>Residential 2BHK</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('twin-3d')}
                    className="inline-flex items-center justify-center h-10 min-h-[40px] max-h-[40px] px-2.5 sm:px-3 rounded-lg bg-[#0f1f36]/90 hover:bg-[#1E293B] text-white text-[12px] font-semibold transition-all cursor-pointer border border-[#fde047]/35 backdrop-blur-md whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden mr-1.5 text-[#F59E0B] leading-none shrink-0 inline-flex items-center justify-center">electric_meter</span>
                    <span>33kV Substation</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('residential-solar-3d')}
                    className="inline-flex items-center justify-center h-10 min-h-[40px] max-h-[40px] px-2.5 sm:px-3 rounded-lg bg-[#0f1f36]/90 hover:bg-[#1E293B] text-white text-[12px] font-semibold transition-all cursor-pointer border border-amber-400/40 backdrop-blur-md whitespace-nowrap overflow-hidden"
                    title="Residential Solar Installation"
                  >
                    <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden mr-1.5 text-amber-400 leading-none shrink-0 inline-flex items-center justify-center">solar_power</span>
                    <span>Residential Solar EPC</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('smart-home-3d')}
                    className="inline-flex items-center justify-center h-10 min-h-[40px] max-h-[40px] px-2.5 sm:px-3 rounded-lg bg-[#0f1f36]/90 hover:bg-[#1E293B] text-white text-[12px] font-semibold transition-all cursor-pointer border border-teal-400/35 backdrop-blur-md whitespace-nowrap overflow-hidden"
                  >
                    <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden mr-1.5 text-teal-400 leading-none shrink-0 inline-flex items-center justify-center">smart_toy</span>
                    <span>Smart Home Automation</span>
                  </button>
                </div>
              </div>

              {/* Micro Spec Tags */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-slate-200 text-[12px] font-medium drop-shadow-sm min-h-[32px]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden text-[#38BDF8] leading-none shrink-0 inline-flex items-center justify-center">offline_bolt</span>
                  <span>11kV – 110kV Transmission</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden text-[#F59E0B] leading-none shrink-0 inline-flex items-center justify-center">solar_power</span>
                  <span>Net-Metered Solar EPC</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] w-[16px] h-[16px] min-w-[16px] max-w-[16px] overflow-hidden text-emerald-400 leading-none shrink-0 inline-flex items-center justify-center">gavel</span>
                  <span>KPTCL &amp; BESCOM Approved</span>
                </span>
              </div>
            </div>

            {/* Hero Visual Showcase: Video + Telemetry */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-start gap-5 lg:-mt-20 xl:-mt-24">
              <div className="w-full flex flex-col items-center lg:items-end justify-start -mt-6 lg:-mt-10 xl:-mt-12 lg:mr-[calc(min(0px,(80rem-100vw)/2)-3rem)] bg-transparent">
                <video
                  ref={logoVideoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onTimeUpdate={handleVideoTimeUpdate}
                  style={{ aspectRatio: '1.5 / 1.5' }}
                  className="w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[450px] xl:max-w-[480px] aspect-[1.5/1.5] object-cover object-center bg-transparent [clip-path:inset(0_0_31%_0)] brightness-90 drop-shadow-[0_0_14px_rgba(56,189,248,0.42)]"
                >
                  <source
                    src="/assets/aistudio/Animated_electrical_logo_reveal_mobile.webm"
                    type="video/webm"
                    media="(max-width: 768px)"
                  />
                  <source
                    src="/assets/aistudio/Animated_electrical_logo_reveal_transparent.webm"
                    type="video/webm"
                  />
                </video>
                {/* Custom Styled Brand Logo Lockup Synchronized with Video Reveal */}
                <div
                  className={`w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[450px] xl:max-w-[480px] flex flex-col items-center justify-center text-center -mt-24 sm:-mt-28 lg:-mt-30 xl:-mt-32 pb-2 select-none transition-all duration-500 ease-out ${
                    logoAnimPhase === 'charging'
                      ? 'opacity-0 translate-y-3 scale-90 blur-[5px]'
                      : 'opacity-100 translate-y-0 scale-100 blur-0'
                  }`}
                >
                  <span
                    className={`font-['Cinzel',serif] text-[30px] sm:text-[36px] lg:text-[40px] font-black uppercase leading-none bg-[linear-gradient(90deg,#FB923C_0%,#F97316_24%,#F59E0B_44%,#EF4444_64%,#38BDF8_82%,#F97316_100%)] bg-clip-text text-transparent transition-all duration-500 ${
                      logoAnimPhase === 'charging'
                        ? 'tracking-[0.34em] scale-95'
                        : logoAnimPhase === 'surge'
                        ? 'tracking-[0.22em] scale-[1.04] animate-brand-surge'
                        : 'tracking-[0.20em] scale-100 animate-brand-shimmer'
                    }`}
                  >
                    ANANYA
                  </span>
                  <div
                    className={`flex items-center justify-center gap-2 mt-1.5 w-full transition-all duration-500 ${
                      logoAnimPhase === 'energized'
                        ? 'opacity-100 translate-y-0 scale-100'
                        : logoAnimPhase === 'surge'
                        ? 'opacity-70 translate-y-1 scale-95'
                        : 'opacity-0 translate-y-2 scale-90'
                    }`}
                  >
                    <span
                      className={`h-[1.5px] bg-gradient-to-r from-transparent via-[#F97316] to-[#EF4444] rounded-full transition-all duration-500 ${
                        logoAnimPhase === 'energized' ? 'w-7 opacity-100' : 'w-1 opacity-0'
                      }`}
                    />
                    <span className="font-['Montserrat','Montserrat_Fallback',sans-serif] text-[11px] sm:text-[12.5px] lg:text-[13.5px] font-extrabold uppercase tracking-[0.28em] bg-[linear-gradient(90deg,#FDBA74_0%,#FB923C_34%,#F97316_56%,#F87171_78%,#38BDF8_100%)] bg-clip-text text-transparent animate-sub-pulse whitespace-nowrap">
                      ELECTRICAL SOLUTIONS
                    </span>
                    <span
                      className={`h-[1.5px] bg-gradient-to-l from-transparent via-[#F97316] to-[#38BDF8] rounded-full transition-all duration-500 ${
                        logoAnimPhase === 'energized' ? 'w-7 opacity-100' : 'w-1 opacity-0'
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-1.5 font-['Montserrat','Montserrat_Fallback',sans-serif] text-[10.5px] sm:text-[12px] lg:text-[13px] font-bold italic tracking-[0.16em] bg-[linear-gradient(90deg,#FB923C_0%,#F97316_24%,#F59E0B_44%,#EF4444_64%,#38BDF8_82%,#F97316_100%)] bg-clip-text text-transparent transition-all duration-500 ${
                      logoAnimPhase === 'charging'
                        ? 'opacity-0 translate-y-2 scale-90'
                        : logoAnimPhase === 'surge'
                        ? 'opacity-85 translate-y-0.5 scale-[1.03] animate-brand-surge'
                        : 'opacity-100 translate-y-0 scale-100 animate-brand-shimmer animate-sub-pulse'
                    }`}
                  >
                    &ldquo;Powering Brighter Tomorrow&rdquo;
                  </span>
                </div>
              </div>

              {/* Status Below Video Aligned Directly to Centre of Div 2 and 3 */}
              <div className="w-full flex items-center justify-center self-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-center px-4 py-1.5 rounded-full bg-[#0B192C]/85 backdrop-blur-md border border-white/15 shadow-lg mx-auto">
                  <span className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-white tracking-wider uppercase leading-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>BESCOM</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-white tracking-wider uppercase leading-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>HT/LT</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-white tracking-wider uppercase leading-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>SOLAR</span>
                  </span>
                </div>
              </div>

              {/* Verified Engineering Scope Cards */}
              <div className="grid grid-cols-2 gap-3 w-full items-stretch">
                <div className="p-4 rounded-xl bg-[#0B192C]/80 backdrop-blur-md text-white flex flex-col justify-between gap-1 border border-white/15 shadow-xl h-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">HT / EHT Grid Scope</span>
                    <span className="material-symbols-outlined text-[#38BDF8] text-[18px] leading-none shrink-0">domain</span>
                  </div>
                  <span className="font-stat-counter text-white text-[22px] sm:text-[26px]">11KV - 400KV</span>
                  <span className="text-[12px] text-slate-300">Substations, CEIG Liasioning</span>
                </div>
                <div className="p-4 rounded-xl bg-[#0B192C]/80 backdrop-blur-md text-white flex flex-col justify-between gap-1 border border-white/15 shadow-xl h-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">LT Panels &amp; Solar</span>
                    <span className="material-symbols-outlined text-[#F59E0B] text-[18px] leading-none shrink-0">wb_sunny</span>
                  </div>
                  <span className="font-stat-counter text-white text-[22px] sm:text-[26px]">230V-11KV</span>
                  <span className="text-[12px] text-slate-300">PCC/MCC Panels &amp; Solar EPC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges & Stat Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/15 items-stretch">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B192C]/75 backdrop-blur-md border border-white/15 shadow-lg h-full">
              <span className="material-symbols-outlined text-[#F59E0B] text-[28px] shrink-0 leading-none">verified_user</span>
              <div className="flex flex-col">
                <span className="text-[13px] sm:text-[13.5px] font-bold text-white leading-tight">
                  <span className="block">Gov Licensed Class I</span>
                  <span className="block">Electrical Contractors</span>
                </span>
                <span className="text-[12px] text-slate-300 mt-0.5">Govt. of Karnataka</span>
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

      {/* ================= CREDENTIALS SPOTLIGHT & TARGET CUSTOMER SEGMENTS ================= */}
      <section className="w-full bg-[#dce9ff] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-8">
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
                  Class 1 Electrical Contractor in Karnataka
                </h2>
                <p className="font-body-md text-[#44474c] max-w-3xl leading-relaxed">
                  <strong>Ananya Electrical Solutions</strong> is a Government Licensed Class 1 Electrical Contractor with over 5 years of specialized expertise dedicated to safety, statutory compliance, and customer satisfaction. Since 2020, <strong>Ananya Electrical Solutions</strong> has delivered Turnkey solutions, Design, Installation, Testing, and Commissioning of HT/LT electrical and solar power systems throughout Bengaluru and Karnataka.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
              <button
                onClick={() => onOpenConsultation('Class 1 Contract')}
                className="h-11 px-6 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[14px] font-semibold inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                Engage Class 1 Team
              </button>
              <span className="text-[12px] text-[#44474c] text-center font-medium">
                Class-1 PWD &amp; Electrical Inspectorate Compliant
              </span>
            </div>
          </div>

          {/* 5 Target Customer Segments We Serve */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[12px] uppercase font-bold tracking-wider text-[#006398]">
                  Who We Serve Across Bengaluru &amp; Karnataka
                </span>
                <h3 className="font-headline-sm text-[#0B192C] font-bold">
                  Tailored Electrical Contracting &amp; Solar EPC for Every Sector
                </h3>
              </div>
              <span className="text-[12.5px] text-[#44474c]">
                Click any customer segment to request a sector-specific estimate
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
              {[
                {
                  segment: 'Industrial & Manufacturing',
                  icon: 'factory',
                  scope: '11kV–110kV Substations, Power Transformers, RMU, VCB, Busducts, Panels, XLPE cabling & CEIG approvals.',
                  ctaTopic: 'Industrial Substation & Plant Electrification',
                },
                {
                  segment: 'Commercial & IT Parks',
                  icon: 'apartment',
                  scope: 'HT/LT Distribution Boards, DG Synchronization, APFC harmonic panels, UPS risers & BESCOM Load sanctions.',
                  ctaTopic: 'Commercial & IT Building Electrification',
                },
                {
                  segment: 'Residential & Townships',
                  icon: 'home_work',
                  scope: 'Design Co-ordination, Wiring, Aesthetic Integration, Co-Lights, Underground cabling & Smart Home Automation.',
                  ctaTopic: 'Residential & Township Layout Electrification',
                },
                {
                  segment: 'Institutional & Healthcare',
                  icon: 'local_hospital',
                  scope: 'Hospitals, Universities & Public Infrastructure requiring isolated earthing, Zero-Downtime & AMC.',
                  ctaTopic: 'Institutional & Hospital Electrical Works',
                },
                {
                  segment: 'Solar & Clean Energy',
                  icon: 'solar_power',
                  scope: 'Rooftop & Ground-Mounted solar PV plants, String/Central inverters, Bidirectional metering & KERC net-metering.',
                  ctaTopic: 'Turnkey Rooftop / Ground-Mount Solar EPC',
                },
              ].map((item) => (
                <div
                  key={item.segment}
                  onClick={() => onOpenConsultation(item.ctaTopic)}
                  className="bg-white rounded-xl p-4 border border-[#CBD5E1] hover:border-[#0284C7] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#e5eeff] text-[#006398] group-hover:bg-[#0284C7] group-hover:text-white transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#0B192C] group-hover:text-[#0284C7] transition-colors">
                      {item.segment}
                    </h4>
                    <p className="text-[12px] text-[#44474c] leading-relaxed">
                      {item.scope}
                    </p>
                  </div>
                  <span className="text-[11.5px] font-bold text-[#006398] flex items-center gap-1 pt-2 border-t border-[#E2E8F0]">
                    Get Sector Quote <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3D ENGINEERING MODELS SPOTLIGHT BANNER ================= */}
      <section className="w-full bg-[#071120] text-white py-14 lg:py-16 relative overflow-hidden border-y border-[#334155]/80">
        {/* Multi-Panel Electrical Services & Equipment Background Collage */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 w-full h-full opacity-45">
            <img loading="lazy" decoding="async"
              src={ASSETS.pillarHighVoltage}
              alt="33kV Electrical Substation & Power Transformer Equipment"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 brightness-95 contrast-110"
            />
            <img loading="lazy" decoding="async"
              src={ASSETS.project1}
              alt="HT/LT Switchgear Panels & Busbar Trunking Equipment"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 brightness-95 contrast-110 hidden md:block"
            />
            <img loading="lazy" decoding="async"
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
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
            <div className="flex-1 flex flex-col justify-between gap-4 lg:py-1">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white leading-snug max-w-3xl">
                Explore Our Interactive 3D Engineering Models: Residential Layout, 2BHK Interior, 33kV Substation, Rooftop Solar &amp; Smart Home Automation
              </h2>
              <p className="text-slate-200 text-sm sm:text-[15.5px] max-w-3xl leading-relaxed text-left sm:text-justify">
                Step into our real-time 3D engineering simulations built to visualize complete turnkey electrical execution before site mobilization. Inspect township road networks with 11kV DTRs and underground XLPE cable trenches, explore IS:732 compliant 2BHK concealed FRLS conduit routing and MCB/RCCB distribution boards, walk through a 33kV outdoor substation switchyard with a 1,250 kVA ONAN power transformer and VCB protection, analyze rooftop solar PV arrays with BESCOM bidirectional net-metering, or test automated smart home lighting, HVAC, curtain, and security scenes in real time.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 shrink-0 w-full sm:max-w-md lg:w-[340px]">
              <button
                onClick={() => onSelectTab('residential-layout-3d')}
                className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-[#2a1700] font-bold text-[13.5px] flex items-center justify-start gap-2.5 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02] cursor-pointer border border-[#fbbf24]/60"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">map</span>
                <span>Residential Layout &amp; Infrastructure</span>
              </button>
              <button
                onClick={() => onSelectTab('residential-3d')}
                className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#059669] hover:to-[#10b981] text-white font-bold text-[13.5px] flex items-center justify-start gap-2.5 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.02] cursor-pointer border border-[#34d399]/50"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">home</span>
                <span>Residential 2BHK Interior</span>
              </button>
              <button
                onClick={() => onSelectTab('twin-3d')}
                className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#006398] hover:from-[#006398] hover:to-[#0284C7] text-white font-bold text-[13.5px] flex items-center justify-start gap-2.5 shadow-lg shadow-cyan-500/25 transition-transform hover:scale-[1.02] cursor-pointer border border-[#38bdf8]/50"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">electric_meter</span>
                <span>33kV Substation</span>
              </button>
              <button
                onClick={() => onSelectTab('residential-solar-3d')}
                className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#ea580c] hover:to-[#f59e0b] text-white font-bold text-[13.5px] flex items-center justify-start gap-2.5 shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02] cursor-pointer border border-amber-300/50"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">solar_power</span>
                <span>Residential Solar Installation</span>
              </button>
              <button
                onClick={() => onSelectTab('smart-home-3d')}
                className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] hover:from-[#0f766e] hover:to-[#0d9488] text-white font-bold text-[13.5px] flex items-center justify-start gap-2.5 shadow-lg shadow-teal-500/25 transition-transform hover:scale-[1.02] cursor-pointer border border-[#2dd4bf]/50"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">smart_toy</span>
                <span>Smart Home Automation</span>
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
                tab: 'electrical' as NavigationTab,
                sectionId: undefined as string | undefined
              },
              {
                title: 'PCC / MCC & APFC Switchboards',
                spec: 'Form-4b ACB Panels & Busduct Trunking',
                image: ASSETS.project1,
                badge: 'Industrial Panels',
                tab: 'electrical' as NavigationTab,
                sectionId: undefined as string | undefined
              },
              {
                title: 'Concealed Conduits & MCB/RCCB DB',
                spec: 'FRLS Wiring, Smart Switches & Earth Pit',
                image: ASSETS.project3,
                badge: 'Residential Equipment',
                tab: 'home' as NavigationTab,
                sectionId: 'home-wiring'
              },
              {
                title: 'Township DTC & Feeder Pillars',
                spec: '11kV Pole-Mounted DTC & UG XLPE Cables',
                image: ASSETS.transmissionBg,
                badge: 'Layout Infrastructure',
                tab: 'home' as NavigationTab,
                sectionId: 'layout-electrification'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (item.sectionId) {
                    const targetEl =
                      document.getElementById(item.sectionId) ||
                      document.getElementById('electrical-services');
                    if (targetEl) {
                      targetEl.scrollIntoView({ behavior: 'smooth' });
                      return;
                    }
                  }
                  onSelectTab(item.tab);
                }}
                className="group relative rounded-xl overflow-hidden border border-slate-600/70 bg-[#0B192C]/80 backdrop-blur-md p-3 flex items-center gap-3.5 cursor-pointer hover:border-[#38bdf8] transition-all"
              >
                <img loading="lazy" decoding="async"
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
          <img loading="lazy" decoding="async"
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
              onClick={() => openAesEnquiryModal('ht-lt-works')}
              className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-[#E2E8F0] hover:border-[#0284C7]"
            >
              <div className="h-52 w-full overflow-hidden relative">
                <img loading="lazy" decoding="async"
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
                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
                  <span className="text-[11.5px] font-mono font-bold text-[#0284C7] bg-[#e5eeff] px-2 py-0.5 rounded">
                    HT/LT Works
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAesEnquiryModal('ht-lt-works');
                    }}
                    className="h-8 px-3 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Enquiry Form</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pillar 2: Clean Solar */}
            <div
              onClick={() => openAesEnquiryModal('solar-rooftop')}
              className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-[#E2E8F0] hover:border-[#F59E0B]"
            >
              <div className="h-52 w-full overflow-hidden relative">
                <img loading="lazy" decoding="async"
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
                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
                  <span className="text-[11.5px] font-mono font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Solar Rooftop
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAesEnquiryModal('solar-rooftop');
                    }}
                    className="h-8 px-3 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Enquiry Form</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pillar 3: Design, Testing & Commissioning */}
            <div
              onClick={() => openAesEnquiryModal('safety-audit')}
              className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-[#E2E8F0] hover:border-[#0284C7]"
            >
              <div className="h-52 w-full overflow-hidden relative">
                <img loading="lazy" decoding="async"
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
                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
                  <span className="text-[11.5px] font-mono font-bold text-[#006398] bg-[#e5eeff] px-2 py-0.5 rounded">
                    Safety Audit
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAesEnquiryModal('safety-audit');
                    }}
                    className="h-8 px-3 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Enquiry Form</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>
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
            <img loading="lazy" decoding="async"
              src={ASSETS.project1}
              alt="Industrial HT/LT switchboard room background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <img loading="lazy" decoding="async"
              src={ASSETS.pillarHighVoltage}
              alt="High voltage substation transformer yard background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center hidden md:block"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/94 via-[#eff4ff]/90 to-[#F8FAFC]/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
          <div className="text-center max-w-6xl mx-auto flex flex-col gap-3">
            <span className="text-[14px] uppercase tracking-wider text-[#006398] font-bold">
              Turnkey Capabilities &amp; Certified Hardware
            </span>
            <h2 className="font-headline-lg text-[#0B192C] font-bold">
              Comprehensive Electrical Services &amp; Equipment
            </h2>
            <p className="animate-services-paragraph">
              <span className="block lg:whitespace-nowrap">
                <span className="animate-sector-word" style={{ animationDelay: '0s' }}>
                  Serving Industrial corridors, IT Parks, Commercial High-rises, Roof Top &amp; Greenfield solar and Pharmaceutical plants
                </span>
              </span>
              <span className="block lg:whitespace-nowrap">
                <span className="animate-sector-word" style={{ animationDelay: '0.8s' }}>
                  across Karnataka with Class-1 turnkey electrical services and type-tested power equipment.
                </span>
              </span>
            </p>
          </div>

          {/* 9 Turnkey Engineering Services Grid with Equipment Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.slice(0, 9).map((service) => {
              const formId = SERVICE_TO_FORM_MAP[service.id] || 'industrial-commercial';
              return (
                <div
                  key={service.id}
                  onClick={() => openAesEnquiryModal(formId)}
                  className="rounded-xl bg-white/95 backdrop-blur-md shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5 border border-[#CBD5E1] hover:border-[#0284C7] cursor-pointer"
                >
                  {/* Visual Equipment Banner */}
                  <div className="relative h-32 w-full overflow-hidden bg-[#0B192C]">
                    <img loading="lazy" decoding="async"
                      src={service.image || ASSETS.pillarHighVoltage}
                      alt={service.title}
                      onError={handleImgFallback}
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
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                      <span className="text-[10px] font-mono font-bold text-[#0284C7] bg-[#e5eeff] px-1.5 py-0.5 rounded">
                        {formId === 'ht-lt-works' ? 'HT/LT Works' : formId === 'safety-audit' ? 'Safety Audit' : formId === 'design-consultancy' ? 'Design & SLD' : formId === 'maintenance-amc' ? 'AMC' : 'Industrial & Commercial'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAesEnquiryModal(formId);
                        }}
                        className="px-2.5 py-1 rounded-md bg-[#0284C7]/10 hover:bg-[#0284C7] text-[#0284C7] hover:text-white text-[12px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <span>Enquiry Form</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated Heavy Electrical Equipment & Hardware Supply Showcase */}
          <div className="rounded-3xl bg-[#0B192C] text-white p-8 lg:p-10 relative overflow-hidden border border-slate-700 shadow-xl">
            {/* Background Equipment Image Layer inside the Catalog Box */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <img loading="lazy" decoding="async"
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
                  onClick={() => openAesEnquiryModal('boq-quotation')}
                  className="shrink-0 h-11 px-5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors w-fit"
                >
                  <span>BOQ Quotation Form</span>
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {ELECTRICAL_EQUIPMENT.map((item) => {
                  const formId = EQUIPMENT_TO_FORM_MAP[item.id] || 'boq-quotation';
                  return (
                    <div
                      key={item.id}
                      onClick={() => openAesEnquiryModal(formId)}
                      className="rounded-xl bg-[#1E293B]/90 backdrop-blur-md border border-slate-700 hover:border-[#38bdf8] overflow-hidden flex flex-col justify-between group transition-all cursor-pointer"
                    >
                      <div className="relative h-28 w-full overflow-hidden">
                        <img loading="lazy" decoding="async"
                          src={item.image}
                          alt={item.name}
                          onError={handleImgFallback}
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
                        </div>

                        <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#F59E0B] font-semibold">
                            {formId === 'ht-lt-works' ? 'HT/LT' : formId === 'solar-rooftop' ? 'Solar Rooftop' : formId === 'safety-audit' ? 'Safety Audit' : 'Industrial & Commercial'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAesEnquiryModal(formId);
                            }}
                            className="px-2 py-0.5 rounded bg-[#0284C7]/20 hover:bg-[#0284C7] text-[11px] font-bold text-[#38bdf8] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Enquiry Form</span>
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <img loading="lazy" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Female electrical engineer wearing safety gear inspecting industrial distribution panel with a digital multimeter"
                  src={ASSETS.engineerPanelInspection}
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

              <div className="p-5 rounded-2xl bg-[#e5eeff] flex items-end justify-between gap-4 border border-[#CBD5E1]/60 shrink-0">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#44474c] uppercase font-bold tracking-wider leading-none">
                    Licensing Authority
                  </span>
                  <span className="font-headline-sm text-[17px] font-bold text-[#0B192C] leading-tight">
                    Electrical Inspectorate, Karnataka
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-[#FEF3C7] text-[#2a1700] text-[12px] font-bold tracking-wider uppercase shrink-0 self-end mb-0.5 leading-none inline-flex items-center justify-center">
                  Class 1
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
                  Founded in 2020, Ananya Electrical Solutions has swiftly become one of Karnataka&apos;s most trusted Class 1 electrical engineering partners. We bridge the critical gap between complex utility requirements and reliable industrial power systems.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="p-4 rounded-xl bg-[#f8f9ff] flex items-start gap-3.5 border border-[#E2E8F0] h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[22px] leading-none">workspace_premium</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-[15px] text-[#0B192C] font-bold leading-snug">
                      Class 1 Certified
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
            <img loading="lazy" decoding="async"
              src={ASSETS.pillarHighVoltage}
              alt="33kV substation switchyard background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105"
            />
            <img loading="lazy" decoding="async"
              src={ASSETS.project1}
              alt="HT/LT PCC and MCC switchgear panels background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 hidden md:block"
            />
            <img loading="lazy" decoding="async"
              src={ASSETS.project3}
              alt="Industrial heavy cable trays and XLPE feeders background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 hidden lg:block"
            />
            <img loading="lazy" decoding="async"
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
            {stages.map((stage, idx) => {
              const formId = STAGE_TO_FORM_MAP[stage.num] || 'site-visit';
              const formBadge =
                idx === 0
                  ? 'Site Visit'
                  : idx === 1
                  ? 'Design / SLD'
                  : idx === 2
                  ? 'HT/LT Works'
                  : 'AMC';
              return (
                <div
                  key={stage.num}
                  onClick={() => openAesEnquiryModal(formId)}
                  className={`rounded-xl bg-[#1E293B]/90 backdrop-blur-md text-white flex flex-col overflow-hidden relative border transition-all cursor-pointer group hover:border-[#38bdf8] ${
                    activeStage === idx
                      ? 'border-[#38bdf8] ring-2 ring-[#0284C7]/40 shadow-xl'
                      : 'border-slate-700/90'
                  }`}
                >
                  {/* Stage Equipment & Service Image Header */}
                  <div className="relative h-28 w-full overflow-hidden bg-[#0B192C]">
                    <img loading="lazy" decoding="async"
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

                  <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[15px] font-bold text-white group-hover:text-[#5bb8fe] transition-colors leading-snug">
                        {stage.title}
                      </h3>
                      <p className="text-[11.5px] text-slate-300 leading-snug line-clamp-2">
                        {stage.desc}
                      </p>

                      {/* Deliverables breakdown */}
                      <div className="pt-2 border-t border-slate-700/80">
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

                    <div className="pt-2.5 border-t border-slate-700/80 flex items-center justify-between mt-auto">
                      <span className="text-[10.5px] font-mono font-bold text-[#F59E0B]">
                        {formBadge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAesEnquiryModal(formId);
                        }}
                        className="px-2 py-0.5 rounded bg-[#0284C7]/20 hover:bg-[#0284C7] text-[#38bdf8] hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Enquiry Form</span>
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    <img loading="lazy" decoding="async"
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
                  <img loading="lazy" decoding="async"
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
              <img loading="lazy" decoding="async" src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
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
                  Class 1 Contractor • Bengaluru
                </div>
                <h2 className="font-headline-lg text-white font-bold">
                  Request an Electrical or Solar Quote in Bengaluru
                </h2>
                <p className="font-body-md text-slate-300 leading-relaxed">
                  Connect directly with our Class 1 electrical engineers at our Sahakarnagar headquarters. We handle BESCOM/KPTCL sanctions, CEIG approvals, HT/LT installations, and rooftop solar EPC across Karnataka.
                </p>
              </div>

              {/* Verified NAP Contact items */}
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-[#F59E0B]">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-400 uppercase">Primary Engineering Desk &amp; WhatsApp</span>
                    <a
                      href="tel:+919632025123"
                      onClick={() => trackConversionEvent('phone_click', '+91 9632025123', 'Home Consultation Card')}
                      className="font-headline-sm text-[19px] text-white font-bold hover:text-[#5bb8fe] transition-colors"
                    >
                      +91 9632025123
                    </a>
                    <a
                      href={`tel:${BUSINESS_NAP.secondaryPhoneTel}`}
                      onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.secondaryPhone, 'Home Consultation Card 24/7')}
                      className="text-[13px] text-slate-300 hover:text-[#5bb8fe] transition-colors mt-0.5"
                    >
                      24/7 Grid Emergency Hotline: {BUSINESS_NAP.secondaryPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-[#5bb8fe]">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-400 uppercase">Official Email</span>
                    <a
                      href={`mailto:${BUSINESS_NAP.email}`}
                      onClick={() => trackConversionEvent('email_click', BUSINESS_NAP.email, 'Home Consultation Card')}
                      className="text-[15px] text-white font-bold hover:text-[#5bb8fe] transition-colors break-all"
                    >
                      {BUSINESS_NAP.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-emerald-400">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-slate-400 uppercase">Registered Headquarters (Bengaluru)</span>
                    <span className="text-[13.5px] text-slate-200 leading-relaxed">
                      {BUSINESS_NAP.fullAddress}
                    </span>
                    <a
                      href={BUSINESS_NAP.googleMapsDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-[#38bdf8] font-semibold hover:underline mt-1"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1E293B] text-white flex items-center gap-3 border border-slate-700">
                <span className="material-symbols-outlined text-[#F59E0B] text-[24px]">verified</span>
                <span className="font-body-sm text-slate-300">
                  Government of Karnataka Licensed Class 1 PWD Electrical Contractor.
                </span>
              </div>
            </div>

            {/* Interactive Form Column */}
            <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-6" id="quote-form">
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline-sm text-[#0B192C] font-bold">
                    Request an Engineering Proposal &amp; Site Assessment
                  </h3>
                  <p className="font-body-sm text-[#44474c]">
                    Submit your facility parameters for a certified feasibility review and cost estimate within 4 business hours.
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
                      placeholder="+91 97434 61955"
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
                        <option value="statutory">CEIG / BESCOM / KPTCL Statutory Liaison</option>
                        <option value="amc">Industrial AMC &amp; Preventive Maintenance</option>
                      </optgroup>
                      <optgroup label="Solar Services">
                        <option value="solar-rooftop-ongrid">Roof Top On-Grid</option>
                        <option value="solar-hybrid">Hybrid</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="location">
                      Project Location in Bengaluru / Karnataka <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="h-11 px-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                      id="location"
                      placeholder="e.g. Sahakarnagar / Peenya / Whitefield / Mysuru"
                      required
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] text-[#0B192C] font-semibold" htmlFor="client-email">
                      Official Email (Optional)
                    </label>
                    <input
                      className="h-11 px-4 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B192C] font-body-md focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white"
                      id="client-email"
                      placeholder="projects@yourcompany.com"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] text-[#0B192C] font-semibold" id="channel-group-label">
                      Preferred Instant Response Channel
                    </span>
                    <div className="grid grid-cols-2 gap-2 h-11" role="radiogroup" aria-labelledby="channel-group-label">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={preferredChannel === 'whatsapp'}
                        aria-label="Preferred channel WhatsApp"
                        onClick={() => setPreferredChannel('whatsapp')}
                        className={`rounded border text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          preferredChannel === 'whatsapp'
                            ? 'bg-[#25D366]/15 border-[#25D366] text-[#0B192C]'
                            : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#44474c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#16a34a]">chat</span>
                        <span>WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={preferredChannel === 'email'}
                        aria-label="Preferred channel Email"
                        onClick={() => setPreferredChannel('email')}
                        className={`rounded border text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          preferredChannel === 'email'
                            ? 'bg-[#0284C7]/15 border-[#0284C7] text-[#0B192C]'
                            : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#44474c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#0284C7]">mail</span>
                        <span>Email</span>
                      </button>
                    </div>
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
                    I request technical compliance review according to Karnataka Electrical Inspectorate guidelines.
                  </label>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[13px] font-medium flex items-center gap-2" role="alert">
                    <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  className="h-12 w-full rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[14px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Submit Engineering Inquiry
                </button>

                {formSubmitted && lastHomeInquiry && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-body-sm flex flex-col gap-3 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <span>
                        <strong>Inquiry Logged ({lastHomeInquiry.id}):</strong> Our Class 1 engineering team will contact you within 4 business hours. Click below to immediately transmit your structured enquiry to our engineering desk:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <a
                        href={buildWhatsAppInquiryUrl(lastHomeInquiry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackConversionEvent('whatsapp_click', `Home Form WhatsApp ${lastHomeInquiry.id}`, 'HomeScreen')
                        }
                        className="h-10 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>Send on WhatsApp ({BUSINESS_NAP.primaryPhone})</span>
                      </a>
                      <a
                        href={buildMailtoInquiryUrl(lastHomeInquiry)}
                        onClick={() =>
                          trackConversionEvent('email_click', `Home Form Email ${lastHomeInquiry.id}`, 'HomeScreen')
                        }
                        className="h-10 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        <span>Send via Official Email</span>
                      </a>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LOCAL BENGALURU & KARNATAKA SERVICE AREAS + REGULATORY FOOTPRINT ================= */}
      <section className="w-full bg-white py-16 border-t border-[#E2E8F0]" id="service-areas">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#2a1700] shrink-0">
                <span className="material-symbols-outlined text-[28px] text-[#F59E0B]">shield</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-[#0B192C] font-bold">
                  Areas We Serve Across Bengaluru &amp; Karnataka
                </h2>
                <p className="font-body-sm text-[#44474c]">
                  Headquartered at 59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru 560092 • Serving all ESCOM jurisdictions
                </p>
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

          {/* Local Service Corridors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col gap-2">
              <h3 className="text-[15px] font-bold text-[#0B192C] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0284C7]">location_on</span>
                North &amp; Central Bengaluru (HQ Zone)
              </h3>
              <p className="text-[13px] text-[#44474c] leading-relaxed">
                Rapid electrical contracting, residential/commercial wiring, and BESCOM approvals across <strong>Sahakarnagar, Hebbal, Yelahanka, Jakkur, Kodigehalli, RT Nagar, Malleshwaram, Rajajinagar, and Devanahalli Aerospace Park</strong>.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col gap-2">
              <h3 className="text-[15px] font-bold text-[#0B192C] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0284C7]">factory</span>
                Bengaluru Industrial &amp; IT Corridors
              </h3>
              <p className="text-[13px] text-[#44474c] leading-relaxed">
                Turnkey 11kV/33kV/66kV substations, PCC/MCC panels, and rooftop solar EPC across <strong>Peenya Industrial Area, Yeshwanthpur, Whitefield, Mahadevapura, Electronic City, Bommasandra, Jigani, Hosakote, Dabaspet, and Bidadi</strong>.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col gap-2">
              <h3 className="text-[15px] font-bold text-[#0B192C] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0284C7]">map</span>
                Pan-Karnataka KIADB &amp; District Hubs
              </h3>
              <p className="text-[13px] text-[#44474c] leading-relaxed">
                Statewide Class 1 execution and CEIG liaison in <strong>Mysuru, Tumakuru (Vasanthanarasapura), Hubballi-Dharwad, Belagavi, Mangaluru, Udupi, Ballari, Shivamogga, Hassan, and Kalaburagi</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center items-stretch">
            <div className="p-5 rounded-xl bg-[#f8f9ff] border border-[#E2E8F0] flex flex-col justify-center gap-1">
              <span className="font-headline-md text-[#0B192C] font-bold">100%</span>
              <span className="font-body-sm text-[#44474c]">CEIG Statutory Pass Rate</span>
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
              <span className="font-body-sm text-[#44474c]">Certified Solar &amp; HV Hardware</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
