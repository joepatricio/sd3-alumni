export const numericFields = new Set([
    'batch', 'donationAmount', 'achievementTier', 'lat', 'lng', 'responses', 'readTimeMinutes', 'likes', 'eventsAttended', 'eventsCreated', 'bulletinsCreated', 'commentsWritten', 'achievements', 'donatedAmount', 'userConnections'
]);

function mapKeysAndOperators(obj, modelName) {
    if (Array.isArray(obj)) {
        return obj.map(item => mapKeysAndOperators(item, modelName));
    } else if (typeof obj === 'object' && obj !== null) {
        const mapped = {};
        for (const [key, value] of Object.entries(obj)) {
            let mappedKey = key;
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
                if (modelName === 'user') {
                    if (key === 'userId') mappedKey = 'id';
                } else if (modelName === 'bulletin') {
                    if (key === 'profileId') mappedKey = 'authorId';
                    else if (key === 'contentStatus') mappedKey = 'status';
                } else if (modelName === 'comment' || modelName === 'bulletinLike') {
                    if (key === 'profileId') mappedKey = 'userId';
                } else if (modelName === 'event') {
                    if (key === 'eventStatus') mappedKey = 'status';
                    else if (key === 'eventCategory') mappedKey = 'category';
                    else if (key === 'userRsvps') mappedKey = 'rsvps';
                } else if (modelName === 'donation') {
                    if (key === 'donationStatus') mappedKey = 'status';
                }
            }

            let nextModelName = modelName;
            if (modelName === 'event') {
                if (mappedKey === 'status') nextModelName = 'eventStatus';
                else if (mappedKey === 'category') nextModelName = 'eventCategory';
                else if (mappedKey === 'rsvps') nextModelName = 'userRsvp';
            } else if (modelName === 'bulletin') {
                if (mappedKey === 'status') nextModelName = 'contentStatus';
            } else if (modelName === 'donation') {
                if (mappedKey === 'status') nextModelName = 'donationStatus';
            }

            mapped[mappedKey] = mapKeysAndOperators(value, nextModelName);
        }
        return mapped;
    }
    return obj;
}

function mapFlatKey(key, modelName) {
    let suffix = '';
    let cleanKey = key;
    if (key.endsWith(':in')) {
        suffix = ':in';
        cleanKey = key.slice(0, -3);
    }
    
    const parts = cleanKey.split('.');
    let currentModel = modelName;
    const mappedParts = parts.map(part => {
        let mappedPart = part;
        if (currentModel === 'user') {
            if (part === 'userId') mappedPart = 'id';
        } else if (currentModel === 'bulletin') {
            if (part === 'profileId') mappedPart = 'authorId';
            else if (part === 'contentStatus') mappedPart = 'status';
        } else if (currentModel === 'comment' || currentModel === 'bulletinLike') {
            if (part === 'profileId') mappedPart = 'userId';
        } else if (currentModel === 'event') {
            if (part === 'eventStatus') mappedPart = 'status';
            else if (part === 'eventCategory') mappedPart = 'category';
            else if (part === 'userRsvps') mappedPart = 'rsvps';
        } else if (currentModel === 'donation') {
            if (part === 'donationStatus') mappedPart = 'status';
        }
        
        if (currentModel === 'event') {
            if (mappedPart === 'status') currentModel = 'eventStatus';
            else if (mappedPart === 'category') currentModel = 'eventCategory';
            else if (mappedPart === 'rsvps') currentModel = 'userRsvp';
        } else if (currentModel === 'bulletin') {
            if (mappedPart === 'status') currentModel = 'contentStatus';
        } else if (currentModel === 'donation') {
            if (mappedPart === 'status') currentModel = 'donationStatus';
        }
        
        return mappedPart;
    });
    
    return mappedParts.join('.') + suffix;
}

export function parseWhere(query, modelName) {
    const where = {};

    // First handle standard json-server matching or other query keys
    for (let [key, val] of Object.entries(query)) {
        if (key.startsWith('_')) continue; // Skip pagination and internal keywords

        const mappedKey = mapFlatKey(key, modelName);

        if (mappedKey.includes('.')) {
            const parts = mappedKey.split('.');
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
            if (lastPart.endsWith(':in')) {
                const field = lastPart.replace(':in', '');
                const values = typeof val === 'string' ? val.split(',') : (Array.isArray(val) ? val : [val]);
                const mappedValues = values.map(v => {
                    if (v === 'true') return true;
                    if (v === 'false') return false;
                    if (numericFields.has(field) && !isNaN(v) && v.trim() !== '') return Number(v);
                    return v;
                });
                current[field] = { in: mappedValues };
            } else {
                let parsedVal = val;
                if (val === 'true') parsedVal = true;
                else if (val === 'false') parsedVal = false;
                else if (numericFields.has(lastPart) && !isNaN(val) && String(val).trim() !== '') {
                    parsedVal = Number(val);
                }
                current[lastPart] = parsedVal;
            }
        } else if (mappedKey.endsWith(':in')) {
            const field = mappedKey.replace(':in', '');
            const values = typeof val === 'string' ? val.split(',') : (Array.isArray(val) ? val : [val]);
            const mappedValues = values.map(v => {
                if (v === 'true') return true;
                if (v === 'false') return false;
                if (numericFields.has(field) && !isNaN(v) && v.trim() !== '') return Number(v);
                return v;
            });
            where[field] = { in: mappedValues };
        } else {
            let parsedVal = val;
            if (val === 'true') parsedVal = true;
            else if (val === 'false') parsedVal = false;
            else if (numericFields.has(mappedKey) && !isNaN(val) && String(val).trim() !== '') {
                parsedVal = Number(val);
            }
            where[mappedKey] = parsedVal;
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
        let key = field;
        if (field.startsWith('-')) {
            direction = 'desc';
            key = field.substring(1);
        }
        
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

