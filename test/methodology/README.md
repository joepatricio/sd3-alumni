# Methodology & Telemetry Analysis Tools

This directory contains analytical scripts, verification harnesses, and academic whitepaper artifacts documenting the load testing and architectural benchmarking methodology for the SD3 Alumni platform.

## Artifacts in this Directory

| File | Type | Description |
|---|---|---|
| [`calc_apdex.mjs`](./calc_apdex.mjs) | Node CLI Tool | Parses raw JMeter `.jtl` streams (with full CSV quote escaping) and computes empirical APDEX scores across concurrency tiers ($100 \to 1{,}000$ VUs) and individual REST routes. |
| [`validate_mermaid.mjs`](./validate_mermaid.mjs) | Node CLI Tool | Validates syntax and executes headless DOM SVG rendering of Mermaid diagrams inside markdown files using Chrome or Edge via `puppeteer-core`. |
| [`load_testing_methodology_whitepaper.tex`](./load_testing_methodology_whitepaper.tex) | LaTeX Source | Complete academic/technical methodology paper detailing the two-phase orchestration architecture, deterministic SQL seeding, and 1,000-VU empirical results. |
| [`load_testing_methodology_whitepaper.pdf`](./load_testing_methodology_whitepaper.pdf) | Compiled PDF | Formatted, multi-page whitepaper artifact. |

---

## 1. APDEX Calculator (`calc_apdex.mjs`)

Computes the **Application Performance Index (APDEX)** from JMeter result logs according to the industry standard:

$$\text{APDEX}_{T, F} = \frac{N_{\text{satisfied}} + 0.5 \cdot N_{\text{tolerating}}}{N_{\text{total}}}$$

* **Default Thresholds:** $T = 500\text{ ms}$ (Satisfied: $t \le 500\text{ ms}$), $F = 1500\text{ ms}$ (Tolerating: $500\text{ ms} < t \le 1500\text{ ms}$; Frustrated: $t > 1500\text{ ms}$ or HTTP error).
* **CSV Compliance:** Fully handles quoted URLs containing commas (e.g., `_include=category,author,status`).

### Quick Start

```powershell
# Standard run against latest load test results
node test/methodology/calc_apdex.mjs

# Include route-by-route ranking table
node test/methodology/calc_apdex.mjs --routes

# Custom thresholds (e.g. T=300ms, F=1000ms)
node test/methodology/calc_apdex.mjs --t 300 --f 1000

# Output as GitHub Flavored Markdown table
node test/methodology/calc_apdex.mjs --format markdown

# Output structured JSON for automated pipelines
node test/methodology/calc_apdex.mjs --json
```

---

## 2. Mermaid Diagram Validator (`validate_mermaid.mjs`)

Ensures that documentation flowcharts and architectural topologies render without lexer or tokenizer errors (such as reserved parenthesis edge labels or unescaped braces).

### Quick Start

```powershell
# Validate default document (test/backend-fix.md or docs/backend-fix.md)
node test/methodology/validate_mermaid.mjs

# Validate a specific markdown document
node test/methodology/validate_mermaid.mjs --file docs/data_type.consistency_plan.md

# Validate and export the rendered SVG to disk
node test/methodology/validate_mermaid.mjs --out-svg test/methodology/topology.svg
```

