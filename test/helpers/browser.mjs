import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

/**
 * Locate an installed Chrome or Edge executable across Windows and POSIX platforms.
 * @returns {string}
 */
export function findBrowserExecutable() {
    const envCandidates = [
        process.env.CHROME_PATH,
        process.env.PUPPETEER_EXECUTABLE_PATH,
    ].filter(Boolean);

    for (const candidate of envCandidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }

    if (process.platform === 'win32') {
        const pf = process.env['ProgramFiles'] || 'C:\\Program Files';
        const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
        const localAppData = process.env.LOCALAPPDATA || '';
        const winCandidates = [
            path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            localAppData ? path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
            path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            localAppData ? path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : '',
        ].filter(Boolean);

        for (const candidate of winCandidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
    } else if (process.platform === 'darwin') {
        const macCandidates = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ];
        for (const candidate of macCandidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
    } else {
        const commands = ['google-chrome', 'chromium', 'chromium-browser', 'msedge'];
        for (const cmd of commands) {
            const res = spawnSync('which', [cmd], { encoding: 'utf8' });
            if (res.status === 0 && res.stdout.trim()) {
                return res.stdout.trim().split(/\r?\n/)[0];
            }
        }
    }

    throw new Error(
        'Could not locate Chrome or Edge executable. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH.'
    );
}

/**
 * Launch headless puppeteer-core cleanly.
 * @param {import('puppeteer-core').LaunchOptions} [options]
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
export async function launchBrowser(options = {}) {
    const executablePath = options.executablePath || findBrowserExecutable();
    const defaultArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
    ];
    const mergedArgs = Array.from(new Set([...defaultArgs, ...(options.args || [])]));

    return puppeteer.launch({
        headless: true,
        ...options,
        executablePath,
        args: mergedArgs,
    });
}

/**
 * Open a Puppeteer page with runtime error, console error, and /api/ HTTP >= 400 tracking.
 * @param {import('puppeteer-core').Browser} browser
 * @param {{ viewport?: { width: number, height: number, deviceScaleFactor?: number } }} [options]
 */
export async function createTrackedPage(browser, { viewport = { width: 1440, height: 900 } } = {}) {
    const page = await browser.newPage();
    await page.setViewport({ deviceScaleFactor: 1, ...viewport });

    const diagnostics = {
        pageErrors: [],
        consoleErrors: [],
        failedApiResponses: [],
    };

    page.on('pageerror', (err) => {
        diagnostics.pageErrors.push(err instanceof Error ? err.message : String(err));
    });

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            diagnostics.consoleErrors.push(msg.text());
        }
    });

    page.on('response', (res) => {
        const url = res.url();
        const status = res.status();
        if (url.includes('/api/') && status >= 400) {
            diagnostics.failedApiResponses.push({ url, status });
        }
    });

    function resetDiagnostics() {
        diagnostics.pageErrors.length = 0;
        diagnostics.consoleErrors.length = 0;
        diagnostics.failedApiResponses.length = 0;
    }

    /**
     * Assert that no unexpected page errors, console errors, or failed API responses occurred.
     * @param {{ allowStatuses?: number[], ignoreConsolePatterns?: RegExp[] }} [opts]
     */
    function assertNoErrors({ allowStatuses = [], ignoreConsolePatterns = [] } = {}) {
        const unexpectedApi = diagnostics.failedApiResponses.filter(
            (r) => !allowStatuses.includes(r.status)
        );
        const unexpectedConsole = diagnostics.consoleErrors.filter(
            (text) => !ignoreConsolePatterns.some((re) => re.test(text))
        );

        const problems = [];
        if (diagnostics.pageErrors.length > 0) {
            problems.push(`pageErrors: ${JSON.stringify(diagnostics.pageErrors)}`);
        }
        if (unexpectedConsole.length > 0) {
            problems.push(`consoleErrors: ${JSON.stringify(unexpectedConsole)}`);
        }
        if (unexpectedApi.length > 0) {
            problems.push(`failedApiResponses: ${JSON.stringify(unexpectedApi)}`);
        }

        if (problems.length > 0) {
            throw new Error(`Tracked page errors detected:\n${problems.join('\n')}`);
        }
    }

    return {
        page,
        diagnostics,
        resetDiagnostics,
        assertNoErrors,
    };
}
