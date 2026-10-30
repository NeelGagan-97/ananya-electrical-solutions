import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  SOLAR_CAPACITY_PRESETS,
  SOLAR_EQUIPMENT_COMPONENTS,
  STREET_VIEW_WAYPOINTS,
  SolarSystemCapacityId,
  SolarViewMode,
  SolarOperatingModeId,
  WalkthroughStationId,
} from '../data/residentialSolarPresets';

export interface ResidentialSolarCanvasProps {
  capacityId: SolarSystemCapacityId;
  viewMode: SolarViewMode;
  operatingMode: SolarOperatingModeId;
  isHybridBess: boolean;
  irradiance: number; // 0 to 1000 W/m2
  activeStrings: number; // 1 or 2
  solarGenKw: number;
  homeLoadKw: number;
  gridImportKw: number;
  gridExportKw: number;
  gridOnline: boolean;
  isWalkthrough: boolean;
  walkthroughStation: WalkthroughStationId;
  onChangeStation: (station: WalkthroughStationId) => void;
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  showLabels: boolean;
  isAutoRotate: boolean;
  cameraControlAction: { type: 'zoom_in' | 'zoom_out' | 'reset'; seq: number } | null;
  appliances: {
    fanOn: boolean;
    lightsOn: boolean;
    tvOn: boolean;
    acOn: boolean;
  };
  onToggleAppliance: (key: 'fanOn' | 'lightsOn' | 'tvOn' | 'acOn') => void;
}

interface ProjectedLabel {
  id: string;
  index: number;
  shortLabel: string;
  category: string;
  x: number;
  y: number;
  visible: boolean;
}

interface ProjectedWaypoint {
  id: WalkthroughStationId;
  stepNumber: number;
  title: string;
  zone: string;
  x: number;
  y: number;
  visible: boolean;
}

export const ResidentialSolarCanvas: React.FC<ResidentialSolarCanvasProps> = ({
  capacityId,
  viewMode,
  operatingMode,
  isHybridBess,
  irradiance,
  activeStrings,
  solarGenKw,
  homeLoadKw,
  gridImportKw,
  gridExportKw,
  gridOnline,
  isWalkthrough,
  walkthroughStation,
  onChangeStation,
  selectedComponentId,
  onSelectComponent,
  showLabels,
  isAutoRotate,
  cameraControlAction,
  appliances,
  onToggleAppliance,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [projectedWaypoints, setProjectedWaypoints] = useState<ProjectedWaypoint[]>([]);

  const stateRef = useRef({
    capacityId,
    viewMode,
    operatingMode,
    isHybridBess,
    irradiance,
    activeStrings,
    solarGenKw,
    homeLoadKw,
    gridImportKw,
    gridExportKw,
    gridOnline,
    isWalkthrough,
    walkthroughStation,
    onChangeStation,
    selectedComponentId,
    onSelectComponent,
    showLabels,
    isAutoRotate,
    appliances,
    onToggleAppliance,
  });

  useEffect(() => {
    stateRef.current = {
      capacityId,
      viewMode,
      operatingMode,
      isHybridBess,
      irradiance,
      activeStrings,
      solarGenKw,
      homeLoadKw,
      gridImportKw,
      gridExportKw,
      gridOnline,
      isWalkthrough,
      walkthroughStation,
      onChangeStation,
      selectedComponentId,
      onSelectComponent,
      showLabels,
      isAutoRotate,
      appliances,
      onToggleAppliance,
    };
  }, [
    capacityId,
    viewMode,
    operatingMode,
    isHybridBess,
    irradiance,
    activeStrings,
    solarGenKw,
    homeLoadKw,
    gridImportKw,
    gridExportKw,
    gridOnline,
    isWalkthrough,
    walkthroughStation,
    onChangeStation,
    selectedComponentId,
    onSelectComponent,
    showLabels,
    isAutoRotate,
    appliances,
    onToggleAppliance,
  ]);

  // Ref for imperative camera actions (Zoom In / Zoom Out / Reset)
  const cameraActionRef = useRef<{ type: 'zoom_in' | 'zoom_out' | 'reset'; seq: number } | null>(null);
  useEffect(() => {
    if (cameraControlAction) {
      cameraActionRef.current = cameraControlAction;
    }
  }, [cameraControlAction]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x091326);
    scene.fog = new THREE.FogExp2(0x091326, 0.011);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.2, 180);
    camera.position.set(-16.5, 13.5, 16.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // PBR Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    sunLight.position.set(14, 26, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 65;
    const d = 18;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 0.85);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    // Interior Living Room Light & Terrace Floodlight
    const livingLight = new THREE.PointLight(0xfef08a, 1.8, 12);
    livingLight.position.set(-0.8, 2.85, 1.0);
    scene.add(livingLight);

    const terraceLight = new THREE.PointLight(0x38bdf8, 1.2, 15);
    terraceLight.position.set(2.5, 8.6, -1.8);
    scene.add(terraceLight);

    //Glowing Sun Orb in Sky
    const sunOrbGeo = new THREE.SphereGeometry(1.35, 24, 24);
    const sunOrbMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const sunOrb = new THREE.Mesh(sunOrbGeo, sunOrbMat);
    sunOrb.position.set(0, 17.5, 13.5);
    scene.add(sunOrb);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.minDistance = 2.0;
    controls.maxDistance = 55;
    controls.target.set(-1.0, 4.2, 0);

    let isUserDraggingOrbit = false;
    controls.addEventListener('start', () => {
      isUserDraggingOrbit = true;
    });
    controls.addEventListener('end', () => {
      isUserDraggingOrbit = false;
    });

    // =========================================================================
    // MATERIALS PALETTE
    // =========================================================================
    const matPlotGround = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.92 });
    const matLawn = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 });
    const matDriveway = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const matWallCream = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
    const matWallAccent = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const matTerraceCement = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.78 });
    const matParapetCoping = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
    const matGalvSteel = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.78,
      roughness: 0.28,
    });
    const matAluminium = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.88,
      roughness: 0.2,
    });
    const matSolarCell = new THREE.MeshStandardMaterial({
      color: 0x0c1e3e,
      metalness: 0.65,
      roughness: 0.14,
    });
    const matDcRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
    const matDcBlack = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
    const matAcBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
    const matEarthGreen = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35 });
    const matCopper = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const matInverterBody = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.45,
      roughness: 0.3,
    });
    const matEnclosureGrey = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.35,
      roughness: 0.4,
    });

    // =========================================================================
    // 1. PLOT, COMPOUND WALL, DRIVEWAY & COMPASS
    // =========================================================================
    const environmentGroup = new THREE.Group();
    scene.add(environmentGroup);

    const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(54, 54), matPlotGround);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    environmentGroup.add(groundMesh);

    const gridHelper = new THREE.GridHelper(50, 50, 0x1e293b, 0x1e293b);
    gridHelper.position.y = 0.01;
    environmentGroup.add(gridHelper);

    const lawnPlot = new THREE.Mesh(new THREE.BoxGeometry(20, 0.08, 20), matLawn);
    lawnPlot.position.set(0, 0.04, 0.5);
    lawnPlot.receiveShadow = true;
    environmentGroup.add(lawnPlot);

    const pavedWalk = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.1, 14.5), matDriveway);
    pavedWalk.position.set(-0.5, 0.05, 0.5);
    pavedWalk.receiveShadow = true;
    environmentGroup.add(pavedWalk);

    // South Orientation Compass Indicator on Front Ground (+Z is South)
    const compassGroup = new THREE.Group();
    compassGroup.position.set(6.5, 0.12, 6.8);
    const compassRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 0.92, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    compassRing.rotation.x = -Math.PI / 2;
    compassGroup.add(compassRing);
    const southArrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.9, 12),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    southArrow.rotation.x = Math.PI / 2;
    southArrow.position.set(0, 0.08, 0.55);
    compassGroup.add(southArrow);
    environmentGroup.add(compassGroup);

    // =========================================================================
    // 2. G+1 INDIAN RCC HOUSE ARCHITECTURE (With Cutaway Ground Living Room & Terrace Staircase)
    // =========================================================================
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Plinth Base (10.5m W × 9.2m D × 0.25m H)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.25, 9.2), matParapetCoping);
    plinth.position.set(0, 0.125, 0);
    plinth.receiveShadow = true;
    houseGroup.add(plinth);

    // Ground Floor Back, Left (West Utility Wall), and Right Walls (Front South has large glazed opening for interior visibility)
    const westWallGF = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.0, 9.0), matWallCream);
    westWallGF.position.set(-5.15, 1.75, 0);
    westWallGF.castShadow = true;
    westWallGF.receiveShadow = true;
    houseGroup.add(westWallGF);

    const northWallGF = new THREE.Mesh(new THREE.BoxGeometry(10.4, 3.0, 0.28), matWallCream);
    northWallGF.position.set(0, 1.75, -4.45);
    northWallGF.castShadow = true;
    houseGroup.add(northWallGF);

    const eastWallGF = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.0, 9.0), matWallCream);
    eastWallGF.position.set(5.15, 1.75, 0);
    eastWallGF.castShadow = true;
    houseGroup.add(eastWallGF);

    // First FloorSlab (y = 3.25m)
    const firstFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.22, 9.3), matParapetCoping);
    firstFloorSlab.position.set(0, 3.25, 0);
    firstFloorSlab.castShadow = true;
    firstFloorSlab.receiveShadow = true;
    houseGroup.add(firstFloorSlab);

    // First Floor Walls (y = 3.36m to 6.10m)
    const westWallFF = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.75, 9.0), matWallCream);
    westWallFF.position.set(-5.15, 4.73, 0);
    westWallFF.castShadow = true;
    westWallFF.receiveShadow = true;
    houseGroup.add(westWallFF);

    const northWallFF = new THREE.Mesh(new THREE.BoxGeometry(10.4, 2.75, 0.28), matWallCream);
    northWallFF.position.set(0, 4.73, -4.45);
    northWallFF.castShadow = true;
    houseGroup.add(northWallFF);

    const southWallFF = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.75, 0.28), matWallAccent);
    southWallFF.position.set(-1.3, 4.73, 4.45);
    southWallFF.castShadow = true;
    houseGroup.add(southWallFF);

    // First Floor Front Balcony Windows
    const windowGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.36,
      roughness: 0.1,
      metalness: 0.1,
    });
    const ffWindow1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.34), windowGlassMat);
    ffWindow1.position.set(-3.0, 4.8, 4.45);
    houseGroup.add(ffWindow1);
    const ffWindow2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.34), windowGlassMat);
    ffWindow2.position.set(0.4, 4.8, 4.45);
    houseGroup.add(ffWindow2);

    // Main RCC Terrace Roof Slab (y = 6.20m)
    const rccRoofSlab = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.25, 9.4), matTerraceCement);
    rccRoofSlab.position.set(0, 6.2, 0);
    rccRoofSlab.castShadow = true;
    rccRoofSlab.receiveShadow = true;
    houseGroup.add(rccRoofSlab);

    // Parapet Walls around RCC Terrace (0.95m height with coping)
    const parapetSouth = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.9, 0.22), matWallCream);
    parapetSouth.position.set(0, 6.75, 4.58);
    houseGroup.add(parapetSouth);

    const parapetNorth = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.9, 0.22), matWallCream);
    parapetNorth.position.set(0, 6.75, -4.58);
    houseGroup.add(parapetNorth);

    const parapetWest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 9.4), matWallCream);
    parapetWest.position.set(-5.28, 6.75, 0);
    houseGroup.add(parapetWest);

    const parapetEast = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 9.4), matWallCream);
    parapetEast.position.set(5.28, 6.75, 0);
    houseGroup.add(parapetEast);

    // Staircase Mumty / Headroom on North-East Corner of Terrace
    const mumtyBox = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.3, 2.8), matWallAccent);
    mumtyBox.position.set(3.4, 7.45, -2.5);
    mumtyBox.castShadow = true;
    houseGroup.add(mumtyBox);

    // Realistic Staircase Steps from Ground (+Z) up along East Bay (x = 3.8..4.8) to Terrace
    const stairGroup = new THREE.Group();
    for (let s = 0; s < 18; s++) {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.18, 0.36),
        matParapetCoping
      );
      const frac = s / 17;
      stepMesh.position.set(4.1, 0.35 + frac * 5.85, 3.4 - frac * 5.2);
      stepMesh.castShadow = true;
      stairGroup.add(stepMesh);
    }
    houseGroup.add(stairGroup);

    // =========================================================================
    // 3. INTERACTIVE GROUND-FLOOR LIVING ROOM APPLIANCES ([F] Fan, [L] Lights, [T] TV, [C] AC)
    // =========================================================================
    const appliancesGroup = new THREE.Group();
    scene.add(appliancesGroup);

    // Ceiling Fan ([F])
    const fanGroup = new THREE.Group();
    fanGroup.position.set(-1.0, 2.95, 0.8);
    fanGroup.name = 'appliance_fan';
    const fanRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 12), matAluminium);
    fanRod.position.y = 0.1;
    fanGroup.add(fanRod);
    const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 20), matCopper);
    fanGroup.add(fanHub);
    const fanBladesGroup = new THREE.Group();
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.015, 0.14), matAluminium);
      blade.position.x = 0.55;
      const pivot = new THREE.Group();
      pivot.rotation.y = (b * Math.PI * 2) / 3;
      pivot.add(blade);
      fanBladesGroup.add(pivot);
    }
    fanGroup.add(fanBladesGroup);
    appliancesGroup.add(fanGroup);

    // 65" Smart Television on North Wall ([T])
    const tvGroup = new THREE.Group();
    tvGroup.position.set(-1.2, 1.55, -4.18);
    tvGroup.name = 'appliance_tv';
    const tvFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.1, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    tvGroup.add(tvFrame);
    const tvScreenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 0.98), tvScreenMat);
    tvScreen.position.z = 0.045;
    tvGroup.add(tvScreen);
    appliancesGroup.add(tvGroup);

    // Split Air Conditioner ([C])
    const acGroup = new THREE.Group();
    acGroup.position.set(1.4, 2.55, -4.15);
    acGroup.name = 'appliance_ac';
    const acBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.32, 0.26), matInverterBody);
    acGroup.add(acBody);
    const acLedMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const acLedStrip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.28), acLedMat);
    acLedStrip.position.y = -0.1;
    acGroup.add(acLedStrip);
    appliancesGroup.add(acGroup);

    // Living Room Ceiling LED Fixture ([L])
    const lightFixtureMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lightFixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.04, 24),
      lightFixtureMat
    );
    lightFixture.position.set(1.2, 3.1, 0.8);
    lightFixture.name = 'appliance_lights';
    appliancesGroup.add(lightFixture);

    // =========================================================================
    // 4. ALL 16 ELECTRICAL EQUIPMENT GROUPS (Interactive & Explodable)
    // =========================================================================
    const componentGroupsMap: Record<string, THREE.Group> = {};
    const componentBasePosMap: Record<string, THREE.Vector3> = {};
    const componentExplodedOffsetMap: Record<string, THREE.Vector3> = {};
    const interactiveRoots: THREE.Object3D[] = [fanGroup, tvGroup, acGroup, lightFixture];

    SOLAR_EQUIPMENT_COMPONENTS.forEach((comp) => {
      const grp = new THREE.Group();
      grp.name = `solar_comp_${comp.id}`;
      grp.position.set(comp.position3D[0], comp.position3D[1], comp.position3D[2]);
      scene.add(grp);
      componentGroupsMap[comp.id] = grp;
      componentBasePosMap[comp.id] = new THREE.Vector3(...comp.position3D);
      componentExplodedOffsetMap[comp.id] = new THREE.Vector3(...comp.explodedOffset);
      interactiveRoots.push(grp);
    });

    // Helper to build PV Array dynamically when capacityId changes
    const pvModulesGroup = componentGroupsMap['pv_modules'];
    const buildPvArrayForCapacity = (capId: SolarSystemCapacityId) => {
      while (pvModulesGroup.children.length > 0) {
        pvModulesGroup.remove(pvModulesGroup.children[0]);
      }

      const preset = SOLAR_CAPACITY_PRESETS[capId] || SOLAR_CAPACITY_PRESETS['5kwp'];
      const rows = preset.rows; // 2 rows (South front row & North rear row)
      const cols = preset.colsPerRow; // 3, 5, 8, or 10
      const modW = 0.82;
      const modH = 1.48;
      const gapX = 0.06;
      const totalRowWidth = cols * modW + (cols - 1) * gapX;
      const tiltRad = THREE.MathUtils.degToRad(preset.tiltAngleDeg);

      for (let r = 0; r < rows; r++) {
        const rowZ = r === 0 ? 1.55 : -1.05; // r=0 is South row, r=1 is North row
        const rowBaseY = -1.25; // relative to pvModulesGroup (y=7.6 -> 6.35m roof surface)

        // Galvanized Steel Support Legs & Concrete Pedestals
        const postCount = Math.max(3, Math.ceil(cols / 2) + 1);
        for (let p = 0; p < postCount; p++) {
          const px = -totalRowWidth / 2 + (p / (postCount - 1)) * totalRowWidth;
          // Front South Low Post
          const frontPedestal = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.12, 0.24),
            matParapetCoping
          );
          frontPedestal.position.set(px, rowBaseY + 0.06, rowZ + 0.52);
          pvModulesGroup.add(frontPedestal);

          const frontLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.58, 10),
            matGalvSteel
          );
          frontLeg.position.set(px, rowBaseY + 0.35, rowZ + 0.52);
          pvModulesGroup.add(frontLeg);

          // Rear North High Post
          const rearPedestal = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.12, 0.24),
            matParapetCoping
          );
          rearPedestal.position.set(px, rowBaseY + 0.06, rowZ - 0.52);
          pvModulesGroup.add(rearPedestal);

          const rearLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.92, 10),
            matGalvSteel
          );
          rearLeg.position.set(px, rowBaseY + 0.52, rowZ - 0.52);
          pvModulesGroup.add(rearLeg);

          // Inclined Rafter Beam
          const rafter = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.06, 1.42),
            matGalvSteel
          );
          rafter.position.set(px, rowBaseY + 0.65, rowZ);
          rafter.rotation.x = tiltRad;
          pvModulesGroup.add(rafter);
        }

        // Two Extruded Aluminium Mounting Rails per Row
        const railFront = new THREE.Mesh(
          new THREE.BoxGeometry(totalRowWidth + 0.2, 0.045, 0.045),
          matAluminium
        );
        railFront.position.set(0, rowBaseY + 0.58, rowZ + 0.36);
        pvModulesGroup.add(railFront);

        const railRear = new THREE.Mesh(
          new THREE.BoxGeometry(totalRowWidth + 0.2, 0.045, 0.045),
          matAluminium
        );
        railRear.position.set(0, rowBaseY + 0.78, rowZ - 0.36);
        pvModulesGroup.add(railRear);

        // Individual Solar PV Modules in the Row
        for (let c = 0; c < cols; c++) {
          const mx = -totalRowWidth / 2 + modW / 2 + c * (modW + gapX);
          const modHolder = new THREE.Group();
          modHolder.position.set(mx, rowBaseY + 0.71, rowZ);
          modHolder.rotation.x = tiltRad; // tilted towards +Z (South)

          // Anodized Aluminium Frame
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(modW, 0.04, modH),
            matAluminium
          );
          frame.castShadow = true;
          modHolder.add(frame);

          // Dark Blue Monocrystalline Cell Surface
          const cellSurface = new THREE.Mesh(
            new THREE.BoxGeometry(modW - 0.05, 0.044, modH - 0.05),
            matSolarCell
          );
          modHolder.add(cellSurface);

          // Half-Cut Center Busbar Line
          const centerLine = new THREE.Mesh(
            new THREE.BoxGeometry(modW - 0.06, 0.046, 0.012),
            matAluminium
          );
          modHolder.add(centerLine);

          // Under-panel IP68 Junction Box & MC4 String Loop
          const jbox = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.03, 0.12),
            matDcBlack
          );
          jbox.position.set(0, -0.03, -0.35);
          modHolder.add(jbox);

          pvModulesGroup.add(modHolder);
        }

        // Under-panel Red (+) & Black (-) DC String Conduit along row
        const stringRedPipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, totalRowWidth, 8),
          matDcRed
        );
        stringRedPipe.rotation.z = Math.PI / 2;
        stringRedPipe.position.set(0, rowBaseY + 0.48, rowZ - 0.2);
        pvModulesGroup.add(stringRedPipe);
      }
    };

    buildPvArrayForCapacity(capacityId);

    // 02. DC String Cables & Riser Conduit Group
    const dcCablesGroup = componentGroupsMap['dc_cables'];
    const riserPipeRed = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 4.6, 12), matDcRed);
    riserPipeRed.position.set(-0.7, -1.2, 0.35);
    dcCablesGroup.add(riserPipeRed);
    const riserPipeBlack = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 4.6, 12), matDcBlack);
    riserPipeBlack.position.set(-0.7, -1.2, 0.22);
    dcCablesGroup.add(riserPipeBlack);
    const roofTray = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.18), matGalvSteel);
    roofTray.position.set(1.0, 0.65, 0.28);
    dcCablesGroup.add(roofTray);

    // 03. DC Combiner Box (DCDB)
    const dcdbGroup = componentGroupsMap['dcdb'];
    const dcdbBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.36), matEnclosureGrey);
    dcdbGroup.add(dcdbBox);
    const dcdbDoor = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.3), matDangerLabel(0xef4444));
    dcdbDoor.position.x = -0.1;
    dcdbGroup.add(dcdbDoor);

    // 04. String Fuses (Mounted visibly beside/on DCDB for clear 3D inspection)
    const fusesGroup = componentGroupsMap['string_fuses'];
    for (let f = 0; f < 2; f++) {
      const fuseHolder = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.16, 0.09),
        matInverterBody
      );
      fuseHolder.position.z = f * 0.14 - 0.07;
      fusesGroup.add(fuseHolder);
      const fuseCartridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12),
        matDcRed
      );
      fuseCartridge.position.set(-0.08, 0, f * 0.14 - 0.07);
      fusesGroup.add(fuseCartridge);
    }

    // 05. DC SPD (Type-2 Surge Arrestor)
    const dcSpdGroup = componentGroupsMap['dc_spd'];
    const dcSpdBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.35 })
    );
    dcSpdGroup.add(dcSpdBlock);

    // 06. Rotary DC Isolator Switch
    const dcIsoGroup = componentGroupsMap['dc_isolator'];
    const dcIsoBox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.22), matInverterBody);
    dcIsoGroup.add(dcIsoBox);
    const dcRotaryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.1), matDcRed);
    dcRotaryHandle.position.x = -0.1;
    dcIsoGroup.add(dcRotaryHandle);

    // 07. Grid-Connected MPPT Solar Inverter (+ Optional Hybrid BESS Cabinet below)
    const inverterGroup = componentGroupsMap['solar_inverter'];
    const invChassis = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.68, 0.56), matInverterBody);
    invChassis.castShadow = true;
    inverterGroup.add(invChassis);
    const invScreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const invScreen = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.26), invScreenMat);
    invScreen.position.set(-0.15, 0.12, 0);
    inverterGroup.add(invScreen);
    // Hybrid LiFePO4 Battery Cabinet below Inverter
    const bessCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.72, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.3 })
    );
    bessCabinet.position.set(0, -0.95, 0);
    inverterGroup.add(bessCabinet);

    // 08. AC Distribution Box (ACDB)
    const acdbGroup = componentGroupsMap['acdb'];
    const acdbBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.36), matEnclosureGrey);
    acdbGroup.add(acdbBox);
    const acdbAccent = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.28), matAcBlue);
    acdbAccent.position.x = -0.1;
    acdbGroup.add(acdbAccent);

    // 09. AC SPD
    const acSpdGroup = componentGroupsMap['ac_spd'];
    const acSpdMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
    );
    acSpdGroup.add(acSpdMesh);

    // 10. AC Isolator & RCCB
    const acIsoGroup = componentGroupsMap['ac_isolator'];
    const acIsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.22), matInverterBody);
    acIsoGroup.add(acIsoMesh);
    const acBreakerLever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), matAcBlue);
    acBreakerLever.position.x = -0.09;
    acIsoGroup.add(acBreakerLever);

    // 11. Consumer Main Distribution Board (MDB)
    const mdbGroup = componentGroupsMap['mdb'];
    const mdbBox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.58, 0.52), matEnclosureGrey);
    mdbGroup.add(mdbBox);
    const mdbFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.5, 0.44),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.3 })
    );
    mdbFront.position.x = -0.11;
    mdbGroup.add(mdbFront);

    // 12. BESCOM Bidirectional Net Meter
    const netMeterGroup = componentGroupsMap['net_meter'];
    const netMeterBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.42, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.35 })
    );
    netMeterGroup.add(netMeterBox);
    const netMeterLcd = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.14, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    netMeterLcd.position.set(-0.11, 0.06, 0);
    netMeterGroup.add(netMeterLcd);

    // 13. Solar Generation Meter
    const genMeterGroup = componentGroupsMap['generation_meter'];
    const genMeterBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.28, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 })
    );
    genMeterGroup.add(genMeterBox);

    // 14. Earthing Electrodes & Conductors (3 Pits: DC, AC, LA)
    const earthingGroup = componentGroupsMap['earthing_system'];
    const pitPositionsZ = [1.8, 0.0, -1.8];
    pitPositionsZ.forEach((pz) => {
      const pitChamber = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.36, 0.26, 20),
        matEarthGreen
      );
      pitChamber.position.set(0, 0, pz);
      earthingGroup.add(pitChamber);

      const copperRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12),
        matCopper
      );
      copperRod.position.set(0, -0.5, pz);
      earthingGroup.add(copperRod);
    });
    const giInterconnectStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 4.2),
      matEarthGreen
    );
    giInterconnectStrip.position.set(0, 0.05, 0);
    earthingGroup.add(giInterconnectStrip);

    // 15. Lightning Protection System (LA Mast on Mumty)
    const laGroup = componentGroupsMap['lightning_protection'];
    const laMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.2, 12), matGalvSteel);
    laMast.position.y = -0.6;
    laGroup.add(laMast);
    const laSpikeHead = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 12), matCopper);
    laSpikeHead.position.y = 0.65;
    laGroup.add(laSpikeHead);

    // 16. BESCOM Distribution Pole & Overhead Service Drop
    const bescomGroup = componentGroupsMap['bescom_connection'];
    const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 7.6, 16), matParapetCoping);
    poleMesh.position.y = 0;
    poleMesh.castShadow = true;
    bescomGroup.add(poleMesh);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 2.2), matGalvSteel);
    crossArm.position.y = 3.2;
    bescomGroup.add(crossArm);
    for (let ins = -1; ins <= 1; ins++) {
      const insulator = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.24, 12),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.2 })
      );
      insulator.position.set(0, 3.4, ins * 0.75);
      bescomGroup.add(insulator);
    }

    function matDangerLabel(hex: number) {
      return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.35 });
    }

    // =========================================================================
    // 5. GOOGLE STREET VIEW GROUND CHEVRON HOTSPOTS
    // =========================================================================
    const streetViewGroup = new THREE.Group();
    scene.add(streetViewGroup);
    const waypointMeshes: THREE.Object3D[] = [];

    STREET_VIEW_WAYPOINTS.forEach((wp) => {
      const nodeGrp = new THREE.Group();
      nodeGrp.position.set(wp.markerPos[0], wp.markerPos[1], wp.markerPos[2]);
      nodeGrp.name = `streetview_wp_${wp.id}`;

      // Glowing Outer Ring
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.42, 0.56, 32),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        })
      );
      outerRing.rotation.x = -Math.PI / 2;
      nodeGrp.add(outerRing);

      // Inner Disc with Street View Chevron Cone
      const innerDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.36, 24),
        new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
        })
      );
      innerDisc.rotation.x = -Math.PI / 2;
      innerDisc.position.y = 0.01;
      nodeGrp.add(innerDisc);

      // Directional Chevron Arrow pointing toward next waypoint
      const arrowCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.45, 4),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      arrowCone.rotation.x = Math.PI / 2;
      arrowCone.position.y = 0.14;
      nodeGrp.add(arrowCone);

      streetViewGroup.add(nodeGrp);
      waypointMeshes.push(nodeGrp);
    });

    // =========================================================================
    // 6. ANIMATED POWER-FLOW CABLE CURVES & PARTICLE STREAMS
    // =========================================================================
    // A. Sunlight Rays (Sky Sun -> Rooftop PV Array)
    const sunCurve1 = new THREE.LineCurve3(
      new THREE.Vector3(0, 16.5, 12.5),
      new THREE.Vector3(-1.8, 7.6, 1.2)
    );
    const sunCurve2 = new THREE.LineCurve3(
      new THREE.Vector3(0, 16.5, 12.5),
      new THREE.Vector3(1.8, 7.6, -0.8)
    );

    // B. DC String Flow (Rooftop PV Array -> Riser -> DCDB -> DC Isolator -> Solar Inverter)
    const dcFlowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 7.3, 1.2),
      new THREE.Vector3(-4.8, 7.1, 1.6),
      new THREE.Vector3(-5.35, 5.2, 1.6),
      new THREE.Vector3(-5.35, 2.55, 1.6), // DCDB
      new THREE.Vector3(-5.35, 2.55, 0.95), // DC Isolator
      new THREE.Vector3(-5.35, 1.95, 0.0), // Solar Inverter
    ]);

    // C. AC Solar Flow (Solar Inverter -> ACDB -> Generation Meter -> Consumer MDB)
    const acFlowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.35, 1.95, 0.0), // Inverter
      new THREE.Vector3(-5.35, 1.85, -1.2), // ACDB
      new THREE.Vector3(-5.35, 2.38, -2.5), // Generation Meter
      new THREE.Vector3(-5.35, 1.85, -2.5), // MDB
    ]);

    // D. Home Load Flow (Consumer MDB -> Ground Living Room Appliances)
    const homeLoadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.35, 1.85, -2.5),
      new THREE.Vector3(-3.2, 2.6, -2.5),
      new THREE.Vector3(-1.0, 2.8, 0.8),
      new THREE.Vector3(1.2, 2.5, -3.8),
    ]);

    // E. BESCOM Grid Flow (Consumer MDB <-> Bidirectional Net Meter <-> BESCOM Street Pole)
    const gridFlowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.35, 1.85, -2.5), // MDB
      new THREE.Vector3(-5.35, 1.85, -3.55), // Bidirectional Net Meter
      new THREE.Vector3(-6.8, 4.2, -3.55),
      new THREE.Vector3(-9.2, 6.8, -3.55), // BESCOM Pole Top
    ]);

    // Visible Conduit Tubes for the Curves
    const dcTubeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(dcFlowCurve, 40, 0.035, 8, false),
      matDcRed
    );
    scene.add(dcTubeMesh);

    const acTubeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(acFlowCurve, 32, 0.035, 8, false),
      matAcBlue
    );
    scene.add(acTubeMesh);

    const gridTubeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(gridFlowCurve, 32, 0.04, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 })
    );
    scene.add(gridTubeMesh);

    // Create Animated Pulse Spheres for each pathway
    const createPulsePool = (count: number, colorHex: number, radius = 0.11) => {
      const arr: THREE.Mesh[] = [];
      const geo = new THREE.SphereGeometry(radius, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(geo, mat);
        scene.add(m);
        arr.push(m);
      }
      return arr;
    };

    const sunPulses = createPulsePool(8, 0xfacc15, 0.14);
    const dcPulses = createPulsePool(12, 0xef4444, 0.11);
    const acPulses = createPulsePool(10, 0x38bdf8, 0.11);
    const homePulses = createPulsePool(8, 0x22d3ee, 0.1);
    const gridPulses = createPulsePool(12, 0x10b981, 0.12);

    // =========================================================================
    // 7. WALKTHROUGH KEYBOARD & MOUSE LOOK + RAYCAST CLICKING
    // =========================================================================
    const walkCamPos = new THREE.Vector3(-1.5, 1.75, 10.2);
    const walkTargetPos = new THREE.Vector3(-1.5, 1.75, 10.2);
    let walkYaw = 0;
    let walkPitch = 0;
    let isMouseLooking = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const keysPressed: Record<string, boolean> = {};

    const syncWalkthroughToStation = (stId: WalkthroughStationId) => {
      const st = STREET_VIEW_WAYPOINTS.find((w) => w.id === stId) || STREET_VIEW_WAYPOINTS[0];
      walkTargetPos.set(st.camPos[0], st.camPos[1], st.camPos[2]);
      const dx = st.lookAt[0] - st.camPos[0];
      const dy = st.lookAt[1] - st.camPos[1];
      const dz = st.lookAt[2] - st.camPos[2];
      walkYaw = Math.atan2(dx, dz);
      walkPitch = Math.atan2(dy, Math.hypot(dx, dz));
    };

    syncWalkthroughToStation(walkthroughStation);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      isMouseLooking = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!isMouseLooking || !stateRef.current.isWalkthrough) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      walkYaw -= dx * 0.0045;
      walkPitch = THREE.MathUtils.clamp(walkPitch - dy * 0.0035, -Math.PI / 3, Math.PI / 3);
    };

    const handlePointerUp = (e: MouseEvent) => {
      isMouseLooking = false;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // 1. Check Street View Floor Waypoint Chevrons first
      const wpHits = raycaster.intersectObjects(waypointMeshes, true);
      if (wpHits.length > 0) {
        let obj: THREE.Object3D | null = wpHits[0].object;
        while (obj && obj !== scene) {
          if (obj.name.startsWith('streetview_wp_')) {
            const stId = obj.name.replace('streetview_wp_', '') as WalkthroughStationId;
            stateRef.current.onChangeStation(stId);
            syncWalkthroughToStation(stId);
            return;
          }
          obj = obj.parent;
        }
      }

      // 2. Check 16 Electrical Components & 4 Appliances
      const compHits = raycaster.intersectObjects(interactiveRoots, true);
      if (compHits.length > 0) {
        let obj: THREE.Object3D | null = compHits[0].object;
        while (obj && obj !== scene) {
          if (obj.name.startsWith('solar_comp_')) {
            const compId = obj.name.replace('solar_comp_', '');
            stateRef.current.onSelectComponent(compId);
            return;
          }
          if (obj.name === 'appliance_fan') {
            stateRef.current.onToggleAppliance('fanOn');
            return;
          }
          if (obj.name === 'appliance_lights') {
            stateRef.current.onToggleAppliance('lightsOn');
            return;
          }
          if (obj.name === 'appliance_tv') {
            stateRef.current.onToggleAppliance('tvOn');
            return;
          }
          if (obj.name === 'appliance_ac') {
            stateRef.current.onToggleAppliance('acOn');
            return;
          }
          obj = obj.parent;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      keysPressed[e.code] = true;
      if (e.code === 'KeyF') stateRef.current.onToggleAppliance('fanOn');
      if (e.code === 'KeyL') stateRef.current.onToggleAppliance('lightsOn');
      if (e.code === 'KeyT') stateRef.current.onToggleAppliance('tvOn');
      if (e.code === 'KeyC') stateRef.current.onToggleAppliance('acOn');
      if (e.code === 'KeyE') {
        // Inspect nearest electrical component to current camera position
        let nearestId = stateRef.current.selectedComponentId;
        let minDist = Infinity;
        SOLAR_EQUIPMENT_COMPONENTS.forEach((c) => {
          const d = camera.position.distanceTo(
            new THREE.Vector3(c.position3D[0], c.position3D[1], c.position3D[2])
          );
          if (d < minDist) {
            minDist = d;
            nearestId = c.id;
          }
        });
        stateRef.current.onSelectComponent(nearestId);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 8. ANIMATION LOOP
    // =========================================================================
    const clock = new THREE.Clock();
    let frameId = 0;
    let lastCapacityId = stateRef.current.capacityId;
    let lastViewMode: SolarViewMode | null = null;
    let lastWalkStation = stateRef.current.walkthroughStation;
    let currentExploded = 0;
    let pulsePhase = 0;
    let labelUpdateTimer = 0;
    const scratchVec = new THREE.Vector3();

    const viewPresetsMap: Record<SolarViewMode, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
      isometric: {
        pos: new THREE.Vector3(-16.5, 13.5, 16.5),
        target: new THREE.Vector3(-1.2, 4.2, 0.0),
      },
      top: {
        pos: new THREE.Vector3(0.0, 26.5, 0.8),
        target: new THREE.Vector3(0.0, 6.2, 0.0),
      },
      side: {
        pos: new THREE.Vector3(-23.0, 5.2, 0.0),
        target: new THREE.Vector3(-1.5, 4.5, 0.0),
      },
      exploded: {
        pos: new THREE.Vector3(-21.5, 12.0, 14.5),
        target: new THREE.Vector3(-2.5, 4.4, -0.5),
      },
    };

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const st = stateRef.current;

      // Rebuild PV array if capacity preset changed
      if (st.capacityId !== lastCapacityId) {
        lastCapacityId = st.capacityId;
        buildPvArrayForCapacity(st.capacityId);
      }

      // Sync station when changed via UI buttons
      if (st.walkthroughStation !== lastWalkStation) {
        lastWalkStation = st.walkthroughStation;
        syncWalkthroughToStation(st.walkthroughStation);
      }

      // Handle imperative Zoom In / Zoom Out / Reset camera actions
      if (cameraActionRef.current) {
        const act = cameraActionRef.current.type;
        cameraActionRef.current = null;
        if (act === 'zoom_in') {
          camera.position.lerp(controls.target, 0.22);
        } else if (act === 'zoom_out') {
          const dir = camera.position.clone().sub(controls.target).multiplyScalar(1.25);
          camera.position.copy(controls.target).add(dir);
        } else if (act === 'reset') {
          const vp = viewPresetsMap[st.viewMode] || viewPresetsMap.isometric;
          camera.position.copy(vp.pos);
          controls.target.copy(vp.target);
        }
      }

      // 1. Exploded View Damping
      const targetExploded = st.viewMode === 'exploded' ? 1.0 : 0.0;
      currentExploded += (targetExploded - currentExploded) * (1 - Math.exp(-6 * delta));

      SOLAR_EQUIPMENT_COMPONENTS.forEach((comp) => {
        const grp = componentGroupsMap[comp.id];
        const base = componentBasePosMap[comp.id];
        const off = componentExplodedOffsetMap[comp.id];
        if (grp && base && off) {
          grp.position.set(
            base.x + off.x * currentExploded,
            base.y + off.y * currentExploded,
            base.z + off.z * currentExploded
          );
        }
      });

      // Show/hide Hybrid BESS cabinet
      bessCabinet.visible = st.isHybridBess;

      // 2. Day / Cloudy / Night Sky & Sun Illumination
      const isNight = st.operatingMode === 'night' || st.irradiance <= 10;
      const isCloudy = st.operatingMode === 'cloudy';
      if (isNight) {
        scene.background = new THREE.Color(0x030712);
        sunLight.intensity = 0.15;
        hemiLight.intensity = 0.35;
        sunOrb.visible = false;
      } else if (isCloudy) {
        scene.background = new THREE.Color(0x1e293b);
        sunLight.intensity = 1.05;
        hemiLight.intensity = 0.65;
        sunOrb.visible = true;
        sunOrbMat.color.setHex(0x94a3b8);
      } else {
        scene.background = new THREE.Color(0x091326);
        sunLight.intensity = 2.4;
        hemiLight.intensity = 0.9;
        sunOrb.visible = true;
        sunOrbMat.color.setHex(0xfacc15);
      }

      // 3. Appliances Animation ([F] Fan, [L] Lights, [T] TV, [C] AC)
      const housePowered = st.gridOnline || st.isHybridBess;
      if (st.appliances.fanOn && housePowered) {
        fanBladesGroup.rotation.y += delta * 9.5;
      }
      livingLight.intensity = st.appliances.lightsOn && housePowered ? 2.2 : 0.1;
      terraceLight.intensity = st.appliances.lightsOn && housePowered ? 1.6 : 0.1;
      lightFixtureMat.color.setHex(st.appliances.lightsOn && housePowered ? 0xfef08a : 0x334155);
      tvScreenMat.color.setHex(st.appliances.tvOn && housePowered ? 0x38bdf8 : 0x0f172a);
      acLedMat.color.setHex(st.appliances.acOn && housePowered ? 0x22d3ee : 0x334155);

      // Inverter Screen Color (Green = Normal, Red = Grid Fault Anti-Islanding, Amber = Hybrid Backup)
      if (!st.gridOnline && !st.isHybridBess) {
        invScreenMat.color.setHex(0xef4444);
      } else if (!st.gridOnline && st.isHybridBess) {
        invScreenMat.color.setHex(0xf59e0b);
      } else {
        invScreenMat.color.setHex(0x10b981);
      }

      // 4. Power-Flow Particle Animation
      pulsePhase = (pulsePhase + delta * 0.45) % 1.0;
      const solarActive = st.solarGenKw > 0.05;
      const inverterTripped = !st.gridOnline && !st.isHybridBess;

      // Sunlight pulses
      sunPulses.forEach((p, idx) => {
        if (!solarActive) {
          p.visible = false;
        } else {
          p.visible = true;
          const u = (pulsePhase + idx / sunPulses.length) % 1.0;
          const curve = idx % 2 === 0 ? sunCurve1 : sunCurve2;
          curve.getPoint(u, scratchVec);
          p.position.copy(scratchVec);
        }
      });

      // DC String Pulses
      dcPulses.forEach((p, idx) => {
        if (!solarActive || inverterTripped) {
          p.visible = false;
        } else {
          p.visible = true;
          const u = (pulsePhase + idx / dcPulses.length) % 1.0;
          dcFlowCurve.getPoint(u, scratchVec);
          p.position.copy(scratchVec);
        }
      });

      // AC Inverter -> MDB Pulses
      acPulses.forEach((p, idx) => {
        if (!solarActive || inverterTripped) {
          p.visible = false;
        } else {
          p.visible = true;
          const u = (pulsePhase + idx / acPulses.length) % 1.0;
          acFlowCurve.getPoint(u, scratchVec);
          p.position.copy(scratchVec);
        }
      });

      // Home Load Pulses
      homePulses.forEach((p, idx) => {
        if (st.homeLoadKw <= 0.05 || !housePowered) {
          p.visible = false;
        } else {
          p.visible = true;
          const u = (pulsePhase + idx / homePulses.length) % 1.0;
          homeLoadCurve.getPoint(u, scratchVec);
          p.position.copy(scratchVec);
        }
      });

      // Bidirectional Grid Pulses (Export = MDB -> Pole in Green; Import = Pole -> MDB in Amber/Blue)
      gridPulses.forEach((p, idx) => {
        if (!st.gridOnline || (st.gridExportKw <= 0.02 && st.gridImportKw <= 0.02)) {
          p.visible = false;
        } else {
          p.visible = true;
          const isExporting = st.gridExportKw >= st.gridImportKw;
          const rawU = (pulsePhase + idx / gridPulses.length) % 1.0;
          const u = isExporting ? rawU : 1.0 - rawU;
          gridFlowCurve.getPoint(u, scratchVec);
          p.position.copy(scratchVec);
          (p.material as THREE.MeshBasicMaterial).color.setHex(
            isExporting ? 0x10b981 : 0xf59e0b
          );
        }
      });

      // 5. Camera Control: Walkthrough (WASD + Google Street View Logic) & Engineering View Modes
      const moveFwd =
        (keysPressed['KeyW'] || keysPressed['ArrowUp'] ? 1 : 0) -
        (keysPressed['KeyS'] || keysPressed['ArrowDown'] ? 1 : 0);
      const moveStrafe =
        (keysPressed['KeyD'] || keysPressed['ArrowRight'] ? 1 : 0) -
        (keysPressed['KeyA'] || keysPressed['ArrowLeft'] ? 1 : 0);
      const isSprinting = keysPressed['ShiftLeft'] || keysPressed['ShiftRight'];

      if (st.isWalkthrough) {
        controls.enabled = false;

        if (moveFwd !== 0 || moveStrafe !== 0) {
          const speed = (isSprinting ? 7.5 : 4.6) * delta;
          const fwdX = Math.sin(walkYaw);
          const fwdZ = Math.cos(walkYaw);
          const rightX = -fwdZ;
          const rightZ = fwdX;

          walkTargetPos.x += (fwdX * moveFwd + rightX * moveStrafe) * speed;
          walkTargetPos.z += (fwdZ * moveFwd + rightZ * moveStrafe) * speed;

          // Clamp within compound & street bounds
          walkTargetPos.x = THREE.MathUtils.clamp(walkTargetPos.x, -11.5, 9.5);
          walkTargetPos.z = THREE.MathUtils.clamp(walkTargetPos.z, -8.5, 13.5);

          // Automatically adjust elevation if walking on external staircase (-6.4 <= x <= -4.4)
          if (walkTargetPos.x >= -6.5 && walkTargetPos.x <= -4.4 && walkTargetPos.z >= -2.8 && walkTargetPos.z <= 4.8) {
            const stairProgress = THREE.MathUtils.clamp((4.6 - walkTargetPos.z) / 7.0, 0, 1);
            walkTargetPos.y = 1.75 + stairProgress * 6.0;
          } else if (
            walkTargetPos.y > 4.5 &&
            walkTargetPos.x >= -5.2 &&
            walkTargetPos.x <= 5.2 &&
            walkTargetPos.z >= -4.8 &&
            walkTargetPos.z <= 4.4
          ) {
            walkTargetPos.y = 7.75; // Rooftop terrace eye level
          } else if (walkTargetPos.y <= 4.5) {
            walkTargetPos.y = 1.75; // Ground level eye level
          }
        }

        walkCamPos.lerp(walkTargetPos, 1 - Math.exp(-9 * delta));
        camera.position.copy(walkCamPos);

        const lookDir = new THREE.Vector3(
          Math.sin(walkYaw) * Math.cos(walkPitch),
          Math.sin(walkPitch),
          Math.cos(walkYaw) * Math.cos(walkPitch)
        );
        camera.lookAt(walkCamPos.clone().add(lookDir));
      } else {
        controls.enabled = true;
        if (st.viewMode !== lastViewMode) {
          lastViewMode = st.viewMode;
          isUserDraggingOrbit = false;
        }
        if (moveFwd !== 0 || moveStrafe !== 0) {
          isUserDraggingOrbit = true;
          const orbitMoveSpeed = (isSprinting ? 14.0 : 8.5) * delta;
          const camFwd = new THREE.Vector3();
          camera.getWorldDirection(camFwd);
          camFwd.y = 0;
          if (camFwd.lengthSq() > 0.0001) camFwd.normalize();
          const camRight = new THREE.Vector3(-camFwd.z, 0, camFwd.x);
          const stepVec = new THREE.Vector3()
            .addScaledVector(camFwd, moveFwd * orbitMoveSpeed)
            .addScaledVector(camRight, moveStrafe * orbitMoveSpeed);
          camera.position.add(stepVec);
          controls.target.add(stepVec);
        }
        if (!isUserDraggingOrbit) {
          const vp = viewPresetsMap[st.viewMode] || viewPresetsMap.isometric;
          camera.position.lerp(vp.pos, 1 - Math.exp(-4.5 * delta));
          controls.target.lerp(vp.target, 1 - Math.exp(-4.5 * delta));
        }
        controls.autoRotate = st.isAutoRotate && moveFwd === 0 && moveStrafe === 0;
        controls.autoRotateSpeed = 1.1;
        controls.update();
      }

      renderer.render(scene, camera);

      // Project 3D Equipment Labels & Street View Waypoints to 2D Screen Coordinates (12 fps throttle)
      labelUpdateTimer += delta;
      if (labelUpdateTimer > 0.08) {
        labelUpdateTimer = 0;
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;

        if (st.showLabels) {
          const nextLabels: ProjectedLabel[] = SOLAR_EQUIPMENT_COMPONENTS.map((comp) => {
            const grp = componentGroupsMap[comp.id];
            const worldPos = grp
              ? grp.position.clone().add(new THREE.Vector3(0, 0.38, 0))
              : new THREE.Vector3(...comp.position3D);
            worldPos.project(camera);
            const isBehind = worldPos.z > 1.0;
            return {
              id: comp.id,
              index: comp.index,
              shortLabel: comp.shortLabel,
              category: comp.category,
              x: (worldPos.x * 0.5 + 0.5) * w,
              y: (-(worldPos.y * 0.5) + 0.5) * h,
              visible: !isBehind && worldPos.x >= -0.95 && worldPos.x <= 0.95 && worldPos.y >= -0.9 && worldPos.y <= 0.9,
            };
          });
          setProjectedLabels(nextLabels);
        } else {
          setProjectedLabels([]);
        }

        const nextWps: ProjectedWaypoint[] = STREET_VIEW_WAYPOINTS.map((wp) => {
          const p = new THREE.Vector3(wp.markerPos[0], wp.markerPos[1] + 0.35, wp.markerPos[2]);
          p.project(camera);
          const isBehind = p.z > 1.0;
          return {
            id: wp.id,
            stepNumber: wp.stepNumber,
            title: wp.title,
            zone: wp.zone,
            x: (p.x * 0.5 + 0.5) * w,
            y: (-(p.y * 0.5) + 0.5) * h,
            visible: !isBehind && p.x >= -0.92 && p.x <= 0.92 && p.y >= -0.88 && p.y <= 0.88,
          };
        });
        setProjectedWaypoints(nextWps);
      }

      frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 3D Floating Interactive Equipment Labels (All 16 Components) */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {projectedLabels.map((lbl) => {
            if (!lbl.visible) return null;
            const isSelected = selectedComponentId === lbl.id;
            return (
              <button
                key={lbl.id}
                onClick={() => onSelectComponent(lbl.id)}
                style={{
                  transform: `translate(${Math.round(lbl.x)}px, ${Math.round(lbl.y)}px) translate(-50%, -100%)`,
                }}
                className={`pointer-events-auto absolute top-0 left-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md border whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#f59e0b] text-slate-950 border-white scale-110 z-30 shadow-amber-500/40'
                    : 'bg-[#0f172a]/88 hover:bg-[#1e293b] text-slate-100 border-sky-400/50 hover:border-amber-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-slate-950' : 'bg-[#38bdf8]'
                  }`}
                />
                <span>{lbl.shortLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Google Street View Clickable Arrow Hotspots Overlay in Walkthrough Mode */}
      {isWalkthrough && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
          {projectedWaypoints.map((wp) => {
            if (!wp.visible || wp.id === walkthroughStation) return null;
            return (
              <button
                key={wp.id}
                onClick={() => onChangeStation(wp.id)}
                style={{
                  transform: `translate(${Math.round(wp.x)}px, ${Math.round(wp.y)}px) translate(-50%, -50%)`,
                }}
                className="pointer-events-auto absolute top-0 left-0 group flex flex-col items-center cursor-pointer"
                title={`Move to ${wp.title}`}
              >
                <div className="w-10 h-10 rounded-full bg-sky-500/30 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.65)] group-hover:scale-125 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-300 transition-all">
                  <span className="material-symbols-outlined text-[22px]">navigation</span>
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-amber-400/50 text-[10px] font-mono font-bold text-amber-300 whitespace-nowrap shadow">
                  Step {wp.stepNumber}: {wp.title.split('&')[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
