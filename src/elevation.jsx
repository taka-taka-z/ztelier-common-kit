// elevation.jsx — the hero "maturity elevation" chart.
// Each ZT pillar is drawn as a column in an architectural elevation drawing.
// Current height = filled column; target height = dashed outline above.
// Gap (delta) is rendered with hatch fill.

function ElevationChart({ pillars, onSelect, selectedKey }) {
  // SVG viewbox
  const W = 1100;
  const H = 420;
  const padL = 60;
  const padR = 40;
  const padT = 40;
  const padB = 90;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = pillars.length;
  const colW = chartW / n;
  const barW = colW * 0.46;

  // maturity levels 0..5 → y
  const yFor = (v) => padT + chartH - (v / 5) * chartH;

  // grid lines for tiers
  const gridLines = [0, 1, 2, 3, 4, 5];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <HatchPattern id="gap-hatch" color="var(--risk-med)" opacity="0.55" gap="4" />
        <HatchPattern id="ground-hatch" color="var(--ink-3)" opacity="0.35" gap="4" />
      </defs>

      {/* grid — tier lines */}
      {gridLines.map((t) => {
        const y = yFor(t);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
                  stroke="var(--line-1)" strokeWidth="1"
                  strokeDasharray={t === 0 || t === 5 ? '0' : '2 4'} />
            <text x={padL - 10} y={y + 3} textAnchor="end"
                  fontSize="9" fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.1em" fill="var(--ink-3)">
              TIER {t}
            </text>
            <text x={W - padR + 10} y={y + 3} textAnchor="start"
                  fontSize="9" fontFamily="JetBrains Mono, monospace"
                  fill="var(--ink-4)">
              {t.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* ground line (tier 0) */}
      <line x1={padL} y1={yFor(0)} x2={W - padR} y2={yFor(0)}
            stroke="var(--line-2)" strokeWidth="1.5" />
      {/* hatched ground */}
      <rect x={padL} y={yFor(0)} width={chartW} height="16" fill="url(#ground-hatch)" opacity="0.6"/>

      {/* pillars */}
      {pillars.map((p, i) => {
        const cx = padL + colW * (i + 0.5);
        const x = cx - barW / 2;
        const yCur = yFor(p.current);
        const yTgt = yFor(p.target);
        const yBase = yFor(0);
        const hCur = yBase - yCur;
        const hGap = yCur - yTgt;
        const selected = p.key === selectedKey;

        return (
          <g key={p.key}
             onClick={() => onSelect && onSelect(p.key)}
             style={{ cursor: 'pointer' }}>

            {/* Gap region (from current up to target) — hatched */}
            <rect x={x} y={yTgt} width={barW} height={hGap}
                  fill="url(#gap-hatch)" stroke="var(--risk-med)" strokeWidth="1"
                  strokeDasharray="3 3" opacity="0.9" />

            {/* Current (filled column) */}
            <rect x={x} y={yCur} width={barW} height={hCur}
                  fill={selected ? 'var(--accent)' : 'var(--paper-3)'}
                  stroke={selected ? 'var(--accent)' : 'var(--ink-3)'}
                  strokeWidth="1" />

            {/* inner subdivisions (story lines) — every 0.5 */}
            {Array.from({ length: Math.floor(p.current * 2) }).map((_, k) => {
              const sy = yBase - ((k + 1) * 0.5 / 5) * chartH;
              if (sy < yCur) return null;
              return (
                <line key={k} x1={x + 2} y1={sy} x2={x + barW - 2} y2={sy}
                      stroke={selected ? 'var(--paper-0)' : 'var(--ink-3)'}
                      strokeWidth="0.5" opacity="0.45" />
              );
            })}

            {/* Target cap (horizontal dashed) */}
            <line x1={x - 4} y1={yTgt} x2={x + barW + 4} y2={yTgt}
                  stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="4 3" />
            {/* Target tick marks on sides */}
            <line x1={x - 4} y1={yTgt - 3} x2={x - 4} y2={yTgt + 3} stroke="var(--accent)" strokeWidth="1"/>
            <line x1={x + barW + 4} y1={yTgt - 3} x2={x + barW + 4} y2={yTgt + 3} stroke="var(--accent)" strokeWidth="1"/>

            {/* Current value label inside top of column */}
            <text x={cx} y={yCur - 6} textAnchor="middle"
                  fontSize="11" fontFamily="JetBrains Mono, monospace"
                  fill={selected ? 'var(--accent)' : 'var(--ink-1)'}
                  fontWeight="500">
              {p.current.toFixed(1)}
            </text>

            {/* Gap delta label */}
            <text x={cx} y={yTgt + (hGap/2) + 3} textAnchor="middle"
                  fontSize="10" fontFamily="JetBrains Mono, monospace"
                  fill="var(--risk-med)" letterSpacing="0.05em">
              Δ{(p.target - p.current).toFixed(1)}
            </text>

            {/* Pillar label under ground line */}
            <text x={cx} y={yBase + 34} textAnchor="middle"
                  fontSize="11" fontFamily="Inter Tight, sans-serif"
                  fill={selected ? 'var(--accent)' : 'var(--ink-1)'}
                  letterSpacing="-0.01em">
              {p.name}
            </text>
            <text x={cx} y={yBase + 50} textAnchor="middle"
                  fontSize="9" fontFamily="JetBrains Mono, monospace"
                  fill="var(--ink-3)" letterSpacing="0.1em">
              {p.code}
            </text>

            {/* Column base dimension tick */}
            <line x1={x} y1={yBase} x2={x} y2={yBase + 4} stroke="var(--line-2)"/>
            <line x1={x + barW} y1={yBase} x2={x + barW} y2={yBase + 4} stroke="var(--line-2)"/>

            {/* Selected column annotation */}
            {selected && (
              <>
                <line x1={cx} y1={padT - 10} x2={cx} y2={yTgt - 10}
                      stroke="var(--accent)" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
                <text x={cx} y={padT - 14} textAnchor="middle"
                      fontSize="9" fontFamily="JetBrains Mono, monospace"
                      fill="var(--accent)" letterSpacing="0.14em">
                  ▼ SELECTED
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* overall average line */}
      {(() => {
        const avgCur = pillars.reduce((s,p)=>s+p.current*p.weight,0) / pillars.reduce((s,p)=>s+p.weight,0);
        const avgTgt = pillars.reduce((s,p)=>s+p.target*p.weight,0) / pillars.reduce((s,p)=>s+p.weight,0);
        return (
          <g>
            <line x1={padL} y1={yFor(avgCur)} x2={W - padR} y2={yFor(avgCur)}
                  stroke="var(--accent-2)" strokeWidth="0.75" strokeDasharray="6 4" opacity="0.7"/>
            <text x={W - padR - 4} y={yFor(avgCur) - 4} textAnchor="end"
                  fontSize="9" fontFamily="JetBrains Mono, monospace"
                  fill="var(--accent-2)" letterSpacing="0.12em">
              MEAN · CURRENT {avgCur.toFixed(2)}
            </text>
            <text x={W - padR - 4} y={yFor(avgTgt) - 4} textAnchor="end"
                  fontSize="9" fontFamily="JetBrains Mono, monospace"
                  fill="var(--accent)" letterSpacing="0.12em">
              MEAN · TARGET {avgTgt.toFixed(2)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

Object.assign(window, { ElevationChart });
