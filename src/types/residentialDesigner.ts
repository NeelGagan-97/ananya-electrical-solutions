export type MeasurementUnit = 'meters' | 'feet';

export type RoomType =
  | 'living'
  | 'master_bedroom'
  | 'bedroom_2'
  | 'kitchen'
  | 'bathroom'
  | 'balcony'
  | 'foyer'
  | 'custom';

export interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  x: number; // in meters
  z: number; // in meters
  width: number; // in meters (X dimension)
  length: number; // in meters (Z dimension)
  ceilingHeight: number; // in meters (default 3.0m)
  color: string;
}

export type OpeningType = 'door' | 'window';
export type OpeningSwing = 'inside_left' | 'inside_right' | 'outside_left' | 'outside_right';

export interface OpeningData {
  id: string;
  roomId: string;
  wallDirection: 'north' | 'south' | 'east' | 'west';
  type: OpeningType;
  offset: number; // distance from wall start in meters
  width: number; // in meters
  height: number; // in meters
  sillHeight: number; // in meters (0 for doors, ~0.9m for windows)
  swing?: OpeningSwing;
}

export type ElectricalPointType =
  | 'db'
  | 'switch_board_6a'
  | 'power_socket_16a'
  | 'combined_socket_6_16a'
  | 'downlight_led'
  | 'ceiling_fan'
  | 'ac_isolator'
  | 'geyser_point'
  | 'earth_pit'
  | 'junction_box';

export interface ElectricalPoint {
  id: string;
  type: ElectricalPointType;
  roomId: string;
  name: string;
  x: number; // in meters (world coordinate)
  y: number; // in meters (mounting height from finished floor)
  z: number; // in meters (world coordinate)
  circuitId: string;
  powerWatts: number;
  isOn: boolean;
  stateValue?: number; // e.g. fan speed 0, 1, 2, 3
  wallPlacement?: 'north' | 'south' | 'east' | 'west' | 'ceiling' | 'ground';
}

export interface CircuitDefinition {
  id: string;
  code: string; // C1, C2, C3, C4, C5, C6, PE
  name: string;
  wireType: string; // e.g., '1.5 sq.mm FRLS Copper'
  phaseColor: string;
  neutralColor: string;
  earthColor: string;
  mcbRating: string; // '6A Type-C', '16A Type-C', etc.
  conduitSize: '20mm' | '25mm';
  connectedPointIds: string[];
  maxCapacityWatts: number;
  description: string;
}

export interface ProjectMeta {
  projectName: string;
  customerName: string;
  location: string;
  contactPhone: string;
  date: string;
  unit: MeasurementUnit;
  plotWidth: number; // in meters
  plotLength: number; // in meters
  setbackFront: number;
  setbackRear: number;
  setbackLeft: number;
  setbackRight: number;
  floorHeight: number; // default 3.0m
  exteriorWallThickness: number; // default 0.23m (9")
  interiorWallThickness: number; // default 0.115m (4.5")
  supplyPhase: '1-phase 230V' | '3-phase 415V';
  sanctionedLoadKw: number;
  scope: {
    lightingAndFans: boolean;
    heavyAppliances: boolean;
    smartAutomation: boolean;
    surgeProtection: boolean;
    chemicalEarthing: boolean;
    solarRooftopReady: boolean;
  };
}

export interface ResidentialProject {
  id: string;
  meta: ProjectMeta;
  rooms: RoomData[];
  openings: OpeningData[];
  electricalPoints: ElectricalPoint[];
  circuits: CircuitDefinition[];
}

export interface BoqItem {
  id: string;
  category: 'Cables & Conductors' | 'Conduits & Enclosures' | 'Switchgear & Protection' | 'Modular Accessories' | 'Earthing & Grounding' | 'Installation & Chasing';
  itemCode: string;
  description: string;
  makeBrand: string;
  quantity: number;
  unit: string;
  unitRate: number; // in INR ₹
  amount: number;
}
