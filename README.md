# Handoff: Ztelier — Zero Trust Maturity & ROI Dashboard

## Overview
Ztelier is a Zero Trust maturity-gap analysis and ROI dashboard. Security leaders use it to see where their ZT program sits today (by pillar), what tier they're targeting, how far they are from that target, and what the 36-month ROI looks like if they fund the proposed initiatives. The product concept fuses Zero Trust with an **architectural-atelier visual metaphor** — the product treats the security posture like a drafting-room elevation drawing.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via Babel standalone)**. They are *prototypes* that show the intended look, information architecture, and interactions — **not production code to copy verbatim**.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Next.js, Remix, Vue, SwiftUI, etc.) using its established patterns, design tokens, router, and data layer. If no codebase exists yet, choose a modern React + TypeScript + Vite/Next.js stack and implement the designs there.

Do **not** ship the HTML/JSX verbatim: the prototype uses a single `styles.css` with CSS variables, inline styles, global babel transforms, and `Object.assign(window, ...)` to share components. That's fine for a design artifact but not for production.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interaction model are intentional and should be matched. Exact hex values, font stacks, and measurements appear below under **Design Tokens**. When the target codebase has an existing design system, reuse its tokens where they match; otherwise, adopt these values.

## Product Structure
Single-page dashboard composed of a top bar, a 12-column grid of panels, a floating Tweaks panel (bottom-right), and a slide-over drawer for the Policy Editor.

### Top Bar
- Logo mark (28×28 bordered square with internal crosshair) + wordmark "Ztelier" + mono sub-label `ZERO-TRUST · DRAFTING STUDIO`
- Center: five tabs — `ELEVATION`, `HEATMAP`, `SECTION`, `BACKLOG`, `ALERTS` (only ELEVATION is wired up)
- Right: live indicator (blinking green dot + metaphor label), theme toggle, 32×32 avatar square
- Sticky, `backdrop-filter: blur(8px)`, `border-bottom: 1px solid var(--line-1)`

### Panels (12-col grid, 24px gutter)
Every panel uses **corner crosshairs instead of card shadows**. Crosshairs are 12px `+` marks in `var(--accent)` at the four corners of the panel box. Each panel carries a **title block** at the bottom — monospace 10px/uppercase caption with `Drawing No.`, `Scale · Rev · Date`.

1. **Hero strip (col-12)** — `A-100 · ELEVATION · OVERALL MATURITY`
   - Left: display-serif headline ("Your Zero Trust is a half-built structure."), with "half-built structure" in accent color.
   - Right: 4 big metrics (Current Tier, Target Tier, ROI 36mo, Payback) + a decorative North-arrow SVG
   - Background tint: `var(--paper-tint)` (4% accent-tinted)

2. **Elevation chart (col-8)** — `A-101 · ELEVATION · FACADE SOUTH`
   - SVG bar chart drawn as an architectural elevation view.
   - Horizontal "ground line" at tier 0 with hatched ground below.
   - Each of 7 ZT pillars is a column rising to its *current tier*; dashed horizontal cap marks *target tier*; hatched region between current and target represents the gap with a `Δ1.7` style label in ochre.
   - Internal subdivisions every 0.5 tier (thin horizontal stroke lines inside the column — "stories").
   - Dashed horizontal mean lines labeled `MEAN · CURRENT 2.41` and `MEAN · TARGET 4.15` in accent color.
   - Clicking a column selects it (stroke flips to accent, column fills with accent color, annotation `▼ SELECTED` appears above).

3. **Pillar inspector (col-4)** — `A-102 · DETAIL · ZT-XX`
   - Shows the selected pillar. Code, name, description, weight.
   - Three big metric rows: CURRENT / TARGET / GAP
   - A 26px horizontal progress bar: solid fill = current, hatched extension = gap, vertical line = target marker
   - List of top 3 recommended initiatives from `INITIATIVES` filtered by this pillar (code, name, impact, effort/cost)
   - Primary CTA button `OPEN POLICY EDITOR` opens the drawer

4. **ROI section (col-7)** — `A-201 · SECTION A-A' · RETURN ON INVESTMENT`
   - SVG "section drawing": horizontal ground line at ~42% down the viewBox.
   - **Above the line**: sage-green savings bars (12px wide, one per month, 37 months)
   - **Below the line**: vermilion hatched "excavated" cost bars
   - **Accent curve**: cumulative net $ traced from left to right. Crosses ground line at payback month → circled marker labeled `PAYBACK · M19`.
   - Endpoint labeled `Σ +$X,XXXK`
   - Bottom: 4 stat columns (Investment, Loss Avoidance, MTTD before→after, MTTR before→after)

5. **Heatmap (col-5)** — `A-301 · PLAN · THREAT × PILLAR`
   - CSS grid: rows = ZT pillars (7), columns = MITRE-aligned tactics (9).
   - Cells colored by residual-risk band: `<25` sage, `<50` ochre, `>=50` vermilion, with alpha from `0.12` to `0.82` based on value.
   - Cells are 44px tall, show the numeric risk value in mono.
   - Clicking a cell selects its pillar in the elevation chart.

6. **Backlog (col-8)** — `A-401 · SCHEDULE · WORK PACKAGES`
   - Table: ID (mono gray), Initiative, Pillar (code + name), Status (Chip), Impact (mini bar + number), Cost, Months, Owner.
   - Tab row at top switches sort key (IMPACT, COST, DURATION)
   - Row click opens the Policy Editor drawer for that pillar.

7. **Alerts (col-4)** — `A-501 · LIVE · TELEMETRY`
   - "Field Notes" log stream: `HH:MM:SS` · MITRE code chip · description · `→` arrow
   - Bottom: two MiniStat boxes (MTTR 24H, Open Sev1)

8. **Legend (col-12)** — Explains the graphic vocabulary (filled = current, hatched = gap, dashed = target, ground line = tier 0)

### Policy Editor (slide-over drawer, ~880px wide)
Opens from the right over a 50% black scrim with 2px blur. Fills 100vh.
- Header: drawing code, drawing title (e.g. "Data Access Policy"), description, `ESC CLOSE` button, `SIMULATE` primary button.
- Tabs: `PLAN VIEW` | `RULE TABLE` | `JSON EXPORT`
- **PLAN VIEW**:
  - Left 66%: SVG canvas 880×460 with a 20px grid pattern, draggable rectangular nodes (148×44) in four kinds (source/condition/gate/resource), each with its own accent color. Bezier-curved edges with arrowheads connect them.
  - Right 34%: property inspector — Name (text), Effect (select), Max Risk Score (range slider 0–100), Simulated Impact stat rows.
  - Clicking a node shows accent corner crosshairs around it.
- **RULE TABLE**: 5-column rules table (#, Who, Conditions, Resource, Action with status chip)
- **JSON EXPORT**: pretty-printed JSON of the current policy

### Tweaks panel (bottom-right, 280px fixed)
Floating panel, not always open. Small `⚙ TWEAKS` trigger when closed.
- **METAPHOR**: Architecture · Workshop · Painter (three-button group; swaps accent color family + paper tone)
- **THEME**: Dark · Light
- **GRID**: On · Off (toggles the global 8px/80px grid)
- Keyboard: `T` toggle theme, `G` toggle grid, `M` cycle metaphor, `ESC` close drawers/panel

## Interactions & Behavior
- Selecting a pillar (from elevation chart OR heatmap row) updates the PillarInspector.
- Clicking a heatmap cell selects that pillar.
- Clicking `EDIT POLICY` / `OPEN POLICY EDITOR` / a backlog row opens the Policy Editor drawer for the associated pillar.
- Policy Editor nodes are draggable with mouse; position clamped to canvas bounds.
- Theme switch toggles `data-theme` on `<html>`. Metaphor switch toggles `data-metaphor`. Grid toggle injects/removes a `<style>` that hides `body::before`/`body::after`.
- Tweak values persist to `localStorage` under key `ztelier-tweaks` and also mirror to `window.parent.postMessage({ type: '__edit_mode_set_keys', edits })` for the host harness.
- Sort key in Backlog controls `INITIATIVES.sort(...)`.
- No animation beyond a blinking live-indicator dot (2s cycle) and subtle hover border-color shifts (120ms).

## State Management
Kept intentionally flat — single `App` component owns all state:
- `values`: `{ metaphor, theme, grid }` — Tweaks panel settings, persisted to localStorage
- `selectedPillar: string` — key of the pillar shown in the inspector
- `policyPillar: Pillar | null` — pillar the drawer is open for; `null` = closed
- `tweaksOpen: boolean`
- Sort key inside BacklogPanel is local state.
- PolicyEditor holds its own graph/form state.

In a production codebase use whatever state approach your team prefers (Zustand, Redux Toolkit, React Context, TanStack Query for server data). Pillars, initiatives, ROI months, alerts, and policy graph should all come from API endpoints.

## Design Tokens

### Color (Architecture metaphor — default)
**Dark**
| Token | Value | Use |
|---|---|---|
| `--paper-0` | `#0b0d10` | page background |
| `--paper-1` | `#101318` | panel surface |
| `--paper-2` | `#161a21` | inset surface |
| `--paper-3` | `#1b2029` | filled pillar / input base |
| `--line-0` | `#161b24` | fine 8px grid |
| `--line-1` | `#222938` | default border |
| `--line-2` | `#2e3647` | stronger border / table head |
| `--ink-1` | `#e8ecf2` | primary text |
| `--ink-2` | `#9aa5b5` | secondary text |
| `--ink-3` | `#5a6577` | tertiary / caption |
| `--ink-4` | `#3a4253` | quaternary |
| `--accent` | `#7fb4ff` | blueprint cyan (primary accent) |
| `--accent-2` | `#c4ccd8` | graphite |
| `--risk-high` | `#ff6b57` | vermilion |
| `--risk-med` | `#ffb347` | ochre |
| `--risk-low` | `#7fd4a3` | sage |

**Light** (off-white with subtle warm beige tint)
| Token | Value |
|---|---|
| `--paper-0` | `#faf8f3` |
| `--paper-1` | `#f4f1e9` |
| `--paper-2` | `#ede9dd` |
| `--paper-3` | `#e4dfd0` |
| `--line-0` | `#e8e3d4` |
| `--line-1` | `#d6cfbc` |
| `--line-2` | `#b8b09a` |
| `--accent` | `#1e4aa8` |
| `--risk-high` | `#c4442e` |
| `--risk-med` | `#b77a1e` |
| `--risk-low` | `#3c8e5e` |

Inks in light are `#15181d / #4a5162 / #6e7587 / #9aa0ad`.

### Metaphor variants
**Workshop** (moss + warm)
- Dark papers: `#0f100d / #15161f / #1b1c15 / #22241b`; lines `#262820 / #363a2d`
- Light papers: `#f7f4e8 / #efead8 / #e3dcc2`
- Accent: `#8ca87a`, accent-2 `#b8a88a`, trust `#8ca87a`

**Painter** (terracotta + linen)
- Dark papers: `#141110 / #1a1614 / #221d1a / #29231f`; lines `#33281f / #4a3a2d`
- Light papers: `#fbf6ec / #f5ecdc / #ebe0c9`
- Accent: `#d97757`, accent-2 `#e8d2a8`, trust `#d97757`

### Typography
- **Display / Headings**: `"Inter Tight", "Helvetica Neue", sans-serif` — `letter-spacing: -0.02em`
- **Body**: `"Inter", system-ui, -apple-system, "Segoe UI", sans-serif` — 13px / 1.5
- **Mono (drafting, numerics, labels)**: `"JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace`
- **Numbers**: `font-variant-numeric: tabular-nums`
- **Caps labels**: `text-transform: uppercase; letter-spacing: 0.12–0.14em; font-size: 10px`

Type scale (display):
- hero-metric 72px/0.95/-0.04em
- big-metric 40px/1/-0.03em
- H1 44px/1/-0.03em
- H2 24px/-0.02em
- H3 20px/-0.02em

### Spacing
- Outer padding per panel: 28–32px; hero 36–40px
- Grid gutter: 24px
- Inter-element gap inside panels: 14–20px
- Dash-grid is `grid-template-columns: repeat(12, 1fr)`

### Borders / Radii / Shadows
- **No border-radius anywhere.** Everything is square-cornered by design.
- **No drop shadows.** Separation comes from borders and crosshairs.
- Border widths: 1px everywhere (1.5px for ground line, 2px for the bottom of `kbd`).
- Common dash patterns: `2 4` (grid), `2 3` (target/callout), `4 3` (payback line), `3 3` (gap boundary), `6 4` (mean line).

### Iconography
- No emoji, no icon library. Visual vocabulary is:
  - Corner crosshairs (`+` marks)
  - Hatch SVG patterns (45° lines, 4–6px spacing) for gaps and excavations
  - Dimension lines (tick+line+label)
  - North arrow (circle + filled triangle + "N" label)
  - Section tags (circled letter like `A-A'`)
  - Title blocks (grid of mono labels at the bottom of each drawing)

## Data Model
See `src/data.jsx`. Shapes:

```ts
type Pillar = {
  key: string;         // 'ident' | 'devc' | 'netw' | 'appl' | 'data' | 'visi' | 'auto'
  code: string;        // 'ZT-01'..'ZT-07'
  name: string;        // 'Identity'
  jp: string;          // Japanese gloss (optional)
  current: number;     // 0..5
  target: number;      // 0..5
  max: 5;
  weight: number;      // sum to 1.0
};

type Initiative = {
  id: string;          // 'INIT-0042'
  code: string;        // 'A-001'
  name: string;
  pillar: Pillar['key'];
  effort: 'S' | 'M' | 'L' | 'XL';
  impact: number;      // 0..1
  cost: number;        // thousands USD
  months: number;
  status: 'queued' | 'design' | 'in-flight' | 'complete';
  owner: string;
};

type RoiMonth = { m: number; cost: number; saved: number; cumul: number };

type RoiSummary = {
  investment: number; avoidance: number; roi_pct: number; payback_months: number;
  breaches_avoided: number;
  mttd_before: number; mttd_after: number;
  mttr_before: number; mttr_after: number;
};

type Alert = {
  t: string;           // 'HH:MM:SS'
  sev: 'high' | 'med' | 'low';
  code: string;        // MITRE technique id
  label: string;
};

type PolicyGraph = {
  nodes: { id: string; kind: 'source'|'condition'|'gate'|'resource'; label: string; x: number; y: number }[];
  edges: [string, string][];
};
```

Heatmap is `number[7][9]`; residual risk 0..100 (higher = worse).

## Assets
No images. Everything is CSS/SVG. Google Fonts: Inter, Inter Tight, JetBrains Mono.

## Files in this bundle
- `Ztelier.html` — entry point, imports Google Fonts + styles + scripts
- `styles.css` — complete token system + drafting primitives
- `design-system-notes.md` — the original design spec written before implementation (highest-level source of truth for intent)
- `src/data.jsx` — seed data (replace with real API integration)
- `src/drafting.jsx` — Panel, PanelHeader, Crosshairs, TitleBlock, NorthArrow, DimLine, HatchPattern, Chip, SectionTag, Callout
- `src/elevation.jsx` — `<ElevationChart pillars onSelect selectedKey />`
- `src/roi-section.jsx` — `<RoiSection months payback />` and `<Heatmap pillars tactics matrix onCellClick />`
- `src/policy-editor.jsx` — `<PolicyEditor pillar onClose />` drawer
- `src/app.jsx` — App shell + Topbar + Hero + all panel compositions + Tweaks

## Implementation tips
- Keep the CSS-variable token system: it makes metaphor/theme switching trivial.
- Extract the "drafting" primitives (Crosshairs, Panel, TitleBlock, Chip, HatchPattern) into a shared internal UI library; they are the visual DNA of the product and will be reused across future screens.
- Move inline SVG charts (Elevation, RoiSection) to dedicated chart components with props for pillars/months so they can be fed real API data.
- The PolicyEditor canvas uses hand-rolled drag-and-drop against raw mouse events. In production, consider swapping for React Flow or XYFlow — the node/edge model is already compatible.
- For the drawer, use your router's modal pattern or a library like Radix Dialog.
- The Tweaks panel is host-harness-specific (`postMessage __edit_mode_set_keys`). In a real app, replace with a user-settings store.

## What's NOT in the prototype (intentional scope boundary)
- Authentication / multi-tenancy
- Real data sources (SIEM feed, CMDB, IdP sync)
- Audit log / change history on policies
- Mobile-responsive layout — designed for ≥1440px desktop
- Accessibility pass — developer should add proper ARIA roles for the drawer, heatmap, and draggable nodes (the prototype uses click/mouse only; keyboard-drag and screen-reader summaries need real implementation)

## Acceptance criteria
- All 8 dashboard panels render with the elevation chart correctly showing gap hatching and the ROI section showing excavated cost + savings stack + payback crossing.
- Theme switch + metaphor switch feel instant and persist across reload.
- Policy Editor drawer opens from backlog row or pillar inspector, nodes drag with the cursor, and the JSON tab reflects the current graph.
- No drop shadows and no border-radius anywhere. Corner crosshairs are present on every framed panel.
