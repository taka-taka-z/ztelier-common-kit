# Ztelier - Design System

## Concept
ゼロトラスト × 建築アトリエ。セキュリティ成熟度ギャップ分析とROI算出を、建築事務所の製図図面のメタファーで表現する。

## Core Metaphors (Tweakable)
1. **建築 (Architecture)** — DEFAULT. 青焼き・製図・断面図・寸法線・グリッド
2. **工房 (Workshop)** — 木目・型紙・治具・測定器
3. **画家 (Painter)** — キャンバス・絵の具スウォッチ・色見本・パレット

## Type System
- Display / Headings: "Neue Haas Grotesk Display" → substitute: `"Inter Tight", "Helvetica Neue"` 
- Body: `"Inter", system-ui`
- Mono (製図・数値): `"JetBrains Mono", "IBM Plex Mono"`

### Scales
- xs: 10px / 11px (寸法線ラベル)
- sm: 12px / 16px (caption / mono values)
- base: 13px / 18px (body)
- md: 15px / 22px (section titles)
- lg: 20px / 26px
- xl: 32px / 36px
- 2xl: 48px / 48px (headline)
- 3xl: 72px / 70px (hero metric)

## Color (Architecture / Dark - default)
- `--paper-0`: #0b0d10 (deep blueprint)
- `--paper-1`: #101318
- `--paper-2`: #161a21
- `--line-1`: #1f2632 (fine grid)
- `--line-2`: #2a3243 (major grid)
- `--ink-1`: #e8ecf2 (primary text)
- `--ink-2`: #9aa5b5 (secondary)
- `--ink-3`: #5a6577 (tertiary / dim)
- `--blueprint`: #7fb4ff (primary drafting line)
- `--graphite`: #c4ccd8
- Status:
  - `--risk-high`: #ff6b57 (vermilion)
  - `--risk-med`: #ffb347 (ochre)
  - `--risk-low`: #7fd4a3 (sage)
  - `--trust`: #7fb4ff (blueprint cyan)

## Color (Architecture / Light)
- `--paper-0`: #f4f1ea (bristol board warm)
- `--paper-1`: #ebe7dd
- `--paper-2`: #e4dfd2
- `--line-1`: #d2ccbc
- `--line-2`: #bbb29d
- `--ink-1`: #1a1d22
- `--ink-2`: #4a5162
- `--ink-3`: #78808f
- `--blueprint`: #2d5db8

## Visual Vocabulary
- **Grid**: Fine 8px grid + major 80px grid. Always visible at low opacity.
- **Dimension lines**: with tick marks and measurements in mono
- **North arrow / Scale bar**: decorative but functional
- **Section cuts (A-A')**: for hierarchy markers
- **Corner crosshairs**: instead of cards-with-shadow. Frame content with crosshair marks.
- **Hatching patterns**: for unknown/gap regions (SVG pattern fills)
- **Title blocks**: Bottom-right of every panel (date, drawing no., scale, author)

## Anti-patterns (avoid)
- Rounded cards with shadows
- Gradients (except functional heatmap)
- Emoji
- Inner glow / neumorphism
- Generic dashboard cards

## Data Viz Metaphors
- **Maturity gaps**: elevation / isometric drawing; pillars = NIST CSF categories at their current height vs target height
- **ROI over time**: plotted like a building section — foundation (cost) + stories (return) stacking
- **Policy flow**: connected nodes in plan-view; like an architectural plan with rooms and doorways
- **Risk heatmap**: contour lines (topographic map of risk)
