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
  createEarthChamberTexture
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

  // Textures
  const floorTileTex = createFloorTilesTexture();
  const brickWallTex = createBrickWallTexture();
  const dbScheduleTex = createDbScheduleTexture();
  const socketTex = createIndianSocketTexture();
  const switchPlateTex = createSwitchPlateTexture();
  const earthPitTex = createEarthChamberTexture();

  disposables.push(floorTileTex, brickWallTex, dbScheduleTex, socketTex, switchPlateTex, earthPitTex);

  // Shared Materials
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: viewMode === 'construction' ? undefined : floorTileTex,
    color: viewMode === 'construction' ? 0x78716c : 0xf8fafc,
    roughness: viewMode === 'construction' ? 0.9 : 0.25,
    metalness: 0.05
  });

  const wallPlasterMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.78,
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
    color: viewMode === 'construction' ? 0x64748b : 0xf8fafc,
    roughness: 0.8,
    metalness: 0.05,
    transparent: viewMode === 'cutaway',
    opacity: viewMode === 'cutaway' ? 0.18 : 1.0,
    depthWrite: viewMode !== 'cutaway',
    side: THREE.DoubleSide
  });

  const woodDoorMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b4226,
    roughness: 0.48,
    metalness: 0.06
  });

  const doorFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.55,
    metalness: 0.08
  });

  const doorHandleMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.9
  });

  const glassWindowMaterial = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.38
  });

  const aluminumFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.85
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
    aluminumFrameMaterial
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

  // Helper to create a box mesh with optional furniture collision
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
    metalness = 0.1,
    opacity = 1.0,
    registerCollision = false
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      transparent: opacity < 1.0,
      opacity
    });
    disposables.push(geo, mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = opacity === 1.0;
    mesh.receiveShadow = true;
    parent.add(mesh);

    if (registerCollision) {
      addCollider(`furn_${x.toFixed(1)}_${z.toFixed(1)}`, x, z, w * 0.85, d * 0.85, 'furniture');
    }
    return mesh;
  };

  // 2. Outdoor Plinth / Earth Base Slab + Exterior Entrance Landing
  const plinthMargin = 4.5;
  const plinthGeo = new THREE.BoxGeometry(buildingW + plinthMargin * 2, 0.2, buildingL + plinthMargin * 2);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.95
  });
  disposables.push(plinthGeo, plinthMat);
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.set(centerX, -0.1, centerZ);
  plinthMesh.receiveShadow = true;
  architectureGroup.add(plinthMesh);

  // Exterior Entrance Corridor Landing outside Foyer
  const foyerRoom = project.rooms.find((r) => r.type === 'foyer');
  if (foyerRoom) {
    const landingW = foyerRoom.width + 1.4;
    const landingL = 3.0;
    const landingX = foyerRoom.x + foyerRoom.width / 2;
    const landingZ = foyerRoom.z - landingL / 2;
    addBox(architectureGroup, landingW, 0.04, landingL, 0xcbd5e1, landingX, 0.02, landingZ, 0.4, 0.05);
    // Grand Coir Welcome Mat outside Main Entrance Door
    addBox(architectureGroup, 1.6, 0.015, 0.9, 0x92400e, foyerRoom.x + foyerRoom.width / 2, 0.045, foyerRoom.z - 0.65, 0.9, 0.0);
    // Warm Exterior Entrance Wall Sconce Light
    const sconceLight = new THREE.PointLight(0xffedd5, 1.6, 9.0, 1.4);
    sconceLight.position.set(foyerRoom.x + foyerRoom.width - 0.6, 2.5, foyerRoom.z - 0.35);
    architectureGroup.add(sconceLight);
    addBox(architectureGroup, 0.18, 0.32, 0.1, 0xfef08a, foyerRoom.x + foyerRoom.width - 0.6, 2.5, foyerRoom.z - 0.1, 0.2, 0.1);
  }

  // Subtle CAD reference grid on plinth
  const gridHelper = new THREE.GridHelper(Math.max(buildingW, buildingL) + 9, 32, 0x38bdf8, 0x334155);
  gridHelper.position.set(centerX, 0.005, centerZ);
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.25;
  architectureGroup.add(gridHelper);

  // 3. Room Floors, Skirting, Ceilings & Detailed 3D Furniture with Collision Boxes
  project.rooms.forEach((room) => {
    const roomFloorMat = floorMaterial.clone();
    if (room.type === 'bathroom') roomFloorMat.color.setHex(0xe0f2fe);
    else if (room.type === 'kitchen') roomFloorMat.color.setHex(0xfef3c7);
    else if (room.type === 'master_bedroom') roomFloorMat.color.setHex(0xf5f3ff);
    disposables.push(roomFloorMat);

    const floorGeo = new THREE.BoxGeometry(room.width, 0.05, room.length);
    disposables.push(floorGeo);
    const floorMesh = new THREE.Mesh(floorGeo, roomFloorMat);
    floorMesh.position.set(room.x + room.width / 2, 0.025, room.z + room.length / 2);
    floorMesh.receiveShadow = true;
    architectureGroup.add(floorMesh);

    if (ceilingVisible) {
      const ceilGeo = new THREE.BoxGeometry(room.width, 0.12, room.length);
      disposables.push(ceilGeo);
      const ceilMesh = new THREE.Mesh(ceilGeo, concreteCeilingMaterial);
      ceilMesh.position.set(room.x + room.width / 2, room.ceilingHeight + 0.06, room.z + room.length / 2);
      ceilMesh.receiveShadow = true;
      architectureGroup.add(ceilMesh);
    }

    // 3B. Detailed 3D Room Furnishings & Appliances (with solid colliders for large furniture)
    const rx = room.x;
    const rz = room.z;
    const rw = room.width;
    const rl = room.length;
    const rmGroup = new THREE.Group();
    rmGroup.name = `Furniture_${room.id}`;

    if (room.type === 'living') {
      // Scale living furniture proportionally so both compact and grand dimensions have wide walking paths
      const sofaW = Math.min(3.2, rw * 0.32);
      const sofaSideL = Math.min(2.2, rl * 0.28);
      const sofaX = rx + Math.max(sofaW / 2 + 0.6, rw * 0.24);
      const sofaZ = rz + rl - Math.min(1.55, rl * 0.22);
      addBox(rmGroup, sofaW, 0.45, 1.0, 0x334155, sofaX, 0.225, sofaZ, 0.8, 0.05, 1, true);
      addBox(rmGroup, sofaW, 0.52, 0.22, 0x1e293b, sofaX, 0.68, sofaZ + 0.4, 0.85, 0.05);
      addBox(rmGroup, 1.0, 0.45, sofaSideL, 0x334155, sofaX - sofaW / 2 + 0.5, 0.225, sofaZ - sofaSideL / 2 + 0.1, 0.8, 0.05, 1, true);
      // Accent Cushions
      addBox(rmGroup, 0.44, 0.36, 0.16, 0x0284c7, sofaX - sofaW * 0.25, 0.62, sofaZ + 0.2, 0.7, 0.0);
      addBox(rmGroup, 0.44, 0.36, 0.16, 0xf59e0b, sofaX + sofaW * 0.25, 0.62, sofaZ + 0.2, 0.7, 0.0);
      // Area Rug & Center Coffee Table (no blocking collision on coffee table so walking feels completely free)
      const rugZ = Math.max(rz + 1.8, sofaZ - Math.min(1.75, rl * 0.24));
      addBox(rmGroup, Math.min(3.4, rw * 0.34), 0.015, Math.min(2.3, rl * 0.28), 0xcbd5e1, sofaX + 0.25, 0.055, rugZ, 0.95, 0.0);
      addBox(rmGroup, Math.min(1.45, rw * 0.16), 0.4, 0.72, 0x78350f, sofaX + 0.25, 0.21, rugZ, 0.4, 0.1, 1, false);
      // TV Entertainment Console + Wall-Mounted Smart TV on North Wall (clear of foyer doorway)
      const tvX = rx + rw * 0.56;
      const tvW = Math.min(2.6, rw * 0.26);
      addBox(rmGroup, tvW, 0.52, 0.46, 0x5c3a21, tvX, 0.26, rz + 0.34, 0.5, 0.1, 1, true);
      addBox(rmGroup, tvW * 0.82, 1.12, 0.05, 0x090d16, tvX, 1.65, rz + 0.15, 0.15, 0.6);
      // 6-Seater Grand Dining Table & Chairs in East Dining Zone (clear of Kitchen & Bath doorways)
      const dx = rx + rw - Math.max(1.6, Math.min(2.4, rw * 0.24));
      const dz = rz + rl * 0.52;
      const dtW = Math.min(2.1, rw * 0.22);
      addBox(rmGroup, dtW, 0.06, 1.1, 0x78350f, dx, 0.78, dz, 0.35, 0.1, 1, false);
      addBox(rmGroup, 0.1, 0.76, 0.1, 0x1e293b, dx - dtW * 0.4, 0.38, dz - 0.4, 0.4, 0.6);
      addBox(rmGroup, 0.1, 0.76, 0.1, 0x1e293b, dx + dtW * 0.4, 0.38, dz - 0.4, 0.4, 0.6);
      addBox(rmGroup, 0.1, 0.76, 0.1, 0x1e293b, dx - dtW * 0.4, 0.38, dz + 0.4, 0.4, 0.6);
      addBox(rmGroup, 0.1, 0.76, 0.1, 0x1e293b, dx + dtW * 0.4, 0.38, dz + 0.4, 0.4, 0.6);
      addBox(rmGroup, 0.45, 0.46, 0.45, 0x475569, dx - dtW * 0.24, 0.23, dz - 0.72, 0.7, 0.1);
      addBox(rmGroup, 0.45, 0.46, 0.45, 0x475569, dx + dtW * 0.24, 0.23, dz - 0.72, 0.7, 0.1);
      addBox(rmGroup, 0.45, 0.46, 0.45, 0x475569, dx - dtW * 0.24, 0.23, dz + 0.72, 0.7, 0.1);
      addBox(rmGroup, 0.45, 0.46, 0.45, 0x475569, dx + dtW * 0.24, 0.23, dz + 0.72, 0.7, 0.1);
    } else if (room.type === 'kitchen') {
      // L-Shaped Modular Kitchen Base Cabinets & Black Granite Countertop along East and North Walls
      const eastCabL = Math.max(1.6, rl - 0.4);
      const northCabW = Math.max(1.4, rw - 1.4);
      addBox(rmGroup, 0.7, 0.88, eastCabL, 0x0f766e, rx + rw - 0.42, 0.44, rz + rl / 2, 0.5, 0.1, 1, true);
      addBox(rmGroup, 0.74, 0.04, eastCabL + 0.04, 0x111827, rx + rw - 0.42, 0.9, rz + rl / 2, 0.2, 0.3);
      addBox(rmGroup, northCabW, 0.88, 0.68, 0x0f766e, rx + northCabW / 2 + 0.35, 0.44, rz + 0.42, 0.5, 0.1, 1, true);
      addBox(rmGroup, northCabW + 0.04, 0.04, 0.72, 0x111827, rx + northCabW / 2 + 0.35, 0.9, rz + 0.42, 0.2, 0.3);
      // 4-Burner Induction / Glass Hob & Auto-Clean Chimney
      addBox(rmGroup, 0.52, 0.03, Math.min(0.9, rl * 0.22), 0x030712, rx + rw - 0.42, 0.93, rz + rl * 0.42, 0.15, 0.5);
      addBox(rmGroup, 0.5, 0.25, Math.min(0.92, rl * 0.22), 0x94a3b8, rx + rw - 0.42, 2.05, rz + rl * 0.42, 0.25, 0.85);
      addBox(rmGroup, 0.26, 1.15, 0.26, 0x94a3b8, rx + rw - 0.3, 2.7, rz + rl * 0.42, 0.25, 0.85);
      // Stainless Steel Double Sink
      addBox(rmGroup, 0.5, 0.02, Math.min(0.8, rl * 0.2), 0xcbd5e1, rx + rw - 0.42, 0.925, rz + rl * 0.75, 0.2, 0.9);
      // Side-by-Side Double-Door Refrigerator & Microwave Oven on North Wall
      addBox(rmGroup, 0.88, 1.95, 0.75, 0x64748b, rx + Math.min(0.95, rw * 0.22), 0.975, rz + 0.5, 0.25, 0.8, 1, true);
      addBox(rmGroup, 0.56, 0.35, 0.42, 0x1e293b, rx + Math.min(2.25, rw * 0.48), 1.1, rz + 0.42, 0.3, 0.6);
    } else if (room.type === 'master_bedroom') {
      // Grand King-Size Bed along South Wall (scales cleanly with room dimensions)
      const bedW = Math.min(2.25, rw * 0.34);
      const bedL = Math.min(2.35, rl * 0.36);
      const bx = rx + rw / 2 - 0.15;
      const bz = rz + rl - bedL / 2 - 0.18;
      addBox(rmGroup, bedW, 0.38, bedL, 0x5c3a21, bx, 0.19, bz, 0.6, 0.05, 1, true);
      addBox(rmGroup, bedW - 0.1, 0.24, bedL - 0.12, 0xf8fafc, bx, 0.45, bz + 0.02, 0.85, 0.0);
      addBox(rmGroup, bedW - 0.08, 0.06, bedL * 0.52, 0x1e3a8a, bx, 0.58, bz + bedL * 0.18, 0.85, 0.0);
      addBox(rmGroup, bedW + 0.06, 1.25, 0.14, 0x451a03, bx, 0.625, rz + rl - 0.14, 0.55, 0.05);
      // 2 Pillows
      addBox(rmGroup, Math.min(0.7, bedW * 0.34), 0.12, 0.4, 0xe2e8f0, bx - bedW * 0.23, 0.61, rz + rl - 0.44, 0.8, 0.0);
      addBox(rmGroup, Math.min(0.7, bedW * 0.34), 0.12, 0.4, 0xe2e8f0, bx + bedW * 0.23, 0.61, rz + rl - 0.44, 0.8, 0.0);
      // Bedside Tables
      addBox(rmGroup, 0.54, 0.52, 0.46, 0x5c3a21, bx - bedW / 2 - 0.38, 0.26, rz + rl - 0.42, 0.5, 0.05, 1, false);
      addBox(rmGroup, 0.54, 0.52, 0.46, 0x5c3a21, bx + bedW / 2 + 0.38, 0.26, rz + rl - 0.42, 0.5, 0.05, 1, false);
      // Full-Height Sliding Door Wardrobe along West Wall
      const wardL = Math.min(2.8, rl * 0.38);
      addBox(rmGroup, 0.62, 2.55, wardL, 0x78350f, rx + 0.38, 1.275, rz + rl * 0.36, 0.45, 0.1, 1, true);
      // Wall-Mounted 1.5T Split AC Indoor Unit above Bed
      addBox(rmGroup, 1.15, 0.32, 0.24, 0xf8fafc, bx, Math.min(2.95, room.ceilingHeight - 0.45), rz + rl - 0.18, 0.2, 0.1);
    } else if (room.type === 'bedroom_2') {
      // Spacious Queen Bed along South Wall
      const bedW = Math.min(1.85, rw * 0.34);
      const bedL = Math.min(2.25, rl * 0.35);
      const bx = rx + rw / 2 + 0.12;
      const bz = rz + rl - bedL / 2 - 0.18;
      addBox(rmGroup, bedW, 0.36, bedL, 0x78350f, bx, 0.18, bz, 0.6, 0.05, 1, true);
      addBox(rmGroup, bedW - 0.1, 0.22, bedL - 0.12, 0xf8fafc, bx, 0.42, bz, 0.85, 0.0);
      addBox(rmGroup, bedW - 0.08, 0.05, bedL * 0.5, 0x047857, bx, 0.54, bz + bedL * 0.16, 0.85, 0.0);
      addBox(rmGroup, bedW + 0.06, 1.15, 0.12, 0x5c3a21, bx, 0.56, rz + rl - 0.14, 0.55, 0.05);
      // Wardrobe along West Wall & Study Desk along East Wall
      const wardL = Math.min(2.2, rl * 0.32);
      const deskL = Math.min(1.65, rl * 0.26);
      addBox(rmGroup, 0.58, 2.45, wardL, 0x78350f, rx + 0.36, 1.225, rz + rl * 0.45, 0.5, 0.1, 1, true);
      addBox(rmGroup, 0.62, 0.78, deskL, 0x92400e, rx + rw - 0.38, 0.39, rz + rl * 0.45, 0.5, 0.1, 1, true);
      // Split AC Indoor Unit
      addBox(rmGroup, 1.05, 0.3, 0.22, 0xf8fafc, bx, Math.min(2.95, room.ceilingHeight - 0.45), rz + rl - 0.18, 0.2, 0.1);
    } else if (room.type === 'bathroom') {
      // Vanity Counter + Basin + Ceramic WC along East Wall (wide open central bathroom floor)
      const vanityL = Math.min(0.95, rl * 0.32);
      addBox(rmGroup, 0.62, 0.84, vanityL, 0x334155, rx + rw - 0.38, 0.42, rz + Math.max(0.65, rl * 0.25), 0.4, 0.2, 1, true);
      addBox(rmGroup, 0.46, 0.14, Math.min(0.55, vanityL * 0.65), 0xffffff, rx + rw - 0.38, 0.9, rz + Math.max(0.65, rl * 0.25), 0.15, 0.1);
      addBox(rmGroup, 0.46, 0.44, 0.6, 0xffffff, rx + rw - 0.42, 0.22, rz + rl - 0.62, 0.15, 0.1, 1, true);
      addBox(rmGroup, 0.4, 0.44, 0.22, 0xffffff, rx + rw - 0.22, 0.62, rz + rl - 0.62, 0.15, 0.1);
    } else if (room.type === 'foyer') {
      // Incoming Digital Energy Meter (kWh) & Main Isolator Enclosure beside DB on West Wall
      addBox(rmGroup, 0.26, 0.34, 0.14, 0x1e293b, rx + 0.16, 1.65, rz + rl - 0.72, 0.3, 0.7);
      addBox(rmGroup, 0.02, 0.1, 0.16, 0x38bdf8, rx + 0.3, 1.7, rz + rl - 0.72, 0.2, 0.1);
      // Sleek Shoe Rack Console on East Wall of Foyer
      addBox(rmGroup, 0.4, 0.72, Math.min(1.35, rl * 0.4), 0x5c3a21, rx + rw - 0.28, 0.36, rz + rl / 2, 0.6, 0.05, 1, true);
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

  // Precompute world segment of every opening so shared walls between adjacent rooms cut out cleanly
  interface WorldOpeningSegment {
    opening: OpeningData;
    isHorizontal: boolean;
    lineCoord: number; // Z for horizontal walls, X for vertical walls
    startCoord: number; // X start for horizontal, Z start for vertical
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

    // Collect all openings (from ANY room) that lie on this wall line and overlap this wall segment
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

    // Helper to add a solid wall chunk and register its collision box
    const addSolidWallChunk = (chunkOffset: number, chunkLen: number) => {
      if (chunkLen <= 0.04) return;
      const cStart = segStart + chunkOffset;
      const cEnd = cStart + chunkLen;

      // Avoid duplicate overlapping wall chunks on shared interior walls
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

      // Only spawn lintel, sill, and door/window 3D assembly once per unique opening ID
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

          // Window wall sill blocks walking through windows
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
          // Timber Door Frame Architraves (Left Jamb, Right Jamb, Top Header)
          const jambThick = 0.045;
          const frameDepth = thickness + 0.03;
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

          // Hinged Door Pivot Group at the start edge of the doorway
          const hingeX = startX + (isHorizontal ? op.offset + 0.03 : 0);
          const hingeZ = startZ + (isHorizontal ? 0 : op.offset + 0.03);
          const doorPivot = new THREE.Group();
          doorPivot.name = `door_${op.id}`;
          doorPivot.position.set(hingeX, 0, hingeZ);

          const leafW = op.width - 0.06;
          const leafH = op.height - 0.03;
          const leafGeo = new THREE.BoxGeometry(leafW, leafH, 0.042);
          disposables.push(leafGeo);
          const doorLeaf = new THREE.Mesh(leafGeo, woodDoorMaterial);
          doorLeaf.position.set(leafW / 2, leafH / 2, 0);
          doorLeaf.castShadow = true;
          doorLeaf.receiveShadow = true;
          doorPivot.add(doorLeaf);

          // Dual-sided metallic lever handles
          const handlePlateGeo = new THREE.BoxGeometry(0.035, 0.14, 0.058);
          const leverGeo = new THREE.BoxGeometry(0.11, 0.02, 0.09);
          disposables.push(handlePlateGeo, leverGeo);
          const handlePlate = new THREE.Mesh(handlePlateGeo, doorHandleMaterial);
          handlePlate.position.set(leafW - 0.09, 1.02, 0);
          const lever = new THREE.Mesh(leverGeo, doorHandleMaterial);
          lever.position.set(leafW - 0.12, 1.02, 0);
          doorPivot.add(handlePlate, lever);

          // Closed vs Open rotation angles
          const closedAngle = isHorizontal ? 0 : -Math.PI / 2;
          const openAngle = isHorizontal ? -Math.PI * 0.48 : -0.05;
          doorPivot.rotation.y = closedAngle;

          // Tag door for raycasting
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

          // Register dynamic Door Collider (disabled automatically when door is open)
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
          // Aluminum-Framed Glazed Window
          const glassGeo = new THREE.BoxGeometry(
            isHorizontal ? op.width - 0.06 : 0.025,
            op.height - 0.06,
            isHorizontal ? 0.025 : op.width - 0.06
          );
          disposables.push(glassGeo);
          const glass = new THREE.Mesh(glassGeo, glassWindowMaterial);
          glass.position.set(opCenterX, op.sillHeight + op.height / 2, opCenterZ);
          architectureGroup.add(glass);
        }
      }

      curOffset = op.offset + op.width;
    });

    if (curOffset < length - 0.04) {
      addSolidWallChunk(curOffset, length - curOffset);
    }
  }

  project.rooms.forEach((room) => {
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
      // ====================================================================
      // INTERACTIVE 4-LAYER EXPLODED 8-WAY TPN DISTRIBUTION BOARD
      // ====================================================================
      const dbW = 0.52,
        dbH = 0.62,
        dbD = 0.16;

      // Layer 0: Sheet Steel Back Box & Dual 35mm DIN Rails
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

      // Layer 1: Clickable DIN-Rail Protection Devices (63A Isolator + 40A 30mA RCCB + Circuit MCBs)
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

      // Layer 2: R-Y-B-N-E Copper & Brass Busbar Assembly
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

      // Layer 3: Front Escutcheon Cover & Hinged Steel Door with Schedule Chart
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
      const tankGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.48, 24);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });
      disposables.push(tankGeo, tankMat);
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.set(-0.22, 0.15, 0);
      ptGroup.add(tankMesh);

      const ledGeo = new THREE.SphereGeometry(0.015, 10, 10);
      const ledMat = new THREE.MeshBasicMaterial({ color: point.isOn ? 0xef4444 : 0x475569 });
      disposables.push(ledGeo, ledMat);
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-0.41, 0.08, 0);
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
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.7 });
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

      const pointLight = new THREE.PointLight(0xffedd5, point.isOn ? 1.85 : 0.0, 12.0, 1.35);
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
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
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
      const motorHubGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.065, 24);
      disposables.push(motorHubGeo);
      const motorHub = new THREE.Mesh(motorHubGeo, canopyMat);
      bladeRotator.add(motorHub);

      for (let b = 0; b < 3; b++) {
        const angle = (b * Math.PI * 2) / 3;
        const bladeArm = new THREE.Group();
        bladeArm.rotation.y = angle;

        const bladeGeo = new THREE.BoxGeometry(0.72, 0.009, 0.15);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.5,
          roughness: 0.3
        });
        disposables.push(bladeGeo, bladeMat);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.42, 0, 0);
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

    // 1. Update Layer Visibility
    if (options?.layers) {
      architectureGroup.visible = options.layers.architecture;
      furnitureGroup.visible = options.layers.furniture;
      lightingGroup.visible = options.layers.lighting;
      conduitsGroup.visible = options.layers.conduits;
      wiringGroup.visible = options.layers.wiring;
      distributionGroup.visible = options.layers.distribution;
    }

    // 1B. Update Granular Circuit Sub-Layer Filters & Active Circuit Highlight
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

    // 2. Update Wall & Ceiling Opacity dynamically
    if (options?.wallOpacity !== undefined) {
      currentWallMat.opacity = options.wallOpacity;
      currentWallMat.transparent = options.wallOpacity < 0.99;
      currentWallMat.depthWrite = options.wallOpacity > 0.75;
      concreteCeilingMaterial.opacity = options.wallOpacity < 0.85 ? options.wallOpacity * 0.85 : 1.0;
      concreteCeilingMaterial.transparent = options.wallOpacity < 0.85;
      concreteCeilingMaterial.depthWrite = options.wallOpacity >= 0.85;
    }

    // 3. Animate Exploded Distribution Board Layers & DB Door
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

    // 4. Smoothly Animate Interactive Room Doors (0° Closed <-> 90° Open)
    if (options?.doorStates) {
      doorPivots.forEach((doorEntry, doorId) => {
        const isOpen = !!options.doorStates?.[doorId];
        const targetAngle = isOpen ? doorEntry.openAngle : doorEntry.closedAngle;
        doorEntry.currentAngle += (targetAngle - doorEntry.currentAngle) * (1 - Math.exp(-10 * delta));
        doorEntry.pivot.rotation.y = doorEntry.currentAngle;
      });
    }

    // 5. Update Breaker Lever Positions & Color for ON vs OFF/TRIPPED
    if (options?.breakerStates) {
      breakerToggleMeshes.forEach((mesh, circId) => {
        const isClosed = options.breakerStates?.[circId] !== false;
        mesh.position.y = isClosed ? 0.012 : -0.012;
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(isClosed ? 0x10b981 : 0xef4444);
      });
    }

    // 6. Sync Live Electrical Point States (Downlights, Switch Indicators, Geyser, AC, Fans)
    const ptMap = new Map<string, ElectricalPoint>();
    if (options?.electricalPoints) {
      options.electricalPoints.forEach((p) => ptMap.set(p.id, p));
    }

    pointLightRegistry.forEach((entry, ptId) => {
      const pt = ptMap.get(ptId);
      const isBreakerOn = options?.breakerStates?.[entry.circuitId] !== false;
      const isActive = (pt ? pt.isOn : true) && isBreakerOn;
      entry.light.intensity = isActive ? 1.85 : 0.0;
      entry.diffuserMat.color.setHex(isActive ? 0xfef08a : 0x475569);
    });

    indicatorRegistry.forEach((entry, ptId) => {
      const pt = ptMap.get(ptId);
      const isBreakerOn = options?.breakerStates?.[entry.circuitId] !== false;
      const isActive = (pt ? pt.isOn : true) && isBreakerOn;
      entry.mat.color.setHex(isActive ? entry.onHex : entry.offHex);
    });

    // 7. Rotate ceiling fans only if powered ON and circuit breaker is ON
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
