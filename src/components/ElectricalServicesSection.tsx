import React from 'react';
import { ASSETS } from '../data/constants';

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
  equipmentUsed: string[];
  ctaLabel: string;
  serviceKey: string;
  iconName: string;
  accentColor: string;
  image: string;
  disclaimer?: string;
}

export const ElectricalServicesSection: React.FC<ElectricalServicesSectionProps> = ({ onEnquire }) => {
  const services: ServiceCardData[] = [
    {
      id: 'home-wiring',
      title: 'Home Wiring & Rewiring',
      categoryTag: 'Wiring & Safety',
      badgeColor: 'bg-[#e5eeff] text-[#006398] border-[#CBD5E1]',
      accentColor: '#0284C7',
      iconName: 'cable',
      image: ASSETS.project3,
      description:
        'Safe, reliable, and efficient electrical wiring solutions for homes, apartments, renovations, and residential projects using FRLS/ZHFR copper conductors.',
      features: [
        'New home concealed conduit wiring & rewiring',
        'Modular switchboard and socket installation',
        'Three-phase load balancing & circuit planning',
        'Lighting, chandelier, and ceiling fan wiring',
        'Insulation megger inspection & fault rectification'
      ],
      equipmentUsed: ['FRLS Copper Wires', 'Modular MCB DBs', 'Heavy PVC Conduits'],
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
      image: ASSETS.aboutExecution,
      description:
        'Reliable chemical earthing and lightning grounding solutions engineered to protect people, sensitive appliances, and industrial machinery from earth faults.',
      features: [
        'Maintenance-free copper/GI chemical earth pits',
        'Substation & transformer double earthing grids',
        'Earthing strip continuity & grid integrity checks',
        'Digital earth resistance testing (< 1 Ohm target)',
        'Lightning arrester down-conductor termination'
      ],
      equipmentUsed: ['Copper Earth Electrodes', 'Bentonite/BFC Compound', 'Digital Earth Tester'],
      disclaimer: 'All earthing installations strictly conform to IS 3043 and CEA safety standards.',
      ctaLabel: 'Enquire About Earthing',
      serviceKey: 'Earthing and Grounding'
    },
    {
      id: 'home-automation',
      title: 'Smart Home & Building Automation',
      categoryTag: 'Smart Living',
      badgeColor: 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]',
      accentColor: '#4f46e5',
      iconName: 'smart_toy',
      image: ASSETS.pillarTesting,
      description:
        'Intelligent electrical control systems for residential villas, commercial offices, and apartments with scene dimming, occupancy sensors, and app telemetry.',
      features: [
        'DALI / KNX & wireless smart lighting control',
        'Touch glass panels, smart switches & sockets',
        'Automated HVAC, curtain & fan speed control',
        'Mobile app & voice-assistant integration',
        'Smart energy monitoring & automated scheduling'
      ],
      equipmentUsed: ['Smart Relay Modules', 'Touch Glass Switches', 'Motion & Lux Sensors'],
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
      image: ASSETS.transmissionBg,
      description:
        'Complete turnkey overhead and underground electrification for residential layouts, gated townships, and apartment complexes from 11kV tapping to feeder pillars.',
      features: [
        '11kV HT line extension & distribution transformers',
        'Underground armored XLPE cable trenching',
        'Outdoor LT Feeder Pillars & service kiosks',
        'LED smart street lighting poles & timer panels',
        'BESCOM / ESCOM layout sanction & energization'
      ],
      equipmentUsed: ['11kV/433V DTC', 'LT Feeder Pillars', 'HDPE Underground Ducts'],
      ctaLabel: 'Enquire About Layout Electrification',
      serviceKey: 'New Layout Electrification'
    },
    {
      id: 'lt-db-switchgear',
      title: 'LT Distribution Boards & Switchgear',
      categoryTag: 'Panels & Breakers',
      badgeColor: 'bg-[#e5eeff] text-[#006398] border-[#CBD5E1]',
      accentColor: '#0284C7',
      iconName: 'dns',
      image: ASSETS.project1,
      description:
        'Supply and installation of CPRI-tested Main LT Panels, TPN Distribution Boards, MCB/MCCB/ACB enclosures, and residual current protection devices.',
      features: [
        '7-Segment & TPN double-door MCB distribution boards',
        '30mA / 100mA RCCB & RCBO shock-protection breakers',
        'Type 1+2 Surge Protection Devices (SPD) for lightning',
        'Automatic changeover with current limiter (ACCL)',
        'Multi-function digital energy meters & CT chambers'
      ],
      equipmentUsed: ['ACB / MCCB / MCBs', '30mA RCCB / ELCB', 'Type-2 Surge Arresters'],
      ctaLabel: 'Enquire About Panels & DBs',
      serviceKey: 'LT Switchboards & Distribution Boards'
    },
    {
      id: 'dg-ups-power-backup',
      title: 'DG Sets, AMF Panels & UPS Systems',
      categoryTag: 'Backup Equipment',
      badgeColor: 'bg-[#FEF3C7] text-[#2a1700] border-[#FEF3C7]',
      accentColor: '#D97706',
      iconName: 'bolt',
      image: ASSETS.pillarHighVoltage,
      description:
        'Uninterrupted backup power engineering featuring CPCB-IV+ silent Diesel Generators, Auto Mains Failure (AMF) changeover panels, and online UPS banks.',
      features: [
        '25 kVA to 1500 kVA acoustic DG set installation',
        'PLC-based Auto Mains Failure (AMF) & DG sync panels',
        'Online Three-Phase Industrial UPS & tubular batteries',
        'Dedicated inverter wiring for residential & office backup',
        'CEIG statutory DG set safety inspection & approval'
      ],
      equipmentUsed: ['Acoustic DG Sets', 'Auto Changeover AMF', 'Online IGBT UPS'],
      ctaLabel: 'Enquire About Backup Power',
      serviceKey: 'DG Set & UPS Backup Systems'
    },
    {
      id: 'rooftop-solar-ev',
      title: 'Rooftop Solar & EV Charging Stations',
      categoryTag: 'Clean Energy Equipment',
      badgeColor: 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]',
      accentColor: '#10b981',
      iconName: 'ev_station',
      image: ASSETS.pillarSolar,
      description:
        'Future-ready residential and commercial rooftop solar PV plants integrated with AC Type-2 and DC Fast Electric Vehicle (EV) charging stations.',
      features: [
        '3 kWp to 500 kWp on-grid & hybrid rooftop solar plants',
        '7.4kW / 22kW AC Type-2 & 60kW DC Fast EV chargers',
        'Bidirectional net-metering kiosk & BESCOM sanction',
        'Dedicated EV load enhancement & RCCB safety pod',
        'RFID / OCPP smart billing & load management'
      ],
      equipmentUsed: ['Bifacial Solar Panels', 'Hybrid Grid Inverters', 'AC/DC EV Chargers'],
      ctaLabel: 'Enquire About Solar & EV',
      serviceKey: 'Rooftop Solar & EV Charging'
    },
    {
      id: 'industrial-cabling-lighting',
      title: 'Industrial Cable Trays & High-Bay LED',
      categoryTag: 'Plant Equipment',
      badgeColor: 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]',
      accentColor: '#006398',
      iconName: 'precision_manufacturing',
      image: ASSETS.project2,
      description:
        'Heavy-duty overhead cable tray fabrication, armored power cable laying, machine drop busbars, and industrial high-bay LED illumination networks.',
      features: [
        'Hot-dip galvanized ladder & perforated cable trays',
        'Armored Aluminum/Copper XLPE feeder cable laying',
        '150W–250W IP66 industrial high-bay & street LED fixtures',
        'Flameproof electrical fittings for hazardous zones',
        'LUX level illumination audit & harmonic check'
      ],
      equipmentUsed: ['HDG Cable Trays', 'Armored XLPE Cables', 'IP66 High-Bay LEDs'],
      ctaLabel: 'Enquire About Plant Cabling',
      serviceKey: 'Industrial Cabling & Lighting'
    }
  ];

  return (
    <section
      id="electrical-services"
      aria-labelledby="electrical-services-heading"
      className="relative w-full bg-[#0B192C] py-20 border-b border-[#CBD5E1] scroll-mt-24 overflow-hidden"
    >
      {/* Layered Background Images of Electrical Services & Equipment */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full h-full opacity-25">
          <img
            src={ASSETS.project3}
            alt="Industrial cable tray and electrical wiring background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <img
            src={ASSETS.project1}
            alt="Electrical switchgear and distribution panels background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center hidden lg:block"
          />
          <img
            src={ASSETS.pillarTesting}
            alt="Electrical engineering control room and relay testing background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center hidden lg:block"
          />
        </div>
        {/* High-contrast architectural gradient overlay so cards and typography pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9ff]/95 via-[#f1f5f9]/92 to-[#f8f9ff]/95"></div>
        {/* Subtle technical grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0284C7 1px, transparent 1px), linear-gradient(to bottom, #0284C7 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5eeff] text-[#006398] text-[12px] font-bold uppercase tracking-wider w-fit border border-[#CBD5E1] shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-[#0284C7]">electrical_services</span>
              Residential, Commercial &amp; Industrial Electrical Services &amp; Equipment
            </div>
            <h2
              id="electrical-services-heading"
              className="font-headline-lg text-[#0B192C] font-bold tracking-tight"
            >
              Our Electrical Services &amp; Equipment Solutions
            </h2>
            <p className="font-body-lg text-[#44474c] leading-relaxed">
              Complete electrical contracting and certified equipment installations—from safe home wiring, chemical earthing, and smart automation to LT switchboards, DG backup systems, EV chargers, and layout electrification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-600 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#CBD5E1] shadow-xs">
            <span className="flex items-center gap-1.5 font-semibold text-[#0B192C]">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              Certified Wiremen
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#0B192C]">
              <span className="material-symbols-outlined text-[#0284C7] text-[18px]">verified_user</span>
              IS / IEC Compliant Equipment
            </span>
          </div>
        </div>

        {/* 8 Responsive Service & Equipment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {services.map((service) => (
            <article
              key={service.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#CBD5E1] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 h-full"
            >
              {/* Equipment & Service Image Header */}
              <div className="relative h-40 w-full overflow-hidden bg-[#0B192C]">
                <img
                  src={service.image}
                  alt={service.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/85 via-[#0B192C]/25 to-transparent"></div>
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/95 shadow-md"
                    style={{ color: service.accentColor }}
                  >
                    <span className="material-symbols-outlined text-[20px] leading-none">{service.iconName}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border leading-none shadow-xs ${service.badgeColor}`}>
                    {service.categoryTag}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap gap-1">
                  {service.equipmentUsed.map((eq, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0B192C]/85 text-[#38bdf8] border border-sky-400/30 backdrop-blur-xs"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="flex flex-col flex-1 gap-3">
                  {/* Service Heading & Description */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-headline-sm text-[17px] text-[#0B192C] font-bold tracking-tight group-hover:text-[#0284C7] transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <p className="font-body-sm text-[#44474c] leading-relaxed text-[12.5px]">
                      {service.description}
                    </p>
                  </div>

                  {/* Scope Highlights Checklist */}
                  <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2 flex-1">
                    <span className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">
                      Included Scope &amp; Equipment:
                    </span>
                    <ul className="flex flex-col gap-1.5 text-[12px] text-[#44474c]">
                      {service.features.map((item, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5 text-[#0284C7] leading-none">
                            check_circle
                          </span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional Standards Note */}
                  {service.disclaimer && (
                    <p className="text-[11px] text-slate-500 italic bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0] mt-auto">
                      {service.disclaimer}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => onEnquire(service.serviceKey)}
                    className="w-full h-10 px-3 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[12.5px] font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow-md whitespace-nowrap"
                  >
                    <span>{service.ctaLabel}</span>
                    <span className="material-symbols-outlined text-[16px] leading-none transition-transform group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Reassurance Banner */}
        <div className="rounded-xl bg-white/95 backdrop-blur-md border border-[#CBD5E1] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#006398] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <span className="font-bold text-[#0B192C] block">Looking for custom electrical equipment supply or turnkey installation?</span>
              <span className="text-[#44474c]">
                Our licensed Super Grade supervisors provide on-site load inspections, equipment sizing, and structured estimates for residences, commercial complexes, and factories.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEnquire('Custom Electrical Equipment & Site Inspection')}
            className="shrink-0 px-5 py-2.5 rounded-lg bg-[#0B192C] text-white hover:bg-[#006398] font-semibold text-[13px] transition-colors cursor-pointer shadow-xs"
          >
            Request Site Inspection
          </button>
        </div>
      </div>
    </section>
  );
};

