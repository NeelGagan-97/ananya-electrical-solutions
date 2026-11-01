import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type SmartRoomId = 'overview' | 'db' | 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'earth_pit';
export type SmartViewStage = 'finished' | 'cutaway' | 'construction';
export type AutomationScenarioId = 'welcome' | 'away' | 'movie' | 'night' | 'custom';

export interface SmartCircuitItem {
  id: string;
  code: string;
  name: string;
  phaseColor: string;
  hexColor: number;
  wireType: string;
  mcbRating: string;
  conduitSize: string;
  description: string;
}

export const SMART_HOME_CIRCUITS: SmartCircuitItem[] = [
  {
    id: 'ALL',
    code: 'ALL-BUS',
    name: 'All Power & KNX Automation Loops',
    phaseColor: '#38bdf8',
    hexColor: 0x38bdf8,
    wireType: 'FRLS Copper + 2×2×0.8mm KNX Bus',
    mcbRating: '63A TPN + 30mA RCCB',
    conduitSize: '25mm Heavy PVC',
    description: 'Complete concealed ceiling grid showing 230V FRLS power radials alongside screened KNX/DALI automation bus.'
  },
  {
    id: 'CKT-L1',
    code: 'CKT-L1',
    name: 'Living & Dining DALI Lighting Loop',
    phaseColor: '#ef4444',
    hexColor: 0xef4444,
    wireType: '3C × 1.5 sq.mm FRLS + DALI Bus',
    mcbRating: '10A SP MCB (Curve B)',
    conduitSize: '20mm Rigid PVC',
    description: 'Feeds tunable-white cove LEDs, COB spotlights, and 5-speed BLDC smart ceiling fan in the living zone.'
  },
  {
    id: 'CKT-L2',
    code: 'CKT-L2',
    name: 'Master Bedroom & Wet-Zone Lighting',
    phaseColor: '#f59e0b',
    hexColor: 0xf59e0b,
    wireType: '3C × 1.5 sq.mm FRLS Copper',
    mcbRating: '10A SP MCB + 10mA RCCB',
    conduitSize: '20mm Rigid PVC',
    description: 'Supplies circadian bedroom lighting, night-path mmWave radar sensor, and IP65 bathroom mirror vanity.'
  },
  {
    id: 'CKT-P1',
    code: 'CKT-P1',
    name: 'HVAC Split ACs, Kitchen & Geyser Radials',
    phaseColor: '#3b82f6',
    hexColor: 0x3b82f6,
    wireType: '3C × 4.0 sq.mm FRLS Copper',
    mcbRating: '20A SP RCBO (30mA)',
    conduitSize: '25mm Heavy PVC',
    description: 'Dedicated high-load radial feeders for Living 2.0T AC, Bedroom 1.5T AC, 16A Kitchen Hub, and 20A Geyser.'
  },
  {
    id: 'CKT-A1',
    code: 'KNX-BUS',
    name: 'KNX Touch Panels, Curtains & PoE Security',
    phaseColor: '#10b981',
    hexColor: 0x10b981,
    wireType: '2×2×0.8mm EIB/KNX Screened + CAT6A',
    mcbRating: '6A SP MCB (UPS Backed)',
    conduitSize: '20mm Segregated PVC',
    description: 'Low-voltage automation topology linking glass scene switchboards, Somfy curtain motors, biometric lock, and 4K PoE CCTV.'
  }
];

export interface SmartDeviceItem {
  id: string;
  name: string;
  room: 'living' | 'bedroom' | 'kitchen' | 'bathroom';
  category: 'lighting' | 'curtain' | 'electrical' | 'appliance' | 'security';
  protocol: string;
  powerRating: string;
  powerWatts: number;
  circuitId: string;
  cableSpec: string;
  breakerSpec: string;
  position: [number, number, number];
  description: string;
  isControllable: boolean;
}

export const SMART_HOME_DEVICES: SmartDeviceItem[] = [
  // Living Room
  {
    id: 'dev_living_lights',
    name: 'Living Room DALI Cove & Spot Array',
    room: 'living',
    category: 'lighting',
    protocol: 'DALI-2 / Tunable White (2700K–6500K)',
    powerRating: '64 W (8 × 8W COB + Strip)',
    powerWatts: 64,
    circuitId: 'CKT-L1',
    cableSpec: '3C × 1.5 sq.mm FRLS + 2C × 1.5mm DALI Bus',
    breakerSpec: '10A SP MCB (Curve B)',
    position: [-2.8, 2.55, 2.2],
    description: 'Recessed architectural false-ceiling perimeter LED cove paired with anti-glare dimmable COB downlights.',
    isControllable: true
  },
  {
    id: 'dev_living_curtain',
    name: 'Motorized Somfy Curtain Track (Living)',
    room: 'living',
    category: 'curtain',
    protocol: 'Zigbee 3.0 / Dry-Contact Relay',
    powerRating: '45 W Quiet Tubular Motor',
    powerWatts: 45,
    circuitId: 'CKT-A1',
    cableSpec: '3C × 1.5 sq.mm FRLS + CAT6 Control Drop',
    breakerSpec: '6A SP MCB',
    position: [-2.8, 2.1, 4.1],
    description: 'Silent motorized drapery track with touch-motion start, sun-sensor scheduling, and scene synchronization.',
    isControllable: true
  },
  {
    id: 'dev_living_switch',
    name: '8-Module Touch Glass Scene Switchboard',
    room: 'living',
    category: 'electrical',
    protocol: 'KNX Bus / Capacitive Touch Panel',
    powerRating: '1.2 W Bus Powered',
    powerWatts: 2,
    circuitId: 'CKT-A1',
    cableSpec: '2×2×0.8mm EIB/KNX Screened Green Cable',
    breakerSpec: '30mA RCCB + 640mA KNX PSU',
    position: [-0.1, 1.35, 3.2],
    description: 'Tempered glass capacitive wall plate with engraved scene icons (Welcome, Movie, Away, Night) and dimmer feedback.',
    isControllable: true
  },
  {
    id: 'dev_main_db',
    name: 'Smart TPN Distribution Board & KNX Gateway',
    room: 'living',
    category: 'electrical',
    protocol: 'KNX IP Router + Modbus Energy Meter',
    powerRating: '63A 415V 3-Phase Incomer',
    powerWatts: 15,
    circuitId: 'ALL',
    cableSpec: '4C × 16 sq.mm Armored Copper Incoming',
    breakerSpec: '63A FP MCB + 40A 30mA RCCB + Type-2 SPD',
    position: [-5.65, 1.65, 0.8],
    description: '12-Way TPN metal double-door enclosure housing DIN-rail dimming actuators, shutter relays, and per-phase CT energy meters.',
    isControllable: false
  },
  {
    id: 'dev_living_ac',
    name: 'Smart Inverter Split AC (Living 2.0 Ton)',
    room: 'living',
    category: 'appliance',
    protocol: 'Modbus / Wi-Fi IR Climate Bridge',
    powerRating: '1,680 W (5-Star Inverter)',
    powerWatts: 1680,
    circuitId: 'CKT-P1',
    cableSpec: '3C × 4.0 sq.mm FRLS Copper in 25mm PVC',
    breakerSpec: '20A SP MCB (Curve C)',
    position: [-5.55, 2.35, 2.5],
    description: 'Automated climate unit linked to room occupancy and curtain state for optimal thermal efficiency.',
    isControllable: true
  },
  {
    id: 'dev_living_fan',
    name: 'Smart BLDC Designer Ceiling Fan',
    room: 'living',
    category: 'appliance',
    protocol: 'RF / Zigbee 5-Speed Fan Controller',
    powerRating: '28 W Super-Efficient BLDC',
    powerWatts: 28,
    circuitId: 'CKT-L1',
    cableSpec: '3C × 1.5 sq.mm FRLS Copper',
    breakerSpec: '10A SP MCB',
    position: [-2.8, 2.45, 2.1],
    description: 'Brushless DC ceiling fan with step-less silent speed regulation integrated into wall touch panels.',
    isControllable: true
  },
  {
    id: 'dev_front_lock',
    name: 'Biometric Smart Mortise Door Lock & VDP',
    room: 'living',
    category: 'security',
    protocol: 'Zigbee 3.0 / Encrypted NFC & Fingerprint',
    powerRating: '12V DC PoE / Emergency USB-C',
    powerWatts: 12,
    circuitId: 'CKT-A1',
    cableSpec: 'CAT6A Shielded + 2C × 1.5 sq.mm 12V DC',
    breakerSpec: '6A SP MCB (UPS Backed)',
    position: [0.1, 1.35, 4.2],
    description: 'Main entrance smart lock with fingerprint, PIN, OTP access, auto-relock, and Away-Mode trigger.',
    isControllable: true
  },
  {
    id: 'dev_living_cctv',
    name: 'AI 4K PoE Dome CCTV & Motion Sensor',
    room: 'living',
    category: 'security',
    protocol: 'ONVIF PoE (IEEE 802.3af) + PIR',
    powerRating: '9.5 W via PoE Switch',
    powerWatts: 10,
    circuitId: 'CKT-A1',
    cableSpec: 'CAT6 Pure Copper UTP in Dedicated Conduit',
    breakerSpec: 'UPS Protected 6A Circuit',
    position: [-5.5, 2.6, 4.0],
    description: 'Wide-angle entryway surveillance camera paired with ceiling microwave/PIR intrusion detection.',
    isControllable: true
  },

  // Bedroom
  {
    id: 'dev_bedroom_lights',
    name: 'Master Bedroom Warm Cove & Reading Lights',
    room: 'bedroom',
    category: 'lighting',
    protocol: 'DALI-2 / Circadian Dimming (2200K–4000K)',
    powerRating: '42 W Total LED Load',
    powerWatts: 42,
    circuitId: 'CKT-L2',
    cableSpec: '3C × 1.5 sq.mm FRLS + DALI Pair',
    breakerSpec: '10A SP MCB',
    position: [-2.8, 2.55, -2.2],
    description: 'Glare-free warm bedside reading pendants and headboard cove strip programmed for circadian sleep cycles.',
    isControllable: true
  },
  {
    id: 'dev_bedroom_curtain',
    name: 'Motorized Blackout Curtain (Bedroom)',
    room: 'bedroom',
    category: 'curtain',
    protocol: 'KNX / Zigbee Dual-Track Motor',
    powerRating: '40 W Tubular Motor',
    powerWatts: 40,
    circuitId: 'CKT-A1',
    cableSpec: '4C × 1.5 sq.mm FRLS Copper',
    breakerSpec: '6A SP MCB',
    position: [-5.65, 2.1, -2.2],
    description: 'Automated sheer + 100% blackout dual curtain track with sunrise wake-up opening schedule.',
    isControllable: true
  },
  {
    id: 'dev_bedroom_switch',
    name: 'Bedside Two-Way Smart Touch Panel',
    room: 'bedroom',
    category: 'electrical',
    protocol: 'KNX / Scene Master ("Goodnight" Button)',
    powerRating: '1.0 W Bus Powered',
    powerWatts: 2,
    circuitId: 'CKT-A1',
    cableSpec: '2×2×0.8mm KNX Bus + 2.5 sq.mm Socket Loop',
    breakerSpec: '16A MCB + 30mA RCCB',
    position: [-1.4, 0.85, -3.9],
    description: 'Bedside glass panel with one-touch Night Mode, curtain control, and USB-C PD fast-charging outlet.',
    isControllable: true
  },
  {
    id: 'dev_bedroom_ac',
    name: 'Smart Sleep-Curve Split AC (1.5 Ton)',
    room: 'bedroom',
    category: 'appliance',
    protocol: 'Smart Climate Bridge (Modbus/Wi-Fi)',
    powerRating: '1,220 W Inverter Compressor',
    powerWatts: 1220,
    circuitId: 'CKT-P1',
    cableSpec: '3C × 4.0 sq.mm FRLS Copper',
    breakerSpec: '20A SP MCB',
    position: [-2.8, 2.35, -4.1],
    description: 'Automatically adjusts bedroom temperature by +1°C overnight during Night Mode to prevent over-cooling.',
    isControllable: true
  },
  {
    id: 'dev_bedroom_sensor',
    name: 'Ceiling mmWave Presence & Night-Path Sensor',
    room: 'bedroom',
    category: 'security',
    protocol: 'Zigbee 3.0 / 24GHz mmWave Radar',
    powerRating: '1.5 W (230V Recessed)',
    powerWatts: 2,
    circuitId: 'CKT-L2',
    cableSpec: '3C × 1.5 sq.mm FRLS',
    breakerSpec: '10A SP MCB',
    position: [-1.2, 2.68, -1.2],
    description: 'Detects micro-movements and triggers 10% warm under-bed pathway lighting when stepping out at night.',
    isControllable: true
  },

  // Kitchen
  {
    id: 'dev_kitchen_lights',
    name: 'Kitchen Task Counter & Island Linear LEDs',
    room: 'kitchen',
    category: 'lighting',
    protocol: 'DALI / 4000K High-CRI (CRI > 95)',
    powerRating: '48 W Linear Task Array',
    powerWatts: 48,
    circuitId: 'CKT-L1',
    cableSpec: '3C × 1.5 sq.mm FRLS Copper',
    breakerSpec: '10A SP MCB',
    position: [2.8, 2.55, 2.2],
    description: 'Shadow-free 4000K neutral-white counter task profiles and overhead dining pendant illumination.',
    isControllable: true
  },
  {
    id: 'dev_kitchen_sockets',
    name: '16A Smart Energy-Monitoring Power Hub',
    room: 'kitchen',
    category: 'electrical',
    protocol: 'Zigbee 3.0 / Current & Overload Relay',
    powerRating: '1,450 W Active Load (16A Max)',
    powerWatts: 1450,
    circuitId: 'CKT-P1',
    cableSpec: '3C × 4.0 sq.mm FRLS Copper',
    breakerSpec: '20A SP MCB + 30mA RCBO',
    position: [5.55, 1.25, 2.0],
    description: 'Heavy-duty 6A/16A smart sockets for microwave, oven, and dishwasher with live kWh telemetry and auto cut-off.',
    isControllable: true
  },
  {
    id: 'dev_kitchen_fridge',
    name: 'Connected Inverter Refrigerator & Hood',
    room: 'kitchen',
    category: 'appliance',
    protocol: 'Smart Plug Telemetry (UPS Essential Loop)',
    powerRating: '280 W Continuous / 1,400 W Peak',
    powerWatts: 280,
    circuitId: 'CKT-P1',
    cableSpec: '3C × 2.5 sq.mm FRLS Copper',
    breakerSpec: '16A SP MCB',
    position: [5.2, 1.1, 3.6],
    description: 'Remains powered on the essential inverter phase even when Away Mode disconnects non-essential loads.',
    isControllable: true
  },
  {
    id: 'dev_kitchen_smoke',
    name: 'Smart LPG Gas & Photoelectric Smoke Detector',
    room: 'kitchen',
    category: 'security',
    protocol: 'KNX / Zigbee Fire & Gas Interlock',
    powerRating: '2.0 W (24V / Battery Backed)',
    powerWatts: 2,
    circuitId: 'CKT-A1',
    cableSpec: '2C × 1.5 sq.mm Fire-Survival Armored Cable',
    breakerSpec: '6A SP MCB (Fire Loop)',
    position: [3.2, 2.68, 3.2],
    description: 'Triggers instant solenoid gas-valve shutoff, exhaust fan activation, and mobile alert upon leak detection.',
    isControllable: true
  },

  // Bathroom
  {
    id: 'dev_bathroom_lights',
    name: 'Anti-Fog Backlit Vanity Mirror & IP65 Spots',
    room: 'bathroom',
    category: 'lighting',
    protocol: 'IP65 Phase-Cut Dimmer + Demister Relay',
    powerRating: '36 W (IP65 Wet-Zone Rated)',
    powerWatts: 36,
    circuitId: 'CKT-L2',
    cableSpec: '3C × 1.5 sq.mm FRLS in Sealed PVC',
    breakerSpec: '10A SP MCB + 10mA High-Sensitivity RCCB',
    position: [2.8, 2.55, -2.2],
    description: 'Moisture-sealed IP65 ceiling downlights and touchless backlit vanity mirror with built-in defogger pad.',
    isControllable: true
  },
  {
    id: 'dev_bathroom_geyser',
    name: 'Smart 20A DP Geyser Controller & Water Heater',
    room: 'bathroom',
    category: 'appliance',
    protocol: '20A Double-Pole Smart Relay + Thermal Cutout',
    powerRating: '2,000 W Storage Water Heater',
    powerWatts: 2000,
    circuitId: 'CKT-P1',
    cableSpec: '3C × 4.0 sq.mm FRLS Copper',
    breakerSpec: '20A DP MCB + 30mA RCCB',
    position: [5.45, 2.15, -3.5],
    description: 'Scheduled morning water heating with automatic 30-minute safety shut-off and dry-run protection.',
    isControllable: true
  },
  {
    id: 'dev_bathroom_sensor',
    name: 'Ultrasonic Humidity & Occupancy Exhaust Control',
    room: 'bathroom',
    category: 'security',
    protocol: 'KNX / RH% Humidity & Presence Sensor',
    powerRating: '22 W Exhaust Fan Load',
    powerWatts: 22,
    circuitId: 'CKT-A1',
    cableSpec: '3C × 1.5 sq.mm FRLS',
    breakerSpec: '6A SP MCB',
    position: [2.8, 2.68, -3.6],
    description: 'Automatically turns on vanity lighting on entry and runs silent exhaust ventilation when humidity exceeds 70%.',
    isControllable: true
  }
];

export interface SmartHomeSimulationState {
  selectedRoom: SmartRoomId;
  viewStage: SmartViewStage;
  ceilingVisible: boolean;
  dbDoorOpen: boolean;
  activeCircuit: string;
  isAutoRotate: boolean;
  fanSpeed: number; // 0, 1, 2, 3
  scenario: AutomationScenarioId;
  selectedDeviceId: string;
  roomLights: {
    living: boolean;
    bedroom: boolean;
    kitchen: boolean;
    bathroom: boolean;
  };
  brightness: number; // 10 to 100
  curtains: {
    livingOpen: boolean;
    bedroomOpen: boolean;
  };
  appliances: {
    livingAc: boolean;
    livingFan: boolean;
    bedroomAc: boolean;
    kitchenPower: boolean;
    bathroomGeyser: boolean;
  };
  securityArmed: boolean;
  frontDoorLocked: boolean;
}

interface SmartHomeCanvasProps {
  simState: SmartHomeSimulationState;
  onSelectDevice: (deviceId: string) => void;
  onSelectRoom: (room: SmartRoomId) => void;
}

// Pre-allocated vectors outside animation loop to prevent GC
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _projVec = new THREE.Vector3();

const CAMERA_PRESETS: Record<SmartRoomId, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [-6.5, 9.5, 11.8], target: [0, 0.9, 0] },
  db: { pos: [-3.2, 2.2, 1.8], target: [-5.62, 1.6, 0.8] },
  living: { pos: [-2.6, 5.6, 8.0], target: [-2.8, 1.1, 2.2] },
  bedroom: { pos: [-6.8, 6.0, -6.5], target: [-2.8, 1.0, -2.2] },
  kitchen: { pos: [6.4, 5.8, 7.6], target: [2.8, 1.1, 2.2] },
  bathroom: { pos: [6.6, 6.0, -6.6], target: [2.8, 1.0, -2.2] },
  earth_pit: { pos: [-8.2, 3.2, 4.2], target: [-6.6, 0.2, 1.8] }
};

export const SmartHomeCanvas: React.FC<SmartHomeCanvasProps> = ({
  simState,
  onSelectDevice
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(simState);
  const [markerCoords, setMarkerCoords] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});

  useEffect(() => {
    stateRef.current = simState;
  }, [simState]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Matches ResidentialCanvas Slate Navy
    scene.fog = new THREE.FogExp2(0x0f172a, 0.022);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.2, 80);
    camera.position.set(...CAMERA_PRESETS.overview.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 2.5;
    controls.maxDistance = 26;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(...CAMERA_PRESETS.overview.target);

    let cameraTransitionActive = false;
    let lastRoomPreset: SmartRoomId = stateRef.current.selectedRoom;

    controls.addEventListener('start', () => {
      cameraTransitionActive = false;
    });

    // 4. Studio & Architectural Lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.82);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.65);
    sunLight.position.set(10, 18, 12);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(1024, 1024);
      const d = 11;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0004;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    // Per-room dynamic PointLights
    const livingLight = new THREE.PointLight(0xffedd5, 2.2, 8.5, 1.5);
    livingLight.position.set(-2.8, 2.5, 2.2);
    scene.add(livingLight);

    const bedroomLight = new THREE.PointLight(0xfde68a, 1.8, 7.5, 1.5);
    bedroomLight.position.set(-2.8, 2.5, -2.2);
    scene.add(bedroomLight);

    const kitchenLight = new THREE.PointLight(0xf0f9ff, 2.0, 8.0, 1.5);
    kitchenLight.position.set(2.8, 2.5, 2.2);
    scene.add(kitchenLight);

    const bathroomLight = new THREE.PointLight(0xe0f2fe, 1.6, 6.5, 1.5);
    bathroomLight.position.set(2.8, 2.5, -2.2);
    scene.add(bathroomLight);

    // 5. Build 4-Room Smart Apartment Model (11.6m x 8.6m)
    const homeGroup = new THREE.Group();
    scene.add(homeGroup);

    // Ground Grid & Base Plinth (matching ResidentialCanvas aesthetic)
    const gridHelper = new THREE.GridHelper(28, 28, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.23;
    scene.add(gridHelper);

    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75, metalness: 0.1 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.24, 10.4), plinthMat);
    plinth.position.set(0, -0.12, 0);
    plinth.receiveShadow = true;
    homeGroup.add(plinth);

    // 4 Room Floors
    const livingFloorMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.05 });
    const bedroomFloorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.38, metalness: 0.05 });
    const kitchenFloorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.08 });
    const bathroomFloorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.12 });

    const createRoomFloor = (x: number, z: number, mat: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.06, 4.1), mat);
      mesh.position.set(x, 0.03, z);
      mesh.receiveShadow = true;
      homeGroup.add(mesh);
    };
    createRoomFloor(-2.8, 2.15, livingFloorMat);
    createRoomFloor(-2.8, -2.15, bedroomFloorMat);
    createRoomFloor(2.8, 2.15, kitchenFloorMat);
    createRoomFloor(2.8, -2.15, bathroomFloorMat);

    // Architectural Walls (Dynamic materials for Finished / Cutaway / Pre-Plaster Chasing)
    const outerWallMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.38,
      roughness: 0.35,
      depthWrite: false
    });
    const innerWallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.55,
      metalness: 0.05
    });

    const addWall = (w: number, h: number, d: number, x: number, y: number, z: number, isOuter = false) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), isOuter ? outerWallMat : innerWallMat);
      m.position.set(x, y, z);
      m.castShadow = !isOuter;
      m.receiveShadow = true;
      homeGroup.add(m);
    };

    // Perimeter Walls (height 2.7m)
    addWall(11.6, 2.7, 0.18, 0, 1.35, -4.25, false); // Back wall solid cream like screenshot
    addWall(11.6, 2.7, 0.18, 0, 1.35, 4.25, true);   // Front cutaway wall
    addWall(0.18, 2.7, 8.6, -5.75, 1.35, 0, false);  // Left DB wall solid
    addWall(0.18, 2.7, 8.6, 5.75, 1.35, 0, true);    // Right cutaway wall

    // Internal Partition Walls with Doorways
    addWall(0.15, 2.7, 3.2, 0, 1.35, 2.6);
    addWall(0.15, 2.7, 3.2, 0, 1.35, -2.6);
    addWall(4.2, 2.7, 0.15, -3.6, 1.35, 0);
    addWall(4.2, 2.7, 0.15, 3.6, 1.35, 0);

    // Optional Ceiling Slab (Toggled via 'Ceiling Slab' checkbox in dock)
    const ceilingMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.35,
      roughness: 0.4,
      depthWrite: false
    });
    const ceilingSlab = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.12, 8.6), ceilingMat);
    ceilingSlab.position.set(0, 2.76, 0);
    ceilingSlab.visible = stateRef.current.ceilingVisible;
    homeGroup.add(ceilingSlab);

    // External IS:3043 Earth Pit Chamber (outside left wall, matching ResidentialCanvas)
    const earthPitGroup = new THREE.Group();
    earthPitGroup.position.set(-6.55, 0.05, 1.8);
    const pitBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.25, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 })
    );
    const copperRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 })
    );
    copperRod.position.y = 0.15;
    earthPitGroup.add(pitBox, copperRod);
    homeGroup.add(earthPitGroup);

    // ---------------- LIVING ROOM FURNITURE & SMART DEVICES ----------------
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
    const sofaGroup = new THREE.Group();
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.42, 0.92), sofaMat);
    sofaBase.position.set(0, 0.21, 0);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.48, 0.2), sofaMat);
    sofaBack.position.set(0, 0.65, -0.36);
    const sofaChaise = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.42, 1.6), sofaMat);
    sofaChaise.position.set(-0.82, 0.21, 0.34);
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.15), cushionMat);
    pillow1.position.set(-0.55, 0.58, -0.2);
    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.15), cushionMat);
    pillow2.position.set(0.55, 0.58, -0.2);
    sofaGroup.add(sofaBase, sofaBack, sofaChaise, pillow1, pillow2);
    sofaGroup.position.set(-2.9, 0.06, 1.4);
    homeGroup.add(sofaGroup);

    // Smart TV & Media Unit
    const tvStand = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.38, 0.44),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    tvStand.position.set(-2.9, 0.25, 3.85);
    const tvScreenMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.6
    });
    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.06), tvScreenMat);
    tvScreen.position.set(-2.9, 1.25, 4.05);
    homeGroup.add(tvStand, tvScreen);

    // Living Room Motorized Curtains
    const curtainRailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const livingCurtainMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.65,
      side: THREE.DoubleSide
    });
    const livingRail = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.08), curtainRailMat);
    livingRail.position.set(-2.8, 2.55, 4.12);
    homeGroup.add(livingRail);

    const livingCurtainLeft = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.35, 0.05), livingCurtainMat);
    livingCurtainLeft.position.set(-3.45, 1.32, 4.12);
    const livingCurtainRight = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.35, 0.05), livingCurtainMat);
    livingCurtainRight.position.set(-2.15, 1.32, 4.12);
    homeGroup.add(livingCurtainLeft, livingCurtainRight);

    // Living Ceiling Fan (Animated Rotor)
    const fanMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.3 });
    const livingFanRotor = new THREE.Group();
    livingFanRotor.position.set(-2.8, 2.48, 2.1);
    const fanDownrod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 10), fanMat);
    fanDownrod.position.set(-2.8, 2.58, 2.1);
    homeGroup.add(fanDownrod);

    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 16), fanMat);
    livingFanRotor.add(fanHub);
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.015, 0.13), fanMat);
      blade.position.x = 0.42;
      const pivot = new THREE.Group();
      pivot.rotation.y = (i * Math.PI * 2) / 3;
      pivot.add(blade);
      livingFanRotor.add(pivot);
    }
    homeGroup.add(livingFanRotor);

    // Bedroom Ceiling Fan (Secondary Rotor)
    const bedroomFanRotor = livingFanRotor.clone();
    bedroomFanRotor.position.set(-2.8, 2.48, -2.1);
    homeGroup.add(bedroomFanRotor);

    // Split ACs
    const acBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.15 });
    const livingAcLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const buildSplitAc = (x: number, y: number, z: number, rotY: number, ledMat: THREE.MeshBasicMaterial) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.3, 0.24), acBodyMat);
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.02), ledMat);
      led.position.set(0.35, -0.05, 0.125);
      g.add(body, led);
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      homeGroup.add(g);
    };
    buildSplitAc(-5.55, 2.32, 2.5, Math.PI / 2, livingAcLedMat);

    // Main Smart DB Box on Left Wall with Hinged Door
    const dbEnclosure = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.68, 0.54),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    dbEnclosure.position.set(-5.6, 1.65, 0.8);
    homeGroup.add(dbEnclosure);

    // Internal MCB & KNX Busbar detail inside DB
    const mcbRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.52, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    mcbRail.position.set(-5.52, 1.65, 0.8);
    homeGroup.add(mcbRail);

    // Hinged DB Door Pivot
    const dbDoorPivot = new THREE.Group();
    dbDoorPivot.position.set(-5.52, 1.65, 0.53);
    const dbDoorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.66, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.25 })
    );
    dbDoorMesh.position.set(0, 0, 0.26);
    dbDoorPivot.add(dbDoorMesh);
    homeGroup.add(dbDoorPivot);

    // ---------------- BEDROOM FURNITURE & SMART DEVICES ----------------
    const bedGroup = new THREE.Group();
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.32, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.55 })
    );
    bedFrame.position.set(0, 0.16, 0);
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.24, 2.05),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 })
    );
    mattress.position.set(0, 0.4, 0.02);
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(1.97, 0.25, 1.25),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.65 })
    );
    blanket.position.set(0, 0.41, 0.42);
    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.05, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    headboard.position.set(0, 0.55, -1.05);
    bedGroup.add(bedFrame, mattress, blanket, headboard);
    bedGroup.position.set(-2.9, 0.06, -2.95);
    homeGroup.add(bedGroup);

    // Bedroom Motorized Curtain
    const bedCurtainMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const bedCurtainLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.3, 1.1), bedCurtainMat);
    bedCurtainLeft.position.set(-5.6, 1.32, -2.75);
    const bedCurtainRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.3, 1.1), bedCurtainMat);
    bedCurtainRight.position.set(-5.6, 1.32, -1.65);
    homeGroup.add(bedCurtainLeft, bedCurtainRight);

    const bedroomAcLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    buildSplitAc(-2.8, 2.32, -4.08, 0, bedroomAcLedMat);

    // ---------------- KITCHEN FURNITURE & SMART DEVICES ----------------
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.2 });
    const quartzTopMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.1 });
    const counterMain = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.85, 0.7), counterMat);
    counterMain.position.set(3.2, 0.48, 3.75);
    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.06, 0.74), quartzTopMat);
    counterTop.position.set(3.2, 0.92, 3.75);
    const island = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 0.9), counterMat);
    island.position.set(2.6, 0.48, 1.75);
    const islandTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.98), quartzTopMat);
    islandTop.position.set(2.6, 0.92, 1.75);
    const fridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.85, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 })
    );
    fridge.position.set(5.2, 0.98, 3.6);
    homeGroup.add(counterMain, counterTop, island, islandTop, fridge);

    // ---------------- BATHROOM FIXTURES & SMART DEVICES ----------------
    const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.78, 0.55), counterMat);
    vanity.position.set(2.4, 0.45, -3.85);
    const mirrorGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const vanityMirror = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.05), mirrorGlowMat);
    vanityMirror.position.set(2.4, 1.55, -4.12);
    const geyserBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.58, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    geyserBody.position.set(5.45, 2.15, -3.5);
    const showerGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 2.1, 1.6),
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.32,
        roughness: 0.1,
        depthWrite: false
      })
    );
    showerGlass.position.set(4.1, 1.1, -3.3);
    homeGroup.add(vanity, vanityMirror, geyserBody, showerGlass);

    // ---------------- CONCEALED PVC CONDUITS & KNX AUTOMATION BUS ----------------
    const wiringGroup = new THREE.Group();
    scene.add(wiringGroup);

    const cktL1Mat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red: Lighting Loop 1
    const cktL2Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Amber: Bedroom & Wet Zone
    const cktP1Mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 }); // Blue: Heavy HVAC & Power
    const cktA1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Emerald: KNX Bus & Curtains

    const circuitMaterials: Record<string, { mat: THREE.MeshBasicMaterial; baseHex: number }> = {
      'CKT-L1': { mat: cktL1Mat, baseHex: 0xef4444 },
      'CKT-L2': { mat: cktL2Mat, baseHex: 0xf59e0b },
      'CKT-P1': { mat: cktP1Mat, baseHex: 0x3b82f6 },
      'CKT-A1': { mat: cktA1Mat, baseHex: 0x10b981 }
    };

    const addConduitRun = (pts: [number, number, number][], mat: THREE.Material, radius = 0.032) => {
      const vectors = pts.map((p) => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.04);
      const geo = new THREE.TubeGeometry(curve, 36, radius, 8, false);
      const mesh = new THREE.Mesh(geo, mat);
      wiringGroup.add(mesh);
    };

    // CKT-L1 (Red overhead conduit run: DB -> Living Fan/Lights -> Kitchen Linear LEDs)
    addConduitRun(
      [
        [-5.55, 1.75, 0.8],
        [-5.55, 2.66, 0.8],
        [-2.8, 2.66, 0.8],
        [-2.8, 2.66, 2.2],
        [2.8, 2.66, 2.2],
        [2.8, 2.5, 2.2]
      ],
      cktL1Mat
    );

    // CKT-L2 (Amber overhead conduit run: DB -> Bedroom Fan/Lights -> Bathroom Vanity)
    addConduitRun(
      [
        [-5.55, 1.7, 0.7],
        [-5.55, 2.64, -2.2],
        [-2.8, 2.64, -2.2],
        [2.8, 2.64, -2.2],
        [2.4, 2.64, -4.05],
        [2.4, 1.6, -4.05]
      ],
      cktL2Mat
    );

    // CKT-P1 (Blue Power conduit run: DB -> Living AC -> Bedroom AC -> Kitchen 16A -> Geyser)
    addConduitRun(
      [
        [-5.55, 1.6, 0.9],
        [-5.55, 2.35, 2.5],
        [-5.55, 2.68, -4.05],
        [-2.8, 2.35, -4.05],
        [5.5, 2.68, -3.5],
        [5.5, 2.15, -3.5],
        [5.5, 2.68, 2.0],
        [5.5, 1.25, 2.0]
      ],
      cktP1Mat,
      0.036
    );

    // CKT-A1 (Emerald Green KNX Automation Bus & Earth Link)
    addConduitRun(
      [
        [-6.55, 0.2, 1.8],
        [-5.6, 0.2, 0.8],
        [-5.6, 1.55, 0.8],
        [-0.1, 1.35, 3.2],
        [-2.8, 2.1, 4.1],
        [0.1, 1.35, 4.2],
        [3.2, 2.65, 3.2],
        [2.8, 2.65, -3.6],
        [-1.4, 0.85, -3.9],
        [-5.6, 2.1, -2.2]
      ],
      cktA1Mat,
      0.028
    );

    // Ceiling Junction Boxes & Recessed Downlight Cans
    const jboxMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const jboxPositions: [number, number, number][] = [
      [-2.8, 2.66, 2.2],
      [-2.8, 2.64, -2.2],
      [2.8, 2.66, 2.2],
      [2.8, 2.64, -2.2],
      [-5.55, 2.66, 0.8]
    ];
    jboxPositions.forEach((pos) => {
      const box = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16), jboxMat);
      box.position.set(...pos);
      wiringGroup.add(box);
    });

    // 6. Animation & State Sync Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let frameCounter = 0;
    const keysPressed: Record<string, boolean> = {};
    const camFwd = new THREE.Vector3();
    const camRight = new THREE.Vector3();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      keysPressed[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const st = stateRef.current;

      const moveFwd =
        (keysPressed['KeyW'] || keysPressed['ArrowUp'] ? 1 : 0) -
        (keysPressed['KeyS'] || keysPressed['ArrowDown'] ? 1 : 0);
      const moveStrafe =
        (keysPressed['KeyD'] || keysPressed['ArrowRight'] ? 1 : 0) -
        (keysPressed['KeyA'] || keysPressed['ArrowLeft'] ? 1 : 0);
      const isSprinting = keysPressed['ShiftLeft'] || keysPressed['ShiftRight'];

      if (moveFwd !== 0 || moveStrafe !== 0) {
        cameraTransitionActive = false;
        const speed = (isSprinting ? 10.0 : 6.0) * dt;
        camera.getWorldDirection(camFwd);
        camFwd.y = 0;
        if (camFwd.lengthSq() > 0.0001) camFwd.normalize();
        camRight.set(-camFwd.z, 0, camFwd.x);
        const stepX = (camFwd.x * moveFwd + camRight.x * moveStrafe) * speed;
        const stepZ = (camFwd.z * moveFwd + camRight.z * moveStrafe) * speed;
        camera.position.x += stepX;
        camera.position.z += stepZ;
        controls.target.x += stepX;
        controls.target.z += stepZ;
      }

      // Sync Auto-Orbit
      controls.autoRotate = st.isAutoRotate && moveFwd === 0 && moveStrafe === 0;

      // Check room camera preset transition
      if (st.selectedRoom !== lastRoomPreset) {
        lastRoomPreset = st.selectedRoom;
        cameraTransitionActive = true;
      }

      if (cameraTransitionActive) {
        const preset = CAMERA_PRESETS[st.selectedRoom] || CAMERA_PRESETS.overview;
        _targetCamPos.set(...preset.pos);
        _targetLookAt.set(...preset.target);
        camera.position.lerp(_targetCamPos, 1 - Math.exp(-5 * dt));
        controls.target.lerp(_targetLookAt, 1 - Math.exp(-5 * dt));
        if (camera.position.distanceTo(_targetCamPos) < 0.08) {
          cameraTransitionActive = false;
        }
      }

      // Sync View Stage ('finished' | 'cutaway' | 'construction')
      ceilingSlab.visible = st.ceilingVisible;
      wiringGroup.visible = st.viewStage !== 'finished';

      if (st.viewStage === 'construction') {
        innerWallMat.color.setHex(0x94a3b8); // Exposed raw brick/block chasing look
        outerWallMat.opacity = 0.22;
      } else if (st.viewStage === 'cutaway') {
        innerWallMat.color.setHex(0xf8fafc);
        outerWallMat.opacity = 0.38;
      } else {
        innerWallMat.color.setHex(0xffffff);
        outerWallMat.opacity = 0.72;
      }

      // Sync Circuit Wire Tracing Highlight
      Object.entries(circuitMaterials).forEach(([cid, entry]) => {
        if (st.activeCircuit === 'ALL' || st.activeCircuit === cid) {
          entry.mat.color.setHex(entry.baseHex);
        } else {
          entry.mat.color.setHex(0x334155); // Dim non-selected circuits
        }
      });

      // Animate Hinged DB Door
      const targetDoorRot = st.dbDoorOpen ? -Math.PI * 0.65 : 0;
      dbDoorPivot.rotation.y = THREE.MathUtils.damp(dbDoorPivot.rotation.y, targetDoorRot, 7, dt);

      // Sync Scenario Lighting Color & Brightness
      const brightScale = st.brightness / 100;
      const isMovie = st.scenario === 'movie';
      const isNight = st.scenario === 'night';

      livingLight.color.setHex(isMovie ? 0x38bdf8 : 0xffedd5);
      livingLight.intensity = st.roomLights.living ? (isMovie ? 0.9 : 2.4) * brightScale : 0.08;
      tvScreenMat.emissiveIntensity = st.roomLights.living || isMovie ? 0.85 : 0.05;

      bedroomLight.color.setHex(isNight ? 0xf59e0b : 0xfde68a);
      bedroomLight.intensity = st.roomLights.bedroom ? (isNight ? 0.55 : 2.0) * brightScale : 0.08;

      kitchenLight.intensity = st.roomLights.kitchen ? 2.2 * brightScale : 0.08;
      bathroomLight.intensity = st.roomLights.bathroom ? 1.8 * brightScale : 0.08;
      mirrorGlowMat.color.setHex(st.roomLights.bathroom ? 0x38bdf8 : 0x334155);

      // Animate Motorized Curtains smoothly
      const livLeftTargetX = st.curtains.livingOpen ? -3.95 : -3.45;
      const livRightTargetX = st.curtains.livingOpen ? -1.65 : -2.15;
      const livScaleTargetX = st.curtains.livingOpen ? 0.35 : 1.0;

      livingCurtainLeft.position.x = THREE.MathUtils.damp(livingCurtainLeft.position.x, livLeftTargetX, 6, dt);
      livingCurtainRight.position.x = THREE.MathUtils.damp(livingCurtainRight.position.x, livRightTargetX, 6, dt);
      livingCurtainLeft.scale.x = THREE.MathUtils.damp(livingCurtainLeft.scale.x, livScaleTargetX, 6, dt);
      livingCurtainRight.scale.x = THREE.MathUtils.damp(livingCurtainRight.scale.x, livScaleTargetX, 6, dt);

      const bedLeftTargetZ = st.curtains.bedroomOpen ? -3.15 : -2.75;
      const bedRightTargetZ = st.curtains.bedroomOpen ? -1.25 : -1.65;
      const bedScaleTargetZ = st.curtains.bedroomOpen ? 0.35 : 1.0;

      bedCurtainLeft.position.z = THREE.MathUtils.damp(bedCurtainLeft.position.z, bedLeftTargetZ, 6, dt);
      bedCurtainRight.position.z = THREE.MathUtils.damp(bedCurtainRight.position.z, bedRightTargetZ, 6, dt);
      bedCurtainLeft.scale.z = THREE.MathUtils.damp(bedCurtainLeft.scale.z, bedScaleTargetZ, 6, dt);
      bedCurtainRight.scale.z = THREE.MathUtils.damp(bedCurtainRight.scale.z, bedScaleTargetZ, 6, dt);

      // Animate Ceiling Fans based on fanSpeed & livingFan toggle
      const activeFanSpd = st.appliances.livingFan ? Math.max(1, st.fanSpeed) : 0;
      if (activeFanSpd > 0) {
        livingFanRotor.rotation.y += dt * activeFanSpd * 3.2;
        bedroomFanRotor.rotation.y += dt * activeFanSpd * 2.6;
      }
      livingAcLedMat.color.setHex(st.appliances.livingAc ? 0x10b981 : 0x475569);
      bedroomAcLedMat.color.setHex(st.appliances.bedroomAc ? 0x38bdf8 : 0x475569);

      controls.update();
      renderer.render(scene, camera);

      // Project 3D smart device markers to 2D overlay coordinates every 3 frames
      frameCounter++;
      if (frameCounter % 3 === 0) {
        const w = container.clientWidth || width;
        const h = container.clientHeight || height;
        const nextCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
        for (const dev of SMART_HOME_DEVICES) {
          if (
            st.selectedRoom !== 'overview' &&
            st.selectedRoom !== 'db' &&
            st.selectedRoom !== 'earth_pit' &&
            dev.room !== st.selectedRoom
          ) {
            nextCoords[dev.id] = { x: 0, y: 0, visible: false };
            continue;
          }
          _projVec.set(...dev.position);
          _projVec.project(camera);
          const isFront = _projVec.z < 1;
          const x = (_projVec.x * 0.5 + 0.5) * w;
          const y = (-(_projVec.y * 0.5) + 0.5) * h;
          const inBounds = x > 30 && x < w - 30 && y > 60 && y < h - 90;
          nextCoords[dev.id] = { x, y, visible: isFront && inBounds };
        }
        setMarkerCoords(nextCoords);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const getCategoryColor = (category: SmartDeviceItem['category']) => {
    switch (category) {
      case 'lighting':
        return 'bg-amber-500 text-slate-950 border-amber-300';
      case 'curtain':
        return 'bg-teal-500 text-slate-950 border-teal-300';
      case 'electrical':
        return 'bg-sky-500 text-slate-950 border-sky-300';
      case 'appliance':
        return 'bg-emerald-500 text-slate-950 border-emerald-300';
      case 'security':
        return 'bg-rose-500 text-white border-rose-300';
    }
  };

  const getCategoryIcon = (category: SmartDeviceItem['category']) => {
    switch (category) {
      case 'lighting':
        return 'lightbulb';
      case 'curtain':
        return 'curtains';
      case 'electrical':
        return 'offline_bolt';
      case 'appliance':
        return 'mode_fan';
      case 'security':
        return 'shield_lock';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0F172A] select-none">
      {/* Dedicated WebGL Mount Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Clickable 3D Smart-Device Markers */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {SMART_HOME_DEVICES.map((dev) => {
          const coord = markerCoords[dev.id];
          if (!coord || !coord.visible) return null;
          const isSelected = simState.selectedDeviceId === dev.id;
          return (
            <button
              key={dev.id}
              type="button"
              onClick={() => onSelectDevice(dev.id)}
              style={{
                transform: `translate3d(${Math.round(coord.x)}px, ${Math.round(coord.y)}px, 0) translate(-50%, -50%)`
              }}
              title={`${dev.name} (${dev.room.toUpperCase()})`}
              className={`pointer-events-auto absolute top-0 left-0 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shadow-md transition-transform cursor-pointer ${
                isSelected
                  ? 'scale-115 ring-2 ring-white z-20 ' + getCategoryColor(dev.category)
                  : 'opacity-90 hover:opacity-100 hover:scale-105 bg-[#0F172A]/90 text-slate-100 border-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[12px] leading-none">
                {getCategoryIcon(dev.category)}
              </span>
              <span className="hidden sm:inline max-w-[105px] truncate">
                {dev.name.split(' ')[0]} {dev.name.split(' ')[1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
