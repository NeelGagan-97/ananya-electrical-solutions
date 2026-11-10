import React, { useState } from 'react';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';

export const LeftSideSocialDock: React.FC = () => {
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);

  const phoneNumber = '919632025123';
  const displayPhone = '+91 9632025123';
  const instagramHandle = 'ananyaelectricalsolutions';
  const instagramUrl = 'https://www.instagram.com/ananyaelectricalsolutions';
  const emailAddress = BUSINESS_NAP.email;

  const quickMessages = [
    {
      label: 'Substation & HT Panel Quote',
      text: 'Hello Ananya Electrical Solutions, I would like to request an engineering proposal for an 11kV/33kV Substation in Bengaluru/Karnataka.',
    },
    {
      label: 'Solar Rooftop Feasibility',
      text: 'Hello Ananya Electrical Solutions, I want to request a rooftop solar EPC feasibility check and BESCOM net metering quote.',
    },
    {
      label: 'Commercial / Industrial Wiring',
      text: 'Hello Ananya Electrical Solutions, we need a quotation for industrial/commercial electrical installation and panel setup.',
    },
    {
      label: 'CEIG & BESCOM Sanctions',
      text: 'Hello Ananya Electrical Solutions, I need assistance with CEIG drawing sanction and BESCOM power approval.',
    },
  ];

  const getWhatsAppUrl = (customText?: string) => {
    const defaultText =
      'Hello Ananya Electrical Solutions, I would like to consult with a Super Grade electrical engineer regarding a project.';
    const textToSend = encodeURIComponent(customText || defaultText);
    return `https://wa.me/${phoneNumber}?text=${textToSend}`;
  };

  return (
    <aside
      aria-label="Quick Connect on WhatsApp, Instagram, and Gmail"
      className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 select-none"
    >
      {/* WhatsApp Button with Tooltip & Popover */}
      <div className="relative group">
        <button
          onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
          aria-label={`Connect on WhatsApp ${displayPhone}`}
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-white"
        >
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </button>

        {/* Desktop Hover Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none transition-all duration-200">
          <div className="bg-[#0B192C] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700 flex items-center gap-1.5">
            <span>WhatsApp: {displayPhone}</span>
          </div>
        </div>

        {/* WhatsApp Quick Menu Popover */}
        {showWhatsAppMenu && (
          <div className="absolute left-full ml-3 top-0 -translate-y-1/3 w-72 bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-200 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-[13px] text-[#0B192C] block">Direct WhatsApp Desk</span>
                  <span className="text-[11px] text-slate-500">{displayPhone}</span>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppMenu(false)}
                aria-label="Close WhatsApp Quick Menu"
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center text-[14px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Select an inquiry type:
              </span>
              {quickMessages.map((m, idx) => (
                <a
                  key={idx}
                  href={getWhatsAppUrl(m.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackConversionEvent('whatsapp_click', m.label, 'LeftSideSocialDock');
                    setShowWhatsAppMenu(false);
                  }}
                  className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#e5eeff] text-left text-[12px] text-[#0B192C] font-medium border border-[#E2E8F0] transition-colors flex items-center justify-between"
                >
                  <span>{m.label}</span>
                  <span className="text-[#0284C7] font-bold">→</span>
                </a>
              ))}
            </div>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackConversionEvent('whatsapp_click', 'General WhatsApp Inquiry', 'LeftSideSocialDock');
                setShowWhatsAppMenu(false);
              }}
              className="w-full py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>Chat on WhatsApp ({displayPhone})</span>
            </a>
          </div>
        )}
      </div>

      {/* Instagram Button with Tooltip */}
      <div className="relative group">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Ananya Electrical Solutions on Instagram"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-white"
        >
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>

        {/* Desktop Hover Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none transition-all duration-200">
          <div className="bg-[#0B192C] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700 flex items-center gap-1.5">
            <span>Instagram: @{instagramHandle}</span>
          </div>
        </div>
      </div>

      {/* Gmail Button with Tooltip */}
      <div className="relative group">
        <a
          href={`mailto:${emailAddress}?subject=${encodeURIComponent('Inquiry: Super Grade Electrical Services')}`}
          aria-label={`Send Email to ${emailAddress}`}
          onClick={() => {
            trackConversionEvent('email_click', 'Gmail Dock Click', 'LeftSideSocialDock');
          }}
          className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-white"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.5 6.5C1.5 5.39543 2.39543 4.5 3.5 4.5H5.5L12 9.5L18.5 4.5H20.5C21.6046 4.5 22.5 5.39543 22.5 6.5V7.5L12 15.5L1.5 7.5V6.5Z"
              fill="#EA4335"
            />
            <path
              d="M1.5 7.5V17.5C1.5 18.6046 2.39543 19.5 3.5 19.5H6V11L1.5 7.5Z"
              fill="#4285F4"
            />
            <path
              d="M22.5 7.5V17.5C22.5 18.6046 21.6046 19.5 20.5 19.5H18V11L22.5 7.5Z"
              fill="#34A853"
            />
            <path
              d="M6 19.5H18V11L12 15.5L6 11V19.5Z"
              fill="#FBBC04"
            />
          </svg>
        </a>

        {/* Desktop Hover Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center pointer-events-none transition-all duration-200">
          <div className="bg-[#0B192C] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700 flex items-center gap-1.5">
            <span>Gmail: {emailAddress}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
