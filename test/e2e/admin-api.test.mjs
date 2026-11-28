import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestEnv } from '../helpers/server.mjs';
import {
    getFirstAdmin,
    mintAdminToken,
    seedTempAdminPassword,
    loginAdminApi,
} from '../helpers/auth.mjs';

let env;
let admin;
let bearerToken;

before(async () => {
    env = await startTestEnv({ copyDb: true });
    admin = getFirstAdmin(env.tempDbPath);
    bearerToken = mintAdminToken({
        id: admin.id,
        username: admin.username,
        jwtSecret: env.jwtSecret,
    });
});

after(async () => {
    if (env) {
        await env.close();
    }
});

test('GET /api/admin/users contract, slim payload, sorting, pagination validation, and degree filter', async (t) => {
    await t.test('rejects unauthenticated requests with 401', async () => {
        const res = await fetch(`${env.apiUrl}/api/admin/users?_page=1&_per_page=5`);
        assert.equal(res.status, 401);
    });

    await t.test('authenticates via seedTempAdminPassword + loginAdminApi on temp DB only', async () => {
        const tempPass = 'TempTestPass!2026';
        seedTempAdminPassword(env.tempDbPath, admin.username, tempPass);
        const loginResult = await loginAdminApi(env.baseUrl, {
            username: admin.username,
            password: tempPass,
        });
        assert.ok(loginResult.token);
        assert.equal(loginResult.admin.username, admin.username);

        const meRes = await fetch(`${env.baseUrl}/api/auth/admin/me`, {
            headers: { Authorization: `Bearer ${loginResult.token}` },
        });
        assert.equal(meRes.status, 200);
        const meBody = await meRes.json();
        assert.equal(meBody.admin.username, admin.username);
    });

    await t.test('returns slim payload without profileStatus or passwordHash and at most 1 current record', async () => {
        const res = await fetch(`${env.apiUrl}/api/admin/users?_page=1&_per_page=20`, {
            headers: { Authorization: `Bearer ${bearerToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.ok(Array.isArray(body.data));
        assert.ok(body.data.length > 0);
        assert.equal(typeof body.items, 'number');

        for (const u of body.data) {
            assert.ok(u.id);
            assert.equal('profileStatus' in u, false, 'profileStatus must not be over-fetched');
            assert.equal('passwordHash' in u, false, 'passwordHash must never be exposed');
            assert.equal('auth' in u, false, 'auth must not be exposed');
            assert.ok(u.userStatus && typeof u.userStatus.statusName === 'string');
            assert.ok(u.profile && typeof u.profile.userName === 'string');
            assert.ok(Array.isArray(u.records));
            assert.ok(u.records.length <= 1, `expected <= 1 current record, got ${u.records.length}`);
        }
    });

    await t.test('supports _sort=grantedDate and _sort=-grantedDate with HTTP 200 and monotonic ordering', async () => {
        const getTimestamps = async (sortParam) => {
            const res = await fetch(
                `${env.apiUrl}/api/admin/users?_page=1&_per_page=50&_sort=${encodeURIComponent(sortParam)}`,
                { headers: { Authorization: `Bearer ${bearerToken}` } }
            );
            assert.equal(res.status, 200);
            const body = await res.json();
            assert.ok(body.data.length > 1);
            return body.data.map((u) => {
                const rec = u.records?.[0];
                return rec?.dateCreated ? new Date(rec.dateCreated).getTime() : 0;
            });
        };

        const asc = await getTimestamps('grantedDate');
        for (let i = 1; i < asc.length; i++) {
            assert.ok(asc[i] >= asc[i - 1], `ascending grantedDate violated at index ${i}: ${asc[i - 1]} > ${asc[i]}`);
        }

        const desc = await getTimestamps('-grantedDate');
        for (let i = 1; i < desc.length; i++) {
            assert.ok(desc[i] <= desc[i - 1], `descending grantedDate violated at index ${i}: ${desc[i - 1]} < ${desc[i]}`);
        }
    });

    await t.test('rejects invalid _page, _per_page, and _limit values with HTTP 400', async () => {
        const invalidCases = [
            '_page=0&_per_page=10',
            '_page=-1&_per_page=10',
            '_page=1.5&_per_page=10',
            '_page=abc&_per_page=10',
            '_page=1&_per_page=0',
            '_page=1&_per_page=-5',
            '_page=1&_per_page=2.5',
            '_page=1&_per_page=xyz',
            '_limit=0',
            '_limit=-2',
            '_limit=1.2',
            '_limit=abc',
        ];

        for (const qs of invalidCases) {
            const res = await fetch(`${env.apiUrl}/api/admin/users?${qs}`, {
                headers: { Authorization: `Bearer ${bearerToken}` },
            });
            assert.equal(res.status, 400, `expected HTTP 400 for query "${qs}", got ${res.status}`);
        }
    });

    await t.test('filters users accurately by degree via _where', async () => {
        const allRes = await fetch(`${env.apiUrl}/api/admin/users`, {
            headers: { Authorization: `Bearer ${bearerToken}` },
        });
        assert.equal(allRes.status, 200);
        const allUsers = await allRes.json();
        assert.ok(Array.isArray(allUsers));

        const targetUser = allUsers.find((u) => u.profile?.degree?.id);
        assert.ok(targetUser, 'expected at least one user with a degreeId');
        const targetDegreeId = targetUser.profile.degree.id;

        const where = encodeURIComponent(JSON.stringify({ profile: { degreeId: targetDegreeId } }));
        const filteredRes = await fetch(`${env.apiUrl}/api/admin/users?_where=${where}`, {
            headers: { Authorization: `Bearer ${bearerToken}` },
        });
        assert.equal(filteredRes.status, 200);
        const filteredUsers = await filteredRes.json();
        assert.ok(Array.isArray(filteredUsers));
        assert.ok(filteredUsers.length > 0);
        assert.ok(filteredUsers.length < allUsers.length);

        for (const u of filteredUsers) {
            assert.equal(u.profile?.degree?.id, targetDegreeId);
        }
    });
});

test('GET /api/donations/summary returns valid schema and non-negative metrics', async () => {
    const res = await fetch(`${env.apiUrl}/api/donations/summary`);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.ok(body.stats && typeof body.stats === 'object');
    const numericStatKeys = [
        'totalRaised',
        'pendingClearances',
        'pendingCount',
        'uniqueDonors',
        'allTimeUniqueDonors',
        'averageLifetimeValue',
        'averageDonationValue',
        'donationFrequency',
        'repeatDonationRate',
        'yoyRetention',
        'engagementRate',
    ];

    for (const key of numericStatKeys) {
        assert.equal(typeof body.stats[key], 'number', `stats.${key} should be a number`);
        assert.ok(Number.isFinite(body.stats[key]), `stats.${key} should be finite`);
        assert.ok(body.stats[key] >= 0, `stats.${key} should be >= 0`);
    }
    assert.ok(!Number.isNaN(new Date(body.stats.updatedAt).getTime()), 'stats.updatedAt should be valid date');

    assert.ok(Array.isArray(body.charts?.statusData));
    for (const item of body.charts.statusData) {
        assert.equal(typeof item.name, 'string');
        assert.equal(typeof item.value, 'number');
        assert.ok(item.value >= 0);
    }

    assert.ok(Array.isArray(body.charts?.bankData));
    for (const item of body.charts.bankData) {
        assert.equal(typeof item.name, 'string');
        assert.equal(typeof item.value, 'number');
        assert.ok(item.value >= 0);
    }

    assert.ok(Array.isArray(body.uniqueBanks));
    const sortedBanks = [...body.uniqueBanks].sort();
    assert.deepEqual(body.uniqueBanks, sortedBanks);

    for (const key of ['topLTV', 'topAvgDonation', 'topFrequency']) {
        const list = body.leaderboards?.[key];
        assert.ok(Array.isArray(list), `leaderboards.${key} should be an array`);
        assert.ok(list.length <= 6, `leaderboards.${key} should have at most 6 entries`);
        for (const entry of list) {
            assert.equal(typeof entry.donor, 'string');
            assert.equal(typeof entry.amount, 'number');
            assert.equal(typeof entry.avgDonation, 'number');
            assert.equal(typeof entry.frequency, 'number');
            assert.ok(entry.amount >= 0);
            assert.ok(entry.frequency >= 0);
            assert.ok(entry.userId);
        }
    }
});
