#!/usr/bin/env node
/**
 * Multi-tab HTML Report -> Single-File PDF Exporter
 *
 * Combines JMeter HTML Dashboard tabs (Dashboard, OverTime, Throughput,
 * ResponseTimes, and non-empty CustomsGraphs) plus Locust's HTML report
 * into test/load/results/load_test_report.pdf using:
 *   - Exact 1 PDF page per HTML report tab (CSS named @page sizing)
 *   - All collapsible panels expanded and Flot/ECharts graphs rendered
 *   - CustomsGraphs.html automatically omitted when empty
 */

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {
    resultsDir: path.join(__dirname, "results"),
    outPath: "",
    browserPath: "",
    pageWidth: 1440,
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === "--results-dir" && v) {
      args.resultsDir = path.resolve(v);
      i++;
    } else if (k === "--out" && v) {
      args.outPath = path.resolve(v);
      i++;
    } else if (k === "--browser" && v) {
      args.browserPath = v;
      i++;
    } else if (k === "--width" && v) {
      const parsed = Number.parseInt(v, 10);
      if (Number.isFinite(parsed) && parsed >= 800) args.pageWidth = parsed;
      i++;
    }
  }
  if (!args.outPath) {
    args.outPath = path.join(args.resultsDir, "load_test_report.pdf");
  }
  return args;
}

function findBrowserExecutable(explicitPath) {
  const candidates = [
    explicitPath,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `No Chromium-based browser executable found. Checked: ${candidates.join(", ")}`
  );
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

function startStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const urlPath = (req.url || "/").split("?")[0];

    if (urlPath === "/__export_host") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SD3 Alumni Load Test Combined Report</title>
  <style id="export-layout-css">
    @page { margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .report-page {
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow: hidden;
      box-sizing: border-box;
    }
    .report-frame {
      display: block;
      border: 0;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
  </style>
  <style id="export-page-css"></style>
</head>
<body>
  <div id="pages"></div>
</body>
</html>`);
      return;
    }

    const decoded = decodeURIComponent(urlPath).replace(/^\/+/, "");
    const safeRel = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
    let fullPath = path.join(rootDir, safeRel);
    if (!fullPath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      fullPath = path.join(fullPath, "index.html");
    }
    if (!fs.existsSync(fullPath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(fullPath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function buildTabList(resultsDir) {
  const candidates = [
    {
      name: "JMeter Dashboard",
      relPath: "html_report/index.html",
      kind: "jmeter",
      skipIfEmpty: false,
    },
    {
      name: "JMeter Over Time",
      relPath: "html_report/content/pages/OverTime.html",
      kind: "jmeter",
      skipIfEmpty: false,
    },
    {
      name: "JMeter Throughput",
      relPath: "html_report/content/pages/Throughput.html",
      kind: "jmeter",
      skipIfEmpty: false,
    },
    {
      name: "JMeter Response Times",
      relPath: "html_report/content/pages/ResponseTimes.html",
      kind: "jmeter",
      skipIfEmpty: false,
    },
    {
      name: "JMeter Custom Graphs",
      relPath: "html_report/content/pages/CustomsGraphs.html",
      kind: "jmeter",
      skipIfEmpty: true,
    },
    {
      name: "Locust Persona Report",
      relPath: "locust_report.html",
      kind: "locust",
      skipIfEmpty: false,
    },
  ];

  const active = [];
  for (const tab of candidates) {
    const abs = path.join(resultsDir, tab.relPath);
    if (fs.existsSync(abs)) {
      active.push({
        ...tab,
        urlPath: "/" + tab.relPath.replace(/\\/g, "/"),
      });
    }
  }
  return active;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function exportPdf() {
  const args = parseArgs(process.argv);
  const tabs = buildTabList(args.resultsDir);
  if (tabs.length === 0) {
    throw new Error(
      `No HTML reports found under ${args.resultsDir}. Expected html_report/index.html and/or locust_report.html.`
    );
  }

  const browserExe = findBrowserExecutable(args.browserPath);
  const { server, baseUrl } = await startStaticServer(args.resultsDir);
  let browser;

  try {
    console.log(`[PDF] Using browser : ${browserExe}`);
    console.log(`[PDF] Static origin : ${baseUrl}`);

    browser = await puppeteer.launch({
      executablePath: browserExe,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-gpu-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: args.pageWidth,
      height: 1200,
      deviceScaleFactor: 2,
    });

    await page.goto(`${baseUrl}/__export_host`, { waitUntil: "networkidle0" });

    const renderedTabs = [];

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const frameId = `tab_frame_${i}`;

      await page.evaluate(
        ({ frameId, urlPath, width }) => {
          const container = document.getElementById("pages");
          const sec = document.createElement("section");
          sec.id = `sec_${frameId}`;
          sec.className = "report-page";
          sec.style.width = `${width}px`;

          const iframe = document.createElement("iframe");
          iframe.id = frameId;
          iframe.className = "report-frame";
          iframe.src = urlPath;
          iframe.style.width = `${width}px`;
          iframe.style.height = "1200px";

          sec.appendChild(iframe);
          container.appendChild(sec);
        },
        { frameId, urlPath: tab.urlPath, width: args.pageWidth }
      );

      await page.waitForFunction(
        (id) => {
          const f = document.getElementById(id);
          if (!f || !f.contentDocument) return false;
          const doc = f.contentDocument;
          if (doc.readyState !== "complete") return false;
          return (doc.body && doc.body.innerHTML.trim().length > 0) || false;
        },
        { timeout: 30000 },
        frameId
      );

      // Give embedded scripts (jQuery/Flot or React/ECharts) time to initialize
      await delay(tab.kind === "locust" ? 1200 : 750);

      // Prepare tab internals (expand collapsed panels, remove sidebar, inspect empty state)
      const prep = await page.evaluate(
        ({ frameId, kind }) => {
          const f = document.getElementById(frameId);
          const win = f.contentWindow;
          const doc = f.contentDocument;

          const styleId = "__pdf_prep_style";
          if (!doc.getElementById(styleId)) {
            const st = doc.createElement("style");
            st.id = styleId;
            st.textContent =
              kind === "jmeter"
                ? `
                  .navbar-default.sidebar,
                  .navbar-header button.navbar-toggle,
                  #side-menu,
                  ul#side-menu {
                    display: none !important;
                  }
                  #wrapper,
                  #page-wrapper {
                    margin: 0 !important;
                    padding: 16px 28px 28px 28px !important;
                    border-left: none !important;
                    width: 100% !important;
                    min-height: auto !important;
                    box-sizing: border-box !important;
                  }
                  .collapsing {
                    transition: none !important;
                    height: auto !important;
                  }
                  .collapse,
                  .collapse.out,
                  .panel-collapse.collapse,
                  .portlet-content {
                    display: block !important;
                    height: auto !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                  }
                  @media print {
                    a[href]:after { content: none !important; }
                    body, html { overflow: visible !important; }
                  }
                `
                : `
                  @media print {
                    html, body, #root {
                      overflow: visible !important;
                      height: auto !important;
                    }
                    a[href]:after { content: none !important; }
                  }
                `;
            doc.head.appendChild(st);
          }

          if (kind === "jmeter") {
            const collapsibleEls = Array.from(
              doc.querySelectorAll(".collapse.portlet-content, .portlet-content.collapse")
            );
            for (const el of collapsibleEls) {
              el.classList.remove("out");
              el.classList.add("in");
              el.style.display = "block";
              el.style.height = "auto";
              if (el.parentElement) {
                el.parentElement
                  .querySelectorAll(".fa-chevron-down")
                  .forEach((ic) => {
                    ic.classList.remove("fa-chevron-down");
                    ic.classList.add("fa-chevron-up");
                  });
              }
            }

            // Invoke JMeter's lazy Flot plot initializers directly without triggering
            // graph.js's `document.location.href = "#..."` anchor navigation inside the iframe.
            const refreshers = {
              bodyBytesThroughputOverTime: ["refreshBytesThroughputOverTime", true],
              bodyLatenciesOverTime: ["refreshLatenciesOverTime", true],
              bodyCustomGraph: ["refreshCustomGraph", true],
              bodyConnectTimeOverTime: ["refreshConnectTimeOverTime", true],
              bodyResponseTimePercentilesOverTime: ["refreshResponseTimePercentilesOverTime", true],
              bodyResponseTimeDistribution: ["refreshResponseTimeDistribution", undefined],
              bodySyntheticResponseTimeDistribution: ["refreshSyntheticResponseTimeDistribution", undefined],
              bodyActiveThreadsOverTime: ["refreshActiveThreadsOverTime", true],
              bodyTimeVsThreads: ["refreshTimeVsThreads", undefined],
              bodyCodesPerSecond: ["refreshCodesPerSecond", true],
              bodyTransactionsPerSecond: ["refreshTransactionsPerSecond", true],
              bodyTotalTPS: ["refreshTotalTPS", true],
              bodyResponseTimeVsRequest: ["refreshResponseTimeVsRequest", undefined],
              bodyLatenciesVsRequest: ["refreshLatenciesVsRequest", undefined],
            };

            for (const el of collapsibleEls) {
              const spec = el.id ? refreshers[el.id] : null;
              if (!spec) continue;
              const [fnName, arg] = spec;
              const fn = win[fnName];
              if (typeof fn !== "function") continue;
              const alreadyPlotted =
                typeof win.isGraph === "function" &&
                win.$ &&
                win.isGraph(win.$(el).find(".flot-chart-content"));
              if (!alreadyPlotted) {
                try {
                  if (arg === undefined) fn();
                  else fn(arg);
                } catch {
                  // ignore panels without data on this run
                }
              }
            }
          }

          if (kind === "locust") {
            // Ensure any collapsed MUI accordions inside Locust report are expanded
            const collapsedButtons = Array.from(
              doc.querySelectorAll('[aria-expanded="false"]')
            );
            for (const btn of collapsedButtons) {
              try {
                btn.click();
              } catch {
                // ignore non-interactive controls
              }
            }
          }

          win.dispatchEvent(new win.Event("resize"));

          const graphContainer = doc.getElementById("graphContainer");
          const containerPanels = graphContainer
            ? graphContainer.querySelectorAll(".panel, canvas, svg").length
            : 0;
          const allPanels = doc.querySelectorAll(".panel, .MuiPaper-root").length;
          const canvases = doc.querySelectorAll("canvas").length;
          const svgs = doc.querySelectorAll("svg").length;

          return {
            graphContainerExists: Boolean(graphContainer),
            containerPanels,
            allPanels,
            canvases,
            svgs,
          };
        },
        { frameId, kind: tab.kind }
      );

      // Wait for shown.bs.collapse Flot redraws / React resize renders
      await delay(700);

      // Measure final rendered counts & exact document height
      const metrics = await page.evaluate(
        ({ frameId, kind, width }) => {
          const f = document.getElementById(frameId);
          const win = f.contentWindow;
          const doc = f.contentDocument;

          win.dispatchEvent(new win.Event("resize"));

          const body = doc.body;
          const html = doc.documentElement;

          let maxBottom = 0;
          if (body) {
            const children = body.querySelectorAll("*");
            for (const el of children) {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0 && rect.bottom > maxBottom) {
                maxBottom = rect.bottom;
              }
            }
          }

          const rawH = Math.ceil(
            Math.max(
              body ? body.scrollHeight : 0,
              html ? html.scrollHeight : 0,
              maxBottom
            )
          );

          const measuredH = Math.max(600, rawH + 28);
          f.style.width = `${width}px`;
          f.style.height = `${measuredH}px`;

          const sec = document.getElementById(`sec_${frameId}`);
          sec.style.width = `${width}px`;
          sec.style.height = `${measuredH}px`;

          const graphContainer = doc.getElementById("graphContainer");
          const containerPanels = graphContainer
            ? graphContainer.querySelectorAll(".panel, canvas, svg").length
            : 0;
          const nonZeroCanvases = Array.from(doc.querySelectorAll("canvas")).filter(
            (c) => c.width > 0 && c.height > 0
          ).length;
          const svgs = doc.querySelectorAll("svg").length;
          const tables = doc.querySelectorAll("table").length;

          return {
            kind,
            measuredH,
            graphContainerExists: Boolean(graphContainer),
            containerPanels,
            nonZeroCanvases,
            svgs,
            tables,
          };
        },
        { frameId, kind: tab.kind, width: args.pageWidth }
      );

      // Skip empty Custom Graphs page cleanly
      const isEmptyCustom =
        tab.skipIfEmpty &&
        metrics.graphContainerExists &&
        metrics.containerPanels === 0 &&
        metrics.nonZeroCanvases === 0;

      if (isEmptyCustom) {
        console.log(`[PDF] Skipping empty tab : ${tab.name} (${tab.urlPath})`);
        await page.evaluate((id) => {
          const sec = document.getElementById(`sec_${id}`);
          if (sec) sec.remove();
        }, frameId);
        continue;
      }

      await delay(200);

      console.log(
        `[PDF] Included tab #${renderedTabs.length + 1}: ${tab.name} | ${args.pageWidth}x${metrics.measuredH}px | canvases=${metrics.nonZeroCanvases}, svgs=${metrics.svgs}, tables=${metrics.tables}`
      );
      renderedTabs.push({
        name: tab.name,
        frameId,
        width: args.pageWidth,
        height: metrics.measuredH,
        canvases: metrics.nonZeroCanvases,
        svgs: metrics.svgs,
      });
    }

    if (renderedTabs.length === 0) {
      throw new Error("No non-empty report tabs remained to export.");
    }

    // Apply per-page CSS named @page dimensions so each tab is exact 1 page
    await page.evaluate((tabList) => {
      const rules = [];
      for (let idx = 0; idx < tabList.length; idx++) {
        const t = tabList[idx];
        const pageName = `p_${idx}`;
        const breakRule = idx < tabList.length - 1 ? "break-after: page;" : "break-after: auto;";
        rules.push(`@page ${pageName} { size: ${t.width}px ${t.height + 2}px; margin: 0; }`);
        rules.push(`#sec_${t.frameId} { page: ${pageName}; ${breakRule} }`);
      }
      document.getElementById("export-page-css").textContent = rules.join("\n");
    }, renderedTabs);

    await delay(300);

    fs.mkdirSync(path.dirname(args.outPath), { recursive: true });
    await page.pdf({
      path: args.outPath,
      preferCSSPageSize: true,
      printBackground: true,
    });

    const stat = fs.statSync(args.outPath);
    console.log(
      `[+] Exported ${renderedTabs.length}-page PDF report: ${args.outPath} (${stat.size} bytes)`
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    server.close();
  }
}

exportPdf().catch((err) => {
  console.error("[!] PDF Export failed:", err);
  process.exit(1);
});

