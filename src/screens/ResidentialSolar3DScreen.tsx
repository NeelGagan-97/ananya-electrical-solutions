import React, { useState, useMemo, useEffect } from 'react';
import { NavigationTab } from '../types';
import {
  SOLAR_CAPACITY_PRESETS,
  SOLAR_EQUIPMENT_COMPONENTS,
  SOLAR_OPERATING_MODES,
  BESCOM_NET_METERING_STEPS,
  STREET_VIEW_WAYPOINTS,
  SolarSystemCapacityId,
  SolarViewMode,
  SolarOperatingModeId,
  WalkthroughStationId,
} from '../data/residentialSolarPresets';
import { ResidentialSolarCanvas } from '../three/ResidentialSolarCanvas';

interface ResidentialSolar3DScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (topic?: string) => void;
}

type ActiveWorkspaceModal = 'none' | 'bescom_process' | 'sld_bom' | 'welcome';

export const ResidentialSolar3DScreen: React.FC<ResidentialSolar3DScreenProps> = ({
  onSelectTab,
  onOpenConsultation,
}) => {
  // 1. System Configuration State
  const [capacityId, setCapacityId] = useState<SolarSystemCapacityId>('5kwp');
  const [isHybridBess, setIsHybridBess] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<SolarViewMode>('isometric');
  const [operatingMode, setOperatingMode] = useState<SolarOperatingModeId>('sunny');

  // 2. Interactive Telemetry Control Sliders
  const [irradiance, setIrradiance] = useState<number>(920); // W/m2
  const [activeStrings, setActiveStrings] = useState<number>(2);
  const [baseHouseholdLoadKw, setBaseHouseholdLoadKw] = useState<number>(1.2);
  const [timeHour, setTimeHour] = useState<number>(12.5);
  const [gridOnline, setGridOnline] = useState<boolean>(true);

  // 3. Interactive Ground Floor Appliances ([F] Fan, [L] Lights, [T] TV, [C] AC)
  const [appliances, setAppliances] = useState({
    fanOn: true,
    lightsOn: true,
    tvOn: true,
    acOn: false,
  });

  // 4. Camera, Walkthrough & Inspector State
  const [isWalkthrough, setIsWalkthrough] = useState<boolean>(false);
  const [walkthroughStation, setWalkthroughStation] = useState<WalkthroughStationId>('gate');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('pv_modules');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<ActiveWorkspaceModal>('none');
  const [activeBescomStep, setActiveBescomStep] = useState<number>(1);
  const [cameraControlAction, setCameraControlAction] = useState<{
    type: 'zoom_in' | 'zoom_out' | 'reset';
    seq: number;
  } | null>(null);

  const currentPreset = SOLAR_CAPACITY_PRESETS[capacityId];
  const currentModeSpec =
    SOLAR_OPERATING_MODES.find((m) => m.id === operatingMode) || SOLAR_OPERATING_MODES[0];

  // Sync activeStrings when capacity changes
  useEffect(() => {
    setActiveStrings(currentPreset.stringsCount);
  }, [capacityId, currentPreset.stringsCount]);

  // Apply Operating Mode Preset
  const handleSelectOperatingMode = (modeId: SolarOperatingModeId) => {
    const spec = SOLAR_OPERATING_MODES.find((m) => m.id === modeId);
    if (!spec) return;
    setOperatingMode(modeId);
    setIrradiance(spec.defaultIrradiance);
    setTimeHour(spec.defaultTimeHour);
    setGridOnline(spec.gridOnline);

    if (modeId === 'high_load') {
      setBaseHouseholdLoadKw(3.2);
      setAppliances({ fanOn: true, lightsOn: true, tvOn: true, acOn: true });
    } else if (modeId === 'night') {
      setBaseHouseholdLoadKw(1.1);
      setAppliances({ fanOn: true, lightsOn: true, tvOn: true, acOn: false });
    } else {
      setBaseHouseholdLoadKw(1.2);
      setAppliances({ fanOn: true, lightsOn: true, tvOn: true, acOn: false });
    }
  };

  // Toggle Appliance handler
  const handleToggleAppliance = (key: 'fanOn' | 'lightsOn' | 'tvOn' | 'acOn') => {
    setAppliances((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ESC key pauses walkthrough or closes modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (activeModal !== 'none') {
          setActiveModal('none');
        } else if (isWalkthrough) {
          setIsWalkthrough(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, isWalkthrough]);

  // =========================================================================
  // REAL-TIME ENGINEERING TELEMETRY CALCULATIONS
  // =========================================================================
  const telemetry = useMemo(() => {
    const stringRatio =
      currentPreset.stringsCount > 0
        ? Math.min(1, activeStrings / currentPreset.stringsCount)
        : 1;
    const rawDcKw =
      currentPreset.capacityKw * (irradiance / 1000) * stringRatio * 0.91; // temperature & cabling derating
    const inverterTripped = !gridOnline && !isHybridBess;
    const solarGenKw =
      irradiance <= 10 || inverterTripped
        ? 0
        : Number(Math.min(currentPreset.inverterRatingKw, rawDcKw).toFixed(2));

    // Appliance load contribution
    const applianceKw =
      (appliances.fanOn ? 0.075 : 0) +
      (appliances.lightsOn ? 0.18 : 0) +
      (appliances.tvOn ? 0.16 : 0) +
      (appliances.acOn ? 1.65 : 0);

    const rawHomeDemandKw = Number((baseHouseholdLoadKw + applianceKw).toFixed(2));
    const homeLoadKw = !gridOnline && !isHybridBess ? 0 : rawHomeDemandKw;

    let gridExportKw = 0;
    let gridImportKw = 0;
    if (gridOnline) {
      if (solarGenKw >= homeLoadKw) {
        gridExportKw = Number((solarGenKw - homeLoadKw).toFixed(2));
      } else {
        gridImportKw = Number((homeLoadKw - solarGenKw).toFixed(2));
      }
    }

    const dcVoltage =
      irradiance <= 10
        ? 0
        : Math.round(currentPreset.nominalDcVoltage * (0.88 + 0.12 * (irradiance / 1000)));
    const dcCurrent =
      dcVoltage > 0 && !inverterTripped
        ? Number(((solarGenKw * 1000) / dcVoltage).toFixed(1))
        : 0;

    const acVoltage = !gridOnline && !isHybridBess ? 0 : currentPreset.supplyPhase.includes('3-Phase') ? 415 : 234;
    const acFrequency = !gridOnline && !isHybridBess ? 0.0 : 50.02;

    let inverterStatus = 'MPPT TRACKING • EXPORTING TO BESCOM';
    if (!gridOnline && !isHybridBess) {
      inverterStatus = 'ANTI-ISLANDING TRIP (GRID ISOLATED)';
    } else if (!gridOnline && isHybridBess) {
      inverterStatus = 'HYBRID ISLAND BACKUP (BESS ACTIVE)';
    } else if (irradiance <= 10) {
      inverterStatus = 'NIGHT STANDBY (0 W SOLAR)';
    } else if (gridImportKw > 0) {
      inverterStatus = 'SOLAR + BESCOM GRID SUPPLEMENT';
    }

    const dailyEnergyKwh = Number(
      (currentPreset.avgDailyGenerationKwh * Math.max(0.25, irradiance / 850) * stringRatio).toFixed(1)
    );
    const totalLifetimeKwh = Math.round(currentPreset.annualGenerationKwh * 2.4 + dailyEnergyKwh);

    return {
      solarGenKw,
      homeLoadKw,
      gridExportKw,
      gridImportKw,
      dcVoltage,
      dcCurrent,
      acVoltage,
      acFrequency,
      inverterStatus,
      dailyEnergyKwh,
      totalLifetimeKwh,
    };
  }, [
    currentPreset,
    irradiance,
    activeStrings,
    baseHouseholdLoadKw,
    appliances,
    gridOnline,
    isHybridBess,
  ]);

  const selectedEquipment = useMemo(
    () =>
      SOLAR_EQUIPMENT_COMPONENTS.find((c) => c.id === selectedComponentId) ||
      SOLAR_EQUIPMENT_COMPONENTS[0],
    [selectedComponentId]
  );

  const currentWaypoint = useMemo(
    () =>
      STREET_VIEW_WAYPOINTS.find((w) => w.id === walkthroughStation) ||
      STREET_VIEW_WAYPOINTS[0],
    [walkthroughStation]
  );

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-[#070E1E] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* =====================================================================
          1. TOP BRAND & ENGINEERING CONTROL RIBBON
         ===================================================================== */}
      <header className="min-h-14 bg-[#0B1528]/95 border-b border-slate-800 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
            title="Return to Home"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <span className="material-symbols-outlined text-[20px]">solar_power</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.18em] text-amber-400">
                  ANANYA ELECTRICAL SOLUTIONS
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  BESCOM &amp; KERC COMPLIANT
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                RESIDENTIAL SOLAR INSTALLATION — {currentPreset.label}
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Capacity Selector + On-Grid / Hybrid Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            {(['3kwp', '5kwp', '8kwp', '10kwp'] as SolarSystemCapacityId[]).map((cid) => (
              <button
                key={cid}
                onClick={() => setCapacityId(cid)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  capacityId === cid
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cid.toUpperCase().replace('KWP', ' kWp')}
              </button>
            ))}
          </div>

          {/* On-Grid vs Hybrid BESS Toggle */}
          <button
            onClick={() => setIsHybridBess((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isHybridBess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : 'bg-slate-900 text-sky-300 border-slate-700 hover:border-sky-400'
            }`}
            title="Switch between Standard BESCOM On-Grid Inverter and Hybrid Inverter + LiFePO4 Battery Backup"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isHybridBess ? 'battery_charging_full' : 'bolt'}
            </span>
            <span>{isHybridBess ? 'Hybrid + LiFePO4 BESS' : 'On-Grid Net-Metered'}</span>
          </button>
        </div>

        {/* Right: BESCOM 10-Step Process, SLD/BOM & Consultation CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('bescom_process')}
            className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            <span>BESCOM Grid Process</span>
          </button>

          <button
            onClick={() => setActiveModal('sld_bom')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">schema</span>
            <span className="hidden sm:inline">SLD &amp; BOM</span>
          </button>

          <button
            onClick={() =>
              onOpenConsultation(
                `Residential Solar Installation (${currentPreset.label} - ${
                  isHybridBess ? 'Hybrid BESS' : 'BESCOM On-Grid'
                })`
              )
            }
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">request_quote</span>
            <span className="hidden md:inline">Get Solar Quote</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN 3D VIEWPORT & FLOATING ENGINEERING OVERLAYS
         ===================================================================== */}
      <div className="flex-1 relative overflow-hidden">
        <ResidentialSolarCanvas
          capacityId={capacityId}
          viewMode={viewMode}
          operatingMode={operatingMode}
          isHybridBess={isHybridBess}
          irradiance={irradiance}
          activeStrings={activeStrings}
          solarGenKw={telemetry.solarGenKw}
          homeLoadKw={telemetry.homeLoadKw}
          gridImportKw={telemetry.gridImportKw}
          gridExportKw={telemetry.gridExportKw}
          gridOnline={gridOnline}
          isWalkthrough={isWalkthrough}
          walkthroughStation={walkthroughStation}
          onChangeStation={(st) => setWalkthroughStation(st)}
          selectedComponentId={selectedComponentId}
          onSelectComponent={(id) => {
            setSelectedComponentId(id);
            setIsInspectorOpen(true);
          }}
          showLabels={showLabels}
          isAutoRotate={isAutoRotate}
          cameraControlAction={cameraControlAction}
          appliances={appliances}
          onToggleAppliance={handleToggleAppliance}
        />

        {/* =================================================================
            TOP-LEFT HUD: 4 VIEW MODES + CAMERA CONTROLS + STREET VIEW TOGGLE
           ================================================================= */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-xl pointer-events-auto">
          {/* 4 Engineering View Modes + Walkthrough Toggle */}
          <div className="bg-[#0B1528]/92 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-xl flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'isometric', label: 'ISOMETRIC VIEW', icon: 'view_in_ar' },
                { id: 'top', label: 'TOP VIEW', icon: 'grid_on' },
                { id: 'side', label: 'SIDE VIEW', icon: 'height' },
                { id: 'exploded', label: 'EXPLODED ELECTRICAL VIEW', icon: 'layers' },
              ] as { id: SolarViewMode; label: string; icon: string }[]
            ).map((vm) => (
              <button
                key={vm.id}
                onClick={() => {
                  setIsWalkthrough(false);
                  setViewMode(vm.id);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isWalkthrough && viewMode === vm.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{vm.icon}</span>
                <span>{vm.label}</span>
              </button>
            ))}

            {/* Street View & Human Walkthrough Button */}
            <button
              onClick={() => setIsWalkthrough((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isWalkthrough
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title="Walk from Main Entrance up the Staircase to the Rooftop Solar Array using Google Street View arrows and station steps"
            >
              <span className="material-symbols-outlined text-[16px]">streetview</span>
              <span>{isWalkthrough ? 'EXIT WALKTHROUGH' : 'STREET VIEW WALKTHROUGH'}</span>
            </button>
          </div>

          {/* Camera Zoom / Orbit / Labels Quick Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="bg-[#0B1528]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2 py-1 flex items-center gap-1 shadow-lg">
              <button
                onClick={() =>
                  setCameraControlAction({ type: 'zoom_in', seq: Date.now() })
                }
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[15px]">zoom_in</span>
                <span className="hidden sm:inline">Zoom In</span>
              </button>
              <button
                onClick={() =>
                  setCameraControlAction({ type: 'zoom_out', seq: Date.now() })
                }
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[15px]">zoom_out</span>
                <span className="hidden sm:inline">Zoom Out</span>
              </button>
              <button
                onClick={() => setIsAutoRotate((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                  isAutoRotate
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
                title="Toggle Auto-Rotate"
              >
                <span className="material-symbols-outlined text-[15px]">3d_rotation</span>
                <span className="hidden sm:inline">Orbit</span>
              </button>
              <button
                onClick={() =>
                  setCameraControlAction({ type: 'reset', seq: Date.now() })
                }
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Reset Camera View"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span className="hidden sm:inline">Reset</span>
              </button>
              <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />
              <button
                onClick={() => setShowLabels((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  showLabels
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">label</span>
                <span>16 Labels {showLabels ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* 5 OPERATING MODES BAR */}
          <div className="bg-[#0B1528]/92 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                5 REALISTIC OPERATING MODES (CLICK TO SIMULATE)
              </span>
              <span className="text-[10px] font-mono text-sky-300">
                {currentModeSpec.code}: {currentModeSpec.title}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {SOLAR_OPERATING_MODES.map((m) => {
                const active = operatingMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectOperatingMode(m.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-md'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0">
                      {m.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono opacity-80 leading-none">
                        {m.code}
                      </div>
                      <div className="text-[10.5px] font-bold truncate leading-tight mt-0.5">
                        {m.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================================
            STREET VIEW NAVIGATION HUD (Active when in Walkthrough Mode)
           ================================================================= */}
        {isWalkthrough && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-lg w-full px-3">
            <div className="bg-[#0B1528]/95 backdrop-blur-md border-2 border-amber-400/60 rounded-2xl p-3 shadow-2xl text-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">
                    streetview
                  </span>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                      STREET VIEW &amp; HUMAN WALKTHROUGH • STEP {currentWaypoint.stepNumber} OF 7
                    </div>
                    <div className="text-xs font-extrabold text-white">
                      {currentWaypoint.title}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                  {currentWaypoint.zone}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {currentWaypoint.subtitle}
              </p>

              {/* Street View Forward / Back Arrow Buttons + Station Pills */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <button
                  disabled={!currentWaypoint.prevStation}
                  onClick={() =>
                    currentWaypoint.prevStation &&
                    setWalkthroughStation(currentWaypoint.prevStation)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    currentWaypoint.prevStation
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Prev Arrow</span>
                </button>

                <div className="flex items-center gap-1">
                  {STREET_VIEW_WAYPOINTS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => setWalkthroughStation(wp.id)}
                      className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-all ${
                        walkthroughStation === wp.id
                          ? 'bg-amber-400 text-slate-950 scale-110'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={wp.title}
                    >
                      {wp.stepNumber}
                    </button>
                  ))}
                </div>

                <button
                  disabled={!currentWaypoint.nextStation}
                  onClick={() =>
                    currentWaypoint.nextStation &&
                    setWalkthroughStation(currentWaypoint.nextStation)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                    currentWaypoint.nextStation
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <span>Next Arrow</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-1 pt-0.5">
                <span>Move with W A S D / Arrows or click 3D Street View arrows • Drag to look 360°</span>
                <span>[F] Fan • [L] Lights • [T] TV • [C] AC • [E] Inspect • [ESC] Exit</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TOP-RIGHT FLOATING INTERACTIVE POWER-FLOW TELEMETRY DASHBOARD
           ================================================================= */}
        <div className="absolute top-3 right-3 z-20 w-84 sm:w-96 max-w-[calc(100vw-1.5rem)] pointer-events-auto">
          <div className="bg-[#0B1528]/94 backdrop-blur-md border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden">
            {/* Dashboard Header */}
            <div className="px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    !gridOnline && !isHybridBess
                      ? 'bg-red-500 animate-ping'
                      : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                    INTERACTIVE POWER-FLOW DASHBOARD
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Simulated Engineering Telemetry • {currentPreset.supplyPhase}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDashboardCollapsed((prev) => !prev)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title={isDashboardCollapsed ? 'Expand Telemetry' : 'Minimize Telemetry'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isDashboardCollapsed ? 'expand_more' : 'expand_less'}
                </span>
              </button>
            </div>

            {!isDashboardCollapsed && (
              <div className="p-3.5 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto">
                {/* Inverter Operating Status Banner */}
                <div
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-between ${
                    !gridOnline && !isHybridBess
                      ? 'bg-red-950/70 border-red-500/60 text-red-300'
                      : !gridOnline && isHybridBess
                      ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                      : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  <span>INVERTER STATUS:</span>
                  <span className="truncate ml-1">{telemetry.inverterStatus}</span>
                </div>

                {/* Primary 4 Power Flow Metrics */}
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
                    <div className="text-[9px] text-slate-400 uppercase">SOLAR GENERATION</div>
                    <div className="text-base font-extrabold text-amber-400">
                      {telemetry.solarGenKw.toFixed(2)} kW
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Irradiance: {irradiance} W/m²
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-sky-500/30">
                    <div className="text-[9px] text-slate-400 uppercase">HOME CONSUMPTION</div>
                    <div className="text-base font-extrabold text-sky-400">
                      {telemetry.homeLoadKw.toFixed(2)} kW
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Active Home Loads
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <div className="text-[9px] text-slate-400 uppercase">BESCOM GRID EXPORT</div>
                    <div className="text-base font-extrabold text-emerald-400">
                      {telemetry.gridExportKw.toFixed(2)} kW
                    </div>
                    <div className="text-[9px] text-emerald-300/80">
                      Net Meter Forward
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-orange-500/30">
                    <div className="text-[9px] text-slate-400 uppercase">BESCOM GRID IMPORT</div>
                    <div className="text-base font-extrabold text-orange-400">
                      {telemetry.gridImportKw.toFixed(2)} kW
                    </div>
                    <div className="text-[9px] text-orange-300/80">
                      Net Meter Reverse
                    </div>
                  </div>
                </div>

                {/* Secondary Electrical Parameters (DC V, DC A, AC V, AC Hz, Daily & Total Energy) */}
                <div className="grid grid-cols-3 gap-1.5 font-mono text-center bg-slate-900/75 p-2 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-[8.5px] text-slate-400">DC VOLTAGE</div>
                    <div className="text-xs font-bold text-red-400">{telemetry.dcVoltage} V</div>
                  </div>
                  <div>
                    <div className="text-[8.5px] text-slate-400">DC CURRENT</div>
                    <div className="text-xs font-bold text-red-300">{telemetry.dcCurrent} A</div>
                  </div>
                  <div>
                    <div className="text-[8.5px] text-slate-400">AC VOLTAGE</div>
                    <div className="text-xs font-bold text-sky-300">{telemetry.acVoltage} V</div>
                  </div>
                  <div>
                    <div className="text-[8.5px] text-slate-400">AC FREQUENCY</div>
                    <div className="text-xs font-bold text-emerald-300">
                      {telemetry.acFrequency.toFixed(2)} Hz
                    </div>
                  </div>
                  <div>
                    <div className="text-[8.5px] text-slate-400">DAILY YIELD</div>
                    <div className="text-xs font-bold text-amber-300">
                      {telemetry.dailyEnergyKwh} kWh
                    </div>
                  </div>
                  <div>
                    <div className="text-[8.5px] text-slate-400">TOTAL YIELD</div>
                    <div className="text-xs font-bold text-white">
                      {telemetry.totalLifetimeKwh.toLocaleString('en-IN')} kWh
                    </div>
                  </div>
                </div>

                {/* Interactive Telemetry Sliders */}
                <div className="space-y-2 pt-1 border-t border-slate-800 text-[11px]">
                  {/* 1. Solar Irradiance */}
                  <div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-300">1. Solar Irradiance:</span>
                      <span className="text-amber-400 font-bold">{irradiance} W/m²</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={20}
                      value={irradiance}
                      onChange={(e) => setIrradiance(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* 2. Household Base Load */}
                  <div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-300">2. Base Household Load:</span>
                      <span className="text-sky-400 font-bold">{baseHouseholdLoadKw.toFixed(1)} kW</span>
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={6.0}
                      step={0.1}
                      value={baseHouseholdLoadKw}
                      onChange={(e) => setBaseHouseholdLoadKw(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {/* 3. Time of Day */}
                  <div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-300">3. Time of Day:</span>
                      <span className="text-emerald-300 font-bold">
                        {Math.floor(timeHour).toString().padStart(2, '0')}:
                        {timeHour % 1 >= 0.5 ? '30' : '00'} hrs
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={21}
                      step={0.5}
                      value={timeHour}
                      onChange={(e) => {
                        const hr = Number(e.target.value);
                        setTimeHour(hr);
                        if (hr < 6.5 || hr >= 18.5) {
                          setIrradiance(0);
                        } else {
                          const peakFactor = Math.sin(((hr - 6.5) / 12) * Math.PI);
                          setIrradiance(Math.round(peakFactor * 960));
                        }
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* 4. Active PV Strings & 5. BESCOM Grid Availability */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">Strings:</span>
                      {[1, 2].map((sc) => (
                        <button
                          key={sc}
                          onClick={() => setActiveStrings(sc)}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold cursor-pointer ${
                            activeStrings === sc
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sc}S
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setGridOnline((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer border ${
                        gridOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                    >
                      {gridOnline ? 'BESCOM GRID: ONLINE' : 'BESCOM GRID: OUTAGE'}
                    </button>
                  </div>
                </div>

                {/* Live Home Appliance Switches ([F] Fan, [L] Lights, [T] TV, [C] AC) */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[9.5px] font-mono uppercase text-slate-400 mb-1.5">
                    INTERACTIVE HOME APPLIANCES (KEYBOARD OR CLICK)
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                    <button
                      onClick={() => handleToggleAppliance('fanOn')}
                      className={`py-1.5 px-1 rounded-lg border font-bold cursor-pointer ${
                        appliances.fanOn
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [F] Fan
                    </button>
                    <button
                      onClick={() => handleToggleAppliance('lightsOn')}
                      className={`py-1.5 px-1 rounded-lg border font-bold cursor-pointer ${
                        appliances.lightsOn
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [L] Lights
                    </button>
                    <button
                      onClick={() => handleToggleAppliance('tvOn')}
                      className={`py-1.5 px-1 rounded-lg border font-bold cursor-pointer ${
                        appliances.tvOn
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [T] TV
                    </button>
                    <button
                      onClick={() => handleToggleAppliance('acOn')}
                      className={`py-1.5 px-1 rounded-lg border font-bold cursor-pointer ${
                        appliances.acOn
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [C] AC
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================
            BOTTOM DOCK: 16-COMPONENT INSPECTOR & POWER-FLOW CHAIN
           ================================================================= */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-full max-w-5xl bg-[#0B1528]/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
            {/* Component Selector Strip (1 to 16) */}
            <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {SOLAR_EQUIPMENT_COMPONENTS.map((comp) => {
                  const isSel = selectedComponentId === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedComponentId(comp.id);
                        setIsInspectorOpen(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono whitespace-nowrap transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-amber-500 text-slate-950 border-white font-extrabold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {comp.shortLabel}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsInspectorOpen((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isInspectorOpen ? 'expand_more' : 'expand_less'}
                </span>
                <span className="hidden sm:inline">
                  {isInspectorOpen ? 'Hide Specs' : 'Inspect'}
                </span>
              </button>
            </div>

            {/* Selected Component Details Body */}
            {isInspectorOpen && (
              <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs">
                <div className="lg:col-span-5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold uppercase">
                      {selectedEquipment.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      STATUS: {selectedEquipment.defaultStatus}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white">
                    {selectedEquipment.index}. {selectedEquipment.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-amber-300">Purpose:</strong> {selectedEquipment.purpose}
                  </p>
                </div>

                <div className="lg:col-span-4 space-y-1 bg-slate-900/85 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-sky-400 font-bold">Electrical I/O: </span>
                    <span className="text-slate-200">{selectedEquipment.electricalInputOutput}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold">Connection Details: </span>
                    <span className="text-slate-300">{selectedEquipment.connectionDetails}</span>
                  </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-2 gap-1.5">
                  {selectedEquipment.specs.map((sp, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col"
                    >
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {sp.label}
                      </span>
                      <span className="text-[10.5px] font-bold text-white truncate" title={sp.value}>
                        {sp.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. MODAL A: BESCOM GRID CONNECTION — ACTUAL 10-STEP PROCESS
         ===================================================================== */}
      {activeModal === 'bescom_process' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-5xl w-full bg-[#0B1528] border border-sky-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                  <span className="material-symbols-outlined text-[22px]">account_tree</span>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    STATUTORY INTERCONNECTION &amp; NET-METERING WORKFLOW
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    BESCOM Grid Connectivity &amp; PM Surya Ghar 10-Step Process
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Physical & Electrical Interconnection Diagram Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                  Physical &amp; Electrical Connection Path to BESCOM Distribution Network
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  {[
                    '1. Rooftop PV Array',
                    '2. DC String Conduit',
                    '3. DCDB (Fuse + DC SPD + Isolator)',
                    '4. Grid-Tied MPPT Inverter',
                    '5. ACDB (MCB + RCCB + AC SPD)',
                    '6. Gross Generation Meter',
                    '7. Consumer Main DB (Home Loads)',
                    '8. BESCOM Bidirectional Net Meter',
                    '9. BESCOM 415V/230V Street Pole',
                  ].map((node, idx) => (
                    <React.Fragment key={node}>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-semibold">
                        {node}
                      </span>
                      {idx < 8 && <span className="text-amber-400 font-bold">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 10-Step Interactive Process Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-1.5">
                  {BESCOM_NET_METERING_STEPS.map((st) => {
                    const active = activeBescomStep === st.stepNumber;
                    return (
                      <button
                        key={st.stepNumber}
                        onClick={() => setActiveBescomStep(st.stepNumber)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          active
                            ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg font-mono text-xs font-extrabold flex items-center justify-center shrink-0 ${
                              active ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-sky-400'
                            }`}
                          >
                            {st.stepNumber}
                          </span>
                          <span className="text-xs truncate">{st.title}</span>
                        </div>
                        <span className="material-symbols-outlined text-[15px] shrink-0">
                          chevron_right
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-7">
                  {(() => {
                    const step =
                      BESCOM_NET_METERING_STEPS.find((s) => s.stepNumber === activeBescomStep) ||
                      BESCOM_NET_METERING_STEPS[0];
                    return (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                              {step.phase}
                            </span>
                            <span className="text-xs font-mono text-sky-400">
                              Authority: {step.authority}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-white">
                            Step {step.stepNumber}: {step.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {step.description}
                          </p>

                          <div className="space-y-1.5 pt-2">
                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              Required Deliverables &amp; Field Checks:
                            </div>
                            <ul className="space-y-1 text-xs text-slate-200">
                              {step.deliverables.map((del, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-emerald-400 text-[15px]">
                                    check_circle
                                  </span>
                                  <span>{del}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-mono text-slate-400">
                            Ref: {step.statutoryRef}
                          </span>
                          <button
                            onClick={() => {
                              setActiveModal('none');
                              onOpenConsultation(
                                `BESCOM Rooftop Solar Net-Metering Liaison (${currentPreset.label})`
                              );
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold cursor-pointer"
                          >
                            Engage Ananya for Turnkey BESCOM Approval
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. MODAL B: SINGLE-LINE DIAGRAM (SLD) & BILL OF MATERIALS (BOM)
         ===================================================================== */}
      {activeModal === 'sld_bom' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-[#0B1528] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  ENGINEERING SCHEMATIC &amp; HARDWARE SCHEDULE
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Single-Line Diagram (SLD) &amp; Bill of Materials — {currentPreset.label}
                </h2>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Bill of Materials Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 font-mono text-[11px] border-b border-slate-800">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Equipment Description</th>
                      <th className="p-2.5">Technical Specification</th>
                      <th className="p-2.5">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">01</td>
                      <td className="p-2.5 font-bold text-white">Solar PV Modules</td>
                      <td className="p-2.5 text-slate-300">
                        {currentPreset.moduleWp} Wp Mono PERC / TOPCon (ALMM Approved)
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">
                        {currentPreset.moduleCount} Nos ({currentPreset.stringsCount} Strings)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">02</td>
                      <td className="p-2.5 font-bold text-white">Hot-Dip GI Mounting Structure</td>
                      <td className="p-2.5 text-slate-300">
                        Elevated 14° South-Facing GI Frame + Aluminium Rails &amp; SS304 Clamps
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">
                        1 Set ({currentPreset.roofAreaSqFt} sq.ft)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">03</td>
                      <td className="p-2.5 font-bold text-white">DC Combiner Box (DCDB)</td>
                      <td className="p-2.5 text-slate-300">
                        IP65 Enclosure with 1000V 15A gPV String Fuses, Type-2 DC SPD &amp; DC Isolator
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">1 Set</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">04</td>
                      <td className="p-2.5 font-bold text-white">
                        {isHybridBess ? 'Hybrid Solar Inverter + LiFePO4 BESS' : 'Grid-Tied String Inverter'}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {currentPreset.inverterRatingKw} kW, {currentPreset.supplyPhase}, Dual MPPT, IEC 62116 Anti-Islanding
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">1 Unit</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">05</td>
                      <td className="p-2.5 font-bold text-white">AC Distribution Box (ACDB)</td>
                      <td className="p-2.5 text-slate-300">
                        IP65 Box with 32A AC MCB, 30mA RCCB, Type-2 AC SPD &amp; AC Isolator
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">1 Set</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">06</td>
                      <td className="p-2.5 font-bold text-white">BESCOM Bidirectional Net Meter &amp; Solar Meter</td>
                      <td className="p-2.5 text-slate-300">
                        BESCOM MT-Lab Tested Class 1.0 4-Quadrant Net Meter + Gross Solar Meter
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">1 + 1 Nos</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-amber-400">07</td>
                      <td className="p-2.5 font-bold text-white">Earthing &amp; Lightning Protection</td>
                      <td className="p-2.5 text-slate-300">
                        3 Separate Dedicated Earth Pits (DC, AC, LA) + Rooftop ESE/Franklin Arrestor
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">3 Pits + 1 LA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cost & Subsidy Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">ESTIMATED TURNKEY EPC COST</span>
                  <span className="text-base font-extrabold text-white">
                    ₹{currentPreset.estimatedTurnkeyCostInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">PM SURYA GHAR DBT SUBSIDY</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    - ₹{currentPreset.pmSuryaGharSubsidyInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">NET EFFECTIVE INVESTMENT</span>
                  <span className="text-base font-extrabold text-amber-400">
                    ₹
                    {(
                      currentPreset.estimatedTurnkeyCostInr -
                      currentPreset.pmSuryaGharSubsidyInr
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Statutory Engineering Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
                <strong className="text-slate-200">Engineering Note:</strong> This interactive 3D simulation and schematic represent a conceptual engineering model for residential solar power flow and equipment layout. Final site-specific construction drawings, string sizing, and earthing layouts are issued after physical rooftop survey and BESCOM Technical Feasibility Approval (TFA).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
