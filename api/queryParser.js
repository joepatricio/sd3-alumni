export const numericFields = new Set([
    'batch', 'donationAmount', 'achievementTier', 'lat', 'lng', 'responses', 'readTimeMinutes', 'likes', 'eventsAttended', 'eventsCreated', 'bulletinsCreated', 'commentsWritten', 'achievements', 'donatedAmount', 'userConnections'
]);

export function snakeToCamel(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/_([a-z0-9])/gi, (_, letter) => letter.toUpperCase());
}

const SUFFIX_OPERATORS = [
    { suffix: ':in', op: 'in' },
    { suffix: ':nin', op: 'notIn' },
    { suffix: ':notIn', op: 'notIn' },
    { suffix: ':not_in', op: 'notIn' },
    { suffix: ':gte', op: 'gte' },
    { suffix: ':gt', op: 'gt' },
    { suffix: ':lte', op: 'lte' },
    { suffix: ':lt', op: 'lt' },
    { suffix: ':ne', op: 'not' },
    { suffix: ':not', op: 'not' },
    { suffix: ':eq', op: 'equals' },
    { suffix: ':equals', op: 'equals' },
    { suffix: ':contains', op: 'contains' },
    { suffix: ':startsWith', op: 'startsWith' },
    { suffix: ':starts_with', op: 'startsWith' },
    { suffix: ':endsWith', op: 'endsWith' },
    { suffix: ':ends_with', op: 'endsWith' }
];

export function extractOperator(key) {
    for (const { suffix, op } of SUFFIX_OPERATORS) {
        if (key.endsWith(suffix)) {
            return {
                cleanKey: key.slice(0, -suffix.length),
                operator: op,
                rawSuffix: suffix
            };
        }
    }
    return { cleanKey: key, operator: null, rawSuffix: '' };
}

function parseSingleValue(field, val) {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (numericFields.has(field) && !isNaN(val) && String(val).trim() !== '') {
        return Number(val);
    }
    return val;
}

function buildFieldCondition(field, operator, val) {
    if (operator === 'in' || operator === 'notIn') {
        const values = typeof val === 'string' ? val.split(',') : (Array.isArray(val) ? val : [val]);
        const mappedValues = values.map(v => parseSingleValue(field, v));
        return { [operator]: mappedValues };
    }

    const parsedVal = parseSingleValue(field, val);

    if (!operator || operator === 'equals') {
        return parsedVal;
    }

    if (operator === 'contains' || operator === 'startsWith' || operator === 'endsWith') {
        return { [operator]: String(val) };
    }

    return { [operator]: parsedVal };
}

function mapKeysAndOperators(obj, modelName) {
    if (Array.isArray(obj)) {
        return obj.map(item => mapKeysAndOperators(item, modelName));
    } else if (typeof obj === 'object' && obj !== null) {
        const mapped = {};
        for (const [key, value] of Object.entries(obj)) {
            let mappedKey;
            if (key === 'or') mappedKey = 'OR';
            else if (key === 'and') mappedKey = 'AND';
            else if (key === 'eq') mappedKey = 'equals';
            else if (key === 'ne') mappedKey = 'not';
            else if (key === 'lt') mappedKey = 'lt';
            else if (key === 'lte') mappedKey = 'lte';
            else if (key === 'gt') mappedKey = 'gt';
            else if (key === 'gte') mappedKey = 'gte';
            else if (key === 'in') mappedKey = 'in';
            else if (key === 'nin') mappedKey = 'notIn';
            else {
                mappedKey = snakeToCamel(key);
                if (modelName === 'user') {
                    if (mappedKey === 'userId') mappedKey = 'id';
                } else if (modelName === 'bulletin') {
                    if (mappedKey === 'profileId') mappedKey = 'authorId';
                    else if (mappedKey === 'contentStatus') mappedKey = 'status';
                    else if (mappedKey === 'bulletinCategory') mappedKey = 'category';
                } else if (modelName === 'comment' || modelName === 'bulletinLike') {
                    if (mappedKey === 'profileId') mappedKey = 'userId';
                } else if (modelName === 'event') {
                    if (mappedKey === 'eventStatus') mappedKey = 'status';
                    else if (mappedKey === 'eventCategory') mappedKey = 'category';
                    else if (mappedKey === 'userRsvps') mappedKey = 'rsvps';
                } else if (modelName === 'donation') {
                    if (mappedKey === 'donationStatus') mappedKey = 'status';
                }
            }

            let nextModelName = modelName;
            if (modelName === 'event') {
                if (mappedKey === 'status') nextModelName = 'eventStatus';
                else if (mappedKey === 'category') nextModelName = 'eventCategory';
                else if (mappedKey === 'rsvps') nextModelName = 'userRsvp';
            } else if (modelName === 'bulletin') {
                if (mappedKey === 'status') nextModelName = 'contentStatus';
                else if (mappedKey === 'category') nextModelName = 'bulletinCategory';
            } else if (modelName === 'donation') {
                if (mappedKey === 'status') nextModelName = 'donationStatus';
            }

            let finalValue = value;
            if (numericFields.has(mappedKey) && typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
                finalValue = Number(value);
            }

            mapped[mappedKey] = mapKeysAndOperators(finalValue, nextModelName);
        }
        return mapped;
    }
    return obj;
}

function mapFlatKey(key, modelName) {
    const { cleanKey, rawSuffix } = extractOperator(key);

    const parts = cleanKey.split('.');
    let currentModel = modelName;
    const mappedParts = parts.map(part => {
        let mappedPart = snakeToCamel(part);
        if (currentModel === 'user') {
            if (mappedPart === 'userId') mappedPart = 'id';
        } else if (currentModel === 'bulletin') {
            if (mappedPart === 'profileId') mappedPart = 'authorId';
            else if (mappedPart === 'contentStatus') mappedPart = 'status';
            else if (mappedPart === 'bulletinCategory') mappedPart = 'category';
        } else if (currentModel === 'comment' || currentModel === 'bulletinLike') {
            if (mappedPart === 'profileId') mappedPart = 'userId';
        } else if (currentModel === 'event') {
            if (mappedPart === 'eventStatus') mappedPart = 'status';
            else if (mappedPart === 'eventCategory') mappedPart = 'category';
            else if (mappedPart === 'userRsvps') mappedPart = 'rsvps';
        } else if (currentModel === 'donation') {
            if (mappedPart === 'donationStatus') mappedPart = 'status';
        }

        if (currentModel === 'event') {
            if (mappedPart === 'status') currentModel = 'eventStatus';
            else if (mappedPart === 'category') currentModel = 'eventCategory';
            else if (mappedPart === 'rsvps') currentModel = 'userRsvp';
        } else if (currentModel === 'bulletin') {
            if (mappedPart === 'status') currentModel = 'contentStatus';
            else if (mappedPart === 'category') currentModel = 'bulletinCategory';
        } else if (currentModel === 'donation') {
            if (mappedPart === 'status') currentModel = 'donationStatus';
        }

        return mappedPart;
    });

    return mappedParts.join('.') + rawSuffix;
}

export function parseWhere(query, modelName) {
    const where = {};

    // First handle standard json-server matching or other query keys
    for (let [key, val] of Object.entries(query)) {
        if (key.startsWith('_')) continue; // Skip pagination and internal keywords

        const mappedKey = mapFlatKey(key, modelName);
        const { cleanKey, operator } = extractOperator(mappedKey);

            if (cleanKey.includes('.')) {
                const parts = cleanKey.split('.');
                let current = where;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = { is: {} };
                    } else if (!current[parts[i]].is) {
                        current[parts[i]] = { is: current[parts[i]] };
                    }
                    current = current[parts[i]].is;
                }
                const lastPart = parts[parts.length - 1];
                current[lastPart] = buildFieldCondition(lastPart, operator, val);
            } else {
                where[cleanKey] = buildFieldCondition(cleanKey, operator, val);
            }
        }

        // Now handle complex queries (_where)
        if (query._where) {
            try {
                const parsedWhere = typeof query._where === 'string' ? JSON.parse(query._where) : query._where;
                const prismaWhere = mapKeysAndOperators(parsedWhere, modelName);

                // Merge deep objects properly or just assign if not overlapping
                // For Prisma, we usually push these into an AND array if there's already conditions
                if (Object.keys(where).length > 0) {
                    if (!where.AND) where.AND = [];
                    // Push existing conditions to AND
                    const existingConditions = { ...where };
                    delete existingConditions.AND;
                    where.AND.push(existingConditions);
                    where.AND.push(prismaWhere);

                    // Remove the top level keys that we just pushed to AND
                    for (const k of Object.keys(existingConditions)) {
                        delete where[k];
                    }
                } else {
                    Object.assign(where, prismaWhere);
                }
            } catch (e) {
                console.error("Invalid _where JSON:", e.message);
            }
        }

        return where;
    }

    export function parseSort(sortQuery) {
        if (!sortQuery) return undefined;

        const fields = typeof sortQuery === 'string' ? sortQuery.split(',') : (Array.isArray(sortQuery) ? sortQuery : [sortQuery]);
        return fields.map(field => {
            let direction = 'asc';
                let key = field.trim();
                if (key.startsWith('-')) {
                    direction = 'desc';
                    key = key.substring(1);
                }
                key = snakeToCamel(key);

                if (key.includes('.')) {
                    const parts = key.split('.');
                    let obj = {};
                    let current = obj;
                    for (let i = 0; i < parts.length - 1; i++) {
                        current[parts[i]] = {};
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = direction;
                    return obj;
                }

                return { [key]: direction };
            });
    }
