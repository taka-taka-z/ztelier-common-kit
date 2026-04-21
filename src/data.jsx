// data.jsx — seed data for the Zero Trust maturity / ROI dashboard.
// Model follows NIST CSF 2.0-ish pillars adapted to Zero Trust.

const ZT_PILLARS = [
  { key: 'ident', code: 'ZT-01', name: 'Identity',            jp: '識別', current: 3.2, target: 4.5, max: 5, weight: 0.18 },
  { key: 'devc',  code: 'ZT-02', name: 'Device',              jp: '端末', current: 2.4, target: 4.0, max: 5, weight: 0.14 },
  { key: 'netw',  code: 'ZT-03', name: 'Network',             jp: '通信', current: 2.1, target: 4.2, max: 5, weight: 0.15 },
  { key: 'appl',  code: 'ZT-04', name: 'Application',         jp: '応用', current: 2.8, target: 4.3, max: 5, weight: 0.13 },
  { key: 'data',  code: 'ZT-05', name: 'Data',                jp: '資料', current: 1.8, target: 4.1, max: 5, weight: 0.16 },
  { key: 'visi',  code: 'ZT-06', name: 'Visibility & Analytics', jp: '観測', current: 2.6, target: 4.0, max: 5, weight: 0.12 },
  { key: 'auto',  code: 'ZT-07', name: 'Automation',          jp: '自動', current: 1.5, target: 3.8, max: 5, weight: 0.12 },
];

const MATURITY_TIERS = [
  { level: 0, label: 'Traditional',   jp: '従来型' },
  { level: 1, label: 'Initial',       jp: '初期'   },
  { level: 2, label: 'Developing',    jp: '発展'   },
  { level: 3, label: 'Defined',       jp: '確立'   },
  { level: 4, label: 'Advanced',      jp: '高度'   },
  { level: 5, label: 'Optimal',       jp: '最適'   },
];

// Threat heatmap: pillars × MITRE-style tactics
const TACTICS = ['Initial Access', 'Execution', 'Persistence', 'Priv. Esc.', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Exfiltration'];

// Values are residual risk 0..100 (higher = worse)
const HEATMAP = [
  // each row = pillar (7 × 9 tactics)
  [22, 18, 30, 12, 24, 14, 20, 18, 10],
  [64, 48, 52, 38, 42, 40, 35, 55, 28],
  [58, 44, 68, 52, 60, 46, 48, 74, 50],
  [32, 28, 40, 26, 34, 22, 30, 38, 24],
  [72, 56, 78, 60, 68, 52, 58, 66, 82],
  [38, 32, 44, 30, 36, 28, 34, 40, 30],
  [80, 66, 74, 68, 72, 58, 62, 70, 62],
];

// ROI projection over 36 months
// cost = investment outflow (negative), saved = expected breach / ops cost avoidance
const ROI_MONTHS = (() => {
  const arr = [];
  let cumul = 0;
  for (let m = 0; m <= 36; m++) {
    // cost: front-loaded
    const cost = m === 0 ? 480 : (m <= 6 ? 92 : (m <= 12 ? 48 : 18));
    // saved: grows as controls land
    const ramp = Math.min(1, m / 18);
    const saved = ramp * ramp * 120 + (m > 14 ? (m - 14) * 14 : 0);
    cumul += (saved - cost);
    arr.push({ m, cost, saved, cumul: Math.round(cumul) });
  }
  return arr;
})();

// Financial summary
const ROI_SUMMARY = {
  investment: 2_840_000, // $ over 36mo
  avoidance:  9_620_000,
  roi_pct: 239,
  payback_months: 19,
  breaches_avoided: 2.4, // expected, actuarial
  mttd_before: 187,      // days
  mttd_after:  12,
  mttr_before: 76,
  mttr_after:  4.5,
};

// Initiative / project backlog with estimated impact
const INITIATIVES = [
  { id: 'INIT-0042', code: 'A-001', name: 'Phishing-resistant MFA rollout',      pillar: 'ident', effort: 'M', impact: 0.72, cost: 320, months: 5,  status: 'in-flight', owner: 'S. Tanaka' },
  { id: 'INIT-0043', code: 'A-002', name: 'Device posture enforcement (CrowdStrike)', pillar: 'devc', effort: 'L', impact: 0.68, cost: 580, months: 8,  status: 'queued',    owner: 'R. Alvarez' },
  { id: 'INIT-0044', code: 'A-003', name: 'Microsegmentation (East-West)',       pillar: 'netw',  effort: 'XL', impact: 0.81, cost: 740, months: 11, status: 'queued',    owner: 'M. Ibrahim' },
  { id: 'INIT-0045', code: 'A-004', name: 'Data classification & labeling',      pillar: 'data',  effort: 'L', impact: 0.74, cost: 410, months: 7,  status: 'design',    owner: 'K. Park'    },
  { id: 'INIT-0046', code: 'A-005', name: 'SOC automation playbooks (T1)',       pillar: 'auto',  effort: 'M', impact: 0.58, cost: 240, months: 4,  status: 'in-flight', owner: 'J. Weiss'   },
  { id: 'INIT-0047', code: 'A-006', name: 'Privileged access workstations',      pillar: 'ident', effort: 'S', impact: 0.52, cost: 160, months: 3,  status: 'complete',  owner: 'S. Tanaka'  },
  { id: 'INIT-0048', code: 'A-007', name: 'UEBA rollout (identity + endpoint)',  pillar: 'visi',  effort: 'L', impact: 0.64, cost: 360, months: 6,  status: 'design',    owner: 'K. Park'    },
  { id: 'INIT-0049', code: 'A-008', name: 'Zero-standing-privilege for DBAs',    pillar: 'ident', effort: 'M', impact: 0.61, cost: 220, months: 4,  status: 'queued',    owner: 'S. Tanaka'  },
];

// Live alerts (for right gutter)
const LIVE_ALERTS = [
  { t: '13:42:08', sev: 'high', code: 'T1566', label: 'Spearphishing link (hr-inbox)' },
  { t: '13:38:51', sev: 'med',  code: 'T1110', label: 'Brute force — vpn-gw-03' },
  { t: '13:21:16', sev: 'low',  code: 'T1083', label: 'File discovery — svc-analytics' },
  { t: '13:04:02', sev: 'med',  code: 'T1078', label: 'Valid accounts — after-hours' },
  { t: '12:48:30', sev: 'low',  code: 'T1046', label: 'Net. service scanning' },
  { t: '12:31:47', sev: 'high', code: 'T1486', label: 'Data encrypted for impact (halted)' },
];

// Policy graph — nodes & edges for policy editor drawer
const POLICY_GRAPH = {
  nodes: [
    { id: 'src_any',   kind: 'source',    label: 'Any Identity',      x: 60,  y: 60  },
    { id: 'src_contr', kind: 'source',    label: 'Contractor Group',  x: 60,  y: 180 },
    { id: 'src_priv',  kind: 'source',    label: 'Privileged Admin',  x: 60,  y: 300 },
    { id: 'cond_geo',  kind: 'condition', label: 'Geo ∈ {JP,US,EU}',  x: 280, y: 90  },
    { id: 'cond_dev',  kind: 'condition', label: 'Device Healthy',    x: 280, y: 210 },
    { id: 'cond_mfa',  kind: 'condition', label: 'Phish-resist MFA',  x: 280, y: 330 },
    { id: 'gate',      kind: 'gate',      label: 'Evaluate',          x: 510, y: 210 },
    { id: 'dst_crm',   kind: 'resource',  label: 'CRM Prod',          x: 740, y: 80  },
    { id: 'dst_data',  kind: 'resource',  label: 'Data Lake',         x: 740, y: 210 },
    { id: 'dst_iam',   kind: 'resource',  label: 'IAM Console',       x: 740, y: 340 },
  ],
  edges: [
    ['src_any','cond_geo'], ['src_contr','cond_geo'], ['src_priv','cond_geo'],
    ['src_any','cond_dev'], ['src_contr','cond_dev'], ['src_priv','cond_dev'],
    ['src_any','cond_mfa'], ['src_contr','cond_mfa'], ['src_priv','cond_mfa'],
    ['cond_geo','gate'], ['cond_dev','gate'], ['cond_mfa','gate'],
    ['gate','dst_crm'], ['gate','dst_data'], ['gate','dst_iam'],
  ],
};

Object.assign(window, {
  ZT_PILLARS, MATURITY_TIERS, TACTICS, HEATMAP,
  ROI_MONTHS, ROI_SUMMARY, INITIATIVES, LIVE_ALERTS, POLICY_GRAPH,
});
