// Validates src/data/benchmarks.json before it reaches a build.
// Run after every data drop: npm run check:benchmarks
import { readFileSync } from 'node:fs';

const FILE = new URL('../src/data/benchmarks.json', import.meta.url);
const errors = [];
const fail = (message) => errors.push(message);

let bench;
try {
  bench = JSON.parse(readFileSync(FILE, 'utf8'));
} catch (error) {
  console.error(`benchmarks.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

for (const key of ['updated', 'repo', 'placeholder', 'metrics', 'workloads', 'runs']) {
  if (!(key in bench)) fail(`missing top-level key "${key}"`);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(bench.updated ?? '')) fail('"updated" must be YYYY-MM-DD');
if (!bench.runs?.length) fail('"runs" is empty');

for (const metric of bench.metrics ?? []) {
  if (metric.better !== 'higher' && metric.better !== 'lower') {
    fail(`metric "${metric.id}": "better" must be "higher" or "lower"`);
  }
}

for (const run of bench.runs ?? []) {
  for (const key of ['id', 'label', 'commit', 'hardware', 'php', 'load', 'db']) {
    if (!run[key]) fail(`run "${run.id}": missing "${key}"`);
  }
  if (!run.frameworks?.some((f) => f.ours)) {
    fail(`run "${run.id}": no framework marked "ours" — the chart has no baseline`);
  }
  for (const framework of run.frameworks ?? []) {
    for (const workload of bench.workloads ?? []) {
      const cell = framework.data?.[workload.id];
      if (!Array.isArray(cell) || cell.length !== bench.metrics.length) {
        fail(
          `run "${run.id}" / "${framework.name}" / "${workload.id}": expected ${bench.metrics.length} values, got ${
            Array.isArray(cell) ? cell.length : typeof cell
          }`,
        );
      } else if (cell.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
        fail(`run "${run.id}" / "${framework.name}" / "${workload.id}": non-numeric value`);
      }
    }
  }
}

if (errors.length) {
  console.error(`benchmarks.json: ${errors.length} problem(s)`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const newest = bench.runs[0];
console.log(
  `benchmarks.json ok — ${bench.runs.length} run(s), ${newest.frameworks.length} frameworks, ` +
    `${bench.workloads.length} workloads, ${bench.metrics.length} metrics; newest ${newest.id}, updated ${bench.updated}`,
);
if (bench.placeholder) {
  console.warn('WARNING: "placeholder": true — this is design-mock data and must not be deployed.');
}
