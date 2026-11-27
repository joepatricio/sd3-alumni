import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import puppeteer from 'puppeteer-core';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const VIEWPORTS = [
    { name: 'portrait-900', width: 900, height: 1600, isDrawer: true },
    { name: 'portrait-1080', width: 1080, height: 1920, isDrawer: true },
    { name: 'portrait-1440', width: 1440, height: 2560, isDrawer: true },
    { name: 'landscape-1440', width: 1440, height: 900, isDrawer: false },
];

function normalizeForComparison(filePath) {
    const resolved = fs.realpathSync.native(filePath);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function assertNotRepoDb(candidatePath) {
    const candidateReal = normalizeForComparison(candidatePath);
    const protectedPaths = [
        path.join(REPO_ROOT, 'dev.db'),
        path.join(REPO_ROOT, 'prisma', 'dev.db'),
    ];
    for (const protectedPath of protectedPaths) {
        if (fs.existsSync(protectedPath)) {
            const protectedReal = normalizeForComparison(protectedPath);
            assert.notEqual(
                candidateReal,
                protectedReal,
                `Refusing to operate on protected repository database: ${protectedPath}`
            );
        }
    }
}

function getFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : 0;
            server.close((err) => {
                if (err) reject(err);
                else resolve(port);
            });
        });
    });
}

function findBrowserExecutable() {
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
    const candidates = [
        envPath,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].filter(Boolean);

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    throw new Error(`No Chrome/Edge executable found. Checked: ${candidates.join(', ')}`);
}

async function waitForHttp200(url, timeoutMs = 20000) {
    const start = Date.now();
    let lastError = null;
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url);
            if (res.ok) return;
            lastError = new Error(`HTTP ${res.status} from ${url}`);
        } catch (err) {
            lastError = err;
        }
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timed out waiting for ${url}: ${lastError?.message || 'unknown error'}`);
}

function loadJwtSecret() {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) {
        return process.env.JWT_SECRET.trim();
    }
    const envFile = path.join(REPO_ROOT, '.env');
    if (fs.existsSync(envFile)) {
        const parsed = dotenv.parse(fs.readFileSync(envFile, 'utf8'));
        if (parsed.JWT_SECRET && parsed.JWT_SECRET.trim()) {
            return parsed.JWT_SECRET.trim();
        }
    }
    return 'vertical-viewport-test-secret';
}

describe('Vertical Viewport Support E2E', { timeout: 120000 }, () => {
    let tempDir = null;
    let tempDbPath = null;
    let apiProcess = null;
    let viteServer = null;
    let browser = null;
    let publicContext = null;
    let adminContext = null;
    let publicPage = null;
    let adminPage = null;
    let baseUrl = '';
    let apiUrl = '';
    let userJwt = '';
    let adminJwt = '';

    const pageErrors = [];
    const consoleErrors = [];
    const failedApiResponses = [];

    function attachListeners(page, label) {
        page.on('pageerror', (err) => {
            pageErrors.push(`[${label}] ${err.message}`);
        });
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(`[${label}] ${msg.text()}`);
            }
        });
        page.on('response', (res) => {
            const url = res.url();
            if (url.includes('/api/') && res.status() >= 400) {
                failedApiResponses.push(`[${label}] ${res.status()} ${url}`);
            }
        });
    }

    before(async () => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sd3-alumni-vv-'));
        const sourceDb = path.join(REPO_ROOT, 'dev.db');
        assert.ok(fs.existsSync(sourceDb), `Expected source dev.db at ${sourceDb}`);

        tempDbPath = path.join(tempDir, 'test.db');
        fs.copyFileSync(sourceDb, tempDbPath);
        assertNotRepoDb(tempDbPath);

        const jwtSecret = loadJwtSecret();
        const db = new Database(tempDbPath, { readonly: true });
        try {
            const activeUser = db.prepare(`
                SELECT u.id AS id, ua.email AS email
                FROM User u
                JOIN UserAuth ua ON ua.userId = u.id
                JOIN UserStatus us ON us.id = u.userStatusId
                WHERE us.statusName IN ('Regular', 'Official')
                LIMIT 1
            `).get();
            assert.ok(activeUser?.id && activeUser?.email, 'Expected an active Regular/Official user in test.db');

            const adminRow = db.prepare('SELECT id, username FROM Admin LIMIT 1').get();
            assert.ok(adminRow?.id && adminRow?.username, 'Expected an Admin record in test.db');

            userJwt = jwt.sign({ id: activeUser.id, email: activeUser.email }, jwtSecret, { expiresIn: '2h' });
            adminJwt = jwt.sign({ id: adminRow.id, role: 'admin', username: adminRow.username }, jwtSecret, { expiresIn: '2h' });
        } finally {
            db.close();
        }

        const apiPort = await getFreePort();
        const vitePort = await getFreePort();
        apiUrl = `http://127.0.0.1:${apiPort}`;
        baseUrl = `http://127.0.0.1:${vitePort}`;

        const tsxCli = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
        assert.ok(fs.existsSync(tsxCli), `Expected tsx CLI at ${tsxCli}`);

        apiProcess = spawn(process.execPath, [tsxCli, path.join(REPO_ROOT, 'api', 'index.js')], {
            cwd: REPO_ROOT,
            env: {
                ...process.env,
                NODE_ENV: 'local',
                API_PORT: String(apiPort),
                PORT: String(apiPort),
                DATABASE_URL: `file:${tempDbPath.replace(/\\/g, '/')}`,
                JWT_SECRET: jwtSecret,
                CLASSIFIER_INTERVAL_MINUTES: '0',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let apiStderr = '';
        apiProcess.stderr.on('data', (chunk) => {
            apiStderr += chunk.toString();
        });

        try {
            await waitForHttp200(`${apiUrl}/api/server-time`, 25000);
        } catch (err) {
            throw new Error(`${err.message}\nAPI stderr:\n${apiStderr}`);
        }

        viteServer = await createViteServer({
            root: REPO_ROOT,
            mode: 'development',
            cacheDir: path.join(tempDir, 'vite-cache'),
            server: {
                host: '127.0.0.1',
                port: vitePort,
                strictPort: true,
                proxy: {
                    '/api': { target: apiUrl, changeOrigin: true },
                    '/uploads': { target: apiUrl, changeOrigin: true },
                    '/images': { target: apiUrl, changeOrigin: true },
                },
            },
            logLevel: 'silent',
        });
        await viteServer.listen();

        const executablePath = findBrowserExecutable();
        browser = await puppeteer.launch({
            executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });

        publicContext = await browser.createBrowserContext();
        publicPage = await publicContext.newPage();
        attachListeners(publicPage, 'public');
        await publicPage.setCookie({
            name: 'token',
            value: userJwt,
            url: baseUrl,
            httpOnly: true,
            sameSite: 'Lax',
        });

        adminContext = await browser.createBrowserContext();
        adminPage = await adminContext.newPage();
        attachListeners(adminPage, 'admin');
        await adminPage.setCookie({
            name: 'adminToken',
            value: adminJwt,
            url: baseUrl,
            httpOnly: true,
            sameSite: 'Lax',
        });
        await adminPage.goto(`${baseUrl}/admin/login`, { waitUntil: 'domcontentloaded' });
        await adminPage.evaluate((token) => {
            sessionStorage.setItem('adminToken', token);
        }, adminJwt);
    });

    after(async () => {
        try {
            if (publicContext) await publicContext.close();
        } catch { /* ignore cleanup error */ }
        try {
            if (adminContext) await adminContext.close();
        } catch { /* ignore cleanup error */ }
        try {
            if (browser) await browser.close();
        } catch { /* ignore cleanup error */ }
        try {
            if (viteServer) await viteServer.close();
        } catch { /* ignore cleanup error */ }
        if (apiProcess && !apiProcess.killed) {
            apiProcess.kill();
            await new Promise((resolve) => {
                const timer = setTimeout(resolve, 2000);
                apiProcess.once('exit', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });
        }
        if (tempDir && fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('renders public routes cleanly across vertical and landscape viewports', async () => {
        const publicRoutes = ['/', '/events', '/bulletin', '/directory'];

        for (const vp of VIEWPORTS) {
            await publicPage.setViewport({ width: vp.width, height: vp.height });

            for (const route of publicRoutes) {
                await publicPage.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle2' });
                await publicPage.waitForSelector('nav');

                if (route === '/directory') {
                    await publicPage.waitForFunction(
                        () => document.body.innerText.includes('Welcome to the home of'),
                        { timeout: 15000 }
                    );
                }

                const overflow = await publicPage.evaluate(() => ({
                    scrollWidth: document.documentElement.scrollWidth,
                    innerWidth: window.innerWidth,
                }));
                assert.ok(
                    overflow.scrollWidth <= overflow.innerWidth,
                    `[${vp.name}] ${route} horizontal overflow: scrollWidth=${overflow.scrollWidth} > innerWidth=${overflow.innerWidth}`
                );
            }

            if (vp.name === 'portrait-900') {
                await publicPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });

                const navAudit = await publicPage.evaluate(() => {
                    const nav = document.querySelector('nav');
                    const navRect = nav?.getBoundingClientRect();
                    const labels = ['Alumni Directory', 'Events', 'Bulletin', 'About', 'Donate'];
                    const links = labels.map((label) => {
                        const el = Array.from(nav?.querySelectorAll('a') || []).find(
                            (a) => a.textContent?.trim() === label
                        );
                        const rect = el?.getBoundingClientRect();
                        return {
                            label,
                            found: Boolean(el),
                            width: rect?.width ?? 0,
                            height: rect?.height ?? 0,
                            left: rect?.left ?? 0,
                            right: rect?.right ?? 0,
                            top: rect?.top ?? 0,
                            bottom: rect?.bottom ?? 0,
                        };
                    });
                    const fallbackEl = Array.from(nav?.querySelectorAll('div') || []).find((d) =>
                        d.children.length === 0 && d.textContent?.trim() === 'Open menu to navigate'
                    );
                    const fallbackRect = fallbackEl?.getBoundingClientRect();
                    return {
                        navLeft: navRect?.left ?? 0,
                        navRight: navRect?.right ?? 0,
                        links,
                        fallbackVisible: Boolean(fallbackRect && fallbackRect.height > 0 && fallbackRect.width > 0),
                    };
                });

                assert.equal(navAudit.fallbackVisible, false, '[portrait-900] "Open menu to navigate" should be hidden');
                for (const link of navAudit.links) {
                    assert.ok(link.found && link.width > 0 && link.height > 0, `[portrait-900] Nav link "${link.label}" must be visible`);
                    assert.ok(link.height <= 44, `[portrait-900] Nav link "${link.label}" wrapped (height=${link.height})`);
                    assert.ok(
                        link.left >= navAudit.navLeft - 1 && link.right <= navAudit.navRight + 1,
                        `[portrait-900] Nav link "${link.label}" clipped outside <nav>`
                    );
                }

                const footerAudit = await publicPage.evaluate(() => {
                    const toRect = (el) => {
                        if (!el) return null;
                        const r = el.getBoundingClientRect();
                        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
                    };
                    const grid = document.querySelector('footer .grid');
                    const cols = grid ? Array.from(grid.children).map((c) => toRect(c)) : [];
                    return cols;
                });
                assert.equal(footerAudit.length, 4, 'Footer should have 4 grid columns');
                assert.ok(
                    footerAudit[1].left > footerAudit[0].left && Math.abs(footerAudit[1].top - footerAudit[0].top) < 10,
                    `[portrait-900] Footer columns 1 & 2 should sit side-by-side (col0=${JSON.stringify(footerAudit[0])}, col1=${JSON.stringify(footerAudit[1])})`
                );
            }

            if (vp.name === 'portrait-900' || vp.name === 'landscape-1440') {
                await publicPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
                const menuButton = await publicPage.$('button[aria-label="Menu"]');
                assert.ok(menuButton, `[${vp.name}] TopBar menu button not found`);
                await menuButton.click();

                await publicPage.waitForFunction(
                    () => Array.from(document.querySelectorAll('h3')).some((h) => h.textContent?.trim() === 'Navigate'),
                    { timeout: 10000 }
                );

                const menuPositions = await publicPage.evaluate(() => {
                    const toRect = (el) => {
                        if (!el) return null;
                        const r = el.getBoundingClientRect();
                        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
                    };
                    const btn = document.querySelector('button[aria-label="Menu"]');
                    const topBar = btn?.closest('.sticky');
                    const navHeading = Array.from(document.querySelectorAll('h3')).find(
                        (h) => h.textContent?.trim() === 'Navigate'
                    );
                    const megaMenu = navHeading?.closest('.fixed');
                    return {
                        topBarRect: toRect(topBar),
                        megaMenuRect: toRect(megaMenu),
                    };
                });
                assert.ok(menuPositions.topBarRect && menuPositions.megaMenuRect, `[${vp.name}] TopBar or MegaMenu rect missing`);
                assert.ok(
                    menuPositions.megaMenuRect.top >= menuPositions.topBarRect.bottom - 0.5,
                    `[${vp.name}] MegaMenu overlapped TopBar: megaMenu.top=${menuPositions.megaMenuRect.top} < topBar.bottom=${menuPositions.topBarRect.bottom}`
                );

                await menuButton.click();
                await publicPage.waitForFunction(
                    () => !Array.from(document.querySelectorAll('h3')).some((h) => h.textContent?.trim() === 'Navigate'),
                    { timeout: 5000 }
                );
            }

            if (vp.name === 'portrait-1440') {
                await publicPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
                const homeHeroHeight = await publicPage.evaluate(() => {
                    const sec = document.querySelector('main section');
                    return sec ? sec.getBoundingClientRect().height : 0;
                });
                assert.ok(homeHeroHeight > 0 && homeHeroHeight <= 1100, `[portrait-1440] Home hero height ${homeHeroHeight} exceeds 1100px`);

                await publicPage.goto(`${baseUrl}/directory`, { waitUntil: 'networkidle2' });
                await publicPage.waitForFunction(
                    () => document.body.innerText.includes('Welcome to the home of'),
                    { timeout: 15000 }
                );
                const directoryHeroHeight = await publicPage.evaluate(() => {
                    const heading = Array.from(document.querySelectorAll('h1')).find((h) =>
                        h.textContent?.includes('Welcome to the home of')
                    );
                    const heroBox = heading?.closest('.rounded-md');
                    return heroBox ? heroBox.getBoundingClientRect().height : 0;
                });
                assert.ok(
                    directoryHeroHeight > 0 && directoryHeroHeight <= 450,
                    `[portrait-1440] Directory AuroraHero height ${directoryHeroHeight} > 450px (h-auto override broken?)`
                );
            }
        }
    });

    it('renders admin shell, drawer, charts, and tables cleanly across vertical and landscape viewports', async () => {
        for (const vp of VIEWPORTS) {
            await adminPage.setViewport({ width: vp.width, height: vp.height });
            await adminPage.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle2' });
            await adminPage.waitForSelector('[data-testid="admin-dashboard-root"]', { timeout: 20000 });
            await adminPage.waitForSelector('svg.recharts-surface', { timeout: 20000 });

            const dashOverflow = await adminPage.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                innerWidth: window.innerWidth,
            }));
            assert.ok(
                dashOverflow.scrollWidth <= dashOverflow.innerWidth,
                `[${vp.name}] /admin horizontal overflow: ${dashOverflow.scrollWidth} > ${dashOverflow.innerWidth}`
            );

            // Verify AdminLayout drawer vs persistent sidebar
            if (vp.isDrawer) {
                const toggleBtn = await adminPage.$('[data-testid="admin-sidebar-toggle"]');
                assert.ok(toggleBtn, `[${vp.name}] Expected admin-sidebar-toggle in drawer mode`);

                const initialAside = await adminPage.evaluate(() => {
                    const aside = document.getElementById('admin-sidebar');
                    const rect = aside?.getBoundingClientRect();
                    return { right: rect?.right ?? 9999, ariaHidden: aside?.getAttribute('aria-hidden') };
                });
                assert.ok(initialAside.right <= 0, `[${vp.name}] Drawer should start off-screen (right=${initialAside.right})`);
                assert.equal(initialAside.ariaHidden, 'true');

                await toggleBtn.click();
                await adminPage.waitForFunction(() => {
                    const aside = document.getElementById('admin-sidebar');
                    const btn = document.querySelector('[data-testid="admin-sidebar-toggle"]');
                    const rect = aside?.getBoundingClientRect();
                    return btn?.getAttribute('aria-expanded') === 'true' && rect && rect.left >= -1 && rect.width >= 200;
                }, { timeout: 5000 });

                // Close with Escape
                await adminPage.keyboard.press('Escape');
                await adminPage.waitForFunction(() => {
                    const aside = document.getElementById('admin-sidebar');
                    const btn = document.querySelector('[data-testid="admin-sidebar-toggle"]');
                    const rect = aside?.getBoundingClientRect();
                    return btn?.getAttribute('aria-expanded') === 'false' && rect && rect.right <= 0;
                }, { timeout: 5000 });

                // Re-open and close via backdrop click
                await toggleBtn.click();
                await adminPage.waitForSelector('[data-testid="admin-sidebar-backdrop"]', { timeout: 5000 });
                await adminPage.waitForFunction(() => {
                    const aside = document.getElementById('admin-sidebar');
                    const rect = aside?.getBoundingClientRect();
                    return rect && rect.left >= -1 && rect.width >= 200;
                }, { timeout: 5000 });
                await adminPage.click('[data-testid="admin-sidebar-backdrop"]');
                await adminPage.waitForFunction(() => {
                    const aside = document.getElementById('admin-sidebar');
                    const rect = aside?.getBoundingClientRect();
                    return rect && rect.right <= 0;
                }, { timeout: 5000 });
            } else {
                const toggleBtn = await adminPage.$('[data-testid="admin-sidebar-toggle"]');
                assert.equal(toggleBtn, null, `[${vp.name}] Expected no admin-sidebar-toggle in landscape desktop mode`);

                const persistent = await adminPage.evaluate(() => {
                    const toRect = (el) => {
                        if (!el) return null;
                        const r = el.getBoundingClientRect();
                        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
                    };
                    const aside = document.getElementById('admin-sidebar');
                    const main = document.querySelector('main');
                    return {
                        asideRect: toRect(aside),
                        mainRect: toRect(main),
                    };
                });
                assert.ok(persistent.asideRect && persistent.mainRect);
                assert.equal(Math.round(persistent.asideRect.width), 256, `[${vp.name}] Persistent sidebar width should be 256px`);
                assert.ok(persistent.asideRect.left >= 0);
                assert.ok(
                    persistent.mainRect.left >= persistent.asideRect.right - 1,
                    `[${vp.name}] <main> should start to the right of sidebar`
                );
            }

            // Verify AdminClock vs user badge do not overlap
            const headerAudit = await adminPage.evaluate(() => {
                const toRect = (el) => {
                    if (!el) return null;
                    const r = el.getBoundingClientRect();
                    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
                };
                const header = document.querySelector('header');
                const headerRect = toRect(header);
                const leftGroup = header?.firstElementChild;
                const clockBox = toRect(leftGroup?.lastElementChild);
                const rightGroup = toRect(header?.lastElementChild);
                return { headerRect, clockBox, rightGroup };
            });
            assert.ok(headerAudit.headerRect && headerAudit.clockBox && headerAudit.rightGroup);
            assert.ok(
                headerAudit.clockBox.right <= headerAudit.rightGroup.left + 1,
                `[${vp.name}] AdminClock overlapped user badge: clock.right=${headerAudit.clockBox.right} > user.left=${headerAudit.rightGroup.left}`
            );

            // Verify Recharts SVGs and container-query grid cards on /admin
            const chartAndCardAudit = await adminPage.evaluate(() => {
                const main = document.querySelector('main');
                const mainRect = main?.getBoundingClientRect();
                const svgs = Array.from(document.querySelectorAll('svg.recharts-surface')).map((svg) => {
                    const rect = svg.getBoundingClientRect();
                    const card = svg.closest('.rounded-xl');
                    const cardRect = card?.getBoundingClientRect();
                    return {
                        width: rect.width,
                        height: rect.height,
                        left: rect.left,
                        right: rect.right,
                        cardLeft: cardRect?.left ?? 0,
                        cardRight: cardRect?.right ?? 99999,
                    };
                });

                const root = document.querySelector('[data-testid="admin-dashboard-root"]');
                const gridOverlaps = [];
                if (root) {
                    const grids = Array.from(root.querySelectorAll(':scope > .grid'));
                    for (const grid of grids) {
                        const cards = Array.from(grid.children).map((c) => c.getBoundingClientRect());
                        for (let i = 0; i < cards.length; i++) {
                            if (mainRect && cards[i].right > mainRect.right + 1) {
                                gridOverlaps.push(`Card right overflow: ${cards[i].right} > ${mainRect.right}`);
                            }
                            for (let j = i + 1; j < cards.length; j++) {
                                const a = cards[i];
                                const b = cards[j];
                                const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                                const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                                if (overlapX > 1 && overlapY > 1) {
                                    gridOverlaps.push(`Sibling cards overlap by ${overlapX}x${overlapY}`);
                                }
                            }
                        }
                    }
                }
                return { svgs, gridOverlaps };
            });

            assert.ok(chartAndCardAudit.svgs.length >= 1, `[${vp.name}] Expected Recharts SVGs on /admin`);
            for (const svg of chartAndCardAudit.svgs) {
                assert.ok(
                    svg.width >= 100 && svg.height >= 100,
                    `[${vp.name}] Recharts SVG too small/collapsed: ${svg.width}x${svg.height}`
                );
                assert.ok(
                    svg.left >= svg.cardLeft - 1 && svg.right <= svg.cardRight + 1,
                    `[${vp.name}] Recharts SVG clipped outside card: [${svg.left}, ${svg.right}] vs card [${svg.cardLeft}, ${svg.cardRight}]`
                );
            }
            assert.deepEqual(chartAndCardAudit.gridOverlaps, [], `[${vp.name}] Dashboard grid overlaps/overflows`);

            // /admin/users
            await adminPage.goto(`${baseUrl}/admin/users`, { waitUntil: 'networkidle2' });
            await adminPage.waitForSelector('table thead tr th', { timeout: 20000 });
            const usersOverflow = await adminPage.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                innerWidth: window.innerWidth,
            }));
            assert.ok(
                usersOverflow.scrollWidth <= usersOverflow.innerWidth,
                `[${vp.name}] /admin/users horizontal overflow: ${usersOverflow.scrollWidth} > ${usersOverflow.innerWidth}`
            );

            // /admin/donations
            await adminPage.goto(`${baseUrl}/admin/donations`, { waitUntil: 'networkidle2' });
            await adminPage.waitForSelector('table thead tr th', { timeout: 20000 });
            await adminPage.waitForSelector('svg.recharts-surface', { timeout: 20000 });
            const donationsAudit = await adminPage.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                innerWidth: window.innerWidth,
                svgs: Array.from(document.querySelectorAll('svg.recharts-surface')).map((s) => {
                    const r = s.getBoundingClientRect();
                    return { width: r.width, height: r.height };
                }),
            }));
            assert.ok(
                donationsAudit.scrollWidth <= donationsAudit.innerWidth,
                `[${vp.name}] /admin/donations horizontal overflow: ${donationsAudit.scrollWidth} > ${donationsAudit.innerWidth}`
            );
            assert.ok(donationsAudit.svgs.length >= 1, `[${vp.name}] Expected Recharts SVGs on /admin/donations`);
            for (const svg of donationsAudit.svgs) {
                assert.ok(
                    svg.width >= 100 && svg.height >= 100,
                    `[${vp.name}] /admin/donations Recharts SVG collapsed: ${svg.width}x${svg.height}`
                );
            }
        }
    });

    it('records zero uncaught page errors, console errors, or failed API responses', () => {
        assert.deepEqual(pageErrors, [], `Uncaught page errors:\n${pageErrors.join('\n')}`);
        assert.deepEqual(consoleErrors, [], `Console errors:\n${consoleErrors.join('\n')}`);
        assert.deepEqual(failedApiResponses, [], `Failed API responses:\n${failedApiResponses.join('\n')}`);
    });
});
