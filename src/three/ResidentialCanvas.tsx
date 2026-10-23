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
import { generateParametricTwin, GeneratedTwin } from './ParametricHouseGenerator';

export type ResidentialCameraPreset = 'overview' | 'db' | 'living' | 'bedroom' | 'kitchen' | 'earth_pit';

export interface ResidentialCanvasProps {
  project?: ResidentialProject;
  viewMode: ResidentialViewMode;
  ceilingVisible: boolean;
  dbDoorOpen: boolean;
  activeCircuit: string;
  livingLightOn: boolean;
  fanSpeed: number; // 0, 1, 2, 3
  cameraPreset: ResidentialCameraPreset;
  isAutoRotate: boolean;
  onSelectComponent: (componentId: string) => void;
  onToggleLight: () => void;
}

// Pre-allocated scratch vectors to prevent GC in animation loop
const _vec3A = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

export const ResidentialCanvas: React.FC<ResidentialCanvasProps> = ({
  project,
  viewMode,
  ceilingVisible,
  dbDoorOpen,
  activeCircuit,
  livingLightOn,
  fanSpeed,
  cameraPreset,
  isAutoRotate,
  onSelectComponent,
  onToggleLight
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    project,
    viewMode,
    ceilingVisible,
    dbDoorOpen,
    activeCircuit,
    livingLightOn,
    fanSpeed,
    cameraPreset,
    isAutoRotate,
    onSelectComponent,
    onToggleLight
  });

  // Keep stateRef in sync without remounting WebGL
  useEffect(() => {
    stateRef.current = {
      project,
      viewMode,
      ceilingVisible,
      dbDoorOpen,
      activeCircuit,
      livingLightOn,
      fanSpeed,
      cameraPreset,
      isAutoRotate,
      onSelectComponent,
      onToggleLight
    };
  }, [
    project,
    viewMode,
    ceilingVisible,
    dbDoorOpen,
    activeCircuit,
    livingLightOn,
    fanSpeed,
    cameraPreset,
    isAutoRotate,
    onSelectComponent,
    onToggleLight
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
    scene.background = new THREE.Color(0x0f172a); // Slate Navy
    scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.2, 80);
    camera.position.set(-6, 9, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio PBR Environment Map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
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

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.8);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 1.2;
    controls.maxDistance = 28;
    controls.target.set(0, 1.4, 0);

    let isUserInteracting = false;
    controls.addEventListener('start', () => { isUserInteracting = true; });
    controls.addEventListener('end', () => { isUserInteracting = false; });

    // 6. Build Residential 3D Model (Parametric or Default)
    let currentParametricTwin: GeneratedTwin | null = null;
    let currentStaticTwin: ResidentialMeshNodes | null = null;

    const buildModel = () => {
      // Cleanup previous
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
          stateRef.current.ceilingVisible,
          stateRef.current.dbDoorOpen,
          stateRef.current.activeCircuit
        );
        scene.add(currentParametricTwin.rootGroup);
      } else {
        currentStaticTwin = createResidentialTwin(
          renderer.capabilities.getMaxAnisotropy()
        );
        scene.add(currentStaticTwin.group);
      }
    };

    buildModel();

    // Camera Presets Map
    const cameraPresetsMap: Record<ResidentialCameraPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
      overview: { pos: new THREE.Vector3(-6, 9, 11), lookAt: new THREE.Vector3(0, 1.4, 0) },
      db: { pos: new THREE.Vector3(-0.9, 1.6, 0.4), lookAt: new THREE.Vector3(-0.11, 1.5, 0.4) },
      living: { pos: new THREE.Vector3(-4.5, 2.2, -0.2), lookAt: new THREE.Vector3(-2.5, 1.6, -1.8) },
      bedroom: { pos: new THREE.Vector3(-4.5, 2.2, 1.8), lookAt: new THREE.Vector3(-2.5, 1.6, 2.5) },
      kitchen: { pos: new THREE.Vector3(4.2, 2.2, -0.8), lookAt: new THREE.Vector3(2.5, 1.4, -2.0) },
      earth_pit: { pos: new THREE.Vector3(-6.8, 1.8, -1.8), lookAt: new THREE.Vector3(-5.8, 0.2, -2.5) }
    };

    // 7. Raycasting Click Interactions
    const handlePointerDown = (event: MouseEvent) => {
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
        return;
      }

      if (currentStaticTwin) {
        const intersects = _raycaster.intersectObjects([
          currentStaticTwin.dbEnclosureGroup,
          currentStaticTwin.switchboardsGroup,
          currentStaticTwin.earthPitGroup
        ], true);

        if (intersects.length > 0) {
          let hit: THREE.Object3D | null = intersects[0].object;
          while (hit && hit.parent && hit !== scene) {
            if (hit === currentStaticTwin.dbEnclosureGroup) {
              stateRef.current.onSelectComponent('db');
              return;
            }
            if (hit === currentStaticTwin.earthPitGroup) {
              stateRef.current.onSelectComponent('earth_pit');
              return;
            }
            if (hit === currentStaticTwin.switchboardsGroup) {
              stateRef.current.onSelectComponent('switchboard');
              stateRef.current.onToggleLight();
              return;
            }
            hit = hit.parent;
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

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

    // Track state changes that require rebuild
    let lastViewMode = stateRef.current.viewMode;
    let lastCeilVisible = stateRef.current.ceilingVisible;
    let lastProject = stateRef.current.project;

    // 9. Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let doorAngle = Math.PI * 0.45; // starts open
    let fanAngleLiving = 0;
    let fanAngleBed = 0;

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
        activeCircuit: curActiveCircuit,
        livingLightOn: curLightOn,
        fanSpeed: curFanSpeed,
        cameraPreset: curCamPreset,
        isAutoRotate: curAutoRotate
      } = stateRef.current;

      // Check if project or viewMode or ceiling toggled
      if (curProject !== lastProject || curViewMode !== lastViewMode || curCeilVisible !== lastCeilVisible) {
        lastProject = curProject;
        lastViewMode = curViewMode;
        lastCeilVisible = curCeilVisible;
        buildModel();
      }

      if (currentParametricTwin) {
        currentParametricTwin.update(delta, curFanSpeed, curActiveCircuit);
        if (currentParametricTwin.dbDoorPivot) {
          const targetDoorAngle = curDbDoorOpen ? -Math.PI * 0.55 : 0;
          doorAngle += (targetDoorAngle - doorAngle) * (1 - Math.exp(-10 * delta));
          currentParametricTwin.dbDoorPivot.rotation.y = doorAngle;
        }
      } else if (currentStaticTwin) {
        // Static twin logic
        if (curViewMode === 'construction') {
          currentStaticTwin.wallsFinishedGroup.visible = false;
          currentStaticTwin.wallsConstructionGroup.visible = true;
          currentStaticTwin.ceilingSlabGroup.visible = false;
          currentStaticTwin.conduitGroup.visible = true;
          currentStaticTwin.wiresGroup.visible = true;
        } else if (curViewMode === 'cutaway') {
          currentStaticTwin.wallsFinishedGroup.visible = true;
          currentStaticTwin.wallsConstructionGroup.visible = false;
          currentStaticTwin.ceilingSlabGroup.visible = curCeilVisible;
          currentStaticTwin.conduitGroup.visible = true;
          currentStaticTwin.wiresGroup.visible = true;
        } else {
          currentStaticTwin.wallsFinishedGroup.visible = true;
          currentStaticTwin.wallsConstructionGroup.visible = false;
          currentStaticTwin.ceilingSlabGroup.visible = curCeilVisible;
          currentStaticTwin.conduitGroup.visible = false;
          currentStaticTwin.wiresGroup.visible = false;
        }

        const targetDoorAngle = curDbDoorOpen ? Math.PI * 0.45 : 0;
        doorAngle += (targetDoorAngle - doorAngle) * (1 - Math.exp(-10 * delta));
        currentStaticTwin.dbDoorMesh.rotation.y = doorAngle;

        const rpmTable = [0, 12, 22, 34];
        const fanAngularSpeed = (rpmTable[curFanSpeed] || 0) * (curLightOn ? 1 : 0);
        fanAngleLiving += fanAngularSpeed * delta;
        fanAngleBed += fanAngularSpeed * delta;
        currentStaticTwin.fanLivingRotor.rotation.y = fanAngleLiving;
        currentStaticTwin.fanBedRotor.rotation.y = fanAngleBed;

        currentStaticTwin.lightsGroup.visible = curLightOn;
      }

      // Camera Preset Lerping
      const preset = cameraPresetsMap[curCamPreset] || cameraPresetsMap.overview;
      _targetPos.copy(preset.pos);
      _targetLook.copy(preset.lookAt);

      if (!isUserInteracting) {
        camera.position.lerp(_targetPos, 1 - Math.exp(-4 * delta));
        controls.target.lerp(_targetLook, 1 - Math.exp(-4 * delta));
      }

      controls.autoRotate = curAutoRotate;
      controls.autoRotateSpeed = 1.0;
      controls.update();

      // Render
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
      if (currentParametricTwin) {
        currentParametricTwin.dispose();
      }
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
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
