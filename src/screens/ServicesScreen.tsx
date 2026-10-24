import React, { useState } from 'react';
import { SERVICES } from '../data/constants';
import { ServiceItem } from '../types';
import {
  CategoryDynamicIcon,
  ServiceCardVisualHeader,
  CategoryColorConfig,
  ServiceCategoryKey
} from '../components/ServiceCategoryIcons';

import { NavigationTab } from '../types';

interface ServicesScreenProps {
  onOpenConsultation: (service?: string) => void;
  onSelectTab?: (tab: NavigationTab) => void;
}

interface CategoryMeta {
  id: ServiceCategoryKey;
  label: string;
  shortDesc: string;
  voltageScope: string;
}

export const ServicesScreen: React.FC<ServicesScreenProps> = ({ onOpenConsultation, onSelectTab }) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryKey>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const categories: CategoryMeta[] = [
    {
      id: 'all',
      label: 'All Engineering',
      shortDesc: 'Full turnkey portfolio',
      voltageScope: '11kV to 110kV'
    },
    {
      id: 'high-voltage',
      label: 'HV Substations & Transmission',
      shortDesc: 'Transformers & Switchyards',
      voltageScope: '11kV / 33kV / 110kV'
    },
    {
      id: 'solar',
      label: 'Turnkey Solar Clean Energy',
      shortDesc: 'C&I Rooftop & Ground Mount',
      voltageScope: 'LT to 33kV Net-Metered'
    },
    {
      id: 'automation',
      label: 'Automation, PCC & MCC',
      shortDesc: 'Switchboards & Busducts',
      voltageScope: '415V Three Phase'
    },
    {
      id: 'statutory',
      label: 'Statutory CEIG & Testing',
      shortDesc: 'Drawing Sanction & Megger',
      voltageScope: 'All Voltage Classes'
    },
    {
      id: 'maintenance',
      label: 'AMC & Energy Audits',
      shortDesc: '24/7 Breakdown & APFC',
      voltageScope: 'Facility-Wide Support'
    }
  ];

  const filteredServices = activeCategory === 'all'
    ? SERVICES
    : SERVICES.filter(s => s.category === activeCategory);

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-14 lg:py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0284C7]/20 text-[#5bb8fe] text-[12px] font-semibold w-fit border border-[#0284C7]/30 leading-none">
              <span className="material-symbols-outlined text-[16px] leading-none">build_circle</span>
              <span>Turnkey Engineering Capabilities</span>
            </div>
            <h1 className="font-display-xl text-white font-extrabold tracking-tight">
              Comprehensive Turnkey Engineering Services
            </h1>
            <p className="font-body-lg text-slate-300 max-w-2xl leading-relaxed">
              From initial Single Line Diagram (SLD) engineering and civil switchyard execution to pre-commissioning testing, CEIG safety clearances, and 24/7 preventative AMC.
            </p>
            {onSelectTab && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectTab('residential-layout-3d')}
                  className="h-10 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">map</span>
                  <span>3D Residential Layout Twin</span>
                </button>
                <button
                  onClick={() => onSelectTab('residential-3d')}
                  className="h-10 px-4 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">home</span>
                  <span>3D 2BHK Interior Twin</span>
                </button>
                <button
                  onClick={() => onSelectTab('twin-3d')}
                  className="h-10 px-4 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white border border-[#38bdf8]/50 text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#38bdf8] leading-none">3d_rotation</span>
                  <span>3D Industrial Substation Twin</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-[#1E293B]/90 border border-slate-700/80 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5bb8fe] font-bold">
                  Service Portfolio
                </span>
                <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold uppercase tracking-wider leading-none">
                  8 Turnkey Domains
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">HV Grid Scope</span>
                  <span className="text-[15px] font-bold text-white">11kV – 110kV</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">LT Switchgear</span>
                  <span className="text-[15px] font-bold text-white">Up to 6300A</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Approvals</span>
                  <span className="text-[15px] font-bold text-[#38bdf8]">CEIG &amp; ESCOM</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Dispatch SLA</span>
                  <span className="text-[15px] font-bold text-emerald-400">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Container */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-12">
        {/* Dynamic Category Showcase Deck */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold text-[#0284C7] tracking-wider">
                Domain Matrix
              </span>
              <h2 className="font-headline-sm text-[#0B192C] font-bold">
                Specialized Engineering Domains
              </h2>
            </div>
            <span className="hidden sm:inline text-[13px] text-[#44474c]">
              Select a domain to filter specialized capabilities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 items-stretch">
            {categories.filter(c => c.id !== 'all').map((cat) => {
              const isSelected = activeCategory === cat.id;
              const config = CategoryColorConfig[cat.id];
              const serviceCount = SERVICES.filter(s => s.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer group hover:-translate-y-0.5 h-full ${
                    isSelected
                      ? `bg-white ${config.border} ring-2 ring-[${config.accent}]/40 shadow-md`
                      : 'bg-white border-[#CBD5E1] hover:border-[#0284C7] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${config.bgLight} ${config.text} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm shrink-0`}>
                      <CategoryDynamicIcon category={cat.id} size={22} />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8FAFC] text-slate-500 border border-[#E2E8F0]">
                      {serviceCount} {serviceCount === 1 ? 'Service' : 'Services'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className={`font-bold text-[13px] leading-tight ${isSelected ? 'text-[#0B192C]' : 'text-slate-800'}`}>
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-[#44474c] line-clamp-1">
                      {cat.shortDesc}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#0284C7] font-semibold pt-2 border-t border-[#E2E8F0] mt-auto">
                    {cat.voltageScope}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills with Dynamic Icons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0]">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const config = CategoryColorConfig[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B192C] text-white shadow-sm ring-1 ring-[#0B192C]'
                    : 'bg-white text-[#44474c] border border-[#CBD5E1] hover:border-[#0284C7] hover:text-[#0B192C]'
                }`}
              >
                <CategoryDynamicIcon
                  category={cat.id}
                  size={16}
                  className={isSelected ? 'text-white' : config.text}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Results Status */}
        <div className="flex items-center justify-between text-[13px] text-[#44474c]">
          <span>
            Displaying <strong className="text-[#0B192C]">{filteredServices.length}</strong> services in{' '}
            <strong className="text-[#006398]">{categories.find(c => c.id === activeCategory)?.label}</strong>
          </span>
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[#0284C7] hover:underline font-semibold text-[12px] flex items-center gap-1 cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Services Cards with Dynamic Visual Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-[#CBD5E1] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Dynamic, High-Quality Technical Placeholder Visual Header */}
              <div className="p-3 pb-0">
                <ServiceCardVisualHeader
                  category={service.category as ServiceCategoryKey}
                  title={service.title}
                  badge={service.badge}
                  voltageClass={service.voltageClass}
                />
              </div>

              {/* Card Body */}
              <div className="p-6 pt-5 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="font-headline-sm text-[#0B192C] font-bold group-hover:text-[#0284C7] transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  <p className="font-body-sm text-[#44474c] leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Scope Deliverables:
                    </span>
                    <ul className="flex flex-col gap-1 text-[12px] text-[#44474c]">
                      {service.specs.slice(0, 3).map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[#0284C7] text-[15px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span className="line-clamp-1">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="text-[13px] text-slate-600 hover:text-[#0B192C] font-semibold underline underline-offset-4 cursor-pointer"
                  >
                    Technical Specs
                  </button>
                  <button
                    onClick={() => onOpenConsultation(service.title)}
                    className="px-4 py-2 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inquire</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scope Responsibility Matrix Table */}
        <div className="mt-8 bg-white rounded-2xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <span className="text-[12px] uppercase font-bold text-[#006398] tracking-wider">
              Single-Window Execution Model
            </span>
            <h3 className="font-headline-sm text-[#0B192C] font-bold">
              Turnkey Scope Division &amp; Statutory Responsibility
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8f9ff] text-[#0B192C] border-b border-[#CBD5E1]">
                <tr>
                  <th className="py-3 px-4 font-bold">Project Deliverable / Milestone</th>
                  <th className="py-3 px-4 font-bold">Ananya Electrical Scope</th>
                  <th className="py-3 px-4 font-bold">Client / Discom Involvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#44474c]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0B192C]">Single Line Diagram (SLD) &amp; CAD Design</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Full turnkey design &amp; engineering validation</td>
                  <td className="py-3 px-4 text-slate-500">Provide architectural layouts &amp; sanction letter</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0B192C]">CEIG Drawing Sanction &amp; Inspectorate Clearances</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Preparation, liaison, and final safety certificates</td>
                  <td className="py-3 px-4 text-slate-500">Signature on statutory government forms</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0B192C]">Equipment Procurement &amp; Transformer Supply</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Tier-1 OEM procurement with factory test reports (FAT)</td>
                  <td className="py-3 px-4 text-slate-500">Optional witness testing at OEM plant</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0B192C]">Switchyard Civil Foundation &amp; Structural Fabrication</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Plinth, fencing, gravel packing, and steel DP structure</td>
                  <td className="py-3 px-4 text-slate-500">Clear unencumbered site boundary</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0B192C]">Pre-Commissioning Hi-Pot &amp; Relay Calibration</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Complete primary/secondary injection &amp; certified logs</td>
                  <td className="py-3 px-4 text-slate-500">Facility safety coordinator presence</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#0B192C]">ESCOM Final Energization &amp; Meter Sealing</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">Coordination with Assistant Executive Engineer (AEE)</td>
                  <td className="py-3 px-4 text-slate-500">Official power on-switch handover</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1] flex flex-col">
            {/* Modal Visual Header with dynamic placeholder icon */}
            <div className="p-4 bg-[#0B192C]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#5bb8fe]">
                    <CategoryDynamicIcon category={selectedService.category as ServiceCategoryKey} size={18} />
                  </div>
                  <span className="text-[12px] font-mono text-[#F59E0B] uppercase font-bold tracking-wider">
                    {CategoryColorConfig[selectedService.category as ServiceCategoryKey]?.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <h3 className="font-headline-md text-white font-bold">{selectedService.title}</h3>
              {selectedService.voltageClass && (
                <span className="text-[12px] font-mono text-slate-300 block mt-1">
                  Voltage Rating: {selectedService.voltageClass}
                </span>
              )}
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-[14px] text-[#44474c] leading-relaxed">{selectedService.description}</p>
              
              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-col gap-2.5">
                <span className="text-[12px] uppercase font-bold text-[#0B192C] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0284C7]">verified</span>
                  Technical Scope &amp; Compliance Standards
                </span>
                <ul className="flex flex-col gap-2 text-[13px] text-[#44474c]">
                  {selectedService.specs.map((sp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 mt-0.5">check_circle</span>
                      <span>{sp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-[12px] text-slate-500 pt-2 border-t border-[#E2E8F0]">
                <span>Statutory Clearance: CEIG &amp; Karnataka Inspectorate</span>
                <span className="font-bold text-[#006398]">{selectedService.badge}</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-[13px] font-semibold text-[#44474c] hover:bg-[#F8FAFC]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const t = selectedService.title;
                    setSelectedService(null);
                    onOpenConsultation(t);
                  }}
                  className="px-5 py-2 rounded-lg bg-[#0B192C] text-white text-[13px] font-semibold hover:bg-[#006398] transition-colors"
                >
                  Inquire Engineering Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
