import * as THREE from 'three';

/**
 * Procedural texture generators for zero-dependency, 100% offline 3D rendering.
 * All textures set SRGBColorSpace for color maps and configured anisotropy.
 */

export function createSolarCellTexture(maxAnisotropy: number = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep anti-reflective photovoltaic blue base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#0a1d37');
    grad.addColorStop(0.5, '#071529');
    grad.addColorStop(1, '#0c2242');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Silicon wafer subtle crystalline texture
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 4 + Math.random() * 12;
      const h = 4 + Math.random() * 12;
      ctx.fillStyle = `rgba(18, 48, 88, ${0.1 + Math.random() * 0.15})`;
      ctx.fillRect(x, y, w, h);
    }

    // Grid of solar cells (6 columns x 10 rows per module)
    const cols = 6;
    const rows = 10;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;

        // Cell border gap
        ctx.strokeStyle = '#020b18';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Chamfered diamond cell corners (monocrystalline wafer signature)
        ctx.fillStyle = '#020b18';
        const chamfer = 3;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + 1 + chamfer, y + 1);
        ctx.lineTo(x + 1, y + 1 + chamfer);
        ctx.fill();

        // Silver busbars (3 main vertical busbars per cell)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.0;
        for (let b = 1; b <= 3; b++) {
          const bx = x + (b * cellW) / 4;
          ctx.beginPath();
          ctx.moveTo(bx, y + 1);
          ctx.lineTo(bx, y + cellH - 1);
          ctx.stroke();
        }

        // Micro-fingers (horizontal fine silver lines)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 0.5;
        for (let f = 4; f < cellH - 2; f += 6) {
          ctx.beginPath();
          ctx.moveTo(x + 2, y + f);
          ctx.lineTo(x + cellW - 2, y + f);
          ctx.stroke();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(maxAnisotropy, 8);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createDangerSignTexture(maxAnisotropy: number = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Industrial safety yellow background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 256);

    // Red warning border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 244);

    // Black header banner
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(14, 14, 484, 60);

    // "DANGER" in white
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DANGER / ಅಪಾಯ', 256, 44);

    // High Voltage details in bold black
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('33,000 VOLTS', 256, 115);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ANANYA ELECTRICAL SOLUTIONS', 256, 162);

    ctx.font = '16px monospace';
    ctx.fillText('BESCOM & CEIG STATUTORY APPROVED', 256, 196);
    ctx.fillText('STRICTLY AUTHORIZED PERSONNEL ONLY', 256, 222);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(maxAnisotropy, 8);
  return texture;
}

export function createTransformerGaugeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Outer dial bezel
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    // Dial face
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 116, 0, Math.PI * 2);
    ctx.fill();

    // Colored arc zones: Green (Normal 20-70C), Amber (70-90C), Red (Trip >90C)
    ctx.lineWidth = 10;

    // Green zone
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(128, 128, 96, Math.PI * 0.75, Math.PI * 1.5);
    ctx.stroke();

    // Amber zone
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(128, 128, 96, Math.PI * 1.5, Math.PI * 1.85);
    ctx.stroke();

    // Red zone
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(128, 128, 96, Math.PI * 1.85, Math.PI * 2.25);
    ctx.stroke();

    // Dial label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OIL TEMP °C', 128, 80);
    ctx.font = '14px sans-serif';
    ctx.fillText('62 °C (NOMINAL)', 128, 185);

    // Pointer needle pointing at 62°C (approx 1.35 * PI)
    ctx.save();
    ctx.translate(128, 128);
    ctx.rotate(Math.PI * 1.38);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(85, 0);
    ctx.stroke();

    // Needle pivot cap
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSwitchyardGravelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Crushed granite base color
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 512, 512);

    // Procedural stones and pebbles for electrical gravel drainage
    const stones = 2000;
    const colors = ['#475569', '#334155', '#94a3b8', '#cbd5e1', '#52525b'];

    for (let i = 0; i < stones; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 6;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}


export function createFloorTilesTexture(maxAniso: number = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Ivory vitrified tile base
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle marble veining
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.bezierCurveTo(
        Math.random() * 512, Math.random() * 512,
        Math.random() * 512, Math.random() * 512,
        Math.random() * 512, Math.random() * 512
      );
      ctx.stroke();
    }

    // 4 tiles with 2mm grout joint lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, 510, 510);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.anisotropy = Math.min(maxAniso, 8);
  return texture;
}

export function createBrickWallTexture(maxAniso: number = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Red burnt clay brick base
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 16;
    const rowH = 512 / rows;
    const brickW = 64;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offsetX = (r % 2) * (brickW / 2);

      for (let x = -brickW; x < 512 + brickW; x += brickW) {
        const bx = x + offsetX;
        // Brick color variation
        const shade = Math.floor(Math.random() * 25);
        ctx.fillStyle = `rgb(${155 + shade}, ${40 + shade / 2}, ${30 + shade / 2})`;
        ctx.fillRect(bx + 1.5, y + 1.5, brickW - 3, rowH - 3);
      }
    }

    // Mortar lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * rowH);
      ctx.lineTo(512, r * rowH);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  texture.anisotropy = Math.min(maxAniso, 8);
  return texture;
}

export function createDbScheduleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Enclosure schedule placard
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 340);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 334);

    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ANANYA ELECTRICAL SOLUTIONS - RESIDENTIAL DB', 256, 32);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('IS:732 / IS:12640 / NBC 2016 COMPLIANT • 240V 50Hz 1-PHASE', 256, 54);

    // Table Header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(16, 70, 480, 26);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WAY  DEVICE       RATING   CONNECTED LOAD       WIRE SQMM', 24, 88);

    const rows = [
      ['IN', 'ISOLATOR 2P', '63A', 'MAIN UTILITY SERVICE ENTRY', '10.0 sq.mm'],
      ['RC', 'RCCB 2P', '40A/30mA', 'EARTH LEAKAGE PROTECTION', '10.0 sq.mm'],
      ['SP', 'SPD TYPE 2', '40kA', 'LIGHTNING / SURGE DIVERTER', '10.0 sq.mm'],
      ['C1', 'MCB SP (C6)', '6A', 'LIVING & FOYER LIGHTING', '1.5 sq.mm'],
      ['C2', 'MCB SP (C6)', '6A', 'BEDROOMS LIGHTS & FANS', '1.5 sq.mm'],
      ['C3', 'MCB SP (C16)', '16A', '16A/6A CONVENIENCE SOCKETS', '2.5 sq.mm'],
      ['C4', 'MCB SP (C20)', '20A', 'KITCHEN INDUCTION & OVEN', '4.0 sq.mm'],
      ['C5', 'MCB SP (C20)', '20A', 'MASTER BED 1.5T INVERTER AC', '4.0 sq.mm'],
      ['C6', 'MCB SP (C16)', '16A', 'BATHROOM GEYSER (25L)', '2.5 sq.mm']
    ];

    ctx.font = '11px monospace';
    rows.forEach((r, idx) => {
      const y = 115 + idx * 22;
      ctx.fillStyle = idx % 2 === 0 ? '#1e293b' : '#334155';
      const text = `${r[0].padEnd(4)} ${r[1].padEnd(12)} ${r[2].padEnd(8)} ${r[3].padEnd(26)} ${r[4]}`;
      ctx.fillText(text, 24, y);
    });

    // Warning footer
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS TEST BUTTON ON RCCB QUARTERLY • MAINTAIN EARTH RESISTANCE < 1.0 OHM', 256, 320);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createIndianSocketTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Pure white polycarbonate plate
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 240);

    // Socket Bezel
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 1. Top Earth Pin Hole (8mm diameter, larger round pin)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(128, 70, 18, 0, Math.PI * 2);
    ctx.fill();

    // Earth symbol below top hole
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(128, 94);
    ctx.lineTo(128, 104);
    ctx.moveTo(120, 104);
    ctx.lineTo(136, 104);
    ctx.moveTo(123, 108);
    ctx.lineTo(133, 108);
    ctx.moveTo(126, 112);
    ctx.lineTo(130, 112);
    ctx.stroke();

    // 2. Bottom Left Neutral Hole
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(88, 160, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', 88, 192);

    // 3. Bottom Right Phase Hole
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(168, 160, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('L', 168, 192);

    // 16A / 6A Universal Combined Shutter Indicator
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('16A 240V~', 128, 218);
    ctx.fillText('IS:1293', 128, 232);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSwitchPlateTexture(moduleCount: number = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Elegant arctic white modular plate finish
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Subtle chamfered border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 248);

    // Logo
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('AES MODULAR • IS:3854', 492, 240);

    // Switch cutouts grid
    const cols = moduleCount;
    const cutW = 440 / cols;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    for (let c = 0; c < cols; c++) {
      const cx = 36 + c * cutW;
      ctx.strokeRect(cx + 4, 30, cutW - 8, 180);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createEarthChamberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Cast iron / concrete inspection cover
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 244, 244);

    // Chequer plate pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 20; i < 240; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 20);
      ctx.lineTo(i + 12, 32);
      ctx.stroke();
    }

    // Recessed center lifting handle ring
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(128, 128, 36, 0, Math.PI * 2);
    ctx.stroke();

    // Embossed Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EARTH PIT', 128, 72);
    ctx.font = 'bold 14px monospace';
    ctx.fillText('IS: 3043 - 2018', 128, 92);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('TESTED: 0.85 Ω', 128, 185);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('ANANYA ELECTRICAL', 128, 205);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
