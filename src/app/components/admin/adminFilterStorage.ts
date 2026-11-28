export const ADMIN_FILTER_STORAGE_KEYS = {
    users: 'admin_users_filters',
    bulletins: 'admin_bulletins_filters',
    events: 'admin_events_filters',
    donations: 'admin_donations_filters',
} as const;

export type AdminFilterStorageKey =
    (typeof ADMIN_FILTER_STORAGE_KEYS)[keyof typeof ADMIN_FILTER_STORAGE_KEYS];

export interface AdminSortConfig<K extends string = string> {
    key: K;
    direction: 'asc' | 'desc';
}

export type ContentSortKey = 'title' | 'category' | 'author' | 'date' | 'rawDate' | 'status';

export interface AdminUsersFilterState {
    activeTab: string;
    searchTerm: string;
    searchBatch: string;
    searchReason: string;
    degree: string;
    batchRange: string;
    customMinBatch: string;
    customMaxBatch: string;
    sortConfig: AdminSortConfig | null;
    itemsPerPage: number;
    currentPage: number;
}

export interface AdminContentFilterState {
    activeTab: string;
    searchName: string;
    searchAuthor: string;
    searchStartDate: string;
    searchEndDate: string;
    datePreset: string;
    searchCategories: string[];
    accountScope: string[];
    sortConfig: AdminSortConfig<ContentSortKey> | null;
    itemsPerPage: number;
    currentPage: number;
}

export interface AdminDonationsFilterState {
    activeTab: string;
    searchDonor: string;
    searchRef: string;
    minAmount: string;
    maxAmount: string;
    startDate: string;
    endDate: string;
    datePreset: string;
    amountPreset: string;
    searchBankName: string;
    sortConfig: AdminSortConfig | null;
    itemsPerPage: number;
    currentPage: number;
}

const VALID_ITEMS_PER_PAGE = new Set([10, 20, 50, 100]);
const VALID_USER_BATCH_RANGES = new Set([
    'All Batches',
    'Past 3',
    'Past 5',
    'Past 10',
    'Past 30',
    'Custom Range',
]);
const VALID_USER_SORT_KEYS = new Set([
    'name',
    'degree',
    'email',
    'batch',
    'grantedDate',
    'status',
]);
const VALID_DATE_PRESETS = new Set([
    'all',
    'this_week',
    'this_month',
    'this_year',
    'custom',
]);
const VALID_AMOUNT_PRESETS = new Set([
    'all',
    'below_1000',
    '1000_5000',
    'above_5000',
    'custom',
]);
const VALID_ACCOUNT_SCOPES = new Set([
    'All',
    'Regular',
    'Official',
    'Suspended',
    'Banned',
    'Deactivated',
]);
const VALID_CONTENT_SORT_KEYS = new Set<ContentSortKey>([
    'title',
    'category',
    'author',
    'date',
    'rawDate',
    'status',
]);
const VALID_DONATION_SORT_KEYS = new Set(['date', 'donor', 'amount']);

export const DEFAULT_ADMIN_USERS_FILTERS: AdminUsersFilterState = {
    activeTab: 'All',
    searchTerm: '',
    searchBatch: '',
    searchReason: '',
    degree: 'All',
    batchRange: 'All Batches',
    customMinBatch: '',
    customMaxBatch: '',
    sortConfig: null,
    itemsPerPage: 20,
    currentPage: 1,
};

export const DEFAULT_ADMIN_CONTENT_FILTERS: AdminContentFilterState = {
    activeTab: 'All',
    searchName: '',
    searchAuthor: '',
    searchStartDate: '',
    searchEndDate: '',
    datePreset: 'all',
    searchCategories: ['All'],
    accountScope: ['All'],
    sortConfig: { key: 'date', direction: 'desc' },
    itemsPerPage: 20,
    currentPage: 1,
};

export const DEFAULT_ADMIN_DONATIONS_FILTERS: AdminDonationsFilterState = {
    activeTab: 'All',
    searchDonor: '',
    searchRef: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    datePreset: 'all',
    amountPreset: 'all',
    searchBankName: 'All',
    sortConfig: { key: 'date', direction: 'desc' },
    itemsPerPage: 20,
    currentPage: 1,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value : fallback;
}

function readItemsPerPage(value: unknown, fallback = 20): number {
    return typeof value === 'number' && VALID_ITEMS_PER_PAGE.has(value) ? value : fallback;
}

function readCurrentPage(value: unknown, fallback = 1): number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : fallback;
}

function readSortConfig<K extends string>(
    value: unknown,
    allowedKeys: ReadonlySet<K>,
    fallback: AdminSortConfig<K> | null
): AdminSortConfig<K> | null {
    if (value === null) return null;
    if (!isPlainObject(value)) return fallback;
    const { key, direction } = value;
    if (
        typeof key === 'string' &&
        allowedKeys.has(key as K) &&
        (direction === 'asc' || direction === 'desc')
    ) {
        return { key: key as K, direction };
    }
    return fallback;
}

function readStringArray(
    value: unknown,
    fallback: string[],
    allowed?: ReadonlySet<string>
): string[] {
    if (!Array.isArray(value)) return [...fallback];
    const filtered = value.filter(
        (item): item is string =>
            typeof item === 'string' &&
            item.length > 0 &&
            (!allowed || allowed.has(item))
    );
    const deduped = Array.from(new Set(filtered));
    if (deduped.length === 0) return [...fallback];
    if (deduped.includes('All') && deduped.length > 1) {
        return ['All'];
    }
    return deduped;
}

function resolveStorage(storage?: Storage): Storage | undefined {
    if (storage) return storage;
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            return window.sessionStorage;
        }
    } catch {
        // Ignore SecurityError when storage is disabled
    }
    return undefined;
}

function isDeepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((item, idx) => isDeepEqual(item, b[idx]));
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && isDeepEqual(a[key], b[key]));
    }
    return false;
}

function readRawSessionObject(key: AdminFilterStorageKey, storage?: Storage): unknown {
    const target = resolveStorage(storage);
    if (!target) return undefined;
    try {
        const saved = target.getItem(key);
        if (!saved) return undefined;
        return JSON.parse(saved);
    } catch (e) {
        console.error(`Failed to parse admin filters (${key}) from sessionStorage`, e);
        return undefined;
    }
}

function writeSessionFilters<T>(
    key: AdminFilterStorageKey,
    state: T,
    defaultState: T,
    storage?: Storage
): void {
    const target = resolveStorage(storage);
    if (!target) return;
    try {
        if (isDeepEqual(state, defaultState)) {
            target.removeItem(key);
        } else {
            target.setItem(key, JSON.stringify(state));
        }
    } catch (e) {
        console.error(`Failed to save admin filters (${key}) to sessionStorage`, e);
    }
}

export function sanitizeAdminUsersFilters(raw: unknown): AdminUsersFilterState {
    if (!isPlainObject(raw)) {
        return { ...DEFAULT_ADMIN_USERS_FILTERS };
    }
    const rawBatchRange = raw.batchRange === 'Custom' ? 'Custom Range' : raw.batchRange;
    const batchRange =
        typeof rawBatchRange === 'string' && VALID_USER_BATCH_RANGES.has(rawBatchRange)
            ? rawBatchRange
            : DEFAULT_ADMIN_USERS_FILTERS.batchRange;

    return {
        activeTab: readString(raw.activeTab, DEFAULT_ADMIN_USERS_FILTERS.activeTab) || 'All',
        searchTerm: readString(raw.searchTerm, DEFAULT_ADMIN_USERS_FILTERS.searchTerm),
        searchBatch: readString(raw.searchBatch, DEFAULT_ADMIN_USERS_FILTERS.searchBatch),
        searchReason: readString(raw.searchReason, DEFAULT_ADMIN_USERS_FILTERS.searchReason),
        degree: readString(raw.degree, DEFAULT_ADMIN_USERS_FILTERS.degree) || 'All',
        batchRange,
        customMinBatch: readString(raw.customMinBatch, DEFAULT_ADMIN_USERS_FILTERS.customMinBatch),
        customMaxBatch: readString(raw.customMaxBatch, DEFAULT_ADMIN_USERS_FILTERS.customMaxBatch),
        sortConfig: readSortConfig(raw.sortConfig, VALID_USER_SORT_KEYS, DEFAULT_ADMIN_USERS_FILTERS.sortConfig),
        itemsPerPage: readItemsPerPage(raw.itemsPerPage, DEFAULT_ADMIN_USERS_FILTERS.itemsPerPage),
        currentPage: readCurrentPage(raw.currentPage, DEFAULT_ADMIN_USERS_FILTERS.currentPage),
    };
}

export function readAdminUsersFilters(storage?: Storage): AdminUsersFilterState {
    return sanitizeAdminUsersFilters(readRawSessionObject(ADMIN_FILTER_STORAGE_KEYS.users, storage));
}

export function writeAdminUsersFilters(state: AdminUsersFilterState, storage?: Storage): void {
    writeSessionFilters(ADMIN_FILTER_STORAGE_KEYS.users, state, DEFAULT_ADMIN_USERS_FILTERS, storage);
}

export function sanitizeAdminContentFilters(
    raw: unknown,
    options?: {
        allowedStatuses?: readonly string[];
        allowedCategories?: readonly string[];
    }
): AdminContentFilterState {
    const defaults: AdminContentFilterState = {
        ...DEFAULT_ADMIN_CONTENT_FILTERS,
        searchCategories: [...DEFAULT_ADMIN_CONTENT_FILTERS.searchCategories],
        accountScope: [...DEFAULT_ADMIN_CONTENT_FILTERS.accountScope],
        sortConfig: DEFAULT_ADMIN_CONTENT_FILTERS.sortConfig
            ? { ...DEFAULT_ADMIN_CONTENT_FILTERS.sortConfig }
            : null,
    };

    if (!isPlainObject(raw)) {
        return defaults;
    }

    const rawTab = readString(raw.activeTab, defaults.activeTab) || 'All';
    const allowedStatusesSet = options?.allowedStatuses ? new Set(options.allowedStatuses) : undefined;
    const activeTab = !allowedStatusesSet || allowedStatusesSet.has(rawTab) ? rawTab : 'All';

    const rawDatePreset = readString(raw.datePreset, defaults.datePreset);
    const datePreset = VALID_DATE_PRESETS.has(rawDatePreset) ? rawDatePreset : defaults.datePreset;

    const allowedCategoriesSet = options?.allowedCategories
        ? new Set(['All', ...options.allowedCategories])
        : undefined;

    return {
        activeTab,
        searchName: readString(raw.searchName, defaults.searchName),
        searchAuthor: readString(raw.searchAuthor, defaults.searchAuthor),
        searchStartDate: readString(raw.searchStartDate, defaults.searchStartDate),
        searchEndDate: readString(raw.searchEndDate, defaults.searchEndDate),
        datePreset,
        searchCategories: readStringArray(raw.searchCategories, ['All'], allowedCategoriesSet),
        accountScope: readStringArray(raw.accountScope, ['All'], VALID_ACCOUNT_SCOPES),
        sortConfig: readSortConfig(raw.sortConfig, VALID_CONTENT_SORT_KEYS, defaults.sortConfig),
        itemsPerPage: readItemsPerPage(raw.itemsPerPage, defaults.itemsPerPage),
        currentPage: readCurrentPage(raw.currentPage, defaults.currentPage),
    };
}

export function getAdminContentFilterStorageKey(contentType: 'Event' | 'Bulletin'): AdminFilterStorageKey {
    return contentType === 'Bulletin'
        ? ADMIN_FILTER_STORAGE_KEYS.bulletins
        : ADMIN_FILTER_STORAGE_KEYS.events;
}

export function readAdminContentFilters(
    contentType: 'Event' | 'Bulletin',
    options?: {
        allowedStatuses?: readonly string[];
        allowedCategories?: readonly string[];
    },
    storage?: Storage
): AdminContentFilterState {
    const key = getAdminContentFilterStorageKey(contentType);
    return sanitizeAdminContentFilters(readRawSessionObject(key, storage), options);
}

export function writeAdminContentFilters(
    contentType: 'Event' | 'Bulletin',
    state: AdminContentFilterState,
    storage?: Storage
): void {
    const key = getAdminContentFilterStorageKey(contentType);
    writeSessionFilters(key, state, DEFAULT_ADMIN_CONTENT_FILTERS, storage);
}

export function sanitizeAdminDonationsFilters(raw: unknown): AdminDonationsFilterState {
    const defaults: AdminDonationsFilterState = {
        ...DEFAULT_ADMIN_DONATIONS_FILTERS,
        sortConfig: DEFAULT_ADMIN_DONATIONS_FILTERS.sortConfig
            ? { ...DEFAULT_ADMIN_DONATIONS_FILTERS.sortConfig }
            : null,
    };

    if (!isPlainObject(raw)) {
        return defaults;
    }

    const rawDatePreset = readString(raw.datePreset, defaults.datePreset);
    const datePreset = VALID_DATE_PRESETS.has(rawDatePreset) ? rawDatePreset : defaults.datePreset;

    const rawAmountPreset = readString(raw.amountPreset, defaults.amountPreset);
    const amountPreset = VALID_AMOUNT_PRESETS.has(rawAmountPreset) ? rawAmountPreset : defaults.amountPreset;

    return {
        activeTab: readString(raw.activeTab, defaults.activeTab) || 'All',
        searchDonor: readString(raw.searchDonor, defaults.searchDonor),
        searchRef: readString(raw.searchRef, defaults.searchRef),
        minAmount: readString(raw.minAmount, defaults.minAmount),
        maxAmount: readString(raw.maxAmount, defaults.maxAmount),
        startDate: readString(raw.startDate, defaults.startDate),
        endDate: readString(raw.endDate, defaults.endDate),
        datePreset,
        amountPreset,
        searchBankName: readString(raw.searchBankName, defaults.searchBankName) || 'All',
        sortConfig: readSortConfig(raw.sortConfig, VALID_DONATION_SORT_KEYS, defaults.sortConfig),
        itemsPerPage: readItemsPerPage(raw.itemsPerPage, defaults.itemsPerPage),
        currentPage: readCurrentPage(raw.currentPage, defaults.currentPage),
    };
}

export function readAdminDonationsFilters(storage?: Storage): AdminDonationsFilterState {
    return sanitizeAdminDonationsFilters(readRawSessionObject(ADMIN_FILTER_STORAGE_KEYS.donations, storage));
}

export function writeAdminDonationsFilters(state: AdminDonationsFilterState, storage?: Storage): void {
    writeSessionFilters(ADMIN_FILTER_STORAGE_KEYS.donations, state, DEFAULT_ADMIN_DONATIONS_FILTERS, storage);
}

export function clearAdminFilters(key: AdminFilterStorageKey, storage?: Storage): void {
    const target = resolveStorage(storage);
    if (!target) return;
    try {
        target.removeItem(key);
    } catch (e) {
        console.error(`Failed to clear admin filters (${key}) from sessionStorage`, e);
    }
}

export function clearAllAdminFilters(storage?: Storage): void {
    const target = resolveStorage(storage);
    if (!target) return;
    for (const key of Object.values(ADMIN_FILTER_STORAGE_KEYS)) {
        try {
            target.removeItem(key);
        } catch (e) {
            console.error(`Failed to clear admin filters (${key}) from sessionStorage`, e);
        }
    }
}
