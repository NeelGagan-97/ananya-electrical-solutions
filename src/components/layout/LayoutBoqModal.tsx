import React from 'react';
import { ResidentialLayoutProject } from '../../types/layoutDesigner';
import { calculateLayoutBoq } from './layoutBoqCalculator';

interface LayoutBoqModalProps {
  project: ResidentialLayoutProject;
  onClose: () => void;
}

export const LayoutBoqModal: React.FC<LayoutBoqModalProps> = ({ project, onClose }) => {
  const boq = calculateLayoutBoq(project);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Category', 'Item Code', 'Description', 'Make / Brand', 'Quantity', 'Unit', 'Unit Rate (INR)', 'Amount (INR)'];
    const rows = boq.items.map((it) => [
      `"${it.category}"`,
      `"${it.itemCode}"`,
      `"${it.description}"`,
      `"${it.makeBrand}"`,
      it.quantity,
      `"${it.unit}"`,
      it.unitRate,
      it.amount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.meta.projectName.replace(/\s+/g, '_')}_Layout_BOQ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#111C3A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>ANANYA ELECTRICAL SOLUTIONS</span>
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] uppercase font-mono font-bold">
                  Layout Infrastructure BOQ
                </span>
              </div>
              <div className="text-xs text-slate-400">
                11kV Substation, Underground XLPE Network, Feeder Pillars &amp; Street Lighting • IS:7098 / IS:1255 Compliant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Project Meta Details */}
        <div className="px-6 py-3 bg-[#0B132B] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">DEVELOPER / CLIENT</div>
            <div className="font-semibold text-slate-200 truncate">{project.meta.developerName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">SITE / SURVEY NO.</div>
            <div className="font-semibold text-slate-200 truncate">{project.meta.surveyNo}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">LAYOUT AREA &amp; PLOTS</div>
            <div className="font-mono text-sky-400 font-bold">{project.meta.totalAreaAcres} Acres • {project.plots.length} Plots</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">SUBSTATION CAPACITY</div>
            <div className="font-mono text-emerald-400 font-semibold">{project.meta.transformerRatingKva} kVA 11kV/415V</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">DATE &amp; REVISION</div>
            <div className="font-mono text-amber-400 font-semibold">{project.meta.date || 'Oct 2026'} • Rev R2.1</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">MEASUREMENT UNITS</div>
            <div className="font-mono text-slate-300 font-semibold">SI Metric (Meters / Sq.M)</div>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">TOTAL ESTIMATE (INCL. 18% GST)</div>
            <div className="text-xl font-bold text-amber-400 font-mono">₹{boq.grandTotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">UNDERGROUND XLPE CABLES</div>
            <div className="text-lg font-bold text-sky-400 font-mono">{boq.totalLtCableMeters + boq.totalHtCableMeters} <span className="text-xs text-slate-400">meters</span></div>
          </div>
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">OCTAGONAL STREETLIGHT POLES</div>
            <div className="text-lg font-bold text-yellow-300 font-mono">{boq.totalStreetlightCount} <span className="text-xs text-slate-400">poles</span></div>
          </div>
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">FEEDER PILLARS (400A)</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{boq.totalPillarCount} <span className="text-xs text-slate-400">units</span></div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-2.5 pr-2">Code</th>
                <th className="py-2.5 px-2">Category &amp; Description</th>
                <th className="py-2.5 px-2">Make / Specification</th>
                <th className="py-2.5 px-2 text-right">Qty</th>
                <th className="py-2.5 px-2 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 pl-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {boq.items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pr-2 font-mono text-sky-400 font-medium">{it.itemCode}</td>
                  <td className="py-2.5 px-2">
                    <div className="text-slate-200 font-medium">{it.description}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{it.category}</div>
                  </td>
                  <td className="py-2.5 px-2 text-slate-400">{it.makeBrand}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-200">
                    {it.quantity} {it.unit}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                    ₹{it.unitRate.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-mono font-bold text-slate-100">
                    ₹{it.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#111C3A] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400 space-y-0.5">
            <div>• All installations comply with CEA Safety Regulations 2023 &amp; Bescom/KPTCL technical specifications.</div>
            <div>• Turnkey execution includes CEIG approval liaison, testing, and 5-Year comprehensive maintenance support.</div>
          </div>

          <div className="text-right shrink-0 space-y-1">
            <div className="text-xs text-slate-400 flex items-center justify-end gap-4">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200 font-semibold w-28">₹{boq.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-end gap-4">
              <span>GST @ 18%:</span>
              <span className="font-mono text-slate-300 font-semibold w-28">₹{boq.gst18.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-base font-bold text-amber-400 flex items-center justify-end gap-4 pt-1 border-t border-slate-700">
              <span>Grand Total:</span>
              <span className="font-mono text-lg w-28">₹{boq.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
