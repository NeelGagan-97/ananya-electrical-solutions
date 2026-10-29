import React, { useState } from 'react';
import { PROJECTS } from '../data/constants';
import { ProjectItem } from '../types';

interface ProjectsGalleryScreenProps {
  onOpenConsultation: (projectName?: string) => void;
}

export const ProjectsGalleryScreen: React.FC<ProjectsGalleryScreenProps> = ({ onOpenConsultation }) => {
  const [filter, setFilter] = useState<'all' | 'industrial' | 'commercial' | 'solar'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects = filter === 'all'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === filter);

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="w-full bg-[#0B192C] text-white py-14 lg:py-16 px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0284C7]/20 text-[#5bb8fe] text-[12px] font-semibold w-fit border border-[#0284C7]/30 leading-none">
              <span className="material-symbols-outlined text-[16px] leading-none">verified</span>
              <span>Karnataka Commissioning Track Record</span>
            </div>
            <h1 className="font-display-xl text-white font-extrabold tracking-tight">
              Commissioned Electrical Substation, Industrial Wiring &amp; Solar Projects Across Karnataka
            </h1>
            <p className="font-body-lg text-slate-300 max-w-2xl leading-relaxed">
              Explore turnkey 11kV/33kV/66kV step-down substations, industrial LT/HT panel installations, and multi-megawatt captive solar power plants delivered across Bengaluru, Peenya, Bommasandra, Hosakote, and Mysuru with zero safety deviations.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-[#1E293B]/90 border border-slate-700/80 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#5bb8fe] font-bold">
                  Commissioned Assets
                </span>
                <span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold uppercase tracking-wider leading-none">
                  100% CEIG Pass
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Substations</span>
                  <span className="text-[15px] font-bold text-white">150+ MVA</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Solar EPC</span>
                  <span className="text-[15px] font-bold text-white">45+ MWp</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 uppercase">Safety Record</span>
                  <span className="text-[15px] font-bold text-emerald-400">Zero Deviations</span>
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
                {cat === 'all' ? 'All Projects' : cat === 'solar' ? 'Solar EPC' : cat}
              </button>
            ))}
          </div>

          <span className="text-[13px] text-[#44474c] font-medium">
            Showing <strong className="text-[#0B192C]">{filteredProjects.length}</strong> verified industrial &amp; solar installations
          </span>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-[#CBD5E1] cursor-pointer group hover:-translate-y-1"
            >
              <div className="h-56 w-full overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={project.title}
                  src={project.image}
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#0B192C]/85 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {project.tag}
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-[#FEF3C7] text-[#2a1700] text-[11px] font-bold">
                  {project.completionYear}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 text-white text-[12px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#5bb8fe]">location_on</span>
                    {project.location}
                  </span>
                  <span className="text-emerald-400 font-semibold">{project.status}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="font-headline-sm text-[#0B192C] font-bold group-hover:text-[#0284C7] transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-body-sm text-[#44474c] leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Capacity</span>
                    <strong className="text-[#0B192C]">{project.capacity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase">Voltage</span>
                    <strong className="text-[#0B192C]">{project.voltage}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[12px] text-[#006398] font-semibold flex items-center gap-1">
                    View Project Case Study <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]">
            <div className="relative h-64">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-[#0B192C]/90 text-white flex justify-between items-center backdrop-blur-md">
                <span className="text-[12px] font-bold text-[#F59E0B] uppercase">{selectedProject.tag}</span>
                <span className="text-[12px] text-emerald-400 font-semibold">{selectedProject.status}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
                  Commissioned in {selectedProject.completionYear} • {selectedProject.location}
                </span>
                <h3 className="font-headline-md text-[#0B192C] font-bold">{selectedProject.title}</h3>
              </div>

              <p className="text-[14px] text-[#44474c] leading-relaxed">
                {selectedProject.description}
              </p>

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
                  <span className="text-slate-500 block text-[11px] uppercase">Rated Capacity</span>
                  <strong className="text-[#0B192C]">{selectedProject.capacity}</strong>
                </div>
              </div>

              <div>
                <span className="text-[12px] text-slate-500 uppercase font-semibold block mb-2">
                  Statutory Clearances Handled by Ananya Electrical
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

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] text-[#44474c] text-[13px] font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const t = selectedProject.title;
                    setSelectedProject(null);
                    onOpenConsultation(t);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#0B192C] text-white text-[13px] font-semibold hover:bg-[#006398] transition-colors"
                >
                  Request Proposal for Similar Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
