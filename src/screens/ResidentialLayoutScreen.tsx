import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../types';
import { ResidentialLayoutProject, ResidentialPlot, PlotServiceConnection } from '../types/layoutDesigner';
import {
  GREENFIELD_ENCLAVE_PROJECT,
  HERITAGE_ENCLAVE_UPGRADE_PROJECT
} from '../data/residentialLayoutPresets';
import {
  ResidentialLayoutCanvas,
  LayoutCameraPreset
} from '../three/ResidentialLayoutCanvas';
import { LayoutViewMode } from '../three/layoutModelGenerators';
import { SitePlan2DEditor } from '../components/layout/SitePlan2DEditor';
import { ComparisonDiffView } from '../components/layout/ComparisonDiffView';
import { LayoutBoqModal } from '../components/layout/LayoutBoqModal';
import { LayoutProjectWizard } from '../components/layout/LayoutProjectWizard';
import { PlotServiceInspectorModal } from '../components/layout/PlotServiceInspectorModal';
import { NetworkPlanningPanel } from '../components/layout/NetworkPlanningPanel';
import { calculateLayoutBoq } from '../components/layout/layoutBoqCalculator';

interface ResidentialLayoutScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (serviceTopic?: string) => void;
  onSwitchToInterior?: () => void;
  onSwitchToSubstation?: () => void;
}

type LayoutWorkspaceTab = '3d_twin' | 'site_cad' | 'diff_upgrade' | 'boq_view';

const STORAGE_KEY = 'ananya_residential_layout_project_v1';

export const ResidentialLayoutScreen: React.FC<ResidentialLayoutScreenProps> = ({
  onSelectTab,
  onOpenConsultation,
  onSwitchToInterior,
  onSwitchToSubstation
}) => {
  // Project State with LocalStorage
  const [project, setProject] = useState<ResidentialLayoutProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return GREENFIELD_ENCLAVE_PROJECT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // ignore
    }
  }, [project]);

  // Workspace Tabs
  const [activeTab, setActiveTab] = useState<LayoutWorkspaceTab>('3d_twin');

  // 3D Viewport Controls
  const [viewMode, setViewMode] = useState<LayoutViewMode>('finished_layout');
  const [isNight, setIsNight] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<LayoutCameraPreset>('aerial_overview');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('substation_dtr');

  // Modals & Panels
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showBoq, setShowBoq] = useState<boolean>(false);
  const [showNetworkPlanning, setShowNetworkPlanning] = useState<boolean>(false);
  const [inspectingPlot, setInspectingPlot] = useState<ResidentialPlot | null>(null);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState<boolean>(false);

  // Update a single plot
  const handleUpdatePlot = (updatedPlot: ResidentialPlot) => {
    setProject((prev) => ({
      ...prev,
      plots: prev.plots.map((p) => (p.id === updatedPlot.id ? updatedPlot : p))
    }));
  };

  // Bulk apply electrical connection template to all plots assigned to a feeder pillar
  const handleApplyToAllInFeeder = (feederId: string, template: PlotServiceConnection, loadKw: number) => {
    setProject((prev) => ({
      ...prev,
      plots: prev.plots.map((p) => {
        if (p.serviceConnection?.assignedFeederPillarId === feederId) {
          return {
            ...p,
            sanctionedLoadKw: loadKw,
            serviceConnection: {
              ...template,
              serviceEntryPosition: [p.x + p.width - 0.5, p.z + p.length - 0.5],
              meterLocation: [p.x + p.width - 0.5, p.z + p.length - 0.5],
              dbLocation: [p.x + p.width / 2, p.z + p.length / 2]
            }
          };
        }
        return p;
      })
    }));
  };

  // Export 2D Layout as CAD SVG
  const handleExportSvg = () => {
    const minX = Math.min(...project.boundary.map((p) => p[0])) - 10;
    const maxX = Math.max(...project.boundary.map((p) => p[0])) + 10;
    const minZ = Math.min(...project.boundary.map((p) => p[1])) - 10;
    const maxZ = Math.max(...project.boundary.map((p) => p[1])) + 10;
    const w = maxX - minX;
    const h = maxZ - minZ;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minZ} ${w} ${h}" width="1400" height="${Math.round((h / w) * 1400)}" style="background-color: #0b1329; font-family: system-ui, sans-serif;">\n`;
    svg += `  <defs>\n`;
    svg += `    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">\n`;
    svg += `      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" stroke-width="0.3"/>\n`;
    svg += `    </pattern>\n`;
    svg += `  </defs>\n`;
    svg += `  <rect x="${minX}" y="${minZ}" width="${w}" height="${h}" fill="url(#grid)" />\n`;

    // Title Block
    svg += `  <text x="${minX + 8}" y="${minZ + 12}" fill="#38bdf8" font-size="5" font-weight="bold">ANANYA ELECTRICAL SOLUTIONS — ${project.meta.projectName.toUpperCase()}</text>\n`;
    svg += `  <text x="${minX + 8}" y="${minZ + 19}" fill="#94a3b8" font-size="3">Area: ${project.meta.totalAreaAcres} Acres | Plots: ${project.plots.length} | 11kV/415V DTR: ${project.meta.transformerRatingKva} kVA | CEA & IS:732 Compliant</text>\n`;

    // Boundary
    const pts = project.boundary.map((p) => `${p[0]},${p[1]}`).join(' ');
    svg += `  <polygon points="${pts}" fill="#162032" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="3,2" />\n`;

    // Roads
    project.roads.forEach((r) => {
      svg += `  <line x1="${r.startPoint[0]}" y1="${r.startPoint[1]}" x2="${r.endPoint[0]}" y2="${r.endPoint[1]}" stroke="#334155" stroke-width="${r.widthMeters}" stroke-linecap="round" />\n`;
      svg += `  <line x1="${r.startPoint[0]}" y1="${r.startPoint[1]}" x2="${r.endPoint[0]}" y2="${r.endPoint[1]}" stroke="#facc15" stroke-width="0.3" stroke-dasharray="2,2" />\n`;
    });

    // Plots
    project.plots.forEach((p) => {
      svg += `  <rect x="${p.x}" y="${p.z}" width="${p.width}" height="${p.length}" fill="#0f172a" stroke="#22c55e" stroke-width="0.4" rx="0.5" />\n`;
      svg += `  <text x="${p.x + p.width / 2}" y="${p.z + p.length / 2}" fill="#f8fafc" font-size="2.2" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${p.plotNumber}</text>\n`;
      svg += `  <text x="${p.x + p.width / 2}" y="${p.z + p.length / 2 + 2.5}" fill="#38bdf8" font-size="1.5" text-anchor="middle">${p.sanctionedLoadKw}kW</text>\n`;
    });

    // Cables
    project.cabling.forEach((c) => {
      if (c.waypoints.length > 1) {
        const d = c.waypoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt[0]} ${pt[1]}`).join(' ');
        const strokeColor = c.cableClass.includes('ht') ? '#ef4444' : '#0284c7';
        svg += `  <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="0.6" stroke-dasharray="${c.cableClass.includes('ht') ? 'none' : '1.5,1.5'}" />\n`;
      }
    });

    // Infra
    project.infra.forEach((item) => {
      if (item.type === 'package_substation') {
        svg += `  <rect x="${item.x - 3}" y="${item.z - 2.5}" width="6" height="5" fill="#1e3a8a" stroke="#f59e0b" stroke-width="0.6" />\n`;
        svg += `  <text x="${item.x}" y="${item.z}" fill="#fbbf24" font-size="1.8" text-anchor="middle" dominant-baseline="middle" font-weight="bold">11kV DTR</text>\n`;
      } else if (item.type === 'feeder_pillar') {
        svg += `  <rect x="${item.x - 1}" y="${item.z - 0.6}" width="2" height="1.2" fill="#0284c7" stroke="#38bdf8" stroke-width="0.4" />\n`;
        svg += `  <text x="${item.x}" y="${item.z}" fill="#ffffff" font-size="1.1" text-anchor="middle" dominant-baseline="middle">FP</text>\n`;
      } else if (item.type === 'street_light_pole') {
        svg += `  <circle cx="${item.x}" cy="${item.z}" r="0.8" fill="#facc15" stroke="#ca8a04" stroke-width="0.3" />\n`;
      }
    });

    svg += `</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = `${project.meta.projectName.replace(/\s+/g, '_')}_Site_Plan_CAD.svg`;
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    URL.revokeObjectURL(url);
  };

  // Capture High-Res 3D View Snapshot (PNG)
  const handleCapture3dSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('3D Canvas not currently loaded.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const dl = document.createElement('a');
    dl.href = dataUrl;
    dl.download = `${project.meta.projectName.replace(/\s+/g, '_')}_3D_Twin.png`;
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `${project.meta.projectName.replace(/\s+/g, '_')}_Layout.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.plots && parsed.roads) {
          setProject(parsed);
        }
      } catch {
        alert('Invalid Ananya Layout Project JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const boq = calculateLayoutBoq(project);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-[#070D1D] text-slate-100 flex flex-col select-none">
      {/* Top Engineering Workspace Ribbon */}
      <div className="h-14 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 gap-3 z-30">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <span className="material-symbols-outlined text-[18px]">map</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight leading-none">
                  ANANYA RESIDENTIAL LAYOUT DESIGNER
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${
                  project.meta.workflow === 'new_layout'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                }`}>
                  {project.meta.workflow === 'new_layout' ? 'Workflow A: New Layout' : 'Workflow B: Upgrade'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {project.meta.projectName} • {project.meta.totalAreaAcres} Acres ({project.plots.length} Plots • {project.meta.transformerRatingKva} kVA DTR)
              </div>
            </div>
          </div>
        </div>

        {/* Center Workspace Mode Tabs */}
        <div className="flex items-center bg-[#1E293B] rounded-xl p-1 border border-slate-700/80">
          <button
            onClick={() => setActiveTab('3d_twin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === '3d_twin' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            <span>3D Site Twin</span>
          </button>

          <button
            onClick={() => setActiveTab('site_cad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'site_cad' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_road</span>
            <span>2D Site CAD</span>
          </button>

          <button
            onClick={() => setActiveTab('diff_upgrade')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'diff_upgrade' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            <span>Existing vs Proposed</span>
          </button>

          <button
            onClick={() => setShowNetworkPlanning(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 transition-all cursor-pointer"
            title="Electrical Network Planning, Substation Loading & Phase Balance"
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Network Planning</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                project.meta.isEnergized ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </button>

          <button
            onClick={() => setShowBoq(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>BOQ (₹{boq.grandTotal.toLocaleString('en-IN')})</span>
          </button>
        </div>

        {/* Right Tools: New Layout, Presets, Export, Substation Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWizard(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden md:inline">New Layout</span>
          </button>

          {/* Presets dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
              <span className="hidden lg:inline">Presets</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showPresetsDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#0F172A] border border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setProject(GREENFIELD_ENCLAVE_PROJECT);
                    setShowPresetsDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-sky-400">Greenfield Enclave (4.2 Acres)</span>
                  <span className="text-[10px] text-slate-400">28 Plots, 11kV Substation, Underground XLPE</span>
                </button>
                <button
                  onClick={() => {
                    setProject(HERITAGE_ENCLAVE_UPGRADE_PROJECT);
                    setShowPresetsDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col border-t border-slate-800 cursor-pointer"
                >
                  <span className="font-bold text-amber-400">Heritage Enclave Upgrade</span>
                  <span className="text-[10px] text-slate-400">Overhead to Underground Modernization</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleExportSvg}
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Export 2D Site CAD as SVG Vector Drawing"
          >
            <span className="material-symbols-outlined text-[18px]">polyline</span>
          </button>

          <button
            onClick={handleCapture3dSnapshot}
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-amber-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Capture High-Resolution 3D Snapshot (PNG)"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>

          <button
            onClick={handleExportJson}
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Export Project JSON"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>

          <label className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer" title="Import Project JSON">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Quick link to 2BHK Interior Twin */}
          <button
            onClick={() => onSelectTab('residential-3d')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="Open 2BHK Residential Interior Twin"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>2BHK Interior Twin</span>
          </button>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* TAB 1: 3D SITE TWIN */}
        {activeTab === '3d_twin' && (
          <div className="w-full h-full relative">
            <ResidentialLayoutCanvas
              project={project}
              viewMode={viewMode}
              isNight={isNight}
              cameraPreset={cameraPreset}
              isAutoRotate={isAutoRotate}
              onSelectObject={(id) => setSelectedObjectId(id)}
            />

            {/* Top-Left Engineering HUD */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-auto">
              <div className="bg-[#0F172A]/90 backdrop-blur border border-slate-700/80 rounded-xl p-3.5 shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isNight ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                    <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      Layout Digital Twin • {project.meta.totalAreaAcres} Acres
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {project.meta.workflow === 'new_layout' ? 'New Layout' : 'Modernization'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-slate-800 font-mono text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Plots</div>
                    <div className="text-sm font-bold text-emerald-400">{project.plots.length}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Grid Load</div>
                    <div className="text-sm font-bold text-amber-400">{project.meta.totalEstimatedLoadKva} kVA</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Substation</div>
                    <div className="text-sm font-bold text-sky-400">{project.meta.transformerRatingKva} kVA</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2">
                  <span>Underground Cables: {boq.totalLtCableMeters + boq.totalHtCableMeters}m</span>
                  <span>Streetlights: {boq.totalStreetlightCount} Poles</span>
                </div>
              </div>
            </div>

            {/* Top-Right Controls: Day/Night, Auto-Orbit, Quote */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsNight(!isNight)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isNight
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-[#0F172A]/90 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toggle Day / Night Illumination Mode"
              >
                <span className="material-symbols-outlined text-[16px]">{isNight ? 'dark_mode' : 'light_mode'}</span>
                <span>{isNight ? 'Night View (Lights ON)' : 'Day View'}</span>
              </button>

              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isAutoRotate
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-[#0F172A]/90 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toggle Auto-Orbit"
              >
                <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                <span className="hidden sm:inline">Auto-Orbit</span>
              </button>

              <button
                onClick={() => onOpenConsultation(`Residential Layout Infrastructure EPC: ${project.meta.projectName}`)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Get Layout EPC Quote</span>
              </button>
            </div>

            {/* Bottom Floating Control Dock */}
            <div
              className="absolute z-30 transition-transform duration-300 ease-out"
              style={{
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: 'min(940px, 94vw)',
                width: '100%'
              }}
            >
              <div className="bg-[#0F172A]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-100 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* View Modes */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Stage:</span>
                    <button
                      onClick={() => setViewMode('finished_layout')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        viewMode === 'finished_layout' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Finished Layout
                    </button>
                    <button
                      onClick={() => setViewMode('infrastructure_xray')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        viewMode === 'infrastructure_xray' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Underground X-Ray (Cables)
                    </button>
                    <button
                      onClick={() => setViewMode('construction_stage')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        viewMode === 'construction_stage' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Construction Grading
                    </button>
                  </div>

                  {/* Camera Presets */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    <span className="text-slate-400 font-medium hidden sm:inline">Camera:</span>
                    {(['aerial_overview', 'top_plan', 'front_elevation', 'isometric_3d', 'substation_close', 'main_avenue', 'central_park', 'plot_close'] as LayoutCameraPreset[]).map((cp) => (
                      <button
                        key={cp}
                        onClick={() => setCameraPreset(cp)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors uppercase whitespace-nowrap cursor-pointer ${
                          cameraPreset === cp ? 'bg-slate-700 text-sky-400 font-bold border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cp.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Object Info Bar */}
                {selectedObjectId && (() => {
                  const selectedPlot = project.plots.find(
                    (p) => p.id === selectedObjectId || `plot_${p.id}` === selectedObjectId
                  );
                  return (
                    <div className="text-[11px] text-slate-300 pt-1.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sky-400 font-medium">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        <span>Selected Element: {selectedObjectId}</span>
                        {selectedPlot && (
                          <span className="text-slate-300 font-normal">
                            (Plot {selectedPlot.plotNumber} • {selectedPlot.sanctionedLoadKw} kW • {selectedPlot.serviceConnection?.status || 'Active'})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedPlot && (
                          <button
                            onClick={() => setInspectingPlot(selectedPlot)}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">power</span>
                            <span>Inspect Service Drop & Voltage Drop</span>
                          </button>
                        )}
                        <span className="text-slate-400 hidden lg:inline">
                          Click elements in 3D to inspect or switch to 2D Site CAD to modify coordinates.
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 2D SITE CAD EDITOR */}
        {activeTab === 'site_cad' && (
          <SitePlan2DEditor
            project={project}
            onUpdateProject={(updated) => setProject(updated)}
            selectedId={selectedObjectId}
            onSelectId={(id) => setSelectedObjectId(id)}
            onInspectPlot={(plot) => setInspectingPlot(plot)}
          />
        )}

        {/* TAB 3: EXISTING VS PROPOSED DIFF COMPARISON */}
        {activeTab === 'diff_upgrade' && (
          <ComparisonDiffView
            project={project}
            onOpenConsultation={onOpenConsultation}
          />
        )}
      </div>

      {/* Modals */}
      {showWizard && (
        <LayoutProjectWizard
          onClose={() => setShowWizard(false)}
          onApplyProject={(newProj) => {
            setProject(newProj);
            setActiveTab('3d_twin');
          }}
        />
      )}

      {showBoq && (
        <LayoutBoqModal
          project={project}
          onClose={() => setShowBoq(false)}
        />
      )}

      {inspectingPlot && (
        <PlotServiceInspectorModal
          plot={inspectingPlot}
          project={project}
          onClose={() => setInspectingPlot(null)}
          onUpdatePlot={handleUpdatePlot}
          onApplyToAllInFeeder={handleApplyToAllInFeeder}
        />
      )}

      {showNetworkPlanning && (
        <NetworkPlanningPanel
          project={project}
          onUpdateProject={(updated) => setProject(updated)}
          onSelectPlot={(plotId) => {
            const p = project.plots.find((item) => item.id === plotId);
            if (p) {
              setInspectingPlot(p);
            }
          }}
          onClose={() => setShowNetworkPlanning(false)}
        />
      )}
    </div>
  );
};
