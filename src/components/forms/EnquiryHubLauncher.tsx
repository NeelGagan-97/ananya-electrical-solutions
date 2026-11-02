import React, { useState } from 'react';
import { FORMS_REGISTRY, openAesEnquiryModal, FormMetadataConfig } from './EnquiryModalHost';
import { FormId } from './types';

export const EnquiryHubLauncher: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const formsList: FormMetadataConfig[] = Object.values(FORMS_REGISTRY);

  const categories = [
    'All',
    'Residential',
    'Commercial & Industrial',
    'Engineering & Audits',
    'Emergency & Support',
    'Corporate',
  ];

  const filteredForms = formsList.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenForm = (id: FormId) => {
    setDrawerOpen(false);
    openAesEnquiryModal(id);
  };

  return (
    <>
      {/* Floating Discrete Quick Access Button */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          title="Open Ananya Electrical Solutions Enquiry Forms Hub"
          className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#0B192C] text-white text-[12.5px] font-semibold shadow-2xl hover:bg-[#006398] border border-cyan-500/30 hover:border-cyan-400 transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
        >
          <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[12px] font-mono font-bold shadow-xs">
            15
          </div>
          <span className="hidden sm:inline font-medium tracking-wide">
            Enquiry Forms Module
          </span>
          <span className="sm:hidden font-medium">Forms (15)</span>
          <span className="material-symbols-outlined text-[18px] text-[#38BDF8] group-hover:rotate-45 transition-transform">
            open_in_new
          </span>
        </button>
      </div>

      {/* Slide-over Drawer / Forms Hub */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-[#0B192C]/70 backdrop-blur-xs animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <div className="w-full max-w-xl h-full bg-[#F8FAFC] shadow-2xl flex flex-col border-l border-slate-300 animate-slideLeft">
            {/* Header */}
            <div className="bg-[#0B192C] px-6 py-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284C7]/20 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
                  <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                      Module Catalog
                    </span>
                    <span className="text-[11px] text-slate-400">15 Forms Ready</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-white tracking-tight">
                    AES Enquiry Forms Hub
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Search & Category Tabs */}
            <div className="p-4 bg-white border-b border-slate-200 shrink-0 space-y-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search form by name or scope (e.g. Solar, HT, BOQ, Safety, AMC)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-9 pr-3 text-[13px] rounded-lg bg-[#F8FAFC] border border-slate-200 focus:border-[#0284C7] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#0B192C] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Form Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredForms.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenForm(item.id)}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#0284C7] shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0284C7]/10 group-hover:bg-[#0284C7] text-[#0284C7] group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Form {String(item.formNumber).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-medium text-[#0284C7] group-hover:underline flex items-center gap-0.5">
                        Open Modal
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>

                    <h4 className="text-[14px] font-bold text-[#0B192C] group-hover:text-[#0284C7] transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}

              {filteredForms.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">search_off</span>
                  <p className="text-[13px] mt-2">No forms match "{searchQuery}" in {selectedCategory}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Contact Bar */}
            <div className="p-4 bg-white border-t border-slate-200 text-center text-[12px] text-slate-600 flex items-center justify-between shrink-0">
              <span className="font-mono text-[11px] text-slate-500">
                Official Helpline: +91 9632025123
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                Super Grade Licensed
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
