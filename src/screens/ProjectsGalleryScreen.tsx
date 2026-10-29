import React, { useState, useEffect } from 'react';
import { PROJECTS, ASSETS } from '../data/constants';
import { ProjectItem } from '../types';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';

interface ProjectsGalleryScreenProps {
  onOpenConsultation: (projectName?: string) => void;
}

const PORTFOLIO_STORAGE_KEY = 'aes_owner_portfolio_overrides_v1';

export const ProjectsGalleryScreen: React.FC<ProjectsGalleryScreenProps> = ({ onOpenConsultation }) => {
  const [filter, setFilter] = useState<'all' | 'industrial' | 'commercial' | 'solar'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const [projectsList, setProjectsList] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Partial<ProjectItem>>;
        return PROJECTS.map((p) => (parsed[p.id] ? { ...p, ...parsed[p.id] } : p));
      }
    } catch {
      // ignore storage errors
    }
    return PROJECTS;
  });

  // Form state for owner record editing
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editClientRef, setEditClientRef] = useState('');
  const [editYear, setEditYear] = useState('');

  useEffect(() => {
    if (editingProject) {
      setEditTitle(editingProject.title);
      setEditLocation(editingProject.location);
      setEditCapacity(editingProject.capacity || '');
      setEditClientRef(editingProject.clientReferencePlaceholder || '');
      setEditYear(editingProject.completionYear || '');
    }
  }, [editingProject]);

  const handleSaveProjectOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updatedList = projectsList.map((item) =>
      item.id === editingProject.id
        ? {
            ...item,
            title: editTitle.trim() || item.title,
            location: editLocation.trim() || item.location,
            capacity: editCapacity.trim() || item.capacity,
            clientReferencePlaceholder: editClientRef.trim() || item.clientReferencePlaceholder,
            completionYear: editYear.trim() || item.completionYear,
          }
        : item
    );

    setProjectsList(updatedList);
    try {
      const overridesMap: Record<string, Partial<ProjectItem>> = {};
      updatedList.forEach((p) => {
        overridesMap[p.id] = {
          title: p.title,
          location: p.location,
          capacity: p.capacity,
          clientReferencePlaceholder: p.clientReferencePlaceholder,
          completionYear: p.completionYear,
        };
      });
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(overridesMap));
    } catch {
      // ignore storage error
    }
    setEditingProject(null);
  };

  const handleResetPortfolioDefaults = () => {
    try {
      localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    } catch {
      // ignore
    }
    setProjectsList(PROJECTS);
  };

  const handleImgFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = 'true';
      target.src = ASSETS.hero;
    }
  };

  const filteredProjects = filter === 'all'
    ? projectsList
    : projectsList.filter((p) => p.category === filter);

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-14 lg:py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0284C7]/20 text-[#5bb8fe] text-[12px] font-semibold w-fit border border-[#0284C7]/30 leading-none">
              <span className="material-symbols-outlined text-[16px] leading-none">verified</span>
              <span>Representative Execution Scope &amp; Project Portfolio • Karnataka</span>
            </div>
            <h1 className="font-display-xl text-white font-extrabold tracking-tight">
              Electrical Substation, Industrial Wiring &amp; Solar EPC Project Portfolio Across Karnataka
            </h1>
            <p className="font-body-lg text-slate-300 max-w-2xl leading-relaxed">
              Explore our core execution categories across Bengaluru, Peenya, Bommasandra, Whitefield, Devanahalli, and Karnataka industrial corridors — spanning 11kV–110kV substations, PCC/MCC switchgear panels, underground XLPE cabling, IS 732 residential wiring, and rooftop solar EPC.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onOpenConsultation('Project Portfolio Quote')}
                className="h-11 px-5 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-[#2a1700] text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">request_quote</span>
                <span>Request Turnkey Quote</span>
              </button>
              <a
                href={`tel:${BUSINESS_NAP.primaryPhoneTel}`}
                onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'ProjectsGallery Hero')}
                className="h-11 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[13px] font-bold inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>Call {BUSINESS_NAP.primaryPhone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-[#1E293B]/90 border border-slate-700/80 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5bb8fe] font-bold">
                  Verified Execution Scope
                </span>
                <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold uppercase tracking-wider leading-none">
                  CEIG &amp; BESCOM
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Voltage Range</span>
                  <span className="text-[15px] font-bold text-white">11kV – 110kV</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">LT Switchgear</span>
                  <span className="text-[15px] font-bold text-white">Up to 6300A</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Safety Protocol</span>
                  <span className="text-[15px] font-bold text-emerald-400">CEA &amp; IS 3043</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Jurisdiction</span>
                  <span className="text-[15px] font-bold text-[#38bdf8]">Pan-Karnataka</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full flex flex-col gap-10">
        {/* Transparency & Editable Owner Record Notice */}
        <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-[#0B192C]">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#0284C7] shrink-0">verified_user</span>
            <span>
              <strong>Portfolio Transparency Note:</strong> Each card below presents our genuine engineering scope, compliance standards, and equipment photographs. Specific client names, work-order references, and exact site capacities use clearly labeled editable placeholders so the business owner can update verified client records anytime.
            </span>
          </div>
          <button
            onClick={handleResetPortfolioDefaults}
            className="text-[12px] font-semibold text-[#006398] hover:underline shrink-0 cursor-pointer"
          >
            Reset Placeholders
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-[#CBD5E1]">
            {(['all', 'industrial', 'commercial', 'solar'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-md text-[13px] font-semibold capitalize transition-colors cursor-pointer ${
                  filter === cat
                    ? 'bg-[#0B192C] text-white shadow-sm'
                    : 'text-[#44474c] hover:text-[#0B192C]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat === 'solar' ? 'Solar EPC' : cat}
              </button>
            ))}
          </div>

          <span className="text-[13px] text-[#44474c] font-medium">
            Showing <strong className="text-[#0B192C]">{filteredProjects.length}</strong> turnkey engineering &amp; solar execution categories
          </span>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-[#CBD5E1] group hover:-translate-y-1"
            >
              <div
                onClick={() => setSelectedProject(project)}
                className="h-56 w-full overflow-hidden relative cursor-pointer"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={project.title}
                  src={project.image}
                  loading="lazy"
                  onError={handleImgFallback}
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#0B192C]/85 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {project.tag}
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold">
                  {project.completionYear}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 text-white text-[12px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#5bb8fe]">location_on</span>
                    {project.location}
                  </span>
                  <span className="text-emerald-400 font-semibold">{project.status}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-2.5">
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="font-headline-sm text-[#0B192C] font-bold group-hover:text-[#0284C7] transition-colors cursor-pointer"
                  >
                    {project.title}
                  </h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {project.scopeOfWork && project.scopeOfWork.length > 0 && (
                    <div className="pt-2 flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        Verified Scope of Work:
                      </span>
                      <ul className="flex flex-col gap-1 text-[12px] text-[#44474c]">
                        {project.scopeOfWork.slice(0, 3).map((sw, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-[#0284C7] shrink-0 mt-0.5">
                              check_circle
                            </span>
                            <span className="line-clamp-1">{sw}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.clientReferencePlaceholder && (
                    <div className="mt-1 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-[#2a1700] flex items-start justify-between gap-2">
                      <span className="leading-snug">{project.clientReferencePlaceholder}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                        }}
                        className="text-[11px] font-bold text-[#006398] hover:underline shrink-0 cursor-pointer"
                      >
                        Edit Record
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Scope Rating</span>
                    <strong className="text-[#0B192C]">{project.capacity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Voltage Class</span>
                    <strong className="text-[#0B192C]">{project.voltage}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-[12px] text-[#006398] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Inspect Scope <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => onOpenConsultation(project.title)}
                    className="px-3 py-1.5 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1] max-h-[90vh] flex flex-col">
            <div className="relative h-56 sm:h-64 shrink-0">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                onError={handleImgFallback}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-[#0B192C]/90 text-white flex justify-between items-center backdrop-blur-md">
                <span className="text-[12px] font-bold text-[#F59E0B] uppercase">{selectedProject.tag}</span>
                <span className="text-[12px] text-emerald-400 font-semibold">{selectedProject.status}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                  {selectedProject.completionYear} • {selectedProject.location}
                </span>
                <h3 className="font-headline-md text-[#0B192C] font-bold">{selectedProject.title}</h3>
              </div>

              <p className="text-[14px] text-[#44474c] leading-relaxed">
                {selectedProject.description}
              </p>

              {selectedProject.scopeOfWork && selectedProject.scopeOfWork.length > 0 && (
                <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] flex flex-col gap-2">
                  <span className="text-[12px] uppercase font-bold text-[#0B192C]">
                    Turnkey Engineering Scope of Work
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#44474c]">
                    {selectedProject.scopeOfWork.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#f8f9ff] border border-[#CBD5E1] text-[13px]">
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase">Industry Sector</span>
                  <strong className="text-[#0B192C]">{selectedProject.clientVertical}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase">Voltage Grid</span>
                  <strong className="text-[#0B192C]">{selectedProject.voltage}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase">Rated Scope</span>
                  <strong className="text-[#0B192C]">{selectedProject.capacity}</strong>
                </div>
              </div>

              <div>
                <span className="text-[12px] text-slate-500 uppercase font-semibold block mb-2">
                  Statutory Clearances Handled by Ananya Electrical Solutions
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.approvals.map((app, i) => (
                    <span key={i} className="text-[12px] px-3 py-1 rounded bg-[#e5eeff] text-[#00476e] font-semibold flex items-center gap-1.5 border border-[#CBD5E1]">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap justify-between items-center gap-3">
                <button
                  onClick={() => {
                    const p = selectedProject;
                    setSelectedProject(null);
                    setEditingProject(p);
                  }}
                  className="text-[12.5px] font-semibold text-[#006398] hover:underline cursor-pointer"
                >
                  Customize Project Record Details
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] text-[#44474c] text-[13px] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const t = selectedProject.title;
                      setSelectedProject(null);
                      onOpenConsultation(t);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-[#0B192C] text-white text-[13px] font-semibold hover:bg-[#006398] transition-colors cursor-pointer"
                  >
                    Request Proposal for Similar Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Record Customization Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#CBD5E1] p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0284C7] font-bold">
                  Owner Portfolio Editor
                </span>
                <h3 className="font-headline-sm text-[#0B192C] font-bold">
                  Update Verified Project Record
                </h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProjectOverride} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12.5px] font-semibold text-[#0B192C]">Project Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[13.5px] text-[#0B192C]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12.5px] font-semibold text-[#0B192C]">Location in Karnataka</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[13.5px] text-[#0B192C]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12.5px] font-semibold text-[#0B192C]">Rated Capacity / Scope</label>
                  <input
                    type="text"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[13.5px] text-[#0B192C]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12.5px] font-semibold text-[#0B192C]">
                  Client Reference / Work-Order Note
                </label>
                <textarea
                  rows={2}
                  value={editClientRef}
                  onChange={(e) => setEditClientRef(e.target.value)}
                  className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[13px] text-[#0B192C]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-[13px] font-semibold text-[#44474c] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B192C] hover:bg-[#006398] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Save Project Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
