import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestEnv } from '../helpers/server.mjs';
import { launchBrowser, createTrackedPage } from '../helpers/browser.mjs';
import { getFirstAdmin, mintAdminToken, authenticateAdminPage } from '../helpers/auth.mjs';
import { installCsvDownloadCapture, captureCsvDownload } from '../helpers/csv.mjs';
import {
    checkDocumentOverflow,
    checkFilterGeometry,
    checkTableColumnAlignment,
    checkUniformActionButtons,
} from '../helpers/layout.mjs';

let env;
let browser;
let adminToken;

const VIEWPORTS = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1280', width: 1280, height: 800 },
];

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function waitForTableReady(page, { minRows = 1 } = {}) {
    await page.waitForFunction(
        (min) => {
            const rows = document.querySelectorAll('table tbody tr');
            if (rows.length < min) return false;
            const firstCells = rows[0].querySelectorAll('td');
            return firstCells.length > 0 && !firstCells[0].hasAttribute('colspan');
        },
        { timeout: 15000 },
        minRows
    );
}

async function navigateToAdminPage(page, routePath, { minRows = 1 } = {}) {
    await page.goto(`${env.baseUrl}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('table thead tr th', { timeout: 30000 });
    await waitForTableReady(page, { minRows });
}

async function getVisibleHeaders(page) {
    return page.evaluate(() =>
        Array.from(document.querySelectorAll('table thead tr th')).map((th) =>
            (th.textContent || '').trim()
        )
    );
}

async function getColumnsButtonInfo(page) {
    return page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find((b) =>
            Array.from(b.querySelectorAll('span')).some((s) => s.textContent?.trim() === 'Columns')
        );
        if (!btn) return null;
        const badgeSpan = Array.from(btn.querySelectorAll('span')).find((s) =>
            /^\d+\/\d+$/.test((s.textContent || '').trim())
        );
        return {
            found: true,
            text: (btn.textContent || '').trim(),
            badge: badgeSpan ? badgeSpan.textContent.trim() : null,
            expanded: btn.getAttribute('aria-expanded'),
        };
    });
}

async function clickHandleFromEvaluate(page, findFn, ...args) {
    const handle = await page.evaluateHandle(findFn, ...args);
    const el = handle.asElement();
    if (!el) {
        await handle.dispose();
        return false;
    }
    await el.click();
    await handle.dispose();
    return true;
}

async function openColumnsDropdown(page) {
    const clicked = await clickHandleFromEvaluate(page, () => {
        const btns = Array.from(document.querySelectorAll('button'));
        return (
            btns.find((b) =>
                Array.from(b.querySelectorAll('span')).some((s) => s.textContent?.trim() === 'Columns')
            ) || null
        );
    });
    assert.ok(clicked, 'Columns trigger button should exist');
    await page.waitForSelector('[role="menu"]', { timeout: 5000 });
}

async function closeMenuIfOpen(page) {
    const open = await page.$('[role="menu"]');
    if (open) {
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('[role="menu"]'), { timeout: 3000 });
    }
}

async function getDropdownMenuState(page) {
    return page.evaluate(() => {
        const menu = document.querySelector('[role="menu"]');
        if (!menu) return null;
        const checkboxes = Array.from(menu.querySelectorAll('[role="menuitemcheckbox"]')).map((el) => ({
            label: (el.textContent || '').trim(),
            checked: el.getAttribute('aria-checked') === 'true',
            disabled:
                el.getAttribute('aria-disabled') === 'true' ||
                el.hasAttribute('data-disabled') ||
                el.hasAttribute('disabled'),
            title: el.getAttribute('title') || '',
        }));
        const showAll = Array.from(menu.querySelectorAll('[role="menuitem"]')).find(
            (el) => (el.textContent || '').trim() === 'Show all columns'
        );
        return {
            checkboxes,
            hasShowAll: Boolean(showAll),
        };
    });
}

async function clickMenuCheckboxByLabel(page, label) {
    const clicked = await clickHandleFromEvaluate(
        page,
        (targetLabel) => {
            const items = Array.from(document.querySelectorAll('[role="menu"] [role="menuitemcheckbox"]'));
            return items.find((el) => (el.textContent || '').trim() === targetLabel) || null;
        },
        label
    );
    assert.ok(clicked, `Dropdown checkbox "${label}" should exist`);
}

async function clickShowAllColumns(page) {
    const clicked = await clickHandleFromEvaluate(page, () => {
        const items = Array.from(document.querySelectorAll('[role="menu"] [role="menuitem"]'));
        return items.find((el) => (el.textContent || '').trim() === 'Show all columns') || null;
    });
    assert.ok(clicked, '"Show all columns" menuitem should exist');
}

async function clickTableHeaderByLabel(page, label) {
    const clicked = await clickHandleFromEvaluate(
        page,
        (targetLabel) => {
            const ths = Array.from(document.querySelectorAll('table thead tr th'));
            return ths.find((el) => (el.textContent || '').trim().startsWith(targetLabel)) || null;
        },
        label
    );
    assert.ok(clicked, `Table header "${label}" should exist`);
}

async function clickButtonByText(page, text) {
    const clicked = await clickHandleFromEvaluate(
        page,
        (targetText) => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.find((b) => (b.textContent || '').trim() === targetText) || null;
        },
        text
    );
    assert.ok(clicked, `Button "${text}" should exist`);
}

async function selectRadixOption(page, triggerFindFn, triggerArgs, optionMatchFn, optionArgs) {
    const opened = await clickHandleFromEvaluate(page, triggerFindFn, ...triggerArgs);
    assert.ok(opened, 'Radix Select trigger should exist');

    await page.waitForSelector('[role="listbox"] [role="option"]', { timeout: 5000 });
    const optionHandle = await page.evaluateHandle(optionMatchFn, ...optionArgs);
    const optionEl = optionHandle.asElement();
    assert.ok(optionEl, 'Matching Radix Select option should exist');
    const selectedText = await page.evaluate((el) => (el.textContent || '').trim(), optionEl);
    await optionEl.click();
    await optionHandle.dispose();
    await page.waitForFunction(() => !document.querySelector('[role="listbox"]'), { timeout: 5000 });
    return selectedText;
}

function assertOkHttpStatus(status, message) {
    assert.ok(
        status === 200 || status === 304,
        `${message ? `${message}: ` : ''}expected HTTP 200 or 304, got ${status}`
    );
}

async function waitForApiGet(page, pathFragment, triggerFn) {
    const responsePromise = page.waitForResponse(
        (res) => res.request().method() === 'GET' && res.url().includes(pathFragment),
        { timeout: 15000 }
    );
    await triggerFn();
    const res = await responsePromise;
    let data = null;
    if (res.status() === 200) {
        try {
            data = await res.json();
        } catch {
            // ignore non-JSON responses
        }
    }
    return {
        url: res.url(),
        status: res.status(),
        data,
    };
}

async function runSharedColumnAndCsvChecks(page, config) {
    await navigateToAdminPage(page, config.route);

    // 1. Default column state
    const defaultHeaders = await getVisibleHeaders(page);
    assert.deepEqual(defaultHeaders, config.expectedHeaders);
    const initialBtn = await getColumnsButtonInfo(page);
    assert.ok(initialBtn?.found);
    assert.equal(initialBtn.badge, null, `${config.name}: no badge when all columns visible`);

    // 2. Toggle one column off -> <th> and <td> disappear, badge updates, menu stays open
    await openColumnsDropdown(page);
    const initialMenu = await getDropdownMenuState(page);
    assert.equal(initialMenu.hasShowAll, false);
    assert.equal(initialMenu.checkboxes.length, config.toggleableLabels.length);

    await clickMenuCheckboxByLabel(page, config.hideFirstLabel);
    await page.waitForFunction(
        (lbl) =>
            !Array.from(document.querySelectorAll('table thead tr th')).some((th) =>
                (th.textContent || '').trim().startsWith(lbl)
            ),
        { timeout: 5000 },
        config.hideFirstLabel
    );

    const afterHideHeaders = await getVisibleHeaders(page);
    assert.equal(afterHideHeaders.length, config.expectedHeaders.length - 1);
    const firstRowTdCount = await page.evaluate(
        () => document.querySelectorAll('table tbody tr:first-child td').length
    );
    assert.equal(firstRowTdCount, afterHideHeaders.length);

    const badgeBtn = await getColumnsButtonInfo(page);
    assert.equal(
        badgeBtn.badge,
        `${config.toggleableLabels.length - 1}/${config.toggleableLabels.length}`
    );

    // Dropdown stayed open and "Show all columns" appeared
    const afterHideMenu = await getDropdownMenuState(page);
    assert.ok(afterHideMenu, 'Dropdown menu must stay open after toggling a column');
    assert.equal(afterHideMenu.hasShowAll, true);

    // 3. Last-visible-column guard
    for (const lbl of config.toggleableLabels) {
        if (lbl === config.hideFirstLabel || lbl === config.keepLastLabel) continue;
        await clickMenuCheckboxByLabel(page, lbl);
    }

    await page.waitForFunction(
        () =>
            document.querySelectorAll('[role="menu"] [role="menuitemcheckbox"][aria-checked="true"]')
                .length === 1,
        { timeout: 5000 }
    );

    const oneLeftMenu = await getDropdownMenuState(page);
    const lastChecked = oneLeftMenu.checkboxes.find((c) => c.checked);
    assert.equal(lastChecked.label, config.keepLastLabel);
    assert.equal(lastChecked.disabled, true, 'Last visible column checkbox must be disabled');
    assert.equal(lastChecked.title, 'At least one column must remain visible');

    // Attempt clicking disabled last column via DOM click / handle -> remains visible
    await page.evaluate((targetLabel) => {
        const items = Array.from(document.querySelectorAll('[role="menu"] [role="menuitemcheckbox"]'));
        const item = items.find((el) => (el.textContent || '').trim() === targetLabel);
        item?.click();
    }, config.keepLastLabel);
    await sleep(100);
    const stillVisibleHeaders = await getVisibleHeaders(page);
    assert.ok(stillVisibleHeaders.some((h) => h.startsWith(config.keepLastLabel)));

    // 4. "Show all columns" restores all columns
    await clickShowAllColumns(page);
    await page.waitForFunction(
        (expectedCount) => document.querySelectorAll('table thead tr th').length === expectedCount,
        { timeout: 5000 },
        config.expectedHeaders.length
    );
    const restoredBtn = await getColumnsButtonInfo(page);
    assert.equal(restoredBtn.badge, null);
    await closeMenuIfOpen(page);

    // 5. Hiding currently sorted column clears sort
    const sortRes = await waitForApiGet(page, config.apiPath, async () => {
        await clickTableHeaderByLabel(page, config.sortAndHideLabel);
    });
    assertOkHttpStatus(sortRes.status, `${config.name} sort`);
    assert.match(new URL(sortRes.url).searchParams.get('_sort') || '', new RegExp(config.sortApiParam));
    await waitForTableReady(page);

    await openColumnsDropdown(page);
    const clearSortRes = await waitForApiGet(page, config.apiPath, async () => {
        await clickMenuCheckboxByLabel(page, config.sortAndHideLabel);
    });
    assertOkHttpStatus(clearSortRes.status, `${config.name} clear sort`);
    const clearedSortParam = new URL(clearSortRes.url).searchParams.get('_sort') || '';
    assert.equal(
        clearedSortParam.includes(config.sortApiParam),
        false,
        `Hiding sorted column "${config.sortAndHideLabel}" should clear sort param (got "${clearedSortParam}")`
    );
    await waitForTableReady(page);

    // Restore and confirm unsorted icon on restored column
    await clickShowAllColumns(page);
    await closeMenuIfOpen(page);
    const iconIsUnsorted = await page.evaluate((lbl) => {
        const th = Array.from(document.querySelectorAll('table thead tr th')).find((el) =>
            (el.textContent || '').trim().startsWith(lbl)
        );
        const svg = th?.querySelector('svg');
        return Boolean(svg && svg.classList.contains('text-gray-400'));
    }, config.sortAndHideLabel);
    assert.equal(iconIsUnsorted, true, `Restored column "${config.sortAndHideLabel}" should be unsorted`);

    // 6. Filtered CSV Export + URL.revokeObjectURL verification
    await openColumnsDropdown(page);
    for (const lbl of config.csvHideLabels) {
        await clickMenuCheckboxByLabel(page, lbl);
    }
    await closeMenuIfOpen(page);

    const download = await captureCsvDownload(page, async () => {
        await clickButtonByText(page, 'Export CSV');
    });
    assert.equal(download.revoked, true, `${config.name}: URL.revokeObjectURL must be called`);
    assert.match(download.filename, config.csvFilenamePattern);
    assert.deepEqual(download.parsed.headers, config.expectedFilteredCsvHeaders);
    assert.ok(download.parsed.rows.length > 0, `${config.name}: exported CSV should have data rows`);
    for (const row of download.parsed.rows) {
        assert.equal(row.length, download.parsed.headers.length);
    }

    // Restore all columns before next suite
    await openColumnsDropdown(page);
    await clickShowAllColumns(page);
    await closeMenuIfOpen(page);
}

before(async () => {
    env = await startTestEnv({ copyDb: true });
    const admin = getFirstAdmin(env.tempDbPath);
    adminToken = mintAdminToken({
        id: admin.id,
        username: admin.username,
        jwtSecret: env.jwtSecret,
    });
    browser = await launchBrowser();
});

after(async () => {
    if (browser) {
        await browser.close();
    }
    if (env) {
        await env.close();
    }
});

test('Shared ColumnVisibilityDropdown and filtered CSV export across all 4 admin tables', async (t) => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await installCsvDownloadCapture(page);

        await t.test('AdminUsers (/admin/users)', async () => {
            await runSharedColumnAndCsvChecks(page, {
                name: 'AdminUsers',
                route: '/admin/users',
                apiPath: '/api/admin/users',
                expectedHeaders: ['Name', 'Degree Program', 'Email', 'Batch', 'Granted/Expiry Date', 'Status', 'Actions'],
                toggleableLabels: ['Name', 'Degree Program', 'Email', 'Batch', 'Granted/Expiry Date', 'Status'],
                hideFirstLabel: 'Email',
                keepLastLabel: 'Name',
                sortAndHideLabel: 'Email',
                sortApiParam: 'profile.email',
                csvHideLabels: ['Email', 'Granted/Expiry Date'],
                expectedFilteredCsvHeaders: ['Name', 'Degree Program', 'Batch', 'Status', 'Reason'],
                csvFilenamePattern: /^users_export\.csv$/,
            });
            assertNoErrors();
        });

        await t.test('AdminBulletins (/admin/bulletins)', async () => {
            await runSharedColumnAndCsvChecks(page, {
                name: 'AdminBulletins',
                route: '/admin/bulletins',
                apiPath: '/api/admin/bulletins',
                expectedHeaders: ['Title', 'Category', 'Author', 'Date Submitted', 'Status', 'Actions'],
                toggleableLabels: ['Title', 'Category', 'Author', 'Date Submitted', 'Status'],
                hideFirstLabel: 'Author',
                keepLastLabel: 'Title',
                sortAndHideLabel: 'Category',
                sortApiParam: 'category.bulletinCategoryName',
                csvHideLabels: ['Category', 'Author'],
                expectedFilteredCsvHeaders: ['Title', 'Date', 'Type', 'Status'],
                csvFilenamePattern: /^bulletins_export_\d{4}-\d{2}-\d{2}\.csv$/,
            });
            assertNoErrors();
        });

        await t.test('AdminEvents (/admin/events)', async () => {
            await runSharedColumnAndCsvChecks(page, {
                name: 'AdminEvents',
                route: '/admin/events',
                apiPath: '/api/admin/events',
                expectedHeaders: ['Title', 'Category', 'Author', 'Event Date', 'Status', 'Actions'],
                toggleableLabels: ['Title', 'Category', 'Author', 'Event Date', 'Status'],
                hideFirstLabel: 'Author',
                keepLastLabel: 'Title',
                sortAndHideLabel: 'Category',
                sortApiParam: 'category.eventCategoryName',
                csvHideLabels: ['Category', 'Author'],
                expectedFilteredCsvHeaders: ['Title', 'Date', 'Type', 'Status'],
                csvFilenamePattern: /^events_export_\d{4}-\d{2}-\d{2}\.csv$/,
            });
            assertNoErrors();
        });

        await t.test('AdminDonations (/admin/donations)', async () => {
            await runSharedColumnAndCsvChecks(page, {
                name: 'AdminDonations',
                route: '/admin/donations',
                apiPath: '/api/donations',
                expectedHeaders: ['Date', 'Donor', 'Amount', 'Status', 'Bank Name', 'Donation Reference'],
                toggleableLabels: ['Date', 'Donor', 'Amount', 'Status', 'Bank Name', 'Donation Reference'],
                hideFirstLabel: 'Bank Name',
                keepLastLabel: 'Donor',
                sortAndHideLabel: 'Donor',
                sortApiParam: 'user.profile.userName',
                csvHideLabels: ['Status', 'Bank Name'],
                expectedFilteredCsvHeaders: ['Date', 'Donor', 'Amount', 'Reference'],
                csvFilenamePattern: /^donations_export\.csv$/,
            });
            assertNoErrors();
        });
    } finally {
        await page.close();
    }
});

test('isExporting guard prevents concurrent CSV export requests on AdminUsers and AdminDonations', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;

    async function verifyExportLock(route, exportApiPath) {
        await navigateToAdminPage(page, route);
        let exportGetCount = 0;
        let sawDisabledDuringFlight = false;
        let releasePausedRequest;
        const pausedRequestPromise = new Promise((resolve) => {
            releasePausedRequest = resolve;
        });

        await page.setRequestInterception(true);
        const onRequest = async (req) => {
            const url = req.url();
            if (req.method() === 'GET' && url.includes(exportApiPath) && !url.includes('_page=')) {
                exportGetCount++;
                await pausedRequestPromise;
            }
            if (!req.isInterceptResolutionHandled()) {
                await req.continue();
            }
        };
        page.on('request', onRequest);

        try {
            const download = await captureCsvDownload(page, async () => {
                // Trigger rapid double-click synchronously
                await page.evaluate(() => {
                    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
                        (b.textContent || '').includes('Export CSV')
                    );
                    if (!btn) throw new Error('Export CSV button not found');
                    btn.click();
                    btn.click();
                });

                // Wait for React state flush showing disabled + "Exporting..." while request is paused
                await page.waitForFunction(
                    () => {
                        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
                            (b.textContent || '').includes('Exporting...')
                        );
                        return Boolean(btn && btn.disabled);
                    },
                    { timeout: 5000 }
                );
                sawDisabledDuringFlight = true;
                releasePausedRequest();
            });

            assert.equal(sawDisabledDuringFlight, true, `${route}: button should disable and show "Exporting..."`);
            assert.equal(exportGetCount, 1, `${route}: rapid double click must issue exactly 1 export GET`);
            assert.equal(download.revoked, true);

            await page.waitForFunction(
                () => {
                    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
                        (b.textContent || '').includes('Export CSV')
                    );
                    return Boolean(btn && !btn.disabled);
                },
                { timeout: 5000 }
            );
        } finally {
            releasePausedRequest?.();
            page.off('request', onRequest);
            await page.setRequestInterception(false);
        }
    }

    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await installCsvDownloadCapture(page);

        await verifyExportLock('/admin/users', '/api/admin/users');
        await verifyExportLock('/admin/donations', '/api/donations');
        assertNoErrors();
    } finally {
        await page.close();
    }
});

test('AdminUsers: Degree badge & filter, 6-column sorting (including grantedDate), and Status pill modal', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await navigateToAdminPage(page, '/admin/users');

        // 1. Degree Program column & badge rendering
        const badgeCount = await page.evaluate(() => {
            const badges = Array.from(document.querySelectorAll('table tbody tr td:nth-child(2) span.w-16'));
            return badges.filter((b) => /^(BSME|BSCE|BSIE|BSEE|BSECE|BSCPE)$/.test((b.textContent || '').trim())).length;
        });
        assert.ok(badgeCount > 0, 'Expected degree abbreviation badges in Degree Program column');

        // 2. Degree <Select> filter
        let pickedDegreeLabel = '';
        const filterRes = await waitForApiGet(page, '/api/admin/users', async () => {
            pickedDegreeLabel = await selectRadixOption(
                page,
                () =>
                    Array.from(document.querySelectorAll('button[role="combobox"]')).find((el) =>
                        (el.textContent || '').includes('All Degree Programs')
                    ) || null,
                [],
                () =>
                    Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).find((o) => {
                        const txt = (o.textContent || '').trim();
                        return txt !== 'All Degree Programs' && txt.includes(' - ');
                    }) || null,
                []
            );
        });
        assertOkHttpStatus(filterRes.status, 'Degree filter');
        assert.match(new URL(filterRes.url).searchParams.get('_where') || '', /degreeId/);

        await waitForTableReady(page, { minRows: 1 });
        const expectedAbbr = pickedDegreeLabel.split(' - ')[0].trim();
        const allRowsMatchDegree = await page.evaluate((abbr) => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.length > 0 && rows.every((tr) => (tr.textContent || '').includes(abbr));
        }, expectedAbbr);
        assert.equal(allRowsMatchDegree, true, `Filtered rows should match degree ${expectedAbbr}`);

        // Reset degree filter
        await waitForApiGet(page, '/api/admin/users', async () => {
            await selectRadixOption(
                page,
                (abbr) =>
                    Array.from(document.querySelectorAll('button[role="combobox"]')).find((el) =>
                        (el.textContent || '').includes(abbr)
                    ) || null,
                [expectedAbbr],
                () =>
                    Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).find(
                        (o) => (o.textContent || '').trim() === 'All Degree Programs'
                    ) || null,
                []
            );
        });
        await waitForTableReady(page);

        // 3. Sorting across all 6 columns, verifying grantedDate desc + asc HTTP 200/304
        for (const headerLabel of ['Name', 'Degree Program', 'Email', 'Batch', 'Granted/Expiry Date', 'Status']) {
            const descRes = await waitForApiGet(page, '/api/admin/users', async () => {
                await clickTableHeaderByLabel(page, headerLabel);
            });
            assertOkHttpStatus(descRes.status, `Descending sort on "${headerLabel}"`);
            await waitForTableReady(page);

            const ascRes = await waitForApiGet(page, '/api/admin/users', async () => {
                await clickTableHeaderByLabel(page, headerLabel);
            });
            assertOkHttpStatus(ascRes.status, `Ascending sort on "${headerLabel}"`);
            await waitForTableReady(page);

            if (headerLabel === 'Granted/Expiry Date') {
                assert.equal(new URL(descRes.url).searchParams.get('_sort'), '-grantedDate');
                assert.equal(new URL(ascRes.url).searchParams.get('_sort'), 'grantedDate');
            }
        }

        // Clear Status sort (3rd click -> null) and wait for both sort arrow reset AND DOM commit
        const beforeClearFirstRow = await page.evaluate(
            () => document.querySelector('table tbody tr')?.textContent || ''
        );
        const clearSortRes = await waitForApiGet(page, '/api/admin/users', async () => {
            await clickTableHeaderByLabel(page, 'Status');
        });
        assertOkHttpStatus(clearSortRes.status, 'Clear Status sort');
        assert.equal(new URL(clearSortRes.url).searchParams.get('_sort'), null);

        await page.waitForFunction(
            () => {
                const th = Array.from(document.querySelectorAll('table thead tr th')).find((el) =>
                    (el.textContent || '').trim().startsWith('Status')
                );
                const svg = th?.querySelector('svg');
                return Boolean(svg && svg.classList.contains('text-gray-400'));
            },
            { timeout: 5000 }
        );

        const expectedFirstUser = clearSortRes.data?.data?.[0]?.profile?.userName;
        if (expectedFirstUser) {
            await page.waitForFunction(
                (expectedName) => {
                    const firstRow = document.querySelector('table tbody tr');
                    return Boolean(firstRow && (firstRow.textContent || '').includes(expectedName));
                },
                { timeout: 10000 },
                expectedFirstUser
            );
        } else {
            await page.waitForFunction(
                (prevText) => {
                    const firstRow = document.querySelector('table tbody tr');
                    return Boolean(firstRow && (firstRow.textContent || '') !== prevText);
                },
                { timeout: 5000 },
                beforeClearFirstRow
            ).catch(() => {});
        }
        await waitForTableReady(page);

        // Verify M2 single formatDate fix: non-suspended grantedDate cells must never show "Invalid Date"
        const grantedDateCheck = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            const invalidCells = [];
            let nonSuspendedFormattedCount = 0;
            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length < 6) continue;
                const grantedText = (cells[4].textContent || '').trim();
                const statusText = (cells[5].textContent || '').trim();
                if (grantedText.includes('Invalid Date')) {
                    invalidCells.push({ statusText, grantedText });
                }
                if (statusText !== 'Suspended' && grantedText && grantedText !== 'N/A' && !grantedText.includes('Invalid Date')) {
                    nonSuspendedFormattedCount++;
                }
            }
            return { invalidCells, nonSuspendedFormattedCount };
        });
        assert.deepEqual(grantedDateCheck.invalidCells, [], 'Granted/Expiry Date cells must never show "Invalid Date"');
        assert.ok(
            grantedDateCheck.nonSuspendedFormattedCount > 0,
            'Expected at least one non-suspended user with a formatted grantedDate'
        );

        // 4. Clickable Status pill edit modal (Suspended + expiry preset + persistence on temp DB)
        const targetName = await page.evaluate(() => {
            const btns = Array.from(
                document.querySelectorAll('table tbody tr button[aria-label^="Change status for "]')
            );
            const nonSuspended = btns.find(
                (b) => !(b.getAttribute('aria-label') || '').includes('(currently Suspended)')
            );
            const btn = nonSuspended || btns[0];
            if (!btn) return '';
            const label = btn.getAttribute('aria-label') || '';
            btn.click();
            const match = label.match(/^Change status for (.+?) \(currently /);
            return match ? match[1] : '';
        });
        assert.ok(targetName, 'User status pill button should open modal');
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

        await selectRadixOption(
            page,
            () => document.querySelector('[role="dialog"] button[role="combobox"]'),
            [],
            () =>
                Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).find(
                    (o) => (o.textContent || '').trim() === 'Suspended'
                ) || null,
            []
        );

        await page.waitForFunction(
            () => (document.querySelector('[role="dialog"]')?.textContent || '').includes('Suspension Expiry Date'),
            { timeout: 5000 }
        );

        // Click "Indefinite" preset and verify Indefinite badge appears
        await clickHandleFromEvaluate(page, () => {
            const dlg = document.querySelector('[role="dialog"]');
            return Array.from(dlg.querySelectorAll('button')).find(
                (b) => (b.textContent || '').trim() === 'Indefinite'
            ) || null;
        });
        await page.waitForFunction(
            () => {
                const dlg = document.querySelector('[role="dialog"]');
                return Array.from(dlg?.querySelectorAll('*') || []).some(
                    (el) => (el.textContent || '').trim() === 'Indefinite' && el.tagName !== 'BUTTON'
                );
            },
            { timeout: 3000 }
        );

        // Switch preset to 1 Week and enter note
        await clickHandleFromEvaluate(page, () => {
            const dlg = document.querySelector('[role="dialog"]');
            return Array.from(dlg.querySelectorAll('button')).find(
                (b) => (b.textContent || '').trim() === '1 Week'
            ) || null;
        });
        await page.type('[role="dialog"] textarea', 'E2E temp suspension test');

        const [postRes] = await Promise.all([
            page.waitForResponse(
                (res) => res.request().method() === 'POST' && /\/api\/admin\/users\/[^/]+\/status/.test(res.url()),
                { timeout: 10000 }
            ),
            clickHandleFromEvaluate(page, () => {
                const dlg = document.querySelector('[role="dialog"]');
                return Array.from(dlg.querySelectorAll('button')).find(
                    (b) => (b.textContent || '').trim() === 'Save Changes'
                ) || null;
            }),
        ]);
        assert.equal(postRes.status(), 200);
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 5000 });
        await waitForTableReady(page);

        // Verify persistence after reload (filter by targetName for deterministic Page 1 verification)
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await waitForTableReady(page);
        await page.waitForSelector('input[placeholder="Search user by name..."]', { timeout: 10000 });
        await page.evaluate((name) => {
            const input = document.querySelector('input[placeholder="Search user by name..."]');
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, name);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, targetName);
        const searchRes = await waitForApiGet(page, '/api/admin/users', async () => {
            await clickButtonByText(page, 'Submit');
        });
        assertOkHttpStatus(searchRes.status, 'Search persisted user after reload');
        await page.waitForFunction(
            (name) =>
                Array.from(
                    document.querySelectorAll('table tbody tr button[aria-label^="Change status for "]')
                ).some((b) =>
                    (b.getAttribute('aria-label') || '').startsWith(`Change status for ${name} (currently Suspended)`)
                ),
            { timeout: 10000 },
            targetName
        );
        const persisted = await page.evaluate((name) => {
            const btns = Array.from(
                document.querySelectorAll('table tbody tr button[aria-label^="Change status for "]')
            );
            const btn = btns.find((b) =>
                (b.getAttribute('aria-label') || '').startsWith(`Change status for ${name} (currently `)
            );
            const row = btn?.closest('tr');
            return {
                ariaLabel: btn?.getAttribute('aria-label') || '',
                rowText: row?.textContent || '',
            };
        }, targetName);
        assert.match(persisted.ariaLabel, /\(currently Suspended\)/);
        assert.match(persisted.rowText, /Expires:/);
        assert.equal(persisted.rowText.includes('Invalid Date'), false);

        assertNoErrors();
    } finally {
        await page.close();
    }
});

test('AdminContentTable (Bulletins & Events): Category 3-state sort, Status pill modal (0 pre-PATCH GETs), and itemsPerPage', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;

    async function verifyContentPage(route, apiPath, expectedCategorySortKey, targetStatus) {
        await navigateToAdminPage(page, route);

        // 1. Category 3-state sort cycle: desc -> asc -> null
        const s1 = await waitForApiGet(page, apiPath, async () => {
            await clickTableHeaderByLabel(page, 'Category');
        });
        assertOkHttpStatus(s1.status, `${route} Category desc sort`);
        assert.equal(new URL(s1.url).searchParams.get('_sort'), `-${expectedCategorySortKey}`);
        await waitForTableReady(page);

        const s2 = await waitForApiGet(page, apiPath, async () => {
            await clickTableHeaderByLabel(page, 'Category');
        });
        assertOkHttpStatus(s2.status, `${route} Category asc sort`);
        assert.equal(new URL(s2.url).searchParams.get('_sort'), expectedCategorySortKey);
        await waitForTableReady(page);

        const s3 = await waitForApiGet(page, apiPath, async () => {
            await clickTableHeaderByLabel(page, 'Category');
        });
        assertOkHttpStatus(s3.status, `${route} Category clear sort`);
        assert.equal(new URL(s3.url).searchParams.get('_sort'), null);
        await waitForTableReady(page);

        // Restore default -date sort so row 1 stays on Page 1 across reload
        await waitForApiGet(page, apiPath, async () => {
            await clickTableHeaderByLabel(page, route.includes('bulletins') ? 'Date Submitted' : 'Event Date');
        });
        await waitForTableReady(page);

        // 2. Clickable Status pill modal -> PATCH with ZERO redundant pre-PATCH GETs
        const targetAriaLabel = await page.evaluate(() => {
            const btn = document.querySelector('table tbody tr button[title="Click to change status"]');
            if (!btn) return '';
            const aria = btn.getAttribute('aria-label') || '';
            btn.click();
            return aria;
        });
        assert.ok(targetAriaLabel, `${route}: status pill button should exist`);
        const targetTitleMatch = targetAriaLabel.match(/^Change status for (.+?) \(currently /);
        const targetTitle = targetTitleMatch ? targetTitleMatch[1] : '';
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

        await selectRadixOption(
            page,
            () => document.querySelector('[role="dialog"] button[role="combobox"]'),
            [],
            (statusLabel) =>
                Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).find(
                    (o) => (o.textContent || '').trim() === statusLabel
                ) || null,
            [targetStatus]
        );
        await page.type('[role="dialog"] textarea', `E2E status note for ${targetStatus}`);

        const observedRequests = [];
        const reqListener = (req) => {
            if (req.url().includes('/api/')) {
                observedRequests.push({ method: req.method(), url: req.url() });
            }
        };
        page.on('request', reqListener);

        try {
            const [patchRes] = await Promise.all([
                page.waitForResponse(
                    (res) =>
                        res.request().method() === 'PATCH' &&
                        new RegExp(`${apiPath}/[^/]+/status`).test(res.url()),
                    { timeout: 10000 }
                ),
                clickHandleFromEvaluate(page, () => {
                    const dlg = document.querySelector('[role="dialog"]');
                    return Array.from(dlg.querySelectorAll('button')).find(
                        (b) => (b.textContent || '').trim() === 'Save Changes'
                    ) || null;
                }),
            ]);
            assert.equal(patchRes.status(), 200);
            await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 5000 });

            const patchIdx = observedRequests.findIndex(
                (r) => r.method === 'PATCH' && r.url.includes('/status')
            );
            assert.ok(patchIdx >= 0, 'PATCH /status request must be recorded');
            const prePatchGets = observedRequests
                .slice(0, patchIdx)
                .filter((r) => r.method === 'GET' && r.url.includes(apiPath));
            assert.equal(prePatchGets.length, 0, `${route}: expected 0 pre-PATCH GET requests`);
        } finally {
            page.off('request', reqListener);
        }

        // Verify persistence after reload
        await page.reload({ waitUntil: 'domcontentloaded' });
        await waitForTableReady(page);
        const updatedPillText = await page.evaluate((title) => {
            const btns = Array.from(
                document.querySelectorAll('table tbody tr button[title="Click to change status"]')
            );
            const btn = title
                ? btns.find((b) =>
                    (b.getAttribute('aria-label') || '').startsWith(`Change status for ${title} (currently `)
                )
                : btns[0];
            return (btn?.textContent || '').trim();
        }, targetTitle);
        assert.equal(updatedPillText, targetStatus);

        // 3. itemsPerPage selector change while on Page 1 triggers fresh GET with _per_page=10
        const perPageRes = await waitForApiGet(page, apiPath, async () => {
            await selectRadixOption(
                page,
                () =>
                    Array.from(document.querySelectorAll('button[role="combobox"]')).find(
                        (el) => (el.textContent || '').trim() === '20'
                    ) || null,
                [],
                () =>
                    Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).find(
                        (o) => (o.textContent || '').trim() === '10'
                    ) || null,
                []
            );
        });
        assertOkHttpStatus(perPageRes.status, `${route} itemsPerPage=10`);
        const perPageUrl = new URL(perPageRes.url);
        assert.equal(perPageUrl.searchParams.get('_page'), '1');
        assert.equal(perPageUrl.searchParams.get('_per_page'), '10');
        await waitForTableReady(page);
        const rowCount = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
        assert.ok(rowCount > 0 && rowCount <= 10, `${route}: expected <= 10 rows, got ${rowCount}`);
    }

    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await verifyContentPage('/admin/bulletins', '/api/admin/bulletins', 'category.bulletinCategoryName', 'Archived');
        await verifyContentPage('/admin/events', '/api/admin/events', 'category.eventCategoryName', 'Archived');
        assertNoErrors();
    } finally {
        await page.close();
    }
});

test('AdminDonations: preview eye link, empty colSpan & pagination, and chart isolation during typing', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await navigateToAdminPage(page, '/admin/donations');

        await page.waitForSelector('.recharts-wrapper svg', { timeout: 10000 });

        // 1. Chart isolation during table search typing
        await page.evaluate(() => {
            window.__rechartsMutationCount = 0;
            const wrappers = document.querySelectorAll('.recharts-wrapper');
            window.__rechartsObserver = new MutationObserver((mutations) => {
                window.__rechartsMutationCount += mutations.length;
            });
            for (const w of wrappers) {
                window.__rechartsObserver.observe(w, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true,
                });
            }
        });

        await page.type('input[placeholder="Search by Donor..."]', 'ChartIsolationX', { delay: 15 });
        await sleep(150);

        const chartMutations = await page.evaluate(() => {
            window.__rechartsObserver?.disconnect();
            return window.__rechartsMutationCount;
        });
        assert.equal(chartMutations, 0, 'Typing in table search must cause 0 Recharts SVG mutations');

        // 2. Empty state colSpan + "Page 1 of 1" + disabled Next button
        await page.evaluate(() => {
            const input = document.querySelector('input[placeholder="Search by Donor..."]');
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, '__NON_EXISTENT_DONOR_E2E_999__');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const emptyRes = await waitForApiGet(page, '/api/donations', async () => {
            await clickButtonByText(page, 'Submit');
        });
        assertOkHttpStatus(emptyRes.status, 'Donations empty filter');

        await page.waitForFunction(
            () => (document.querySelector('table tbody')?.textContent || '').includes('No transactions found'),
            { timeout: 5000 }
        );

        const emptyState = await page.evaluate(() => {
            const td = document.querySelector('table tbody tr td[colspan]');
            const pageText = document.body.innerText;
            const nextBtn = Array.from(document.querySelectorAll('button')).find((b) =>
                b.querySelector('svg.lucide-chevron-right')
            );
            return {
                colSpan: td ? Number(td.getAttribute('colspan')) : 0,
                hasZeroBadge: pageText.includes('0 matching transactions'),
                hasPageOneOfOne: pageText.includes('Page 1 of 1'),
                nextDisabled: Boolean(nextBtn?.disabled),
            };
        });
        assert.equal(emptyState.colSpan, 6);
        assert.equal(emptyState.hasZeroBadge, true);
        assert.equal(emptyState.hasPageOneOfOne, true);
        assert.equal(emptyState.nextDisabled, true);

        // Hide 3 columns and verify colSpan updates to 3
        await openColumnsDropdown(page);
        await clickMenuCheckboxByLabel(page, 'Date');
        await clickMenuCheckboxByLabel(page, 'Status');
        await clickMenuCheckboxByLabel(page, 'Bank Name');
        await closeMenuIfOpen(page);

        const reducedColSpan = await page.evaluate(() => {
            const td = document.querySelector('table tbody tr td[colspan]');
            return td ? Number(td.getAttribute('colspan')) : 0;
        });
        assert.equal(reducedColSpan, 3, 'Empty state colSpan must track visible columns count');

        // Restore columns and clear filter
        await openColumnsDropdown(page);
        await clickShowAllColumns(page);
        await closeMenuIfOpen(page);

        await waitForApiGet(page, '/api/donations', async () => {
            await clickButtonByText(page, 'Clear');
        });
        await waitForTableReady(page);

        // 3. Donor cell /profile/:id link and /admin/preview/user/:id eye link navigation
        const linkPair = await page.evaluate(() => {
            const previewLink = document.querySelector(
                'table tbody tr a[href^="/admin/preview/user/"][title="Preview Profile"]'
            );
            if (!previewLink) return null;
            const row = previewLink.closest('tr');
            const profileLink = row?.querySelector('a[href^="/profile/"]');
            return {
                previewHref: previewLink.getAttribute('href'),
                profileHref: profileLink?.getAttribute('href') || null,
            };
        });
        assert.ok(linkPair?.previewHref, 'Identified donor should render preview profile eye link');
        assert.ok(linkPair?.profileHref, 'Identified donor should render /profile/:id link');

        await page.click(`a[href="${linkPair.previewHref}"][title="Preview Profile"]`);
        await page.waitForFunction(
            (expectedPath) => window.location.pathname.includes(expectedPath),
            { timeout: 10000 },
            linkPair.previewHref
        );
        await page.waitForFunction(
            () => (document.body.textContent || '').includes('Admin Preview Mode'),
            { timeout: 30000 }
        );

        assertNoErrors();
    } finally {
        await page.close();
    }
});

test('Desktop visual and geometry verification (1440x900 and 1280x800) across all 4 admin tables', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;

    const routes = [
        {
            route: '/admin/users',
            filterSelector: 'div.p-4.bg-white.border.rounded-md.shadow-sm.mb-6',
        },
        {
            route: '/admin/bulletins',
            filterSelector: 'div.p-4.bg-white.border.rounded-md.shadow-sm.mb-6',
        },
        {
            route: '/admin/events',
            filterSelector: 'div.p-4.bg-white.border.rounded-md.shadow-sm.mb-6',
        },
        {
            route: '/admin/donations',
            filterSelector: 'div.p-4.bg-gray-50\\/50.border.border-gray-100.rounded-lg',
        },
    ];

    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);

        for (const vp of VIEWPORTS) {
            await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });

            for (const item of routes) {
                await navigateToAdminPage(page, item.route);
                if (item.route === '/admin/donations') {
                    await page.waitForSelector('.recharts-wrapper svg', { timeout: 10000 });
                }

                const overflow = await checkDocumentOverflow(page);
                assert.equal(
                    overflow.hasOverflow,
                    false,
                    `${item.route} @ ${vp.name}: document overflow (${overflow.scrollWidth} > ${overflow.innerWidth})`
                );

                const filterGeo = await checkFilterGeometry(page, item.filterSelector);
                assert.equal(filterGeo.found, true, `${item.route} @ ${vp.name}: filter container must exist`);
                assert.deepEqual(
                    filterGeo.clippedControls,
                    [],
                    `${item.route} @ ${vp.name}: clipped controls found`
                );
                assert.deepEqual(
                    filterGeo.overlaps,
                    [],
                    `${item.route} @ ${vp.name}: overlapping filter controls found`
                );

                const alignment = await checkTableColumnAlignment(page, 'table');
                assert.equal(alignment.hasDataRow, true, `${item.route} @ ${vp.name}: table must have data rows`);
                assert.deepEqual(
                    alignment.mismatches,
                    [],
                    `${item.route} @ ${vp.name}: header/cell alignment mismatch`
                );

                const uniform = await checkUniformActionButtons(page, [
                    'button:has(svg.lucide-columns-3)',
                    'button:has(svg.lucide-download)',
                ]);
                assert.equal(
                    uniform.ok,
                    true,
                    `${item.route} @ ${vp.name}: Columns/Export CSV button uniformity mismatch (${JSON.stringify(uniform)})`
                );

                if (vp.name === 'desktop-1280' && item.route === '/admin/users') {
                    await selectRadixOption(
                        page,
                        () =>
                            Array.from(document.querySelectorAll('button[role="combobox"]')).find((el) =>
                                (el.textContent || '').includes('All Batches')
                            ) || null,
                        [],
                        () =>
                            Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).find(
                                (o) => (o.textContent || '').trim() === 'Custom Range'
                            ) || null,
                        []
                    );
                    await page.waitForSelector('input[placeholder="Min"]:not([disabled])', { timeout: 5000 });
                    await page.waitForSelector('input[placeholder="Max"]:not([disabled])', { timeout: 5000 });

                    const customOverflow = await checkDocumentOverflow(page);
                    assert.equal(
                        customOverflow.hasOverflow,
                        false,
                        `${item.route} @ ${vp.name} (Custom Range): document overflow (${customOverflow.scrollWidth} > ${customOverflow.innerWidth})`
                    );

                    const customFilterGeo = await checkFilterGeometry(page, item.filterSelector);
                    assert.equal(
                        customFilterGeo.found,
                        true,
                        `${item.route} @ ${vp.name} (Custom Range): filter container must exist`
                    );
                    assert.deepEqual(
                        customFilterGeo.clippedControls,
                        [],
                        `${item.route} @ ${vp.name} (Custom Range): clipped controls found (${JSON.stringify(customFilterGeo.clippedControls)})`
                    );
                    assert.deepEqual(
                        customFilterGeo.overlaps,
                        [],
                        `${item.route} @ ${vp.name} (Custom Range): overlapping filter controls found (${JSON.stringify(customFilterGeo.overlaps)})`
                    );
                }
            }
        }

        assertNoErrors();
    } finally {
        await page.close();
    }
});
