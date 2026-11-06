import React, { useState } from 'react';
import { ASSETS } from '../data/constants';
import { NavigationTab } from '../types';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';

interface ElectricalScreenProps {
  onOpenConsultation: (service?: string) => void;
  onSelectTab?: (tab: NavigationTab) => void;
}

export const ElectricalScreen: React.FC<ElectricalScreenProps> = ({ onOpenConsultation, onSelectTab }) => {
  // Calculator state
  const [loadKw, setLoadKw] = useState(800);
  const [powerFactor, setPowerFactor] = useState(0.85);
  const [voltageKv, setVoltageKv] = useState<11 | 33>(11);
  const [selectedSldPart, setSelectedSldPart] = useState<string>('transformer');

  // Calculations
  const calculatedKva = Math.round(loadKw / powerFactor);
  // Standard transformer ratings: 250, 500, 750, 1000, 1250, 1500, 2000, 2500, 3150, 5000 kVA
  const standardRatings = [250, 500, 630, 750, 1000, 1250, 1500, 2000, 2500, 3150, 5000, 7500, 10000];
  const recommendedTransformer = standardRatings.find(r => r >= calculatedKva * 1.15) || 5000;
  
  // Primary Current: I = kVA / (sqrt(3) * V_kV)
  const primaryCurrent = (recommendedTransformer / (Math.sqrt(3) * voltageKv)).toFixed(1);
  // Secondary Current at 415V (0.415 kV): I = kVA / (sqrt(3) * 0.415)
  const secondaryCurrent = Math.round(recommendedTransformer / (Math.sqrt(3) * 0.415));
  // HT Cable estimate
  const htCable = voltageKv === 11 
    ? (Number(primaryCurrent) < 70 ? '3C x 95 sq.mm XLPE' : '3C x 185 sq.mm XLPE A2XFY')
    : '3C x 240 sq.mm XLPE A2XFY';
  const vcbRating = voltageKv === 11 ? '630A, 25kA / 3s VCB' : '1250A, 31.5kA / 3s VCB';
  const earthPits = Math.max(6, Math.ceil(recommendedTransformer / 250) * 2);

  const sldNodes = [
    {
      id: 'incoming',
      title: '11kV / 33kV Utility Feeder',
      desc: 'Dedicated express feeder or tapping from KPTCL / BESCOM transmission line with double pole (DP) structure, lightning arresters, and gang operated disconnect switch.',
      spec: 'Conductor: ACSR Overhead Line or 11kV/33kV HT XLPE Underground Cable (IS 7098)'
    },
    {
      id: 'vcb',
      title: 'HT Vacuum Circuit Breaker (VCB)',
      desc: 'Indoor drawout type metal-clad VCB panel with microprocessor numerical overcurrent, earth fault (50/51, 50N/51N) and auxiliary relays.',
      spec: 'Breaking Capacity: 25kA / 31.5kA for 3 seconds'
    },
    {
      id: 'transformer',
      title: 'Step-Down Power Transformer',
      desc: 'Delta-Star (Dyn11) vector group oil-immersed ONAN or cast resin dry-type step-down transformer with off-circuit / On-Load Tap Changer (OLTC).',
      spec: 'Voltage ratio: 11kV / 415V or 33kV / 415V, 50Hz, Class A/F'
    },
    {
      id: 'busduct',
      title: 'Sandwich Busduct Trunking',
      desc: 'High-amperage aluminum/copper sandwich busduct linking transformer secondary terminals to the main Low Tension Power Control Center (PCC).',
      spec: 'Rated up to 6300A with Class F Mylar/Epoxy insulation'
    },
    {
      id: 'lt-pcc',
      title: 'LT Power Control Center (PCC)',
      desc: 'Form 4b separation LT switchboard equipped with microprocessor Air Circuit Breakers (ACB) with draw-out mechanisms, zone selectivity, and smart telemetry.',
      spec: 'Busbar fault level rating: 50kA / 65kA for 1 second'
    },
    {
      id: 'apfc',
      title: 'APFC & Harmonic Mitigation Bank',
      desc: 'Automatic Power Factor Correction panels with 7% detuned reactors and heavy-duty MPP capacitors maintaining unity power factor (> 0.99) under fluctuating loads.',
      spec: 'Step sizing: 25kVAR to 100kVAR microprocessor controlled'
    }
  ];

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-14 lg:py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0284C7]/20 text-[#5bb8fe] text-[12px] font-semibold w-fit border border-[#0284C7]/30 leading-none">
              <span className="material-symbols-outlined text-[16px] leading-none">power</span>
              <span>Super Grade HT/EHT Division • Bengaluru &amp; Karnataka</span>
            </div>
            <h1 className="font-display-xl text-white font-extrabold tracking-tight">
              HT/LT Substations, Transformers &amp; Industrial Switchgear Contractors in Bengaluru
            </h1>
            <p className="font-body-lg text-slate-300 max-w-2xl leading-relaxed">
              Turnkey execution for 11kV, 33kV, 66kV, and 110kV grid step-down substations, custom PCC/MCC/APFC distribution panels, industrial transformer erection, XLPE cabling, and KPTCL/BESCOM/CEIG approvals across Karnataka.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenConsultation('High Voltage Substation')}
                className="h-11 px-5 rounded-lg bg-[#0284C7] hover:bg-[#2563EB] text-white text-[13.5px] font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">request_quote</span>
                <span>Request Substation Quote</span>
              </button>
              <a
                href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'ElectricalScreen Hero')}
                className="h-11 px-4 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-[#2a1700] text-[13.5px] font-bold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">call</span>
                <span>Call {BUSINESS_NAP.primaryPhone}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_NAP.whatsappNumber}?text=Hello%20Ananya%20Electrical%20Solutions%2C%20I%20need%20a%20quote%20for%20HT%2FLT%20Substation%20or%20Switchgear%20works%20in%20Bengaluru.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionEvent('whatsapp_click', BUSINESS_NAP.primaryPhone, 'ElectricalScreen Hero')}
                className="h-11 px-4 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 text-[13.5px] font-bold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">chat</span>
                <span>WhatsApp</span>
              </a>
              {onSelectTab && (
                <button
                  onClick={() => onSelectTab('twin-3d')}
                  className="h-11 px-4 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white border border-[#38bdf8]/50 text-[13px] font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#38bdf8] leading-none">3d_rotation</span>
                  <span>Inspect in 3D Switchyard Model</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-[#1E293B]/90 border border-slate-700/80 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5bb8fe] font-bold">
                  HV Grid Specifications
                </span>
                <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold uppercase tracking-wider leading-none">
                  IEC 62271
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Primary Grid</span>
                  <span className="text-[15px] font-bold text-white">11kV – 110kV</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Fault Rating</span>
                  <span className="text-[15px] font-bold text-white">Up to 31.5 kA</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">LT Busduct</span>
                  <span className="text-[15px] font-bold text-[#38bdf8]">Up to 6300A</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Compliance</span>
                  <span className="text-[15px] font-bold text-emerald-400">CEIG &amp; KPTCL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Pillars Overview */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col justify-between gap-4 h-full">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e5eeff] text-[#0B192C] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] leading-none">domain</span>
              </div>
              <h3 className="font-headline-sm text-[#0B192C] font-bold">Grid Substations (11kV to 110kV)</h3>
              <p className="font-body-sm text-[#44474c] leading-relaxed">
                Complete civil, structural, and electrical turnkey delivery: plinth foundation, DP yard fabrication, earth-mat design, transformer positioning, and express line tapping.
              </p>
            </div>
            <div className="text-[12px] text-[#006398] font-semibold pt-3 border-t border-[#E2E8F0] mt-auto">
              Full KPTCL &amp; BESCOM Sanctions
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col justify-between gap-4 h-full">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#2a1700] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] text-[#F59E0B] leading-none">electrical_services</span>
              </div>
              <h3 className="font-headline-sm text-[#0B192C] font-bold">HT Switchgear &amp; VCB Panels</h3>
              <p className="font-body-sm text-[#44474c] leading-relaxed">
                Air-insulated and gas-insulated HT switchgear with vacuum circuit breakers, high-speed relay protection, CT/PT metering units, and interlocks conforming to IEC 62271.
              </p>
            </div>
            <div className="text-[12px] text-[#006398] font-semibold pt-3 border-t border-[#E2E8F0] mt-auto">
              Numerical Protection Relays
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col justify-between gap-4 h-full">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e5eeff] text-[#0284C7] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] leading-none">linear_scale</span>
              </div>
              <h3 className="font-headline-sm text-[#0B192C] font-bold">Heavy Cabling &amp; Busduct Systems</h3>
              <p className="font-body-sm text-[#44474c] leading-relaxed">
                Underground trench cabling, HDPE pipe laying, heat shrink terminations, and sandwich busduct trunking up to 6300A linking substation transformers to plant distribution.
              </p>
            </div>
            <div className="text-[12px] text-[#006398] font-semibold pt-3 border-t border-[#E2E8F0] mt-auto">
              Hi-Pot Insulation Verified
            </div>
          </div>
        </div>

        {/* Interactive Electrical Load & Substation Sizing Tool */}
        <div className="rounded-2xl bg-white border border-[#CBD5E1] shadow-md overflow-hidden">
          <div className="bg-[#0B192C] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-[#F59E0B] font-mono font-bold uppercase tracking-wider">
                Engineering Calculation Utility
              </span>
              <h2 className="font-headline-sm text-white font-bold">
                Industrial Transformer &amp; Breaker Sizing Calculator
              </h2>
            </div>
            <span className="text-[12px] px-3 py-1.5 rounded-lg bg-[#1E293B] text-slate-300 border border-slate-700 w-fit shrink-0">
              Formula: S = P / (cos φ) · CEA Norms
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Input parameters */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="calc-load-kw" className="text-[13px] font-semibold text-[#0B192C]">
                    Connected Industrial Load (kW)
                  </label>
                  <span className="font-mono text-[14px] font-bold text-[#0284C7]">{loadKw} kW</span>
                </div>
                <input
                  id="calc-load-kw"
                  aria-label="Connected Industrial Load in kW"
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={loadKw}
                  onChange={(e) => setLoadKw(Number(e.target.value))}
                  className="w-full accent-[#0284C7] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>100 kW</span>
                  <span>2500 kW</span>
                  <span>5000 kW</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="calc-power-factor" className="text-[13px] font-semibold text-[#0B192C]">
                    Facility Operating Power Factor (cos φ)
                  </label>
                  <span className="font-mono text-[14px] font-bold text-[#0284C7]">{powerFactor.toFixed(2)}</span>
                </div>
                <input
                  id="calc-power-factor"
                  aria-label="Facility Operating Power Factor"
                  type="range"
                  min="0.80"
                  max="0.99"
                  step="0.01"
                  value={powerFactor}
                  onChange={(e) => setPowerFactor(Number(e.target.value))}
                  className="w-full accent-[#0284C7] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>0.80 (Lagging)</span>
                  <span>0.90</span>
                  <span>0.99 (With APFC)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Supply Incomer Voltage Class
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setVoltageKv(11)}
                    className={`py-2 px-4 rounded-lg font-semibold text-[13px] border transition-colors cursor-pointer ${
                      voltageKv === 11
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-[#F8FAFC] text-[#44474c] border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    11 kV Feeder
                  </button>
                  <button
                    onClick={() => setVoltageKv(33)}
                    className={`py-2 px-4 rounded-lg font-semibold text-[13px] border transition-colors cursor-pointer ${
                      voltageKv === 33
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-[#F8FAFC] text-[#44474c] border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    33 kV Feeder
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#CBD5E1] text-[12px] text-[#44474c] leading-relaxed">
                <span className="font-semibold text-[#0B192C]">Safety Margin Applied:</span> Computations include 15% thermal headroom for ambient temperature derating up to 45°C and prospective factory expansion.
              </div>
            </div>

            {/* Calculated Output Matrix */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Required Apparent Power
                </span>
                <span className="font-stat-counter text-[#0B192C]">{calculatedKva} kVA</span>
                <span className="text-[12px] text-slate-500">Calculated demand at {powerFactor} PF</span>
              </div>

              <div className="p-5 rounded-xl bg-[#FEF3C7]/40 border border-[#FEF3C7] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#2a1700] font-semibold">
                  Recommended Transformer Rating
                </span>
                <span className="font-stat-counter text-[#F59E0B]">{recommendedTransformer} kVA</span>
                <span className="text-[12px] text-[#2a1700]">Standard step-down unit (Dyn11)</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Primary Full Load Current ({voltageKv}kV)
                </span>
                <span className="text-[24px] font-bold text-[#0284C7] font-mono">{primaryCurrent} A</span>
                <span className="text-[12px] text-slate-500">HT Incomer line current</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Secondary Full Load Current (415V)
                </span>
                <span className="text-[24px] font-bold text-[#0B192C] font-mono">{secondaryCurrent} A</span>
                <span className="text-[12px] text-slate-500">LT Busbar design current</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  HT Vacuum Circuit Breaker
                </span>
                <span className="text-[16px] font-bold text-[#0B192C]">{vcbRating}</span>
                <span className="text-[12px] text-slate-500">Microprocessor protection</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Recommended HT Feeder Cable
                </span>
                <span className="text-[16px] font-bold text-[#0B192C]">{htCable}</span>
                <span className="text-[12px] text-slate-500">Dedicated earthing pits: {earthPits} nos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Line Diagram (SLD) Schematic Visualizer */}
        <div className="rounded-2xl bg-white border border-[#CBD5E1] p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[12px] uppercase font-bold text-[#0284C7] tracking-wider">
                Electrical Topology Reference
              </span>
              <h3 className="font-headline-sm text-[#0B192C] font-bold">
                Interactive Single Line Diagram (SLD) Schematic
              </h3>
            </div>
            <span className="text-[12px] text-[#44474c]">Click any stage to view CEIG testing protocol</span>
          </div>

          {/* Graphical Pipeline */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {sldNodes.map((node, index) => {
              const isSelected = selectedSldPart === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedSldPart(node.id)}
                  className={`p-3.5 rounded-xl text-left border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-md scale-102'
                      : 'bg-[#F8FAFC] text-[#0B192C] border-[#CBD5E1] hover:border-[#0284C7]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#F59E0B]' : 'text-slate-400'}`}>
                      0{index + 1}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {index === 0 ? 'bolt' : index === 1 ? 'electrical_services' : index === 2 ? 'ev_station' : index === 3 ? 'linear_scale' : index === 4 ? 'grid_view' : 'insights'}
                    </span>
                  </div>
                  <span className="text-[13px] font-bold leading-tight line-clamp-2">
                    {node.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Details callout for selected SLD node */}
          {selectedSldPart && (() => {
            const current = sldNodes.find(n => n.id === selectedSldPart)!;
            return (
              <div className="p-6 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] uppercase tracking-wider font-bold text-[#006398]">Component Specs</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-[#0B192C] text-[15px]">{current.title}</span>
                  </div>
                  <p className="text-[13px] text-[#44474c] leading-relaxed">{current.desc}</p>
                  <span className="text-[12px] text-slate-500 font-mono mt-1">Design Standard: {current.spec}</span>
                </div>
                <button
                  onClick={() => onOpenConsultation(`SLD: ${current.title}`)}
                  className="shrink-0 px-4 py-2 rounded-lg bg-[#0B192C] text-white text-[13px] font-semibold hover:bg-[#006398] transition-colors"
                >
                  Inquire This Setup
                </button>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
};
