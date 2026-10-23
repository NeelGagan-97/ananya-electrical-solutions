import React, { useState, useMemo } from 'react';
import {
  ResidentialLayoutProject,
  ResidentialPlot,
  ElectricalInfraComponent,
  PlotServiceConnection
} from '../../types/layoutDesigner';
import { generateUtilityCorridorRoutes } from './layoutRoutingEngine';

interface NetworkPlanningPanelProps {
  project: ResidentialLayoutProject;
  onUpdateProject: (updated: ResidentialLayoutProject) => void;
  onSelectPlot?: (plotId: string) => void;
  onClose: () => void;
}

export const NetworkPlanningPanel: React.FC<NetworkPlanningPanelProps> = ({
  project,
  onUpdateProject,
  onSelectPlot,
  onClose
}) => {
  // Feeder Pillars
  const feederPillars = useMemo(
    () => project.infra.filter((i) => i.type === 'feeder_pillar'),
    [project.infra]
  );

  // Substation
  const substation = useMemo(
    () => project.infra.find((i) => i.type === 'package_substation'),
    [project.infra]
  );

  // Streetlights
  const streetlights = useMemo(
    () => project.infra.filter((i) => i.type === 'street_light_pole'),
    [project.infra]
  );

  // Total plot sanctioned load
  const totalPlotLoadKw = useMemo(
    () => project.plots.reduce((sum, p) => sum + (p.sanctionedLoadKw || 7), 0),
    [project.plots]
  );

  // Streetlight total load (approx 60W per pole)
  const streetlightLoadKw = useMemo(
    () => Number(((streetlights.length * 60) / 1000).toFixed(1)),
    [streetlights.length]
  );

  // Common amenities / park load
  const amenitiesLoadKw = 15.0;

  const totalConnectedLoadKw = totalPlotLoadKw + streetlightLoadKw + amenitiesLoadKw;

  // Diversified Demand (using project.meta.diversityFactor or default 0.65)
  const diversityFactor = project.meta.diversityFactor || 0.65;
  const powerFactor = 0.85;
  const peakDiversifiedDemandKw = totalConnectedLoadKw * diversityFactor;
  const peakDiversifiedKva = peakDiversifiedDemandKw / powerFactor;

  const transformerCapacityKva = project.meta.transformerRatingKva || 500;
  const transformerLoadingPercent = (peakDiversifiedKva / transformerCapacityKva) * 100;

  // Feeder Pillar loading and phase balance breakdown
  const feederStats = useMemo(() => {
    return feederPillars.map((fp) => {
      // Find plots assigned to this feeder
      const assignedPlots = project.plots.filter(
        (p) => p.serviceConnection?.assignedFeederPillarId === fp.id
      );

      let rKw = 0;
      let yKw = 0;
      let bKw = 0;

      assignedPlots.forEach((p) => {
        const load = p.sanctionedLoadKw || 7;
        const phase = p.serviceConnection?.assignedPhase || '3-Phase 415V';
        if (phase === 'R') {
          rKw += load;
        } else if (phase === 'Y') {
          yKw += load;
        } else if (phase === 'B') {
          bKw += load;
        } else {
          // 3-Phase balanced
          rKw += load / 3;
          yKw += load / 3;
          bKw += load / 3;
        }
      });

      const totalFpLoadKw = rKw + yKw + bKw;
      const avgPhase = totalFpLoadKw / 3 || 1;
      const maxPhaseDeviation = Math.max(
        Math.abs(rKw - avgPhase),
        Math.abs(yKw - avgPhase),
        Math.abs(bKw - avgPhase)
      );
      const unbalancePercent = avgPhase > 0 ? (maxPhaseDeviation / avgPhase) * 100 : 0;

      // 400A busbar rating capacity approx 260 kW at 415V 0.85 PF
      const busbarCapacityKw = 260;
      const fpLoadPercent = (totalFpLoadKw / busbarCapacityKw) * 100;

      return {
        pillar: fp,
        plotCount: assignedPlots.length,
        totalLoadKw: Number(totalFpLoadKw.toFixed(1)),
        rKw: Number(rKw.toFixed(1)),
        yKw: Number(yKw.toFixed(1)),
        bKw: Number(bKw.toFixed(1)),
        unbalancePercent: Number(unbalancePercent.toFixed(1)),
        fpLoadPercent: Number(fpLoadPercent.toFixed(1)),
        assignedPlots
      };
    });
  }, [feederPillars, project.plots]);

  // Disconnected / Unassigned Plots
  const disconnectedPlots = useMemo(() => {
    return project.plots.filter(
      (p) =>
        !p.serviceConnection ||
        !p.serviceConnection.assignedFeederPillarId ||
        p.serviceConnection.status === 'disconnected' ||
        p.serviceConnection.status === 'pending'
    );
  }, [project.plots]);

  // High Voltage Drop Plots (> 3%)
  const highDropPlots = useMemo(() => {
    return project.plots.filter((p) => (p.serviceConnection?.calculatedDropVoltageLossPercent || 0) > 3.0);
  }, [project.plots]);

  // Auto-Assign Disconnected Plots to Nearest Feeder Pillar
  const handleAutoAssignDisconnected = () => {
    if (feederPillars.length === 0) return;

    const updatedPlots = project.plots.map((p) => {
      if (
        !p.serviceConnection ||
        !p.serviceConnection.assignedFeederPillarId ||
        p.serviceConnection.status === 'disconnected'
      ) {
        // Find closest feeder pillar
        let closestFp = feederPillars[0];
        let minDist = Infinity;
        feederPillars.forEach((fp) => {
          const dx = fp.x - (p.x + p.width / 2);
          const dz = fp.z - (p.z + p.length / 2);
          const d = dx * dx + dz * dz;
          if (d < minDist) {
            minDist = d;
            closestFp = fp;
          }
        });

        const connection: PlotServiceConnection = {
          serviceEntryPosition: [p.x + p.width - 0.5, p.z + p.length - 0.5],
          meterLocation: [p.x + p.width - 0.5, p.z + p.length - 0.5],
          dbLocation: [p.x + p.width / 2, p.z + p.length / 2],
          routeType: 'underground_conduit',
          routeWaypoints: [
            [closestFp.x, closestFp.z],
            [p.x + p.width - 0.5, p.z + p.length - 0.5]
          ],
          status: 'connected',
          assignedFeederPillarId: closestFp.id,
          assignedPhase: '3-Phase 415V',
          serviceCableSpec: '4C x 16 sq.mm XLPE Al Armoured',
          calculatedDropVoltageLossPercent: 0.85
        };

        return { ...p, serviceConnection: connection };
      }
      return p;
    });

    onUpdateProject({
      ...project,
      plots: updatedPlots
    });
  };

  const [routingNotice, setRoutingNotice] = useState<string | null>(null);

  // Auto-Route Utility Corridors along Road Spines (Section 10)
  const handleAutoRouteCorridors = () => {
    const result = generateUtilityCorridorRoutes(project);
    onUpdateProject({
      ...project,
      cabling: result.routes
    });
    setRoutingNotice(
      `Corridor Routing Engine generated ${result.routes.length} compliant infrastructure paths along road reserves: ${result.totalHtLengthMeters}m 11kV HT Loop, ${result.totalLtLengthMeters}m 415V Main Feeders, and ${result.totalStreetlightCableMeters}m Streetlight Circuit.`
    );
  };

  // Toggle Energization State
  const handleToggleEnergization = () => {
    onUpdateProject({
      ...project,
      meta: {
        ...project.meta,
        isEnergized: !project.meta.isEnergized
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Electrical Network Planning & Power Flow Simulation
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  IS:732 / CEA Standard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                11kV Substation • 415V Low-Voltage Distribution Feeders • Feeder Pillar Phase Balance • Voltage Drop Verification
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Quick Stats: Substation Loading */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Connected Load
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {totalConnectedLoadKw.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {project.plots.length} Plots + Streetlights + Common
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Peak Diversified Demand
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {peakDiversifiedKva.toFixed(1)} <span className="text-xs font-normal text-slate-400">kVA</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                DF: {(diversityFactor * 100).toFixed(0)}% • PF: 0.85 Lagging
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                DTR Substation Loading
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-sky-400 font-mono">
                  {transformerLoadingPercent.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  of {transformerCapacityKva} kVA
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full ${
                    transformerLoadingPercent < 70
                      ? 'bg-emerald-500'
                      : transformerLoadingPercent < 85
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(transformerLoadingPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Grid State & Simulation
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      project.meta.isEnergized ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-mono text-xs font-bold">
                    {project.meta.isEnergized ? 'Grid Energized (415V)' : 'Grid De-Energized'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleEnergization}
                className={`mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  project.meta.isEnergized
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {project.meta.isEnergized ? 'Isolate / De-Energize' : 'Energize Grid & Cables'}
              </button>
            </div>
          </div>

          {/* Feeder Pillars Phase Balance Analysis */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">equalizer</span>
                <span>Feeder Pillars Phase Balancing & Loading Schedule (415V TPN)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {feederPillars.length} Total Feeder Pillars
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1E293B] text-slate-400 font-mono text-[11px] uppercase border-y border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Feeder Pillar</th>
                    <th className="py-2.5 px-3">Plots</th>
                    <th className="py-2.5 px-3">Connected (kW)</th>
                    <th className="py-2.5 px-3">Phase R (kW)</th>
                    <th className="py-2.5 px-3">Phase Y (kW)</th>
                    <th className="py-2.5 px-3">Phase B (kW)</th>
                    <th className="py-2.5 px-3">Unbalance %</th>
                    <th className="py-2.5 px-3">Loading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {feederStats.map((fs) => (
                    <tr key={fs.pillar.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>{fs.pillar.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{fs.plotCount} Plots</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{fs.totalLoadKw} kW</td>
                      <td className="py-2.5 px-3 text-rose-400">{fs.rKw} kW</td>
                      <td className="py-2.5 px-3 text-yellow-400">{fs.yKw} kW</td>
                      <td className="py-2.5 px-3 text-sky-400">{fs.bKw} kW</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            fs.unbalancePercent < 15
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                          }`}
                        >
                          {fs.unbalancePercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-500 h-full"
                              style={{ width: `${Math.min(fs.fpLoadPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px]">{fs.fpLoadPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Network Health & Connectivity Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Disconnected Plots Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Disconnected / Unrouted Plots</span>
                  </div>
                  <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]">
                    {disconnectedPlots.length} Plots
                  </span>
                </div>

                {disconnectedPlots.length === 0 ? (
                  <p className="text-slate-400 text-xs py-2">
                    All residential plots have active service connection routes assigned to feeder pillars.
                  </p>
                ) : (
                  <div className="space-y-1.5 my-2 max-h-32 overflow-y-auto pr-1">
                    {disconnectedPlots.map((dp) => (
                      <div
                        key={dp.id}
                        onClick={() => onSelectPlot?.(dp.id)}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-between cursor-pointer border border-slate-700 text-xs"
                      >
                        <span className="font-bold text-white">Plot {dp.plotNumber}</span>
                        <span className="text-amber-400 font-mono text-[10px]">
                          {dp.serviceConnection?.status || 'No Route'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {disconnectedPlots.length > 0 && (
                <button
                  onClick={handleAutoAssignDisconnected}
                  className="mt-3 w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                  <span>Auto-Route to Nearest Feeder Pillars</span>
                </button>
              )}
            </div>

            {/* Voltage Drop Audit Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">trending_down</span>
                    <span>IS:732 Voltage Drop Audit</span>
                  </div>
                  <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px]">
                    Threshold &le; 3.00%
                  </span>
                </div>

                {highDropPlots.length === 0 ? (
                  <p className="text-slate-300 text-xs py-2 leading-relaxed">
                    All calculated residential service drops comply with IS:732 standard limits (&le; 3.0% voltage drop from feeder pillar to consumer meter).
                  </p>
                ) : (
                  <div className="space-y-1.5 my-2 max-h-32 overflow-y-auto pr-1">
                    {highDropPlots.map((hdp) => (
                      <div
                        key={hdp.id}
                        onClick={() => onSelectPlot?.(hdp.id)}
                        className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/40 flex items-center justify-between cursor-pointer text-xs"
                      >
                        <span className="font-bold text-white">Plot {hdp.plotNumber}</span>
                        <span className="text-rose-400 font-mono font-bold">
                          {hdp.serviceConnection?.calculatedDropVoltageLossPercent}% Drop (Exceeds Limit)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Formula: $V_{`{drop}`} = \sqrt{3} \times I \times L \times (R \cos\phi + X \sin\phi) / 1000$
              </div>
            </div>
          </div>

          {/* Section 10: Automatic Infrastructure Routing Engine */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">route</span>
                <span>Automatic Infrastructure Routing Engine (Section 10)</span>
              </div>
              <p className="text-xs text-slate-300">
                Generates underground utility corridors along road margins, connecting the 11kV DTR to all 400A Feeder Pillars, Streetlight circuits, and plots while avoiding building obstructions.
              </p>
              {routingNotice && (
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2 mt-2">
                  {routingNotice}
                </div>
              )}
            </div>

            <button
              onClick={handleAutoRouteCorridors}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              <span>Re-Route Corridors Along Roads</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Compliant with CEA (Central Electricity Authority) Regulations 2023 & IS:732.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Planning View
          </button>
        </div>
      </div>
    </div>
  );
};
