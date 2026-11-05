import { ServiceItem, ProjectItem, ElectricalEquipmentItem } from '../types';

export const ASSETS = {
  logo: '/assets/aistudio/logo_ananya_opt.webp',
  logoEmblem: '/assets/aistudio/Screenshot_2026-10-24_213203_08863194.png',
  transmissionBg: '/assets/aistudio/Electrical_transmission_lines_hero.webp',
  residentialWiring2Bhk: '/assets/aistudio/residential_2bhk_opt.webp',
  residentialInterior: '/assets/aistudio/residential_interior_opt.webp',
  residentialIsometric: '/assets/aistudio/residential_isometric_opt.webp',
  cadTwinPreview: '/assets/aistudio/cad_twin_preview_opt.webp',
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4VC5wbdLF6oMvZEPulwpBgA-Yp8jDBjo4lRm43CiNcy4wAz8f49u_BG5pLMeD9avm2zSVziMc6kRESJ5-iXfd7FzgEhjkczKHssp33WQCga79GEkgPHAlH7BtsTkhPVHCT-JUkrcDtghkNrsl7yBt6UoIEof2UlnBAXLlBuVtDmKN7vKPlbmmThg0jGV_YOLssfE-FQMWMjMjXBQ30hrcKwLrvLwg6e7W_yb9iNa5jOYN4k0uTDi2JQ',
  pillarHighVoltage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmD_0-a9fxQ-SiQoGtr6UyJQGCE0tjhkx2bzY4RN2BqNF5FUMOfYVNmgFKhkVZspM9a2dYsv-rr-y0d6z0AUaaMWQdLw-3Bh35Rz-Mt7IrXIbseRSfSRGJmiy9a1qvZD3QE1aFnSoT0ii8wCS4Z_xMDJlusRXtvTLXK4UGrcJwsbR5hpmwYYR0aRKoQwYrwX7MI4-ckkpcVNS8al9MMU5jqBPjD_Ea3TUbMtngwvvKz3H1GnxyNTZtnQ',
  pillarSolar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJf2xIuHfI8H2wvPaxCYBRCHfspcK1BdHdLjgujCCF2XN2-fiwSy4U_ggSPHq5Yxttd35KOMynef7TSDzDF3sxFJkwyI0EkbsTfu4sHVlQw_x_YofNCyPSGC6_F1GTkbW5dk70UjzEdOFsi3L8p6u54k7kHEkYXKHihWJQElUUiRSWBnveDp9ZbADQPzVt7z2e68bHdifcFgQJdVceKw_GEd1ONsAlg83Qa_GJc5I-knW2fe0AXbsblA',
  pillarTesting: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKRpnBJy6YM4IT-Wk8nEvyIdUqT6nK38LMXTZgYMAzUZgq-FvfBwpC7a3nupPTc1jz7kwJPjnYRai8H0znZm3Eg4boEZvGYw-XzjXK-gFWnG8o_01bT7cSnJwynxQT54KK8z8twaF5eGqGzR1KeMIKaGwFY3frqzPc4c3hj5k2Yx1yax9HRqPHLa5a15d71tQlBwwqFuBjswwFwo7ojloro1BxQUVSImH6g1kr6dM4S06Mx-9hTLY7hA',
  aboutExecution: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEfqWL1ze8ak0SxXdMk-pb7pa-fOI3STbWD7BAi2s1ULDHHOkjxbodQOLozgy8koPOmNWi5tLl9-s31IhDjBmKZrYPIktBz6BNvYxIbDv4i53hMHqoZBik3sSR0tsIIgf09FLZIcH4lrhtDm2QDQk2YSnNjmxwXkKjji8o5gE6a-IdJOqBjgUhADtpNtNhsdiS4W4f4TE_D8KbdmKA52ZfHpPdlAIDZdq0BwaLGcWl48S5XQAOllPWUQ',
  engineerPanelInspection: '/assets/aistudio/Woman_inspecting_electrical_pane.webp',
  project1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGbniEgbwvh57ZotZe9A7-lzAgrBC0ohAc-4sl2WVaeY30d7Ukt5hD0YOjyBBYIISSsKtD7N9sXMcUzqFcvS4qdDxwLvrgoDPHftgzLueH4sCAE3LJaHQOJxf8eY0GI1Bbwasf2j9fnnexfOYqIUNuLGxp6rshRJpaddupXnXd0v38meLsbWS_-WWPx0OWwEnmRddulTyKCVphWg5LV7LSW-AnUkrL_mnCXhb68ev8SbQLLUHL8cBS5g',
  project2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH_HDGMeWgC6INJ8Ly_Wh1nXfUaaN1FfjGWSw_eb5G9vVmNoS1AXP_h4rQy4voVKsNIUrG3ficlaW_UP8CdUps83CV2TDW1d0BTVx6xZOm9iD4m168OJ7J6gYQsAjboUSpDF5sJmNk-2ir8OFzN1xQmNnSBRUG417NIU9N9W5VL0mgxF3Bnk6bdYdasAsf8RVD4u5TGS3CojCXmMvjNosEvUm6KLl9Cd6bIDRzVQ1sAz9L26fi-UGYaA',
  project3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXD44vMawXW-gTyaPPzZEh15Hr5nmBSOzgnhIDlduxYo4hPsZc1QRcM9SkxKnJPYq8kJvWPTrYP1pgj6-7lPtr61tp19SJTSlRmVxNLad5p6FB5jFwHjYYspK2pw9vfwpH9dBVWbgKKyTzryDzB9Vx4mindVaSzNXx2f5B4C7JyjNx8AYQyu7CWLbxSmcB3nSvQc67--YgbenLDelW2CiVMQq9krpd3QLrD-sdBL98skhfz1jU9z41ww',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'ht-lt-distribution',
    title: 'HT & LT Electrical Works & Distribution',
    category: 'high-voltage',
    badge: 'Industrial & Commercial',
    voltageClass: '11kV / 33kV / 415V',
    standards: 'IEC 62271 / IS 732 / CEA Regulations',
    targetSegments: ['Industrial Plants', 'Commercial Complexes', 'Tech Parks', 'Institutional Campuses'],
    description: 'Turnkey design, supply, erection, and integration of 11kV/33kV High Tension switchgear, Low Tension distribution boards, sandwich busduct trunking, and automatic changeover systems across Bengaluru and Karnataka.',
    icon: 'electric_meter',
    image: ASSETS.project1,
    specs: [
      '11kV & 33kV Indoor / Outdoor Switchgear Installations',
      'Air Insulated (AIS) & Gas Insulated (GIS) Ring Main Units',
      'Overhead & Vertical Sandwich Busducts up to 6300A',
      'Auto Mains Failure (AMF) & DG Synchronizing Panels'
    ]
  },
  {
    id: 'turnkey-solar',
    title: 'Turnkey Solar Power Installations (EPC)',
    category: 'solar',
    badge: 'Rooftop & Ground Mount',
    voltageClass: 'LT 415V / 11kV / 33kV',
    standards: 'IEC 61215 / IEC 62109 / KERC Net Metering',
    targetSegments: ['Industrial Warehouses', 'Commercial Buildings', 'Apartment Associations', 'Independent Homes'],
    description: 'End-to-end solar EPC solutions for industrial sheds, commercial rooftops, institutions, and residential villas in Bengaluru and Karnataka, complete with Tier-1 bifacial PV modules and BESCOM net-metering approvals.',
    icon: 'solar_power',
    image: ASSETS.pillarSolar,
    specs: [
      'Tier-1 Bifacial TOPCon & Mono PERC Solar PV Modules',
      'Multi-MPPT On-Grid & Hybrid String Inverters',
      'Complete BESCOM / KERC Bidirectional Net-Metering Liaison',
      'Hot-Dip Galvanized Wind-Rated Mounting Structures & Earthing'
    ]
  },
  {
    id: 'industrial-automation',
    title: 'Electrical Control Panels (PCC, MCC, APFC & VFD)',
    category: 'automation',
    badge: 'CPRI Type-Tested',
    voltageClass: 'LT 415V 3-Phase',
    standards: 'IEC 61439-1 & 2 / IS 8623',
    targetSegments: ['Manufacturing Units', 'Process Industries', 'Commercial High-Rises', 'Pumping Stations'],
    description: 'Custom engineering, supply, and installation of Power Control Centers (PCC), Motor Control Centers (MCC), PLC/VFD automation desks, feeder pillars, and sub-main distribution boards.',
    icon: 'memory',
    image: ASSETS.pillarTesting,
    specs: [
      'Form-3b & Form-4b Compartmentalized Sheet-Steel Enclosures',
      'CPRI Type-Tested Assemblies with Tinned Copper Busbars',
      'Draw-Out Air Circuit Breakers (ACB) & Microprocessor MCCBs',
      'PLC, VFD & Soft-Starter Motor Control Buckets'
    ]
  },
  {
    id: 'substations-transformers',
    title: 'Substations & Power Transformer Erection',
    category: 'high-voltage',
    badge: 'Grid Interconnection',
    voltageClass: '11kV to 110kV',
    standards: 'IS 2026 / IEC 60076 / KPTCL Norms',
    targetSegments: ['Heavy Industries', 'Industrial Layouts', 'Large Commercial Campuses', 'Townships'],
    description: 'Civil foundation, structural erection, oil filtration, testing, and commissioning of oil-immersed (ONAN) and dry-type cast resin transformers with DP/4P outdoor switchyard structures.',
    icon: 'ev_station',
    image: ASSETS.pillarHighVoltage,
    specs: [
      'ONAN Oil-Immersed & Cast-Resin Dry-Type Transformers',
      'Double-Pole (DP) & Four-Pole (4P) Galvanized Yard Structures',
      'On-Load Tap Changers (OLTC), RTCC Panels & NIFPS Safety',
      'HT Trivector Metering Cubicles, GOAB Isolators & Lightning Arresters'
    ]
  },
  {
    id: 'cable-trays-xlpe-cabling',
    title: 'HT / LT Armored XLPE Cabling & Cable Trays',
    category: 'high-voltage',
    badge: 'Plant & Underground Infra',
    voltageClass: 'LT 1.1kV to HT 33kV',
    standards: 'IS 7098 / IEC 60502',
    targetSegments: ['Factories & Warehouses', 'Residential Layouts', 'IT Campuses', 'Substation Feeders'],
    description: 'Supply and laying of underground and overhead armored XLPE power cables, hot-dip galvanized ladder and perforated cable tray networks, trench excavation, and heat-shrink/cold-shrink cable terminations.',
    icon: 'cable',
    image: ASSETS.project3,
    specs: [
      '1.1kV LT to 11kV/33kV HT A2XFY Armored XLPE Cable Laying',
      'Hot-Dip Galvanized (HDG) Ladder & Perforated Cable Trays',
      'Indoor & Outdoor Raychem / 3M Heat-Shrink End Terminations',
      'Underground HDPE Pipe Ducting, Sand Cushioning & Route Markers'
    ]
  },
  {
    id: 'testing-commissioning',
    title: 'Installation, Relay Testing & Pre-Commissioning',
    category: 'statutory',
    badge: 'Calibrated Diagnostics',
    voltageClass: 'LT / HT / EHT Systems',
    standards: 'IS 1885 / CEA Safety Regulations',
    targetSegments: ['Substation Projects', 'Industrial Plants', 'Commercial Towers', 'Utility Interconnections'],
    description: 'Comprehensive pre-commissioning electrical testing including primary and secondary relay injection, 5kV/10kV digital Megger insulation resistance, VLF Hi-Pot cable testing, and transformer oil BDV diagnostics.',
    icon: 'architecture',
    image: ASSETS.aboutExecution,
    specs: [
      '5kV / 10kV Digital Insulation Resistance (IR & PI) Megger Testing',
      'Primary & Secondary Injection Relay Calibration & Breaker Timing',
      'DC / VLF Hi-Pot Pressure Testing for HT XLPE Cables',
      'Earth Pit Resistance & Soil Resistivity Verification Reports'
    ]
  },
  {
    id: 'statutory-liaison',
    title: 'BESCOM / KPTCL Liaison & CEIG Approvals',
    category: 'statutory',
    badge: 'Single-Window Statutory',
    voltageClass: 'All Voltage Classes',
    standards: 'CEA Regulations 2023 / Karnataka Electrical Inspectorate',
    targetSegments: ['New Industrial Plants', 'Commercial Buildings', 'Apartment Complexes', 'Solar Plants'],
    description: 'End-to-end statutory engineering documentation and government liaison for Single Line Diagram (SLD) drawing sanction, Chief Electrical Inspector to Government (CEIG) safety certificates, and ESCOM load energization.',
    icon: 'assignment_turned_in',
    image: ASSETS.hero,
    specs: [
      'Single Line Diagram (SLD) & Equipment Layout CAD Preparation',
      'CEIG Drawing Sanction & Final Statutory Safety Inspection',
      'Fresh Power Sanction, Load Enhancement & Temporary-to-Permanent Tariffs',
      'All Karnataka ESCOMs: BESCOM, MESCOM, HESCOM, GESCOM & CESC'
    ]
  },
  {
    id: 'industrial-amc',
    title: 'Preventive Maintenance, Thermal Audits & AMC',
    category: 'maintenance',
    badge: '24/7 Breakdown Support',
    voltageClass: 'Facility-Wide',
    standards: 'IS 10118 / NFPA 70B Preventive Protocol',
    targetSegments: ['Manufacturing Facilities', 'Hospitals', 'Corporate Offices', 'Cold Storage & Logistics'],
    description: 'Scheduled preventive electrical maintenance contracts (AMC), infrared thermography of switchboards, transformer oil filtration, ACB/VCB breaker servicing, and 24/7 emergency fault troubleshooting.',
    icon: 'support_agent',
    image: ASSETS.project2,
    specs: [
      'Infrared Thermal Imaging Scans for Busbar & Termination Hotspots',
      'Online Transformer Oil Filtration & Dielectric BDV Testing',
      'Scheduled VCB / ACB Breaker Contact Servicing & Lubrication',
      '24/7 Emergency Breakdown Dispatch Across Bengaluru & Karnataka'
    ]
  },
  {
    id: 'energy-audits-apfc',
    title: 'Energy Audits & Harmonic APFC Panels',
    category: 'maintenance',
    badge: 'Power Factor Optimization',
    voltageClass: '415V to 11kV',
    standards: 'IEC 60831 / IEEE 519',
    targetSegments: ['Engineering Workshops', 'Plastics & Textiles', 'Pharmaceutical Units', 'Commercial Malls'],
    description: 'Detailed power quality logging, harmonic distortion analysis, and installation of detuned Automatic Power Factor Correction (APFC) panels to maintain near-unity power factor and prevent utility penalties.',
    icon: 'insights',
    image: ASSETS.project3,
    specs: [
      'Maintains Power Factor > 0.98–0.99 to Eliminate BESCOM Penalties',
      '7% & 14% Copper-Wound Detuned Reactors for Harmonic Filtering',
      'Zero-Crossing Thyristor & Contactor Switched Capacitor Banks',
      'Load Balancing & Energy Conservation Audit Reports'
    ]
  },
  {
    id: 'vcb-acb-switchgear',
    title: 'HT VCB & LT ACB Switchgear Supply & Retrofit',
    category: 'high-voltage',
    badge: 'Switchgear & Protection',
    voltageClass: '11kV / 33kV / 415V',
    standards: 'IEC 62271-100 / IEC 60947-2',
    targetSegments: ['Aging Substations', 'Industrial Plants', 'Infrastructure Projects'],
    description: 'Supply, erection, retrofitting, and mechanical/electrical interlocking of indoor and outdoor Vacuum Circuit Breakers (VCB), SF6 Ring Main Units (RMU), and draw-out Air Circuit Breakers (ACB).',
    icon: 'electrical_services',
    image: ASSETS.transmissionBg,
    specs: [
      '11kV & 33kV Draw-Out Metal-Clad VCB Breaker Panels',
      'Compact SF6 / Dry-Air Ring Main Units (RMU) with Numerical Relays',
      'Microprocessor LSIG Release ACBs (800A to 6300A)',
      'Castle Key Interlocks, Trip Circuit Supervision & Arc Protection'
    ]
  },
  {
    id: 'dg-sync-ups-backup',
    title: 'Industrial Electrification, DG Sync & UPS Systems',
    category: 'automation',
    badge: 'Turnkey Plant & Backup',
    voltageClass: '415V / 230V Captive',
    standards: 'IS 732 / CPCB-IV+ / NBC 2016',
    targetSegments: ['Factories', 'IT Offices', 'Hospitals', 'Residential Apartments & Villas'],
    description: 'Complete industrial, commercial, and residential interior electrification, machine power drops, high-bay LED lighting, CPCB-IV+ Diesel Generator (DG) installation, AMF synchronization, and online UPS systems.',
    icon: 'bolt',
    image: ASSETS.project1,
    specs: [
      'IS:732 Compliant FRLS/ZHFR Concealed & Industrial Conduit Wiring',
      'Multi-DG Auto Load Sharing, AMF & Synchronizing Panels',
      'Industrial Online Double-Conversion UPS Banks & Battery Racks',
      'High-Bay Industrial LED Lighting & Emergency Exit Circuits'
    ]
  },
  {
    id: 'lightning-earthing-protection',
    title: 'Earthing Systems & Lightning Protection',
    category: 'maintenance',
    badge: 'IS 3043 Safety Grid',
    voltageClass: 'IS 3043 / IEC 62305',
    standards: 'IS 3043 / IEC 62305 / NFC 17-102',
    targetSegments: ['Substations', 'Factories & Warehouses', 'Solar Plants', 'Apartments & Homes'],
    description: 'Substation copper/GI flat-strip earth mats, maintenance-free copper-bonded earthing electrodes, Early Streamer Emission (ESE) lightning arresters, and Type 1+2 Surge Protection Devices (SPD).',
    icon: 'shield',
    image: ASSETS.aboutExecution,
    specs: [
      'Copper-Bonded & GI Earth Electrodes (< 1 Ohm Target)',
      'Substation Underground GI / Copper Strip Earth Mat Grids',
      'Early Streamer Emission (ESE) & Franklin Lightning Arresters',
      'Dedicated Separate Earthing for Transformer Neutral, Body & Ups/Inverters'
    ]
  }
];

export const ELECTRICAL_EQUIPMENT: ElectricalEquipmentItem[] = [
  {
    id: 'eq-power-transformers',
    name: 'ONAN & Cast-Resin Power Transformers',
    category: 'Substation Equipment',
    voltageRating: '11kV / 33kV / 66kV / 110kV',
    capacityRange: '250 kVA – 25+ MVA',
    standard: 'IS 2026 / IEC 60076',
    description: 'High-efficiency oil-immersed (ONAN) and indoor dry-type cast resin distribution and power transformers equipped with On-Load Tap Changers (OLTC) and RTCC panels.',
    image: ASSETS.pillarHighVoltage,
    icon: 'ev_station',
    features: [
      'BIS Star-Rated low-loss CRGO core construction',
      'Automatic On-Load Tap Changer (OLTC) & RTCC panel',
      'Buchholz relay, OTI/WTI & PRV safety devices',
      'Pre-commissioning oil BDV & turns-ratio test reports'
    ]
  },
  {
    id: 'eq-vcb-rmu-switchgear',
    name: '11kV / 33kV VCB & GIS Ring Main Units',
    category: 'HT Switchgear',
    voltageRating: '11kV – 33kV',
    capacityRange: '630A – 2500A (25kA / 31.5kA)',
    standard: 'IEC 62271-100 / 200',
    description: 'Horizontal draw-out Vacuum Circuit Breaker (VCB) panels and compact Ring Main Units (RMU) with numerical overcurrent and earth-fault protection relays.',
    image: ASSETS.transmissionBg,
    icon: 'electrical_services',
    features: [
      'Internal arc classified metal-clad enclosure',
      'Numerical protection relays (IDMT 50/51, 50N/51N)',
      'Motorized spring-charging for remote trip/close',
      'Resin-cast CT & PT metering chambers'
    ]
  },
  {
    id: 'eq-pcc-mcc-panels',
    name: 'Form-4b LT PCC, MCC & ACB Switchboards',
    category: 'LT Distribution',
    voltageRating: '415V / 690V AC',
    capacityRange: 'Up to 6300A Busbar, 50kA/65kA',
    standard: 'IEC 61439-1 & 2',
    description: 'CPRI type-tested Power Control Centers (PCC) and Motor Control Centers (MCC) with draw-out Air Circuit Breakers (ACB), MCCBs, VFDs, and digital energy meters.',
    image: ASSETS.project1,
    icon: 'dns',
    features: [
      'Form-4b compartmentalization with tinned copper busbars',
      'Draw-out ACBs & MCCBs with microprocessor LSIG protection',
      'VFD / Star-Delta / Soft-Starter motor feeder compartments',
      'RS485 Modbus / Ethernet multifunction energy meters'
    ]
  },
  {
    id: 'eq-sandwich-busduct',
    name: 'Sandwich Busduct & Rising Mains Trunking',
    category: 'Power Trunking',
    voltageRating: '415V – 1000V',
    capacityRange: '800A – 6300A (IP55 / IP65)',
    standard: 'IEC 61439-6',
    description: 'Compact low-impedance copper and aluminum sandwich busbar trunking systems for transformer-to-PCC interconnection and high-rise vertical rising mains.',
    image: ASSETS.project3,
    icon: 'linear_scale',
    features: [
      'Class-F / Class-H Mylar & epoxy insulation system',
      'Plug-in tap-off boxes with MCCB/HRC fuse safety',
      'Fire barrier flanges & flexible braided expansion joints',
      'Low voltage drop & high short-circuit withstand housing'
    ]
  },
  {
    id: 'eq-apfc-harmonic',
    name: 'Thyristor APFC & Harmonic Filter Banks',
    category: 'Power Quality',
    voltageRating: '415V / 440V 3-Phase',
    capacityRange: '50 kVAR – 2000 kVAR',
    standard: 'IEC 60831 / IEEE 519',
    description: 'Real-time zero-crossing thyristor and contactor switched Automatic Power Factor Correction (APFC) panels with 7% / 14% copper-wound detuned harmonic reactors.',
    image: ASSETS.pillarTesting,
    icon: 'insights',
    features: [
      'Maintains 0.99+ lag power factor to eliminate utility penalties',
      'Heavy-duty cylindrical / APP MPP gas-filled capacitors',
      '7% & 14% detuned iron-core harmonic blocking reactors',
      '8-stage / 12-stage / 16-stage intelligent APFC controller'
    ]
  },
  {
    id: 'eq-solar-inverters-pv',
    name: 'Tier-1 Bifacial PV & String Inverters',
    category: 'Solar EPC Hardware',
    voltageRating: '1500V DC / 415V AC',
    capacityRange: '5 kWp – Multi-MWp Blocks',
    standard: 'IEC 61215 / IEC 62109',
    description: 'N-Type TOPCon / Mono PERC bifacial solar modules paired with IP66 multi-MPPT string inverters, AC/DC combiner boxes, and bidirectional net-metering kiosks.',
    image: ASSETS.pillarSolar,
    icon: 'solar_power',
    features: [
      '550Wp–585Wp Tier-1 Bifacial Dual-Glass PV Modules',
      '98.6%+ peak efficiency string inverters with AFCI protection',
      'DC & AC Type-1+2 Surge Protection Devices (SPD)',
      'BESCOM / KERC approved bidirectional ABT net metering'
    ]
  },
  {
    id: 'eq-testing-diagnostics',
    name: 'Primary Injection, Hi-Pot & Thermal Diagnostics',
    category: 'Testing Apparatus',
    voltageRating: 'Up to 110kV Diagnostic',
    capacityRange: '5kV / 10kV IR & 80kV BDV',
    standard: 'CEA / IS 1885',
    description: 'Calibrated electrical testing instruments including digital insulation resistance Meggers, VLF Hi-Pot kits, secondary relay test kits, and thermal imaging cameras.',
    image: ASSETS.aboutExecution,
    icon: 'troubleshoot',
    features: [
      '5kV / 10kV Digital PI & DAR Insulation Megger Testers',
      '3-Phase Secondary Relay Test Kit & Breaker Timer',
      '60kV / 80kV Automatic Transformer Oil BDV Tester',
      'Infrared Thermography & Digital Earth Resistance Tester'
    ]
  },
  {
    id: 'eq-substation-yard-hardware',
    name: 'DP/4P Substation Structures, Isolators & LA',
    category: 'Outdoor Switchyard',
    voltageRating: '11kV / 33kV / 66kV',
    capacityRange: '400A – 1600A Outdoor',
    standard: 'KPTCL / BESCOM Approved',
    description: 'Hot-dip galvanized RS Joist Double-Pole/Four-Pole yard structures, Gang Operated Air Break (GOAB) isolators, polymeric lightning arresters, and HT metering cubicles.',
    image: ASSETS.hero,
    icon: 'settings_input_component',
    features: [
      'KPTCL/BESCOM approved HT Trivector TOD Metering Cubicle',
      'Gang Operated Air Break (GOAB) Isolators with Earth Switch',
      'Station-class Polymeric Metal-Oxide Lightning Arresters',
      'Porcelain / Polymeric Disc & Pin Insulators with hardware'
    ]
  }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'peenya-substation',
    title: 'HT Substation & PCC/MCC Switchgear Installation',
    category: 'industrial',
    tag: 'Industrial Substation Scope',
    description: 'Turnkey engineering, supply, erection, testing, and CEIG statutory clearance for an industrial step-down substation, HT VCB incomer, and Form-4b LT PCC/MCC distribution panels.',
    location: 'Peenya Industrial Area, Bengaluru',
    status: 'Verified Scope Category',
    image: ASSETS.project1,
    capacity: '11kV / 33kV Class (Customizable Scope)',
    voltage: '11kV or 33kV / 415V Step-Down',
    completionYear: 'Representative Scope',
    clientVertical: 'Industrial Manufacturing & Engineering',
    approvals: ['CEIG Drawing & Safety Clearance', 'BESCOM HT Power Sanction', 'Earth Grid & Hi-Pot Test Reports'],
    scopeOfWork: [
      'Preparation of Single Line Diagram (SLD) & substation layout CAD drawings',
      'Erection of DP/4P yard structure, GOAB isolator, lightning arresters & HT metering cubicle',
      'Installation & commissioning of step-down transformer, indoor VCB panel & LT PCC/MCC board',
      'Dedicated earthing grid (<1 Ohm), Megger/Hi-Pot testing & CEIG final energization approval'
    ],
    clientReferencePlaceholder: '[Editable Owner Record: Add Verified Client Name, PO Ref & Sanctioned kVA]',
    isPlaceholderEditable: true
  },
  {
    id: 'hosakote-solar',
    title: 'Commercial & Industrial Rooftop Solar EPC',
    category: 'solar',
    tag: 'Rooftop Solar & Net Metering',
    description: 'Turnkey rooftop solar PV power plant installation with high-efficiency bifacial modules, multi-MPPT string inverters, AC/DC surge protection, and BESCOM bidirectional net metering.',
    location: 'Bengaluru & Hosakote Industrial Belt',
    status: 'Verified Scope Category',
    image: ASSETS.project2,
    capacity: '10 kWp – 1000+ kWp (Site Specific)',
    voltage: '415V LT / 11kV Grid Sync',
    completionYear: 'Representative Scope',
    clientVertical: 'Commercial Warehousing, Factories & Institutions',
    approvals: ['BESCOM / ESCOM Net Metering Sanction', 'CEIG Solar Safety Clearance', 'Bidirectional ABT Meter Commissioning'],
    scopeOfWork: [
      'Shadow analysis, structural wind-load calculation & hot-dip galvanized module mounting',
      'Installation of Tier-1 bifacial solar PV panels, DC string cables & MC4 terminations',
      'Grid-tied string inverter erection, ACDB/DCDB protection & 3-pit獨立 earthing',
      'End-to-end BESCOM net-metering portal filing, inspection & bidirectional meter synchronization'
    ],
    clientReferencePlaceholder: '[Editable Owner Record: Add Verified Solar Site Name, kWp Capacity & Commissioning Date]',
    isPlaceholderEditable: true
  },
  {
    id: 'bidadi-pharma',
    title: 'Industrial Cabling, Cable Trays & Harmonic APFC Panels',
    category: 'commercial',
    tag: 'Cabling & Power Quality',
    description: 'Complete industrial & commercial electrical distribution featuring hot-dip galvanized ladder/perforated cable trays, armored XLPE feeder cables, sub-DBs, and detuned APFC panels.',
    location: 'Bengaluru Industrial Corridors (Bommasandra / Bidadi / Whitefield)',
    status: 'Verified Scope Category',
    image: ASSETS.project3,
    capacity: 'LT 415V Distribution & APFC',
    voltage: '415V Three Phase 50Hz',
    completionYear: 'Representative Scope',
    clientVertical: 'Commercial Buildings, Tech Parks & Process Plants',
    approvals: ['IS 732 & IEC 61439 Compliance', 'Power Factor > 0.99 Verification', 'Megger Insulation Test Certificate'],
    scopeOfWork: [
      'Overhead HDG perforated & ladder cable tray fabrication and ceiling suspension',
      'Laying, dressing, double-compression glanding & termination of armored XLPE cables',
      'Installation of 7% detuned reactor APFC panels to eliminate BESCOM power factor penalties',
      'High-bay industrial LED lighting, machine drops & phase load balancing'
    ],
    clientReferencePlaceholder: '[Editable Owner Record: Add Verified Commercial / Industrial Facility Name & Scope Details]',
    isPlaceholderEditable: true
  },
  {
    id: 'sahakarnagar-layout-electrification',
    title: 'Residential Layout Electrification & Underground Cabling',
    category: 'commercial',
    tag: 'Layout & Apartment Infra',
    description: 'Turnkey layout and apartment complex electrification in North Bengaluru including 11kV overhead/underground network, distribution transformers (DTC), feeder pillars, and street lighting.',
    location: 'North Bengaluru (Sahakarnagar / Hebbal / Yelahanka / Devanahalli)',
    status: 'Verified Scope Category',
    image: ASSETS.transmissionBg,
    capacity: '11kV / 433V Layout Distribution',
    voltage: '11kV / 433V Three Phase',
    completionYear: 'Representative Scope',
    clientVertical: 'Residential Townships, Gated Layouts & Builders',
    approvals: ['BESCOM Layout Electrification Sanction', 'CEIG Transformer Approval', 'Underground Cable Route Certification'],
    scopeOfWork: [
      '11kV HT line extension, pole-mounted or plinth-mounted Distribution Transformer Center (DTC)',
      'Underground armored XLPE cable trenching with HDPE duct pipes & sand/brick protection',
      'Weatherproof outdoor LT Feeder Pillars, consumer meter panels & service terminations',
      'Tubular street lighting poles with automatic astronomical timer control panels'
    ],
    clientReferencePlaceholder: '[Editable Owner Record: Add Verified Builder / Layout Project Name & Location]',
    isPlaceholderEditable: true
  },
  {
    id: 'bengaluru-residential-commercial-wiring',
    title: 'Residential 2BHK/3BHK Villa & Commercial Interior Wiring',
    category: 'commercial',
    tag: 'IS:732 Wiring & Automation',
    description: 'Precision concealed FRLS/ZHFR conduit wiring, TPN MCB/RCCB distribution boards, surge protection, electrical earthing systems, and smart lighting automation for homes and offices.',
    location: 'Sahakarnagar & Across Bengaluru',
    status: 'Verified Scope Category',
    image: ASSETS.residentialWiring2Bhk,
    capacity: '1-Phase / 3-Phase LT Sanction',
    voltage: '230V / 415V AC',
    completionYear: 'Representative Scope',
    clientVertical: 'Independent Homes, Luxury Villas, Apartments & Offices',
    approvals: ['IS:732 Wiring Code Compliance', '30mA RCCB Shock Protection', 'IS 3043 Earthing Verification'],
    scopeOfWork: [
      'Concealed heavy-duty PVC conduit routing and wall chasing per architectural CAD drawings',
      'Flame-Retardant Low-Smoke (FRLS) copper wiring for lighting, 6A/16A sockets, AC & geyser points',
      'TPN / SPN double-door MCB distribution board assembly with RCCB and Type-2 SPD',
      'Smart touch switches, DALI/KNX dimming, inverter/UPS backup wiring & BESCOM meter sanction'
    ],
    clientReferencePlaceholder: '[Editable Owner Record: Add Verified Residence / Commercial Office Project Details]',
    isPlaceholderEditable: true
  },
  {
    id: 'testing-amc-commissioning',
    title: 'Electrical Testing, Commissioning & Preventive AMC',
    category: 'industrial',
    tag: 'Testing, Safety Audit & AMC',
    description: 'Pre-commissioning relay/Megger/Hi-Pot testing, thermal imaging audits, transformer oil filtration, and annual electrical maintenance contracts for industrial and commercial facilities.',
    location: 'Bengaluru & All Karnataka Industrial Corridors',
    status: 'Verified Scope Category',
    image: ASSETS.aboutExecution,
    capacity: 'LT 415V to 110kV Diagnostics',
    voltage: 'All Voltage Classes',
    completionYear: 'Representative Scope',
    clientVertical: 'Factories, Hospitals, Tech Parks & Commercial Complexes',
    approvals: ['Calibrated Test Certificates', 'CEA Statutory Safety Audit Report', 'CEIG Periodical Inspection Support'],
    scopeOfWork: [
      '5kV/10kV digital insulation resistance (Megger) and VLF Hi-Pot cable breakdown testing',
      'Primary & secondary current injection testing of overcurrent and earth-fault protection relays',
      'Infrared thermography of LT/HT panels to detect loose terminations and phase unbalance',
      'Transformer oil BDV filtration, silica gel breather replacement & 24/7 emergency breakdown support'
    ],
    clientReferencePlaceholder: '[Editable Owner Record: Add Verified AMC / Testing Client Reference]',
    isPlaceholderEditable: true
  }
];

export const ESCOMS = [
  { name: 'BESCOM', region: 'Bengaluru Electricity Supply Company' },
  { name: 'MESCOM', region: 'Mangalore Electricity Supply Company' },
  { name: 'HESCOM', region: 'Hubli Electricity Supply Company' },
  { name: 'GESCOM', region: 'Gulbarga Electricity Supply Company' },
  { name: 'CESC', region: 'Chamundeshwari Electricity Supply Corp (Mysuru)' },
];
