# Implementation Plan: Residential 2BHK Interior Twin — 3D CAD & BIM Upgrade

## 1. Overview & Objectives
Upgrade the **Residential 2BHK Interior Twin — 3D CAD Model** into a full-featured architectural and electrical BIM workspace compliant with IS 732 / NBC 2016 standards. The upgrade delivers realistic interior detailing, interactive 3D distribution board decomposition, first-person apartment walkthroughs, multi-layer visibility controls, and real CAD/3D file exports.

## 2. Core Features to Implement

### A. Detailed 2BHK Architectural & Interior Furnishings
- **Architectural Shell & Finishes**: Textured room flooring (vitrified tiles in Living/Kitchen, warm engineered wood in Master & Guest Bedrooms, anti-skid ceramic tile in Bathroom, deck tile on Balcony), skirting boards, window frames with glass panes, and hinged door assemblies.
- **Room-by-Room 3D Furnishings**:
  - **Living & Dining**: L-shaped sectional sofa, coffee table, media console with wall-mounted 55" TV, 4-seater dining table with chairs, ceiling fan with rotating blades, and split AC indoor unit.
  - **Modular Kitchen**: L-shaped granite countertop, overhead and base cabinets, stainless steel sink with faucet, 4-burner induction hob with chimney hood, refrigerator, and microwave oven.
  - **Master & Guest Bedrooms**: Queen/Double beds with headboards and pillows, bedside tables, full-height wardrobes, study/dressing desk, ceiling fans, and wall-mounted split AC units.
  - **Bathroom**: Glass shower partition, wall-mounted WC, vanity sink with backlit mirror, and 25L storage water heater (geyser) with dedicated 16A power connection.

### B. Interactive 3D Exploded Distribution Board (8-Way TPN DB)
- **Exploded Assembly Toggle**: Smoothly animates the 8-Way TPN Distribution Board along the X-axis when "Exploded DB" mode is activated or when inspecting the DB:
  - **Layer 1 (Back)**: Sheet-steel recess-mounted enclosure box with DIN rails and neutral/earth terminal blocks.
  - **Layer 2 (Mid-Back)**: 4-Pole 63A Isolator + 2x 40A 30mA RCCBs + 8 individual SP/DP MCBs (C10, C16, C20, C32) with physical toggle switches that reflect live breaker state (`ON`, `OFF`, `TRIPPED`).
  - **Layer 3 (Mid-Front)**: Color-coded R-Y-B-N-E copper busbar comb assembly and internal phase jumpers.
  - **Layer 4 (Front)**: Dead-front escutcheon plate with circuit labels and hinged outer steel door.
- **Direct 3D Breaker Selection**: Clicking any MCB/RCCB inside the exploded 3D DB selects that circuit, highlights its entire 3D conduit & wire path across the apartment, and opens its live electrical telemetry in the right-hand inspector.

### C. First-Person POV Walkthrough & Room Waypoints
- **Dual Camera System**:
  - **Orbit CAD Mode**: Standard engineering turntable & pan camera with orthographic/perspective feel and X-Ray wall transparency slider.
  - **First-Person POV Mode**: Eye-level (`Y = 1.65m`) walkthrough camera inside the apartment with `WASD` / Arrow key movement, click-and-drag look-around, collision bounds within the apartment footprint, and full-ceiling rendering with emissive downlights and point lights.
- **Room-to-Room POV Waypoint Bar**: Quick-jump buttons (`Living Room`, `Kitchen`, `Master Bedroom`, `Guest Bedroom`, `Bathroom`, `Balcony`, `DB Closeup`) that smoothly glide the camera to each room's vantage point.

### D. Multi-Layer Visibility & X-Ray Controls
- Dedicated CAD Layer Manager in the top/left HUD allowing independent toggling of:
  - `Architecture (Walls & Slab)` (plus X-Ray opacity slider `10% – 100%`)
  - `Interior Furniture & Appliances`
  - `Lighting Fixtures & Illumination Cones`
  - `PVC Conduits & Junction Boxes`
  - `Phase-Colored Internal Wiring (R/Y/B/N/E)`
  - `Exploded DB Assembly`

### E. Real 3D (`.glb` / `.gltf`) & 2D CAD (`.dxf`) Deliverable Exports
- **GLB / glTF 3D Exporter**: Uses Three.js `GLTFExporter` to export the complete 3D 2BHK architectural & electrical twin directly as a binary `.glb` or `.gltf` file compatible with Blender, AutoCAD, Revit, and Navisworks.
- **AutoCAD `.dxf` 2D Drawing Exporter**: Procedurally generates a multi-layer R12/2000 `.dxf` CAD file containing true-scale 2D geometry on named CAD layers (`A-WALL`, `A-DOOR`, `E-DB`, `E-CONDUIT-10A`, `E-CONDUIT-16A`, `E-CONDUIT-AC`, `E-FIXTURES`, `E-LABELS`) ready to open in AutoCAD or LibreCAD.

## 3. File Structure Changes
- `/src/components/Residential3D.tsx`:
  - Expand the 3D scene builder with detailed room furnishings, appliances, ceiling fans, and fixture geometries.
  - Add the multi-stage **Exploded 3D Distribution Board** assembly with interactive MCB switches and copper busbars.
  - Implement First-Person POV camera controller (`WASD` + mouse look + room waypoint interpolation).
  - Add layer visibility toggles and real `.glb` (`GLTFExporter`) and `.dxf` CAD export generators in the toolbar.
