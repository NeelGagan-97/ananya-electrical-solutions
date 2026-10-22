import React from 'react';

export type ServiceCategoryKey = 'high-voltage' | 'solar' | 'automation' | 'statutory' | 'maintenance' | 'all';

interface CategoryIconProps {
  category: ServiceCategoryKey;
  className?: string;
  size?: number;
}

export const CategoryColorConfig: Record<ServiceCategoryKey, {
  bgLight: string;
  border: string;
  text: string;
  accent: string;
  label: string;
  gradient: string;
  glow: string;
}> = {
  'all': {
    bgLight: 'bg-[#0B192C]/5',
    border: 'border-[#CBD5E1]',
    text: 'text-[#0B192C]',
    accent: '#0B192C',
    label: 'All Engineering',
    gradient: 'from-[#0B192C] to-[#1E293B]',
    glow: 'shadow-[#0B192C]/10',
  },
  'high-voltage': {
    bgLight: 'bg-[#e5eeff]',
    border: 'border-[#0284C7]/30',
    text: 'text-[#0284C7]',
    accent: '#0284C7',
    label: 'HV Substations',
    gradient: 'from-[#0284C7] to-[#00476e]',
    glow: 'shadow-[#0284C7]/20',
  },
  'solar': {
    bgLight: 'bg-[#FEF3C7]',
    border: 'border-[#F59E0B]/30',
    text: 'text-[#F59E0B]',
    accent: '#F59E0B',
    label: 'Solar Clean Energy',
    gradient: 'from-[#F59E0B] to-[#d97706]',
    glow: 'shadow-[#F59E0B]/20',
  },
  'automation': {
    bgLight: 'bg-[#dce9ff]',
    border: 'border-[#2563EB]/30',
    text: 'text-[#2563EB]',
    accent: '#2563EB',
    label: 'Automation & PCC',
    gradient: 'from-[#2563EB] to-[#1d4ed8]',
    glow: 'shadow-[#2563EB]/20',
  },
  'statutory': {
    bgLight: 'bg-[#d1fae5]',
    border: 'border-[#059669]/30',
    text: 'text-[#059669]',
    accent: '#059669',
    label: 'CEIG & Testing',
    gradient: 'from-[#059669] to-[#047857]',
    glow: 'shadow-[#059669]/20',
  },
  'maintenance': {
    bgLight: 'bg-[#fae8ff]',
    border: 'border-[#a855f7]/30',
    text: 'text-[#a855f7]',
    accent: '#a855f7',
    label: 'AMC & Quality Audits',
    gradient: 'from-[#9333ea] to-[#7e22ce]',
    glow: 'shadow-[#9333ea]/20',
  },
};

/**
 * High-quality vector icon for each service category
 */
export const CategoryDynamicIcon: React.FC<CategoryIconProps> = ({
  category,
  className = '',
  size = 24,
}) => {
  switch (category) {
    case 'high-voltage':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Substation transmission tower & lightning bolt */}
          <path
            d="M7 2L17 2M9 6L15 6M8 2L5 22M16 2L19 22M6 14L18 14M7 9L17 9M7 18L17 18"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 8L10 13H14L11 18"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'solar':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Photovoltaic Solar Panel Array with Sun Rays */}
          <path
            d="M12 2V4M4.93 4.93L6.34 6.34M2 12H4M4.93 19.07L6.34 17.66"
            stroke="#F59E0B"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <polygon
            points="6 9 18 9 21 21 3 21"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <line x1="12" y1="9" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
          <line x1="4.5" y1="15" x2="19.5" y2="15" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="5" r="1.5" fill="#F59E0B" />
        </svg>
      );

    case 'automation':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Industrial PLC Microprocessor & Switchboard Matrix */}
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.75"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" stroke="#2563EB" strokeWidth="1.5" fill="#2563EB" fillOpacity="0.2" />
          {/* Contact bus pins */}
          <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="1" y1="15" x2="4" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="20" y1="15" x2="23" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );

    case 'statutory':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Statutory CEIG Approval Shield & Inspection Checklist */}
          <path
            d="M12 2L4 5V11C4 16.52 7.41 21.68 12 23C16.59 21.68 20 16.52 20 11V5L12 2Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <path
            d="M8.5 12L10.5 14L15.5 9"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'maintenance':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* Preventative Maintenance & Electrical Diagnostics */}
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.1"
          />
          {/* Power quality telemetry pulse */}
          <path
            d="M17 17l1.5-2.5 1.5 5 1.5-3.5 1.5 1"
            stroke="#F59E0B"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'all':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* 4 Quadrants Engineering Grid */}
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.1" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.1" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.1" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" fill="currentColor" fillOpacity="0.1" />
          <circle cx="12" cy="12" r="2" fill="#0284C7" />
        </svg>
      );
  }
};

/**
 * Rich technical placeholder banner for service cards
 */
interface ServiceHeroPlaceholderProps {
  category: ServiceCategoryKey;
  title: string;
  badge: string;
  voltageClass?: string;
}

export const ServiceCardVisualHeader: React.FC<ServiceHeroPlaceholderProps> = ({
  category,
  title,
  badge,
  voltageClass,
}) => {
  const config = CategoryColorConfig[category] || CategoryColorConfig['all'];

  return (
    <div className={`relative h-36 w-full rounded-xl overflow-hidden bg-gradient-to-br ${config.gradient} text-white p-4 flex flex-col justify-between shadow-sm group-hover:shadow-md transition-all duration-300`}>
      {/* Precision CAD grid backdrop */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`cad-grid-${category}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#cad-grid-${category})`} />
        </svg>
      </div>

      {/* Decorative large technical watermark icon */}
      <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
        <CategoryDynamicIcon category={category} size={110} />
      </div>

      {/* Top row: Category tag & Voltage badge */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white border border-white/20">
          <CategoryDynamicIcon category={category} size={14} className="text-white" />
          <span>{config.label}</span>
        </div>
        {voltageClass && (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/30 text-white/90 backdrop-blur-sm">
            {voltageClass}
          </span>
        )}
      </div>

      {/* Bottom row: Dynamic badge & Visual identifier */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/70 font-semibold">
            Standard Specification
          </span>
          <span className="text-[13px] font-bold text-white tracking-wide">
            {badge}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-inner">
          <CategoryDynamicIcon category={category} size={20} />
        </div>
      </div>
    </div>
  );
};
