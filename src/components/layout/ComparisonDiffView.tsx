import React, { useState } from 'react';
import { ResidentialLayoutProject } from '../../types/layoutDesigner';

interface ComparisonDiffViewProps {
  project: ResidentialLayoutProject;
  onOpenConsultation?: (topic: string) => void;
}

export const ComparisonDiffView: React.FC<ComparisonDiffViewProps> = ({
  project,
  onOpenConsultation
}) => {
  const [activeTab, setActiveTab] = useState<'side_by_side' | 'delta_table'>('side_by_side');

  // Quantify Existing vs Proposed from project data
  const existingPoles = project.infra.filter((i) => i.type === 'existing_overhead_pole' || i.status === 'existing_to_remove').length || 5;
  const proposedSub = project.infra.find((i) => i.type === 'package_substation');
  const proposedPillars = project.infra.filter((i) => i.type === 'feeder_pillar').length;
  const proposedStreetlights = project.infra.filter((i) => i.type === 'street_light_pole').length;

  const overheadConductorRemovedMeters = 180;
  const newUndergroundCableMeters = 240;

  return (
    <div className="w-full h-full overflow-y-auto bg-[#090F21] p-6 text-slate-100 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-mono font-bold uppercase">
                Workflow B • Upgrade Analysis
              </span>
              <span className="text-xs text-slate-400">BESCOM / KPTCL Modernization Standards</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Existing Conditions vs. Proposed Electrical Infrastructure Upgrade
            </h2>
          </div>

          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('side_by_side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'side_by_side' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveTab('delta_table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'delta_table' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Material &amp; Capacity Delta
            </button>
          </div>
        </div>

        {/* Tab 1: Side by Side Cards */}
        {activeTab === 'side_by_side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Infrastructure Card */}
            <div className="bg-[#0F172A] border border-rose-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                      Existing Site Conditions
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                    LEGACY OVERHEAD
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Aged overhead electrical distribution with bare ACSR rabbit conductors on concrete poles, exposed to monsoon tree branches, storm tripping, and aesthetic clutter.
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-rose-400 text-[18px]">warning</span>
                    <div>
                      <div className="font-bold text-slate-200">Bare ACSR Overhead Lines</div>
                      <div className="text-[11px] text-slate-400">High risk of electrocution, line snapping during storms, and power outages.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-rose-400 text-[18px]">electric_meter</span>
                    <div>
                      <div className="font-bold text-slate-200">Overloaded 100 kVA Transformer</div>
                      <div className="text-[11px] text-slate-400">Operates at &gt; 95% peak load during summer evenings, causing severe voltage drops.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-rose-400 text-[18px]">lightbulb</span>
                    <div>
                      <div className="font-bold text-slate-200">Inefficient 250W Sodium Lamps</div>
                      <div className="text-[11px] text-slate-400">Frequent bulb burnouts, dark spots on road corners, high monthly energy bill.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Power Reliability:</span>
                <span className="text-rose-400 font-bold">82.4% (Frequent Outages)</span>
              </div>
            </div>

            {/* Proposed Upgraded Infrastructure Card */}
            <div className="bg-[#0F172A] border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      Proposed Modern Infrastructure
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                    100% UNDERGROUND XLPE
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Complete conversion to underground 11kV HT and 415V LT armoured cables in RCC utility ducts, pad-mounted DTR with RMU, IP55 feeder pillars, and automated LED illumination.
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                    <div>
                      <div className="font-bold text-slate-200">Zero Overhead Wires (Underground Ducts)</div>
                      <div className="text-[11px] text-slate-400">100% weather-proof, storm resistant, zero electrocution risk, elevated property aesthetics.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">electric_bolt</span>
                    <div>
                      <div className="font-bold text-slate-200">{proposedSub?.capacity || '500 kVA'} Pad-Mounted Substation</div>
                      <div className="text-[11px] text-slate-400">Compact outdoor kiosk with Ring Main Unit (RMU) and SF6/vacuum circuit breakers.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">wb_incandescent</span>
                    <div>
                      <div className="font-bold text-slate-200">60W Smart Octagonal LED Lighting</div>
                      <div className="text-[11px] text-slate-400">Uniform 30 Lux road coverage, astronomical timer switching, 62% energy reduction.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Power Reliability:</span>
                <span className="text-emerald-400 font-bold">99.8% (Continuous Supply)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Material & Capacity Delta */}
        {activeTab === 'delta_table' && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400">difference</span>
              Infrastructure Quantification &amp; Upgrade Delta Schedule
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-2.5 pr-2">Infrastructure Item</th>
                    <th className="py-2.5 px-2">Existing State</th>
                    <th className="py-2.5 px-2">Proposed Modern State</th>
                    <th className="py-2.5 pl-2 text-right">Net Upgrade Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 pr-2 font-semibold text-slate-200">Distribution Transformer (DTR)</td>
                    <td className="py-3 px-2 text-rose-400 font-mono">100 kVA Pole Mounted</td>
                    <td className="py-3 px-2 text-emerald-400 font-mono">{project.meta.transformerRatingKva} kVA Pad Substation</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-sky-400">+{project.meta.transformerRatingKva - 100} kVA Capacity</td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 pr-2 font-semibold text-slate-200">Distribution Line Topology</td>
                    <td className="py-3 px-2 text-rose-400 font-mono">Overhead Bare ACSR ({overheadConductorRemovedMeters}m)</td>
                    <td className="py-3 px-2 text-emerald-400 font-mono">Underground XLPE Armoured ({newUndergroundCableMeters}m)</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-emerald-400">100% Underground</td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 pr-2 font-semibold text-slate-200">Concrete / Rusted Poles</td>
                    <td className="py-3 px-2 text-rose-400 font-mono">{existingPoles} Poles (Clutter)</td>
                    <td className="py-3 px-2 text-emerald-400 font-mono">0 Poles (Removed)</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-rose-400">-{existingPoles} Poles Dismantled</td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 pr-2 font-semibold text-slate-200">Feeder Pillars (400A IP55)</td>
                    <td className="py-3 px-2 text-slate-400 font-mono">0 (Direct T-offs)</td>
                    <td className="py-3 px-2 text-emerald-400 font-mono">{proposedPillars} Modern Feeder Pillars</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-sky-400">+{proposedPillars} New Units</td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 pr-2 font-semibold text-slate-200">Street Lighting Luminaires</td>
                    <td className="py-3 px-2 text-slate-400 font-mono">250W Sodium Vapor (8 units)</td>
                    <td className="py-3 px-2 text-emerald-400 font-mono">60W LED Octagonal ({proposedStreetlights} units)</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-emerald-400">62% Energy Savings</td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 pr-2 font-semibold text-slate-200">Technical Distribution Losses</td>
                    <td className="py-3 px-2 text-rose-400 font-mono">14.8% (Line heat &amp; joints)</td>
                    <td className="py-3 px-2 text-emerald-400 font-mono">3.2% (Low-loss XLPE)</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-emerald-400">-11.6% Losses Saved</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                • Complies with CEA (Measures Relating to Safety and Electric Supply) Regulations 2023.
              </div>
              {onOpenConsultation && (
                <button
                  onClick={() => onOpenConsultation(`Residential Layout Modernization: ${project.meta.projectName}`)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Request Turnkey Upgrade Proposal</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
