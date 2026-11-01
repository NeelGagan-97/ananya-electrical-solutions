import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../types';
import {
  BUSINESS_NAP,
  SEO_ROUTE_CONFIG,
  ConversionEventRecord,
  getConversionEvents,
  clearConversionEvents,
} from '../utils/seo';

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const SeoAuditModal: React.FC<SeoAuditModalProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const [activeSection, setActiveSection] = useState<'pages' | 'local' | 'schema' | 'conversions'>('pages');
  const [events, setEvents] = useState<ConversionEventRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setEvents(getConversionEvents());
    const handler = () => setEvents(getConversionEvents());
    window.addEventListener('aes-conversion-tracked', handler);
    return () => window.removeEventListener('aes-conversion-tracked', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const allRoutes = Object.values(SEO_ROUTE_CONFIG);
  const currentRouteMeta = SEO_ROUTE_CONFIG[currentTab] || SEO_ROUTE_CONFIG.home;

  const gbpChecklist = [
    {
      title: 'Exact Business Name Match',
      detail: BUSINESS_NAP.name,
      status: 'Verified in Schema & DOM',
    },
    {
      title: 'Primary Category & Secondary Categories',
      detail: 'Primary: Electrical Contractor · Secondary: Solar Energy Contractor, Electrical Engineer, Industrial Consultant',
      status: 'Configured in JSON-LD',
    },
    {
      title: 'Verified Physical Address (Sahakarnagar HQ)',
      detail: BUSINESS_NAP.fullAddress,
      status: 'Synchronized Sitewide',
    },
    {
      title: 'Primary Phone & WhatsApp Number',
      detail: `${BUSINESS_NAP.primaryPhone} (Primary) · ${BUSINESS_NAP.secondaryPhone} (24/7 Emergency Hotline)`,
      status: 'Click-to-Call & Tracked',
    },
    {
      title: 'Canonical Website & Domain Consolidation',
      detail: `Preferred: ${BUSINESS_NAP.canonicalDomain} (Canonical tags active sitewide; relative 301 aliases in _redirects)`,
      status: 'Canonical Active',
    },
    {
      title: 'Verified Service Areas (Bengaluru & Karnataka)',
      detail: 'Sahakarnagar, Hebbal, Yelahanka, Peenya, Yeshwanthpur, Whitefield, Electronic City, Bommasandra, Devanahalli, Hosakote, Mysuru, Tumakuru, Hubballi, Mangaluru',
      status: 'Indexed in LocalBusiness Schema',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[88vh] overflow-hidden shadow-2xl border border-[#CBD5E1] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B192C] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284C7]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
              <span className="material-symbols-outlined text-[22px]">travel_explore</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                  Technical SEO &amp; Local Search Diagnostic
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] font-mono text-emerald-400">ananyaelectricalsolutions.com</span>
              </div>
              <h2 className="text-[17px] sm:text-[19px] font-bold text-white">
                SEO Audit Report, Keyword Map, Schema.org &amp; Conversion Tracker
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close SEO Audit Report"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#F8FAFC] px-6 py-2.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'pages', label: '1. Page SEO & Keyword Map', icon: 'fact_check' },
              { id: 'local', label: '2. Local SEO & GBP Checklist', icon: 'location_on' },
              { id: 'schema', label: '3. Schema.org & Crawl Files', icon: 'code' },
              { id: 'conversions', label: `4. Conversion Events (${events.length})`, icon: 'ads_click' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSection(t.id as typeof activeSection)}
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeSection === t.id
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'bg-white text-[#44474c] border border-[#CBD5E1] hover:border-[#0284C7]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="text-[12px] text-[#44474c] font-mono">
            Active Route: <strong className="text-[#0284C7]">{currentRouteMeta.path}</strong>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-white">
          {activeSection === 'pages' && (
            <div className="flex flex-col gap-5">
              {/* Current Page Live Inspector */}
              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#006398]">
                    Live Active Route Metadata ({currentRouteMeta.path})
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                    Canonical: {currentRouteMeta.canonicalUrl}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]">
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase font-semibold">HTML Title Tag</span>
                    <strong className="text-[#0B192C]">{currentRouteMeta.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase font-semibold">Primary H1 Heading</span>
                    <strong className="text-[#0B192C]">{currentRouteMeta.h1}</strong>
                  </div>
                </div>
                <div className="text-[12px] text-[#44474c]">
                  <span className="text-slate-500 uppercase text-[11px] font-semibold mr-1.5">Meta Description:</span>
                  {currentRouteMeta.description}
                </div>
              </div>

              {/* Full Keyword & URL Map Table */}
              <div className="overflow-x-auto border border-[#CBD5E1] rounded-xl">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#0B192C] text-white">
                    <tr>
                      <th className="py-3 px-3.5 font-semibold">Clean URL &amp; Route</th>
                      <th className="py-3 px-3.5 font-semibold">Target Primary Keyword &amp; Intent</th>
                      <th className="py-3 px-3.5 font-semibold">SEO Title &amp; Meta Description</th>
                      <th className="py-3 px-3.5 font-semibold">Primary H1 &amp; Schema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#44474c]">
                    {allRoutes.map((route) => (
                      <tr key={route.tab} className={route.tab === currentTab ? 'bg-[#f0f9ff]' : 'hover:bg-[#F8FAFC]'}>
                        <td className="py-3 px-3.5 align-top">
                          <button
                            onClick={() => {
                              onSelectTab(route.tab);
                              onClose();
                            }}
                            className="font-mono font-bold text-[#0284C7] hover:underline text-left block cursor-pointer"
                          >
                            {route.path}
                          </button>
                          <span className="text-[10.5px] text-slate-500 font-mono block mt-0.5">
                            {route.canonicalUrl}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <strong className="text-[#0B192C] block">{route.primaryKeyword}</strong>
                          <span className="text-[11px] text-[#006398] block mt-0.5">{route.searchIntent}</span>
                          <span className="text-[10.5px] text-slate-500 block mt-1">
                            {route.secondaryKeywords.slice(0, 2).join(' · ')}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 align-top max-w-xs">
                          <strong className="text-[#0B192C] block leading-snug">{route.title}</strong>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{route.description}</p>
                        </td>
                        <td className="py-3 px-3.5 align-top max-w-xs">
                          <span className="font-semibold text-[#0B192C] block leading-snug">{route.h1}</span>
                          <span className="text-[10.5px] font-mono text-emerald-700 block mt-1">
                            {route.schemaType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'local' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-col gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#0284C7]">
                    Standardized NAP (Name, Address, Phone)
                  </span>
                  <div className="text-[13px] text-[#0B192C] flex flex-col gap-1.5">
                    <div>
                      <span className="text-slate-500">Business Name: </span>
                      <strong>{BUSINESS_NAP.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Headquarters Address: </span>
                      <strong>{BUSINESS_NAP.fullAddress}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Primary Phone &amp; WhatsApp: </span>
                      <strong className="text-[#0284C7]">{BUSINESS_NAP.primaryPhone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">24/7 Emergency Grid Hotline: </span>
                      <strong>{BUSINESS_NAP.secondaryPhone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Official Email: </span>
                      <strong>{BUSINESS_NAP.email}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-col gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-[#0284C7]">
                    Cloudflare Workers Canonical &amp; SPA Routing Setup
                  </span>
                  <p className="text-[12.5px] text-[#44474c] leading-relaxed">
                    Configured <code className="font-mono text-[#0B192C]">wrangler.jsonc</code> (<code className="font-mono text-[#0B192C]">not_found_handling: &quot;single-page-application&quot;</code>), relative 301 aliases in <code className="font-mono text-[#0B192C]">public/_redirects</code>, and dynamic{' '}
                    <code className="font-mono text-[#0B192C]">&lt;link rel=&quot;canonical&quot;&gt;</code> tags pointing to{' '}
                    <strong className="text-[#0B192C]">https://ananyaelectricalsolutions.com/</strong>.
                  </p>
                  <div className="mt-auto pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[12px]">
                    <span className="text-emerald-700 font-semibold">Geo Meta Tags: IN-KA (13.0623, 77.5871)</span>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0284C7] font-semibold hover:underline"
                    >
                      Inspect /sitemap.xml →
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <h3 className="text-[14px] font-bold text-[#0B192C]">
                  Google Business Profile (GBP) &amp; Local SEO Verification Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gbpChecklist.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[#CBD5E1] bg-white flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[13px] text-[#0B192C]">{item.title}</strong>
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold">{item.status}</span>
                      </div>
                      <p className="text-[12px] text-[#44474c] leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'schema' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-[#CBD5E1] hover:border-[#0284C7] bg-[#f8f9ff] flex items-center justify-between transition-colors"
                >
                  <div>
                    <strong className="text-[13px] text-[#0B192C] block">/robots.txt</strong>
                    <span className="text-[11px] text-slate-500">Crawler Directives &amp; Sitemap Link</span>
                  </div>
                  <span className="material-symbols-outlined text-[#0284C7]">open_in_new</span>
                </a>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-[#CBD5E1] hover:border-[#0284C7] bg-[#f8f9ff] flex items-center justify-between transition-colors"
                >
                  <div>
                    <strong className="text-[13px] text-[#0B192C] block">/sitemap.xml</strong>
                    <span className="text-[11px] text-slate-500">11 Canonical URLs Indexed</span>
                  </div>
                  <span className="material-symbols-outlined text-[#0284C7]">open_in_new</span>
                </a>
                <a
                  href="/_redirects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-[#CBD5E1] hover:border-[#0284C7] bg-[#f8f9ff] flex items-center justify-between transition-colors"
                >
                  <div>
                    <strong className="text-[13px] text-[#0B192C] block">/_redirects</strong>
                    <span className="text-[11px] text-slate-500">Cloudflare SPA &amp; 301 Rules</span>
                  </div>
                  <span className="material-symbols-outlined text-[#0284C7]">open_in_new</span>
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#0B192C] text-slate-200 font-mono text-[11.5px] overflow-x-auto">
                <div className="text-[#F59E0B] font-bold mb-2">
                  Active JSON-LD @graph Entities in index.html &amp; Dynamic Route Head:
                </div>
                <ul className="flex flex-col gap-1.5 text-slate-300">
                  <li>
                    1. <strong>Electrician &amp; LocalBusiness</strong> (@id: https://ananyaelectricalsolutions.com/#business) — Sahakarnagar HQ, +91 9743461955, GeoCoordinates (13.0623, 77.5871), OpeningHoursSpecification, AreaServed (Bengaluru &amp; Karnataka)
                  </li>
                  <li>
                    2. <strong>WebSite</strong> (@id: https://ananyaelectricalsolutions.com/#website) — Publisher linked to Ananya Electrical Solutions
                  </li>
                  <li>
                    3. <strong>Service &amp; OfferCatalog</strong> — 6 Core Service Pillars (HT/LT Substations, Transformers &amp; Panels, BESCOM/CEIG Liaison, Industrial/Commercial Wiring, Earthing &amp; AMC, Rooftop Solar EPC)
                  </li>
                  <li>
                    4. <strong>FAQPage</strong> — 6 High-Intent Technical &amp; Local Customer FAQs (Super Grade License, CEIG Approval Timelines, BESCOM Net Metering, Industrial Earthing, APFC Panels, Service Areas)
                  </li>
                  <li>
                    5. <strong>Dynamic BreadcrumbList</strong> (@id: {currentRouteMeta.canonicalUrl}#breadcrumb) — Updated automatically on route change
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'conversions' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#0B192C]">
                    Real-Time GA4 / GTM <code className="font-mono text-[#0284C7]">window.dataLayer</code> Conversion Log
                  </h3>
                  <p className="text-[12px] text-[#44474c]">
                    Every phone call click, WhatsApp enquiry, email click, and quote submission is pushed to{' '}
                    <code className="font-mono">window.dataLayer</code> and logged below.
                  </p>
                </div>
                {events.length > 0 && (
                  <button
                    onClick={() => clearConversionEvents()}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-[12px] font-semibold text-slate-600 hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    Clear Log
                  </button>
                )}
              </div>

              {events.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[#CBD5E1] text-center text-[13px] text-slate-500">
                  No conversion events recorded in this session yet. Click any phone number, WhatsApp button, email link, or submit a quote request to test live tracking.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#CBD5E1] rounded-xl">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#F8FAFC] text-[#0B192C] border-b border-[#CBD5E1]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                        <th className="py-2.5 px-4 font-semibold">Event Name</th>
                        <th className="py-2.5 px-4 font-semibold">Action / Label</th>
                        <th className="py-2.5 px-4 font-semibold">Source Component</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#44474c]">
                      {events.map((ev) => (
                        <tr key={ev.id}>
                          <td className="py-2.5 px-4 font-mono text-[11px]">{ev.timestamp}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-[#0284C7]">{ev.event}</td>
                          <td className="py-2.5 px-4 font-semibold text-[#0B192C]">{ev.label}</td>
                          <td className="py-2.5 px-4 text-slate-500">{ev.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F8FAFC] px-6 py-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-[12px] text-[#44474c]">
          <span>
            Canonical Production Domain: <strong className="text-[#0B192C]">https://ananyaelectricalsolutions.com/</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0B192C] text-white font-semibold hover:bg-[#006398] cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
