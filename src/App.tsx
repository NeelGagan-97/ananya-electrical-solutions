import React, { useState, useEffect, Suspense } from 'react';
import { NavigationTab, EngineeringInquiry } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { LeftSideSocialDock } from './components/LeftSideSocialDock';
import { HomeScreen } from './screens/HomeScreen';
import { ElectricalScreen } from './screens/ElectricalScreen';
import { SolarScreen } from './screens/SolarScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import { ProjectsGalleryScreen } from './screens/ProjectsGalleryScreen';
import { AboutScreen } from './screens/AboutScreen';
import { ContactScreen } from './screens/ContactScreen';
import {
  BUSINESS_NAP,
  SEO_ROUTE_CONFIG,
  PATH_TO_TAB,
  resolveTabFromUrl,
  updateUrlForTab,
  applyRouteSeo,
  trackConversionEvent,
} from './utils/seo';

// Code-split heavy Three.js 3D Digital Twins & SEO Audit Modal for fast initial page load
const Substation3DScreen = React.lazy(() =>
  import('./screens/Substation3DScreen').then((m) => ({ default: m.Substation3DScreen }))
);
const Residential3DScreen = React.lazy(() =>
  import('./screens/Residential3DScreen').then((m) => ({ default: m.Residential3DScreen }))
);
const ResidentialLayoutScreen = React.lazy(() =>
  import('./screens/ResidentialLayoutScreen').then((m) => ({ default: m.ResidentialLayoutScreen }))
);
const SmartHome3DScreen = React.lazy(() =>
  import('./screens/SmartHome3DScreen').then((m) => ({ default: m.SmartHome3DScreen }))
);
const SeoAuditModal = React.lazy(() =>
  import('./components/SeoAuditModal').then((m) => ({ default: m.SeoAuditModal }))
);

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

  const fallbackLoader = (
    <div className="min-h-[70vh] w-full bg-[#071120] text-white flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-10 h-10 rounded-full border-3 border-[#38BDF8] border-t-transparent animate-spin" />
      <span className="text-[13px] font-mono text-[#38BDF8] uppercase tracking-wider">
        Loading 3D Engineering Digital Twin...
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Accessible Skip-to-Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#F59E0B] focus:text-[#2a1700] focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

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
      <main id="main-content" className="flex-1 w-full pt-20">
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
          <Suspense fallback={fallbackLoader}>
            <Substation3DScreen
              onSelectTab={handleSelectTab}
              onOpenConsultation={handleOpenConsultation}
              onSwitchToResidential={() => handleSelectTab('residential-3d')}
            />
          </Suspense>
        )}

        {currentTab === 'residential-3d' && (
          <Suspense fallback={fallbackLoader}>
            <Residential3DScreen
              onSelectTab={handleSelectTab}
              onOpenConsultation={handleOpenConsultation}
              onSwitchToSubstation={() => handleSelectTab('twin-3d')}
            />
          </Suspense>
        )}

        {currentTab === 'residential-layout-3d' && (
          <Suspense fallback={fallbackLoader}>
            <ResidentialLayoutScreen
              onSelectTab={handleSelectTab}
              onOpenConsultation={handleOpenConsultation}
              onSwitchToInterior={() => handleSelectTab('residential-3d')}
              onSwitchToSubstation={() => handleSelectTab('twin-3d')}
            />
          </Suspense>
        )}

        {currentTab === 'smart-home-3d' && (
          <Suspense fallback={fallbackLoader}>
            <SmartHome3DScreen
              onSelectTab={handleSelectTab}
              onOpenConsultation={handleOpenConsultation}
              onSaveInquiry={handleSaveInquiry}
            />
          </Suspense>
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
      {seoAuditModalOpen && (
        <Suspense fallback={null}>
          <SeoAuditModal
            isOpen={seoAuditModalOpen}
            onClose={() => setSeoAuditModalOpen(false)}
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
          />
        </Suspense>
      )}

      {/* Floating Direct Call & 24/7 Dispatch Bar */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2">
        <a
          href="tel:+919632025123"
          onClick={() => trackConversionEvent('phone_click', '+91 9632025123', 'Floating Primary Call CTA')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B192C] text-white text-[13px] font-bold shadow-xl hover:bg-[#006398] transition-all hover:scale-105 border border-slate-700"
        >
          <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">call</span>
          <span>Call +91 9632025123</span>
        </a>
      </div>
    </div>
  );
}
