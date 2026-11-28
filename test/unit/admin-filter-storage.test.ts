import test from 'node:test';
import assert from 'node:assert/strict';
import {
    ADMIN_FILTER_STORAGE_KEYS,
    DEFAULT_ADMIN_CONTENT_FILTERS,
    DEFAULT_ADMIN_DONATIONS_FILTERS,
    DEFAULT_ADMIN_USERS_FILTERS,
    clearAdminFilters,
    clearAllAdminFilters,
    readAdminContentFilters,
    readAdminDonationsFilters,
    readAdminUsersFilters,
    sanitizeAdminContentFilters,
    sanitizeAdminDonationsFilters,
    sanitizeAdminUsersFilters,
    writeAdminContentFilters,
    writeAdminDonationsFilters,
    writeAdminUsersFilters,
} from '../../src/app/components/admin/adminFilterStorage.ts';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
    const store = new Map<string, string>(Object.entries(initial));
    return {
        get length() {
            return store.size;
        },
        clear() {
            store.clear();
        },
        getItem(key: string) {
            return store.has(key) ? store.get(key)! : null;
        },
        key(index: number) {
            return Array.from(store.keys())[index] ?? null;
        },
        removeItem(key: string) {
            store.delete(key);
        },
        setItem(key: string, value: string) {
            store.set(key, String(value));
        },
    };
}

function createThrowingStorage(): Storage {
    return {
        get length() {
            return 0;
        },
        clear() {
            throw new Error('Storage unavailable');
        },
        getItem() {
            throw new Error('Storage unavailable');
        },
        key() {
            throw new Error('Storage unavailable');
        },
        removeItem() {
            throw new Error('Storage unavailable');
        },
        setItem() {
            throw new Error('Storage unavailable');
        },
    };
}

test('AdminUsers filter storage', async (t) => {
    await t.test('returns defaults when storage is empty or unavailable', () => {
        const storage = createMemoryStorage();
        assert.deepEqual(readAdminUsersFilters(storage), DEFAULT_ADMIN_USERS_FILTERS);
        assert.deepEqual(readAdminUsersFilters(createThrowingStorage()), DEFAULT_ADMIN_USERS_FILTERS);
    });

    await t.test('round-trips custom filter state and removes entry when reset to defaults', () => {
        const storage = createMemoryStorage();
        const custom = {
            activeTab: 'Official',
            searchTerm: 'Juan',
            searchBatch: '2020',
            searchReason: 'verified',
            degree: 'deg-bsce',
            batchRange: 'Custom Range',
            customMinBatch: '2018',
            customMaxBatch: '2024',
            sortConfig: { key: 'name', direction: 'asc' as const },
            itemsPerPage: 50,
            currentPage: 3,
        };

        writeAdminUsersFilters(custom, storage);
        assert.ok(storage.getItem(ADMIN_FILTER_STORAGE_KEYS.users));
        assert.deepEqual(readAdminUsersFilters(storage), custom);

        writeAdminUsersFilters(DEFAULT_ADMIN_USERS_FILTERS, storage);
        assert.equal(storage.getItem(ADMIN_FILTER_STORAGE_KEYS.users), null);
    });

    await t.test('sanitizes malformed values and legacy Custom batch range', () => {
        const storage = createMemoryStorage({
            [ADMIN_FILTER_STORAGE_KEYS.users]: '{not-valid-json',
        });
        assert.deepEqual(readAdminUsersFilters(storage), DEFAULT_ADMIN_USERS_FILTERS);

        assert.deepEqual(
            sanitizeAdminUsersFilters({
                activeTab: '',
                searchTerm: 123,
                degree: null,
                batchRange: 'Custom',
                sortConfig: { key: 'unknownCol', direction: 'asc' },
                itemsPerPage: 999,
                currentPage: 0,
            }),
            {
                ...DEFAULT_ADMIN_USERS_FILTERS,
                batchRange: 'Custom Range',
            }
        );

        assert.deepEqual(
            sanitizeAdminUsersFilters({
                batchRange: 'InvalidRange',
                sortConfig: null,
                itemsPerPage: 100,
                currentPage: 2,
            }),
            {
                ...DEFAULT_ADMIN_USERS_FILTERS,
                sortConfig: null,
                itemsPerPage: 100,
                currentPage: 2,
            }
        );
    });
});

test('AdminContentTable (Bulletins & Events) filter storage', async (t) => {
    await t.test('isolates Bulletin and Event filter keys in sessionStorage', () => {
        const storage = createMemoryStorage();

        const bulletinState = {
            activeTab: 'For Review',
            searchName: 'Hiring',
            searchAuthor: 'Admin',
            searchStartDate: '2026-01-01',
            searchEndDate: '2026-06-30',
            datePreset: 'custom',
            searchCategories: ['Careers', 'Announcements'],
            accountScope: ['Official'],
            sortConfig: { key: 'title' as const, direction: 'asc' as const },
            itemsPerPage: 50,
            currentPage: 2,
        };

        const eventState = {
            activeTab: 'Approved',
            searchName: 'Homecoming',
            searchAuthor: '',
            searchStartDate: '',
            searchEndDate: '',
            datePreset: 'all',
            searchCategories: ['Reunion'],
            accountScope: ['Regular', 'Official'],
            sortConfig: null,
            itemsPerPage: 10,
            currentPage: 1,
        };

        writeAdminContentFilters('Bulletin', bulletinState, storage);
        writeAdminContentFilters('Event', eventState, storage);

        assert.deepEqual(readAdminContentFilters('Bulletin', undefined, storage), bulletinState);
        assert.deepEqual(readAdminContentFilters('Event', undefined, storage), eventState);

        writeAdminContentFilters('Bulletin', DEFAULT_ADMIN_CONTENT_FILTERS, storage);
        assert.equal(storage.getItem(ADMIN_FILTER_STORAGE_KEYS.bulletins), null);
        assert.deepEqual(readAdminContentFilters('Event', undefined, storage), eventState);
    });

    await t.test('validates allowedStatuses, allowedCategories, accountScope, and sortConfig', () => {
        const sanitized = sanitizeAdminContentFilters(
            {
                activeTab: 'NonExistentTab',
                datePreset: 'invalid_preset',
                searchCategories: ['Careers', 'RemovedCategory', 'Careers'],
                accountScope: ['Official', 'InvalidScope'],
                sortConfig: { key: 'badKey', direction: 'desc' },
                itemsPerPage: -5,
                currentPage: 1.5,
            },
            {
                allowedStatuses: ['All', 'Pending', 'Approved'],
                allowedCategories: ['Announcements', 'Careers'],
            }
        );

        assert.deepEqual(sanitized, {
            ...DEFAULT_ADMIN_CONTENT_FILTERS,
            activeTab: 'All',
            datePreset: 'all',
            searchCategories: ['Careers'],
            accountScope: ['Official'],
            sortConfig: { key: 'date', direction: 'desc' },
            itemsPerPage: 20,
            currentPage: 1,
        });

        const normalizedAll = sanitizeAdminContentFilters({
            searchCategories: ['All', 'Careers'],
            accountScope: [],
            sortConfig: null,
        });
        assert.deepEqual(normalizedAll.searchCategories, ['All']);
        assert.deepEqual(normalizedAll.accountScope, ['All']);
        assert.equal(normalizedAll.sortConfig, null);
    });
});

test('AdminDonations filter storage', async (t) => {
    await t.test('round-trips donations filters and removes key on default reset', () => {
        const storage = createMemoryStorage();
        const custom = {
            activeTab: 'Completed',
            searchDonor: 'Maria',
            searchRef: 'REF-42',
            minAmount: '1000',
            maxAmount: '5000',
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            datePreset: 'this_month',
            amountPreset: '1000_5000',
            searchBankName: 'BPI',
            sortConfig: { key: 'amount', direction: 'asc' as const },
            itemsPerPage: 10,
            currentPage: 2,
        };

        writeAdminDonationsFilters(custom, storage);
        assert.deepEqual(readAdminDonationsFilters(storage), custom);

        writeAdminDonationsFilters(DEFAULT_ADMIN_DONATIONS_FILTERS, storage);
        assert.equal(storage.getItem(ADMIN_FILTER_STORAGE_KEYS.donations), null);
    });

    await t.test('sanitizes invalid donation presets and sort config', () => {
        const sanitized = sanitizeAdminDonationsFilters({
            activeTab: 42,
            datePreset: 'next_century',
            amountPreset: 'millions',
            searchBankName: '',
            sortConfig: { key: 'bankName', direction: 'asc' },
            itemsPerPage: 25,
            currentPage: -2,
        });

        assert.deepEqual(sanitized, DEFAULT_ADMIN_DONATIONS_FILTERS);
    });
});

test('clearAdminFilters and clearAllAdminFilters', async (t) => {
    await t.test('clears admin filter keys while preserving unrelated sessionStorage entries', () => {
        const storage = createMemoryStorage({
            adminToken: 'jwt-token-keep-me',
            [ADMIN_FILTER_STORAGE_KEYS.users]: JSON.stringify({ degree: 'bsce' }),
            [ADMIN_FILTER_STORAGE_KEYS.bulletins]: JSON.stringify({ searchName: 'news' }),
            [ADMIN_FILTER_STORAGE_KEYS.events]: JSON.stringify({ searchName: 'gala' }),
            [ADMIN_FILTER_STORAGE_KEYS.donations]: JSON.stringify({ searchDonor: 'ana' }),
        });

        clearAdminFilters(ADMIN_FILTER_STORAGE_KEYS.users, storage);
        assert.equal(storage.getItem(ADMIN_FILTER_STORAGE_KEYS.users), null);
        assert.ok(storage.getItem(ADMIN_FILTER_STORAGE_KEYS.bulletins));

        clearAllAdminFilters(storage);
        for (const key of Object.values(ADMIN_FILTER_STORAGE_KEYS)) {
            assert.equal(storage.getItem(key), null);
        }
        assert.equal(storage.getItem('adminToken'), 'jwt-token-keep-me');
    });

    await t.test('does not throw when storage fails', () => {
        const throwing = createThrowingStorage();
        assert.doesNotThrow(() => writeAdminUsersFilters({ ...DEFAULT_ADMIN_USERS_FILTERS, searchTerm: 'a' }, throwing));
        assert.doesNotThrow(() => clearAdminFilters(ADMIN_FILTER_STORAGE_KEYS.users, throwing));
        assert.doesNotThrow(() => clearAllAdminFilters(throwing));
    });
});
