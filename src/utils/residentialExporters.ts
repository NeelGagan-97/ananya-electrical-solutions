import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { ResidentialProject } from '../types/residentialDesigner';

/**
 * Generates an AutoCAD R12/2000 compatible multi-layer DXF file from the 2BHK Residential Project
 * including architectural walls, doors/windows, concealed PVC conduit runs, and electrical symbols.
 */
export function exportProjectToDxf(project: ResidentialProject): void {
  const lines: string[] = [];

  const push = (code: number, value: string | number) => {
    lines.push(String(code));
    lines.push(String(value));
  };

  // 1. HEADER SECTION
  push(0, 'SECTION');
  push(2, 'HEADER');
  push(9, '$ACADVER');
  push(1, 'AC1009'); // AutoCAD R12 DXF for universal CAD compatibility
  push(9, '$INSUNITS');
  push(70, 6); // Meters
  push(0, 'ENDSEC');

  // 2. TABLES SECTION (Layers)
  push(0, 'SECTION');
  push(2, 'TABLES');
  push(0, 'TABLE');
  push(2, 'LAYER');
  push(70, 8);

  const layers = [
    { name: 'A-WALL', color: 7 },          // White/Black
    { name: 'A-OPENING', color: 8 },       // Gray
    { name: 'A-ROOM-LABEL', color: 5 },    // Blue
    { name: 'E-DB', color: 30 },           // Orange
    { name: 'E-CONDUIT-LIGHT', color: 1 }, // Red
    { name: 'E-CONDUIT-POWER', color: 2 }, // Yellow
    { name: 'E-CONDUIT-AC', color: 6 },    // Magenta
    { name: 'E-EARTH', color: 3 },         // Green
    { name: 'E-FIXTURES', color: 4 }       // Cyan
  ];

  layers.forEach((layer) => {
    push(0, 'LAYER');
    push(2, layer.name);
    push(70, 0);
    push(62, layer.color);
    push(6, 'CONTINUOUS');
  });

  push(0, 'ENDTAB');
  push(0, 'ENDSEC');

  // Helper functions for DXF entities (flipping Z to -Y so North is +Y in 2D CAD)
  const addLine = (layer: string, x1: number, z1: number, x2: number, z2: number) => {
    push(0, 'LINE');
    push(8, layer);
    push(10, x1.toFixed(3));
    push(20, (-z1).toFixed(3));
    push(30, '0.0');
    push(11, x2.toFixed(3));
    push(21, (-z2).toFixed(3));
    push(31, '0.0');
  };

  const addRect = (layer: string, x: number, z: number, w: number, l: number) => {
    addLine(layer, x, z, x + w, z);
    addLine(layer, x + w, z, x + w, z + l);
    addLine(layer, x + w, z + l, x, z + l);
    addLine(layer, x, z + l, x, z);
  };

  const addCircle = (layer: string, x: number, z: number, radius: number) => {
    push(0, 'CIRCLE');
    push(8, layer);
    push(10, x.toFixed(3));
    push(20, (-z).toFixed(3));
    push(30, '0.0');
    push(40, radius.toFixed(3));
  };

  const addText = (layer: string, x: number, z: number, height: number, text: string) => {
    push(0, 'TEXT');
    push(8, layer);
    push(10, x.toFixed(3));
    push(20, (-z).toFixed(3));
    push(30, '0.0');
    push(40, height.toFixed(3));
    push(1, text.replace(/[^\x20-\x7E]/g, ''));
  };

  // 3. ENTITIES SECTION
  push(0, 'SECTION');
  push(2, 'ENTITIES');

  // Title Block
  addText('A-ROOM-LABEL', 0, -2.8, 0.25, `ANANYA ELECTRICAL SOLUTIONS - ${project.meta.projectName.toUpperCase()}`);
  addText('A-ROOM-LABEL', 0, -2.4, 0.14, `IS:732 & NBC 2016 COMPLIANT | SUPPLY: ${project.meta.supplyPhase} | LOAD: ${project.meta.sanctionedLoadKw} kW`);

  // Rooms & Double-Line Walls
  const wallT = project.meta.interiorWallThickness || 0.115;
  project.rooms.forEach((room) => {
    addRect('A-WALL', room.x, room.z, room.width, room.length);
    addRect('A-WALL', room.x + wallT, room.z + wallT, room.width - wallT * 2, room.length - wallT * 2);

    // Room name & dimensions label
    const cx = room.x + room.width / 2 - 0.8;
    const cz = room.z + room.length / 2;
    addText('A-ROOM-LABEL', cx, cz - 0.15, 0.16, room.name.toUpperCase());
    addText('A-ROOM-LABEL', cx, cz + 0.15, 0.12, `${room.width.toFixed(1)}m x ${room.length.toFixed(1)}m`);
  });

  // Doors & Windows
  project.openings.forEach((op) => {
    const room = project.rooms.find((r) => r.id === op.roomId);
    if (!room) return;
    let ox = room.x;
    let oz = room.z;
    if (op.wallDirection === 'north') {
      ox = room.x + op.offset;
      oz = room.z;
      addRect('A-OPENING', ox, oz - 0.06, op.width, 0.12);
    } else if (op.wallDirection === 'south') {
      ox = room.x + op.offset;
      oz = room.z + room.length;
      addRect('A-OPENING', ox, oz - 0.06, op.width, 0.12);
    } else if (op.wallDirection === 'west') {
      ox = room.x;
      oz = room.z + op.offset;
      addRect('A-OPENING', ox - 0.06, oz, 0.12, op.width);
    } else if (op.wallDirection === 'east') {
      ox = room.x + room.width;
      oz = room.z + op.offset;
      addRect('A-OPENING', ox - 0.06, oz, 0.12, op.width);
    }
  });

  // Electrical Points & Symbols
  project.electricalPoints.forEach((pt) => {
    const layer = pt.type === 'db' ? 'E-DB' : pt.type === 'earth_pit' ? 'E-EARTH' : 'E-FIXTURES';
    if (pt.type === 'db') {
      addRect('E-DB', pt.x - 0.22, pt.z - 0.1, 0.45, 0.2);
      addText('E-DB', pt.x - 0.2, pt.z - 0.25, 0.11, `MAIN DB (${pt.name})`);
    } else if (pt.type === 'ceiling_fan') {
      addCircle(layer, pt.x, pt.z, 0.45);
      addCircle(layer, pt.x, pt.z, 0.1);
      addText(layer, pt.x - 0.2, pt.z + 0.05, 0.09, 'FAN');
    } else if (pt.type === 'downlight_led') {
      addCircle(layer, pt.x, pt.z, 0.12);
      addLine(layer, pt.x - 0.12, pt.z, pt.x + 0.12, pt.z);
      addLine(layer, pt.x, pt.z - 0.12, pt.x, pt.z + 0.12);
    } else {
      addRect(layer, pt.x - 0.1, pt.z - 0.08, 0.2, 0.16);
      addText(layer, pt.x + 0.14, pt.z, 0.08, pt.name.slice(0, 22));
    }
  });

  // Orthogonal Conduit Runs from Main DB
  const dbPt = project.electricalPoints.find((p) => p.type === 'db');
  if (dbPt) {
    project.circuits.forEach((circ) => {
      let layer = 'E-CONDUIT-LIGHT';
      if (circ.id.includes('power') || circ.id.includes('kitchen')) layer = 'E-CONDUIT-POWER';
      else if (circ.id.includes('ac') || circ.id.includes('geyser')) layer = 'E-CONDUIT-AC';
      else if (circ.id.includes('earth')) layer = 'E-EARTH';

      circ.connectedPointIds.forEach((ptId) => {
        const target = project.electricalPoints.find((p) => p.id === ptId);
        if (!target || target.id === dbPt.id) return;
        // Orthogonal L-routing in 2D plan
        addLine(layer, dbPt.x, dbPt.z, target.x, dbPt.z);
        addLine(layer, target.x, dbPt.z, target.x, target.z);
      });
    });
  }

  push(0, 'ENDSEC');
  push(0, 'EOF');

  const dxfContent = lines.join('\r\n');
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.meta.projectName.replace(/\s+/g, '_')}_IS732_Electrical_Plan.dxf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exports the live Three.js 3D Apartment & Electrical Twin to binary .glb or JSON .gltf
 */
export function exportSceneToGltf(
  rootObject: THREE.Object3D | null,
  projectName: string,
  binary: boolean = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!rootObject) {
      reject(new Error('3D Scene is not ready for export.'));
      return;
    }

    const exporter = new GLTFExporter();
    const safeName = projectName.replace(/\s+/g, '_');

    exporter.parse(
      rootObject,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeName}_2BHK_BIM_Model.glb`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          const output = JSON.stringify(result, null, 2);
          const blob = new Blob([output], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeName}_2BHK_BIM_Model.gltf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
        resolve();
      },
      (error) => {
        console.error('GLTF Export Error:', error);
        reject(error);
      },
      { binary }
    );
  });
}
