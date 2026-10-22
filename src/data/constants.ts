import { ServiceItem, ProjectItem } from '../types';

export const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1WkK265QJPTlGss9X3HuHHeP_fEh6zg31s7D2Sea1YW2UADKQqcrNDJ9l9mW94oHiM4QGtywZKJt6lQUI-5C5Mu4sxo6SRNrr9jzHe2Wq_CEcg_U0xMBtXYluCiNzr8UXlsKXq0dL4rrzlX4OrTa2SmpmuQyyvs5Pa8MluHm03zGpv-Q9pTpdPNlMRx5X6fFoV47g4Aq3YWmmsEgTHpI7EabvrTkVP33CLrhfnnYIdEBgl8KfahOtwv3Jrw',
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
    specs: [
      'Thermographic infrared scans of busbars & joints',
      'Transformer oil testing (BDV, acidity, moisture)',
      'Scheduled breaker lubrication & contact servicing',
      'Dedicated emergency hotline with rapid mobilization'
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
