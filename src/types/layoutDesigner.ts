export type LayoutWorkflowType = 'new_layout' | 'existing_upgrade';

export type RoadType = 'main_spine_12m' | 'internal_9m' | 'cross_6m';

export interface InternalRoad {
  id: string;
  name: string;
  type: RoadType;
  widthMeters: number;
  curbWidthMeters: number;
  footpathWidthMeters: number;
  surfaceType: 'asphalt' | 'concrete_paver';
  startPoint: [number, number]; // [x, z] in meters
  endPoint: [number, number];   // [x, z] in meters
}

export type PlotFacing = 'north' | 'south' | 'east' | 'west';
export type PlotStatus = 'available' | 'allocated' | 'constructed';
export type VillaType = 'villa_modern' | 'contemporary_2fl' | 'traditional_bungalow';
export type ServiceConnectionStatus = 'connected' | 'pending' | 'disconnected';
export type ServiceRouteType = 'underground_conduit' | 'overhead_drop';

export interface PlotServiceConnection {
  serviceEntryPosition: [number, number]; // world [x, z]
  meterLocation: [number, number];        // world [x, z]
  dbLocation: [number, number];           // world [x, z]
  routeType: ServiceRouteType;
  routeWaypoints: [number, number][];     // path from Feeder Pillar to meter
  status: ServiceConnectionStatus;
  assignedFeederPillarId: string;
  assignedPhase: 'R' | 'Y' | 'B' | '1-Phase 230V' | '3-Phase 415V';
  serviceCableSpec: string;               // e.g. "4C x 16 sq.mm XLPE Armoured"
  calculatedDropVoltageLossPercent: number; // e.g. 0.8%
}

export interface ResidentialPlot {
  id: string;
  plotNumber: string; // e.g. "P-01"
  x: number;          // center or origin x in meters
  z: number;          // center or origin z in meters
  width: number;      // in meters (e.g. 9.14m = 30ft)
  length: number;     // in meters (e.g. 12.19m = 40ft)
  facing: PlotFacing;
  areaSqM: number;
  hasBuilding: boolean;
  buildingType: VillaType;
  status: PlotStatus;
  sanctionedLoadKw: number; // e.g. 5kW - 10kW per plot
  serviceConnection?: PlotServiceConnection;
  servicePillarId?: string; // Direct feeder pillar reference
  isExisting?: boolean;     // For upgrade diff workflow
}

export interface OpenSpace {
  id: string;
  name: string;
  type: 'park_green' | 'clubhouse' | 'utility_yard' | 'civic_amenity';
  x: number;
  z: number;
  width: number;
  length: number;
  color: string;
}

export type InfraComponentType =
  | 'package_substation'
  | 'feeder_pillar'
  | 'street_light_pole'
  | 'service_loop_box'
  | 'existing_overhead_pole'
  | 'pull_pit_chamber'
  | 'earth_pit_grid';

export type InfraLifecycleState = 'existing' | 'proposed' | 'removed' | 'proposed_new' | 'existing_to_remove';

export type LuminaireType = 'led_60w' | 'led_90w' | 'led_120w' | 'sodium_vapor_legacy' | 'solar_all_in_one';
export type StreetlightControlMethod = 'astronomical_timer' | 'photocell' | 'manual';

export interface ElectricalInfraComponent {
  id: string;
  name: string;
  type: InfraComponentType;
  x: number;
  z: number;
  capacity?: string; // e.g. "500 kVA 11kV/415V" or "6-Way 400A"
  status: InfraLifecycleState;
  connectedPlotIds: string[];
  // Streetlight specific
  poleHeightMeters?: number;
  luminaireType?: LuminaireType;
  nominalPowerWatts?: number;
  controlMethod?: StreetlightControlMethod;
  circuitId?: string;
  // Substation specific
  voltagePrimaryKv?: number;   // 11kV
  voltageSecondaryV?: number;  // 415V
  rmuType?: string;            // "3-Way SF6 Ring Main Unit (2x LBS + 1x CB)"
}

export type CableClass =
  | 'ht_11kv_underground'
  | 'lt_underground_armoured'
  | 'existing_overhead_conductor'
  | 'street_lighting_cable';

export type CableInstallationMethod =
  | 'direct_buried'
  | 'rcc_trench'
  | 'hdpe_dwc_duct'
  | 'overhead_catenary';

export interface CablingRoute {
  id: string;
  name: string;
  cableClass: CableClass;
  spec: string; // e.g. "11kV 3C x 300 sq.mm XLPE Al Armoured" or "1.1kV 3.5C x 240 sq.mm"
  waypoints: [number, number][]; // 2D path coordinates in meters
  lengthMeters: number;
  status: InfraLifecycleState;
  installationMethod?: CableInstallationMethod;
  sourceEquipmentId?: string;
  targetEquipmentId?: string;
  operatingVoltage?: string;
  ratedCurrentAmps?: number;
}

export interface NetworkValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  associatedId?: string;
}

export interface LayoutProjectMeta {
  projectName: string;
  developerName: string;
  location: string;
  surveyNo: string;
  workflow: LayoutWorkflowType;
  unit: 'meters' | 'feet';
  totalAreaSqM: number;
  totalAreaAcres: number;
  plotCount: number;
  targetLoadPerPlotKw: number;
  diversityFactor: number;
  totalEstimatedLoadKva: number;
  transformerRatingKva: number;
  date: string;
  isEnergized?: boolean; // For conceptual animated power flow
}

export interface ResidentialLayoutProject {
  id: string;
  meta: LayoutProjectMeta;
  boundary: [number, number][]; // Polygon vertices [x, z]
  roads: InternalRoad[];
  plots: ResidentialPlot[];
  openSpaces: OpenSpace[];
  infra: ElectricalInfraComponent[];
  cabling: CablingRoute[];
}

export interface LayoutBoqItem {
  id: string;
  category:
    | '11kV Substation & Switchgear'
    | 'Underground HT & LT Cables'
    | 'Feeder Distribution Pillars'
    | 'Street Lighting & Illumination'
    | 'Civil Trenching & Duct Banks'
    | 'Earthing & Safety Systems'
    | 'Residential Service Connections'
    | 'Statutory Approvals & Commissioning';
  itemCode: string;
  description: string;
  makeBrand: string;
  quantity: number;
  unit: string;
  unitRate: number; // in INR ₹
  amount: number;
  isMeasuredGeometry?: boolean; // True if calculated from exact 3D/CAD routing
}
