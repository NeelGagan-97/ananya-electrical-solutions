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
          <div className="lg:col-span-2 flex flex-col gap-4 items-start">
            <button
              onClick={() => handleTabClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-left cursor-pointer group w-fit focus:outline-none"
              title="Ananya Electrical Solutions - Home"
            >
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <picture>
                  <source
                    type="image/avif"
                    srcSet="/assets/aistudio/logo_round_transparent_96.avif 1x, /assets/aistudio/logo_round_transparent.avif 2x"
                  />
                  <source
                    type="image/webp"
                    srcSet="/assets/aistudio/logo_round_transparent_96.webp 1x, /assets/aistudio/logo_round_transparent.webp 2x"
                  />
                  <img
                    alt="Ananya Electrical Solutions Logo"
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                    src="/assets/aistudio/logo_round_transparent.webp"
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-['Montserrat'] text-[17px] sm:text-[19px] 2xl:text-[21px] font-black [font-weight:900] uppercase tracking-[0.06em] bg-[linear-gradient(90deg,#EA580C_0%,#F97316_26%,#F59E0B_44%,#DC2626_64%,#2563EB_82%,#EA580C_100%)] bg-[length:200%_auto] animate-brand-shimmer bg-clip-text text-transparent leading-none">
                  ANANYA
                </span>
                <span className="font-['Montserrat'] text-[9.5px] sm:text-[10.5px] 2xl:text-[11.5px] font-extrabold uppercase tracking-[0.18em] bg-[linear-gradient(90deg,#0284C7_0%,#38BDF8_26%,#F59E0B_46%,#EA580C_68%,#2563EB_84%,#0284C7_100%)] bg-[length:200%_auto] animate-brand-shimmer [animation-delay:0.35s] bg-clip-text text-transparent mt-1 leading-none whitespace-nowrap">
                  ELECTRICAL SOLUTIONS
                </span>
              </div>
            </button>

            <p className="text-[13px] text-[#44474c] max-w-sm leading-relaxed">
              Government of Karnataka Licensed Class 1 Electrical Contractors and Turnkey Solar EPC Specialists headquartered in Sahakarnagar, Bengaluru. Delivering 11kV–110kV substations, HT/LT panels, BESCOM &amp; CEIG approvals, and industrial/commercial wiring across Karnataka.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-[11.5px] font-semibold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]"></span>
                <span>11kV – 110kV HT/EHT</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-[11.5px] font-semibold text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                <span>Class-1 PWD</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[11.5px] font-semibold text-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>BESCOM &amp; CEIG Approved</span>
              </span>
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
                  Earthing Systems, Audits &amp; 24/7 AMC
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
                  Residential 2BHK Interior (3D)
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('residential-solar-3d')} className="text-left cursor-pointer hover:underline">
                  Residential Solar Installation (3D)
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('contact-us')} className="text-left cursor-pointer hover:underline">
                  Contact &amp; Quote Request
                </button>
              </li>
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

        {/* Bottom Bar with Compliance Notice & Copyright in 2 Lines */}
        <div className="mt-5 bg-[#eff4ff] rounded-lg p-4 sm:p-5 flex flex-col gap-2.5 text-[12.5px] text-[#44474c] border border-[#dbeafe]">
          {/* Line 1: Statutory Compliance Spans */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#0B192C]">Statutory Compliance:</span>
            <span>Class 1 Electrical Contractor (Karnataka Electrical Inspectorate)</span>
            <span className="text-[#94A3B8]" aria-hidden="true">·</span>
            <span>Class-1 PWD Registered</span>
          </div>

          {/* Line 2: Copyright Notice */}
          <div className="text-left text-[#555a64] text-[12px]">
            © {new Date().getFullYear()} Ananya Electrical Solutions, Bengaluru. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
