import {
  ResidentialLayoutProject,
  CablingRoute,
  ResidentialPlot,
  ElectricalInfraComponent,
  InternalRoad,
  NetworkValidationIssue
} from '../../types/layoutDesigner';

export interface RoutingEngineResult {
  routes: CablingRoute[];
  issues: NetworkValidationIssue[];
  totalHtLengthMeters: number;
  totalLtLengthMeters: number;
  totalStreetlightCableMeters: number;
  disconnectedPlotCount: number;
}

/**
 * Geometric helper: find point projection on line segment
 */
function projectPointOnSegment(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): { x: number; z: number; t: number; distSq: number } {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) {
    const ddx = px - ax;
    const ddz = pz - az;
    return { x: ax, z: az, t: 0, distSq: ddx * ddx + ddz * ddz };
  }
  let t = ((px - ax) * dx + (pz - az) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * dx;
  const projZ = az + t * dz;
  const distSq = (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ);
  return { x: projX, z: projZ, t, distSq };
}

/**
 * Generates utility corridor routes along roads for substation, feeder pillars, streetlights, and plot connections
 */
export function generateUtilityCorridorRoutes(
  project: ResidentialLayoutProject
): RoutingEngineResult {
  const issues: NetworkValidationIssue[] = [];
  const generatedRoutes: CablingRoute[] = [];

  const substation = project.infra.find((i) => i.type === 'package_substation');
  const feederPillars = project.infra.filter((i) => i.type === 'feeder_pillar');
  const streetlights = project.infra.filter((i) => i.type === 'street_light_pole');

  if (!substation) {
    issues.push({
      id: 'iss_no_substation',
      severity: 'error',
      title: 'Missing Substation',
      description: 'No 11kV/415V distribution transformer (DTR) found. Please place a package substation.'
    });
    return {
      routes: project.cabling,
      issues,
      totalHtLengthMeters: 0,
      totalLtLengthMeters: 0,
      totalStreetlightCableMeters: 0,
      disconnectedPlotCount: project.plots.length
    };
  }

  // 1. HT 11kV Incomer & Ring Route
  // Route from site perimeter entrance to package substation
  const htIncomerPoint: [number, number] = [-65, 0];
  const htWaypoints: [number, number][] = [
    htIncomerPoint,
    [-65, substation.z],
    [substation.x, substation.z]
  ];

  let htLen = 0;
  for (let i = 0; i < htWaypoints.length - 1; i++) {
    const dx = htWaypoints[i + 1][0] - htWaypoints[i][0];
    const dz = htWaypoints[i + 1][1] - htWaypoints[i][1];
    htLen += Math.sqrt(dx * dx + dz * dz);
  }

  generatedRoutes.push({
    id: `ht_incomer_${Date.now()}`,
    name: '11kV HT Primary Incomer Loop',
    cableClass: 'ht_11kv_underground',
    spec: '11kV 3C x 300 sq.mm XLPE Al Armoured',
    waypoints: htWaypoints,
    lengthMeters: Math.round(htLen),
    status: 'proposed_new',
    installationMethod: 'rcc_trench',
    sourceEquipmentId: 'eb_11kv_grid_incomer',
    targetEquipmentId: substation.id,
    operatingVoltage: '11,000 V',
    ratedCurrentAmps: 450
  });

  // 2. LT Main Spine Distribution Feeders (Substation to Feeder Pillars along Road Utility Corridors)
  // Find nearest road to substation
  const mainRoad = project.roads.find((r) => r.type === 'main_spine_12m') || project.roads[0];

  feederPillars.forEach((fp, idx) => {
    // Determine path along road reserve
    const subProj = mainRoad
      ? projectPointOnSegment(
          substation.x,
          substation.z,
          mainRoad.startPoint[0],
          mainRoad.startPoint[1],
          mainRoad.endPoint[0],
          mainRoad.endPoint[1]
        )
      : { x: substation.x, z: substation.z };

    const fpProj = mainRoad
      ? projectPointOnSegment(
          fp.x,
          fp.z,
          mainRoad.startPoint[0],
          mainRoad.startPoint[1],
          mainRoad.endPoint[0],
          mainRoad.endPoint[1]
        )
      : { x: fp.x, z: fp.z };

    // Utility corridor offset (1.5m offset from road curb)
    const waypoints: [number, number][] = [
      [substation.x, substation.z],
      [subProj.x, subProj.z],
      [fpProj.x, fpProj.z],
      [fp.x, fp.z]
    ];

    let len = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1][0] - waypoints[i][0];
      const dz = waypoints[i + 1][1] - waypoints[i][1];
      len += Math.sqrt(dx * dx + dz * dz);
    }

    generatedRoutes.push({
      id: `lt_feeder_${idx + 1}`,
      name: `LT Main Feeder Run to ${fp.name}`,
      cableClass: 'lt_underground_armoured',
      spec: '1.1kV 3.5C x 240 sq.mm XLPE Al Armoured',
      waypoints,
      lengthMeters: Math.round(len),
      status: 'proposed_new',
      installationMethod: 'direct_buried',
      sourceEquipmentId: substation.id,
      targetEquipmentId: fp.id,
      operatingVoltage: '415 V',
      ratedCurrentAmps: 340
    });
  });

  // 3. Streetlight Circuit Route along Road Margins
  if (streetlights.length > 1) {
    // Sort streetlights along x axis
    const sortedLights = [...streetlights].sort((a, b) => a.x - b.x);
    const slWaypoints: [number, number][] = sortedLights.map((sl) => [sl.x, sl.z]);

    let slLen = 0;
    for (let i = 0; i < slWaypoints.length - 1; i++) {
      const dx = slWaypoints[i + 1][0] - slWaypoints[i][0];
      const dz = slWaypoints[i + 1][1] - slWaypoints[i][1];
      slLen += Math.sqrt(dx * dx + dz * dz);
    }

    generatedRoutes.push({
      id: `sl_circuit_loop`,
      name: 'Street Lighting Dedicated Loop Circuit',
      cableClass: 'street_lighting_cable',
      spec: '1.1kV 4C x 10 sq.mm Copper Armoured',
      waypoints: slWaypoints,
      lengthMeters: Math.round(slLen),
      status: 'proposed_new',
      installationMethod: 'hdpe_dwc_duct',
      sourceEquipmentId: feederPillars[0]?.id || substation.id,
      operatingVoltage: '230 V',
      ratedCurrentAmps: 63
    });
  }

  // 4. Check for Disconnected Plots or Boundary Violations
  let disconnectedCount = 0;
  project.plots.forEach((p) => {
    if (!p.serviceConnection || p.serviceConnection.status === 'disconnected') {
      disconnectedCount++;
      issues.push({
        id: `iss_plot_${p.id}`,
        severity: 'warning',
        title: `Unrouted Plot ${p.plotNumber}`,
        description: `Plot ${p.plotNumber} is not assigned to an active Feeder Pillar corridor.`,
        associatedId: p.id
      });
    }

    // Check voltage drop
    if ((p.serviceConnection?.calculatedDropVoltageLossPercent || 0) > 3.0) {
      issues.push({
        id: `iss_vdrop_${p.id}`,
        severity: 'warning',
        title: `High Voltage Drop at Plot ${p.plotNumber}`,
        description: `Calculated drop (${p.serviceConnection?.calculatedDropVoltageLossPercent}%) exceeds IS:732 recommended 3.0% threshold.`,
        associatedId: p.id
      });
    }
  });

  // Calculate totals
  let totalHt = 0;
  let totalLt = 0;
  let totalSl = 0;

  generatedRoutes.forEach((r) => {
    if (r.cableClass === 'ht_11kv_underground') totalHt += r.lengthMeters;
    else if (r.cableClass === 'lt_underground_armoured') totalLt += r.lengthMeters;
    else if (r.cableClass === 'street_lighting_cable') totalSl += r.lengthMeters;
  });

  return {
    routes: generatedRoutes,
    issues,
    totalHtLengthMeters: totalHt,
    totalLtLengthMeters: totalLt,
    totalStreetlightCableMeters: totalSl,
    disconnectedPlotCount: disconnectedCount
  };
}
