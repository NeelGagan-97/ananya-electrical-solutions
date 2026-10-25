# Hero Logo Video Right-Edge Alignment

Refine the desktop positioning of the animated electrical logo video in the hero section so that its visual graphic aligns flush with the right edge of the hero container, while keeping the status indicator and telemetry cards below it anchored in their current layout.

## User Review & Critical Decisions

> [!IMPORTANT]
> The animated logo video (`1.5 / 1.5` square canvas) includes internal transparent margin around the circular emblem, which makes it appear slightly inset from the right edge even when its outer bounding box reaches the column boundary. We will compensate for both the container padding and this optical inset so the emblem sits cleanly at the right edge of the hero layout.

- **Confirmed Decision 1**: Align the animated logo video flush with the right container edge on desktop viewports.
- **Confirmed Decision 2**: Move only the logo video further right; keep the status indicator and telemetry metric cards in their existing column alignment.

## 1. Overview & Core Concept

- **What It Does**: Shifts the transparent animated logo reveal video further to the right in the hero section's top-right showcase area on desktop screens (`lg` and `xl` breakpoints).
- **Target Audience / Persona**: Prospective industrial, commercial, and residential clients evaluating Ananya Electrical Solutions on desktop and mobile devices.
- **Key Value**: Achieves a balanced, intentional top-right corner placement where the animated brand emblem visually aligns with the right boundary of the hero section without disturbing the telemetry metrics below it.

## 2. User Experience & Visual Design

- **Key User Flows**:
  - On desktop screens, visitors see the hero headline and primary CTAs on the left, while the animated logo video is anchored cleanly at the top-right corner flush with the right container boundary.
  - On smaller/mobile screens, the video remains centered and responsive within the single-column flow.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Industrial precision engineering with high-contrast dark slate surfaces (`#0B192C`), sky blue (`#38BDF8`), and solar amber (`#F59E0B`) accents.
  - *Component Styling & Layout*: Maintain the `1440px` desktop layout integrity with the 12-column hero split (`7` columns left content, `5` columns right visual showcase). Apply targeted horizontal offset compensation (`lg:translate-x-12 xl:translate-x-16` / negative right margin on the video wrapper) so only the video shifts right while the metric cards remain aligned with the column grid.
- **Interactive Feedback & Motion**:
  - Uses GPU-composited `transform` and negative margin alignment on desktop breakpoints with zero layout shift or horizontal scrollbar overflow (`overflow-hidden` on the parent hero section).

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Independent Optical Offset for the Video Element**
  - *Chosen Approach*: Apply a larger rightward horizontal offset (`lg:-mr-8 xl:-mr-12` and `lg:translate-x-8 xl:translate-x-12`) specifically to the video wrapper/element rather than shifting the entire 5-column container.
  - *Why*: The video asset has built-in transparent padding around the logo graphic. Offsetting only the video wrapper moves the visible emblem flush with the right edge while preventing the bordered telemetry cards below from overflowing or misaligning with the page grid.
  - *Alternatives Considered*: Shifting the entire right column was rejected per user confirmation so the status badge and stat cards stay neatly aligned.

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Hero Section (relative overflow-hidden)                                 │
│  └─ Content Container (max-w-7xl mx-auto px-6 lg:px-12)                 │
│      ├─ Top Certification Banner                                        │
│      └─ 12-Column Split Grid (lg:grid-cols-12 gap-12)                   │
│          ├─ Left Column (lg:col-span-7)                                 │
│          │   ├─ Headline & Value Proposition                            │
│          │   └─ 3D Twin Launchers & Primary CTAs                        │
│          └─ Right Showcase Column (lg:col-span-5)                       │
│              ├─ Video Wrapper (Shifted right flush to container edge)   │
│              │   └─ Transparent Animated Logo Video                     │
│              ├─ Dispatch Status Indicator (Unchanged horizontal align)  │
│              └─ Telemetry Metric Cards Grid (Unchanged horizontal align)│
└─────────────────────────────────────────────────────────────────────────┘
```
- **Interactive Component & State Mapping**:
  - Purely visual layout adjustment on the hero showcase video container; all existing interactive navigation tabs, 3D launcher buttons, and consultation triggers remain intact.
