import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Find an available ephemeral TCP port on 127.0.0.1.
 * @returns {Promise<number>}
 */
export function getFreePort() {
    return new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.unref();
        srv.on('error', reject);
        srv.listen(0, '127.0.0.1', () => {
            const addr = srv.address();
            const port = typeof addr === 'object' && addr ? addr.port : 0;
            srv.close((err) => {
                if (err) reject(err);
                else resolve(port);
            });
        });
    });
}

function resolveJwtSecret() {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) {
        return process.env.JWT_SECRET.trim();
    }
    const envPath = path.join(REPO_ROOT, '.env');
    if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
        if (parsed.JWT_SECRET && parsed.JWT_SECRET.trim()) {
            return parsed.JWT_SECRET.trim();
        }
    }
    return 'test-jwt-secret';
}

function killProcessTree(child) {
    if (!child || child.exitCode !== null || child.signalCode !== null) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (!settled) {
                settled = true;
                resolve();
            }
        };

        child.once('exit', finish);

        if (process.platform === 'win32' && child.pid) {
            try {
                spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
                    stdio: 'ignore',
                    windowsHide: true,
                });
            } catch {
                try {
                    child.kill('SIGKILL');
                } catch {
                    // ignore
                }
            }
        } else {
            try {
                child.kill('SIGTERM');
            } catch {
                // ignore
            }
            setTimeout(() => {
                if (child.exitCode === null && child.signalCode === null) {
                    try {
                        child.kill('SIGKILL');
                    } catch {
                        // ignore
                    }
                }
            }, 1000).unref();
        }

        setTimeout(finish, 3000).unref();
    });
}

async function removeDirWithRetry(dirPath, attempts = 8, delayMs = 150) {
    for (let i = 0; i < attempts; i++) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return;
        } catch (err) {
            if (i === attempts - 1) {
                throw err;
            }
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
}

async function waitForApiReady(apiUrl, child, getLogs, timeoutMs = 15000) {
    const start = Date.now();
    let lastError = '';

    while (Date.now() - start < timeoutMs) {
        if (child.exitCode !== null || child.signalCode !== null) {
            throw new Error(
                `API server exited early (code=${child.exitCode}, signal=${child.signalCode}).\nLogs:\n${getLogs()}`
            );
        }

        try {
            const res = await fetch(`${apiUrl}/api/server-time`);
            if (res.status === 200) {
                return;
            }
            lastError = `HTTP ${res.status}`;
        } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
        }

        await new Promise((r) => setTimeout(r, 150));
    }

    throw new Error(
        `Timed out waiting for API readiness at ${apiUrl}/api/server-time (${lastError}).\nLogs:\n${getLogs()}`
    );
}

/**
 * Start an isolated test environment with a copied SQLite DB (in os.tmpdir()),
 * an ephemeral Express API server (via tsx), and a programmatic Vite dev server.
 *
 * @param {object} [options]
 * @param {boolean} [options.copyDb=true]
 * @returns {Promise<{
 *   apiUrl: string,
 *   baseUrl: string,
 *   apiPort: number,
 *   vitePort: number,
 *   tempDbPath: string,
 *   tempDir: string,
 *   jwtSecret: string,
 *   close: () => Promise<void>
 * }>}
 */
export async function startTestEnv({ copyDb = true } = {}) {
    const apiPort = await getFreePort();
    const vitePort = await getFreePort();
    const jwtSecret = resolveJwtSecret();

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sd3-alumni-test-'));
    const tempDbPath = path.join(tempDir, 'dev.db');

    let apiChild = null;
    let viteServer = null;
    let closePromise = null;

    const close = () => {
        if (closePromise) return closePromise;
        closePromise = (async () => {
            if (viteServer) {
                try {
                    viteServer.httpServer?.closeAllConnections?.();
                    await viteServer.close();
                } catch {
                    // best effort
                }
                viteServer = null;
            }

            if (apiChild) {
                await killProcessTree(apiChild);
                apiChild = null;
            }

            if (fs.existsSync(tempDir)) {
                await removeDirWithRetry(tempDir);
            }
        })();
        return closePromise;
    };

    try {
        const sourceDbPath = path.join(REPO_ROOT, 'dev.db');
        if (copyDb) {
            fs.copyFileSync(sourceDbPath, tempDbPath);
        }

        const databaseUrl = `file:${copyDb ? tempDbPath : sourceDbPath}`;
        const tsxCli = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
        const logs = [];

        apiChild = spawn(process.execPath, [tsxCli, 'api/index.js'], {
            cwd: REPO_ROOT,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                NODE_ENV: 'local',
                CLASSIFIER_INTERVAL_MINUTES: '0',
                API_PORT: String(apiPort),
                PORT: String(apiPort),
                DATABASE_URL: databaseUrl,
                JWT_SECRET: jwtSecret,
            },
        });

        apiChild.stdout?.on('data', (chunk) => {
            logs.push(chunk.toString());
            if (logs.length > 100) logs.shift();
        });
        apiChild.stderr?.on('data', (chunk) => {
            logs.push(chunk.toString());
            if (logs.length > 100) logs.shift();
        });

        const apiUrl = `http://127.0.0.1:${apiPort}`;
        await waitForApiReady(apiUrl, apiChild, () => logs.join(''));

        const apiTarget = apiUrl;
        viteServer = await createViteServer({
            configFile: path.join(REPO_ROOT, 'vite.config.ts'),
            root: REPO_ROOT,
            cacheDir: path.join(tempDir, 'vite-cache'),
            mode: 'development',
            logLevel: 'silent',
            server: {
                host: '127.0.0.1',
                port: vitePort,
                strictPort: true,
                proxy: {
                    '/api': { target: apiTarget, changeOrigin: true },
                    '/uploads': { target: apiTarget, changeOrigin: true },
                    '/images': { target: apiTarget, changeOrigin: true },
                },
            },
        });

        await viteServer.listen();

        const baseUrl = `http://127.0.0.1:${vitePort}`;
        return {
            apiUrl,
            baseUrl,
            apiPort,
            vitePort,
            tempDbPath: copyDb ? tempDbPath : sourceDbPath,
            tempDir,
            jwtSecret,
            close,
        };
    } catch (err) {
        await close();
        throw err;
    }
}
