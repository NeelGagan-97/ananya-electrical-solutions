import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createTransformerGroup,
  createBreakerGroup,
  createSolarTrackerGroup,
  createMeteringAndMastGroup,
  createSwitchyardEnvironment,
  TransformerMeshNodes,
  BreakerMeshNodes,
  SolarTrackerNodes
} from './modelGenerators';

export type CameraPreset = 'overview' | 'transformer' | 'breaker' | 'solar' | 'metering';
export type VisualMode = 'pbr' | 'energized' | 'thermal' | 'night';

export interface SubstationCanvasProps {
  cameraPreset: CameraPreset;
  explodedRatio: number; // 0 to 1
  visualMode: VisualMode;
  breakerClosed: boolean;
  solarTilt: number; // degrees -30 to +30
  isAutoRotate: boolean;
  onSelectComponent: (componentId: string) => void;
}

// Pre-allocated scratch vectors to avoid GC in animation loop
const _scratchVec3A = new THREE.Vector3();
const _scratchVec3B = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

export const SubstationCanvas: React.FC<SubstationCanvasProps> = ({
  cameraPreset,
  explodedRatio,
  visualMode,
  breakerClosed,
  solarTilt,
  isAutoRotate,
  onSelectComponent
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    cameraPreset,
    explodedRatio,
    visualMode,
    breakerClosed,
    solarTilt,
    isAutoRotate,
    onSelectComponent
  });

  // Keep stateRef up to date without remounting WebGL canvas
  useEffect(() => {
    stateRef.current = {
      cameraPreset,
      explodedRatio,
      visualMode,
      breakerClosed,
      solarTilt,
      isAutoRotate,
      onSelectComponent
    };
  }, [cameraPreset, explodedRatio, visualMode, breakerClosed, solarTilt, isAutoRotate, onSelectComponent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
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
    scene.background = new THREE.Color(0x0f172a); // Deep industrial navy twilight
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.2, 120);
    camera.position.set(0, 9, 17);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio PBR Environment Map via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Rig Lighting
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    keyLight.position.set(12, 22, 10);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 45;
      const d = 16;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.75);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const blueAccentLight = new THREE.PointLight(0x0284c7, 1.2, 25);
    blueAccentLight.position.set(-6, 8, 4);
    scene.add(blueAccentLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going under ground
    controls.minDistance = 2.5;
    controls.maxDistance = 35;
    controls.target.set(0, 1.8, 0);

    let isUserInteracting = false;
    controls.addEventListener('start', () => {
      isUserInteracting = true;
    });
    controls.addEventListener('end', () => {
      isUserInteracting = false;
    });

    // 6. Build Procedural Substation Yard
    const environmentGroup = createSwitchyardEnvironment();
    scene.add(environmentGroup);

    // Transformer (-4.0, 0, 0)
    const transformer: TransformerMeshNodes = createTransformerGroup(
      renderer.capabilities.getMaxAnisotropy()
    );
    transformer.group.position.set(-4.0, 0, 0);
    scene.add(transformer.group);

    // Breaker (+3.5, 0, 0)
    const breaker: BreakerMeshNodes = createBreakerGroup();
    breaker.group.position.set(3.5, 0, 0);
    scene.add(breaker.group);

    // Solar PV Tracker Array kept only as an internal reference node (not added to 33kV Substation switchyard scene)
    const solarTracker: SolarTrackerNodes = createSolarTrackerGroup(
      renderer.capabilities.getMaxAnisotropy()
    );

    // CT/PT Metering & Lightning Mast (+8.5, 0, -0.5)
    const meteringGroup = createMeteringAndMastGroup();
    meteringGroup.position.set(8.5, 0, -0.5);
    scene.add(meteringGroup);

    // Overhead high-voltage connecting busbars (Copper conduits with suspension insulators)
    const busbarMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.15
    });

    // Busbar curve: Transformer LV/HV -> Breaker -> Metering & Grid takeoff
    const mainBusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.0, 3.8, 0.5), // transformer LV
      new THREE.Vector3(-4.0, 4.3, -0.4), // transformer HV
      new THREE.Vector3(-0.2, 4.8, -0.4), // overhead span
      new THREE.Vector3(3.5, 3.8, -0.3), // Breaker input
      new THREE.Vector3(3.5, 3.8, 0.4), // Breaker output
      new THREE.Vector3(8.5, 2.0, 0) // Metering & Grid takeoff
    ]);

    const busbarGeo = new THREE.TubeGeometry(mainBusCurve, 48, 0.04, 8, false);
    const busbarMesh = new THREE.Mesh(busbarGeo, busbarMat);
    scene.add(busbarMesh);

    // 7. Energized Particle System (Animated glowing electrons flowing along busbars)
    const pulseCount = 14;
    const pulseSpheres: THREE.Mesh[] = [];
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const pulseGeo = new THREE.SphereGeometry(0.1, 12, 12);

    for (let i = 0; i < pulseCount; i++) {
      const p = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(p);
      pulseSpheres.push(p);
    }

    // Camera preset coordinates
    const cameraPresetsMap: Record<CameraPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
      overview: { pos: new THREE.Vector3(0, 9, 17), lookAt: new THREE.Vector3(0, 1.8, 0) },
      transformer: { pos: new THREE.Vector3(-4.0, 4.2, 5.8), lookAt: new THREE.Vector3(-4.0, 2.2, 0) },
      breaker: { pos: new THREE.Vector3(3.5, 3.8, 5.2), lookAt: new THREE.Vector3(3.5, 2.0, 0) },
      solar: { pos: new THREE.Vector3(0, 4.8, -10.5), lookAt: new THREE.Vector3(0, 1.8, -5.5) },
      metering: { pos: new THREE.Vector3(8.5, 4.2, 4.2), lookAt: new THREE.Vector3(8.5, 2.2, 0) }
    };

    // 8. Raycasting Click Interaction
    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_pointer, camera);
      const intersects = _raycaster.intersectObjects([
        transformer.group,
        breaker.group,
        solarTracker.group,
        meteringGroup
      ], true);

      if (intersects.length > 0) {
        let hit: THREE.Object3D | null = intersects[0].object;
        while (hit && hit.parent && hit !== scene) {
          if (hit.name === 'transformer_root') {
            stateRef.current.onSelectComponent('transformer');
            return;
          }
          if (hit.name === 'breaker_root') {
            stateRef.current.onSelectComponent('breaker');
            return;
          }
          if (hit.name === 'solar_array_root') {
            stateRef.current.onSelectComponent('solar');
            return;
          }
          if (hit.name === 'metering_mast_root') {
            stateRef.current.onSelectComponent('metering');
            return;
          }
          hit = hit.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Keyboard WASD Movement
    const keysPressed: Record<string, boolean> = {};
    let hasMovedManually = false;
    let lastPresetTracked = stateRef.current.cameraPreset;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      keysPressed[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation & Render Loop with Exponential Damping
    const clock = new THREE.Clock();
    let frameId = 0;
    let pulseT = 0;

    // Damped values for smooth spring transitions
    let currentExploded = 0;
    let currentSolarTilt = 0;
    let currentBladeAngle = 0;

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
      const elapsed = clock.getElapsedTime();
      const {
        cameraPreset: curPreset,
        explodedRatio: curExp,
        visualMode: curMode,
        breakerClosed: curBreakerClosed,
        solarTilt: curTilt,
        isAutoRotate: curAutoRotate
      } = stateRef.current;

      // 1. Damped Exploded View Separation
      const expDampFactor = 1 - Math.exp(-8 * delta);
      currentExploded += (curExp - currentExploded) * expDampFactor;

      // Transformer exploded layers
      transformer.conservatorNode.position.y = 3.08 + currentExploded * 2.2;
      transformer.bushingTurretNode.position.y = 3.08 + currentExploded * 1.5;
      transformer.radiatorLeftNode.position.x = -1.5 - currentExploded * 1.8;
      transformer.radiatorRightNode.position.x = 1.5 + currentExploded * 1.8;

      // When exploded > 0.05, reveal internal copper windings and fade shell
      if (currentExploded > 0.05) {
        transformer.coreWindingNode.visible = true;
        (transformer.tankShellMesh.material as THREE.MeshStandardMaterial).transparent = true;
        (transformer.tankShellMesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0.2, 1 - currentExploded * 0.8);
      } else {
        transformer.coreWindingNode.visible = false;
        (transformer.tankShellMesh.material as THREE.MeshStandardMaterial).transparent = false;
        (transformer.tankShellMesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
      }

      // 2. Damped Solar Tracking Angle
      const targetRad = THREE.MathUtils.degToRad(curTilt);
      currentSolarTilt += (targetRad - currentSolarTilt) * (1 - Math.exp(-6 * delta));
      solarTracker.tiltRafterGroup.rotation.x = currentSolarTilt;

      // 3. Damped Breaker Trip / Close Knife Blade
      const targetBladeAngle = curBreakerClosed ? 0 : Math.PI * 0.38; // 0 = closed, ~68 deg = open
      currentBladeAngle += (targetBladeAngle - currentBladeAngle) * (1 - Math.exp(-12 * delta));
      breaker.bladeArms.forEach((arm) => {
        arm.rotation.x = currentBladeAngle;
      });

      // 4. Camera target position dampening when preset changes + WASD movement
      if (curPreset !== lastPresetTracked) {
        lastPresetTracked = curPreset;
        hasMovedManually = false;
      }

      const moveFwd =
        (keysPressed['KeyW'] || keysPressed['ArrowUp'] ? 1 : 0) -
        (keysPressed['KeyS'] || keysPressed['ArrowDown'] ? 1 : 0);
      const moveStrafe =
        (keysPressed['KeyD'] || keysPressed['ArrowRight'] ? 1 : 0) -
        (keysPressed['KeyA'] || keysPressed['ArrowLeft'] ? 1 : 0);
      const isSprinting = keysPressed['ShiftLeft'] || keysPressed['ShiftRight'];

      if (moveFwd !== 0 || moveStrafe !== 0) {
        hasMovedManually = true;
        const speed = (isSprinting ? 14.0 : 8.5) * delta;
        camera.getWorldDirection(_scratchVec3A);
        _scratchVec3A.y = 0;
        if (_scratchVec3A.lengthSq() > 0.0001) _scratchVec3A.normalize();
        _scratchVec3B.set(-_scratchVec3A.z, 0, _scratchVec3A.x);
        const stepX = (_scratchVec3A.x * moveFwd + _scratchVec3B.x * moveStrafe) * speed;
        const stepZ = (_scratchVec3A.z * moveFwd + _scratchVec3B.z * moveStrafe) * speed;
        camera.position.x += stepX;
        camera.position.z += stepZ;
        controls.target.x += stepX;
        controls.target.z += stepZ;
      }

      const presetTarget = cameraPresetsMap[curPreset] || cameraPresetsMap.overview;
      _targetCamPos.copy(presetTarget.pos);
      _targetLookAt.copy(presetTarget.lookAt);

      if (!isUserInteracting && !hasMovedManually) {
        // Only glide towards preset if user is not actively dragging OrbitControls or moving with WASD
        camera.position.lerp(_targetCamPos, 1 - Math.exp(-4 * delta));
        controls.target.lerp(_targetLookAt, 1 - Math.exp(-4 * delta));
      }

      if (curAutoRotate && moveFwd === 0 && moveStrafe === 0) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;
      } else {
        controls.autoRotate = false;
      }
      controls.update();

      // 5. Visual Mode Styling (Live Energized / Thermal Scan / Night / Standard PBR)
      if (curMode === 'night') {
        scene.background = new THREE.Color(0x020617);
        scene.fog = new THREE.FogExp2(0x020617, 0.035);
        keyLight.intensity = 0.3;
        blueAccentLight.intensity = 2.5;
      } else if (curMode === 'thermal') {
        scene.background = new THREE.Color(0x0b0f19);
        scene.fog = new THREE.FogExp2(0x0b0f19, 0.025);
        keyLight.intensity = 1.0;
        blueAccentLight.color.setHex(0xf97316);
      } else {
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.FogExp2(0x0f172a, 0.02);
        keyLight.intensity = 1.85;
        blueAccentLight.color.setHex(0x0284c7);
        blueAccentLight.intensity = 1.2;
      }

      // 6. Energized Power Flow Pulse Animation along Busbars
      const isEnergized = curMode === 'energized' || curBreakerClosed;
      pulseT += delta * (isEnergized ? 0.35 : 0.05);

      for (let i = 0; i < pulseCount; i++) {
        const pMesh = pulseSpheres[i];
        if (!isEnergized) {
          pMesh.visible = false;
        } else {
          pMesh.visible = true;
          const u = (pulseT + i / pulseCount) % 1.0;
          mainBusCurve.getPoint(u, _scratchVec3A);
          pMesh.position.copy(_scratchVec3A);

          if (curMode === 'thermal') {
            (pMesh.material as THREE.MeshBasicMaterial).color.setHex(0xf97316);
          } else {
            (pMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
          }
        }
      }

      // Render
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 11. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
    />
  );
};
