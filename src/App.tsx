import { useState, useEffect } from 'react';
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

import { Substation3DScreen } from './screens/Substation3DScreen';
import { Residential3DScreen } from './screens/Residential3DScreen';
import { ResidentialLayoutScreen } from './screens/ResidentialLayoutScreen';

const STORAGE_KEY = 'aes_engineering_inquiries_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [modalServiceTopic, setModalServiceTopic] = useState<string>('');
  const [inquiries, setInquiries] = useState<EngineeringInquiry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Read URL hash on initial load & handle popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'home',
        'twin-3d',
        'residential-3d',
        'residential-layout-3d',
        'electrical',
        'solar-solutions',
        'services',
        'projects-gallery',
        'about-us',
        'contact-us'
      ];
      if (validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
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

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Fixed Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenConsultation={handleOpenConsultation}
        inquiryCount={inquiries.length}
      />

      {/* Floating Left Side Social Dock: WhatsApp & Instagram & Brand Video */}
      <LeftSideSocialDock />

      {/* Main Screen Content with pt-20 to clear fixed header */}
      <main className="flex-1 w-full pt-20">
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
      {currentTab !== 'twin-3d' && currentTab !== 'residential-3d' && <Footer onSelectTab={handleSelectTab} />}

      {/* Global Consultation / Proposal Modal */}
      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        initialService={modalServiceTopic}
        onSaveInquiry={handleSaveInquiry}
      />

      {/* Floating 24/7 Hotline Button for Emergency Mobile Dispatch */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2">
        <a
          href="tel:+918660121438"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B192C] text-white text-[13px] font-bold shadow-xl hover:bg-[#006398] transition-all hover:scale-105 border border-slate-700"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">phone_in_talk</span>
          <span>24/7 Grid Dispatch</span>
        </a>
      </div>
    </div>
  );
}
