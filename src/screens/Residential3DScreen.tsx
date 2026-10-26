import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  ResidentialCanvas,
  ResidentialCameraPreset
} from '../three/ResidentialCanvas';
import { ResidentialViewMode } from '../three/residentialModelGenerators';
import { ResidentialLayerVisibility } from '../three/ParametricHouseGenerator';
import { NavigationTab } from '../types';
import { ResidentialProject } from '../types/residentialDesigner';
import {
  STANDARD_2BHK_PROJECT,
  COMPACT_2BHK_PROJECT,
  LUXURY_3BHK_PROJECT
} from '../data/residentialPresets';
import { FloorPlanEditor } from '../components/cad/FloorPlanEditor';
import { ProjectWizardModal } from '../components/cad/ProjectWizardModal';
import { BoqModal } from '../components/cad/BoqModal';
import { calculateProjectBoq } from '../components/cad/BoqCalculator';
import {
  exportProjectToDxf,
  exportSceneToGltf
} from '../utils/residentialExporters';

interface Residential3DScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (serviceTopic?: string) => void;
  onSwitchToSubstation?: () => void;
}

type WorkspaceTab = '3d_twin' | 'floor_plan' | 'circuits';
type DockTab = 'layers' | 'db_exploded' | 'circuits' | 'specs';

const STORAGE_KEY = 'ananya_residential_designer_proj_v2';

export const Residential3DScreen: React.FC<Residential3DScreenProps> = ({
  onOpenConsultation,
  onSwitchToSubstation
}) => {
  // 1. Parametric Project State with LocalStorage Persistence
  const [project, setProject] = useState<ResidentialProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rooms && parsed.electricalPoints && parsed.circuits) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return STANDARD_2BHK_PROJECT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // ignore
    }
  }, [project]);

  // Reference to the live Three.js root group for GLB / glTF 3D model export
  const sceneRootRef = useRef<THREE.Object3D | null>(null);
  const [isExporting3D, setIsExporting3D] = useState<boolean>(false);

  // 2. Workspace View Tabs
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('3d_twin');

  // 3. 3D Viewport & CAD Layer Controls
  const [viewMode, setViewMode] = useState<ResidentialViewMode>('cutaway');
  const [wallOpacity, setWallOpacity] = useState<number>(0.26);
  const [ceilingVisible, setCeilingVisible] = useState<boolean>(false);
  const [dbDoorOpen, setDbDoorOpen] = useState<boolean>(true);
  const [dbExploded, setDbExploded] = useState<boolean>(false);
  const [isPovMode, setIsPovMode] = useState<boolean>(false);
  const [layers, setLayers] = useState<ResidentialLayerVisibility>({
    architecture: true,
    furniture: true,
    lighting: true,
    conduits: true,
    wiring: true,
    distribution: true
  });

  // Circuit breaker states (true = ON/Closed, false = OFF/Tripped)
  const [breakerStates, setBreakerStates] = useState<Record<string, boolean>>({
    c1_living_lighting: true,
    c2_bedroom_fan: true,
    c3_power_sockets: true,
    c4_kitchen_power: true,
    c5_heavy_ac: true,
    c6_bathroom_geyser: true,
    c_earth_grid: true
  });

  const [activeCircuit, setActiveCircuit] = useState<string>('c1_living_lighting');
  const [livingLightOn, setLivingLightOn] = useState<boolean>(true);
  const [fanSpeed, setFanSpeed] = useState<number>(2); // 0=off, 1=low, 2=med, 3=high
  const [cameraPreset, setCameraPreset] = useState<ResidentialCameraPreset>('overview');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [selectedCompId, setSelectedCompId] = useState<string>('pt_main_db');

  // 4. Modals & Dropdowns
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [showBoqModal, setShowBoqModal] = useState<boolean>(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState<boolean>(false);
  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);

  // 5. Dock collapse & tab state
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<DockTab>('layers');

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking a 3D component or MCB breaker in the 3D scene
  const handleSelectComponentFrom3D = (id: string) => {
    if (id.startsWith('breaker_')) {
      const circuitId = id.replace('breaker_', '');
      setActiveCircuit(circuitId);
      setActiveDockTab('db_exploded');
      if (isDockCollapsed) setIsDockCollapsed(false);
      return;
    }

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
    if (isDockCollapsed) {
      setIsDockCollapsed(false);
    }
  };

  // Toggle an individual electrical point ON/OFF
  const handleTogglePointPower = (pointId: string) => {
    setProject((prev) => ({
      ...prev,
      electricalPoints: prev.electricalPoints.map((pt) =>
        pt.id === pointId ? { ...pt, isOn: !pt.isOn } : pt
      )
    }));
  };

  // Toggle a circuit breaker ON/OFF (and update its connected points)
  const handleToggleBreaker = (circuitId: string) => {
    const nextState = !(breakerStates[circuitId] !== false);
    setBreakerStates((prev) => ({ ...prev, [circuitId]: nextState }));
  };

  // Toggle layer visibility
  const toggleLayer = (key: keyof ResidentialLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.meta.projectName.replace(/\s+/g, '_')}.ananya.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.rooms && parsed.electricalPoints) {
          setProject(parsed);
        }
      } catch {
        // ignore invalid file
      }
    };
    reader.readAsText(file);
  };

  // Handle 3D GLB / glTF Export
  const handleExport3DGltf = async (binary: boolean) => {
    if (!sceneRootRef.current) return;
    setIsExporting3D(true);
    setShowExportDropdown(false);
    try {
      await exportSceneToGltf(sceneRootRef.current, project.meta.projectName, binary);
    } finally {
      setIsExporting3D(false);
    }
  };

  // Metrics Calculation
  const totalFloorAreaSqM = project.rooms.reduce((acc, r) => acc + r.width * r.length, 0);
  const totalFloorAreaSqFt = totalFloorAreaSqM * 10.7639;
  const runningWatts = project.electricalPoints
    .filter((p) => p.isOn && breakerStates[p.circuitId] !== false)
    .reduce((acc, p) => acc + (p.powerWatts || 0), 0);
  const runningAmps = (runningWatts / (230 * 0.95)).toFixed(2);

  const boq = calculateProjectBoq(project);
  const currentCircuit = project.circuits.find((c) => c.id === activeCircuit) || project.circuits[0];
  const selectedPoint =
    project.electricalPoints.find((p) => p.id === selectedCompId) || project.electricalPoints[0];
  const selectedPointRoom = project.rooms.find((r) => r.id === selectedPoint?.roomId);

  const roomWaypoints: { id: ResidentialCameraPreset; label: string; icon: string }[] = [
    { id: 'db', label: 'Foyer & DB', icon: 'bolt' },
    { id: 'living', label: 'Living & Dining', icon: 'weekend' },
    { id: 'kitchen', label: 'Kitchen', icon: 'countertops' },
    { id: 'bedroom', label: 'Master Bed', icon: 'bed' },
    { id: 'guest_bed', label: 'Guest Bed', icon: 'single_bed' },
    { id: 'bathroom', label: 'Bathroom', icon: 'bathtub' },
    { id: 'earth_pit', label: 'Earth Pit', icon: 'Offline_bolt' }
  ];

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-[#0A1128] text-slate-100 flex flex-col select-none">
      {/* 1. Main Workspace Top Header */}
      <div className="h-14 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 gap-3 z-30">
        {/* Brand Zone & Project Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <span className="material-symbols-outlined text-[18px]">home</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight leading-none">
                  RESIDENTIAL 2BHK INTERIOR TWIN — 3D BIM CAD
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-mono font-bold">
                  IS:732 / NBC 2016
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[9px] font-mono">
                  ~1,000 SQ.FT ASSUMED LAYOUT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                {project.meta.projectName} ({totalFloorAreaSqFt.toFixed(0)} sq.ft / {totalFloorAreaSqM.toFixed(1)} m²)
              </div>
            </div>
          </div>
        </div>

        {/* Center Workspace Mode Tabs */}
        <div className="flex items-center bg-[#1E293B] rounded-xl p-1 border border-slate-700/80">
          <button
            onClick={() => setWorkspaceTab('3d_twin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceTab === '3d_twin'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            <span>3D CAD Model</span>
          </button>

          <button
            onClick={() => setWorkspaceTab('floor_plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceTab === 'floor_plan'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">floor</span>
            <span>2D Floor Plan CAD</span>
          </button>

          <button
            onClick={() => setWorkspaceTab('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceTab === 'circuits'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>DB Schedule &amp; Protection</span>
          </button>

          <button
            onClick={() => setShowBoqModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span className="hidden md:inline">BOQ (₹{boq.grandTotal.toLocaleString('en-IN')})</span>
          </button>
        </div>

        {/* Right Action Tools: CAD Exports (DXF, GLB, glTF), Templates, Wizard */}
        <div className="flex items-center gap-2">
          {/* CAD & 3D Deliverable Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={isExporting3D}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Export 2D DXF CAD Drawing or 3D GLB/glTF BIM Model"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{isExporting3D ? 'Exporting...' : 'Export CAD / 3D'}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  CAD &amp; 3D BIM Deliverables
                </div>
                <button
                  onClick={() => {
                    exportProjectToDxf(project);
                    setShowExportDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex items-start gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-amber-400 text-[18px] mt-0.5">architecture</span>
                  <div>
                    <div className="font-bold text-white">Export 2D CAD Drawing (.DXF)</div>
                    <div className="text-[10px] text-slate-400">Multi-layer AutoCAD floor plan &amp; PVC conduit layout</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport3DGltf(true)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex items-start gap-2.5 border-t border-slate-800/80 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sky-400 text-[18px] mt-0.5">view_in_ar</span>
                  <div>
                    <div className="font-bold text-white">Export 3D Binary Model (.GLB)</div>
                    <div className="text-[10px] text-slate-400">Complete 3D apartment, furniture, DB &amp; conduits</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport3DGltf(false)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex items-start gap-2.5 border-t border-slate-800/80 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-emerald-400 text-[18px] mt-0.5">deployed_code</span>
                  <div>
                    <div className="font-bold text-white">Export 3D Standard Scene (.glTF)</div>
                    <div className="text-[10px] text-slate-400">Interoperable JSON glTF 2.0 3D asset</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleExportJson();
                    setShowExportDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex items-start gap-2.5 border-t border-slate-800/80 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-purple-400 text-[18px] mt-0.5">data_object</span>
                  <div>
                    <div className="font-bold text-white">Save Project File (.JSON)</div>
                    <div className="text-[10px] text-slate-400">Parametric rooms, circuits &amp; BOQ data</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Preset Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Load Preset Template"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span className="hidden lg:inline">Presets</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showTemplateDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#0F172A] border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                <button
                  onClick={() => {
                    setProject(STANDARD_2BHK_PROJECT);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-sky-400">Standard 2BHK (~1,000 sq.ft)</span>
                  <span className="text-[10px] text-slate-400">Living, Kitchen, 2 Beds, Bath, Foyer &amp; TPN DB</span>
                </button>
                <button
                  onClick={() => {
                    setProject(COMPACT_2BHK_PROJECT);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col border-t border-slate-800 cursor-pointer"
                >
                  <span className="font-bold text-emerald-400">Compact 2BHK (850 sq.ft)</span>
                  <span className="text-[10px] text-slate-400">High efficiency urban apartment</span>
                </button>
                <button
                  onClick={() => {
                    setProject(LUXURY_3BHK_PROJECT);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col border-t border-slate-800 cursor-pointer"
                >
                  <span className="font-bold text-amber-400">Luxury 3BHK Villa (1850 sq.ft)</span>
                  <span className="text-[10px] text-slate-400">3-Phase 415V supply with dining</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowWizardModal(true)}
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="New Custom Project Wizard"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>

          <label
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Import Project JSON"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {onSwitchToSubstation && (
            <button
              onClick={onSwitchToSubstation}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Open 33kV Substation & Solar Yard Twin"
            >
              <span className="material-symbols-outlined text-[16px]">solar_power</span>
              <span>33kV Substation</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Workspace Body */}
      <div className="flex-1 relative overflow-hidden">
        {/* TAB 1: 3D DIGITAL TWIN */}
        {workspaceTab === '3d_twin' && (
          <div className="w-full h-full relative">
            <ResidentialCanvas
              project={project}
              viewMode={viewMode}
              ceilingVisible={ceilingVisible}
              dbDoorOpen={dbDoorOpen}
              dbExploded={dbExploded}
              isPovMode={isPovMode}
              layers={layers}
              wallOpacity={wallOpacity}
              breakerStates={breakerStates}
              activeCircuit={activeCircuit}
              livingLightOn={livingLightOn}
              fanSpeed={fanSpeed}
              cameraPreset={cameraPreset}
              isAutoRotate={isAutoRotate}
              onSelectComponent={handleSelectComponentFrom3D}
              onToggleLight={() => setLivingLightOn(!livingLightOn)}
              onSceneReady={(rootObj) => {
                sceneRootRef.current = rootObj;
              }}
            />

            {/* Top-Left Live Electrical Telemetry & Routing Legend HUD */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-xs pointer-events-auto">
              <div className="bg-[#0F172A]/92 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      IS:732 Live Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {project.meta.supplyPhase}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-slate-800 font-mono text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Active Load</div>
                    <div className="text-sm font-bold text-amber-400">{runningWatts} W</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Line Current</div>
                    <div className="text-sm font-bold text-sky-400">{runningAmps} A</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Earth Loop</div>
                    <div className="text-sm font-bold text-emerald-400">0.78 Ω</div>
                  </div>
                </div>

                {/* Color-Coded Conduit & Wiring Legend */}
                <div className="pt-2 space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Electrical Routing Legend:
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
                      <span className="text-slate-300 truncate">Lighting (1.5mm²)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                      <span className="text-slate-300 truncate">Sockets 16A (2.5mm²)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                      <span className="text-slate-300 truncate">Kitchen Power (4mm²)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shrink-0" />
                      <span className="text-slate-300 truncate">Split AC / Geyser</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                      <span className="text-slate-300 truncate">Protective Earth (PE 8 SWG / IS:3043)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* First-Person POV Active Instructions Banner */}
              {isPovMode && (
                <div className="bg-sky-950/90 backdrop-blur border border-sky-500/50 rounded-xl p-2.5 text-xs shadow-lg">
                  <div className="flex items-center justify-between text-sky-300 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">directions_walk</span>
                      First-Person POV Walkthrough
                    </span>
                    <span className="text-[10px] font-mono bg-sky-500/20 px-1.5 py-0.5 rounded">Y = 1.65m</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Use <kbd className="px-1 py-0.5 bg-slate-800 rounded text-sky-300 font-mono">W</kbd>
                    <kbd className="px-1 py-0.5 bg-slate-800 rounded text-sky-300 font-mono ml-0.5">A</kbd>
                    <kbd className="px-1 py-0.5 bg-slate-800 rounded text-sky-300 font-mono ml-0.5">S</kbd>
                    <kbd className="px-1 py-0.5 bg-slate-800 rounded text-sky-300 font-mono ml-0.5">D</kbd> or Arrow keys to walk freely, drag mouse to look 360°, or click a room waypoint.
                  </p>
                </div>
              )}
            </div>

            {/* Top-Center Camera Mode & POV Room Waypoint Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-1.5 pointer-events-auto">
              <div className="bg-[#0F172A]/92 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 shadow-xl">
                <button
                  onClick={() => {
                    setIsPovMode(false);
                    setCameraPreset('overview');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    !isPovMode && cameraPreset === 'overview'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">3d_rotation</span>
                  <span>Orbit 3D</span>
                </button>

                <button
                  onClick={() => {
                    setIsPovMode(false);
                    setCameraPreset('isometric');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    !isPovMode && cameraPreset === 'isometric'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">deployed_code</span>
                  <span>Isometric</span>
                </button>

                <button
                  onClick={() => {
                    setIsPovMode(false);
                    setCameraPreset('top_plan');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    !isPovMode && cameraPreset === 'top_plan'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">grid_on</span>
                  <span>Top-Down Plan</span>
                </button>

                <div className="h-4 w-px bg-slate-700 mx-0.5" />

                <button
                  onClick={() => {
                    const nextPov = !isPovMode;
                    setIsPovMode(nextPov);
                    if (nextPov && (cameraPreset === 'overview' || cameraPreset === 'top_plan' || cameraPreset === 'isometric')) {
                      setCameraPreset('living');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPovMode
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">directions_walk</span>
                  <span>First-Person POV</span>
                </button>

                <button
                  onClick={() => {
                    const nextExp = !dbExploded;
                    setDbExploded(nextExp);
                    if (nextExp) {
                      setIsPovMode(false);
                      setCameraPreset('db');
                      setActiveDockTab('db_exploded');
                      setIsDockCollapsed(false);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    dbExploded
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">layers</span>
                  <span>Explode DB</span>
                </button>
              </div>
            </div>

            {/* Top-Right Quick Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setLayers((prev) => ({ ...prev, furniture: !prev.furniture }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  layers.furniture
                    ? 'bg-[#0F172A]/90 text-emerald-300 border-emerald-500/40 hover:text-white'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Switch between Furnished and Unfurnished 3D Views"
              >
                <span className="material-symbols-outlined text-[16px]">chair</span>
                <span className="hidden sm:inline">{layers.furniture ? 'Furnished' : 'Unfurnished'}</span>
              </button>

              {!isPovMode && (
                <button
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isAutoRotate
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-[#0F172A]/90 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title="Toggle camera auto-orbit"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  <span className="hidden sm:inline">Auto-Orbit</span>
                </button>
              )}

              <button
                onClick={() => onOpenConsultation(`Residential 2BHK Electrical Design: ${project.meta.projectName}`)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Get Quote</span>
              </button>
            </div>

            {/* Bottom Floating Engineering Control Dock */}
            <div
              className="absolute z-30 transition-transform duration-300 ease-out"
              style={{
                bottom: '14px',
                left: '50%',
                transform: isDockCollapsed
                  ? 'translateX(-50%) translateY(calc(100% - 36px))'
                  : 'translateX(-50%) translateY(0)',
                maxWidth: 'min(980px, 95vw)',
                width: '100%'
              }}
            >
              {/* Collapse / Expand Toggle Button */}
              <div className="flex justify-center mb-1">
                <button
                  onClick={() => setIsDockCollapsed(!isDockCollapsed)}
                  className="px-4 py-1 rounded-t-xl bg-[#0F172A] border-t border-x border-slate-700 text-xs font-medium text-slate-300 hover:text-white shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isDockCollapsed ? 'expand_less' : 'expand_more'}
                  </span>
                  <span>{isDockCollapsed ? 'Show CAD & Electrical Controls (H)' : 'Collapse Controls (H)'}</span>
                </button>
              </div>

              {/* Dock Container */}
              <div className="bg-[#0F172A]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-100 flex flex-col gap-2.5">
                {/* Dock Nav Tabs & Room Waypoints */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveDockTab('layers')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'layers' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">layers</span>
                      <span>Layers &amp; X-Ray</span>
                    </button>

                    <button
                      onClick={() => setActiveDockTab('db_exploded')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'db_exploded' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">developer_board</span>
                      <span>Exploded DB &amp; MCBs</span>
                    </button>

                    <button
                      onClick={() => setActiveDockTab('circuits')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'circuits' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">cable</span>
                      <span>Circuit Tracing</span>
                    </button>

                    <button
                      onClick={() => setActiveDockTab('specs')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'specs' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">tune</span>
                      <span>Component Inspector</span>
                    </button>
                  </div>

                  {/* Room-to-Room Waypoint Quick Bar */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 hidden xl:inline">
                      {isPovMode ? 'POV Room:' : 'Camera:'}
                    </span>
                    {roomWaypoints.map((wp) => (
                      <button
                        key={wp.id}
                        onClick={() => setCameraPreset(wp.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
                          cameraPreset === wp.id
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                        }`}
                      >
                        {wp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB 1 CONTENT: CAD Layer Toggles & Transparent Wall X-Ray Controls */}
                {activeDockTab === 'layers' && (
                  <div className="flex flex-col gap-2.5 text-xs pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Wall View Mode */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Wall Mode:</span>
                        <button
                          onClick={() => setViewMode('finished')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            viewMode === 'finished' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Opaque Finished
                        </button>
                        <button
                          onClick={() => setViewMode('cutaway')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            viewMode === 'cutaway' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Transparent X-Ray (Concealed PVC)
                        </button>
                        <button
                          onClick={() => setViewMode('construction')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            viewMode === 'construction' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Brick Chasing
                        </button>
                      </div>

                      {/* X-Ray Opacity Slider */}
                      {viewMode === 'cutaway' && (
                        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400">Wall X-Ray Opacity:</span>
                          <input
                            type="range"
                            min={0.08}
                            max={0.9}
                            step={0.02}
                            value={wallOpacity}
                            onChange={(e) => setWallOpacity(parseFloat(e.target.value))}
                            className="w-24 accent-sky-400 cursor-pointer"
                          />
                          <span className="font-mono text-[11px] text-sky-400 w-9 text-right">
                            {Math.round(wallOpacity * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Individual Layer Toggles */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 mr-1">CAD Layers:</span>
                        {(
                          [
                            { key: 'architecture', label: 'Architecture' },
                            { key: 'furniture', label: 'Furniture (2BHK)' },
                            { key: 'lighting', label: 'Lighting & Fans' },
                            { key: 'conduits', label: 'PVC Conduits' },
                            { key: 'wiring', label: 'FRLS Wiring' },
                            { key: 'distribution', label: 'DB & Sockets' }
                          ] as { key: keyof ResidentialLayerVisibility; label: string }[]
                        ).map((item) => (
                          <button
                            key={item.key}
                            onClick={() => toggleLayer(item.key)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                              layers[item.key]
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {layers[item.key] ? 'visibility' : 'visibility_off'}
                            </span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                          <input
                            type="checkbox"
                            checked={ceilingVisible}
                            onChange={(e) => setCeilingVisible(e.target.checked)}
                            className="rounded accent-sky-500"
                          />
                          <span>Ceiling Slab</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2 CONTENT: Interactive 3D Exploded Distribution Board & Breaker Toggles */}
                {activeDockTab === 'db_exploded' && (
                  <div className="flex flex-col gap-2 text-xs pt-0.5">
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
                          <span>{dbExploded ? 'Collapse Exploded DB' : 'Explode 8-Way TPN DB in 3D'}</span>
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

                    {/* Interactive DIN-Rail Breaker Array */}
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

                {/* TAB 3 CONTENT: Circuit Wire Tracing */}
                {activeDockTab === 'circuits' && (
                  <div className="flex flex-col gap-2 pt-0.5">
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
                        <span className="font-bold text-sky-400">{currentCircuit.code} — {currentCircuit.name}: </span>
                        <span className="text-slate-300">{currentCircuit.wireType}</span>
                      </div>
                      <div className="font-mono text-amber-400">
                        Protection: {currentCircuit.mcbRating} • Conduit: {currentCircuit.conduitSize} PVC
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4 CONTENT: Interactive Component Inspector & Live Controls */}
                {activeDockTab === 'specs' && selectedPoint && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-0.5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">electrical_services</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{selectedPoint.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[10px]">
                            {selectedPointRoom?.name || 'Apartment Zone'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Mount Height: <span className="text-slate-200">{selectedPoint.y.toFixed(2)}m AFFL</span> • Rated Load:{' '}
                          <span className="text-amber-400 font-bold">{selectedPoint.powerWatts}W @ 230V AC</span> • Circuit:{' '}
                          <span className="text-emerald-400">{selectedPoint.circuitId.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Component Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePointPower(selectedPoint.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                          selectedPoint.isOn
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">power_settings_new</span>
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

              {/* Circuits Grid Cards */}
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
                            <span className="text-[10px] text-slate-400 block">Protection &amp; Conduit:</span>
                            <span className="text-amber-400 font-semibold">
                              {circ.mcbRating} • {circ.conduitSize} PVC
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Connected Load:</span>
                            <span className="text-amber-400 font-bold">{totalWatts} Watts</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Full Load Current:</span>
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
        <BoqModal
          project={project}
          onClose={() => setShowBoqModal(false)}
        />
      )}
    </div>
  );
};
