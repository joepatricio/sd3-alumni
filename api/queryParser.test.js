import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWhere, parseSort } from './queryParser.js';

test('parseSort', async (t) => {
    await t.test('handles a single ascending field', () => {
        const result = parseSort('name');
        assert.deepEqual(result, [{ name: 'asc' }]);
    });

    await t.test('handles a single descending field', () => {
        const result = parseSort('-age');
        assert.deepEqual(result, [{ age: 'desc' }]);
    });

    await t.test('handles multiple fields with mixed directions', () => {
        const result = parseSort('-achievement_tier,id');
        assert.deepEqual(result, [{ achievement_tier: 'desc' }, { id: 'asc' }]);
    });

    await t.test('returns undefined when no sort provided', () => {
        const result = parseSort(undefined);
        assert.equal(result, undefined);
    });
});

test('parseWhere', async (t) => {
    await t.test('handles basic key-value query parameters', () => {
        const query = { name: 'Alice', age: '30' };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, { name: 'Alice', age: '30' }); // age is not in numericFields so it stays string
        // Let's test with a real numeric field 'batch'
    });

    await t.test('handles numeric fields coercion', () => {
        const query = { batch: '2023', name: 'Alice' };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, { batch: 2023, name: 'Alice' });
    });

    await t.test('ignores pagination fields', () => {
        const query = { _page: '1', _limit: '10', name: 'Alice' };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, { name: 'Alice' });
    });

    await t.test('handles :in syntax', () => {
        const query = { 'batch:in': '2022,2023' };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, { batch: { in: [2022, 2023] } });
    });

    await t.test('handles simple _where JSON', () => {
        const query = { _where: JSON.stringify({ name: 'Alice' }) };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, { name: 'Alice' });
    });

    await t.test('handles _where with mapped operators', () => {
        const query = {
            _where: JSON.stringify({
                or: [
                    { achievementTier: { gt: 1 } },
                    { batch: { in: [2022, 2023] } }
                ]
            })
        };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, {
            OR: [
                { achievementTier: { gt: 1 } },
                { batch: { in: [2022, 2023] } } // inside JSON, values maintain their type
            ]
        });
    });

    await t.test('handles JSON server operators mapping in _where', () => {
        const query = {
            _where: JSON.stringify({
                and: [
                    { name: { eq: 'Alice' } },
                    { role: { ne: 'Admin' } },
                    { status: { nin: ['Banned'] } }
                ]
            })
        };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, {
            AND: [
                { name: { equals: 'Alice' } },
                { role: { not: 'Admin' } },
                { status: { notIn: ['Banned'] } }
            ]
        });
    });

    await t.test('combines standard query with _where using AND array', () => {
        const query = {
            batch: '2023',
            _where: JSON.stringify({
                or: [
                    { name: 'Alice' },
                    { name: 'Bob' }
                ]
            })
        };
        const result = parseWhere(query, 'user');
        assert.deepEqual(result, {
            AND: [
                { batch: 2023 },
                { OR: [{ name: 'Alice' }, { name: 'Bob' }] }
            ]
        });
    });

    await t.test('handles event model key mappings for flat keys and _where', () => {
        const query = {
            'eventStatus.statusName': 'Approved',
            _where: JSON.stringify({
                eventStatus: { statusName: 'Approved' },
                eventDate: { gte: '2026-06-26T00:00:00.000Z' }
            })
        };
        const result = parseWhere(query, 'event');
        assert.deepEqual(result, {
            AND: [
                { status: { is: { statusName: 'Approved' } } },
                {
                    status: { statusName: 'Approved' },
                    eventDate: { gte: '2026-06-26T00:00:00.000Z' }
                }
            ]
        });
    });
});
