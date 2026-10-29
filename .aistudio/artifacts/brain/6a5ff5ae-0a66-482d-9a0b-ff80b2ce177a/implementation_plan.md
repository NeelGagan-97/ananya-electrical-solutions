# Complete SEO & Local Search Optimization Plan — Ananya Electrical Solutions

## 1. Objective & Business Identity Alignment
Transform **Ananya Electrical Solutions** into a search-optimized, high-converting digital platform targeting industrial, commercial, and residential customers across **Bengaluru and Karnataka**.

### Standardized Business NAP (Name, Address, Phone)
- **Business Name**: Ananya Electrical Solutions
- **Primary Headquarters**: 59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru, Karnataka 560092 (Geo: `13.0623, 77.5871`)
- **Primary Phone & WhatsApp**: `+91 9743461955`
- **Secondary 24/7 Emergency Hotline**: `+91 8660121438`
- **Primary Official Email**: `ananyaelectricalsolutions@gmail.com`
- **Canonical Production Domain**: `https://ananyaelectricalsolutions.in/`
- **Cloudflare Workers Staging Domain**: `https://ananya-electrical-solutions.neelgaganat97.workers.dev/` (canonicalized to `https://ananyaelectricalsolutions.in/` to prevent duplicate indexing)

---

## 2. Technical SEO, Clean URL Routing & Crawlability
1. **Clean Path URL Router with Hash Fallback (`src/utils/seo.ts` & `src/App.tsx`)**:
   - Upgrade navigation to use clean History API paths (`/`, `/services`, `/ht-lt-electrical-works`, `/solar-power-solutions`, `/projects-gallery`, `/about-us`, `/contact-us`, `/calculator`, `/3d-2bhk`, `/3d-transformer`, `/3d-motors`, `/3d-cables`) while preserving backwards-compatible `#hash` fallback.
   - Dynamically update `<title>`, `<meta name="description">`, `<link rel="canonical">`, OpenGraph (`og:title`, `og:description`, `og:url`), Twitter Card tags, and dynamic `BreadcrumbList` JSON-LD on every route change.
   - Render semantic visual breadcrumb navigation on internal pages for user clarity and crawl hierarchy.
2. **Crawl & Hosting Configuration (`public/robots.txt`, `public/sitemap.xml`, `public/_redirects`)**:
   - `public/robots.txt`: Allow all search engine crawlers (`User-agent: *`, `Allow: /`), disallow internal/admin endpoints, and declare `Sitemap: https://ananyaelectricalsolutions.in/sitemap.xml`.
   - `public/sitemap.xml`: Complete XML sitemap of all canonical pages on `https://ananyaelectricalsolutions.in/` with priority and change frequency metadata.
   - `public/_redirects`: Configure `/* /index.html 200` so Cloudflare Workers/Pages serves clean URLs without 404 errors.

---

## 3. Rich Schema.org (JSON-LD) Structured Data
Inject a validated multi-entity `@graph` JSON-LD payload in `index.html` and dynamic route schemas via `src/utils/seo.ts`:
- **`Electrician` & `LocalBusiness`**: Verified Sahakarnagar HQ address, geo coordinates (`13.0623, 77.5871`), primary & secondary phone numbers, opening hours, price range, and `areaServed` covering major Bengaluru & Karnataka industrial/residential hubs (Sahakarnagar, Hebbal, Yelahanka, Peenya Industrial Area, Whitefield, Electronic City, Yeshwanthpur, Devanahalli KIADB, Bommasandra, Sarjapur Road, Hoskote, Mysuru).
- **`Service` & `OfferCatalog`**: Structured catalog for all 6 core electrical & solar EPC service pillars.
- **`FAQPage`**: 6+ high-intent Bengaluru electrical contracting, BESCOM/KPTCL sanction, CEIG safety approval, and solar net-metering FAQs.
- **`BreadcrumbList` & `WebSite`**: Dynamic per-page breadcrumb hierarchy and site-level metadata.

---

## 4. On-Page SEO, Service Pillars & Local Bengaluru Authority
1. **Keyword-Mapped Heading Hierarchy & Content**:
   - Optimize `H1`, `H2`, and `H3` structure across **Home**, **Services**, **HT/LT Electrical Works**, **Solar Solutions**, **Projects**, **About Us**, and **Contact Us**.
   - Expand dedicated service sections covering all 6 core offerings with scope of work, applications, IS/IEC standards, and direct quote CTAs:
     1. *HT / LT Electrical Works & Substations (11kV / 33kV / 66kV / 110kV)*
     2. *Transformer, Switchgear & Control Panel Erection (PCC, MCC, APFC, VCB, ACB)*
     3. *BESCOM / KPTCL Liaison, CEIG Approvals & Power Sanction*
     4. *Commercial, Industrial & Residential Turnkey Wiring*
     5. *Earthing, Lightning Protection, Energy Audits & Preventive AMC*
     6. *Solar Rooftop EPC & BESCOM Net Metering*
2. **Local SEO & Embedded Map**:
   - Add an **"Areas We Serve Across Bengaluru & Karnataka"** section highlighting industrial estates, tech parks, and residential zones.
   - Embed an interactive Google Map centered on `59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru, Karnataka 560092` with a direct **"Get Directions"** CTA.
3. **E-E-A-T Trust Signals & Expanded FAQs**:
   - Highlight Class-1 / Super Grade government licensing, CEIG/BESCOM statutory compliance workflow, safety protocols, and verified customer testimonials.
   - Add a comprehensive 6-question FAQ accordion on the Home and Contact/Services views matching the `FAQPage` JSON-LD schema.

---

## 5. Conversion Rate Optimization (CRO) & Built-In SEO Audit Tracker
1. **Instant WhatsApp & Email Lead Dispatch**:
   - Upgrade the **Consultation Modal** and **Contact Page Quote Form** so submitting a project enquiry immediately formats a structured technical brief and provides 1-click dispatch via **WhatsApp (`+91 9743461955`)** and **Email (`ananyaelectricalsolutions@gmail.com`)** without relying on `window.open` or `window.alert`.
2. **Conversion Event Tracking & Live SEO Audit Inspector**:
   - Track `phone_click`, `whatsapp_click`, `email_click`, and `quote_form_submit` via `window.dataLayer` (GA4/GTM compatible).
   - Provide a built-in **SEO & Conversion Audit Inspector** accessible from the site footer so you can inspect the active page's live `<title>`, `<meta name="description">`, canonical URL, keyword map, JSON-LD structured data, and real-time conversion event log.
