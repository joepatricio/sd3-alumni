#!/usr/bin/env node
/**
 * High-Concurrency Node.js Benchmark Engine
 * Target: https://najealp.top
 * Measures stepped concurrency, route latencies, status variances, and hardware/network saturation.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, 'config.json');
const RESULTS_DIR = path.join(__dirname, 'results');

if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const customUrlArg = args.find(a => a.startsWith('--url='));
const baseUrl = customUrlArg ? customUrlArg.split('=')[1] : config.baseUrl;
const customTiersArg = args.find(a => a.startsWith('--tiers='));
const tiers = isDryRun 
    ? [10, 25] 
    : (customTiersArg ? customTiersArg.split('=')[1].split(',').map(Number) : config.steppedTiers);
const tierDurationSec = isDryRun ? config.dryRunTierDurationSec : (args.find(a => a.startsWith('--duration=')) ? parseInt(args.find(a => a.startsWith('--duration=')).split('=')[1], 10) : config.defaultTierDurationSec);

console.log('================================================================');
console.log('  NODE.JS HIGH-CONCURRENCY BENCHMARK ENGINE');
console.log(`  Target:     ${baseUrl}`);
console.log(`  Mode:       ${isDryRun ? 'DRY-RUN (Sanity Check)' : 'FULL BENCHMARK'}`);
console.log(`  Tiers:      ${tiers.join(', ')} concurrent VUs`);
console.log(`  Duration:   ${tierDurationSec}s per tier`);
console.log(`  BW Ceiling: ${config.bandwidthLimitMbps} Mbits/s (~${(config.bandwidthLimitMbps / 8).toFixed(2)} MB/s)`);
console.log('================================================================\n');

// Persistent HTTP/HTTPS Agents
const isHttps = baseUrl.startsWith('https');
const agentOptions = {
    keepAlive: true,
    keepAliveMsecs: 10000,
    maxSockets: 2000,
    maxFreeSockets: 500,
    timeout: 30000
};
const httpAgent = isHttps ? new https.Agent(agentOptions) : new http.Agent(agentOptions);

/**
 * Perform a single HTTP request with timing
 */
function makeRequest(urlStr, options = {}, postData = null) {
    return new Promise((resolve) => {
        const start = performance.now();
        const url = new URL(urlStr);
        
        const reqOptions = {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: options.method || 'GET',
            agent: httpAgent,
            headers: {
                'User-Agent': 'LoadTest-NodeEngine/1.0',
                'Accept': 'application/json, text/plain, */*',
                'Connection': 'keep-alive',
                ...(options.headers || {})
            }
        };

        if (postData) {
            reqOptions.headers['Content-Type'] = 'application/json';
            reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const reqLib = isHttps ? https : http;
        const req = reqLib.request(reqOptions, (res) => {
            let bytesReceived = 0;
            let bodyChunks = [];

            res.on('data', (chunk) => {
                bytesReceived += chunk.length;
                if (bodyChunks.length < 5) bodyChunks.push(chunk);
            });

            res.on('end', () => {
                const duration = performance.now() - start;
                let preview = '';
                if (res.statusCode >= 400) {
                    try {
                        const fullBody = Buffer.concat(bodyChunks).toString('utf-8');
                        preview = fullBody.slice(0, 150);
                    } catch {}
                }
                resolve({
                    statusCode: res.statusCode,
                    duration,
                    bytes: bytesReceived,
                    error: null,
                    errorPreview: preview
                });
            });
        });

        req.on('error', (err) => {
            const duration = performance.now() - start;
            resolve({
                statusCode: 0,
                duration,
                bytes: 0,
                error: err.message || 'Connection error',
                errorPreview: err.code || err.message
            });
        });

        req.setTimeout(25000, () => {
            req.destroy(new Error('Request timeout (25s)'));
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

/**
 * Pre-authenticate test accounts to get Bearer tokens
 */
async function authenticateSessions() {
    console.log('[*] Pre-authenticating Admin and Test User credentials...');
    const tokens = {
        admins: [],
        officials: [],
        regulars: []
    };

    // Authenticate first admin
    if (config.credentials.admins.length > 0) {
        const adm = config.credentials.admins[0];
        const res = await makeRequest(`${baseUrl}/api/auth/admin/login`, {
            method: 'POST'
        }, JSON.stringify({ username: adm.username, password: adm.password }));
        
        if (res.statusCode === 200) {
            console.log(`[+] Admin auth successful (${adm.username})`);
            tokens.admins.push({ username: adm.username, status: 200 });
        } else {
            console.log(`[-] Admin auth returned HTTP ${res.statusCode}: ${res.errorPreview || 'Check setup.sql execution'}`);
        }
    }

    // Authenticate first official
    if (config.credentials.officials.length > 0) {
        const off = config.credentials.officials[0];
        const res = await makeRequest(`${baseUrl}/api/auth/login`, {
            method: 'POST'
        }, JSON.stringify({ email: off.email, password: off.password }));
        
        if (res.statusCode === 200) {
            console.log(`[+] Official auth successful (${off.email})`);
            tokens.officials.push({ email: off.email, status: 200 });
        } else {
            console.log(`[-] Official auth returned HTTP ${res.statusCode}: ${res.errorPreview || 'Check setup.sql execution'}`);
        }
    }

    // Authenticate first regular
    if (config.credentials.regulars.length > 0) {
        const reg = config.credentials.regulars[0];
        const res = await makeRequest(`${baseUrl}/api/auth/login`, {
            method: 'POST'
        }, JSON.stringify({ email: reg.email, password: reg.password }));
        
        if (res.statusCode === 200) {
            console.log(`[+] Regular auth successful (${reg.email})`);
            tokens.regulars.push({ email: reg.email, status: 200 });
        } else {
            console.log(`[-] Regular auth returned HTTP ${res.statusCode}: ${res.errorPreview || 'Check setup.sql execution'}`);
        }
    }

    return tokens;
}

/**
 * Percentile helper
 */
function calculatePercentiles(latencies) {
    if (!latencies || latencies.length === 0) return { min: 0, p50: 0, p90: 0, p95: 0, p99: 0, max: 0, avg: 0 };
    const sorted = [...latencies].sort((a, b) => a - b);
    const getP = (p) => {
        const idx = Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1);
        return sorted[idx];
    };
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    return {
        min: sorted[0],
        p50: getP(50),
        p90: getP(90),
        p95: getP(95),
        p99: getP(99),
        max: sorted[sorted.length - 1],
        avg: sum / sorted.length
    };
}

/**
 * Run a stepped load tier
 */
async function runTier(concurrency, durationSec, routeList) {
    console.log(`\n>>> STARTING TIER: ${concurrency} Concurrent Workers | Duration: ${durationSec}s`);
    const tierStart = performance.now();
    const endTime = tierStart + (durationSec * 1000);
    
    const records = [];
    let completedRequests = 0;
    let totalBytes = 0;

    const worker = async () => {
        while (performance.now() < endTime) {
            const route = routeList[Math.floor(Math.random() * routeList.length)];
            const targetUrl = `${baseUrl}${route}`;
            const res = await makeRequest(targetUrl);
            
            records.push({
                route,
                statusCode: res.statusCode,
                duration: res.duration,
                bytes: res.bytes,
                error: res.error,
                errorPreview: res.errorPreview
            });

            completedRequests++;
            totalBytes += res.bytes;
        }
    };

    // Spawn concurrent workers
    const workerPromises = [];
    for (let i = 0; i < concurrency; i++) {
        workerPromises.push(worker());
    }

    await Promise.all(workerPromises);
    const tierActualDuration = (performance.now() - tierStart) / 1000;
    const rps = completedRequests / tierActualDuration;
    const mbps = (totalBytes * 8) / (tierActualDuration * 1024 * 1024);
    const allLatencies = records.map(r => r.duration);
    const pct = calculatePercentiles(allLatencies);
    const errorCount = records.filter(r => r.statusCode === 0 || r.statusCode >= 500).length;
    const errorRate = (errorCount / (completedRequests || 1)) * 100;

    console.log(`[Tier Summary: ${concurrency} VUs]`);
    console.log(`  Requests:     ${completedRequests.toLocaleString()} (${rps.toFixed(1)} req/s)`);
    console.log(`  Throughput:   ${(totalBytes / (1024 * 1024 * tierActualDuration)).toFixed(2)} MB/s (${mbps.toFixed(2)} Mbps)`);
    console.log(`  Latency P50:  ${pct.p50.toFixed(1)} ms | P95: ${pct.p95.toFixed(1)} ms | P99: ${pct.p99.toFixed(1)} ms | Max: ${pct.max.toFixed(1)} ms`);
    console.log(`  Errors:       ${errorCount} (${errorRate.toFixed(2)}%)`);
    if (mbps >= config.bandwidthLimitMbps * 0.85) {
        console.log(`  [!] WARNING: Network I/O (${mbps.toFixed(1)} Mbps) approached/exceeded 70 Mbps link ceiling!`);
    }

    return {
        concurrency,
        durationSec: tierActualDuration,
        totalRequests: completedRequests,
        totalBytes,
        rps,
        mbps,
        percentiles: pct,
        errorCount,
        errorRate,
        records
    };
}

/**
 * Main benchmark orchestration
 */
async function main() {
    // 1. Preflight check
    console.log('[*] Verifying baseline connectivity to https://najealp.top...');
    const preflight = await makeRequest(`${baseUrl}/api/userStatuses`);
    if (preflight.statusCode !== 200) {
        console.error(`[!] Preflight failed with status ${preflight.statusCode}: ${preflight.errorPreview}`);
        console.error('Please ensure the server is online and accessible.');
        process.exit(1);
    }
    console.log(`[+] Preflight successful. Round-trip baseline: ${preflight.duration.toFixed(1)} ms\n`);

    // 2. Authentication check
    await authenticateSessions();

    // 3. Compile route catalog
    const catalog = [
        ...config.routes.readLookup,
        ...config.routes.readCatalogs,
        ...config.routes.readRelational,
        ...config.routes.readFiltered,
        ...config.routes.adminDashboards
    ];

    console.log(`[*] Target route catalog contains ${catalog.length} unique endpoints.`);

    // 4. Run stepped tiers
    const tierResults = [];
    const allRecordsCombined = [];

    for (const tier of tiers) {
        const result = await runTier(tier, tierDurationSec, catalog);
        allRecordsCombined.push(...result.records);
        // Exclude raw records from tier summary object to keep file size clean
        const { records: _, ...summary } = result;
        tierResults.push(summary);
        
        // Short cooldown between tiers to allow connection draining
        await new Promise(r => setTimeout(r, 2000));
    }

    // 5. Per-Route Aggregations & Variance Breakdown
    console.log('\n[*] Aggregating route rankings and transaction variances...');
    const routeGroups = {};

    for (const rec of allRecordsCombined) {
        const key = rec.route;
        if (!routeGroups[key]) {
            routeGroups[key] = {
                route: key,
                totalCalls: 0,
                totalBytes: 0,
                totalTimeMs: 0,
                latencies: [],
                statusCounts: {},
                variances: {}
            };
        }
        const g = routeGroups[key];
        g.totalCalls++;
        g.totalBytes += rec.bytes;
        g.totalTimeMs += rec.duration;
        g.latencies.push(rec.duration);
        g.statusCounts[rec.statusCode] = (g.statusCounts[rec.statusCode] || 0) + 1;

        // Variance tracking (by status code)
        const code = String(rec.statusCode);
        if (!g.variances[code]) {
            g.variances[code] = {
                statusCode: rec.statusCode,
                count: 0,
                latencies: [],
                sampleError: rec.errorPreview || ''
            };
        }
        g.variances[code].count++;
        g.variances[code].latencies.push(rec.duration);
    }

    const routeRankings = Object.values(routeGroups).map(g => {
        const pct = calculatePercentiles(g.latencies);
        const topVariances = Object.values(g.variances).map(v => {
            const vPct = calculatePercentiles(v.latencies);
            return {
                statusCode: v.statusCode,
                count: v.count,
                percentage: ((v.count / g.totalCalls) * 100).toFixed(2),
                minLatency: vPct.min,
                medianLatency: vPct.p50,
                slowestLatency: vPct.max,
                sampleError: v.sampleError
            };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        return {
            route: g.route,
            totalCalls: g.totalCalls,
            totalBytes: g.totalBytes,
            totalTimeMs: g.totalTimeMs,
            avgLatency: pct.avg,
            minLatency: pct.min,
            p50Latency: pct.p50,
            p90Latency: pct.p90,
            p95Latency: pct.p95,
            p99Latency: pct.p99,
            maxLatency: pct.max,
            statusCounts: g.statusCounts,
            topVariances
        };
    });

    // Sort views
    const mostTimeConsuming = [...routeRankings].sort((a, b) => b.totalTimeMs - a.totalTimeMs);
    const slowestRoutes = [...routeRankings].sort((a, b) => b.p95Latency - a.p95Latency);
    const mostTraffic = [...routeRankings].sort((a, b) => b.totalCalls - a.totalCalls);

    const finalReportData = {
        metadata: {
            timestamp: new Date().toISOString(),
            baseUrl,
            bandwidthLimitMbps: config.bandwidthLimitMbps,
            totalRequests: allRecordsCombined.length,
            tiersExecuted: tiers,
            durationPerTier: tierDurationSec
        },
        steppedTiers: tierResults,
        rankings: {
            mostTimeConsuming,
            slowestRoutes,
            mostTraffic
        }
    };

    const outputPath = path.join(RESULTS_DIR, 'node_baseline.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalReportData, null, 2), 'utf-8');
    console.log(`\n[+] Benchmark completed successfully!`);
    console.log(`[+] Baseline results saved to: ${outputPath}`);
    console.log(`\nTop 3 Slowest Routes (P95):`);
    slowestRoutes.slice(0, 3).forEach((r, idx) => {
        console.log(`  ${idx + 1}. ${r.route} -> P95: ${r.p95Latency.toFixed(1)} ms | P50: ${r.p50Latency.toFixed(1)} ms (${r.totalCalls} calls)`);
    });

    console.log(`\nTop 3 Most Time Consuming Routes:`);
    mostTimeConsuming.slice(0, 3).forEach((r, idx) => {
        console.log(`  ${idx + 1}. ${r.route} -> Total Time: ${(r.totalTimeMs / 1000).toFixed(2)}s (${r.totalCalls} calls)`);
    });
}

main().catch(err => {
    console.error('[!] Fatal benchmark error:', err);
    process.exit(1);
});

