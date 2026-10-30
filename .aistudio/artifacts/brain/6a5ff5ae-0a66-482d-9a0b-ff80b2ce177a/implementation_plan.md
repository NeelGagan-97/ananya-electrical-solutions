# Implementation Plan — 3D Model Menu Separation & Residential Solar Installation 3D Simulation

## 1. Navigation Menu Separation & Global Removal of "Twin"
- **Keep `"3D Model"` Dropdown Label**: Retain **`3D Model`** as the navigation dropdown title in desktop and mobile menus (`src/components/Navbar.tsx`).
- **Five Independent 3D Model Options**:
  1. **Residential Layout & Infrastructure** (`residential-layout-3d`)
  2. **Residential 2BHK Interior** (`residential-3d`)
  3. **33kV Substation** (`twin-3d` — dedicated 33kV switchyard model with solar tracker/yard elements removed)
  4. **Residential Solar Installation** (`residential-solar-3d` — new independent 3D simulation & dashboard)
  5. **Smart Home Automation** (`smart-home-3d`)
- **Global Removal of the Word `"Twin"`**:
  - Replace all user-facing occurrences of `"Twin"` / `"Digital Twin"` across navigation menus, project cards, page headers, 3D HUD badges, welcome overlays, SEO titles/descriptions, and footers (`Navbar.tsx`, `HomeScreen.tsx`, `Substation3DScreen.tsx`, `Residential3DScreen.tsx`, `ResidentialLayoutScreen.tsx`, `SmartHome3DScreen.tsx`, `SolarScreen.tsx`, `ElectricalScreen.tsx`, `ServicesScreen.tsx`, `Footer.tsx`, and `seo.ts`) with clean engineering terminology (`3D Model`, `3D Simulation`, or the exact project name).
- **Dedicated 33kV Substation (`src/screens/Substation3DScreen.tsx` & `src/three/SubstationCanvas.tsx`)**:
  - Remove the solar array/tracker option, solar tilt slider, and solar component card from the `33kV Substation` screen and 3D canvas so it focuses exclusively on the 33kV/11kV Power Transformer, 33kV Outdoor VCB Switchgear, Lightning Protection Mast, and HT Statutory Metering Unit.

---

## 2. Residential Solar Installation — Complete 3D Model (`src/screens/ResidentialSolar3DScreen.tsx` & `src/three/ResidentialSolarCanvas.tsx`)

### A. G+1 Indian RCC House & Rooftop Solar Structure
- **Building Architecture**:
  - Realistic **G+1 Indian RCC residential house** with compound boundary, main entrance gate, ground-floor living/utility interior (with interactive ceiling fan, LED lights, television, air conditioner, and main distribution board), and an accessible staircase leading up to the RCC terrace roof slab with parapet walls and headroom mumty.
- **Configurable Solar Array & Structure (`src/data/residentialSolarPresets.ts`)**:
  - Selectable system capacities: **3 kWp (6 panels, 1 string)**, **5 kWp (10 panels, 2 strings)**, **8 kWp (16 panels, 2 strings)**, and **10 kWp (20 panels, 2 strings)**, plus an **On-Grid Net-Metered vs. Hybrid Inverter + LiFePO4 BESS** configuration toggle.
  - True south-facing orientation (`13°–15°` tilt angle for Bengaluru latitude) with hot-dip galvanized steel elevated support structures, extruded aluminium mounting rails, mid/end clamps, RCC anchor fasteners with waterproofing pedestals, under-panel UV-stabilized DC conduits, junction boxes, and series string wiring.

### B. 16 Labeled & Click-Inspectable 3D Electrical Components
Every component features a 3D mesh, floating tag/callout, and click-to-inspect modal/drawer showing **Component Name**, **Purpose**, **Electrical Input/Output**, **Connection Details**, **Operating Status**, and **Technical Specifications**:
1. **Solar PV Modules** (Mono PERC / N-Type TOPCon 540W–550W modules)
2. **DC String Cables** (4 sq.mm UV-resistant EN 50618 red `+` and black `-` solar DC cables in heavy-duty UPVC conduit)
3. **DC Combiner Box (DCDB)** (IP65 polycarbonate enclosure mounted near inverter wall)
4. **String Fuses** (1000V DC 15A gPV cylindrical fuse holders inside DCDB)
5. **DC Surge Protection Devices (DC SPD)** (Type-2 1000V DC SPD for lightning/switching surge protection)
6. **DC Isolator** (Load-break rotary DC disconnect switch)
7. **Grid-Connected Solar Inverter** (MPPT String Inverter with OLED status display, heatsink fins, and DC/AC entry glands)
8. **AC Distribution Box (ACDB)** (IP65 enclosure receiving inverter AC output)
9. **AC Surge Protection (AC SPD)** (Type-2 415V/230V AC surge arrestor)
10. **AC Isolator / MCB + RCCB** (30mA sensitivity RCCB + AC MCB isolator)
11. **Main Distribution Board (MDB)** (Household consumer LT distribution board feeding home loads)
12. **Bidirectional Net Meter** (BESCOM-approved Class 1.0 bidirectional kWh export/import revenue meter)
13. **Solar Generation Meter** (Gross solar AC energy generation meter)
14. **Earthing Electrodes & Earth Conductors** (3 independent GI/ Copper chemical earth pits for DC Frame, AC Inverter/MDB, and Lightning Arrestor interconnected with 25×3mm GI strip)
15. **Lightning Protection System (LA)** (Terrace mast-mounted ESE / Franklin rod lightning arrestor on highest parapet/mumty point with isolated down-conductor)
16. **BESCOM Distribution Connection** (Street distribution pole with 415V/240V service drop cable, weather-proof service fuse cutout, and armoured service cable to meter board)

---

## 3. Four 3D View Modes & Interactive Walkthrough

### A. Four Engineering View Modes + Camera Controls
- **1. TOP VIEW**: Orthographic/high-angle plan view displaying rooftop panel rows, south orientation compass, mounting rail spans, cable tray pathways, and roof dimensions.
- **2. SIDE VIEW**: Architectural elevation showing building height, parapet walls, `14°` south tilt profile, structure clearance height, vertical DC conduit drop, and ground utility wall mounting.
- **3. ISOMETRIC VIEW**: Full 3D perspective of the G+1 Indian residence, rooftop PV array, external conduit shaft, inverter & metering wall, 3 earth pits, and BESCOM street pole connection.
- **4. EXPLODED ELECTRICAL VIEW**: Interactive exploded separation of the electrical chain (`PV Array → DCDB → Inverter → ACDB → MDB → Net Meter → BESCOM Pole`) with animated step-by-step connection sequence lines and individual component inspection.
- **Camera Controls**: Orbit Rotate, Pan, Zoom In/Out, Auto-Rotate toggle, and Reset Camera button.

### B. First-Person Human Walkthrough (`WASD` + Appliance & Rooftop Inspection)
- Toggle between **Engineering Orbit Camera** and **First-Person Human Walkthrough**.
- Starts at the main residential entrance gate, walks into the ground-floor living area, and climbs the staircase up to the terrace solar installation.
- **Keyboard & Mouse Controls**:
  - `W A S D`: Move & climb stairs
  - `Mouse Look / Drag`: Look around
  - `Left-Click` or `E`: Inspect/interact with nearby electrical equipment (DCDB, Inverter, ACDB, Net Meter, Isolators)
  - `F`: Toggle Ceiling Fan (adds load to live household consumption)
  - `L`: Toggle Interior & Terrace Lights
  - `T`: Toggle Living Room Television
  - `C`: Toggle Split Air Conditioner (high home load)
  - `ESC`: Pause walkthrough & return to cursor control

---

## 4. Animated Power-Flow Simulation, 5 Operating Modes & Telemetry Dashboard

### A. Directional Animated Power-Flow Pulses
- Distinct color-coded animated particle/pulse streams along actual 3D cables:
  - **Solar Sunlight Rays** (`Amber/Gold`) hitting PV modules
  - **DC String & DCDB Path** (`High-Visibility Red/Orange DC Flow`) from PV modules to Inverter
  - **AC Inverter Output & Home Load Path** (`Cyan/Emerald AC Flow`) from Inverter → ACDB → MDB → Home Appliances
  - **BESCOM Bidirectional Grid Flow**:
    - **Net Export (`Green Flow`)**: MDB → Bidirectional Net Meter → BESCOM Street Pole when `Solar Generation > Home Load`
    - **Net Import (`Blue/Amber Flow`)**: BESCOM Street Pole → Bidirectional Net Meter → MDB when `Home Load > Solar Generation`

### B. Five Realistic Operating Modes
1. **MODE 1 – SUNNY DAY**: High solar irradiance (`~950 W/m²`); solar powers all active home loads first and exports surplus power to BESCOM through the bidirectional net meter.
2. **MODE 2 – CLOUDY DAY**: Passing cloud cover reduces solar output (`~300 W/m²`); solar partially supplies home loads while BESCOM grid seamlessly supplements the deficit.
3. **MODE 3 – NIGHT**: `0 W` solar generation; inverter enters standby and all household loads draw power from BESCOM grid.
4. **MODE 4 – GRID FAILURE (BESCOM Outage)**: Demonstrates mandatory **IEEE 1547 / IEC 62116 Anti-Islanding Protection** where a standard On-Grid inverter immediately isolates (`GRID FAULT / ANTI-ISLANDING TRIP`) to protect BESCOM linemen—or, when switched to **Hybrid BESS Mode**, isolates the grid contactor and powers critical home loads from the LiFePO4 battery bank.
5. **MODE 5 – HIGH HOME LOAD**: Activates heavy household appliances (AC, geyser, appliances = `4.8 kW+`), illustrating simultaneous consumption of all available rooftop solar power plus supplemental BESCOM grid import.

### C. Floating Power-Flow Telemetry Dashboard & Interactive Sliders
- **Real-Time Telemetry Readouts** (clearly labeled as realistic engineering demonstration values):
  - `SOLAR GENERATION (kW)`
  - `HOME CONSUMPTION (kW)`
  - `GRID IMPORT (kW)`
  - `GRID EXPORT (kW)`
  - `INVERTER STATUS` (`MPPT TRACKING / EXPORTING`, `GRID SUPPLEMENT`, `NIGHT STANDBY`, `ANTI-ISLANDING ISOLATED`, `HYBRID BACKUP`)
  - `DC VOLTAGE (V)` & `DC CURRENT (A)`
  - `AC VOLTAGE (V)` & `AC FREQUENCY (Hz)`
  - `DAILY ENERGY GENERATION (kWh)` & `TOTAL ENERGY GENERATION (kWh)`
- **Interactive Controls**:
  - Solar Irradiance slider (`0 – 1000 W/m²`)
  - Number of Active PV Strings toggle (`1 String / 2 Strings`)
  - Household Load slider + live appliance switches (`Fan`, `Lights`, `TV`, `AC`)
  - Time of Day scrubber (`06:00 – 20:00`)
  - BESCOM Grid Availability toggle (`Grid Online` / `Grid Outage`)

---

## 5. BESCOM Grid Connection Process & Engineering SLD / BOM Modal
- **BESCOM 10-Step Net-Metering & Interconnection Guide**:
  - Interactive drawer/panel detailing the official **BESCOM & PM Surya Ghar (MNRE National Portal)** residential rooftop solar workflow:
    1. Consumer Account & Sanctioned Load Verification (BESCOM RR Number & tariff check)
    2. Application Registration on MNRE National Portal / BESCOM RTS Portal
    3. Technical Feasibility Approval (TFA) from BESCOM Subdivision (distribution transformer capacity check)
    4. System Design, Structure & MNRE ALMM Module / Inverter Selection
    5. Rooftop Erection, DC/AC Wiring, Protection (DCDB/ACDB/SPD) & 3-Pit Earthing Installation
    6. Internal Testing, Insulation Resistance, Earth Continuity & Anti-Islanding Verification
    7. Work Completion Report (WCR) Submission & CEIG/BESCOM Safety Documentation
    8. Bidirectional Net Meter Testing (MT Lab) & Meter Board Installation by BESCOM
    9. Power Purchase / Net-Metering Agreement Execution & Joint Inspection
    10. Grid Synchronization, Commissioning Certificate & Subsidy / Generation Billing Credit
- **Engineering Single-Line Diagram (SLD) & Bill of Materials (BOM) View**:
  - Interactive vector SLD & dynamic BOM table scaled to the selected kWp capacity (`3 kWp / 5 kWp / 8 kWp / 10 kWp`), including a clear statutory note distinguishing conceptual 3D engineering visualization from site-specific BESCOM/CEIG approved construction drawings.
