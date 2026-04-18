// drafting.jsx — low-level drafting primitives (crosshairs, dim lines, title blocks, etc.)

function Crosshairs() {
  return (
    <>
      <div className="xh xh--tl" />
      <div className="xh xh--tr" />
      <div className="xh xh--bl" />
      <div className="xh xh--br" />
    </>
  );
}

function Panel({ children, className = '', framed = false, crosshairs = true, style, ...rest }) {
  return (
    <div
      className={`panel ${framed ? 'panel--framed' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {crosshairs && <Crosshairs />}
      {children}
    </div>
  );
}

function PanelHeader({ code, title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 24,
      marginBottom: 20,
    }}>
      <div>
        <div className="label-xs" style={{ marginBottom: 6 }}>{code}</div>
        <div className="display" style={{ fontSize: 20, letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

function TitleBlock({ no, scale, date, drawer, rev }) {
  return (
    <div className="titleblock">
      <div>
        <span className="tb-label">Project</span>
        <span className="tb-val">ZTELIER / ZERO-TRUST GAP ANALYSIS — FY26</span>
      </div>
      <div>
        <span className="tb-label">Drawing no.</span>
        <span className="tb-val">{no}</span>
      </div>
      <div>
        <span className="tb-label">Scale · Rev · Date</span>
        <span className="tb-val">{scale} · {rev} · {date}</span>
      </div>
    </div>
  );
}

function NorthArrow() {
  return (
    <svg className="north" viewBox="0 0 36 36" fill="none" stroke="currentColor">
      <circle cx="18" cy="18" r="15" stroke="var(--line-2)" strokeWidth="1" />
      <path d="M18 5 L22 22 L18 18 L14 22 Z" fill="var(--accent)" stroke="var(--accent)" />
      <text x="18" y="34" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="var(--ink-3)" letterSpacing="0.1em">N</text>
    </svg>
  );
}

// Dimension line SVG — shows the measurement between two X positions
function DimLine({ x1, x2, y, label, color = 'var(--ink-3)' }) {
  const tickH = 5;
  return (
    <g>
      <line x1={x1} y1={y - tickH} x2={x1} y2={y + tickH} stroke={color} strokeWidth="1" />
      <line x1={x2} y1={y - tickH} x2={x2} y2={y + tickH} stroke={color} strokeWidth="1" />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="1" />
      {label && (
        <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle"
              fontSize="9" fill={color} fontFamily="JetBrains Mono, monospace" letterSpacing="0.08em">
          {label}
        </text>
      )}
    </g>
  );
}

// Hatch SVG pattern - diagonal lines for "gap" fills
function HatchPattern({ id = 'hatch', color = 'currentColor', opacity = 0.25, gap = 5 }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2={gap} stroke={color} strokeWidth="1" opacity={opacity} />
    </pattern>
  );
}

function Chip({ children, variant = '' }) {
  const cls = variant ? `chip chip--${variant}` : 'chip';
  return <span className={cls}>{children}</span>;
}

function SectionTag({ letter = 'A', children }) {
  return (
    <span className="section-tag">
      <span className="bullet">{letter}</span>
      {children}
    </span>
  );
}

// Annotation arrow — from (x1,y1) to (x2,y2) with a text callout
function Callout({ x1, y1, x2, y2, text, anchor = 'start', color = 'var(--ink-3)' }) {
  // elbow path
  const mx = x1;
  return (
    <g>
      <path d={`M ${x1} ${y1} L ${mx} ${y2} L ${x2} ${y2}`} stroke={color} strokeWidth="1" fill="none" strokeDasharray="2 3" />
      <circle cx={x1} cy={y1} r="2.5" fill={color} />
      <text x={x2 + (anchor === 'start' ? 6 : -6)} y={y2 + 4}
            textAnchor={anchor} fontSize="10"
            fontFamily="JetBrains Mono, monospace"
            fill={color} letterSpacing="0.08em">
        {text}
      </text>
    </g>
  );
}

Object.assign(window, {
  Crosshairs, Panel, PanelHeader, TitleBlock, NorthArrow,
  DimLine, HatchPattern, Chip, SectionTag, Callout,
});
