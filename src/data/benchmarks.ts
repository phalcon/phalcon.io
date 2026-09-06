// Typed loader for the benchmark dataset. All the numbers live in
// benchmarks.json — that file is the only thing a new run has to touch, so a
// daily or weekly publish is a data commit, not a code change.
//
// To publish a run: prepend it to `runs` in benchmarks.json, set `updated`, and
// rebuild. Nothing here or in the components needs editing. Adding a metric or
// a workload is likewise a JSON edit; the tab rows are generated from the file.
//
// ---------------------------------------------------------------------------
// WARNING: benchmarks.json currently holds PLACEHOLDER DATA from the design
// mock, and `placeholder: true` records that. The referenced repository does
// not exist yet, so none of it is reproducible. Replace the file with a real
// run — or drop <Benchmarks /> from src/pages/index.astro — before deploying.
// ---------------------------------------------------------------------------
import raw from './benchmarks.json';

export interface Metric {
  id: string;
  label: string;
  unit: string;
  better: 'higher' | 'lower';
  /** Decimal places; 0 renders as a thousands-separated integer. */
  dec: number;
}

export interface Workload {
  id: string;
  label: string;
}

export interface Framework {
  name: string;
  sub: string;
  install: string;
  /** Marks the baseline every other row is compared against. */
  ours?: boolean;
  /** Keyed by workload id; values follow `metrics` order. */
  data: Record<string, number[]>;
}

export interface Run {
  id: string;
  label: string;
  commit: string;
  hardware: string;
  php: string;
  load: string;
  db: string;
  frameworks: Framework[];
}

export interface BenchmarkData {
  updated: string;
  repo: string;
  placeholder: boolean;
  metrics: Metric[];
  workloads: Workload[];
  runs: Run[];
}

export const BENCH = raw as BenchmarkData;

/** Repository the section links to and the "reproduce it" panel clones. */
export const BENCH_REPO = BENCH.repo;
