import React, { useState } from 'react';
import { ResidentialLayoutProject, LayoutWorkflowType } from '../../types/layoutDesigner';
import {
  GREENFIELD_ENCLAVE_PROJECT,
  HERITAGE_ENCLAVE_UPGRADE_PROJECT
} from '../../data/residentialLayoutPresets';

interface LayoutProjectWizardProps {
  onClose: () => void;
  onApplyProject: (project: ResidentialLayoutProject) => void;
}

export const LayoutProjectWizard: React.FC<LayoutProjectWizardProps> = ({
  onClose,
  onApplyProject
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [workflow, setWorkflow] = useState<LayoutWorkflowType>('new_layout');
  const [selectedPreset, setSelectedPreset] = useState<'greenfield_4ac' | 'heritage_upgrade' | 'custom'>('greenfield_4ac');

  // Form State
  const [projectName, setProjectName] = useState<string>('Prestige Green Meadows Gated Enclave');
  const [developerName, setDeveloperName] = useState<string>('Prestige Real Estate Developers');
  const [location, setLocation] = useState<string>('Yelahanka, Bengaluru, Karnataka');
  const [surveyNo, setSurveyNo] = useState<string>('Sy. No. 89/1 & 89/2');

  const [siteWidth, setSiteWidth] = useState<number>(140);
  const [siteLength, setSiteLength] = useState<number>(120);
  const [plotCount, setPlotCount] = useState<number>(28);
  const [targetLoadKw, setTargetLoadKw] = useState<number>(6.0);
  const [transformerKva, setTransformerKva] = useState<number>(500);

  const handleSelectPreset = (p: 'greenfield_4ac' | 'heritage_upgrade' | 'custom') => {
    setSelectedPreset(p);
    if (p === 'greenfield_4ac') {
      setWorkflow('new_layout');
      setProjectName('Ananya Serene Meadows Gated Layout');
      setSiteWidth(140);
      setSiteLength(120);
      setPlotCount(28);
      setTransformerKva(500);
    } else if (p === 'heritage_upgrade') {
      setWorkflow('existing_upgrade');
      setProjectName('Heritage Enclave Overhead-to-Underground Modernization');
      setSiteWidth(140);
      setSiteLength(100);
      setPlotCount(20);
      setTransformerKva(250);
    }
  };

  const handleCreateProject = () => {
    let base = workflow === 'existing_upgrade' ? HERITAGE_ENCLAVE_UPGRADE_PROJECT : GREENFIELD_ENCLAVE_PROJECT;
    const totalAreaM2 = siteWidth * siteLength;
    const totalAcres = Number((totalAreaM2 / 4046.86).toFixed(2));

    const newProj: ResidentialLayoutProject = {
      ...base,
      id: `layout_${Date.now()}`,
      meta: {
        ...base.meta,
        projectName: projectName.trim() || 'Residential Layout Project',
        developerName: developerName.trim() || 'Valued Developer',
        location: location.trim() || 'Bengaluru, Karnataka',
        surveyNo: surveyNo.trim() || 'Sy. No. 101/A',
        workflow,
        totalAreaSqM: totalAreaM2,
        totalAreaAcres: totalAcres,
        plotCount,
        targetLoadPerPlotKw: targetLoadKw,
        transformerRatingKva: transformerKva,
        date: new Date().toISOString().split('T')[0]
      },
      boundary: [
        [0, 0],
        [siteWidth, 0],
        [siteWidth, siteLength],
        [0, siteLength]
      ]
    };

    onApplyProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111C3A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-[24px]">map</span>
            </div>
            <div>
              <div className="text-base font-bold text-white">Residential Layout &amp; Infrastructure Setup</div>
              <div className="text-xs text-slate-400">Ananya 3D Layout Simulation • Planning &amp; Electrical Grid Design</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 py-3 bg-[#0B132B] border-b border-slate-800 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono">1</span>
            <span>Workflow &amp; Site</span>
          </div>
          <div className="h-px w-10 bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono">2</span>
            <span>Dimensions &amp; Plots</span>
          </div>
          <div className="h-px w-10 bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono">3</span>
            <span>Electrical Infrastructure</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              {/* Workflow Selection Cards */}
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-medium">Select Development Workflow</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => { setWorkflow('new_layout'); handleSelectPreset('greenfield_4ac'); }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      workflow === 'new_layout'
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-sky-400">add_business</span>
                      <span className="font-bold text-sm text-white">Workflow A: New Layout</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Greenfield development: create roads, plot subdivisions, common areas, and full underground electrical distribution.
                    </p>
                  </div>

                  <div
                    onClick={() => { setWorkflow('existing_upgrade'); handleSelectPreset('heritage_upgrade'); }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      workflow === 'existing_upgrade'
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-amber-400">published_with_changes</span>
                      <span className="font-bold text-sm text-white">Workflow B: Site Upgrade</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Existing site modernization: convert overhead lines &amp; old poles to underground armoured cables with diff comparison.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Developer / Client *</label>
                  <input
                    type="text"
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Survey / Ref Number</label>
                  <input
                    type="text"
                    value={surveyNo}
                    onChange={(e) => setSurveyNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Site Width (m)</label>
                  <input
                    type="number"
                    value={siteWidth}
                    onChange={(e) => setSiteWidth(parseFloat(e.target.value) || 100)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{(siteWidth * 3.28084).toFixed(0)} feet</span>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Site Length (m)</label>
                  <input
                    type="number"
                    value={siteLength}
                    onChange={(e) => setSiteLength(parseFloat(e.target.value) || 100)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{(siteLength * 3.28084).toFixed(0)} feet</span>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Residential Plots</label>
                  <input
                    type="number"
                    value={plotCount}
                    onChange={(e) => setPlotCount(parseInt(e.target.value, 10) || 20)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {((siteWidth * siteLength) / 4046.86).toFixed(2)} Acres total
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div className="font-bold text-sky-400 mb-1">Internal Road Standards:</div>
                <div className="text-slate-300 space-y-1 text-[11px]">
                  <div>• <strong>Main Spine Road:</strong> 12.0m Right-of-Way (ROW) with asphalt carriage &amp; pedestrian footpaths.</div>
                  <div>• <strong>Cross Residential Roads:</strong> 9.0m ROW with underground utility corridors.</div>
                  <div>• <strong>Drainage &amp; Service Ducts:</strong> Precast RCC conduits under both footpaths.</div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Substation Rating (DTR)</label>
                  <select
                    value={transformerKva}
                    onChange={(e) => setTransformerKva(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value={250}>250 kVA 11kV/415V Pad-Mounted</option>
                    <option value={500}>500 kVA 11kV/415V Package Substation</option>
                    <option value={750}>750 kVA Compact Kiosk Substation</option>
                    <option value={1000}>1000 kVA (Dual 500kVA Transformers)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Target Load per Villa (kW)</label>
                  <input
                    type="number"
                    value={targetLoadKw}
                    onChange={(e) => setTargetLoadKw(parseFloat(e.target.value) || 5.0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated Total: {Math.round(plotCount * targetLoadKw * 0.75)} kVA</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-2 font-medium">Infrastructure Provisions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                    <span>100% Underground Armoured XLPE</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                    <span>IP55 Outdoor Feeder Pillars (400A)</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                    <span>7m Octagonal Hot-Dip LED Poles</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                    <span>IS:3043 Chemical Earth Grid (&lt; 0.5 Ω)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111C3A] border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
              <span>Generate 3D Layout Simulation &amp; CAD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
