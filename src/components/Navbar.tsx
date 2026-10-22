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

  const navLinks: { tab: NavigationTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'electrical', label: 'Electrical' },
    { tab: 'solar-solutions', label: 'Solar Solutions' },
    { tab: 'services', label: 'Services' },
    { tab: 'projects-gallery', label: 'Projects Gallery' },
    { tab: 'about-us', label: 'About Us' },
    { tab: 'contact-us', label: 'Contact Us' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
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
        {/* Brand Zone */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3.5 shrink-0 text-left cursor-pointer group"
        >
          <img
            alt="Ananya Electrical Solutions Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
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

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
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
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
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
