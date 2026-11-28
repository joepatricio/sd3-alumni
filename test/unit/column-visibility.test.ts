import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createDefaultColumnVisibility,
    escapeCsvCell,
    type ColumnOption,
} from '../../src/app/components/admin/ColumnVisibilityDropdown.tsx';
import { parseCsv } from '../helpers/csv.mjs';

const CONTENT_COLUMNS = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'author', label: 'Author' },
    { key: 'date', label: 'Date Submitted' },
    { key: 'status', label: 'Status' },
] as const satisfies readonly ColumnOption[];

const USER_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'degree', label: 'Degree Program' },
    { key: 'email', label: 'Email' },
    { key: 'batch', label: 'Batch' },
    { key: 'grantedDate', label: 'Granted/Expiry Date' },
    { key: 'status', label: 'Status' },
] as const satisfies readonly ColumnOption[];

const DONATION_COLUMNS = [
    { key: 'date', label: 'Date' },
    { key: 'donor', label: 'Donor' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'bankName', label: 'Bank Name' },
    { key: 'donationReference', label: 'Donation Reference' },
] as const satisfies readonly ColumnOption[];

test('createDefaultColumnVisibility', async (t) => {
    await t.test('creates all-true map for Content (5 cols), Users (6 cols), and Donations (6 cols)', () => {
        assert.deepEqual(createDefaultColumnVisibility(CONTENT_COLUMNS), {
            title: true,
            category: true,
            author: true,
            date: true,
            status: true,
        });

        assert.deepEqual(createDefaultColumnVisibility(USER_COLUMNS), {
            name: true,
            degree: true,
            email: true,
            batch: true,
            grantedDate: true,
            status: true,
        });

        assert.deepEqual(createDefaultColumnVisibility(DONATION_COLUMNS), {
            date: true,
            donor: true,
            amount: true,
            status: true,
            bankName: true,
            donationReference: true,
        });
    });

    await t.test('returns empty object for empty columns array', () => {
        const emptyCols: readonly ColumnOption[] = [];
        assert.deepEqual(createDefaultColumnVisibility(emptyCols), {});
    });

    await t.test('does not mutate frozen input array or column option objects', () => {
        const input: readonly ColumnOption<'a' | 'b'>[] = Object.freeze([
            Object.freeze({ key: 'a', label: 'Alpha' }),
            Object.freeze({ key: 'b', label: 'Beta' }),
        ]);

        const visibility = createDefaultColumnVisibility(input);
        assert.deepEqual(visibility, { a: true, b: true });
        visibility.a = false;
        assert.equal(input[0].key, 'a');
        assert.equal(input.length, 2);
    });
});

test('escapeCsvCell', async (t) => {
    await t.test('handles null, undefined, and empty string', () => {
        assert.equal(escapeCsvCell(null), '""');
        assert.equal(escapeCsvCell(undefined), '""');
        assert.equal(escapeCsvCell(''), '""');
    });

    await t.test('wraps plain strings, numbers, and booleans in double quotes', () => {
        assert.equal(escapeCsvCell('Hello World'), '"Hello World"');
        assert.equal(escapeCsvCell(0), '"0"');
        assert.equal(escapeCsvCell(1250.5), '"1250.5"');
        assert.equal(escapeCsvCell(-42), '"-42"');
        assert.equal(escapeCsvCell(true), '"true"');
        assert.equal(escapeCsvCell(false), '"false"');
    });

    await t.test('escapes double quotes, embedded commas, and LF/CRLF newlines per RFC-4180', () => {
        assert.equal(escapeCsvCell('Say "Hi"'), '"Say ""Hi"""');
        assert.equal(escapeCsvCell('""'), '""""""');
        assert.equal(escapeCsvCell('Doe, Jane'), '"Doe, Jane"');
        assert.equal(escapeCsvCell('Line 1\nLine 2'), '"Line 1\nLine 2"');
        assert.equal(escapeCsvCell('Row A\r\nRow B'), '"Row A\r\nRow B"');
    });

    await t.test('round-trips complex values cleanly through parseCsv', () => {
        const values = ['O\'Connor, "Pat"', 'Multi\nLine\r\nNote', '', 2025, true];
        const csvLine = values.map((v) => escapeCsvCell(v)).join(',');
        const headerLine = 'Name,Note,Empty,Year,Active';
        const parsed = parseCsv(`${headerLine}\n${csvLine}`);

        assert.deepEqual(parsed.headers, ['Name', 'Note', 'Empty', 'Year', 'Active']);
        assert.equal(parsed.rows.length, 1);
        assert.deepEqual(parsed.rows[0], ['O\'Connor, "Pat"', 'Multi\nLine\r\nNote', '', '2025', 'true']);
    });

    await t.test('parseCsv preserves explicit trailing empty quoted row in 1-column CSV', () => {
        const withoutTrailingNl = parseCsv('Name\n"Alice"\n""');
        assert.deepEqual(withoutTrailingNl.headers, ['Name']);
        assert.deepEqual(withoutTrailingNl.rows, [['Alice'], ['']]);

        const withTrailingNl = parseCsv('Name\n"Alice"\n""\n');
        assert.deepEqual(withTrailingNl.headers, ['Name']);
        assert.deepEqual(withTrailingNl.rows, [['Alice'], ['']]);

        const unquotedTrailingNl = parseCsv('Name\n"Alice"\n');
        assert.deepEqual(unquotedTrailingNl.headers, ['Name']);
        assert.deepEqual(unquotedTrailingNl.rows, [['Alice']]);
    });
});

test('PR #7 CSV column-filtering contracts', async (t) => {
    await t.test('Content exporter always includes Type column and maps date -> Date', () => {
        const visible = createDefaultColumnVisibility(CONTENT_COLUMNS);
        visible.category = false;
        visible.author = false;

        const row = {
            title: 'Engineering Summit',
            category: 'Conference',
            author: 'Ada Lovelace',
            date: 'May 10, 2026',
            type: 'Event',
            status: 'Approved',
        };

        const csvColumns: Array<{ header: string; getValue: (c: typeof row) => unknown }> = [];
        if (visible.title) csvColumns.push({ header: 'Title', getValue: (c) => c.title });
        if (visible.category) csvColumns.push({ header: 'Category', getValue: (c) => c.category });
        if (visible.author) csvColumns.push({ header: 'Author', getValue: (c) => c.author });
        if (visible.date) csvColumns.push({ header: 'Date', getValue: (c) => c.date });
        csvColumns.push({ header: 'Type', getValue: (c) => c.type });
        if (visible.status) csvColumns.push({ header: 'Status', getValue: (c) => c.status });

        const csvText = [
            csvColumns.map((c) => c.header).join(','),
            csvColumns.map((c) => escapeCsvCell(c.getValue(row))).join(','),
        ].join('\n');

        const parsed = parseCsv(csvText);
        assert.deepEqual(parsed.headers, ['Title', 'Date', 'Type', 'Status']);
        assert.deepEqual(parsed.rows[0], ['Engineering Summit', 'May 10, 2026', 'Event', 'Approved']);
    });

    await t.test('Users exporter always includes Reason, puts Status before Granted/Expiry Date, and omits both dates when grantedDate is hidden', () => {
        const row = {
            name: 'Juan Dela Cruz',
            degree: 'BS Mechanical Engineering (BSME)',
            email: 'juan@example.com',
            batch: '2020',
            status: 'Suspended',
            grantedDate: 'Jan 5, 2026',
            expiryDate: 'Jan 12, 2026',
            reason: 'Policy review, "pending"',
        };

        const buildUsersCsv = (visible: Record<(typeof USER_COLUMNS)[number]['key'], boolean>) => {
            const cols: Array<{ header: string; getValue: (u: typeof row) => unknown }> = [];
            if (visible.name) cols.push({ header: 'Name', getValue: (u) => u.name });
            if (visible.degree) cols.push({ header: 'Degree Program', getValue: (u) => u.degree });
            if (visible.email) cols.push({ header: 'Email', getValue: (u) => u.email });
            if (visible.batch) cols.push({ header: 'Batch', getValue: (u) => u.batch });
            if (visible.status) cols.push({ header: 'Status', getValue: (u) => u.status });
            if (visible.grantedDate) {
                cols.push({ header: 'Granted Date', getValue: (u) => u.grantedDate });
                cols.push({ header: 'Expiry Date', getValue: (u) => u.expiryDate });
            }
            cols.push({ header: 'Reason', getValue: (u) => u.reason });
            return parseCsv([
                cols.map((c) => c.header).join(','),
                cols.map((c) => escapeCsvCell(c.getValue(row))).join(','),
            ].join('\n'));
        };

        const allVisible = buildUsersCsv(createDefaultColumnVisibility(USER_COLUMNS));
        assert.deepEqual(allVisible.headers, [
            'Name',
            'Degree Program',
            'Email',
            'Batch',
            'Status',
            'Granted Date',
            'Expiry Date',
            'Reason',
        ]);

        const hiddenDates = createDefaultColumnVisibility(USER_COLUMNS);
        hiddenDates.grantedDate = false;
        hiddenDates.email = false;
        const filtered = buildUsersCsv(hiddenDates);
        assert.deepEqual(filtered.headers, ['Name', 'Degree Program', 'Batch', 'Status', 'Reason']);
        assert.equal(filtered.records[0].Reason, 'Policy review, "pending"');
    });

    await t.test('Donations exporter maps donationReference -> Reference and respects hidden columns', () => {
        const visible = createDefaultColumnVisibility(DONATION_COLUMNS);
        visible.bankName = false;
        visible.status = false;

        const row = {
            date: 'Mar 1, 2026',
            donor: 'Anonymous',
            amount: 5000,
            status: 'Completed',
            bankName: 'BPI',
            donationReference: 'REF-1001',
        };

        const cols: Array<{ header: string; getValue: (d: typeof row) => unknown }> = [];
        if (visible.date) cols.push({ header: 'Date', getValue: (d) => d.date });
        if (visible.donor) cols.push({ header: 'Donor', getValue: (d) => d.donor });
        if (visible.amount) cols.push({ header: 'Amount', getValue: (d) => d.amount });
        if (visible.status) cols.push({ header: 'Status', getValue: (d) => d.status });
        if (visible.bankName) cols.push({ header: 'Bank Name', getValue: (d) => d.bankName });
        if (visible.donationReference) cols.push({ header: 'Reference', getValue: (d) => d.donationReference });

        const parsed = parseCsv([
            cols.map((c) => c.header).join(','),
            cols.map((c) => escapeCsvCell(c.getValue(row))).join(','),
        ].join('\n'));

        assert.deepEqual(parsed.headers, ['Date', 'Donor', 'Amount', 'Reference']);
        assert.deepEqual(parsed.rows[0], ['Mar 1, 2026', 'Anonymous', '5000', 'REF-1001']);
    });
});
