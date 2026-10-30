import * as THREE from 'three';
import {
  ResidentialProject,
  OpeningData,
  ColliderBox,
  ElectricalPoint
} from '../types/residentialDesigner';
import {
  createFloorTilesTexture,
  createBrickWallTexture,
  createDbScheduleTexture,
  createIndianSocketTexture,
  createSwitchPlateTexture,
  createEarthChamberTexture,
  createWalnutWoodTexture,
  createOakWoodTexture,
  createFlutedPanelTexture,
  createVitrifiedTileTexture,
  createTerrazzoTexture,
  createSubwayTileTexture,
  createWovenRugTexture,
  createFramedArtworkTexture,
  createSmartTvScreenTexture
} from './proceduralTextures';

export type ViewMode3D = 'finished' | 'cutaway' | 'construction';

export interface ResidentialLayerVisibility {
  architecture: boolean;
  furniture: boolean;
  lighting: boolean;
  conduits: boolean;
  wiring: boolean;
  distribution: boolean;
}

export interface CircuitSubLayerFilter {
  lighting: boolean;
  power: boolean;
  heavy: boolean;
  earthing: boolean;
}

export interface DoorPivotEntry {
  id: string;
  roomId: string;
  label: string;
  pivot: THREE.Group;
  closedAngle: number;
  openAngle: number;
  currentAngle: number;
  worldX: number;
  worldZ: number;
}

export interface GeneratedTwin {
  rootGroup: THREE.Group;
  houseCenter: THREE.Vector3;
  buildingBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  colliders: ColliderBox[];
  doorPivots: Map<string, DoorPivotEntry>;
  fanRotators: { group: THREE.Group; speedMultiplier: number; pointId: string; circuitId: string }[];
  dbDoorPivot: THREE.Group | null;
  interactiveMeshes: Map<string, THREE.Object3D>;
  activeConduitMaterials: THREE.MeshStandardMaterial[];
  update: (
    delta: number,
    fanSpeedLevel: number,
    activeCircuitId: string,
    options?: {
      layers?: ResidentialLayerVisibility;
      circuitFilter?: CircuitSubLayerFilter;
      wallOpacity?: number;
      dbExploded?: boolean;
      dbDoorOpen?: boolean;
      breakerStates?: Record<string, boolean>;
      doorStates?: Record<string, boolean>;
      electricalPoints?: ElectricalPoint[];
    }
  ) => void;
  dispose: () => void;
}

export function generateParametricTwin(
  project: ResidentialProject,
  viewMode: ViewMode3D,
  ceilingVisible: boolean,
  dbDoorOpen: boolean,
  activeCircuitId: string
): GeneratedTwin {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ParametricHouseTwin';

  const interactiveMeshes = new Map<string, THREE.Object3D>();
  const doorPivots = new Map<string, DoorPivotEntry>();
  const colliders: ColliderBox[] = [];
  const fanRotators: { group: THREE.Group; speedMultiplier: number; pointId: string; circuitId: string }[] = [];
  let dbDoorPivot: THREE.Group | null = null;
  const activeConduitMaterials: THREE.MeshStandardMaterial[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  // Dynamic point light & indicator registries for real-time switching without scene rebuild
  const pointLightRegistry = new Map<
    string,
    { light: THREE.PointLight; diffuserMat: THREE.MeshBasicMaterial; circuitId: string }
  >();
  const indicatorRegistry = new Map<
    string,
    { mat: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial; onHex: number; offHex: number; circuitId: string }
  >();
  // Cove & Decorative Lamp emissive meshes linked to room lighting state
  const decorativeLightMeshes: {
    roomId: string;
    circuitId: string;
    mat: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
    onColor: number;
    offColor: number;
    emissiveOn: number;
    auxLight?: THREE.PointLight;
    auxIntensity?: number;
  }[] = [];

  // Smart TV dynamic screen registry (linked to pt_living_socket1)
  let smartTvScreenMesh: THREE.Mesh | null = null;
  let smartTvGlowLight: THREE.PointLight | null = null;
  let lastTvState: boolean | null = null;

  // Smart AC dynamic louvres & displays (linked to pt_living_ac, pt_master_ac, pt_bed2_ac)
  const acUnitRegistry = new Map<
    string,
    {
      displayMat: THREE.MeshBasicMaterial;
      louvreMesh: THREE.Mesh;
      circuitId: string;
    }
  >();

  const circuitMeshGroups = new Map<
    string,
    {
      category: 'lighting' | 'power' | 'heavy' | 'earthing';
      conduitMat: THREE.MeshStandardMaterial;
      phaseMat: THREE.MeshStandardMaterial;
      jboxMat: THREE.MeshStandardMaterial;
      baseColor: THREE.Color;
      meshes: THREE.Object3D[];
    }
  >();
  const earthConductorMeshes: THREE.Object3D[] = [];

  // Layer sub-groups
  const architectureGroup = new THREE.Group();
  architectureGroup.name = 'Layer_Architecture';
  const furnitureGroup = new THREE.Group();
  furnitureGroup.name = 'Layer_Furniture';
  const lightingGroup = new THREE.Group();
  lightingGroup.name = 'Layer_Lighting';
  const conduitsGroup = new THREE.Group();
  conduitsGroup.name = 'Layer_Conduits';
  const wiringGroup = new THREE.Group();
  wiringGroup.name = 'Layer_Wiring';
  const distributionGroup = new THREE.Group();
  distributionGroup.name = 'Layer_Distribution';

  // Exploded DB sub-layers for smooth animation
  const dbExplodeLayers: { group: THREE.Group; targetOffsetZ: number; targetOffsetX: number }[] = [];
  const breakerToggleMeshes = new Map<string, THREE.Mesh>();

  // Procedural PBR Textures
  const floorTileTex = createFloorTilesTexture();
  const vitrifiedIvoryTex = createVitrifiedTileTexture('warm_ivory');
  const vitrifiedBeigeTex = createVitrifiedTileTexture('beige_marble');
  const stoneBathTileTex = createVitrifiedTileTexture('stone_grey');
  const walnutWoodTex = createWalnutWoodTexture();
  const oakWoodTex = createOakWoodTexture();
  const flutedWalnutTex = createFlutedPanelTexture('walnut');
  const flutedCreamTex = createFlutedPanelTexture('cream');
  const terrazzoTex = createTerrazzoTexture();
  const subwayTileTex = createSubwayTileTexture();
  const rugLivingTex = createWovenRugTexture('living_taupe');
  const rugMasterTex = createWovenRugTexture('master_beige');
  const rugKidsTex = createWovenRugTexture('kids_geometric');
  const artTex0 = createFramedArtworkTexture(0);
  const artTex1 = createFramedArtworkTexture(1);
  const artTex2 = createFramedArtworkTexture(2);
  const artTex3 = createFramedArtworkTexture(3);
  const tvOnTex = createSmartTvScreenTexture(true);
  const tvOffTex = createSmartTvScreenTexture(false);
  const brickWallTex = createBrickWallTexture();
  const dbScheduleTex = createDbScheduleTexture();
  const socketTex = createIndianSocketTexture();
  const switchPlateTex = createSwitchPlateTexture();
  const earthPitTex = createEarthChamberTexture();

  disposables.push(
    floorTileTex,
    vitrifiedIvoryTex,
    vitrifiedBeigeTex,
    stoneBathTileTex,
    walnutWoodTex,
    oakWoodTex,
    flutedWalnutTex,
    flutedCreamTex,
    terrazzoTex,
    subwayTileTex,
    rugLivingTex,
    rugMasterTex,
    rugKidsTex,
    artTex0,
    artTex1,
    artTex2,
    artTex3,
    tvOnTex,
    tvOffTex,
    brickWallTex,
    dbScheduleTex,
    socketTex,
    switchPlateTex,
    earthPitTex
  );

  // Shared Architectural Materials
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: viewMode === 'construction' ? undefined : vitrifiedIvoryTex,
    color: viewMode === 'construction' ? 0x78716c : 0xfaf7f2,
    roughness: viewMode === 'construction' ? 0.9 : 0.16,
    metalness: 0.08
  });

  // Warm Ivory Residential Wall Plaster
  const wallPlasterMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5efe6,
    roughness: 0.72,
    metalness: 0.02,
    transparent: true,
    opacity: 1.0
  });

  const wallCutawayMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });

  const wallBrickMaterial = new THREE.MeshStandardMaterial({
    map: brickWallTex,
    color: 0xb91c1c,
    roughness: 0.9,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85
  });

  const concreteCeilingMaterial = new THREE.MeshStandardMaterial({
    color: viewMode === 'construction' ? 0x64748b : 0xfbf9f5,
    roughness: 0.75,
    metalness: 0.03,
    transparent: viewMode === 'cutaway',
    opacity: viewMode === 'cutaway' ? 0.18 : 1.0,
    depthWrite: viewMode !== 'cutaway',
    side: THREE.DoubleSide
  });

  const woodDoorMaterial = new THREE.MeshStandardMaterial({
    map: walnutWoodTex,
    color: 0x8b5a36,
    roughness: 0.38,
    metalness: 0.06
  });

  const doorFrameMaterial = new THREE.MeshStandardMaterial({
    map: walnutWoodTex,
    color: 0x5c3a21,
    roughness: 0.45,
    metalness: 0.08
  });

  const doorHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.22,
    metalness: 0.9
  });

  const glassWindowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.65,
    transparent: true,
    opacity: 0.42
  });

  const aluminumFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.28,
    metalness: 0.85
  });

  const walnutMat = new THREE.MeshStandardMaterial({
    map: walnutWoodTex,
    color: 0x8c5834,
    roughness: 0.36,
    metalness: 0.06
  });

  const oakMat = new THREE.MeshStandardMaterial({
    map: oakWoodTex,
    color: 0xd4a373,
    roughness: 0.42,
    metalness: 0.05
  });

  const flutedWalnutMat = new THREE.MeshStandardMaterial({
    map: flutedWalnutTex,
    color: 0x9c663c,
    roughness: 0.4,
    metalness: 0.06
  });

  const flutedCreamMat = new THREE.MeshStandardMaterial({
    map: flutedCreamTex,
    color: 0xf3ece0,
    roughness: 0.55,
    metalness: 0.02
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.14,
    metalness: 0.94
  });

  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.26,
    metalness: 0.85
  });

  const matteBlackMetalMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.35,
    metalness: 0.8
  });

  disposables.push(
    floorMaterial,
    wallPlasterMaterial,
    wallCutawayMaterial,
    wallBrickMaterial,
    concreteCeilingMaterial,
    woodDoorMaterial,
    doorFrameMaterial,
    doorHandleMaterial,
    glassWindowMaterial,
    aluminumFrameMaterial,
    walnutMat,
    oakMat,
    flutedWalnutMat,
    flutedCreamMat,
    chromeMat,
    brushedSteelMat,
    matteBlackMetalMat
  );

  // 1. Calculate overall building bounding box
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  project.rooms.forEach((r) => {
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.width);
    minZ = Math.min(minZ, r.z);
    maxZ = Math.max(maxZ, r.z + r.length);
  });

  const buildingW = maxX - minX;
  const buildingL = maxZ - minZ;
  const centerX = minX + buildingW / 2;
  const centerZ = minZ + buildingL / 2;

  const houseGroup = new THREE.Group();
  houseGroup.position.set(-centerX, 0, -centerZ);
  houseGroup.add(architectureGroup, furnitureGroup, lightingGroup, conduitsGroup, wiringGroup, distributionGroup);
  rootGroup.add(houseGroup);

  // Helper to register an AABB collider in world space (shifted by -centerX, -centerZ)
  const addCollider = (
    id: string,
    projCenterX: number,
    projCenterZ: number,
    widthX: number,
    depthZ: number,
    category: 'wall' | 'furniture' | 'door',
    doorId?: string
  ) => {
    const wx = projCenterX - centerX;
    const wz = projCenterZ - centerZ;
    colliders.push({
      id,
      minX: wx - widthX / 2,
      maxX: wx + widthX / 2,
      minZ: wz - depthZ / 2,
      maxZ: wz + depthZ / 2,
      category,
      doorId
    });
  };

  // Helper to create a box mesh with optional custom material & optional furniture collision
  const addBox = (
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    color: number,
    x: number,
    y: number,
    z: number,
    roughness = 0.5,
    metalness = 0.08,
    opacity = 1.0,
    registerCollision = false,
    customMat?: THREE.Material
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat =
      customMat ||
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        transparent: opacity < 1.0,
        opacity
      });
    if (!customMat) disposables.push(mat);
    disposables.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = opacity === 1.0;
    mesh.receiveShadow = true;
    parent.add(mesh);

    if (registerCollision) {
      addCollider(`furn_${x.toFixed(1)}_${z.toFixed(1)}`, x, z, w * 0.78, d * 0.78, 'furniture');
    }
    return mesh;
  };

  // Helper: Create a realistic potted indoor plant (ceramic pot + soil + trunk + lush foliage spheres)
  const addPottedPlant = (
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    scale = 1.0,
    potColor = 0xd6cbb9
  ) => {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, y, z);

    const potGeo = new THREE.CylinderGeometry(0.18 * scale, 0.14 * scale, 0.34 * scale, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: potColor, roughness: 0.65 });
    const stemGeo = new THREE.CylinderGeometry(0.025 * scale, 0.035 * scale, 0.75 * scale, 10);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
    const leafGeo = new THREE.SphereGeometry(0.24 * scale, 12, 12);
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
    disposables.push(potGeo, potMat, stemGeo, stemMat, leafGeo, leafMat1, leafMat2);

    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.17 * scale;
    pot.castShadow = true;
    plantGroup.add(pot);

    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.52 * scale;
    plantGroup.add(stem);

    const clusters = [
      [0, 0.92, 0, 1.15],
      [-0.14, 0.78, 0.1, 0.85],
      [0.15, 0.82, -0.08, 0.9],
      [0.08, 0.68, 0.14, 0.8],
      [-0.1, 1.05, -0.08, 0.75]
    ];
    clusters.forEach(([cx, cy, cz, s], idx) => {
      const leaf = new THREE.Mesh(leafGeo, idx % 2 === 0 ? leafMat1 : leafMat2);
      leaf.position.set(cx * scale, cy * scale, cz * scale);
      leaf.scale.set(s, s * 0.85, s);
      leaf.castShadow = true;
      plantGroup.add(leaf);
    });

    parent.add(plantGroup);
  };

  // Helper: Create sheer + heavy pleated curtains along a window or balcony door
  const addWindowCurtains = (
    parent: THREE.Object3D,
    centerXPos: number,
    centerZPos: number,
    spanWidth: number,
    height: number,
    isHorizontalWall: boolean,
    drapeColorHex = 0x8b5a2b
  ) => {
    const curtainGroup = new THREE.Group();
    curtainGroup.position.set(centerXPos, 0, centerZPos);
    if (!isHorizontalWall) {
      curtainGroup.rotation.y = Math.PI / 2;
    }

    // Pelmet / Curtain Rod
    addBox(curtainGroup, spanWidth + 0.5, 0.06, 0.12, 0x27272a, 0, height - 0.05, 0, 0.4, 0.7);

    // Sheer White Inner Curtain
    const sheerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      transparent: true,
      opacity: 0.42
    });
    const drapeMat = new THREE.MeshStandardMaterial({
      color: drapeColorHex,
      roughness: 0.78,
      metalness: 0.05
    });
    disposables.push(sheerMat, drapeMat);

    addBox(
      curtainGroup,
      spanWidth - 0.1,
      height - 0.14,
      0.03,
      0xffffff,
      0,
      (height - 0.14) / 2 + 0.04,
      0,
      0.6,
      0,
      0.42,
      false,
      sheerMat
    );

    // Left & Right Pleated Heavy Drape Panels
    const panelW = Math.min(0.68, spanWidth * 0.24);
    const leftX = -spanWidth / 2 - panelW * 0.15;
    const rightX = spanWidth / 2 + panelW * 0.15;
    for (let p = -2; p <= 2; p++) {
      const pleatOffset = p * (panelW / 5);
      addBox(
        curtainGroup,
        panelW / 4.6,
        height - 0.1,
        0.09,
        drapeColorHex,
        leftX + pleatOffset,
        (height - 0.1) / 2 + 0.03,
        0.03,
        0.8,
        0.04,
        1,
        false,
        drapeMat
      );
      addBox(
        curtainGroup,
        panelW / 4.6,
        height - 0.1,
        0.09,
        drapeColorHex,
        rightX + pleatOffset,
        (height - 0.1) / 2 + 0.03,
        0.03,
        0.8,
        0.04,
        1,
        false,
        drapeMat
      );
    }

    parent.add(curtainGroup);
  };

  // Helper: Create Multi-Level Tray False Ceiling with Glowing Warm LED Cove Strip
  const addFalseCeilingTray = (
    parent: THREE.Object3D,
    roomId: string,
    circuitId: string,
    rx: number,
    rz: number,
    rw: number,
    rl: number,
    ceilH: number
  ) => {
    const border = Math.min(0.65, Math.min(rw, rl) * 0.14);
    const dropH = 0.14;
    const trayY = ceilH - dropH / 2;

    // 4 Perimeter Dropped Gypsum Ceiling Soffit Bands
    addBox(parent, rw, dropH, border, 0xfaf7f2, rx + rw / 2, trayY, rz + border / 2, 0.7, 0.02);
    addBox(parent, rw, dropH, border, 0xfaf7f2, rx + rw / 2, trayY, rz + rl - border / 2, 0.7, 0.02);
    addBox(
      parent,
      border,
      dropH,
      rl - border * 2,
      0xfaf7f2,
      rx + border / 2,
      trayY,
      rz + rl / 2,
      0.7,
      0.02
    );
    addBox(
      parent,
      border,
      dropH,
      rl - border * 2,
      0xfaf7f2,
      rx + rw - border / 2,
      trayY,
      rz + rl / 2,
      0.7,
      0.02
    );

    // Warm Golden LED Cove Strip around inner perimeter of tray
    const coveMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.35,
      roughness: 0.2
    });
    disposables.push(coveMat);

    const innerW = rw - border * 2;
    const innerL = rl - border * 2;
    const coveY = ceilH - dropH + 0.025;
    addBox(parent, innerW, 0.025, 0.03, 0xfef08a, rx + rw / 2, coveY, rz + border, 0.2, 0, 1, false, coveMat);
    addBox(
      parent,
      innerW,
      0.025,
      0.03,
      0xfef08a,
      rx + rw / 2,
      coveY,
      rz + rl - border,
      0.2,
      0,
      1,
      false,
      coveMat
    );
    addBox(parent, 0.03, 0.025, innerL, 0xfef08a, rx + border, coveY, rz + rl / 2, 0.2, 0, 1, false, coveMat);
    addBox(
      parent,
      0.03,
      0.025,
      innerL,
      0xfef08a,
      rx + rw - border,
      coveY,
      rz + rl / 2,
      0.2,
      0,
      1,
      false,
      coveMat
    );

    decorativeLightMeshes.push({
      roomId,
      circuitId,
      mat: coveMat,
      onColor: 0xfef08a,
      offColor: 0x64748b,
      emissiveOn: 1.35
    });
  };

  // Helper: Create Wall-Mounted Smart Split AC Unit with Digital Temperature LED & Louvre
  const addSmartSplitAc = (
    parent: THREE.Object3D,
    acPointId: string,
    circuitId: string,
    x: number,
    y: number,
    z: number,
    rotY = 0
  ) => {
    const acGroup = new THREE.Group();
    acGroup.position.set(x, y, z);
    acGroup.rotation.y = rotY;

    // Sleek Curved White Indoor Unit Body
    addBox(acGroup, 1.12, 0.3, 0.23, 0xf8fafc, 0, 0, 0, 0.22, 0.12);
    // Silver Trim Line
    addBox(acGroup, 1.1, 0.012, 0.24, 0xcbd5e1, 0, -0.06, 0, 0.2, 0.85);

    // Motorized Louvre Blade
    const louvreGeo = new THREE.BoxGeometry(1.06, 0.035, 0.02);
    const louvreMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    disposables.push(louvreGeo, louvreMat);
    const louvreMesh = new THREE.Mesh(louvreGeo, louvreMat);
    louvreMesh.position.set(0, -0.13, 0.11);
    louvreMesh.rotation.x = 0.45;
    acGroup.add(louvreMesh);

    // Glowing Cyan 24°C LED Indicator Badge
    const dispGeo = new THREE.PlaneGeometry(0.14, 0.055);
    const dispMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    disposables.push(dispGeo, dispMat);
    const dispMesh = new THREE.Mesh(dispGeo, dispMat);
    dispMesh.position.set(0.38, 0.02, 0.118);
    acGroup.add(dispMesh);

    acUnitRegistry.set(acPointId, {
      displayMat: dispMat,
      louvreMesh,
      circuitId
    });

    acGroup.userData = {
      interactiveType: 'electrical',
      pointId: acPointId,
      circuitId
    };
    interactiveMeshes.set(`ac_unit_${acPointId}`, acGroup);
    parent.add(acGroup);
  };

  // Helper: Create Framed Wall Painting with Gallery Mat
  const addFramedPainting = (
    parent: THREE.Object3D,
    artTex: THREE.CanvasTexture,
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    rotY = 0
  ) => {
    const frameGroup = new THREE.Group();
    frameGroup.position.set(x, y, z);
    frameGroup.rotation.y = rotY;

    addBox(frameGroup, w + 0.06, h + 0.06, 0.035, 0x1e293b, 0, 0, 0, 0.35, 0.4);
    const canvasGeo = new THREE.PlaneGeometry(w, h);
    const canvasMat = new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.45 });
    disposables.push(canvasGeo, canvasMat);
    const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
    canvasMesh.position.z = 0.02;
    frameGroup.add(canvasMesh);

    parent.add(frameGroup);
  };

  // 2. Outdoor Plinth / Earth Base Slab + Exterior Surroundings
  const plinthMargin = 4.8;
  const plinthGeo = new THREE.BoxGeometry(buildingW + plinthMargin * 2, 0.2, buildingL + plinthMargin * 2);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9
  });
  disposables.push(plinthGeo, plinthMat);
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.set(centerX, -0.1, centerZ);
  plinthMesh.receiveShadow = true;
  architectureGroup.add(plinthMesh);

  // Exterior Entrance Corridor Landing outside Foyer
  const foyerRoom = project.rooms.find((r) => r.type === 'foyer');
  if (foyerRoom) {
    const landingW = foyerRoom.width + 1.8;
    const landingL = 3.2;
    const landingX = foyerRoom.x + foyerRoom.width / 2;
    const landingZ = foyerRoom.z - landingL / 2;
    addBox(
      architectureGroup,
      landingW,
      0.04,
      landingL,
      0xe2e8f0,
      landingX,
      0.02,
      landingZ,
      0.3,
      0.05,
      1,
      false,
      floorMaterial
    );
    // Grand Coir Welcome Mat outside Main Entrance Door
    addBox(
      architectureGroup,
      1.6,
      0.018,
      0.95,
      0x92400e,
      foyerRoom.x + foyerRoom.width / 2,
      0.045,
      foyerRoom.z - 0.7,
      0.9,
      0.0
    );
    // Potted Entrance Plants flanking Main Door
    addPottedPlant(architectureGroup, foyerRoom.x + 0.65, 0.04, foyerRoom.z - 0.65, 1.05, 0x44403c);
    addPottedPlant(
      architectureGroup,
      foyerRoom.x + foyerRoom.width - 0.65,
      0.04,
      foyerRoom.z - 0.65,
      1.05,
      0x44403c
    );
    // Warm Exterior Entrance Wall Sconce Light
    const sconceLight = new THREE.PointLight(0xffedd5, 1.8, 10.0, 1.4);
    sconceLight.position.set(foyerRoom.x + foyerRoom.width - 0.6, 2.45, foyerRoom.z - 0.35);
    architectureGroup.add(sconceLight);
    addBox(
      architectureGroup,
      0.18,
      0.34,
      0.1,
      0xfef08a,
      foyerRoom.x + foyerRoom.width - 0.6,
      2.45,
      foyerRoom.z - 0.1,
      0.2,
      0.1
    );
  }

  // 3. Room Floors, Skirting, False Ceilings & Photorealistic 3D Interior Furnishings
  project.rooms.forEach((room) => {
    const rx = room.x;
    const rz = room.z;
    const rw = room.width;
    const rl = room.length;
    const ch = room.ceilingHeight || 3.8;

    // Select authentic room flooring material
    let roomFloorMat: THREE.MeshStandardMaterial;
    if (room.type === 'bathroom') {
      roomFloorMat = new THREE.MeshStandardMaterial({
        map: viewMode === 'construction' ? undefined : stoneBathTileTex,
        color: 0x94a3b8,
        roughness: 0.32,
        metalness: 0.08
      });
    } else if (room.type === 'kitchen') {
      roomFloorMat = new THREE.MeshStandardMaterial({
        map: viewMode === 'construction' ? undefined : terrazzoTex,
        color: 0xf8fafc,
        roughness: 0.22,
        metalness: 0.06
      });
    } else if (room.type === 'balcony') {
      roomFloorMat = new THREE.MeshStandardMaterial({
        map: viewMode === 'construction' ? undefined : oakWoodTex,
        color: 0x9a6b3e,
        roughness: 0.55,
        metalness: 0.05
      });
    } else if (room.type === 'master_bedroom') {
      roomFloorMat = new THREE.MeshStandardMaterial({
        map: viewMode === 'construction' ? undefined : vitrifiedBeigeTex,
        color: 0xf5efe6,
        roughness: 0.15,
        metalness: 0.08
      });
    } else {
      roomFloorMat = floorMaterial.clone();
    }
    disposables.push(roomFloorMat);

    const floorGeo = new THREE.BoxGeometry(rw, 0.05, rl);
    disposables.push(floorGeo);
    const floorMesh = new THREE.Mesh(floorGeo, roomFloorMat);
    floorMesh.position.set(rx + rw / 2, 0.025, rz + rl / 2);
    floorMesh.receiveShadow = true;
    architectureGroup.add(floorMesh);

    // Perimeter Wall Skirting (10cm Walnut/Tile Baseboard)
    if (viewMode === 'finished' && room.type !== 'balcony') {
      const skirtH = 0.1;
      const skirtT = 0.02;
      addBox(architectureGroup, rw - 0.3, skirtH, skirtT, 0x5c3a21, rx + rw / 2, 0.09, rz + 0.07, 0.4, 0.05);
      addBox(
        architectureGroup,
        rw - 0.3,
        skirtH,
        skirtT,
        0x5c3a21,
        rx + rw / 2,
        0.09,
        rz + rl - 0.07,
        0.4,
        0.05
      );
      addBox(architectureGroup, skirtT, skirtH, rl - 0.3, 0x5c3a21, rx + 0.07, 0.09, rz + rl / 2, 0.4, 0.05);
      addBox(
        architectureGroup,
        skirtT,
        skirtH,
        rl - 0.3,
        0x5c3a21,
        rx + rw - 0.07,
        0.09,
        rz + rl / 2,
        0.4,
        0.05
      );
    }

    // Structural Ceiling Slab + Multi-Level False Ceiling with Cove Lighting
    if (ceilingVisible) {
      const ceilGeo = new THREE.BoxGeometry(rw, 0.12, rl);
      disposables.push(ceilGeo);
      const ceilMesh = new THREE.Mesh(ceilGeo, concreteCeilingMaterial);
      ceilMesh.position.set(rx + rw / 2, ch + 0.06, rz + rl / 2);
      ceilMesh.receiveShadow = true;
      architectureGroup.add(ceilMesh);

      if (
        viewMode === 'finished' &&
        (room.type === 'living' ||
          room.type === 'master_bedroom' ||
          room.type === 'bedroom_2' ||
          room.type === 'kitchen')
      ) {
        const circId =
          room.type === 'living' || room.type === 'kitchen'
            ? 'c1_living_lighting'
            : 'c2_bedroom_fan';
        addFalseCeilingTray(lightingGroup, room.id, circId, rx, rz, rw, rl, ch);
      }
    }

    // =========================================================================
    // 3B. PHOTOREALISTIC ROOM-BY-ROOM INTERIOR DESIGN (MATCHING 6 REF IMAGES)
    // =========================================================================
    const rmGroup = new THREE.Group();
    rmGroup.name = `Furniture_${room.id}`;

    if (room.type === 'living') {
      // -----------------------------------------------------------------------
      // LIVING ROOM & DINING AREA (Ref Images 1 & 4)
      // -----------------------------------------------------------------------
      const sofaW = Math.min(3.4, rw * 0.34);
      const sofaSideL = Math.min(2.35, rl * 0.3);
      const sofaX = rx + Math.max(sofaW / 2 + 0.75, rw * 0.25);
      const sofaZ = rz + rl - Math.min(1.45, rl * 0.2);

      // Large L-Shaped Sectional Sofa in Warm Beige/Taupe Bouclé Fabric
      // Wooden plinth base + tapered walnut legs
      addBox(rmGroup, sofaW, 0.09, 0.98, 0x5c3a21, sofaX, 0.09, sofaZ, 0.4, 0.05, 1, false, walnutMat);
      addBox(rmGroup, sofaW, 0.34, 0.96, 0xd8cfc2, sofaX, 0.28, sofaZ, 0.85, 0.02, 1, true);
      // Plush Backrest & Armrests
      addBox(rmGroup, sofaW, 0.48, 0.2, 0xcec3b4, sofaX, 0.64, sofaZ + 0.38, 0.88, 0.02);
      addBox(rmGroup, 0.22, 0.38, 0.96, 0xcec3b4, sofaX + sofaW / 2 - 0.1, 0.56, sofaZ, 0.88, 0.02);
      addBox(rmGroup, 0.22, 0.38, 0.96, 0xcec3b4, sofaX - sofaW / 2 + 0.1, 0.56, sofaZ, 0.88, 0.02);

      // L-Chaise Extension on West Side of Sofa
      const chaiseX = sofaX - sofaW / 2 + 0.52;
      const chaiseZ = sofaZ - sofaSideL / 2 + 0.1;
      addBox(rmGroup, 1.04, 0.09, sofaSideL, 0x5c3a21, chaiseX, 0.09, chaiseZ, 0.4, 0.05, 1, false, walnutMat);
      addBox(rmGroup, 1.02, 0.34, sofaSideL, 0xd8cfc2, chaiseX, 0.28, chaiseZ, 0.85, 0.02, 1, true);

      // Throw Pillows in Terracotta Rust, Mustard Ochre, and Charcoal Pattern (Ref Image 1 & 4)
      addBox(rmGroup, 0.42, 0.36, 0.15, 0xb45309, sofaX - sofaW * 0.3, 0.6, sofaZ + 0.2, 0.8, 0.0);
      addBox(rmGroup, 0.4, 0.34, 0.15, 0xd97706, sofaX - sofaW * 0.06, 0.58, sofaZ + 0.22, 0.8, 0.0);
      addBox(rmGroup, 0.42, 0.36, 0.15, 0x9a3412, sofaX + sofaW * 0.24, 0.6, sofaZ + 0.2, 0.8, 0.0);
      addBox(rmGroup, 0.38, 0.32, 0.14, 0x334155, chaiseX, 0.58, sofaZ + 0.18, 0.8, 0.0);

      // Large Woven Taupe Area Rug under Living Zone
      const rugZ = Math.max(rz + 2.1, sofaZ - Math.min(1.85, rl * 0.24));
      const rugMat = new THREE.MeshStandardMaterial({ map: rugLivingTex, roughness: 0.92 });
      disposables.push(rugMat);
      addBox(
        rmGroup,
        Math.min(3.8, rw * 0.38),
        0.018,
        Math.min(2.6, rl * 0.32),
        0xb8a99a,
        sofaX + 0.2,
        0.055,
        rugZ,
        0.92,
        0.0,
        1,
        false,
        rugMat
      );

      // Modern Wooden Centre Coffee Table with Decor (Ref Image 1)
      const ctX = sofaX + 0.2;
      const ctZ = rugZ;
      addBox(rmGroup, 1.35, 0.4, 0.78, 0x8b5a36, ctX, 0.25, ctZ, 0.35, 0.06, 1, false, walnutMat);
      // Decorative Tray, Books, Ceramic Vase & Tabletop Bonsai on Coffee Table
      addBox(rmGroup, 0.38, 0.03, 0.28, 0x1e293b, ctX - 0.25, 0.465, ctZ, 0.3, 0.4);
      addBox(rmGroup, 0.24, 0.045, 0.18, 0xf8fafc, ctX + 0.28, 0.47, ctZ - 0.1, 0.5, 0.05);
      addPottedPlant(rmGroup, ctX - 0.25, 0.46, ctZ, 0.42, 0x27272a);

      // Two Accent Armchairs (1 Mustard Yellow Chair by Window + 1 Curved Terracotta Rust Chair)
      // Accent Chair 1: Mustard Yellow Lounge Chair (Ref Image 1)
      const chair1X = rx + 1.05;
      const chair1Z = rugZ - 0.35;
      addBox(rmGroup, 0.76, 0.38, 0.74, 0xeab308, chair1X, 0.28, chair1Z, 0.78, 0.02);
      addBox(rmGroup, 0.76, 0.48, 0.16, 0xca8a04, chair1X, 0.62, chair1Z - 0.28, 0.8, 0.02);
      addBox(rmGroup, 0.1, 0.45, 0.74, 0x451a03, chair1X - 0.36, 0.32, chair1Z, 0.4, 0.1);
      addBox(rmGroup, 0.1, 0.45, 0.74, 0x451a03, chair1X + 0.36, 0.32, chair1Z, 0.4, 0.1);

      // Accent Chair 2: Curved Terracotta Rust Armchair (Ref Image 4)
      const chair2X = sofaX + sofaW / 2 + 0.75;
      const chair2Z = rugZ + 0.15;
      addBox(rmGroup, 0.78, 0.4, 0.76, 0xb45309, chair2X, 0.28, chair2Z, 0.78, 0.02);
      addBox(rmGroup, 0.78, 0.44, 0.18, 0x9a3412, chair2X, 0.6, chair2Z + 0.28, 0.8, 0.02);
      addBox(rmGroup, 0.14, 0.38, 0.72, 0x9a3412, chair2X - 0.34, 0.48, chair2Z, 0.8, 0.02);
      addBox(rmGroup, 0.14, 0.38, 0.72, 0x9a3412, chair2X + 0.34, 0.48, chair2Z, 0.8, 0.02);

      // Side Table with Warm Decorative Lamp + Black Floor Reading Lamp (Ref Image 1 & 4)
      const sideTabX = sofaX + sofaW / 2 + 0.42;
      const sideTabZ = sofaZ;
      addBox(rmGroup, 0.48, 0.54, 0.48, 0x5c3a21, sideTabX, 0.27, sideTabZ, 0.38, 0.1, 1, false, walnutMat);
      const lampShadeMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.1,
        roughness: 0.35
      });
      disposables.push(lampShadeMat);
      addBox(rmGroup, 0.06, 0.26, 0.06, 0x18181b, sideTabX, 0.66, sideTabZ, 0.3, 0.8);
      addBox(
        rmGroup,
        0.26,
        0.22,
        0.26,
        0xfef3c7,
        sideTabX,
        0.84,
        sideTabZ,
        0.3,
        0,
        1,
        false,
        lampShadeMat
      );
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c1_living_lighting',
        mat: lampShadeMat,
        onColor: 0xfef3c7,
        offColor: 0x64748b,
        emissiveOn: 1.1
      });

      // Floor Lamp in Corner near Balcony Curtain (Ref Image 1)
      addBox(rmGroup, 0.32, 0.03, 0.32, 0x18181b, rx + 0.55, 0.065, rz + rl - 0.55, 0.3, 0.8);
      addBox(rmGroup, 0.035, 1.65, 0.035, 0x18181b, rx + 0.55, 0.88, rz + rl - 0.55, 0.3, 0.8);
      addBox(
        rmGroup,
        0.28,
        0.2,
        0.28,
        0xfef3c7,
        rx + 0.65,
        1.72,
        rz + rl - 0.55,
        0.3,
        0,
        1,
        false,
        lampShadeMat
      );

      // Full-Height Fluted Walnut TV Unit Wall + Vertical LED Strip + Floating Console + 65" Smart TV (Ref Image 1 & 4)
      const tvX = rx + rw * 0.46;
      const tvUnitW = Math.min(3.4, rw * 0.34);
      // Fluted Walnut Feature Backdrop Panel
      addBox(
        rmGroup,
        tvUnitW,
        ch - 0.22,
        0.06,
        0x7c502e,
        tvX,
        (ch - 0.22) / 2 + 0.05,
        rz + 0.12,
        0.38,
        0.06,
        1,
        false,
        flutedWalnutMat
      );
      // Vertical Warm LED Accent Strip embedded in Fluted TV Panel (Ref Image 1)
      const tvLedMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.5,
        roughness: 0.2
      });
      disposables.push(tvLedMat);
      addBox(
        rmGroup,
        0.025,
        ch - 0.3,
        0.075,
        0xfef08a,
        tvX - tvUnitW * 0.22,
        (ch - 0.3) / 2 + 0.08,
        rz + 0.12,
        0.2,
        0,
        1,
        false,
        tvLedMat
      );
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c1_living_lighting',
        mat: tvLedMat,
        onColor: 0xfef08a,
        offColor: 0x475569,
        emissiveOn: 1.5
      });

      // Floating Walnut TV Console with Drawers & Open Media Shelf
      addBox(
        rmGroup,
        tvUnitW + 0.2,
        0.44,
        0.48,
        0x5c3a21,
        tvX,
        0.46,
        rz + 0.36,
        0.36,
        0.08,
        1,
        true,
        walnutMat
      );
      addBox(rmGroup, 0.75, 0.24, 0.49, 0x18181b, tvX, 0.46, rz + 0.37, 0.5, 0.2);

      // Wall-Mounted 65" 4K Smart OLED Television + Soundbar (Interactive via [T] or socket toggle)
      const tvBezel = addBox(rmGroup, 1.92, 1.1, 0.045, 0x090d16, tvX, 1.68, rz + 0.17, 0.18, 0.7);
      const tvScreenGeo = new THREE.PlaneGeometry(1.84, 1.03);
      const tvScreenMat = new THREE.MeshBasicMaterial({ map: tvOnTex });
      disposables.push(tvScreenGeo, tvScreenMat);
      smartTvScreenMesh = new THREE.Mesh(tvScreenGeo, tvScreenMat);
      smartTvScreenMesh.position.set(tvX, 1.68, rz + 0.198);
      rmGroup.add(smartTvScreenMesh);

      smartTvGlowLight = new THREE.PointLight(0x38bdf8, 0.9, 5.5, 1.5);
      smartTvGlowLight.position.set(tvX, 1.68, rz + 0.65);
      rmGroup.add(smartTvGlowLight);

      // Tag TV so clicking or pressing [E] / [T] toggles Smart TV
      tvBezel.userData = {
        interactiveType: 'electrical',
        pointId: 'pt_living_socket1',
        roomId: room.id,
        circuitId: 'c3_power_sockets',
        label: '65" 4K Smart OLED Television'
      };
      smartTvScreenMesh.userData = tvBezel.userData;
      interactiveMeshes.set('smart_tv_living', tvBezel);

      // Soundbar below TV
      addBox(rmGroup, 1.15, 0.07, 0.09, 0x18181b, tvX, 1.02, rz + 0.18, 0.3, 0.6);

      // Lush Potted Ficus Tree beside TV Console (Ref Image 1 & 4)
      addPottedPlant(rmGroup, tvX - tvUnitW / 2 - 0.42, 0.05, rz + 0.52, 1.35, 0xd6cbb9);
      addPottedPlant(rmGroup, tvX + tvUnitW / 2 + 0.38, 0.05, rz + 0.52, 1.15, 0xd6cbb9);

      // Framed Wall Paintings above Sofa on South Wall (Ref Image 1)
      addFramedPainting(rmGroup, artTex0, 1.05, 1.25, sofaX - 0.68, 2.05, rz + rl - 0.11, Math.PI);
      addFramedPainting(rmGroup, artTex1, 1.05, 1.25, sofaX + 0.68, 2.05, rz + rl - 0.11, Math.PI);

      // Living Room 2.0T Smart Split AC on South Wall
      addSmartSplitAc(rmGroup, 'pt_living_ac', 'c5_heavy_ac', rx + 3.2, 3.05, rz + rl - 0.18, Math.PI);

      // Full-Height Bronze/Copper & Sheer Curtains on Balcony Sliding Door & North Window
      addWindowCurtains(rmGroup, rx + 0.14, rz + 4.2, 2.5, ch - 0.2, false, 0x925427);
      addWindowCurtains(rmGroup, rx + 8.8, rz + 0.14, 2.9, ch - 0.2, true, 0x925427);

      // -----------------------------------------------------------------------
      // 6-SEATER DINING AREA (East Side of Living & Dining Hall)
      // -----------------------------------------------------------------------
      const dx = rx + rw - Math.max(2.1, Math.min(2.6, rw * 0.24));
      const dz = rz + rl * 0.54;
      const dtW = Math.min(2.15, rw * 0.21);
      const dtD = 1.08;

      // Walnut 6-Seater Dining Table Top + Table Runner + Centrepiece Bowl
      addBox(rmGroup, dtW, 0.06, dtD, 0x5c3a21, dx, 0.76, dz, 0.3, 0.08, 1, true, walnutMat);
      addBox(rmGroup, dtW * 0.82, 0.012, 0.32, 0xe5dccb, dx, 0.795, dz, 0.8, 0.0);
      addPottedPlant(rmGroup, dx, 0.8, dz, 0.45, 0xfef3c7);

      // Tapered Walnut Table Legs
      const legOffX = dtW * 0.42;
      const legOffZ = dtD * 0.38;
      addBox(rmGroup, 0.09, 0.74, 0.09, 0x3b2313, dx - legOffX, 0.37, dz - legOffZ, 0.4, 0.1, 1, false, walnutMat);
      addBox(rmGroup, 0.09, 0.74, 0.09, 0x3b2313, dx + legOffX, 0.37, dz - legOffZ, 0.4, 0.1, 1, false, walnutMat);
      addBox(rmGroup, 0.09, 0.74, 0.09, 0x3b2313, dx - legOffX, 0.37, dz + legOffZ, 0.4, 0.1, 1, false, walnutMat);
      addBox(rmGroup, 0.09, 0.74, 0.09, 0x3b2313, dx + legOffX, 0.37, dz + legOffZ, 0.4, 0.1, 1, false, walnutMat);

      // 6 Cream Upholstered Dining Chairs with Walnut Legs (3 North, 3 South)
      const chairOffsets = [-dtW * 0.32, 0, dtW * 0.32];
      chairOffsets.forEach((ox) => {
        // North row facing South
        addBox(rmGroup, 0.46, 0.07, 0.46, 0xf3ece0, dx + ox, 0.46, dz - 0.68, 0.75, 0.02);
        addBox(rmGroup, 0.46, 0.44, 0.07, 0xe5dccb, dx + ox, 0.7, dz - 0.88, 0.75, 0.02);
        addBox(rmGroup, 0.05, 0.44, 0.05, 0x451a03, dx + ox - 0.18, 0.22, dz - 0.85, 0.4, 0.1);
        addBox(rmGroup, 0.05, 0.44, 0.05, 0x451a03, dx + ox + 0.18, 0.22, dz - 0.85, 0.4, 0.1);
        // South row facing North
        addBox(rmGroup, 0.46, 0.07, 0.46, 0xf3ece0, dx + ox, 0.46, dz + 0.68, 0.75, 0.02);
        addBox(rmGroup, 0.46, 0.44, 0.07, 0xe5dccb, dx + ox, 0.7, dz + 0.88, 0.75, 0.02);
        addBox(rmGroup, 0.05, 0.44, 0.05, 0x451a03, dx + ox - 0.18, 0.22, dz + 0.85, 0.4, 0.1);
        addBox(rmGroup, 0.05, 0.44, 0.05, 0x451a03, dx + ox + 0.18, 0.22, dz + 0.85, 0.4, 0.1);
      });

      // Designer Golden Ring Chandelier / Pendant above Dining Table
      const chandGroup = new THREE.Group();
      chandGroup.position.set(dx, ch - 0.85, dz);
      const chandMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0.4
      });
      const ringGeo1 = new THREE.TorusGeometry(0.48, 0.022, 12, 36);
      const ringGeo2 = new THREE.TorusGeometry(0.32, 0.018, 12, 32);
      disposables.push(chandMat, ringGeo1, ringGeo2);
      const ring1 = new THREE.Mesh(ringGeo1, chandMat);
      ring1.rotation.x = Math.PI / 2;
      const ring2 = new THREE.Mesh(ringGeo2, chandMat);
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = -0.18;
      chandGroup.add(ring1, ring2);
      addBox(chandGroup, 0.02, 0.85, 0.02, 0xd97706, 0, 0.42, 0, 0.2, 0.9);
      rmGroup.add(chandGroup);
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c1_living_lighting',
        mat: chandMat,
        onColor: 0xfef08a,
        offColor: 0x64748b,
        emissiveOn: 1.5
      });

      // Backlit Walnut & Glass Crockery Cabinet + Decorative Wall Mirror on South Dining Wall
      addBox(
        rmGroup,
        1.65,
        2.15,
        0.42,
        0x5c3a21,
        dx,
        1.075,
        rz + rl - 0.26,
        0.38,
        0.08,
        1,
        true,
        walnutMat
      );
      addBox(
        rmGroup,
        1.5,
        0.95,
        0.44,
        0xfef3c7,
        dx,
        1.52,
        rz + rl - 0.26,
        0.2,
        0.1,
        0.55,
        false,
        lampShadeMat
      );

      // Decorative Circular Gold-Trimmed Wall Mirror on East Dining Wall (between doors)
      const mirGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.03, 32);
      disposables.push(mirGeo);
      const mirMesh = new THREE.Mesh(mirGeo, chromeMat);
      mirMesh.rotation.z = Math.PI / 2;
      mirMesh.position.set(rx + rw - 0.09, 1.65, rz + 4.4);
      rmGroup.add(mirMesh);
    } else if (room.type === 'balcony') {
      // -----------------------------------------------------------------------
      // SCENIC SIT-OUT BALCONY (West of Living Room)
      // -----------------------------------------------------------------------
      // Glass & Matte-Black Metal Balustrade Railing along West, North, and South Balcony Edges
      const railH = 1.08;
      // West Railing
      addBox(rmGroup, 0.06, 0.06, rl, 0x18181b, rx + 0.08, railH, rz + rl / 2, 0.3, 0.85, 1, true);
      addBox(
        rmGroup,
        0.025,
        railH - 0.1,
        rl - 0.12,
        0xdbeafe,
        rx + 0.08,
        railH / 2,
        rz + rl / 2,
        0.1,
        0.1,
        0.38,
        false,
        glassWindowMaterial
      );
      for (let zPost = rz + 0.2; zPost <= rz + rl - 0.1; zPost += 1.35) {
        addBox(rmGroup, 0.05, railH, 0.05, 0x18181b, rx + 0.08, railH / 2, zPost, 0.3, 0.85);
      }

      // Two Comfortable Outdoor Lounge Chairs with Cream Cushions + Round Coffee Table
      const balCx = rx + rw * 0.48;
      const balCz = rz + rl * 0.5;
      // Chair 1 (North)
      addBox(rmGroup, 0.72, 0.38, 0.72, 0x451a03, balCx, 0.22, balCz - 1.15, 0.5, 0.1, 1, false, walnutMat);
      addBox(rmGroup, 0.66, 0.1, 0.66, 0xf5efe6, balCx, 0.44, balCz - 1.15, 0.8, 0.0);
      addBox(rmGroup, 0.66, 0.45, 0.12, 0xf5efe6, balCx, 0.66, balCz - 1.44, 0.8, 0.0);
      // Chair 2 (South)
      addBox(rmGroup, 0.72, 0.38, 0.72, 0x451a03, balCx, 0.22, balCz + 1.15, 0.5, 0.1, 1, false, walnutMat);
      addBox(rmGroup, 0.66, 0.1, 0.66, 0xf5efe6, balCx, 0.44, balCz + 1.15, 0.8, 0.0);
      addBox(rmGroup, 0.66, 0.45, 0.12, 0xf5efe6, balCx, 0.66, balCz + 1.44, 0.8, 0.0);

      // Small Round Outdoor Coffee Table
      const roundTabGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24);
      const roundLegGeo = new THREE.CylinderGeometry(0.04, 0.22, 0.48, 16);
      disposables.push(roundTabGeo, roundLegGeo);
      const roundTop = new THREE.Mesh(roundTabGeo, walnutMat);
      roundTop.position.set(balCx, 0.5, balCz);
      const roundLeg = new THREE.Mesh(roundLegGeo, matteBlackMetalMat);
      roundLeg.position.set(balCx, 0.25, balCz);
      rmGroup.add(roundTop, roundLeg);

      // Lush Balcony Planter Boxes & Decorative Palms
      addPottedPlant(rmGroup, rx + 0.48, 0.05, rz + 0.75, 1.25, 0x78350f);
      addPottedPlant(rmGroup, rx + 0.48, 0.05, rz + rl - 0.75, 1.25, 0x78350f);
      addPottedPlant(rmGroup, balCx, 0.52, balCz, 0.38, 0xfef3c7);
    } else if (room.type === 'kitchen') {
      // -----------------------------------------------------------------------
      // MODULAR KITCHEN (Ref Images 3 & 5)
      // -----------------------------------------------------------------------
      const eastCabL = Math.max(1.8, rl - 0.35);
      const northCabW = Math.max(1.6, rw - 1.5);
      const qMat = new THREE.MeshStandardMaterial({
        map: terrazzoTex,
        color: 0xf8fafc,
        roughness: 0.18,
        metalness: 0.08
      });
      const subMat = new THREE.MeshStandardMaterial({
        map: subwayTileTex,
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.05
      });
      disposables.push(qMat, subMat);

      // 1. Natural Oak Wood-Grain Lower Cabinets with Black Handle Channels (East & North Walls)
      addBox(
        rmGroup,
        0.72,
        0.86,
        eastCabL,
        0xc69a6b,
        rx + rw - 0.44,
        0.43,
        rz + rl / 2,
        0.42,
        0.05,
        1,
        true,
        oakMat
      );
      addBox(
        rmGroup,
        northCabW,
        0.86,
        0.7,
        0xc69a6b,
        rx + northCabW / 2 + 1.15,
        0.43,
        rz + 0.44,
        0.42,
        0.05,
        1,
        true,
        oakMat
      );
      // Black Handle Channels on Lower Cabinets
      addBox(rmGroup, 0.02, 0.03, eastCabL - 0.1, 0x18181b, rx + rw - 0.81, 0.82, rz + rl / 2, 0.3, 0.8);
      addBox(rmGroup, 0.02, 0.03, eastCabL - 0.1, 0x18181b, rx + rw - 0.81, 0.46, rz + rl / 2, 0.3, 0.8);

      // Partially Open Cutlery Drawer Detail (Ref Image 3 signature detail!)
      const drawerZ = rz + rl * 0.36;
      addBox(rmGroup, 0.38, 0.16, 0.64, 0x27272a, rx + rw - 0.92, 0.68, drawerZ, 0.4, 0.5);
      addBox(rmGroup, 0.03, 0.24, 0.68, 0xc69a6b, rx + rw - 1.12, 0.68, drawerZ, 0.4, 0.05, 1, false, oakMat);

      // 2. Speckled Quartz / Terrazzo Countertops
      addBox(
        rmGroup,
        0.76,
        0.045,
        eastCabL + 0.04,
        0xf3eee8,
        rx + rw - 0.44,
        0.885,
        rz + rl / 2,
        0.18,
        0.08,
        1,
        false,
        qMat
      );
      addBox(
        rmGroup,
        northCabW + 0.04,
        0.045,
        0.74,
        0xf3eee8,
        rx + northCabW / 2 + 1.15,
        0.885,
        rz + 0.44,
        0.18,
        0.08,
        1,
        false,
        qMat
      );

      // 3. Glossy White Subway Tile & Terrazzo Backsplash
      addBox(
        rmGroup,
        0.025,
        0.68,
        eastCabL,
        0xffffff,
        rx + rw - 0.09,
        1.25,
        rz + rl / 2,
        0.2,
        0.05,
        1,
        false,
        subMat
      );
      addBox(
        rmGroup,
        northCabW,
        0.68,
        0.025,
        0xffffff,
        rx + northCabW / 2 + 1.15,
        1.25,
        rz + 0.09,
        0.2,
        0.05,
        1,
        false,
        qMat
      );

      // 4. Matte Cream Upper Cabinets + 3-Door Black-Framed Lit Glass Cabinet (Ref Image 3 & 5)
      addBox(rmGroup, 0.42, 0.92, eastCabL * 0.35, 0xefeae2, rx + rw - 0.29, 2.08, rz + 1.05, 0.5, 0.04);
      // 3-Door Black-Framed Fluted Glass Upper Cabinet on North Wall (Ref Image 5)
      addBox(
        rmGroup,
        1.65,
        0.95,
        0.38,
        0x18181b,
        rx + northCabW / 2 + 0.95,
        2.08,
        rz + 0.28,
        0.3,
        0.7
      );
      const underCabMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.45,
        roughness: 0.2
      });
      disposables.push(underCabMat);
      addBox(
        rmGroup,
        1.55,
        0.85,
        0.39,
        0xfef3c7,
        rx + northCabW / 2 + 0.95,
        2.08,
        rz + 0.28,
        0.2,
        0.1,
        0.55,
        false,
        underCabMat
      );

      // Warm Under-Cabinet LED Strip Lighting
      addBox(
        rmGroup,
        0.04,
        0.02,
        eastCabL * 0.8,
        0xfef08a,
        rx + rw - 0.35,
        1.61,
        rz + rl / 2,
        0.2,
        0,
        1,
        false,
        underCabMat
      );
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c1_living_lighting',
        mat: underCabMat,
        onColor: 0xfef08a,
        offColor: 0x64748b,
        emissiveOn: 1.45
      });

      // 5. Built-In 4-Burner Glass Gas/Induction Hob + Stainless Pot + Auto-Clean Chimney Hood
      const hobZ = rz + rl * 0.42;
      addBox(rmGroup, 0.54, 0.03, 0.86, 0x090d16, rx + rw - 0.44, 0.915, hobZ, 0.15, 0.6);
      // Stainless Cooking Pot on Hob
      const potGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.14, 20);
      disposables.push(potGeo);
      const cookPot = new THREE.Mesh(potGeo, chromeMat);
      cookPot.position.set(rx + rw - 0.44, 0.99, hobZ - 0.16);
      rmGroup.add(cookPot);
      // Stainless Steel Chimney Hood
      addBox(rmGroup, 0.52, 0.12, 0.9, 0x94a3b8, rx + rw - 0.42, 1.78, hobZ, 0.24, 0.88, 1, false, brushedSteelMat);
      addBox(rmGroup, 0.28, 0.95, 0.3, 0x94a3b8, rx + rw - 0.26, 2.3, hobZ, 0.24, 0.88, 1, false, brushedSteelMat);

      // 6. Stainless Steel Sink & High-Arc Gooseneck Faucet under East Window
      const sinkZ = rz + rl * 0.76;
      addBox(rmGroup, 0.52, 0.025, 0.78, 0xcbd5e1, rx + rw - 0.44, 0.91, sinkZ, 0.18, 0.9, 1, false, chromeMat);
      addBox(rmGroup, 0.04, 0.32, 0.04, 0xe2e8f0, rx + rw - 0.18, 1.06, sinkZ, 0.15, 0.95, 1, false, chromeMat);
      addBox(rmGroup, 0.22, 0.035, 0.04, 0xe2e8f0, rx + rw - 0.28, 1.2, sinkZ, 0.15, 0.95, 1, false, chromeMat);

      // 7. Double-Door Stainless Steel Refrigerator with Water Dispenser + Built-In Microwave/Oven (Ref Image 5)
      const fridgeX = rx + 0.68;
      const fridgeZ = rz + 0.52;
      addBox(
        rmGroup,
        0.92,
        1.98,
        0.78,
        0x94a3b8,
        fridgeX,
        0.99,
        fridgeZ,
        0.25,
        0.85,
        1,
        true,
        brushedSteelMat
      );
      // Fridge Door Split Line & Water Dispenser Recess
      addBox(rmGroup, 0.015, 1.92, 0.8, 0x18181b, fridgeX, 0.99, fridgeZ, 0.3, 0.8);
      addBox(rmGroup, 0.22, 0.28, 0.8, 0x1e293b, fridgeX - 0.22, 1.18, fridgeZ, 0.3, 0.7);
      // Built-in Microwave & Oven on Counter
      addBox(rmGroup, 0.58, 0.38, 0.46, 0x18181b, rx + 2.35, 1.1, rz + 0.42, 0.25, 0.7);

      // 8. Fruit Bowl, Spice Jars (Turmeric & Cumin), Utensil Holder & Electric Kettle (Ref Image 3)
      // Ceramic Fruit Bowl with Apples & Bananas
      addBox(rmGroup, 0.28, 0.09, 0.28, 0xfef3c7, rx + rw - 0.48, 0.95, rz + 1.15, 0.4, 0.1);
      addBox(rmGroup, 0.08, 0.08, 0.08, 0xdc2626, rx + rw - 0.48, 1.01, rz + 1.12, 0.3, 0.1);
      addBox(rmGroup, 0.12, 0.06, 0.06, 0xfacc15, rx + rw - 0.44, 1.01, rz + 1.19, 0.4, 0.1);
      // Spice Jars (Turmeric Yellow & Cumin Brown)
      addBox(rmGroup, 0.09, 0.14, 0.09, 0xd97706, rx + rw - 0.32, 0.98, rz + 1.52, 0.3, 0.2);
      addBox(rmGroup, 0.09, 0.14, 0.09, 0x78350f, rx + rw - 0.32, 0.98, rz + 1.65, 0.3, 0.2);
      // Electric Kettle
      addBox(rmGroup, 0.16, 0.22, 0.16, 0x94a3b8, rx + rw - 0.48, 1.02, rz + 0.65, 0.25, 0.85);
    } else if (room.type === 'master_bedroom') {
      // -----------------------------------------------------------------------
      // MASTER BEDROOM (Ref Image 2: Fluted Cream & Walnut Headboard, Taupe Bed, 4-Door Wardrobe, Corner Desk)
      // -----------------------------------------------------------------------
      const bedW = Math.min(2.25, rw * 0.32);
      const bedL = Math.min(2.35, rl * 0.35);
      const bx = rx + rw * 0.48;
      const bz = rz + rl - bedL / 2 - 0.22;

      // Full-Height Feature Headboard Wall: Fluted Cream Centre + Flanking Walnut Panels + Warm Cove Light (Ref Image 2)
      addBox(
        rmGroup,
        bedW + 0.3,
        ch - 0.22,
        0.05,
        0xefe7da,
        bx,
        (ch - 0.22) / 2 + 0.05,
        rz + rl - 0.1,
        0.5,
        0.02,
        1,
        false,
        flutedCreamMat
      );
      addBox(
        rmGroup,
        0.95,
        ch - 0.22,
        0.065,
        0x5c3a21,
        bx - bedW / 2 - 0.55,
        (ch - 0.22) / 2 + 0.05,
        rz + rl - 0.1,
        0.38,
        0.06,
        1,
        false,
        walnutMat
      );
      addBox(
        rmGroup,
        0.95,
        ch - 0.22,
        0.065,
        0x5c3a21,
        bx + bedW / 2 + 0.55,
        (ch - 0.22) / 2 + 0.05,
        rz + rl - 0.1,
        0.38,
        0.06,
        1,
        false,
        walnutMat
      );

      // Warm LED Cove Backlight Strip above Upholstered Headboard (Ref Image 2)
      const hbLedMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.45,
        roughness: 0.2
      });
      disposables.push(hbLedMat);
      addBox(
        rmGroup,
        bedW + 0.2,
        0.03,
        0.08,
        0xfef08a,
        bx,
        1.38,
        rz + rl - 0.12,
        0.2,
        0,
        1,
        false,
        hbLedMat
      );
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c2_bedroom_fan',
        mat: hbLedMat,
        onColor: 0xfef08a,
        offColor: 0x64748b,
        emissiveOn: 1.45
      });

      // Upholstered Taupe-Grey King Bed Frame + Tufted Headboard
      addBox(rmGroup, bedW, 0.34, bedL, 0x78716c, bx, 0.17, bz, 0.82, 0.02, 1, true);
      addBox(rmGroup, bedW + 0.08, 1.32, 0.16, 0x78716c, bx, 0.66, rz + rl - 0.16, 0.82, 0.02);

      // Plush Mattress + Cream/Beige Duvet + Folded Slate-Blue Runner Blanket (Ref Image 2)
      addBox(rmGroup, bedW - 0.1, 0.24, bedL - 0.12, 0xe7dfd3, bx, 0.45, bz + 0.02, 0.85, 0.0);
      addBox(rmGroup, bedW - 0.06, 0.06, bedL * 0.42, 0x475569, bx, 0.58, bz - bedL * 0.16, 0.88, 0.0);

      // 4 Cream Pillows + 1 Slate-Blue Center Accent Cushion
      addBox(rmGroup, 0.68, 0.16, 0.38, 0xd6cbb9, bx - bedW * 0.24, 0.62, rz + rl - 0.42, 0.8, 0.0);
      addBox(rmGroup, 0.68, 0.16, 0.38, 0xd6cbb9, bx + bedW * 0.24, 0.62, rz + rl - 0.42, 0.8, 0.0);
      addBox(rmGroup, 0.62, 0.15, 0.34, 0xefe7da, bx - bedW * 0.22, 0.64, rz + rl - 0.62, 0.8, 0.0);
      addBox(rmGroup, 0.62, 0.15, 0.34, 0xefe7da, bx + bedW * 0.22, 0.64, rz + rl - 0.62, 0.8, 0.0);
      addBox(rmGroup, 0.52, 0.18, 0.26, 0x334155, bx, 0.65, rz + rl - 0.82, 0.82, 0.0);

      // Woven Area Rug under King Bed
      const masterRugMat = new THREE.MeshStandardMaterial({ map: rugMasterTex, roughness: 0.92 });
      disposables.push(masterRugMat);
      addBox(
        rmGroup,
        bedW + 1.3,
        0.018,
        bedL + 0.8,
        0x9e8f80,
        bx,
        0.055,
        bz - 0.25,
        0.92,
        0,
        1,
        false,
        masterRugMat
      );

      // Two Walnut Bedside Tables with Cream Drawer Fronts & Black-Shade Warm Lamps (Ref Image 2)
      const bsLeftX = bx - bedW / 2 - 0.44;
      const bsRightX = bx + bedW / 2 + 0.44;
      const bsZ = rz + rl - 0.42;
      [bsLeftX, bsRightX].forEach((tx, idx) => {
        addBox(rmGroup, 0.58, 0.52, 0.46, 0x5c3a21, tx, 0.26, bsZ, 0.4, 0.06, 1, false, walnutMat);
        addBox(rmGroup, 0.52, 0.2, 0.48, 0xd6cbb9, tx, 0.36, bsZ, 0.5, 0.02);
        addBox(rmGroup, 0.52, 0.2, 0.48, 0xd6cbb9, tx, 0.15, bsZ, 0.5, 0.02);
        // Black-Shade Bedside Lamp with Warm Glow
        addBox(rmGroup, 0.04, 0.28, 0.04, 0x18181b, tx, 0.66, bsZ, 0.3, 0.8);
        addBox(rmGroup, 0.24, 0.18, 0.24, 0x18181b, tx, 0.82, bsZ, 0.4, 0.4);
        addBox(rmGroup, 0.18, 0.04, 0.18, 0xfef08a, tx, 0.73, bsZ, 0.2, 0, 1, false, hbLedMat);
        if (idx === 0) {
          addPottedPlant(rmGroup, tx - 0.16, 0.52, bsZ + 0.05, 0.34, 0xfef3c7);
        }
      });

      // Full-Height 4-Door Taupe-Grey Wardrobe with Walnut Loft & Long Black Handles along East Wall (Ref Image 2)
      const wardL = Math.min(3.1, rl * 0.42);
      const wardX = rx + rw - 0.38;
      const wardZ = rz + rl * 0.52;
      // Main Taupe-Grey Shutter Body
      addBox(rmGroup, 0.62, 2.35, wardL, 0xc7bfb3, wardX, 1.175, wardZ, 0.5, 0.05, 1, true);
      // Upper Walnut Loft Cabinets
      addBox(
        rmGroup,
        0.64,
        0.75,
        wardL,
        0x5c3a21,
        wardX,
        2.72,
        wardZ,
        0.38,
        0.06,
        1,
        false,
        walnutMat
      );
      // Long Sleek Vertical Black Handles
      addBox(rmGroup, 0.65, 0.95, 0.025, 0x18181b, wardX, 1.15, wardZ - wardL * 0.22, 0.3, 0.8);
      addBox(rmGroup, 0.65, 0.95, 0.025, 0x18181b, wardX, 1.15, wardZ + wardL * 0.22, 0.3, 0.8);

      // Corner Dressing / Study Table with Mirror & Dark Upholstered Chair (North-East Corner)
      const deskX = rx + rw - 1.15;
      const deskZ = rz + 0.55;
      addBox(rmGroup, 1.55, 0.1, 0.58, 0x5c3a21, deskX, 0.74, deskZ, 0.38, 0.06, 1, false, walnutMat);
      addBox(rmGroup, 0.52, 0.52, 0.52, 0x334155, deskX, 0.38, deskZ + 0.52, 0.8, 0.05);
      // Dressing Mirror on North Wall above Desk
      addBox(rmGroup, 0.85, 1.15, 0.04, 0xe2e8f0, deskX, 1.55, rz + 0.14, 0.1, 0.95, 1, false, chromeMat);

      // Framed Wall Artwork on West Wall + Curtains on South Window + 1.5T Smart Split AC
      addFramedPainting(rmGroup, artTex2, 1.1, 0.9, rx + 0.12, 1.75, rz + 1.85, Math.PI / 2);
      addWindowCurtains(rmGroup, rx + 4.0, rz + rl - 0.16, 3.2, ch - 0.2, true, 0x78716c);
      addSmartSplitAc(rmGroup, 'pt_master_ac', 'c5_heavy_ac', bx, 3.05, rz + rl - 0.18, Math.PI);
    } else if (room.type === 'bedroom_2') {
      // -----------------------------------------------------------------------
      // SECOND BEDROOM & STUDY (Ref Image 6: Blue & Yellow Arch Wall, Oak Bed, Study Desk + Cubbies, Yellow Pouf)
      // -----------------------------------------------------------------------
      const bedW = Math.min(1.85, rw * 0.32);
      const bedL = Math.min(2.25, rl * 0.34);
      const bx = rx + rw * 0.42;
      const bz = rz + rl - bedL / 2 - 0.2;

      // Painted Blue & Mustard-Yellow Feature Wall Backdrop on South Wall (Ref Image 6)
      addBox(rmGroup, bedW + 0.9, 2.4, 0.03, 0x1e40af, bx, 1.25, rz + rl - 0.1, 0.7, 0.02);
      addBox(rmGroup, 1.4, 2.1, 0.035, 0xeab308, bx + bedW * 0.55, 1.15, rz + rl - 0.095, 0.7, 0.02);

      // Natural Oak Platform Queen Bed + Crisp White Sheet + Muted Blue Throw Blanket + Yellow Cushion
      addBox(rmGroup, bedW, 0.34, bedL, 0xc69a6b, bx, 0.17, bz, 0.42, 0.05, 1, true, oakMat);
      addBox(rmGroup, bedW + 0.06, 1.15, 0.12, 0xc69a6b, bx, 0.58, rz + rl - 0.15, 0.42, 0.05, 1, false, oakMat);
      addBox(rmGroup, bedW - 0.1, 0.22, bedL - 0.12, 0xf8fafc, bx, 0.42, bz + 0.02, 0.85, 0.0);
      addBox(rmGroup, bedW - 0.06, 0.05, bedL * 0.46, 0x2563eb, bx, 0.54, bz - bedL * 0.15, 0.85, 0.0);
      // Pillows + Yellow Chevron Accent Cushion
      addBox(rmGroup, 0.62, 0.14, 0.36, 0xf1f5f9, bx - bedW * 0.22, 0.58, rz + rl - 0.42, 0.8, 0.0);
      addBox(rmGroup, 0.62, 0.14, 0.36, 0xf1f5f9, bx + bedW * 0.22, 0.58, rz + rl - 0.42, 0.8, 0.0);
      addBox(rmGroup, 0.44, 0.16, 0.26, 0xfacc15, bx, 0.6, rz + rl - 0.72, 0.8, 0.0);

      // Geometric Patterned Area Rug + Yellow Knitted Pouf Ottoman (Ref Image 6)
      const kidsRugMat = new THREE.MeshStandardMaterial({ map: rugKidsTex, roughness: 0.92 });
      disposables.push(kidsRugMat);
      addBox(
        rmGroup,
        bedW + 1.1,
        0.018,
        bedL + 0.7,
        0xe5e0d5,
        bx + 0.35,
        0.055,
        bz - 0.2,
        0.9,
        0,
        1,
        false,
        kidsRugMat
      );
      // Yellow Pouf Ottoman
      const poufGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.34, 20);
      const poufMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.85 });
      disposables.push(poufGeo, poufMat);
      const pouf = new THREE.Mesh(poufGeo, poufMat);
      pouf.position.set(bx + bedW / 2 + 0.55, 0.22, bz - 0.35);
      rmGroup.add(pouf);

      // Oak Bedside Table + Lamp
      addBox(
        rmGroup,
        0.5,
        0.48,
        0.44,
        0xc69a6b,
        bx - bedW / 2 - 0.38,
        0.24,
        rz + rl - 0.4,
        0.42,
        0.05,
        1,
        false,
        oakMat
      );

      // Floor-to-Ceiling Cream & Natural Oak Wardrobe along West Wall (Ref Image 6)
      const wardL = Math.min(2.6, rl * 0.36);
      addBox(rmGroup, 0.6, 2.55, wardL, 0xf5efe6, rx + 0.38, 1.275, rz + rl * 0.48, 0.5, 0.04, 1, true);
      addBox(
        rmGroup,
        0.62,
        0.65,
        wardL,
        0xc69a6b,
        rx + 0.38,
        2.85,
        rz + rl * 0.48,
        0.42,
        0.05,
        1,
        false,
        oakMat
      );

      // Built-in Study Desk with Muted Blue Drawers + Overhead Open Bookshelf Cubbies + Corkboard + Swivel Chair along East Wall (Ref Image 6)
      const deskL = Math.min(1.85, rl * 0.28);
      const deskX = rx + rw - 0.42;
      const deskZ = rz + rl * 0.58;
      // Oak Desk Top + Muted-Blue Drawer Pedestal
      addBox(rmGroup, 0.62, 0.06, deskL, 0xc69a6b, deskX, 0.76, deskZ, 0.4, 0.05, 1, true, oakMat);
      addBox(rmGroup, 0.58, 0.72, 0.52, 0x2563eb, deskX, 0.36, deskZ + deskL * 0.3, 0.5, 0.05);
      // Cork Pinboard on Wall above Desk
      addBox(rmGroup, 0.03, 0.62, deskL * 0.85, 0xd97706, rx + rw - 0.1, 1.25, deskZ, 0.85, 0.0);
      // Overhead Open Cubby Bookshelf with Warm Under-Shelf LED Strip
      addBox(
        rmGroup,
        0.36,
        0.48,
        deskL,
        0xc69a6b,
        rx + rw - 0.26,
        1.88,
        deskZ,
        0.42,
        0.05,
        1,
        false,
        oakMat
      );
      const studyLedMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.35,
        roughness: 0.2
      });
      disposables.push(studyLedMat);
      addBox(
        rmGroup,
        0.04,
        0.02,
        deskL * 0.9,
        0xfef08a,
        rx + rw - 0.32,
        1.62,
        deskZ,
        0.2,
        0,
        1,
        false,
        studyLedMat
      );
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c2_bedroom_fan',
        mat: studyLedMat,
        onColor: 0xfef08a,
        offColor: 0x64748b,
        emissiveOn: 1.35
      });

      // Ergonomic Study Chair + Articulated Desk Lamp
      addBox(rmGroup, 0.5, 0.46, 0.5, 0x334155, deskX - 0.55, 0.42, deskZ - 0.15, 0.7, 0.1);
      addBox(rmGroup, 0.08, 0.48, 0.48, 0x1e293b, deskX - 0.78, 0.75, deskZ - 0.15, 0.7, 0.1);
      addBox(rmGroup, 0.18, 0.35, 0.18, 0x18181b, deskX - 0.1, 0.96, deskZ - deskL * 0.32, 0.3, 0.8);

      // Framed Geometric Wall Art + Window Curtains + 1.0T Smart Split AC
      addFramedPainting(rmGroup, artTex3, 0.95, 1.1, rx + rw * 0.62, 1.78, rz + 0.12, 0);
      addWindowCurtains(rmGroup, rx + rw - 0.14, rz + 3.6, 2.8, ch - 0.2, false, 0x475569);
      addSmartSplitAc(rmGroup, 'pt_bed2_ac', 'c5_heavy_ac', bx, 3.05, rz + rl - 0.18, Math.PI);
    } else if (room.type === 'bathroom') {
      // -----------------------------------------------------------------------
      // FULLY FURNISHED BATHROOMS (Both Common Bathroom & Master Attached Bathroom)
      // -----------------------------------------------------------------------
      const isMasterBath = room.id === 'room_bath2';
      const fixtureWallX = isMasterBath ? rx + 0.42 : rx + rw - 0.42;
      const backWallX = isMasterBath ? rx + 0.12 : rx + rw - 0.12;
      const mirrorRotY = isMasterBath ? Math.PI / 2 : -Math.PI / 2;

      // 1. Floating Walnut/Slate Vanity Cabinet + Ceramic Washbasin + Chrome Mixer
      const vanityZ = rz + rl * 0.28;
      addBox(
        rmGroup,
        0.58,
        0.52,
        1.05,
        0x5c3a21,
        fixtureWallX,
        0.56,
        vanityZ,
        0.4,
        0.1,
        1,
        true,
        walnutMat
      );
      addBox(rmGroup, 0.62, 0.04, 1.08, 0xf8fafc, fixtureWallX, 0.84, vanityZ, 0.15, 0.1);
      addBox(rmGroup, 0.44, 0.14, 0.58, 0xffffff, fixtureWallX, 0.92, vanityZ, 0.1, 0.1);
      addBox(rmGroup, 0.12, 0.18, 0.04, 0xe2e8f0, fixtureWallX, 1.04, vanityZ, 0.1, 0.95, 1, false, chromeMat);

      // 2. Large Vanity Mirror with Warm LED Backlight Halo
      const bathMirrorMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.4,
        roughness: 0.2
      });
      disposables.push(bathMirrorMat);
      addBox(
        rmGroup,
        0.03,
        1.08,
        0.96,
        0xfef08a,
        backWallX,
        1.68,
        vanityZ,
        0.2,
        0,
        1,
        false,
        bathMirrorMat
      );
      addBox(
        rmGroup,
        0.04,
        1.0,
        0.88,
        0xe2e8f0,
        backWallX + (isMasterBath ? 0.015 : -0.015),
        1.68,
        vanityZ,
        0.08,
        0.95,
        1,
        false,
        chromeMat
      );
      decorativeLightMeshes.push({
        roomId: room.id,
        circuitId: 'c2_bedroom_fan',
        mat: bathMirrorMat,
        onColor: 0xfef08a,
        offColor: 0x64748b,
        emissiveOn: 1.4
      });

      // 3. Western-Style Ceramic Toilet with Cistern & Chrome Flush Plate
      const wcZ = rz + rl * 0.58;
      addBox(rmGroup, 0.56, 0.42, 0.44, 0xffffff, fixtureWallX, 0.21, wcZ, 0.12, 0.1, 1, true);
      addBox(
        rmGroup,
        0.22,
        0.48,
        0.42,
        0xffffff,
        backWallX + (isMasterBath ? 0.1 : -0.1),
        0.64,
        wcZ,
        0.12,
        0.1
      );

      // 4. Tempered Glass Shower Enclosure + Overhead Chrome Rain Shower & Mixer
      const showerZ = rz + rl - 0.65;
      addBox(
        rmGroup,
        1.15,
        2.15,
        0.03,
        0xdbeafe,
        fixtureWallX,
        1.075,
        showerZ - 0.45,
        0.08,
        0.1,
        0.42,
        false,
        glassWindowMaterial
      );
      // Chrome Rain Shower Head & Riser Pipe
      addBox(
        rmGroup,
        0.03,
        1.15,
        0.03,
        0xe2e8f0,
        backWallX + (isMasterBath ? 0.05 : -0.05),
        1.65,
        showerZ,
        0.15,
        0.95,
        1,
        false,
        chromeMat
      );
      addBox(
        rmGroup,
        0.38,
        0.025,
        0.28,
        0xe2e8f0,
        fixtureWallX,
        2.22,
        showerZ,
        0.15,
        0.95,
        1,
        false,
        chromeMat
      );

      // 5. Chrome Towel Rack with Folded Towels
      addBox(
        rmGroup,
        0.12,
        0.04,
        0.65,
        0xe2e8f0,
        rx + rw / 2,
        1.35,
        rz + 0.12,
        0.15,
        0.95,
        1,
        false,
        chromeMat
      );
      addBox(rmGroup, 0.1, 0.45, 0.52, 0x0d9488, rx + rw / 2, 1.12, rz + 0.13, 0.85, 0.0);
    } else if (room.type === 'foyer') {
      // -----------------------------------------------------------------------
      // ENTRANCE FOYER & SMART DISTRIBUTION BOARD ZONE
      // -----------------------------------------------------------------------
      // Incoming Digital Smart Energy Meter (kWh) beside DB on West Wall
      addBox(rmGroup, 0.26, 0.34, 0.14, 0x1e293b, rx + 0.16, 1.65, rz + rl - 0.72, 0.3, 0.7);
      addBox(rmGroup, 0.02, 0.1, 0.16, 0x38bdf8, rx + 0.3, 1.7, rz + rl - 0.72, 0.2, 0.1);
      // Walnut Foyer Console & Shoe Cabinet + Potted Plant + Decorative Mirror on East Wall
      addBox(
        rmGroup,
        0.42,
        0.82,
        Math.min(1.5, rl * 0.45),
        0x5c3a21,
        rx + rw - 0.28,
        0.41,
        rz + rl / 2,
        0.4,
        0.06,
        1,
        true,
        walnutMat
      );
      addPottedPlant(rmGroup, rx + rw - 0.28, 0.82, rz + rl / 2 - 0.4, 0.55, 0xfef3c7);
      addFramedPainting(rmGroup, artTex0, 0.9, 1.1, rx + rw - 0.1, 1.68, rz + rl / 2, -Math.PI / 2);
    }

    furnitureGroup.add(rmGroup);
  });

  // 4. Parametric Walls with Synchronized Shared-Wall Openings & Hinged Interactive Doors
  const currentWallMat =
    viewMode === 'cutaway'
      ? wallCutawayMaterial
      : viewMode === 'construction'
      ? wallBrickMaterial
      : wallPlasterMaterial;

  const baseCeilH = project.meta.floorHeight || 3.8;
  const wallHeight = viewMode === 'cutaway' ? baseCeilH - 0.15 : baseCeilH;
  const intThickness = project.meta.interiorWallThickness || 0.12;

  interface WorldOpeningSegment {
    opening: OpeningData;
    isHorizontal: boolean;
    lineCoord: number;
    startCoord: number;
    endCoord: number;
  }

  const worldOpenings: WorldOpeningSegment[] = [];
  project.openings.forEach((op) => {
    const r = project.rooms.find((rm) => rm.id === op.roomId);
    if (!r) return;
    if (op.wallDirection === 'north' || op.wallDirection === 'south') {
      const lineZ = op.wallDirection === 'north' ? r.z : r.z + r.length;
      worldOpenings.push({
        opening: op,
        isHorizontal: true,
        lineCoord: lineZ,
        startCoord: r.x + op.offset,
        endCoord: r.x + op.offset + op.width
      });
    } else {
      const lineX = op.wallDirection === 'west' ? r.x : r.x + r.width;
      worldOpenings.push({
        opening: op,
        isHorizontal: false,
        lineCoord: lineX,
        startCoord: r.z + op.offset,
        endCoord: r.z + op.offset + op.width
      });
    }
  });

  const spawnedOpeningIds = new Set<string>();
  const builtWallSegments: { isHorizontal: boolean; lineCoord: number; start: number; end: number }[] = [];

  function buildWallSegment(
    startX: number,
    startZ: number,
    length: number,
    thickness: number,
    isHorizontal: boolean
  ) {
    const lineCoord = isHorizontal ? startZ : startX;
    const segStart = isHorizontal ? startX : startZ;
    const segEnd = segStart + length;

    const matchingOpenings: OpeningData[] = [];
    worldOpenings.forEach((wo) => {
      if (wo.isHorizontal !== isHorizontal) return;
      if (Math.abs(wo.lineCoord - lineCoord) > 0.14) return;
      const overlapStart = Math.max(segStart, wo.startCoord);
      const overlapEnd = Math.min(segEnd, wo.endCoord);
      if (overlapEnd - overlapStart > 0.15) {
        matchingOpenings.push({
          ...wo.opening,
          offset: Math.max(0, wo.startCoord - segStart),
          width: Math.min(wo.opening.width, segEnd - Math.max(segStart, wo.startCoord))
        });
      }
    });

    const addSolidWallChunk = (chunkOffset: number, chunkLen: number) => {
      if (chunkLen <= 0.04) return;
      const cStart = segStart + chunkOffset;
      const cEnd = cStart + chunkLen;

      const alreadyBuilt = builtWallSegments.some(
        (b) =>
          b.isHorizontal === isHorizontal &&
          Math.abs(b.lineCoord - lineCoord) < 0.08 &&
          Math.min(b.end, cEnd) - Math.max(b.start, cStart) > chunkLen * 0.85
      );
      if (alreadyBuilt) return;
      builtWallSegments.push({ isHorizontal, lineCoord, start: cStart, end: cEnd });

      const wX = isHorizontal ? chunkLen : thickness;
      const dZ = isHorizontal ? thickness : chunkLen;
      const mid = chunkOffset + chunkLen / 2;
      const posX = startX + (isHorizontal ? mid : 0);
      const posZ = startZ + (isHorizontal ? 0 : mid);

      const chunkGeo = new THREE.BoxGeometry(wX, wallHeight, dZ);
      disposables.push(chunkGeo);
      const chunkMesh = new THREE.Mesh(chunkGeo, currentWallMat);
      chunkMesh.position.set(posX, wallHeight / 2, posZ);
      chunkMesh.castShadow = viewMode !== 'cutaway';
      chunkMesh.receiveShadow = true;
      architectureGroup.add(chunkMesh);

      addCollider(
        `wall_${posX.toFixed(2)}_${posZ.toFixed(2)}`,
        posX,
        posZ,
        wX + 0.04,
        dZ + 0.04,
        'wall'
      );
    };

    if (matchingOpenings.length === 0) {
      addSolidWallChunk(0, length);
      return;
    }

    const sorted = [...matchingOpenings].sort((a, b) => a.offset - b.offset);
    let curOffset = 0;

    sorted.forEach((op) => {
      const chunkLen = op.offset - curOffset;
      if (chunkLen > 0.04) {
        addSolidWallChunk(curOffset, chunkLen);
      }

      if (!spawnedOpeningIds.has(op.id)) {
        spawnedOpeningIds.add(op.id);

        const opTop = op.sillHeight + op.height;
        const mid = op.offset + op.width / 2;
        const opCenterX = startX + (isHorizontal ? mid : 0);
        const opCenterZ = startZ + (isHorizontal ? 0 : mid);

        if (wallHeight > opTop) {
          const lintelH = wallHeight - opTop;
          const lintelGeo = new THREE.BoxGeometry(
            isHorizontal ? op.width : thickness,
            lintelH,
            isHorizontal ? thickness : op.width
          );
          disposables.push(lintelGeo);
          const lintelMesh = new THREE.Mesh(lintelGeo, currentWallMat);
          lintelMesh.position.set(opCenterX, opTop + lintelH / 2, opCenterZ);
          architectureGroup.add(lintelMesh);
        }

        if (op.sillHeight > 0) {
          const sillGeo = new THREE.BoxGeometry(
            isHorizontal ? op.width : thickness,
            op.sillHeight,
            isHorizontal ? thickness : op.width
          );
          disposables.push(sillGeo);
          const sillMesh = new THREE.Mesh(sillGeo, currentWallMat);
          sillMesh.position.set(opCenterX, op.sillHeight / 2, opCenterZ);
          architectureGroup.add(sillMesh);

          addCollider(
            `sill_${op.id}`,
            opCenterX,
            opCenterZ,
            isHorizontal ? op.width : thickness + 0.06,
            isHorizontal ? thickness + 0.06 : op.width,
            'wall'
          );
        }

        if (op.type === 'door') {
          const jambThick = 0.05;
          const frameDepth = thickness + 0.035;
          const leftX = startX + (isHorizontal ? op.offset + jambThick / 2 : 0);
          const leftZ = startZ + (isHorizontal ? 0 : op.offset + jambThick / 2);
          const rightX = startX + (isHorizontal ? op.offset + op.width - jambThick / 2 : 0);
          const rightZ = startZ + (isHorizontal ? 0 : op.offset + op.width - jambThick / 2);

          const jambGeo = new THREE.BoxGeometry(
            isHorizontal ? jambThick : frameDepth,
            op.height,
            isHorizontal ? frameDepth : jambThick
          );
          disposables.push(jambGeo);
          const leftJamb = new THREE.Mesh(jambGeo, doorFrameMaterial);
          leftJamb.position.set(leftX, op.height / 2, leftZ);
          const rightJamb = new THREE.Mesh(jambGeo, doorFrameMaterial);
          rightJamb.position.set(rightX, op.height / 2, rightZ);
          architectureGroup.add(leftJamb, rightJamb);

          // Hinged Door Pivot Group
          const hingeX = startX + (isHorizontal ? op.offset + 0.03 : 0);
          const hingeZ = startZ + (isHorizontal ? 0 : op.offset + 0.03);
          const doorPivot = new THREE.Group();
          doorPivot.name = `door_${op.id}`;
          doorPivot.position.set(hingeX, 0, hingeZ);

          const leafW = op.width - 0.06;
          const leafH = op.height - 0.03;
          const isBalconyDoor = op.id.includes('balcony');
          const leafGeo = new THREE.BoxGeometry(leafW, leafH, 0.044);
          disposables.push(leafGeo);
          const doorLeaf = new THREE.Mesh(
            leafGeo,
            isBalconyDoor ? glassWindowMaterial : woodDoorMaterial
          );
          doorLeaf.position.set(leafW / 2, leafH / 2, 0);
          doorLeaf.castShadow = !isBalconyDoor;
          doorLeaf.receiveShadow = true;
          doorPivot.add(doorLeaf);

          // Matte Black Architectural Lever Handle & Lock Escutcheon (Ref Image 2 right edge)
          const handlePlateGeo = new THREE.BoxGeometry(0.038, 0.16, 0.064);
          const leverGeo = new THREE.BoxGeometry(0.12, 0.022, 0.095);
          disposables.push(handlePlateGeo, leverGeo);
          const handlePlate = new THREE.Mesh(handlePlateGeo, doorHandleMaterial);
          handlePlate.position.set(leafW - 0.09, 1.04, 0);
          const lever = new THREE.Mesh(leverGeo, doorHandleMaterial);
          lever.position.set(leafW - 0.12, 1.04, 0);
          doorPivot.add(handlePlate, lever);

          const closedAngle = isHorizontal ? 0 : -Math.PI / 2;
          const openAngle = isHorizontal ? -Math.PI * 0.48 : -0.05;
          doorPivot.rotation.y = closedAngle;

          const doorLabel = op.label || 'Room Door';
          doorPivot.userData = {
            interactiveType: 'door',
            doorId: op.id,
            roomId: op.roomId,
            label: doorLabel
          };
          doorPivot.traverse((child) => {
            child.userData = {
              interactiveType: 'door',
              doorId: op.id,
              roomId: op.roomId,
              label: doorLabel
            };
          });

          architectureGroup.add(doorPivot);
          interactiveMeshes.set(`door_${op.id}`, doorPivot);

          doorPivots.set(op.id, {
            id: op.id,
            roomId: op.roomId,
            label: doorLabel,
            pivot: doorPivot,
            closedAngle,
            openAngle,
            currentAngle: closedAngle,
            worldX: opCenterX - centerX,
            worldZ: opCenterZ - centerZ
          });

          addCollider(
            `door_col_${op.id}`,
            opCenterX,
            opCenterZ,
            isHorizontal ? op.width : thickness + 0.12,
            isHorizontal ? thickness + 0.12 : op.width,
            'door',
            op.id
          );
        } else {
          // Aluminum-Framed Glazed Window with Mullions
          const glassGeo = new THREE.BoxGeometry(
            isHorizontal ? op.width - 0.06 : 0.025,
            op.height - 0.06,
            isHorizontal ? 0.025 : op.width - 0.06
          );
          const mullionGeo = new THREE.BoxGeometry(
            isHorizontal ? 0.04 : 0.05,
            op.height,
            isHorizontal ? 0.05 : 0.04
          );
          disposables.push(glassGeo, mullionGeo);
          const glass = new THREE.Mesh(glassGeo, glassWindowMaterial);
          glass.position.set(opCenterX, op.sillHeight + op.height / 2, opCenterZ);
          const mullion = new THREE.Mesh(mullionGeo, aluminumFrameMaterial);
          mullion.position.set(opCenterX, op.sillHeight + op.height / 2, opCenterZ);
          architectureGroup.add(glass, mullion);
        }
      }

      curOffset = op.offset + op.width;
    });

    if (curOffset < length - 0.04) {
      addSolidWallChunk(curOffset, length - curOffset);
    }
  }

  project.rooms.forEach((room) => {
    // Sit-Out Balcony has open West/North/South balustrade railings (built in room furniture), only East wall shared with Living
    if (room.type === 'balcony') return;

    const rx = room.x;
    const rz = room.z;
    const rw = room.width;
    const rl = room.length;

    buildWallSegment(rx, rz, rw, intThickness, true);
    buildWallSegment(rx, rz + rl, rw, intThickness, true);
    buildWallSegment(rx, rz, rl, intThickness, false);
    buildWallSegment(rx + rw, rz, rl, intThickness, false);
  });

  // 5. Build High-Detail Electrical Equipment & Interactive Exploded DB
  project.electricalPoints.forEach((point) => {
    const ptGroup = new THREE.Group();
    ptGroup.position.set(point.x, point.y, point.z);
    ptGroup.name = `point_${point.id}`;
    ptGroup.userData = {
      interactiveType: point.type === 'db' ? 'db' : 'electrical',
      pointId: point.id,
      roomId: point.roomId,
      circuitId: point.circuitId,
      label: point.name
    };

    if (point.type === 'db') {
      const dbW = 0.52,
        dbH = 0.62,
        dbD = 0.16;

      const layer0 = new THREE.Group();
      layer0.name = 'DB_Layer0_Enclosure';
      const dbBoxGeo = new THREE.BoxGeometry(dbW, dbH, dbD);
      const dbBoxMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.8,
        roughness: 0.3
      });
      disposables.push(dbBoxGeo, dbBoxMat);
      const dbBox = new THREE.Mesh(dbBoxGeo, dbBoxMat);
      layer0.add(dbBox);

      const dinRailGeo = new THREE.BoxGeometry(0.44, 0.035, 0.012);
      const dinRailMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
      disposables.push(dinRailGeo, dinRailMat);
      const dinRailTop = new THREE.Mesh(dinRailGeo, dinRailMat);
      dinRailTop.position.set(0, 0.06, dbD / 2 - 0.03);
      layer0.add(dinRailTop);

      const dinRailBot = new THREE.Mesh(dinRailGeo, dinRailMat);
      dinRailBot.position.set(0, -0.1, dbD / 2 - 0.03);
      layer0.add(dinRailBot);
      ptGroup.add(layer0);
      dbExplodeLayers.push({ group: layer0, targetOffsetZ: 0, targetOffsetX: 0 });

      const layer1 = new THREE.Group();
      layer1.name = 'DB_Layer1_Breakers';

      const mcbBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
      disposables.push(mcbBodyMat);

      const circuitsList = project.circuits;
      const totalModules = circuitsList.length + 2;
      const mcbW = 0.036,
        mcbH = 0.088,
        mcbD = 0.065;
      const mcbGeo = new THREE.BoxGeometry(mcbW, mcbH, mcbD);
      disposables.push(mcbGeo);

      for (let i = 0; i < totalModules; i++) {
        const mcbGroup = new THREE.Group();
        const posX = -0.18 + i * (mcbW + 0.008);
        mcbGroup.position.set(posX, 0.06, dbD / 2 + 0.01);

        const bodyMesh = new THREE.Mesh(mcbGeo, mcbBodyMat);
        mcbGroup.add(bodyMesh);

        const circuit = i >= 2 ? circuitsList[i - 2] : null;
        const stripeColor = i === 0 ? '#EF4444' : i === 1 ? '#0284C7' : circuit?.phaseColor || '#38BDF8';
        const stripeGeo = new THREE.BoxGeometry(mcbW - 0.004, 0.012, 0.004);
        const stripeMat = new THREE.MeshBasicMaterial({ color: stripeColor });
        disposables.push(stripeGeo, stripeMat);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(0, 0.03, mcbD / 2 + 0.002);
        mcbGroup.add(stripe);

        const toggleGeo = new THREE.BoxGeometry(0.018, 0.026, 0.024);
        const toggleMat = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0xef4444 : i === 1 ? 0x0284c7 : 0x10b981,
          roughness: 0.3
        });
        disposables.push(toggleGeo, toggleMat);
        const toggleMesh = new THREE.Mesh(toggleGeo, toggleMat);
        toggleMesh.position.set(0, 0.005, mcbD / 2 + 0.01);
        mcbGroup.add(toggleMesh);

        if (circuit) {
          const breakerId = `breaker_${circuit.id}`;
          mcbGroup.name = breakerId;
          interactiveMeshes.set(breakerId, mcbGroup);
          breakerToggleMeshes.set(circuit.id, toggleMesh);
        } else {
          interactiveMeshes.set('pt_main_db', mcbGroup);
        }

        layer1.add(mcbGroup);
      }
      ptGroup.add(layer1);
      dbExplodeLayers.push({ group: layer1, targetOffsetZ: 0.22, targetOffsetX: 0.12 });

      const layer2 = new THREE.Group();
      layer2.name = 'DB_Layer2_Busbars';
      const busbarColors = [
        { y: 0.21, color: 0xef4444 },
        { y: 0.17, color: 0xf59e0b },
        { y: 0.13, color: 0x3b82f6 },
        { y: -0.18, color: 0x1e293b },
        { y: -0.23, color: 0x10b981 }
      ];
      const barGeo = new THREE.BoxGeometry(0.42, 0.016, 0.018);
      disposables.push(barGeo);

      busbarColors.forEach((b) => {
        const bMat = new THREE.MeshStandardMaterial({
          color: b.color,
          metalness: 0.85,
          roughness: 0.2
        });
        disposables.push(bMat);
        const barMesh = new THREE.Mesh(barGeo, bMat);
        barMesh.position.set(0, b.y, dbD / 2 + 0.03);
        layer2.add(barMesh);
      });
      ptGroup.add(layer2);
      dbExplodeLayers.push({ group: layer2, targetOffsetZ: 0.42, targetOffsetX: 0.24 });

      const layer3 = new THREE.Group();
      layer3.name = 'DB_Layer3_Door';

      const doorPivot = new THREE.Group();
      doorPivot.position.set(-dbW / 2, 0, dbD / 2 + 0.04);
      const doorGeo = new THREE.BoxGeometry(dbW, dbH, 0.02);
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.25
      });
      disposables.push(doorGeo, doorMat);
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(dbW / 2, 0, 0);

      const placardGeo = new THREE.PlaneGeometry(0.42, 0.5);
      const placardMat = new THREE.MeshBasicMaterial({ map: dbScheduleTex, side: THREE.DoubleSide });
      disposables.push(placardGeo, placardMat);
      const placard = new THREE.Mesh(placardGeo, placardMat);
      placard.position.set(dbW / 2, 0, -0.012);
      doorMesh.add(placard);

      doorPivot.add(doorMesh);
      if (dbDoorOpen) {
        doorPivot.rotation.y = -Math.PI * 0.58;
      }
      layer3.add(doorPivot);
      dbDoorPivot = doorPivot;
      ptGroup.add(layer3);
      dbExplodeLayers.push({ group: layer3, targetOffsetZ: 0.64, targetOffsetX: 0.36 });

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
      return;
    }

    if (point.type === 'earth_pit') {
      const pitGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
      const pitMat = new THREE.MeshStandardMaterial({
        map: earthPitTex,
        roughness: 0.65,
        metalness: 0.8
      });
      disposables.push(pitGeo, pitMat);
      const pitMesh = new THREE.Mesh(pitGeo, pitMat);
      pitMesh.position.y = 0.025;
      ptGroup.add(pitMesh);

      const rodGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.35, 12);
      const rodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      disposables.push(rodGeo, rodMat);
      const earthRod = new THREE.Mesh(rodGeo, rodMat);
      earthRod.position.set(0, 0.18, 0);
      ptGroup.add(earthRod);

      const dbPoint = project.electricalPoints.find((p) => p.type === 'db');
      if (dbPoint) {
        const earthLineCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(point.x, 0.1, point.z),
          new THREE.Vector3(point.x + 0.3, 0.06, point.z),
          new THREE.Vector3(dbPoint.x, 0.06, point.z),
          new THREE.Vector3(dbPoint.x, dbPoint.y - 0.28, dbPoint.z)
        ]);
        const earthTubeGeo = new THREE.TubeGeometry(earthLineCurve, 28, 0.015, 8, false);
        const earthTapeMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.35,
          roughness: 0.35
        });
        disposables.push(earthTubeGeo, earthTapeMat);
        const earthTube = new THREE.Mesh(earthTubeGeo, earthTapeMat);
        wiringGroup.add(earthTube);
        earthConductorMeshes.push(earthTube);
      }

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
      return;
    }

    if (point.type === 'switch_board_6a') {
      const isEastWest = point.wallPlacement === 'east' || point.wallPlacement === 'west';
      const plateGeo = new THREE.BoxGeometry(isEastWest ? 0.03 : 0.24, 0.14, isEastWest ? 0.24 : 0.03);
      const plateMat = new THREE.MeshStandardMaterial({
        map: switchPlateTex,
        roughness: 0.2,
        metalness: 0.05
      });
      disposables.push(plateGeo, plateMat);
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      ptGroup.add(plateMesh);

      const neonGeo = new THREE.SphereGeometry(0.011, 8, 8);
      const neonMat = new THREE.MeshBasicMaterial({ color: point.isOn ? 0x10b981 : 0xef4444 });
      disposables.push(neonGeo, neonMat);
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.position.set(isEastWest ? 0.018 : 0.08, 0.04, isEastWest ? 0.08 : 0.018);
      ptGroup.add(neon);

      indicatorRegistry.set(point.id, {
        mat: neonMat,
        onHex: 0x10b981,
        offHex: 0xef4444,
        circuitId: point.circuitId
      });

      interactiveMeshes.set(point.id, ptGroup);
      lightingGroup.add(ptGroup);
    } else if (point.type === 'power_socket_16a' || point.type === 'combined_socket_6_16a') {
      const isEastWest = point.wallPlacement === 'east' || point.wallPlacement === 'west';
      const sockGeo = new THREE.BoxGeometry(isEastWest ? 0.03 : 0.15, 0.15, isEastWest ? 0.15 : 0.03);
      const sockMat = new THREE.MeshStandardMaterial({
        map: socketTex,
        roughness: 0.25,
        metalness: 0.05
      });
      disposables.push(sockGeo, sockMat);
      const sockMesh = new THREE.Mesh(sockGeo, sockMat);
      ptGroup.add(sockMesh);

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
    } else if (point.type === 'geyser_point') {
      const isWest = point.wallPlacement === 'west';
      const tankGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.48, 24);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });
      disposables.push(tankGeo, tankMat);
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.set(isWest ? 0.22 : -0.22, 0.15, 0);
      ptGroup.add(tankMesh);

      const ledGeo = new THREE.SphereGeometry(0.015, 10, 10);
      const ledMat = new THREE.MeshBasicMaterial({ color: point.isOn ? 0xef4444 : 0x475569 });
      disposables.push(ledGeo, ledMat);
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(isWest ? 0.41 : -0.41, 0.08, 0);
      ptGroup.add(led);

      indicatorRegistry.set(point.id, {
        mat: ledMat,
        onHex: 0xef4444,
        offHex: 0x475569,
        circuitId: point.circuitId
      });

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
    } else if (point.type === 'downlight_led') {
      const ringGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.7 });
      disposables.push(ringGeo, ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI;
      ptGroup.add(ring);

      const diffuserGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.008, 24);
      const diffuserMat = new THREE.MeshBasicMaterial({
        color: point.isOn ? 0xfef08a : 0x475569
      });
      disposables.push(diffuserGeo, diffuserMat);
      const diffuser = new THREE.Mesh(diffuserGeo, diffuserMat);
      diffuser.position.y = -0.012;
      ptGroup.add(diffuser);

      const pointLight = new THREE.PointLight(0xffedd5, point.isOn ? 2.1 : 0.0, 13.5, 1.3);
      pointLight.position.set(0, -0.18, 0);
      ptGroup.add(pointLight);

      pointLightRegistry.set(point.id, {
        light: pointLight,
        diffuserMat,
        circuitId: point.circuitId
      });

      interactiveMeshes.set(point.id, ptGroup);
      lightingGroup.add(ptGroup);
    } else if (point.type === 'ceiling_fan') {
      const fanBaseGroup = new THREE.Group();
      const canopyGeo = new THREE.ConeGeometry(0.09, 0.07, 16);
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x271911, metalness: 0.6, roughness: 0.35 });
      disposables.push(canopyGeo, canopyMat);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 0.28;
      fanBaseGroup.add(canopy);

      const rodGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.32, 12);
      disposables.push(rodGeo);
      const rod = new THREE.Mesh(rodGeo, canopyMat);
      rod.position.y = 0.14;
      fanBaseGroup.add(rod);

      const bladeRotator = new THREE.Group();
      const motorHubGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.068, 24);
      disposables.push(motorHubGeo);
      const motorHub = new THREE.Mesh(motorHubGeo, canopyMat);
      bladeRotator.add(motorHub);

      for (let b = 0; b < 3; b++) {
        const angle = (b * Math.PI * 2) / 3;
        const bladeArm = new THREE.Group();
        bladeArm.rotation.y = angle;

        const bladeGeo = new THREE.BoxGeometry(0.75, 0.01, 0.16);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x271911,
          metalness: 0.4,
          roughness: 0.35
        });
        disposables.push(bladeGeo, bladeMat);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.44, 0, 0);
        blade.rotation.x = 0.08;
        bladeArm.add(blade);
        bladeRotator.add(bladeArm);
      }

      fanBaseGroup.add(bladeRotator);
      ptGroup.add(fanBaseGroup);

      fanRotators.push({
        group: bladeRotator,
        speedMultiplier: point.stateValue ?? 2,
        pointId: point.id,
        circuitId: point.circuitId
      });

      interactiveMeshes.set(point.id, ptGroup);
      lightingGroup.add(ptGroup);
    } else if (point.type === 'ac_isolator') {
      const boxGeo = new THREE.BoxGeometry(0.14, 0.18, 0.08);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
      disposables.push(boxGeo, boxMat);
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      ptGroup.add(boxMesh);

      const knobGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16);
      const knobMat = new THREE.MeshStandardMaterial({
        color: point.isOn ? 0x10b981 : 0xdc2626,
        metalness: 0.2,
        roughness: 0.4
      });
      disposables.push(knobGeo, knobMat);
      const knob = new THREE.Mesh(knobGeo, knobMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.z = 0.05;
      ptGroup.add(knob);

      indicatorRegistry.set(point.id, {
        mat: knobMat,
        onHex: 0x10b981,
        offHex: 0xdc2626,
        circuitId: point.circuitId
      });

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
    }
  });

  // 6. Concealed PVC Conduits (`conduitsGroup`) & Color-Coded Internal Wiring (`wiringGroup`)
  const dbPoint = project.electricalPoints.find((p) => p.type === 'db');
  const ceilingY = baseCeilH - 0.15;

  if (dbPoint) {
    project.circuits.forEach((circuit, cIdx) => {
      const isSelectedCircuit = circuit.id === activeCircuitId;
      const circuitColor = new THREE.Color(circuit.phaseColor || '#38bdf8');

      const category: 'lighting' | 'power' | 'heavy' | 'earthing' =
        circuit.id.includes('lighting') || circuit.id.includes('fan')
          ? 'lighting'
          : circuit.id.includes('socket') || circuit.id.includes('kitchen')
          ? 'power'
          : circuit.id.includes('earth')
          ? 'earthing'
          : 'heavy';

      const conduitMat = new THREE.MeshStandardMaterial({
        color: isSelectedCircuit ? circuitColor : new THREE.Color(0x94a3b8),
        emissive: isSelectedCircuit ? circuitColor : new THREE.Color(0x000000),
        emissiveIntensity: isSelectedCircuit ? 0.55 : 0.0,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: isSelectedCircuit ? 0.65 : 0.38
      });
      disposables.push(conduitMat);
      if (isSelectedCircuit) {
        activeConduitMaterials.push(conduitMat);
      }

      const phaseWireMat = new THREE.MeshStandardMaterial({
        color: circuitColor,
        emissive: circuitColor,
        emissiveIntensity: isSelectedCircuit ? 0.85 : 0.35,
        roughness: 0.25,
        metalness: 0.4
      });
      const earthWireMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.3,
        metalness: 0.3
      });
      const jboxMat = new THREE.MeshStandardMaterial({
        color: isSelectedCircuit ? circuitColor : new THREE.Color(0x475569),
        metalness: 0.3,
        roughness: 0.5
      });
      disposables.push(phaseWireMat, earthWireMat, jboxMat);

      const circuitMeshes: THREE.Object3D[] = [];
      const heightOffset = (cIdx % 3) * 0.025;

      circuit.connectedPointIds.forEach((ptId) => {
        const targetPt = project.electricalPoints.find((p) => p.id === ptId);
        if (!targetPt || targetPt.type === 'earth_pit' || targetPt.type === 'db') return;

        const points = [
          new THREE.Vector3(dbPoint.x, dbPoint.y + 0.25, dbPoint.z),
          new THREE.Vector3(dbPoint.x, ceilingY + heightOffset, dbPoint.z),
          new THREE.Vector3(targetPt.x, ceilingY + heightOffset, dbPoint.z),
          new THREE.Vector3(targetPt.x, ceilingY + heightOffset, targetPt.z)
        ];

        if (targetPt.y < baseCeilH - 0.5) {
          points.push(new THREE.Vector3(targetPt.x, targetPt.y + 0.06, targetPt.z));
        }

        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.08);
        const outerRadius = circuit.conduitSize === '25mm' ? 0.02 : 0.015;

        const conduitGeo = new THREE.TubeGeometry(curve, 32, outerRadius, 8, false);
        disposables.push(conduitGeo);
        const conduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
        conduitsGroup.add(conduitMesh);
        circuitMeshes.push(conduitMesh);

        const jboxGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 12);
        disposables.push(jboxGeo);
        const jbox = new THREE.Mesh(jboxGeo, jboxMat);
        jbox.position.set(targetPt.x, ceilingY + heightOffset, targetPt.z);
        conduitsGroup.add(jbox);
        circuitMeshes.push(jbox);

        const phaseWireGeo = new THREE.TubeGeometry(curve, 32, 0.0065, 6, false);
        disposables.push(phaseWireGeo);
        const phaseWireMesh = new THREE.Mesh(phaseWireGeo, phaseWireMat);
        wiringGroup.add(phaseWireMesh);
        circuitMeshes.push(phaseWireMesh);

        const earthPoints = points.map((p) => new THREE.Vector3(p.x + 0.012, p.y - 0.008, p.z + 0.012));
        const earthCurve = new THREE.CatmullRomCurve3(earthPoints, false, 'catmullrom', 0.08);
        const earthWireGeo = new THREE.TubeGeometry(earthCurve, 28, 0.0045, 6, false);
        disposables.push(earthWireGeo);
        const earthWireMesh = new THREE.Mesh(earthWireGeo, earthWireMat);
        wiringGroup.add(earthWireMesh);
        earthConductorMeshes.push(earthWireMesh);
      });

      circuitMeshGroups.set(circuit.id, {
        category,
        conduitMat,
        phaseMat: phaseWireMat,
        jboxMat,
        baseColor: circuitColor,
        meshes: circuitMeshes
      });
    });
  }

  // Update loop
  let elapsed = 0;
  let currentExplodeFactor = 0;

  const update = (
    delta: number,
    fanSpeedLevel: number,
    currentActiveCircuitId: string,
    options?: {
      layers?: ResidentialLayerVisibility;
      circuitFilter?: CircuitSubLayerFilter;
      wallOpacity?: number;
      dbExploded?: boolean;
      dbDoorOpen?: boolean;
      breakerStates?: Record<string, boolean>;
      doorStates?: Record<string, boolean>;
      electricalPoints?: ElectricalPoint[];
    }
  ) => {
    elapsed += delta;

    if (options?.layers) {
      architectureGroup.visible = options.layers.architecture;
      furnitureGroup.visible = options.layers.furniture;
      lightingGroup.visible = options.layers.lighting;
      conduitsGroup.visible = options.layers.conduits;
      wiringGroup.visible = options.layers.wiring;
      distributionGroup.visible = options.layers.distribution;
    }

    const pulse = 0.6 + Math.sin(elapsed * 4.5) * 0.3;
    circuitMeshGroups.forEach((entry, circId) => {
      const isSelected = circId === currentActiveCircuitId;
      entry.conduitMat.color.copy(isSelected ? entry.baseColor : new THREE.Color(0x94a3b8));
      entry.conduitMat.emissive.copy(isSelected ? entry.baseColor : new THREE.Color(0x000000));
      entry.conduitMat.emissiveIntensity = isSelected ? pulse : 0.0;
      entry.conduitMat.opacity = isSelected ? 0.68 : 0.36;
      entry.phaseMat.emissiveIntensity = isSelected ? 0.85 : 0.35;
      entry.jboxMat.color.copy(isSelected ? entry.baseColor : new THREE.Color(0x475569));

      if (options?.circuitFilter) {
        const vis = options.circuitFilter[entry.category];
        entry.meshes.forEach((m) => {
          m.visible = vis;
        });
      }
    });

    if (options?.circuitFilter) {
      earthConductorMeshes.forEach((m) => {
        m.visible = options.circuitFilter!.earthing;
      });
    }

    if (options?.wallOpacity !== undefined) {
      currentWallMat.opacity = options.wallOpacity;
      currentWallMat.transparent = options.wallOpacity < 0.99;
      currentWallMat.depthWrite = options.wallOpacity > 0.75;
      concreteCeilingMaterial.opacity = options.wallOpacity < 0.85 ? options.wallOpacity * 0.85 : 1.0;
      concreteCeilingMaterial.transparent = options.wallOpacity < 0.85;
      concreteCeilingMaterial.depthWrite = options.wallOpacity >= 0.85;
    }

    const targetExplode = options?.dbExploded ? 1.0 : 0.0;
    currentExplodeFactor += (targetExplode - currentExplodeFactor) * (1 - Math.exp(-8 * delta));
    dbExplodeLayers.forEach((item) => {
      item.group.position.z = item.targetOffsetZ * currentExplodeFactor;
      item.group.position.x = item.targetOffsetX * currentExplodeFactor;
    });

    if (dbDoorPivot && options?.dbDoorOpen !== undefined) {
      const targetRot = options.dbDoorOpen ? -Math.PI * 0.58 : 0;
      dbDoorPivot.rotation.y += (targetRot - dbDoorPivot.rotation.y) * (1 - Math.exp(-10 * delta));
    }

    if (options?.doorStates) {
      doorPivots.forEach((doorEntry, doorId) => {
        const isOpen = !!options.doorStates?.[doorId];
        const targetAngle = isOpen ? doorEntry.openAngle : doorEntry.closedAngle;
        doorEntry.currentAngle += (targetAngle - doorEntry.currentAngle) * (1 - Math.exp(-10 * delta));
        doorEntry.pivot.rotation.y = doorEntry.currentAngle;
      });
    }

    if (options?.breakerStates) {
      breakerToggleMeshes.forEach((mesh, circId) => {
        const isClosed = options.breakerStates?.[circId] !== false;
        mesh.position.y = isClosed ? 0.012 : -0.012;
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(isClosed ? 0x10b981 : 0xef4444);
      });
    }

    const ptMap = new Map<string, ElectricalPoint>();
    if (options?.electricalPoints) {
      options.electricalPoints.forEach((p) => ptMap.set(p.id, p));
    }

    pointLightRegistry.forEach((entry, ptId) => {
      const pt = ptMap.get(ptId);
      const isBreakerOn = options?.breakerStates?.[entry.circuitId] !== false;
      const isActive = (pt ? pt.isOn : true) && isBreakerOn;
      entry.light.intensity = isActive ? 2.1 : 0.0;
      entry.diffuserMat.color.setHex(isActive ? 0xfef08a : 0x475569);
    });

    indicatorRegistry.forEach((entry, ptId) => {
      const pt = ptMap.get(ptId);
      const isBreakerOn = options?.breakerStates?.[entry.circuitId] !== false;
      const isActive = (pt ? pt.isOn : true) && isBreakerOn;
      entry.mat.color.setHex(isActive ? entry.onHex : entry.offHex);
    });

    // Sync Cove Lights, Chandeliers, Bedside Lamps & Under-Cabinet LEDs with Room Downlights
    decorativeLightMeshes.forEach((dec) => {
      const isBreakerOn = options?.breakerStates?.[dec.circuitId] !== false;
      const roomHasLightOn = options?.electricalPoints
        ? options.electricalPoints.some(
            (p) => p.roomId === dec.roomId && p.type === 'downlight_led' && p.isOn
          )
        : true;
      const isActive = roomHasLightOn && isBreakerOn;
      dec.mat.color.setHex(isActive ? dec.onColor : dec.offColor);
      if ('emissiveIntensity' in dec.mat) {
        dec.mat.emissiveIntensity = isActive ? dec.emissiveOn : 0.0;
      }
      if (dec.auxLight) {
        dec.auxLight.intensity = isActive ? dec.auxIntensity ?? 1.0 : 0.0;
      }
    });

    // Sync 65" Smart TV Display & Ambient Glow with pt_living_socket1
    if (smartTvScreenMesh) {
      const tvPt = ptMap.get('pt_living_socket1');
      const isBreakerOn = options?.breakerStates?.['c3_power_sockets'] !== false;
      const isTvActive = (tvPt ? tvPt.isOn : true) && isBreakerOn;
      if (isTvActive !== lastTvState) {
        lastTvState = isTvActive;
        const mat = smartTvScreenMesh.material as THREE.MeshBasicMaterial;
        mat.map = isTvActive ? tvOnTex : tvOffTex;
        mat.needsUpdate = true;
      }
      if (smartTvGlowLight) {
        smartTvGlowLight.intensity = isTvActive ? 0.9 : 0.0;
      }
    }

    // Sync Smart Split AC Units (Living, Master, Second Bed)
    acUnitRegistry.forEach((acEntry, acPtId) => {
      const pt = ptMap.get(acPtId);
      const isBreakerOn = options?.breakerStates?.[acEntry.circuitId] !== false;
      const isAcActive = (pt ? pt.isOn : true) && isBreakerOn;
      acEntry.displayMat.color.setHex(isAcActive ? 0x38bdf8 : 0x334155);
      acEntry.louvreMesh.rotation.x = isAcActive ? 0.55 + Math.sin(elapsed * 2.0) * 0.15 : 0.0;
    });

    // Rotate ceiling fans only if powered ON and circuit breaker is ON
    const speedRadPerSec = fanSpeedLevel === 0 ? 0 : fanSpeedLevel === 1 ? 6.0 : fanSpeedLevel === 2 ? 14.0 : 26.0;
    fanRotators.forEach((rot) => {
      const pt = ptMap.get(rot.pointId);
      const isBreakerOn = options?.breakerStates?.[rot.circuitId] !== false;
      const isActive = (pt ? pt.isOn : true) && isBreakerOn;
      if (isActive) {
        rot.group.rotation.y += speedRadPerSec * delta;
      }
    });
  };

  const dispose = () => {
    disposables.forEach((item) => {
      if ('dispose' in item) {
        item.dispose();
      }
    });
  };

  return {
    rootGroup,
    houseCenter: new THREE.Vector3(centerX, 0, centerZ),
    buildingBounds: {
      minX: minX - centerX - 3.2,
      maxX: maxX - centerX + 2.5,
      minZ: minZ - centerZ - 3.6,
      maxZ: maxZ - centerZ + 2.5
    },
    colliders,
    doorPivots,
    fanRotators,
    dbDoorPivot,
    interactiveMeshes,
    activeConduitMaterials,
    update,
    dispose
  };
}
