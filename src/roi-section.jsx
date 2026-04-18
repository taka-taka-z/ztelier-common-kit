// roi-section.jsx — ROI visualization rendered as an architectural section drawing.
// Months along x-axis; dollars along y-axis.
// - Investment (outflow) drawn as excavated foundation below the ground line.
// - Avoidance (savings) stacked above as building stories.
// - Cumulative net drawn as a curve.

function RoiSection({ months, payback }) {
  const W = 700;
  const H = 320;
  const padL = 56;
  const padR = 24;
  const padT = 24;
  const padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // month range
  const maxM = months[months.length - 1].m;
  // find max values
  const maxCost = Math.max(...months.map(d => d.cost));
  const maxSaved = Math.max(...months.map(d => d.saved));
  const maxCumul = Math.max(...months.map(d => Math.abs(d.cumul)));

  // split H in two: upper = savings, lower = costs (below ground)
  const groundY = padT + chartH * 0.42;
  const upperH = groundY - padT;
  const lowerH = (padT + chartH) - groundY;

  const xFor = (m) => padL + (m / maxM) * chartW;
  const yUp = (v) => groundY - (v / maxSaved) * upperH;
  const yDown = (v) => groundY + (v / maxCost) * lowerH;

  // cumulative curve (scaled across full H)
  const yCumul = (v) => {
    // map [-maxCumul, +maxCumul] to [padT+chartH, padT]
    const range = maxCumul;
    const t = (v + range) / (2 * range);
    return padT + chartH - t * chartH;
  };

  const cumulPath = months.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xFor(d.m)} ${yCumul(d.cumul)}`
  ).join(' ');

  const paybackX = xFor(payback);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <HatchPattern id="cost-hatch" color="var(--risk-high)" opacity="0.45" gap="4" />
      </defs>

      {/* grid lines (months) */}
      {[0, 6, 12, 18, 24, 30, 36].map((m) => (
        <g key={m}>
          <line x1={xFor(m)} y1={padT} x2={xFor(m)} y2={padT + chartH}
                stroke="var(--line-1)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={xFor(m)} y={padT + chartH + 16}
                textAnchor="middle" fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--ink-3)">
            M{String(m).padStart(2,'0')}
          </text>
        </g>
      ))}

      {/* savings bars (upper) */}
      {months.map((d) => (
        <rect key={`s${d.m}`}
              x={xFor(d.m) - 6} y={yUp(d.saved)}
              width={12}
              height={groundY - yUp(d.saved)}
              fill="var(--risk-low)" opacity="0.22"
              stroke="var(--risk-low)" strokeWidth="0.5" />
      ))}

      {/* cost bars (lower, excavated) */}
      {months.map((d) => (
        <rect key={`c${d.m}`}
              x={xFor(d.m) - 6} y={groundY}
              width={12}
              height={yDown(d.cost) - groundY}
              fill="url(#cost-hatch)"
              stroke="var(--risk-high)" strokeWidth="0.5" />
      ))}

      {/* ground line */}
      <line x1={padL} y1={groundY} x2={W - padR} y2={groundY}
            stroke="var(--ink-2)" strokeWidth="1.5" />

      {/* Axis labels — left side for "SAVINGS" and "COST" */}
      <text x={padL - 8} y={padT + 12} textAnchor="end"
            fontSize="9" fontFamily="JetBrains Mono, monospace"
            fill="var(--risk-low)" letterSpacing="0.14em">
        SAVED ↑
      </text>
      <text x={padL - 8} y={padT + chartH - 2} textAnchor="end"
            fontSize="9" fontFamily="JetBrains Mono, monospace"
            fill="var(--risk-high)" letterSpacing="0.14em">
        COST ↓
      </text>

      {/* Cumulative curve */}
      <path d={cumulPath} stroke="var(--accent)" strokeWidth="1.5" fill="none" />
      {/* zero crossing marker (payback) */}
      <g>
        <line x1={paybackX} y1={padT} x2={paybackX} y2={padT + chartH}
              stroke="var(--accent)" strokeWidth="0.75" strokeDasharray="4 3" />
        <circle cx={paybackX} cy={yCumul(0)} r="4" fill="var(--paper-0)" stroke="var(--accent)" strokeWidth="1.5"/>
        <text x={paybackX + 6} y={padT + 10} fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fill="var(--accent)" letterSpacing="0.1em">
          PAYBACK · M{payback}
        </text>
      </g>

      {/* Final cumul endpoint */}
      {(() => {
        const last = months[months.length - 1];
        return (
          <g>
            <circle cx={xFor(last.m)} cy={yCumul(last.cumul)} r="3" fill="var(--accent)"/>
            <text x={xFor(last.m) - 8} y={yCumul(last.cumul) - 6}
                  textAnchor="end" fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fill="var(--accent)" letterSpacing="0.08em">
              Σ +${(last.cumul).toLocaleString()}K
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// --- Heatmap ------------------------------------------------------------

function Heatmap({ pillars, tactics, matrix, onCellClick }) {
  // residual risk 0..100 → color intensity (uses risk palette)
  const colorFor = (v) => {
    if (v < 25) return `var(--risk-low)`;
    if (v < 50) return `var(--risk-med)`;
    if (v < 75) return `var(--risk-high)`;
    return `var(--risk-high)`;
  };
  const alphaFor = (v) => 0.12 + Math.min(1, v / 100) * 0.70;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `140px repeat(${tactics.length}, minmax(68px, 1fr))`,
        gap: 0,
      }}>
        {/* Header row */}
        <div />
        {tactics.map((t, i) => (
          <div key={i} style={{
            padding: '0 4px 10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            textAlign: 'center',
            lineHeight: 1.25,
            borderBottom: '1px solid var(--line-2)',
          }}>
            <div style={{ fontSize: 9, color: 'var(--ink-4)' }}>T{String(i + 1).padStart(2,'0')}</div>
            {t}
          </div>
        ))}

        {/* Rows */}
        {pillars.map((p, r) => (
          <React.Fragment key={p.key}>
            <div style={{
              padding: '10px 8px',
              fontFamily: 'Inter Tight, sans-serif',
              fontSize: 12,
              color: 'var(--ink-1)',
              borderRight: '1px solid var(--line-2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>{p.name}</span>
              <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>{p.code}</span>
            </div>
            {matrix[r].map((v, c) => (
              <div key={c}
                   className="heat-cell"
                   onClick={() => onCellClick && onCellClick(p, tactics[c], v)}
                   style={{
                     height: 44,
                     background: `color-mix(in oklab, ${colorFor(v)} ${alphaFor(v) * 100}%, transparent)`,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontFamily: 'JetBrains Mono, monospace',
                     fontSize: 11,
                     color: v > 50 ? 'var(--ink-1)' : 'var(--ink-2)',
                     fontVariantNumeric: 'tabular-nums',
                   }}>
                {v}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RoiSection, Heatmap });
