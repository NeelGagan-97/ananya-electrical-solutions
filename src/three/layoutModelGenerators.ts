import * as THREE from 'three';
import {
  ResidentialLayoutProject,
  InternalRoad,
  ResidentialPlot,
  ElectricalInfraComponent,
  CablingRoute
} from '../types/layoutDesigner';
import { createDangerSignTexture, createEarthChamberTexture } from './proceduralTextures';

export type LayoutViewMode = 'finished_layout' | 'infrastructure_xray' | 'construction_stage';

export interface GeneratedLayoutTwin {
  rootGroup: THREE.Group;
  streetLights: THREE.Light[];
  interactiveObjects: Map<string, THREE.Object3D>;
  animatedCables: { material: THREE.MeshStandardMaterial; baseColor: THREE.Color }[];
  update: (delta: number) => void;
  dispose: () => void;
}

export function generateLayout3DTwin(
  project: ResidentialLayoutProject,
  viewMode: LayoutViewMode,
  isNight: boolean
): GeneratedLayoutTwin {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ResidentialLayoutTwin';

  const interactiveObjects = new Map<string, THREE.Object3D>();
  const streetLights: THREE.Light[] = [];
  const animatedCables: { material: THREE.MeshStandardMaterial; baseColor: THREE.Color }[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  // Textures
  const dangerSignTex = createDangerSignTexture();
  const earthPitTex = createEarthChamberTexture();
  disposables.push(dangerSignTex, earthPitTex);

  // 1. Calculate Site Bounding Box & Center
  let minX = 0, maxX = 140, minZ = 0, maxZ = 120;
  if (project.boundary && project.boundary.length > 0) {
    minX = Math.min(...project.boundary.map((p) => p[0]));
    maxX = Math.max(...project.boundary.map((p) => p[0]));
    minZ = Math.min(...project.boundary.map((p) => p[1]));
    maxZ = Math.max(...project.boundary.map((p) => p[1]));
  }
  const siteW = maxX - minX;
  const siteL = maxZ - minZ;
  const centerX = minX + siteW / 2;
  const centerZ = minZ + siteL / 2;

  // Centering group so OrbitControls revolves around site center
  const siteGroup = new THREE.Group();
  siteGroup.position.set(-centerX, 0, -centerZ);
  rootGroup.add(siteGroup);

  const isXRay = viewMode === 'infrastructure_xray';
  const isConst = viewMode === 'construction_stage';
  const isEnergized = project.meta.isEnergized ?? true;

  // 2. Terrain Surface
  const terrainMargin = 25;
  const terrainGeo = new THREE.PlaneGeometry(siteW + terrainMargin * 2, siteL + terrainMargin * 2, 32, 32);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: isConst ? 0x92400e : isXRay ? 0x0f172a : 0x1f3f22, // Graded soil vs Dark X-Ray vs Lush Grass
    roughness: 0.9,
    metalness: 0.05,
    transparent: isXRay,
    opacity: isXRay ? 0.32 : 1.0,
    depthWrite: !isXRay
  });
  disposables.push(terrainGeo, terrainMat);
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.set(centerX, 0, centerZ);
  terrainMesh.receiveShadow = true;
  siteGroup.add(terrainMesh);

  // Perimeter compound wall
  const fenceH = 2.4;
  const perimeterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
  disposables.push(perimeterMat);
  const pCoords = project.boundary;
  for (let i = 0; i < pCoords.length; i++) {
    const p1 = pCoords[i];
    const p2 = pCoords[(i + 1) % pCoords.length];
    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dz * dz);
    const wallGeo = new THREE.BoxGeometry(0.35, fenceH, len);
    disposables.push(wallGeo);
    const wallMesh = new THREE.Mesh(wallGeo, perimeterMat);
    wallMesh.position.set((p1[0] + p2[0]) / 2, fenceH / 2, (p1[1] + p2[1]) / 2);
    wallMesh.rotation.y = Math.atan2(dx, dz);
    siteGroup.add(wallMesh);
  }

  // 3. Roads, Curbs, and Footpaths
  const roadMat = new THREE.MeshStandardMaterial({
    color: isConst ? 0x78716c : 0x1e293b,
    roughness: isConst ? 0.95 : 0.45,
    metalness: 0.1
  });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const footpathMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.6 });
  const paintWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  disposables.push(roadMat, curbMat, footpathMat, paintWhiteMat);

  project.roads.forEach((road) => {
    const dx = road.endPoint[0] - road.startPoint[0];
    const dz = road.endPoint[1] - road.startPoint[1];
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    const midX = (road.startPoint[0] + road.endPoint[0]) / 2;
    const midZ = (road.startPoint[1] + road.endPoint[1]) / 2;

    const roadGroup = new THREE.Group();
    roadGroup.position.set(midX, 0.04, midZ);
    roadGroup.rotation.y = angle;

    const w = road.widthMeters;
    const roadGeo = new THREE.BoxGeometry(w, 0.05, len);
    disposables.push(roadGeo);
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Left and Right Footpaths
    const fpW = road.footpathWidthMeters;
    const fpGeo = new THREE.BoxGeometry(fpW, 0.14, len);
    disposables.push(fpGeo);

    const fpLeft = new THREE.Mesh(fpGeo, footpathMat);
    fpLeft.position.set(-w / 2 - fpW / 2, 0.05, 0);
    roadGroup.add(fpLeft);

    const fpRight = new THREE.Mesh(fpGeo, footpathMat);
    fpRight.position.set(w / 2 + fpW / 2, 0.05, 0);
    roadGroup.add(fpRight);

    // Dashed White Markings
    if (!isConst) {
      const dashLen = 2.5;
      const gapLen = 2.0;
      const dashes = Math.floor(len / (dashLen + gapLen));
      for (let d = 0; d < dashes; d++) {
        const dashGeo = new THREE.PlaneGeometry(0.18, dashLen);
        disposables.push(dashGeo);
        const dash = new THREE.Mesh(dashGeo, paintWhiteMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.03, -len / 2 + d * (dashLen + gapLen) + dashLen / 2);
        roadGroup.add(dash);
      }
    }

    siteGroup.add(roadGroup);
  });

  // 4. Entrance Gateway Arch
  const archGroup = new THREE.Group();
  archGroup.position.set(2, 0, 60);

  const columnGeo = new THREE.BoxGeometry(1.2, 6.5, 1.2);
  const archBeamGeo = new THREE.BoxGeometry(1.2, 1.4, 15);
  const gateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  disposables.push(columnGeo, archBeamGeo, gateMat);

  const colLeft = new THREE.Mesh(columnGeo, gateMat);
  colLeft.position.set(0, 3.25, -6.5);
  archGroup.add(colLeft);

  const colRight = new THREE.Mesh(columnGeo, gateMat);
  colRight.position.set(0, 3.25, 6.5);
  archGroup.add(colRight);

  const archBeam = new THREE.Mesh(archBeamGeo, gateMat);
  archBeam.position.set(0, 6.5, 0);
  archGroup.add(archBeam);

  // Security Cabin & Boom Barrier
  const cabinGeo = new THREE.BoxGeometry(3.0, 3.0, 2.5);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
  disposables.push(cabinGeo, cabinMat);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.5, -9);
  archGroup.add(cabin);

  siteGroup.add(archGroup);

  // 5. Open Spaces & Landscaping (Central Park & Trees)
  project.openSpaces.forEach((sp) => {
    if (sp.type === 'park_green') {
      const parkGroup = new THREE.Group();
      parkGroup.position.set(sp.x + sp.width / 2, 0.06, sp.z + sp.length / 2);

      const parkLawnGeo = new THREE.BoxGeometry(sp.width, 0.08, sp.length);
      const parkLawnMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
      disposables.push(parkLawnGeo, parkLawnMat);
      const parkLawn = new THREE.Mesh(parkLawnGeo, parkLawnMat);
      parkGroup.add(parkLawn);

      // Gazebo
      const gazeboGeo = new THREE.CylinderGeometry(4.0, 4.0, 0.3, 8);
      const roofGeo = new THREE.ConeGeometry(5.0, 2.5, 8);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      disposables.push(gazeboGeo, roofGeo, roofMat);
      const gazeboPlinth = new THREE.Mesh(gazeboGeo, footpathMat);
      gazeboPlinth.position.y = 0.15;
      parkGroup.add(gazeboPlinth);

      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 3.6;
      parkGroup.add(roof);

      // Gazebo Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.2, 12);
      disposables.push(pillarGeo);
      for (let p = 0; p < 4; p++) {
        const rad = (p * Math.PI) / 2;
        const pil = new THREE.Mesh(pillarGeo, gateMat);
        pil.position.set(Math.cos(rad) * 2.8, 1.6, Math.sin(rad) * 2.8);
        parkGroup.add(pil);
      }

      // Shaded Trees in corners
      const treeTrunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 3.5, 8);
      const treeFoliageGeo = new THREE.SphereGeometry(2.2, 8, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
      disposables.push(treeTrunkGeo, treeFoliageGeo, trunkMat, foliageMat);

      const treeOffsets = [
        [-sp.width / 2 + 5, -sp.length / 2 + 5],
        [sp.width / 2 - 5, -sp.length / 2 + 5],
        [-sp.width / 2 + 5, sp.length / 2 - 5],
        [sp.width / 2 - 5, sp.length / 2 - 5]
      ];

      treeOffsets.forEach(([tx, tz]) => {
        const treeGrp = new THREE.Group();
        treeGrp.position.set(tx, 0, tz);

        const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
        trunk.position.y = 1.75;
        treeGrp.add(trunk);

        const foliage = new THREE.Mesh(treeFoliageGeo, foliageMat);
        foliage.position.y = 4.5;
        treeGrp.add(foliage);

        parkGroup.add(treeGrp);
      });

      siteGroup.add(parkGroup);
    }
  });

  // 6. Residential Plots & Villas (with Service Entry Points)
  project.plots.forEach((plot) => {
    const plotGrp = new THREE.Group();
    plotGrp.position.set(plot.x + plot.width / 2, 0.05, plot.z + plot.length / 2);
    plotGrp.name = `plot_${plot.id}`;

    // Plot lawn base
    const plotLawnGeo = new THREE.BoxGeometry(plot.width - 0.4, 0.06, plot.length - 0.4);
    const plotLawnMat = new THREE.MeshStandardMaterial({
      color: plot.hasBuilding ? 0x22c55e : 0xa3e635,
      roughness: 0.9
    });
    disposables.push(plotLawnGeo, plotLawnMat);
    const plotLawn = new THREE.Mesh(plotLawnGeo, plotLawnMat);
    plotGrp.add(plotLawn);

    // Corner boundary survey stones
    const stoneGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 8);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    disposables.push(stoneGeo, stoneMat);
    const hw = plot.width / 2 - 0.2;
    const hl = plot.length / 2 - 0.2;
    [
      [-hw, -hl], [hw, -hl], [-hw, hl], [hw, hl]
    ].forEach(([sx, sz]) => {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(sx, 0.3, sz);
      plotGrp.add(stone);
    });

    // 3D Residential Villa
    if (plot.hasBuilding && !isConst) {
      const villaGrp = new THREE.Group();
      const bW = plot.width * 0.72;
      const bL = plot.length * 0.68;
      const floorH = 3.2;

      // Ground Floor
      const gfGeo = new THREE.BoxGeometry(bW, floorH, bL);
      const villaWallMat = new THREE.MeshStandardMaterial({
        color: plot.buildingType === 'villa_modern' ? 0xf8fafc : 0xfef3c7,
        roughness: 0.7,
        transparent: isXRay,
        opacity: isXRay ? 0.35 : 1.0
      });
      disposables.push(gfGeo, villaWallMat);
      const gf = new THREE.Mesh(gfGeo, villaWallMat);
      gf.position.y = floorH / 2;
      villaGrp.add(gf);

      // First Floor
      const ffGeo = new THREE.BoxGeometry(bW * 0.88, floorH * 0.95, bL * 0.85);
      disposables.push(ffGeo);
      const ff = new THREE.Mesh(ffGeo, villaWallMat);
      ff.position.set(0, floorH + (floorH * 0.95) / 2, 0);
      villaGrp.add(ff);

      // Glass Windows with Night Warm Glow
      const winGeo = new THREE.BoxGeometry(bW * 0.35, 1.2, 0.1);
      const winMat = new THREE.MeshStandardMaterial({
        color: isNight ? 0xfef08a : 0x38bdf8,
        emissive: isNight ? 0xf59e0b : 0x000000,
        emissiveIntensity: isNight ? 0.75 : 0.0,
        roughness: 0.1,
        metalness: 0.2
      });
      disposables.push(winGeo, winMat);
      const winFront = new THREE.Mesh(winGeo, winMat);
      winFront.position.set(0, 1.8, bL / 2 + 0.06);
      villaGrp.add(winFront);

      // Residential Service Entry Meter Box (Section 7.B)
      const meterBoxGeo = new THREE.BoxGeometry(0.3, 0.45, 0.15);
      const meterBoxMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      disposables.push(meterBoxGeo, meterBoxMat);
      const meterBox = new THREE.Mesh(meterBoxGeo, meterBoxMat);
      meterBox.position.set(bW / 2 - 0.4, 1.4, bL / 2 + 0.08);
      villaGrp.add(meterBox);

      plotGrp.add(villaGrp);
    }

    interactiveObjects.set(plot.id, plotGrp);
    siteGroup.add(plotGrp);
  });

  // 7. Electrical Infrastructure Models (Section 7 & 9)
  project.infra.forEach((item) => {
    const itemGrp = new THREE.Group();
    itemGrp.position.set(item.x, 0.05, item.z);
    itemGrp.name = `infra_${item.id}`;

    const isExisting = item.status === 'existing';
    const isToRemove = item.status === 'removed' || item.status === 'existing_to_remove';
    const isProposed = item.status === 'proposed' || item.status === 'proposed_new';

    // State Color coding
    const stateAccentColor = isToRemove ? 0xef4444 : isProposed ? 0x0284c7 : 0x64748b;

    if (item.type === 'package_substation') {
      // 11kV/415V Pad-Mounted Package Substation (DTR)
      const plinthGeo = new THREE.BoxGeometry(5.2, 0.5, 4.2);
      const plinthMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      disposables.push(plinthGeo, plinthMat);
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = 0.25;
      itemGrp.add(plinth);

      // Heavy Metal Housing Enclosure
      const encGeo = new THREE.BoxGeometry(4.4, 2.8, 3.4);
      const encMat = new THREE.MeshStandardMaterial({
        color: isProposed ? 0x1e3a8a : 0x334155,
        metalness: 0.75,
        roughness: 0.35
      });
      disposables.push(encGeo, encMat);
      const enc = new THREE.Mesh(encGeo, encMat);
      enc.position.y = 0.5 + 1.4;
      itemGrp.add(enc);

      // Radiator Fins on backside
      const finMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      disposables.push(finMat);
      for (let f = 0; f < 8; f++) {
        const finGeo = new THREE.BoxGeometry(0.08, 1.8, 0.6);
        disposables.push(finGeo);
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(-1.6 + f * 0.45, 1.8, -1.9);
        itemGrp.add(fin);
      }

      // Danger Sign Placard
      const signGeo = new THREE.PlaneGeometry(0.8, 0.5);
      const signMat = new THREE.MeshBasicMaterial({ map: dangerSignTex });
      disposables.push(signGeo, signMat);
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 2.0, 1.72);
      itemGrp.add(sign);

      // Surrounding Security Chainlink Posts
      const fencePostMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      disposables.push(fencePostMat);
      [[-3.2, -2.6], [3.2, -2.6], [3.2, 2.6], [-3.2, 2.6]].forEach(([fx, fz]) => {
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8);
        disposables.push(postGeo);
        const post = new THREE.Mesh(postGeo, fencePostMat);
        post.position.set(fx, 1.2, fz);
        itemGrp.add(post);
      });
    } else if (item.type === 'feeder_pillar') {
      // 400A Low Voltage Feeder Distribution Pillar (Section 7.A)
      const fpPlinthGeo = new THREE.BoxGeometry(1.2, 0.4, 0.6);
      const fpPlinthMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      disposables.push(fpPlinthGeo, fpPlinthMat);
      const plinth = new THREE.Mesh(fpPlinthGeo, fpPlinthMat);
      plinth.position.y = 0.2;
      itemGrp.add(plinth);

      const fpBodyGeo = new THREE.BoxGeometry(1.0, 1.4, 0.45);
      const fpBodyMat = new THREE.MeshStandardMaterial({
        color: isProposed ? 0x0369a1 : 0x475569,
        metalness: 0.8,
        roughness: 0.3
      });
      disposables.push(fpBodyGeo, fpBodyMat);
      const body = new THREE.Mesh(fpBodyGeo, fpBodyMat);
      body.position.y = 0.4 + 0.7;
      itemGrp.add(body);

      // Sloped Weather Canopy
      const canopyGeo = new THREE.BoxGeometry(1.15, 0.08, 0.55);
      disposables.push(canopyGeo);
      const canopy = new THREE.Mesh(canopyGeo, fpBodyMat);
      canopy.position.y = 1.84;
      canopy.rotation.x = 0.08;
      itemGrp.add(canopy);
    } else if (item.type === 'street_light_pole') {
      // 7m Octagonal Street Light Pole (Section 7.C)
      const poleGeo = new THREE.CylinderGeometry(0.09, 0.16, 7.0, 8);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25
      });
      disposables.push(poleGeo, poleMat);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.5;
      itemGrp.add(pole);

      // Outreach Bracket
      const bracketGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
      disposables.push(bracketGeo);
      const bracket = new THREE.Mesh(bracketGeo, poleMat);
      bracket.position.set(0.6, 6.8, 0);
      bracket.rotation.z = Math.PI / 3;
      itemGrp.add(bracket);

      // Aerodynamic LED Luminaire Head
      const headGeo = new THREE.BoxGeometry(0.7, 0.1, 0.28);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
      disposables.push(headGeo, headMat);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(1.4, 7.2, 0);
      itemGrp.add(head);

      // Nighttime Visible Illumination Cones & Ground Light Pools
      if (isNight) {
        const ledLight = new THREE.SpotLight(0xfff7ed, 4.5, 20, Math.PI / 4, 0.45, 1.5);
        ledLight.position.set(1.4, 7.0, 0);
        ledLight.target.position.set(1.4, 0, 0);
        itemGrp.add(ledLight);
        itemGrp.add(ledLight.target);
        streetLights.push(ledLight);

        // Ground illumination disc
        const discGeo = new THREE.CircleGeometry(5.0, 16);
        const discMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.18
        });
        disposables.push(discGeo, discMat);
        const disc = new THREE.Mesh(discGeo, discMat);
        disc.rotation.x = -Math.PI / 2;
        disc.position.set(1.4, 0.05, 0);
        itemGrp.add(disc);
      }
    } else if (item.type === 'existing_overhead_pole') {
      // Concrete RSJ Pole with Cross-arms & Insulators (Section 7.A & 9)
      const oldPoleGeo = new THREE.BoxGeometry(0.22, 8.0, 0.22);
      const oldPoleMat = new THREE.MeshStandardMaterial({
        color: isToRemove ? 0xef4444 : 0x78716c,
        roughness: 0.95,
        transparent: isToRemove,
        opacity: isToRemove ? 0.65 : 1.0
      });
      disposables.push(oldPoleGeo, oldPoleMat);
      const oldPole = new THREE.Mesh(oldPoleGeo, oldPoleMat);
      oldPole.position.y = 4.0;
      itemGrp.add(oldPole);

      const armGeo = new THREE.BoxGeometry(1.6, 0.1, 0.1);
      disposables.push(armGeo);
      const arm = new THREE.Mesh(armGeo, oldPoleMat);
      arm.position.y = 7.5;
      itemGrp.add(arm);

      // Ceramic pin insulators
      const insGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8);
      const insMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.2 });
      disposables.push(insGeo, insMat);
      [-0.6, 0, 0.6].forEach((ix) => {
        const ins = new THREE.Mesh(insGeo, insMat);
        ins.position.set(ix, 7.65, 0);
        itemGrp.add(ins);
      });
    } else if (item.type === 'pull_pit_chamber') {
      // Precast Concrete Inspection Pull Pit (Section 7.A)
      const pitGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
      const pitMat = new THREE.MeshStandardMaterial({ map: earthPitTex, roughness: 0.7 });
      disposables.push(pitGeo, pitMat);
      const pit = new THREE.Mesh(pitGeo, pitMat);
      pit.position.y = 0.05;
      itemGrp.add(pit);
    } else if (item.type === 'earth_pit_grid') {
      // Chemical Earthing Electrode Pit (Section 7.D)
      const epGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
      const epMat = new THREE.MeshStandardMaterial({ map: earthPitTex, roughness: 0.7 });
      disposables.push(epGeo, epMat);
      const ep = new THREE.Mesh(epGeo, epMat);
      ep.position.y = 0.04;
      itemGrp.add(ep);

      // Green earth bonding strip
      const stripGeo = new THREE.BoxGeometry(0.04, 0.01, 2.5);
      const stripMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
      disposables.push(stripGeo, stripMat);
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(0, 0.02, 1.25);
      itemGrp.add(strip);
    }

    interactiveObjects.set(item.id, itemGrp);
    siteGroup.add(itemGrp);
  });

  // 8. Underground & Overhead Cabling (Section 7.A, 8 & 10)
  project.cabling.forEach((route) => {
    if (route.waypoints.length < 2) return;

    const isHT = route.cableClass === 'ht_11kv_underground';
    const isOverhead = route.cableClass === 'existing_overhead_conductor';
    const isToRemove = route.status === 'removed';

    // In finished view, hide underground cables; in X-Ray / construction, make them visible
    if (!isOverhead && !isXRay && !isConst) return;

    const cableY = isOverhead ? 7.65 : isXRay ? -0.8 : 0.08;
    const pts = route.waypoints.map(([wx, wz]) => new THREE.Vector3(wx, cableY, wz));
    const curve = new THREE.CatmullRomCurve3(pts);
    const radius = isHT ? 0.12 : isOverhead ? 0.04 : 0.08;
    const tubeGeo = new THREE.TubeGeometry(curve, 32, radius, 8, false);

    const baseColorHex = isToRemove ? 0xef4444 : isHT ? 0xdc2626 : isOverhead ? 0x64748b : 0x0284c7;
    const emissiveHex = isEnergized && !isToRemove ? (isHT ? 0xef4444 : 0x00f0ff) : 0x000000;

    const cableMat = new THREE.MeshStandardMaterial({
      color: baseColorHex,
      emissive: emissiveHex,
      emissiveIntensity: isEnergized && !isToRemove ? 0.8 : 0.0,
      roughness: 0.3,
      transparent: isToRemove,
      opacity: isToRemove ? 0.5 : 1.0
    });

    disposables.push(tubeGeo, cableMat);
    const tube = new THREE.Mesh(tubeGeo, cableMat);
    siteGroup.add(tube);

    if (isEnergized && !isToRemove) {
      animatedCables.push({
        material: cableMat,
        baseColor: new THREE.Color(baseColorHex)
      });
    }
  });

  // 9. Update loop with Animated Power-Flow Pulsing (Section 8)
  let elapsed = 0;
  const update = (delta: number) => {
    elapsed += delta;
    if (animatedCables.length > 0) {
      const pulse = 0.7 + Math.sin(elapsed * 4.0) * 0.3;
      animatedCables.forEach((c) => {
        c.material.emissiveIntensity = pulse;
      });
    }
  };

  const dispose = () => {
    disposables.forEach((d) => {
      if ('dispose' in d) {
        d.dispose();
      }
    });
  };

  return {
    rootGroup,
    streetLights,
    interactiveObjects,
    animatedCables,
    update,
    dispose
  };
}
