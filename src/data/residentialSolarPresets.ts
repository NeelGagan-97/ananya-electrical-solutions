export type SolarSystemCapacityId = '3kwp' | '5kwp' | '8kwp' | '10kwp';
export type SolarViewMode = 'isometric' | 'top' | 'side' | 'exploded';
export type SolarOperatingModeId = 'sunny' | 'cloudy' | 'night' | 'grid_failure' | 'high_load';
export type WalkthroughStationId =
  | 'gate'
  | 'living_room'
  | 'utility_wall'
  | 'stair_landing'
  | 'terrace_entry'
  | 'solar_south_row'
  | 'solar_north_la';

export interface SolarSystemPreset {
  id: SolarSystemCapacityId;
  label: string;
  capacityKw: number;
  moduleCount: number;
  moduleWp: number;
  rows: number;
  colsPerRow: number;
  stringsCount: number;
  modulesPerString: number;
  inverterRatingKw: number;
  supplyPhase: '1-Phase 230V AC' | '3-Phase 415V AC';
  roofAreaSqFt: number;
  tiltAngleDeg: number;
  nominalDcVoltage: number;
  maxDcCurrentPerString: number;
  avgDailyGenerationKwh: number;
  annualGenerationKwh: number;
  estimatedTurnkeyCostInr: number;
  pmSuryaGharSubsidyInr: number;
}

export interface SolarEquipmentComponent {
  id: string;
  index: number;
  name: string;
  shortLabel: string;
  category: 'PV Generation' | 'DC Protection & Cabling' | 'Power Conversion' | 'AC Protection & Distribution' | 'BESCOM Metering & Grid' | 'Safety & Earthing';
  purpose: string;
  electricalInputOutput: string;
  connectionDetails: string;
  defaultStatus: string;
  specs: { label: string; value: string }[];
  position3D: [number, number, number];
  explodedOffset: [number, number, number];
}

export interface SolarOperatingModeSpec {
  id: SolarOperatingModeId;
  code: string;
  title: string;
  subtitle: string;
  icon: string;
  defaultIrradiance: number; // W/m2
  defaultHomeLoadKw: number;
  defaultTimeHour: number; // 0 to 23
  gridOnline: boolean;
  summary: string;
  powerFlowBehavior: string;
}

export interface BescomProcessStep {
  stepNumber: number;
  phase: string;
  title: string;
  authority: string;
  description: string;
  deliverables: string[];
  statutoryRef: string;
}

export interface StreetViewWaypoint {
  id: WalkthroughStationId;
  stepNumber: number;
  title: string;
  zone: 'Ground Exterior' | 'Ground Interior' | 'Staircase' | 'Rooftop Terrace';
  subtitle: string;
  camPos: [number, number, number];
  lookAt: [number, number, number];
  markerPos: [number, number, number];
  nextStation?: WalkthroughStationId;
  prevStation?: WalkthroughStationId;
}

export const SOLAR_CAPACITY_PRESETS: Record<SolarSystemCapacityId, SolarSystemPreset> = {
  '3kwp': {
    id: '3kwp',
    label: '3 kWp Residential System',
    capacityKw: 3.3,
    moduleCount: 6,
    moduleWp: 550,
    rows: 2,
    colsPerRow: 3,
    stringsCount: 1,
    modulesPerString: 6,
    inverterRatingKw: 3.0,
    supplyPhase: '1-Phase 230V AC',
    roofAreaSqFt: 260,
    tiltAngleDeg: 14,
    nominalDcVoltage: 252,
    maxDcCurrentPerString: 13.1,
    avgDailyGenerationKwh: 13.5,
    annualGenerationKwh: 4920,
    estimatedTurnkeyCostInr: 195000,
    pmSuryaGharSubsidyInr: 78000,
  },
  '5kwp': {
    id: '5kwp',
    label: '5 kWp Residential System',
    capacityKw: 5.5,
    moduleCount: 10,
    moduleWp: 550,
    rows: 2,
    colsPerRow: 5,
    stringsCount: 2,
    modulesPerString: 5,
    inverterRatingKw: 5.0,
    supplyPhase: '3-Phase 415V AC',
    roofAreaSqFt: 420,
    tiltAngleDeg: 14,
    nominalDcVoltage: 420,
    maxDcCurrentPerString: 13.1,
    avgDailyGenerationKwh: 22.0,
    annualGenerationKwh: 8030,
    estimatedTurnkeyCostInr: 310000,
    pmSuryaGharSubsidyInr: 78000,
  },
  '8kwp': {
    id: '8kwp',
    label: '8 kWp Villa System',
    capacityKw: 8.8,
    moduleCount: 16,
    moduleWp: 550,
    rows: 2,
    colsPerRow: 8,
    stringsCount: 2,
    modulesPerString: 8,
    inverterRatingKw: 8.0,
    supplyPhase: '3-Phase 415V AC',
    roofAreaSqFt: 640,
    tiltAngleDeg: 14,
    nominalDcVoltage: 580,
    maxDcCurrentPerString: 13.2,
    avgDailyGenerationKwh: 35.2,
    annualGenerationKwh: 12848,
    estimatedTurnkeyCostInr: 465000,
    pmSuryaGharSubsidyInr: 78000,
  },
  '10kwp': {
    id: '10kwp',
    label: '10 kWp Large Residence System',
    capacityKw: 11.0,
    moduleCount: 20,
    moduleWp: 550,
    rows: 2,
    colsPerRow: 10,
    stringsCount: 2,
    modulesPerString: 10,
    inverterRatingKw: 10.0,
    supplyPhase: '3-Phase 415V AC',
    roofAreaSqFt: 800,
    tiltAngleDeg: 14,
    nominalDcVoltage: 640,
    maxDcCurrentPerString: 13.2,
    avgDailyGenerationKwh: 44.0,
    annualGenerationKwh: 16060,
    estimatedTurnkeyCostInr: 560000,
    pmSuryaGharSubsidyInr: 78000,
  },
};

export const SOLAR_EQUIPMENT_COMPONENTS: SolarEquipmentComponent[] = [
  {
    id: 'pv_modules',
    index: 1,
    name: 'Solar PV Modules (Mono PERC / N-Type TOPCon)',
    shortLabel: '01. Solar PV Modules',
    category: 'PV Generation',
    purpose: 'Converts incident solar irradiance (sunlight photons) directly into Direct Current (DC) electricity via the photovoltaic effect.',
    electricalInputOutput: 'Input: Solar Irradiance (0–1000 W/m²) → Output: 42V–49V DC per module (Connected in series strings up to 640V DC)',
    connectionDetails: 'Mounted on extruded aluminium rails at 14° true-south tilt using SS304 mid/end clamps; interconnected in series via IP68 MC4 connectors.',
    defaultStatus: 'GENERATING DC POWER',
    specs: [
      { label: 'Module Rating', value: '550 Wp Half-Cut Mono PERC / TOPCon' },
      { label: 'Module Efficiency', value: '21.4% Module Conversion Efficiency' },
      { label: 'Orientation & Tilt', value: 'True South • 14° Tilt (Bengaluru 13.06°N)' },
      { label: 'Compliance', value: 'MNRE ALMM Listed • IS 14286 / IEC 61215' },
    ],
    position3D: [0, 7.6, 0.2],
    explodedOffset: [0, 3.2, 0],
  },
  {
    id: 'dc_cables',
    index: 2,
    name: 'DC String Cables & UV Conduit Pathway',
    shortLabel: '02. DC String Cables',
    category: 'DC Protection & Cabling',
    purpose: 'Carries high-voltage DC string current from rooftop PV array junction boxes down the external riser shaft to the DC Combiner Box.',
    electricalInputOutput: 'Input: PV String Output (250V–640V DC) → Output: Low-loss DC feed to DCDB input terminals',
    connectionDetails: '1C × 4.0 sq.mm flexible tinned copper electron-beam cross-linked (XLPO) Red (+) and Black (-) solar DC cables routed in heavy-duty 25mm UV-stabilized UPVC conduit.',
    defaultStatus: 'ENERGIZED DC PATH',
    specs: [
      { label: 'Conductor Spec', value: '1C × 4 sq.mm Tinned Copper (Class 5)' },
      { label: 'Insulation Standard', value: 'EN 50618 / IEC 62930 (1500V DC Rated)' },
      { label: 'Voltage Drop', value: '< 1.0% across rooftop-to-inverter run' },
      { label: 'Mechanical Protection', value: 'Heavy-Duty UV-Stabilized UPVC Conduit & Tray' },
    ],
    position3D: [-4.6, 5.8, 1.2],
    explodedOffset: [-2.4, 1.8, 0.5],
  },
  {
    id: 'dcdb',
    index: 3,
    name: 'DC Combiner / Distribution Box (DCDB)',
    shortLabel: '03. DC Combiner Box (DCDB)',
    category: 'DC Protection & Cabling',
    purpose: 'Houses DC string overcurrent fuses, DC surge arrestors, and DC disconnection switch in a weatherproof IP65 flame-retardant enclosure.',
    electricalInputOutput: 'Input: 1 or 2 PV DC Strings → Output: Protected DC feed to Solar String Inverter MPPT ports',
    connectionDetails: 'Wall-mounted at utility elevation between rooftop DC conduit drop and grid-connected solar inverter.',
    defaultStatus: 'PROTECTED / NORMAL',
    specs: [
      { label: 'Enclosure Rating', value: 'IP65 Polycarbonate UV-Resistant Box' },
      { label: 'System Voltage', value: 'Up to 1000V DC Nominal' },
      { label: 'Internal Bus', value: 'Finger-safe DIN rail & MC4 gland entries' },
      { label: 'Standard', value: 'IEC 61439-2 / IS 8623 Compliant' },
    ],
    position3D: [-5.35, 2.55, 1.6],
    explodedOffset: [-3.2, 0.6, 1.2],
  },
  {
    id: 'string_fuses',
    index: 4,
    name: '1000V DC gPV String Fuses',
    shortLabel: '04. DC String Fuses',
    category: 'DC Protection & Cabling',
    purpose: 'Protects PV modules and string cables against reverse current faults and overcurrent conditions.',
    electricalInputOutput: 'Input: Positive (+) & Negative (-) PV String Leads → Output: Fused DC Bus to DC Isolator',
    connectionDetails: 'Installed in touch-safe DIN-rail cylindrical fuse holders inside the DCDB on both positive and negative poles.',
    defaultStatus: 'INTACT (15A gPV)',
    specs: [
      { label: 'Fuse Rating', value: '15A, 1000V DC Cylindrical (10×38mm)' },
      { label: 'Utilization Category', value: 'gPV (Photovoltaic String Protection)' },
      { label: 'Breaking Capacity', value: '30 kA DC Fault Interruption' },
      { label: 'Standard', value: 'IEC 60269-6 Solar Fuse Standard' },
    ],
    position3D: [-5.35, 2.78, 2.15],
    explodedOffset: [-4.1, 1.1, 1.8],
  },
  {
    id: 'dc_spd',
    index: 5,
    name: 'DC Surge Protection Device (DC SPD)',
    shortLabel: '05. DC SPD (Type-2)',
    category: 'DC Protection & Cabling',
    purpose: 'Diverts induced lightning surges and high-voltage DC switching transients safely to the dedicated earthing grid before they reach the inverter MPPT electronics.',
    electricalInputOutput: 'Connected in parallel across DC (+), DC (-), and Protective Earth (PE) bus inside DCDB',
    connectionDetails: '3-module Y-configuration pluggable varistor cartridge with visual green/red thermal disconnect flag.',
    defaultStatus: 'HEALTHY (GREEN FLAG)',
    specs: [
      { label: 'SPD Type', value: 'Type-2 Solar PV Surge Arrestor' },
      { label: 'Max Continuous Voltage', value: '1000V DC (Ucpv)' },
      { label: 'Discharge Current', value: 'In = 20 kA / Imax = 40 kA (8/20 µs)' },
      { label: 'Earth Termination', value: '1C × 6 sq.mm Cu to DC Earth Pit' },
    ],
    position3D: [-5.35, 2.35, 2.15],
    explodedOffset: [-4.1, 0.2, 1.8],
  },
  {
    id: 'dc_isolator',
    index: 6,
    name: 'Load-Break Rotary DC Isolator Switch',
    shortLabel: '06. DC Isolator',
    category: 'DC Protection & Cabling',
    purpose: 'Provides manual, visible load-break mechanical isolation of the high-voltage DC PV array during inverter maintenance or emergency shutdown.',
    electricalInputOutput: 'Input: Protected DC from DCDB → Output: Isolated DC input to Solar Inverter MPPT terminals',
    connectionDetails: '4-pole series-bridged rotary cam DC switch with arc-chute suppression chambers and padlockable ON/OFF handle.',
    defaultStatus: 'CLOSED (ON)',
    specs: [
      { label: 'Rated Current', value: '32A @ 1000V DC (Utilization DC-21B)' },
      { label: 'Arc Extinction', value: 'Magnetic blow-out (< 3ms extinguish)' },
      { label: 'Safety Lock', value: 'Padlockable in OFF position for LOTO' },
      { label: 'Standard', value: 'IEC 60947-3 Annex D PV Switch' },
    ],
    position3D: [-5.35, 2.55, 0.95],
    explodedOffset: [-3.4, 0.6, 0.4],
  },
  {
    id: 'solar_inverter',
    index: 7,
    name: 'Grid-Connected MPPT Solar Inverter',
    shortLabel: '07. Grid-Tied Solar Inverter',
    category: 'Power Conversion',
    purpose: 'Performs Maximum Power Point Tracking (MPPT), converts variable DC power from solar modules into grid-synchronized 230V/415V 50Hz pure sine-wave AC power, and enforces anti-islanding safety.',
    electricalInputOutput: 'Input: 180V–850V DC from PV Array → Output: 230V/415V 50Hz Synchronized AC Power',
    connectionDetails: 'Mounted at eye-level on shaded ventilated utility wall with aluminium die-cast heatsink, OLED telemetry screen, and RS485/Wi-Fi smart logger.',
    defaultStatus: 'MPPT TRACKING & GRID SYNCED',
    specs: [
      { label: 'Peak Efficiency', value: '98.4% Max / 97.9% Euro Efficiency' },
      { label: 'MPPT Trackers', value: 'Dual Independent MPPT Inputs' },
      { label: 'Anti-Islanding', value: 'Active Frequency Drift (< 0.2s Trip per IEC 62116)' },
      { label: 'Ingress & Cooling', value: 'IP65 Outdoor Rated • Natural Convection' },
    ],
    position3D: [-5.35, 1.95, 0.0],
    explodedOffset: [-3.6, 0.0, 0.0],
  },
  {
    id: 'acdb',
    index: 8,
    name: 'AC Distribution Box (ACDB)',
    shortLabel: '08. AC Distribution Box',
    category: 'AC Protection & Distribution',
    purpose: 'Receives AC power output from the solar inverter and provides AC overcurrent, earth-leakage, and surge protection before coupling to the building distribution system.',
    electricalInputOutput: 'Input: Inverter AC Output (230V/415V 50Hz) → Output: Protected AC line to Generation Meter & MDB',
    connectionDetails: 'Wired with 4 sq.mm / 6 sq.mm FRLS multi-strand copper armoured/conduit cable from inverter AC connector.',
    defaultStatus: 'ENERGIZED AC',
    specs: [
      { label: 'Enclosure', value: 'IP65 Thermoplastic Weatherproof Enclosure' },
      { label: 'Bus Rating', value: '415V / 230V AC, 50Hz, 40A Rated' },
      { label: 'Internal Devices', value: 'AC MCB + 30mA RCCB + Type-2 AC SPD' },
      { label: 'Standard', value: 'IS 8623 / IEC 61439-3' },
    ],
    position3D: [-5.35, 1.85, -1.2],
    explodedOffset: [-3.2, -0.3, -1.0],
  },
  {
    id: 'ac_spd',
    index: 9,
    name: 'AC Surge Protection Device (AC SPD)',
    shortLabel: '09. AC SPD (Type-2)',
    category: 'AC Protection & Distribution',
    purpose: 'Clamps voltage spikes and grid-side switching or lightning transients coming from the utility network or internal inductive loads.',
    electricalInputOutput: 'Connected across Phase(s), Neutral, and AC Earth Bus inside the ACDB',
    connectionDetails: 'DIN-rail mounted Type-2 MOV/GDT surge arrestor module with thermal status indicator window.',
    defaultStatus: 'ACTIVE PROTECTION',
    specs: [
      { label: 'Nominal Voltage', value: '230V / 415V AC (Uc = 275V/320V AC)' },
      { label: 'Surge Discharge', value: 'In = 20 kA / Imax = 40 kA (8/20 µs)' },
      { label: 'Voltage Protection Level', value: 'Up ≤ 1.5 kV' },
      { label: 'Standard', value: 'IEC 61643-11 Class II' },
    ],
    position3D: [-5.35, 2.08, -1.65],
    explodedOffset: [-4.1, 0.1, -1.6],
  },
  {
    id: 'ac_isolator',
    index: 10,
    name: 'AC Isolator Switch, MCB & RCCB',
    shortLabel: '10. AC Isolator & RCCB',
    category: 'AC Protection & Distribution',
    purpose: 'Provides positive AC disconnection for BESCOM/maintenance personnel and automatically trips on short-circuit, overload, or ≥30mA earth-leakage current.',
    electricalInputOutput: 'Input: ACDB Bus → Output: Isolated AC feeder to Solar Generation Meter & Consumer MDB',
    connectionDetails: 'C-Curve AC MCB paired in series with a 30mA residual current circuit breaker (RCCB) and lockable AC isolator.',
    defaultStatus: 'CLOSED (ON)',
    specs: [
      { label: 'MCB Rating', value: '25A / 32A C-Curve (10kA Breaking)' },
      { label: 'RCCB Sensitivity', value: '30mA Earth Leakage Trip (IS 12640)' },
      { label: 'Isolation Point', value: 'Accessible lockable AC disconnect per CEA norms' },
      { label: 'Compliance', value: 'CEA (Measures Relating to Safety) Regulations' },
    ],
    position3D: [-5.35, 1.62, -1.65],
    explodedOffset: [-4.1, -0.7, -1.6],
  },
  {
    id: 'mdb',
    index: 11,
    name: 'Consumer Main Distribution Board (MDB)',
    shortLabel: '11. Main Distribution Board',
    category: 'AC Protection & Distribution',
    purpose: 'Central interconnection point where generated solar AC power merges with the home electrical busbar—supplying household appliances first and routing surplus power to the BESCOM net meter.',
    electricalInputOutput: 'Inputs: Solar AC Feeder + BESCOM Grid Supply ↔ Outputs: Home Load Circuits (Lighting, Fans, TV, AC, Kitchen)',
    connectionDetails: '8-Way / 12-Way TPN Double-Door Metal Distribution Board with copper phase busbar, neutral link, and earth bar.',
    defaultStatus: 'SUPPLYING HOME LOADS',
    specs: [
      { label: 'Board Type', value: 'IS:8623 Double-Door Metallic SPN/TPN DB' },
      { label: 'Incomer Protection', value: '63A Main Isolator + 40A 30mA ELCB/RCCB' },
      { label: 'Outgoing Ways', value: 'Dedicated MCBs for Lighting, Fan, TV & Split AC' },
      { label: 'Wiring Code', value: 'IS:732 FRLS Copper Concealed Conduit System' },
    ],
    position3D: [-5.35, 1.85, -2.5],
    explodedOffset: [-2.8, -0.3, -2.4],
  },
  {
    id: 'net_meter',
    index: 12,
    name: 'BESCOM Bidirectional Net Meter',
    shortLabel: '12. Bidirectional Net Meter',
    category: 'BESCOM Metering & Grid',
    purpose: 'Separately records electricity imported from BESCOM (when home load exceeds solar) and surplus solar electricity exported to the BESCOM grid for monthly net-metering bill settlement.',
    electricalInputOutput: 'Port A: Consumer MDB Common Bus ↔ Port B: BESCOM 415V/230V Service Line (Bidirectional Import/Export)',
    connectionDetails: 'Sealed inside a tamper-proof BESCOM meter box at accessible ground-floor exterior wall with optical DLMS port.',
    defaultStatus: 'NET EXPORT / IMPORT LOGGING',
    specs: [
      { label: 'Meter Type', value: '4-Quadrant Bidirectional Static kWh Meter' },
      { label: 'Accuracy Class', value: 'Class 1.0 / 0.5s (IS 13779 / IS 16444)' },
      { label: 'Parameters Logged', value: 'Import kWh, Export kWh, Net kWh, MD, Voltage, PF' },
      { label: 'Approval', value: 'BESCOM MT Lab Tested & Lead-Sealed' },
    ],
    position3D: [-5.35, 1.85, -3.55],
    explodedOffset: [-3.2, -0.3, -3.6],
  },
  {
    id: 'generation_meter',
    index: 13,
    name: 'Gross Solar Generation Meter',
    shortLabel: '13. Solar Generation Meter',
    category: 'BESCOM Metering & Grid',
    purpose: 'Measures 100% of the gross AC electrical energy produced by the solar inverter prior to household self-consumption.',
    electricalInputOutput: 'Input: ACDB Output → Output: Point of Common Coupling at Consumer Main Distribution Board',
    connectionDetails: 'Unidirectional static AC energy meter mounted adjacent to the ACDB and MDB.',
    defaultStatus: 'RECORDING GROSS SOLAR kWh',
    specs: [
      { label: 'Accuracy Class', value: 'Class 1.0 Static Watt-Hour Meter' },
      { label: 'Display', value: 'Backlit LCD with Cumulative kWh & Instant kW' },
      { label: 'Purpose', value: 'Tracks total solar yield & PR (Performance Ratio)' },
      { label: 'Standard', value: 'IS 13779 / CEA Metering Regulations' },
    ],
    position3D: [-5.35, 2.38, -2.5],
    explodedOffset: [-3.6, 0.7, -2.5],
  },
  {
    id: 'earthing_system',
    index: 14,
    name: '3-Pit Chemical Earthing System (DC, AC & LA)',
    shortLabel: '14. Earthing Electrodes (3 Pits)',
    category: 'Safety & Earthing',
    purpose: 'Provides three dedicated low-resistance fault-current dissipation paths into the earth: Pit-1 for DC Module Frames & DC SPD, Pit-2 for Inverter/ACDB/MDB Body, and Pit-3 isolated for the Lightning Arrestor.',
    electricalInputOutput: 'Input: Equipment Protective Earth (PE) & Surge Conductors → Output: Ground Mass (< 1.0 Ohm Resistance)',
    connectionDetails: 'Three 3-meter copper-bonded/GI pipe electrodes filled with bentonite-charcoal-salt compound, interlinked below grade via 25×3mm GI strip.',
    defaultStatus: 'EARTH RESISTANCE < 0.8 Ω',
    specs: [
      { label: 'Configuration', value: '3 Independent Earth Pits (DC + AC + Lightning)' },
      { label: 'Electrode Spec', value: '50mm Dia × 3.0m GI / Copper-Bonded Electrode' },
      { label: 'Earth Continuity', value: '25×3mm Hot-Dip GI Strip & 6 sq.mm Green Cu' },
      { label: 'Standard', value: 'IS 3043 Code of Practice for Earthing' },
    ],
    position3D: [-6.6, 0.18, 0.2],
    explodedOffset: [-4.8, -1.2, 0.2],
  },
  {
    id: 'lightning_protection',
    index: 15,
    name: 'Rooftop Lightning Protection System (LA)',
    shortLabel: '15. Lightning Arrestor (LA)',
    category: 'Safety & Earthing',
    purpose: 'Intercepts direct atmospheric lightning strikes above the terrace using an elevated air-termination spike and channels the strike current safely down an isolated exterior conductor to the dedicated LA earth pit.',
    electricalInputOutput: 'Input: Atmospheric Lightning Discharge → Output: Dedicated LA Earth Electrode (Pit-3)',
    connectionDetails: 'Mounted on a 2.5m GI mast on the highest staircase mumty roof; down-conductor routed on insulated standoffs without touching PV frames.',
    defaultStatus: 'CONE OF PROTECTION ACTIVE',
    specs: [
      { label: 'Air Terminal', value: '5-Spike Pure Copper / ESE Franklin Rod Arrestor' },
      { label: 'Protection Radius', value: 'Covers entire rooftop PV array (45°/60° Cone)' },
      { label: 'Down Conductor', value: '25×3mm GI Strip with Test Link Box' },
      { label: 'Standard', value: 'IS/IEC 62305 Lightning Protection Standard' },
    ],
    position3D: [3.2, 9.6, -2.4],
    explodedOffset: [2.4, 3.8, -1.8],
  },
  {
    id: 'bescom_connection',
    index: 16,
    name: 'BESCOM Distribution Pole & Service Connection',
    shortLabel: '16. BESCOM Grid Connection',
    category: 'BESCOM Metering & Grid',
    purpose: 'Connects the residential consumer installation to the local BESCOM 415V/230V LT distribution network for seamless power import and net-metered surplus solar export.',
    electricalInputOutput: 'BESCOM 415V 3-Phase / 230V 1-Phase Overhead LT Line ↔ Weatherproof Aerial Fuse Cutout ↔ Armoured Service Cable to Bidirectional Net Meter',
    connectionDetails: '9-meter prestressed concrete (PSC) BESCOM distribution pole with 4-wire LT insulators, street luminaire, and weatherproof service cable.',
    defaultStatus: 'GRID SYNCHRONIZED (50.0 Hz)',
    specs: [
      { label: 'Utility Discom', value: 'BESCOM (Bangalore Electricity Supply Co. Ltd.)' },
      { label: 'Grid Voltage', value: '415V 3-Phase / 230V 1-Phase, 50.0 Hz ± 1%' },
      { label: 'Service Cable', value: '4C × 16 sq.mm Aluminium / Copper Armoured Cable' },
      { label: 'Interconnection', value: 'KERC Grid-Interactive Rooftop Solar Regulations' },
    ],
    position3D: [-9.2, 3.8, -3.55],
    explodedOffset: [-6.5, 0.8, -3.6],
  },
];

export const SOLAR_OPERATING_MODES: SolarOperatingModeSpec[] = [
  {
    id: 'sunny',
    code: 'MODE 1',
    title: 'SUNNY DAY',
    subtitle: 'Peak Generation & Net Export to BESCOM',
    icon: 'wb_sunny',
    defaultIrradiance: 920,
    defaultHomeLoadKw: 1.8,
    defaultTimeHour: 12.5,
    gridOnline: true,
    summary: 'Solar panels generate high DC power under clear Bengaluru midday sun. Household loads are supplied first; all surplus clean power is exported to the BESCOM grid through the bidirectional net meter.',
    powerFlowBehavior: 'PV Array → DCDB → Inverter → ACDB → MDB → Home Appliances (100% Solar) + Surplus Exported via Bidirectional Meter to BESCOM Grid.',
  },
  {
    id: 'cloudy',
    code: 'MODE 2',
    title: 'CLOUDY DAY',
    subtitle: 'Partial Solar + BESCOM Grid Supplement',
    icon: 'cloud',
    defaultIrradiance: 320,
    defaultHomeLoadKw: 2.4,
    defaultTimeHour: 14.0,
    gridOnline: true,
    summary: 'Passing monsoon clouds reduce solar irradiance. The inverter continues extracting maximum available power via MPPT while BESCOM grid seamlessly supplies the remaining household demand.',
    powerFlowBehavior: 'PV Array supplies partial load + BESCOM Grid imports only the deficit power through the Bidirectional Net Meter.',
  },
  {
    id: 'night',
    code: 'MODE 3',
    title: 'NIGHT',
    subtitle: 'Zero Solar • 100% BESCOM Grid Import',
    icon: 'dark_mode',
    defaultIrradiance: 0,
    defaultHomeLoadKw: 1.6,
    defaultTimeHour: 20.5,
    gridOnline: true,
    summary: 'Zero solar irradiance after sunset. The solar inverter enters low-power night standby mode, and all active household loads draw electricity from the BESCOM utility grid.',
    powerFlowBehavior: 'Solar Inverter Standby (0.00 kW) • BESCOM Pole → Bidirectional Net Meter (Import Mode) → MDB → Home Lighting, Fans, TV & AC.',
  },
  {
    id: 'grid_failure',
    code: 'MODE 4',
    title: 'GRID FAILURE',
    subtitle: 'Anti-Islanding Protection / Hybrid Backup',
    icon: 'warning',
    defaultIrradiance: 850,
    defaultHomeLoadKw: 1.5,
    defaultTimeHour: 11.5,
    gridOnline: false,
    summary: 'Simulates a BESCOM utility outage during daytime. Standard On-Grid inverters immediately trip within <0.2s (Anti-Islanding Protection per IEC 62116) so no power back-feeds onto utility lines where BESCOM linemen may be working. Toggle Hybrid BESS Mode to see isolated battery backup.',
    powerFlowBehavior: 'Standard On-Grid: Inverter Isolates (0 kW Export) for Grid Safety • Hybrid BESS Mode: Grid Contactor Opens & Solar + LiFePO4 Battery powers Home Loads.',
  },
  {
    id: 'high_load',
    code: 'MODE 5',
    title: 'HIGH HOME LOAD',
    subtitle: 'Heavy AC & Appliance Demand Balancing',
    icon: 'bolt',
    defaultIrradiance: 780,
    defaultHomeLoadKw: 5.4,
    defaultTimeHour: 13.5,
    gridOnline: true,
    summary: 'Multiple Split ACs, geysers, and kitchen appliances run simultaneously. All available rooftop solar generation is consumed inside the house immediately, reducing BESCOM grid import to only the remaining balance.',
    powerFlowBehavior: '100% of Solar Generation is self-consumed by Home Loads + Supplemental power is imported from BESCOM Grid.',
  },
];

export const BESCOM_NET_METERING_STEPS: BescomProcessStep[] = [
  {
    stepNumber: 1,
    phase: 'PHASE 01 • LOAD & ACCOUNT VERIFICATION',
    title: 'Consumer BESCOM RR Number & Sanctioned Load Check',
    authority: 'Consumer / Ananya Engineering Desk',
    description: 'Verify the latest BESCOM electricity bill, Account ID, RR Number, existing sanctioned load (kW), phase configuration (1-Phase vs 3-Phase), and shadow-free RCC terrace area.',
    deliverables: ['Recent BESCOM Bill Copy', 'Sanctioned Load Capacity Match', 'Shadow-Free Terrace Survey'],
    statutoryRef: 'KERC SRTPV Regulations & BESCOM Conditions of Supply',
  },
  {
    stepNumber: 2,
    phase: 'PHASE 02 • PORTAL APPLICATION',
    title: 'Online Registration on PM Surya Ghar / BESCOM Solar Portal',
    authority: 'MNRE National Portal & BESCOM RTS Portal',
    description: 'Submit the rooftop solar net-metering application online using the consumer BESCOM Account ID, proposed solar plant capacity (kWp), and property ownership documents.',
    deliverables: ['Application Acknowledgement Number', 'PM Surya Ghar Registration ID', 'Online Processing Fee Receipt'],
    statutoryRef: 'MNRE PM Surya Ghar: Muft Bijli Yojana / BESCOM SRTPV Portal',
  },
  {
    stepNumber: 3,
    phase: 'PHASE 03 • TECHNICAL FEASIBILITY',
    title: 'BESCOM Subdivision Technical Feasibility Approval (TFA)',
    authority: 'BESCOM Assistant Executive Engineer (AEE)',
    description: 'BESCOM verifies local distribution transformer (DTC) loading margin (<80–90% capacity) and feeder voltage profile, then issues official Technical Feasibility Approval.',
    deliverables: ['BESCOM Technical Feasibility Approval (TFA) Letter', 'Permitted Export Capacity (kWp)'],
    statutoryRef: 'BESCOM Subdivision O&M Office Verification',
  },
  {
    stepNumber: 4,
    phase: 'PHASE 04 • ENGINEERING DESIGN',
    title: 'SLD Preparation, Structure Design & MNRE ALMM Hardware Selection',
    authority: 'Ananya Electrical Solutions (Class-1 Licensed EPC)',
    description: 'Prepare site-specific Single-Line Diagram (SLD), wind-load certified hot-dip galvanized mounting structure layout, and select MNRE ALMM-listed PV modules and BIS-certified grid-tied inverter.',
    deliverables: ['Site-Specific SLD Drawing', 'ALMM Module & BIS Inverter Datasheets', 'Structural Layout Plan'],
    statutoryRef: 'MNRE ALMM Order & IS 875 Wind Load Code',
  },
  {
    stepNumber: 5,
    phase: 'PHASE 05 • ROOFTOP & ELECTRICAL INSTALLATION',
    title: 'Mechanical Erection, DC/AC Cabling, DCDB/ACDB & 3-Pit Earthing',
    authority: 'Ananya Licensed Supervisory & Wireman Team',
    description: 'Erect elevated GI mounting frames at 14° south tilt with waterproofing pedestals, wire UV-resistant EN 50618 DC strings, install DCDB, Inverter, ACDB, Lightning Arrestor, and 3 separate chemical earth pits.',
    deliverables: ['Rooftop PV Array & Conduit Routing', 'DCDB / Inverter / ACDB Termination', '3 Independent Earth Pits (DC, AC, LA)'],
    statutoryRef: 'IS 732, IS 3043 (Earthing) & IS/IEC 62305 (Lightning)',
  },
  {
    stepNumber: 6,
    phase: 'PHASE 06 • PRE-COMMISSIONING SAFETY TESTS',
    title: 'Insulation Resistance, Polarity, Earth Value & Anti-Islanding Checks',
    authority: 'Ananya Testing & Commissioning Engineers',
    description: 'Conduct open-circuit string voltage (Voc) test, DC/AC cable insulation megger test, earth electrode resistance verification (<1.0 Ω), and inverter anti-islanding trip verification (<0.2 seconds).',
    deliverables: ['String Voc & Isc Test Sheet', 'Earth Pit Resistance Certificate', 'Anti-Islanding Safety Verification'],
    statutoryRef: 'CEA (Technical Standards for Connectivity of Distributed Generation) Regulations',
  },
  {
    stepNumber: 7,
    phase: 'PHASE 07 • WORK COMPLETION REPORT',
    title: 'Submission of Work Completion Report (WCR) & Safety Drawings',
    authority: 'Ananya Class-1 Contractor → BESCOM / CEIG',
    description: 'Upload completed installation photographs, inverter serial numbers, module RFID/ALMM certificates, contractor license copy, and as-built Single Line Diagram on the portal.',
    deliverables: ['Signed Work Completion Report (WCR)', 'As-Built Electrical SLD', 'Class-1 Contractor Test Report'],
    statutoryRef: 'Karnataka State Electrical Inspectorate (CEIG) / BESCOM Norms',
  },
  {
    stepNumber: 8,
    phase: 'PHASE 08 • BIDIRECTIONAL METER TESTING',
    title: 'Net Meter Procurement & BESCOM MT Lab Calibration Sealing',
    authority: 'BESCOM Meter Testing (MT) Division',
    description: 'Procure a BESCOM-approved 4-quadrant bidirectional net meter (and gross generation meter where applicable) and submit it to the BESCOM Meter Testing Laboratory for accuracy calibration and sealing.',
    deliverables: ['BESCOM MT Lab Test Certificate', 'Sealed Bidirectional Net Meter'],
    statutoryRef: 'CEA (Installation and Operation of Meters) Regulations & IS 16444',
  },
  {
    stepNumber: 9,
    phase: 'PHASE 09 • PPA & JOINT INSPECTION',
    title: 'Net-Metering Agreement Execution & BESCOM Site Inspection',
    authority: 'Consumer & BESCOM Subdivision AEE / AE',
    description: 'Execute the Power Purchase / Net-Metering Interconnection Agreement on stamp paper. BESCOM engineers inspect earthing, accessible AC/DC isolation switches, and replace the consumer meter with the bidirectional net meter.',
    deliverables: ['Executed Net-Metering Agreement', 'Meter Replacement Mahazar / Report'],
    statutoryRef: 'KERC Net-Metering Tariff & Interconnection Framework',
  },
  {
    stepNumber: 10,
    phase: 'PHASE 10 • SYNCHRONIZATION & SUBSIDY',
    title: 'Grid Synchronization, Commissioning Certificate & Monthly Net Billing',
    authority: 'BESCOM / MNRE National Portal',
    description: 'Energize the AC/DC isolators, verify live power export on the bidirectional meter, receive the official BESCOM Commissioning Certificate, and trigger direct DBT subsidy disbursal (for eligible residential consumers).',
    deliverables: ['BESCOM Commissioning Certificate', 'Live Wi-Fi App Telemetry Handover', 'PM Surya Ghar DBT Subsidy Claim'],
    statutoryRef: 'BESCOM Commercial Billing & MNRE National Portal',
  },
];

export const STREET_VIEW_WAYPOINTS: StreetViewWaypoint[] = [
  {
    id: 'gate',
    stepNumber: 1,
    title: 'Main Entrance & BESCOM Service Pole',
    zone: 'Ground Exterior',
    subtitle: 'Inspect incoming BESCOM 415V/230V overhead service line & compound entrance',
    camPos: [-1.5, 1.75, 10.2],
    lookAt: [-2.2, 2.8, 0.0],
    markerPos: [-1.5, 0.08, 8.6],
    nextStation: 'living_room',
  },
  {
    id: 'living_room',
    stepNumber: 2,
    title: 'Ground Floor Living Area & Home Loads',
    zone: 'Ground Interior',
    subtitle: 'Operate Ceiling Fan [F], Lights [L], Smart TV [T] & Split AC [C] powered by rooftop solar',
    camPos: [-0.8, 1.75, 2.6],
    lookAt: [-0.8, 1.85, -2.5],
    markerPos: [-0.8, 0.22, 1.8],
    prevStation: 'gate',
    nextStation: 'utility_wall',
  },
  {
    id: 'utility_wall',
    stepNumber: 3,
    title: 'Inverter, DCDB, ACDB & BESCOM Net Meter Wall',
    zone: 'Ground Exterior',
    subtitle: 'Click DCDB, Solar Inverter, ACDB, MDB, Generation Meter, Net Meter & 3 Earth Pits',
    camPos: [-8.2, 1.85, -0.8],
    lookAt: [-5.35, 2.0, -0.8],
    markerPos: [-7.2, 0.08, -0.8],
    prevStation: 'living_room',
    nextStation: 'stair_landing',
  },
  {
    id: 'stair_landing',
    stepNumber: 4,
    title: 'Staircase Mid-Landing to Rooftop Terrace',
    zone: 'Staircase',
    subtitle: 'Climb the residential RCC staircase following the vertical DC solar conduit riser',
    camPos: [4.2, 3.85, 1.4],
    lookAt: [4.2, 5.8, -2.4],
    markerPos: [4.2, 3.15, 0.2],
    prevStation: 'utility_wall',
    nextStation: 'terrace_entry',
  },
  {
    id: 'terrace_entry',
    stepNumber: 5,
    title: 'Rooftop Terrace Landing & Parapet Wall',
    zone: 'Rooftop Terrace',
    subtitle: 'Step onto the waterproofed RCC roof slab and inspect the elevated GI mounting structure',
    camPos: [3.2, 7.95, 3.8],
    lookAt: [-0.8, 7.5, 0.0],
    markerPos: [3.0, 6.28, 3.2],
    prevStation: 'stair_landing',
    nextStation: 'solar_south_row',
  },
  {
    id: 'solar_south_row',
    stepNumber: 6,
    title: 'South Solar PV Row & Under-Panel DC Stringing',
    zone: 'Rooftop Terrace',
    subtitle: 'Inspect 14° south-tilted Mono PERC modules, aluminium rails, clamps & MC4 string cables',
    camPos: [-0.5, 7.95, 4.2],
    lookAt: [-0.5, 7.5, -0.8],
    markerPos: [-0.5, 6.28, 3.5],
    prevStation: 'terrace_entry',
    nextStation: 'solar_north_la',
  },
  {
    id: 'solar_north_la',
    stepNumber: 7,
    title: 'North Solar Array & Lightning Protection Mast',
    zone: 'Rooftop Terrace',
    subtitle: 'Inspect rear structural bracing, DC junction box & ESE Franklin Lightning Arrestor on mumty',
    camPos: [0.5, 7.95, -3.9],
    lookAt: [1.5, 8.2, 0.5],
    markerPos: [0.5, 6.28, -3.4],
    prevStation: 'solar_south_row',
  },
];
