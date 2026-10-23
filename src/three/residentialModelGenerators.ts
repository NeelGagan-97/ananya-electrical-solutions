import * as THREE from 'three';
import {
  createFloorTilesTexture,
  createBrickWallTexture,
  createDbScheduleTexture,
  createIndianSocketTexture,
  createSwitchPlateTexture,
  createEarthChamberTexture,
  createContactShadowTexture
} from './proceduralTextures';

export type ResidentialViewMode = 'finished' | 'cutaway' | 'construction';

export interface ResidentialMeshNodes {
  group: THREE.Group;
  wallsFinishedGroup: THREE.Group;
  wallsConstructionGroup: THREE.Group;
  ceilingSlabGroup: THREE.Group;
  conduitGroup: THREE.Group;
  wiresGroup: THREE.Group;
  dbEnclosureGroup: THREE.Group;
  dbDoorMesh: THREE.Mesh;
  fanLivingRotor: THREE.Group;
  fanBedRotor: THREE.Group;
  lightsGroup: THREE.Group;
  switchboardsGroup: THREE.Group;
  switchRockerMeshes: { id: string; mesh: THREE.Mesh; isOn: boolean }[];
  earthPitGroup: THREE.Group;
  circuitTubes: { circuitId: string; tubeMesh: THREE.Mesh; curve: THREE.Curve<THREE.Vector3> }[];
}

/**
 * Creates the complete Indian 2BHK Residential House, Conduits, DB, Switchboards, Fans & Earthing
 */
export function createResidentialTwin(maxAniso: number = 4): ResidentialMeshNodes {
  const root = new THREE.Group();
  root.name = 'residential_root';

  // 1. Shared Materials
  const floorTilesMat = new THREE.MeshStandardMaterial({
    map: createFloorTilesTexture(maxAniso),
    roughness: 0.25,
    metalness: 0.05
  });

  const ceilingConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.8,
    metalness: 0.05
  });

  const finishedWallMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.85,
    metalness: 0.05
  });

  const cutawayWallMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    transmission: 0.8,
    opacity: 0.22,
    transparent: true,
    roughness: 0.2,
    depthWrite: false
  });

  const brickWallMat = new THREE.MeshStandardMaterial({
    map: createBrickWallTexture(maxAniso),
    roughness: 0.9,
    metalness: 0.05
  });

  const pvcConduitMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Grey rigid PVC electrical conduit
    roughness: 0.4,
    metalness: 0.1
  });

  const pvcJunctionBoxMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.15
  });

  const metalGiBoxMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Galvanized iron recessed modular back box
    metalness: 0.85,
    roughness: 0.35
  });

  // Conductor wire materials (Indian Standard BIS / IS:732)
  const phaseWireMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }); // Red Phase
  const neutralWireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }); // Black Neutral
  const earthWireMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 }); // Green Earth

  // 2. Foundation Slab & Flooring (10m x 8m)
  const floorGeo = new THREE.BoxGeometry(10.2, 0.25, 8.2);
  const floor = new THREE.Mesh(floorGeo, floorTilesMat);
  floor.position.set(0, 0.125, 0);
  floor.receiveShadow = true;
  root.add(floor);

  // Soft contact shadow underneath building
  const shadowGeo = new THREE.PlaneGeometry(12, 10);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  // 3. Walls Structure (Height 2.9m, Thickness 0.2m)
  const wallsFinishedGroup = new THREE.Group();
  const wallsConstructionGroup = new THREE.Group();
  wallsConstructionGroup.visible = false;

  interface WallDef {
    x: number;
    y: number;
    z: number;
    w: number;
    h: number;
    d: number;
  }

  const wallDefs: WallDef[] = [
    // Exterior Perimeter Walls
    { x: 0, y: 1.6, z: -4.0, w: 10.0, h: 2.7, d: 0.2 }, // North exterior wall
    { x: -5.0, y: 1.6, z: 0, w: 0.2, h: 2.7, d: 8.0 },  // West exterior wall
    { x: 5.0, y: 1.6, z: 0, w: 0.2, h: 2.7, d: 8.0 },   // East exterior wall
    { x: -2.2, y: 1.6, z: 4.0, w: 5.6, h: 2.7, d: 0.2 }, // South exterior wall left
    { x: 3.2, y: 1.6, z: 4.0, w: 3.6, h: 2.7, d: 0.2 },  // South exterior wall right (leaves entrance doorway)

    // Interior Partition Walls
    { x: 0, y: 1.6, z: -1.2, w: 0.2, h: 2.7, d: 5.6 },   // Central dividing spine (Living vs Kitchen)
    { x: -2.4, y: 1.6, z: 1.2, w: 5.0, h: 2.7, d: 0.2 }, // Living vs Master Bed
    { x: 2.4, y: 1.6, z: 1.2, w: 5.0, h: 2.7, d: 0.2 },  // Kitchen vs Bed 2 / Bath
    { x: 2.5, y: 1.6, z: -0.6, w: 4.8, h: 2.7, d: 0.2 }  // Kitchen vs Bathroom
  ];

  wallDefs.forEach((w) => {
    const geo = new THREE.BoxGeometry(w.w, w.h, w.d);

    const fMesh = new THREE.Mesh(geo, finishedWallMat);
    fMesh.position.set(w.x, w.y, w.z);
    fMesh.castShadow = true;
    fMesh.receiveShadow = true;
    wallsFinishedGroup.add(fMesh);

    const cMesh = new THREE.Mesh(geo, brickWallMat);
    cMesh.position.set(w.x, w.y, w.z);
    cMesh.castShadow = true;
    cMesh.receiveShadow = true;
    wallsConstructionGroup.add(cMesh);
  });

  root.add(wallsFinishedGroup, wallsConstructionGroup);

  // 4. Ceiling Slab (3.0m Height)
  const ceilingSlabGroup = new THREE.Group();
  const ceilingGeo = new THREE.BoxGeometry(10.2, 0.2, 8.2);
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingConcreteMat);
  ceiling.position.set(0, 3.05, 0);
  ceiling.castShadow = true;
  ceilingSlabGroup.add(ceiling);
  root.add(ceilingSlabGroup);

  // 5. Main Distribution Board (DB) in Passage (X: -0.1, Y: 1.5, Z: 0.4)
  const dbEnclosureGroup = new THREE.Group();
  dbEnclosureGroup.position.set(-0.11, 1.5, 0.4);

  // Metal Cabinet Base Box
  const dbBoxGeo = new THREE.BoxGeometry(0.18, 0.65, 0.48);
  const dbBox = new THREE.Mesh(dbBoxGeo, new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.5,
    roughness: 0.4
  }));
  dbBox.castShadow = true;
  dbEnclosureGroup.add(dbBox);

  // DIN Rail (inside enclosure)
  const dinRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.42), new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2
  }));
  dinRail.position.set(-0.04, 0, 0);
  dbEnclosureGroup.add(dinRail);

  // Incomer Isolator 2P
  const isolator = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Red toggle for main incomer
    metalness: 0.2,
    roughness: 0.4
  }));
  isolator.position.set(-0.02, 0.08, -0.16);

  // 40A 30mA RCCB
  const rccb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Blue housing
    metalness: 0.2,
    roughness: 0.4
  }));
  rccb.position.set(-0.02, 0.08, -0.07);

  // 6x MCBs
  for (let m = 0; m < 6; m++) {
    const mcb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.035), new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.1,
      roughness: 0.5
    }));
    mcb.position.set(-0.02, 0.07, 0.02 + m * 0.038);
    dbEnclosureGroup.add(mcb);
  }

  // Neutral Bar (Top brass strip with screws)
  const neutralBar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.38), new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.9,
    roughness: 0.2
  }));
  neutralBar.position.set(-0.04, 0.24, 0);

  // Earth Bar (Bottom copper strip)
  const earthBar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.38), new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    metalness: 0.8,
    roughness: 0.3
  }));
  earthBar.position.set(-0.04, -0.24, 0);

  // DB Door (Hinged, starts open so components are visible)
  const dbDoorGeo = new THREE.BoxGeometry(0.02, 0.65, 0.48);
  const dbDoorMesh = new THREE.Mesh(dbDoorGeo, new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.3
  }));
  dbDoorMesh.position.set(-0.1, 0, -0.24); // pivot along left edge
  dbDoorMesh.rotation.y = Math.PI * 0.45; // open at 80 degrees
  dbEnclosureGroup.add(dbDoorMesh);

  // DB Schedule Chart Placard on Door
  const dbScheduleGeo = new THREE.PlaneGeometry(0.38, 0.26);
  const dbScheduleMat = new THREE.MeshBasicMaterial({
    map: createDbScheduleTexture(),
    side: THREE.DoubleSide
  });
  const dbSchedule = new THREE.Mesh(dbScheduleGeo, dbScheduleMat);
  dbSchedule.rotation.y = Math.PI / 2;
  dbSchedule.position.set(-0.012, 0, 0);
  dbDoorMesh.add(dbSchedule);

  dbEnclosureGroup.add(isolator, rccb, neutralBar, earthBar);
  root.add(dbEnclosureGroup);

  // 6. PVC Conduits & Ceiling Grid Routing
  const conduitGroup = new THREE.Group();
  conduitGroup.name = 'conduit_network';

  const conduitSegments: { start: THREE.Vector3; end: THREE.Vector3 }[] = [
    // Main riser trunking from DB upward to ceiling slab
    { start: new THREE.Vector3(-0.11, 1.85, 0.4), end: new THREE.Vector3(-0.11, 2.95, 0.4) },

    // Ceiling Main Trunking Line running down passage
    { start: new THREE.Vector3(-0.11, 2.95, 0.4), end: new THREE.Vector3(-2.5, 2.95, 0.4) }, // Branch to Living
    { start: new THREE.Vector3(-0.11, 2.95, 0.4), end: new THREE.Vector3(2.5, 2.95, 0.4) },  // Branch to Kitchen & Bed 2
    { start: new THREE.Vector3(-0.11, 2.95, 0.4), end: new THREE.Vector3(-0.11, 2.95, 2.5) }, // Branch to Master Bed
    { start: new THREE.Vector3(-0.11, 2.95, 0.4), end: new THREE.Vector3(-0.11, 2.95, -2.5) }, // Branch to Living front

    // Living Room Ceiling Ring to Fan & Downlights
    { start: new THREE.Vector3(-2.5, 2.95, 0.4), end: new THREE.Vector3(-2.5, 2.95, -1.8) }, // To Living Fan
    { start: new THREE.Vector3(-2.5, 2.95, -1.8), end: new THREE.Vector3(-4.0, 2.95, -1.8) }, // To Left Downlight
    { start: new THREE.Vector3(-2.5, 2.95, -1.8), end: new THREE.Vector3(-1.0, 2.95, -1.8) }, // To Right Downlight
    { start: new THREE.Vector3(-2.5, 2.95, 0.4), end: new THREE.Vector3(-4.88, 2.95, 0.4) }, // To Living Switchboard drop
    { start: new THREE.Vector3(-4.88, 2.95, 0.4), end: new THREE.Vector3(-4.88, 1.25, 0.4) }, // Vertical drop in wall

    // Master Bedroom Ceiling Conduits
    { start: new THREE.Vector3(-0.11, 2.95, 2.5), end: new THREE.Vector3(-2.5, 2.95, 2.5) }, // To Master Fan
    { start: new THREE.Vector3(-2.5, 2.95, 2.5), end: new THREE.Vector3(-4.88, 2.95, 2.5) }, // To Bed Switchboard drop
    { start: new THREE.Vector3(-4.88, 2.95, 2.5), end: new THREE.Vector3(-4.88, 1.25, 2.5) }, // Bed wall drop
    { start: new THREE.Vector3(-2.5, 2.95, 2.5), end: new THREE.Vector3(-2.5, 2.95, 3.88) }, // To AC drop
    { start: new THREE.Vector3(-2.5, 2.95, 3.88), end: new THREE.Vector3(-2.5, 2.4, 3.88) }, // AC high wall drop

    // Kitchen Conduits (Heavy power lines)
    { start: new THREE.Vector3(2.5, 2.95, 0.4), end: new THREE.Vector3(2.5, 2.95, -2.0) }, // Kitchen ceiling
    { start: new THREE.Vector3(2.5, 2.95, -2.0), end: new THREE.Vector3(4.88, 2.95, -2.0) }, // To Kitchen Counter switchboard drop
    { start: new THREE.Vector3(4.88, 2.95, -2.0), end: new THREE.Vector3(4.88, 1.15, -2.0) }, // Counter socket drop

    // Bathroom Geyser Conduits
    { start: new THREE.Vector3(2.5, 2.95, 0.4), end: new THREE.Vector3(4.0, 2.95, 0.2) },
    { start: new THREE.Vector3(4.0, 2.95, 0.2), end: new THREE.Vector3(4.0, 2.2, 0.2) } // Geyser point
  ];

  conduitSegments.forEach((seg) => {
    const dist = seg.start.distanceTo(seg.end);
    const pipeGeo = new THREE.CylinderGeometry(0.024, 0.024, dist, 8);
    const pipe = new THREE.Mesh(pipeGeo, pvcConduitMat);

    // Position midway and orient along vector
    pipe.position.copy(seg.start).add(seg.end).multiplyScalar(0.5);
    pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), seg.end.clone().sub(seg.start).normalize());
    conduitGroup.add(pipe);

    // Circular PVC junction box at intersection
    const jBox = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 12), pvcJunctionBoxMat);
    jBox.position.copy(seg.start);
    conduitGroup.add(jBox);
  });

  root.add(conduitGroup);

  // 7. Interactive 3D Wire Tracing System (Actual multi-conductor tube geometry)
  const wiresGroup = new THREE.Group();
  wiresGroup.name = 'wiring_system';

  const circuitDefinitions = [
    {
      id: 'c1_living_lighting',
      color: 0xdc2626, // Red
      name: 'Circuit 1: Living & Passage Lighting (1.5 sq.mm)',
      points: [
        new THREE.Vector3(-0.08, 1.57, 0.42), // DB MCB 1 terminal
        new THREE.Vector3(-0.11, 2.95, 0.4),  // Ceiling riser
        new THREE.Vector3(-2.5, 2.95, 0.4),   // Living ceiling box
        new THREE.Vector3(-4.88, 2.95, 0.4),  // Wall entry
        new THREE.Vector3(-4.88, 1.25, 0.4)   // Switchboard 1
      ]
    },
    {
      id: 'c2_bedroom_fan',
      color: 0xf59e0b, // Yellow/Amber
      name: 'Circuit 2: Bedrooms Lighting & Fans (1.5 sq.mm)',
      points: [
        new THREE.Vector3(-0.08, 1.57, 0.46), // DB MCB 2
        new THREE.Vector3(-0.11, 2.95, 0.4),
        new THREE.Vector3(-0.11, 2.95, 2.5),
        new THREE.Vector3(-2.5, 2.95, 2.5),   // Master Bed Fan
        new THREE.Vector3(-4.88, 2.95, 2.5),
        new THREE.Vector3(-4.88, 1.25, 2.5)   // Bed Switchboard
      ]
    },
    {
      id: 'c3_power_sockets',
      color: 0x0284c7, // Blue
      name: 'Circuit 3: Convenience Sockets 16A/6A (2.5 sq.mm)',
      points: [
        new THREE.Vector3(-0.08, 1.57, 0.50), // DB MCB 3
        new THREE.Vector3(-0.11, 2.95, 0.4),
        new THREE.Vector3(-2.5, 2.95, 0.4),
        new THREE.Vector3(-4.88, 2.95, 0.4),
        new THREE.Vector3(-4.88, 0.45, 0.4)   // Skirting level socket
      ]
    },
    {
      id: 'c4_kitchen_power',
      color: 0x9333ea, // Purple/Heavy
      name: 'Circuit 4: Kitchen Heavy Appliances (4.0 sq.mm)',
      points: [
        new THREE.Vector3(-0.08, 1.57, 0.54), // DB MCB 4
        new THREE.Vector3(-0.11, 2.95, 0.4),
        new THREE.Vector3(2.5, 2.95, 0.4),
        new THREE.Vector3(2.5, 2.95, -2.0),
        new THREE.Vector3(4.88, 2.95, -2.0),
        new THREE.Vector3(4.88, 1.15, -2.0)   // Kitchen counter switchboard
      ]
    },
    {
      id: 'c5_heavy_ac',
      color: 0xe11d48, // Crimson Heavy AC
      name: 'Circuit 5: Master Bed 1.5T AC (4.0 sq.mm)',
      points: [
        new THREE.Vector3(-0.08, 1.57, 0.58), // DB MCB 5
        new THREE.Vector3(-0.11, 2.95, 0.4),
        new THREE.Vector3(-0.11, 2.95, 2.5),
        new THREE.Vector3(-2.5, 2.95, 2.5),
        new THREE.Vector3(-2.5, 2.4, 3.88)    // AC outlet high point
      ]
    },
    {
      id: 'c_earth_grid',
      color: 0x16a34a, // Green Protective Earth
      name: 'Protective Earth Ring to Earth Pit (8 SWG Cu)',
      points: [
        new THREE.Vector3(-0.08, 1.26, 0.4),  // DB Earth Bar
        new THREE.Vector3(-0.11, 0.35, 0.4),  // Down to floor
        new THREE.Vector3(-5.0, 0.35, 0.4),   // Out through foundation
        new THREE.Vector3(-5.8, 0.1, -2.5)    // External Earth Pit Chamber
      ]
    }
  ];

  const circuitTubes: { circuitId: string; tubeMesh: THREE.Mesh; curve: THREE.Curve<THREE.Vector3> }[] = [];

  circuitDefinitions.forEach((c) => {
    const curve = new THREE.CatmullRomCurve3(c.points, false, 'centripetal', 0.2);
    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.012, 6, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: c.color,
      roughness: 0.35,
      metalness: 0.1
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.userData = { circuitId: c.id, circuitName: c.name };
    wiresGroup.add(tubeMesh);
    circuitTubes.push({ circuitId: c.id, tubeMesh, curve });
  });

  root.add(wiresGroup);

  // 8. Modular Switchboards & Socket Outlets
  const switchboardsGroup = new THREE.Group();
  const switchRockerMeshes: { id: string; mesh: THREE.Mesh; isOn: boolean }[] = [];

  // Helper to create an Indian Modular Switchboard
  const createModularBoard = (id: string, pos: THREE.Vector3, rotY: number, modules: number = 8) => {
    const boardGroup = new THREE.Group();
    boardGroup.position.copy(pos);
    boardGroup.rotation.y = rotY;

    // Recessed Galvanized Metal Back Box
    const backBox = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.28), metalGiBoxMat);
    backBox.position.x = 0.02;
    boardGroup.add(backBox);

    // Front Faceplate
    const plateGeo = new THREE.BoxGeometry(0.018, 0.17, 0.29);
    const plateMat = new THREE.MeshStandardMaterial({
      map: createSwitchPlateTexture(modules),
      roughness: 0.2,
      metalness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.x = -0.015;
    boardGroup.add(plate);

    // Rocker Switch 1 (Functional Living Light switch)
    const rockerGeo = new THREE.BoxGeometry(0.015, 0.05, 0.035);
    const rockerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const rocker = new THREE.Mesh(rockerGeo, rockerMat);
    rocker.position.set(-0.025, 0.01, -0.08);
    rocker.rotation.z = 0.1; // ON state
    boardGroup.add(rocker);
    switchRockerMeshes.push({ id, mesh: rocker, isOn: true });

    // 3-Pin Indian Socket Face
    const socketGeo = new THREE.PlaneGeometry(0.065, 0.065);
    const socketMat = new THREE.MeshBasicMaterial({
      map: createIndianSocketTexture()
    });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.rotation.y = -Math.PI / 2;
    socket.position.set(-0.026, 0.01, 0.06);
    boardGroup.add(socket);

    return boardGroup;
  };

  // Living Room 8-Module Board (on west wall)
  const livingBoard = createModularBoard('sw_living', new THREE.Vector3(-4.88, 1.25, 0.4), 0, 8);
  // Master Bed Board (on west wall of bed)
  const bedBoard = createModularBoard('sw_bed', new THREE.Vector3(-4.88, 1.25, 2.5), 0, 6);
  // Kitchen Counter Board (on east wall)
  const kitchenBoard = createModularBoard('sw_kitchen', new THREE.Vector3(4.88, 1.15, -2.0), Math.PI, 4);

  switchboardsGroup.add(livingBoard, bedBoard, kitchenBoard);
  root.add(switchboardsGroup);

  // 9. Ceiling Fans (Living Room & Master Bedroom)
  const fanLivingRotor = new THREE.Group();
  const fanBedRotor = new THREE.Group();

  const buildCeilingFan = (rotorGroup: THREE.Group, pos: THREE.Vector3) => {
    const fanRoot = new THREE.Group();
    fanRoot.position.copy(pos);

    // Ceiling Mount Canopy Cup
    const topCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.1, 16), new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.3,
      roughness: 0.3
    }));
    topCanopy.position.y = 2.95;
    fanRoot.add(topCanopy);

    // Downrod
    const downrod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.25
    }));
    downrod.position.y = 2.75;
    fanRoot.add(downrod);

    // Rotor & Motor Assembly (Rotating part)
    rotorGroup.position.set(0, 2.52, 0);

    const motorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.12, 24), new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.25
    }));
    rotorGroup.add(motorHousing);

    // Brass Accent Ring
    const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 12, 24), new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.2
    }));
    brassRing.rotation.x = Math.PI / 2;
    rotorGroup.add(brassRing);

    // 3 Aerodynamic Blades
    const bladeGeo = new THREE.BoxGeometry(0.65, 0.015, 0.12);
    for (let b = 0; b < 3; b++) {
      const angle = (b * Math.PI * 2) / 3;
      const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.2
      }));
      blade.position.set(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
      blade.rotation.y = -angle;
      blade.rotation.z = 0.08; // aerodynamic pitch
      rotorGroup.add(blade);
    }

    fanRoot.add(rotorGroup);
    return fanRoot;
  };

  const livingFan = buildCeilingFan(fanLivingRotor, new THREE.Vector3(-2.5, 0, -1.8));
  const bedFan = buildCeilingFan(fanBedRotor, new THREE.Vector3(-2.5, 0, 2.5));
  root.add(livingFan, bedFan);

  // 10. Recessed LED Downlights & Functional Scene Illumination
  const lightsGroup = new THREE.Group();

  const createDownlight = (pos: THREE.Vector3, colorHex: number = 0xfff7ed, intensity: number = 1.2) => {
    const fixtureGroup = new THREE.Group();
    fixtureGroup.position.copy(pos);

    // Aluminum Trim Ring
    const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3
    }));
    trim.position.y = 2.94;

    // Opal Diffuser Lens
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), new THREE.MeshBasicMaterial({
      color: 0xfffbeb
    }));
    lens.rotation.x = Math.PI / 2;
    lens.position.y = 2.93;

    // Three.js Point Light for real illumination
    const light = new THREE.PointLight(colorHex, intensity, 6.0, 1.5);
    light.position.y = 2.8;
    light.castShadow = false; // lightweight performance

    fixtureGroup.add(trim, lens, light);
    return { fixtureGroup, light };
  };

  const downlightPositions = [
    new THREE.Vector3(-4.0, 0, -1.8), // Living left
    new THREE.Vector3(-1.0, 0, -1.8), // Living right
    new THREE.Vector3(-3.8, 0, 2.5),  // Master bed
    new THREE.Vector3(2.5, 0, -2.0)   // Kitchen
  ];

  downlightPositions.forEach((dp) => {
    const { fixtureGroup } = createDownlight(dp);
    lightsGroup.add(fixtureGroup);
  });

  root.add(lightsGroup);

  // 11. External Earthing Chamber Pit (IS: 3043:2018 Standard)
  const earthPitGroup = new THREE.Group();
  earthPitGroup.position.set(-5.8, 0.02, -2.5);

  // Masonry Chamber Concrete Box (0.6m x 0.6m)
  const pitWall = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.9
  }));
  pitWall.position.y = 0.2;
  earthPitGroup.add(pitWall);

  // Inspection Chamber Lid with IS:3043 markings
  const pitCover = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({
    map: createEarthChamberTexture()
  }));
  pitCover.rotation.x = -Math.PI / 2;
  pitCover.position.y = 0.43;
  earthPitGroup.add(pitCover);

  // Copper Earthing Electrode Rod driven into ground
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.95,
    roughness: 0.15
  }));
  rod.position.y = 0.25;
  earthPitGroup.add(rod);

  root.add(earthPitGroup);

  return {
    group: root,
    wallsFinishedGroup,
    wallsConstructionGroup,
    ceilingSlabGroup,
    conduitGroup,
    wiresGroup,
    dbEnclosureGroup,
    dbDoorMesh,
    fanLivingRotor,
    fanBedRotor,
    lightsGroup,
    switchboardsGroup,
    switchRockerMeshes,
    earthPitGroup,
    circuitTubes
  };
}
