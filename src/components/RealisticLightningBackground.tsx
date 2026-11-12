import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface BoltSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  nx: number;
  ny: number;
  phase1: number;
  phase2: number;
  widthStart: number;
  widthEnd: number;
  alpha: number;
  progress: number;
  beadSeed: number;
}

interface BoltBranch {
  tier: number; // 0 = main return trunk, 1 = primary fork, 2 = secondary fork, 3 = capillary streamer
  segments: BoltSegment[];
}

interface IonizedSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

interface StormCell {
  xFrac: number;
  yFrac: number;
  rxFrac: number;
  ryFrac: number;
  phase: number;
  speed: number;
  surgeEnergy: number;
  hue: string;
}

interface ActiveBolt {
  id: number;
  origin: Point;
  target: Point;
  branches: BoltBranch[];
  createdAt: number;
  leaderDuration: number;
  sustainedDuration: number;
  totalDuration: number;
  restrikeTimes: number[];
  hueType: 'cyan' | 'ice-blue' | 'violet-blue' | 'amber-white';
  boltType: 'cloud-to-ground' | 'anvil-spider' | 'conjugate-fork';
  sparksSpawned: boolean;
}

function gaussianRandom(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) * 1.18;
}

function subdivideFractalPoints(
  start: Point,
  end: Point,
  generations: number,
  initialOffset: number,
  jaggedness = 0.53
): Point[] {
  let points: Point[] = [start, end];
  let offset = initialOffset;

  for (let g = 0; g < generations; g++) {
    const nextPoints: Point[] = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1.x + p2.x) * 0.5;
      const midY = (p1.y + p2.y) * 0.5;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;

      const nx = -dy / len;
      const ny = dx / len;

      const kinkBoost = Math.random() < 0.16 ? 1.55 : 1.0;
      const displace = gaussianRandom() * offset * kinkBoost;
      const alongJitter = (Math.random() - 0.5) * offset * 0.24;

      nextPoints.push({
        x: midX + nx * displace + (dx / len) * alongJitter,
        y: midY + ny * displace + (dy / len) * alongJitter,
      });
      nextPoints.push(p2);
    }
    points = nextPoints;
    offset *= jaggedness;
  }

  return points;
}

function buildBranchSegments(
  points: Point[],
  baseWidth: number,
  tipWidth: number,
  baseAlpha: number,
  startProgress = 0,
  endProgress = 1
): BoltSegment[] {
  const segments: BoltSegment[] = [];
  const count = points.length - 1;
  if (count <= 0) return segments;

  const phases: number[] = [];
  for (let i = 0; i <= count; i++) {
    phases.push(i * 0.42 + Math.random() * 1.8);
  }

  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;
    const w0 = baseWidth + (tipWidth - baseWidth) * Math.pow(t0, 0.72);
    const w1 = baseWidth + (tipWidth - baseWidth) * Math.pow(t1, 0.72);
    const segAlpha = baseAlpha * (1 - 0.42 * Math.pow(t1, 1.35));
    const segProgress = startProgress + (endProgress - startProgress) * t1;

    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.hypot(dx, dy) || 1;

    segments.push({
      x1: points[i].x,
      y1: points[i].y,
      x2: points[i + 1].x,
      y2: points[i + 1].y,
      nx: -dy / len,
      ny: dx / len,
      phase1: phases[i],
      phase2: phases[i + 1],
      widthStart: w0,
      widthEnd: w1,
      alpha: segAlpha,
      progress: segProgress,
      beadSeed: Math.random(),
    });
  }

  return segments;
}

function generateRealisticBolt(
  width: number,
  height: number,
  now: number,
  id: number,
  isMobile: boolean,
  forcedSlot?: 'right-tower' | 'left-horizon' | 'center-ridge' | 'anvil-spider'
): ActiveBolt {
  const roll = Math.random();
  const slot: 'right-tower' | 'left-horizon' | 'center-ridge' | 'anvil-spider' =
    forcedSlot ??
    (roll < 0.38
      ? 'right-tower'
      : roll < 0.70
        ? 'left-horizon'
        : roll < 0.88
          ? 'center-ridge'
          : 'anvil-spider');

  const isSpider = slot === 'anvil-spider';
  let origin: Point;
  let target: Point;

  if (slot === 'right-tower') {
    origin = {
      x: width * (0.58 + Math.random() * 0.32),
      y: -15 + Math.random() * (height * 0.07),
    };
    target = {
      x: origin.x + (Math.random() - 0.54) * (width * 0.25),
      y: height * (0.64 + Math.random() * 0.28),
    };
  } else if (slot === 'left-horizon') {
    origin = {
      x: width * (0.12 + Math.random() * 0.32),
      y: -15 + Math.random() * (height * 0.07),
    };
    target = {
      x: origin.x + (Math.random() - 0.45) * (width * 0.24),
      y: height * (0.56 + Math.random() * 0.28),
    };
  } else if (slot === 'center-ridge') {
    origin = {
      x: width * (0.38 + Math.random() * 0.26),
      y: -12 + Math.random() * (height * 0.06),
    };
    target = {
      x: origin.x + (Math.random() - 0.5) * (width * 0.26),
      y: height * (0.58 + Math.random() * 0.26),
    };
  } else {
    const leftToRight = Math.random() > 0.45;
    origin = {
      x: width * (leftToRight ? 0.18 + Math.random() * 0.22 : 0.62 + Math.random() * 0.24),
      y: height * (0.04 + Math.random() * 0.14),
    };
    target = {
      x: width * (leftToRight ? 0.66 + Math.random() * 0.26 : 0.14 + Math.random() * 0.24),
      y: height * (0.12 + Math.random() * 0.22),
    };
  }

  const mainLength = Math.hypot(target.x - origin.x, target.y - origin.y);

  // Device-aware fractal depth: 5 generations (32 pts) on mobile, 6 generations (64 pts) on desktop
  const trunkGenerations = isMobile ? 5 : 6;
  const mainPoints = subdivideFractalPoints(
    origin,
    target,
    trunkGenerations,
    mainLength * (isSpider ? 0.14 : 0.165),
    0.535
  );

  const branches: BoltBranch[] = [];

  // Tier 0: Main return-stroke channel (Slim & refined)
  const mainBaseWidth = isSpider ? 1.4 : (isMobile ? 1.6 : 2.0);
  const mainTipWidth = isSpider ? 0.35 : 0.55;
  branches.push({
    tier: 0,
    segments: buildBranchSegments(mainPoints, mainBaseWidth, mainTipWidth, 0.9, 0, 1),
  });

  // Tier 1: Minimal subtle forks
  const numPrimaryForks = isSpider ? 1 : 2;

  const mainAngle = Math.atan2(target.y - origin.y, target.x - origin.x);

  for (let f = 0; f < numPrimaryForks; f++) {
    const fracMin = 0.1 + (f / numPrimaryForks) * 0.7;
    const frac = Math.min(0.85, fracMin + Math.random() * (0.5 / numPrimaryForks));
    const idx = Math.max(2, Math.min(mainPoints.length - 3, Math.floor(frac * mainPoints.length)));
    const forkOrigin = mainPoints[idx];

    const side = f % 2 === 0 ? 1 : -1;
    const spreadAngle =
      mainAngle + side * (0.28 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.15;
    const forkLen = mainLength * (0.24 + Math.random() * 0.26) * (1 - frac * 0.32);

    const forkTarget: Point = {
      x: forkOrigin.x + Math.cos(spreadAngle) * forkLen,
      y: forkOrigin.y + Math.sin(spreadAngle) * forkLen,
    };

    const forkGens = isMobile ? 3 : 4;
    const forkPoints = subdivideFractalPoints(forkOrigin, forkTarget, forkGens, forkLen * 0.18, 0.54);
    const forkStartWidth = mainBaseWidth * (1 - frac * 0.42) * 0.62;
    const forkEndProgress = Math.min(1, frac + 0.3);

    branches.push({
      tier: 1,
      segments: buildBranchSegments(
        forkPoints,
        forkStartWidth,
        0.22,
        0.88,
        frac,
        forkEndProgress
      ),
    });

    // Tier 2: Secondary sub-branches (Desktop only)
    if (!isMobile) {
      const sFrac = 0.35 + Math.random() * 0.4;
      const sIdx = Math.max(1, Math.min(forkPoints.length - 2, Math.floor(sFrac * forkPoints.length)));
      const subOrigin = forkPoints[sIdx];
      const subSide = Math.random() > 0.4 ? side : -side;
      const subAngle = spreadAngle + subSide * (0.28 + Math.random() * 0.45);
      const subLen = forkLen * (0.35 + Math.random() * 0.35);

      const subTarget: Point = {
        x: subOrigin.x + Math.cos(subAngle) * subLen,
        y: subOrigin.y + Math.sin(subAngle) * subLen,
      };

      const subPoints = subdivideFractalPoints(subOrigin, subTarget, 3, subLen * 0.2, 0.55);
      const subProgressStart = frac + (forkEndProgress - frac) * sFrac;

      branches.push({
        tier: 2,
        segments: buildBranchSegments(
          subPoints,
          forkStartWidth * 0.54,
          0.14,
          0.72,
          subProgressStart,
          Math.min(1, subProgressStart + 0.16)
        ),
      });
    }
  }

  // Tier 3 Direct fine twigs (Desktop only, limit to 2)
  if (!isMobile) {
    for (let t = 0; t < 2; t++) {
      const tFrac = 0.15 + t * 0.45 + Math.random() * 0.15;
      const tIdx = Math.floor(tFrac * (mainPoints.length - 2));
      const twigOrigin = mainPoints[tIdx];
      const twigSide = t % 2 === 0 ? 1 : -1;
      const twigAngle = mainAngle + twigSide * (0.42 + Math.random() * 0.6);
      const twigLen = mainLength * (0.07 + Math.random() * 0.08);
      const twigTarget: Point = {
        x: twigOrigin.x + Math.cos(twigAngle) * twigLen,
        y: twigOrigin.y + Math.sin(twigAngle) * twigLen,
      };
      const twigPoints = subdivideFractalPoints(twigOrigin, twigTarget, 3, twigLen * 0.22, 0.54);
      branches.push({
        tier: 3,
        segments: buildBranchSegments(
          twigPoints,
          0.7,
          0.1,
          0.55,
          tFrac,
          Math.min(1, tFrac + 0.09)
        ),
      });
    }
  }

  const leaderDuration = isSpider ? 100 : (isMobile ? 80 : 70 + Math.random() * 25);
  const sustainedDuration = isSpider ? 220 : (isMobile ? 200 : 260 + Math.random() * 160);

  const restrikeCount = isMobile ? 1 : (isSpider ? 2 : 2 + Math.floor(Math.random() * 2));
  const restrikeTimes: number[] = [];
  let cursor = leaderDuration + 85;
  for (let r = 0; r < restrikeCount; r++) {
    restrikeTimes.push(cursor);
    cursor += 70 + Math.random() * 60;
  }

  const hueRoll = Math.random();
  const hueType: ActiveBolt['hueType'] =
    hueRoll < 0.45
      ? 'cyan'
      : hueRoll < 0.78
        ? 'ice-blue'
        : hueRoll < 0.92
          ? 'violet-blue'
          : 'amber-white';

  return {
    id,
    origin,
    target,
    branches,
    createdAt: now,
    leaderDuration,
    sustainedDuration,
    totalDuration: Math.max(cursor + 280, leaderDuration + sustainedDuration + 300),
    restrikeTimes,
    hueType,
    boltType: isSpider ? 'anvil-spider' : 'cloud-to-ground',
    sparksSpawned: false,
  };
}

export const RealisticLightningBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion and saveData
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData =
      typeof navigator !== 'undefined' &&
      (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

    if (prefersReducedMotion || isSaveData) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024));
    let animationFrameId = 0;
    let isVisible = true;
    let isInViewport = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let boltCounter = 1;
    let lastRenderTime = 0;
    const activeBolts: ActiveBolt[] = [];
    const activeSparks: IonizedSpark[] = [];

    // Subtle background storm cells (1 on mobile, 2 on desktop)
    const stormCells: StormCell[] = isMobile
      ? [
          { xFrac: 0.65, yFrac: 0.14, rxFrac: 0.42, ryFrac: 0.28, phase: 0.2, speed: 0.0016, surgeEnergy: 0.3, hue: '125, 211, 252' },
        ]
      : [
          { xFrac: 0.74, yFrac: 0.14, rxFrac: 0.38, ryFrac: 0.26, phase: 0.2, speed: 0.002, surgeEnergy: 0.32, hue: '125, 211, 252' },
          { xFrac: 0.32, yFrac: 0.12, rxFrac: 0.36, ryFrac: 0.24, phase: 2.1, speed: 0.0018, surgeEnergy: 0.25, hue: '96, 165, 250' },
        ];

    const updateSize = (explicitWidth?: number, explicitHeight?: number) => {
      let w = explicitWidth;
      let h = explicitHeight;
      if (w === undefined || h === undefined) {
        w = canvas.clientWidth || canvas.offsetWidth || 320;
        h = canvas.clientHeight || canvas.offsetHeight || 320;
      }
      width = Math.max(320, w);
      height = Math.max(320, h);
      isMobile = width < 768 || (typeof window !== 'undefined' && window.innerWidth < 768);

      // Mobile devices get dpr = 1 to preserve CPU/GPU fillrate; desktop capped at 1.5
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const targetCanvasW = Math.floor(width * dpr);
      const targetCanvasH = Math.floor(height * dpr);
      if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
        canvas.width = targetCanvasW;
        canvas.height = targetCanvasH;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect) {
        updateSize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    resizeObserver.observe(canvas);

    // Minimal spaced-out strike scheduler
    const initialNow = performance.now();
    let nextPrimaryStrikeAt = initialNow + (isMobile ? 5500 : 3800);
    let nextCrawlerAt = initialNow + (isMobile ? 9000 : 7000);
    let lastSlot: 'right-tower' | 'left-horizon' | 'center-ridge' = 'right-tower';

    const getPalette = (hueType: ActiveBolt['hueType']) => {
      if (hueType === 'violet-blue') {
        return {
          outerGlow: '99, 102, 241',
          midCorona: '165, 180, 252',
          core: '248, 250, 252',
          cloudTint: '129, 140, 248',
        };
      }
      if (hueType === 'amber-white') {
        return {
          outerGlow: '56, 189, 248',
          midCorona: '186, 230, 253',
          core: '254, 249, 195',
          cloudTint: '125, 211, 252',
        };
      }
      if (hueType === 'ice-blue') {
        return {
          outerGlow: '59, 130, 246',
          midCorona: '186, 230, 253',
          core: '255, 255, 255',
          cloudTint: '96, 165, 250',
        };
      }
      return {
        outerGlow: '56, 189, 248',
        midCorona: '125, 211, 252',
        core: '240, 249, 255',
        cloudTint: '56, 189, 248',
      };
    };

    const spawnBeadSparks = (bolt: ActiveBolt, palette: ReturnType<typeof getPalette>) => {
      if (isMobile) return; // Skip sparks on mobile
      const trunk = bolt.branches[0];
      if (!trunk) return;
      const maxSparksToAdd = 6;
      let count = 0;
      for (let i = 0; i < trunk.segments.length; i += 7) {
        if (count >= maxSparksToAdd || Math.random() > 0.45) continue;
        const seg = trunk.segments[i];
        activeSparks.push({
          x: (seg.x1 + seg.x2) * 0.5 + (Math.random() - 0.5) * 4,
          y: (seg.y1 + seg.y2) * 0.5 + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.45) * 0.4,
          vy: -0.15 - Math.random() * 0.3,
          radius: 0.9 + Math.random() * 1.2,
          alpha: 0.7 + Math.random() * 0.25,
          decay: 0.02 + Math.random() * 0.02,
          color: palette.midCorona,
        });
        count++;
      }
    };

    const renderFrame = (now: number) => {
      if (!isVisible || !isInViewport) {
        return;
      }

      // Frame-rate throttling: ~25 FPS (40ms) on mobile, 60 FPS (16ms) on desktop
      const targetInterval = isMobile ? 38 : 16;
      if (now - lastRenderTime < targetInterval) {
        animationFrameId = requestAnimationFrame(renderFrame);
        return;
      }
      lastRenderTime = now;

      ctx.clearRect(0, 0, width, height);

      // Minimalist: strictly 1 bolt maximum at any time
      const maxBolts = 1;

      // 1. Minimal Strike Scheduler: spaced out every 6-10s
      if (now >= nextPrimaryStrikeAt && activeBolts.length < maxBolts) {
        const slots: Array<'right-tower' | 'left-horizon' | 'center-ridge'> = [
          'right-tower',
          'left-horizon',
          'center-ridge',
        ];
        const available = slots.filter((s) => s !== lastSlot);
        const chosenSlot = available[Math.floor(Math.random() * available.length)];
        lastSlot = chosenSlot;

        const newBolt = generateRealisticBolt(width, height, now, boltCounter++, isMobile, chosenSlot);
        activeBolts.push(newBolt);

        for (const cell of stormCells) {
          const dist = Math.abs(cell.xFrac * width - newBolt.origin.x);
          if (dist < width * 0.35) {
            cell.surgeEnergy = Math.min(0.4, cell.surgeEnergy + 0.2);
          }
        }

        nextPrimaryStrikeAt = now + (isMobile ? 7000 + Math.random() * 4500 : 6000 + Math.random() * 3500);
      }

      // 2. High-Altitude Anvil Crawler Scheduler: spaced out every 10-15s
      if (now >= nextCrawlerAt && activeBolts.length < maxBolts) {
        activeBolts.push(generateRealisticBolt(width, height, now, boltCounter++, isMobile, 'anvil-spider'));
        if (stormCells.length > 0) {
          stormCells[0].surgeEnergy = Math.min(0.35, stormCells[0].surgeEnergy + 0.15);
        }
        nextCrawlerAt = now + (isMobile ? 11000 + Math.random() * 5000 : 9500 + Math.random() * 4500);
      }

      // 3. Render Cumulonimbus Sheet-Lightning Cells
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const cell of stormCells) {
        cell.surgeEnergy *= 0.92;
        if (Math.random() < 0.02) {
          cell.surgeEnergy = Math.min(0.75, cell.surgeEnergy + 0.2 + Math.random() * 0.2);
        }

        const wave1 = Math.sin(now * cell.speed + cell.phase);
        const cellAlpha = Math.min(0.42, 0.04 + cell.surgeEnergy * 0.25);

        if (cellAlpha > 0.015) {
          const cx = cell.xFrac * width;
          const cy = cell.yFrac * height;
          const radius = Math.max(width * cell.rxFrac, height * cell.ryFrac);

          const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
          grad.addColorStop(0, `rgba(240, 249, 255, ${cellAlpha * 0.9})`);
          grad.addColorStop(0.35, `rgba(${cell.hue}, ${cellAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
      }
      ctx.restore();

      // Remove expired bolts
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        if (now - activeBolts[i].createdAt > activeBolts[i].totalDuration) {
          activeBolts.splice(i, 1);
        }
      }

      let globalSkyFlash = 0;

      for (const bolt of activeBolts) {
        const age = now - bolt.createdAt;
        if (age < 0) continue;

        const palette = getPalette(bolt.hueType);
        const leaderProgress = Math.min(1, age / bolt.leaderDuration);
        const isReturnStroke = age >= bolt.leaderDuration && age <= bolt.leaderDuration + 90;

        let trunkIntensity = 0;
        let branchIntensity = 0;
        let isBeadDecayPhase = false;

        if (age < bolt.leaderDuration) {
          trunkIntensity = 0.45 + 0.25 * leaderProgress;
          branchIntensity = 0.35;
        } else {
          const postLeaderAge = age - bolt.leaderDuration;
          const continuingCurrent =
            postLeaderAge < bolt.sustainedDuration
              ? 0.55 * (1 - (postLeaderAge / bolt.sustainedDuration) * 0.45)
              : 0;
          const initialSurge = Math.exp(-postLeaderAge / 130);
          trunkIntensity = Math.max(initialSurge, continuingCurrent);
          branchIntensity = Math.exp(-postLeaderAge / 85);

          if (postLeaderAge < bolt.sustainedDuration) {
            const hfFlicker = 0.85 + 0.15 * Math.sin(now * 0.08 + bolt.id * 3.1);
            trunkIntensity *= hfFlicker;
          }

          for (const rTime of bolt.restrikeTimes) {
            const dt = age - rTime;
            if (dt >= 0 && dt < 90) {
              const pulse = Math.exp(-dt / 32) * 0.95;
              trunkIntensity = Math.max(trunkIntensity, pulse);
              branchIntensity = Math.max(branchIntensity, pulse * 0.35);
            }
          }

          if (postLeaderAge > bolt.sustainedDuration * 0.72) {
            isBeadDecayPhase = true;
            if (!bolt.sparksSpawned) {
              bolt.sparksSpawned = true;
              spawnBeadSparks(bolt, palette);
            }
          }
        }

        const boltSkyAlpha = Math.min(1, trunkIntensity) * (isReturnStroke ? 0.15 : 0.08);
        globalSkyFlash = Math.max(globalSkyFlash, boltSkyAlpha);

        // Volumetric cloud illumination
        if (boltSkyAlpha > 0.02) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          const cloudRadius = Math.max(width, height) * 0.48;
          const cloudGrad = ctx.createRadialGradient(
            bolt.origin.x,
            Math.max(18, bolt.origin.y + 36),
            6,
            bolt.origin.x,
            Math.max(36, bolt.origin.y + 80),
            cloudRadius
          );
          cloudGrad.addColorStop(0, `rgba(${palette.core}, ${boltSkyAlpha * 0.9})`);
          cloudGrad.addColorStop(0.3, `rgba(${palette.midCorona}, ${boltSkyAlpha * 0.6})`);
          cloudGrad.addColorStop(1, `rgba(${palette.cloudTint}, 0)`);

          ctx.fillStyle = cloudGrad;
          ctx.fillRect(0, 0, width, height);

          // Ground reflection on desktop
          if (!isMobile && bolt.boltType === 'cloud-to-ground' && leaderProgress >= 0.98) {
            const groundRadius = Math.max(width, height) * 0.25;
            const groundGrad = ctx.createRadialGradient(
              bolt.target.x,
              bolt.target.y,
              4,
              bolt.target.x,
              bolt.target.y,
              groundRadius
            );
            groundGrad.addColorStop(0, `rgba(${palette.core}, ${boltSkyAlpha * 0.6})`);
            groundGrad.addColorStop(1, `rgba(${palette.outerGlow}, 0)`);

            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, 0, width, height);
          }

          ctx.restore();
        }

        // Render fractal branches with BATCHED path operations
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const writheAmp = age > bolt.leaderDuration ? Math.min(2.8, (age - bolt.leaderDuration) * 0.004) : 0.3;

        for (const branch of bolt.branches) {
          const tierMultiplier =
            branch.tier === 0
              ? trunkIntensity
              : branch.tier === 1
                ? Math.max(branchIntensity, trunkIntensity * 0.4)
                : branchIntensity * 0.75;

          if (tierMultiplier <= 0.02) continue;

          // Collect valid segments and compute transformed endpoints
          const segsToDraw: Array<{ sx1: number; sy1: number; sx2: number; sy2: number; width: number; alpha: number }> = [];

          for (const seg of branch.segments) {
            if (seg.progress > leaderProgress) continue;
            if (isBeadDecayPhase && branch.tier === 0 && seg.beadSeed < 0.3) continue;

            const segAlpha = Math.min(1, seg.alpha * tierMultiplier);
            if (segAlpha <= 0.02) continue;

            const avgWidth = (seg.widthStart + seg.widthEnd) * 0.5;
            const j1 = Math.sin(now * 0.03 + seg.phase1) * writheAmp * (branch.tier === 0 ? 1 : 0.6);
            const j2 = Math.sin(now * 0.03 + seg.phase2) * writheAmp * (branch.tier === 0 ? 1 : 0.6);

            segsToDraw.push({
              sx1: seg.x1 + seg.nx * j1,
              sy1: seg.y1 + seg.ny * j1,
              sx2: seg.x2 + seg.nx * j2,
              sy2: seg.y2 + seg.ny * j2,
              width: avgWidth,
              alpha: segAlpha,
            });
          }

          if (segsToDraw.length === 0) continue;

          const branchAvgWidth = segsToDraw[0].width;
          const branchAvgAlpha = segsToDraw[0].alpha;

          // Pass 1: Outer glow (Desktop only to conserve mobile GPU fillrate)
          if (!isMobile) {
            ctx.beginPath();
            for (const s of segsToDraw) {
              ctx.moveTo(s.sx1, s.sy1);
              ctx.lineTo(s.sx2, s.sy2);
            }
            ctx.strokeStyle = `rgba(${palette.outerGlow}, ${branchAvgAlpha * 0.28})`;
            ctx.lineWidth = branchAvgWidth * (branch.tier === 0 ? 6.2 : 4.0);
            ctx.stroke();
          }

          // Pass 2: High-voltage ionized corona (Batched single stroke call)
          ctx.beginPath();
          for (const s of segsToDraw) {
            ctx.moveTo(s.sx1, s.sy1);
            ctx.lineTo(s.sx2, s.sy2);
          }
          ctx.strokeStyle = `rgba(${palette.midCorona}, ${branchAvgAlpha * 0.7})`;
          ctx.lineWidth = branchAvgWidth * (branch.tier === 0 ? 2.5 : 1.8);
          ctx.stroke();

          // Pass 3: Scorching white-hot return-stroke core (Batched single stroke call)
          ctx.beginPath();
          for (const s of segsToDraw) {
            ctx.moveTo(s.sx1, s.sy1);
            ctx.lineTo(s.sx2, s.sy2);
          }
          ctx.strokeStyle = `rgba(${palette.core}, ${Math.min(1, branchAvgAlpha * 1.15)})`;
          ctx.lineWidth = Math.max(0.4, branchAvgWidth * 0.9);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 4. Render drifting sparks (Desktop only)
      if (!isMobile && activeSparks.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = activeSparks.length - 1; i >= 0; i--) {
          const sp = activeSparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0.01) {
            activeSparks.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sp.color}, ${sp.alpha * 0.3})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. Whole-sky sheet-flash (minimal, subtle glow)
      if (globalSkyFlash > 0.4) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(186, 230, 253, ${(globalSkyFlash - 0.4) * 0.025})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    // Pause when canvas leaves viewport using IntersectionObserver
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isInViewport = entry.isIntersecting;
        if (isInViewport && isVisible) {
          cancelAnimationFrame(animationFrameId);
          lastRenderTime = performance.now();
          animationFrameId = requestAnimationFrame(renderFrame);
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    // Pause when browser tab is inactive / hidden
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible && isInViewport) {
        cancelAnimationFrame(animationFrameId);
        lastRenderTime = performance.now();
        animationFrameId = requestAnimationFrame(renderFrame);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Defer animation loop start until after initial paint settles
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => {
        animationFrameId = requestAnimationFrame(renderFrame);
      });
    } else {
      startTimer = setTimeout(() => {
        animationFrameId = requestAnimationFrame(renderFrame);
      }, 100);
    }

    return () => {
      if (startTimer) clearTimeout(startTimer);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none mix-blend-screen opacity-20"
    />
  );
};
