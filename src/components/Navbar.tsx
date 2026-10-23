import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ASSETS } from '../data/constants';

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

  const remainingNavLinks: { tab: NavigationTab; label: string }[] = [
    { tab: 'projects-gallery', label: 'Projects Gallery' },
    { tab: 'about-us', label: 'About Us' },
    { tab: 'contact-us', label: 'Contact Us' },
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
      <div className="w-full max-w-[1920px] h-20 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 xl:gap-4">
        {/* Brand Zone & Left Side Socials */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 shrink-0 text-left cursor-pointer group"
          >
            <img
              alt="Ananya Electrical Solutions Logo"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-md shrink-0 transition-transform group-hover:scale-105"
              src={ASSETS.logo}
            />
            <div className="flex flex-col justify-center">
              <span className="font-display text-[17px] sm:text-[18px] 2xl:text-[19px] text-[#0B192C] tracking-tight font-bold leading-tight">
                Ananya Electrical Solutions
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#2a1700] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold leading-none">
                  <span className="material-symbols-outlined text-[13px] text-[#F59E0B]">bolt</span>
                  Super Grade Licensed Contractor
                </span>
              </div>
            </div>
          </button>

          {/* Left Side Quick Connect: WhatsApp & Instagram */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-3 border-l border-[#CBD5E1] h-8">
            <a
              href="https://wa.me/918660121438?text=Hello%20Ananya%20Electrical%20Solutions%2C%20I%20would%20like%20to%20consult%20regarding%20an%20electrical%2Fsolar%20project."
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp (+91 8660121438)"
              className="w-8 h-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#25D366]/30 shrink-0"
            >
              <svg className="w-4 h-4 fill-current block" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ananya.electrical.solutions"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow on Instagram (@ananya.electrical.solutions)"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-[#dc2743] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#dc2743]/30 shrink-0"
            >
              <svg className="w-4 h-4 fill-current block" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1">
          {/* Home Button */}
          <button
            onClick={() => handleNavClick('home')}
            className={`h-9 px-2.5 2xl:px-3 text-[13px] 2xl:text-[13.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center leading-none ${
              currentTab === 'home'
                ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                : 'text-[#44474c] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
            }`}
          >
            Home
          </button>

          {/* 3D Model Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setModelDropdownOpen(true)}
            onMouseLeave={() => setModelDropdownOpen(false)}
          >
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className={`h-9 px-2.5 2xl:px-3 text-[13px] 2xl:text-[13.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1 leading-none ${
                currentTab === 'residential-layout-3d' || currentTab === 'residential-3d' || currentTab === 'twin-3d'
                  ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                  : 'text-[#0284c7] hover:bg-[#e0f2fe] font-bold'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#0284c7] leading-none shrink-0">3d_rotation</span>
              <span className="leading-none">3D Model</span>
              <span className="material-symbols-outlined text-[15px] text-[#0284c7] leading-none shrink-0 transition-transform duration-200">
                {modelDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {modelDropdownOpen && (
              <div className="absolute top-full left-0 w-88 bg-white rounded-xl shadow-xl border border-[#CBD5E1] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. Residential Layout & Infrastructure Twin */}
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
                      <span className="text-[13px] font-bold text-[#0B192C]">Residential Layout &amp; Infra Twin</span>
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

                {/* 2. Residential Interior 2BHK Twin */}
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
                      <span className="text-[13px] font-bold text-[#0B192C]">Residential 2BHK Interior Twin</span>
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

                {/* 3. 33kV Substation & Solar Yard */}
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
                      <span className="text-[13px] font-bold text-[#0B192C]">33kV Substation &amp; Solar Yard</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 text-[9px] font-mono font-bold">
                        33kV EPC
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Power transformers, VCB switchgear &amp; solar tracker
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
              className={`h-9 px-2.5 2xl:px-3 text-[13px] 2xl:text-[13.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1 leading-none ${
                currentTab === 'services' || currentTab === 'electrical' || currentTab === 'solar-solutions'
                  ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                  : 'text-[#44474c] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#0284c7] leading-none shrink-0">electrical_services</span>
              <span className="leading-none">Services</span>
              <span className="material-symbols-outlined text-[15px] text-[#0284c7] leading-none shrink-0 transition-transform duration-200">
                {servicesDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 w-88 bg-white rounded-xl shadow-xl border border-[#CBD5E1] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. Electrical Services */}
                <button
                  onClick={() => {
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
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 2. HT Substation EPC */}
                <button
                  onClick={() => {
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
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 3. Solar Solutions */}
                <button
                  onClick={() => {
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
                </button>

                <div className="my-1 border-t border-[#F1F5F9]" />

                {/* 4. Complete Services Portfolio & AMC */}
                <button
                  onClick={() => {
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
                </button>
              </div>
            )}
          </div>

          {/* Remaining Navigation Links */}
          {remainingNavLinks.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={`${item.tab}-${item.label}`}
                onClick={() => handleNavClick(item.tab)}
                className={`h-9 px-2.5 2xl:px-3 text-[13px] 2xl:text-[13.5px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer inline-flex items-center justify-center leading-none ${
                  isActive
                    ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-xs'
                    : 'text-[#44474c] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA & Direct Call & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <a
            href="tel:+918660121438"
            className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 text-[#0B192C] hover:text-[#0284C7] text-[12px] 2xl:text-[12.5px] font-bold uppercase tracking-wider transition-all group cursor-pointer shadow-xs leading-none shrink-0"
            title="Call 24/7 Grid Support"
          >
            <span className="material-symbols-outlined text-[15px] text-[#D97706] group-hover:scale-110 transition-transform leading-none shrink-0">phone_in_talk</span>
            <span className="leading-none whitespace-nowrap">24/7 Grid Support</span>
          </a>

          <button
            onClick={() => onOpenConsultation()}
            className="inline-flex items-center justify-center h-9 sm:h-10 px-3.5 sm:px-4 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold shadow-[0_4px_20px_-2px_rgba(11,25,44,0.12)] hover:shadow-[0_12px_28px_-4px_rgba(2,132,199,0.25)] transition-all cursor-pointer whitespace-nowrap leading-none shrink-0"
          >
            <span className="material-symbols-outlined text-[17px] mr-1.5 leading-none shrink-0">request_quote</span>
            <span className="hidden sm:inline leading-none">Get a Consultation / Quote</span>
            <span className="sm:hidden leading-none">Get Quote</span>
          </button>

          {/* Quick status / saved inquiries button */}
          <button
            onClick={() => handleNavClick('contact-us')}
            title={inquiryCount > 0 ? `${inquiryCount} active engineering inquiries` : "View Inquiries & Contact"}
            className="relative w-9 h-9 rounded-full bg-[#0B192C] text-white inline-flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#0284C7] transition-colors leading-none"
          >
            <span className="material-symbols-outlined text-[17px] leading-none shrink-0">person</span>
            {inquiryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] text-[#0B192C] rounded-full text-[10px] font-bold flex items-center justify-center">
                {inquiryCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#0B192C] hover:bg-[#e5eeff] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
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
                      <span>Residential Layout &amp; Infra Twin</span>
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
                      <span>Residential 2BHK Interior Twin</span>
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
                      <span>33kV Substation &amp; Solar Yard</span>
                    </div>
                    {currentTab === 'twin-3d' && (
                      <span className="material-symbols-outlined text-[16px] text-[#0284c7]">check</span>
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
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={`${item.tab}-${item.label}`}
                  onClick={() => handleNavClick(item.tab)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-[15px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#dce9ff] text-[#0B192C] font-bold'
                      : 'text-[#44474c] hover:bg-[#f8f9ff]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="material-symbols-outlined text-[16px] text-[#0284C7]">check</span>}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-3">
            <a
              href="tel:+918660121438"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-amber-50 border border-amber-200 text-[#0B192C] font-bold text-[13px] uppercase tracking-wider hover:bg-amber-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#D97706]">phone_in_talk</span>
              <span>24/7 Grid Support</span>
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
