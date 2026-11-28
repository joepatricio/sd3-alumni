import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { REPO_ROOT } from './server.mjs';

function normalizeDbPath(targetPath) {
    let resolved = path.resolve(targetPath);
    if (fs.existsSync(resolved)) {
        try {
            resolved = fs.realpathSync.native(resolved);
        } catch {
            // fallback to path.resolve
        }
    }
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function assertNotRepoDb(dbPath) {
    const resolved = path.resolve(dbPath);
    const normalizedInput = normalizeDbPath(resolved);
    const normalizedRepoRootDb = normalizeDbPath(path.join(REPO_ROOT, 'dev.db'));
    const normalizedPrismaDevDb = normalizeDbPath(path.join(REPO_ROOT, 'prisma', 'dev.db'));
    if (normalizedInput === normalizedRepoRootDb || normalizedInput === normalizedPrismaDevDb) {
        throw new Error(`Refusing to mutate repository database: ${resolved}`);
    }
}

/**
 * Read the first admin record from the specified SQLite database (readonly).
 * @param {string} dbPath
 * @returns {{ id: string, username: string }}
 */
export function getFirstAdmin(dbPath) {
    const db = new Database(dbPath, { readonly: true });
    try {
        const row = db.prepare('SELECT id, username FROM Admin ORDER BY id ASC LIMIT 1').get();
        if (!row) {
            throw new Error(`No admin records found in ${dbPath}`);
        }
        return { id: String(row.id), username: String(row.username) };
    } finally {
        db.close();
    }
}

/**
 * Mint an HS256 admin JWT compatible with api/index.js authenticateAdminToken.
 * @param {{ id: string, username: string, jwtSecret: string }} params
 * @returns {string}
 */
export function mintAdminToken({ id, username, jwtSecret }) {
    return jwt.sign(
        { id, role: 'admin', username },
        jwtSecret,
        { expiresIn: '24h' }
    );
}

/**
 * Update an admin's passwordHash inside a temporary SQLite DB copy ONLY.
 * @param {string} dbPath
 * @param {string} username
 * @param {string} plainPassword
 */
export function seedTempAdminPassword(dbPath, username, plainPassword) {
    assertNotRepoDb(dbPath);
    const passwordHash = bcrypt.hashSync(plainPassword, 10);
    const db = new Database(dbPath);
    try {
        const result = db
            .prepare('UPDATE Admin SET passwordHash = ? WHERE username = ?')
            .run(passwordHash, username);
        if (result.changes !== 1) {
            throw new Error(`Expected 1 Admin row updated for username="${username}", got ${result.changes}`);
        }
    } finally {
        db.close();
    }
}

/**
 * Authenticate via POST /api/auth/admin/login and return token + cookie + admin info.
 * @param {string} baseUrl
 * @param {{ username: string, password: string }} credentials
 */
export async function loginAdminApi(baseUrl, { username, password }) {
    const res = await fetch(`${baseUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const body = await res.json();
    if (!res.ok) {
        throw new Error(`Admin login failed (HTTP ${res.status}): ${JSON.stringify(body)}`);
    }
    const setCookie = res.headers.get('set-cookie') || '';
    const cookieHeader = setCookie ? setCookie.split(';')[0] : `adminToken=${body.token}`;
    return {
        token: body.token,
        cookieHeader,
        admin: body.admin,
    };
}

/**
 * Inject admin JWT into both cookie (adminToken) and sessionStorage before page navigation.
 * @param {import('puppeteer-core').Page} page
 * @param {string} baseUrl
 * @param {string} token
 */
export async function authenticateAdminPage(page, baseUrl, token) {
    const parsedUrl = new URL(baseUrl);
    await page.setCookie({
        name: 'adminToken',
        value: token,
        domain: parsedUrl.hostname,
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
    });

    await page.evaluateOnNewDocument((adminToken) => {
        try {
            window.sessionStorage.setItem('adminToken', adminToken);
        } catch {
            // ignore on opaque origins
        }
    }, token);

    try {
        await page.evaluate((adminToken) => {
            if (window.location.origin && window.location.origin !== 'null') {
                window.sessionStorage.setItem('adminToken', adminToken);
            }
        }, token);
    } catch {
        // page may still be at about:blank
    }
}
