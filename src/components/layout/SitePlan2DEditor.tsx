import React, { useState, useRef } from 'react';
import {
  ResidentialLayoutProject,
  ResidentialPlot,
  ElectricalInfraComponent,
  InternalRoad
} from '../../types/layoutDesigner';
import { generateUtilityCorridorRoutes } from './layoutRoutingEngine';

interface SitePlan2DEditorProps {
  project: ResidentialLayoutProject;
  onUpdateProject: (updated: ResidentialLayoutProject) => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onInspectPlot?: (plot: ResidentialPlot) => void;
}

type SiteEditorTool =
  | 'select'
  | 'add_plot_30x40'
  | 'add_plot_40x60'
  | 'place_substation'
  | 'place_pillar'
  | 'place_streetlight';

export const SitePlan2DEditor: React.FC<SitePlan2DEditorProps> = ({
  project,
  onUpdateProject,
  selectedId,
  onSelectId,
  onInspectPlot
}) => {
  const [activeTool, setActiveTool] = useState<SiteEditorTool>('select');
  const [zoom, setZoom] = useState<number>(5.5); // pixels per meter
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 70 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History for Undo/Redo
  const [history, setHistory] = useState<ResidentialLayoutProject[]>([project]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);

  const commitProjectChange = (newProj: ResidentialLayoutProject) => {
    const nextH = history.slice(0, historyIndex + 1);
    nextH.push(newProj);
    setHistory(nextH);
    setHistoryIndex(nextH.length - 1);
    onUpdateProject(newProj);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateProject(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateProject(next);
    }
  };

  const screenToWorld = (screenX: number, screenY: number): { x: number; z: number } => {
    if (!svgRef.current) return { x: 0, z: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = (screenX - rect.left - pan.x) / zoom;
    const rawZ = (screenY - rect.top - pan.y) / zoom;
    const snap = 2.0; // 2 meter snap
    return {
      x: Math.round(rawX / snap) * snap,
      z: Math.round(rawZ / snap) * snap
    };
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || e.altKey || (activeTool === 'select' && e.target === svgRef.current)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleSvgMouseUp = () => {
    setIsPanning(false);
  };

  const handleSvgClick = (e: React.MouseEvent<any>) => {
    if (isPanning) return;
    const pos = screenToWorld(e.clientX, e.clientY);

    if (activeTool === 'add_plot_30x40' || activeTool === 'add_plot_40x60') {
      const is30x40 = activeTool === 'add_plot_30x40';
      const w = is30x40 ? 9.14 : 12.19; // 30ft vs 40ft
      const l = is30x40 ? 12.19 : 18.28; // 40ft vs 60ft
      const nextNum = project.plots.length + 1;
      const plotNumStr = `P-${String(nextNum).padStart(2, '0')}`;

      const newPlot: ResidentialPlot = {
        id: `plot_${Date.now()}`,
        plotNumber: plotNumStr,
        x: pos.x - w / 2,
        z: pos.z - l / 2,
        width: Number(w.toFixed(1)),
        length: Number(l.toFixed(1)),
        facing: 'south',
        areaSqM: Math.round(w * l),
        hasBuilding: true,
        buildingType: 'villa_modern',
        status: 'allocated',
        sanctionedLoadKw: is30x40 ? 6.0 : 8.0
      };

      commitProjectChange({
        ...project,
        plots: [...project.plots, newPlot],
        meta: { ...project.meta, plotCount: project.plots.length + 1 }
      });
      onSelectId(newPlot.id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'place_substation') {
      const newSub: ElectricalInfraComponent = {
        id: `sub_${Date.now()}`,
        name: '500kVA 11kV/415V Package Substation DTR',
        type: 'package_substation',
        x: pos.x,
        z: pos.z,
        capacity: '500 kVA 11kV / 415V ONAN',
        status: 'proposed_new',
        connectedPlotIds: []
      };
      commitProjectChange({ ...project, infra: [...project.infra, newSub] });
      onSelectId(newSub.id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'place_pillar') {
      const newPillar: ElectricalInfraComponent = {
        id: `fp_${Date.now()}`,
        name: `Feeder Pillar FP-${project.infra.filter((i) => i.type === 'feeder_pillar').length + 1}`,
        type: 'feeder_pillar',
        x: pos.x,
        z: pos.z,
        capacity: '400A Busbar 6-Way HRC',
        status: 'proposed_new',
        connectedPlotIds: []
      };
      commitProjectChange({ ...project, infra: [...project.infra, newPillar] });
      onSelectId(newPillar.id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'place_streetlight') {
      const newPole: ElectricalInfraComponent = {
        id: `sl_${Date.now()}`,
        name: `7m Octagonal Streetlight Pole SL-${project.infra.filter((i) => i.type === 'street_light_pole').length + 1}`,
        type: 'street_light_pole',
        x: pos.x,
        z: pos.z,
        capacity: '60W Warm White LED',
        status: 'proposed_new',
        connectedPlotIds: []
      };
      commitProjectChange({ ...project, infra: [...project.infra, newPole] });
      onSelectId(newPole.id);
      setActiveTool('select');
      return;
    }
  };

  // Check Planning Constraints
  const overlaps: string[] = [];
  project.plots.forEach((p1, idx1) => {
    project.plots.forEach((p2, idx2) => {
      if (idx1 >= idx2) return;
      const noOverlap =
        p1.x + p1.width <= p2.x ||
        p2.x + p2.width <= p1.x ||
        p1.z + p1.length <= p2.z ||
        p2.z + p2.length <= p1.z;
      if (!noOverlap) {
        overlaps.push(`${p1.plotNumber} & ${p2.plotNumber}`);
      }
    });
  });

  const selectedPlot = project.plots.find((p) => p.id === selectedId);
  const selectedInfra = project.infra.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col h-full bg-[#080E1E] text-slate-100 select-none overflow-hidden">
      {/* Top CAD Ribbon */}
      <div className="h-14 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 gap-3 z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTool === 'select' ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">near_me</span>
            <span>Select / Move</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          {/* Add Plot Tools */}
          <button
            onClick={() => setActiveTool('add_plot_30x40')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTool === 'add_plot_30x40' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
            title="Add 30x40 ft (1,200 sq.ft) Residential Plot"
          >
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <span>+ 30&apos;x40&apos; Plot</span>
          </button>

          <button
            onClick={() => setActiveTool('add_plot_40x60')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTool === 'add_plot_40x60' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
            title="Add 40x60 ft (2,400 sq.ft) Residential Plot"
          >
            <span className="material-symbols-outlined text-[16px]">domain_add</span>
            <span>+ 40&apos;x60&apos; Plot</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          {/* Electrical Placement Tools */}
          <button
            onClick={() => setActiveTool('place_substation')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTool === 'place_substation' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
            title="Place 11kV Package Substation (DTR)"
          >
            <span className="material-symbols-outlined text-[16px]">electric_bolt</span>
            <span>+ DTR Substation</span>
          </button>

          <button
            onClick={() => setActiveTool('place_pillar')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTool === 'place_pillar' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
            }`}
            title="Place 400A Feeder Pillar"
          >
            <span className="material-symbols-outlined text-[16px]">power</span>
            <span>+ Feeder Pillar</span>
          </button>

          <button
            onClick={() => setActiveTool('place_streetlight')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTool === 'place_streetlight' ? 'bg-yellow-400 text-slate-950 font-bold' : 'bg-slate-800 text-yellow-300 hover:bg-slate-700'
            }`}
            title="Place 7m Octagonal Streetlight Pole"
          >
            <span className="material-symbols-outlined text-[16px]">wb_incandescent</span>
            <span>+ Streetlight</span>
          </button>

          <button
            onClick={() => {
              const res = generateUtilityCorridorRoutes(project);
              commitProjectChange({
                ...project,
                cabling: res.routes
              });
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Auto-generate underground utility corridors along road reserves"
          >
            <span className="material-symbols-outlined text-[16px]">route</span>
            <span>Auto-Route Corridors</span>
          </button>
        </div>

        {/* Right Tools: Zoom, Pan, Undo, Redo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.min(z + 1.0, 16))}
              className="p-1 hover:text-white text-slate-300 rounded cursor-pointer"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-400">{Math.round((zoom / 5.5) * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 1.0, 2.5))}
              className="p-1 hover:text-white text-slate-300 rounded cursor-pointer"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_out</span>
            </button>
            <button
              onClick={() => { setZoom(5.5); setPan({ x: 80, y: 70 }); }}
              className="p-1 hover:text-white text-slate-300 rounded cursor-pointer"
              title="Reset View"
            >
              <span className="material-symbols-outlined text-[16px]">fit_screen</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Undo"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Redo"
            >
              <span className="material-symbols-outlined text-[16px]">redo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: SVG Site Plan Canvas + Right Properties Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 h-full relative bg-[#060B18] overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onClick={handleSvgClick}
          >
            <defs>
              <pattern id="siteGrid10m" width={zoom * 10} height={zoom * 10} patternUnits="userSpaceOnUse">
                <path d={`M ${zoom * 10} 0 L 0 0 0 ${zoom * 10}`} fill="none" stroke="#1E293B" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Grid Pattern */}
            <rect width="100%" height="100%" fill="url(#siteGrid10m)" />

            {/* Pan & Zoom Transform */}
            <g transform={`translate(${pan.x}, ${pan.y})`}>
              {/* Site Boundary Polygon */}
              {project.boundary && (
                <polygon
                  points={project.boundary.map((p) => `${p[0] * zoom},${p[1] * zoom}`).join(' ')}
                  fill="#0F172A"
                  fillOpacity="0.4"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
              )}

              {/* Roads */}
              {project.roads.map((road) => {
                const x1 = road.startPoint[0] * zoom;
                const y1 = road.startPoint[1] * zoom;
                const x2 = road.endPoint[0] * zoom;
                const y2 = road.endPoint[1] * zoom;
                const strokeW = road.widthMeters * zoom;

                return (
                  <g key={road.id} className="pointer-events-none">
                    {/* Asphalt Road Body */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1E293B" strokeWidth={strokeW} strokeLinecap="round" />
                    {/* White Center Dashes */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="8 6" />
                    {/* Label */}
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill="#CBD5E1"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {road.name}
                    </text>
                  </g>
                );
              })}

              {/* Open Spaces / Central Park */}
              {project.openSpaces.map((sp) => {
                const sx = sp.x * zoom;
                const sz = sp.z * zoom;
                const sw = sp.width * zoom;
                const sl = sp.length * zoom;
                return (
                  <g key={sp.id} className="pointer-events-none">
                    <rect x={sx} y={sz} width={sw} height={sl} fill={sp.color} fillOpacity="0.35" stroke={sp.color} strokeWidth="1.5" rx={4} />
                    <text x={sx + sw / 2} y={sz + sl / 2} fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {sp.name}
                    </text>
                  </g>
                );
              })}

              {/* Residential Plots */}
              {project.plots.map((plot) => {
                const px = plot.x * zoom;
                const pz = plot.z * zoom;
                const pw = plot.width * zoom;
                const pl = plot.length * zoom;
                const isSelected = plot.id === selectedId;

                return (
                  <g
                    key={plot.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectId(plot.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Plot Outline & Fill */}
                    <rect
                      x={px}
                      y={pz}
                      width={pw}
                      height={pl}
                      fill={isSelected ? '#0284C7' : plot.hasBuilding ? '#064E3B' : '#1E293B'}
                      fillOpacity={isSelected ? 0.7 : 0.45}
                      stroke={isSelected ? '#F59E0B' : '#10B981'}
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      rx={2}
                      className="transition-colors"
                    />

                    {/* Plot Number */}
                    <text
                      x={px + pw / 2}
                      y={pz + pl / 2 - 2}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {plot.plotNumber}
                    </text>

                    {/* Plot Dimensions */}
                    <text
                      x={px + pw / 2}
                      y={pz + pl / 2 + 10}
                      fill="#94A3B8"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {plot.areaSqM} m²
                    </text>
                  </g>
                );
              })}

              {/* Underground Cables Routes */}
              {project.cabling.map((cable) => {
                if (cable.waypoints.length < 2) return null;
                const dPath = cable.waypoints.reduce(
                  (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0] * zoom} ${pt[1] * zoom}`,
                  ''
                );
                const isHT = cable.cableClass === 'ht_11kv_underground';
                return (
                  <path
                    key={cable.id}
                    d={dPath}
                    fill="none"
                    stroke={isHT ? '#EF4444' : '#00F0FF'}
                    strokeWidth={isHT ? 2.5 : 1.8}
                    strokeDasharray={isHT ? '8 4' : '4 3'}
                    className="pointer-events-none"
                  />
                );
              })}

              {/* Electrical Infrastructure Components */}
              {project.infra.map((item) => {
                const ix = item.x * zoom;
                const iz = item.z * zoom;
                const isSelected = item.id === selectedId;

                let color = '#38BDF8';
                let radius = 7;
                let symbol = 'bolt';

                if (item.type === 'package_substation') {
                  color = '#F59E0B';
                  radius = 12;
                  symbol = 'electric_bolt';
                } else if (item.type === 'feeder_pillar') {
                  color = '#0284C7';
                  radius = 8;
                  symbol = 'power';
                } else if (item.type === 'street_light_pole') {
                  color = '#FACC15';
                  radius = 5;
                  symbol = 'wb_incandescent';
                } else if (item.type === 'existing_overhead_pole') {
                  color = '#EF4444';
                  radius = 6;
                  symbol = 'remove_circle';
                }

                return (
                  <g
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectId(item.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {isSelected && (
                      <circle cx={ix} cy={iz} r={radius + 8} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
                    )}
                    <circle cx={ix} cy={iz} r={radius} fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x={ix} y={iz + radius + 10} fill="#F8FAFC" fontSize="8" fontFamily="sans-serif" textAnchor="middle" className="pointer-events-none">
                      {item.type === 'package_substation' ? '11kV DTR' : item.type === 'feeder_pillar' ? 'FP' : 'SL'}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Planning Constraints Status Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl px-4 py-2.5 flex items-center gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${overlaps.length === 0 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">GEOMETRIC PLANNING CHECK</div>
                <div className="text-xs font-bold text-white">
                  {overlaps.length === 0 ? '✓ Zero Overlaps • Boundary & Setbacks Compliant' : `⚠ Overlap detected: ${overlaps.join(', ')}`}
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">TOTAL PLOTS</div>
              <div className="text-xs font-bold text-sky-400 font-mono">{project.plots.length} Units</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">ESTIMATED LOAD</div>
              <div className="text-xs font-bold text-amber-400 font-mono">{project.meta.totalEstimatedLoadKva} kVA</div>
            </div>
          </div>
        </div>

        {/* Right Inspector Sidebar */}
        <div className="w-80 bg-[#0F172A] border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Selected Plot Details */}
          {selectedPlot && (
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-emerald-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">domain</span>
                  Plot {selectedPlot.plotNumber}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  {selectedPlot.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono bg-slate-900 p-2 rounded">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Width:</span>
                    <span className="text-slate-200 font-bold">{selectedPlot.width}m ({(selectedPlot.width * 3.28084).toFixed(0)}ft)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Length:</span>
                    <span className="text-slate-200 font-bold">{selectedPlot.length}m ({(selectedPlot.length * 3.28084).toFixed(0)}ft)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Plot Area:</span>
                  <span className="font-mono text-sky-400 font-bold">{selectedPlot.areaSqM} m² ({(selectedPlot.areaSqM * 10.7639).toFixed(0)} sq.ft)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sanctioned Load:</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedPlot.sanctionedLoadKw} kW</span>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <label className="text-[11px] text-slate-400 block mb-1">Building Model:</label>
                  <select
                    value={selectedPlot.buildingType}
                    onChange={(e) => {
                      const updated = project.plots.map((p) =>
                        p.id === selectedPlot.id ? { ...p, buildingType: e.target.value as any } : p
                      );
                      commitProjectChange({ ...project, plots: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="villa_modern">Modern 2-Floor Villa</option>
                    <option value="contemporary_2fl">Contemporary Duplex</option>
                    <option value="traditional_bungalow">Traditional Bungalow</option>
                  </select>
                </div>

                {onInspectPlot && (
                  <button
                    onClick={() => onInspectPlot(selectedPlot)}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors shadow cursor-pointer text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">power</span>
                    <span>Inspect Service Drop & Voltage Drop</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selected Infrastructure Component Details */}
          {selectedInfra && (
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-amber-500/40">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">electric_bolt</span>
                Infrastructure Detail
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Name:</span>
                  <span className="font-semibold text-slate-200">{selectedInfra.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Capacity / Specification:</span>
                  <span className="font-mono text-amber-400 font-semibold">{selectedInfra.capacity || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status:</span>
                  <span className="font-mono text-sky-400">{selectedInfra.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Site Planning Information */}
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
              Site Planning Summary
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Total Area:</span>
              <span className="font-mono font-bold">{project.meta.totalAreaAcres} Acres</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Internal Roads:</span>
              <span className="font-mono font-bold">{project.roads.length} Arterials</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Transformer:</span>
              <span className="font-mono font-bold text-amber-400">{project.meta.transformerRatingKva} kVA DTR</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Feeder Pillars:</span>
              <span className="font-mono font-bold">{project.infra.filter((i) => i.type === 'feeder_pillar').length} Units</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Streetlights:</span>
              <span className="font-mono font-bold text-yellow-300">{project.infra.filter((i) => i.type === 'street_light_pole').length} Poles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
