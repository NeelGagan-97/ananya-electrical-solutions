import { ServiceItem, ProjectItem, ElectricalEquipmentItem } from '../types';

export const ASSETS = {
  logo: '/assets/aistudio/logo_ananya.png',
  transmissionBg: '/assets/aistudio/Electrical_transmission_lines_on__2K_20261025145912_944acc49.jpg',
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4VC5wbdLF6oMvZEPulwpBgA-Yp8jDBjo4lRm43CiNcy4wAz8f49u_BG5pLMeD9avm2zSVziMc6kRESJ5-iXfd7FzgEhjkczKHssp33WQCga79GEkgPHAlH7BtsTkhPVHCT-JUkrcDtghkNrsl7yBt6UoIEof2UlnBAXLlBuVtDmKN7vKPlbmmThg0jGV_YOLssfE-FQMWMjMjXBQ30hrcKwLrvLwg6e7W_yb9iNa5jOYN4k0uTDi2JQ',
  pillarHighVoltage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmD_0-a9fxQ-SiQoGtr6UyJQGCE0tjhkx2bzY4RN2BqNF5FUMOfYVNmgFKhkVZspM9a2dYsv-rr-y0d6z0AUaaMWQdLw-3Bh35Rz-Mt7IrXIbseRSfSRGJmiy9a1qvZD3QE1aFnSoT0ii8wCS4Z_xMDJlusRXtvTLXK4UGrcJwsbR5hpmwYYR0aRKoQwYrwX7MI4-ckkpcVNS8al9MMU5jqBPjD_Ea3TUbMtngwvvKz3H1GnxyNTZtnQ',
  pillarSolar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJf2xIuHfI8H2wvPaxCYBRCHfspcK1BdHdLjgujCCF2XN2-fiwSy4U_ggSPHq5Yxttd35KOMynef7TSDzDF3sxFJkwyI0EkbsTfu4sHVlQw_x_YofNCyPSGC6_F1GTkbW5dk70UjzEdOFsi3L8p6u54k7kHEkYXKHihWJQElUUiRSWBnveDp9ZbADQPzVt7z2e68bHdifcFgQJdVceKw_GEd1ONsAlg83Qa_GJc5I-knW2fe0AXbsblA',
  pillarTesting: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKRpnBJy6YM4IT-Wk8nEvyIdUqT6nK38LMXTZgYMAzUZgq-FvfBwpC7a3nupPTc1jz7kwJPjnYRai8H0znZm3Eg4boEZvGYw-XzjXK-gFWnG8o_01bT7cSnJwynxQT54KK8z8twaF5eGqGzR1KeMIKaGwFY3frqzPc4c3hj5k2Yx1yax9HRqPHLa5a15d71tQlBwwqFuBjswwFwo7ojloro1BxQUVSImH6g1kr6dM4S06Mx-9hTLY7hA',
  aboutExecution: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEfqWL1ze8ak0SxXdMk-pb7pa-fOI3STbWD7BAi2s1ULDHHOkjxbodQOLozgy8koPOmNWi5tLl9-s31IhDjBmKZrYPIktBz6BNvYxIbDv4i53hMHqoZBik3sSR0tsIIgf09FLZIcH4lrhtDm2QDQk2YSnNjmxwXkKjji8o5gE6a-IdJOqBjgUhADtpNtNhsdiS4W4f4TE_D8KbdmKA52ZfHpPdlAIDZdq0BwaLGcWl48S5XQAOllPWUQ',
  project1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGbniEgbwvh57ZotZe9A7-lzAgrBC0ohAc-4sl2WVaeY30d7Ukt5hD0YOjyBBYIISSsKtD7N9sXMcUzqFcvS4qdDxwLvrgoDPHftgzLueH4sCAE3LJaHQOJxf8eY0GI1Bbwasf2j9fnnexfOYqIUNuLGxp6rshRJpaddupXnXd0v38meLsbWS_-WWPx0OWwEnmRddulTyKCVphWg5LV7LSW-AnUkrL_mnCXhb68ev8SbQLLUHL8cBS5g',
  project2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH_HDGMeWgC6INJ8Ly_Wh1nXfUaaN1FfjGWSw_eb5G9vVmNoS1AXP_h4rQy4voVKsNIUrG3ficlaW_UP8CdUps83CV2TDW1d0BTVx6xZOm9iD4m168OJ7J6gYQsAjboUSpDF5sJmNk-2ir8OFzN1xQmNnSBRUG417NIU9N9W5VL0mgxF3Bnk6bdYdasAsf8RVD4u5TGS3CojCXmMvjNosEvUm6KLl9Cd6bIDRzVQ1sAz9L26fi-UGYaA',
  project3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXD44vMawXW-gTyaPPzZEh15Hr5nmBSOzgnhIDlduxYo4hPsZc1QRcM9SkxKnJPYq8kJvWPTrYP1pgj6-7lPtr61tp19SJTSlRmVxNLad5p6FB5jFwHjYYspK2pw9vfwpH9dBVWbgKKyTzryDzB9Vx4mindVaSzNXx2f5B4C7JyjNx8AYQyu7CWLbxSmcB3nSvQc67--YgbenLDelW2CiVMQq9krpd3QLrD-sdBL98skhfz1jU9z41ww',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'ht-lt-distribution',
    title: 'HT & LT Distribution Systems',
    category: 'high-voltage',
    badge: 'Industrial Standard',
    voltageClass: '11kV / 33kV / 415V',
    description: 'Design, supply, and integration of 11kV/33kV HT switchgear, Low Tension distribution boards, busduct trunking systems, and automated changeover setups.',
    icon: 'electric_meter',
    image: ASSETS.project1,
    specs: [
      '11kV & 33kV Indoor / Outdoor Switchgear',
      'Air Insulated (AIS) & Gas Insulated (GIS) Options',
      'Sandwich Busducts up to 6300A rating',
      'Auto Mains Failure (AMF) Synchronizing Panels'
    ]
  },
  {
    id: 'turnkey-solar',
    title: 'Turnkey Solar Power Plants',
    category: 'solar',
    badge: 'C&I / Institutional',
    voltageClass: 'LT / 11kV / 33kV Grid',
    description: 'Complete EPC solutions for rooftop and ground-mounted solar installations. Tier-1 solar modules, high-efficiency string inverters, and lifetime yield optimization.',
    icon: 'solar_power',
    image: ASSETS.pillarSolar,
    specs: [
      'Bifacial TOPCon & Mono PERC 550Wp+ Modules',
      'Smart Grid String Inverters with 98.8% Efficiency',
      'Bescom / KERC Net-metering approval liaisons',
      'Remote SCADA telemetry & weather station'
    ]
  },
  {
    id: 'industrial-automation',
    title: 'Industrial Automation & Panels',
    category: 'automation',
    badge: 'Custom Enclosures',
    voltageClass: 'LT 415V 3-Phase',
    description: 'Custom fabrication of Motor Control Centers (MCC), Power Control Centers (PCC), synchronized PLC control desks, and smart metering telemetry panels.',
    icon: 'memory',
    image: ASSETS.pillarTesting,
    specs: [
      'Form 4b separation for maximum safety',
      'Type-tested assemblies conforming to IEC 61439',
      'Intelligent Motor Protection Relays (IMPR)',
      'Dual-redundant PLC and HMI enclosures'
    ]
  },
  {
    id: 'substations-transformers',
    title: 'Substations & Transformers',
    category: 'high-voltage',
    badge: 'Grid Interconnection',
    voltageClass: '11kV to 110kV',
    description: 'Erection, oil-filtration, testing, and commissioning of oil-immersed & dry-type cast resin transformers up to 110kV step-down grid substations.',
    icon: 'ev_station',
    image: ASSETS.pillarHighVoltage,
    specs: [
      'Power Transformers up to 50 MVA class',
      'Cast resin dry type for indoor commercial towers',
      'Nitrogen injection fire protection (NIFPS)',
      'Substation automation systems (SAS / IEC 61850)'
    ]
  },
  {
    id: 'energy-audits-apfc',
    title: 'Energy Audits & APFC Panels',
    category: 'maintenance',
    badge: 'Tariff Savings',
    voltageClass: '415V to 11kV',
    description: 'Comprehensive power quality assessments, harmonic distortion mitigation, and automatic power factor correction (APFC) to eliminate utility penalty surcharges.',
    icon: 'insights',
    image: ASSETS.project3,
    specs: [
      'Maintain Power Factor > 0.99 with zero surcharge',
      'Detuned reactors for 5th, 7th, 11th harmonic filtering',
      'Thyristor switched capacitor banks (fast response)',
      'Detailed Class-A power quality logging reports'
    ]
  },
  {
    id: 'statutory-liaison',
    title: 'Statutory Liaison & CEIG Approvals',
    category: 'statutory',
    badge: 'Zero Delays',
    voltageClass: 'All Voltage Classes',
    description: 'Handling total administrative and engineering paperwork for electrical drawings sanction, safety clearances, work completion certificates, and ESCOM load energization.',
    icon: 'assignment_turned_in',
    image: ASSETS.hero,
    specs: [
      'Single Line Diagram (SLD) preparation to CEIG specs',
      'Drawing sanction from Electrical Inspectorate',
      'Safety clearance certificate for energization',
      'ESCOM liaison: BESCOM, MESCOM, HESCOM, GESCOM, CESC'
    ]
  },
  {
    id: 'testing-commissioning',
    title: 'Relay Testing & Pre-Commissioning',
    category: 'statutory',
    badge: 'Precision Testing',
    voltageClass: 'Primary & Secondary',
    description: 'Primary injection, secondary injection, breaker timing tests, contact resistance, transformer turns ratio, and tan-delta insulation diagnostic testing.',
    icon: 'architecture',
    image: ASSETS.aboutExecution,
    specs: [
      'Megger & Hi-Pot insulation breakdown testing',
      'Numerical relay coordination & curves verification',
      'Earth pit resistance testing & soil resistivity',
      'Certified test reports acceptable to CEIG'
    ]
  },
  {
    id: 'industrial-amc',
    title: 'Comprehensive Industrial AMC',
    category: 'maintenance',
    badge: '24/7 Grid Support',
    voltageClass: 'Facility-Wide',
    description: 'Preventive monthly audits, transformer oil BDV filtration, thermal imaging thermography of switchboards, and guaranteed 4-hour emergency dispatch response.',
    icon: 'support_agent',
    image: ASSETS.project2,
    specs: [
      'Thermographic infrared scans of busbars & joints',
      'Transformer oil testing (BDV, acidity, moisture)',
      'Scheduled breaker lubrication & contact servicing',
      'Dedicated emergency hotline with rapid mobilization'
    ]
  },
  {
    id: 'vcb-acb-switchgear',
    title: 'HT VCB & LT ACB Switchgear Supply',
    category: 'high-voltage',
    badge: 'Heavy Equipment',
    voltageClass: '11kV / 33kV / 415V',
    description: 'Supply, retrofitting, and interlocking of indoor/outdoor Vacuum Circuit Breakers (VCB), Ring Main Units (RMU), and draw-out Air Circuit Breakers (ACB).',
    icon: 'electrical_services',
    image: ASSETS.transmissionBg,
    specs: [
      '11kV & 33kV Draw-out Metal-Clad VCB Panels',
      'SF6 Gas Insulated Ring Main Units (RMU)',
      'Microprocessor Release ACBs (800A to 6300A)',
      'Arc-fault containment & mechanical castle interlocks'
    ]
  },
  {
    id: 'cable-trays-xlpe-cabling',
    title: 'Armored XLPE Cabling & Cable Trays',
    category: 'high-voltage',
    badge: 'Plant Infrastructure',
    voltageClass: 'LT 1.1kV to HT 33kV',
    description: 'Overhead hot-dip galvanized ladder/perforated cable tray networks, underground trench duct banks, and heat-shrink/cold-shrink HT cable terminations.',
    icon: 'cable',
    image: ASSETS.project3,
    specs: [
      '3C x 95 to 400 sq.mm A2XFY HT XLPE Cabling',
      'Hot-Dip Galvanized (HDG) Ladder & Perforated Trays',
      'Raychem / 3M Indoor & Outdoor End Terminations',
      'DC Hi-Pot pressure test & route marker installation'
    ]
  },
  {
    id: 'dg-sync-ups-backup',
    title: 'DG Synchronization & Industrial UPS',
    category: 'automation',
    badge: 'Backup Power',
    voltageClass: '415V / 11kV Captive',
    description: 'Turnkey installation of Diesel Generator (DG) sets, acoustic enclosures, PLC-based DG synchronization panels, and industrial online double-conversion UPS banks.',
    icon: 'bolt',
    image: ASSETS.project1,
    specs: [
      'Multi-DG Auto Load Sharing & Synchronizing Panels',
      'Acoustic Enclosure & Exhaust Stack Erection (CPCB-IV+)',
      'Industrial Online IG-BT UPS (20 kVA to 500 kVA)',
      'Reverse power, synchro-check & load-shedding relays'
    ]
  },
  {
    id: 'lightning-chemical-earthing',
    title: 'Chemical Earthing & Lightning Arresters',
    category: 'maintenance',
    badge: 'Fault Protection',
    voltageClass: 'IS 3043 / IEC 62305',
    description: 'Substation copper/GI earth-mat grids, maintenance-free copper-bonded chemical earthing electrodes, and Early Streamer Emission (ESE) lightning arresters.',
    icon: 'shield',
    image: ASSETS.aboutExecution,
    specs: [
      'Copper-bonded & GI Chemical Earth Electrodes (< 1 Ohm)',
      'Substation Underground Flat Strip Earth Mat Grid',
      'Early Streamer Emission (ESE) Lightning Protection',
      'Type 1+2 Surge Protection Devices (SPD) integration'
    ]
  }
];

export const ELECTRICAL_EQUIPMENT: ElectricalEquipmentItem[] = [
  {
    id: 'eq-power-transformers',
    name: 'ONAN & Cast-Resin Power Transformers',
    category: 'Substation Equipment',
    voltageRating: '11kV / 33kV / 66kV / 110kV',
    capacityRange: '250 kVA – 50 MVA',
    standard: 'IS 2026 / IEC 60076',
    description: 'High-efficiency oil-immersed (ONAN/ONAF) and indoor dry-type cast resin distribution & power transformers equipped with On-Load Tap Changers (OLTC) and RTCC panels.',
    image: ASSETS.pillarHighVoltage,
    icon: 'ev_station',
    features: [
      'BIS Level-2 / Star-Rated low-loss CRGO core',
      'Automatic On-Load Tap Changer (OLTC) & AVR',
      'Buchholz relay, OTI/WTI & PRV safety devices',
      'Complete oil BDV filtration & ratio test reports'
    ]
  },
  {
    id: 'eq-vcb-rmu-switchgear',
    name: '11kV / 33kV VCB & GIS Ring Main Units',
    category: 'HT Switchgear',
    voltageRating: '11kV – 33kV',
    capacityRange: '630A – 2500A (25kA / 31.5kA)',
    standard: 'IEC 62271-100 / 200',
    description: 'Horizontal draw-out Vacuum Circuit Breaker (VCB) panels and compact SF6/Dry-Air Ring Main Units (RMU) with numerical overcurrent and earth-fault relays.',
    image: ASSETS.transmissionBg,
    icon: 'electrical_services',
    features: [
      'Internal arc classified (IAC AFLR) metal-clad enclosure',
      'Numerical protection relays (IDMT 50/51, 50N/51N)',
      'Motorized spring-charging for SCADA remote trip/close',
      'resin-cast CT & PT metering chambers'
    ]
  },
  {
    id: 'eq-pcc-mcc-panels',
    name: 'Form-4b LT PCC, MCC & ACB Switchboards',
    category: 'LT Distribution',
    voltageRating: '415V / 690V AC',
    capacityRange: 'Up to 6300A Busbar, 65kA',
    standard: 'IEC 61439-1 & 2',
    description: 'CPRI type-tested Power Control Centers (PCC) and intelligent Motor Control Centers (MCC) with draw-out Air Circuit Breakers (ACB), VFDs, and soft starters.',
    image: ASSETS.project1,
    icon: 'dns',
    features: [
      'Form 4b compartmentalization with tinned copper busbars',
      'Draw-out ACBs & MCCBs with microprocessor LSIG protection',
      'VFD / Star-Delta / Soft-Starter motor feeder buckets',
      'RS485 Modbus / Ethernet EMS energy meters'
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
      'Low voltage drop & superior heat dissipation housing'
    ]
  },
  {
    id: 'eq-apfc-harmonic',
    name: 'Thyristor APFC & Harmonic Filter Banks',
    category: 'Power Quality',
    voltageRating: '415V / 440V 3-Phase',
    capacityRange: '50 kVAR – 2000 kVAR',
    standard: 'IEC 60831 / IEEE 519',
    description: 'Real-time zero-crossing thyristor-switched Automatic Power Factor Correction (APFC) panels with 7% / 14% copper-wound detuned harmonic reactors.',
    image: ASSETS.pillarTesting,
    icon: 'insights',
    features: [
      'Maintains 0.99+ lag power factor to eliminate penalties',
      'Heavy-duty cylindrical / APP MPP gas-filled capacitors',
      '7% & 14% detuned iron-core harmonic blocking reactors',
      '12-stage / 16-stage intelligent PID APFC controller'
    ]
  },
  {
    id: 'eq-solar-inverters-pv',
    name: 'Tier-1 Bifacial PV & Central/String Inverters',
    category: 'Solar EPC Hardware',
    voltageRating: '1500V DC / 415V–800V AC',
    capacityRange: '10 kW – 5 MWp Blocks',
    standard: 'IEC 61215 / IEC 62109',
    description: 'N-Type TOPCon bifacial solar modules paired with IP66 multi-MPPT string inverters, ACCombiner boxes, and bidirectional ABT net-metering kiosks.',
    image: ASSETS.pillarSolar,
    icon: 'solar_power',
    features: [
      '550Wp–585Wp N-Type Bifacial Dual-Glass PV Modules',
      '98.8% peak efficiency string inverters with AFCI protection',
      'DC & AC Type-2 Surge Protection Devices (SPD)',
      'Zero-export & DG-PV fuel-save controller integration'
    ]
  },
  {
    id: 'eq-testing-diagnostics',
    name: 'Primary Injection, Hi-Pot & Thermal Diagnostics',
    category: 'Testing Apparatus',
    voltageRating: 'Up to 110kV Diagnostic',
    capacityRange: '5kV / 10kV IR & 80kV BDV',
    standard: 'CEA / IS 1885 / NETA',
    description: 'NABL-calibrated electrical testing fleet including digital insulation resistance meggers, VLF Hi-Pot kits, secondary relay injectors, and Fluke thermal cameras.',
    image: ASSETS.aboutExecution,
    icon: 'troubleshoot',
    features: [
      '5kV / 10kV Digital PI & DAR Insulation Megger Testers',
      '3-Phase Secondary Relay Test Kit & Breaker Timer',
      '60kV / 80kV Automatic Transformer Oil BDV Tester',
      'High-resolution Infrared Thermography & Earth Clamp'
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
      'KPTCL/BESCOM approved HT Trivector Tod Metering Cubicle',
      'Gang Operated Air Break (GOAB) Isolators with Earth Switch',
      'Station-class Polymeric Metal-Oxide Lightning Arresters',
      'Porcelain / Polymeric Disc & Pin Insulators with ACSR hardware'
    ]
  }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'peenya-substation',
    title: '33kV Substation & HT Panel Setup',
    category: 'industrial',
    tag: 'Manufacturing Facility',
    description: 'Turnkey design, supply, testing, and CEIG statutory clearance for a 2.5 MVA industrial manufacturing unit in Peenya Industrial Area.',
    location: 'Bengaluru Urban (Peenya)',
    status: 'Completed & Energized',
    image: ASSETS.project1,
    capacity: '2.5 MVA Connected Load',
    voltage: '33kV / 415V Step-Down',
    completionYear: '2023',
    clientVertical: 'Precision Machine Tool Industry',
    approvals: ['CEIG Bengaluru Clearance', 'BESCOM Power Sanction', 'KPTCL Feasibility']
  },
  {
    id: 'hosakote-solar',
    title: '1.2 MWp Rooftop Solar EPC',
    category: 'solar',
    tag: 'Commercial Logistics Hub',
    description: 'Captive solar power installation with high-efficiency bifacial modules and seamless Net Metering sync to the 11kV grid feeder.',
    location: 'Hosakote Industrial Corridor',
    status: 'Generating Clean Power',
    image: ASSETS.project2,
    capacity: '1,200 kWp (1.2 MWp)',
    voltage: '11kV Net-Metered Sync',
    completionYear: '2024',
    clientVertical: 'Cold Chain Warehousing & Logistics',
    approvals: ['BESCOM Net Metering Approval', 'KERC Open Access / Grid Parallel', 'CEIG Solar Clearance']
  },
  {
    id: 'bidadi-pharma',
    title: 'Cleanroom LT Distribution & APFC',
    category: 'commercial',
    tag: 'Pharmaceutical Plant',
    description: 'Complete cleanroom electrical wiring, flameproof enclosures, harmonic filters, and power factor improvement to 0.99 unity.',
    location: 'Bidadi Industrial Area',
    status: 'Under Full-Year AMC',
    image: ASSETS.project3,
    capacity: '1.8 MVA with 800 kVAR APFC',
    voltage: '415V Three Phase 50Hz',
    completionYear: '2024',
    clientVertical: 'Sterile Injectable Formulations',
    approvals: ['CEIG Safety Certification', 'Class 10,000 Cleanroom Electrical Protocol', 'Factory Directorate Pass']
  },
  {
    id: 'bommasandra-automotive',
    title: '66kV / 11kV In-Plant Switching Yard',
    category: 'industrial',
    tag: 'Automotive OEM',
    description: 'Dual feeder 66kV transmission tapping with double busbar arrangement and redundant 10 MVA power transformers for robotics stamping line.',
    location: 'Bommasandra Industrial Area',
    status: 'Completed & Energized',
    image: ASSETS.pillarHighVoltage,
    capacity: '10 MVA Redundant',
    voltage: '66kV / 11kV Grid',
    completionYear: '2023',
    clientVertical: 'Electric Vehicle Chassis Manufacturer',
    approvals: ['KPTCL Grid Interconnection', 'CEIG Super Grade Sanction', 'BESCOM Tariff Allocation']
  },
  {
    id: 'mysuru-techpark-solar',
    title: '750 kWp Solar Carport & Building PV',
    category: 'solar',
    tag: 'IT Software Campus',
    description: 'Architectural solar carport with integrated EV charging infrastructure and synchronized rooftop PV arrays supplying 40% of daytime baseload.',
    location: 'Mysuru IT Park (Hebbal)',
    status: 'Generating Clean Power',
    image: ASSETS.pillarSolar,
    capacity: '750 kWp + 120kW EV Hub',
    voltage: '415V Synchronized Grid',
    completionYear: '2023',
    clientVertical: 'Enterprise Technology Campus',
    approvals: ['CESC Mysuru Net Metering', 'CEIG Structural & Electrical Pass']
  },
  {
    id: 'dabaspet-foundry',
    title: 'Electric Arc Furnace HT Substation & Capacitor Bank',
    category: 'industrial',
    tag: 'Heavy Engineering',
    description: 'Heavy duty vacuum switchgear, dry cast resin rectifiers, harmonic detention reactors, and dedicated underground 11kV cable duct bank.',
    location: 'Dabaspet Industrial Area',
    status: 'Completed & Energized',
    image: ASSETS.aboutExecution,
    capacity: '5.0 MVA High Surge',
    voltage: '11kV Dedicated Feeder',
    completionYear: '2022',
    clientVertical: 'Ferrous Casting & Forging',
    approvals: ['BESCOM Dedicated Express Feeder Sanction', 'CEIG Industrial Safety Certificate']
  }
];

export const ESCOMS = [
  { name: 'BESCOM', region: 'Bengaluru Electricity Supply Company' },
  { name: 'MESCOM', region: 'Mangalore Electricity Supply Company' },
  { name: 'HESCOM', region: 'Hubli Electricity Supply Company' },
  { name: 'GESCOM', region: 'Gulbarga Electricity Supply Company' },
  { name: 'CESC', region: 'Chamundeshwari Electricity Supply Corp (Mysuru)' },
];
