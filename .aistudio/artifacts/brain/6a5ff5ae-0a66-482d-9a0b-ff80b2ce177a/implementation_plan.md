# Interactive 2BHK Custom Length & Breadth Dimension Generator — Implementation Plan

## 1. Overview & User Goals
Enable users to specify custom **Length** and **Breadth (Width)** dimensions—both for the **overall 2BHK residential plot** and for **individual rooms**—using either **Feet (`ft`)** or **Meters (`m`)**, and dynamically regenerate the navigable 3D 2BHK Interior Twin, furniture layout, doorways, electrical points, and concealed IS:732 conduit routes in real time.

## 2. Parametric 2BHK Dimension & Scaling Engine (`/src/data/residential2BHKData.ts`)
- **Parametric Plot Generator (`scaleResidentialProjectToDimensions`)**:
  - Accepts target overall **Breadth (Width, X-axis)**, **Length (Depth, Z-axis)**, and optional **Ceiling Height (Y-axis)** alongside a base `ResidentialProject`.
  - Proportionally scales every room's `x`, `z`, `width` (breadth), and `length` so adjacent room walls remain seamlessly aligned without gaps or overlaps.
  - Recalculates wall openings (`offset` along the scaled wall segment while keeping accessible doorway widths clamped to walkable architectural standards).
  - Proportionally repositions all 3D `electricalPoints` (`x, y, z`) so wall switchboards, sockets, AC units, geysers, and Main DB remain flush against their respective room walls, and ceiling lights/fans remain centered in their scaled rooms.
- **Preset Plot Dimension Quick-Chips**:
  - Provide one-click plot presets alongside custom numeric inputs:
    - **Compact 2BHK**: `36 ft × 34 ft` (`11.0 m × 10.4 m` — ~1,224 sq.ft)
    - **Standard Spacious 2BHK**: `54 ft × 52 ft` (`16.4 m × 16.0 m` — ~2,800 sq.ft walkthrough scale)
    - **Grand Villa 2BHK**: `68 ft × 64 ft` (`20.7 m × 19.5 m` — ~4,350 sq.ft)
    - **Custom L × B**: User-entered arbitrary Length and Breadth.

## 3. Unit Conversion & Dual-Unit Support (`ft` ↔ `m`)
- **Seamless Unit Toggle (`ft` / `m`)**:
  - `1 m = 3.28084 ft` (`1 ft = 0.3048 m`).
  - Users can switch between **Feet (`ft`)** and **Meters (`m`)** at any time in the header dimension bar, start overlay, and 2D Floor Plan & Dimensions editor.
  - Display live computed **Total Built-up Area** in both **sq.ft** and **sq.m** (e.g., `2,824 sq.ft / 262.4 m²`).

## 4. UI Controls & Header Quick-Dimension Bar (`/src/screens/Residential3DScreen.tsx`)
- **Top Header Quick-Dimension Bar & Popover**:
  - In the top workspace header bar (next to the workspace mode switcher), add an interactive **Plot Dimensions (`L × B`)** control pill showing current Breadth × Length and Total Area with a `ft / m` toggle.
  - Clicking or editing directly in the Quick-Dimension Bar opens an inline **Custom 2BHK Dimension Configurator** where the user can:
    - Enter overall **Plot Breadth (Width)** and **Plot Length (Depth)** in `ft` or `m` and click **Generate 3D Model** (or adjust live).
    - Select from quick size presets or expand **Individual Room Length × Breadth** overrides (Living & Dining Hall, Kitchen, Master Bedroom, Bedroom 2, Bathrooms, Foyer).
- **"Enter Apartment" Walkthrough Start Screen**:
  - Include a **Custom Apartment Dimensions (`Length × Breadth`)** card directly on the launch overlay so users can set their desired apartment Length and Breadth in Feet or Meters right before clicking **Enter Apartment**.
- **Enhanced 2D Floor Plan & Dimensions Editor**:
  - Upgrade the `2D Floor Plan` tab with a top **Overall Apartment Plot Length × Breadth** scaler card, `ft / m` unit switcher, and per-room **Length** and **Breadth** inputs that immediately update the 2D blueprint and 3D walkthrough model.

## 5. 3D Builder & First-Person Walkthrough Adaptation (`/src/three/ResidentialTwinBuilder.ts` & `/src/three/ResidentialCanvas.tsx`)
- **Dynamic Furniture & Room Boundary Adaptation**:
  - Ensure `buildRoomFurniture` adapts cleanly to custom room widths and lengths so furniture remains well-spaced with clear walking corridors.
  - Automatically recalculate `houseCenter`, camera orbit target, room waypoint spawn coordinates, and 2D radar mini-map bounding box for any custom Length × Breadth dimensions.
