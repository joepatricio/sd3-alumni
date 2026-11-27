/**
 * Full RFC-4180 CSV parser supporting CRLF/LF, quoted fields, embedded commas,
 * embedded newlines, and doubled quotes (`""` -> `"`).
 *
 * @param {string} text
 * @returns {{ headers: string[], rows: string[][], records: Array<Record<string, string>> }}
 */
export function parseCsv(text) {
    if (!text) {
        return { headers: [], rows: [], records: [] };
    }

    const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    if (input.length === 0) {
        return { headers: [], rows: [], records: [] };
    }

    const allRows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let fieldQuoted = false;

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];

        if (inQuotes) {
            if (ch === '"') {
                if (input[i + 1] === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += ch;
            }
        } else if (ch === '"' && currentField === '' && !fieldQuoted) {
            inQuotes = true;
            fieldQuoted = true;
        } else if (ch === ',') {
            currentRow.push(currentField);
            currentField = '';
            fieldQuoted = false;
        } else if (ch === '\r') {
            if (input[i + 1] === '\n') {
                i++;
            }
            currentRow.push(currentField);
            allRows.push(currentRow);
            currentRow = [];
            currentField = '';
            fieldQuoted = false;
        } else if (ch === '\n') {
            currentRow.push(currentField);
            allRows.push(currentRow);
            currentRow = [];
            currentField = '';
            fieldQuoted = false;
        } else {
            currentField += ch;
        }
    }

    const isTrailingEmptyRow =
        !inQuotes &&
        !fieldQuoted &&
        currentRow.length === 0 &&
        currentField === '' &&
        allRows.length > 0;

    if (!isTrailingEmptyRow) {
        currentRow.push(currentField);
        allRows.push(currentRow);
    }

    if (allRows.length === 0) {
        return { headers: [], rows: [], records: [] };
    }

    const headers = allRows[0];
    const rows = allRows.slice(1);
    const records = rows.map((row) => {
        const rec = {};
        for (let idx = 0; idx < headers.length; idx++) {
            rec[headers[idx]] = row[idx] ?? '';
        }
        return rec;
    });

    return { headers, rows, records };
}

function browserCaptureBootstrap() {
    if (window.__sd3CsvCaptureInstalled) return;
    window.__sd3CsvCaptureInstalled = true;

    const origCreateObjectURL = URL.createObjectURL.bind(URL);
    const origRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    const origAnchorClick = HTMLAnchorElement.prototype.click;

    const entries = [];
    const byUrl = new Map();

    window.__sd3CsvCaptures = entries;

    URL.createObjectURL = function (obj) {
        const url = origCreateObjectURL(obj);
        if (obj instanceof Blob) {
            const entry = {
                url,
                filename: null,
                csvText: null,
                textReady: false,
                clicked: false,
                revoked: false,
                createdAt: Date.now(),
                revokedAt: null,
            };
            byUrl.set(url, entry);
            entries.push(entry);

            obj.text().then(
                (txt) => {
                    entry.csvText = txt;
                    entry.textReady = true;
                },
                () => {
                    entry.csvText = '';
                    entry.textReady = true;
                }
            );
        }
        return url;
    };

    URL.revokeObjectURL = function (url) {
        const entry = byUrl.get(url);
        if (entry) {
            entry.revoked = true;
            entry.revokedAt = Date.now();
        }
        return origRevokeObjectURL(url);
    };

    HTMLAnchorElement.prototype.click = function () {
        const hrefAttr = this.getAttribute('href');
        const resolvedHref = this.href;
        const entry = byUrl.get(hrefAttr) || byUrl.get(resolvedHref);
        if (entry) {
            entry.clicked = true;
            entry.filename = this.download || this.getAttribute('download') || 'download.csv';
        }
        return origAnchorClick.apply(this, arguments);
    };
}

/**
 * Install CSV Blob/anchor/URL.revokeObjectURL instrumentation on a Puppeteer page.
 * Safe to call both before and after navigation.
 * @param {import('puppeteer-core').Page} page
 */
export async function installCsvDownloadCapture(page) {
    await page.evaluateOnNewDocument(browserCaptureBootstrap);
    try {
        await page.evaluate(browserCaptureBootstrap);
    } catch {
        // page may be at about:blank before first navigation
    }
}

/**
 * Execute triggerFn(), wait for the CSV Blob download click and URL.revokeObjectURL cleanup,
 * and return parsed CSV output.
 *
 * @param {import('puppeteer-core').Page} page
 * @param {() => Promise<unknown>} triggerFn
 * @param {{ timeoutMs?: number, waitForRevokeMs?: number }} [opts]
 * @returns {Promise<{ filename: string, csvText: string, parsed: ReturnType<typeof parseCsv>, revoked: boolean }>}
 */
export async function captureCsvDownload(page, triggerFn, { timeoutMs = 5000, waitForRevokeMs = 2000 } = {}) {
    await page.evaluate(browserCaptureBootstrap);
    const startIndex = await page.evaluate(() => (window.__sd3CsvCaptures || []).length);

    await triggerFn();

    const deadline = Date.now() + timeoutMs;
    let capturedIndex = -1;

    while (Date.now() < deadline) {
        const found = await page.evaluate((idx) => {
            const list = window.__sd3CsvCaptures || [];
            for (let i = idx; i < list.length; i++) {
                if (list[i].clicked && list[i].textReady) {
                    return i;
                }
            }
            return -1;
        }, startIndex);

        if (found !== -1) {
            capturedIndex = found;
            break;
        }
        await new Promise((r) => setTimeout(r, 50));
    }

    if (capturedIndex === -1) {
        throw new Error(`Timed out after ${timeoutMs}ms waiting for CSV download`);
    }

    const revokeDeadline = Date.now() + waitForRevokeMs;
    while (Date.now() < revokeDeadline) {
        const isRevoked = await page.evaluate(
            (i) => Boolean(window.__sd3CsvCaptures?.[i]?.revoked),
            capturedIndex
        );
        if (isRevoked) break;
        await new Promise((r) => setTimeout(r, 50));
    }

    const result = await page.evaluate((i) => {
        const entry = window.__sd3CsvCaptures[i];
        return {
            filename: entry.filename,
            csvText: entry.csvText,
            revoked: entry.revoked,
        };
    }, capturedIndex);

    return {
        ...result,
        parsed: parseCsv(result.csvText),
    };
}
