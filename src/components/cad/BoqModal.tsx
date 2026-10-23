import React from 'react';
import { ResidentialProject } from '../../types/residentialDesigner';
import { calculateProjectBoq } from './BoqCalculator';

interface BoqModalProps {
  project: ResidentialProject;
  onClose: () => void;
}

export const BoqModal: React.FC<BoqModalProps> = ({ project, onClose }) => {
  const boq = calculateProjectBoq(project);

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
    link.setAttribute('download', `${project.meta.projectName.replace(/\s+/g, '_')}_BOQ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAreaSqFt = (project.rooms.reduce((acc, r) => acc + r.width * r.length, 0) * 10.7639).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#111C3A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>ANANYA ELECTRICAL SOLUTIONS</span>
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] uppercase font-mono font-bold">
                  Official Estimation
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Detailed Bill of Quantities (BOQ) & Material Schedule • IS:732 / IS:3043 Compliant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div className="px-6 py-3 bg-[#0B132B] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">CUSTOMER NAME</div>
            <div className="font-semibold text-slate-200">{project.meta.customerName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">PROJECT / SITE</div>
            <div className="font-semibold text-slate-200 truncate">{project.meta.projectName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">BUILT-UP AREA / LOAD</div>
            <div className="font-mono text-sky-400 font-bold">{totalAreaSqFt} sq.ft • {project.meta.sanctionedLoadKw} kW</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">DATE & COMPLIANCE</div>
            <div className="font-mono text-emerald-400 font-semibold">{project.meta.date} • Grade-A Super</div>
          </div>
        </div>

        {/* Summary Metric Badges */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">TOTAL ESTIMATE (INCL. 18% GST)</div>
            <div className="text-xl font-bold text-amber-400 font-mono">₹{boq.grandTotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">TOTAL FRLS COPPER CABLE</div>
            <div className="text-lg font-bold text-sky-400 font-mono">{boq.totalWireLengthMeters} <span className="text-xs text-slate-400">meters</span></div>
          </div>
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">HEAVY DUTY PVC CONDUIT</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{boq.totalConduitLengthMeters} <span className="text-xs text-slate-400">meters</span></div>
          </div>
          <div className="bg-[#111C3A] border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400">ELECTRICAL POINTS PLACED</div>
            <div className="text-lg font-bold text-indigo-400 font-mono">{project.electricalPoints.length} <span className="text-xs text-slate-400">accessories</span></div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-2.5 pr-2">Code</th>
                <th className="py-2.5 px-2">Category & Description</th>
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

        {/* Cost Summary Footer */}
        <div className="px-6 py-4 bg-[#111C3A] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400 space-y-0.5">
            <div>• All wiring conforms strictly to IS:732 (Code of Practice for Electrical Wiring Installations).</div>
            <div>• 5-Year Comprehensive Warranty on Workmanship & BESCOM/KPTCL liaisoning documentation.</div>
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
