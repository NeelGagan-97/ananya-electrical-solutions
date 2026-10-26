import * as THREE from 'three';
import {
  ResidentialProject,
  OpeningData
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

export interface GeneratedTwin {
  rootGroup: THREE.Group;
  houseCenter: THREE.Vector3;
  buildingBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  fanRotators: { group: THREE.Group; speedMultiplier: number }[];
  dbDoorPivot: THREE.Group | null;
  interactiveMeshes: Map<string, THREE.Object3D>;
  activeConduitMaterials: THREE.MeshStandardMaterial[];
  update: (
    delta: number,
    fanSpeedLevel: number,
    activeCircuitId: string,
    options?: {
      layers?: ResidentialLayerVisibility;
      wallOpacity?: number;
      dbExploded?: boolean;
      breakerStates?: Record<string, boolean>;
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
  const fanRotators: { group: THREE.Group; speedMultiplier: number }[] = [];
  let dbDoorPivot: THREE.Group | null = null;
  const activeConduitMaterials: THREE.MeshStandardMaterial[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

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
    roughness: 0.8,
    metalness: 0.02,
    transparent: true,
    opacity: 1.0
  });

  const wallCutawayMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.26,
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
    opacity: viewMode === 'cutaway' ? 0.22 : 1.0,
    depthWrite: viewMode !== 'cutaway',
    side: THREE.DoubleSide
  });

  const woodDoorMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b4226,
    roughness: 0.55,
    metalness: 0.05
  });

  const glassWindowMaterial = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.4
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
    glassWindowMaterial,
    aluminumFrameMaterial
  );

  // 1. Calculate overall building bounding box
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
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

  // Helper to create a simple box mesh quickly
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
    opacity = 1.0
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
    return mesh;
  };

  // 2. Outdoor Plinth / Earth Base Slab
  const plinthMargin = 2.2;
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

  // Subtle CAD reference grid on plinth
  const gridHelper = new THREE.GridHelper(Math.max(buildingW, buildingL) + 4, 24, 0x38bdf8, 0x334155);
  gridHelper.position.set(centerX, 0.005, centerZ);
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.25;
  architectureGroup.add(gridHelper);

  // 3. Room Floors, Skirting, Ceilings & Detailed 3D Furniture
  project.rooms.forEach((room) => {
    // Room specific floor tint
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

    // Ceiling Slab
    if (ceilingVisible) {
      const ceilGeo = new THREE.BoxGeometry(room.width, 0.12, room.length);
      disposables.push(ceilGeo);
      const ceilMesh = new THREE.Mesh(ceilGeo, concreteCeilingMaterial);
      ceilMesh.position.set(room.x + room.width / 2, room.ceilingHeight + 0.06, room.z + room.length / 2);
      ceilMesh.receiveShadow = true;
      architectureGroup.add(ceilMesh);
    }

    // 3B. Detailed 3D Room Furnishings & Appliances
    const rx = room.x;
    const rz = room.z;
    const rw = room.width;
    const rl = room.length;
    const rmGroup = new THREE.Group();
    rmGroup.name = `Furniture_${room.id}`;

    if (room.type === 'living') {
      // L-Shaped Fabric Sofa in Living Zone
      addBox(rmGroup, 2.2, 0.42, 0.85, 0x334155, rx + 1.8, 0.21, rz + 3.3, 0.8, 0.05); // Main seat
      addBox(rmGroup, 2.2, 0.45, 0.18, 0x1e293b, rx + 1.8, 0.62, rz + 3.64, 0.85, 0.05); // Backrest
      addBox(rmGroup, 0.85, 0.42, 1.5, 0x334155, rx + 0.95, 0.21, rz + 2.55, 0.8, 0.05); // Chaise lounge
      // Accent Cushions
      addBox(rmGroup, 0.35, 0.3, 0.12, 0x0284c7, rx + 1.1, 0.56, rz + 3.48, 0.7, 0.0);
      addBox(rmGroup, 0.35, 0.3, 0.12, 0xf59e0b, rx + 2.4, 0.56, rz + 3.48, 0.7, 0.0);
      // Area Rug & Coffee Table
      addBox(rmGroup, 2.0, 0.015, 1.4, 0xcbd5e1, rx + 2.0, 0.055, rz + 2.1, 0.95, 0.0);
      addBox(rmGroup, 1.0, 0.38, 0.55, 0x78350f, rx + 2.0, 0.2, rz + 2.1, 0.4, 0.1);
      // TV Entertainment Console + 55" Wall-Mounted Smart TV on North Wall
      addBox(rmGroup, 1.8, 0.45, 0.4, 0x5c3a21, rx + 2.2, 0.25, rz + 0.3, 0.5, 0.1);
      addBox(rmGroup, 1.35, 0.78, 0.04, 0x090d16, rx + 2.2, 1.35, rz + 0.14, 0.15, 0.6); // 55" OLED Screen
      // 4-Seater Dining Table & Chairs in East half of Living/Dining
      const dx = rx + rw - 1.25;
      const dz = rz + rl / 2 + 0.2;
      addBox(rmGroup, 1.3, 0.05, 0.85, 0x78350f, dx, 0.75, dz, 0.35, 0.1); // Tabletop
      addBox(rmGroup, 0.08, 0.74, 0.08, 0x1e293b, dx - 0.52, 0.37, dz - 0.32, 0.4, 0.6);
      addBox(rmGroup, 0.08, 0.74, 0.08, 0x1e293b, dx + 0.52, 0.37, dz - 0.32, 0.4, 0.6);
      addBox(rmGroup, 0.08, 0.74, 0.08, 0x1e293b, dx - 0.52, 0.37, dz + 0.32, 0.4, 0.6);
      addBox(rmGroup, 0.08, 0.74, 0.08, 0x1e293b, dx + 0.52, 0.37, dz + 0.32, 0.4, 0.6);
      // 4 Dining Chairs
      addBox(rmGroup, 0.42, 0.45, 0.42, 0x475569, dx - 0.32, 0.23, dz - 0.58, 0.7, 0.1);
      addBox(rmGroup, 0.42, 0.45, 0.42, 0x475569, dx + 0.32, 0.23, dz - 0.58, 0.7, 0.1);
      addBox(rmGroup, 0.42, 0.45, 0.42, 0x475569, dx - 0.32, 0.23, dz + 0.58, 0.7, 0.1);
      addBox(rmGroup, 0.42, 0.45, 0.42, 0x475569, dx + 0.32, 0.23, dz + 0.58, 0.7, 0.1);
    } else if (room.type === 'kitchen') {
      // L-Shaped Modular Kitchen Base Cabinets & Black Granite Countertop
      addBox(rmGroup, 0.62, 0.85, rl - 0.3, 0x0f766e, rx + rw - 0.35, 0.425, rz + rl / 2, 0.5, 0.1);
      addBox(rmGroup, 0.65, 0.04, rl - 0.28, 0x111827, rx + rw - 0.35, 0.87, rz + rl / 2, 0.2, 0.3); // Granite
      addBox(rmGroup, rw - 0.8, 0.85, 0.6, 0x0f766e, rx + (rw - 0.8) / 2 + 0.15, 0.425, rz + 0.35, 0.5, 0.1);
      addBox(rmGroup, rw - 0.78, 0.04, 0.64, 0x111827, rx + (rw - 0.8) / 2 + 0.15, 0.87, rz + 0.35, 0.2, 0.3);
      // 4-Burner Induction / Glass Hob & Auto-Clean Chimney
      addBox(rmGroup, 0.48, 0.03, 0.72, 0x030712, rx + rw - 0.35, 0.9, rz + 1.2, 0.15, 0.5);
      addBox(rmGroup, 0.45, 0.22, 0.75, 0x94a3b8, rx + rw - 0.35, 1.85, rz + 1.2, 0.25, 0.85); // Chimney hood
      addBox(rmGroup, 0.22, 0.85, 0.22, 0x94a3b8, rx + rw - 0.25, 2.35, rz + 1.2, 0.25, 0.85); // Chimney duct
      // Stainless Steel Sink
      addBox(rmGroup, 0.45, 0.02, 0.55, 0xcbd5e1, rx + rw - 0.35, 0.895, rz + 2.2, 0.2, 0.9);
      // Double-Door Refrigerator & Microwave Oven
      addBox(rmGroup, 0.68, 1.78, 0.68, 0x64748b, rx + 0.55, 0.89, rz + 0.45, 0.25, 0.8); // Fridge
      addBox(rmGroup, 0.48, 0.3, 0.38, 0x1e293b, rx + 1.5, 1.05, rz + 0.35, 0.3, 0.6); // Microwave
    } else if (room.type === 'master_bedroom') {
      // Queen Size Bed along South Wall
      const bx = rx + rw / 2;
      const bz = rz + rl - 1.15;
      addBox(rmGroup, 1.65, 0.35, 2.05, 0x5c3a21, bx, 0.175, bz, 0.6, 0.05); // Bed frame
      addBox(rmGroup, 1.55, 0.22, 1.92, 0xf8fafc, bx, 0.42, bz + 0.02, 0.85, 0.0); // Mattress
      addBox(rmGroup, 1.56, 0.06, 1.1, 0x1e3a8a, bx, 0.54, bz + 0.4, 0.85, 0.0); // Duvet
      addBox(rmGroup, 1.68, 1.05, 0.12, 0x451a03, bx, 0.525, rz + rl - 0.12, 0.55, 0.05); // Headboard
      // 2 Pillows
      addBox(rmGroup, 0.55, 0.1, 0.35, 0xe2e8f0, bx - 0.4, 0.56, rz + rl - 0.4, 0.8, 0.0);
      addBox(rmGroup, 0.55, 0.1, 0.35, 0xe2e8f0, bx + 0.4, 0.56, rz + rl - 0.4, 0.8, 0.0);
      // Bedside Tables
      addBox(rmGroup, 0.45, 0.48, 0.42, 0x5c3a21, bx - 1.12, 0.24, rz + rl - 0.35, 0.5, 0.05);
      addBox(rmGroup, 0.45, 0.48, 0.42, 0x5c3a21, bx + 1.12, 0.24, rz + rl - 0.35, 0.5, 0.05);
      // Full-Height Sliding Door Wardrobe along West Wall
      addBox(rmGroup, 0.58, 2.2, 1.85, 0x78350f, rx + 0.34, 1.1, rz + 1.35, 0.45, 0.1);
      // Wall-Mounted 1.5T Split AC Indoor Unit above Bed
      addBox(rmGroup, 0.95, 0.28, 0.22, 0xf8fafc, bx, 2.55, rz + rl - 0.16, 0.2, 0.1);
    } else if (room.type === 'bedroom_2') {
      // Guest / Kids Bed along South Wall
      const bx = rx + rw / 2;
      const bz = rz + rl - 1.05;
      addBox(rmGroup, 1.35, 0.34, 1.95, 0x78350f, bx, 0.17, bz, 0.6, 0.05);
      addBox(rmGroup, 1.26, 0.2, 1.85, 0xf8fafc, bx, 0.4, bz, 0.85, 0.0);
      addBox(rmGroup, 1.28, 0.05, 1.0, 0x047857, bx, 0.51, bz + 0.35, 0.85, 0.0);
      addBox(rmGroup, 1.38, 0.95, 0.1, 0x5c3a21, bx, 0.48, rz + rl - 0.12, 0.55, 0.05);
      // Wardrobe & Study Desk
      addBox(rmGroup, 0.55, 2.1, 1.4, 0x78350f, rx + 0.32, 1.05, rz + 1.9, 0.5, 0.1);
      addBox(rmGroup, 0.55, 0.75, 1.1, 0x92400e, rx + rw - 0.35, 0.375, rz + 1.8, 0.5, 0.1);
      // Split AC Indoor Unit
      addBox(rmGroup, 0.88, 0.26, 0.2, 0xf8fafc, bx, 2.55, rz + rl - 0.16, 0.2, 0.1);
    } else if (room.type === 'bathroom') {
      // Tempered Glass Shower Partition
      addBox(rmGroup, rw - 0.8, 2.0, 0.03, 0x7dd3fc, rx + (rw - 0.8) / 2 + 0.1, 1.0, rz + rl - 0.9, 0.1, 0.1, 0.35);
      // Vanity Counter + Basin + Mirror
      addBox(rmGroup, 0.75, 0.8, 0.48, 0x334155, rx + rw - 0.45, 0.4, rz + 0.45, 0.4, 0.2);
      addBox(rmGroup, 0.5, 0.12, 0.36, 0xffffff, rx + rw - 0.45, 0.86, rz + 0.45, 0.15, 0.1);
      // Ceramic WC
      addBox(rmGroup, 0.42, 0.42, 0.55, 0xffffff, rx + rw - 0.38, 0.21, rz + 1.35, 0.15, 0.1);
      addBox(rmGroup, 0.4, 0.4, 0.18, 0xffffff, rx + rw - 0.2, 0.58, rz + 1.35, 0.15, 0.1);
    } else if (room.type === 'foyer') {
      // Incoming Digital Energy Meter (kWh) & Utility Cutout beside Main DB
      addBox(rmGroup, 0.22, 0.28, 0.12, 0x1e293b, rx + 0.14, 1.55, rz + rl - 0.45, 0.3, 0.7);
      // LCD Display on Energy Meter
      addBox(rmGroup, 0.02, 0.08, 0.14, 0x38bdf8, rx + 0.26, 1.6, rz + rl - 0.45, 0.2, 0.1);
      // Shoe Rack Console
      addBox(rmGroup, 0.38, 0.65, 0.85, 0x5c3a21, rx + rw - 0.25, 0.325, rz + rl / 2, 0.6, 0.05);
    }

    furnitureGroup.add(rmGroup);
  });

  // 4. Parametric Walls with Openings
  const currentWallMat =
    viewMode === 'cutaway'
      ? wallCutawayMaterial
      : viewMode === 'construction'
      ? wallBrickMaterial
      : wallPlasterMaterial;

  const wallHeight = viewMode === 'cutaway' ? 2.85 : 3.0;
  const intThickness = project.meta.interiorWallThickness || 0.115;

  function buildWallSegment(
    startX: number,
    startZ: number,
    length: number,
    thickness: number,
    isHorizontal: boolean,
    openingsForWall: OpeningData[]
  ) {
    if (openingsForWall.length === 0) {
      const geo = new THREE.BoxGeometry(
        isHorizontal ? length : thickness,
        wallHeight,
        isHorizontal ? thickness : length
      );
      disposables.push(geo);
      const mesh = new THREE.Mesh(geo, currentWallMat);
      mesh.position.set(
        startX + (isHorizontal ? length / 2 : 0),
        wallHeight / 2,
        startZ + (isHorizontal ? 0 : length / 2)
      );
      mesh.castShadow = viewMode !== 'cutaway';
      mesh.receiveShadow = true;
      architectureGroup.add(mesh);
      return;
    }

    const sorted = [...openingsForWall].sort((a, b) => a.offset - b.offset);
    let curOffset = 0;

    sorted.forEach((op) => {
      const chunkLen = op.offset - curOffset;
      if (chunkLen > 0.05) {
        const chunkGeo = new THREE.BoxGeometry(
          isHorizontal ? chunkLen : thickness,
          wallHeight,
          isHorizontal ? thickness : chunkLen
        );
        disposables.push(chunkGeo);
        const chunkMesh = new THREE.Mesh(chunkGeo, currentWallMat);
        const mid = curOffset + chunkLen / 2;
        chunkMesh.position.set(
          startX + (isHorizontal ? mid : 0),
          wallHeight / 2,
          startZ + (isHorizontal ? 0 : mid)
        );
        chunkMesh.castShadow = viewMode !== 'cutaway';
        chunkMesh.receiveShadow = true;
        architectureGroup.add(chunkMesh);
      }

      const opTop = op.sillHeight + op.height;
      if (wallHeight > opTop) {
        const lintelH = wallHeight - opTop;
        const lintelGeo = new THREE.BoxGeometry(
          isHorizontal ? op.width : thickness,
          lintelH,
          isHorizontal ? thickness : op.width
        );
        disposables.push(lintelGeo);
        const lintelMesh = new THREE.Mesh(lintelGeo, currentWallMat);
        const mid = op.offset + op.width / 2;
        lintelMesh.position.set(
          startX + (isHorizontal ? mid : 0),
          opTop + lintelH / 2,
          startZ + (isHorizontal ? 0 : mid)
        );
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
        const mid = op.offset + op.width / 2;
        sillMesh.position.set(
          startX + (isHorizontal ? mid : 0),
          op.sillHeight / 2,
          startZ + (isHorizontal ? 0 : mid)
        );
        architectureGroup.add(sillMesh);
      }

      const opCenterX = startX + (isHorizontal ? op.offset + op.width / 2 : 0);
      const opCenterZ = startZ + (isHorizontal ? 0 : op.offset + op.width / 2);

      if (op.type === 'door') {
        const doorLeafGeo = new THREE.BoxGeometry(op.width - 0.08, op.height - 0.04, 0.04);
        disposables.push(doorLeafGeo);
        const doorLeaf = new THREE.Mesh(doorLeafGeo, woodDoorMaterial);
        doorLeaf.position.set(opCenterX, op.height / 2, opCenterZ);
        doorLeaf.rotation.y = isHorizontal ? Math.PI / 5 : Math.PI / 3;
        architectureGroup.add(doorLeaf);
      } else {
        const glassGeo = new THREE.BoxGeometry(
          isHorizontal ? op.width - 0.06 : 0.02,
          op.height - 0.06,
          isHorizontal ? 0.02 : op.width - 0.06
        );
        disposables.push(glassGeo);
        const glass = new THREE.Mesh(glassGeo, glassWindowMaterial);
        glass.position.set(opCenterX, op.sillHeight + op.height / 2, opCenterZ);
        architectureGroup.add(glass);
      }

      curOffset = op.offset + op.width;
    });

    if (curOffset < length - 0.05) {
      const remainingLen = length - curOffset;
      const endGeo = new THREE.BoxGeometry(
        isHorizontal ? remainingLen : thickness,
        wallHeight,
        isHorizontal ? thickness : remainingLen
      );
      disposables.push(endGeo);
      const endMesh = new THREE.Mesh(endGeo, currentWallMat);
      const mid = curOffset + remainingLen / 2;
      endMesh.position.set(
        startX + (isHorizontal ? mid : 0),
        wallHeight / 2,
        startZ + (isHorizontal ? 0 : mid)
      );
      endMesh.castShadow = viewMode !== 'cutaway';
      endMesh.receiveShadow = true;
      architectureGroup.add(endMesh);
    }
  }

  project.rooms.forEach((room) => {
    const rx = room.x;
    const rz = room.z;
    const rw = room.width;
    const rl = room.length;

    const roomOpenings = project.openings.filter((o) => o.roomId === room.id);
    const northOps = roomOpenings.filter((o) => o.wallDirection === 'north');
    const southOps = roomOpenings.filter((o) => o.wallDirection === 'south');
    const westOps = roomOpenings.filter((o) => o.wallDirection === 'west');
    const eastOps = roomOpenings.filter((o) => o.wallDirection === 'east');

    buildWallSegment(rx, rz, rw, intThickness, true, northOps);
    buildWallSegment(rx, rz + rl, rw, intThickness, true, southOps);
    buildWallSegment(rx, rz, rl, intThickness, false, westOps);
    buildWallSegment(rx + rw, rz, rl, intThickness, false, eastOps);
  });

  // 5. Build High-Detail Electrical Equipment & Interactive Exploded DB
  project.electricalPoints.forEach((point) => {
    const ptGroup = new THREE.Group();
    ptGroup.position.set(point.x, point.y, point.z);
    ptGroup.name = `point_${point.id}`;

    if (point.type === 'db') {
      // ====================================================================
      // INTERACTIVE 4-LAYER EXPLODED 8-WAY TPN DISTRIBUTION BOARD
      // ====================================================================
      const dbW = 0.52, dbH = 0.62, dbD = 0.16;

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

      // Layer 1: Clickable DIN-Rail Protection Devices (63A Isolator + 40A 30mA RCCB + 7 Circuit MCBs)
      const layer1 = new THREE.Group();
      layer1.name = 'DB_Layer1_Breakers';

      const mcbBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
      const isolatorToggleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
      const rccbToggleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25 });
      disposables.push(mcbBodyMat, isolatorToggleMat, rccbToggleMat);

      // Build clickable MCBs mapped directly to project.circuits
      const circuitsList = project.circuits;
      const totalModules = circuitsList.length + 2; // Isolator + RCCB + Circuits
      const mcbW = 0.036, mcbH = 0.088, mcbD = 0.065;
      const mcbGeo = new THREE.BoxGeometry(mcbW, mcbH, mcbD);
      disposables.push(mcbGeo);

      for (let i = 0; i < totalModules; i++) {
        const mcbGroup = new THREE.Group();
        const posX = -0.18 + i * (mcbW + 0.008);
        mcbGroup.position.set(posX, 0.06, dbD / 2 + 0.01);

        const bodyMesh = new THREE.Mesh(mcbGeo, mcbBodyMat);
        mcbGroup.add(bodyMesh);

        // Phase color stripe at top of breaker
        const circuit = i >= 2 ? circuitsList[i - 2] : null;
        const stripeColor = i === 0 ? '#EF4444' : i === 1 ? '#0284C7' : circuit?.phaseColor || '#38BDF8';
        const stripeGeo = new THREE.BoxGeometry(mcbW - 0.004, 0.012, 0.004);
        const stripeMat = new THREE.MeshBasicMaterial({ color: stripeColor });
        disposables.push(stripeGeo, stripeMat);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(0, 0.03, mcbD / 2 + 0.002);
        mcbGroup.add(stripe);

        // Toggle lever
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
        { y: 0.21, color: 0xef4444 }, // R Phase
        { y: 0.17, color: 0xf59e0b }, // Y Phase
        { y: 0.13, color: 0x3b82f6 }, // B Phase
        { y: -0.18, color: 0x1e293b }, // Neutral Bar
        { y: -0.23, color: 0x10b981 }  // Protective Earth Bar
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
      // IS:3043 CHEMICAL EARTH ELECTRODE PIT
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

      // Green Protective Earth Conductor Strip to Main DB
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
      }

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
      return;
    }

    if (point.type === 'switch_board_6a') {
      const plateGeo = new THREE.BoxGeometry(0.22, 0.12, 0.025);
      const plateMat = new THREE.MeshStandardMaterial({
        map: switchPlateTex,
        roughness: 0.2,
        metalness: 0.05
      });
      disposables.push(plateGeo, plateMat);
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      ptGroup.add(plateMesh);

      const neonGeo = new THREE.SphereGeometry(0.008, 8, 8);
      const neonMat = new THREE.MeshBasicMaterial({ color: point.isOn ? 0x10b981 : 0xef4444 });
      disposables.push(neonGeo, neonMat);
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.position.set(0.08, 0.03, 0.015);
      ptGroup.add(neon);

      interactiveMeshes.set(point.id, ptGroup);
      lightingGroup.add(ptGroup);
    } else if (point.type === 'power_socket_16a' || point.type === 'combined_socket_6_16a') {
      const sockGeo = new THREE.BoxGeometry(0.14, 0.14, 0.025);
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
      // 25L Storage Water Heater Tank + 20A DP Indicator Switch
      const tankGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.48, 24);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });
      disposables.push(tankGeo, tankMat);
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.set(-0.22, 0.15, 0);
      ptGroup.add(tankMesh);

      // Heating thermostat LED
      const ledGeo = new THREE.SphereGeometry(0.014, 10, 10);
      const ledMat = new THREE.MeshBasicMaterial({ color: point.isOn ? 0xef4444 : 0x475569 });
      disposables.push(ledGeo, ledMat);
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-0.41, 0.08, 0);
      ptGroup.add(led);

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
        color: point.isOn ? 0xfef08a : 0x64748b
      });
      disposables.push(diffuserGeo, diffuserMat);
      const diffuser = new THREE.Mesh(diffuserGeo, diffuserMat);
      diffuser.position.y = -0.012;
      ptGroup.add(diffuser);

      if (point.isOn) {
        const pointLight = new THREE.PointLight(0xffedd5, 1.4, 5.5, 1.6);
        pointLight.position.set(0, -0.18, 0);
        ptGroup.add(pointLight);
      }

      interactiveMeshes.set(point.id, ptGroup);
      lightingGroup.add(ptGroup);
    } else if (point.type === 'ceiling_fan') {
      const fanBaseGroup = new THREE.Group();
      const canopyGeo = new THREE.ConeGeometry(0.08, 0.06, 16);
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      disposables.push(canopyGeo, canopyMat);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 0.22;
      fanBaseGroup.add(canopy);

      const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12);
      disposables.push(rodGeo);
      const rod = new THREE.Mesh(rodGeo, canopyMat);
      rod.position.y = 0.1;
      fanBaseGroup.add(rod);

      const bladeRotator = new THREE.Group();
      const motorHubGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.06, 24);
      disposables.push(motorHubGeo);
      const motorHub = new THREE.Mesh(motorHubGeo, canopyMat);
      bladeRotator.add(motorHub);

      for (let b = 0; b < 3; b++) {
        const angle = (b * Math.PI * 2) / 3;
        const bladeArm = new THREE.Group();
        bladeArm.rotation.y = angle;

        const bladeGeo = new THREE.BoxGeometry(0.52, 0.008, 0.12);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.5,
          roughness: 0.3
        });
        disposables.push(bladeGeo, bladeMat);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.31, 0, 0);
        blade.rotation.x = 0.08;
        bladeArm.add(blade);
        bladeRotator.add(bladeArm);
      }

      fanBaseGroup.add(bladeRotator);
      ptGroup.add(fanBaseGroup);

      if (point.isOn) {
        fanRotators.push({
          group: bladeRotator,
          speedMultiplier: point.stateValue ?? 2
        });
      }

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

      interactiveMeshes.set(point.id, ptGroup);
      distributionGroup.add(ptGroup);
    }
  });

  // 6. Concealed PVC Conduits (`conduitsGroup`) & Color-Coded Internal Wiring (`wiringGroup`)
  const dbPoint = project.electricalPoints.find((p) => p.type === 'db');
  const ceilingY = 2.85;

  if (dbPoint) {
    project.circuits.forEach((circuit, cIdx) => {
      const isSelectedCircuit = circuit.id === activeCircuitId;
      const circuitColor = new THREE.Color(circuit.phaseColor || '#38bdf8');

      // Outer PVC Conduit Material (semi-translucent so internal wires are visible)
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

      // Inner FRLS Copper Phase + Earth Conductor Material
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
      disposables.push(phaseWireMat, earthWireMat);

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

        if (targetPt.y < 2.5) {
          points.push(new THREE.Vector3(targetPt.x, targetPt.y + 0.06, targetPt.z));
        }

        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.08);
        const outerRadius = circuit.conduitSize === '25mm' ? 0.02 : 0.015;

        // 1) PVC Conduit Pipe
        const conduitGeo = new THREE.TubeGeometry(curve, 32, outerRadius, 8, false);
        disposables.push(conduitGeo);
        const conduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
        conduitsGroup.add(conduitMesh);

        // Circular PVC Junction Box at ceiling drop
        const jboxGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 12);
        const jboxMat = new THREE.MeshStandardMaterial({
          color: isSelectedCircuit ? circuitColor : new THREE.Color(0x475569),
          metalness: 0.3,
          roughness: 0.5
        });
        disposables.push(jboxGeo, jboxMat);
        const jbox = new THREE.Mesh(jboxGeo, jboxMat);
        jbox.position.set(targetPt.x, ceilingY + heightOffset, targetPt.z);
        conduitsGroup.add(jbox);

        // 2) Internal Color-Coded FRLS Phase & Earth Copper Conductors
        const phaseWireGeo = new THREE.TubeGeometry(curve, 32, 0.0065, 6, false);
        disposables.push(phaseWireGeo);
        const phaseWireMesh = new THREE.Mesh(phaseWireGeo, phaseWireMat);
        wiringGroup.add(phaseWireMesh);

        // Slightly offset Protective Earth green wire alongside phase conductor
        const earthPoints = points.map((p) => new THREE.Vector3(p.x + 0.012, p.y - 0.008, p.z + 0.012));
        const earthCurve = new THREE.CatmullRomCurve3(earthPoints, false, 'catmullrom', 0.08);
        const earthWireGeo = new THREE.TubeGeometry(earthCurve, 28, 0.0045, 6, false);
        disposables.push(earthWireGeo);
        const earthWireMesh = new THREE.Mesh(earthWireGeo, earthWireMat);
        wiringGroup.add(earthWireMesh);
      });
    });
  }

  // Update loop
  let elapsed = 0;
  let currentExplodeFactor = 0;

  const update = (
    delta: number,
    fanSpeedLevel: number,
    _currentActiveCircuitId: string,
    options?: {
      layers?: ResidentialLayerVisibility;
      wallOpacity?: number;
      dbExploded?: boolean;
      breakerStates?: Record<string, boolean>;
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

    // 2. Update Wall Opacity dynamically
    if (options?.wallOpacity !== undefined) {
      currentWallMat.opacity = options.wallOpacity;
      currentWallMat.transparent = options.wallOpacity < 0.99;
      currentWallMat.depthWrite = options.wallOpacity > 0.75;
    }

    // 3. Animate Exploded Distribution Board Layers
    const targetExplode = options?.dbExploded ? 1.0 : 0.0;
    currentExplodeFactor += (targetExplode - currentExplodeFactor) * (1 - Math.exp(-8 * delta));
    dbExplodeLayers.forEach((item) => {
      item.group.position.z = item.targetOffsetZ * currentExplodeFactor;
      item.group.position.x = item.targetOffsetX * currentExplodeFactor;
    });

    // 4. Update Breaker Lever Positions & Color for ON vs OFF/TRIPPED
    if (options?.breakerStates) {
      breakerToggleMeshes.forEach((mesh, circId) => {
        const isClosed = options.breakerStates?.[circId] !== false;
        mesh.position.y = isClosed ? 0.012 : -0.012;
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(isClosed ? 0x10b981 : 0xef4444);
      });
    }

    // 5. Rotate ceiling fans
    const speedRadPerSec = fanSpeedLevel === 0 ? 0 : fanSpeedLevel === 1 ? 6.0 : fanSpeedLevel === 2 ? 14.0 : 26.0;
    fanRotators.forEach((rot) => {
      rot.group.rotation.y += speedRadPerSec * delta;
    });

    // 6. Pulse active circuit conduits
    if (activeConduitMaterials.length > 0) {
      const pulse = 0.65 + Math.sin(elapsed * 4.5) * 0.3;
      activeConduitMaterials.forEach((mat) => {
        mat.emissiveIntensity = pulse;
      });
    }
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
      minX: minX - centerX + 0.35,
      maxX: maxX - centerX - 0.35,
      minZ: minZ - centerZ + 0.35,
      maxZ: maxZ - centerZ - 0.35
    },
    fanRotators,
    dbDoorPivot,
    interactiveMeshes,
    activeConduitMaterials,
    update,
    dispose
  };
}
