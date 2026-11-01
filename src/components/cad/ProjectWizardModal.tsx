import React, { useState } from 'react';
import { ResidentialProject, MeasurementUnit } from '../../types/residentialDesigner';
import {
  STANDARD_2BHK_PROJECT,
  COMPACT_2BHK_PROJECT,
  LUXURY_3BHK_PROJECT
} from '../../data/residentialPresets';

interface ProjectWizardModalProps {
  onClose: () => void;
  onApplyProject: (project: ResidentialProject) => void;
}

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  onClose,
  onApplyProject
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<'standard_2bhk' | 'compact_2bhk' | 'luxury_3bhk' | 'custom'>('standard_2bhk');

  // Form State
  const [projectName, setProjectName] = useState<string>('My Dream Home');
  const [customerName, setCustomerName] = useState<string>('Mr. Customer');
  const [location, setLocation] = useState<string>('Bengaluru, Karnataka');
  const [phone, setPhone] = useState<string>('+91 98450 00000');
  const [unit, setUnit] = useState<MeasurementUnit>('meters');

  const [plotWidth, setPlotWidth] = useState<number>(15.0);
  const [plotLength, setPlotLength] = useState<number>(12.0);
  const [floorHeight, setFloorHeight] = useState<number>(3.0);
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(6.0);
  const [supplyPhase, setSupplyPhase] = useState<'1-phase 230V' | '3-phase 415V'>('1-phase 230V');

  const [scopeLighting, setScopeLighting] = useState<boolean>(true);
  const [scopeHeavy, setScopeHeavy] = useState<boolean>(true);
  const [scopeAc, setScopeAc] = useState<boolean>(true);
  const [scopeSpd, setScopeSpd] = useState<boolean>(true);
  const [scopeEarth, setScopeEarth] = useState<boolean>(true);
  const [scopeSolar, setScopeSolar] = useState<boolean>(true);

  const handleSelectTemplate = (tmpl: 'standard_2bhk' | 'compact_2bhk' | 'luxury_3bhk' | 'custom') => {
    setSelectedTemplate(tmpl);
    if (tmpl === 'standard_2bhk') {
      setPlotWidth(15.0);
      setPlotLength(12.0);
      setSanctionedLoad(6.0);
      setSupplyPhase('1-phase 230V');
    } else if (tmpl === 'compact_2bhk') {
      setPlotWidth(12.0);
      setPlotLength(10.0);
      setSanctionedLoad(5.0);
      setSupplyPhase('1-phase 230V');
    } else if (tmpl === 'luxury_3bhk') {
      setPlotWidth(18.0);
      setPlotLength(15.0);
      setSanctionedLoad(10.0);
      setSupplyPhase('3-phase 415V');
    }
  };

  const handleCreateProject = () => {
    let base = STANDARD_2BHK_PROJECT;
    if (selectedTemplate === 'compact_2bhk') base = COMPACT_2BHK_PROJECT;
    if (selectedTemplate === 'luxury_3bhk') base = LUXURY_3BHK_PROJECT;

    const newProject: ResidentialProject = {
      ...base,
      id: `proj_${Date.now()}`,
      meta: {
        ...base.meta,
        projectName: projectName.trim() || 'Residential Electrical Project',
        customerName: customerName.trim() || 'Valued Customer',
        location: location.trim() || 'Bengaluru, Karnataka',
        contactPhone: phone,
        unit,
        plotWidth,
        plotLength,
        floorHeight,
        sanctionedLoadKw: sanctionedLoad,
        supplyPhase,
        date: new Date().toISOString().split('T')[0],
        scope: {
          lightingAndFans: scopeLighting,
          heavyAppliances: scopeHeavy,
          smartAutomation: true,
          surgeProtection: scopeSpd,
          chemicalEarthing: scopeEarth,
          solarRooftopReady: scopeSolar
        }
      }
    };

    onApplyProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Wizard Header */}
        <div className="px-6 py-4 bg-[#111C3A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-[24px]">architecture</span>
            </div>
            <div>
              <div className="text-base font-bold text-white">Create New Residential Electrical Project</div>
              <div className="text-xs text-slate-400">Ananya Smart 3D Parametric CAD & Simulation Setup</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="px-6 py-3 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono">1</span>
            <span>Customer & Site</span>
          </div>
          <div className="h-px w-10 bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono">2</span>
            <span>Plot & Layout</span>
          </div>
          <div className="h-px w-10 bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono">3</span>
            <span>Electrical Scope</span>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Project Name *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Greenwood Villa 2BHK"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Customer Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Shri R. Narasimha Rao"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Site Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Whitefield, Bengaluru"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Measurement Units</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUnit('meters')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      unit === 'meters' ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">Metric System (Meters)</div>
                      <div className="text-[10px] text-slate-400">Standard Indian IS:732 architectural CAD</div>
                    </div>
                    {unit === 'meters' && <span className="material-symbols-outlined text-sky-400">check_circle</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setUnit('feet')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      unit === 'feet' ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">Imperial System (Feet & Inches)</div>
                      <div className="text-[10px] text-slate-400">Feet, inches, and total sq.ft area</div>
                    </div>
                    {unit === 'feet' && <span className="material-symbols-outlined text-sky-400">check_circle</span>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-medium">Select Floor Plan Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => handleSelectTemplate('standard_2bhk')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'standard_2bhk'
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-sky-400">Standard 2BHK</div>
                    <div className="text-[11px] text-slate-300 mt-1">1,200 sq.ft (111 m²)</div>
                    <div className="text-[10px] text-slate-400 mt-1">Living, Modular Kitchen, 2 Beds, Bath, Foyer</div>
                  </div>

                  <div
                    onClick={() => handleSelectTemplate('compact_2bhk')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'compact_2bhk'
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-400">Compact 2BHK</div>
                    <div className="text-[11px] text-slate-300 mt-1">850 sq.ft (79 m²)</div>
                    <div className="text-[10px] text-slate-400 mt-1">Optimized urban layout with high-efficiency conduits</div>
                  </div>

                  <div
                    onClick={() => handleSelectTemplate('luxury_3bhk')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'luxury_3bhk'
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-400">Luxury 3BHK Villa</div>
                    <div className="text-[11px] text-slate-300 mt-1">1,850 sq.ft (172 m²)</div>
                    <div className="text-[10px] text-slate-400 mt-1">3-Phase 415V supply, formal living & pooja room</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Plot Width (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={plotWidth}
                    onChange={(e) => setPlotWidth(parseFloat(e.target.value) || 10)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Plot Length (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={plotLength}
                    onChange={(e) => setPlotLength(parseFloat(e.target.value) || 10)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Floor Height (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={floorHeight}
                    onChange={(e) => setFloorHeight(parseFloat(e.target.value) || 3.0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Supply Phase</label>
                  <select
                    value={supplyPhase}
                    onChange={(e) => setSupplyPhase(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="1-phase 230V">1-Phase 230V 50Hz (Domestic)</option>
                    <option value="3-phase 415V">3-Phase 415V 50Hz (Heavy / Villa)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Sanctioned Load (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="3"
                    max="30"
                    value={sanctionedLoad}
                    onChange={(e) => setSanctionedLoad(parseFloat(e.target.value) || 5)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-2 font-medium">Electrical Installation Scope</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={scopeLighting} onChange={(e) => setScopeLighting(e.target.checked)} className="rounded" />
                    <span>Concealed FRLS Lighting & BLDC Fans</span>
                  </label>
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={scopeHeavy} onChange={(e) => setScopeHeavy(e.target.checked)} className="rounded" />
                    <span>Heavy Kitchen Power & Geyser Outlets</span>
                  </label>
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={scopeAc} onChange={(e) => setScopeAc(e.target.checked)} className="rounded" />
                    <span>Dedicated Inverter AC Isolator Circuits</span>
                  </label>
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={scopeSpd} onChange={(e) => setScopeSpd(e.target.checked)} className="rounded" />
                    <span>Type 2 40kA Surge Diverter Protection</span>
                  </label>
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={scopeEarth} onChange={(e) => setScopeEarth(e.target.checked)} className="rounded" />
                    <span>IS:3043 Chemical Earth Pit (&lt; 1.0 Ohm)</span>
                  </label>
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={scopeSolar} onChange={(e) => setScopeSolar(e.target.checked)} className="rounded" />
                    <span>Rooftop Solar EPC Net-Metering Ready</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 bg-[#111C3A] border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
              <span>Generate 3D Model & CAD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
