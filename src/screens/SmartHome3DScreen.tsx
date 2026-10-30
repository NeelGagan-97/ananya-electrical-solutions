import React, { useState, useEffect, useMemo } from 'react';
import { NavigationTab, EngineeringInquiry } from '../types';
import {
  SmartHomeCanvas,
  SMART_HOME_DEVICES,
  SMART_HOME_CIRCUITS,
  SmartHomeSimulationState,
  SmartRoomId,
  SmartViewStage,
  AutomationScenarioId
} from '../three/SmartHomeCanvas';

interface SmartHome3DScreenProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenConsultation: (topic?: string) => void;
  onSaveInquiry?: (inquiry: EngineeringInquiry) => void;
}

type WorkspaceTab = '3d_twin' | 'floor_plan' | 'circuits';
type DockTab = 'view' | 'circuits' | 'controls' | 'specs';

interface SmartProjectPreset {
  id: string;
  projectName: string;
  typology: string;
  carpetAreaSqFt: number;
  supplyPhase: string;
  sanctionedLoadKw: number;
  conduitMeters: number;
  wireMeters: number;
  estimatedBoqInr: number;
}

const SMART_HOME_PRESETS: SmartProjectPreset[] = [
  {
    id: 'preset_2bhk',
    projectName: 'My Smart Home',
    typology: '2BHK Apartment',
    carpetAreaSqFt: 1150,
    supplyPhase: '1-phase 230V',
    sanctionedLoadKw: 7,
    conduitMeters: 42,
    wireMeters: 126,
    estimatedBoqInr: 184500
  },
  {
    id: 'preset_3bhk_villa',
    projectName: 'Ananya Luxury Villa',
    typology: '3BHK Smart Villa',
    carpetAreaSqFt: 1850,
    supplyPhase: '3-phase 415V',
    sanctionedLoadKw: 12,
    conduitMeters: 68,
    wireMeters: 214,
    estimatedBoqInr: 286000
  },
  {
    id: 'preset_retrofit',
    projectName: 'Urban Retrofit Suite',
    typology: 'Wireless Zigbee Retrofit',
    carpetAreaSqFt: 980,
    supplyPhase: '1-phase 230V',
    sanctionedLoadKw: 5,
    conduitMeters: 28,
    wireMeters: 88,
    estimatedBoqInr: 132000
  }
];

const AUTOMATION_SCENARIOS: {
  id: AutomationScenarioId;
  name: string;
  icon: string;
  badge: string;
  summary: string;
}[] = [
  {
    id: 'welcome',
    name: 'Welcome Home',
    icon: 'wb_twilight',
    badge: 'ARRIVAL SCENE',
    summary: 'Living & kitchen lights 85%, motorized curtains open, Living AC & BLDC fan ON, entrance unlocked.'
  },
  {
    id: 'movie',
    name: 'Movie Mode',
    icon: 'movie',
    badge: 'CINEMA AMBIENCE',
    summary: 'DALI cove dimmed to 25% cinema blue, motorized blackout curtains closed, AC & quiet fan active.'
  },
  {
    id: 'night',
    name: 'Night Mode',
    icon: 'bedtime',
    badge: 'SLEEP & PERIMETER',
    summary: 'Living & kitchen lights OFF, 20% warm bedroom night-path glow, curtains closed, perimeter armed.'
  },
  {
    id: 'away',
    name: 'Away Mode',
    icon: 'shield_lock',
    badge: 'ECO + ARMED',
    summary: 'All lighting & ACs disconnected, curtains closed for solar heat rejection, CCTV & smart lock armed.'
  }
];

const PREFERRED_AUTOMATION_OPTIONS = [
  'Smart DALI / Tunable Lighting & Scene Dimming',
  'Touch Glass Switchboards & KNX / Zigbee Bus',
  'Motorized Curtain & Blind Tracks',
  'Smart HVAC (AC & BLDC Fan) Climate Control',
  'Biometric Smart Door Lock, VDP & 4K PoE CCTV',
  'Complete Smart DB, Load Calculation & BOQ'
];

export const SmartHome3DScreen: React.FC<SmartHome3DScreenProps> = ({
  onSelectTab,
  onOpenConsultation,
  onSaveInquiry
}) => {
  // Active Project Preset
  const [projectPreset, setProjectPreset] = useState<SmartProjectPreset>(SMART_HOME_PRESETS[0]);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Top Workspace Mode ('3d_twin' | 'floor_plan' | 'circuits')
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('3d_twin');

  // Bottom Dock State
  const [activeDockTab, setActiveDockTab] = useState<DockTab>('view');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Modals State
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [showBoqModal, setShowBoqModal] = useState(false);

  // 3D Smart Home Simulation State (Defaulting to 'cutaway' X-Ray view matching user screenshot)
  const [simState, setSimState] = useState<SmartHomeSimulationState>({
    selectedRoom: 'overview',
    viewStage: 'cutaway',
    ceilingVisible: false,
    dbDoorOpen: false,
    activeCircuit: 'ALL',
    isAutoRotate: false,
    fanSpeed: 2,
    scenario: 'welcome',
    selectedDeviceId: 'dev_living_lights',
    roomLights: {
      living: true,
      bedroom: true,
      kitchen: true,
      bathroom: false
    },
    brightness: 85,
    curtains: {
      livingOpen: true,
      bedroomOpen: true
    },
    appliances: {
      livingAc: true,
      livingFan: true,
      bedroomAc: false,
      kitchenPower: true,
      bathroomGeyser: false
    },
    securityArmed: false,
    frontDoorLocked: true
  });

  // Enquiry Form State (inside Request Smart Home Design modal)
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyType, setPropertyType] = useState('3BHK / 4BHK Apartment');
  const [projectLocation, setProjectLocation] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Smart DALI / Tunable Lighting & Scene Dimming',
    'Touch Glass Switchboards & KNX / Zigbee Bus',
    'Motorized Curtain & Blind Tracks'
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Keyboard shortcut 'H' to collapse/expand bottom control dock (matching Residential3DScreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply Automation Scenario Preset
  const applyScenario = (scenarioId: AutomationScenarioId) => {
    if (scenarioId === 'welcome') {
      setSimState((prev) => ({
        ...prev,
        scenario: 'welcome',
        roomLights: { living: true, bedroom: true, kitchen: true, bathroom: false },
        brightness: 85,
        curtains: { livingOpen: true, bedroomOpen: true },
        appliances: {
          livingAc: true,
          livingFan: true,
          bedroomAc: false,
          kitchenPower: true,
          bathroomGeyser: false
        },
        fanSpeed: 2,
        securityArmed: false,
        frontDoorLocked: false
      }));
    } else if (scenarioId === 'away') {
      setSimState((prev) => ({
        ...prev,
        scenario: 'away',
        roomLights: { living: false, bedroom: false, kitchen: false, bathroom: false },
        brightness: 10,
        curtains: { livingOpen: false, bedroomOpen: false },
        appliances: {
          livingAc: false,
          livingFan: false,
          bedroomAc: false,
          kitchenPower: true, // Essential refrigerator loop stays ON
          bathroomGeyser: false
        },
        fanSpeed: 0,
        securityArmed: true,
        frontDoorLocked: true
      }));
    } else if (scenarioId === 'movie') {
      setSimState((prev) => ({
        ...prev,
        scenario: 'movie',
        selectedRoom: 'living',
        roomLights: { living: true, bedroom: false, kitchen: false, bathroom: false },
        brightness: 25,
        curtains: { livingOpen: false, bedroomOpen: false },
        appliances: {
          livingAc: true,
          livingFan: true,
          bedroomAc: false,
          kitchenPower: true,
          bathroomGeyser: false
        },
        fanSpeed: 1,
        securityArmed: true,
        frontDoorLocked: true
      }));
    } else if (scenarioId === 'night') {
      setSimState((prev) => ({
        ...prev,
        scenario: 'night',
        selectedRoom: 'bedroom',
        roomLights: { living: false, bedroom: true, kitchen: false, bathroom: true },
        brightness: 20,
        curtains: { livingOpen: false, bedroomOpen: false },
        appliances: {
          livingAc: false,
          livingFan: false,
          bedroomAc: true,
          kitchenPower: true,
          bathroomGeyser: false
        },
        fanSpeed: 1,
        securityArmed: true,
        frontDoorLocked: true
      }));
    }
  };

  // Selected Device & Circuit objects
  const selectedDevice = useMemo(
    () => SMART_HOME_DEVICES.find((d) => d.id === simState.selectedDeviceId) || SMART_HOME_DEVICES[0],
    [simState.selectedDeviceId]
  );

  const currentCircuit = useMemo(
    () => SMART_HOME_CIRCUITS.find((c) => c.id === simState.activeCircuit) || SMART_HOME_CIRCUITS[0],
    [simState.activeCircuit]
  );

  // Live Load Telemetry Calculation (Watts & Amps)
  const { runningWatts, runningAmps } = useMemo(() => {
    let watts = 24; // Base KNX Bus PSU + PoE NVR standby
    const scale = simState.brightness / 100;
    if (simState.roomLights.living) watts += Math.round(64 * scale);
    if (simState.roomLights.bedroom) watts += Math.round(42 * scale);
    if (simState.roomLights.kitchen) watts += Math.round(48 * scale);
    if (simState.roomLights.bathroom) watts += Math.round(36 * scale);
    if (simState.appliances.livingAc) watts += 1680;
    if (simState.appliances.livingFan && simState.fanSpeed > 0) watts += 10 * simState.fanSpeed;
    if (simState.appliances.bedroomAc) watts += 1220;
    if (simState.appliances.kitchenPower) watts += 280;
    if (simState.appliances.bathroomGeyser) watts += 2000;
    const amps = (watts / (230 * 0.95)).toFixed(1);
    return { runningWatts: watts, runningAmps: amps };
  }, [simState]);

  // Select a 3D Smart Device marker and open Equipment Specs tab in bottom dock
  const handleSelectDeviceFrom3D = (deviceId: string) => {
    const dev = SMART_HOME_DEVICES.find((d) => d.id === deviceId);
    setSimState((prev) => ({
      ...prev,
      selectedDeviceId: deviceId,
      activeCircuit: dev ? dev.circuitId : prev.activeCircuit
    }));
    setActiveDockTab('specs');
    setIsDockCollapsed(false);
  };

  // Toggle selected device state directly from Equipment Specs tab
  const handleToggleSelectedDevice = () => {
    const id = selectedDevice.id;
    setSimState((prev) => {
      const next = { ...prev, scenario: 'custom' as AutomationScenarioId };
      if (id === 'dev_living_lights' || id === 'dev_living_switch') {
        next.roomLights = { ...prev.roomLights, living: !prev.roomLights.living };
      } else if (id === 'dev_bedroom_lights' || id === 'dev_bedroom_switch' || id === 'dev_bedroom_sensor') {
        next.roomLights = { ...prev.roomLights, bedroom: !prev.roomLights.bedroom };
      } else if (id === 'dev_kitchen_lights') {
        next.roomLights = { ...prev.roomLights, kitchen: !prev.roomLights.kitchen };
      } else if (id === 'dev_bathroom_lights' || id === 'dev_bathroom_sensor') {
        next.roomLights = { ...prev.roomLights, bathroom: !prev.roomLights.bathroom };
      } else if (id === 'dev_living_curtain') {
        next.curtains = { ...prev.curtains, livingOpen: !prev.curtains.livingOpen };
      } else if (id === 'dev_bedroom_curtain') {
        next.curtains = { ...prev.curtains, bedroomOpen: !prev.curtains.bedroomOpen };
      } else if (id === 'dev_living_ac') {
        next.appliances = { ...prev.appliances, livingAc: !prev.appliances.livingAc };
      } else if (id === 'dev_living_fan') {
        const nextFan = !prev.appliances.livingFan;
        next.appliances = { ...prev.appliances, livingFan: nextFan };
        next.fanSpeed = nextFan ? Math.max(1, prev.fanSpeed) : 0;
      } else if (id === 'dev_bedroom_ac') {
        next.appliances = { ...prev.appliances, bedroomAc: !prev.appliances.bedroomAc };
      } else if (id === 'dev_kitchen_sockets' || id === 'dev_kitchen_fridge') {
        next.appliances = { ...prev.appliances, kitchenPower: !prev.appliances.kitchenPower };
      } else if (id === 'dev_bathroom_geyser') {
        next.appliances = { ...prev.appliances, bathroomGeyser: !prev.appliances.bathroomGeyser };
      } else if (id === 'dev_front_lock' || id === 'dev_living_cctv' || id === 'dev_kitchen_smoke') {
        next.frontDoorLocked = !prev.frontDoorLocked;
        next.securityArmed = !prev.securityArmed;
      }
      return next;
    });
  };

  // Export & Import JSON Configuration
  const handleExportJson = () => {
    const payload = {
      preset: projectPreset,
      simState,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${projectPreset.projectName.replace(/\s+/g, '_')}_SmartHome_Twin.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.preset) setProjectPreset(parsed.preset);
        if (parsed.simState) setSimState(parsed.simState);
      } catch (err) {
        console.warn('Invalid Smart Home JSON file', err);
      }
    };
    reader.readAsText(file);
  };

  // Toggle feature checkbox in Request Smart Home Design Modal
  const toggleFeatureOption = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  // Handle Request Smart Home Design form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !projectLocation.trim()) {
      setFormError('Please enter your name, phone number, and project location.');
      return;
    }
    setFormError('');

    const newInquiry: EngineeringInquiry = {
      id: `SH-${Date.now().toString().slice(-5)}`,
      name: customerName.trim(),
      phone: phone.trim(),
      email: 'smarthome@ananyaelectricals.in',
      category: 'Smart Home Automation Twin & Electrical Design',
      location: `${propertyType} (${projectLocation.trim()})`,
      loadDetails: `${projectPreset.supplyPhase}, ${(runningWatts / 1000).toFixed(2)} kW • Preferred Automation: ${selectedFeatures.join(', ')}. ${
        additionalNotes.trim() || 'Standard Turnkey Smart Home BOQ & 3D Twin'
      }`,
      timestamp: new Date().toISOString(),
      complianceConfirmed: true,
      preferredChannel: 'whatsapp'
    };

    if (onSaveInquiry) {
      onSaveInquiry(newInquiry);
    }
    setFormSubmitted(true);
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A1128] flex flex-col overflow-hidden select-none relative">
      {/* 1. Top Engineering Workspace Bar (Exact layout matching Residential3DScreen screenshot) */}
      <div className="h-14 bg-[#0F172A] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand & Project Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <span className="material-symbols-outlined text-[20px]">home_iot_device</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase font-['Space_Grotesk']">
                Ananya Smart Electrical Designer
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                IS:732 / KNX / DALI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {projectPreset.projectName} • {projectPreset.typology} ({projectPreset.carpetAreaSqFt} sq.ft) • {projectPreset.supplyPhase}
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-xl border border-slate-700/70">
          <button
            onClick={() => setWorkspaceTab('3d_twin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceTab === '3d_twin'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            <span>3D Digital Twin</span>
          </button>

          <button
            onClick={() => setWorkspaceTab('floor_plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceTab === 'floor_plan'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>2D Floor Plan CAD</span>
          </button>

          <button
            onClick={() => setWorkspaceTab('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workspaceTab === 'circuits'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span className="hidden md:inline">Circuits &amp; Simulation</span>
          </button>

          <button
            onClick={() => setShowBoqModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-amber-300 hover:bg-amber-500/15 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span className="hidden md:inline">BOQ (₹{projectPreset.estimatedBoqInr.toLocaleString('en-IN')})</span>
          </button>
        </div>

        {/* Right: Actions (New Project / Design Request, Templates, Export/Import, Substation Twin) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDesignModal(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span className="hidden lg:inline">+ New Project</span>
          </button>

          {/* Preset Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-amber-400">folder_open</span>
              <span className="hidden xl:inline">Templates</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showPresetDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-slate-200">
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  Load Smart Home Template
                </div>
                {SMART_HOME_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setProjectPreset(preset);
                      setShowPresetDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-800 text-xs flex flex-col ${
                      idx > 0 ? 'border-t border-slate-800' : ''
                    }`}
                  >
                    <span className={`font-bold ${idx === 1 ? 'text-amber-400' : 'text-sky-400'}`}>
                      {preset.typology} ({preset.carpetAreaSqFt} sq.ft)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {preset.supplyPhase} • KNX/DALI Bus + Smart DB
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Export Project JSON"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>

          {/* Import JSON */}
          <label
            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Import Project JSON"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Switch to Substation Twin */}
          <button
            onClick={() => onSelectTab('twin-3d')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="Open 33kV Substation & Solar Yard Twin"
          >
            <span className="material-symbols-outlined text-[16px]">solar_power</span>
            <span>Substation Twin</span>
          </button>
        </div>
      </div>

      {/* 2. Workspace Body */}
      <div className="flex-1 relative overflow-hidden">
        {/* TAB 1: 3D DIGITAL TWIN */}
        {workspaceTab === '3d_twin' && (
          <div className="w-full h-full relative">
            <SmartHomeCanvas
              simState={simState}
              onSelectDevice={handleSelectDeviceFrom3D}
              onSelectRoom={(rm) => setSimState((prev) => ({ ...prev, selectedRoom: rm }))}
            />

            {/* Top-Left Engineering HUD (Exact match to screenshot) */}
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
                    {projectPreset.supplyPhase}
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
                  <span>Conduits: {projectPreset.conduitMeters}m PVC</span>
                  <span>FRLS Copper: {projectPreset.wireMeters}m</span>
                </div>
              </div>

              {/* One-Touch Automation Scene Strip below Telemetry Card */}
              <div className="bg-[#0F172A]/90 backdrop-blur border border-slate-700/80 rounded-xl p-2 shadow-xl flex items-center gap-1">
                {AUTOMATION_SCENARIOS.map((sc) => {
                  const active = simState.scenario === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => applyScenario(sc.id)}
                      className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        active
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={sc.summary}
                    >
                      <span className="material-symbols-outlined text-[13px]">{sc.icon}</span>
                      <span className="truncate">{sc.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Top-Right Camera & Quote Controls (Exact match to screenshot) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() =>
                  setSimState((prev) => ({ ...prev, isAutoRotate: !prev.isAutoRotate }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  simState.isAutoRotate
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-[#0F172A]/90 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toggle camera auto-orbit"
              >
                <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
                <span className="hidden sm:inline">Auto-Orbit</span>
              </button>

              <button
                onClick={() => setShowDesignModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Get Installation Quote</span>
              </button>
            </div>

            {/* Bottom Floating Control Dock (Exact match to screenshot) */}
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
                    {(
                      ['overview', 'db', 'living', 'bedroom', 'kitchen', 'bathroom', 'earth_pit'] as SmartRoomId[]
                    ).map((cp) => (
                      <button
                        key={cp}
                        onClick={() => setSimState((prev) => ({ ...prev, selectedRoom: cp }))}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors uppercase cursor-pointer ${
                          simState.selectedRoom === cp
                            ? 'bg-slate-700 text-sky-400 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
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
                        onClick={() =>
                          setSimState((prev) => ({ ...prev, viewStage: 'finished' as SmartViewStage }))
                        }
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          simState.viewStage === 'finished'
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Finished Interior
                      </button>
                      <button
                        onClick={() =>
                          setSimState((prev) => ({ ...prev, viewStage: 'cutaway' as SmartViewStage }))
                        }
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          simState.viewStage === 'cutaway'
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Cutaway X-Ray (Concealed PVC)
                      </button>
                      <button
                        onClick={() =>
                          setSimState((prev) => ({ ...prev, viewStage: 'construction' as SmartViewStage }))
                        }
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          simState.viewStage === 'construction'
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Construction Pre-Plaster (Chasing)
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simState.ceilingVisible}
                          onChange={(e) =>
                            setSimState((prev) => ({ ...prev, ceilingVisible: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <span>Ceiling Slab</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simState.dbDoorOpen}
                          onChange={(e) =>
                            setSimState((prev) => ({ ...prev, dbDoorOpen: e.target.checked }))
                          }
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
                    {SMART_HOME_CIRCUITS.map((circ) => {
                      const isSel = simState.activeCircuit === circ.id;
                      return (
                        <button
                          key={circ.id}
                          onClick={() =>
                            setSimState((prev) => ({
                              ...prev,
                              activeCircuit: circ.id,
                              viewStage: prev.viewStage === 'finished' ? 'cutaway' : prev.viewStage
                            }))
                          }
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
                          <span>
                            {circ.code}: {circ.name.split(' ')[0]} {circ.name.split(' ')[1]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TAB CONTENT: Appliance & Smart Automation Toggles */}
                {activeDockTab === 'controls' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    {/* Room Lighting Toggles */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Lights:</span>
                      {(['living', 'bedroom', 'kitchen', 'bathroom'] as const).map((rm) => {
                        const on = simState.roomLights[rm];
                        return (
                          <button
                            key={rm}
                            onClick={() =>
                              setSimState((prev) => ({
                                ...prev,
                                scenario: 'custom',
                                roomLights: { ...prev.roomLights, [rm]: !prev.roomLights[rm] }
                              }))
                            }
                            className={`px-2 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                              on ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {rm}
                          </button>
                        );
                      })}
                    </div>

                    {/* Motorized Curtains Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Curtains:</span>
                      <button
                        onClick={() =>
                          setSimState((prev) => ({
                            ...prev,
                            scenario: 'custom',
                            curtains: {
                              ...prev.curtains,
                              livingOpen: !prev.curtains.livingOpen
                            }
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          simState.curtains.livingOpen
                            ? 'bg-teal-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Living: {simState.curtains.livingOpen ? 'OPEN' : 'CLOSED'}
                      </button>
                      <button
                        onClick={() =>
                          setSimState((prev) => ({
                            ...prev,
                            scenario: 'custom',
                            curtains: {
                              ...prev.curtains,
                              bedroomOpen: !prev.curtains.bedroomOpen
                            }
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          simState.curtains.bedroomOpen
                            ? 'bg-teal-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Bed: {simState.curtains.bedroomOpen ? 'OPEN' : 'CLOSED'}
                      </button>
                    </div>

                    {/* BLDC Fan Speed */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">BLDC Fan:</span>
                      {[0, 1, 2, 3].map((spd) => (
                        <button
                          key={spd}
                          onClick={() =>
                            setSimState((prev) => ({
                              ...prev,
                              fanSpeed: spd,
                              appliances: { ...prev.appliances, livingFan: spd > 0 }
                            }))
                          }
                          className={`px-2 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                            simState.fanSpeed === spd
                              ? 'bg-sky-500 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd === 0 ? 'OFF' : `S${spd}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Equipment Specs */}
                {activeDockTab === 'specs' && (
                  <div className="text-xs text-slate-300 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="font-bold text-sky-400 flex items-center gap-2">
                        <span>{selectedDevice.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">
                          {selectedDevice.powerRating}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Protocol: <span className="text-slate-200">{selectedDevice.protocol}</span> • Cable:{' '}
                        <span className="text-slate-200">{selectedDevice.cableSpec}</span> • Protection:{' '}
                        <span className="text-slate-200">{selectedDevice.breakerSpec}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{selectedDevice.description}</div>
                    </div>

                    {selectedDevice.isControllable && (
                      <button
                        onClick={handleToggleSelectedDevice}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-colors"
                      >
                        Toggle Device State
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 2D SMART FLOOR PLAN CAD SCHEMATIC */}
        {workspaceTab === 'floor_plan' && (
          <div className="w-full h-full overflow-y-auto bg-[#090F21] p-6 text-slate-100">
            <div className="max-w-6xl mx-auto space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-400">grid_view</span>
                    2D Smart Home Automation &amp; KNX Bus CAD Layout
                  </h2>
                  <p className="text-xs text-slate-400">
                    Click any smart device node on the architectural floor plan to inspect its circuit, cable specification, and live state.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWorkspaceTab('3d_twin')}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                    <span>Back to 3D Twin</span>
                  </button>
                </div>
              </div>

              {/* Interactive 2D Architectural Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      [
                        {
                          id: 'living',
                          title: 'LIVING & MEDIA LOUNGE',
                          dims: '5.6m × 4.1m',
                          zone: 'Zone 01 • DALI + Somfy Track',
                          lightOn: simState.roomLights.living
                        },
                        {
                          id: 'kitchen',
                          title: 'SMART MODULAR KITCHEN',
                          dims: '5.6m × 4.1m',
                          zone: 'Zone 03 • 16A Energy Hub + LPG Interlock',
                          lightOn: simState.roomLights.kitchen
                        },
                        {
                          id: 'bedroom',
                          title: 'MASTER BEDROOM SUITE',
                          dims: '5.6m × 4.1m',
                          zone: 'Zone 02 • Circadian Dimming + Blackout Track',
                          lightOn: simState.roomLights.bedroom
                        },
                        {
                          id: 'bathroom',
                          title: 'WET-ZONE BATHROOM (IP65)',
                          dims: '5.6m × 4.1m',
                          zone: 'Zone 04 • 10mA RCCB + 20A DP Geyser',
                          lightOn: simState.roomLights.bathroom
                        }
                      ] as const
                    ).map((rm) => {
                      const roomDevices = SMART_HOME_DEVICES.filter((d) => d.room === rm.id);
                      return (
                        <div
                          key={rm.id}
                          className={`rounded-xl border p-4 transition-all ${
                            rm.lightOn
                              ? 'bg-slate-900/90 border-sky-500/40 shadow-inner'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                            <div>
                              <div className="text-xs font-bold text-white">{rm.title}</div>
                              <div className="text-[10px] font-mono text-sky-400">{rm.zone}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                              {rm.dims}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {roomDevices.map((dev) => {
                              const isSel = simState.selectedDeviceId === dev.id;
                              return (
                                <button
                                  key={dev.id}
                                  onClick={() =>
                                    setSimState((prev) => ({ ...prev, selectedDeviceId: dev.id }))
                                  }
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                    isSel
                                      ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="truncate pr-2">{dev.name}</span>
                                  <span className="text-[10px] font-mono text-amber-400 shrink-0">
                                    {dev.circuitId}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Point Engineering Inspector */}
                <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 mb-1">
                      CAD Node Inspector
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{selectedDevice.name}</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {selectedDevice.description}
                    </p>

                    <div className="space-y-2 text-xs font-mono bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Room Zone:</span>
                        <span className="text-white uppercase">{selectedDevice.room}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bus Protocol:</span>
                        <span className="text-emerald-400">{selectedDevice.protocol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Connected Load:</span>
                        <span className="text-amber-400">{selectedDevice.powerRating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cable Spec:</span>
                        <span className="text-slate-200">{selectedDevice.cableSpec}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">DB Protection:</span>
                        <span className="text-sky-400">{selectedDevice.breakerSpec}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSimState((prev) => ({
                          ...prev,
                          selectedRoom: selectedDevice.room
                        }));
                        setWorkspaceTab('3d_twin');
                      }}
                      className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Locate Device in 3D Digital Twin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CIRCUITS & LIVE SIMULATION DASHBOARD */}
        {workspaceTab === 'circuits' && (
          <div className="w-full h-full overflow-y-auto bg-[#090F21] p-6 text-slate-100">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">electric_bolt</span>
                    Smart Home Electrical Circuit &amp; KNX Bus Schedule
                  </h2>
                  <p className="text-xs text-slate-400">
                    Compliant with IS:732 (Wiring Code), IEC 61439 (Smart DB), &amp; KNX/DALI-2 Bus Standards
                  </p>
                </div>

                <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-sky-400">
                  Sanctioned Load: {projectPreset.sanctionedLoadKw} kW @ {projectPreset.supplyPhase}
                </div>
              </div>

              {/* Circuits Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SMART_HOME_CIRCUITS.filter((c) => c.id !== 'ALL').map((circ) => {
                  const connectedDevs = SMART_HOME_DEVICES.filter((d) => d.circuitId === circ.id);
                  const totalWatts = connectedDevs.reduce((acc, d) => acc + d.powerWatts, 0);
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
                            <span className="text-[10px] text-slate-400 block">Conductor / Bus:</span>
                            <span className="text-slate-200 font-semibold">{circ.wireType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Conduit Size:</span>
                            <span className="text-slate-200 font-semibold">{circ.conduitSize}</span>
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
                        <span>Connected Smart Nodes: {connectedDevs.length} devices</span>
                        <button
                          onClick={() => {
                            setSimState((prev) => ({
                              ...prev,
                              activeCircuit: circ.id,
                              viewStage: 'cutaway'
                            }));
                            setActiveDockTab('circuits');
                            setWorkspaceTab('3d_twin');
                          }}
                          className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                        >
                          Trace in 3D →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Engineering & Planning Features Checklist */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
                  Smart Home Engineering &amp; Planning Architecture (IS:732 / KNX / DALI-2)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">✓ Segregated Power &amp; KNX Bus</div>
                    <div className="text-slate-400 text-[11px]">
                      300mm clearance between 230V FRLS power conduits and screened KNX/CAT6A automation cables.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">✓ Deep 55mm Smart Wall Boxes</div>
                    <div className="text-slate-400 text-[11px]">
                      Pre-planned GI flush boxes with neutral looping at every switchboard and curtain motor end.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1">✓ Type-2 SPD &amp; 30mA/10mA RCCB</div>
                    <div className="text-slate-400 text-[11px]">
                      Protects sensitive dimming actuators and touch panels against grid surges and wet-zone leakage.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODAL: Smart Home BOQ & Electrical Load Schedule */}
      {showBoqModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">receipt_long</span>
                  Smart Home Automation Bill of Quantities (BOQ) — {projectPreset.typology}
                </h3>
                <p className="text-xs text-slate-400">
                  Turnkey Electrical Wiring + KNX/Zigbee Smart Automation Estimate ({projectPreset.carpetAreaSqFt} sq.ft)
                </p>
              </div>
              <button
                onClick={() => setShowBoqModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs mb-5">
              {[
                {
                  item: 'Smart Touch Glass Switchboards & KNX/Zigbee Actuators (Living, Bed, Kitchen, Bath)',
                  qty: '14 Panels',
                  cost: '₹68,000'
                },
                {
                  item: 'DALI-2 Tunable White Architectural Cove LEDs & COB Spotlights with Drivers',
                  qty: '28 Fixtures',
                  cost: '₹54,500'
                },
                {
                  item: 'Somfy Quiet Motorized Curtain Tracks (Living & Master Bedroom Blackout)',
                  qty: '2 Tracks',
                  cost: '₹36,000'
                },
                {
                  item: 'Biometric Smart Door Lock, Video Door Phone & 4K PoE CCTV Security Kit',
                  qty: '1 Lot',
                  cost: '₹42,000'
                },
                {
                  item: '12-Way TPN Smart Distribution Board with RCCBs, MCBs, Type-2 SPD & FRLS Conduits',
                  qty: `${projectPreset.wireMeters}m FRLS`,
                  cost: '₹48,000'
                }
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800"
                >
                  <span className="text-slate-200 font-medium">{row.item}</span>
                  <div className="flex items-center gap-4 font-mono shrink-0">
                    <span className="text-slate-400">{row.qty}</span>
                    <span className="text-amber-400 font-bold">{row.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Estimated Turnkey Package:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  ₹{projectPreset.estimatedBoqInr.toLocaleString('en-IN')} (incl. IS:732 Testing &amp; Commissioning)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowBoqModal(false);
                    setShowDesignModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Request Custom Smart Home Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: Request a Smart Home Design / Enquiry Form */}
      {showDesignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400">architecture</span>
                  Request a Smart Home Automation Design &amp; Quote
                </h3>
                <p className="text-xs text-slate-400">
                  Get a customized 3D electrical layout, switchboard schedule, and automation BOQ for your residence.
                </p>
              </div>
              <button
                onClick={() => setShowDesignModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <span className="material-symbols-outlined text-[36px] text-emerald-400">verified</span>
                <h4 className="text-base font-bold text-white">
                  Smart Home Design Request Registered!
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Thank you, <span className="font-bold text-white">{customerName}</span>. Our Senior Automation Engineer will contact you on{' '}
                  <span className="font-mono text-emerald-300">{phone}</span> to review your {propertyType} floor plan in {projectLocation}.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setShowDesignModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Return to 3D Digital Twin
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {formError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g., Rajesh Sharma"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Property Type *</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="2BHK Apartment">2BHK Apartment</option>
                      <option value="3BHK / 4BHK Apartment">3BHK / 4BHK Apartment</option>
                      <option value="Independent Luxury Villa / Duplex">Independent Luxury Villa / Duplex</option>
                      <option value="Penthouse / Renovation Retrofit">Penthouse / Renovation Retrofit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Project Location *</label>
                    <input
                      type="text"
                      required
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g., Whitefield, Bengaluru"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Preferred Automation Features
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PREFERRED_AUTOMATION_OPTIONS.map((feat) => {
                      const checked = selectedFeatures.includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeatureOption(feat)}
                          className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                            checked
                              ? 'bg-sky-500/20 border-sky-400 text-white font-semibold'
                              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px] text-sky-400">
                            {checked ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span className="truncate">{feat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Additional Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Construction stage (pre-slab, brick chasing, or retrofit), home theatre rooms, solar backup..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenConsultation('Smart Home Automation Twin & Turnkey Wiring')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Open General Consultation
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-md"
                  >
                    Submit Smart Home Design Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
