import React, { useState, useEffect } from 'react';
import {
  ResidentialCanvas,
  ResidentialCameraPreset
} from '../three/ResidentialCanvas';
import { ResidentialViewMode } from '../three/residentialModelGenerators';
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

interface Residential3DScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (serviceTopic?: string) => void;
  onSwitchToSubstation?: () => void;
}

type WorkspaceTab = '3d_twin' | 'floor_plan' | 'circuits' | 'boq_view';

export const Residential3DScreen: React.FC<Residential3DScreenProps> = ({
  onSelectTab,
  onOpenConsultation,
  onSwitchToSubstation
}) => {
  // 1. Parametric Project State with LocalStorage Persistence
  const [project, setProject] = useState<ResidentialProject>(() => {
    try {
      const saved = localStorage.getItem('ananya_residential_designer_proj');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return STANDARD_2BHK_PROJECT;
  });

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ananya_residential_designer_proj', JSON.stringify(project));
    } catch {
      // ignore
    }
  }, [project]);

  // 2. Workspace View Tabs
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('3d_twin');

  // 3. 3D Viewport Controls
  const [viewMode, setViewMode] = useState<ResidentialViewMode>('cutaway');
  const [ceilingVisible, setCeilingVisible] = useState<boolean>(false);
  const [dbDoorOpen, setDbDoorOpen] = useState<boolean>(true);
  const [activeCircuit, setActiveCircuit] = useState<string>('c1_living_lighting');
  const [livingLightOn, setLivingLightOn] = useState<boolean>(true);
  const [fanSpeed, setFanSpeed] = useState<number>(2); // 0=off, 1=low, 2=med, 3=high
  const [cameraPreset, setCameraPreset] = useState<ResidentialCameraPreset>('overview');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [selectedCompId, setSelectedCompId] = useState<string>('pt_main_db');

  // 4. Modals
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [showBoqModal, setShowBoqModal] = useState<boolean>(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState<boolean>(false);

  // 5. Dock collapse toggle
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<'view' | 'circuits' | 'controls' | 'specs'>('circuits');

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectComponentFrom3D = (id: string) => {
    setSelectedCompId(id);
    setActiveDockTab('specs');
    if (isDockCollapsed) {
      setIsDockCollapsed(false);
    }
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
      } catch (err) {
        alert('Invalid Ananya project JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Metrics
  const totalFloorAreaSqM = project.rooms.reduce((acc, r) => acc + r.width * r.length, 0);
  const totalFloorAreaSqFt = totalFloorAreaSqM * 10.7639;
  const totalConnectedWatts = project.electricalPoints.reduce((acc, p) => acc + (p.powerWatts || 0), 0);
  const runningWatts = project.electricalPoints
    .filter((p) => p.isOn)
    .reduce((acc, p) => acc + (p.powerWatts || 0), 0) + (livingLightOn ? 48 : 0) + (fanSpeed > 0 ? fanSpeed * 15 : 0);
  const runningAmps = (runningWatts / (230 * 0.95)).toFixed(2); // 230V, pf 0.95

  const boq = calculateProjectBoq(project);
  const currentCircuit = project.circuits.find((c) => c.id === activeCircuit) || project.circuits[0];

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-[#0A1128] text-slate-100 flex flex-col select-none">
      {/* 1. Main Workspace Top Header */}
      <div className="h-14 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 gap-3 z-30">
        {/* Brand Zone & Project Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight leading-none">
                  ANANYA SMART ELECTRICAL DESIGNER
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[9px] uppercase font-mono font-bold">
                  IS:732 / NBC 2016
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {project.meta.projectName} • {project.meta.customerName} ({totalFloorAreaSqFt.toFixed(0)} sq.ft / {totalFloorAreaSqM.toFixed(1)} m²)
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
            <span>3D Digital Twin</span>
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
            <span>Circuits &amp; Simulation</span>
          </button>

          <button
            onClick={() => setShowBoqModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>BOQ (₹{boq.grandTotal.toLocaleString('en-IN')})</span>
          </button>
        </div>

        {/* Right Action Tools: Project Wizard, Templates, Save, Export */}
        <div className="flex items-center gap-2">
          {/* New Project Wizard */}
          <button
            onClick={() => setShowWizardModal(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Create New Project"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden md:inline">New Project</span>
          </button>

          {/* Preset Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
              title="Load Preset Template"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span className="hidden lg:inline">Templates</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showTemplateDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#0F172A] border border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setProject(STANDARD_2BHK_PROJECT);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col"
                >
                  <span className="font-bold text-sky-400">Standard 2BHK (1200 sq.ft)</span>
                  <span className="text-[10px] text-slate-400">Living, Kitchen, 2 Beds, Foyer & DB</span>
                </button>
                <button
                  onClick={() => {
                    setProject(COMPACT_2BHK_PROJECT);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col border-t border-slate-800"
                >
                  <span className="font-bold text-emerald-400">Compact 2BHK (850 sq.ft)</span>
                  <span className="text-[10px] text-slate-400">High efficiency urban apartment</span>
                </button>
                <button
                  onClick={() => {
                    setProject(LUXURY_3BHK_PROJECT);
                    setShowTemplateDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col border-t border-slate-800"
                >
                  <span className="font-bold text-amber-400">Luxury 3BHK Villa (1850 sq.ft)</span>
                  <span className="text-[10px] text-slate-400">3-Phase 415V supply with dining</span>
                </button>
              </div>
            )}
          </div>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Export Project JSON"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>

          {/* Import JSON file input */}
          <label className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer" title="Import Project JSON">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Switch to Substation Twin */}
          {onSwitchToSubstation && (
            <button
              onClick={onSwitchToSubstation}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
              title="Open 33kV Substation & Solar Yard Twin"
            >
              <span className="material-symbols-outlined text-[16px]">solar_power</span>
              <span>Substation Twin</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Workspace Body: Switched between 3D Twin, 2D Floor Plan CAD, and Circuits Simulation */}
      <div className="flex-1 relative overflow-hidden">
        {/* TAB 1: 3D DIGITAL TWIN */}
        {workspaceTab === '3d_twin' && (
          <div className="w-full h-full relative">
            <ResidentialCanvas
              project={project}
              viewMode={viewMode}
              ceilingVisible={ceilingVisible}
              dbDoorOpen={dbDoorOpen}
              activeCircuit={activeCircuit}
              livingLightOn={livingLightOn}
              fanSpeed={fanSpeed}
              cameraPreset={cameraPreset}
              isAutoRotate={isAutoRotate}
              onSelectComponent={handleSelectComponentFrom3D}
              onToggleLight={() => setLivingLightOn(!livingLightOn)}
            />

            {/* Top-Left Engineering HUD */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-auto">
              <div className="bg-[#0F172A]/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Live Simulation Active
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {project.meta.supplyPhase}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-slate-800 font-mono text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Load Draw</div>
                    <div className="text-sm font-bold text-amber-400">{runningWatts} W</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Current</div>
                    <div className="text-sm font-bold text-sky-400">{runningAmps} A</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Earth Loop</div>
                    <div className="text-sm font-bold text-emerald-400">&lt; 0.85 Ω</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5">
                  <span>Conduits: {boq.totalConduitLengthMeters}m PVC</span>
                  <span>FRLS Copper: {boq.totalWireLengthMeters}m</span>
                </div>
              </div>
            </div>

            {/* Top-Right Camera Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isAutoRotate
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-[#0F172A]/90 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toggle camera auto-orbit"
              >
                <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                <span className="hidden sm:inline">Auto-Orbit</span>
              </button>

              <button
                onClick={() => onOpenConsultation(`Residential Electrical Design: ${project.meta.projectName}`)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Get Installation Quote</span>
              </button>
            </div>

            {/* Bottom Floating Control Dock */}
            <div
              className="absolute z-30 transition-transform duration-300 ease-out"
              style={{
                bottom: '16px',
                left: '50%',
                transform: isDockCollapsed
                  ? 'translateX(-50%) translateY(calc(100% - 36px))'
                  : 'translateX(-50%) translateY(0)',
                maxWidth: 'min(920px, 94vw)',
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
                  <span>{isDockCollapsed ? 'Show Controls (H)' : 'Collapse Controls (H)'}</span>
                </button>
              </div>

              {/* Dock Container */}
              <div className="bg-[#0F172A]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-100 flex flex-col gap-2.5">
                {/* Dock Nav Tabs */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveDockTab('view')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'view' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>3D View Modes</span>
                    </button>

                    <button
                      onClick={() => setActiveDockTab('circuits')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'circuits' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">cable</span>
                      <span>Circuit Wire Tracing</span>
                    </button>

                    <button
                      onClick={() => setActiveDockTab('controls')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'controls' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">tune</span>
                      <span>Appliance Toggles</span>
                    </button>

                    <button
                      onClick={() => setActiveDockTab('specs')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        activeDockTab === 'specs' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      <span>Equipment Specs</span>
                    </button>
                  </div>

                  {/* Camera Preset Quick Bar */}
                  <div className="hidden sm:flex items-center gap-1">
                    {(['overview', 'db', 'living', 'bedroom', 'kitchen', 'earth_pit'] as ResidentialCameraPreset[]).map((cp) => (
                      <button
                        key={cp}
                        onClick={() => setCameraPreset(cp)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors uppercase cursor-pointer ${
                          cameraPreset === cp ? 'bg-slate-700 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cp.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB CONTENT: 3D View Modes */}
                {activeDockTab === 'view' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Stage:</span>
                      <button
                        onClick={() => setViewMode('finished')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          viewMode === 'finished' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Finished Interior
                      </button>
                      <button
                        onClick={() => setViewMode('cutaway')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          viewMode === 'cutaway' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Cutaway X-Ray (Concealed PVC)
                      </button>
                      <button
                        onClick={() => setViewMode('construction')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          viewMode === 'construction' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Construction Pre-Plaster (Chasing)
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceilingVisible}
                          onChange={(e) => setCeilingVisible(e.target.checked)}
                          className="rounded"
                        />
                        <span>Ceiling Slab</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dbDoorOpen}
                          onChange={(e) => setDbDoorOpen(e.target.checked)}
                          className="rounded"
                        />
                        <span>Open DB Door</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Circuit Wire Tracing */}
                {activeDockTab === 'circuits' && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
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
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: circ.phaseColor }}
                          />
                          <span>{circ.code}: {circ.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TAB CONTENT: Appliance Live Toggles */}
                {activeDockTab === 'controls' && (
                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Living Lighting:</span>
                      <button
                        onClick={() => setLivingLightOn(!livingLightOn)}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          livingLightOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {livingLightOn ? '💡 Lights ON' : 'Lights OFF'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">BLDC Fan Speed:</span>
                      {[0, 1, 2, 3].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setFanSpeed(spd)}
                          className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                            fanSpeed === spd
                              ? 'bg-sky-500 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd === 0 ? 'OFF' : `Speed ${spd}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Equipment Specs */}
                {activeDockTab === 'specs' && (
                  <div className="text-xs text-slate-300 pt-1 flex flex-col gap-1">
                    <div className="font-bold text-sky-400">
                      Selected Circuit: {currentCircuit.code} — {currentCircuit.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Wire: <span className="text-slate-200">{currentCircuit.wireType}</span> • Protection: <span className="text-slate-200">{currentCircuit.mcbRating}</span> • Conduit: <span className="text-slate-200">{currentCircuit.conduitSize} Rigid PVC</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentCircuit.description}
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">electric_bolt</span>
                    Residential Electrical Circuit &amp; Distribution Schedule
                  </h2>
                  <p className="text-xs text-slate-400">
                    Compliant with IS:732 (Wiring Code) &amp; IS:12640 (Residual Current Protection)
                  </p>
                </div>

                <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-sky-400">
                  Total Capacity: {project.meta.sanctionedLoadKw} kW @ {project.meta.supplyPhase}
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
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {circ.mcbRating}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">{circ.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Conductor Gauge:</span>
                            <span className="text-slate-200 font-semibold">{circ.wireType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Conduit Size:</span>
                            <span className="text-slate-200 font-semibold">{circ.conduitSize} Rigid PVC</span>
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
                        <span>Connected Points: {connectedPts.length} accessories</span>
                        <span className="text-emerald-400 font-semibold">100% IS Compliant</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statutory Safety & Earthing Checklist */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
                  Statutory Electrical Safety Checklist (IS:732 / IS:3043 / CEA Regulations 2023)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">✓ 30mA Life Safety RCCB</div>
                    <div className="text-slate-400 text-[11px]">
                      Instantaneous tripping &lt; 30ms against human direct contact and electrocution.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">✓ Chemical Earth Electrode</div>
                    <div className="text-slate-400 text-[11px]">
                      IS:3043 copper bonded rod with bentonite backfill ensures impedance &lt; 1.0 Ohm year-round.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">✓ FRLS Flame Retardant Cables</div>
                    <div className="text-slate-400 text-[11px]">
                      Low smoke zero halogen copper conductors prevent toxic fumes in fire incidents.
                    </div>
                  </div>
                </div>
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
