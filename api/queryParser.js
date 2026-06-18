const numericFields = new Set([
    'batch', 'donationAmount', 'achievementTier', 'lat', 'lng', 'responses', 'readTimeMinutes', 'likes', 'eventsAttended', 'eventsCreated', 'bulletinsCreated', 'commentsWritten', 'achievements', 'donatedAmount', 'userConnections'
]);

function mapWhereOperator(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => mapWhereOperator(item));
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

            mapped[mappedKey] = mapWhereOperator(value);
        }
        return mapped;
    }
    return obj;
}

export function parseWhere(query, modelName) {
    const where = {};

    // First handle standard json-server matching or other query keys
    for (let [key, val] of Object.entries(query)) {
        if (key.startsWith('_')) continue; // Skip pagination and internal keywords

        // Dynamic mapping of query keys for specific models
        if (modelName === 'user') {
            if (key === 'userId') key = 'id';
            else if (key === 'userId:in') key = 'id:in';
        }
        if (modelName === 'bulletin') {
            if (key === 'profileId') key = 'authorId';
            else if (key === 'profileId:in') key = 'authorId:in';
        }
        if (modelName === 'comment' || modelName === 'bulletinLike') {
            if (key === 'profileId') key = 'userId';
            else if (key === 'profileId:in') key = 'userId:in';
        }

        if (key.includes('.')) {
            const parts = key.split('.');
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
        } else if (key.endsWith(':in')) {
            const field = key.replace(':in', '');
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
            else if (numericFields.has(key) && !isNaN(val) && String(val).trim() !== '') {
                parsedVal = Number(val);
            }
            where[key] = parsedVal;
        }
    }

    // Now handle complex queries (_where)
    if (query._where) {
        try {
            const parsedWhere = typeof query._where === 'string' ? JSON.parse(query._where) : query._where;
            const prismaWhere = mapWhereOperator(parsedWhere);
            
            // Merge deep objects properly or just assign if not overlapping
            // For Prisma, we usually push these into an AND array if there's already conditions
            if (Object.keys(where).length > 0) {
                if (!where.AND) where.AND = [];
                // Push existing keys to AND
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
