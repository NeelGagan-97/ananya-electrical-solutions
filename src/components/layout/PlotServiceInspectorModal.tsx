import React, { useState, useMemo } from 'react';
import {
  ResidentialLayoutProject,
  ResidentialPlot,
  PlotServiceConnection,
  ServiceConnectionStatus,
  ServiceRouteType
} from '../../types/layoutDesigner';

interface PlotServiceInspectorModalProps {
  plot: ResidentialPlot;
  project: ResidentialLayoutProject;
  onClose: () => void;
  onUpdatePlot: (updatedPlot: ResidentialPlot) => void;
  onApplyToAllInFeeder?: (feederId: string, templateConnection: PlotServiceConnection, loadKw: number) => void;
}

export const PlotServiceInspectorModal: React.FC<PlotServiceInspectorModalProps> = ({
  plot,
  project,
  onClose,
  onUpdatePlot,
  onApplyToAllInFeeder
}) => {
  // Available feeder pillars
  const feederPillars = useMemo(
    () => project.infra.filter((i) => i.type === 'feeder_pillar'),
    [project.infra]
  );

  const defaultFeeder = feederPillars[0]?.id || 'fp_1';

  // Find assigned feeder pillar
  const initialFeederId = plot.serviceConnection?.assignedFeederPillarId || defaultFeeder;

  // Local state
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(plot.sanctionedLoadKw || 7.0);
  const [status, setStatus] = useState<ServiceConnectionStatus>(
    plot.serviceConnection?.status || 'connected'
  );
  const [assignedFeederId, setAssignedFeederId] = useState<string>(initialFeederId);
  const [assignedPhase, setAssignedPhase] = useState<'R' | 'Y' | 'B' | '1-Phase 230V' | '3-Phase 415V'>(
    plot.serviceConnection?.assignedPhase || '3-Phase 415V'
  );
  const [routeType, setRouteType] = useState<ServiceRouteType>(
    plot.serviceConnection?.routeType || 'underground_conduit'
  );
  const [cableSpec, setCableSpec] = useState<string>(
    plot.serviceConnection?.serviceCableSpec || '4C x 16 sq.mm XLPE Al Armoured'
  );
  const [meterType, setMeterType] = useState<string>('3-Phase 10-60A Smart TOD Meter with DLMS/COSEM');
  const [dbSpec, setDbSpec] = useState<string>('8-Way TPN DB with 40A 30mA RCCB + 10kA Type-C MCBs');

  // Calculate distance from assigned Feeder Pillar to Plot
  const assignedFeeder = feederPillars.find((f) => f.id === assignedFeederId);
  const distanceMeters = useMemo(() => {
    if (!assignedFeeder) return 25;
    const dx = assignedFeeder.x - (plot.x + plot.width / 2);
    const dz = assignedFeeder.z - (plot.z + plot.length / 2);
    // Add 20% for underground trench bends and vertical riser
    return Math.round(Math.sqrt(dx * dx + dz * dz) * 1.25) + 4;
  }, [assignedFeeder, plot]);

  // Calculate current and voltage drop
  // Standard Aluminium XLPE resistance R and reactance X (approx 16 sq.mm: R=2.45 ohm/km, X=0.085 ohm/km)
  const is3Phase = assignedPhase === '3-Phase 415V';
  const voltage = is3Phase ? 415 : 230;
  const powerFactor = 0.85;

  const currentAmps = useMemo(() => {
    if (is3Phase) {
      return (sanctionedLoadKw * 1000) / (Math.sqrt(3) * 415 * powerFactor);
    }
    return (sanctionedLoadKw * 1000) / (230 * powerFactor);
  }, [sanctionedLoadKw, is3Phase]);

  // Specific conductor resistance (approx ohms/km) based on cable spec
  const conductorR_per_km = useMemo(() => {
    if (cableSpec.includes('25 sq.mm')) return 1.54;
    if (cableSpec.includes('16 sq.mm')) return 2.45;
    if (cableSpec.includes('10 sq.mm')) return 3.90;
    return 2.45;
  }, [cableSpec]);

  const voltageDropVolts = useMemo(() => {
    const L_km = distanceMeters / 1000;
    const sinPhi = Math.sin(Math.acos(powerFactor));
    const X_per_km = 0.085;
    const factor = is3Phase ? Math.sqrt(3) : 2.0;
    return factor * currentAmps * L_km * (conductorR_per_km * powerFactor + X_per_km * sinPhi);
  }, [distanceMeters, currentAmps, conductorR_per_km, is3Phase]);

  const voltageDropPercent = useMemo(() => {
    return (voltageDropVolts / voltage) * 100;
  }, [voltageDropVolts, voltage]);

  const isCompliant = voltageDropPercent <= 3.0;

  // Handle Save
  const handleSave = () => {
    const updatedConnection: PlotServiceConnection = {
      serviceEntryPosition: [plot.x + plot.width - 0.5, plot.z + plot.length - 0.5],
      meterLocation: [plot.x + plot.width - 0.5, plot.z + plot.length - 0.5],
      dbLocation: [plot.x + plot.width / 2, plot.z + plot.length / 2],
      routeType,
      routeWaypoints: assignedFeeder
        ? [
            [assignedFeeder.x, assignedFeeder.z],
            [plot.x + plot.width - 0.5, plot.z + plot.length - 0.5]
          ]
        : [],
      status,
      assignedFeederPillarId: assignedFeederId,
      assignedPhase,
      serviceCableSpec: cableSpec,
      calculatedDropVoltageLossPercent: Number(voltageDropPercent.toFixed(2))
    };

    const updatedPlot: ResidentialPlot = {
      ...plot,
      sanctionedLoadKw,
      serviceConnection: updatedConnection
    };

    onUpdatePlot(updatedPlot);
    onClose();
  };

  const handleApplyToAllFeederPlots = () => {
    if (!onApplyToAllInFeeder) return;
    const template: PlotServiceConnection = {
      serviceEntryPosition: [plot.x, plot.z],
      meterLocation: [plot.x, plot.z],
      dbLocation: [plot.x, plot.z],
      routeType,
      routeWaypoints: [],
      status,
      assignedFeederPillarId: assignedFeederId,
      assignedPhase,
      serviceCableSpec: cableSpec,
      calculatedDropVoltageLossPercent: Number(voltageDropPercent.toFixed(2))
    };
    onApplyToAllInFeeder(assignedFeederId, template, sanctionedLoadKw);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-[24px]">power</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Plot {plot.plotNumber} — Residential Service Connection
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : status === 'pending'
                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plot Size: {plot.width}m × {plot.length}m ({plot.areaSqM} m² / {(plot.areaSqM * 10.764).toFixed(0)} sq.ft) • Facing {plot.facing.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Connected Load & Electrical Rating */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">electric_meter</span>
              <span>Sanctioned Load & Electrical Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Sanctioned Load (kW):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="3"
                    max="30"
                    value={sanctionedLoadKw}
                    onChange={(e) => setSanctionedLoadKw(Number(e.target.value) || 5)}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400 text-xs font-mono">kW</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Operating Voltage & Phase:</label>
                <select
                  value={assignedPhase}
                  onChange={(e) => setAssignedPhase(e.target.value as any)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="3-Phase 415V">3-Phase 415V (R-Y-B Balanced)</option>
                  <option value="R">1-Phase 230V (Phase R)</option>
                  <option value="Y">1-Phase 230V (Phase Y)</option>
                  <option value="B">1-Phase 230V (Phase B)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Peak Full Load Current:</label>
                <div className="bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold">
                  {currentAmps.toFixed(1)} Amperes
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Distribution Feeder & Route Specification */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">alt_route</span>
              <span>Distribution Feeder & Service Route</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Assigned Feeder Pillar:</label>
                <select
                  value={assignedFeederId}
                  onChange={(e) => setAssignedFeederId(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                >
                  {feederPillars.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name} ({fp.capacity || '400A'})
                    </option>
                  ))}
                </select>
                {assignedFeeder && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pillar Coords: ({assignedFeeder.x.toFixed(1)}m, {assignedFeeder.z.toFixed(1)}m)
                  </span>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Service Route Topology:</label>
                <select
                  value={routeType}
                  onChange={(e) => setRouteType(e.target.value as any)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="underground_conduit">Underground 50mm DWC HDPE Conduit</option>
                  <option value="overhead_drop">Overhead Service Drop (ABC Cable)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Service Incomer Cable Spec:</label>
                <select
                  value={cableSpec}
                  onChange={(e) => setCableSpec(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="4C x 16 sq.mm XLPE Al Armoured">4C x 16 sq.mm XLPE Al Armoured (Standard 3-Phase)</option>
                  <option value="4C x 25 sq.mm XLPE Al Armoured">4C x 25 sq.mm XLPE Al Armoured (Heavy Load &gt; 12kW)</option>
                  <option value="2C x 10 sq.mm XLPE Al Armoured">2C x 10 sq.mm XLPE Al Armoured (1-Phase up to 6kW)</option>
                  <option value="4C x 10 sq.mm Copper Armoured">4C x 10 sq.mm Copper Armoured (Premium Low-Loss)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Connection State:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="connected">Connected & Energized</option>
                  <option value="pending">Pending Inspection / Metering</option>
                  <option value="disconnected">Isolated / Service Disconnected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Metering & Indoor Distribution Board Equipment */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>Metering & Distribution Board Hardware</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Energy Meter Type:</label>
                <input
                  type="text"
                  value={meterType}
                  onChange={(e) => setMeterType(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Distribution Board (DB) Type:</label>
                <input
                  type="text"
                  value={dbSpec}
                  onChange={(e) => setDbSpec(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Live IS:732 Voltage Drop Verification */}
          <div
            className={`rounded-xl p-4 border text-xs ${
              isCompliant
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <span className="material-symbols-outlined text-[16px]">
                  {isCompliant ? 'verified' : 'warning'}
                </span>
                <span>IS:732 Conductor & Voltage Drop Analysis</span>
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  isCompliant ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {voltageDropPercent.toFixed(2)}% Drop
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] py-1 border-y border-slate-800/80 mb-2">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Route Length</span>
                <span className="font-bold text-white">{distanceMeters} meters</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Voltage Drop</span>
                <span className="font-bold text-amber-400">{voltageDropVolts.toFixed(1)} V</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Threshold (IS:732)</span>
                <span className="font-bold text-slate-300">Max 3.00%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isCompliant
                ? `Conductor selection is fully compliant. Service drop voltage loss (${voltageDropPercent.toFixed(2)}%) remains safely within the statutory 3.0% threshold mandated by IS:732 for residential low-voltage service lines.`
                : `Calculated voltage drop (${voltageDropPercent.toFixed(2)}%) exceeds the 3.0% threshold. Recommend upgrading cable cross-section to 4C x 25 sq.mm or relocating connection to a closer Feeder Pillar.`}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {onApplyToAllInFeeder && (
            <button
              onClick={handleApplyToAllFeederPlots}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Apply these electrical settings to all plots connected to this Feeder Pillar"
            >
              Apply to All Plots on {assignedFeeder?.name || 'Feeder'}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Save Service Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
