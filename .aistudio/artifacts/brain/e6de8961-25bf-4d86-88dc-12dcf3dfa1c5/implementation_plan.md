# Ananya Electrical Solutions – Complete Enquiry Forms Module

A complete collection of 15 production-grade, responsive, and functional enquiry forms built as modular, reusable components for **Ananya Electrical Solutions** (Bengaluru). The system preserves 100% of the existing website's look, feel, pages, and animations while providing seamless modal and inline access, strict client-side validation, simulated file upload handling with progress and size indicators, reference code generation, local repository persistence, and WhatsApp/Email/Call conversion handoffs.

> [!IMPORTANT]
> **Confirmed Choices from Phase 1:**
> - **Form Access & Presentation**: Contextual modal popups triggered by service buttons and a discreet, high-utility floating enquiry launcher + full support for inline form embedding.
> - **Data Persistence & Submissions**: LocalStorage repository (`aes_enquiries_repository_v1`) tracking unique reference codes, timestamps, submission categories, and lifecycle statuses, coupled with instant WhatsApp/Email handoff.
> - **File Attachments & Upload Processing**: Client-side validation enforcing file type restrictions (PDF, JPG, PNG, DOCX, XLSX, CSV, and PDF-only for resumes) and max 10MB per file with animated simulated progress bars and size tracking.
> - **Website Invariance**: The existing landing page, 3D interactive models, navigation bar, footer, and service screens remain strictly preserved and unaffected.

---

## 1. Overview & Core Concept

- **What It Delivers**: A standalone, comprehensive suite of 15 dedicated engineering enquiry forms tailored to Ananya Electrical Solutions' electrical contracting verticals (from residential wiring and rooftop solar to 11kV–110kV HT/LT substations, industrial power distribution, safety audits, vendor onboarding, and emergency dispatch).
- **Target Audience / Personas**:
  - Residential homeowners and apartment RWAs needing wiring, earthing, or rooftop solar.
  - Industrial plant heads, factory engineers, and facility managers requesting substation commissioning, HT/LT panels, or AMCs.
  - Architects, builders, and electrical consultants requiring BOQ pricing, SLD reviews, and electrical layouts.
  - Vendors/suppliers seeking registration, job applicants seeking engineering roles, and existing clients filing service tickets.
- **Key Value**: Replaces generic static contact fields with domain-accurate electrical engineering questionnaires that collect precise technical parameters (voltage class, transformer capacity, connected load in kW/kVA, rooftop area, SLD diagrams, BOQ sheets) before engineering dispatch, significantly reducing back-and-forth consultation time.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Service CTA / Floating Launcher]
               │
               ▼
   [Responsive Modal Container] ── (Backdrop Blur & Smooth Fade-In)
               │
               ▼
     [Domain Form Header] ─────── Dark Navy (#0B192C) with Subtitle & Close Button
               │
               ▼
   [Two-Column Form Fields] ───── Validated inputs, custom select, multi-select tags,
               │                  conditional fields, file uploader with progress
               ▼
     [Interactive Validation] ─── Immediate feedback on Indian mobile, email, file size
               │
               ▼
     [Submission Action] ──────── Loading state, duplicate prevention, reference ID generation
               │
               ▼
   [Success Confirmation] ─────── Unique Ref No. (e.g., AES-RES-202611-8421), Status,
                                  Direct 1-Click WhatsApp handoff, Call +91 9632025123
```

### Visual Identity & Theme Alignment

All forms strictly adopt the existing Ananya Electrical Solutions brand tokens defined in `src/index.css`:
- **Header & Modals**: Dark Navy (`#0B192C` / `bg-navy-deep`) with subtle border accents (`#1E293B` / `#334155`).
- **Form Surface**: Clean white (`#FFFFFF`) and light-grey/ice (`#F8FAFC` / `#EFF4FF`) backgrounds.
- **Primary Buttons & Actions**: High-contrast Electric Blue (`#2563EB` / `#0284C7`) with smooth hover state (`#1D4ED8`) and focus rings.
- **Emergency Action**: Urgent Amber/Crimson accents (`#DC2626` / `#F59E0B`) with prominent safety warnings advising customers to stay clear of live equipment.
- **Typography**: Display titles in Plus Jakarta Sans (`var(--font-display)`), inputs and labels in Inter (`var(--font-body)`), and reference numbers/technical specs in JetBrains Mono (`var(--font-mono)`).
- **Form Inputs**: Rounded-lg inputs (`border border-slate-300 focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all text-slate-900 bg-white`).

---

## 3. The 15 Enquiry Forms Specifications

| # | Form Component | Purpose & Target Segment | Key Fields & Controls |
|---|---|---|---|
| **01** | `ResidentialElectricalForm` | Homeowners & villas | Full Name, Mobile, Email, Property Type, Location, Size, Required Services (Multi-select), Site Visit Date, Notes, Image Upload, Consent. |
| **02** | `IndustrialCommercialForm` | Factories, IT parks, warehouses | Company, Contact Person, Designation, Phone, Email, GST, Facility Type, Connected Load (kW/kVA), Voltage Level (LT/HT/Both), Required Services, Scope, BOQ/Drawings Upload, Start Date. |
| **03** | `HtLtWorksForm` | Substations & high-voltage lines | Org Name, Contact, Phone, Email, Category (Substation/Panel/Line), Voltage Level (11kV–33kV/415V), Transformer Capacity, Number of Transformers, SLD Upload, BOQ Upload. |
| **04** | `SolarRooftopForm` | Residential & commercial solar EPC | Name/Org, Phone, Email, Installation Type, Connection Phase (1-Ph/3-Ph), Monthly Bill (₹), Monthly kWh, Rooftop Area (sq ft), Preferred Capacity, System Type (On-grid/Off-grid/Hybrid), Battery Backup, Bill Upload, Roof Images. |
| **05** | `MaintenanceAmcForm` | Annual maintenance contracts | Company, Contact, Phone, Email, Facility Type, Equipment Available (Multi-select), Number of Panels, Transformer kVA, Maintenance Type (Preventive/Breakdown/AMC), Frequency, Existing AMC (Y/N), Preferred Date. |
| **06** | `InspectionSafetyAuditForm` | Compliance & statutory audits | Organization, Contact, Phone, Email, Site Location, Facility Type, Inspection Categories (Earthing Resistance, Load, Thermal, HT/LT), Voltage Class, Last Inspection Date, Preferred Date, Report Upload. |
| **07** | `EngineeringDesignForm` | SLD, layout, load calculations | Client/Org, Contact, Phone, Email, Location, Project Stage (Planning/Design/Execution), Required Consultancy (Multi-select), Voltage Level, Drawings Upload, Target Delivery Date. |
| **08** | `VendorRegistrationForm` | Suppliers & subcontractors | Company, Contact, Phone, Email, GST, Address, Business Category, Products/Services, Experience Years, Service Regions, Website, Company Profile & GST Certificate Upload. |
| **09** | `RequestSiteVisitForm` | Field engineers on-site visits | Name, Phone, Email, Location, Facility Type, Service Required, Preferred Visit Date, Time Slot (9-12, 12-3, 3-6), Description, Site Photos. |
| **10** | `BoqQuotationRequestForm` | Direct pricing for bill of quantities | Company/Name, Contact, Phone, Email, Location, Category, Quotation Type (Material/Labour/Turnkey), Budget Range, Required Date, BOQ Spreadsheet Upload (XLSX/CSV/PDF), Technical Specs. |
| **11** | `ElectricalEmergencyForm` | Critical faults & breakdowns | Name, Phone, Location, Facility Type, Emergency Type (Power Failure, Short Circuit, Panel Fault, Fire/Overheating), Severity (Critical/Urgent/Normal), Safety Notice Banner, Photos. |
| **12** | `RequestCallbackForm` | Quick inbound consultation | Full Name, Phone, Email, Service of Interest, Preferred Callback Window (Morning/Afternoon/Evening), Requirement Note. |
| **13** | `ProjectFeedbackForm` | Post-commissioning customer review | Customer Name, Phone, Project Category, Location, 1–5 Star Rating (Overall, Work Quality, Timeliness, Communication), Testimonials, Suggestions, Publishing Permission Checkbox. |
| **14** | `CareersJobApplicationForm` | Engineering & technician hiring | Full Name, Phone, Email, Location, Position Applied, Experience Level, Educational Qualifications, Technical Skills, Notice Period, Expected CTC, Resume Upload (PDF only, required). |
| **15** | `CustomerComplaintForm` | Post-service issue ticketing | Customer Name, Phone, Email, Work Reference No, Location, Issue Category, Complaint Priority (Critical/High/Normal), Occurrence Date, Issue Description, Supporting Photos, Preferred Channel. |

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx Integration                             │
├───────────────────────────────────┬────────────────────────────────────┤
│ Existing Site (Unmodified Pages) │ Floating Quick-Enquiry Launcher    │
│ Navbar Service Triggers           │ Contextual Button Handlers         │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             EnquiryModalContainer.tsx (Accessible Dialog)             │
│  - Backdrop with blur & escape listener                                │
│  - Dark Navy Header with Dynamic Title & Icon                          │
│  - Scrollable Form Canvas (Single on mobile, Two-column on desktop)    │
│  - Cancel Button + Primary Action Button                               │
│  - Inline Error Notices & Submission Loading State                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│        Active Form Component      │ │      Success Confirmation View   │
│  (1 of 15 Domain Specific Forms)  │ │  - Unique Reference Badge        │
│  - Form 1: Residential Wiring     │ │  - Summary of Submitted Data     │
│  - Form 2: Industrial / Comm.     │ │  - Direct WhatsApp Pre-filled CTA│
│  - Form 3: HT/LT Substations      │ │  - Direct Phone Call CTA         │
│  - Form 4: Solar Rooftop EPC      │ │  - New Request / Close Options   │
│  - Form 5 to 15...                │ └──────────────────────────────────┘
└─────────────────┬─────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Reusable Form Controls & Utilities (/components/forms)    │
│  ├── FormInput.tsx          (Floating label / validated text input)    │
│  ├── FormSelect.tsx         (Styled native/custom dropdown)            │
│  ├── FormMultiSelect.tsx    (Tag-based multi-selection)                │
│  ├── FormTextarea.tsx       (Clean responsive textarea with counter)   │
│  ├── FormCheckbox.tsx       (Accessible checkbox with consent link)    │
│  ├── StarRating.tsx         (Interactive 1-5 rating for feedback)      │
│  ├── FileUploadField.tsx    (Drag-drop, progress, size check, preview) │
│  ├── validation.ts          (Indian phone regex, email, GST, limits)   │
│  └── enquirySubmissionService.ts (Storage, ref generation, WhatsApp)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Steps & Verification

1. **Core Utilities & Types**:
   - Create `src/components/forms/types.ts` defining comprehensive interfaces for each form, submission payload, and status pipeline.
   - Create `src/components/forms/validation.ts` with battle-tested validators for Indian phone numbers (`+91` format), emails, GST numbers, file types, and size thresholds.
   - Create `src/components/forms/enquirySubmissionService.ts` managing LocalStorage persistence, reference ID formatting (`AES-[CODE]-[TIMESTAMP]-[RAND]`), and pre-filled WhatsApp/Email dispatch links.

2. **Atomic Reusable Field Components**:
   - `FormInput`: Label, required asterisk, prefix icons, inline error, helper text.
   - `FormSelect`: Accessible dropdown with default placeholder and error borders.
   - `FormMultiSelect`: Interactive pill-selection buttons with active styling.
   - `FormTextarea`: Character counter and auto-resizing height.
   - `FileUploadField`: Handles drag & drop, file size enforcement ($\le 10\text{MB}$), file format validation (PDF/JPG/PNG/DOCX/XLSX/CSV), upload simulation with percentage bar, file removal, and metadata display.
   - `StarRatingField`: Accessible star selector for feedback.
   - `FormCheckbox`: Legal consent checkbox with clear wording.

3. **15 Dedicated Form Implementations**:
   - Implement `Form01_ResidentialService.tsx` through `Form15_CustomerComplaint.tsx` in `src/components/forms/items/`.
   - Each form implements exact field specifications, required field validations, conditional displays, and clean two-column grid layouts.

4. **Container & Launcher**:
   - `EnquiryModalContainer.tsx`: Handles backdrop, modal keyboard navigation, focus trap, and seamless transition to the success confirmation state.
   - `EnquiryFormsLauncher.tsx`: Discreet, accessible launcher button allowing direct access to any of the 15 forms organized by category (Residential, Industrial, Infrastructure, Solar, Support, Corporate).
   - `EnquiryFormsCatalog.tsx`: Clean inline showcase component allowing embeddability on any service or dedicated page.

5. **Existing App Integration**:
   - Connect modal triggers in `App.tsx` so existing service consultation buttons directly map to their corresponding dedicated form (e.g., Residential $\to$ Form 1, Solar $\to$ Form 4, HT/LT $\to$ Form 3, Inspection $\to$ Form 6, AMC $\to$ Form 5).
   - Ensure the rest of the application remains untouched and completely stable.

6. **Build & Quality Check**:
   - Run `compile_applet` and verify zero TypeScript or bundler errors.
   - Verify responsiveness across mobile (375px) and desktop (1440px) viewports.
