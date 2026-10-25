# Awesome Feature Upgrade Plan — Ananya Electrical Solutions

To elevate the platform from a visual portfolio into an interactive, high-converting electrical engineering & EPC command center, we will add three flagship interactive capabilities directly into the experience.

---

## 1. Interactive Engineering Workbench & Live BOQ Cost Estimator
A multi-mode engineering calculator and Bill of Quantities (BOQ) estimator (`src/components/EngineeringWorkbench.tsx`) embedded on the Home screen and accessible from the Services/Electrical screens:
- **Tab 1: Industrial & Commercial Load, Transformer & Cable Sizing Calculator**
  - Interactive sliders and inputs for Connected Load (kW), Power Factor ($\cos\phi$), Diversity Factor, Voltage System (`415V LT`, `11kV HT`, `33kV EHT`), and Cable Run Length (m).
  - Real-time calculation of Recommended Transformer Capacity (kVA), Full-Load Current (Amps), Recommended Armored XLPE Cable Size ($\text{mm}^2$), Breaker Rating (ACB/VCB), and Estimated Voltage Drop (%).
- **Tab 2: Power Factor (APFC) & Solar Rooftop ROI Simulator**
  - Calculates required Capacitor Bank (kVAr) to reach $0.99\text{ PF}$, monthly BESCOM/ESCOM demand penalty savings, recommended Solar PV capacity (kWp), annual generation, and payback period.
- **Tab 3: Instant Turnkey BOQ Quote & Printable Estimate Builder**
  - Lets clients select project scope (e.g., *11kV/433V Compact Substation*, *Form-4b PCC/MCC Panelboard*, *Industrial Heavy XLPE Cabling*, *3BHK/Villa Smart Wiring & Earthing*, *CEIG Liaison & Testing*) and generates an itemized Bill of Quantities with technical specs.
  - **One-Click Actions**:
    - **Print / Save Official PDF Estimate** (clean printable engineering datasheet layout).
    - **Send BOQ via WhatsApp** (pre-filled itemized inquiry directly to the engineering desk).
    - **Attach to Consultation Proposal** (populates the inquiry modal with the calculated parameters).

---

## 2. Interactive Thermal Diagnostics & Before/After Commissioning Showcase
An interactive comparison and diagnostic inspection showcase (`src/components/ThermalDiagnosticsShowcase.tsx`) highlighting why Super Grade engineering and NABL testing matter:
- **Interactive Before / After & Visual / Infrared Thermal Slider**:
  - Allows visitors to drag an interactive comparison slider across electrical panels, busbar joints, and transformer terminations to inspect **Pre-Rectification Hotspot (Infrared Thermal View / Legacy Wiring)** vs. **Post-Commissioning Balanced Load (Certified Form-4b Panel & Thermography Pass)**.
- **Live Diagnostic Telemetry Readouts**:
  - Displays real-time engineering metrics for each scenario: Contact Resistance ($\mu\Omega$), Insulation Resistance (10kV Megger $\text{G}\Omega$), Phase Unbalance (%), Harmonic Distortion (THD), and Temperature Delta ($\Delta T\,^\circ\text{C}$).

---

## 3. Interactive CEIG Statutory & Safety Compliance Readiness Checker
An interactive statutory checklist tool (`src/components/ComplianceReadinessChecker.tsx`) tailored for Karnataka industrial, commercial, and residential layout owners:
- Interactive checklist covering **8 mandatory CEIG / ESCOM (BESCOM, MESCOM, HESCOM, GESCOM, CESC) safety requirements** (Earth Pit Resistance $<1\,\Omega$, Relay Coordination Curves, Hi-Pot VLF Test Certificate, Transformer Oil BDV $>60\,\text{kV}$, Rubber Matting & Arc-Flash Labeling, Lightning Arrestor Counter).
- Computes a live **Inspection Readiness Score (%)**, highlights missing statutory clearances, and lets the user book an immediate **Pre-CEIG Mock Audit & Testing Dispatch** for any flagged items.

---

## 4. Architectural Integration & Verification
- **New Components**:
  - `src/components/EngineeringWorkbench.tsx`
  - `src/components/ThermalDiagnosticsShowcase.tsx`
  - `src/components/ComplianceReadinessChecker.tsx`
- **Integration Points**:
  - Mount the new interactive sections cleanly in `src/screens/HomeScreen.tsx` with quick-jump navigation triggers in the Hero section so visitors can immediately test the calculators, inspect thermal scans, or generate a printable BOQ.
- **Verification**:
  - Run `compile_applet` to ensure zero TypeScript or build errors and verify all interactive sliders, tab switches, print views, and consultation pre-fills work seamlessly.
