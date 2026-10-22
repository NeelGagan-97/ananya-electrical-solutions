import React from 'react';

interface ElectricalServicesSectionProps {
  onEnquire: (serviceName: string) => void;
}

interface ServiceCardData {
  id: string;
  title: string;
  categoryTag: string;
  badgeColor: string;
  description: string;
  features: string[];
  ctaLabel: string;
  serviceKey: string;
  iconName: string;
  accentColor: string;
  disclaimer?: string;
}

export const ElectricalServicesSection: React.FC<ElectricalServicesSectionProps> = ({ onEnquire }) => {
  const services: ServiceCardData[] = [
    {
      id: 'home-wiring',
      title: 'Home Wiring',
      categoryTag: 'Wiring & Safety',
      badgeColor: 'bg-[#e5eeff] text-[#006398] border-[#CBD5E1]',
      accentColor: '#0284C7',
      iconName: 'cable',
      description:
        'Safe, reliable, and efficient electrical wiring solutions for homes, apartments, renovations, and residential projects. We focus on proper wiring practices, organized installations, and dependable electrical connections.',
      features: [
        'New home wiring and rewiring',
        'Switchboard and socket installation',
        'Lighting and fan wiring',
        'Electrical circuit planning',
        'Wiring inspection and fault rectification'
      ],
      ctaLabel: 'Enquire About Home Wiring',
      serviceKey: 'Home Wiring'
    },
    {
      id: 'earthing-grounding',
      title: 'Earthing and Grounding',
      categoryTag: 'Safety & Protection',
      badgeColor: 'bg-[#FEF3C7] text-[#2a1700] border-[#FEF3C7]',
      accentColor: '#F59E0B',
      iconName: 'shield',
      description:
        'Reliable earthing and grounding solutions designed to improve electrical safety and help protect people and electrical equipment from electrical faults.',
      features: [
        'Residential earthing installation',
        'Earth pit installation and maintenance',
        'Earthing continuity checks',
        'Earth resistance testing',
        'Earthing system inspection and improvements'
      ],
      disclaimer: 'Actual work follows applicable electrical standards and local regulations.',
      ctaLabel: 'Enquire About Earthing',
      serviceKey: 'Earthing and Grounding'
    },
    {
      id: 'home-automation',
      title: 'Home Automation',
      categoryTag: 'Smart Living',
      badgeColor: 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]',
      accentColor: '#4f46e5',
      iconName: 'smart_toy',
      description:
        'Make everyday living more convenient with smart electrical controls for lighting, fans, and other compatible home devices.',
      features: [
        'Smart lighting control',
        'Smart switches and sockets',
        'Fan automation',
        'App-based control, where supported',
        'Voice-assistant integration, where compatible',
        'Smart home automation planning and installation'
      ],
      ctaLabel: 'Explore Home Automation',
      serviceKey: 'Home Automation'
    },
    {
      id: 'layout-electrification',
      title: 'New Layout Electrification',
      categoryTag: 'Turnkey Residential',
      badgeColor: 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]',
      accentColor: '#059669',
      iconName: 'apartment',
      description:
        'Complete electrical installation solutions for newly constructed homes, apartments, and residential layouts, from initial planning to final installation.',
      features: [
        'Electrical layout planning',
        'Wiring route and point planning',
        'Lighting and power point installation',
        'Distribution board installation',
        'Switches, sockets, and circuit installation',
        'Electrical testing and final inspection'
      ],
      ctaLabel: 'Enquire About New Layout Electrification',
      serviceKey: 'New Layout Electrification'
    }
  ];

  return (
    <section
      id="electrical-services"
      aria-labelledby="electrical-services-heading"
      className="w-full bg-white py-20 border-b border-[#E2E8F0] scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5eeff] text-[#006398] text-[12px] font-bold uppercase tracking-wider w-fit border border-[#CBD5E1]">
              <span className="material-symbols-outlined text-[16px] text-[#0284C7]">home</span>
              Residential &amp; Commercial Electrical Services
            </div>
            <h2
              id="electrical-services-heading"
              className="font-headline-lg text-[#0B192C] font-bold tracking-tight"
            >
              Our Electrical Services
            </h2>
            <p className="font-body-lg text-[#44474c] leading-relaxed">
              Reliable electrical solutions for your home, from safe wiring and proper earthing to smart home automation and complete new-layout electrification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-[#0B192C]">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              Certified Wiremen
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#0B192C]">
              <span className="material-symbols-outlined text-[#0284C7] text-[18px]">verified_user</span>
              IS Code Compliant
            </span>
          </div>
        </div>

        {/* 4 Responsive Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {services.map((service) => (
            <article
              key={service.id}
              className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
            >
              <div className="flex flex-col gap-4">
                {/* Visual Header / Icon Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${service.accentColor}15`, color: service.accentColor }}
                  >
                    <span className="material-symbols-outlined text-[28px]">{service.iconName}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${service.badgeColor}`}>
                    {service.categoryTag}
                  </span>
                </div>

                {/* Service Heading & Description */}
                <div>
                  <h3 className="font-headline-sm text-[#0B192C] font-bold tracking-tight group-hover:text-[#0284C7] transition-colors">
                    {service.title}
                  </h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed mt-2.5">
                    {service.description}
                  </p>
                </div>

                {/* Scope Highlights Checklist */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    Included Services:
                  </span>
                  <ul className="flex flex-col gap-1.5 text-[12px] text-[#44474c]">
                    {service.features.map((item, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5 text-[#0284C7]">
                          check_circle
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Optional Standards Note */}
                {service.disclaimer && (
                  <p className="text-[11px] text-slate-500 italic bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                    {service.disclaimer}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => onEnquire(service.serviceKey)}
                  className="w-full h-11 px-4 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow-md"
                >
                  <span>{service.ctaLabel}</span>
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Reassurance Banner */}
        <div className="rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#006398] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <span className="font-bold text-[#0B192C] block">Looking for a custom electrical solution?</span>
              <span className="text-[#44474c]">
                Our licensed supervisors provide on-site inspections and structured estimates for apartments, villas, and commercial properties.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEnquire('Home Electrical Consultation')}
            className="shrink-0 px-5 py-2.5 rounded-lg border border-[#0B192C] text-[#0B192C] hover:bg-[#0B192C] hover:text-white font-semibold text-[13px] transition-colors cursor-pointer"
          >
            Request Site Inspection
          </button>
        </div>
      </div>
    </section>
  );
};
