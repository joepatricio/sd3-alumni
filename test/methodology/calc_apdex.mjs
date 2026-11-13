#!/usr/bin/env node
/**
 * APDEX (Application Performance Index) Calculator for JMeter JTL Runs
 *
 * Parses JMeter CSV JTL result files, correctly handling quoted URL/query strings,
 * and computes exact APDEX scores across stepped concurrency tiers and individual routes.
 *
 * Usage:
 *   node test/methodology/calc_apdex.mjs [options]
 *
 * Options:
 *   --jtl <path>       Path to JTL file (default: test/load/results/jmeter_results_load.jtl)
 *   --t <ms>           Satisficing threshold T in ms (default: 500)
 *   --f <ms>           Frustrating threshold F in ms (default: 1500)
 *   --routes           Include per-route APDEX ranking table
 *   --format <type>    Output format: table (default), markdown, json
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

function parseArgs(argv) {
  const args = {
    jtlPath: "",
    T: 500,
    F: 1500,
    showRoutes: false,
    format: "table"
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--jtl" && i + 1 < argv.length) {
      args.jtlPath = argv[++i];
    } else if (a === "--t" && i + 1 < argv.length) {
      args.T = parseInt(argv[++i], 10);
    } else if (a === "--f" && i + 1 < argv.length) {
      args.F = parseInt(argv[++i], 10);
    } else if (a === "--routes") {
      args.showRoutes = true;
    } else if (a === "--format" && i + 1 < argv.length) {
      args.format = argv[++i].toLowerCase();
    } else if (a === "--json") {
      args.format = "json";
    } else if (a === "--markdown") {
      args.format = "markdown";
    }
  }

  if (!args.jtlPath) {
    const candidates = [
      path.join(REPO_ROOT, "test/load/results/jmeter_results_load.jtl"),
      path.join(REPO_ROOT, "test/load/results/jmeter_results.jtl"),
      path.join(REPO_ROOT, "jmeter_results_load.jtl")
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        args.jtlPath = c;
        break;
      }
    }
  }

  return args;
}

function parseCsvLine(text) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

function getApdexRating(score) {
  if (score >= 0.94) return "Excellent";
  if (score >= 0.85) return "Good";
  if (score >= 0.70) return "Fair";
  if (score >= 0.50) return "Poor";
  return "Unacceptable";
}

async function computeApdex() {
  const args = parseArgs(process.argv);

  if (!args.jtlPath || !fs.existsSync(args.jtlPath)) {
    console.error(`Error: JTL file not found at "${args.jtlPath || "default paths"}"`);
    process.exit(1);
  }

  const { T, F } = args;

  const tiers = {
    "Stepped Tier 1 (100 VUs)": { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 },
    "Stepped Tier 2 (250 VUs)": { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 },
    "Stepped Tier 3 (500 VUs)": { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 },
    "Stepped Tier 4 (750 VUs)": { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 },
    "Stepped Tier 5 (1000 VUs)": { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 }
  };

  const routes = new Map();
  const overall = { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 };

  const rl = readline.createInterface({
    input: fs.createReadStream(args.jtlPath),
    crlfDelay: Infinity
  });

  let headerRead = false;
  let elapsedIdx = 1;
  let labelIdx = 2;
  let threadIdx = 5;
  let successIdx = 7;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = parseCsvLine(line);

    if (!headerRead) {
      headerRead = true;
      elapsedIdx = parts.indexOf("elapsed");
      labelIdx = parts.indexOf("label");
      threadIdx = parts.indexOf("threadName");
      successIdx = parts.indexOf("success");
      if (elapsedIdx === -1 || successIdx === -1) {
        elapsedIdx = 1; labelIdx = 2; threadIdx = 5; successIdx = 7;
      }
      continue;
    }

    const elapsed = parseInt(parts[elapsedIdx], 10);
    const success = parts[successIdx] === "true";
    const label = parts[labelIdx] || "unknown";
    const threadName = parts[threadIdx] || "";

    function recordSample(bucket) {
      bucket.total++;
      if (!success) {
        bucket.frustrated++;
        bucket.errors++;
      } else if (elapsed <= T) {
        bucket.satisfied++;
      } else if (elapsed <= F) {
        bucket.tolerating++;
      } else {
        bucket.frustrated++;
      }
    }

    recordSample(overall);

    for (const tierKey of Object.keys(tiers)) {
      if (threadName.startsWith(tierKey)) {
        recordSample(tiers[tierKey]);
        break;
      }
    }

    if (args.showRoutes) {
      if (!routes.has(label)) {
        routes.set(label, { satisfied: 0, tolerating: 0, frustrated: 0, errors: 0, total: 0 });
      }
      recordSample(routes.get(label));
    }
  }

  function formatSummary(obj) {
    const apdex = obj.total > 0 ? (obj.satisfied + 0.5 * obj.tolerating) / obj.total : 0;
    return {
      total: obj.total,
      satisfied: obj.satisfied,
      satisfiedPct: obj.total > 0 ? (obj.satisfied / obj.total * 100).toFixed(2) + "%" : "0.00%",
      tolerating: obj.tolerating,
      toleratingPct: obj.total > 0 ? (obj.tolerating / obj.total * 100).toFixed(2) + "%" : "0.00%",
      frustrated: obj.frustrated,
      frustratedPct: obj.total > 0 ? (obj.frustrated / obj.total * 100).toFixed(2) + "%" : "0.00%",
      errors: obj.errors,
      errorPct: obj.total > 0 ? (obj.errors / obj.total * 100).toFixed(2) + "%" : "0.00%",
      apdexScore: apdex.toFixed(3),
      apdexScoreExact: apdex,
      rating: getApdexRating(apdex)
    };
  }

  const results = {
    jtlPath: args.jtlPath,
    thresholds: { T, F },
    tiers: {},
    overall: formatSummary(overall)
  };

  for (const [tierName, data] of Object.entries(tiers)) {
    results.tiers[tierName] = formatSummary(data);
  }

  if (args.showRoutes) {
    results.routes = {};
    for (const [label, data] of routes.entries()) {
      results.routes[label] = formatSummary(data);
    }
  }

  if (args.format === "json") {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (args.format === "markdown") {
    console.log(`### APDEX Report (T=${T}ms, F=${F}ms)\n`);
    console.log(`Source: \`${path.relative(REPO_ROOT, args.jtlPath)}\`\n`);
    console.log(`| Concurrency Tier | Total Samples | Satisfied (<= ${T}ms) | Tolerating (${T}-${F}ms) | Frustrated (> ${F}ms) | Errors | APDEX Score | Rating |`);
    console.log(`|---|---:|---:|---:|---:|---:|---:|:---:|`);
    for (const [tierName, t] of Object.entries(results.tiers)) {
      console.log(`| **${tierName}** | ${t.total.toLocaleString()} | ${t.satisfied.toLocaleString()} (${t.satisfiedPct}) | ${t.tolerating.toLocaleString()} (${t.toleratingPct}) | ${t.frustrated.toLocaleString()} (${t.frustratedPct}) | ${t.errors} | **${t.apdexScore}** | ${t.rating} |`);
    }
    const o = results.overall;
    console.log(`| **Load Phase Total** | **${o.total.toLocaleString()}** | **${o.satisfied.toLocaleString()} (${o.satisfiedPct})** | **${o.tolerating.toLocaleString()} (${o.toleratingPct})** | **${o.frustrated.toLocaleString()} (${o.frustratedPct})** | **${o.errors}** | **${o.apdexScore}** | **${o.rating}** |`);

    if (args.showRoutes && results.routes) {
      console.log(`\n#### Route APDEX Rankings\n`);
      console.log(`| Route Label | Total | Satisfied | Tolerating | Frustrated | APDEX | Rating |`);
      console.log(`|---|---:|---:|---:|---:|---:|:---:|`);
      const sortedRoutes = Object.entries(results.routes).sort((a, b) => b[1].apdexScoreExact - a[1].apdexScoreExact);
      for (const [lbl, r] of sortedRoutes) {
        console.log(`| \`${lbl}\` | ${r.total} | ${r.satisfied} | ${r.tolerating} | ${r.frustrated} | ${r.apdexScore} | ${r.rating} |`);
      }
    }
    return;
  }

  // Default ASCII Table
  console.log(`========================================================================================`);
  console.log(` APDEX Benchmark Telemetry (T = ${T} ms, F = ${F} ms)`);
  console.log(` Source File: ${path.relative(REPO_ROOT, args.jtlPath)}`);
  console.log(`========================================================================================`);
  console.log(` Tier / Concurrency            | Reqs  | Satisfied        | Tolerating     | Frustrated   | Errs | APDEX | Rating`);
  console.log(`-------------------------------+-------+------------------+----------------+--------------+------+-------+-----------`);
  for (const [name, t] of Object.entries(results.tiers)) {
    const tierPadded = name.padEnd(30);
    const totalPadded = String(t.total).padStart(5);
    const satPadded = `${t.satisfied} (${t.satisfiedPct})`.padEnd(16);
    const tolPadded = `${t.tolerating} (${t.toleratingPct})`.padEnd(14);
    const fruPadded = `${t.frustrated} (${t.frustratedPct})`.padEnd(12);
    const errPadded = String(t.errors).padStart(4);
    console.log(` ${tierPadded}| ${totalPadded} | ${satPadded} | ${tolPadded} | ${fruPadded} | ${errPadded} | ${t.apdexScore} | ${t.rating}`);
  }
  console.log(`-------------------------------+-------+------------------+----------------+--------------+------+-------+-----------`);
  const o = results.overall;
  const totName = "LOAD PHASE TOTAL".padEnd(30);
  const totSamples = String(o.total).padStart(5);
  const totSat = `${o.satisfied} (${o.satisfiedPct})`.padEnd(16);
  const totTol = `${o.tolerating} (${o.toleratingPct})`.padEnd(14);
  const totFru = `${o.frustrated} (${o.frustratedPct})`.padEnd(12);
  const totErr = String(o.errors).padStart(4);
  console.log(` ${totName}| ${totSamples} | ${totSat} | ${totTol} | ${totFru} | ${totErr} | ${o.apdexScore} | ${o.rating}`);
  console.log(`========================================================================================`);
  console.log(` Computation: APDEX = (${o.satisfied} + 0.5 * ${o.tolerating}) / ${o.total} = ${(o.satisfied + 0.5 * o.tolerating)} / ${o.total} = ${o.apdexScoreExact.toFixed(8)}`);
  console.log(` Final Rating: ${o.rating} (${o.apdexScore})\n`);

  if (args.showRoutes && results.routes) {
    console.log(`========================================================================================`);
    console.log(` Route-by-Route APDEX Rankings (Top to Bottom)`);
    console.log(`========================================================================================`);
    const sorted = Object.entries(results.routes).sort((a, b) => b[1].apdexScoreExact - a[1].apdexScoreExact);
    for (const [route, r] of sorted) {
      console.log(` ${r.apdexScore} [${r.rating.padEnd(9)}] (n=${String(r.total).padStart(4)}, sat=${r.satisfied}, tol=${r.tolerating}, fru=${r.frustrated}) : ${route}`);
    }
  }
}

computeApdex().catch((err) => {
  console.error("Fatal error during APDEX calculation:", err);
  process.exit(1);
});

