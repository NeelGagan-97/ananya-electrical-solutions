import React from 'react';
import { NavigationTab } from '../types';
import { ASSETS } from '../data/constants';

interface FooterProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
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
              <img
                alt="Ananya Electrical Solutions Logo"
                className="h-8 w-auto object-contain"
                src={ASSETS.logo}
              />
              <span className="font-display text-[20px] text-[#0B192C] font-bold">
                Ananya Electrical Solutions
              </span>
            </div>
            <p className="text-[13px] text-[#44474c] max-w-sm leading-relaxed">
              Government of Karnataka Licensed Super Grade Electrical Contractors and Turnkey Clean Energy EPC Specialists. Delivering utility-scale substations, industrial power distribution networks, and high-yield commercial solar infrastructure with zero safety deviations.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-[#cce5ff] text-[#001d31] text-[12px] uppercase font-semibold">
                11kV / 33kV / 66kV / 110kV
              </span>
              <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[12px] uppercase font-semibold">
                Grade: Super Grade
              </span>
            </div>
          </div>

          {/* Engineering Services */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-[16px] text-[#0B192C] font-bold uppercase tracking-wider">
              Engineering Services
            </span>
            <ul className="flex flex-col gap-2 text-[13px] text-[#44474c]">
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('services')} className="text-left cursor-pointer hover:underline">
                  Substations &amp; Switching Stations
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('services')} className="text-left cursor-pointer hover:underline">
                  HT / LT Distribution Panels
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('solar-solutions')} className="text-left cursor-pointer hover:underline">
                  Solar Turnkey EPC Projects
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('electrical')} className="text-left cursor-pointer hover:underline">
                  Transmission Lines (11kV-110kV)
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('electrical')} className="text-left cursor-pointer hover:underline">
                  Industrial Cabling &amp; Commissioning
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-[16px] text-[#0B192C] font-bold uppercase tracking-wider">
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
                  Project Portfolio
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('services')} className="text-left cursor-pointer hover:underline">
                  Testing &amp; Pre-Commissioning
                </button>
              </li>
              <li className="hover:text-[#006398] transition-colors">
                <button onClick={() => handleTabClick('contact-us')} className="text-left cursor-pointer hover:underline">
                  Support &amp; Dispatch
                </button>
              </li>
            </ul>
          </div>

          {/* Operational HQ */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-[16px] text-[#0B192C] font-bold uppercase tracking-wider">
              Operational HQ
            </span>
            <div className="flex flex-col gap-3 text-[13px] text-[#44474c]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006398] shrink-0 mt-0.5">
                  location_on
                </span>
                <span>Corporate Office: Bengaluru &amp; Regional Industrial Corridors, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006398] shrink-0">
                  call
                </span>
                <a href="tel:+918660121438" className="hover:text-[#006398] transition-colors font-medium">
                  +91 8660121438 (24/7 Grid Support)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#006398] shrink-0">
                  verified_user
                </span>
                <span className="font-semibold text-[#0B192C]">ISO 9001 / OHSAS Compliant</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://wa.me/918660121438?text=Hello%20Ananya%20Electrical%20Solutions%2C%20I%20would%20like%20to%20consult%20regarding%20an%20electrical%2Fsolar%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#25D366] hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                  WhatsApp (+91 8660121438)
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="https://www.instagram.com/ananyaelectricalsolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#dc2743] hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-[#dc2743]"></span>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Compliance Notice */}
        <div className="pt-8 mt-4 bg-[#eff4ff] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#44474c]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#0B192C]">Statutory Compliance:</span>
            <span>Class: Super Grade Electrical Contractor (Karnataka Electrical Inspectorate)</span>
            <span className="text-[#CBD5E1] hidden md:inline">|</span>
            <span>Class-I PWD Registered</span>
          </div>
          <div className="text-right">
            © 2025 Ananya Electrical Solutions. All engineering rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
