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
  progress: number; // 0 at cloud origin, 1 at terminal tip
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

      // Occasional sharp electrostatic kink like real stepped leaders
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
  forcedSlot?: 'right-tower' | 'left-horizon' | 'center-ridge' | 'anvil-spider'
): ActiveBolt {
  const roll = Math.random();
  const slot: 'right-tower' | 'left-horizon' | 'center-ridge' | 'anvil-spider' =
    forcedSlot ??
    (roll < 0.34
      ? 'right-tower'
      : roll < 0.62
        ? 'left-horizon'
        : roll < 0.8
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
    // High-altitude dendritic anvil spider lightning crawling across the upper cloud deck
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
  // 7 generations = 128 ultra-detailed fractal segments along the main return channel
  const mainPoints = subdivideFractalPoints(
    origin,
    target,
    7,
    mainLength * (isSpider ? 0.14 : 0.165),
    0.535
  );

  const branches: BoltBranch[] = [];

  // Tier 0: Main return-stroke channel
  const mainBaseWidth = isSpider ? 2.15 : 3.05;
  const mainTipWidth = isSpider ? 0.45 : 0.85;
  branches.push({
    tier: 0,
    segments: buildBranchSegments(mainPoints, mainBaseWidth, mainTipWidth, 1.0, 0, 1),
  });

  // Tier 1: Primary dendritic forks splitting off the main trunk
  const numPrimaryForks = isSpider
    ? 6 + Math.floor(Math.random() * 4)
    : 6 + Math.floor(Math.random() * 5);

  const mainAngle = Math.atan2(target.y - origin.y, target.x - origin.x);

  for (let f = 0; f < numPrimaryForks; f++) {
    const fracMin = 0.07 + (f / numPrimaryForks) * 0.74;
    const frac = Math.min(0.89, fracMin + Math.random() * (0.65 / numPrimaryForks));
    const idx = Math.max(3, Math.min(mainPoints.length - 5, Math.floor(frac * mainPoints.length)));
    const forkOrigin = mainPoints[idx];

    const side = f % 2 === 0 ? 1 : -1;
    const spreadAngle =
      mainAngle + side * (0.28 + Math.random() * 0.54) + (Math.random() - 0.5) * 0.16;
    const forkLen = mainLength * (0.25 + Math.random() * 0.3) * (1 - frac * 0.32);

    const forkTarget: Point = {
      x: forkOrigin.x + Math.cos(spreadAngle) * forkLen,
      y: forkOrigin.y + Math.sin(spreadAngle) * forkLen,
    };

    const forkPoints = subdivideFractalPoints(forkOrigin, forkTarget, 5, forkLen * 0.18, 0.54);
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

    // Tier 2: Secondary sub-branches
    const subBranchCount = 2 + Math.floor(Math.random() * 2);
    for (let s = 0; s < subBranchCount; s++) {
      const sFrac = 0.18 + Math.random() * 0.62;
      const sIdx = Math.max(1, Math.min(forkPoints.length - 2, Math.floor(sFrac * forkPoints.length)));
      const subOrigin = forkPoints[sIdx];
      const subSide = Math.random() > 0.32 ? side : -side;
      const subAngle = spreadAngle + subSide * (0.26 + Math.random() * 0.5);
      const subLen = forkLen * (0.34 + Math.random() * 0.36);

      const subTarget: Point = {
        x: subOrigin.x + Math.cos(subAngle) * subLen,
        y: subOrigin.y + Math.sin(subAngle) * subLen,
      };

      const subPoints = subdivideFractalPoints(subOrigin, subTarget, 4, subLen * 0.2, 0.55);
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

      // Tier 3: Hair-thin capillary streamers
      if (subPoints.length > 4) {
        const tIdx = Math.floor(subPoints.length * (0.35 + Math.random() * 0.45));
        const twigOrigin = subPoints[tIdx];
        const twigAngle = subAngle + (Math.random() > 0.5 ? 1 : -1) * (0.32 + Math.random() * 0.52);
        const twigLen = subLen * (0.4 + Math.random() * 0.34);
        const twigTarget: Point = {
          x: twigOrigin.x + Math.cos(twigAngle) * twigLen,
          y: twigOrigin.y + Math.sin(twigAngle) * twigLen,
        };
        const twigPoints = subdivideFractalPoints(twigOrigin, twigTarget, 3, twigLen * 0.22, 0.55);
        branches.push({
          tier: 3,
          segments: buildBranchSegments(
            twigPoints,
            0.58,
            0.09,
            0.52,
            subProgressStart + 0.04,
            Math.min(1, subProgressStart + 0.18)
          ),
        });
      }
    }
  }

  // Direct fine capillary corona streamers along the main trunk
  const directTwigs = 6 + Math.floor(Math.random() * 5);
  for (let t = 0; t < directTwigs; t++) {
    const tFrac = 0.06 + Math.random() * 0.82;
    const tIdx = Math.floor(tFrac * (mainPoints.length - 2));
    const twigOrigin = mainPoints[tIdx];
    const twigSide = Math.random() > 0.5 ? 1 : -1;
    const twigAngle = mainAngle + twigSide * (0.42 + Math.random() * 0.68);
    const twigLen = mainLength * (0.065 + Math.random() * 0.095);
    const twigTarget: Point = {
      x: twigOrigin.x + Math.cos(twigAngle) * twigLen,
      y: twigOrigin.y + Math.sin(twigAngle) * twigLen,
    };
    const twigPoints = subdivideFractalPoints(twigOrigin, twigTarget, 3, twigLen * 0.22, 0.54);
    branches.push({
      tier: 3,
      segments: buildBranchSegments(
        twigPoints,
        0.78,
        0.1,
        0.58,
        tFrac,
        Math.min(1, tFrac + 0.09)
      ),
    });
  }

  const leaderDuration = isSpider ? 105 : 70 + Math.random() * 25;
  const sustainedDuration = isSpider ? 240 + Math.random() * 140 : 280 + Math.random() * 220;

  // 2 to 5 rapid dart-leader restrikes for authentic stroboscopic high-voltage thunder flicker
  const restrikeCount = isSpider ? 2 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4);
  const restrikeTimes: number[] = [];
  let cursor = leaderDuration + 85 + Math.random() * 45;
  for (let r = 0; r < restrikeCount; r++) {
    restrikeTimes.push(cursor);
    cursor += 55 + Math.random() * 75;
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
    totalDuration: Math.max(cursor + 340, leaderDuration + sustainedDuration + 360),
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let boltCounter = 1;
    const activeBolts: ActiveBolt[] = [];
    const activeSparks: IonizedSpark[] = [];

    // Continuous rolling cumulonimbus storm cells so the sky is perpetually alive
    const stormCells: StormCell[] = [
      { xFrac: 0.74, yFrac: 0.14, rxFrac: 0.38, ryFrac: 0.26, phase: 0.2, speed: 0.0023, surgeEnergy: 0.35, hue: '125, 211, 252' },
      { xFrac: 0.28, yFrac: 0.12, rxFrac: 0.34, ryFrac: 0.24, phase: 2.1, speed: 0.0019, surgeEnergy: 0.25, hue: '96, 165, 250' },
      { xFrac: 0.52, yFrac: 0.09, rxFrac: 0.42, ryFrac: 0.22, phase: 4.0, speed: 0.0027, surgeEnergy: 0.3, hue: '165, 180, 252' },
      { xFrac: 0.84, yFrac: 0.28, rxFrac: 0.28, ryFrac: 0.22, phase: 1.3, speed: 0.0031, surgeEnergy: 0.2, hue: '56, 189, 248' },
    ];

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(320, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(canvas);

    // Seed immediate overlapping strikes so continuous thunder is visible from frame 1
    const initialNow = performance.now();
    activeBolts.push(generateRealisticBolt(width, height, initialNow - 20, boltCounter++, 'right-tower'));
    activeBolts.push(generateRealisticBolt(width, height, initialNow + 260, boltCounter++, 'anvil-spider'));
    activeBolts.push(generateRealisticBolt(width, height, initialNow + 640, boltCounter++, 'left-horizon'));

    let nextPrimaryStrikeAt = initialNow + 980;
    let nextCrawlerAt = initialNow + 520;
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
      const trunk = bolt.branches[0];
      if (!trunk) return;
      for (let i = 0; i < trunk.segments.length; i += 5) {
        if (Math.random() > 0.55) continue;
        const seg = trunk.segments[i];
        activeSparks.push({
          x: (seg.x1 + seg.x2) * 0.5 + (Math.random() - 0.5) * 4,
          y: (seg.y1 + seg.y2) * 0.5 + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.45) * 0.45,
          vy: -0.15 - Math.random() * 0.35,
          radius: 0.9 + Math.random() * 1.4,
          alpha: 0.75 + Math.random() * 0.25,
          decay: 0.018 + Math.random() * 0.022,
          color: palette.midCorona,
        });
      }
    };

    const renderFrame = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Continuous Cloud-to-Ground / Ridge Strike Scheduler (Overlapping cadence: 650ms - 1350ms)
      if (now >= nextPrimaryStrikeAt) {
        const slots: Array<'right-tower' | 'left-horizon' | 'center-ridge'> = [
          'right-tower',
          'left-horizon',
          'center-ridge',
        ];
        const available = slots.filter((s) => s !== lastSlot);
        const chosenSlot = available[Math.floor(Math.random() * available.length)];
        lastSlot = chosenSlot;

        const newBolt = generateRealisticBolt(width, height, now, boltCounter++, chosenSlot);
        activeBolts.push(newBolt);

        // Boost nearest storm cell's internal sheet-lightning surge
        for (const cell of stormCells) {
          const dist = Math.abs(cell.xFrac * width - newBolt.origin.x);
          if (dist < width * 0.35) {
            cell.surgeEnergy = Math.min(1, cell.surgeEnergy + 0.65);
          }
        }

        // 52% chance of a conjugate sympathetic fork or secondary bolt 110ms-260ms later
        if (Math.random() < 0.52) {
          const conjugateSlot =
            Math.random() < 0.5
              ? 'anvil-spider'
              : available[Math.floor(Math.random() * available.length)];
          activeBolts.push(
            generateRealisticBolt(
              width,
              height,
              now + 110 + Math.random() * 150,
              boltCounter++,
              conjugateSlot
            )
          );
        }

        nextPrimaryStrikeAt = now + 680 + Math.random() * 680;
      }

      // 2. Continuous High-Altitude Anvil Spider / Intracloud Crawler Scheduler
      if (now >= nextCrawlerAt) {
        if (activeBolts.length < 5) {
          activeBolts.push(generateRealisticBolt(width, height, now, boltCounter++, 'anvil-spider'));
          const randomCell = stormCells[Math.floor(Math.random() * stormCells.length)];
          randomCell.surgeEnergy = Math.min(1, randomCell.surgeEnergy + 0.5);
        }
        nextCrawlerAt = now + 540 + Math.random() * 620;
      }

      // 3. Render Continuous Rolling Cumulonimbus Sheet-Lightning Cells
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const cell of stormCells) {
        cell.surgeEnergy *= 0.94;
        // Occasional spontaneous in-cloud sheet flicker
        if (Math.random() < 0.035) {
          cell.surgeEnergy = Math.min(0.85, cell.surgeEnergy + 0.22 + Math.random() * 0.25);
        }

        const wave1 = Math.sin(now * cell.speed + cell.phase);
        const wave2 = Math.sin(now * (cell.speed * 2.3) - cell.phase * 1.4);
        const basePulse = Math.max(0, (wave1 * 0.5 + wave2 * 0.5 + 0.65) * 0.085);
        const cellAlpha = Math.min(0.46, basePulse + cell.surgeEnergy * 0.28);

        if (cellAlpha > 0.01) {
          const cx = (cell.xFrac + Math.sin(now * 0.0004 + cell.phase) * 0.04) * width;
          const cy = cell.yFrac * height;
          const radius = Math.max(width * cell.rxFrac, height * cell.ryFrac);

          const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
          grad.addColorStop(0, `rgba(240, 249, 255, ${cellAlpha * 0.95})`);
          grad.addColorStop(0.32, `rgba(${cell.hue}, ${cellAlpha * 0.58})`);
          grad.addColorStop(0.68, `rgba(56, 189, 248, ${cellAlpha * 0.18})`);
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

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let globalSkyFlash = 0;

      for (const bolt of activeBolts) {
        const age = now - bolt.createdAt;
        if (age < 0) continue;

        const palette = getPalette(bolt.hueType);
        const leaderProgress = Math.min(1, age / bolt.leaderDuration);
        const isReturnStroke = age >= bolt.leaderDuration && age <= bolt.leaderDuration + 105;

        let trunkIntensity = 0;
        let branchIntensity = 0;
        let isBeadDecayPhase = false;

        if (age < bolt.leaderDuration) {
          // Stepped leader descending from cloud deck
          trunkIntensity = 0.45 + 0.25 * leaderProgress;
          branchIntensity = 0.38;
        } else {
          const postLeaderAge = age - bolt.leaderDuration;

          // Sustained continuing-current arc + exponential decay
          const continuingCurrent =
            postLeaderAge < bolt.sustainedDuration
              ? 0.58 * (1 - (postLeaderAge / bolt.sustainedDuration) * 0.45)
              : 0;
          const initialSurge = Math.exp(-postLeaderAge / 135);
          trunkIntensity = Math.max(initialSurge, continuingCurrent);
          branchIntensity = Math.exp(-postLeaderAge / 88);

          // High-frequency turbulent plasma flicker during continuing current
          if (postLeaderAge < bolt.sustainedDuration) {
            const hfFlicker = 0.82 + 0.18 * Math.sin(now * 0.085 + bolt.id * 3.1);
            trunkIntensity *= hfFlicker;
          }

          // Dart-leader restrikes surging down the main ionized channel
          for (const rTime of bolt.restrikeTimes) {
            const dt = age - rTime;
            if (dt >= 0 && dt < 95) {
              const pulse = Math.exp(-dt / 34) * 0.98;
              trunkIntensity = Math.max(trunkIntensity, pulse);
              branchIntensity = Math.max(branchIntensity, pulse * 0.36);
            }
          }

          // Bead-lightning breakup during late decay
          if (postLeaderAge > bolt.sustainedDuration * 0.72) {
            isBeadDecayPhase = true;
            if (!bolt.sparksSpawned) {
              bolt.sparksSpawned = true;
              spawnBeadSparks(bolt, palette);
            }
          }
        }

        const boltSkyAlpha = Math.min(1, trunkIntensity) * (isReturnStroke ? 0.44 : 0.25);
        globalSkyFlash = Math.max(globalSkyFlash, boltSkyAlpha);

        // Synchronized volumetric cloud-origin illumination + horizon ground-strike reflection
        if (boltSkyAlpha > 0.015) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          const cloudRadius = Math.max(width, height) * (bolt.boltType === 'anvil-spider' ? 0.5 : 0.58);
          const cloudGrad = ctx.createRadialGradient(
            bolt.origin.x,
            Math.max(18, bolt.origin.y + 36),
            6,
            bolt.origin.x,
            Math.max(36, bolt.origin.y + 82),
            cloudRadius
          );
          cloudGrad.addColorStop(0, `rgba(${palette.core}, ${boltSkyAlpha * 0.96})`);
          cloudGrad.addColorStop(0.24, `rgba(${palette.midCorona}, ${boltSkyAlpha * 0.68})`);
          cloudGrad.addColorStop(0.58, `rgba(${palette.cloudTint}, ${boltSkyAlpha * 0.26})`);
          cloudGrad.addColorStop(1, `rgba(${palette.cloudTint}, 0)`);

          ctx.fillStyle = cloudGrad;
          ctx.fillRect(0, 0, width, height);

          // Horizon / transmission tower ground-strike backscatter when leader reaches target
          if (bolt.boltType === 'cloud-to-ground' && leaderProgress >= 0.98) {
            const groundRadius = Math.max(width, height) * 0.28;
            const groundGrad = ctx.createRadialGradient(
              bolt.target.x,
              bolt.target.y,
              4,
              bolt.target.x,
              bolt.target.y,
              groundRadius
            );
            groundGrad.addColorStop(0, `rgba(${palette.core}, ${boltSkyAlpha * 0.65})`);
            groundGrad.addColorStop(0.35, `rgba(${palette.midCorona}, ${boltSkyAlpha * 0.35})`);
            groundGrad.addColorStop(1, `rgba(${palette.outerGlow}, 0)`);

            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, 0, width, height);
          }

          ctx.restore();
        }

        // Render writhing fractal branches with 3-pass plasma bloom
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Magnetic pinch / acoustic writhing amplitude increases slightly over the bolt's life
        const writheAmp = age > bolt.leaderDuration ? Math.min(3.2, (age - bolt.leaderDuration) * 0.0048) : 0.35;

        for (const branch of bolt.branches) {
          const tierMultiplier =
            branch.tier === 0
              ? trunkIntensity
              : branch.tier === 1
                ? Math.max(branchIntensity, trunkIntensity * 0.42)
                : branch.tier === 2
                  ? branchIntensity * 0.86
                  : branchIntensity * 0.68;

          if (tierMultiplier <= 0.018) continue;

          for (const seg of branch.segments) {
            if (seg.progress > leaderProgress) continue;

            // During bead-lightning decay, break the channel into glowing plasma beads
            if (isBeadDecayPhase && branch.tier === 0 && seg.beadSeed < 0.32) {
              continue;
            }

            const segAlpha = Math.min(1, seg.alpha * tierMultiplier);
            if (segAlpha <= 0.015) continue;

            const avgWidth = (seg.widthStart + seg.widthEnd) * 0.5;

            // Continuous magnetohydrodynamic plasma jitter along the channel normal
            const j1 = Math.sin(now * 0.032 + seg.phase1) * writheAmp * (branch.tier === 0 ? 1 : 0.6);
            const j2 = Math.sin(now * 0.032 + seg.phase2) * writheAmp * (branch.tier === 0 ? 1 : 0.6);

            const sx1 = seg.x1 + seg.nx * j1;
            const sy1 = seg.y1 + seg.ny * j1;
            const sx2 = seg.x2 + seg.nx * j2;
            const sy2 = seg.y2 + seg.ny * j2;

            // Pass 1: Wide atmospheric plasma sheath
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.strokeStyle = `rgba(${palette.outerGlow}, ${segAlpha * 0.3})`;
            ctx.lineWidth = avgWidth * (branch.tier === 0 ? 6.8 : 4.4);
            ctx.stroke();

            // Pass 2: High-voltage ionized corona
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.strokeStyle = `rgba(${palette.midCorona}, ${segAlpha * 0.72})`;
            ctx.lineWidth = avgWidth * (branch.tier === 0 ? 2.7 : 1.95);
            ctx.stroke();

            // Pass 3: Scorching white-hot return-stroke core
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.strokeStyle = `rgba(${palette.core}, ${Math.min(1, segAlpha * 1.18)})`;
            ctx.lineWidth = Math.max(0.35, avgWidth * 0.94);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // 4. Render drifting ionized plasma sparks & bead-lightning embers
      if (activeSparks.length > 0) {
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
          ctx.arc(sp.x, sp.y, sp.radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sp.color}, ${sp.alpha * 0.32})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. Subtle whole-sky atmospheric sheet-flash reflection during intense return strokes
      if (globalSkyFlash > 0.22) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(186, 230, 253, ${(globalSkyFlash - 0.22) * 0.22})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none mix-blend-screen"
    />
  );
};
