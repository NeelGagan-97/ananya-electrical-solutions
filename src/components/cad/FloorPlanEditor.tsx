import React, { useState, useRef, useEffect } from 'react';
import {
  ResidentialProject,
  RoomData,
  OpeningData,
  ElectricalPoint,
  ElectricalPointType,
  RoomType
} from '../../types/residentialDesigner';
import {
  getApartmentFootprintMetrics,
  scaleResidentialProjectToDimensions,
  updateSingleRoomDimensions,
  metersToFeet,
  feetToMeters,
  PLOT_DIMENSION_PRESETS
} from '../../data/residentialPresets';

interface FloorPlanEditorProps {
  project: ResidentialProject;
  onUpdateProject: (updated: ResidentialProject) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  dimensionUnit?: 'ft' | 'm';
  onChangeDimensionUnit?: (unit: 'ft' | 'm') => void;
}

type EditorTool =
  | 'select'
  | 'add_room'
  | 'add_door'
  | 'add_window'
  | 'place_db'
  | 'place_switch'
  | 'place_socket'
  | 'place_downlight'
  | 'place_fan'
  | 'place_ac'
  | 'place_earth_pit';

export const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  project,
  onUpdateProject,
  selectedPointId,
  onSelectPoint,
  dimensionUnit = 'ft',
  onChangeDimensionUnit
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(project.rooms[0]?.id || null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(36); // pixels per meter
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 90, y: 150 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [localUnit, setLocalUnit] = useState<'ft' | 'm'>(dimensionUnit);

  const activeUnit = onChangeDimensionUnit ? dimensionUnit : localUnit;
  const handleSetUnit = (u: 'ft' | 'm') => {
    setLocalUnit(u);
    onChangeDimensionUnit?.(u);
  };

  const footprint = getApartmentFootprintMetrics(project);
  const [customBreadth, setCustomBreadth] = useState<string>(
    activeUnit === 'ft' ? String(footprint.breadthFt) : String(footprint.breadthM)
  );
  const [customLength, setCustomLength] = useState<string>(
    activeUnit === 'ft' ? String(footprint.lengthFt) : String(footprint.lengthM)
  );

  useEffect(() => {
    const m = getApartmentFootprintMetrics(project);
    setCustomBreadth(activeUnit === 'ft' ? String(m.breadthFt) : String(m.breadthM));
    setCustomLength(activeUnit === 'ft' ? String(m.lengthFt) : String(m.lengthM));
  }, [project, activeUnit]);

  // History for Undo/Redo
  const [history, setHistory] = useState<ResidentialProject[]>([project]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);

  const commitProjectChange = (newProject: ResidentialProject) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newProject);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onUpdateProject(newProject);
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

  const toFeetInches = (meters: number): string => {
    const totalInches = meters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'-${inches}"`;
  };

  // Convert screen coordinates to world meter coordinates
  const screenToWorld = (screenX: number, screenY: number): { x: number; z: number } => {
    if (!svgRef.current) return { x: 0, z: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = (screenX - rect.left - pan.x) / zoom;
    const rawZ = (screenY - rect.top - pan.y) / zoom;

    if (snapToGrid) {
      const snapStep = 0.5; // 0.5 meter grid snap
      return {
        x: Math.round(rawX / snapStep) * snapStep,
        z: Math.round(rawZ / snapStep) * snapStep
      };
    }
    return {
      x: Number(rawX.toFixed(2)),
      z: Number(rawZ.toFixed(2))
    };
  };

  // SVG Mouse handlers
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || e.altKey || activeTool === 'select' && e.target === svgRef.current) {
      // Middle click or Alt or empty canvas drag pans
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleSvgMouseUp = () => {
    setIsPanning(false);
  };

  // Handle clicking on canvas to place electrical component or add room
  const handleSvgClick = (e: React.MouseEvent<any>) => {
    if (isPanning) return;
    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Find which room this point falls inside
    const insideRoom = project.rooms.find(
      (r) =>
        worldPos.x >= r.x &&
        worldPos.x <= r.x + r.width &&
        worldPos.z >= r.z &&
        worldPos.z <= r.z + r.length
    );

    if (activeTool.startsWith('place_')) {
      let type: ElectricalPointType = 'switch_board_6a';
      let name = 'Modular Switchboard 6A';
      let power = 0;
      let circuitId = 'c1_living_lighting';
      let heightY = 1.2;

      switch (activeTool) {
        case 'place_db':
          type = 'db';
          name = 'Main Distribution Board (8-Way)';
          power = 0;
          circuitId = 'c_earth_grid';
          heightY = 1.5;
          break;
        case 'place_switch':
          type = 'switch_board_6a';
          name = 'Modular Switchboard (6M)';
          power = 0;
          circuitId = 'c1_living_lighting';
          heightY = 1.2;
          break;
        case 'place_socket':
          type = 'power_socket_16a';
          name = '16A Combined Power Socket';
          power = 1500;
          circuitId = 'c3_power_sockets';
          heightY = 0.45;
          break;
        case 'place_downlight':
          type = 'downlight_led';
          name = 'Ceiling Recessed 12W LED';
          power = 12;
          circuitId = 'c1_living_lighting';
          heightY = 2.95;
          break;
        case 'place_fan':
          type = 'ceiling_fan';
          name = '1200mm BLDC Smart Fan';
          power = 35;
          circuitId = 'c2_bedroom_fan';
          heightY = 2.7;
          break;
        case 'place_ac':
          type = 'ac_isolator';
          name = '20A AC Isolator Switch';
          power = 1800;
          circuitId = 'c5_heavy_ac';
          heightY = 2.4;
          break;
        case 'place_earth_pit':
          type = 'earth_pit';
          name = 'IS:3043 Maintenance-Free Earth Pit';
          power = 0;
          circuitId = 'c_earth_grid';
          heightY = 0.05;
          break;
      }

      const newPoint: ElectricalPoint = {
        id: `pt_${Date.now()}`,
        type,
        roomId: insideRoom ? insideRoom.id : project.rooms[0]?.id || '',
        name,
        x: worldPos.x,
        y: heightY,
        z: worldPos.z,
        circuitId,
        powerWatts: power,
        isOn: true,
        wallPlacement: heightY > 2.5 ? 'ceiling' : heightY < 0.2 ? 'ground' : 'west'
      };

      commitProjectChange({
        ...project,
        electricalPoints: [...project.electricalPoints, newPoint]
      });
      onSelectPoint(newPoint.id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'add_door' || activeTool === 'add_window') {
      if (insideRoom) {
        const isDoor = activeTool === 'add_door';
        const newOpening: OpeningData = {
          id: `open_${Date.now()}`,
          roomId: insideRoom.id,
          wallDirection: 'north',
          type: isDoor ? 'door' : 'window',
          offset: Math.max(0.2, Number((worldPos.x - insideRoom.x).toFixed(2))),
          width: isDoor ? 0.9 : 1.2,
          height: isDoor ? 2.1 : 1.2,
          sillHeight: isDoor ? 0 : 0.9,
          swing: 'inside_left'
        };

        commitProjectChange({
          ...project,
          openings: [...project.openings, newOpening]
        });
        setActiveTool('select');
      }
    }
  };

  // Selected room data
  const selectedRoom = project.rooms.find((r) => r.id === selectedRoomId);

  const handleUpdateSelectedRoom = (field: keyof RoomData, val: any) => {
    if (!selectedRoom) return;
    if (field === 'width') {
      const nextProject = updateSingleRoomDimensions(
        project,
        selectedRoom.id,
        Number(val) || 2.5,
        selectedRoom.length
      );
      commitProjectChange(nextProject);
      return;
    }
    if (field === 'length') {
      const nextProject = updateSingleRoomDimensions(
        project,
        selectedRoom.id,
        selectedRoom.width,
        Number(val) || 2.5
      );
      commitProjectChange(nextProject);
      return;
    }
    const updatedRooms = project.rooms.map((r) =>
      r.id === selectedRoom.id ? { ...r, [field]: val } : r
    );
    commitProjectChange({ ...project, rooms: updatedRooms });
  };

  const handleApplyOverallDimensions = () => {
    const rawB = parseFloat(customBreadth);
    const rawL = parseFloat(customLength);
    if (isNaN(rawB) || isNaN(rawL) || rawB <= 0 || rawL <= 0) return;

    const targetBM = activeUnit === 'ft' ? feetToMeters(rawB) : rawB;
    const targetLM = activeUnit === 'ft' ? feetToMeters(rawL) : rawL;
    const scaled = scaleResidentialProjectToDimensions(
      project,
      targetBM,
      targetLM,
      project.meta.floorHeight
    );
    commitProjectChange(scaled);
  };

  const handleAddRoom = (type: RoomType) => {
    let name = 'New Room';
    let color = '#E0F2FE';
    let w = 4.0, l = 3.5;

    if (type === 'living') { name = 'Living Hall'; color = '#E0F2FE'; w = 5.5; l = 4.2; }
    else if (type === 'master_bedroom') { name = 'Master Bedroom'; color = '#EDE9FE'; w = 4.5; l = 4.0; }
    else if (type === 'bedroom_2') { name = 'Bedroom 2'; color = '#DCFCE7'; w = 3.8; l = 3.5; }
    else if (type === 'kitchen') { name = 'Kitchen'; color = '#FEF3C7'; w = 3.2; l = 3.0; }
    else if (type === 'bathroom') { name = 'Toilet & Bath'; color = '#CCFBF1'; w = 2.2; l = 2.4; }
    else if (type === 'balcony') { name = 'Balcony'; color = '#FCE7F3'; w = 3.0; l = 1.5; }

    // Find rightmost room to place adjacent
    const maxX = project.rooms.reduce((max, r) => Math.max(max, r.x + r.width), 0);

    const newRoom: RoomData = {
      id: `room_${Date.now()}`,
      name,
      type,
      x: maxX > 0 ? maxX : 0,
      z: 0,
      width: w,
      length: l,
      ceilingHeight: 3.0,
      color
    };

    commitProjectChange({
      ...project,
      rooms: [...project.rooms, newRoom]
    });
    setSelectedRoomId(newRoom.id);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (project.rooms.length <= 1) return;
    const filteredRooms = project.rooms.filter((r) => r.id !== roomId);
    const filteredPoints = project.electricalPoints.filter((p) => p.roomId !== roomId);
    const filteredOpenings = project.openings.filter((o) => o.roomId !== roomId);

    commitProjectChange({
      ...project,
      rooms: filteredRooms,
      electricalPoints: filteredPoints,
      openings: filteredOpenings
    });
    setSelectedRoomId(filteredRooms[0]?.id || null);
  };

  const handleDeletePoint = (ptId: string) => {
    const filtered = project.electricalPoints.filter((p) => p.id !== ptId);
    commitProjectChange({ ...project, electricalPoints: filtered });
    onSelectPoint(null);
  };

  // Metrics
  const totalFloorAreaSqM = project.rooms.reduce((acc, r) => acc + r.width * r.length, 0);
  const totalFloorAreaSqFt = totalFloorAreaSqM * 10.7639;
  const totalConnectedWatts = project.electricalPoints.reduce((acc, p) => acc + (p.powerWatts || 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#0B132B] text-slate-100 select-none overflow-hidden">
      {/* Top CAD Ribbon */}
      <div className="h-14 bg-[#111C3A] border-b border-slate-700/60 px-4 flex items-center justify-between shrink-0 gap-3">
        {/* Left tools */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTool === 'select' ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">near_me</span>
            <span>Select / Pan</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          {/* Place Equipment Dropdowns/Buttons */}
          <button
            onClick={() => setActiveTool('place_db')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_db' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
            title="Place Main Distribution Board (DB)"
          >
            <span className="material-symbols-outlined text-[16px]">electric_meter</span>
            <span>+ DB</span>
          </button>

          <button
            onClick={() => setActiveTool('place_switch')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_switch' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
            }`}
            title="Place Modular Switchboard (6A)"
          >
            <span className="material-symbols-outlined text-[16px]">toggle_on</span>
            <span>+ Switch</span>
          </button>

          <button
            onClick={() => setActiveTool('place_socket')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_socket' ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
            title="Place 16A Power Socket"
          >
            <span className="material-symbols-outlined text-[16px]">power</span>
            <span>+ 16A Socket</span>
          </button>

          <button
            onClick={() => setActiveTool('place_downlight')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_downlight' ? 'bg-yellow-400 text-slate-950 font-bold' : 'bg-slate-800 text-yellow-300 hover:bg-slate-700'
            }`}
            title="Place Recessed LED Downlight"
          >
            <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            <span>+ LED</span>
          </button>

          <button
            onClick={() => setActiveTool('place_fan')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_fan' ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
            }`}
            title="Place BLDC Ceiling Fan"
          >
            <span className="material-symbols-outlined text-[16px]">mode_fan</span>
            <span>+ Fan</span>
          </button>

          <button
            onClick={() => setActiveTool('place_ac')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_ac' ? 'bg-rose-500 text-white font-bold' : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
            title="Place AC Isolator Switch"
          >
            <span className="material-symbols-outlined text-[16px]">ac_unit</span>
            <span>+ AC Point</span>
          </button>

          <button
            onClick={() => setActiveTool('place_earth_pit')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTool === 'place_earth_pit' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
            }`}
            title="Place IS:3043 Earth Pit"
          >
            <span className="material-symbols-outlined text-[16px]">grounding</span>
            <span>+ Earth Pit</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          {/* Add Door / Window */}
          <button
            onClick={() => setActiveTool('add_door')}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              activeTool === 'add_door' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Click near room wall to insert door"
          >
            <span className="material-symbols-outlined text-[15px]">meeting_room</span>
            <span>+ Door</span>
          </button>

          <button
            onClick={() => setActiveTool('add_window')}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              activeTool === 'add_window' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Click near room wall to insert window"
          >
            <span className="material-symbols-outlined text-[15px]">window</span>
            <span>+ Window</span>
          </button>
        </div>

        {/* Right Action Tools: Grid, Snap, Undo, Redo, Zoom */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 border transition-colors ${
              snapToGrid ? 'bg-sky-950/60 border-sky-500 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Snap to 0.5m Grid"
          >
            <span className="material-symbols-outlined text-[14px]">grid_4x4</span>
            <span>Snap 0.5m</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.min(z + 8, 90))}
              className="p-1 hover:text-white text-slate-300 rounded"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-400">{Math.round((zoom / 45) * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 8, 20))}
              className="p-1 hover:text-white text-slate-300 rounded"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_out</span>
            </button>
            <button
              onClick={() => { setZoom(45); setPan({ x: 80, y: 120 }); }}
              className="p-1 hover:text-white text-slate-300 rounded"
              title="Reset View"
            >
              <span className="material-symbols-outlined text-[16px]">fit_screen</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Undo"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Redo"
            >
              <span className="material-symbols-outlined text-[16px]">redo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main CAD Split Workspace: Left Canvas + Right Properties Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SVG Drawing Canvas */}
        <div className="flex-1 h-full relative bg-[#090F21] overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onClick={handleSvgClick}
          >
            <defs>
              {/* Architectural Grid pattern */}
              <pattern id="cadGridMinor" width={zoom * 0.5} height={zoom * 0.5} patternUnits="userSpaceOnUse">
                <path d={`M ${zoom * 0.5} 0 L 0 0 0 ${zoom * 0.5}`} fill="none" stroke="#1E293B" strokeWidth="0.5" />
              </pattern>
              <pattern id="cadGridMajor" width={zoom * 2.0} height={zoom * 2.0} patternUnits="userSpaceOnUse">
                <rect width={zoom * 2.0} height={zoom * 2.0} fill="url(#cadGridMinor)" />
                <path d={`M ${zoom * 2.0} 0 L 0 0 0 ${zoom * 2.0}`} fill="none" stroke="#334155" strokeWidth="1.0" />
              </pattern>
            </defs>

            {/* Grid Background */}
            <rect width="100%" height="100%" fill="url(#cadGridMajor)" />

            {/* Transform Group with Pan and Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y})`}>
              {/* Plot Outline Boundary */}
              <rect
                x={0}
                y={0}
                width={project.meta.plotWidth * zoom}
                height={project.meta.plotLength * zoom}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={10}
                y={-8}
                fill="#64748B"
                fontSize="11"
                fontFamily="monospace"
              >
                SITE BOUNDARY: {project.meta.plotWidth}m × {project.meta.plotLength}m ({toFeetInches(project.meta.plotWidth)} × {toFeetInches(project.meta.plotLength)})
              </text>

              {/* Rooms */}
              {project.rooms.map((room) => {
                const rx = room.x * zoom;
                const rz = room.z * zoom;
                const rw = room.width * zoom;
                const rl = room.length * zoom;
                const isSelected = room.id === selectedRoomId;
                const areaSqM = (room.width * room.length).toFixed(1);
                const areaSqFt = (room.width * room.length * 10.7639).toFixed(0);

                return (
                  <g
                    key={room.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeTool === 'select') {
                        setSelectedRoomId(room.id);
                        onSelectPoint(null);
                      } else {
                        handleSvgClick(e);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {/* Room Floor Fill */}
                    <rect
                      x={rx}
                      y={rz}
                      width={rw}
                      height={rl}
                      fill={room.color || '#1e293b'}
                      fillOpacity={isSelected ? 0.35 : 0.18}
                      stroke={isSelected ? '#38BDF8' : '#64748B'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      rx={3}
                    />

                    {/* Room Label */}
                    <text
                      x={rx + rw / 2}
                      y={rz + rl / 2 - 10}
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="13"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow"
                    >
                      {room.name}
                    </text>

                    {/* Room Dimensions & Area */}
                    <text
                      x={rx + rw / 2}
                      y={rz + rl / 2 + 8}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="11"
                      fontFamily="monospace"
                      className="pointer-events-none"
                    >
                      {room.width}m × {room.length}m ({toFeetInches(room.width)} × {toFeetInches(room.length)})
                    </text>

                    <text
                      x={rx + rw / 2}
                      y={rz + rl / 2 + 24}
                      textAnchor="middle"
                      fill="#38BDF8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {areaSqM} m² / {areaSqFt} sq.ft
                    </text>

                    {/* Dimension lines along top and left */}
                    {isSelected && (
                      <g className="pointer-events-none">
                        {/* Top dimension line */}
                        <line x1={rx} y1={rz - 12} x2={rx + rw} y2={rz - 12} stroke="#38BDF8" strokeWidth="1.2" />
                        <line x1={rx} y1={rz - 18} x2={rx} y2={rz - 6} stroke="#38BDF8" strokeWidth="1.2" />
                        <line x1={rx + rw} y1={rz - 18} x2={rx + rw} y2={rz - 6} stroke="#38BDF8" strokeWidth="1.2" />
                        <text x={rx + rw / 2} y={rz - 16} textAnchor="middle" fill="#38BDF8" fontSize="10" fontFamily="monospace">
                          {room.width.toFixed(2)} m
                        </text>

                        {/* Left dimension line */}
                        <line x1={rx - 12} y1={rz} x2={rx - 12} y2={rz + rl} stroke="#38BDF8" strokeWidth="1.2" />
                        <line x1={rx - 18} y1={rz} x2={rx - 6} y2={rz} stroke="#38BDF8" strokeWidth="1.2" />
                        <line x1={rx - 18} y1={rz + rl} x2={rx - 6} y2={rz + rl} stroke="#38BDF8" strokeWidth="1.2" />
                        <text
                          x={rx - 16}
                          y={rz + rl / 2}
                          textAnchor="middle"
                          transform={`rotate(-90, ${rx - 16}, ${rz + rl / 2})`}
                          fill="#38BDF8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {room.length.toFixed(2)} m
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Doors and Windows Openings */}
              {project.openings.map((op) => {
                const room = project.rooms.find((r) => r.id === op.roomId);
                if (!room) return null;

                let ox = room.x * zoom;
                let oz = room.z * zoom;
                let ow = op.width * zoom;

                if (op.wallDirection === 'north') {
                  ox += op.offset * zoom;
                } else if (op.wallDirection === 'south') {
                  ox += op.offset * zoom;
                  oz += room.length * zoom;
                } else if (op.wallDirection === 'west') {
                  oz += op.offset * zoom;
                } else if (op.wallDirection === 'east') {
                  ox += room.width * zoom;
                  oz += op.offset * zoom;
                }

                if (op.type === 'door') {
                  return (
                    <g key={op.id} className="pointer-events-none">
                      {/* Door leaf and swing arc */}
                      <rect x={ox} y={oz - 2} width={ow} height={4} fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
                      <path
                        d={`M ${ox} ${oz} A ${ow} ${ow} 0 0 1 ${ox + ow} ${oz + ow}`}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                    </g>
                  );
                } else {
                  return (
                    <g key={op.id} className="pointer-events-none">
                      {/* Window symbol (double blue line) */}
                      <rect x={ox} y={oz - 3} width={ow} height={6} fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                      <line x1={ox} y1={oz} x2={ox + ow} y2={oz} stroke="#FFFFFF" strokeWidth="1" />
                    </g>
                  );
                }
              })}

              {/* Conduit Wire Traces connecting Points */}
              {project.circuits.map((circ) => {
                const dbPt = project.electricalPoints.find((p) => p.type === 'db');
                if (!dbPt) return null;

                return circ.connectedPointIds.map((ptId) => {
                  const targetPt = project.electricalPoints.find((p) => p.id === ptId);
                  if (!targetPt || targetPt.type === 'earth_pit') return null;

                  const x1 = dbPt.x * zoom;
                  const y1 = dbPt.z * zoom;
                  const x2 = targetPt.x * zoom;
                  const y2 = targetPt.z * zoom;

                  return (
                    <line
                      key={`conduit_${circ.id}_${ptId}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={circ.phaseColor}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      strokeOpacity="0.6"
                      className="pointer-events-none"
                    />
                  );
                });
              })}

              {/* Electrical Points */}
              {project.electricalPoints.map((pt) => {
                const px = pt.x * zoom;
                const pz = pt.z * zoom;
                const isSelected = pt.id === selectedPointId;

                let iconSymbol = 'bolt';
                let fillColor = '#0284C7';

                if (pt.type === 'db') {
                  iconSymbol = 'electric_meter';
                  fillColor = '#F59E0B';
                } else if (pt.type === 'switch_board_6a') {
                  iconSymbol = 'toggle_on';
                  fillColor = '#38BDF8';
                } else if (pt.type === 'power_socket_16a') {
                  iconSymbol = 'power';
                  fillColor = '#10B981';
                } else if (pt.type === 'downlight_led') {
                  iconSymbol = 'lightbulb';
                  fillColor = '#FACC15';
                } else if (pt.type === 'ceiling_fan') {
                  iconSymbol = 'mode_fan';
                  fillColor = '#818CF8';
                } else if (pt.type === 'ac_isolator') {
                  iconSymbol = 'ac_unit';
                  fillColor = '#F43F5E';
                } else if (pt.type === 'earth_pit') {
                  iconSymbol = 'grounding';
                  fillColor = '#059669';
                }

                return (
                  <g
                    key={pt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPoint(pt.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle cx={px} cy={pz} r={18} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 2" />
                    )}

                    {/* Point Marker */}
                    <circle
                      cx={px}
                      cy={pz}
                      r={pt.type === 'db' ? 14 : 10}
                      fill={fillColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Text Label */}
                    <text
                      x={px}
                      y={pz + 18}
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      className="pointer-events-none drop-shadow"
                    >
                      {pt.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Quick HUD Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl px-4 py-2.5 flex items-center gap-6 shadow-xl">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">BUILT-UP AREA</div>
              <div className="text-sm font-bold text-sky-400 font-mono">
                {totalFloorAreaSqM.toFixed(1)} m² <span className="text-xs text-slate-400">({totalFloorAreaSqFt.toFixed(0)} sq.ft)</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">ELECTRICAL POINTS</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {project.electricalPoints.length} <span className="text-xs text-slate-400">Units</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">CONNECTED LOAD</div>
              <div className="text-sm font-bold text-amber-400 font-mono">
                {(totalConnectedWatts / 1000).toFixed(2)} kW
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties & Room Management Panel */}
        <div className="w-88 bg-[#0F172A] border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* 1. Overall 2BHK Apartment Length × Breadth Parametric Generator */}
          <div className="bg-slate-900/95 rounded-xl p-3.5 border border-sky-500/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">straighten</span>
                2BHK Length × Breadth
              </span>

              {/* Dual-Unit Switcher (Feet / Meters) */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] font-mono font-bold">
                <button
                  onClick={() => handleSetUnit('ft')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    activeUnit === 'ft'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Feet (ft)
                </button>
                <button
                  onClick={() => handleSetUnit('m')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    activeUnit === 'm'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Meters (m)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                  Breadth / Width ({activeUnit})
                </label>
                <input
                  type="number"
                  step={activeUnit === 'ft' ? '1' : '0.2'}
                  min={activeUnit === 'ft' ? 24 : 7.5}
                  max={activeUnit === 'ft' ? 140 : 45}
                  value={customBreadth}
                  onChange={(e) => setCustomBreadth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                  {activeUnit === 'ft'
                    ? `${footprint.breadthM} m (X-Axis)`
                    : `${footprint.breadthFt} ft (X-Axis)`}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                  Length / Depth ({activeUnit})
                </label>
                <input
                  type="number"
                  step={activeUnit === 'ft' ? '1' : '0.2'}
                  min={activeUnit === 'ft' ? 26 : 8.0}
                  max={activeUnit === 'ft' ? 160 : 50}
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                  {activeUnit === 'ft'
                    ? `${footprint.lengthM} m (Z-Axis)`
                    : `${footprint.lengthFt} ft (Z-Axis)`}
                </span>
              </div>
            </div>

            <button
              onClick={handleApplyOverallDimensions}
              className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              <span>Scale 2BHK Model to L × B</span>
            </button>

            {/* Quick Plot Size Presets */}
            <div className="pt-1 border-t border-slate-800">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick 2BHK Size Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PLOT_DIMENSION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      const scaled = scaleResidentialProjectToDimensions(
                        project,
                        preset.breadthM,
                        preset.lengthM,
                        preset.ceilingHeightM
                      );
                      commitProjectChange(scaled);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-slate-200 truncate">
                      {preset.label.split(' ')[0]} {preset.label.split(' ')[1]}
                    </div>
                    <div className="text-[9px] font-mono text-sky-400">
                      {activeUnit === 'ft'
                        ? `${preset.breadthFt}×${preset.lengthFt} ft`
                        : `${preset.breadthM}×${preset.lengthM} m`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Selected Room Inspector (Breadth × Length) */}
          {selectedRoom ? (
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">room_preferences</span>
                  Room Length × Breadth
                </span>
                <button
                  onClick={() => handleDeleteRoom(selectedRoom.id)}
                  disabled={project.rooms.length <= 1}
                  className="text-rose-400 hover:text-rose-300 disabled:opacity-30 p-1 rounded cursor-pointer"
                  title="Delete Room"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Room Name</label>
                  <input
                    type="text"
                    value={selectedRoom.name}
                    onChange={(e) => handleUpdateSelectedRoom('name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Breadth / Width ({activeUnit})
                    </label>
                    <input
                      type="number"
                      step={activeUnit === 'ft' ? '0.5' : '0.1'}
                      min={activeUnit === 'ft' ? '6.5' : '2.0'}
                      max={activeUnit === 'ft' ? '80' : '25'}
                      value={
                        activeUnit === 'ft'
                          ? metersToFeet(selectedRoom.width)
                          : selectedRoom.width
                      }
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value);
                        if (isNaN(raw)) return;
                        const mVal = activeUnit === 'ft' ? feetToMeters(raw) : raw;
                        handleUpdateSelectedRoom('width', mVal);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {selectedRoom.width.toFixed(2)}m • {toFeetInches(selectedRoom.width)}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Length / Depth ({activeUnit})
                    </label>
                    <input
                      type="number"
                      step={activeUnit === 'ft' ? '0.5' : '0.1'}
                      min={activeUnit === 'ft' ? '6.5' : '2.0'}
                      max={activeUnit === 'ft' ? '80' : '25'}
                      value={
                        activeUnit === 'ft'
                          ? metersToFeet(selectedRoom.length)
                          : selectedRoom.length
                      }
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value);
                        if (isNaN(raw)) return;
                        const mVal = activeUnit === 'ft' ? feetToMeters(raw) : raw;
                        handleUpdateSelectedRoom('length', mVal);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {selectedRoom.length.toFixed(2)}m • {toFeetInches(selectedRoom.length)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">X Offset (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedRoom.x}
                      onChange={(e) => handleUpdateSelectedRoom('x', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Z Offset (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedRoom.z}
                      onChange={(e) => handleUpdateSelectedRoom('z', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Electrical Point Inspector */}
          {selectedPointId && (
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-amber-500/40">
              {(() => {
                const pt = project.electricalPoints.find((p) => p.id === selectedPointId);
                if (!pt) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Point Details
                      </span>
                      <button
                        onClick={() => handleDeletePoint(pt.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded"
                        title="Delete Point"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Name:</span>
                        <span className="font-semibold text-slate-200">{pt.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Circuit:</span>
                          <span className="text-sky-400 font-bold">{pt.circuitId.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Power:</span>
                          <span className="text-amber-400 font-bold">{pt.powerWatts} Watts</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded">
                        <div>X: {pt.x.toFixed(2)}m</div>
                        <div>Y: {pt.y.toFixed(2)}m</div>
                        <div>Z: {pt.z.toFixed(2)}m</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Add Room Templates */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">add_home</span>
              Add Room
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddRoom('master_bedroom')}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-purple-400">bed</span>
                <span>Bedroom</span>
              </button>
              <button
                onClick={() => handleAddRoom('kitchen')}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">countertops</span>
                <span>Kitchen</span>
              </button>
              <button
                onClick={() => handleAddRoom('bathroom')}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-400">bathtub</span>
                <span>Bathroom</span>
              </button>
              <button
                onClick={() => handleAddRoom('balcony')}
                className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-pink-400">balcony</span>
                <span>Balcony</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
