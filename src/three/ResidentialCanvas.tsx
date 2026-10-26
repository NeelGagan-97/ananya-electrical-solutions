import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  ResidentialProject,
  InteractiveTarget,
  PlayerPose
} from '../types/residentialDesigner';
import {
  generateParametricTwin,
  GeneratedTwin,
  ViewMode3D,
  ResidentialLayerVisibility,
  CircuitSubLayerFilter
} from './ParametricHouseGenerator';

export type CameraMode = 'orbit' | 'fpp';
export type CameraPreset =
  | 'overview'
  | 'top'
  | 'exterior_entry'
  | 'foyer'
  | 'living'
  | 'master_bed'
  | 'bed2'
  | 'kitchen'
  | 'bath1'
  | 'db';

export interface MobileWalkInput {
  moveX: number; // -1 (left) to +1 (right)
  moveY: number; // -1 (back) to +1 (forward)
  lookX: number; // -1 to +1 yaw rate
  lookY: number; // -1 to +1 pitch rate
}

interface ResidentialCanvasProps {
  project: ResidentialProject;
  viewMode: ViewMode3D;
  cameraMode: CameraMode;
  cameraPreset: CameraPreset;
  ceilingVisible: boolean;
  dbDoorOpen: boolean;
  dbExploded: boolean;
  wallOpacity: number;
  layers: ResidentialLayerVisibility;
  circuitFilter?: CircuitSubLayerFilter;
  breakerStates: Record<string, boolean>;
  doorStates: Record<string, boolean>;
  fanSpeed: number;
  activeCircuit: string;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onToggleBreaker?: (circuitId: string) => void;
  onToggleDoor?: (doorId: string) => void;
  onInteractTarget?: (target: InteractiveTarget) => void;
  onHoverTargetChange?: (target: InteractiveTarget | null) => void;
  onPlayerPoseChange?: (pose: PlayerPose) => void;
  onPointerLockChange?: (locked: boolean) => void;
  isWalkthroughStarted?: boolean;
  isWalkthroughPaused?: boolean;
  pointerLockTrigger?: number;
  teleportTarget?: { x: number; z: number; yaw?: number; seq: number } | null;
  mobileInput?: MobileWalkInput;
  exportTrigger?: { format: 'glb' | 'gltf'; seq: number } | null;
}

export const ResidentialCanvas: React.FC<ResidentialCanvasProps> = ({
  project,
  viewMode,
  cameraMode,
  cameraPreset,
  ceilingVisible,
  dbDoorOpen,
  dbExploded,
  wallOpacity,
  layers,
  circuitFilter,
  breakerStates,
  doorStates,
  fanSpeed,
  activeCircuit,
  selectedComponentId,
  onSelectComponent,
  onToggleBreaker,
  onToggleDoor,
  onInteractTarget,
  onHoverTargetChange,
  onPlayerPoseChange,
  onPointerLockChange,
  isWalkthroughStarted = false,
  isWalkthroughPaused = false,
  pointerLockTrigger = 0,
  teleportTarget = null,
  mobileInput,
  exportTrigger
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const twinRef = useRef<GeneratedTwin | null>(null);

  // Live refs for animation loop access without re-binding listeners
  const projectRef = useRef(project);
  projectRef.current = project;

  const fanSpeedRef = useRef(fanSpeed);
  fanSpeedRef.current = fanSpeed;

  const activeCircuitRef = useRef(activeCircuit);
  activeCircuitRef.current = activeCircuit;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const layersRef = useRef(layers);
  layersRef.current = layers;

  const circuitFilterRef = useRef(circuitFilter);
  circuitFilterRef.current = circuitFilter;

  const wallOpacityRef = useRef(wallOpacity);
  wallOpacityRef.current = wallOpacity;

  const dbExplodedRef = useRef(dbExploded);
  dbExplodedRef.current = dbExploded;

  const dbDoorOpenRef = useRef(dbDoorOpen);
  dbDoorOpenRef.current = dbDoorOpen;

  const breakerStatesRef = useRef(breakerStates);
  breakerStatesRef.current = breakerStates;

  const doorStatesRef = useRef(doorStates);
  doorStatesRef.current = doorStates;

  const isStartedRef = useRef(isWalkthroughStarted);
  isStartedRef.current = isWalkthroughStarted;

  const isPausedRef = useRef(isWalkthroughPaused);
  isPausedRef.current = isWalkthroughPaused;

  const mobileInputRef = useRef<MobileWalkInput>(
    mobileInput || { moveX: 0, moveY: 0, lookX: 0, lookY: 0 }
  );
  if (mobileInput) {
    mobileInputRef.current = mobileInput;
  }

  // Callbacks refs
  const onSelectCompRef = useRef(onSelectComponent);
  onSelectCompRef.current = onSelectComponent;
  const onToggleBreakerRef = useRef(onToggleBreaker);
  onToggleBreakerRef.current = onToggleBreaker;
  const onToggleDoorRef = useRef(onToggleDoor);
  onToggleDoorRef.current = onToggleDoor;
  const onInteractTargetRef = useRef(onInteractTarget);
  onInteractTargetRef.current = onInteractTarget;
  const onHoverTargetChangeRef = useRef(onHoverTargetChange);
  onHoverTargetChangeRef.current = onHoverTargetChange;
  const onPlayerPoseChangeRef = useRef(onPlayerPoseChange);
  onPlayerPoseChangeRef.current = onPlayerPoseChange;
  const onPointerLockChangeRef = useRef(onPointerLockChange);
  onPointerLockChangeRef.current = onPointerLockChange;

  // FPP state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const fppYaw = useRef<number>(Math.PI); // Facing South (+Z) toward Main Entrance Door
  const fppPitch = useRef<number>(-0.02);
  const isDraggingLook = useRef<boolean>(false);
  const prevMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const walkCycleRef = useRef<number>(0);
  const currentHoverRef = useRef<InteractiveTarget | null>(null);
  const lastPoseEmitRef = useRef<number>(0);

  // Smooth camera transition ref
  const cameraTransitionRef = useRef<{
    active: boolean;
    targetPos: THREE.Vector3;
    targetLook: THREE.Vector3;
  }>({
    active: false,
    targetPos: new THREE.Vector3(),
    targetLook: new THREE.Vector3()
  });

  // 1. Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b132b);
    scene.fog = new THREE.FogExp2(0x0b132b, 0.008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 220);
    camera.position.set(18, 16, 21);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 1.2;
    controls.maxDistance = 65;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // Studio & Architectural Lighting
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 0.96);
    hemiLight.position.set(0, 26, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
    sunLight.position.set(20, 34, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 85;
    const d = 24;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    fillLight.position.set(-20, 16, -18);
    scene.add(fillLight);

    // Helper: Resolve Circle-vs-AABB Sliding Collision in World Space
    const resolvePlayerCollisions = (nextX: number, nextZ: number): { x: number; z: number } => {
      const twin = twinRef.current;
      if (!twin) return { x: nextX, z: nextZ };

      const radius = 0.21; // Slim player collision radius for smooth free walking
      let resolvedX = nextX;
      let resolvedZ = nextZ;

      // Bound within outdoor plinth perimeter
      const b = twin.buildingBounds;
      resolvedX = Math.max(b.minX, Math.min(b.maxX, resolvedX));
      resolvedZ = Math.max(b.minZ, Math.min(b.maxZ, resolvedZ));

      // Iterative circle-vs-AABB resolution for smooth wall sliding
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < twin.colliders.length; i++) {
          const col = twin.colliders[i];
          // Skip open doors so player can walk right through open doorways!
          if (col.category === 'door' && col.doorId && doorStatesRef.current[col.doorId]) {
            continue;
          }

          const closestX = Math.max(col.minX, Math.min(resolvedX, col.maxX));
          const closestZ = Math.max(col.minZ, Math.min(resolvedZ, col.maxZ));
          const dx = resolvedX - closestX;
          const dz = resolvedZ - closestZ;
          const distSq = dx * dx + dz * dz;

          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const overlap = radius - dist;
              resolvedX += (dx / dist) * overlap;
              resolvedZ += (dz / dist) * overlap;
            } else {
              // Center is inside box; push out along minimum penetration axis
              const penLeft = Math.abs(resolvedX - col.minX);
              const penRight = Math.abs(col.maxX - resolvedX);
              const penTop = Math.abs(resolvedZ - col.minZ);
              const penBot = Math.abs(col.maxZ - resolvedZ);
              const minPen = Math.min(penLeft, penRight, penTop, penBot);
              if (minPen === penLeft) resolvedX = col.minX - radius;
              else if (minPen === penRight) resolvedX = col.maxX + radius;
              else if (minPen === penTop) resolvedZ = col.minZ - radius;
              else resolvedZ = col.maxZ + radius;
            }
          }
        }
      }

      return { x: resolvedX, z: resolvedZ };
    };

    // Helper: Proximity & Crosshair Target Detection in FPP Mode
    const detectProximityTarget = (): InteractiveTarget | null => {
      const twin = twinRef.current;
      if (!twin) return null;

      const camPos = camera.position;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
      const maxReach = 4.6;

      let bestTarget: InteractiveTarget | null = null;
      let bestScore = Infinity;

      // 1. Check interactive doors within reach and view cone
      twin.doorPivots.forEach((doorEntry, doorId) => {
        const doorPos = new THREE.Vector3(doorEntry.worldX, 1.35, doorEntry.worldZ);
        const toDoor = doorPos.clone().sub(camPos);
        const dist = toDoor.length();
        if (dist > maxReach) return;

        const dir = toDoor.normalize();
        const dot = forward.dot(dir);
        if (dot > 0.55) {
          const score = dist * (1.25 - dot);
          if (score < bestScore) {
            bestScore = score;
            const isOpen = !!doorStatesRef.current[doorId];
            bestTarget = {
              type: 'door',
              id: doorId,
              label: doorEntry.label,
              sublabel: isOpen ? 'Press [E] or Click to Close Door' : 'Press [E] or Click to Open Door',
              roomId: doorEntry.roomId,
              isOpen,
              distance: dist
            };
          }
        }
      });

      // 2. Check electrical points (Switchboards, Main DB, Sockets, Geyser, AC, Fans)
      const centerX = twin.houseCenter.x;
      const centerZ = twin.houseCenter.z;
      projectRef.current.electricalPoints.forEach((pt) => {
        if (pt.type === 'downlight_led' || pt.type === 'earth_pit') return;
        const ptWorldPos = new THREE.Vector3(pt.x - centerX, pt.y, pt.z - centerZ);
        const toPt = ptWorldPos.clone().sub(camPos);
        const dist = toPt.length();
        const reachLimit = pt.type === 'ceiling_fan' ? 5.6 : maxReach;
        if (dist > reachLimit) return;

        const dir = toPt.normalize();
        const dot = forward.dot(dir);
        if (dot > 0.62) {
          const score = dist * (1.22 - dot);
          if (score < bestScore) {
            bestScore = score;
            const isDb = pt.type === 'db';
            bestTarget = {
              type: isDb ? 'db' : 'electrical',
              id: pt.id,
              label: pt.name,
              sublabel: isDb
                ? 'Press [E] or Click to Inspect 8-Way TPN Distribution Board'
                : pt.type === 'switch_board_6a'
                ? 'Press [E] or Click to Toggle Room Lights & Ceiling Fan'
                : `Press [E] or Click to Toggle Power (${pt.powerWatts}W @ 230V)`,
              roomId: pt.roomId,
              circuitId: pt.circuitId,
              isOn: pt.isOn,
              powerWatts: pt.powerWatts,
              distance: dist
            };
          }
        }
      });

      return bestTarget;
    };

    // Keyboard & Pointer Lock Listeners for FPP
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      const code = e.code;
      keysPressed.current[code] = true;

      // [E] Key: Interact with hovered door, switchboard, DB, or appliance
      if (code === 'KeyE' && cameraModeRef.current === 'fpp' && !isPausedRef.current) {
        const target = currentHoverRef.current;
        if (target && onInteractTargetRef.current) {
          e.preventDefault();
          onInteractTargetRef.current(target);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const onPointerLockChangeEvent = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      if (onPointerLockChangeRef.current) {
        onPointerLockChangeRef.current(locked);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChangeEvent);

    // Mouse Look & Click Interaction
    let downX = 0;
    let downY = 0;

    const onMouseDown = (ev: MouseEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
      if (cameraModeRef.current === 'fpp' && document.pointerLockElement !== renderer.domElement) {
        isDraggingLook.current = true;
        prevMouse.current = { x: ev.clientX, y: ev.clientY };
      }
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (cameraModeRef.current !== 'fpp' || isPausedRef.current) return;

      // 1. Immersive Pointer Lock Free Look
      if (document.pointerLockElement === renderer.domElement) {
        const sensitivity = 0.0022;
        fppYaw.current -= ev.movementX * sensitivity;
        fppPitch.current = Math.max(
          -Math.PI / 2.25,
          Math.min(Math.PI / 2.25, fppPitch.current - ev.movementY * sensitivity)
        );
        cameraTransitionRef.current.active = false;
        return;
      }

      // 2. Fallback Drag Look when Pointer Lock is not active
      if (isDraggingLook.current) {
        const dx = ev.clientX - prevMouse.current.x;
        const dy = ev.clientY - prevMouse.current.y;
        prevMouse.current = { x: ev.clientX, y: ev.clientY };
        fppYaw.current -= dx * 0.004;
        fppPitch.current = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, fppPitch.current - dy * 0.0035));
        cameraTransitionRef.current.active = false;
      }
    };

    const onMouseUp = (ev: MouseEvent) => {
      isDraggingLook.current = false;
      const moveDist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
      if (moveDist > 6 || !twinRef.current) return;

      // If in FPP Mode:
      if (cameraModeRef.current === 'fpp' && isStartedRef.current && !isPausedRef.current) {
        // Lock pointer on canvas click if not already locked
        if (document.pointerLockElement !== renderer.domElement) {
          try {
            renderer.domElement.requestPointerLock?.();
          } catch {
            // Ignore sandbox pointer lock restriction
          }
        }
        // Trigger interaction if crosshair is aiming at a target
        if (currentHoverRef.current && onInteractTargetRef.current) {
          onInteractTargetRef.current(currentHoverRef.current);
          return;
        }
      }

      // Direct Raycast Click (Works in both Orbit Mode and FPP Mode)
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const candidates: THREE.Object3D[] = [];
      twinRef.current.interactiveMeshes.forEach((obj) => candidates.push(obj));

      const hits = raycaster.intersectObjects(candidates, true);
      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj) {
          for (const [id, meshGroup] of twinRef.current.interactiveMeshes.entries()) {
            if (meshGroup === hitObj) {
              if (id.startsWith('door_')) {
                const doorId = id.replace('door_', '');
                if (onToggleDoorRef.current) {
                  onToggleDoorRef.current(doorId);
                }
              } else if (id.startsWith('breaker_')) {
                const circId = id.replace('breaker_', '');
                if (onToggleBreakerRef.current) {
                  onToggleBreakerRef.current(circId);
                }
              } else {
                onSelectCompRef.current(id);
              }
              return;
            }
          }
          hitObj = hitObj.parent;
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth Camera Preset Transition
      if (cameraTransitionRef.current.active) {
        const alpha = 1 - Math.exp(-7 * delta);
        camera.position.lerp(cameraTransitionRef.current.targetPos, alpha);

        if (cameraModeRef.current === 'orbit') {
          controls.target.lerp(cameraTransitionRef.current.targetLook, alpha);
        } else {
          camera.lookAt(cameraTransitionRef.current.targetLook);
        }

        if (camera.position.distanceTo(cameraTransitionRef.current.targetPos) < 0.05) {
          cameraTransitionRef.current.active = false;
          if (cameraModeRef.current === 'fpp') {
            const dir = new THREE.Vector3()
              .subVectors(cameraTransitionRef.current.targetLook, camera.position)
              .normalize();
            fppPitch.current = Math.asin(Math.max(-0.98, Math.min(0.98, dir.y)));
            fppYaw.current = Math.atan2(-dir.x, -dir.z);
          }
        }
      }

      if (cameraModeRef.current === 'fpp' && !cameraTransitionRef.current.active) {
        // Apply Mobile Virtual Look Joystick if active
        const mob = mobileInputRef.current;
        if (Math.abs(mob.lookX) > 0.01 || Math.abs(mob.lookY) > 0.01) {
          fppYaw.current -= mob.lookX * 1.9 * delta;
          fppPitch.current = Math.max(
            -Math.PI / 2.3,
            Math.min(Math.PI / 2.3, fppPitch.current - mob.lookY * 1.5 * delta)
          );
        }

        if (isStartedRef.current && !isPausedRef.current) {
          const isSprint =
            keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'];
          const walkSpeed = (isSprint ? 8.8 : 5.2) * delta;

          const forward = new THREE.Vector3(
            -Math.sin(fppYaw.current),
            0,
            -Math.cos(fppYaw.current)
          ).normalize();
          const right = new THREE.Vector3(
            Math.cos(fppYaw.current),
            0,
            -Math.sin(fppYaw.current)
          ).normalize();

          let moveForward = 0;
          let moveRight = 0;

          if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveForward += 1;
          if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveForward -= 1;
          if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveRight += 1;
          if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveRight -= 1;

          // Combine with Mobile Virtual Walk Joystick
          moveForward += mob.moveY;
          moveRight += mob.moveX;

          const moveVec = new THREE.Vector3();
          moveVec.addScaledVector(forward, moveForward);
          moveVec.addScaledVector(right, moveRight);

          if (moveVec.lengthSq() > 0.001) {
            if (moveVec.length() > 1) moveVec.normalize();
            const desiredX = camera.position.x + moveVec.x * walkSpeed;
            const desiredZ = camera.position.z + moveVec.z * walkSpeed;

            const resolved = resolvePlayerCollisions(desiredX, desiredZ);
            camera.position.x = resolved.x;
            camera.position.z = resolved.z;

            walkCycleRef.current += delta * (isSprint ? 13 : 9.5);
            camera.position.y = 1.75 + Math.sin(walkCycleRef.current) * 0.024;
          } else {
            // Smoothly settle eye height back to 1.75m when standing still
            camera.position.y += (1.75 - camera.position.y) * (1 - Math.exp(-10 * delta));
          }
        } else {
          camera.position.y = 1.75;
        }

        const euler = new THREE.Euler(fppPitch.current, fppYaw.current, 0, 'YXZ');
        camera.quaternion.setFromEuler(euler);

        // Proximity Raycasting for [E] / Reticle HUD
        const detected = detectProximityTarget();
        const prev = currentHoverRef.current;
        if (
          detected?.id !== prev?.id ||
          detected?.isOpen !== prev?.isOpen ||
          detected?.isOn !== prev?.isOn
        ) {
          currentHoverRef.current = detected;
          if (onHoverTargetChangeRef.current) {
            onHoverTargetChangeRef.current(detected);
          }
        }
      } else if (cameraModeRef.current === 'orbit') {
        if (currentHoverRef.current !== null) {
          currentHoverRef.current = null;
          if (onHoverTargetChangeRef.current) {
            onHoverTargetChangeRef.current(null);
          }
        }
        controls.update();
      }

      // Emit Player Pose for Live 2D Radar Mini-Map & Dynamic Room Banner (~15Hz)
      const now = performance.now();
      if (twinRef.current && now - lastPoseEmitRef.current > 65) {
        lastPoseEmitRef.current = now;
        const projX = camera.position.x + twinRef.current.houseCenter.x;
        const projZ = camera.position.z + twinRef.current.houseCenter.z;

        const currentRoom = projectRef.current.rooms.find(
          (r) =>
            projX >= r.x - 0.08 &&
            projX <= r.x + r.width + 0.08 &&
            projZ >= r.z - 0.08 &&
            projZ <= r.z + r.length + 0.08
        );

        if (onPlayerPoseChangeRef.current) {
          onPlayerPoseChangeRef.current({
            projectX: projX,
            projectZ: projZ,
            yaw: fppYaw.current,
            roomId: currentRoom?.id || null,
            roomName: currentRoom?.name || 'Exterior Entrance Corridor'
          });
        }
      }

      // Update Twin Animations, Doors, Lights, Fans & Conduits
      if (twinRef.current) {
        twinRef.current.update(delta, fanSpeedRef.current, activeCircuitRef.current, {
          layers: layersRef.current,
          circuitFilter: circuitFilterRef.current,
          wallOpacity: wallOpacityRef.current,
          dbExploded: dbExplodedRef.current,
          dbDoorOpen: dbDoorOpenRef.current,
          breakerStates: breakerStatesRef.current,
          doorStates: doorStatesRef.current,
          electricalPoints: projectRef.current.electricalPoints
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChangeEvent);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (twinRef.current) {
        twinRef.current.dispose();
      }
      renderer.dispose();
    };
  }, []);

  // 2. Request or Exit Pointer Lock when triggered by parent UI ("Enter Apartment" / "Resume" / "Pause")
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    if (cameraMode === 'fpp' && isWalkthroughStarted && !isWalkthroughPaused && pointerLockTrigger > 0) {
      try {
        renderer.domElement.requestPointerLock?.();
      } catch {
        // Ignore iframe pointer lock error
      }
    } else if (isWalkthroughPaused || cameraMode === 'orbit') {
      if (document.pointerLockElement === renderer.domElement) {
        try {
          document.exitPointerLock?.();
        } catch {
          // Ignore
        }
      }
    }
  }, [pointerLockTrigger, isWalkthroughStarted, isWalkthroughPaused, cameraMode]);

  // 3. Rebuild 3D Parametric Twin ONLY when structural geometry or viewMode changes
  // (Electrical point toggles, door swings, breaker trips, and activeCircuit are updated live at 60fps in animate!)
  const structuralKey = `${project.id}_${project.rooms.length}_${project.openings.length}_${viewMode}_${ceilingVisible}`;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (twinRef.current) {
      scene.remove(twinRef.current.rootGroup);
      twinRef.current.dispose();
    }

    const newTwin = generateParametricTwin(
      project,
      viewMode,
      ceilingVisible,
      dbDoorOpenRef.current,
      activeCircuitRef.current
    );
    scene.add(newTwin.rootGroup);
    twinRef.current = newTwin;
  }, [structuralKey]);

  // 4. Handle Camera Mode & Room POV Presets
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const twin = twinRef.current;
    if (!camera || !controls || !twin) return;

    controls.enabled = cameraMode === 'orbit';

    const cx = twin.houseCenter.x;
    const cz = twin.houseCenter.z;

    const findRoomCenter = (type: string, fallbackX: number, fallbackZ: number) => {
      const rm = project.rooms.find((r) => r.type === type);
      if (!rm) return { x: fallbackX - cx, z: fallbackZ - cz, w: 3.5, l: 3.5 };
      return {
        x: rm.x + rm.width / 2 - cx,
        z: rm.z + rm.length / 2 - cz,
        w: rm.width,
        l: rm.length
      };
    };

    const foyer = findRoomCenter('foyer', 2.5, -1.8);
    const living = findRoomCenter('living', 5.5, 4.2);
    const master = findRoomCenter('master_bedroom', 4.2, 12.2);
    const bed2 = findRoomCenter('bedroom_2', 12.0, 12.2);
    const kitchen = findRoomCenter('kitchen', 14.2, 2.7);
    const bath1 = findRoomCenter('bathroom', 13.4, 6.9);

    const dbPt = project.electricalPoints.find((p) => p.type === 'db');
    const dbX = dbPt ? dbPt.x - cx : foyer.x - 1.2;
    const dbY = dbPt ? dbPt.y : 1.65;
    const dbZ = dbPt ? dbPt.z - cz : foyer.z;

    const eyeH = 1.75;
    let targetPos = new THREE.Vector3();
    let targetLook = new THREE.Vector3();

    if (cameraMode === 'fpp') {
      switch (cameraPreset) {
        case 'exterior_entry':
        case 'overview':
        case 'top': {
          // Spawn outside the Main Apartment Entrance Door facing South toward the Foyer Door
          const foyerRm = project.rooms.find((r) => r.type === 'foyer');
          const spawnX = (foyerRm ? foyerRm.x + foyerRm.width / 2 : 2.5) - cx;
          const spawnZ = (foyerRm ? foyerRm.z - 1.5 : -5.1) - cz;
          targetPos.set(spawnX, eyeH, spawnZ);
          targetLook.set(spawnX, eyeH - 0.04, spawnZ + 4.0);
          break;
        }
        case 'foyer':
          targetPos.set(foyer.x, eyeH, foyer.z - 0.5);
          targetLook.set(foyer.x, eyeH - 0.05, living.z);
          break;
        case 'db':
          targetPos.set(dbX + 1.6, eyeH - 0.08, dbZ + 0.8);
          targetLook.set(dbX, dbY, dbZ);
          break;
        case 'living':
          targetPos.set(living.x - 2.0, eyeH, living.z - 1.4);
          targetLook.set(living.x + 1.4, eyeH - 0.1, living.z + 1.5);
          break;
        case 'master_bed':
          targetPos.set(master.x + 1.2, eyeH, master.z - 1.8);
          targetLook.set(master.x - 0.4, eyeH - 0.15, master.z + 1.6);
          break;
        case 'bed2':
          targetPos.set(bed2.x - 1.0, eyeH, bed2.z - 1.8);
          targetLook.set(bed2.x + 0.4, eyeH - 0.15, bed2.z + 1.6);
          break;
        case 'kitchen':
          targetPos.set(kitchen.x - 1.5, eyeH, kitchen.z + 0.2);
          targetLook.set(kitchen.x + 1.5, eyeH - 0.15, kitchen.z);
          break;
        case 'bath1':
          targetPos.set(bath1.x - 1.1, eyeH, bath1.z);
          targetLook.set(bath1.x + 1.1, eyeH - 0.15, bath1.z);
          break;
      }
    } else {
      switch (cameraPreset) {
        case 'overview':
        case 'exterior_entry':
          targetPos.set(17.5, 16.5, 20.5);
          targetLook.set(0, 1.4, 0.5);
          break;
        case 'top':
          targetPos.set(0, 28.0, 0.01);
          targetLook.set(0, 0, 0);
          break;
        case 'foyer':
          targetPos.set(foyer.x + 3.2, 5.2, foyer.z - 3.8);
          targetLook.set(foyer.x, 1.6, foyer.z);
          break;
        case 'db':
          targetPos.set(dbX + 1.8, dbY + 0.35, dbZ + 1.5);
          targetLook.set(dbX + 0.1, dbY, dbZ + 0.15);
          break;
        case 'living':
          targetPos.set(living.x - 3.8, 5.8, living.z + 4.4);
          targetLook.set(living.x + 0.6, 1.4, living.z);
          break;
        case 'master_bed':
          targetPos.set(master.x + 3.6, 5.5, master.z - 3.6);
          targetLook.set(master.x, 1.2, master.z + 0.5);
          break;
        case 'bed2':
          targetPos.set(bed2.x - 3.4, 5.5, bed2.z - 3.4);
          targetLook.set(bed2.x, 1.2, bed2.z + 0.4);
          break;
        case 'kitchen':
          targetPos.set(kitchen.x - 3.6, 5.4, kitchen.z + 3.0);
          targetLook.set(kitchen.x + 0.6, 1.3, kitchen.z);
          break;
        case 'bath1':
          targetPos.set(bath1.x - 2.8, 5.0, bath1.z + 2.4);
          targetLook.set(bath1.x + 0.4, 1.2, bath1.z);
          break;
      }
    }

    cameraTransitionRef.current = {
      active: true,
      targetPos,
      targetLook
    };
  }, [cameraMode, cameraPreset, structuralKey]);

  // 5. Handle Direct Teleport from 2D Mini-Map or Reset Spawn Button
  useEffect(() => {
    if (!teleportTarget || !cameraRef.current || !twinRef.current) return;
    const cx = twinRef.current.houseCenter.x;
    const cz = twinRef.current.houseCenter.z;
    const wx = teleportTarget.x - cx;
    const wz = teleportTarget.z - cz;

    cameraTransitionRef.current.active = false;
    cameraRef.current.position.set(wx, 1.75, wz);
    if (teleportTarget.yaw !== undefined) {
      fppYaw.current = teleportTarget.yaw;
      fppPitch.current = -0.02;
    }
  }, [teleportTarget]);

  // 6. Focus Camera when a specific Electrical Component is selected in Orbit Mode
  useEffect(() => {
    if (!selectedComponentId || !twinRef.current || cameraMode !== 'orbit') return;
    const pt = project.electricalPoints.find((p) => p.id === selectedComponentId);
    if (!pt) return;

    const cx = twinRef.current.houseCenter.x;
    const cz = twinRef.current.houseCenter.z;
    const wx = pt.x - cx;
    const wy = pt.y;
    const wz = pt.z - cz;

    cameraTransitionRef.current = {
      active: true,
      targetPos: new THREE.Vector3(wx + 1.8, Math.max(wy + 0.8, 2.2), wz + 1.8),
      targetLook: new THREE.Vector3(wx, wy, wz)
    };
  }, [selectedComponentId]);

  // 7. Handle 3D GLB / glTF Export
  useEffect(() => {
    if (!exportTrigger || !twinRef.current) return;
    const exporter = new GLTFExporter();
    const isBinary = exportTrigger.format === 'glb';

    exporter.parse(
      twinRef.current.rootGroup,
      (result) => {
        const blob =
          result instanceof ArrayBuffer
            ? new Blob([result], { type: 'application/octet-stream' })
            : new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeName = project.meta.projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
        link.download = `${safeName}_2BHK_CAD.${exportTrigger.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      (err) => {
        console.error('GLTF export error:', err);
      },
      { binary: isBinary }
    );
  }, [exportTrigger, project.meta.projectName]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#0b132b]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
