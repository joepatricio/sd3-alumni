#!/usr/bin/env node
/**
 * Mermaid Diagram Validator & SVG Renderer
 *
 * Scans markdown documentation files for ```mermaid code blocks, validates their
 * syntax using Mermaid.js inside a headless browser (Chrome or Edge via puppeteer-core),
 * and verifies that the diagram renders cleanly without lexer or DOM errors.
 *
 * Usage:
 *   node test/methodology/validate_mermaid.mjs [options]
 *
 * Options:
 *   --file <path>      Target markdown or .mmd file (default: docs/backend-fix.md)
 *   --browser <path>   Explicit path to Chrome or Edge executable
 *   --out-svg <path>   Path to write rendered SVG output (optional)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

function findBrowserExecutable(explicitPath) {
  if (explicitPath && fs.existsSync(explicitPath)) return explicitPath;
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const standardPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe"
  ];

  for (const p of standardPaths) {
    if (p && fs.existsSync(p)) return p;
  }

  return "";
}

function parseArgs(argv) {
  const defaultCandidates = [
    path.join(REPO_ROOT, "test/backend-fix.md"),
    path.join(REPO_ROOT, "docs/backend-fix.md")
  ];
  let defaultFile = defaultCandidates.find((f) => fs.existsSync(f)) || defaultCandidates[0];

  const args = {
    filePath: defaultFile,
    browserPath: "",
    outSvgPath: ""
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file" && i + 1 < argv.length) {
      args.filePath = path.resolve(process.cwd(), argv[++i]);
    } else if (a === "--browser" && i + 1 < argv.length) {
      args.browserPath = argv[++i];
    } else if (a === "--out-svg" && i + 1 < argv.length) {
      args.outSvgPath = path.resolve(process.cwd(), argv[++i]);
    }
  }

  args.browserPath = findBrowserExecutable(args.browserPath);
  return args;
}

function extractMermaidBlocks(content, filePath) {
  if (filePath.endsWith(".mmd")) {
    return [{ index: 1, code: content.trim(), startLine: 1 }];
  }

  const blocks = [];
  const lines = content.split("\n");
  let inBlock = false;
  let curBlock = [];
  let startLine = 0;
  let blockIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inBlock && line.trim().startsWith("```mermaid")) {
      inBlock = true;
      startLine = i + 1;
      curBlock = [];
    } else if (inBlock && line.trim().startsWith("```")) {
      inBlock = false;
      blocks.push({
        index: blockIndex++,
        code: curBlock.join("\n").trim(),
        startLine
      });
    } else if (inBlock) {
      curBlock.push(line);
    }
  }

  return blocks;
}

async function validateMermaid() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(args.filePath)) {
    console.error(`Error: File not found at "${args.filePath}"`);
    process.exit(1);
  }

  if (!args.browserPath) {
    console.error("Error: Could not locate Chrome or Edge executable on this system.");
    console.error("Please supply --browser <path/to/chrome.exe>");
    process.exit(1);
  }

  const content = fs.readFileSync(args.filePath, "utf8");
  const blocks = extractMermaidBlocks(content, args.filePath);

  if (blocks.length === 0) {
    console.log(`No Mermaid blocks (\\\`\\\`\\\`mermaid) found in ${path.relative(REPO_ROOT, args.filePath)}`);
    return;
  }

  console.log(`========================================================================================`);
  console.log(` Mermaid Diagram Validation & Rendering Harness`);
  console.log(` Target File:    ${path.relative(REPO_ROOT, args.filePath)}`);
  console.log(` Browser Engine: ${args.browserPath}`);
  console.log(` Blocks Found:   ${blocks.length}`);
  console.log(`========================================================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: args.browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  let allPassed = true;

  try {
    const page = await browser.newPage();
    // Load Mermaid.js v10 runtime
    await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
  <div id="render-target"></div>
</body>
</html>`);

    // Ensure mermaid object is initialized
    await page.evaluate(() => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose"
      });
    });

    for (const block of blocks) {
      console.log(`[Block #${block.index}] Starting at line ${block.startLine} (${block.code.split("\n").length} lines)...`);

      const result = await page.evaluate(async (code, id) => {
        try {
          // Phase 1: Syntax parse check
          await window.mermaid.parse(code);
          // Phase 2: Full DOM SVG render check
          const { svg } = await window.mermaid.render(`svg-${id}`, code);
          return { success: true, svg };
        } catch (err) {
          return {
            success: false,
            error: err.str || err.message || String(err)
          };
        }
      }, block.code, block.index);

      if (result.success) {
        console.log(`  -> Status: PASSED (Syntax Valid & Rendered cleanly)`);
        console.log(`  -> Output SVG Size: ${result.svg.length.toLocaleString()} bytes\n`);

        if (args.outSvgPath) {
          const outPath = blocks.length === 1
            ? args.outSvgPath
            : args.outSvgPath.replace(/(\.svg)?$/, `_${block.index}.svg`);
          fs.writeFileSync(outPath, result.svg, "utf8");
          console.log(`  -> Wrote SVG to: ${path.relative(REPO_ROOT, outPath)}\n`);
        }
      } else {
        allPassed = false;
        console.error(`  -> Status: FAILED`);
        console.error(`  -> Parse/Render Error:\n${result.error}\n`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`========================================================================================`);
  if (allPassed) {
    console.log(` Summary: All ${blocks.length} diagram(s) validated and rendered successfully.`);
  } else {
    console.error(` Summary: One or more Mermaid diagrams failed validation.`);
    process.exit(1);
  }
}

validateMermaid().catch((err) => {
  console.error("Fatal error during Mermaid validation:", err);
  process.exit(1);
});
