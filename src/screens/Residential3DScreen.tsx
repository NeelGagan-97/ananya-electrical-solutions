import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResidentialProject,
  InteractiveTarget,
  PlayerPose
} from '../types/residentialDesigner';
import {
  STANDARD_2BHK_PROJECT,
  RESIDENTIAL_TEMPLATES
} from '../data/residentialPresets';
import {
  ViewMode3D,
  ResidentialLayerVisibility,
  CircuitSubLayerFilter
} from '../three/ParametricHouseGenerator';
import {
  ResidentialCanvas,
  CameraMode,
  CameraPreset,
  MobileWalkInput
} from '../three/ResidentialCanvas';
import { FloorPlanEditor } from '../components/cad/FloorPlanEditor';
import { ProjectWizardModal } from '../components/cad/ProjectWizardModal';
import { BoqModal } from '../components/cad/BoqModal';
import { exportProjectToDxf } from '../utils/residentialExporters';

interface Residential3DScreenProps {
  onBackHome: () => void;
}

const STORAGE_KEY = 'ananya_residential_designer_proj_v4_spacious';

export type WorkspaceTab = '3d_twin' | 'floor_plan' | 'circuits';
export type DockInspectorTab = 'layers' | 'db_exploded' | 'circuits' | 'specs';

export const Residential3DScreen: React.FC<Residential3DScreenProps> = ({ onBackHome }) => {
  // 1. Load or Initialize Project
  const [project, setProject] = useState<ResidentialProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to default 2BHK
    }
    return STANDARD_2BHK_PROJECT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // Ignore storage quota errors
    }
  }, [project]);

  // 2. Main Workspace & 3D Viewport States
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('3d_twin');
  const [viewMode, setViewMode] = useState<ViewMode3D>('finished');
  const [cameraMode, setCameraMode] = useState<CameraMode>('fpp');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('exterior_entry');
  const [ceilingVisible, setCeilingVisible] = useState<boolean>(true);
  const [dbDoorOpen, setDbDoorOpen] = useState<boolean>(true);
  const [dbExploded, setDbExploded] = useState<boolean>(false);
  const [wallOpacity, setWallOpacity] = useState<number>(1.0);
  const [fanSpeed, setFanSpeed] = useState<number>(2);
  const [activeCircuit, setActiveCircuit] = useState<string>(
    project.circuits[0]?.id || 'c1_living_lighting'
  );
  const [selectedCompId, setSelectedCompId] = useState<string | null>('pt_main_db');

  // First-Person Walkthrough & Interaction States
  const [isWalkthroughStarted, setIsWalkthroughStarted] = useState<boolean>(false);
  const [isWalkthroughPaused, setIsWalkthroughPaused] = useState<boolean>(false);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [pointerLockTrigger, setPointerLockTrigger] = useState<number>(0);
  const [hoveredTarget, setHoveredTarget] = useState<InteractiveTarget | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<{
    x: number;
    z: number;
    yaw?: number;
    seq: number;
  } | null>(null);

  // Player Pose & Room Entry Banner States
  const [playerPose, setPlayerPose] = useState<PlayerPose>({
    projectX: 2.5,
    projectZ: -5.1,
    yaw: Math.PI,
    roomId: null,
    roomName: 'Exterior Entrance Corridor'
  });
  const [roomBanner, setRoomBanner] = useState<{
    name: string;
    subtitle: string;
    visible: boolean;
  }>({
    name: 'Exterior Entrance Corridor',
    subtitle: 'Main Entrance & Incoming Supply Zone',
    visible: false
  });
  const lastRoomNameRef = useRef<string>('Exterior Entrance Corridor');

  // Interactive Door States (id -> isOpen) — Default open so the user can walk freely through all rooms
  const [doorStates, setDoorStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    project.openings
      .filter((o) => o.type === 'door')
      .forEach((d) => {
        initial[d.id] = true;
      });
    return initial;
  });

  // Mobile / On-Screen Virtual Joystick Controls
  const [showMobileControls, setShowMobileControls] = useState<boolean>(false);
  const [mobileInput, setMobileInput] = useState<MobileWalkInput>({
    moveX: 0,
    moveY: 0,
    lookX: 0,
    lookY: 0
  });
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  // Granular 3D CAD Layer Visibility
  const [layers, setLayers] = useState<ResidentialLayerVisibility>({
    architecture: true,
    furniture: true,
    lighting: true,
    conduits: true,
    wiring: true,
    distribution: true
  });

  // Granular Electrical Sub-Layer Filter for X-Ray Inspection Mode
  const [circuitFilter, setCircuitFilter] = useState<CircuitSubLayerFilter>({
    lighting: true,
    power: true,
    heavy: true,
    earthing: true
  });

  // Live Circuit Breaker States (true = ON/Closed, false = OFF/Tripped)
  const [breakerStates, setBreakerStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    project.circuits.forEach((c) => {
      init[c.id] = true;
    });
    return init;
  });

  // Bottom Dock Inspector Drawer State
  const [dockExpanded, setDockExpanded] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<DockInspectorTab>('layers');

  // Export Trigger for 3D GLB/glTF
  const [exportTrigger, setExportTrigger] = useState<{ format: 'glb' | 'gltf'; seq: number } | null>(
    null
  );

  // Modals
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [showBoqModal, setShowBoqModal] = useState<boolean>(false);

  // Sync wallOpacity when viewMode changes
  useEffect(() => {
    if (viewMode === 'cutaway') {
      setWallOpacity(0.22);
    } else if (viewMode === 'construction') {
      setWallOpacity(0.85);
    } else {
      setWallOpacity(1.0);
    }
  }, [viewMode]);

  // Show Room Entry Toast Banner when crossing into a new room
  useEffect(() => {
    if (!isWalkthroughStarted || playerPose.roomName === lastRoomNameRef.current) return;
    lastRoomNameRef.current = playerPose.roomName;

    const rm = project.rooms.find((r) => r.id === playerPose.roomId);
    const areaSqFt = rm ? Math.round(rm.width * rm.length * 10.764) : 45;
    const roomCircuits = rm
      ? Array.from(
          new Set(
            project.electricalPoints
              .filter((p) => p.roomId === rm.id)
              .map((p) => p.circuitId.split('_')[0].toUpperCase())
          )
        ).join(', ')
      : '3-Phase Incoming Supply';

    setRoomBanner({
      name: playerPose.roomName,
      subtitle: rm
        ? `${rm.width.toFixed(1)}m × ${rm.length.toFixed(1)}m (${areaSqFt} sq.ft) • Circuits: ${
            roomCircuits || 'C1'
          }`
        : 'Outside Apartment Main Entrance • IS:732 Compliant',
      visible: true
    });

    const timer = setTimeout(() => {
      setRoomBanner((prev) => ({ ...prev, visible: false }));
    }, 3200);
    return () => clearTimeout(timer);
  }, [playerPose.roomName, playerPose.roomId, isWalkthroughStarted, project.rooms, project.electricalPoints]);

  // Keyboard shortcuts for [X] X-Ray Inspection Mode and [ESC] Pause Menu
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'KeyX' && workspaceTab === '3d_twin') {
        setViewMode((prev) => (prev === 'cutaway' ? 'finished' : 'cutaway'));
      } else if (e.code === 'Escape' && cameraMode === 'fpp' && isWalkthroughStarted) {
        setIsWalkthroughPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [workspaceTab, cameraMode, isWalkthroughStarted]);

  // 3. Derived Electrical Metrics & Selection
  const selectedPoint = useMemo(() => {
    return (
      project.electricalPoints.find((p) => p.id === selectedCompId) ||
      project.electricalPoints[0]
    );
  }, [project.electricalPoints, selectedCompId]);

  const selectedPointRoom = useMemo(() => {
    if (!selectedPoint) return null;
    return project.rooms.find((r) => r.id === selectedPoint.roomId) || null;
  }, [project.rooms, selectedPoint]);

  const currentCircuit = useMemo(() => {
    return (
      project.circuits.find((c) => c.id === activeCircuit) || project.circuits[0]
    );
  }, [project.circuits, activeCircuit]);

  const totalConnectedWatts = useMemo(() => {
    return project.electricalPoints.reduce((acc, pt) => {
      const isCircuitClosed = breakerStates[pt.circuitId] !== false;
      return acc + (pt.isOn && isCircuitClosed ? pt.powerWatts : 0);
    }, 0);
  }, [project.electricalPoints, breakerStates]);

  const estimatedCurrentAmps = useMemo(() => {
    const pf = 0.95;
    return (totalConnectedWatts / (230 * pf)).toFixed(1);
  }, [totalConnectedWatts]);

  const allDoorsOpen = useMemo(() => {
    const doorOps = project.openings.filter((o) => o.type === 'door');
    return doorOps.length > 0 && doorOps.every((d) => doorStates[d.id]);
  }, [project.openings, doorStates]);

  // Toggle individual electrical point power ON/OFF
  const handleTogglePointPower = (pointId: string) => {
    setProject((prev) => ({
      ...prev,
      electricalPoints: prev.electricalPoints.map((pt) =>
        pt.id === pointId ? { ...pt, isOn: !pt.isOn } : pt
      )
    }));
  };

  // Toggle all lights & ceiling fan in a room when clicking/pressing [E] on a room switchboard
  const handleToggleRoomSwitchboard = (switchPointId: string, roomId: string) => {
    setProject((prev) => {
      const sb = prev.electricalPoints.find((p) => p.id === switchPointId);
      const nextState = sb ? !sb.isOn : true;
      return {
        ...prev,
        electricalPoints: prev.electricalPoints.map((pt) => {
          if (
            pt.id === switchPointId ||
            (pt.roomId === roomId &&
              (pt.type === 'downlight_led' || pt.type === 'ceiling_fan'))
          ) {
            return { ...pt, isOn: nextState };
          }
          return pt;
        })
      };
    });
  };

  // Toggle individual Door Open/Close
  const handleToggleDoor = (doorId: string) => {
    setDoorStates((prev) => ({
      ...prev,
      [doorId]: !prev[doorId]
    }));
  };

  // Toggle All Doors Open/Close
  const handleToggleAllDoors = () => {
    const nextState = !allDoorsOpen;
    const updated: Record<string, boolean> = {};
    project.openings
      .filter((o) => o.type === 'door')
      .forEach((d) => {
        updated[d.id] = nextState;
      });
    setDoorStates(updated);
  };

  // Toggle individual MCB/RCCB breaker ON/OFF
  const handleToggleBreaker = (circuitId: string) => {
    setBreakerStates((prev) => ({
      ...prev,
      [circuitId]: prev[circuitId] === false ? true : false
    }));
    setActiveCircuit(circuitId);
  };

  // Handle [E] or Left-Click Interaction on a Proximity Target in FPP Mode
  const handleInteractTarget = (target: InteractiveTarget) => {
    if (target.type === 'door') {
      handleToggleDoor(target.id);
    } else if (target.type === 'db') {
      setSelectedCompId(target.id);
      setDbDoorOpen(true);
      setActiveDockTab('db_exploded');
      setDockExpanded(true);
    } else if (target.type === 'electrical') {
      setSelectedCompId(target.id);
      const pt = project.electricalPoints.find((p) => p.id === target.id);
      if (pt) {
        if (pt.type === 'switch_board_6a') {
          handleToggleRoomSwitchboard(pt.id, pt.roomId);
        } else {
          handleTogglePointPower(pt.id);
        }
        if (pt.circuitId) {
          setActiveCircuit(pt.circuitId);
        }
      }
    }
  };

  // Start or Resume First-Person Walkthrough
  const handleStartWalkthrough = () => {
    setCameraMode('fpp');
    setIsWalkthroughStarted(true);
    setIsWalkthroughPaused(false);
    // Open all doors when entering walkthrough so the user can walk freely everywhere
    const openAll: Record<string, boolean> = {};
    project.openings
      .filter((o) => o.type === 'door')
      .forEach((d) => {
        openAll[d.id] = true;
      });
    setDoorStates(openAll);
    setPointerLockTrigger((prev) => prev + 1);
  };

  // Reset Player Spawn Outside Main Entrance
  const handleResetSpawn = () => {
    const foyerRm = project.rooms.find((r) => r.type === 'foyer');
    const spawnX = foyerRm ? foyerRm.x + foyerRm.width / 2 : 2.5;
    const spawnZ = foyerRm ? foyerRm.z - 1.5 : -5.1;
    setCameraMode('fpp');
    setCameraPreset('exterior_entry');
    setTeleportTarget({ x: spawnX, z: spawnZ, yaw: Math.PI, seq: Date.now() });
    setIsWalkthroughPaused(false);
    setPointerLockTrigger((prev) => prev + 1);
  };

  // Switch between BHK Templates
  const handleSwitchTemplate = (templateId: string) => {
    const found = RESIDENTIAL_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      const cloned: ResidentialProject = JSON.parse(JSON.stringify(found.project));
      setProject(cloned);
      setSelectedCompId(cloned.electricalPoints[0]?.id || null);
      setActiveCircuit(cloned.circuits[0]?.id || 'c1_living_lighting');
      const nextBreakers: Record<string, boolean> = {};
      cloned.circuits.forEach((c) => {
        nextBreakers[c.id] = true;
      });
      setBreakerStates(nextBreakers);
      const nextDoors: Record<string, boolean> = {};
      cloned.openings
        .filter((o) => o.type === 'door')
        .forEach((d) => {
          nextDoors[d.id] = true;
        });
      setDoorStates(nextDoors);
    }
  };

  const toggleLayer = (key: keyof ResidentialLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen h-screen bg-[#070C1A] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* =====================================================================
          1. COMPACT SINGLE-ROW CAD HEADER BAR (52px)
         ===================================================================== */}
      <header className="h-13 shrink-0 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800/90 px-3 flex items-center justify-between gap-2 z-30">
        {/* Left: Back Button + Brand Title + Template Switcher */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBackHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer shrink-0"
            title="Return to Ananya Electrical Home"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <span className="material-symbols-outlined text-[17px]">apartment</span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                  2BHK Interior Twin — FPP Walkthrough
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded hidden md:inline-block">
                  IS:732 CAD
                </span>
              </div>
            </div>
          </div>

          <select
            value={
              RESIDENTIAL_TEMPLATES.find((t) => t.project.id === project.id)?.id || '2bhk'
            }
            onChange={(e) => handleSwitchTemplate(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] font-semibold text-sky-300 focus:outline-none focus:border-sky-500 cursor-pointer hidden xl:block"
          >
            {RESIDENTIAL_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.badge}: {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Primary Mode Switcher */}
        <div className="flex items-center bg-slate-900/95 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setWorkspaceTab('3d_twin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              workspaceTab === '3d_twin'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">directions_walk</span>
            <span>3D FPP Twin</span>
          </button>

          <button
            onClick={() => setWorkspaceTab('floor_plan')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              workspaceTab === 'floor_plan'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">grid_on</span>
            <span className="hidden sm:inline">2D Floor Plan</span>
          </button>

          <button
            onClick={() => setWorkspaceTab('circuits')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              workspaceTab === 'circuits'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
            <span className="hidden sm:inline">DB &amp; Load</span>
          </button>
        </div>

        {/* Right: Live Load Pill + CAD Exports + BOQ */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono"
            title="Real-Time Active Electrical Load Draw"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-amber-400 font-bold">
              {(totalConnectedWatts / 1000).toFixed(2)} kW
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-400 font-bold">{estimatedCurrentAmps} A</span>
          </div>

          <button
            onClick={() => exportProjectToDxf(project)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            title="Export 2D Architectural & Electrical Conduit Layout as AutoCAD .DXF"
          >
            <span className="material-symbols-outlined text-[15px]">architecture</span>
            <span className="hidden md:inline">.DXF</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceTab('3d_twin');
              setExportTrigger({ format: 'glb', seq: Date.now() });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            title="Export 3D Apartment & Conduit Model as Binary .GLB"
          >
            <span className="material-symbols-outlined text-[15px]">deployed_code</span>
            <span className="hidden md:inline">.GLB</span>
          </button>

          <button
            onClick={() => setShowBoqModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">receipt_long</span>
            <span className="hidden sm:inline">BOQ</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN WORKSPACE AREA
         ===================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {workspaceTab === '3d_twin' && (
          <div className="relative w-full h-full flex-1 overflow-hidden">
            {/* Full-Bleed Three.js 3D Canvas */}
            <ResidentialCanvas
              project={project}
              viewMode={viewMode}
              cameraMode={cameraMode}
              cameraPreset={cameraPreset}
              ceilingVisible={ceilingVisible}
              dbDoorOpen={dbDoorOpen}
              dbExploded={dbExploded}
              wallOpacity={wallOpacity}
              layers={layers}
              circuitFilter={circuitFilter}
              breakerStates={breakerStates}
              doorStates={doorStates}
              fanSpeed={fanSpeed}
              activeCircuit={activeCircuit}
              selectedComponentId={selectedCompId}
              onSelectComponent={(id) => {
                setSelectedCompId(id);
                const pt = project.electricalPoints.find((p) => p.id === id);
                if (pt?.circuitId) {
                  setActiveCircuit(pt.circuitId);
                }
                if (id === 'pt_main_db') {
                  setActiveDockTab('db_exploded');
                } else {
                  setActiveDockTab('specs');
                }
                setDockExpanded(true);
              }}
              onToggleBreaker={handleToggleBreaker}
              onToggleDoor={handleToggleDoor}
              onInteractTarget={handleInteractTarget}
              onHoverTargetChange={setHoveredTarget}
              onPlayerPoseChange={setPlayerPose}
              onPointerLockChange={setIsPointerLocked}
              isWalkthroughStarted={isWalkthroughStarted}
              isWalkthroughPaused={isWalkthroughPaused}
              pointerLockTrigger={pointerLockTrigger}
              teleportTarget={teleportTarget}
              mobileInput={mobileInput}
              exportTrigger={exportTrigger}
            />

            {/* ===============================================================
                OVERLAY A: "ENTER APARTMENT" START SCREEN OVERLAY
               =============================================================== */}
            {!isWalkthroughStarted && cameraMode === 'fpp' && (
              <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-[#0B132B]/95 border border-sky-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                        <span className="material-symbols-outlined text-[28px]">sensor_door</span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                          Interactive First-Person Exploration
                        </span>
                        <h2 className="text-xl font-bold text-white mt-1">
                          Greenwood Heights — 2BHK Interior Twin
                        </h2>
                        <p className="text-xs text-slate-400">
                          1,000 sq.ft Furnished Indian Apartment • IS:732 Concealed Electrical Installation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Walkthrough Controls Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-sky-300 shrink-0">
                        W A S D
                      </span>
                      <span className="text-slate-300">Walk &amp; Strafe (+ Shift Sprint)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-sky-300 shrink-0">
                        MOUSE
                      </span>
                      <span className="text-slate-300">360° Free Look (Pointer Lock)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-amber-300 shrink-0">
                        [E] / CLICK
                      </span>
                      <span className="text-slate-300">Open Doors, Toggle Switches &amp; DB</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-300 shrink-0">
                        [X] / [ESC]
                      </span>
                      <span className="text-slate-300">X-Ray Wiring Mode / Pause Menu</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      onClick={handleStartWalkthrough}
                      className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">directions_walk</span>
                      <span>Enter Apartment (Start Walkthrough)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsWalkthroughStarted(true);
                        setCameraMode('orbit');
                        setCameraPreset('overview');
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                      <span>3D Orbit Overview</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                OVERLAY B: PAUSE MENU ([ESC]) OVERLAY
               =============================================================== */}
            {isWalkthroughStarted && isWalkthroughPaused && cameraMode === 'fpp' && (
              <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0B132B]/95 border border-slate-700 rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400">pause_circle</span>
                      <h3 className="font-bold text-base text-white">Walkthrough Paused</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Zone: {playerPose.roomName}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsWalkthroughPaused(false);
                        setPointerLockTrigger((prev) => prev + 1);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      <span>Resume First-Person Walkthrough</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleResetSpawn}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                        <span>Reset Position</span>
                      </button>

                      <button
                        onClick={handleToggleAllDoors}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">door_open</span>
                        <span>{allDoorsOpen ? 'Close All Doors' : 'Open All Doors'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Teleport to Room */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Teleport Directly to Room:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'foyer', label: 'Entrance Foyer & DB' },
                        { id: 'living', label: 'Living & Dining Hall' },
                        { id: 'kitchen', label: 'Modular Kitchen' },
                        { id: 'master_bed', label: 'Master Bedroom' },
                        { id: 'bed2', label: 'Guest Bedroom' },
                        { id: 'bath1', label: 'Common Bathroom' }
                      ].map((rm) => (
                        <button
                          key={rm.id}
                          onClick={() => {
                            setCameraPreset(rm.id as CameraPreset);
                            setIsWalkthroughPaused(false);
                            setPointerLockTrigger((prev) => prev + 1);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px] text-sky-400">
                            location_on
                          </span>
                          <span className="truncate">{rm.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsWalkthroughPaused(false);
                      setCameraMode('orbit');
                      setCameraPreset('overview');
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                    <span>Exit to 3D Orbit Overview</span>
                  </button>
                </div>
              </div>
            )}

            {/* ===============================================================
                OVERLAY C: CENTER CROSSHAIR RETICLE & PROXIMITY [E] PROMPT
               =============================================================== */}
            {cameraMode === 'fpp' && isWalkthroughStarted && !isWalkthroughPaused && (
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                {/* Reticle Ring + Dot */}
                <div
                  className={`transition-all duration-150 rounded-full flex items-center justify-center ${
                    hoveredTarget
                      ? 'w-7 h-7 border-2 border-emerald-400 bg-emerald-400/15 scale-110 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'w-4 h-4 border border-white/60 bg-slate-950/30'
                  }`}
                >
                  <div
                    className={`rounded-full ${
                      hoveredTarget ? 'w-2 h-2 bg-emerald-300' : 'w-1 h-1 bg-white/80'
                    }`}
                  />
                </div>

                {/* Contextual [E] / Click Interaction Pill */}
                {hoveredTarget && (
                  <div className="mt-4 bg-[#0B132B]/92 backdrop-blur-md border border-emerald-500/50 rounded-xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 max-w-xs sm:max-w-sm animate-fade-in">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        {hoveredTarget.type === 'door'
                          ? hoveredTarget.isOpen
                            ? 'door_open'
                            : 'door_front'
                          : hoveredTarget.type === 'db'
                          ? 'developer_board'
                          : 'toggle_on'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {hoveredTarget.label}
                        </span>
                        {hoveredTarget.type === 'door' ? (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              hoveredTarget.isOpen
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {hoveredTarget.isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                        ) : (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              hoveredTarget.isOn
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {hoveredTarget.isOn ? 'ON' : 'OFF'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-300 mt-0.5">
                        {hoveredTarget.sublabel}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===============================================================
                OVERLAY D: DYNAMIC ROOM ENTRY BANNER (TOP-CENTER)
               =============================================================== */}
            {roomBanner.visible && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-sky-500/40 rounded-xl px-4 py-2 shadow-xl flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sky-400 text-[18px]">
                    meeting_room
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{roomBanner.name}</div>
                    <div className="text-[10px] font-mono text-sky-300">{roomBanner.subtitle}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                OVERLAY E: TOP FLOATING HUD PILLS (CAMERA, ROOMS, X-RAY MODE)
               =============================================================== */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
              {/* Left Pill: FPP / Orbit + Room Waypoints + Doors + Pause */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0B132B]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl pointer-events-auto">
                {/* FPP vs Orbit Toggle */}
                <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                  <button
                    onClick={() => {
                      setCameraMode('fpp');
                      setIsWalkthroughStarted(true);
                      if (cameraPreset === 'overview' || cameraPreset === 'top') {
                        setCameraPreset('exterior_entry');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      cameraMode === 'fpp'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">directions_walk</span>
                    <span>First-Person</span>
                  </button>
                  <button
                    onClick={() => {
                      setCameraMode('orbit');
                      setCameraPreset('overview');
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      cameraMode === 'orbit'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">3d_rotation</span>
                    <span>3D Orbit</span>
                  </button>
                </div>

                {/* Room Waypoint Selector */}
                <select
                  value={cameraPreset}
                  onChange={(e) => setCameraPreset(e.target.value as CameraPreset)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-sky-300 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="exterior_entry">Spawn: Outside Main Entrance</option>
                  <option value="foyer">Room: Entrance Foyer &amp; DB</option>
                  <option value="living">Room: Living &amp; Dining Hall</option>
                  <option value="kitchen">Room: Modular Kitchen</option>
                  <option value="master_bed">Room: Master Bedroom</option>
                  <option value="bed2">Room: Guest Bedroom</option>
                  <option value="bath1">Room: Common Bathroom</option>
                  <option value="db">Inspect: 8-Way TPN Main DB</option>
                  <option value="overview">View: 3D Isometric Overview</option>
                  <option value="top">View: Top Plan</option>
                </select>

                {/* Open/Close All Doors Button */}
                <button
                  onClick={handleToggleAllDoors}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                    allDoorsOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title="Open or Close All Apartment Doors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {allDoorsOpen ? 'door_open' : 'door_front'}
                  </span>
                  <span className="hidden sm:inline">
                    {allDoorsOpen ? 'Doors Open' : 'Open Doors'}
                  </span>
                </button>

                {/* Touch / Virtual Controls Toggle */}
                <button
                  onClick={() => setShowMobileControls((prev) => !prev)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                    showMobileControls
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Show On-Screen Walk & Look Joysticks"
                >
                  <span className="material-symbols-outlined text-[15px]">gamepad</span>
                </button>

                {/* Pause Button in FPP */}
                {cameraMode === 'fpp' && isWalkthroughStarted && (
                  <button
                    onClick={() => setIsWalkthroughPaused((prev) => !prev)}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                    title="Pause Walkthrough (ESC)"
                  >
                    <span className="material-symbols-outlined text-[15px]">pause</span>
                    <span className="hidden md:inline">ESC</span>
                  </button>
                )}
              </div>

              {/* Right Pill: Normal vs Electrical Inspection Mode (X-Ray) + Sub-Layer Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0B132B]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl pointer-events-auto">
                <button
                  onClick={() =>
                    setViewMode((prev) => (prev === 'cutaway' ? 'finished' : 'cutaway'))
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'cutaway'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-900 text-sky-300 border border-sky-500/30 hover:bg-slate-800'
                  }`}
                  title="Toggle Transparent-Wall Electrical Conduit Inspection Mode [X]"
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>
                    {viewMode === 'cutaway'
                      ? 'X-Ray Electrical Mode: ON [X]'
                      : 'Electrical Inspection Mode [X]'}
                  </span>
                </button>

                {/* Quick Circuit Sub-System Toggles when in X-Ray Mode */}
                {viewMode === 'cutaway' && (
                  <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800">
                    {(
                      [
                        { key: 'lighting', label: 'Lighting', color: 'text-sky-300' },
                        { key: 'power', label: '16A Power', color: 'text-amber-300' },
                        { key: 'heavy', label: 'AC/Geyser', color: 'text-purple-300' },
                        { key: 'earthing', label: 'Earthing', color: 'text-emerald-300' }
                      ] as const
                    ).map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() =>
                          setCircuitFilter((prev) => ({ ...prev, [sub.key]: !prev[sub.key] }))
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                          circuitFilter[sub.key]
                            ? `bg-slate-800 ${sub.color} border border-slate-700`
                            : 'text-slate-500 line-through'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowMiniMap((prev) => !prev)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                    showMiniMap
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Live 2D Radar Mini-Map"
                >
                  <span className="material-symbols-outlined text-[15px]">radar</span>
                  <span className="hidden sm:inline">Radar</span>
                </button>
              </div>
            </div>

            {/* ===============================================================
                OVERLAY F: LIVE 2D RADAR MINI-MAP WITH PLAYER VIEW CONE
               =============================================================== */}
            {showMiniMap && (
              <div className="absolute top-16 right-3 z-20 bg-[#0B132B]/92 backdrop-blur-md border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl w-52 pointer-events-auto">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
                      Live 2BHK Radar
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-sky-300 truncate max-w-[100px]">
                    {playerPose.roomName}
                  </span>
                </div>

                {/* SVG Floor Plan Radar (Click any room to teleport) */}
                {(() => {
                  let minX = Infinity,
                    maxX = -Infinity,
                    minZ = Infinity,
                    maxZ = -Infinity;
                  project.rooms.forEach((r) => {
                    minX = Math.min(minX, r.x);
                    maxX = Math.max(maxX, r.x + r.width);
                    minZ = Math.min(minZ, r.z);
                    maxZ = Math.max(maxZ, r.z + r.length);
                  });
                  const foyerRm = project.rooms.find((r) => r.type === 'foyer');
                  const entryW = foyerRm ? foyerRm.width + 0.6 : 5.4;
                  const entryH = 2.4;
                  const entryX = foyerRm ? foyerRm.x - 0.3 : 0;
                  const entryZ = (foyerRm ? foyerRm.z : minZ) - entryH;
                  const vbMinX = Math.min(minX, entryX) - 1.6;
                  const vbMinZ = Math.min(minZ, entryZ) - 1.2;
                  const vbW = maxX - vbMinX + 1.8;
                  const vbH = maxZ - vbMinZ + 1.8;
                  const dbPt = project.electricalPoints.find((p) => p.type === 'db');

                  return (
                    <svg
                      viewBox={`${vbMinX} ${vbMinZ} ${vbW} ${vbH}`}
                      className="w-full h-40 bg-slate-950/90 rounded-xl border border-slate-800/90 cursor-pointer"
                    >
                      {/* Exterior Entrance Landing */}
                      <rect
                        x={entryX}
                        y={entryZ}
                        width={entryW}
                        height={entryH}
                        fill="#1e293b"
                        stroke="#334155"
                        strokeWidth={0.12}
                        rx={0.2}
                        onClick={handleResetSpawn}
                      />
                      <text
                        x={entryX + entryW / 2}
                        y={entryZ + entryH / 2 + 0.2}
                        fontSize={0.75}
                        fill="#94a3b8"
                        textAnchor="middle"
                        className="pointer-events-none font-mono"
                      >
                        ENTRY
                      </text>

                      {/* Rooms */}
                      {project.rooms.map((rm) => {
                        const isPlayerHere = playerPose.roomId === rm.id;
                        return (
                          <g
                            key={rm.id}
                            onClick={() => {
                              setTeleportTarget({
                                x: rm.x + rm.width / 2,
                                z: rm.z + rm.length / 2,
                                seq: Date.now()
                              });
                            }}
                          >
                            <rect
                              x={rm.x}
                              y={rm.z}
                              width={rm.width}
                              height={rm.length}
                              fill={
                                isPlayerHere
                                  ? 'rgba(14, 165, 233, 0.28)'
                                  : 'rgba(15, 23, 42, 0.85)'
                              }
                              stroke={isPlayerHere ? '#38bdf8' : '#475569'}
                              strokeWidth={isPlayerHere ? 0.22 : 0.14}
                            />
                            <text
                              x={rm.x + rm.width / 2}
                              y={rm.z + rm.length / 2}
                              fontSize={0.85}
                              fill={isPlayerHere ? '#f8fafc' : '#94a3b8'}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="pointer-events-none font-sans font-bold"
                            >
                              {rm.name.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}

                      {/* Door Indicators (Green = Open, Amber = Closed) */}
                      {project.openings
                        .filter((o) => o.type === 'door')
                        .map((door) => {
                          const rm = project.rooms.find((r) => r.id === door.roomId);
                          if (!rm) return null;
                          const isHoriz =
                            door.wallDirection === 'north' || door.wallDirection === 'south';
                          const dx = isHoriz
                            ? rm.x + door.offset + door.width / 2
                            : door.wallDirection === 'west'
                            ? rm.x
                            : rm.x + rm.width;
                          const dz = isHoriz
                            ? door.wallDirection === 'north'
                              ? rm.z
                              : rm.z + rm.length
                            : rm.z + door.offset + door.width / 2;
                          const isOpen = !!doorStates[door.id];
                          return (
                            <circle
                              key={door.id}
                              cx={dx}
                              cy={dz}
                              r={0.42}
                              fill={isOpen ? '#10b981' : '#f59e0b'}
                              stroke="#090d16"
                              strokeWidth={0.09}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDoor(door.id);
                              }}
                            />
                          );
                        })}

                      {/* Main DB Marker */}
                      <rect
                        x={dbPt ? dbPt.x - 0.15 : 0.15}
                        y={dbPt ? dbPt.z - 0.35 : -2.1}
                        width={0.65}
                        height={0.65}
                        fill="#ef4444"
                        rx={0.12}
                      />

                      {/* Player Position & View Cone */}
                      {(() => {
                        const px = playerPose.projectX;
                        const pz = playerPose.projectZ;
                        const dirX = -Math.sin(playerPose.yaw);
                        const dirZ = -Math.cos(playerPose.yaw);
                        const leftX = -Math.sin(playerPose.yaw + 0.55);
                        const leftZ = -Math.cos(playerPose.yaw + 0.55);
                        const rightX = -Math.sin(playerPose.yaw - 0.55);
                        const rightZ = -Math.cos(playerPose.yaw - 0.55);
                        const coneLen = 2.8;
                        return (
                          <g className="pointer-events-none">
                            <polygon
                              points={`${px},${pz} ${px + leftX * coneLen},${pz + leftZ * coneLen} ${
                                px + rightX * coneLen
                              },${pz + rightZ * coneLen}`}
                              fill="rgba(56, 189, 248, 0.32)"
                              stroke="rgba(56, 189, 248, 0.7)"
                              strokeWidth={0.08}
                            />
                            <line
                              x1={px}
                              y1={pz}
                              x2={px + dirX * 1.7}
                              y2={pz + dirZ * 1.7}
                              stroke="#38bdf8"
                              strokeWidth={0.18}
                            />
                            <circle
                              cx={px}
                              cy={pz}
                              r={0.52}
                              fill="#38bdf8"
                              stroke="#ffffff"
                              strokeWidth={0.16}
                            />
                          </g>
                        );
                      })()}
                    </svg>
                  );
                })()}

                <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-400 px-0.5">
                  <span>Click room to teleport</span>
                  <span className="text-emerald-400">
                    {isPointerLocked ? 'Mouse Locked' : 'Click 3D to Look'}
                  </span>
                </div>
              </div>
            )}

            {/* ===============================================================
                OVERLAY G: ON-SCREEN MOBILE / VIRTUAL WALK & LOOK CONTROLS
               =============================================================== */}
            {showMobileControls && cameraMode === 'fpp' && (
              <div className="absolute bottom-16 left-4 right-4 z-20 flex items-end justify-between pointer-events-none">
                {/* Left Pad: Walk Forward / Back / Strafe */}
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-700 rounded-2xl p-2 shadow-xl pointer-events-auto grid grid-cols-3 gap-1 w-32 h-32">
                  <div />
                  <button
                    onMouseDown={() => setMobileInput((p) => ({ ...p, moveY: 1 }))}
                    onMouseUp={() => setMobileInput((p) => ({ ...p, moveY: 0 }))}
                    onTouchStart={() => setMobileInput((p) => ({ ...p, moveY: 1 }))}
                    onTouchEnd={() => setMobileInput((p) => ({ ...p, moveY: 0 }))}
                    className="rounded-lg bg-slate-800 active:bg-sky-500 text-white flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                  </button>
                  <div />
                  <button
                    onMouseDown={() => setMobileInput((p) => ({ ...p, moveX: -1 }))}
                    onMouseUp={() => setMobileInput((p) => ({ ...p, moveX: 0 }))}
                    onTouchStart={() => setMobileInput((p) => ({ ...p, moveX: -1 }))}
                    onTouchEnd={() => setMobileInput((p) => ({ ...p, moveX: 0 }))}
                    className="rounded-lg bg-slate-800 active:bg-sky-500 text-white flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_left</span>
                  </button>
                  <div className="flex items-center justify-center text-[9px] font-mono text-slate-400">
                    WALK
                  </div>
                  <button
                    onMouseDown={() => setMobileInput((p) => ({ ...p, moveX: 1 }))}
                    onMouseUp={() => setMobileInput((p) => ({ ...p, moveX: 0 }))}
                    onTouchStart={() => setMobileInput((p) => ({ ...p, moveX: 1 }))}
                    onTouchEnd={() => setMobileInput((p) => ({ ...p, moveX: 0 }))}
                    className="rounded-lg bg-slate-800 active:bg-sky-500 text-white flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_right</span>
                  </button>
                  <div />
                  <button
                    onMouseDown={() => setMobileInput((p) => ({ ...p, moveY: -1 }))}
                    onMouseUp={() => setMobileInput((p) => ({ ...p, moveY: 0 }))}
                    onTouchStart={() => setMobileInput((p) => ({ ...p, moveY: -1 }))}
                    onTouchEnd={() => setMobileInput((p) => ({ ...p, moveY: 0 }))}
                    className="rounded-lg bg-slate-800 active:bg-sky-500 text-white flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                  </button>
                  <div />
                </div>

                {/* Right Pad: Look Around & Action Button */}
                <div className="flex items-end gap-2 pointer-events-auto">
                  {hoveredTarget && (
                    <button
                      onClick={() => handleInteractTarget(hoveredTarget)}
                      className="px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                    >
                      Interact [E]
                    </button>
                  )}

                  <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-700 rounded-2xl p-2 shadow-xl grid grid-cols-3 gap-1 w-32 h-32">
                    <div />
                    <button
                      onMouseDown={() => setMobileInput((p) => ({ ...p, lookY: -1 }))}
                      onMouseUp={() => setMobileInput((p) => ({ ...p, lookY: 0 }))}
                      onTouchStart={() => setMobileInput((p) => ({ ...p, lookY: -1 }))}
                      onTouchEnd={() => setMobileInput((p) => ({ ...p, lookY: 0 }))}
                      className="rounded-lg bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">north</span>
                    </button>
                    <div />
                    <button
                      onMouseDown={() => setMobileInput((p) => ({ ...p, lookX: -1 }))}
                      onMouseUp={() => setMobileInput((p) => ({ ...p, lookX: 0 }))}
                      onTouchStart={() => setMobileInput((p) => ({ ...p, lookX: -1 }))}
                      onTouchEnd={() => setMobileInput((p) => ({ ...p, lookX: 0 }))}
                      className="rounded-lg bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">west</span>
                    </button>
                    <div className="flex items-center justify-center text-[9px] font-mono text-slate-400">
                      LOOK
                    </div>
                    <button
                      onMouseDown={() => setMobileInput((p) => ({ ...p, lookX: 1 }))}
                      onMouseUp={() => setMobileInput((p) => ({ ...p, lookX: 0 }))}
                      onTouchStart={() => setMobileInput((p) => ({ ...p, lookX: 1 }))}
                      onTouchEnd={() => setMobileInput((p) => ({ ...p, lookX: 0 }))}
                      className="rounded-lg bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">east</span>
                    </button>
                    <div />
                    <button
                      onMouseDown={() => setMobileInput((p) => ({ ...p, lookY: 1 }))}
                      onMouseUp={() => setMobileInput((p) => ({ ...p, lookY: 0 }))}
                      onTouchStart={() => setMobileInput((p) => ({ ...p, lookY: 1 }))}
                      onTouchEnd={() => setMobileInput((p) => ({ ...p, lookY: 0 }))}
                      className="rounded-lg bg-slate-800 active:bg-amber-500 text-white flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">south</span>
                    </button>
                    <div />
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                OVERLAY H: COLLAPSIBLE BOTTOM ENGINEERING DOCK DRAWER
               =============================================================== */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-col items-center pointer-events-none z-20">
              <div className="w-full max-w-4xl bg-[#0B132B]/94 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transition-all">
                {/* Dock Header Tabs */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <button
                      onClick={() => {
                        setActiveDockTab('layers');
                        setDockExpanded(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeDockTab === 'layers' && dockExpanded
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">layers</span>
                      <span>Layers &amp; X-Ray</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveDockTab('db_exploded');
                        setDockExpanded(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeDockTab === 'db_exploded' && dockExpanded
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">developer_board</span>
                      <span>Exploded DB &amp; Breakers</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveDockTab('circuits');
                        setDockExpanded(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeDockTab === 'circuits' && dockExpanded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">cable</span>
                      <span>Circuit Tracer ({currentCircuit?.code})</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveDockTab('specs');
                        setDockExpanded(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeDockTab === 'specs' && dockExpanded
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      <span className="truncate max-w-[160px]">
                        Inspector: {selectedPoint?.name.split(' ')[0] || 'DB'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden md:inline text-[10px] font-mono text-slate-400">
                      WASD Walk • Mouse Look • [E] Interact • [X] X-Ray
                    </span>
                    <button
                      onClick={() => setDockExpanded(!dockExpanded)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title={dockExpanded ? 'Minimize Engineering Dock' : 'Expand Engineering Dock'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {dockExpanded ? 'expand_more' : 'expand_less'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dock Body Content */}
                {dockExpanded && (
                  <div className="p-3 bg-[#0B132B]/95">
                    {/* TAB 1: Layers & Wall Transparency */}
                    {activeDockTab === 'layers' && (
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(
                            [
                              { key: 'architecture', label: 'Walls & Slab', icon: 'home' },
                              { key: 'furniture', label: '3D Furniture', icon: 'chair' },
                              { key: 'lighting', label: 'Lights & Fans', icon: 'lightbulb' },
                              { key: 'conduits', label: 'PVC Conduits', icon: 'timeline' },
                              { key: 'wiring', label: 'Phase/PE Wires', icon: 'cable' },
                              { key: 'distribution', label: 'DB & Sockets', icon: 'power' }
                            ] as const
                          ).map((item) => (
                            <button
                              key={item.key}
                              onClick={() => toggleLayer(item.key)}
                              className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                layers[item.key]
                                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </button>
                          ))}

                          <button
                            onClick={() => setCeilingVisible(!ceilingVisible)}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                              ceilingVisible
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">roofing</span>
                            <span>{ceilingVisible ? 'Ceiling: ON' : 'Ceiling: OFF'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 font-medium">
                            Wall Opacity:
                          </span>
                          <input
                            type="range"
                            min={0.12}
                            max={1.0}
                            step={0.04}
                            value={wallOpacity}
                            onChange={(e) => setWallOpacity(parseFloat(e.target.value))}
                            className="w-24 accent-sky-400 cursor-pointer"
                          />
                          <span className="font-mono text-[11px] text-sky-400 w-9 text-right">
                            {Math.round(wallOpacity * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: Interactive 3D Exploded Distribution Board & Breaker Toggles */}
                    {activeDockTab === 'db_exploded' && (
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const next = !dbExploded;
                                setDbExploded(next);
                                if (next) setCameraPreset('db');
                              }}
                              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                dbExploded
                                  ? 'bg-amber-500 text-slate-950 shadow-md'
                                  : 'bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">layers</span>
                              <span>
                                {dbExploded
                                  ? 'Collapse Exploded DB'
                                  : 'Explode 8-Way TPN DB in 3D'}
                              </span>
                            </button>

                            <button
                              onClick={() => setDbDoorOpen(!dbDoorOpen)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                            >
                              {dbDoorOpen ? 'Close DB Door' : 'Open DB Door'}
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            Click any breaker below or directly on the 3D DIN-rail to trace or trip/reset the circuit:
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-1">
                          {project.circuits.map((circ) => {
                            const isClosed = breakerStates[circ.id] !== false;
                            const isSelected = activeCircuit === circ.id;
                            return (
                              <div
                                key={circ.id}
                                onClick={() => setActiveCircuit(circ.id)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-slate-800/95 border-sky-400 shadow-sm'
                                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span
                                    className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white"
                                    style={{ backgroundColor: circ.phaseColor }}
                                  >
                                    {circ.code}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleBreaker(circ.id);
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase cursor-pointer ${
                                      isClosed
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    }`}
                                  >
                                    {isClosed ? 'ON' : 'TRIPPED'}
                                  </button>
                                </div>
                                <div className="text-[10px] font-semibold text-slate-200 truncate">
                                  {circ.name.split(' ')[0]} {circ.name.split(' ')[1]}
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                                  {circ.mcbRating.split(' ')[0]} {circ.mcbRating.split(' ')[1]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Circuit Wire Tracing */}
                    {activeDockTab === 'circuits' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {project.circuits.map((circ) => {
                            const isSel = activeCircuit === circ.id;
                            return (
                              <button
                                key={circ.id}
                                onClick={() => setActiveCircuit(circ.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                                  isSel
                                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: circ.phaseColor }}
                                />
                                <span>
                                  {circ.code}: {circ.name.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                          <div>
                            <span className="font-bold text-sky-400">
                              {currentCircuit.code} — {currentCircuit.name}:{' '}
                            </span>
                            <span className="text-slate-300">{currentCircuit.wireType}</span>
                          </div>
                          <div className="font-mono text-amber-400">
                            Protection: {currentCircuit.mcbRating} • Conduit:{' '}
                            {currentCircuit.conduitSize} PVC
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: Interactive Component Inspector & Live Controls */}
                    {activeDockTab === 'specs' && selectedPoint && (
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[20px]">
                              electrical_services
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {selectedPoint.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">
                                {selectedPointRoom?.name || 'Apartment Zone'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Mount Height:{' '}
                              <span className="text-slate-200">
                                {selectedPoint.y.toFixed(2)}m AFFL
                              </span>{' '}
                              • Rated Load:{' '}
                              <span className="text-amber-400 font-bold">
                                {selectedPoint.powerWatts}W @ 230V AC
                              </span>{' '}
                              • Circuit:{' '}
                              <span className="text-emerald-400">
                                {selectedPoint.circuitId.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (selectedPoint.type === 'switch_board_6a') {
                                handleToggleRoomSwitchboard(
                                  selectedPoint.id,
                                  selectedPoint.roomId
                                );
                              } else {
                                handleTogglePointPower(selectedPoint.id);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              selectedPoint.isOn
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              power_settings_new
                            </span>
                            <span>{selectedPoint.isOn ? 'Power ON' : 'Power OFF'}</span>
                          </button>

                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 mr-1">Fan Speed:</span>
                            {[0, 1, 2, 3].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => setFanSpeed(spd)}
                                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                                  fanSpeed === spd
                                    ? 'bg-sky-500 text-white font-bold'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {spd === 0 ? 'OFF' : spd}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 2D FLOOR PLAN CAD EDITOR */}
        {workspaceTab === 'floor_plan' && (
          <FloorPlanEditor
            project={project}
            onUpdateProject={(updated) => setProject(updated)}
            selectedPointId={selectedCompId}
            onSelectPoint={(id) => setSelectedCompId(id || 'pt_main_db')}
          />
        )}

        {/* TAB 3: CIRCUITS & LIVE SIMULATION DASHBOARD */}
        {workspaceTab === 'circuits' && (
          <div className="w-full h-full overflow-y-auto bg-[#090F21] p-6 text-slate-100">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">electric_bolt</span>
                    2BHK Residential Electrical Distribution &amp; Load Schedule
                  </h2>
                  <p className="text-xs text-slate-400">
                    Compliant with IS:732 (Electrical Wiring Installations) &amp; IS:12640 (Residual Current Protection)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportProjectToDxf(project)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Export Schedule &amp; Plan (.DXF)</span>
                  </button>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-sky-400">
                    Sanctioned Load: {project.meta.sanctionedLoadKw} kW @ {project.meta.supplyPhase}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.circuits.map((circ) => {
                  const connectedPts = project.electricalPoints.filter((p) =>
                    circ.connectedPointIds.includes(p.id)
                  );
                  const totalWatts = connectedPts.reduce((acc, p) => acc + (p.powerWatts || 0), 0);
                  const currentAmps = (totalWatts / (230 * 0.95)).toFixed(1);
                  const isBreakerOn = breakerStates[circ.id] !== false;

                  return (
                    <div
                      key={circ.id}
                      className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-mono font-bold text-white"
                              style={{ backgroundColor: circ.phaseColor }}
                            >
                              {circ.code}
                            </span>
                            <span className="font-bold text-slate-200 text-sm">{circ.name}</span>
                          </div>
                          <button
                            onClick={() => handleToggleBreaker(circ.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                              isBreakerOn
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {isBreakerOn ? 'MCB ON' : 'TRIPPED'}
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">{circ.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Conductor Gauge:</span>
                            <span className="text-slate-200 font-semibold">{circ.wireType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">
                              Protection &amp; Conduit:
                            </span>
                            <span className="text-amber-400 font-semibold">
                              {circ.mcbRating} • {circ.conduitSize} PVC
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Connected Load:</span>
                            <span className="text-amber-400 font-bold">{totalWatts} Watts</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">
                              Full Load Current:
                            </span>
                            <span className="text-sky-400 font-bold">{currentAmps} A</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Connected Points: {connectedPts.length} outlets/fixtures</span>
                        <span className="text-emerald-400 font-semibold">IS:732 Compliant</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Modals */}
      {showWizardModal && (
        <ProjectWizardModal
          onClose={() => setShowWizardModal(false)}
          onApplyProject={(newProj) => {
            setProject(newProj);
            setWorkspaceTab('3d_twin');
          }}
        />
      )}

      {showBoqModal && (
        <BoqModal project={project} onClose={() => setShowBoqModal(false)} />
      )}
    </div>
  );
};
