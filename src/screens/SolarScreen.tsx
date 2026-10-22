import React, { useState } from 'react';
import { ASSETS } from '../data/constants';

interface SolarScreenProps {
  onOpenConsultation: (service?: string) => void;
}

export const SolarScreen: React.FC<SolarScreenProps> = ({ onOpenConsultation }) => {
  // Calculator inputs
  const [monthlyBill, setMonthlyBill] = useState(150000); // 1.5 Lakhs default
  const [roofAreaSqFt, setRoofAreaSqFt] = useState(12000); // 12,000 sq ft
  const [tariffType, setTariffType] = useState<'ht-industrial' | 'lt-commercial'>('ht-industrial');

  // Calculation logic for Karnataka solar yields
  // Average tariff per unit (kWh): HT-2 Industrial ~ ₹7.40, LT Commercial ~ ₹8.20
  const ratePerUnit = tariffType === 'ht-industrial' ? 7.40 : 8.20;
  const monthlyUnitsConsumed = Math.round(monthlyBill / ratePerUnit);
  // 1 kWp solar requires ~80 sq.ft of shadow-free rooftop and generates ~4.2 units/day in Karnataka (approx 126 units/month)
  const maxCapacityFromRoof = Math.floor(roofAreaSqFt / 80);
  const idealCapacityForBill = Math.round(monthlyUnitsConsumed / 126);
  const recommendedKwp = Math.min(idealCapacityForBill, maxCapacityFromRoof);

  // Generation & Savings
  const annualGenerationUnits = Math.round(recommendedKwp * 4.2 * 365);
  const monthlyGenerationUnits = Math.round(annualGenerationUnits / 12);
  const monthlySavingsInr = Math.min(monthlyBill, Math.round(monthlyGenerationUnits * ratePerUnit));
  const estimatedCostLakhs = (recommendedKwp * 42000) / 100000; // ~₹42,000 per kWp turnkey
  const paybackYears = (estimatedCostLakhs * 100000 / (monthlySavingsInr * 12)).toFixed(1);
  const co2OffsetTonsPerYear = (annualGenerationUnits * 0.00082).toFixed(1);

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7]/15 text-[#F59E0B] text-[12px] font-semibold w-fit border border-[#F59E0B]/30">
            <span className="material-symbols-outlined text-[16px]">solar_power</span>
            Turnkey Clean Energy EPC Division
          </div>
          <h1 className="font-display-xl text-white font-extrabold max-w-3xl">
            Commercial &amp; Industrial Solar Power Plants
          </h1>
          <p className="font-body-lg text-slate-300 max-w-3xl leading-relaxed">
            High-yield rooftop and ground-mounted solar power plants engineered with Tier-1 bifacial photovoltaic modules, smart grid synchronization, and full BESCOM / KERC Net Metering sanctions.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onOpenConsultation('Solar EPC Project')}
              className="h-11 px-6 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-[#2a1700] text-[14px] font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">solar_power</span>
              Request Solar Site Assessment
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-[13px]">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
              KERC Net Metering &amp; Grid-Parallel Clearance Guaranteed
            </div>
          </div>
        </div>
      </section>

      {/* Main Solar Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-12">
        {/* Interactive Solar ROI & Capacity Calculator */}
        <div className="rounded-2xl bg-white border border-[#CBD5E1] shadow-md overflow-hidden">
          <div className="bg-[#0B192C] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[12px] text-[#F59E0B] font-mono font-bold uppercase tracking-wider">
                Karnataka Solar Yield Estimator
              </span>
              <h2 className="font-headline-sm text-white font-bold">
                Commercial &amp; Industrial Rooftop Solar ROI Calculator
              </h2>
            </div>
            <span className="text-[12px] px-3 py-1 rounded bg-[#1E293B] text-slate-300 border border-slate-700">
              Assumes 4.2 kWh/kWp/day Solar Insolation (Bengaluru &amp; Industrial Karnataka)
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Sliders */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Monthly Electricity Bill (₹)
                  </label>
                  <span className="font-mono text-[14px] font-bold text-[#F59E0B]">
                    ₹ {monthlyBill.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="1000000"
                  step="10000"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>₹30,000</span>
                  <span>₹5,00,000</span>
                  <span>₹10,00,000</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-[#0B192C]">
                    Usable Roof Area (sq. ft)
                  </label>
                  <span className="font-mono text-[14px] font-bold text-[#0284C7]">
                    {roofAreaSqFt.toLocaleString()} sq.ft
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={roofAreaSqFt}
                  onChange={(e) => setRoofAreaSqFt(Number(e.target.value))}
                  className="w-full accent-[#0284C7] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1,000 sq.ft</span>
                  <span>25,000 sq.ft</span>
                  <span>50,000 sq.ft</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#0B192C]">
                  Utility Tariff Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTariffType('ht-industrial')}
                    className={`py-2 px-3 rounded-lg font-semibold text-[13px] border transition-colors cursor-pointer ${
                      tariffType === 'ht-industrial'
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-[#F8FAFC] text-[#44474c] border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    HT-2 Industrial (~₹7.40/u)
                  </button>
                  <button
                    onClick={() => setTariffType('lt-commercial')}
                    className={`py-2 px-3 rounded-lg font-semibold text-[13px] border transition-colors cursor-pointer ${
                      tariffType === 'lt-commercial'
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-[#F8FAFC] text-[#44474c] border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    LT-4 Commercial (~₹8.20/u)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#CBD5E1] text-[12px] text-[#44474c] leading-relaxed">
                <span className="font-semibold text-[#0B192C]">Net Metering Advantage:</span> Surplus electricity generated on Sundays and plant holidays is fed back to the grid and credited against your billing cycle.
              </div>
            </div>

            {/* Calculated Solar Feasibility Matrix */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#FEF3C7]/40 border border-[#FEF3C7] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-[#2a1700] font-semibold">
                  Recommended System Capacity
                </span>
                <span className="font-stat-counter text-[#F59E0B]">{recommendedKwp} kWp</span>
                <span className="text-[12px] text-[#2a1700]">Fits within {Math.round(recommendedKwp * 80).toLocaleString()} sq.ft of roof</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Estimated Monthly Bill Savings
                </span>
                <span className="font-stat-counter text-emerald-600">
                  ₹ {monthlySavingsInr.toLocaleString('en-IN')}
                </span>
                <span className="text-[12px] text-slate-500">Up to 80-95% reduction</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Annual Clean Energy Generated
                </span>
                <span className="text-[24px] font-bold text-[#0B192C] font-mono">
                  {annualGenerationUnits.toLocaleString('en-IN')} kWh
                </span>
                <span className="text-[12px] text-slate-500">~{monthlyGenerationUnits.toLocaleString('en-IN')} units / month</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Estimated Capital Payback Period
                </span>
                <span className="text-[24px] font-bold text-[#0284C7] font-mono">
                  ~ {paybackYears} Years
                </span>
                <span className="text-[12px] text-slate-500">Subsequent 20+ years of free energy</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Annual Carbon Emission Offset
                </span>
                <span className="text-[18px] font-bold text-emerald-700">
                  {co2OffsetTonsPerYear} Tons CO₂e / Year
                </span>
                <span className="text-[12px] text-slate-500">Equivalent to planting {Math.round(Number(co2OffsetTonsPerYear) * 45)} trees</span>
              </div>

              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-center">
                <button
                  onClick={() => onOpenConsultation(`Solar EPC: ${recommendedKwp} kWp`)}
                  className="w-full py-3 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Lock In Proposal for {recommendedKwp} kWp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Steps to BESCOM Net Metering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col gap-3">
            <span className="text-[12px] font-mono text-[#0284C7] font-bold">STEP 01</span>
            <h3 className="font-headline-sm text-[#0B192C] font-bold">Feasibility &amp; KERC Application</h3>
            <p className="font-body-sm text-[#44474c] leading-relaxed">
              We submit technical SLDs, distribution transformer loading clearance, and grid parallel application on the official ESCOM portal.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col gap-3">
            <span className="text-[12px] font-mono text-[#F59E0B] font-bold">STEP 02</span>
            <h3 className="font-headline-sm text-[#0B192C] font-bold">Turnkey Erection &amp; Testing</h3>
            <p className="font-body-sm text-[#44474c] leading-relaxed">
              Mounting structural fabrication, module array placement, DC cabling, inverter installation, and earth pit resistance validation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#CBD5E1] shadow-sm flex flex-col gap-3">
            <span className="text-[12px] font-mono text-emerald-600 font-bold">STEP 03</span>
            <h3 className="font-headline-sm text-[#0B192C] font-bold">Bidirectional Meter Commissioning</h3>
            <p className="font-body-sm text-[#44474c] leading-relaxed">
              Discom inspection, CEIG safety certificate handover, installation of 4-quadrant bidirectional net-meter, and live grid synchronization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
