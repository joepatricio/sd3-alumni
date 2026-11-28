import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestEnv } from '../helpers/server.mjs';
import { launchBrowser, createTrackedPage } from '../helpers/browser.mjs';
import { getFirstAdmin, mintAdminToken, authenticateAdminPage } from '../helpers/auth.mjs';

let env;
let browser;
let adminToken;

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

async function waitForApiGet(page, pathFragment, triggerFn) {
    const responsePromise = page.waitForResponse(
        (res) => res.request().method() === 'GET' && res.url().includes(pathFragment),
        { timeout: 15000 }
    );
    await triggerFn();
    const res = await responsePromise;
    return {
        url: res.url(),
        status: res.status(),
    };
}

function assertOkHttpStatus(status, message) {
    assert.ok(
        status === 200 || status === 304,
        `${message ? `${message}: ` : ''}expected HTTP 200 or 304, got ${status}`
    );
}

async function setInputValue(page, selector, value) {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.evaluate(
        (sel, val) => {
            const input = document.querySelector(sel);
            if (!input) throw new Error(`Input not found: ${sel}`);
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        },
        selector,
        value
    );
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

test('AdminUsers persists Degree filter across Admin Preview back-navigation, sidebar navigation, and reload; resets on Clear', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await navigateToAdminPage(page, '/admin/users');

        // Select BSCE (Civil Engineering) if available, otherwise first specific degree program
        let pickedDegreeLabel = '';
        const filterRes = await waitForApiGet(page, '/api/admin/users', async () => {
            pickedDegreeLabel = await selectRadixOption(
                page,
                () =>
                    Array.from(document.querySelectorAll('button[role="combobox"]')).find((el) =>
                        (el.textContent || '').includes('All Degree Programs')
                    ) || null,
                [],
                () => {
                    const options = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]'));
                    return (
                        options.find((o) => (o.textContent || '').includes('BSCE')) ||
                        options.find((o) => {
                            const txt = (o.textContent || '').trim();
                            return txt !== 'All Degree Programs' && txt.includes(' - ');
                        }) ||
                        null
                    );
                },
                []
            );
        });
        assertOkHttpStatus(filterRes.status, 'Apply degree filter');
        const expectedAbbr = pickedDegreeLabel.split(' - ')[0].trim();
        await waitForTableReady(page, { minRows: 1 });

        // Verify filter was persisted in sessionStorage
        const storedBeforeNav = await page.evaluate(() => sessionStorage.getItem('admin_users_filters'));
        assert.ok(storedBeforeNav, 'admin_users_filters should be saved in sessionStorage');

        // 1. Navigate to Admin Preview via eye icon, then click "Back to Dashboard"
        const previewHref = await page.evaluate(() => {
            const link = document.querySelector('table tbody tr a[href^="/admin/preview/user/"][title="Preview Profile"]');
            return link?.getAttribute('href') || null;
        });
        assert.ok(previewHref, 'Filtered user row should have a Preview Profile eye link');

        await page.click(`a[href="${previewHref}"][title="Preview Profile"]`);
        await page.waitForFunction(
            () => (document.body.textContent || '').includes('Admin Preview Mode'),
            { timeout: 30000 }
        );

        const returnUsersRes = await waitForApiGet(page, '/api/admin/users', async () => {
            await clickButtonByText(page, 'Back to Dashboard');
        });
        assertOkHttpStatus(returnUsersRes.status, 'Return to /admin/users from preview');
        assert.match(
            new URL(returnUsersRes.url).searchParams.get('_where') || '',
            /degreeId/,
            'Returned /admin/users request should preserve degreeId filter'
        );
        await waitForTableReady(page, { minRows: 1 });

        // Wait for async degrees lookup so combobox displays restored degree label
        await page.waitForFunction(
            (abbr) =>
                Array.from(document.querySelectorAll('button[role="combobox"]')).some((el) =>
                    (el.textContent || '').includes(abbr)
                ),
            { timeout: 10000 },
            expectedAbbr
        );

        const rowsStillFiltered = await page.evaluate((abbr) => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.length > 0 && rows.every((tr) => (tr.textContent || '').includes(abbr));
        }, expectedAbbr);
        assert.equal(rowsStillFiltered, true, `Rows after returning from preview must still match ${expectedAbbr}`);

        // 2. Navigate to another admin section via sidebar and return via sidebar
        await clickHandleFromEvaluate(page, () =>
            document.querySelector('aside nav a[href="/admin/bulletins"]')
        );
        await page.waitForFunction(() => window.location.pathname === '/admin/bulletins', { timeout: 10000 });
        await waitForTableReady(page);

        const sidebarBackRes = await waitForApiGet(page, '/api/admin/users', async () => {
            await clickHandleFromEvaluate(page, () =>
                document.querySelector('aside nav a[href="/admin/users"]')
            );
        });
        assertOkHttpStatus(sidebarBackRes.status, 'Return to /admin/users via sidebar');
        assert.match(new URL(sidebarBackRes.url).searchParams.get('_where') || '', /degreeId/);
        await waitForTableReady(page, { minRows: 1 });

        // 3. Reload within the same session -> filters remain active
        const reloadRes = await waitForApiGet(page, '/api/admin/users', async () => {
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        });
        assertOkHttpStatus(reloadRes.status, 'Reload /admin/users with persisted filter');
        assert.match(new URL(reloadRes.url).searchParams.get('_where') || '', /degreeId/);
        await waitForTableReady(page, { minRows: 1 });

        // 4. Click Clear -> clears sessionStorage and resets filter across reload
        const clearRes = await waitForApiGet(page, '/api/admin/users', async () => {
            await clickButtonByText(page, 'Clear');
        });
        assertOkHttpStatus(clearRes.status, 'Clear /admin/users filters');
        assert.equal(
            (new URL(clearRes.url).searchParams.get('_where') || '').includes('degreeId'),
            false
        );

        await page.waitForFunction(
            () => sessionStorage.getItem('admin_users_filters') === null,
            { timeout: 5000 }
        );

        assertNoErrors();
    } finally {
        await page.close();
    }
});

test('AdminBulletins and AdminEvents persist filters independently and respect URL query overrides', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);

        // Set filters on Bulletins
        await navigateToAdminPage(page, '/admin/bulletins');
        const bulScopeRes = await waitForApiGet(page, '/api/admin/bulletins', async () => {
            await clickButtonByText(page, 'Official');
        });
        assertOkHttpStatus(bulScopeRes.status, 'Bulletins Official scope');
        assert.match(new URL(bulScopeRes.url).searchParams.get('_where') || '', /Official/);

        const bulCatRes = await waitForApiGet(page, '/api/admin/bulletins', async () => {
            await clickButtonByText(page, 'Announcements');
        });
        assertOkHttpStatus(bulCatRes.status, 'Bulletins Announcements category');
        assert.match(new URL(bulCatRes.url).searchParams.get('_where') || '', /Announcements/);

        // Switch to Events -> must NOT inherit Bulletins filters
        const eventsInitialRes = await waitForApiGet(page, '/api/admin/events', async () => {
            await clickHandleFromEvaluate(page, () =>
                document.querySelector('aside nav a[href="/admin/events"]')
            );
        });
        assertOkHttpStatus(eventsInitialRes.status, 'Navigate to /admin/events');
        const initialEventsWhere = new URL(eventsInitialRes.url).searchParams.get('_where') || '';
        assert.equal(initialEventsWhere.includes('Announcements'), false);
        assert.equal(initialEventsWhere.includes('Official'), false);
        await waitForTableReady(page);

        // Set a distinct filter on Events
        const evtCatRes = await waitForApiGet(page, '/api/admin/events', async () => {
            await clickButtonByText(page, 'Workshop');
        });
        assertOkHttpStatus(evtCatRes.status, 'Events Workshop category');
        assert.match(new URL(evtCatRes.url).searchParams.get('_where') || '', /Workshop/);

        // Navigate back to Bulletins -> Bulletins filters still intact
        const bulBackRes = await waitForApiGet(page, '/api/admin/bulletins', async () => {
            await clickHandleFromEvaluate(page, () =>
                document.querySelector('aside nav a[href="/admin/bulletins"]')
            );
        });
        assertOkHttpStatus(bulBackRes.status, 'Return to /admin/bulletins');
        const bulBackWhere = new URL(bulBackRes.url).searchParams.get('_where') || '';
        assert.match(bulBackWhere, /Announcements/);
        assert.match(bulBackWhere, /Official/);

        // Navigate to Events with explicit URL date & sort query params (like Dashboard calendar Manage link)
        const urlOverrideRes = await waitForApiGet(page, '/api/admin/events', async () => {
            await page.goto(`${env.baseUrl}/admin/events?start=2025-01-01&end=2027-12-31&sort=asc`, {
                waitUntil: 'domcontentloaded',
                timeout: 60000,
            });
        });
        assertOkHttpStatus(urlOverrideRes.status, 'Events URL override');
        const overrideUrl = new URL(urlOverrideRes.url);
        assert.equal(overrideUrl.searchParams.get('_sort'), 'eventDate');
        assert.match(overrideUrl.searchParams.get('_where') || '', /eventDate/);
        assert.match(overrideUrl.searchParams.get('_where') || '', /Workshop/);

        // Clear Events filters -> removes URL date params and persisted filters
        const clearEvtRes = await waitForApiGet(page, '/api/admin/events', async () => {
            await clickButtonByText(page, 'Clear');
        });
        assertOkHttpStatus(clearEvtRes.status, 'Clear Events filters');
        const clearedWhere = new URL(clearEvtRes.url).searchParams.get('_where') || '';
        assert.equal(clearedWhere.includes('Workshop'), false);
        assert.equal(clearedWhere.includes('eventDate'), false);

        assertNoErrors();
    } finally {
        await page.close();
    }
});

test('AdminDonations persists filters across preview back-navigation, and new browser session starts clean', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await navigateToAdminPage(page, '/admin/donations');

        // Apply donor filter using an actual donor name from the table
        const donorName = await page.evaluate(() => {
            const link = document.querySelector('table tbody tr a[href^="/profile/"]');
            return (link?.textContent || '').trim();
        });
        assert.ok(donorName, 'Expected at least one identified donor in donations table');

        await setInputValue(page, 'input[placeholder="Search by Donor..."]', donorName);
        const searchRes = await waitForApiGet(page, '/api/donations', async () => {
            await clickButtonByText(page, 'Submit');
        });
        assertOkHttpStatus(searchRes.status, 'Submit donations donor filter');
        assert.match(new URL(searchRes.url).searchParams.get('_where') || '', /userName/);
        await waitForTableReady(page, { minRows: 1 });

        // Click preview profile eye link and return via Back to Dashboard
        const previewHref = await page.evaluate(() => {
            const link = document.querySelector('table tbody tr a[href^="/admin/preview/user/"][title="Preview Profile"]');
            return link?.getAttribute('href') || null;
        });
        assert.ok(previewHref, 'Filtered donor row should have preview profile eye link');

        await page.click(`a[href="${previewHref}"][title="Preview Profile"]`);
        await page.waitForFunction(
            () => (document.body.textContent || '').includes('Admin Preview Mode'),
            { timeout: 30000 }
        );

        const backDonationsRes = await waitForApiGet(page, '/api/donations', async () => {
            await clickButtonByText(page, 'Back to Dashboard');
        });
        assertOkHttpStatus(backDonationsRes.status, 'Return to /admin/donations from preview');
        assert.match(new URL(backDonationsRes.url).searchParams.get('_where') || '', /userName/);
        await waitForTableReady(page, { minRows: 1 });

        const restoredDonorInput = await page.$eval(
            'input[placeholder="Search by Donor..."]',
            (el) => el.value
        );
        assert.equal(restoredDonorInput, donorName);

        assertNoErrors();
    } finally {
        await page.close();
    }

    // Open a brand new tab/page (new sessionStorage) -> filters must be cleared
    const freshTracked = await createTrackedPage(browser);
    const { page: freshPage, assertNoErrors: assertFreshNoErrors } = freshTracked;
    try {
        await authenticateAdminPage(freshPage, env.baseUrl, adminToken);
        const freshRes = await waitForApiGet(freshPage, '/api/donations', async () => {
            await freshPage.goto(`${env.baseUrl}/admin/donations`, {
                waitUntil: 'domcontentloaded',
                timeout: 60000,
            });
        });
        assertOkHttpStatus(freshRes.status, 'Fresh session /admin/donations');
        assert.equal(new URL(freshRes.url).searchParams.get('_where'), null);
        await waitForTableReady(freshPage, { minRows: 1 });

        const freshDonorInput = await freshPage.$eval(
            'input[placeholder="Search by Donor..."]',
            (el) => el.value
        );
        assert.equal(freshDonorInput, '');

        assertFreshNoErrors();
    } finally {
        await freshPage.close();
    }
});

test('Admin logout clears all persisted admin filters from sessionStorage', async () => {
    const tracked = await createTrackedPage(browser);
    const { page, assertNoErrors } = tracked;
    try {
        await authenticateAdminPage(page, env.baseUrl, adminToken);
        await navigateToAdminPage(page, '/admin/users');

        await setInputValue(page, 'input[placeholder="Search user by name..."]', 'TestPersist');
        await waitForApiGet(page, '/api/admin/users', async () => {
            await clickButtonByText(page, 'Submit');
        });

        await page.waitForFunction(
            () => sessionStorage.getItem('admin_users_filters') !== null,
            { timeout: 5000 }
        );

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            clickButtonByText(page, 'Logout'),
        ]);

        assert.match(page.url(), /\/admin\/login/);
        const remainingFilterKeys = await page.evaluate(() =>
            [
                'admin_users_filters',
                'admin_bulletins_filters',
                'admin_events_filters',
                'admin_donations_filters',
            ].filter((k) => sessionStorage.getItem(k) !== null)
        );
        assert.deepEqual(remainingFilterKeys, [], 'Logout must clear all persisted admin filter keys');

        assertNoErrors();
    } finally {
        await page.close();
    }
});
