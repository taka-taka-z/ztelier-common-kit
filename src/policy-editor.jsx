// policy-editor.jsx — drawer with draggable policy graph editor + form.

function PolicyEditor({ pillar, onClose }) {
  const [graph, setGraph] = React.useState(POLICY_GRAPH);
  const [selected, setSelected] = React.useState(null);
  const [dragging, setDragging] = React.useState(null);
  const [mode, setMode] = React.useState('canvas'); // canvas | json | rules
  const [policyName, setPolicyName] = React.useState(`${pillar.name} — Tier ${pillar.target.toFixed(1)} Target Policy`);
  const [effect, setEffect] = React.useState('allow-with-step-up');
  const [riskThreshold, setRiskThreshold] = React.useState(40);
  const svgRef = React.useRef(null);

  const onMouseDown = (e, nodeId) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const scale = 880 / rect.width;
    setDragging({
      id: nodeId,
      offX: (e.clientX - rect.left) * scale - node.x,
      offY: (e.clientY - rect.top) * scale - node.y,
    });
    setSelected(nodeId);
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const scale = 880 / rect.width;
    const nx = (e.clientX - rect.left) * scale - dragging.offX;
    const ny = (e.clientY - rect.top) * scale - dragging.offY;
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === dragging.id ? { ...n, x: Math.max(10, Math.min(820, nx)), y: Math.max(10, Math.min(440, ny)) } : n),
    }));
  };

  const onMouseUp = () => setDragging(null);

  const colorFor = (kind) => ({
    source:    'var(--accent-2)',
    condition: 'var(--accent)',
    gate:      'var(--risk-med)',
    resource:  'var(--risk-low)',
  }[kind] || 'var(--ink-2)');

  const nodeW = 148, nodeH = 44;

  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <div className="label-xs" style={{ marginBottom: 6 }}>
              SECTION B-B' · POLICY · {pillar.code}
            </div>
            <div className="display" style={{ fontSize: 24 }}>
              {pillar.name} Access Policy
            </div>
            <div className="dim" style={{ fontSize: 12, marginTop: 6, maxWidth: 620 }}>
              Define who (source) can reach what (resource), under which conditions. Drag nodes to re-arrange. Click a node to edit.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost" onClick={onClose}>
              <span>ESC</span>
              <span>CLOSE</span>
            </button>
            <button className="btn btn--primary">SIMULATE</button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 2,
          padding: '10px 28px 0',
          borderBottom: '1px solid var(--line-1)',
        }}>
          {['canvas', 'rules', 'json'].map(m => (
            <div key={m} className="tab" data-active={mode === m} onClick={() => setMode(m)}>
              {m === 'canvas' ? 'PLAN VIEW' : m === 'rules' ? 'RULE TABLE' : 'JSON EXPORT'}
            </div>
          ))}
        </div>

        <div className="drawer-body" style={{ padding: 0 }}>
          {mode === 'canvas' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: 520 }}>
              {/* SVG canvas */}
              <div style={{ position: 'relative', padding: 20, borderRight: '1px solid var(--line-1)' }}>
                {/* mini legend */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
                  {[
                    { k: 'source',    l: 'SOURCE'    },
                    { k: 'condition', l: 'CONDITION' },
                    { k: 'gate',      l: 'GATE'      },
                    { k: 'resource',  l: 'RESOURCE'  },
                  ].map(x => (
                    <div key={x.k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 10, height: 10, border: `1px solid ${colorFor(x.k)}`, background: `color-mix(in oklab, ${colorFor(x.k)} 25%, transparent)` }}/>
                      <span className="label-xs">{x.l}</span>
                    </div>
                  ))}
                </div>

                <svg ref={svgRef}
                     viewBox="0 0 880 460"
                     width="100%"
                     onMouseMove={onMouseMove}
                     onMouseUp={onMouseUp}
                     onMouseLeave={onMouseUp}
                     style={{
                       background: 'var(--paper-1)',
                       border: '1px solid var(--line-2)',
                       display: 'block',
                       cursor: dragging ? 'grabbing' : 'default',
                     }}>
                  <defs>
                    <pattern id="canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--line-1)" strokeWidth="0.5"/>
                    </pattern>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-3)"/>
                    </marker>
                  </defs>
                  <rect width="880" height="460" fill="url(#canvas-grid)" />

                  {/* edges */}
                  {graph.edges.map(([a, b], i) => {
                    const na = graph.nodes.find(n => n.id === a);
                    const nb = graph.nodes.find(n => n.id === b);
                    if (!na || !nb) return null;
                    const x1 = na.x + nodeW;
                    const y1 = na.y + nodeH / 2;
                    const x2 = nb.x;
                    const y2 = nb.y + nodeH / 2;
                    const mx = (x1 + x2) / 2;
                    return (
                      <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                            stroke="var(--ink-3)" strokeWidth="1" fill="none" markerEnd="url(#arrow)" opacity="0.7"/>
                    );
                  })}

                  {/* nodes */}
                  {graph.nodes.map((n) => {
                    const col = colorFor(n.kind);
                    const isSel = selected === n.id;
                    return (
                      <g key={n.id}
                         transform={`translate(${n.x}, ${n.y})`}
                         onMouseDown={(e) => onMouseDown(e, n.id)}
                         style={{ cursor: 'grab' }}>
                        {/* crosshair selection */}
                        {isSel && (
                          <g stroke="var(--accent)" strokeWidth="1">
                            <line x1="-6" y1="-6" x2="2" y2="-6"/><line x1="-6" y1="-6" x2="-6" y2="2"/>
                            <line x1={nodeW - 2} y1="-6" x2={nodeW + 6} y2="-6"/><line x1={nodeW + 6} y1="-6" x2={nodeW + 6} y2="2"/>
                            <line x1="-6" y1={nodeH + 6} x2="2" y2={nodeH + 6}/><line x1="-6" y1={nodeH - 2} x2="-6" y2={nodeH + 6}/>
                            <line x1={nodeW - 2} y1={nodeH + 6} x2={nodeW + 6} y2={nodeH + 6}/><line x1={nodeW + 6} y1={nodeH - 2} x2={nodeW + 6} y2={nodeH + 6}/>
                          </g>
                        )}
                        <rect width={nodeW} height={nodeH}
                              fill={`color-mix(in oklab, ${col} 12%, var(--paper-0))`}
                              stroke={col} strokeWidth="1" />
                        <text x="10" y="16"
                              fontSize="8" fontFamily="JetBrains Mono, monospace"
                              letterSpacing="0.14em" fill={col} textTransform="uppercase">
                          {n.kind.toUpperCase()}
                        </text>
                        <text x="10" y="32"
                              fontSize="12" fontFamily="Inter Tight, sans-serif"
                              fill="var(--ink-1)">
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="titleblock" style={{ marginTop: 16 }}>
                  <div><span className="tb-label">Drawing</span><span className="tb-val">POLICY-{pillar.code}-PLAN</span></div>
                  <div><span className="tb-label">Nodes · Edges</span><span className="tb-val">{graph.nodes.length} · {graph.edges.length}</span></div>
                  <div><span className="tb-label">Grid</span><span className="tb-val">20px</span></div>
                </div>
              </div>

              {/* Inspector */}
              <div style={{ padding: 20 }}>
                <div className="label-xs" style={{ marginBottom: 10 }}>POLICY PROPERTIES</div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span className="label-xs">Name</span>
                    <input type="text" value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
                  </label>

                  <label style={{ display: 'grid', gap: 4 }}>
                    <span className="label-xs">Effect when evaluated</span>
                    <select value={effect} onChange={(e) => setEffect(e.target.value)}>
                      <option value="allow">Allow</option>
                      <option value="allow-with-step-up">Allow with step-up auth</option>
                      <option value="challenge">Challenge (re-auth)</option>
                      <option value="deny">Deny</option>
                      <option value="isolate">Isolate session</option>
                    </select>
                  </label>

                  <label style={{ display: 'grid', gap: 4 }}>
                    <span className="label-xs">Max risk score allowed</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="range" min="0" max="100" value={riskThreshold}
                             onChange={(e) => setRiskThreshold(+e.target.value)}
                             style={{ flex: 1 }} />
                      <span className="mono num" style={{ width: 40, textAlign: 'right' }}>{riskThreshold}</span>
                    </div>
                  </label>

                  <div style={{ marginTop: 10, borderTop: '1px solid var(--line-1)', paddingTop: 14 }}>
                    <div className="label-xs" style={{ marginBottom: 10 }}>SIMULATED IMPACT</div>
                    <SimRow label="Maturity lift"   val={`+${(pillar.target - pillar.current).toFixed(1)} tier`} good />
                    <SimRow label="Residual risk"   val={`−${Math.round((pillar.target - pillar.current) * 18)}%`} good />
                    <SimRow label="User friction"   val={`+${Math.round((5 - riskThreshold / 20) * 6)}%`} bad />
                    <SimRow label="Est. cost (12mo)" val={`$${Math.round(180 + (5 - riskThreshold / 20) * 40)}K`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'rules' && <RuleTable />}

          {mode === 'json' && (
            <pre style={{
              margin: 0,
              padding: 28,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: 'var(--ink-1)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
{JSON.stringify({
  name: policyName,
  pillar: pillar.code,
  effect,
  risk_threshold: riskThreshold,
  nodes: graph.nodes.map(({ id, kind, label }) => ({ id, kind, label })),
  edges: graph.edges,
}, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </>
  );
}

function SimRow({ label, val, good, bad }) {
  const color = good ? 'var(--risk-low)' : bad ? 'var(--risk-med)' : 'var(--ink-1)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--line-1)' }}>
      <span className="dim" style={{ fontSize: 11 }}>{label}</span>
      <span className="mono num" style={{ fontSize: 12, color }}>{val}</span>
    </div>
  );
}

function RuleTable() {
  const rules = [
    { w: 'Privileged Admin',   cond: 'MFA=phish-resistant AND Device.healthy', r: 'IAM Console', a: 'Allow · 4h session' },
    { w: 'Contractor Group',   cond: 'Geo ∈ {JP,US,EU} AND risk < 40',          r: 'CRM Prod',     a: 'Allow w/ step-up' },
    { w: 'Any Identity',       cond: 'Device.unmanaged',                         r: 'Data Lake',    a: 'Deny' },
    { w: 'Service Accounts',   cond: 'Workload.tag=prod AND SBOM attested',      r: 'Data Lake',    a: 'Allow · read-only' },
    { w: 'Any Identity',       cond: 'risk > 70',                                 r: 'Any',          a: 'Isolate session' },
  ];
  return (
    <div style={{ padding: 28 }}>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Who</th><th>Conditions</th><th>Resource</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r, i) => (
            <tr key={i}>
              <td className="mono dimmer">{String(i+1).padStart(3,'0')}</td>
              <td>{r.w}</td>
              <td className="mono" style={{ fontSize: 11 }}>{r.cond}</td>
              <td>{r.r}</td>
              <td><Chip variant={r.a.startsWith('Deny') || r.a.startsWith('Isolate') ? 'high' : r.a.startsWith('Allow w/') ? 'med' : 'low'}>{r.a}</Chip></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { PolicyEditor });
