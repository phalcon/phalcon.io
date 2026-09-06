// Derives everything the benchmark section shows from (run, metric, workload).
// Imported twice on purpose: once in Benchmarks.astro to server-render the
// default state, once in that component's client script to re-render on tab
// clicks — so the projection and the markup have exactly one definition.
//
// The generated fragments use inline styles rather than utility classes: they
// are produced from strings at runtime, where Tailwind's source scanner cannot
// see them.
import type { BenchmarkData, Metric, Run } from '../data/benchmarks';

export type Tone = 'dark' | 'light';

interface Palette {
  nameOurs: string;
  name: string;
  sub: string;
  value: string;
  deltaBase: string;
  deltaWin: string;
  barOurs: string;
  barOther: string;
  track: string;
  trackBorder: string;
  cellActive: string;
  cellIdle: string;
  envValue: string;
  zebra: string;
  rowLine: string;
}

// Light values come from the site's light-tone tokens in global.css
// (ink-900/600/400, teal-600, success-600, lightline-*, paper-50).
const PALETTES: Record<Tone, Palette> = {
  dark: {
    nameOurs: '#d7e3dd',
    name: '#93a49d',
    sub: '#5e7269',
    value: '#cbd8d2',
    deltaBase: '#6f837c',
    deltaWin: '#8fc19a',
    barOurs: '#74ccb2',
    barOther: '#3f5950',
    track: '#0d1614',
    trackBorder: '#17221f',
    cellActive: '#cbd8d2',
    cellIdle: '#75887f',
    envValue: '#a9bab3',
    zebra: '#0a1210',
    rowLine: '#12201d',
  },
  light: {
    nameOurs: '#0f1a17',
    name: '#4b6157',
    sub: '#7d938a',
    value: '#0f1a17',
    deltaBase: '#7d938a',
    deltaWin: '#2f8f5b',
    barOurs: '#0f9e86',
    barOther: '#c3d5ca',
    track: '#f7faf8',
    trackBorder: '#e4ede8',
    cellActive: '#0f1a17',
    cellIdle: '#7d938a',
    envValue: '#0f1a17',
    zebra: '#f7faf8',
    rowLine: '#e4ede8',
  },
};

export interface ChartRow {
  name: string;
  sub: string;
  value: string;
  delta: string;
  /** Semantic, not a colour — the palette is applied when the row is rendered. */
  deltaKind: 'baseline' | 'better' | 'worse';
  pct: number;
  ours: boolean;
}

export interface TableRow {
  name: string;
  sub: string;
  ours: boolean;
  cells: string[];
}

export interface BenchView {
  runId: string;
  chartTitle: string;
  betterNote: string;
  metricUnit: string;
  baseName: string;
  midTick: string;
  maxTick: string;
  tableTitle: string;
  workloadIndex: number;
  rows: ChartRow[];
  tableRows: TableRow[];
  env: { k: string; v: string }[];
}

function format(value: number, metric: Metric): string {
  return metric.dec ? value.toFixed(metric.dec) : Math.round(value).toLocaleString('en-US');
}

export function buildView(
  bench: BenchmarkData,
  runId: string,
  metricId: string,
  workloadId: string,
): BenchView {
  const run: Run = bench.runs.find((r) => r.id === runId) ?? bench.runs[0];
  const metricIndex = Math.max(
    0,
    bench.metrics.findIndex((m) => m.id === metricId),
  );
  const metric = bench.metrics[metricIndex];
  const workloadIndex = Math.max(
    0,
    bench.workloads.findIndex((w) => w.id === workloadId),
  );
  const workload = bench.workloads[workloadIndex];

  const values = run.frameworks.map((f) => f.data[workload.id][metricIndex]);
  const max = Math.max(...values);
  const baseIndex = Math.max(
    0,
    run.frameworks.findIndex((f) => f.ours),
  );
  const baseValue = values[baseIndex];

  const rows: ChartRow[] = run.frameworks.map((f, i) => {
    const value = values[i];
    const isBase = i === baseIndex;
    const wins = metric.better === 'higher' ? value > baseValue : value < baseValue;
    return {
      name: f.name,
      sub: f.sub,
      ours: !!f.ours,
      pct: Math.max(1.5, (value / max) * 100),
      value: format(value, metric),
      delta: isBase ? 'baseline' : `${(value / baseValue).toFixed(2)}×`,
      deltaKind: isBase ? 'baseline' : wins ? 'better' : 'worse',
    };
  });

  const tableRows: TableRow[] = run.frameworks.map((f) => ({
    name: f.name,
    sub: `${f.sub} · ${f.install}`,
    ours: !!f.ours,
    cells: bench.workloads.map((w) => format(f.data[w.id][metricIndex], metric)),
  }));

  return {
    runId: run.id,
    chartTitle: `${workload.label} · ${metric.label} (${metric.unit})`,
    betterNote:
      metric.better === 'higher'
        ? 'higher is better · axis starts at zero'
        : 'lower is better · axis starts at zero',
    metricUnit: metric.unit,
    baseName: run.frameworks[baseIndex].name,
    midTick: format(max / 2, metric),
    maxTick: `${format(max, metric)} ${metric.unit}`,
    tableTitle: `${metric.label} (${metric.unit}) across all six workloads · run ${run.id} · commit ${run.commit}`,
    workloadIndex,
    rows,
    tableRows,
    env: [
      { k: 'hardware', v: run.hardware },
      { k: 'php', v: run.php },
      { k: 'load', v: run.load },
      { k: 'database', v: run.db },
      { k: 'commit', v: `${run.commit} · dataset benchmarks.ts` },
    ],
  };
}

const GRID = 'display:grid;grid-template-columns:210px minmax(0,1fr) 96px 72px;align-items:center;gap:14px;';
const ELLIPSIS = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

export function chartRowsHtml(view: BenchView, tone: Tone = 'dark'): string {
  const C = PALETTES[tone];
  const deltaColor = { baseline: C.deltaBase, better: C.deltaWin, worse: C.name };
  return view.rows
    .map(
      (r) => `<div style="${GRID}">
  <div style="text-align:right;min-width:0;">
    <div style="font-size:11.5px;line-height:1.3;font-weight:600;color:${r.ours ? C.nameOurs : C.name};${ELLIPSIS}">${r.name}</div>
    <div style="margin-top:3px;font-size:10px;line-height:1.3;font-weight:500;color:${C.sub};${ELLIPSIS}">${r.sub}</div>
  </div>
  <div style="position:relative;height:24px;background:${C.track};border:1px solid ${C.trackBorder};border-radius:2px;overflow:hidden;">
    <div style="position:absolute;top:0;bottom:0;left:0;width:${r.pct.toFixed(2)}%;background:${r.ours ? C.barOurs : C.barOther};"></div>
  </div>
  <div style="font-size:12px;font-weight:600;color:${C.value};text-align:right;">${r.value}</div>
  <div style="font-size:11px;font-weight:500;color:${deltaColor[r.deltaKind]};text-align:right;">${r.delta}</div>
</div>`,
    )
    .join('');
}

export function tableBodyHtml(view: BenchView, tone: Tone = 'dark'): string {
  const C = PALETTES[tone];
  return view.tableRows
    .map(
      (r, i) => `<tr style="background:${i % 2 ? C.zebra : 'transparent'};">
  <td style="padding:10px 16px;border-bottom:1px solid ${C.rowLine};color:${r.ours ? C.nameOurs : C.name};white-space:nowrap;">${r.name}
    <span style="display:block;margin-top:3px;font-size:10px;line-height:1.3;font-weight:500;color:${C.sub};">${r.sub}</span>
  </td>
  ${r.cells
    .map(
      (c, ci) =>
        `<td style="padding:10px 12px;border-bottom:1px solid ${C.rowLine};text-align:right;white-space:nowrap;color:${ci === view.workloadIndex ? C.cellActive : C.cellIdle};">${c}</td>`,
    )
    .join('')}
</tr>`,
    )
    .join('');
}

export function envRowsHtml(view: BenchView, tone: Tone = 'dark'): string {
  const C = PALETTES[tone];
  return view.env
    .map(
      (e) => `<div style="display:grid;grid-template-columns:92px minmax(0,1fr);gap:10px;font-size:11.5px;line-height:1.6;font-weight:500;">
  <span style="color:${C.sub};">${e.k}</span><span style="color:${C.envValue};">${e.v}</span>
</div>`,
    )
    .join('');
}
