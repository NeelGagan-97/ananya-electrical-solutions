import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createResidentialTwin,
  ResidentialViewMode,
  ResidentialMeshNodes
} from './residentialModelGenerators';

import { ResidentialProject } from '../types/residentialDesigner';
import {
  generateParametricTwin,
  GeneratedTwin,
  ResidentialLayerVisibility
} from './ParametricHouseGenerator';

export type ResidentialCameraPreset =
  | 'overview'
  | 'isometric'
  | 'top_plan'
  | 'db'
  | 'living'
  | 'bedroom'
  | 'guest_bed'
  | 'kitchen'
  | 'bathroom'
  | 'earth_pit';

export interface ResidentialCanvasProps {
  project?: ResidentialProject;
  viewMode: ResidentialViewMode;
  ceilingVisible: boolean;
  dbDoorOpen: boolean;
  dbExploded?: boolean;
  isPovMode?: boolean;
  layers?: ResidentialLayerVisibility;
  wallOpacity?: number;
  breakerStates?: Record<string, boolean>;
  activeCircuit: string;
  livingLightOn: boolean;
  fanSpeed: number; // 0, 1, 2, 3
  cameraPreset: ResidentialCameraPreset;
  isAutoRotate: boolean;
  onSelectComponent: (componentId: string) => void;
  onToggleLight: () => void;
  onSceneReady?: (rootObject: THREE.Object3D | null) => void;
}

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();

export const ResidentialCanvas: React.FC<ResidentialCanvasProps> = ({
  project,
  viewMode,
  ceilingVisible,
  dbDoorOpen,
  dbExploded = false,
  isPovMode = false,
  layers,
  wallOpacity = 0.28,
  breakerStates,
  activeCircuit,
  livingLightOn,
  fanSpeed,
  cameraPreset,
  isAutoRotate,
  onSelectComponent,
  onToggleLight,
  onSceneReady
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    project,
    viewMode,
    ceilingVisible,
    dbDoorOpen,
    dbExploded,
    isPovMode,
    layers,
    wallOpacity,
    breakerStates,
    activeCircuit,
    livingLightOn,
    fanSpeed,
    cameraPreset,
    isAutoRotate,
    onSelectComponent,
    onToggleLight,
    onSceneReady
  });

  useEffect(() => {
    stateRef.current = {
      project,
      viewMode,
      ceilingVisible,
      dbDoorOpen,
      dbExploded,
      isPovMode,
      layers,
      wallOpacity,
      breakerStates,
      activeCircuit,
      livingLightOn,
      fanSpeed,
      cameraPreset,
      isAutoRotate,
      onSelectComponent,
      onToggleLight,
      onSceneReady
    };
  }, [
    project,
    viewMode,
    ceilingVisible,
    dbDoorOpen,
    dbExploded,
    isPovMode,
    layers,
    wallOpacity,
    breakerStates,
    activeCircuit,
    livingLightOn,
    fanSpeed,
    cameraPreset,
    isAutoRotate,
    onSelectComponent,
    onToggleLight,
    onSceneReady
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Detection
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene, Camera & WebGLRenderer
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1329);
    scene.fog = new THREE.FogExp2(0x0b1329, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.15, 90);
    camera.position.set(-7, 9.5, 11.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio PBR Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.85);
    sunLight.position.set(10, 18, 12);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      const d = 12;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0003;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 0.6;
    controls.maxDistance = 32;
    controls.target.set(0, 1.4, 0);

    let isUserInteracting = false;
    controls.addEventListener('start', () => {
      isUserInteracting = true;
    });
    controls.addEventListener('end', () => {
      isUserInteracting = false;
    });

    // First-Person POV WASD & Mouse-Look State
    const keysPressed: Record<string, boolean> = {};
    let povYaw = 0;
    let povPitch = 0;
    let isPovDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      keysPressed[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 6. Build Residential 3D Model
    let currentParametricTwin: GeneratedTwin | null = null;
    let currentStaticTwin: ResidentialMeshNodes | null = null;

    const buildModel = () => {
      if (currentParametricTwin) {
        scene.remove(currentParametricTwin.rootGroup);
        currentParametricTwin.dispose();
        currentParametricTwin = null;
      }
      if (currentStaticTwin) {
        scene.remove(currentStaticTwin.group);
        currentStaticTwin = null;
      }

      const curProj = stateRef.current.project;
      if (curProj) {
        currentParametricTwin = generateParametricTwin(
          curProj,
          stateRef.current.viewMode,
          stateRef.current.ceilingVisible || Boolean(stateRef.current.isPovMode),
          stateRef.current.dbDoorOpen,
          stateRef.current.activeCircuit
        );
        scene.add(currentParametricTwin.rootGroup);
        stateRef.current.onSceneReady?.(currentParametricTwin.rootGroup);
      } else {
        currentStaticTwin = createResidentialTwin(
          renderer.capabilities.getMaxAnisotropy()
        );
        scene.add(currentStaticTwin.group);
        stateRef.current.onSceneReady?.(currentStaticTwin.group);
      }
    };

    buildModel();

    // Compute room-aware Camera Presets (both Orbit and Eye-Level POV at Y=1.65m)
    const getCameraPresetTarget = (
      preset: ResidentialCameraPreset,
      povMode: boolean
    ): { pos: THREE.Vector3; lookAt: THREE.Vector3 } => {
      const cx = currentParametricTwin?.houseCenter.x ?? 4.35;
      const cz = currentParametricTwin?.houseCenter.z ?? 3.5;

      // Helper to convert project coordinates (x, z) to centered world coordinates
      const toW = (px: number, py: number, pz: number) => new THREE.Vector3(px - cx, py, pz - cz);

      if (povMode) {
        const eyeY = 1.65;
        switch (preset) {
          case 'db':
            return { pos: toW(1.45, eyeY, -0.9), lookAt: toW(0.25, 1.55, -0.9) };
          case 'living':
            return { pos: toW(1.2, eyeY, 1.2), lookAt: toW(3.2, 1.5, 2.8) };
          case 'kitchen':
            return { pos: toW(6.2, eyeY, 1.5), lookAt: toW(8.2, 1.4, 1.4) };
          case 'bedroom':
            return { pos: toW(2.1, eyeY, 4.8), lookAt: toW(2.1, 1.4, 7.5) };
          case 'guest_bed':
            return { pos: toW(5.2, eyeY, 5.9), lookAt: toW(6.2, 1.4, 8.2) };
          case 'bathroom':
            return { pos: toW(5.9, eyeY, 3.8), lookAt: toW(7.3, 1.5, 4.2) };
          case 'earth_pit':
            return { pos: toW(-0.2, eyeY, -1.3), lookAt: toW(-1.4, 0.4, -1.3) };
          default:
            return { pos: toW(1.5, eyeY, 0.8), lookAt: toW(3.0, 1.55, 2.4) };
        }
      }

      switch (preset) {
        case 'top_plan':
          return { pos: new THREE.Vector3(0, 16.5, 0.01), lookAt: new THREE.Vector3(0, 0, 0) };
        case 'isometric':
          return { pos: new THREE.Vector3(-9.5, 10.5, 10.5), lookAt: new THREE.Vector3(0, 1.2, 0) };
        case 'db':
          return { pos: toW(1.9, 1.75, -0.7), lookAt: toW(0.25, 1.55, -0.9) };
        case 'living':
          return { pos: toW(0.6, 3.2, -0.8), lookAt: toW(2.7, 1.2, 2.2) };
        case 'kitchen':
          return { pos: toW(4.8, 3.2, -0.6), lookAt: toW(7.2, 1.2, 1.5) };
        case 'bedroom':
          return { pos: toW(-0.8, 3.3, 3.8), lookAt: toW(2.1, 1.2, 6.2) };
        case 'guest_bed':
          return { pos: toW(3.5, 3.3, 4.8), lookAt: toW(5.9, 1.2, 7.1) };
        case 'bathroom':
          return { pos: toW(4.8, 3.1, 2.8), lookAt: toW(6.6, 1.2, 4.2) };
        case 'earth_pit':
          return { pos: toW(-2.8, 2.0, -0.2), lookAt: toW(-1.4, 0.2, -1.3) };
        case 'overview':
        default:
          return { pos: new THREE.Vector3(-6.5, 9.2, 11.2), lookAt: new THREE.Vector3(0, 1.2, 0) };
      }
    };

    // Sync POV yaw/pitch from current camera & controls target
    const syncPovAnglesFromCamera = () => {
      const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
      povYaw = Math.atan2(dir.x, dir.z);
      povPitch = Math.asin( THREE.MathUtils.clamp(dir.y, -0.85, 0.85) );
    };

    // 7. Pointer Down / Drag / Raycasting Click Interactions
    let pointerDownTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDownTime = performance.now();
      pointerDownPos = { x: event.clientX, y: event.clientY };

      if (stateRef.current.isPovMode) {
        isPovDragging = true;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        syncPovAnglesFromCamera();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!stateRef.current.isPovMode || !isPovDragging) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      const sensitivity = 0.0032;
      povYaw -= dx * sensitivity;
      povPitch = THREE.MathUtils.clamp(povPitch - dy * sensitivity, -1.1, 1.1);

      const lookDist = 2.5;
      controls.target.set(
        camera.position.x + Math.sin(povYaw) * Math.cos(povPitch) * lookDist,
        camera.position.y + Math.sin(povPitch) * lookDist,
        camera.position.z + Math.cos(povYaw) * Math.cos(povPitch) * lookDist
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      isPovDragging = false;
      const elapsedMs = performance.now() - pointerDownTime;
      const moveDist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);

      // Only trigger raycast selection on clean click (not camera orbit/drag)
      if (elapsedMs > 300 || moveDist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_pointer, camera);

      if (currentParametricTwin) {
        const objects: THREE.Object3D[] = [];
        currentParametricTwin.interactiveMeshes.forEach((mesh) => objects.push(mesh));
        const intersects = _raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
          let hit: THREE.Object3D | null = intersects[0].object;
          while (hit && hit.parent && hit !== scene) {
            for (const [id, grp] of currentParametricTwin.interactiveMeshes.entries()) {
              if (hit === grp) {
                stateRef.current.onSelectComponent(id);
                return;
              }
            }
            hit = hit.parent;
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Track state changes
    let lastViewMode = stateRef.current.viewMode;
    let lastCeilVisible = stateRef.current.ceilingVisible || Boolean(stateRef.current.isPovMode);
    let lastProject = stateRef.current.project;
    let lastActiveCircuit = stateRef.current.activeCircuit;
    let lastCamPreset = stateRef.current.cameraPreset;
    let lastPovMode = Boolean(stateRef.current.isPovMode);
    let isPresetTransitioning = true;

    // 9. Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let doorAngle = -Math.PI * 0.55;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const {
        project: curProject,
        viewMode: curViewMode,
        ceilingVisible: curCeilVisible,
        dbDoorOpen: curDbDoorOpen,
        dbExploded: curDbExploded,
        isPovMode: curPovMode,
        layers: curLayers,
        wallOpacity: curWallOpacity,
        breakerStates: curBreakerStates,
        activeCircuit: curActiveCircuit,
        fanSpeed: curFanSpeed,
        cameraPreset: curCamPreset,
        isAutoRotate: curAutoRotate
      } = stateRef.current;

      const effectiveCeil = curCeilVisible || Boolean(curPovMode);

      if (
        curProject !== lastProject ||
        curViewMode !== lastViewMode ||
        effectiveCeil !== lastCeilVisible ||
        curActiveCircuit !== lastActiveCircuit
      ) {
        lastProject = curProject;
        lastViewMode = curViewMode;
        lastCeilVisible = effectiveCeil;
        lastActiveCircuit = curActiveCircuit;
        buildModel();
      }

      if (curCamPreset !== lastCamPreset || Boolean(curPovMode) !== lastPovMode) {
        lastCamPreset = curCamPreset;
        lastPovMode = Boolean(curPovMode);
        isPresetTransitioning = true;
      }

      if (currentParametricTwin) {
        currentParametricTwin.update(delta, curFanSpeed, curActiveCircuit, {
          layers: curLayers,
          wallOpacity: curViewMode === 'cutaway' ? curWallOpacity : 1.0,
          dbExploded: curDbExploded,
          breakerStates: curBreakerStates
        });
        if (currentParametricTwin.dbDoorPivot) {
          const targetDoorAngle = curDbDoorOpen || curDbExploded ? -Math.PI * 0.58 : 0;
          doorAngle += (targetDoorAngle - doorAngle) * (1 - Math.exp(-10 * delta));
          currentParametricTwin.dbDoorPivot.rotation.y = doorAngle;
        }
      }

      // First-Person POV WASD Free Movement
      const isMovingWasd =
        keysPressed['KeyW'] ||
        keysPressed['KeyS'] ||
        keysPressed['KeyA'] ||
        keysPressed['KeyD'] ||
        keysPressed['ArrowUp'] ||
        keysPressed['ArrowDown'] ||
        keysPressed['ArrowLeft'] ||
        keysPressed['ArrowRight'];

      if (curPovMode) {
        controls.enabled = false;
        if (isMovingWasd || isPovDragging) {
          isPresetTransitioning = false;
        }

        if (isMovingWasd) {
          syncPovAnglesFromCamera();
          const walkSpeed = 3.2 * delta;
          _forward.set(Math.sin(povYaw), 0, Math.cos(povYaw)).normalize();
          _right.set(_forward.z, 0, -_forward.x).normalize();

          const moveVec = new THREE.Vector3();
          if (keysPressed['KeyW'] || keysPressed['ArrowUp']) moveVec.add(_forward);
          if (keysPressed['KeyS'] || keysPressed['ArrowDown']) moveVec.sub(_forward);
          if (keysPressed['KeyD'] || keysPressed['ArrowRight']) moveVec.sub(_right);
          if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) moveVec.add(_right);

          if (moveVec.lengthSq() > 0) {
            moveVec.normalize().multiplyScalar(walkSpeed);
            camera.position.add(moveVec);
            camera.position.y = 1.65;

            // Clamp within apartment footprint + foyer margin
            if (currentParametricTwin) {
              const b = currentParametricTwin.buildingBounds;
              camera.position.x = THREE.MathUtils.clamp(camera.position.x, b.minX - 1.5, b.maxX + 0.5);
              camera.position.z = THREE.MathUtils.clamp(camera.position.z, b.minZ - 1.5, b.maxZ + 0.5);
            }

            const lookDist = 2.5;
            controls.target.set(
              camera.position.x + Math.sin(povYaw) * Math.cos(povPitch) * lookDist,
              camera.position.y + Math.sin(povPitch) * lookDist,
              camera.position.z + Math.cos(povYaw) * Math.cos(povPitch) * lookDist
            );
          }
        }
      } else {
        controls.enabled = true;
        if (isUserInteracting) {
          isPresetTransitioning = false;
        }
      }

      // Smooth Camera Preset / Waypoint Interpolation
      if (isPresetTransitioning) {
        const presetTarget = getCameraPresetTarget(curCamPreset, Boolean(curPovMode));
        _targetPos.copy(presetTarget.pos);
        _targetLook.copy(presetTarget.lookAt);

        camera.position.lerp(_targetPos, 1 - Math.exp(-5 * delta));
        controls.target.lerp(_targetLook, 1 - Math.exp(-5 * delta));

        if (camera.position.distanceTo(_targetPos) < 0.05 && controls.target.distanceTo(_targetLook) < 0.05) {
          isPresetTransitioning = false;
          syncPovAnglesFromCamera();
        }
      }

      if (curPovMode) {
        camera.lookAt(controls.target);
      } else {
        controls.autoRotate = curAutoRotate;
        controls.autoRotateSpeed = 1.0;
        controls.update();
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 10. Cleanup
    return () => {
      stateRef.current.onSceneReady?.(null);
      if (currentParametricTwin) {
        currentParametricTwin.dispose();
      }
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative select-none overflow-hidden ${
        isPovMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    />
  );
};
