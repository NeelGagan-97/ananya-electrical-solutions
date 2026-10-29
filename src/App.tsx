import { useState, useEffect } from 'react';
import { NavigationTab, EngineeringInquiry } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { LeftSideSocialDock } from './components/LeftSideSocialDock';
import { SeoAuditModal } from './components/SeoAuditModal';
import { HomeScreen } from './screens/HomeScreen';
import { ElectricalScreen } from './screens/ElectricalScreen';
import { SolarScreen } from './screens/SolarScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import { ProjectsGalleryScreen } from './screens/ProjectsGalleryScreen';
import { AboutScreen } from './screens/AboutScreen';
import { ContactScreen } from './screens/ContactScreen';

import { Substation3DScreen } from './screens/Substation3DScreen';
import { Residential3DScreen } from './screens/Residential3DScreen';
import { ResidentialLayoutScreen } from './screens/ResidentialLayoutScreen';
import { SmartHome3DScreen } from './screens/SmartHome3DScreen';
import {
  BUSINESS_NAP,
  SEO_ROUTE_CONFIG,
  PATH_TO_TAB,
  resolveTabFromUrl,
  updateUrlForTab,
  applyRouteSeo,
  trackConversionEvent,
} from './utils/seo';

const STORAGE_KEY = 'aes_engineering_inquiries_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => resolveTabFromUrl());
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [seoAuditModalOpen, setSeoAuditModalOpen] = useState(false);
  const [modalServiceTopic, setModalServiceTopic] = useState<string>('');
  const [inquiries, setInquiries] = useState<EngineeringInquiry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Synchronize clean path & hash navigation on popstate / hashchange
  useEffect(() => {
    const syncNavigationFromLocation = () => {
      const resolved = resolveTabFromUrl();
      setCurrentTab(resolved);
    };

    syncNavigationFromLocation();
    window.addEventListener('popstate', syncNavigationFromLocation);
    window.addEventListener('hashchange', syncNavigationFromLocation);
    return () => {
      window.removeEventListener('popstate', syncNavigationFromLocation);
      window.removeEventListener('hashchange', syncNavigationFromLocation);
    };
  }, []);

  // Apply dynamic per-route Title, Meta Description, Canonical URL, OpenGraph & BreadcrumbList JSON-LD
  useEffect(() => {
    applyRouteSeo(currentTab);
  }, [currentTab]);

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    updateUrlForTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConsultation = (serviceTopic?: string) => {
    setModalServiceTopic(serviceTopic || '');
    setConsultationModalOpen(true);
  };

  const handleSaveInquiry = (newInquiry: EngineeringInquiry) => {
    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to write to localStorage', e);
    }
  };

  const is3DWorkspace =
    currentTab === 'twin-3d' ||
    currentTab === 'residential-3d' ||
    currentTab === 'residential-layout-3d' ||
    currentTab === 'smart-home-3d';

  const currentSeoMeta = SEO_ROUTE_CONFIG[currentTab] || SEO_ROUTE_CONFIG.home;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Fixed Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenConsultation={handleOpenConsultation}
        inquiryCount={inquiries.length}
      />

      {/* Floating Left Side Social Dock: WhatsApp & Instagram */}
      <LeftSideSocialDock />

      {/* Main Screen Content with pt-20 to clear fixed header */}
      <main className="flex-1 w-full pt-20">
        {/* Semantic Breadcrumb Navigation Bar on Internal Non-3D Pages */}
        {currentTab !== 'home' && !is3DWorkspace && (
          <nav
            aria-label="Breadcrumb"
            className="w-full bg-[#071120] border-b border-slate-800 px-6 lg:px-12 py-2.5 text-[12px] text-slate-300"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <ol className="flex flex-wrap items-center gap-1.5">
                {currentSeoMeta.breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === currentSeoMeta.breadcrumbs.length - 1;
                  const targetTab = PATH_TO_TAB[crumb.path] || 'home';
                  return (
                    <li key={crumb.path} className="inline-flex items-center gap-1.5">
                      {idx > 0 && <span className="text-slate-500">/</span>}
                      {isLast ? (
                        <span className="text-[#38BDF8] font-semibold" aria-current="page">
                          {crumb.name}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectTab(targetTab)}
                          className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {crumb.name}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
              <div className="hidden md:flex items-center gap-3 text-[11.5px] text-slate-400">
                <span>Sahakarnagar HQ, Bengaluru 560092</span>
                <span>·</span>
                <a
                  href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                  onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Breadcrumb Bar')}
                  className="text-[#F59E0B] hover:underline font-semibold"
                >
                  {BUSINESS_NAP.primaryPhone}
                </a>
              </div>
            </div>
          </nav>
        )}

        {currentTab === 'home' && (
          <HomeScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
            onSaveInquiry={handleSaveInquiry}
          />
        )}

        {currentTab === 'twin-3d' && (
          <Substation3DScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
            onSwitchToResidential={() => handleSelectTab('residential-3d')}
          />
        )}

        {currentTab === 'residential-3d' && (
          <Residential3DScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
            onSwitchToSubstation={() => handleSelectTab('twin-3d')}
          />
        )}

        {currentTab === 'residential-layout-3d' && (
          <ResidentialLayoutScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
            onSwitchToInterior={() => handleSelectTab('residential-3d')}
            onSwitchToSubstation={() => handleSelectTab('twin-3d')}
          />
        )}

        {currentTab === 'smart-home-3d' && (
          <SmartHome3DScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
            onSaveInquiry={handleSaveInquiry}
          />
        )}

        {currentTab === 'electrical' && (
          <ElectricalScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentTab === 'solar-solutions' && (
          <SolarScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentTab === 'services' && (
          <ServicesScreen
            onSelectTab={handleSelectTab}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentTab === 'projects-gallery' && (
          <ProjectsGalleryScreen
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentTab === 'about-us' && (
          <AboutScreen
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {currentTab === 'contact-us' && (
          <ContactScreen
            inquiries={inquiries}
            onSaveInquiry={handleSaveInquiry}
          />
        )}
      </main>

      {/* Institutional Footer (omitted on full-bleed 3D Digital Twins) */}
      {currentTab !== 'twin-3d' && currentTab !== 'residential-3d' && currentTab !== 'smart-home-3d' && (
        <Footer
          onSelectTab={handleSelectTab}
          onOpenSeoAudit={() => setSeoAuditModalOpen(true)}
        />
      )}

      {/* Global Consultation / Proposal Modal */}
      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        initialService={modalServiceTopic}
        onSaveInquiry={handleSaveInquiry}
      />

      {/* Technical SEO, Keyword Map, GBP & Conversion Audit Modal */}
      <SeoAuditModal
        isOpen={seoAuditModalOpen}
        onClose={() => setSeoAuditModalOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* Floating Direct Call & 24/7 Dispatch Bar */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2">
        <a
          href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
          onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Floating Primary Call CTA')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B192C] text-white text-[13px] font-bold shadow-xl hover:bg-[#006398] transition-all hover:scale-105 border border-slate-700"
        >
          <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">call</span>
          <span>Call {BUSINESS_NAP.primaryPhone}</span>
        </a>
      </div>
    </div>
  );
}
