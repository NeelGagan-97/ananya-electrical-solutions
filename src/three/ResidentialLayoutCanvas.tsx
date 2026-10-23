import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ResidentialLayoutProject } from '../types/layoutDesigner';
import {
  generateLayout3DTwin,
  LayoutViewMode,
  GeneratedLayoutTwin
} from './layoutModelGenerators';

export type LayoutCameraPreset =
  | 'aerial_overview'
  | 'top_plan'
  | 'front_elevation'
  | 'isometric_3d'
  | 'substation_close'
  | 'main_avenue'
  | 'central_park'
  | 'plot_close';

export interface ResidentialLayoutCanvasProps {
  project: ResidentialLayoutProject;
  viewMode: LayoutViewMode;
  isNight: boolean;
  cameraPreset: LayoutCameraPreset;
  isAutoRotate: boolean;
  onSelectObject: (objectId: string) => void;
}

const _pointer = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

export const ResidentialLayoutCanvas: React.FC<ResidentialLayoutCanvasProps> = ({
  project,
  viewMode,
  isNight,
  cameraPreset,
  isAutoRotate,
  onSelectObject
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    project,
    viewMode,
    isNight,
    cameraPreset,
    isAutoRotate,
    onSelectObject
  });

  useEffect(() => {
    stateRef.current = {
      project,
      viewMode,
      isNight,
      cameraPreset,
      isAutoRotate,
      onSelectObject
    };
  }, [project, viewMode, isNight, cameraPreset, isAutoRotate, onSelectObject]);

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

    // 2. Setup Scene & Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNight ? 0x030712 : 0x0b1329);
    scene.fog = new THREE.FogExp2(isNight ? 0x030712 : 0x0b1329, 0.008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 400);
    camera.position.set(0, 90, 110);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNight ? 1.4 : 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Environment Map
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Studio Directional & Ambient Lighting
    const sunLight = new THREE.DirectionalLight(isNight ? 0x38bdf8 : 0xfffaed, isNight ? 0.35 : 1.9);
    sunLight.position.set(60, 100, 80);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      const d = 90;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
    }
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(
      isNight ? 0x1e293b : 0xe0f2fe,
      isNight ? 0x020617 : 0x1e293b,
      isNight ? 0.3 : 0.8
    );
    scene.add(hemiLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 5;
    controls.maxDistance = 250;
    controls.target.set(0, 0, 0);

    let isUserInteracting = false;
    controls.addEventListener('start', () => { isUserInteracting = true; });
    controls.addEventListener('end', () => { isUserInteracting = false; });

    // 6. Camera Presets Map
    const cameraPresetsMap: Record<LayoutCameraPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
      aerial_overview: { pos: new THREE.Vector3(0, 90, 110), lookAt: new THREE.Vector3(0, 0, 0) },
      top_plan: { pos: new THREE.Vector3(0, 130, 0.1), lookAt: new THREE.Vector3(0, 0, 0) },
      front_elevation: { pos: new THREE.Vector3(0, 14, 115), lookAt: new THREE.Vector3(0, 4, 0) },
      isometric_3d: { pos: new THREE.Vector3(75, 75, 75), lookAt: new THREE.Vector3(0, 0, 0) },
      substation_close: { pos: new THREE.Vector3(-45, 12, 10), lookAt: new THREE.Vector3(-64, 2, -7) },
      main_avenue: { pos: new THREE.Vector3(-55, 5, 0), lookAt: new THREE.Vector3(30, 2, 0) },
      central_park: { pos: new THREE.Vector3(25, 18, 25), lookAt: new THREE.Vector3(48, 2, 33) },
      plot_close: { pos: new THREE.Vector3(-20, 10, -25), lookAt: new THREE.Vector3(-40, 2, -35) }
    };

    // 7. Generate 3D Twin
    let currentTwin: GeneratedLayoutTwin | null = null;

    const buildLayoutScene = () => {
      if (currentTwin) {
        scene.remove(currentTwin.rootGroup);
        currentTwin.dispose();
        currentTwin = null;
      }
      currentTwin = generateLayout3DTwin(
        stateRef.current.project,
        stateRef.current.viewMode,
        stateRef.current.isNight
      );
      scene.add(currentTwin.rootGroup);

      // Adjust sky & lighting based on isNight
      const n = stateRef.current.isNight;
      scene.background = new THREE.Color(n ? 0x030712 : 0x0b1329);
      scene.fog = new THREE.FogExp2(n ? 0x030712 : 0x0b1329, 0.008);
      sunLight.color.setHex(n ? 0x38bdf8 : 0xfffaed);
      sunLight.intensity = n ? 0.35 : 1.9;
      hemiLight.intensity = n ? 0.3 : 0.8;
      renderer.toneMappingExposure = n ? 1.4 : 1.15;
    };

    buildLayoutScene();

    // 8. Raycast Selection
    const handlePointerDown = (event: MouseEvent) => {
      if (!currentTwin) return;
      const rect = renderer.domElement.getBoundingClientRect();
      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_pointer, camera);

      const targets: THREE.Object3D[] = [];
      currentTwin.interactiveObjects.forEach((grp) => targets.push(grp));

      const intersects = _raycaster.intersectObjects(targets, true);
      if (intersects.length > 0) {
        let hit: THREE.Object3D | null = intersects[0].object;
        while (hit && hit.parent && hit !== scene) {
          for (const [id, grp] of currentTwin.interactiveObjects.entries()) {
            if (hit === grp) {
              stateRef.current.onSelectObject(id);
              return;
            }
          }
          hit = hit.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Resize
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
    let lastProject = stateRef.current.project;
    let lastViewMode = stateRef.current.viewMode;
    let lastNight = stateRef.current.isNight;

    // 10. Animation Loop
    const clock = new THREE.Clock();
    let frameId = 0;

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
        project: curProj,
        viewMode: curView,
        isNight: curNight,
        cameraPreset: curPreset,
        isAutoRotate: curRotate
      } = stateRef.current;

      // Rebuild if project or viewMode or night mode changed
      if (curProj !== lastProject || curView !== lastViewMode || curNight !== lastNight) {
        lastProject = curProj;
        lastViewMode = curView;
        lastNight = curNight;
        buildLayoutScene();
      }

      if (currentTwin) {
        currentTwin.update(delta);
      }

      // Camera Preset Lerping
      const preset = cameraPresetsMap[curPreset] || cameraPresetsMap.aerial_overview;
      _targetPos.copy(preset.pos);
      _targetLook.copy(preset.lookAt);

      if (!isUserInteracting) {
        camera.position.lerp(_targetPos, 1 - Math.exp(-3.5 * delta));
        controls.target.lerp(_targetLook, 1 - Math.exp(-3.5 * delta));
      }

      controls.autoRotate = curRotate;
      controls.autoRotateSpeed = 0.8;
      controls.update();

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      if (currentTwin) {
        currentTwin.dispose();
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
