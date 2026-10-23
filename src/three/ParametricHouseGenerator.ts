import * as THREE from 'three';
import {
  ResidentialProject,
  RoomData,
  OpeningData,
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

export interface GeneratedTwin {
  rootGroup: THREE.Group;
  fanRotators: { group: THREE.Group; speedMultiplier: number }[];
  dbDoorPivot: THREE.Group | null;
  interactiveMeshes: Map<string, THREE.Object3D>;
  activeConduitMaterials: THREE.MeshStandardMaterial[];
  update: (delta: number, fanSpeedLevel: number, activeCircuitId: string) => void;
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
    roughness: 0.85,
    metalness: 0.02
  });

  const wallCutawayMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });

  const wallBrickMaterial = new THREE.MeshStandardMaterial({
    map: brickWallTex,
    color: 0xb91c1c,
    roughness: 0.9,
    metalness: 0.05
  });

  const concreteCeilingMaterial = new THREE.MeshStandardMaterial({
    color: viewMode === 'construction' ? 0x64748b : 0xf8fafc,
    roughness: 0.8,
    metalness: 0.05,
    transparent: viewMode === 'cutaway',
    opacity: viewMode === 'cutaway' ? 0.2 : 1.0,
    depthWrite: viewMode !== 'cutaway'
  });

  const woodDoorMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.6,
    metalness: 0.05
  });

  const glassWindowMaterial = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.45
  });

  const aluminumFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.85
  });

  const conduitDefaultMaterial = new THREE.MeshStandardMaterial({
    color: viewMode === 'construction' ? 0x64748b : 0x94a3b8,
    roughness: 0.45,
    metalness: 0.1
  });

  const conduitEnergizedMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.3
  });

  disposables.push(
    floorMaterial,
    wallPlasterMaterial,
    wallCutawayMaterial,
    wallBrickMaterial,
    concreteCeilingMaterial,
    woodDoorMaterial,
    glassWindowMaterial,
    aluminumFrameMaterial,
    conduitDefaultMaterial,
    conduitEnergizedMaterial
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

  // Center house group so OrbitControls revolves around the house center
  const houseGroup = new THREE.Group();
  houseGroup.position.set(-centerX, 0, -centerZ);
  rootGroup.add(houseGroup);

  // 2. Outdoor Plinth / Earth Base Slab
  const plinthMargin = 2.2;
  const plinthGeo = new THREE.BoxGeometry(buildingW + plinthMargin * 2, 0.2, buildingL + plinthMargin * 2);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.95
  });
  disposables.push(plinthGeo, plinthMat);
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.set(centerX, -0.1, centerZ);
  plinthMesh.receiveShadow = true;
  houseGroup.add(plinthMesh);

  // 3. Room Floors and Ceilings
  project.rooms.forEach((room) => {
    const floorGeo = new THREE.BoxGeometry(room.width, 0.05, room.length);
    disposables.push(floorGeo);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.position.set(room.x + room.width / 2, 0.025, room.z + room.length / 2);
    floorMesh.receiveShadow = true;
    houseGroup.add(floorMesh);

    // Ceiling Slab
    if (ceilingVisible) {
      const ceilGeo = new THREE.BoxGeometry(room.width, 0.12, room.length);
      disposables.push(ceilGeo);
      const ceilMesh = new THREE.Mesh(ceilGeo, concreteCeilingMaterial);
      ceilMesh.position.set(room.x + room.width / 2, room.ceilingHeight + 0.06, room.z + room.length / 2);
      ceilMesh.castShadow = true;
      ceilMesh.receiveShadow = true;
      houseGroup.add(ceilMesh);
    }
  });

  // 4. Parametric Walls with Openings
  const currentWallMat =
    viewMode === 'cutaway'
      ? wallCutawayMaterial
      : viewMode === 'construction'
      ? wallBrickMaterial
      : wallPlasterMaterial;

  const wallHeight = viewMode === 'cutaway' ? 1.4 : 3.0;
  const extThickness = project.meta.exteriorWallThickness || 0.23;
  const intThickness = project.meta.interiorWallThickness || 0.115;

  // Helper to build a wall segment with cutouts for openings
  function buildWallSegment(
    startX: number,
    startZ: number,
    length: number,
    thickness: number,
    isHorizontal: boolean, // true if along X, false if along Z
    openingsForWall: OpeningData[]
  ) {
    if (openingsForWall.length === 0 || viewMode === 'cutaway') {
      // Solid continuous wall
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
      houseGroup.add(mesh);
      return;
    }

    // Sort openings by offset
    const sorted = [...openingsForWall].sort((a, b) => a.offset - b.offset);
    let curOffset = 0;

    sorted.forEach((op) => {
      // Wall chunk before opening
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
        chunkMesh.castShadow = true;
        chunkMesh.receiveShadow = true;
        houseGroup.add(chunkMesh);
      }

      // Lintel chunk above opening (y from opening top to wallHeight)
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
        houseGroup.add(lintelMesh);
      }

      // Sill chunk below window (if window)
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
        houseGroup.add(sillMesh);
      }

      // Physical Door / Window Frame
      const opCenterX = startX + (isHorizontal ? op.offset + op.width / 2 : 0);
      const opCenterZ = startZ + (isHorizontal ? 0 : op.offset + op.width / 2);

      if (op.type === 'door') {
        // Wooden door leaf (angled open 45 deg)
        const doorLeafGeo = new THREE.BoxGeometry(op.width - 0.08, op.height - 0.04, 0.04);
        disposables.push(doorLeafGeo);
        const doorLeaf = new THREE.Mesh(doorLeafGeo, woodDoorMaterial);
        doorLeaf.position.set(opCenterX, op.height / 2, opCenterZ);
        doorLeaf.rotation.y = isHorizontal ? Math.PI / 4 : 0;
        houseGroup.add(doorLeaf);
      } else {
        // Window glass + aluminum frame
        const glassGeo = new THREE.BoxGeometry(
          isHorizontal ? op.width - 0.06 : 0.02,
          op.height - 0.06,
          isHorizontal ? 0.02 : op.width - 0.06
        );
        disposables.push(glassGeo);
        const glass = new THREE.Mesh(glassGeo, glassWindowMaterial);
        glass.position.set(opCenterX, op.sillHeight + op.height / 2, opCenterZ);
        houseGroup.add(glass);

        const frameGeo = new THREE.BoxGeometry(
          isHorizontal ? op.width : thickness + 0.02,
          op.height,
          isHorizontal ? thickness + 0.02 : op.width
        );
        const frameMat = aluminumFrameMaterial;
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.set(opCenterX, op.sillHeight + op.height / 2, opCenterZ);
        frameMesh.scale.set(0.98, 0.98, 0.98);
        // keep subtle
      }

      curOffset = op.offset + op.width;
    });

    // Final chunk after last opening
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
      endMesh.castShadow = true;
      endMesh.receiveShadow = true;
      houseGroup.add(endMesh);
    }
  }

  // Iterate rooms and construct perimeter walls
  project.rooms.forEach((room) => {
    const rx = room.x;
    const rz = room.z;
    const rw = room.width;
    const rl = room.length;

    // Filter openings for this room
    const roomOpenings = project.openings.filter((o) => o.roomId === room.id);
    const northOps = roomOpenings.filter((o) => o.wallDirection === 'north');
    const southOps = roomOpenings.filter((o) => o.wallDirection === 'south');
    const westOps = roomOpenings.filter((o) => o.wallDirection === 'west');
    const eastOps = roomOpenings.filter((o) => o.wallDirection === 'east');

    // North wall (along X at z = rz)
    buildWallSegment(rx, rz, rw, intThickness, true, northOps);
    // South wall (along X at z = rz + rl)
    buildWallSegment(rx, rz + rl, rw, intThickness, true, southOps);
    // West wall (along Z at x = rx)
    buildWallSegment(rx, rz, rl, intThickness, false, westOps);
    // East wall (along Z at x = rx + rw)
    buildWallSegment(rx + rw, rz, rl, intThickness, false, eastOps);
  });

  // 5. Build High-Detail Electrical Equipment Models
  project.electricalPoints.forEach((point) => {
    const ptGroup = new THREE.Group();
    ptGroup.position.set(point.x, point.y, point.z);
    ptGroup.name = `point_${point.id}`;

    if (point.type === 'db') {
      // MAIN DISTRIBUTION BOARD
      // Outer sheet steel enclosure
      const dbW = 0.45, dbH = 0.55, dbD = 0.16;
      const dbBoxGeo = new THREE.BoxGeometry(dbW, dbH, dbD);
      const dbBoxMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.8,
        roughness: 0.3
      });
      disposables.push(dbBoxGeo, dbBoxMat);
      const dbBox = new THREE.Mesh(dbBoxGeo, dbBoxMat);
      ptGroup.add(dbBox);

      // Hinged Door
      const doorPivot = new THREE.Group();
      doorPivot.position.set(-dbW / 2, 0, dbD / 2);
      const doorGeo = new THREE.BoxGeometry(dbW, dbH, 0.02);
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.25
      });
      disposables.push(doorGeo, doorMat);
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(dbW / 2, 0, 0);

      // Door schedule placard inside
      const placardGeo = new THREE.PlaneGeometry(0.38, 0.46);
      const placardMat = new THREE.MeshBasicMaterial({ map: dbScheduleTex });
      disposables.push(placardGeo, placardMat);
      const placard = new THREE.Mesh(placardGeo, placardMat);
      placard.position.set(dbW / 2, 0, 0.012);
      doorMesh.add(placard);

      doorPivot.add(doorMesh);
      if (dbDoorOpen) {
        doorPivot.rotation.y = -Math.PI * 0.55; // Swing door open 100 deg
      }
      ptGroup.add(doorPivot);
      dbDoorPivot = doorPivot;

      // DIN Rail inside
      const dinRailGeo = new THREE.BoxGeometry(0.38, 0.035, 0.01);
      const dinRailMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
      disposables.push(dinRailGeo, dinRailMat);
      const dinRail = new THREE.Mesh(dinRailGeo, dinRailMat);
      dinRail.position.set(0, 0, 0);
      ptGroup.add(dinRail);

      // MCB bank on DIN Rail
      const mcbCount = 8;
      const mcbW = 0.035, mcbH = 0.08, mcbD = 0.06;
      const mcbGeo = new THREE.BoxGeometry(mcbW, mcbH, mcbD);
      const mcbBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      const mcbToggleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const rccbToggleMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
      disposables.push(mcbGeo, mcbBodyMat, mcbToggleMat, rccbToggleMat);

      for (let i = 0; i < mcbCount; i++) {
        const mcbMesh = new THREE.Mesh(mcbGeo, mcbBodyMat);
        const posX = -0.14 + i * (mcbW + 0.006);
        mcbMesh.position.set(posX, 0.01, 0.02);

        // Toggle lever
        const toggleGeo = new THREE.BoxGeometry(0.015, 0.025, 0.02);
        disposables.push(toggleGeo);
        const isRccb = i === 1;
        const toggleMesh = new THREE.Mesh(toggleGeo, isRccb ? rccbToggleMat : mcbToggleMat);
        toggleMesh.position.set(0, 0.01, 0.035);
        mcbMesh.add(toggleMesh);

        ptGroup.add(mcbMesh);
      }

      // Neutral and Earth busbars
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
      const barGeo = new THREE.BoxGeometry(0.36, 0.012, 0.015);
      disposables.push(brassMat, barGeo);
      const neutralBar = new THREE.Mesh(barGeo, brassMat);
      neutralBar.position.set(0, 0.18, 0);
      ptGroup.add(neutralBar);

      const earthBar = new THREE.Mesh(barGeo, brassMat);
      earthBar.position.set(0, -0.18, 0);
      ptGroup.add(earthBar);
    } else if (point.type === 'switch_board_6a') {
      // MODULAR SWITCHBOARD (6M)
      const plateGeo = new THREE.BoxGeometry(0.22, 0.12, 0.02);
      const plateMat = new THREE.MeshStandardMaterial({
        map: switchPlateTex,
        roughness: 0.2,
        metalness: 0.05
      });
      disposables.push(plateGeo, plateMat);
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      ptGroup.add(plateMesh);

      // Tiny neon indicator glow
      const neonGeo = new THREE.SphereGeometry(0.006, 8, 8);
      const neonMat = new THREE.MeshBasicMaterial({ color: point.isOn ? 0xef4444 : 0x475569 });
      disposables.push(neonGeo, neonMat);
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.position.set(0.08, 0.03, 0.012);
      ptGroup.add(neon);
    } else if (point.type === 'power_socket_16a' || point.type === 'combined_socket_6_16a') {
      // 16A 3-PIN SHUTTERED SOCKET
      const sockGeo = new THREE.BoxGeometry(0.12, 0.12, 0.02);
      const sockMat = new THREE.MeshStandardMaterial({
        map: socketTex,
        roughness: 0.25,
        metalness: 0.05
      });
      disposables.push(sockGeo, sockMat);
      const sockMesh = new THREE.Mesh(sockGeo, sockMat);
      ptGroup.add(sockMesh);
    } else if (point.type === 'downlight_led') {
      // CEILING RECESSED LED DOWNLIGHT
      const ringGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.02, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.7 });
      disposables.push(ringGeo, ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI;
      ptGroup.add(ring);

      const diffuserGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.005, 24);
      const diffuserMat = new THREE.MeshBasicMaterial({
        color: point.isOn ? 0xfffbeb : 0x94a3b8
      });
      disposables.push(diffuserGeo, diffuserMat);
      const diffuser = new THREE.Mesh(diffuserGeo, diffuserMat);
      diffuser.position.y = -0.01;
      ptGroup.add(diffuser);

      if (point.isOn) {
        const pointLight = new THREE.PointLight(0xffedd5, 1.2, 5.0, 1.8);
        pointLight.position.set(0, -0.15, 0);
        ptGroup.add(pointLight);
      }
    } else if (point.type === 'ceiling_fan') {
      // BLDC CEILING FAN
      const fanBaseGroup = new THREE.Group();
      // Canopy & Downrod
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

      // Rotating Hub & Aerofoil Blades
      const bladeRotator = new THREE.Group();
      bladeRotator.position.y = 0;

      const motorHubGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.06, 24);
      disposables.push(motorHubGeo);
      const motorHub = new THREE.Mesh(motorHubGeo, canopyMat);
      bladeRotator.add(motorHub);

      // 3 Blades (1200mm sweep = 0.55m radius)
      for (let b = 0; b < 3; b++) {
        const angle = (b * Math.PI * 2) / 3;
        const bladeArm = new THREE.Group();
        bladeArm.rotation.y = angle;

        const bladeGeo = new THREE.BoxGeometry(0.5, 0.008, 0.12);
        const bladeMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.5,
          roughness: 0.3
        });
        disposables.push(bladeGeo, bladeMat);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0.3, 0, 0);
        blade.rotation.x = 0.08; // pitch angle
        bladeArm.add(blade);
        bladeRotator.add(bladeArm);
      }

      fanBaseGroup.add(bladeRotator);
      ptGroup.add(fanBaseGroup);

      fanRotators.push({
        group: bladeRotator,
        speedMultiplier: point.stateValue ?? 2
      });
    } else if (point.type === 'ac_isolator') {
      // 20A AC ROTARY ISOLATOR SWITCH
      const boxGeo = new THREE.BoxGeometry(0.14, 0.18, 0.08);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
      disposables.push(boxGeo, boxMat);
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      ptGroup.add(boxMesh);

      const knobGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16);
      const knobMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.2, roughness: 0.4 });
      disposables.push(knobGeo, knobMat);
      const knob = new THREE.Mesh(knobGeo, knobMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.z = 0.05;
      ptGroup.add(knob);
    } else if (point.type === 'earth_pit') {
      // IS:3043 CHEMICAL EARTH ELECTRODE PIT
      const pitGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24);
      const pitMat = new THREE.MeshStandardMaterial({
        map: earthPitTex,
        roughness: 0.7,
        metalness: 0.8
      });
      disposables.push(pitGeo, pitMat);
      const pitMesh = new THREE.Mesh(pitGeo, pitMat);
      pitMesh.position.y = 0.02;
      ptGroup.add(pitMesh);

      // Copper Earth Rod emerging from chamber
      const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.3, 12);
      const rodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      disposables.push(rodGeo, rodMat);
      const earthRod = new THREE.Mesh(rodGeo, rodMat);
      earthRod.position.set(0, 0.15, 0);
      ptGroup.add(earthRod);

      // Green earth cable running to Main DB
      const dbPoint = project.electricalPoints.find((p) => p.type === 'db');
      if (dbPoint) {
        const earthLineCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(point.x, 0.1, point.z),
          new THREE.Vector3(point.x + 0.3, 0.05, point.z),
          new THREE.Vector3(dbPoint.x, 0.05, point.z),
          new THREE.Vector3(dbPoint.x, dbPoint.y - 0.2, dbPoint.z)
        ]);
        const earthTubeGeo = new THREE.TubeGeometry(earthLineCurve, 24, 0.012, 8, false);
        const earthTapeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
        disposables.push(earthTubeGeo, earthTapeMat);
        const earthTube = new THREE.Mesh(earthTubeGeo, earthTapeMat);
        houseGroup.add(earthTube);
      }
    }

    interactiveMeshes.set(point.id, ptGroup);
    houseGroup.add(ptGroup);
  });

  // 6. Parametric Orthogonal Conduit Network
  // Route from DB up to ceiling level (Y=2.85m), across to fixtures, and down to switchboards/sockets
  const dbPoint = project.electricalPoints.find((p) => p.type === 'db');
  const ceilingY = 2.85;

  if (dbPoint) {
    project.circuits.forEach((circuit) => {
      const isEnergized = circuit.id === activeCircuitId;
      const conduitMat = isEnergized ? conduitEnergizedMaterial : conduitDefaultMaterial;
      if (isEnergized) {
        activeConduitMaterials.push(conduitEnergizedMaterial);
      }

      circuit.connectedPointIds.forEach((ptId) => {
        const targetPt = project.electricalPoints.find((p) => p.id === ptId);
        if (!targetPt || targetPt.type === 'earth_pit') return;

        // Path: DB -> ceiling above DB -> ceiling waypoint near target -> target point
        const points = [
          new THREE.Vector3(dbPoint.x, dbPoint.y + 0.25, dbPoint.z),
          new THREE.Vector3(dbPoint.x, ceilingY, dbPoint.z),
          new THREE.Vector3(targetPt.x, ceilingY, dbPoint.z),
          new THREE.Vector3(targetPt.x, ceilingY, targetPt.z)
        ];

        // If target is wall mounted (not on ceiling), drop down inside wall
        if (targetPt.y < 2.5) {
          points.push(new THREE.Vector3(targetPt.x, targetPt.y + 0.06, targetPt.z));
        }

        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
        const tubeGeo = new THREE.TubeGeometry(curve, 32, circuit.conduitSize === '25mm' ? 0.018 : 0.014, 8, false);
        disposables.push(tubeGeo);
        const tubeMesh = new THREE.Mesh(tubeGeo, conduitMat);
        houseGroup.add(tubeMesh);

        // Circular ceiling junction box at turning points
        const jboxGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12);
        const jboxMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.3, roughness: 0.5 });
        disposables.push(jboxGeo, jboxMat);
        const jbox = new THREE.Mesh(jboxGeo, jboxMat);
        jbox.position.set(targetPt.x, ceilingY, targetPt.z);
        houseGroup.add(jbox);
      });
    });
  }

  // Update loop
  let elapsed = 0;
  const update = (delta: number, fanSpeedLevel: number, currentActiveCircuitId: string) => {
    elapsed += delta;

    // Rotate fans
    const speedRadPerSec = fanSpeedLevel === 0 ? 0 : fanSpeedLevel === 1 ? 6.0 : fanSpeedLevel === 2 ? 14.0 : 26.0;
    fanRotators.forEach((rot) => {
      rot.group.rotation.y += speedRadPerSec * delta;
    });

    // Pulse energized conduits
    if (activeConduitMaterials.length > 0) {
      const pulse = 0.75 + Math.sin(elapsed * 4.0) * 0.25;
      conduitEnergizedMaterial.emissiveIntensity = pulse;
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
    fanRotators,
    dbDoorPivot,
    interactiveMeshes,
    activeConduitMaterials,
    update,
    dispose
  };
}
