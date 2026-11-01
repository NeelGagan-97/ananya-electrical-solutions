import React, { useState, useEffect } from 'react';
import {
  SubstationCanvas,
  CameraPreset,
  VisualMode
} from '../three/SubstationCanvas';
import { NavigationTab } from '../types';

interface Substation3DScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (serviceTopic?: string) => void;
  onSwitchToResidential?: () => void;
}

interface ComponentSpec {
  id: string;
  name: string;
  category: string;
  rating: string;
  compliance: string;
  description: string;
  specs: { label: string; value: string }[];
}

const COMPONENT_SPECS: Record<string, ComponentSpec> = {
  transformer: {
    id: 'transformer',
    name: '1,250 kVA 33kV/433V Power Transformer',
    category: 'High Voltage Transformation',
    rating: '1,250 kVA • 33 kV Primary / 433 V Secondary',
    compliance: 'CEIG Karnataka & BESCOM Approved (IS 2026 / IEC 60076)',
    description: 'Custom-engineered outdoor oil-immersed step-down power transformer. Fitted with detachable radiator banks, conservator expansion drum with Buchholz relay, silica gel breather, and off-circuit tap changer.',
    specs: [
      { label: 'Cooling Class', value: 'ONAN (Oil Natural Air Natural)' },
      { label: 'Vector Group', value: 'Dyn11 (Delta/Star Neutral)' },
      { label: 'Core Material', value: 'Low-loss CRGO Silicon Steel' },
      { label: 'Winding Material', value: 'Electrolytic High-Purity Copper' },
      { label: 'Protection', value: 'Buchholz Relay + Oil Temp Indicator (OTI/WTI)' }
    ]
  },
  breaker: {
    id: 'breaker',
    name: '33kV Outdoor Vacuum Circuit Breaker (VCB)',
    category: 'Switchgear & Fault Interruption',
    rating: '1,250 A Continuous • 25 kA Breaking Capacity',
    compliance: 'IEC 62271-100 & KPTCL / Discom Grid Code',
    description: 'Heavy-duty porcelain clad vacuum circuit breaker mounted on galvanized steel structural tower. Incorporates motorized spring-charged closing mechanism with instantaneous overcurrent and earth fault protection trips.',
    specs: [
      { label: 'Operating Voltage', value: '33 kV Nominal / 36 kV Max' },
      { label: 'Interrupting Medium', value: 'Hermetically Sealed Vacuum Bottle' },
      { label: 'Operating Sequence', value: 'O - 0.3s - CO - 3min - CO' },
      { label: 'Insulation Level', value: '70 kV RMS / 170 kV Peak Lightning' },
      { label: 'Earthing Interlock', value: 'Fail-safe mechanical interlock' }
    ]
  },
  solar: {
    id: 'solar',
    name: '500 kWp Commercial Solar PV Array & Inverter',
    category: 'Clean Renewable EPC',
    rating: '500 kWp DC Field • 400 kVA AC Inverter Dispatch',
    compliance: 'MNRE & BESCOM Net-Metering Sanctioned',
    description: 'Utility-grade ground-mounted tracking array utilizing bifacial TOPCon photovoltaic modules. Generates high-yield clean electricity connected to grid-tie string inverters with automated cloud SCADA monitoring.',
    specs: [
      { label: 'Module Tech', value: 'N-Type Bifacial TOPCon 580W' },
      { label: 'Tracker Mechanism', value: 'Single-Axis Motorized Slew Drive' },
      { label: 'Inverter Efficiency', value: '98.8% Peak European Efficiency' },
      { label: 'Grid Export', value: 'Dedicated 11kV/33kV Step-up Bay' },
      { label: 'Annual Generation', value: '~780,000 kWh / Year Clean Energy' }
    ]
  },
  metering: {
    id: 'metering',
    name: '33kV HT Metering Unit & Lightning Protection Mast',
    category: 'Statutory Tariff & Grid Safety',
    rating: 'Class 0.2s High-Accuracy Revenue Metering',
    compliance: 'KERC Regulations & Discom Tamper-Proof Standards',
    description: 'Combined outdoor CT/PT unit in oil-cooled porcelain design paired with high-voltage lightning surge arrestor mast providing 60-degree protective cone for the switchyard.',
    specs: [
      { label: 'CT Ratio & Class', value: '25-50/5-5A, Accuracy Class 0.2s' },
      { label: 'PT Ratio & Burden', value: '33000/√3 / 110/√3 V, 50VA Cl 0.2' },
      { label: 'Arrestor Type', value: 'Gapless Metal Oxide (ZnO) 30kV' },
      { label: 'Earth Resistance', value: '< 1.0 Ohm (Maintenance-Free Earth Pit)' },
      { label: 'Enclosure', value: 'Double-padlocked tamper-evident box' }
    ]
  }
};

export const Substation3DScreen: React.FC<Substation3DScreenProps> = ({
  onSelectTab,
  onOpenConsultation,
  onSwitchToResidential
}) => {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [explodedRatio, setExplodedRatio] = useState<number>(0);
  const [visualMode, setVisualMode] = useState<VisualMode>('pbr');
  const [breakerClosed, setBreakerClosed] = useState<boolean>(true);
  const [solarTilt, setSolarTilt] = useState<number>(15);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [selectedCompId, setSelectedCompId] = useState<string>('transformer');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<'camera' | 'exploded' | 'modes' | 'specs'>('camera');

  // Keyboard shortcut 'H' to toggle dock collapse
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

  const currentSpec = COMPONENT_SPECS[selectedCompId] || COMPONENT_SPECS.transformer;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-[#0f172a] select-none">
      {/* 1. Full-Bleed 3D WebGL Canvas */}
      <SubstationCanvas
        cameraPreset={cameraPreset}
        explodedRatio={explodedRatio}
        visualMode={visualMode}
        breakerClosed={breakerClosed}
        solarTilt={solarTilt}
        isAutoRotate={isAutoRotate}
        onSelectComponent={handleSelectComponentFrom3D}
      />

      {/* 2. Minimal Top Spec Badge (Pinned Top-Left, zero center obstruction) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm sm:max-w-md pointer-events-auto">
        <div className="bg-[#1e293b]/90 border border-[#334155] rounded-xl p-3.5 shadow-xl text-white">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span className="font-mono text-[11px] font-semibold tracking-wider text-[#38bdf8] uppercase">
                3D Substation Model • Live Simulation
              </span>
            </div>
            <button
              onClick={() => onSelectTab('home')}
              className="text-[#94a3b8] hover:text-white text-[12px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Exit
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            33kV Substation
          </h2>

          <p className="text-[12px] text-[#cbd5e1] mt-1 leading-snug">
            33kV/11kV Power Transformer • Outdoor Vacuum Circuit Breaker • Statutory CT/PT Metering Plinth
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-[#334155]/80 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#0f172a] text-[#facc15] font-mono border border-[#475569]">
              Grid: 33,000 V
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0f172a] text-[#34d399] font-mono border border-[#475569]">
              Status: {breakerClosed ? 'ENERGIZED / CLOSED' : 'TRIPPED / ISOLATED'}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0f172a] text-[#94a3b8] font-mono border border-[#475569]">
              BESCOM / CEIG IS:2026
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Quick Controls: Switcher, Rotate & Request Quote */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        {onSwitchToResidential && (
          <button
            onClick={onSwitchToResidential}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-[#34d399]/50"
            title="Switch to Residential 2BHK Interior"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Residential 2BHK Interior</span>
          </button>
        )}
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            isAutoRotate
              ? 'bg-[#0284c7] text-white border-[#38bdf8]'
              : 'bg-[#1e293b]/90 text-[#cbd5e1] border-[#334155] hover:text-white'
          }`}
          title="Toggle camera auto-orbit"
        >
          <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
          <span className="hidden sm:inline">Auto-Orbit</span>
        </button>

        <button
          onClick={() => onOpenConsultation(`33kV Substation: ${currentSpec.name}`)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#f59e0b] hover:bg-[#d97706] text-[#0f172a] shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>Request Quote</span>
        </button>
      </div>

      {/* 3. Unified Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className="absolute z-30 transition-transform duration-300 ease-out"
        style={{
          bottom: '20px',
          left: '50%',
          transform: isDockCollapsed
            ? 'translateX(-50%) translateY(calc(100% - 38px))'
            : 'translateX(-50%) translateY(0)',
          maxWidth: 'min(940px, 94vw)',
          width: '100%'
        }}
      >
        {/* Collapse / Expand Toggle Button centered on top edge */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-4 py-1 rounded-t-xl bg-[#1e293b] border-t border-x border-[#475569] text-xs font-medium text-[#cbd5e1] hover:text-white shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isDockCollapsed ? 'expand_less' : 'expand_more'}
            </span>
            <span>{isDockCollapsed ? 'Show Controls (H)' : 'Collapse Controls (H)'}</span>
          </button>
        </div>

        {/* Main Dock Container: Solid dark slate PBR surface (no backdrop-filter over WebGL) */}
        <div className="bg-[#1e293b] border border-[#475569] rounded-2xl shadow-2xl p-4 text-white overflow-hidden">
          {/* Dock Tab Selector */}
          <div className="flex items-center justify-between border-b border-[#334155] pb-2.5 mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveDockTab('camera')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeDockTab === 'camera'
                    ? 'bg-[#0284c7] text-white'
                    : 'bg-[#0f172a]/60 text-[#94a3b8] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">videocam</span>
                <span>Camera Views</span>
              </button>

              <button
                onClick={() => setActiveDockTab('exploded')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeDockTab === 'exploded'
                    ? 'bg-[#0284c7] text-white'
                    : 'bg-[#0f172a]/60 text-[#94a3b8] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">layers</span>
                <span>Exploded View</span>
              </button>

              <button
                onClick={() => setActiveDockTab('modes')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeDockTab === 'modes'
                    ? 'bg-[#0284c7] text-white'
                    : 'bg-[#0f172a]/60 text-[#94a3b8] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">tune</span>
                <span>Operating Modes</span>
              </button>

              <button
                onClick={() => setActiveDockTab('specs')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeDockTab === 'specs'
                    ? 'bg-[#0284c7] text-white'
                    : 'bg-[#0f172a]/60 text-[#94a3b8] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">info</span>
                <span>Engineering Specs</span>
              </button>
            </div>

            {/* Quick Breaker Trip / Energize Switch */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] text-[#94a3b8] hidden md:inline">Breaker:</span>
              <button
                onClick={() => setBreakerClosed(!breakerClosed)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  breakerClosed
                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                    : 'bg-[#16a34a] hover:bg-[#15803d] text-white'
                }`}
                title="Trip or Close the high voltage Vacuum Circuit Breaker"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {breakerClosed ? 'power_settings_new' : 'bolt'}
                </span>
                <span>{breakerClosed ? 'Trip Breaker' : 'Close & Energize'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Camera Presets */}
          {activeDockTab === 'camera' && (
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {[
                { id: 'overview', label: 'Yard Overview', icon: 'grid_view' },
                { id: 'transformer', label: 'Power Transformer', icon: 'electric_meter' },
                { id: 'breaker', label: 'Vacuum Circuit Breaker', icon: 'shield' },
                { id: 'metering', label: 'Statutory Metering', icon: 'assignment' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCameraPreset(item.id as CameraPreset);
                    if (item.id !== 'overview') {
                      setSelectedCompId(item.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                    cameraPreset === item.id
                      ? 'bg-[#0284c7] text-white border-[#38bdf8] shadow-md'
                      : 'bg-[#0f172a]/80 text-[#cbd5e1] border-[#334155] hover:border-[#64748b] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: Exploded View Slider */}
          {activeDockTab === 'exploded' && (
            <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#cbd5e1] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">build</span>
                    Transformer Internal Core &amp; Conservator Layer Separation
                  </span>
                  <span className="font-mono text-[#38bdf8] font-bold">
                    {Math.round(explodedRatio * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedRatio}
                  onChange={(e) => {
                    setExplodedRatio(parseFloat(e.target.value));
                    setCameraPreset('transformer');
                  }}
                  className="w-full h-2 bg-[#0f172a] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setExplodedRatio(0);
                    setCameraPreset('transformer');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f172a] border border-[#334155] text-xs text-[#cbd5e1] hover:text-white cursor-pointer"
                >
                  Assembled (0%)
                </button>
                <button
                  onClick={() => {
                    setExplodedRatio(0.85);
                    setCameraPreset('transformer');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f172a] border border-[#334155] text-xs text-[#cbd5e1] hover:text-white cursor-pointer"
                >
                  Exploded (85%)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Operating Modes */}
          {activeDockTab === 'modes' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1 flex-wrap">
              {/* Visual Modes */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94a3b8]">Lighting / Shader:</span>
                {[
                  { id: 'pbr', label: 'Standard PBR', icon: 'light_mode' },
                  { id: 'energized', label: 'Live Power Flow', icon: 'bolt' },
                  { id: 'thermal', label: 'Thermal IR Scan', icon: 'thermostat' },
                  { id: 'night', label: 'Night Lighting', icon: 'dark_mode' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setVisualMode(mode.id as VisualMode)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                      visualMode === mode.id
                        ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                        : 'bg-[#0f172a] text-[#cbd5e1] border-[#334155] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{mode.icon}</span>
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Selected Equipment Specifications */}
          {activeDockTab === 'specs' && (
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 py-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#0284c7]/30 text-[#38bdf8] text-[11px] font-semibold uppercase">
                    {currentSpec.category}
                  </span>
                  <span className="text-xs text-[#94a3b8]">{currentSpec.rating}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{currentSpec.name}</h4>
                <p className="text-xs text-[#cbd5e1] leading-relaxed line-clamp-2">
                  {currentSpec.description}
                </p>
              </div>

              {/* Technical key-value tags */}
              <div className="flex flex-wrap gap-2 max-w-md">
                {currentSpec.specs.slice(0, 4).map((s, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1 rounded bg-[#0f172a] border border-[#334155] text-[11px] flex flex-col"
                  >
                    <span className="text-[#94a3b8] text-[10px] uppercase font-mono">{s.label}</span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onOpenConsultation(`3D Spec: ${currentSpec.name}`)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 self-center md:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">draw</span>
                <span>Get SLD &amp; Drawing</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
