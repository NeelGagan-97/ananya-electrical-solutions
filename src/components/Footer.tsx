import React from 'react';
import { NavigationTab } from '../types';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';

interface FooterProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSeoAudit?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenSeoAudit }) => {
  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#ffffff] shadow-[0_-1px_10px_rgba(0,0,0,0.03)] pt-16 pb-8 border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-[#0B192C] p-0.5 flex items-center justify-center overflow-hidden shadow-sm border border-[#38BDF8]/40 shrink-0">
                <img
                  alt="Ananya Electrical Solutions — Super Grade Electrical Contractor Bengaluru Logo"
                  className="h-full w-full object-cover object-top scale-125 translate-y-1 rounded-md"
                  src="/assets/aistudio/Screenshot_2026-10-24_213203_08863194.png"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-['Orbitron'] text-[18px] sm:text-[20px] font-black uppercase tracking-[0.14em] bg-gradient-to-r from-[#0284C7] via-[#0B192C] to-[#D97706] bg-clip-text text-transparent leading-none">
                  ANANYA
                </span>
                <span className="font-['Chakra_Petch'] text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#0284C7] mt-1 leading-none">
                  ELECTRICAL SOLUTIONS
                </span>
              </div>
            </div>
            <p className="text-[13px] text-[#44474c] max-w-sm leading-relaxed">
              Government of Karnataka Licensed Super Grade Electrical Contractors and Turnkey Solar EPC Specialists headquartered in Sahakarnagar, Bengaluru. Delivering 11kV–110kV substations, HT/LT panels, BESCOM &amp; CEIG approvals, and industrial/commercial wiring across Karnataka.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] text-[#001d31] font-semibold">
              <span>11kV / 33kV / 66kV / 110kV</span>
              <span aria-hidden="true">·</span>
              <span>Super Grade License</span>
              <span aria-hidden="true">·</span>
              <span>Class-1 PWD</span>
            </div>
          </div>

          {/* Engineering Services */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-[15px] text-[#0B192C] font-bold uppercase tracking-wider">
              Core Electrical Services
            </span>
            <ul className="flex flex-col gap-2 text-[13px] text-[#44474c]">
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('electrical')} className="text-left cursor-pointer hover:underline">
                  HT / LT Substations (11kV–110kV)
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('electrical')} className="text-left cursor-pointer hover:underline">
                  Transformers, PCC, MCC &amp; VCB Panels
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('services')} className="text-left cursor-pointer hover:underline">
                  BESCOM / KPTCL &amp; CEIG Approvals
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('services')} className="text-left cursor-pointer hover:underline">
                  Industrial, Commercial &amp; Home Wiring
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('services')} className="text-left cursor-pointer hover:underline">
                  Chemical Earthing, Audits &amp; 24/7 AMC
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('solar-solutions')} className="text-left cursor-pointer hover:underline">
                  Solar Rooftop EPC &amp; Net Metering
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-[15px] text-[#0B192C] font-bold uppercase tracking-wider">
              Quick Navigation
            </span>
            <ul className="flex flex-col gap-2 text-[13px] text-[#44474c]">
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('home')} className="text-left cursor-pointer hover:underline">
                  Home Overview
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('about-us')} className="text-left cursor-pointer hover:underline">
                  Licensing &amp; Credentials
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('projects-gallery')} className="text-left cursor-pointer hover:underline">
                  Executed Projects Portfolio
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('residential-3d')} className="text-left cursor-pointer hover:underline">
                  3D 2BHK Wiring &amp; Substation Twins
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('contact-us')} className="text-left cursor-pointer hover:underline">
                  Contact &amp; Quote Request
                </button>
              </li>
              {onOpenSeoAudit && (
                <li className="pt-1">
                  <button
                    onClick={onOpenSeoAudit}
                    className="text-left text-[12px] font-semibold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">travel_explore</span>
                    <span>SEO Audit &amp; Keyword Map</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Verified Sahakarnagar HQ & NAP */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col pl-6">
              <strong className="font-display text-[15px] text-[#0B192C] font-bold uppercase tracking-wider block leading-tight">
                Ananya Electrical Solutions
              </strong>
              <span className="font-display text-[12px] text-[#0284C7] font-bold uppercase tracking-wider mt-0.5">
                Registered Headquarters
              </span>
            </div>
            <address className="not-italic flex flex-col gap-2.5 text-[13px] text-[#44474c]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006398] shrink-0 mt-0.5">
                  location_on
                </span>
                <div>
                  <span>{BUSINESS_NAP.fullAddress}</span>
                  <a
                    href={BUSINESS_NAP.googleMapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[11.5px] text-[#0284C7] font-semibold hover:underline mt-0.5"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006398] shrink-0 mt-0.5">
                  call
                </span>
                <div className="flex flex-col">
                  <a
                    href="tel:+919632025123"
                    onClick={() => trackConversionEvent('phone_click', '+91 9632025123', 'Footer Primary Phone')}
                    className="hover:text-[#006398] transition-colors font-bold text-[#0B192C]"
                  >
                    +91 9632025123 (Primary / WhatsApp)
                  </a>
                  <a
                    href={`tel:${BUSINESS_NAP.secondaryPhoneTel}`}
                    onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.secondaryPhone, 'Footer 24/7 Hotline')}
                    className="hover:text-[#006398] transition-colors text-[12px] text-[#44474c]"
                  >
                    {BUSINESS_NAP.secondaryPhone} (24/7 Emergency Dispatch)
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006398] shrink-0">
                  mail
                </span>
                <a
                  href={`mailto:${BUSINESS_NAP.email}`}
                  onClick={() => trackConversionEvent('email_click', BUSINESS_NAP.email, 'Footer Email')}
                  className="hover:text-[#006398] transition-colors font-medium break-all"
                >
                  {BUSINESS_NAP.email}
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar with Compliance Notice & Sitemap Links */}
        <div className="pt-6 mt-4 bg-[#eff4ff] rounded-lg p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-[12.5px] text-[#44474c]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-[#0B192C]">Statutory Compliance:</span>
            <span>Super Grade Electrical Contractor (Karnataka Electrical Inspectorate)</span>
            <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
            <span>Class-1 PWD Registered</span>
            <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-[#0284C7] hover:underline font-medium">
              XML Sitemap
            </a>
            <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-[#0284C7] hover:underline font-medium">
              Robots.txt
            </a>
          </div>
          <div className="text-left lg:text-right">
            © {new Date().getFullYear()} Ananya Electrical Solutions, Bengaluru. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
