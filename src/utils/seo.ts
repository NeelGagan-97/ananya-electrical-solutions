import { NavigationTab, EngineeringInquiry } from '../types';

export const BUSINESS_NAP = {
  name: 'Ananya Electrical Solutions',
  legalGrade: 'Super Grade Licensed Electrical Contractor (Govt. of Karnataka)',
  pwdClass: 'Class-1 PWD Registered Electrical Contractor',
  streetAddress: '59, Opp Bank of India, G-Block, Sahakarnagar Main Road',
  locality: 'Bengaluru',
  region: 'Karnataka',
  postalCode: '560092',
  country: 'IN',
  fullAddress: '59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru, Karnataka 560092',
  geo: {
    lat: 13.063471473522608,
    lng: 77.59142761283867,
  },
  primaryPhone: '+91 9632025123',
  primaryPhoneTel: '+919632025123',
  whatsappNumber: '919632025123',
  secondaryPhone: '+91 8660121438',
  secondaryPhoneTel: '+918660121438',
  email: 'ananyaelectricalsolutions@gmail.com',
  canonicalDomain: 'https://ananyaelectricalsolutions.com',
  stagingDomain: 'https://ananya-electrical-solutions.neelgaganat97.workers.dev',
  googleMapsEmbedUrl:
    'https://www.google.com/maps?q=13.063471473522608,77.59142761283867&z=17&output=embed',
  googleMapsDirectUrl:
    'https://www.google.com/maps/search/?api=1&query=13.063471473522608,77.59142761283867',
  openingHours: 'Mon–Sat: 08:30 AM – 07:30 PM (24/7 Emergency Breakdown Dispatch)',
};

export interface RouteSeoMetadata {
  tab: NavigationTab;
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Commercial / Local Transactional' | 'Transactional Service' | 'Informational / Interactive' | 'Trust & Brand Authority';
  schemaType: string;
  breadcrumbs: { name: string; path: string }[];
}

export const TAB_TO_PATH: Record<NavigationTab, string> = {
  home: '/',
  services: '/services',
  electrical: '/ht-lt-electrical-works',
  'solar-solutions': '/solar-power-solutions',
  'projects-gallery': '/projects-gallery',
  'about-us': '/about-us',
  'contact-us': '/contact-us',
  'residential-3d': '/3d-2bhk',
  'twin-3d': '/3d-transformer',
  'residential-solar-3d': '/3d-residential-solar',
  'residential-layout-3d': '/3d-layout',
  'smart-home-3d': '/3d-smart-home',
};

export const PATH_TO_TAB: Record<string, NavigationTab> = {
  '/': 'home',
  '/home': 'home',
  '/services': 'services',
  '/electrical-services': 'services',
  '/ht-lt-electrical-works': 'electrical',
  '/electrical': 'electrical',
  '/calculator': 'electrical',
  '/solar-power-solutions': 'solar-solutions',
  '/solar-solutions': 'solar-solutions',
  '/projects-gallery': 'projects-gallery',
  '/projects': 'projects-gallery',
  '/about-us': 'about-us',
  '/about': 'about-us',
  '/contact-us': 'contact-us',
  '/contact': 'contact-us',
  '/3d-2bhk': 'residential-3d',
  '/residential-3d': 'residential-3d',
  '/3d-transformer': 'twin-3d',
  '/twin-3d': 'twin-3d',
  '/3d-residential-solar': 'residential-solar-3d',
  '/residential-solar-3d': 'residential-solar-3d',
  '/3d-layout': 'residential-layout-3d',
  '/3d-cables': 'residential-layout-3d',
  '/residential-layout-3d': 'residential-layout-3d',
  '/3d-smart-home': 'smart-home-3d',
  '/3d-motors': 'smart-home-3d',
  '/smart-home-3d': 'smart-home-3d',
};

export const SEO_ROUTE_CONFIG: Record<NavigationTab, RouteSeoMetadata> = {
  home: {
    tab: 'home',
    path: '/',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/',
    title: 'Ananya Electrical Solutions | Electrical Contractor in Bengaluru',
    description:
      'Government Licensed Super Grade Electrical Contractor in Sahakarnagar, Bengaluru. Turnkey 11kV–110kV substations, HT/LT panels, BESCOM & CEIG approvals, industrial wiring, and rooftop solar across Karnataka. Call +91 9743461955.',
    h1: 'Super Grade Electrical Contractor in Bengaluru for HT/LT Substations, Industrial Wiring & Solar EPC',
    primaryKeyword: 'Electrical contractor in Bengaluru',
    secondaryKeywords: [
      'Super Grade electrical contractor Karnataka',
      'Electrical contractors in Bangalore',
      'HT LT electrical contractor Bangalore',
      'BESCOM approval contractor Bengaluru',
    ],
    searchIntent: 'Commercial / Local Transactional',
    schemaType: 'Electrician + LocalBusiness + OfferCatalog + FAQPage',
    breadcrumbs: [{ name: 'Home', path: '/' }],
  },
  services: {
    tab: 'services',
    path: '/services',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/services',
    title: 'Electrical Installation & Maintenance Services in Bengaluru | HT/LT, Panels, CEIG & AMC',
    description:
      'Complete electrical contracting services in Bengaluru & Karnataka: 11kV/33kV substations, PCC/MCC control panels, BESCOM/CEIG liaison, industrial XLPE cabling, electrical earthing systems, and 24/7 AMC.',
    h1: 'Electrical Installation, Testing & Maintenance Services in Bengaluru, Karnataka',
    primaryKeyword: 'Electrical installation services Bengaluru',
    secondaryKeywords: [
      'Commercial electrical contractors Bengaluru',
      'Electrical maintenance services Bangalore',
      'Electrical commissioning services Karnataka',
      'CEIG electrical approval contractor',
    ],
    searchIntent: 'Transactional Service',
    schemaType: 'Service + OfferCatalog + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Electrical Services', path: '/services' },
    ],
  },
  electrical: {
    tab: 'electrical',
    path: '/ht-lt-electrical-works',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/ht-lt-electrical-works',
    title: 'HT/LT Electrical Contractor in Bangalore | 11kV–110kV Substations, VCB & Switchgear Panels',
    description:
      'Turnkey HT/LT electrical engineering in Bengaluru & Karnataka: 11kV/33kV/66kV/110kV substations, power transformers, VCB/ACB switchgear, busducts, APFC panels, and KPTCL/BESCOM approvals.',
    h1: 'HT/LT Substations, Transformers & Industrial Switchgear Contractors in Bengaluru',
    primaryKeyword: 'HT LT electrical contractor Bangalore',
    secondaryKeywords: [
      'Industrial electrical contractors Karnataka',
      'Electrical panel installation Bengaluru',
      '11kV 33kV substation contractor Bangalore',
      'Transformer erection and testing Bengaluru',
    ],
    searchIntent: 'Transactional Service',
    schemaType: 'Service + WebApplication (Calculator) + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Electrical Services', path: '/services' },
      { name: 'HT/LT Substations & Switchgear', path: '/ht-lt-electrical-works' },
    ],
  },
  'solar-solutions': {
    tab: 'solar-solutions',
    path: '/solar-power-solutions',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/solar-power-solutions',
    title: 'Solar Installation Services in Bengaluru | Commercial & Industrial Rooftop Solar EPC Karnataka',
    description:
      'Turnkey rooftop and ground-mount solar power installation in Bengaluru & Karnataka. Tier-1 bifacial PV modules, BESCOM/KERC net metering approvals, and high-ROI C&I solar plants.',
    h1: 'Commercial, Industrial & Residential Solar Power Installation in Bengaluru',
    primaryKeyword: 'Solar installation services Bengaluru',
    secondaryKeywords: [
      'Solar panel installation Karnataka',
      'Commercial rooftop solar EPC Bangalore',
      'BESCOM net metering solar contractor',
      'Industrial solar power plant Karnataka',
    ],
    searchIntent: 'Transactional Service',
    schemaType: 'Service + WebApplication (Solar ROI Calculator) + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Electrical Services', path: '/services' },
      { name: 'Solar Power Solutions', path: '/solar-power-solutions' },
    ],
  },
  'projects-gallery': {
    tab: 'projects-gallery',
    path: '/projects-gallery',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/projects-gallery',
    title: 'Executed Electrical & Solar Projects in Bengaluru & Karnataka | Ananya Electrical Solutions',
    description:
      'Explore commissioned 33kV/66kV substations, industrial LT/HT panels, cleanroom electrification, and MW-scale rooftop solar EPC projects across Peenya, Bommasandra, Hosakote, and Mysuru.',
    h1: 'Commissioned Electrical Substation, Industrial Wiring & Solar Projects Across Karnataka',
    primaryKeyword: 'Industrial electrical projects Karnataka',
    secondaryKeywords: [
      'Peenya substation contractor portfolio',
      'Bommasandra industrial electrical works',
      'CEIG approved electrical projects Bangalore',
    ],
    searchIntent: 'Trust & Brand Authority',
    schemaType: 'CollectionPage + ItemList + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Projects Portfolio', path: '/projects-gallery' },
    ],
  },
  'about-us': {
    tab: 'about-us',
    path: '/about-us',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/about-us',
    title: 'About Ananya Electrical Solutions | Govt. Licensed Super Grade Electrical Contractor Karnataka',
    description:
      'Learn about Ananya Electrical Solutions, a Government of Karnataka Licensed Super Grade & Class-1 PWD Electrical Contractor headquartered in Sahakarnagar, Bengaluru serving all 31 districts.',
    h1: 'About Ananya Electrical Solutions — Super Grade Electrical Contractor in Bengaluru',
    primaryKeyword: 'Electrical contracting company Bangalore',
    secondaryKeywords: [
      'Super Grade electrical license Karnataka',
      'Class 1 PWD electrical contractor Bengaluru',
      'CEIG licensed contractor Sahakarnagar',
    ],
    searchIntent: 'Trust & Brand Authority',
    schemaType: 'AboutPage + Organization + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about-us' },
    ],
  },
  'contact-us': {
    tab: 'contact-us',
    path: '/contact-us',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/contact-us',
    title: 'Contact Ananya Electrical Solutions | Sahakarnagar, Bengaluru | Call +91 9743461955',
    description:
      'Contact Ananya Electrical Solutions at 59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru 560092. Call +91 9743461955 or email ananyaelectricalsolutions@gmail.com for quotes & 24/7 support.',
    h1: 'Contact Ananya Electrical Solutions — Sahakarnagar Headquarters, Bengaluru',
    primaryKeyword: 'Electrical contractor contact Sahakarnagar Bengaluru',
    secondaryKeywords: [
      'Emergency electrical maintenance Bangalore',
      'Request electrical quote Bengaluru',
      'Ananya Electrical Solutions phone number',
    ],
    searchIntent: 'Commercial / Local Transactional',
    schemaType: 'ContactPage + LocalBusiness + FAQPage + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact Us', path: '/contact-us' },
    ],
  },
  'residential-3d': {
    tab: 'residential-3d',
    path: '/3d-2bhk',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/3d-2bhk',
    title: 'Residential 2BHK Interior | 3D IS:732 Wiring Simulator Bengaluru | Ananya Electrical Solutions',
    description:
      'Interactive 3D Residential 2BHK Interior electrical wiring model in Bengaluru. Inspect IS:732 concealed FRLS conduit routing, MCB/RCCB distribution boards, earthing, and custom room dimensions.',
    h1: 'Residential 2BHK Interior — 3D Electrical Wiring & Distribution Board Simulation',
    primaryKeyword: 'Residential electrical wiring services Bengaluru',
    secondaryKeywords: [
      'Home wiring contractor Bangalore',
      '2BHK electrical layout planner',
      'MCB RCCB distribution board installation',
    ],
    searchIntent: 'Informational / Interactive',
    schemaType: 'WebApplication + Service + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: '3D Engineering Models', path: '/services' },
      { name: 'Residential 2BHK Interior', path: '/3d-2bhk' },
    ],
  },
  'twin-3d': {
    tab: 'twin-3d',
    path: '/3d-transformer',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/3d-transformer',
    title: '33kV Substation | 3D Power Transformer & VCB Switchyard Model | Ananya Electrical Bengaluru',
    description:
      'Explore our interactive 33kV Substation 3D engineering model. Inspect ONAN power transformers, outdoor VCB switchgear, lightning arresters, CT/PT metering, and earth-mat protection.',
    h1: '33kV Substation — 3D Power Transformer & Switchyard Engineering Model',
    primaryKeyword: '33kV substation contractor Bangalore',
    secondaryKeywords: [
      'Power transformer installation Bengaluru',
      'HT switchyard design Karnataka',
    ],
    searchIntent: 'Informational / Interactive',
    schemaType: 'WebApplication + Service + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: '3D Engineering Models', path: '/services' },
      { name: '33kV Substation', path: '/3d-transformer' },
    ],
  },
  'residential-solar-3d': {
    tab: 'residential-solar-3d',
    path: '/3d-residential-solar',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/3d-residential-solar',
    title: 'Residential Solar Installation | 3D Rooftop Solar & BESCOM Net-Metering Model | Bengaluru',
    description:
      'Interactive 3D Residential Solar Installation model on a G+1 Indian RCC house. Inspect 3kWp–10kWp rooftop PV arrays, DCDB/ACDB, string inverter, earthing pits, and BESCOM bi-directional net metering.',
    h1: 'Residential Solar Installation — 3D Rooftop Solar PV & BESCOM Net-Metering Simulation',
    primaryKeyword: 'Residential rooftop solar installation Bengaluru',
    secondaryKeywords: [
      'BESCOM net metering rooftop solar Bangalore',
      'Hybrid solar inverter installation Karnataka',
      'Residential solar EPC contractor Bengaluru',
    ],
    searchIntent: 'Informational / Interactive',
    schemaType: 'WebApplication + Service + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: '3D Engineering Models', path: '/services' },
      { name: 'Residential Solar Installation', path: '/3d-residential-solar' },
    ],
  },
  'residential-layout-3d': {
    tab: 'residential-layout-3d',
    path: '/3d-layout',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/3d-layout',
    title: 'Residential Layout & Infrastructure | 3D Underground XLPE Cabling Model | Bengaluru',
    description:
      'Interactive 3D Residential Layout & Infrastructure electrification planner. Design 11kV DTR poles, underground armored XLPE cable trenches, feeder pillars, street lighting, and BESCOM BOQ estimates.',
    h1: 'Residential Layout & Infrastructure — 3D Township Electrification & Underground Cabling Model',
    primaryKeyword: 'Layout electrification contractor Bengaluru',
    secondaryKeywords: [
      'Underground XLPE cable laying Bangalore',
      'BESCOM layout electrification sanction',
    ],
    searchIntent: 'Informational / Interactive',
    schemaType: 'WebApplication + Service + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: '3D Engineering Models', path: '/services' },
      { name: 'Residential Layout & Infrastructure', path: '/3d-layout' },
    ],
  },
  'smart-home-3d': {
    tab: 'smart-home-3d',
    path: '/3d-smart-home',
    canonicalUrl: 'https://ananyaelectricalsolutions.com/3d-smart-home',
    title: 'Smart Home Automation | 3D Building & Home Automation Model in Bengaluru',
    description:
      'Interactive 3D Smart Home Automation simulator by Ananya Electrical Solutions Bengaluru. Experience DALI/KNX smart lighting, HVAC controls, motorized curtains, and energy telemetry.',
    h1: 'Smart Home Automation — 3D Home & Building Automation Engineering Model',
    primaryKeyword: 'Smart home automation contractor Bengaluru',
    secondaryKeywords: [
      'Building management system electrical Bangalore',
      'Smart switchboard installation Bengaluru',
    ],
    searchIntent: 'Informational / Interactive',
    schemaType: 'WebApplication + Service + BreadcrumbList',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: '3D Engineering Models', path: '/services' },
      { name: 'Smart Home Automation', path: '/3d-smart-home' },
    ],
  },
};

const VALID_TABS: NavigationTab[] = [
  'home',
  'twin-3d',
  'residential-solar-3d',
  'residential-3d',
  'residential-layout-3d',
  'smart-home-3d',
  'electrical',
  'solar-solutions',
  'services',
  'projects-gallery',
  'about-us',
  'contact-us',
];

export function resolveTabFromUrl(): NavigationTab {
  if (typeof window === 'undefined') return 'home';

  // 1. Check hash first for backwards compatibility (#services, #contact-us, etc.)
  const rawHash = window.location.hash.replace('#', '').trim();
  if (rawHash && VALID_TABS.includes(rawHash as NavigationTab)) {
    return rawHash as NavigationTab;
  }

  // 2. Check clean pathname (/services, /ht-lt-electrical-works, etc.)
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (PATH_TO_TAB[pathname]) {
    return PATH_TO_TAB[pathname];
  }

  return 'home';
}

export function updateUrlForTab(tab: NavigationTab) {
  if (typeof window === 'undefined') return;
  const targetPath = TAB_TO_PATH[tab] || '/';
  try {
    if (window.location.pathname !== targetPath || window.location.hash) {
      window.history.pushState({ tab }, '', targetPath);
    }
  } catch {
    // Fallback to hash if iframe sandbox blocks pushState on pathname
    window.location.hash = tab;
  }
}

function setOrCreateMeta(selector: string, attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applyRouteSeo(tab: NavigationTab) {
  if (typeof document === 'undefined') return;
  const meta = SEO_ROUTE_CONFIG[tab] || SEO_ROUTE_CONFIG.home;

  // 1. Document Title
  document.title = meta.title;

  // 2. Standard Meta Description & Keywords
  setOrCreateMeta('meta[name="description"]', 'name', 'description', meta.description);
  setOrCreateMeta(
    'meta[name="keywords"]',
    'name',
    'keywords',
    [meta.primaryKeyword, ...meta.secondaryKeywords].join(', ')
  );

  // 3. Canonical Link Tag (Always points to preferred production domain https://ananyaelectricalsolutions.com)
  let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', meta.canonicalUrl);

  // 4. OpenGraph & Twitter Card Tags
  setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
  setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
  setOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', meta.canonicalUrl);
  setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
  setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

  // 5. Dynamic BreadcrumbList JSON-LD injection
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${meta.canonicalUrl}#breadcrumb`,
    itemListElement: meta.breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: `${BUSINESS_NAP.canonicalDomain}${crumb.path === '/' ? '/' : crumb.path}`,
    })),
  };

  let scriptEl = document.getElementById('dynamic-breadcrumb-schema') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'dynamic-breadcrumb-schema';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(breadcrumbJsonLd);
}

// ================= CONVERSION EVENT TRACKING (GA4 / GTM dataLayer) =================
export interface ConversionEventRecord {
  id: string;
  event: 'phone_click' | 'whatsapp_click' | 'email_click' | 'quote_form_submit' | 'calculator_interaction';
  label: string;
  source: string;
  timestamp: string;
}

const CONVERSION_STORAGE_KEY = 'aes_seo_conversion_events_v1';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackConversionEvent(
  event: ConversionEventRecord['event'],
  label: string,
  source: string
): ConversionEventRecord {
  const record: ConversionEventRecord = {
    id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    event,
    label,
    source,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: record.event,
      event_category: 'Lead Conversion',
      event_label: record.label,
      conversion_source: record.source,
      business_location: 'Bengaluru, Karnataka',
      timestamp: new Date().toISOString(),
    });

    try {
      const existingRaw = localStorage.getItem(CONVERSION_STORAGE_KEY);
      const existing: ConversionEventRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [record, ...existing].slice(0, 50);
      localStorage.setItem(CONVERSION_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('aes-conversion-tracked', { detail: record }));
    } catch {
      // ignore storage errors
    }
  }

  return record;
}

export function getConversionEvents(): ConversionEventRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearConversionEvents() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONVERSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('aes-conversion-tracked'));
  } catch {
    // ignore
  }
}

export function buildWhatsAppInquiryUrl(inquiry: Partial<EngineeringInquiry> & { customMessage?: string }): string {
  if (inquiry.customMessage) {
    return `https://wa.me/${BUSINESS_NAP.whatsappNumber}?text=${encodeURIComponent(inquiry.customMessage)}`;
  }
  const lines = [
    `*New Engineering Inquiry — Ananya Electrical Solutions*`,
    inquiry.id ? `*Ref ID:* ${inquiry.id}` : '',
    inquiry.name ? `*Client / Org:* ${inquiry.name}` : '',
    inquiry.phone ? `*Phone:* ${inquiry.phone}` : '',
    inquiry.email ? `*Email:* ${inquiry.email}` : '',
    inquiry.category ? `*Service Required:* ${inquiry.category}` : '',
    inquiry.location ? `*Site Location:* ${inquiry.location}` : '',
    inquiry.loadDetails ? `*Project Scope / Load:* ${inquiry.loadDetails}` : '',
    `*Inspectorate Compliance:* Standard CEIG / BESCOM Protocol`,
  ].filter(Boolean);

  return `https://wa.me/${BUSINESS_NAP.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildMailtoInquiryUrl(inquiry: Partial<EngineeringInquiry>): string {
  const subject = `[Engineering Quote Request] ${inquiry.category || 'Electrical / Solar Works'} - ${
    inquiry.location || 'Bengaluru'
  } (${inquiry.name || 'Client'})`;
  const bodyLines = [
    `Dear Ananya Electrical Solutions Engineering Desk,`,
    ``,
    `Please find our project details for a technical feasibility review and quotation:`,
    ``,
    `Reference ID: ${inquiry.id || 'Direct Web Inquiry'}`,
    `Client / Organization: ${inquiry.name || 'N/A'}`,
    `Contact Phone: ${inquiry.phone || 'N/A'}`,
    `Official Email: ${inquiry.email || 'N/A'}`,
    `Service Category: ${inquiry.category || 'N/A'}`,
    `Project Location: ${inquiry.location || 'Bengaluru, Karnataka'}`,
    `Connected Load & Scope Details:`,
    `${inquiry.loadDetails || 'Please contact us to discuss site requirements.'}`,
    ``,
    `---`,
    `Dispatched via ananyaelectricalsolutions.com`,
  ];
  return `mailto:${BUSINESS_NAP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join('\n')
  )}`;
}
