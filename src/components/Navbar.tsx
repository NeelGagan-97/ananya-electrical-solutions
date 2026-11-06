import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';
import { openAesEnquiryHub } from './forms';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (serviceOrTopic?: string) => void;
  inquiryCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenConsultation,
  inquiryCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [mobileModelOpen, setMobileModelOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const remainingNavLinks: {
    tab?: NavigationTab;
    label: string;
    icon: string;
    isEnquiryHub?: boolean;
  }[] = [
    { tab: 'projects-gallery', label: 'Projects Gallery', icon: 'photo_library' },
    { tab: 'about-us', label: 'About Us', icon: 'domain' },
    { tab: 'contact-us', label: 'Contact Us', icon: 'contact_support' },
    { label: 'Enquiry Forms', icon: 'format_list_bulleted', isEnquiryHub: true },
  ];

  const handleNavClick = (tab: NavigationTab, sectionId?: string) => {
    if (sectionId) {
      if (currentTab !== 'home') {
        onSelectTab('home');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setMobileMenuOpen(false);
      return;
    }
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FFFFFF]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-[#E2E8F0]">
      <div className="w-full h-20 px-2.5 sm:px-4 lg:px-5 xl:px-3 2xl:px-6 flex items-center justify-between gap-1.5 sm:gap-2 xl:gap-2 2xl:gap-4 max-w-[1920px] mx-auto min-w-0">
        {/* Brand Zone */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-left cursor-pointer group"
          >
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 2xl:h-11 2xl:w-11 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/assets/aistudio/logo_round_transparent.png"
                alt="Ananya Electrical Solutions Logo"
                className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                width={44}
                height={44}
                decoding="async"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-['Montserrat','Montserrat_Fallback',sans-serif] text-[16px] sm:text-[18px] 2xl:text-[20px] font-black [font-weight:900] uppercase tracking-[0.05em] bg-[linear-gradient(90deg,#EA580C_0%,#F97316_26%,#F59E0B_44%,#DC2626_64%,#2563EB_82%,#EA580C_100%)] bg-[length:200%_auto] animate-brand-shimmer bg-clip-text text-transparent leading-none">
                ANANYA
              </span>
              <span className="font-['Montserrat','Montserrat_Fallback',sans-serif] text-[9px] sm:text-[10px] 2xl:text-[11px] font-extrabold uppercase tracking-[0.16em] bg-[linear-gradient(90deg,#0284C7_0%,#38BDF8_26%,#F59E0B_46%,#EA580C_68%,#2563EB_84%,#0284C7_100%)] bg-[length:200%_auto] animate-brand-shimmer [animation-delay:0.35s] bg-clip-text text-transparent mt-0.5 leading-none whitespace-nowrap">
                ELECTRICAL SOLUTIONS
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center justify-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0">
          {/* 3D Model Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setModelDropdownOpen(true)}
            onMouseLeave={() => setModelDropdownOpen(false)}
          >
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className={`h-9 px-1.5 xl:px-2 2xl:px-2.5 text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1 leading-none ${
                currentTab === 'residential-layout-3d' ||
                currentTab === 'residential-3d' ||
                currentTab === 'twin-3d' ||
                currentTab === 'residential-solar-3d' ||
                currentTab === 'smart-home-3d'
                  ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                  : 'text-[#0284c7] hover:bg-[#e0f2fe] font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] 2xl:text-[15px] text-[#0284c7] leading-none shrink-0">3d_rotation</span>
              <span className="leading-none">3D Model</span>
              <span className="material-symbols-outlined text-[14px] 2xl:text-[15px] text-[#0284c7] leading-none shrink-0 transition-transform duration-200">
                {modelDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {modelDropdownOpen && (
              <div className="absolute top-full left-0 w-88 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto bg-white rounded-xl shadow-xl border border-[#CBD5E1] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. Residential Layout & Infrastructure */}
                <button
                  onClick={() => {
                    handleNavClick('residential-layout-3d');
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'residential-layout-3d' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 border border-sky-200">
                    <span className="material-symbols-outlined text-[18px]">map</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">Residential Layout &amp; Infrastructure</span>
                      <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 text-[9px] font-mono font-bold">
                        SITE CAD
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Site roads, plots, 11kV DTR, underground XLPE &amp; BOQ
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 2. Residential 2BHK Interior */}
                <button
                  onClick={() => {
                    handleNavClick('residential-3d');
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'residential-3d' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">Residential 2BHK Interior</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[9px] font-mono font-bold">
                        IS:732 CAD
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Concealed PVC wiring, DB with RCCB, switches &amp; fan
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 3. 33kV Substation */}
                <button
                  onClick={() => {
                    handleNavClick('twin-3d');
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'twin-3d' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-[#d97706] flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                    <span className="material-symbols-outlined text-[18px]">electric_meter</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">33kV Substation</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 text-[9px] font-mono font-bold">
                        33kV EPC
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      1,250 kVA Power Transformer, outdoor VCB &amp; CT/PT metering
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 4. Residential Solar Installation */}
                <button
                  onClick={() => {
                    handleNavClick('residential-solar-3d');
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'residential-solar-3d' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-yellow-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                    <span className="material-symbols-outlined text-[18px]">solar_power</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">Residential Solar Installation</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-mono font-bold">
                        NET-METER
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Rooftop PV modules, DCDB/ACDB, inverter &amp; BESCOM grid export
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 5. Smart Home Automation */}
                <button
                  onClick={() => {
                    handleNavClick('smart-home-3d');
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'smart-home-3d' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <svg
                      className="w-[18px] h-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 10.5L12 3l9 7.5" />
                      <path d="M5 9.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
                      <path d="M9.5 14.5a3.5 3.5 0 0 1 5 0" />
                      <path d="M11 16.5a1.5 1.5 0 0 1 2 0" />
                      <circle cx="12" cy="18" r="0.6" fill="currentColor" />
                    </svg>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">Smart Home Automation</span>
                      <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-700 text-[9px] font-mono font-bold">
                        SMART HOME
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      3D smart home visualization, automated lighting, smart switches, curtains, HVAC and integrated security systems.
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <button
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`h-9 px-1.5 xl:px-2 2xl:px-2.5 text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1 leading-none ${
                currentTab === 'services' || currentTab === 'electrical' || currentTab === 'solar-solutions'
                  ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                  : 'text-[#0284c7] hover:bg-[#e0f2fe] font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] 2xl:text-[15px] text-[#0284c7] leading-none shrink-0">electrical_services</span>
              <span className="leading-none">Services</span>
              <span className="material-symbols-outlined text-[14px] 2xl:text-[15px] text-[#0284c7] leading-none shrink-0 transition-transform duration-200">
                {servicesDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 w-88 bg-white rounded-xl shadow-xl border border-[#CBD5E1] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. Electrical Services */}
                <a
                  href="/#electrical-services"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick('home', 'electrical-services');
                    setServicesDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">Electrical Services</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 text-[9px] font-mono font-bold">
                        WIRING
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Residential, commercial &amp; industrial installations
                    </span>
                  </div>
                </a>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 2. HT Substation EPC */}
                <a
                  href="/ht-lt-electrical-works"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick('electrical');
                    setServicesDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'electrical' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 border border-sky-200">
                    <span className="material-symbols-outlined text-[18px]">transform</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">HT Substation &amp; Switchgear</span>
                      <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 text-[9px] font-mono font-bold">
                        11kV / 33kV
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Transformers, VCB panels &amp; CEIG approvals
                    </span>
                  </div>
                </a>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 3. Solar Solutions */}
                <a
                  href="/solar-power-solutions"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick('solar-solutions');
                    setServicesDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'solar-solutions' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 mt-0.5 border border-yellow-200">
                    <span className="material-symbols-outlined text-[18px]">solar_power</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">Solar Power Solutions</span>
                      <span className="px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-700 text-[9px] font-mono font-bold">
                        ON-GRID
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Rooftop solar, hybrid BESS &amp; net metering
                    </span>
                  </div>
                </a>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 4. Complete Services Portfolio & AMC */}
                <a
                  href="/services"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick('services');
                    setServicesDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-[#f0f9ff] transition-colors cursor-pointer ${
                    currentTab === 'services' ? 'bg-[#e0f2fe]' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <span className="material-symbols-outlined text-[18px]">home_repair_service</span>
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#0B192C]">All Engineering Services &amp; AMC</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[9px] font-mono font-bold">
                        TURNKEY
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Thermography testing, audits &amp; maintenance contracts
                    </span>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Remaining Navigation Links */}
          {remainingNavLinks.map((item) => {
            const isActive = Boolean(item.tab && currentTab === item.tab);
            return (
              <button
                key={`${item.tab || 'action'}-${item.label}`}
                onClick={() => {
                  if (item.isEnquiryHub) {
                    openAesEnquiryHub();
                  } else if (item.tab) {
                    handleNavClick(item.tab);
                  }
                }}
                className={`h-9 px-1.5 xl:px-2 2xl:px-2.5 text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1 leading-none ${
                  isActive
                    ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                    : 'text-[#0284c7] hover:bg-[#e0f2fe] font-bold'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] 2xl:text-[15px] text-[#0284c7] leading-none shrink-0">{item.icon}</span>
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA & Direct Call & Mobile Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
          <a
            href="tel:+919632025123"
            onClick={() => trackConversionEvent('phone_click', '+91 9632025123', 'Navbar Header Call')}
            className="hidden lg:inline-flex items-center gap-1 xl:gap-1.5 h-9 px-2 xl:px-2.5 rounded-lg bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 text-[#0B192C] hover:text-[#0284C7] text-[11px] xl:text-[11.5px] 2xl:text-[12px] font-bold tracking-wide transition-all group cursor-pointer shadow-xs leading-none shrink-0"
            title={`Call +91 9632025123 or 24/7 Hotline ${BUSINESS_NAP.secondaryPhone}`}
          >
            <span className="material-symbols-outlined text-[14px] xl:text-[15px] text-[#D97706] group-hover:scale-110 transition-transform leading-none shrink-0">phone_in_talk</span>
            <span className="leading-none whitespace-nowrap">+91 9632025123</span>
          </a>

          <button
            onClick={() => onOpenConsultation()}
            className="inline-flex items-center justify-center h-9 px-2 sm:px-2.5 xl:px-3 2xl:px-3.5 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-semibold shadow-[0_4px_20px_-2px_rgba(11,25,44,0.12)] hover:shadow-[0_12px_28px_-4px_rgba(2,132,199,0.25)] transition-all cursor-pointer whitespace-nowrap leading-none shrink-0"
          >
            <span className="material-symbols-outlined text-[14px] xl:text-[15px] mr-1 leading-none shrink-0">request_quote</span>
            <span className="hidden min-[1680px]:inline leading-none">Get a Consultation / Quote</span>
            <span className="hidden xl:inline min-[1680px]:hidden leading-none">Get Quote</span>
            <span className="hidden sm:inline xl:hidden leading-none">Get Quote</span>
            <span className="sm:hidden leading-none">Quote</span>
          </button>


          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#0B192C] hover:bg-[#e5eeff] transition-colors shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5 mb-4">
            {/* Home Link */}
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-[15px] font-semibold transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                  : 'text-[#44474c] hover:bg-[#f8f9ff]'
              }`}
            >
              <span>Home</span>
              {currentTab === 'home' && <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>}
            </button>

            {/* 3D Model Section */}
            <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-[#F8FAFC]">
              <button
                onClick={() => setMobileModelOpen(!mobileModelOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-[15px] font-bold text-[#0284c7] bg-[#f0f9ff] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                  <span>3D Model</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">
                  {mobileModelOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {mobileModelOpen && (
                <div className="flex flex-col bg-white divide-y divide-[#F1F5F9]">
                  <button
                    onClick={() => handleNavClick('residential-layout-3d')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'residential-layout-3d'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-sky-600">map</span>
                      <span>Residential Layout &amp; Infrastructure</span>
                    </div>
                    {currentTab === 'residential-layout-3d' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavClick('residential-3d')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'residential-3d'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">home</span>
                      <span>Residential 2BHK Interior</span>
                    </div>
                    {currentTab === 'residential-3d' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavClick('twin-3d')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'twin-3d'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#0284c7]">electric_meter</span>
                      <span>33kV Substation</span>
                    </div>
                    {currentTab === 'twin-3d' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavClick('residential-solar-3d')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'residential-solar-3d'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">solar_power</span>
                      <span>Residential Solar Installation</span>
                    </div>
                    {currentTab === 'residential-solar-3d' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavClick('smart-home-3d')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'smart-home-3d'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-teal-600 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 10.5L12 3l9 7.5" />
                        <path d="M5 9.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
                        <path d="M9.5 14.5a3.5 3.5 0 0 1 5 0" />
                        <circle cx="12" cy="17.5" r="0.8" fill="currentColor" />
                      </svg>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span>Smart Home Automation</span>
                          <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-700 text-[9px] font-mono font-bold">
                            SMART HOME
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748b] font-normal">
                          3D smart home visualization, automated lighting, smart switches, curtains, HVAC and integrated security systems.
                        </span>
                      </div>
                    </div>
                    {currentTab === 'smart-home-3d' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284c7] shrink-0">check</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Services Section */}
            <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-[#F8FAFC]">
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-[15px] font-bold text-[#0284c7] bg-[#f0f9ff] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">electrical_services</span>
                  <span>Services</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">
                  {mobileServicesOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {mobileServicesOpen && (
                <div className="flex flex-col bg-white divide-y divide-[#F1F5F9]">
                  <button
                    onClick={() => handleNavClick('home', 'electrical-services')}
                    className="px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer text-[#334155] hover:bg-[#f8f9ff]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">bolt</span>
                      <span>Electrical Services</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('electrical')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'electrical'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-sky-600">transform</span>
                      <span>HT Substation &amp; Switchgear</span>
                    </div>
                    {currentTab === 'electrical' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavClick('solar-solutions')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'solar-solutions'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-yellow-500">solar_power</span>
                      <span>Solar Power Solutions</span>
                    </div>
                    {currentTab === 'solar-solutions' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavClick('services')}
                    className={`px-5 py-2.5 text-left text-[14px] flex items-center justify-between cursor-pointer ${
                      currentTab === 'services'
                        ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">home_repair_service</span>
                      <span>All Engineering Services &amp; AMC</span>
                    </div>
                    {currentTab === 'services' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Remaining Nav Links */}
            {remainingNavLinks.map((item) => {
              const isActive = Boolean(item.tab && currentTab === item.tab);
              return (
                <button
                  key={`${item.tab || 'action'}-${item.label}`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.isEnquiryHub) {
                      openAesEnquiryHub();
                    } else if (item.tab) {
                      handleNavClick(item.tab);
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-[15px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                      : 'text-[#0284c7] hover:bg-[#e0f2fe]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#0284C7]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-3">
            <a
              href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
              onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Navbar Mobile Call')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-amber-50 border border-amber-200 text-[#0B192C] font-bold text-[13px] tracking-wide hover:bg-amber-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#D97706]">phone_in_talk</span>
              <span>Call {BUSINESS_NAP.primaryPhone}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full h-11 rounded-lg bg-[#0B192C] text-white text-[14px] font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">request_quote</span>
              Request Technical Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
