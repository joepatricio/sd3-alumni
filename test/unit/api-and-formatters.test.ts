import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
    load(url, context, nextLoad) {
        const res = nextLoad(url, context);
        if (res.source && url.includes('/src/app/')) {
            const src =
                typeof res.source === 'string'
                    ? res.source
                    : Buffer.from(res.source).toString('utf8');
            if (src.includes('import.meta.env')) {
                return {
                    ...res,
                    source: `Object.assign(import.meta, { env: { VITE_API_BASE_URL: '/api/' } });\n${src}`,
                };
            }
        }
        return res;
    },
});

const { unwrapListResponse } = await import('../../src/app/views/api.ts');
const {
    formatDate,
    formatCurrency,
    getCategoryColor,
    getBankColor,
} = await import('../../src/app/views/formatters.ts');
const { ACCOUNT_SCOPES } = await import('../../src/app/components/admin/AdminContentTable.tsx');

test('unwrapListResponse', async (t) => {
    await t.test('returns empty result for null, undefined, and empty object', () => {
        assert.deepEqual(unwrapListResponse(null), { items: [], total: 0 });
        assert.deepEqual(unwrapListResponse(undefined), { items: [], total: 0 });
        assert.deepEqual(unwrapListResponse({}), { items: [], total: 0 });
        assert.deepEqual(unwrapListResponse({ data: null }), { items: [], total: 0 });
    });

    await t.test('unwraps raw array and Axios-wrapped array', () => {
        const rows = [{ id: 'u1' }, { id: 'u2' }];
        assert.deepEqual(unwrapListResponse(rows), { items: rows, total: 2 });
        assert.deepEqual(unwrapListResponse({ data: rows }), { items: rows, total: 2 });
    });

    await t.test('unwraps paginated Axios response and falls back to items.length if total missing', () => {
        const pageRows = [{ id: '1' }, { id: '2' }];
        assert.deepEqual(
            unwrapListResponse({ data: { data: pageRows, items: 42 } }),
            { items: pageRows, total: 42 }
        );
        assert.deepEqual(
            unwrapListResponse({ data: { data: pageRows } }),
            { items: pageRows, total: 2 }
        );
        assert.deepEqual(
            unwrapListResponse({ data: { data: pageRows, items: '42' } }),
            { items: pageRows, total: 2 }
        );
    });
});

test('formatDate', async (t) => {
    await t.test('returns fallback for null, undefined, empty, and invalid date inputs', () => {
        assert.equal(formatDate(null), 'N/A');
        assert.equal(formatDate(undefined), 'N/A');
        assert.equal(formatDate(''), 'N/A');
        assert.equal(formatDate('not-a-real-date'), 'N/A');
        assert.equal(formatDate('not-a-real-date', 'short', '—'), '—');
    });

    await t.test('formats valid ISO strings and Date objects using presets and custom patterns', () => {
        const d = new Date(2026, 2, 15, 14, 30, 0);
        assert.equal(formatDate(d, 'long'), 'March 15, 2026');
        assert.equal(formatDate(d, 'short'), 'Mar 15, 2026');
        assert.equal(formatDate(d, 'iso'), '2026-03-15');
        assert.equal(formatDate(d, 'full'), 'Sunday, March 15, 2026');
        assert.equal(formatDate(d, 'datetime'), 'Mar 15, 2026, 2:30 PM');
        assert.equal(formatDate('2026-03-15T00:00:00', 'yyyy/MM'), '2026/03');
    });
});

test('formatCurrency', () => {
    const zero = formatCurrency(0);
    const decimal = formatCurrency(1250.5);
    const large = formatCurrency(1000000);

    assert.match(zero, /0\.00/);
    assert.match(decimal, /1,250\.50/);
    assert.match(large, /1,000,000\.00/);
    assert.ok(decimal.includes('₱') || decimal.includes('PHP'));
});

test('getCategoryColor', () => {
    assert.match(getCategoryColor('Reunion'), /bg-blue-600/);
    assert.match(getCategoryColor('Workshop'), /bg-purple-600/);
    assert.match(getCategoryColor('Conference'), /bg-indigo-600/);
    assert.match(getCategoryColor('Networking'), /bg-pink-600/);
    assert.match(getCategoryColor('Sports'), /bg-brand-primary/);
    assert.match(getCategoryColor('Virtual'), /bg-teal-600/);
    assert.match(getCategoryColor('Announcements'), /bg-blue-600/);
    assert.match(getCategoryColor('Careers'), /bg-emerald-600/);
    assert.match(getCategoryColor('Success Stories'), /bg-amber-600/);
    assert.match(getCategoryColor('Donations'), /bg-rose-600/);
    assert.match(getCategoryColor('Others'), /bg-slate-600/);
    assert.match(getCategoryColor('Official'), /bg-brand-primary/);
    assert.match(getCategoryColor('Regular'), /bg-brand-accent/);
    assert.match(getCategoryColor(''), /bg-brand-primary/);
});

test('getBankColor', () => {
    assert.equal(getBankColor('BDO Unibank'), '#003B8E');
    assert.equal(getBankColor('BPI'), '#B11116');
    assert.equal(getBankColor('Metrobank'), '#005BAC');
    assert.equal(getBankColor('GCash'), '#007DF2');
    assert.equal(getBankColor('Maya'), '#00C25A');
    assert.equal(getBankColor('Land Bank'), '#00843D');

    const unknownA = getBankColor('Custom Rural Bank');
    const unknownB = getBankColor('Custom Rural Bank');
    assert.equal(unknownA, unknownB);
    assert.match(unknownA, /^#[0-9a-f]{6}$/i);
});

test('ACCOUNT_SCOPES', () => {
    assert.deepEqual(ACCOUNT_SCOPES, [
        'All',
        'Regular',
        'Official',
        'Suspended',
        'Banned',
        'Deactivated',
    ]);
});
