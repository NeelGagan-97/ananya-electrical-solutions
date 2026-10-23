import * as THREE from 'three';
import {
  createSolarCellTexture,
  createDangerSignTexture,
  createTransformerGaugeTexture,
  createSwitchyardGravelTexture,
  createContactShadowTexture
} from './proceduralTextures';

/**
 * Creates ribbed ceramic porcelain insulator lathe profile
 */
export function createPorcelainInsulatorGeometry(height: number, shedRadius: number, coreRadius: number, shedsCount: number): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(coreRadius * 1.3, 0));

  const shedStep = height / (shedsCount + 1);
  for (let i = 0; i <= shedsCount; i++) {
    const y = (i + 0.5) * shedStep;
    // Core valley
    points.push(new THREE.Vector2(coreRadius, y - shedStep * 0.3));
    // Shed flare
    points.push(new THREE.Vector2(shedRadius, y));
    // Shed underskirt
    points.push(new THREE.Vector2(coreRadius * 0.85, y + shedStep * 0.15));
  }

  points.push(new THREE.Vector2(coreRadius * 1.2, height));
  points.push(new THREE.Vector2(0, height));

  const geo = new THREE.LatheGeometry(points, 24);
  geo.computeVertexNormals();
  return geo;
}

export interface TransformerMeshNodes {
  group: THREE.Group;
  conservatorNode: THREE.Group;
  bushingTurretNode: THREE.Group;
  radiatorLeftNode: THREE.Group;
  radiatorRightNode: THREE.Group;
  coreWindingNode: THREE.Group;
  tankShellMesh: THREE.Mesh;
}

export interface BreakerMeshNodes {
  group: THREE.Group;
  bladeArms: THREE.Group[];
  operatingCabinet: THREE.Mesh;
}

export interface SolarTrackerNodes {
  group: THREE.Group;
  tiltRafterGroup: THREE.Group;
}

/**
 * Composite 3–12 Part Procedural 33kV/11kV Outdoor Power Transformer
 */
export function createTransformerGroup(maxAniso: number = 4): TransformerMeshNodes {
  const root = new THREE.Group();
  root.name = 'transformer_root';

  // Shared PBR Materials
  const tankEnamelMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Slate industrial transformer grey
    metalness: 0.35,
    roughness: 0.45
  });

  const galvanizedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.3
  });

  const brownPorcelainMat = new THREE.MeshPhysicalMaterial({
    color: 0x451a03, // Glazed brown porcelain
    metalness: 0.15,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const copperTerminalMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Polished industrial copper
    metalness: 0.95,
    roughness: 0.2
  });

  const brassValveMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.9,
    roughness: 0.25
  });

  // 1. Concrete plinth foundation pad & contact shadow (Ground Y=0)
  const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  // Concrete Plinth
  const plinthGeo = new THREE.BoxGeometry(4.2, 0.4, 3.8);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    metalness: 0.05,
    roughness: 0.9
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.2;
  plinth.receiveShadow = true;
  root.add(plinth);

  // 2. Base Skid Steel Channels & 4 Flanged Rollers
  const skidGroup = new THREE.Group();
  skidGroup.position.y = 0.4;
  const channelGeo = new THREE.BoxGeometry(3.6, 0.18, 0.2);
  const skidL = new THREE.Mesh(channelGeo, galvanizedSteelMat);
  skidL.position.set(0, 0.09, -1.2);
  skidL.castShadow = true;
  const skidR = new THREE.Mesh(channelGeo, galvanizedSteelMat);
  skidR.position.set(0, 0.09, 1.2);
  skidR.castShadow = true;
  skidGroup.add(skidL, skidR);

  // 4 Steel Rail Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [-1.3, 0.09, -1.2],
    [1.3, 0.09, -1.2],
    [-1.3, 0.09, 1.2],
    [1.3, 0.09, 1.2]
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, galvanizedSteelMat);
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    skidGroup.add(wheel);
  });
  root.add(skidGroup);

  // 3. Main Transformer Oil Tank Shell (Y: 0.58 to 3.08)
  const tankShellGeo = new THREE.BoxGeometry(3.0, 2.5, 2.2);
  const tankShellMesh = new THREE.Mesh(tankShellGeo, tankEnamelMat);
  tankShellMesh.position.set(0, 0.58 + 1.25, 0);
  tankShellMesh.castShadow = true;
  tankShellMesh.receiveShadow = true;
  root.add(tankShellMesh);

  // Rating Nameplate on front of tank
  const plateGeo = new THREE.PlaneGeometry(0.7, 0.5);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.8,
    roughness: 0.2
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, 2.0, 1.11);
  root.add(plate);

  // 4. Internal Copper Core & Winding Assembly (Hidden/Exploded view reveal)
  const coreWindingNode = new THREE.Group();
  coreWindingNode.position.set(0, 0.58 + 1.25, 0);

  // 3 Magnetic core vertical limbs
  const limbGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.9, 16);
  const coilGeo = new THREE.CylinderGeometry(0.44, 0.44, 1.4, 20);
  const coreYokeGeo = new THREE.BoxGeometry(2.3, 0.28, 0.65);
  const coreLaminationsMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.9,
    roughness: 0.25
  });

  const yokeTop = new THREE.Mesh(coreYokeGeo, coreLaminationsMat);
  yokeTop.position.y = 0.9;
  const yokeBottom = new THREE.Mesh(coreYokeGeo, coreLaminationsMat);
  yokeBottom.position.y = -0.9;
  coreWindingNode.add(yokeTop, yokeBottom);

  [-0.75, 0, 0.75].forEach((lx) => {
    const limb = new THREE.Mesh(limbGeo, coreLaminationsMat);
    limb.position.x = lx;
    const coil = new THREE.Mesh(coilGeo, copperTerminalMat);
    coil.position.x = lx;
    coreWindingNode.add(limb, coil);
  });
  coreWindingNode.visible = false; // toggled or revealed during exploded state
  root.add(coreWindingNode);

  // 5. Side Cooling Radiator Bank (Left & Right fins)
  const radiatorLeftNode = new THREE.Group();
  radiatorLeftNode.position.set(-1.5, 0.58 + 1.25, 0);

  const radiatorRightNode = new THREE.Group();
  radiatorRightNode.position.set(1.5, 0.58 + 1.25, 0);

  const finGeo = new THREE.BoxGeometry(0.12, 2.1, 1.8);
  const finHeaderGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 12);
  finHeaderGeo.rotateX(Math.PI / 2);

  // Left Radiator Bank
  const leftFins = new THREE.Mesh(finGeo, tankEnamelMat);
  leftFins.position.x = -0.3;
  leftFins.castShadow = true;
  const leftHeaderTop = new THREE.Mesh(finHeaderGeo, tankEnamelMat);
  leftHeaderTop.position.set(-0.3, 1.0, 0);
  const leftHeaderBot = new THREE.Mesh(finHeaderGeo, tankEnamelMat);
  leftHeaderBot.position.set(-0.3, -1.0, 0);
  radiatorLeftNode.add(leftFins, leftHeaderTop, leftHeaderBot);

  // Right Radiator Bank
  const rightFins = new THREE.Mesh(finGeo, tankEnamelMat);
  rightFins.position.x = 0.3;
  rightFins.castShadow = true;
  const rightHeaderTop = new THREE.Mesh(finHeaderGeo, tankEnamelMat);
  rightHeaderTop.position.set(0.3, 1.0, 0);
  const rightHeaderBot = new THREE.Mesh(finHeaderGeo, tankEnamelMat);
  rightHeaderBot.position.set(0.3, -1.0, 0);
  radiatorRightNode.add(rightFins, rightHeaderTop, rightHeaderBot);

  root.add(radiatorLeftNode, radiatorRightNode);

  // 6. Marshalling Box with Real Oil Temperature Dial Gauge
  const kioskGeo = new THREE.BoxGeometry(0.65, 0.85, 0.3);
  const kiosk = new THREE.Mesh(kioskGeo, galvanizedSteelMat);
  kiosk.position.set(1.1, 1.7, 1.25);
  kiosk.castShadow = true;

  const gaugeGeo = new THREE.CircleGeometry(0.12, 24);
  const gaugeMat = new THREE.MeshBasicMaterial({
    map: createTransformerGaugeTexture()
  });
  const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
  gauge.position.set(1.1, 1.85, 1.41);
  root.add(kiosk, gauge);

  // 7. Top Bushing Turret & High Voltage (33kV) + Low Voltage (433V) Porcelain Bushings
  const bushingTurretNode = new THREE.Group();
  bushingTurretNode.position.set(0, 3.08, 0);

  // 3x High Voltage 33kV Porcelain Ribbed Bushings
  const hvBushingGeo = createPorcelainInsulatorGeometry(1.2, 0.22, 0.08, 6);
  const terminalFlagGeo = new THREE.BoxGeometry(0.14, 0.22, 0.04);

  const hvPositions = [-0.7, 0, 0.7];
  hvPositions.forEach((hx) => {
    const hvGroup = new THREE.Group();
    hvGroup.position.set(hx, 0, -0.4);

    const porcelain = new THREE.Mesh(hvBushingGeo, brownPorcelainMat);
    porcelain.castShadow = true;

    const flag = new THREE.Mesh(terminalFlagGeo, copperTerminalMat);
    flag.position.set(0, 1.25, 0);
    flag.castShadow = true;

    hvGroup.add(porcelain, flag);
    bushingTurretNode.add(hvGroup);
  });

  // 4x Low Voltage (433V) Phase & Neutral Bushings
  const lvBushingGeo = createPorcelainInsulatorGeometry(0.65, 0.14, 0.06, 4);
  const lvPositions = [-0.75, -0.25, 0.25, 0.75];
  lvPositions.forEach((lx) => {
    const lvGroup = new THREE.Group();
    lvGroup.position.set(lx, 0, 0.5);

    const porcelain = new THREE.Mesh(lvBushingGeo, brownPorcelainMat);
    porcelain.castShadow = true;

    const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), copperTerminalMat);
    lug.position.y = 0.7;

    lvGroup.add(porcelain, lug);
    bushingTurretNode.add(lvGroup);
  });

  root.add(bushingTurretNode);

  // 8. Top Conservator Drum Expansion Tank & Buchholz Relay Assembly
  const conservatorNode = new THREE.Group();
  conservatorNode.position.set(0, 3.08, 0);

  // Conservator Cylinder (Horizontal Drum)
  const drumGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.4, 24);
  drumGeo.rotateZ(Math.PI / 2);
  const drum = new THREE.Mesh(drumGeo, tankEnamelMat);
  drum.position.set(0, 1.0, -0.85);
  drum.castShadow = true;

  // Drum Support Stanchions
  const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8);
  [-0.8, 0.8].forEach((lx) => {
    const leg = new THREE.Mesh(legGeo, galvanizedSteelMat);
    leg.position.set(lx, 0.5, -0.85);
    leg.castShadow = true;
    conservatorNode.add(leg);
  });

  // Buchholz Relay Pipe linking conservator to main tank
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 0.1, -0.4),
    new THREE.Vector3(0.5, 0.6, -0.6),
    new THREE.Vector3(0.5, 0.9, -0.85)
  ]);
  const pipeGeo = new THREE.TubeGeometry(pipeCurve, 16, 0.06, 8, false);
  const pipe = new THREE.Mesh(pipeGeo, galvanizedSteelMat);

  // Buchholz Relay Chamber
  const relayBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.2), brassValveMat);
  relayBox.position.set(0.5, 0.6, -0.6);

  // Silica Gel Breather Canister
  const breatherPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), galvanizedSteelMat);
  breatherPipe.position.set(-1.1, 0.8, -0.85);
  const breatherCanister = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16), new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.6,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8
  }));
  breatherCanister.position.set(-1.1, 0.35, -0.85);

  conservatorNode.add(drum, pipe, relayBox, breatherPipe, breatherCanister);
  root.add(conservatorNode);

  return {
    group: root,
    conservatorNode,
    bushingTurretNode,
    radiatorLeftNode,
    radiatorRightNode,
    coreWindingNode,
    tankShellMesh
  };
}

/**
 * Composite 3–12 Part Outdoor Vacuum Circuit Breaker (VCB) / Isolator
 */
export function createBreakerGroup(): BreakerMeshNodes {
  const root = new THREE.Group();
  root.name = 'breaker_root';

  const galvanizedMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.3
  });

  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0x3f1d0b,
    metalness: 0.1,
    roughness: 0.08,
    clearcoat: 1.0
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.95,
    roughness: 0.2
  });

  // Concrete pad & contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 3.5),
    new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.3, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.9 })
  );
  plinth.position.y = 0.15;
  plinth.receiveShadow = true;
  root.add(plinth);

  // 1. Galvanized steel support structure columns & braces
  const legGeo = new THREE.BoxGeometry(0.12, 1.8, 0.12);
  const legPositions = [
    [-1.2, 1.2, -0.7],
    [1.2, 1.2, -0.7],
    [-1.2, 1.2, 0.7],
    [1.2, 1.2, 0.7]
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, galvanizedMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    root.add(leg);
  });

  // Horizontal structural frame beam
  const frameBeam = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.14, 1.6), galvanizedMat);
  frameBeam.position.set(0, 2.1, 0);
  frameBeam.castShadow = true;
  root.add(frameBeam);

  // 2. Spring-charged operating mechanism cubicle
  const cabinetGeo = new THREE.BoxGeometry(0.9, 0.9, 0.55);
  const cabinetMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.4,
    roughness: 0.4
  });
  const operatingCabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
  operatingCabinet.position.set(0, 1.35, 0);
  operatingCabinet.castShadow = true;

  // Mechanical ON/OFF flag window
  const flagGeo = new THREE.PlaneGeometry(0.18, 0.12);
  const flagMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red = CLOSED/ENERGIZED
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(0, 1.45, 0.28);
  operatingCabinet.add(flagMesh);
  root.add(operatingCabinet);

  // 3. 3x Vacuum Interrupter Poles (3-Phase Porcelain Columns)
  const interrupterGeo = createPorcelainInsulatorGeometry(1.4, 0.24, 0.1, 7);
  const bladeArms: THREE.Group[] = [];

  [-0.8, 0, 0.8].forEach((px) => {
    // Fixed vertical column
    const pole = new THREE.Mesh(interrupterGeo, ceramicMat);
    pole.position.set(px, 2.17, -0.3);
    pole.castShadow = true;
    root.add(pole);

    // Front terminal post
    const frontPost = new THREE.Mesh(interrupterGeo, ceramicMat);
    frontPost.position.set(px, 2.17, 0.4);
    frontPost.castShadow = true;
    root.add(frontPost);

    // Articulated knife blade arm (hinged pivot at rear post, rotates to contact front post)
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(px, 2.17 + 1.4, -0.3);

    const copperBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.75), copperMat);
    copperBlade.position.set(0, 0, 0.35);
    copperBlade.castShadow = true;
    bladeGroup.add(copperBlade);

    bladeArms.push(bladeGroup);
    root.add(bladeGroup);
  });

  return {
    group: root,
    bladeArms,
    operatingCabinet
  };
}

/**
 * Composite 3–12 Part Solar Tracking PV Array (Renewable Solar EPC)
 */
export function createSolarTrackerGroup(maxAniso: number = 4): SolarTrackerNodes {
  const root = new THREE.Group();
  root.name = 'solar_array_root';

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.3
  });

  const pvCellMat = new THREE.MeshStandardMaterial({
    map: createSolarCellTexture(maxAniso),
    metalness: 0.25,
    roughness: 0.15
  });

  const aluFrameMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.9,
    roughness: 0.25
  });

  // Contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(8.5, 4.5),
    new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  // 1. Driven Steel Pier Posts (Galvanized H-Piles)
  const pierGeo = new THREE.BoxGeometry(0.18, 1.8, 0.18);
  [-2.2, 0, 2.2].forEach((px) => {
    const pier = new THREE.Mesh(pierGeo, steelMat);
    pier.position.set(px, 0.9, 0);
    pier.castShadow = true;
    root.add(pier);

    // Pier foundation footing collar
    const footing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.3, 16), new THREE.MeshStandardMaterial({
      color: 0xb0bec5,
      roughness: 0.9
    }));
    footing.position.set(px, 0.15, 0);
    root.add(footing);
  });

  // 2. Horizontal Torque Tube Axle (Rotates with Sun tracking)
  const torqueTubeGeo = new THREE.CylinderGeometry(0.11, 0.11, 6.4, 20);
  torqueTubeGeo.rotateZ(Math.PI / 2);
  const torqueTube = new THREE.Mesh(torqueTubeGeo, steelMat);
  torqueTube.position.set(0, 1.8, 0);
  torqueTube.castShadow = true;

  // Motor Slew Drive Gearbox in center
  const motorGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.45, 16);
  const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.6,
    roughness: 0.35
  }));
  motor.position.set(0, 1.8, 0);
  root.add(torqueTube, motor);

  // 3. Tilting Rafter Assembly (Pivots around torque tube X/Z axis)
  const tiltRafterGroup = new THREE.Group();
  tiltRafterGroup.position.set(0, 1.8, 0);

  // Cross purlin structural mounting rails
  const purlinGeo = new THREE.BoxGeometry(6.2, 0.08, 0.08);
  const purlinUpper = new THREE.Mesh(purlinGeo, aluFrameMat);
  purlinUpper.position.set(0, 0.08, 0.8);
  const purlinLower = new THREE.Mesh(purlinGeo, aluFrameMat);
  purlinLower.position.set(0, 0.08, -0.8);
  tiltRafterGroup.add(purlinUpper, purlinLower);

  // 4. 2 Rows x 4 Columns of Monocrystalline Solar PV Modules (8 Panels)
  const panelW = 1.45;
  const panelH = 1.05;
  const panelThick = 0.04;

  const panelFaceGeo = new THREE.PlaneGeometry(panelW - 0.04, panelH - 0.04);
  const panelFrameGeo = new THREE.BoxGeometry(panelW, panelThick, panelH);

  for (let c = 0; c < 4; c++) {
    const px = (c - 1.5) * (panelW + 0.06);

    // Upper Row Panel
    const frameUpper = new THREE.Mesh(panelFrameGeo, aluFrameMat);
    frameUpper.position.set(px, 0.12, 0.6);
    frameUpper.castShadow = true;

    const faceUpper = new THREE.Mesh(panelFaceGeo, pvCellMat);
    faceUpper.rotation.x = -Math.PI / 2;
    faceUpper.position.set(px, 0.12 + 0.021, 0.6);

    // Lower Row Panel
    const frameLower = new THREE.Mesh(panelFrameGeo, aluFrameMat);
    frameLower.position.set(px, 0.12, -0.6);
    frameLower.castShadow = true;

    const faceLower = new THREE.Mesh(panelFaceGeo, pvCellMat);
    faceLower.rotation.x = -Math.PI / 2;
    faceLower.position.set(px, 0.12 + 0.021, -0.6);

    tiltRafterGroup.add(frameUpper, faceUpper, frameLower, faceLower);
  }

  root.add(tiltRafterGroup);

  // 5. String Inverter Unit & DC Combiner box
  const inverterGeo = new THREE.BoxGeometry(0.7, 0.95, 0.35);
  const inverterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Clean Energy Blue
    metalness: 0.35,
    roughness: 0.3
  });
  const inverter = new THREE.Mesh(inverterGeo, inverterMat);
  inverter.position.set(2.4, 1.2, 0.3);
  inverter.castShadow = true;

  // Inverter Digital Telemetry Screen
  const screenGeo = new THREE.PlaneGeometry(0.3, 0.15);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(2.4, 1.45, 0.48);
  root.add(inverter, screen);

  return {
    group: root,
    tiltRafterGroup
  };
}

/**
 * Composite 3–12 Part CT/PT Metering Yard & Lightning Surge Mast
 */
export function createMeteringAndMastGroup(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'metering_mast_root';

  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0x3f1d0b,
    metalness: 0.15,
    roughness: 0.1,
    clearcoat: 1.0
  });

  const galvanizedMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.3
  });

  // Concrete Plinth
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.3, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.9 })
  );
  plinth.position.y = 0.15;
  plinth.receiveShadow = true;
  root.add(plinth);

  // 3x CT/PT Combined Instrument Transformers
  const ctGeo = createPorcelainInsulatorGeometry(1.6, 0.26, 0.1, 8);
  [-0.6, 0, 0.6].forEach((cx) => {
    const ct = new THREE.Mesh(ctGeo, ceramicMat);
    ct.position.set(cx, 0.3, 0);
    ct.castShadow = true;

    // Oil dome head
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), galvanizedMat);
    dome.position.set(cx, 1.9, 0);
    dome.castShadow = true;

    root.add(ct, dome);
  });

  // Lightning Surge Arrestor Mast (Air termination spike reaching 6.5m)
  const mastBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.5, 12), galvanizedMat);
  mastBase.position.set(0.9, 1.55, -0.6);

  const mastSpike = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.08, 4.0, 8), galvanizedMat);
  mastSpike.position.set(0.9, 4.5, -0.6);

  const copperTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.4, 8), new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.95,
    roughness: 0.15
  }));
  copperTip.position.set(0.9, 6.7, -0.6);

  root.add(mastBase, mastSpike, copperTip);

  return root;
}

/**
 * Yard Environment: Crushed Granite Bed, Safety Fence & Danger Signs
 */
export function createSwitchyardEnvironment(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'switchyard_environment';

  // 1. Crushed granite gravel ground surface (60m x 40m)
  const groundGeo = new THREE.PlaneGeometry(50, 40);
  const gravelTexture = createSwitchyardGravelTexture();
  const groundMat = new THREE.MeshStandardMaterial({
    map: gravelTexture,
    roughness: 0.85,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // 2. Galvanized Chain-link Security Fence Perimeter Posts
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.8,
    roughness: 0.35
  });

  const fenceLineZ = 10;
  const dangerSignTexture = createDangerSignTexture();
  const signGeo = new THREE.PlaneGeometry(1.6, 0.8);
  const signMat = new THREE.MeshBasicMaterial({
    map: dangerSignTexture,
    side: THREE.DoubleSide
  });

  for (let fx = -16; fx <= 16; fx += 4) {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(fx, 1.4, fenceLineZ);
    post.castShadow = true;
    root.add(post);
  }

  // Horizontal top rail
  const railGeo = new THREE.BoxGeometry(34, 0.06, 0.06);
  const rail = new THREE.Mesh(railGeo, postMat);
  rail.position.set(0, 2.7, fenceLineZ);
  root.add(rail);

  // Warning Danger Sign in front
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 1.6, fenceLineZ - 0.05);
  root.add(sign);

  return root;
}
