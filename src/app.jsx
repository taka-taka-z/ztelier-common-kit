// app.jsx — main dashboard composition.

const { useState, useEffect, useMemo } = React;

function Topbar({ theme, onToggleTheme, metaphor }) {
  const metaLabel = {
    architecture: 'ARCHITECTURE · 製図',
    workshop:     'WORKSHOP · 工房',
    painter:      'PAINTER · 絵画',
  }[metaphor];

  return (
    <div className="topbar">
      <div className="logo">
        <div className="logo-mark" />
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em' }}>Ztelier</div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
            ZERO-TRUST · DRAFTING STUDIO
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {['ELEVATION', 'HEATMAP', 'SECTION', 'BACKLOG', 'ALERTS'].map((t, i) => (
          <div key={t} className="tab" data-active={i === 0}>{t}</div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>
          <span className="blink" style={{ color: 'var(--risk-low)' }}>●</span> LIVE · {metaLabel}
        </div>
        <button className="btn btn--ghost" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☾ DARK' : '☀ LIGHT'}
        </button>
        <div style={{
          width: 32, height: 32, border: '1px solid var(--line-2)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--ink-2)',
        }}>ST</div>
      </div>
    </div>
  );
}

function HeroStrip({ pillars, roi }) {
  // weighted avg
  const avgCur = pillars.reduce((s,p)=>s+p.current*p.weight,0) / pillars.reduce((s,p)=>s+p.weight,0);
  const avgTgt = pillars.reduce((s,p)=>s+p.target*p.weight,0) / pillars.reduce((s,p)=>s+p.weight,0);

  return (
    <Panel className="col-12" style={{ padding: '36px 40px 28px', background: 'var(--paper-tint)', position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr auto', gap: 40, alignItems: 'end' }}>
        <div>
          <div className="label-xs" style={{ marginBottom: 10 }}>A-100 · ELEVATION · OVERALL MATURITY</div>
          <div className="display" style={{ fontSize: 44, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Your Zero Trust<br/>is a <span style={{ color: 'var(--accent)' }}>half-built structure.</span>
          </div>
          <div className="dim" style={{ fontSize: 13, maxWidth: 520, marginTop: 10 }}>
            Measured across seven load-bearing pillars. Target tier 4.1 — current tier {avgCur.toFixed(2)}.
            The shaded hatch marks each structural gap.
          </div>
        </div>

        <Metric label="CURRENT TIER" val={avgCur.toFixed(2)} unit="/ 5.00" />
        <Metric label="TARGET TIER"  val={avgTgt.toFixed(2)} unit="/ 5.00" accent />
        <Metric label="ROI · 36 MO"  val={`${roi.roi_pct}`} unit="%" accent />
        <Metric label="PAYBACK"      val={`${roi.payback_months}`} unit="MO" />

        <NorthArrow />
      </div>
    </Panel>
  );
}

function Metric({ label, val, unit, accent }) {
  return (
    <div>
      <div className="label-xs" style={{ marginBottom: 10 }}>{label}</div>
      <div className="big-metric" style={{ color: accent ? 'var(--accent)' : 'var(--ink-1)' }}>
        <span className="num">{val}</span>
        <span className="mono" style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 6, letterSpacing: '0.06em' }}>{unit}</span>
      </div>
    </div>
  );
}

function ElevationPanel({ pillars, selected, onSelect, onEditPolicy }) {
  return (
    <Panel className="col-8" framed style={{ padding: 32 }}>
      <PanelHeader
        code="A-101 · ELEVATION · FACADE SOUTH"
        title="Maturity by Pillar"
        subtitle="Columns rise to current tier. Dashed caps mark target. Hatched region is the gap to close."
        actions={
          <>
            <Chip>WEIGHTED</Chip>
            <button className="btn" onClick={() => onEditPolicy(pillars.find(p => p.key === selected) || pillars[0])}>
              EDIT POLICY <span style={{opacity:0.5}}>⎋</span>
            </button>
          </>
        } />

      <ElevationChart pillars={pillars} selectedKey={selected} onSelect={onSelect} />

      <div style={{ marginTop: 20 }}>
        <TitleBlock no="A-101" scale="1:50 · TIER" rev="r.14" date="2026.04.18" />
      </div>
    </Panel>
  );
}

function PillarInspector({ pillar, onEditPolicy }) {
  const gap = pillar.target - pillar.current;
  const gapPct = (gap / 5) * 100;
  return (
    <Panel className="col-4" framed style={{ padding: 28, display: 'grid', gap: 20, alignContent: 'start' }}>
      <PanelHeader
        code={`A-102 · DETAIL · ${pillar.code}`}
        title={pillar.name}
        subtitle={`Load-bearing pillar — weight ${(pillar.weight*100).toFixed(0)}% · ${pillar.jp}`}
      />

      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="label-xs">CURRENT</span>
          <span className="mono num" style={{ fontSize: 28, color: 'var(--ink-1)' }}>{pillar.current.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="label-xs">TARGET</span>
          <span className="mono num" style={{ fontSize: 28, color: 'var(--accent)' }}>{pillar.target.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="label-xs">GAP · Δ</span>
          <span className="mono num" style={{ fontSize: 28, color: 'var(--risk-med)' }}>{gap.toFixed(2)}</span>
        </div>

        {/* Gap bar */}
        <div style={{ position: 'relative', height: 26, border: '1px solid var(--line-2)', marginTop: 4 }}>
          <div style={{
            position: 'absolute', inset: 0, width: `${(pillar.current/5)*100}%`,
            background: 'var(--paper-3)', borderRight: '1px solid var(--ink-3)',
          }}/>
          <div className="hatch" style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${(pillar.current/5)*100}%`, width: `${gapPct}%`,
            borderRight: '1px dashed var(--accent)',
          }}/>
          <div style={{
            position: 'absolute', top: -4, bottom: -4,
            left: `${(pillar.target/5)*100}%`, width: 1,
            background: 'var(--accent)',
          }}/>
        </div>
        <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between', letterSpacing: '0.12em' }}>
          <span>0.00</span><span>2.50</span><span>5.00</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 14 }}>
        <div className="label-xs" style={{ marginBottom: 10 }}>RECOMMENDED INITIATIVES</div>
        {INITIATIVES.filter(i => i.pillar === pillar.key).slice(0, 3).map(i => (
          <div key={i.id} style={{
            display: 'flex', justifyContent: 'space-between', gap: 12,
            padding: '8px 0', borderBottom: '1px dashed var(--line-1)',
          }}>
            <div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>{i.code}</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>{i.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono num" style={{ color: 'var(--risk-low)', fontSize: 12 }}>+{i.impact.toFixed(2)}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{i.effort}·${i.cost}K</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn--primary" style={{ justifyContent: 'center' }} onClick={() => onEditPolicy(pillar)}>
        OPEN POLICY EDITOR
      </button>
    </Panel>
  );
}

function RoiPanel({ roi, months }) {
  return (
    <Panel className="col-7" framed style={{ padding: 32 }}>
      <PanelHeader
        code="A-201 · SECTION A-A' · RETURN ON INVESTMENT"
        title="ROI — 36 Month Projection"
        subtitle="Cost below the ground line (excavation). Savings above (structure). Cumulative net traced through."
        actions={<Chip variant="accent">MONTE CARLO · 10K RUNS</Chip>}
      />

      <RoiSection months={months} payback={roi.payback_months} />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        marginTop: 28, borderTop: '1px solid var(--line-1)', paddingTop: 18,
      }}>
        <Metric label="INVESTMENT"      val={`$${(roi.investment/1e6).toFixed(2)}M`} unit="36 MO" />
        <Metric label="LOSS AVOIDANCE"  val={`$${(roi.avoidance/1e6).toFixed(2)}M`} unit="EXPECTED" accent />
        <Metric label="MTTD · BEFORE → AFTER" val={`${roi.mttd_before} → ${roi.mttd_after}`} unit="DAYS" />
        <Metric label="MTTR · BEFORE → AFTER" val={`${roi.mttr_before} → ${roi.mttr_after}`} unit="HRS" />
      </div>

      <div style={{ marginTop: 16 }}>
        <TitleBlock no="A-201" scale="1:1000 · USD" rev="r.08" date="2026.04.18" />
      </div>
    </Panel>
  );
}

function HeatmapPanel({ onCellClick }) {
  return (
    <Panel className="col-5" framed style={{ padding: 28 }}>
      <PanelHeader
        code="A-301 · PLAN · THREAT × PILLAR"
        title="Residual Risk Topology"
        subtitle="Rows = pillars. Columns = MITRE-aligned tactics. Darker cells carry more residual risk."
        actions={<Chip variant="high">7 HOT-CELLS</Chip>}
      />
      <Heatmap
        pillars={ZT_PILLARS}
        tactics={TACTICS}
        matrix={HEATMAP}
        onCellClick={onCellClick}
      />
      <div style={{ marginTop: 20 }}>
        <TitleBlock no="A-301" scale="RISK 0–100" rev="r.22" date="2026.04.18" />
      </div>
    </Panel>
  );
}

function BacklogPanel({ onEditPolicy }) {
  const [sortKey, setSortKey] = useState('impact');
  const sorted = useMemo(() => {
    return [...INITIATIVES].sort((a, b) => {
      if (sortKey === 'impact') return b.impact - a.impact;
      if (sortKey === 'cost')   return a.cost - b.cost;
      if (sortKey === 'months') return a.months - b.months;
      return 0;
    });
  }, [sortKey]);

  const statusColor = (s) => ({
    'complete':  'low',
    'in-flight': 'accent',
    'design':    'med',
    'queued':    '',
  }[s]);

  return (
    <Panel className="col-8" framed style={{ padding: 28 }}>
      <PanelHeader
        code="A-401 · SCHEDULE · WORK PACKAGES"
        title="Initiative Backlog"
        subtitle="Ranked by impact-to-cost ratio. Click a row to open its policy drawer."
        actions={
          <div style={{ display: 'flex', gap: 4 }}>
            {[['impact', 'IMPACT'], ['cost', 'COST'], ['months', 'DURATION']].map(([k, l]) => (
              <div key={k} className="tab" data-active={sortKey === k} onClick={() => setSortKey(k)}>{l}</div>
            ))}
          </div>
        }
      />
      <table>
        <thead>
          <tr>
            <th style={{ width: 70 }}>ID</th>
            <th>Initiative</th>
            <th style={{ width: 110 }}>Pillar</th>
            <th style={{ width: 80 }}>Status</th>
            <th style={{ width: 100, textAlign: 'right' }}>Impact</th>
            <th style={{ width: 90, textAlign: 'right' }}>Cost</th>
            <th style={{ width: 80, textAlign: 'right' }}>Months</th>
            <th style={{ width: 110 }}>Owner</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(i => {
            const p = ZT_PILLARS.find(x => x.key === i.pillar);
            return (
              <tr key={i.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onEditPolicy(p)}>
                <td className="mono dimmer">{i.code}</td>
                <td>{i.name}</td>
                <td><span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.1em' }}>{p.code}</span> {p.name}</td>
                <td><Chip variant={statusColor(i.status)}>{i.status}</Chip></td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 60, height: 4, background: 'var(--paper-3)', border: '1px solid var(--line-1)' }}>
                      <div style={{ width: `${i.impact * 100}%`, height: '100%', background: 'var(--accent)' }}/>
                    </div>
                    <span className="mono num">{i.impact.toFixed(2)}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }} className="mono num">${i.cost}K</td>
                <td style={{ textAlign: 'right' }} className="mono num">{i.months}</td>
                <td className="dim">{i.owner}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 16 }}>
        <TitleBlock no="A-401" scale="1:1 · PACKAGE" rev="r.05" date="2026.04.18" />
      </div>
    </Panel>
  );
}

function AlertsPanel() {
  return (
    <Panel className="col-4" framed style={{ padding: 28 }}>
      <PanelHeader
        code="A-501 · LIVE · TELEMETRY"
        title="Field Notes"
        subtitle="Last 60 min · SIEM feed"
        actions={<span className="mono" style={{ fontSize: 10, color: 'var(--risk-low)', letterSpacing: '0.12em' }}><span className="blink">●</span> STREAMING</span>}
      />

      <div style={{ display: 'grid', gap: 10 }}>
        {LIVE_ALERTS.map((a, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '52px 56px 1fr auto',
            gap: 10, alignItems: 'baseline',
            padding: '8px 0',
            borderBottom: '1px dashed var(--line-1)',
          }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.t}</span>
            <Chip variant={a.sev === 'high' ? 'high' : a.sev === 'med' ? 'med' : 'low'}>{a.code}</Chip>
            <span style={{ fontSize: 12 }}>{a.label}</span>
            <span className="mono dimmer" style={{ fontSize: 10 }}>→</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <MiniStat label="MTTR · 24H" val="3.8" unit="HRS" />
        <MiniStat label="OPEN · SEV1" val="2" unit="" />
      </div>

      <div style={{ marginTop: 20 }}>
        <TitleBlock no="A-501" scale="UTC+09" rev="r.–" date="2026.04.18" />
      </div>
    </Panel>
  );
}

function MiniStat({ label, val, unit }) {
  return (
    <div style={{ border: '1px solid var(--line-1)', padding: 12 }}>
      <div className="label-xs" style={{ fontSize: 9, marginBottom: 6 }}>{label}</div>
      <div className="display num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>
        {val}<span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 4, letterSpacing: '0.1em' }}>{unit}</span>
      </div>
    </div>
  );
}

function LegendPanel() {
  return (
    <Panel className="col-12" crosshairs={false} style={{ padding: '20px 24px', borderTop: '1px solid var(--line-1)' }}>
      <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="18"><rect x="0" y="0" width="40" height="18" fill="var(--paper-3)" stroke="var(--ink-3)"/></svg>
          <span className="label-xs">CURRENT · FILLED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="18">
            <defs><HatchPattern id="legend-hatch" color="var(--risk-med)" opacity="0.55" gap="4"/></defs>
            <rect x="0" y="0" width="40" height="18" fill="url(#legend-hatch)" stroke="var(--risk-med)" strokeDasharray="3 3"/>
          </svg>
          <span className="label-xs">GAP · HATCHED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="18"><line x1="0" y1="9" x2="40" y2="9" stroke="var(--accent)" strokeDasharray="4 3"/></svg>
          <span className="label-xs">TARGET · DASHED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="18">
            <line x1="0" y1="9" x2="40" y2="9" stroke="var(--ink-2)" strokeWidth="1.5"/>
            <line x1="0" y1="13" x2="40" y2="13" stroke="var(--ink-3)" strokeDasharray="1 2"/>
          </svg>
          <span className="label-xs">GROUND · BASELINE TIER 0</span>
        </div>
        <div style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>
          ZTELIER · SHEET 01 OF 05 · ALL DIMENSIONS IN NIST-CSF TIER UNITS
        </span>
      </div>
    </Panel>
  );
}

function Tweaks({ values, onChange, onClose }) {
  const setKey = (k, v) => {
    const next = { ...values, [k]: v };
    onChange(next);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
    } catch(e) {}
  };

  return (
    <div className="tweaks-panel">
      <div className="head">
        <span>TWEAKS · 設定</span>
        <span style={{ cursor: 'pointer', color: 'var(--ink-3)' }} onClick={onClose}>✕</span>
      </div>
      <div className="body">
        <div>
          <div className="label-xs" style={{ marginBottom: 8 }}>METAPHOR</div>
          <div className="opt-row">
            {[
              ['architecture', 'ARCH · 建築'],
              ['workshop',     'WORK · 工房'],
              ['painter',      'PAINT · 画家'],
            ].map(([k, l]) => (
              <div key={k} className="opt" data-on={values.metaphor === k} onClick={() => setKey('metaphor', k)}>{l}</div>
            ))}
          </div>
        </div>

        <div>
          <div className="label-xs" style={{ marginBottom: 8 }}>THEME</div>
          <div className="opt-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="opt" data-on={values.theme === 'dark'}  onClick={() => setKey('theme', 'dark')}>DARK · 夜</div>
            <div className="opt" data-on={values.theme === 'light'} onClick={() => setKey('theme', 'light')}>LIGHT · 昼</div>
          </div>
        </div>

        <div>
          <div className="label-xs" style={{ marginBottom: 8 }}>GRID</div>
          <div className="opt-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="opt" data-on={values.grid === 'on'}  onClick={() => setKey('grid', 'on')}>ON</div>
            <div className="opt" data-on={values.grid === 'off'} onClick={() => setKey('grid', 'off')}>OFF</div>
          </div>
        </div>

        <div style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textAlign: 'center', marginTop: 4 }}>
          <kbd>T</kbd> theme &nbsp; <kbd>G</kbd> grid &nbsp; <kbd>M</kbd> metaphor
        </div>
      </div>
    </div>
  );
}

function App() {
  const defaults = window.__TWEAK_DEFAULTS__ || { metaphor: 'architecture', theme: 'dark', grid: 'on' };
  const [values, setValues] = useState(() => {
    try {
      const saved = localStorage.getItem('ztelier-tweaks');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch(e) {}
    return defaults;
  });
  const [selectedPillar, setSelectedPillar] = useState('data');
  const [policyPillar, setPolicyPillar] = useState(null);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = values.theme;
    document.documentElement.dataset.metaphor = values.metaphor;
    document.documentElement.dataset.grid = values.grid;
    try { localStorage.setItem('ztelier-tweaks', JSON.stringify(values)); } catch(e) {}
  }, [values]);

  // Hide global grid when grid=off
  useEffect(() => {
    const el = document.getElementById('grid-toggle-style');
    if (el) el.remove();
    if (values.grid === 'off') {
      const s = document.createElement('style');
      s.id = 'grid-toggle-style';
      s.textContent = `body::before, body::after { display: none !important; }`;
      document.head.appendChild(s);
    }
  }, [values.grid]);

  // Tweak mode protocol
  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(e) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 't' || e.key === 'T') setValues(v => ({ ...v, theme: v.theme === 'dark' ? 'light' : 'dark' }));
      if (e.key === 'g' || e.key === 'G') setValues(v => ({ ...v, grid: v.grid === 'on' ? 'off' : 'on' }));
      if (e.key === 'm' || e.key === 'M') {
        setValues(v => {
          const order = ['architecture', 'workshop', 'painter'];
          const i = order.indexOf(v.metaphor);
          return { ...v, metaphor: order[(i + 1) % order.length] };
        });
      }
      if (e.key === 'Escape') { setPolicyPillar(null); setTweaksOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const selectedP = ZT_PILLARS.find(p => p.key === selectedPillar) || ZT_PILLARS[0];

  return (
    <div className="app">
      <Topbar theme={values.theme} metaphor={values.metaphor}
              onToggleTheme={() => setValues(v => ({ ...v, theme: v.theme === 'dark' ? 'light' : 'dark' }))} />

      <div className="main" data-screen-label="01 Dashboard">
        <div className="dash-grid">
          <HeroStrip pillars={ZT_PILLARS} roi={ROI_SUMMARY} />

          <ElevationPanel
            pillars={ZT_PILLARS}
            selected={selectedPillar}
            onSelect={setSelectedPillar}
            onEditPolicy={setPolicyPillar}
          />
          <PillarInspector pillar={selectedP} onEditPolicy={setPolicyPillar} />

          <RoiPanel roi={ROI_SUMMARY} months={ROI_MONTHS} />
          <HeatmapPanel onCellClick={(p) => setSelectedPillar(p.key)} />

          <BacklogPanel onEditPolicy={setPolicyPillar} />
          <AlertsPanel />

          <LegendPanel />
        </div>
      </div>

      {policyPillar && <PolicyEditor pillar={policyPillar} onClose={() => setPolicyPillar(null)} />}

      {tweaksOpen && (
        <Tweaks values={values}
                onChange={setValues}
                onClose={() => setTweaksOpen(false)} />
      )}

      {/* Always-visible floating tweaks trigger (if panel not open) */}
      {!tweaksOpen && (
        <div onClick={() => setTweaksOpen(true)} style={{
          position: 'fixed', bottom: 20, right: 20,
          background: 'var(--paper-1)', border: '1px solid var(--line-2)',
          padding: '10px 14px', cursor: 'pointer', zIndex: 90,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)',
        }}>
          ⚙ TWEAKS
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
