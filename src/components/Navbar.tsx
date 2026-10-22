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

  const navLinks: { tab: NavigationTab; label: string; sectionId?: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'home', label: 'Electrical Services', sectionId: 'electrical-services' },
    { tab: 'electrical', label: 'HT Substation' },
    { tab: 'solar-solutions', label: 'Solar Solutions' },
    { tab: 'services', label: 'Services' },
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
      <div
        style={{ width: '2000px', height: '80px' }}
        className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4"
      >
        {/* Brand Zone & Left Side Socials */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 shrink-0 text-left cursor-pointer group"
          >
            <img
              alt="Ananya Electrical Solutions Logo"
              style={{ aspectRatio: '0.8 / 0.8', objectFit: 'contain' }}
              className="h-11 w-auto object-contain rounded-md transition-transform group-hover:scale-105"
              src={ASSETS.logo}
            />
            <div className="flex flex-col">
              <span className="font-display text-[19px] sm:text-[20px] text-[#0B192C] tracking-tight font-bold leading-tight">
                Ananya Electrical Solutions
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] uppercase tracking-wider font-semibold">
                  <span className="material-symbols-outlined text-[13px] text-[#F59E0B]">bolt</span>
                  Super Grade Licensed Contractor
                </span>
              </div>
            </div>
          </button>

          {/* Left Side Quick Connect: WhatsApp & Instagram */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-3 border-l border-[#CBD5E1]">
            <a
              href="https://wa.me/918660121438?text=Hello%20Ananya%20Electrical%20Solutions%2C%20I%20would%20like%20to%20consult%20regarding%20an%20electrical%2Fsolar%20project."
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp (+91 8660121438)"
              className="w-8 h-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#25D366]/30"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ananya.electrical.solutions"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow on Instagram (@ananya.electrical.solutions)"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-[#dc2743] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#dc2743]/30"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = !item.sectionId && currentTab === item.tab;
            return (
              <button
                key={`${item.tab}-${item.label}`}
                onClick={() => handleNavClick(item.tab, item.sectionId)}
                className={`px-3 py-2 text-[14px] font-semibold transition-all rounded-lg whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#dce9ff] text-[#0b1c30] font-bold shadow-sm'
                    : 'text-[#44474c] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA & Direct Call & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex flex-col text-right pr-2">
            <span className="text-[12px] text-[#44474c] uppercase tracking-wider flex items-center justify-end gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-[#F59E0B]">phone_in_talk</span>
              24/7 Grid Support
            </span>
            <a
              href="tel:+918660121438"
              className="text-[14px] text-[#0B192C] font-bold hover:text-[#0284C7] transition-colors whitespace-nowrap"
            >
              +91 8660121438
            </a>
          </div>

          <button
            onClick={() => onOpenConsultation()}
            className="inline-flex items-center justify-center h-11 px-4 sm:px-5 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[14px] font-semibold shadow-[0_4px_20px_-2px_rgba(11,25,44,0.12)] hover:shadow-[0_12px_28px_-4px_rgba(2,132,199,0.25)] transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">request_quote</span>
            <span className="hidden sm:inline">Get a Consultation / Quote</span>
            <span className="sm:hidden">Get Quote</span>
          </button>

          {/* Quick status / saved inquiries button */}
          <button
            onClick={() => handleNavClick('contact-us')}
            title={inquiryCount > 0 ? `${inquiryCount} active engineering inquiries` : "View Inquiries & Contact"}
            className="relative w-9 h-9 rounded-full bg-[#000000] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#0284C7] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
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
            {navLinks.map((item) => {
              const isActive = !item.sectionId && currentTab === item.tab;
              return (
                <button
                  key={`${item.tab}-${item.label}`}
                  onClick={() => handleNavClick(item.tab, item.sectionId)}
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
            <div className="flex items-center justify-between px-2">
              <span className="text-[12px] text-[#44474c] uppercase tracking-wider font-semibold">24/7 Grid Dispatch</span>
              <a href="tel:+918660121438" className="text-[14px] text-[#0284C7] font-bold">
                +91 8660121438
              </a>
            </div>
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
