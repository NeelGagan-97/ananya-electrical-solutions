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
  widthStart: number;
  widthEnd: number;
  alpha: number;
  progress: number; // 0 at cloud origin, 1 at terminal tip
}

interface BoltBranch {
  tier: number; // 0 = main return channel, 1 = primary fork, 2 = secondary branch, 3 = fine streamer
  segments: BoltSegment[];
}

interface ActiveBolt {
  id: number;
  origin: Point;
  target: Point;
  branches: BoltBranch[];
  createdAt: number;
  leaderDuration: number;
  totalDuration: number;
  restrikeTimes: number[];
  hueType: 'cyan' | 'ice-blue' | 'violet-blue';
  isCrawler: boolean;
}

function gaussianRandom(): number {
  // Approximate standard normal distribution using Irwin-Hall (sum of 3 uniforms)
  return (Math.random() + Math.random() + Math.random() - 1.5) * 1.15;
}

function subdivideFractalPoints(
  start: Point,
  end: Point,
  generations: number,
  initialOffset: number,
  jaggedness = 0.54
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

      // Perpendicular unit vector with slight downward/forward drift
      const nx = -dy / len;
      const ny = dx / len;

      const displace = gaussianRandom() * offset;
      const alongJitter = (Math.random() - 0.5) * offset * 0.22;

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

  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;
    const w0 = baseWidth + (tipWidth - baseWidth) * Math.pow(t0, 0.75);
    const w1 = baseWidth + (tipWidth - baseWidth) * Math.pow(t1, 0.75);
    const segAlpha = baseAlpha * (1 - 0.45 * Math.pow(t1, 1.4));
    const segProgress = startProgress + (endProgress - startProgress) * t1;

    segments.push({
      x1: points[i].x,
      y1: points[i].y,
      x2: points[i + 1].x,
      y2: points[i + 1].y,
      widthStart: w0,
      widthEnd: w1,
      alpha: segAlpha,
      progress: segProgress,
    });
  }

  return segments;
}

function generateRealisticBolt(
  width: number,
  height: number,
  now: number,
  id: number,
  forcedSlot?: 'right-tower' | 'left-horizon' | 'cloud-crawler'
): ActiveBolt {
  const slotRoll = Math.random();
  const slot: 'right-tower' | 'left-horizon' | 'cloud-crawler' =
    forcedSlot ??
    (slotRoll < 0.46 ? 'right-tower' : slotRoll < 0.82 ? 'left-horizon' : 'cloud-crawler');

  const isCrawler = slot === 'cloud-crawler';

  let origin: Point;
  let target: Point;

  if (slot === 'right-tower') {
    // Upper-right transmission sky down toward horizon hills
    origin = {
      x: width * (0.58 + Math.random() * 0.3),
      y: -12 + Math.random() * (height * 0.06),
    };
    target = {
      x: origin.x + (Math.random() - 0.54) * (width * 0.24),
      y: height * (0.62 + Math.random() * 0.28),
    };
  } else if (slot === 'left-horizon') {
    // Upper-left / center-left sky down toward distant ridge
    origin = {
      x: width * (0.16 + Math.random() * 0.34),
      y: -12 + Math.random() * (height * 0.06),
    };
    target = {
      x: origin.x + (Math.random() - 0.46) * (width * 0.22),
      y: height * (0.54 + Math.random() * 0.26),
    };
  } else {
    // High-altitude anvil crawler arcing laterally across upper storm clouds
    const leftToRight = Math.random() > 0.45;
    origin = {
      x: width * (leftToRight ? 0.28 + Math.random() * 0.2 : 0.65 + Math.random() * 0.2),
      y: height * (0.04 + Math.random() * 0.14),
    };
    target = {
      x: width * (leftToRight ? 0.68 + Math.random() * 0.22 : 0.22 + Math.random() * 0.22),
      y: height * (0.14 + Math.random() * 0.24),
    };
  }

  const mainLength = Math.hypot(target.x - origin.x, target.y - origin.y);
  const mainPoints = subdivideFractalPoints(
    origin,
    target,
    6, // 64 micro-segments with realistic tortuosity
    mainLength * 0.16,
    0.53
  );

  const branches: BoltBranch[] = [];

  // Tier 0: Main return-stroke trunk
  const mainBaseWidth = isCrawler ? 2.1 : 2.85;
  const mainTipWidth = isCrawler ? 0.55 : 0.95;
  branches.push({
    tier: 0,
    segments: buildBranchSegments(mainPoints, mainBaseWidth, mainTipWidth, 1.0, 0, 1),
  });

  // Tier 1: Primary forks splitting off the main trunk
  const numPrimaryForks = isCrawler
    ? 4 + Math.floor(Math.random() * 3)
    : 5 + Math.floor(Math.random() * 4);

  const mainAngle = Math.atan2(target.y - origin.y, target.x - origin.x);

  for (let f = 0; f < numPrimaryForks; f++) {
    // Pick fork indices distributed along the upper 12% to 82% of the trunk
    const fracMin = 0.1 + (f / numPrimaryForks) * 0.68;
    const frac = Math.min(0.86, fracMin + Math.random() * (0.65 / numPrimaryForks));
    const idx = Math.max(2, Math.min(mainPoints.length - 4, Math.floor(frac * mainPoints.length)));
    const forkOrigin = mainPoints[idx];

    const side = f % 2 === 0 ? 1 : -1;
    const spreadAngle =
      mainAngle + side * (0.32 + Math.random() * 0.52) + (Math.random() - 0.5) * 0.15;
    const forkLen = mainLength * (0.24 + Math.random() * 0.28) * (1 - frac * 0.35);

    const forkTarget: Point = {
      x: forkOrigin.x + Math.cos(spreadAngle) * forkLen,
      y: forkOrigin.y + Math.sin(spreadAngle) * forkLen,
    };

    const forkPoints = subdivideFractalPoints(forkOrigin, forkTarget, 5, forkLen * 0.18, 0.54);
    const forkStartWidth = (mainBaseWidth * (1 - frac * 0.45)) * 0.62;
    const forkEndProgress = Math.min(1, frac + 0.32);

    branches.push({
      tier: 1,
      segments: buildBranchSegments(
        forkPoints,
        forkStartWidth,
        0.25,
        0.85,
        frac,
        forkEndProgress
      ),
    });

    // Tier 2: Secondary sub-branches off primary forks
    const subBranchCount = 1 + Math.floor(Math.random() * 3);
    for (let s = 0; s < subBranchCount; s++) {
      const sFrac = 0.22 + Math.random() * 0.55;
      const sIdx = Math.max(1, Math.min(forkPoints.length - 2, Math.floor(sFrac * forkPoints.length)));
      const subOrigin = forkPoints[sIdx];
      const subSide = Math.random() > 0.35 ? side : -side;
      const subAngle = spreadAngle + subSide * (0.28 + Math.random() * 0.48);
      const subLen = forkLen * (0.32 + Math.random() * 0.34);

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
          forkStartWidth * 0.52,
          0.14,
          0.68,
          subProgressStart,
          Math.min(1, subProgressStart + 0.16)
        ),
      });

      // Tier 3: Hair-thin terminal capillary streamers
      if (Math.random() > 0.35 && subPoints.length > 4) {
        const tIdx = Math.floor(subPoints.length * (0.4 + Math.random() * 0.4));
        const twigOrigin = subPoints[tIdx];
        const twigAngle = subAngle + (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.5);
        const twigLen = subLen * (0.38 + Math.random() * 0.3);
        const twigTarget: Point = {
          x: twigOrigin.x + Math.cos(twigAngle) * twigLen,
          y: twigOrigin.y + Math.sin(twigAngle) * twigLen,
        };
        const twigPoints = subdivideFractalPoints(twigOrigin, twigTarget, 3, twigLen * 0.22, 0.55);
        branches.push({
          tier: 3,
          segments: buildBranchSegments(
            twigPoints,
            0.55,
            0.1,
            0.48,
            subProgressStart + 0.05,
            Math.min(1, subProgressStart + 0.2)
          ),
        });
      }
    }
  }

  // Also add fine Tier 3 leader streamers directly off the main channel
  const directTwigs = 4 + Math.floor(Math.random() * 4);
  for (let t = 0; t < directTwigs; t++) {
    const tFrac = 0.08 + Math.random() * 0.78;
    const tIdx = Math.floor(tFrac * (mainPoints.length - 2));
    const twigOrigin = mainPoints[tIdx];
    const twigSide = Math.random() > 0.5 ? 1 : -1;
    const twigAngle = mainAngle + twigSide * (0.45 + Math.random() * 0.65);
    const twigLen = mainLength * (0.07 + Math.random() * 0.09);
    const twigTarget: Point = {
      x: twigOrigin.x + Math.cos(twigAngle) * twigLen,
      y: twigOrigin.y + Math.sin(twigAngle) * twigLen,
    };
    const twigPoints = subdivideFractalPoints(twigOrigin, twigTarget, 3, twigLen * 0.22, 0.54);
    branches.push({
      tier: 3,
      segments: buildBranchSegments(
        twigPoints,
        0.75,
        0.12,
        0.55,
        tFrac,
        Math.min(1, tFrac + 0.1)
      ),
    });
  }

  // Generate 1 to 3 realistic dart-leader restrike timestamps (in ms after creation)
  const restrikeCount = isCrawler ? 1 : 1 + Math.floor(Math.random() * 3);
  const restrikeTimes: number[] = [];
  let cursor = 195 + Math.random() * 55;
  for (let r = 0; r < restrikeCount; r++) {
    restrikeTimes.push(cursor);
    cursor += 75 + Math.random() * 85;
  }

  const hueRoll = Math.random();
  const hueType: ActiveBolt['hueType'] =
    hueRoll < 0.5 ? 'cyan' : hueRoll < 0.82 ? 'ice-blue' : 'violet-blue';

  return {
    id,
    origin,
    target,
    branches,
    createdAt: now,
    leaderDuration: isCrawler ? 95 : 75,
    totalDuration: cursor + 290,
    restrikeTimes,
    hueType,
    isCrawler,
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

    // Trigger an initial realistic strike right away so the hero feels alive immediately
    const initialNow = performance.now();
    activeBolts.push(generateRealisticBolt(width, height, initialNow + 120, boltCounter++, 'right-tower'));
    activeBolts.push(generateRealisticBolt(width, height, initialNow + 480, boltCounter++, 'cloud-crawler'));

    let nextStrikeAt = initialNow + 2100;

    const getPalette = (hueType: ActiveBolt['hueType']) => {
      if (hueType === 'violet-blue') {
        return {
          outerGlow: '99, 102, 241', // Indigo plasma
          midCorona: '165, 180, 252', // Ice indigo-blue
          core: '248, 250, 252',
          cloudTint: '129, 140, 248',
        };
      }
      if (hueType === 'ice-blue') {
        return {
          outerGlow: '59, 130, 246', // Electric blue
          midCorona: '186, 230, 253', // Ice sky
          core: '255, 255, 255',
          cloudTint: '96, 165, 250',
        };
      }
      return {
        outerGlow: '56, 189, 248', // High-voltage cyan-blue
        midCorona: '125, 211, 252', // Bright sky plasma
        core: '240, 249, 255',
        cloudTint: '56, 189, 248',
      };
    };

    const renderFrame = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      if (now >= nextStrikeAt) {
        const primarySlot = Math.random() > 0.42 ? 'right-tower' : 'left-horizon';
        activeBolts.push(generateRealisticBolt(width, height, now, boltCounter++, primarySlot));

        // 38% chance of a sympathetic secondary intracloud crawler or conjugate fork 140-320ms later
        if (Math.random() < 0.38) {
          const followSlot = Math.random() > 0.45 ? 'cloud-crawler' : primarySlot === 'right-tower' ? 'left-horizon' : 'right-tower';
          activeBolts.push(
            generateRealisticBolt(width, height, now + 150 + Math.random() * 180, boltCounter++, followSlot)
          );
        }

        nextStrikeAt = now + 2200 + Math.random() * 2400;
      }

      // Remove expired bolts
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        if (now - activeBolts[i].createdAt > activeBolts[i].totalDuration) {
          activeBolts.splice(i, 1);
        }
      }

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const bolt of activeBolts) {
        const age = now - bolt.createdAt;
        if (age < 0) continue;

        const palette = getPalette(bolt.hueType);

        // Compute physics phase intensities
        // 1. Stepped leader propagation (0 -> leaderDuration)
        const leaderProgress = Math.min(1, age / bolt.leaderDuration);
        const isReturnStroke = age >= bolt.leaderDuration && age <= bolt.leaderDuration + 95;

        // Main return-stroke envelope
        let trunkIntensity = 0;
        let branchIntensity = 0;

        if (age < bolt.leaderDuration) {
          // Stepped leader descending: faint ionized trace
          trunkIntensity = 0.38;
          branchIntensity = 0.32;
        } else {
          const postLeaderAge = age - bolt.leaderDuration;
          // Initial return stroke surge + exponential plasma decay
          const initialSurge = Math.exp(-postLeaderAge / 115);
          trunkIntensity = initialSurge;
          // Side branches decay faster than the main trunk
          branchIntensity = Math.exp(-postLeaderAge / 72);

          // Dart-leader restrikes surge down the main trunk (and slightly into primary forks)
          for (const rTime of bolt.restrikeTimes) {
            const dt = age - rTime;
            if (dt >= 0 && dt < 90) {
              const pulse = Math.exp(-dt / 32) * 0.92;
              trunkIntensity = Math.max(trunkIntensity, pulse);
              branchIntensity = Math.max(branchIntensity, pulse * 0.28);
            }
          }
        }

        const skyFlashAlpha = Math.min(1, trunkIntensity) * (isReturnStroke ? 0.42 : 0.24);

        // Render synchronized in-cloud illumination at the bolt's origin & upper cloud deck
        if (skyFlashAlpha > 0.015) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          const cloudRadius = Math.max(width, height) * (bolt.isCrawler ? 0.48 : 0.55);
          const cloudGrad = ctx.createRadialGradient(
            bolt.origin.x,
            Math.max(20, bolt.origin.y + 40),
            8,
            bolt.origin.x,
            Math.max(40, bolt.origin.y + 80),
            cloudRadius
          );
          cloudGrad.addColorStop(0, `rgba(${palette.core}, ${skyFlashAlpha * 0.95})`);
          cloudGrad.addColorStop(0.22, `rgba(${palette.midCorona}, ${skyFlashAlpha * 0.65})`);
          cloudGrad.addColorStop(0.55, `rgba(${palette.cloudTint}, ${skyFlashAlpha * 0.25})`);
          cloudGrad.addColorStop(1, `rgba(${palette.cloudTint}, 0)`);

          ctx.fillStyle = cloudGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // Render each branch tier with 3-pass plasma bloom (Wide Outer Sheath -> Ionized Corona -> White-Hot Core)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const branch of bolt.branches) {
          const tierMultiplier =
            branch.tier === 0
              ? trunkIntensity
              : branch.tier === 1
                ? Math.max(branchIntensity, trunkIntensity * 0.38)
                : branch.tier === 2
                  ? branchIntensity * 0.85
                  : branchIntensity * 0.65;

          if (tierMultiplier <= 0.02) continue;

          for (const seg of branch.segments) {
            if (seg.progress > leaderProgress) continue;

            const segAlpha = Math.min(1, seg.alpha * tierMultiplier);
            if (segAlpha <= 0.015) continue;

            const avgWidth = (seg.widthStart + seg.widthEnd) * 0.5;

            // Pass 1: Wide atmospheric plasma bloom
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.strokeStyle = `rgba(${palette.outerGlow}, ${segAlpha * 0.28})`;
            ctx.lineWidth = avgWidth * (branch.tier === 0 ? 6.5 : 4.2);
            ctx.stroke();

            // Pass 2: High-voltage ionized corona sheath
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.strokeStyle = `rgba(${palette.midCorona}, ${segAlpha * 0.68})`;
            ctx.lineWidth = avgWidth * (branch.tier === 0 ? 2.6 : 1.9);
            ctx.stroke();

            // Pass 3: Scorching white-hot plasma core
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.strokeStyle = `rgba(${palette.core}, ${Math.min(1, segAlpha * 1.15)})`;
            ctx.lineWidth = Math.max(0.35, avgWidth * 0.92);
            ctx.stroke();
          }
        }

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
