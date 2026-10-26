# Implementation Plan: Interactive 3D Residential 2BHK Interior Twin — FPP Walkthrough

## 1. Architectural Overview & Experience Design

We will upgrade the **Residential 2BHK Interior Twin** into a real-time first-person architectural & electrical exploration experience built with Three.js and React.

### Key Experience Pillars
1. **Start Screen & Exterior Foyer Spawn**:
   - Launches with an immersive **"Enter Apartment"** start overlay positioned just outside the main entrance door (`x: 0.9m, z: -0.75m`, facing South toward the Entrance Foyer main door).
   - Displays keyboard/mouse and mobile touch control instructions, IS 732 electrical standard overview, and quick-launch buttons for **Enter Apartment (First-Person Walkthrough)** or **3D / Floor Plan Overview**.
2. **True First-Person Controller (FPP) & Physics**:
   - **Pointer Lock & Free Look**: Smooth yaw/pitch camera rotation with vertical pitch clamping (`-80°` to `+80°`), gentle head-bob while walking, and `1.65m` eye height with gravity/floor grounding.
   - **WASD / Arrow Movement + Sprint (`Shift`)**: Frame-rate-independent velocity and damping using `THREE.Clock`.
   - **Sliding AABB Collision Detection**: Prevents walking through exterior/interior walls, kitchen counters, beds, wardrobes, sofas, dining tables, and **closed doors**. Opening a door dynamically removes its blocking collider so the player can walk seamlessly into the room.
   - **Pause Menu (`ESC`)**: Unlocks the pointer and displays a pause overlay with **Resume Walkthrough**, **Reset Spawn Position**, **Teleport to Room**, and **Exit to 3D Overview / Floor Plan**.
3. **Connected, Walkable 1,000 sq.ft 2BHK Floor Plan**:
   - **Unified Shared-Wall Opening Cuts**: Shared interior partition walls between adjacent rooms (Entrance Foyer, Living & Dining Hall, Modular Kitchen, Internal Passage, Common Bathroom, Master Bedroom, and Guest Bedroom) automatically synchronize all door cutouts so no doorway is ever blocked by a neighbor room's wall segment.
   - **Hinged Interactive Doors**: Every doorway features a 3D hinged door leaf, handle hardware, frame architrave, and smooth swing animation (`0°` closed to `90°` open).
4. **Proximity Raycasting (`[E]` Key & Crosshair Click Interaction)**:
   - Center-screen reticle raycasts up to `2.6m` ahead in FPP mode (and supports direct mouse click in Overview mode) to detect interactive targets:
     - **Doors**: `[E] or Click — Open / Close Door (Room Name)`
     - **Switchboards & Sockets**: `[E] or Click — Toggle Room Lights & Fan / Inspect Circuit` (physically switches room luminaires and ceiling fan rotation on/off and updates live HUD wattage)
     - **Main Distribution Board (DB) & Incoming Meter**: `[E] or Click — Inspect 8-Way TPN Distribution Board` (opens the interactive DB circuit breaker drawer with individual MCB/RCCB trip toggles and Exploded 3D Assembly toggle)
     - **Appliances & Fixtures (Geyser, AC, Chimney, Exhaust, Ceiling Fans)**: `[E] or Click — Toggle Appliance & View IS 732 Load Specs`
5. **Electrical Engineering Exploration Mode**:
   - **Mode Switcher (`X` Key or HUD Toggle)**:
     - **Normal Interior Mode**: Opaque architectural walls, ceilings, warm PBR lighting, and rotating BLDC ceiling fans.
     - **Electrical Inspection Mode (X-Ray)**: Semi-transparent walls (`opacity: 0.16`) and ceilings revealing concealed 25mm PVC conduits, junction boxes, vertical wall drops, and color-coded wiring (`C1`–`C2` Lighting Yellow, `C3`–`C4` 6A/16A Power Blue, `C5`–`C6` 20A HVAC/Geyser Red, `PE` Earthing Green).
   - **Granular Layer Toggles**: Show/Hide All Wiring, Lighting Circuits, Power & 16A Socket Circuits, High-Load AC/Geyser Circuits, Earthing Conductors, and Wall Transparency slider.
6. **Immersive First-Person HUD & Mobile Controls**:
   - **Live 2D Radar Mini-Map**: Top-left/bottom-left architectural floor-plan radar displaying room boundaries, door states (open/closed), electrical DB location, and the player's real-time position dot + viewing frustum cone. Clicking a room on the mini-map optionally teleports the player there.
   - **Dynamic Room Entry Banner**: Smooth HUD toast banner announcing the room name, floor area, and connected circuit IDs whenever the player crosses a doorway threshold.
   - **Real-Time Active Electrical Load Meter**: Live HUD readout showing active power draw (`kW` / `Amps` at `230V`) based on which lights, fans, ACs, and appliances the player has turned on inside the apartment.
   - **On-Screen Mobile Touch Controls**: Dual virtual joysticks (Left: Walk/Strafe, Right: Look Around) plus dedicated on-screen **Interact (`E`)**, **X-Ray Mode**, and **Pause** buttons for touch devices or mouse-only testing.

---

## 2. Planned File Changes

1. **`/src/types/residentialDesigner.ts`**:
   - Add `DoorState` (`id`, `roomId`, `label`, `isOpen`, `targetAngle`, `currentAngle`, `worldX`, `worldZ`) and `InteractiveTarget` (`type: 'door' | 'electrical' | 'db' | 'room'`, `id`, `label`, `sublabel`, `actionLabel`, `distance`) interfaces.
   - Add `PlayerPose` (`x`, `y`, `z`, `yaw`, `pitch`, `currentRoomId`, `currentRoomName`) for syncing the 3D FPP controller with the live 2D Radar Mini-Map and Room Entry Banner.
2. **`/src/data/residentialPresets.ts`**:
   - Refine `STANDARD_2BHK_PROJECT` doorways and add an explicit walkable **Internal Passage** connecting the Living/Dining Hall to the Master Bedroom, Second Bedroom, and Common Bathroom so every room is naturally accessible on foot.
   - Ensure all doors have descriptive labels (e.g., `Main Entrance Door`, `Kitchen Entry`, `Master Bedroom Door`, `Guest Bedroom Door`, `Bathroom Door`).
3. **`/src/three/ParametricHouseGenerator.ts`**:
   - Upgrade wall generation so shared interior walls automatically merge openings from adjacent rooms along the same wall plane, guaranteeing clear walk-through doorways.
   - Build hinged door pivot groups (`userData.isInteractiveDoor = true`, `userData.doorId`) with realistic wood veneer panels, handles, and dynamic AABB collision boxes (`userData.colliders`).
   - Add furniture AABB colliders (sofa, beds, wardrobes, dining table, kitchen counter) and tag all electrical points, switchboards, appliances, and the 8-Way Distribution Board with rich `userData` for center-reticle raycast detection.
   - Support dynamic room lighting & appliance state updates (`activeDeviceIds`) so toggling a switchboard in FPP mode turns the room's 3D point lights, emissive bulbs, and ceiling fan rotation on or off.
4. **`/src/three/ResidentialCanvas.tsx`**:
   - Implement the complete **First-Person Controller** (`WASD`/Arrow keys, `Shift` sprint, Pointer Lock mouse look, touch virtual joystick/look vectors, head-bob, gravity, and sliding circle-vs-AABB collision solver against walls, furniture, and closed doors).
   - Implement real-time center-screen proximity raycasting (`< 2.6m`) that highlights the targeted door, switchboard, socket, appliance, or DB and reports the active `InteractiveTarget` to the HUD.
   - Handle `[E]` key and left-click interaction while pointer-locked (or direct click when unlocked) to swing doors open/closed, toggle room switchboards/appliances, or open the Distribution Board inspector.
   - Animate door hinges smoothly each frame and emit throttled `PlayerPose` updates for the 2D Radar Mini-Map and Room Entry Banner.
5. **`/src/screens/Residential3DScreen.tsx`**:
   - Add the **"Enter Apartment" Starting Screen Overlay** (positioned outside the main entrance door) and **Pause Menu Overlay (`ESC`)** with Resume, Reset Spawn, Room Quick-Jump, and Switch to 3D Overview / 2D Floor Plan.
   - Add the **Live 2D Radar Mini-Map** with player position marker, directional view cone, door state indicators, and click-to-teleport room polygons.
   - Add the **Dynamic Room Entry Banner**, **Center Reticle + `[E]` Proximity Interaction Prompt**, **Real-Time Active Electrical Load Meter (`W / A / 230V`)**, and **On-Screen Touch / Virtual Joystick Controls**.
   - Provide the **IS 732 Electrical Inspection Toolbar** to toggle Normal vs. X-Ray Wall Mode, individual circuit layers (Lighting, Power, AC/Geyser, Earthing), and the Interactive Distribution Board MCB/RCCB drawer.
