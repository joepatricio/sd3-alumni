import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma-client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { parseWhere, parseSort, numericFields } from './queryParser.js';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

// ==============================================================================
// ENVIRONMENT CONFIGURATION VALIDATION
// ==============================================================================
const envErrors = [];

// DATABASE_URL
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
    envErrors.push("DATABASE_URL is missing or empty.");
}

// API_PORT or PORT
const rawPort = process.env.API_PORT || process.env.PORT;
if (!rawPort || !/^\d+$/.test(String(rawPort).trim())) {
    envErrors.push(`API_PORT (or PORT) must be a valid integer between 1 and 65535. Received: "${rawPort}"`);
} else {
    const portNum = parseInt(String(rawPort).trim(), 10);
    if (portNum < 1 || portNum > 65535) {
        envErrors.push(`API_PORT out of range (1-65535). Received: ${portNum}`);
    }
}

// JWT_SECRET
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    envErrors.push("JWT_SECRET is missing or empty.");
}

// CLASSIFIER_INTERVAL_MINUTES (strictly an integer)
const rawClassifierInterval = process.env.CLASSIFIER_INTERVAL_MINUTES;
if (rawClassifierInterval === undefined || rawClassifierInterval === null || String(rawClassifierInterval).trim() === '') {
    envErrors.push("CLASSIFIER_INTERVAL_MINUTES is missing or empty. It must strictly be an integer.");
} else if (!/^-?\d+$/.test(String(rawClassifierInterval).trim())) {
    envErrors.push(`CLASSIFIER_INTERVAL_MINUTES must strictly be an integer. Received: "${rawClassifierInterval}"`);
}

// If interval > 0, classification is active; verify Cloudflare credentials
const parsedInterval = (rawClassifierInterval !== undefined && rawClassifierInterval !== null && /^-?\d+$/.test(String(rawClassifierInterval).trim()))
    ? parseInt(String(rawClassifierInterval).trim(), 10)
    : null;

if (parsedInterval !== null && parsedInterval > 0) {
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_ACCOUNT_ID.trim()) {
        envErrors.push("CLOUDFLARE_ACCOUNT_ID is required when CLASSIFIER_INTERVAL_MINUTES > 0.");
    }
    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_API_TOKEN.trim()) {
        envErrors.push("CLOUDFLARE_API_TOKEN is required when CLASSIFIER_INTERVAL_MINUTES > 0.");
    }
}

if (envErrors.length > 0) {
    console.error("\n=======================================================");
    console.error("FATAL: Environment configuration misconfigured!");
    for (const err of envErrors) {
        console.error(`  - ${err}`);
    }
    console.error("=======================================================\n");
    process.exit(1);
}

export const CLASSIFIER_INTERVAL_MINUTES = parsedInterval;

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
    timeout: 10000,
});
const basePrisma = new PrismaClient({ adapter });

(async () => {
    try {
        await basePrisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;');
        await basePrisma.$executeRawUnsafe('PRAGMA busy_timeout = 10000;');
    } catch (e) {
        console.warn("Could not set SQLite WAL mode / busy_timeout:", e.message);
    }
})();

const checkAndAwardAchievements = async (userId, stats) => {
    try {
        const achievements = await basePrisma.achievement.findMany();
        const getAch = (cat, tier) => achievements.find(a => a.achievementCategory === cat && a.achievementTier === tier);

        const award = async (ach) => {
            if (!ach) return;
            const existing = await basePrisma.userAchievement.findFirst({
                where: { userId: userId, achievementId: ach.id }
            });
            if (!existing) {
                await basePrisma.userAchievement.create({
                    data: {
                        userId: userId,
                        achievementId: ach.id,
                        achievementTier: ach.achievementTier,
                        achievedDate: new Date().toISOString()
                    }
                });
                console.log(`Awarded ${ach.achievementTitle} to ${userId}`);
            }
        };

        // The donatedAmount field is only a tally of public donations.
        // This logic still passes because there's an additional check in award() that 
        // checks if the achievement has already been awarded.
        if (stats.donatedAmount > 0) await award(getAch(2, 1));

        if (stats.eventsAttended >= 15) await award(getAch(3, 3));
        if (stats.eventsAttended >= 5) await award(getAch(3, 2));
        if (stats.eventsAttended >= 1) await award(getAch(3, 1));

        if (stats.bulletinsCreated >= 5) await award(getAch(4, 2));
        if (stats.bulletinsCreated >= 1) await award(getAch(4, 1));

        if (stats.commentsWritten >= 50) await award(getAch(5, 2));
        if (stats.commentsWritten >= 10) await award(getAch(5, 1));

        // Update achievements count in stats
        const userAchs = await basePrisma.userAchievement.count({ where: { userId: userId } });
        if (userAchs !== stats.achievements) {
            await basePrisma.userStatistic.update({
                where: { userId: userId },
                data: { achievements: userAchs }
            });
        }
    } catch (e) {
        console.error("Failed to check/award achievements:", e);
    }
};

const createNotification = async (tx, userId, message, link) => {
    try {
        let notifType = await tx.notificationType.findFirst({ where: { notificationTypeName: 'System' } });
        if (!notifType) {
            notifType = await tx.notificationType.create({ data: { notificationTypeName: 'System' } });
        }
        await tx.notification.create({
            data: {
                userId,
                notificationTypeId: notifType.id,
                notificationMessage: JSON.stringify({ text: message, link: link || null })
            }
        });
    } catch (e) {
        console.error("Failed to create notification:", e);
    }
};

export const prisma = basePrisma.$extends({
    query: {
        userStatistic: {
            async update({ args, query }) {
                const result = await query(args);
                if (result) {
                    checkAndAwardAchievements(result.userId, result).catch(console.error);
                }
                return result;
            }
        }
    }
});

const app = express();
app.set('trust proxy', 1); // Trust the reverse proxy to get the real client IP

// In production, serve the Vite frontend build (dist folder)
// Otherwise ngrok is used to tunnel traffic to localhost
if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
} else if (process.env.NODE_ENV === 'development') {
    async function forwardToApp() {
        const ngrok = await import("@ngrok/ngrok");
        const PROXY_PORT = process.env.PROXY_PORT;
        const forwarder = await ngrok.forward({
            addr: `127.0.0.1:${PROXY_PORT}`,
            authtoken_from_env: true,
            domain: "kabob-chasing-zap.ngrok-free.dev",
        });
        console.log(`[ngrok] Tunnel available at: ${forwarder.url()}:${PROXY_PORT}`);
    }
    forwardToApp().catch(console.error);
}

const PORT = process.env.API_PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// =======================
// SYSTEM CONFIGURATION
// =======================
// Suggested Rate Limits:
// Strict (Current): 5 auth attempts per 15 mins, 10 content creations per hr
// Moderate: 10 auth attempts per 15 mins, 30 content creations per hr
// Permissive: 20 auth attempts per 15 mins, 100 content creations per hr
const RATE_LIMIT_AUTH_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_CONTENT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_AUTH_MAX = 5;
const RATE_LIMIT_CONTENT_MAX = 10;

// Maximum number of registered users on the platform. 
// Set to Infinity to disable this limit.
const MAX_TOTAL_USERS = 100;

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
// Serve static uploads
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, 'upload-' + uniqueSuffix + ext)
    }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
        token = req.cookies?.token;
    }
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ error: 'Unauthorized: Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || user.role === 'admin') return res.status(403).json({ error: 'Forbidden: Regular user access required' });
        req.user = user;
        next();
    });
};

const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
        token = req.cookies?.adminToken;
    }
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, admin) => {
        if (err || admin.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        req.admin = admin;
        req.user = admin;
        next();
    });
};

const getAdminId = (req) => {
    if (req.admin?.id) return req.admin.id;
    if (req.user?.role === 'admin' && req.user.id) return req.user.id;
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
        token = req.cookies?.adminToken;
    }
    if (token && token !== 'null' && token !== 'undefined') {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded?.role === 'admin' && decoded.id) {
                return decoded.id;
            }
        } catch { }
    }
    return req.body?.adminId || null;
};


// =======================
// AUTH ROUTES & CUSTOM OVERRIDES
// =======================

const authLimiter = rateLimit({
    windowMs: RATE_LIMIT_AUTH_WINDOW_MS,
    max: RATE_LIMIT_AUTH_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

const contentLimiter = rateLimit({
    windowMs: RATE_LIMIT_CONTENT_WINDOW_MS,
    max: RATE_LIMIT_CONTENT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        // Limit by user ID if authenticated (either from decoded token in headers or req user object)
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
            token = req.cookies?.token || req.cookies?.adminToken;
        }
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && (decoded.id || decoded.userId)) {
                    return decoded.id || decoded.userId;
                }
            } catch (err) {
                // Ignore token errors here, fallback to IP
            }
        }
        return ipKeyGenerator(req, res);
    },
    message: { error: 'Too many content creation attempts, please try again later' }
});

app.post('/api/auth/check-email', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const existingUser = await prisma.userAuth.findUnique({
            where: { email }
        });

        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error("Check email failed:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const userAuth = await prisma.userAuth.findUnique({
            where: { email }
        });

        if (!userAuth) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        await prisma.userAuth.update({
            where: { email },
            data: { passwordHash }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Reset password failed:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User limits check and registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
    let { fullName, email, password, degreeProgram, batch, gender } = req.body;

    try {
        // Check user limit
        const userCount = await prisma.userAuth.count();
        if (userCount >= MAX_TOTAL_USERS) {
            return res.status(403).json({ error: 'Registrations are closed. The maximum number of users has been reached.' });
        }

        // Check if email already exists
        const existingUser = await prisma.userAuth.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Look up IDs for relations
        const pendingUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Pending' } });
        const defaultProfileStatus = await prisma.profileStatus.findFirst({ where: { statusName: 'Connections Only' } });

        let degreeId = null;
        if (degreeProgram) {
            const degree = await prisma.degree.findFirst({
                where: {
                    OR: [
                        { degreeName: { equals: degreeProgram } },
                        { degreeAbbr: { equals: degreeProgram } },
                        { degreeName: { contains: degreeProgram } },
                        { degreeAbbr: { contains: degreeProgram } }
                    ]
                }
            });
            if (degree) {
                degreeId = degree.id;
            } else {
                const firstDegree = await prisma.degree.findFirst();
                if (firstDegree) degreeId = firstDegree.id;
            }
        } else {
            const firstDegree = await prisma.degree.findFirst();
            if (firstDegree) degreeId = firstDegree.id;
        }

        if (!pendingUserStatus || !defaultProfileStatus) {
            return res.status(500).json({ error: 'Internal configuration error (missing statuses)' });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);
        const userId = uuidv4();

        // Gender
        if (!gender) {
            gender = null;
        }

        // Transaction to ensure atomic success with nested writes
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    profileStatusId: defaultProfileStatus.id,
                    userStatusId: pendingUserStatus.id,
                    auth: {
                        create: {
                            email,
                            passwordHash,
                        }
                    },
                    profile: {
                        create: {
                            userName: fullName,
                            email,
                            degreeId: degreeId,
                            batch: parseInt(batch, 10) || null,
                            profileImage: "/uploads/engineer.png",
                            gender: gender
                        }
                    },
                    statistics: {
                        create: {}
                    },
                    records: {
                        create: {
                            userStatusId: pendingUserStatus.id,
                            description: "User registered",
                            adminId: null
                        }
                    }
                },
                include: {
                    records: true
                }
            });

            const record = newUser.records[0];

            // Link Record back to User
            await tx.user.update({
                where: { id: userId },
                data: { currentRecordId: record.id }
            });
        });

        // Trigger immediate background auto-approval for newly registered user if enabled
        if (CLASSIFIER_INTERVAL_MINUTES > 0) {
            setImmediate(() => {
                autoApprovePendingUsers().catch(err => console.error("Immediate auto-approval failed:", err));
            });
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Custom Auth Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { email, password, rememberMe } = req.body;
    try {
        const userAuth = await prisma.userAuth.findFirst({
            where: { email },
            include: {
                user: {
                    include: {
                        profile: true,
                        userStatus: true
                    }
                }
            }
        });

        if (!userAuth) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, userAuth.passwordHash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (userAuth.user?.userStatus?.statusName === 'Banned') {
            return res.status(403).json({ error: 'Your account has been banned' });
        }

        if (userAuth.user?.userStatus?.statusName === 'Pending') {
            return res.status(403).json({ error: 'Your account is pending admin approval' });
        }

        await prisma.userAuth.update({
            where: { userId: userAuth.userId },
            data: { lastLogin: new Date() }
        });

        // X-Year Club Check
        const userStats = await prisma.userStatistic.findFirst({ where: { userId: userAuth.userId } });
        if (userStats && userStats.dateRegistered) {
            const dateRegistered = new Date(userStats.dateRegistered);
            const now = new Date();
            const diffYears = (now - dateRegistered) / (1000 * 60 * 60 * 24 * 365.25);

            const achievements = await prisma.achievement.findMany();
            const getAch = (cat, tier) => achievements.find(a => a.achievementCategory === cat && a.achievementTier === tier);

            const award = async (ach) => {
                if (!ach) return;
                const existing = await prisma.userAchievement.findFirst({
                    where: { userId: userAuth.userId, achievementId: ach.id }
                });
                if (!existing) {
                    await prisma.userAchievement.create({
                        data: {
                            userId: userAuth.userId,
                            achievementId: ach.id,
                            achievementTier: ach.achievementTier,
                            achievedDate: new Date().toISOString()
                        }
                    });
                }
            };

            if (diffYears >= 10) await award(getAch(1, 3));
            if (diffYears >= 3) await award(getAch(1, 2));
            if (diffYears >= 1) await award(getAch(1, 1));
        }

        const token = jwt.sign(
            { id: userAuth.user.id, email: userAuth.email },
            JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '24h' }
        );

        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {})
        };

        res.cookie('token', token, cookieOptions);

        res.json({
            token,
            user: {
                id: userAuth.user.id,
                email: userAuth.email,
                profileId: userAuth.user.profile?.userId,
                name: userAuth.user.profile?.userName,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Custom Admin Login
app.post('/api/auth/admin/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() }
        });

        const token = jwt.sign(
            { id: admin.id, role: 'admin', username: admin.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('adminToken', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        res.json({ token, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Logout
app.post('/api/auth/admin/logout', (req, res) => {
    res.clearCookie('adminToken', { path: '/' });
    res.json({ message: 'Admin logged out successfully' });
});

// User Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'User logged out successfully' });
});

// Admin Session Validation
app.get('/api/auth/admin/me', authenticateAdminToken, (req, res) => {
    res.json({
        admin: {
            id: req.admin.id,
            username: req.admin.username
        }
    });
});

// Get current user profile for auth validation
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                profile: true,
                userStatus: true,
                profileStatus: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.userStatus?.statusName === 'Banned' || user.userStatus?.statusName === 'Pending') {
            return res.status(403).json({ error: 'Account is not active' });
        }

        res.json({
            id: user.id,
            email: req.user.email,
            profileId: user.profile?.userId,
            name: user.profile?.userName,
            userStatus: user.userStatus,
            profileStatus: user.profileStatus,
            profile: user.profile
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Custom Connection Acceptance/Action Route
app.post('/api/connections/action', authenticateToken, async (req, res) => {
    const { action, currentUserId, profileId } = req.body;
    try {
        const c1 = await prisma.userConnection.findFirst({
            where: { userId: currentUserId, friendId: profileId }
        });
        const c2 = await prisma.userConnection.findFirst({
            where: { userId: profileId, friendId: currentUserId }
        });

        const connStatuses = await prisma.connectionStatus.findMany();
        const reverseLookup = (name) => connStatuses.find(s => s.connectionName === name)?.id;

        const acceptedCode = reverseLookup('Accepted');
        const requestingCode = reverseLookup('Requesting');
        const requestedCode = reverseLookup('Requested');
        const blockingCode = reverseLookup('Blocking');
        const blockedCode = reverseLookup('Blocked');

        const wasAccepted = c1?.connectionStatusId === acceptedCode;
        let newCount = undefined;

        if (action === 'add') {
            await prisma.$transaction(async (tx) => {
                const txc1 = await tx.userConnection.findFirst({ where: { userId: currentUserId, friendId: profileId } });
                const txc2 = await tx.userConnection.findFirst({ where: { userId: profileId, friendId: currentUserId } });
                if (txc1 || txc2) return; // Prevent duplicate

                await tx.userConnection.create({ data: { userId: currentUserId, friendId: profileId, connectionStatusId: requestingCode } });
                await tx.userConnection.create({ data: { userId: profileId, friendId: currentUserId, connectionStatusId: requestedCode } });
            });
            return res.json({ newStatusName: 'Requesting', statsUpdated: false });
        }
        else if (action === 'accept') {
            await prisma.$transaction(async (tx) => {
                const txc1 = await tx.userConnection.findFirst({ where: { userId: currentUserId, friendId: profileId } });
                const txc2 = await tx.userConnection.findFirst({ where: { userId: profileId, friendId: currentUserId } });

                if (!txc1 || !txc2) return;
                if (txc1.connectionStatusId === acceptedCode) return; // Already accepted

                // Use updateMany for atomic check-and-update to prevent race conditions
                const update1 = await tx.userConnection.updateMany({
                    where: { id: txc1.id, connectionStatusId: { not: acceptedCode } },
                    data: { connectionStatusId: acceptedCode }
                });
                const update2 = await tx.userConnection.updateMany({
                    where: { id: txc2.id, connectionStatusId: { not: acceptedCode } },
                    data: { connectionStatusId: acceptedCode }
                });

                // If no records were updated, another request already processed this
                if (update1.count === 0 && update2.count === 0) return;

                const s1 = await tx.userStatistic.findFirst({ where: { userId: currentUserId } });
                const s2 = await tx.userStatistic.findFirst({ where: { userId: profileId } });

                if (s1) {
                    newCount = (s1.userConnections || 0) + 1;
                    await tx.userStatistic.update({ where: { userId: currentUserId }, data: { userConnections: newCount } });
                }
                if (s2) {
                    await tx.userStatistic.update({ where: { userId: profileId }, data: { userConnections: (s2.userConnections || 0) + 1 } });
                }
            });
            return res.json({ newStatusName: 'Accepted', statsUpdated: true, newConnectionsCount: newCount });
        }
        else if (action === 'reject' || action === 'remove' || action === 'unblock') {
            await prisma.$transaction(async (tx) => {
                const txc1 = await tx.userConnection.findFirst({ where: { userId: currentUserId, friendId: profileId } });
                const txc2 = await tx.userConnection.findFirst({ where: { userId: profileId, friendId: currentUserId } });

                if (!txc1 && !txc2) return;

                let deleted1 = 0;
                let deleted2 = 0;
                if (txc1) {
                    const res = await tx.userConnection.deleteMany({ where: { id: txc1.id } });
                    deleted1 = res.count;
                }
                if (txc2) {
                    const res = await tx.userConnection.deleteMany({ where: { id: txc2.id } });
                    deleted2 = res.count;
                }

                if (deleted1 === 0 && deleted2 === 0) return;

                const txcWasAccepted = txc1?.connectionStatusId === acceptedCode;
                if (action === 'remove' && txcWasAccepted) {
                    const s1 = await tx.userStatistic.findFirst({ where: { userId: currentUserId } });
                    const s2 = await tx.userStatistic.findFirst({ where: { userId: profileId } });

                    if (s1 && s1.userConnections > 0) {
                        newCount = s1.userConnections - 1;
                        await tx.userStatistic.update({ where: { userId: currentUserId }, data: { userConnections: newCount } });
                    }
                    if (s2 && s2.userConnections > 0) {
                        await tx.userStatistic.update({ where: { userId: profileId }, data: { userConnections: s2.userConnections - 1 } });
                    }
                }
            });
            return res.json({ newStatusName: null, statsUpdated: action === 'remove' && wasAccepted, newConnectionsCount: newCount });
        }
        else if (action === 'block') {
            await prisma.$transaction(async (tx) => {
                const txc1 = await tx.userConnection.findFirst({ where: { userId: currentUserId, friendId: profileId } });
                const txc2 = await tx.userConnection.findFirst({ where: { userId: profileId, friendId: currentUserId } });

                if (txc1?.connectionStatusId === blockingCode) return; // Already blocking

                if (txc1) await tx.userConnection.update({ where: { id: txc1.id }, data: { connectionStatusId: blockingCode } });
                else await tx.userConnection.create({ data: { userId: currentUserId, friendId: profileId, connectionStatusId: blockingCode } });

                if (txc2) await tx.userConnection.update({ where: { id: txc2.id }, data: { connectionStatusId: blockedCode } });
                else await tx.userConnection.create({ data: { userId: profileId, friendId: currentUserId, connectionStatusId: blockedCode } });

                const txcWasAccepted = txc1?.connectionStatusId === acceptedCode;
                if (txcWasAccepted) {
                    const s1 = await tx.userStatistic.findFirst({ where: { userId: currentUserId } });
                    const s2 = await tx.userStatistic.findFirst({ where: { userId: profileId } });

                    if (s1 && s1.userConnections > 0) {
                        newCount = s1.userConnections - 1;
                        await tx.userStatistic.update({ where: { userId: currentUserId }, data: { userConnections: newCount } });
                    }
                    if (s2 && s2.userConnections > 0) {
                        await tx.userStatistic.update({ where: { userId: profileId }, data: { userConnections: s2.userConnections - 1 } });
                    }
                }
            });
            return res.json({ newStatusName: 'Blocking', statsUpdated: wasAccepted, newConnectionsCount: newCount });
        }

        res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Connection action failed' });
    }
});


// Custom Event Conclude Logic
const concludeEvent = async (eventId) => {
    try {
        const eventStatuses = await prisma.eventStatus.findMany();
        const concludedStatus = eventStatuses.find(s => s.statusName === 'Concluded');
        if (!concludedStatus) return;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { rsvps: true }
        });

        if (!event || event.eventStatusId === concludedStatus.id) return;

        await prisma.$transaction(async (tx) => {
            await tx.event.update({
                where: { id: eventId },
                data: { eventStatusId: concludedStatus.id }
            });

            await tx.userRsvp.updateMany({
                where: {
                    eventId: eventId,
                    isAttending: true
                },
                data: {
                    isValid: true
                }
            });

            const validRsvps = await tx.userRsvp.findMany({
                where: {
                    eventId: eventId,
                    isValid: true
                }
            });

            for (const rsvp of validRsvps) {
                const stat = await tx.userStatistic.findFirst({ where: { userId: rsvp.userId } });
                if (stat) {
                    await tx.userStatistic.update({
                        where: { userId: rsvp.userId },
                        data: { eventsAttended: (stat.eventsAttended || 0) + 1 }
                    });
                }
            }

            const link = `/events/${eventId}`;
            await createNotification(tx, event.authorId, `Your event "${event.title}" status changed to Concluded.`, link);
            for (const rsvp of validRsvps) {
                if (rsvp.userId !== event.authorId) {
                    await createNotification(tx, rsvp.userId, `An event you RSVP'd to ("${event.title}") changed status to Concluded.`, link);
                }
            }
        });
        console.log(`Event ${eventId} concluded.`);
    } catch (err) {
        console.error(`Failed to conclude event ${eventId}:`, err);
    }
};

app.post('/api/events/:id/conclude', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await concludeEvent(id);
        res.json({ message: 'Event concluded successfully.' });
    } catch (error) {
        console.error("Error in concluding event: " + error);
        res.status(500).json({ error: 'Failed to conclude event' });
    }
});

const setupWatchdog = () => {
    const runWatchdog = async () => {
        try {
            console.log("Running midnight event watchdog...");
            const eventStatuses = await prisma.eventStatus.findMany();
            const concludedStatus = eventStatuses.find(s => s.statusName === 'Concluded');
            if (!concludedStatus) return;

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const eventsToConclude = await prisma.event.findMany({
                where: {
                    eventStatusId: { not: concludedStatus.id },
                    eventDate: { lte: oneDayAgo }
                }
            });

            for (const event of eventsToConclude) {
                await concludeEvent(event.id);
            }
        } catch (e) {
            console.error("Watchdog error:", e);
        }
        scheduleNextWatchdog();
    };

    const scheduleNextWatchdog = () => {
        const now = new Date();
        const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
        const timeToNextMidnight = nextMidnight.getTime() - now.getTime();
        setTimeout(runWatchdog, timeToNextMidnight);
    };

    scheduleNextWatchdog();
};
setupWatchdog();


// =======================
// ADMIN ROUTES (SECURE)
// =======================

// Admin GET Events
app.get('/api/admin/events', authenticateAdminToken, async (req, res) => {
    try {
        const where = parseWhere(req.query, 'event');
        const orderBy = parseSort(req.query._sort);
        const page = req.query._page ? parseInt(req.query._page, 10) : undefined;
        const perPage = req.query._per_page ? parseInt(req.query._per_page, 10) : undefined;

        let queryArgs = {
            where,
            orderBy,
            include: { location: true, status: true, category: true, author: { include: { profile: true, userStatus: true } } }
        };

        if (page !== undefined && perPage !== undefined) {
            queryArgs.skip = (page - 1) * perPage;
            queryArgs.take = perPage;
            const [events, totalItems] = await Promise.all([
                prisma.event.findMany(queryArgs),
                prisma.event.count({ where })
            ]);
            res.json({
                first: 1,
                prev: page > 1 ? page - 1 : null,
                next: page * perPage < totalItems ? page + 1 : null,
                last: Math.ceil(totalItems / perPage),
                pages: Math.ceil(totalItems / perPage),
                items: totalItems,
                data: formatOutput('event', events)
            });
        } else {
            const events = await prisma.event.findMany(queryArgs);
            res.json(formatOutput('event', events));
        }
    } catch (error) {
        console.error('Failed to fetch admin events:', error);
        res.status(500).json({ error: 'Failed to fetch admin events' });
    }
});

// Helper function to prepare and resolve Event data for create/update
async function resolveEventData(body, isUpdate = false, existingEvent = null, req = null) {
    const data = { ...body };
    // Resolve Author ID if creating
    if (!isUpdate && !data.authorId) {
        if (req) {
            const authHeader = req.headers['authorization'];
            let token = authHeader && authHeader.split(' ')[1];
            if (!token || token === 'null' || token === 'undefined') {
                token = req.cookies?.token || req.cookies?.adminToken;
            }
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded) {
                        if (decoded.role === 'admin') {
                            if (!data.adminId) data.adminId = decoded.id;
                        } else if (decoded.id || decoded.userId) {
                            data.authorId = decoded.id || decoded.userId;
                        }
                    }
                } catch (err) {
                    console.error('Failed to verify token in resolveEventData: ', err);
                }
            }
        }
        if (!data.authorId) {
            const existingUser = await prisma.user.findFirst({
                where: { userStatus: { statusName: 'Official' } }
            }) || await prisma.user.findFirst();
            if (existingUser) data.authorId = existingUser.id;
        }
    } else if (isUpdate) {
        delete data.authorId;
    }

    // Format times and dates
    if (data.startTime && typeof data.startTime === 'string') data.startTime = data.startTime.substring(0, 5);
    if (data.endTime && typeof data.endTime === 'string') data.endTime = data.endTime.substring(0, 5);
    if (data.eventDate && typeof data.eventDate === 'string') {
        if (data.eventDate.includes('T')) {
            data.eventDate = data.eventDate.split('T')[0] + 'T00:00:00.000Z';
        } else {
            data.eventDate = new Date(data.eventDate + 'T00:00:00.000Z').toISOString();
        }
    }

    // Resolve EventCategory
    const categoryInput = data.eventCategoryId || data.category;
    if (categoryInput) {
        const catRecord = await prisma.eventCategory.findFirst({
            where: {
                OR: [
                    { id: String(categoryInput) },
                    { eventCategoryName: String(categoryInput) }
                ]
            }
        });
        if (catRecord) {
            data.eventCategoryId = catRecord.id;
        }
        delete data.category;
    }

    // Handle nested location
    if (data.location && typeof data.location === 'object') {
        const loc = data.location;
        const locData = {
            regionCode: loc.regionCode || null,
            province: loc.province || null,
            provinceCode: loc.provinceCode || null,
            cityMunicipality: loc.cityMunicipality || null,
            cityCode: loc.cityCode || null,
            barangay: loc.barangay || null,
            landmark: loc.landmark || null,
            street: loc.street || null,
            lat: typeof loc.lat === 'number' ? loc.lat : (loc.lat ? parseFloat(loc.lat) : null),
            lng: typeof loc.lng === 'number' ? loc.lng : (loc.lng ? parseFloat(loc.lng) : null),
        };

        let targetLocationId = existingEvent?.locationId;
        if (isUpdate && targetLocationId) {
            await prisma.location.update({
                where: { id: targetLocationId },
                data: locData
            });
        } else {
            const newLoc = await prisma.location.create({ data: locData });
            data.locationId = newLoc.id;
        }
        delete data.location;
    }

    // Resolve EventStatus
    if (data.status) {
        const statusRecord = await prisma.eventStatus.findFirst({
            where: {
                OR: [
                    { id: String(data.status) },
                    { statusName: String(data.status) }
                ]
            }
        });
        if (statusRecord) {
            data.eventStatusId = statusRecord.id;
        }
        delete data.status;
    } else if (!isUpdate && !data.eventStatusId) {
        const defaultStatus = await prisma.eventStatus.findFirst({ where: { statusName: 'Pending' } });
        if (defaultStatus) data.eventStatusId = defaultStatus.id;
    }

    // Handle image mapping
    if (data.image && !data.eventImage) {
        data.eventImage = data.image;
    }
    delete data.image;

    if (req && !data.adminId) {
        const extractedAdminId = getAdminId(req);
        if (extractedAdminId) data.adminId = extractedAdminId;
    }

    // Remove non-scalar or relation fields
    delete data.id;
    delete data.author;
    delete data.rsvps;
    delete data.admin;
    delete data.type;
    delete data.isOfficial;
    delete data.rawDate;

    return data;
}

// Helper function to prepare and resolve Bulletin data for create/update
async function resolveBulletinData(body, isUpdate = false, req = null) {
    const data = { ...body };
    // Resolve Author ID if creating
    if (!isUpdate && !data.authorId) {
        if (req) {
            const authHeader = req.headers['authorization'];
            let token = authHeader && authHeader.split(' ')[1];
            if (!token || token === 'null' || token === 'undefined') {
                token = req.cookies?.token || req.cookies?.adminToken;
            }
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded) {
                        if (decoded.role === 'admin') {
                            if (!data.adminId) data.adminId = decoded.id;
                        } else if (decoded.id || decoded.userId) {
                            data.authorId = decoded.id || decoded.userId;
                        }
                    }
                } catch (err) {
                    console.error('Failed to verify token in resolveBulletinData: ', err);
                }
            }
        }
        if (!data.authorId) {
            const existingUser = await prisma.user.findFirst({
                where: { userStatus: { statusName: 'Official' } }
            }) || await prisma.user.findFirst();
            if (existingUser) data.authorId = existingUser.id;
        }
    } else if (isUpdate) {
        delete data.authorId;
    }

    if (data.image && !data.bulletinImage) {
        data.bulletinImage = data.image;
    }
    delete data.image;

    // Resolve BulletinCategory
    const categoryInput = data.bulletinCategoryId || data.category;
    if (categoryInput) {
        const catRecord = await prisma.bulletinCategory.findFirst({
            where: {
                OR: [
                    { id: String(categoryInput) },
                    { bulletinCategoryName: String(categoryInput) }
                ]
            }
        });
        if (catRecord) {
            data.bulletinCategoryId = catRecord.id;
        }
        delete data.category;
    }

    if (!data.bulletinCategoryId && !isUpdate) {
        const defaultCat = await prisma.bulletinCategory.findFirst({ where: { bulletinCategoryName: 'Announcements' } })
            || await prisma.bulletinCategory.findFirst();
        if (defaultCat) data.bulletinCategoryId = defaultCat.id;
    }

    // Resolve ContentStatus
    if (data.status) {
        const statusRecord = await prisma.contentStatus.findFirst({
            where: {
                OR: [
                    { id: String(data.status) },
                    { statusName: String(data.status) }
                ]
            }
        });
        if (statusRecord) {
            data.contentStatusId = statusRecord.id;
        }
        delete data.status;
    } else if (!isUpdate && !data.contentStatusId) {
        const defaultStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Pending' } });
        if (defaultStatus) data.contentStatusId = defaultStatus.id;
    }

    if (data.content && typeof data.content === 'string') {
        data.readTimeMinutes = Math.max(1, Math.ceil(data.content.length / 1000));
    } else if (data.readTimeMinutes !== undefined && data.readTimeMinutes !== null) {
        data.readTimeMinutes = parseInt(data.readTimeMinutes, 10) || 5;
    } else {
        data.readTimeMinutes = 5;
    }

    if (req && !data.adminId) {
        const extractedAdminId = getAdminId(req);
        if (extractedAdminId) data.adminId = extractedAdminId;
    }

    // Remove non-scalar or relation fields
    delete data.id;
    delete data.author;
    delete data.admin;
    delete data.likes;
    delete data.comments;
    delete data.type;
    delete data.isOfficial;
    delete data.rawDate;

    return data;
}

// Admin Update Event Status
const handleAdminUpdateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const effectiveAdminId = getAdminId(req);
        const updatedEvent = await updateEventStatusAndStats({
            eventId: id,
            newStatusName: status,
            adminId: effectiveAdminId
        });
        if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });

        res.json(formatOutput('event', updatedEvent));
    } catch (error) {
        console.error('Failed to update event status:', error);
        res.status(500).json({ error: 'Failed to update event status' });
    }
};
app.patch('/api/admin/events/:id/status', authenticateAdminToken, handleAdminUpdateEventStatus);
app.post('/api/admin/events/:id/status', authenticateAdminToken, handleAdminUpdateEventStatus);
app.put('/api/admin/events/:id/status', authenticateAdminToken, handleAdminUpdateEventStatus);

// Admin POST Event
app.post('/api/admin/events', authenticateAdminToken, contentLimiter, async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({
            where: { userStatus: { statusName: 'Official' } }
        }) || await prisma.user.findFirst();

        const authorId = req.body.authorId || existingUser?.id;
        if (!authorId) return res.status(400).json({ error: 'Author user not found' });

        const effectiveAdminId = getAdminId(req);
        const eventData = await resolveEventData({
            ...req.body,
            authorId,
            adminId: effectiveAdminId,
            reviewDate: new Date()
        }, false);

        const newEvent = await prisma.event.create({
            data: eventData,
            include: defaultIncludes['event']
        });

        const statusRec = await prisma.eventStatus.findUnique({ where: { id: newEvent.eventStatusId } });
        if (statusRec && ['Approved', 'Concluded'].includes(statusRec.statusName)) {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { eventsCreated: { increment: 1 } }
                });
            }
        }

        res.status(201).json(formatOutput('event', newEvent));
    } catch (error) {
        console.error('Failed to create admin event:', error);
        res.status(500).json({ error: 'Failed to create admin event' });
    }
});

// Admin PATCH Event
const handleAdminUpdateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const existingEvent = await prisma.event.findUnique({ where: { id } });
        if (!existingEvent) return res.status(404).json({ error: 'Event not found' });

        const eventData = await resolveEventData(req.body, true, existingEvent);
        const effectiveAdminId = getAdminId(req);
        const newStatusName = req.body.status || req.body.statusName;

        const updatedEvent = await updateEventStatusAndStats({
            eventId: id,
            newStatusName,
            adminId: effectiveAdminId,
            additionalData: eventData
        });

        res.json(formatOutput('event', updatedEvent));
    } catch (error) {
        console.error('Failed to update admin event:', error);
        res.status(500).json({ error: 'Failed to update admin event' });
    }
};
app.patch('/api/admin/events/:id', authenticateAdminToken, handleAdminUpdateEvent);
app.put('/api/admin/events/:id', authenticateAdminToken, handleAdminUpdateEvent);

// Admin GET Bulletins
app.get('/api/admin/bulletins', authenticateAdminToken, async (req, res) => {
    try {
        const where = parseWhere(req.query, 'bulletin');
        const orderBy = parseSort(req.query._sort);
        const page = req.query._page ? parseInt(req.query._page, 10) : undefined;
        const perPage = req.query._per_page ? parseInt(req.query._per_page, 10) : undefined;

        let queryArgs = {
            where,
            orderBy,
            include: { status: true, author: { include: { profile: true, userStatus: true } }, category: true }
        };

        if (page !== undefined && perPage !== undefined) {
            queryArgs.skip = (page - 1) * perPage;
            queryArgs.take = perPage;
            const [bulletins, totalItems] = await Promise.all([
                prisma.bulletin.findMany(queryArgs),
                prisma.bulletin.count({ where })
            ]);
            res.json({
                first: 1,
                prev: page > 1 ? page - 1 : null,
                next: page * perPage < totalItems ? page + 1 : null,
                last: Math.ceil(totalItems / perPage),
                pages: Math.ceil(totalItems / perPage),
                items: totalItems,
                data: formatOutput('bulletin', bulletins)
            });
        } else {
            const bulletins = await prisma.bulletin.findMany(queryArgs);
            res.json(formatOutput('bulletin', bulletins));
        }
    } catch (error) {
        console.error('Failed to fetch admin bulletins:', error);
        res.status(500).json({ error: 'Failed to fetch admin bulletins' });
    }
});

// Helper to update event status, admin audit info (adminId, reviewDate), and userStatistics eventsCreated count
async function updateEventStatusAndStats({ eventId, newStatusName, adminId, additionalData = {} }) {
    return await prisma.$transaction(async (tx) => {
        const existing = await tx.event.findUnique({
            where: { id: eventId },
            include: { status: true }
        });
        if (!existing) return null;

        const previousStatus = existing.status?.statusName;
        const authorId = existing.authorId;

        const updateData = { ...additionalData };

        if (adminId) {
            updateData.adminId = adminId;
        }
        updateData.reviewDate = new Date();

        if (newStatusName) {
            const statusRecord = await tx.eventStatus.findFirst({
                where: {
                    OR: [
                        { id: String(newStatusName) },
                        { statusName: String(newStatusName) }
                    ]
                }
            });
            if (statusRecord) {
                updateData.eventStatusId = statusRecord.id;
            }
        }

        const updatedEvent = await tx.event.update({
            where: { id: eventId },
            data: updateData,
            include: defaultIncludes['event']
        });

        const currentStatusRecord = await tx.eventStatus.findUnique({
            where: { id: updatedEvent.eventStatusId }
        });
        const updatedStatusName = currentStatusRecord?.statusName || newStatusName;

        if (authorId && previousStatus && updatedStatusName && previousStatus !== updatedStatusName) {
            const validStatuses = ['Approved', 'Concluded'];
            const isNowValid = validStatuses.includes(updatedStatusName);
            const wasValid = validStatuses.includes(previousStatus);

            if (isNowValid && !wasValid) {
                const userStats = await tx.userStatistic.findFirst({ where: { userId: authorId } });
                if (userStats) {
                    await tx.userStatistic.update({
                        where: { userId: userStats.userId },
                        data: { eventsCreated: { increment: 1 } }
                    });
                }
            } else if (wasValid && !isNowValid) {
                const userStats = await tx.userStatistic.findFirst({ where: { userId: authorId } });
                if (userStats && userStats.eventsCreated > 0) {
                    await tx.userStatistic.update({
                        where: { userId: userStats.userId },
                        data: { eventsCreated: { decrement: 1 } }
                    });
                }
            }

            const link = (updatedStatusName === 'Archived') ? null : `/events/${eventId}`;
            await createNotification(tx, authorId, `Your event "${existing.title}" status changed to ${updatedStatusName}.`, link);

            const rsvps = await tx.userRsvp.findMany({ where: { eventId, isAttending: true } });
            for (const rsvp of rsvps) {
                if (rsvp.userId !== authorId) {
                    await createNotification(tx, rsvp.userId, `An event you RSVP'd to ("${existing.title}") changed status to ${updatedStatusName}.`, link);
                }
            }
        }

        return updatedEvent;
    });
}

// Helper to update bulletin status, admin audit info (adminId, reviewDate), and userStatistics bulletinsCreated count
async function updateBulletinStatusAndStats({ bulletinId, newStatusName, adminId, additionalData = {} }) {
    return await prisma.$transaction(async (tx) => {
        const existing = await tx.bulletin.findUnique({
            where: { id: bulletinId },
            include: { status: true }
        });
        if (!existing) return null;

        const previousStatus = existing.status?.statusName;
        const authorId = existing.authorId;

        const updateData = { ...additionalData };

        if (adminId) {
            updateData.adminId = adminId;
        }
        updateData.reviewDate = new Date();

        if (newStatusName) {
            const statusRecord = await tx.contentStatus.findFirst({
                where: {
                    OR: [
                        { id: String(newStatusName) },
                        { statusName: String(newStatusName) }
                    ]
                }
            });
            if (statusRecord) {
                updateData.contentStatusId = statusRecord.id;
            }
        }

        const updatedBulletin = await tx.bulletin.update({
            where: { id: bulletinId },
            data: updateData,
            include: defaultIncludes['bulletin']
        });

        const currentStatusRecord = await tx.contentStatus.findUnique({
            where: { id: updatedBulletin.contentStatusId }
        });
        const updatedStatusName = currentStatusRecord?.statusName || newStatusName;

        if (authorId && previousStatus && updatedStatusName && previousStatus !== updatedStatusName) {
            const isNowApproved = updatedStatusName === 'Approved';
            const wasApproved = previousStatus === 'Approved';

            if (isNowApproved && !wasApproved) {
                const userStats = await tx.userStatistic.findFirst({ where: { userId: authorId } });
                if (userStats) {
                    await tx.userStatistic.update({
                        where: { userId: userStats.userId },
                        data: { bulletinsCreated: { increment: 1 } }
                    });
                }
            } else if (wasApproved && !isNowApproved) {
                const userStats = await tx.userStatistic.findFirst({ where: { userId: authorId } });
                if (userStats && userStats.bulletinsCreated > 0) {
                    await tx.userStatistic.update({
                        where: { userId: userStats.userId },
                        data: { bulletinsCreated: { decrement: 1 } }
                    });
                }
            }

            const link = `/bulletin/${bulletinId}`;
            await createNotification(tx, authorId, `Your bulletin "${existing.title}" status changed to ${updatedStatusName}.`, link);
        }

        return updatedBulletin;
    });
}

// Admin Update Bulletin Status
const handleAdminUpdateBulletinStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const effectiveAdminId = getAdminId(req);
        const updatedBulletin = await updateBulletinStatusAndStats({
            bulletinId: id,
            newStatusName: status,
            adminId: effectiveAdminId
        });
        if (!updatedBulletin) return res.status(404).json({ error: 'Bulletin not found' });

        res.json(formatOutput('bulletin', updatedBulletin));
    } catch (error) {
        console.error('Failed to update bulletin status:', error);
        res.status(500).json({ error: 'Failed to update bulletin status' });
    }
};
app.patch('/api/admin/bulletins/:id/status', authenticateAdminToken, handleAdminUpdateBulletinStatus);
app.post('/api/admin/bulletins/:id/status', authenticateAdminToken, handleAdminUpdateBulletinStatus);
app.put('/api/admin/bulletins/:id/status', authenticateAdminToken, handleAdminUpdateBulletinStatus);

// Admin POST Bulletin
app.post('/api/admin/bulletins', authenticateAdminToken, contentLimiter, async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({
            where: { userStatus: { statusName: 'Official' } }
        }) || await prisma.user.findFirst();

        const authorId = req.body.authorId || existingUser?.id;
        if (!authorId) return res.status(400).json({ error: 'Author user not found' });

        const effectiveAdminId = getAdminId(req);
        const bulletinData = await resolveBulletinData({
            ...req.body,
            authorId,
            adminId: effectiveAdminId,
            reviewDate: new Date()
        }, false);

        const newBulletin = await prisma.bulletin.create({
            data: bulletinData,
            include: defaultIncludes['bulletin']
        });

        const statusRec = await prisma.contentStatus.findUnique({ where: { id: newBulletin.contentStatusId } });
        if (statusRec?.statusName === 'Approved') {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { bulletinsCreated: { increment: 1 } }
                });
            }
        }

        res.status(201).json(formatOutput('bulletin', newBulletin));
    } catch (error) {
        console.error('Failed to create admin bulletin:', error);
        res.status(500).json({ error: 'Failed to create admin bulletin' });
    }
});

// Admin PATCH/PUT Bulletin
const handleAdminUpdateBulletin = async (req, res) => {
    try {
        const { id } = req.params;
        const existingBulletin = await prisma.bulletin.findUnique({ where: { id } });
        if (!existingBulletin) return res.status(404).json({ error: 'Bulletin not found' });

        const bulletinData = await resolveBulletinData(req.body, true);
        const effectiveAdminId = getAdminId(req);
        const newStatusName = req.body.status || req.body.statusName;

        const updatedBulletin = await updateBulletinStatusAndStats({
            bulletinId: id,
            newStatusName,
            adminId: effectiveAdminId,
            additionalData: bulletinData
        });

        res.json(formatOutput('bulletin', updatedBulletin));
    } catch (error) {
        console.error('Failed to update admin bulletin:', error);
        res.status(500).json({ error: 'Failed to update admin bulletin' });
    }
};
app.patch('/api/admin/bulletins/:id', authenticateAdminToken, handleAdminUpdateBulletin);
app.put('/api/admin/bulletins/:id', authenticateAdminToken, handleAdminUpdateBulletin);

// Admin GET Dashboard Stats
app.get('/api/admin/dashboard-stats', authenticateAdminToken, async (req, res) => {
    const RECENT_ACTIVITY_LENGTH = 24;
    try {
        const [
            pendingUsersCount,
            officialUsersCount,
            regularUsersCount,
            suspendedUsersCount,
            bannedUsersCount,
            disabledUsersCount,
            totalUsersCount,
            pendingBulletinsCount,
            flaggedBulletinsCount,
            pendingEventsCount,
            approvedEventsCount,
            completedDonations,
            recentUsers,
            recentBulletins,
            recentEvents,
            recentDonations,
            allProfiles
        ] = await Promise.all([
            prisma.user.count({ where: { userStatus: { statusName: 'Pending' } } }),
            prisma.user.count({ where: { userStatus: { statusName: 'Official' } } }),
            prisma.user.count({ where: { userStatus: { statusName: 'Regular' } } }),
            prisma.user.count({ where: { userStatus: { statusName: 'Suspended' } } }),
            prisma.user.count({ where: { userStatus: { statusName: 'Banned' } } }),
            prisma.user.count({ where: { userStatus: { statusName: 'Disabled' } } }),
            prisma.user.count(),
            prisma.bulletin.count({ where: { status: { statusName: 'Pending' } } }),
            prisma.bulletin.count({ where: { status: { statusName: 'Flagged' } } }),
            prisma.event.count({ where: { status: { statusName: 'Pending' } } }),
            prisma.event.count({ where: { status: { statusName: 'Approved' } } }),
            prisma.donation.findMany({ where: { status: { statusName: 'Completed' } } }),
            prisma.user.findMany({
                take: RECENT_ACTIVITY_LENGTH,
                orderBy: { statistics: { dateRegistered: 'desc' } },
                include: { profile: true, userStatus: true, statistics: true }
            }),
            prisma.bulletin.findMany({
                take: RECENT_ACTIVITY_LENGTH,
                orderBy: { bulletinDate: 'desc' },
                include: { author: { include: { profile: true } }, status: true }
            }),
            prisma.event.findMany({
                take: RECENT_ACTIVITY_LENGTH,
                orderBy: { eventDate: 'desc' },
                include: { author: { include: { profile: true } }, status: true }
            }),
            prisma.donation.findMany({
                take: RECENT_ACTIVITY_LENGTH,
                orderBy: { donationDate: 'desc' },
                include: { status: true, user: { include: { profile: true } } }
            }),
            prisma.user.findMany({
                select: {
                    profile: { select: { birthday: true } },
                    profileStatus: { select: { statusName: true } }
                }
            })
        ]);

        let babyBoomers = 0;
        let genX = 0;
        let millennials = 0;
        let genZ = 0;

        let profilePublic = 0;
        let profileConnections = 0;
        let profilePrivate = 0;

        allProfiles.forEach(u => {
            // Demographics based only on non-blank birthdays
            if (u.profile && u.profile.birthday) {
                const bDate = new Date(u.profile.birthday);
                if (!isNaN(bDate.getTime())) {
                    const birthYear = bDate.getFullYear();
                    if (birthYear <= 1964) babyBoomers++;
                    else if (birthYear >= 1965 && birthYear <= 1980) genX++;
                    else if (birthYear >= 1981 && birthYear <= 1996) millennials++;
                    else if (birthYear >= 1997) genZ++;
                }
            }

            // Profile status counts
            const statusName = u.profileStatus?.statusName;
            if (statusName === 'Public') profilePublic++;
            else if (statusName === 'Connections Only') profileConnections++;
            else if (statusName === 'Private') profilePrivate++;
        });

        const donationsTotal = completedDonations.reduce((sum, d) => sum + (d.donationAmount || 0), 0);
        // Only set name as Anonymous if donation is not tied to any account
        const activeDonorsSet = new Set(
            completedDonations.map(d => d.userId || 'Anonymous')
        );

        const activities = [];

        recentUsers.forEach(u => {
            const regDate = u.statistics?.dateRegistered ? new Date(u.statistics.dateRegistered) : new Date();
            activities.push({
                id: `user-${u.id}`,
                action: 'Registered for an account',
                user: u.profile?.userName || 'New User',
                time: regDate.toLocaleDateString(),
                timestamp: regDate.getTime(),
                type: 'user'
            });
        });

        recentBulletins.forEach(b => {
            const dateObj = new Date(b.bulletinDate);
            activities.push({
                id: `bulletin-${b.id}`,
                action: `Submitted bulletin "${b.title}"`,
                user: b.author?.profile?.userName || 'Alumni Member',
                time: dateObj.toLocaleDateString(),
                timestamp: dateObj.getTime(),
                type: 'content'
            });
        });

        recentEvents.forEach(e => {
            const dateObj = new Date(e.eventDate);
            activities.push({
                id: `event-${e.id}`,
                action: `Proposed event "${e.title}"`,
                user: e.author?.profile?.userName || 'Alumni Member',
                time: dateObj.toLocaleDateString(),
                timestamp: dateObj.getTime(),
                type: 'event'
            });
        });

        recentDonations.forEach(d => {
            const donorName = d.userId === 'Anonymous' || !d.userId ? 'Anonymous' : (d.user?.profile?.userName || 'Registered user');
            const dateObj = new Date(d.donationDate);
            const amountFormatted = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(d.donationAmount || 0);
            activities.push({
                id: `donation-${d.id}`,
                action: `Donated ${amountFormatted}`,
                user: donorName,
                time: dateObj.toLocaleDateString(),
                timestamp: dateObj.getTime(),
                type: 'donation'
            });
        });

        activities.sort((a, b) => b.timestamp - a.timestamp);

        res.json({
            pendingUsers: pendingUsersCount,
            officialUsers: officialUsersCount,
            regularUsers: regularUsersCount,
            suspendedUsers: suspendedUsersCount,
            bannedUsers: bannedUsersCount,
            disabledUsers: disabledUsersCount,
            totalUsers: totalUsersCount,
            demographics: {
                babyBoomers,
                genX,
                millennials,
                genZ,
                profileStatus: {
                    public: profilePublic,
                    connections: profileConnections,
                    private: profilePrivate
                }
            },
            pendingBulletins: pendingBulletinsCount,
            flaggedBulletins: flaggedBulletinsCount,
            pendingEvents: pendingEventsCount,
            approvedEvents: approvedEventsCount,
            donationsTotal,
            activeDonorsCount: activeDonorsSet.size,
            recentActivity: activities.slice(0, RECENT_ACTIVITY_LENGTH)
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});


// Admin POST Create User
app.post('/api/admin/users', authenticateAdminToken, async (req, res) => {
    const { fullName, email, password, degreeId, batch, gender, userStatusId, reason } = req.body;
    try {
        if (!fullName || !email || !password || !degreeId) {
            return res.status(400).json({ error: 'Full name, email, password, and degree program are required.' });
        }

        const existingUser = await prisma.userAuth.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        let targetStatusId = userStatusId;
        if (!targetStatusId) {
            const regularStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Regular' } });
            targetStatusId = regularStatus?.id;
        }

        const defaultProfileStatus = await prisma.profileStatus.findFirst({ where: { statusName: 'Connections Only' } });
        if (!targetStatusId || !defaultProfileStatus) {
            return res.status(500).json({ error: 'Missing configuration statuses' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const userId = uuidv4();
        const effectiveAdminId = getAdminId(req);

        const createdUser = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    profileStatusId: defaultProfileStatus.id,
                    userStatusId: targetStatusId,
                    auth: {
                        create: {
                            email,
                            passwordHash,
                        }
                    },
                    profile: {
                        create: {
                            userName: fullName,
                            email,
                            degreeId,
                            batch: batch ? parseInt(batch, 10) : null,
                            profileImage: "/uploads/engineer.png",
                            gender: gender || null
                        }
                    },
                    statistics: {
                        create: {}
                    },
                    records: {
                        create: {
                            userStatusId: targetStatusId,
                            description: reason || "Account created by Admin",
                            adminId: effectiveAdminId
                        }
                    }
                },
                include: {
                    records: true
                }
            });

            const record = newUser.records[0];
            await tx.user.update({
                where: { id: userId },
                data: { currentRecordId: record.id }
            });

            return tx.user.findUnique({
                where: { id: userId },
                include: defaultIncludes['user']
            });
        });

        res.status(201).json(formatOutput('user', createdUser));
    } catch (error) {
        console.error('Failed to create user by admin:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Admin Update User Status & Record
const handleAdminUpdateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { userStatusId, statusName, reason, expiryDate } = req.body;
    try {
        let statusObj = null;
        if (userStatusId) {
            statusObj = await prisma.userStatus.findUnique({ where: { id: userStatusId } });
        } else if (statusName) {
            statusObj = await prisma.userStatus.findFirst({ where: { statusName } });
        }

        if (!statusObj) {
            return res.status(400).json({ error: 'Invalid user status specified' });
        }

        if (statusObj.statusName === 'Suspended' && !expiryDate) {
            return res.status(400).json({ error: 'Expiry date is required for suspending a user' });
        }

        const dateExpires = expiryDate ? new Date(expiryDate) : null;
        const description = reason || `Status updated to ${statusObj.statusName}`;
        const effectiveAdminId = getAdminId(req);

        const updatedUser = await prisma.$transaction(async (tx) => {
            const record = await tx.record.create({
                data: {
                    userId: id,
                    userStatusId: statusObj.id,
                    description,
                    dateExpires,
                    adminId: effectiveAdminId
                }
            });

            const updatedUsr = await tx.user.update({
                where: { id },
                data: {
                    userStatusId: statusObj.id,
                    currentRecordId: record.id
                }
            });

            // Handle Verified achievement (Category 10001)
            const achievements = await tx.achievement.findMany();
            const verifiedAch = achievements.find(a => a.achievementCategory === 10001);
            if (verifiedAch) {
                if (statusObj.statusName === 'Official') {
                    const existing = await tx.userAchievement.findFirst({
                        where: { userId: id, achievementId: verifiedAch.id }
                    });
                    if (!existing) {
                        await tx.userAchievement.create({
                            data: {
                                userId: id,
                                achievementId: verifiedAch.id,
                                achievementTier: 1,
                                achievedDate: new Date().toISOString()
                            }
                        });
                    }
                } else {
                    await tx.userAchievement.deleteMany({
                        where: { userId: id, achievementId: verifiedAch.id }
                    });
                }
            }

            if (statusObj.statusName === 'Suspended') {
                await createNotification(tx, id, "You have been suspended from posting.", null);
            }

            return tx.user.findUnique({
                where: { id },
                include: defaultIncludes['user']
            });
        });

        res.json(formatOutput('user', updatedUser));
    } catch (error) {
        console.error('Failed to update user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
app.post('/api/admin/users/:id/status', authenticateAdminToken, handleAdminUpdateUserStatus);
app.patch('/api/admin/users/:id/status', authenticateAdminToken, handleAdminUpdateUserStatus);
app.put('/api/admin/users/:id/status', authenticateAdminToken, handleAdminUpdateUserStatus);

// =======================
// GENERIC FALLBACK CRUD ROUTER (COMPATIBILITY ENGINE)
// =======================
// Add new tables here
const tableToModel = {
    degrees: 'degree',
    connectionStatuses: 'connectionStatus',
    contentStatuses: 'contentStatus',
    contentStatus: 'contentStatus',
    userStatuses: 'userStatus',
    donationStatuses: 'donationStatus',
    eventStatuses: 'eventStatus',
    eventStatus: 'eventStatus',
    eventCategories: 'eventCategory',
    eventCategory: 'eventCategory',
    bulletinCategories: 'bulletinCategory',
    bulletinCategory: 'bulletinCategory',
    profileStatuses: 'profileStatus',
    userConnections: 'userConnection',
    userStatistics: 'userStatistic',
    userAchievements: 'userAchievement',
    userRsvps: 'userRsvp',
    userAuths: 'userAuth',
    profiles: 'profile',
    users: 'user',
    records: 'record',
    bulletins: 'bulletin',
    events: 'event',
    comments: 'comment',
    donations: 'donation',
    locations: 'location',
    achievements: 'achievement',
    bulletinLikes: 'bulletinLike',
    commentLikes: 'commentLike',
    notifications: 'notification',
    clefLogs: 'clefLog',
    clefLog: 'clefLog'
};

const defaultIncludes = {
    profile: { degree: true, user: true },
    user: { profile: { include: { degree: true } }, userStatus: true, profileStatus: true, records: { include: { userStatus: true, admin: true }, orderBy: { dateCreated: 'desc' } } },
    bulletin: { comments: { include: { user: { include: { profile: true } }, likesList: true } }, status: true, category: true, author: { include: { profile: true, userStatus: true } }, likes: true, admin: true },
    event: { location: true, rsvps: true, status: true, category: true, author: { include: { profile: true, userStatus: true } }, admin: true },
    userConnection: { status: true, user: { include: { profile: { include: { degree: true } } } }, friend: { include: { profile: { include: { degree: true } } } } },
    comment: { user: { include: { profile: true } }, bulletin: true, likesList: true },
    userAchievement: { achievement: true },
    userRsvp: { event: true },
    donation: { status: true, user: { select: { profile: { select: { userName: true } } } } },
    userAuth: {
        user: {
            include: {
                profile: { include: { degree: true } },
                userStatus: true,
                profileStatus: true
            }
        }
    }
};

// Map database entities/relations to json-server expected shapes
function formatOutput(modelName, data) {
    const mapItem = (item) => {
        if (!item) return item;

        // 1. Primary key mapping (userId -> id)
        if (modelName === 'profile' || modelName === 'userAuth' || modelName === 'userStatistic') {
            item.id = item.userId;
        }

        // 2. Relation naming translation
        if (modelName === 'donation' && item.status) {
            item.donationStatus = item.status;
            delete item.status;
        }
        if (modelName === 'bulletin' && item.status) {
            item.contentStatus = item.status;
            delete item.status;
            item.bulletinCategory = item.category;
            delete item.category;
            item.profile = item.author?.profile;
            if (item.comments) {
                item.comments.forEach(c => {
                    if (c.user?.profile) {
                        c.profile = c.user.profile;
                        c.profileId = c.userId;
                    }
                });
            }
        }
        if (modelName === 'event' && item.status) {
            item.eventStatus = item.status;
            delete item.status;
            item.eventCategory = item.category;
            delete item.category;
            if (item.rsvps) {
                item.userRsvps = item.rsvps;
                delete item.rsvps;
            }
        }
        if (modelName === 'comment') {
            if (item.user?.profile) {
                item.profile = item.user.profile;
                item.profileId = item.userId;
            }
        }
        return item;
    };

    if (Array.isArray(data)) {
        return data.map(mapItem);
    }
    return mapItem(data);
}

function filterModelFields(modelName, data) {
    const delegate = prisma[modelName];
    if (!delegate || !delegate.fields) return data;
    const allowedFields = new Set(Object.keys(delegate.fields));
    const filtered = {};
    for (const [key, val] of Object.entries(data)) {
        if (allowedFields.has(key)) {
            filtered[key] = val;
        }
    }
    return filtered;
}

// Server Time API
app.get('/api/server-time', async (req, res) => {
    try {
        const dbResult = await prisma.$queryRaw`SELECT datetime('now') as currentTime`;
        const dbTimeStr = dbResult[0]?.currentTime;
        if (!dbTimeStr) throw new Error("No database time returned");
        const dbTime = new Date(dbTimeStr + 'Z');
        res.json({ currentTime: dbTime.toISOString(), source: 'Database Time' });
    } catch (e) {
        console.error("Error in server time: " + e);
        res.json({ currentTime: new Date().toISOString(), source: 'Server Time' });
    }
});

// Donations Summary API
app.get('/api/donations/summary', async (req, res) => {
    try {
        const donations = await prisma.donation.findMany({
            where: { status: { statusName: 'Completed' } },
            select: {
                donationAmount: true,
                donationDate: true,
                userId: true
            }
        });

        const allDonations = await prisma.donation.findMany({
            select: {
                donationAmount: true,
                status: { select: { statusName: true } },
                bankName: true
            }
        });

        const totalUsers = await prisma.user.count();

        let totalRaised = 0;
        let pendingClearances = 0;
        let pendingCount = 0;

        const statusCounts = {};
        const bankCounts = {};
        const donorMap = new Map();

        let currentYearUniqueDonors = new Set();
        let previousYearUniqueDonors = new Set();
        let allTimeUniqueDonors = new Set();

        const currentYear = new Date().getUTCFullYear();

        allDonations.forEach(d => {
            const status = d.status?.statusName || 'Unknown';
            const bank = d.bankName || 'N/A';
            const amt = d.donationAmount || 0;

            statusCounts[status] = (statusCounts[status] || 0) + 1;

            if (status === 'Completed') {
                bankCounts[bank] = (bankCounts[bank] || 0) + 1;
            } else if (status === 'Processing') {
                pendingCount++;
                pendingClearances += amt;
            }
        });

        donations.forEach(d => {
            const amt = d.donationAmount || 0;
            const date = new Date(d.donationDate);
            const year = date.getUTCFullYear();
            const userId = d.userId;

            if (year === currentYear) {
                totalRaised += amt;
            }

            if (userId) {
                allTimeUniqueDonors.add(userId);

                if (year === currentYear) {
                    currentYearUniqueDonors.add(userId);
                } else if (year < currentYear) {
                    previousYearUniqueDonors.add(userId);
                }

                if (!donorMap.has(userId)) {
                    donorMap.set(userId, {
                        userId,
                        totalAmount: 0,
                        count: 0
                    });
                }
                const donorStats = donorMap.get(userId);
                donorStats.totalAmount += amt;
                donorStats.count += 1;
            }
        });

        const uniqueDonorsCount = allTimeUniqueDonors.size;
        let donorsWithMultiple = 0;
        const donorsArr = Array.from(donorMap.values());

        donorsArr.forEach(d => {
            if (d.count > 1) donorsWithMultiple++;
            d.avgDonation = d.totalAmount / d.count;
            d.frequency = d.count;
        });

        let retainedDonors = 0;
        currentYearUniqueDonors.forEach(userId => {
            if (previousYearUniqueDonors.has(userId)) {
                retainedDonors++;
            }
        });

        const stats = {
            totalRaised,
            pendingClearances,
            pendingCount,
            uniqueDonors: currentYearUniqueDonors.size,
            allTimeUniqueDonors: uniqueDonorsCount,
            averageLifetimeValue: uniqueDonorsCount > 0 ? (totalRaised / uniqueDonorsCount) : 0,
            averageDonationValue: donations.length > 0 ? (totalRaised / donations.length) : 0,
            donationFrequency: uniqueDonorsCount > 0 ? (donations.length / uniqueDonorsCount) : 0,
            repeatDonationRate: uniqueDonorsCount > 0 ? (donorsWithMultiple / uniqueDonorsCount) : 0,
            yoyRetention: currentYearUniqueDonors.size > 0 ? (retainedDonors / currentYearUniqueDonors.size) : 0,
            engagementRate: totalUsers > 0 ? (uniqueDonorsCount / totalUsers) : 0,
            updatedAt: new Date().toISOString()
        };

        // Determine top IDs
        const topLTV_Base = [...donorsArr].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 6);
        const topAvg_Base = [...donorsArr].sort((a, b) => b.avgDonation - a.avgDonation).slice(0, 6);
        const topFreq_Base = [...donorsArr].sort((a, b) => b.frequency - a.frequency).slice(0, 6);

        const topUserIds = Array.from(new Set([
            ...topLTV_Base.map(d => d.userId),
            ...topAvg_Base.map(d => d.userId),
            ...topFreq_Base.map(d => d.userId)
        ]));

        // Fetch profiles only for top donors
        const topUsersData = await prisma.user.findMany({
            where: { id: { in: topUserIds } },
            select: {
                id: true,
                auth: { select: { email: true } },
                profile: { select: { userName: true, profileImage: true, currentJob: true, company: true, batch: true, location: true } }
            }
        });

        const topUsersMap = new Map();
        topUsersData.forEach(u => topUsersMap.set(u.id, u));

        const mapToFullProfile = (baseList) => baseList.map(d => {
            const u = topUsersMap.get(d.userId);
            const profile = u?.profile || {};
            const auth = u?.auth || {};

            let career = 'N/A';
            if (profile.currentJob && profile.company) career = `${profile.currentJob} at ${profile.company}`;
            else if (profile.currentJob) career = profile.currentJob;
            else if (profile.company) career = profile.company;

            return {
                donor: profile.userName || 'Unknown',
                amount: d.totalAmount,
                avgDonation: d.avgDonation,
                frequency: d.frequency,
                userId: d.userId,
                profileImage: profile.profileImage || '',
                career,
                email: auth.email || profile.email || 'N/A',
                location: profile.location || 'N/A',
                batch: profile.batch ? String(profile.batch) : 'N/A'
            };
        });

        const topLTV = mapToFullProfile(topLTV_Base);
        const topAvgDonation = mapToFullProfile(topAvg_Base);
        const topFrequency = mapToFullProfile(topFreq_Base);

        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const bankData = Object.entries(bankCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        res.json({
            stats,
            charts: { statusData, bankData },
            leaderboards: { topLTV, topAvgDonation, topFrequency },
            uniqueBanks: Object.keys(bankCounts).sort()
        });
    } catch (error) {
        console.error("Summary API failed:", error);
        res.status(500).json({ error: "Failed to fetch summary" });
    }
});

// Generic GET all
app.get('/api/:table', async (req, res, next) => {
    const { table } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        const where = parseWhere(req.query, modelName);
        const orderBy = parseSort(req.query._sort);

        let includes;
        if (req.query._include !== undefined) {
            includes = {};
            const includeFields = typeof req.query._include === 'string' ? req.query._include.split(',') : [];
            includeFields.forEach(field => {
                let f = field.trim();
                if (modelName === 'bulletin') {
                    if (f === 'categories' || f === 'bulletinCategory') f = 'category';
                    else if (f === 'contentStatus') f = 'status';
                } else if (modelName === 'event') {
                    if (f === 'eventCategory') f = 'category';
                    else if (f === 'eventStatus') f = 'status';
                }
                if (f && f !== 'none') {
                    if (defaultIncludes[modelName] && defaultIncludes[modelName][f]) {
                        includes[f] = defaultIncludes[modelName][f];
                    } else {
                        includes[f] = true;
                    }
                }
            });
        } else {
            includes = defaultIncludes[modelName] ? { ...defaultIncludes[modelName] } : undefined;
        }

        const page = req.query._page ? parseInt(req.query._page, 10) : undefined;
        const perPage = req.query._per_page ? parseInt(req.query._per_page, 10) : (req.query._limit ? parseInt(req.query._limit, 10) : undefined);
        const isPaginated = page !== undefined && perPage !== undefined && !isNaN(page) && !isNaN(perPage);

        if (isPaginated) {
            const skip = (page - 1) * perPage;
            const take = perPage;

            const [data, totalItems] = await Promise.all([
                delegate.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    ...(includes && Object.keys(includes).length > 0 && { include: includes })
                }),
                delegate.count({ where })
            ]);

            const totalPages = Math.ceil(totalItems / perPage);

            res.json({
                first: 1,
                prev: page > 1 ? page - 1 : null,
                next: page < totalPages ? page + 1 : null,
                last: totalPages,
                pages: totalPages,
                items: totalItems,
                data: formatOutput(modelName, data)
            });
        } else {
            let totalItems;
            if (perPage !== undefined && !isNaN(perPage)) {
                totalItems = await delegate.count({ where });
            }

            const data = await delegate.findMany({
                where,
                orderBy,
                ...(perPage !== undefined && !isNaN(perPage) && { take: perPage }),
                ...(includes && Object.keys(includes).length > 0 && { include: includes })
            });

            if (totalItems !== undefined) {
                res.json({
                    items: totalItems,
                    data: formatOutput(modelName, data)
                });
            } else {
                res.json(formatOutput(modelName, data));
            }
        }
    } catch (error) {
        console.error(`Generic GET /api/${table} failed:`, error);
        res.status(500).json({ error: `Failed to fetch ${table}` });
    }
});

// Generic GET one
app.get('/api/:table/:id', async (req, res, next) => {
    const { table, id } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        let includes;
        if (req.query._include !== undefined) {
            includes = {};
            const includeFields = typeof req.query._include === 'string' ? req.query._include.split(',') : [];
            includeFields.forEach(field => {
                const f = field.trim();
                if (f && f !== 'none') {
                    if (defaultIncludes[modelName] && defaultIncludes[modelName][f]) {
                        includes[f] = defaultIncludes[modelName][f];
                    } else {
                        includes[f] = true;
                    }
                }
            });
        } else {
            includes = defaultIncludes[modelName] ? { ...defaultIncludes[modelName] } : undefined;
        }
        const pkField = (modelName === 'profile' || modelName === 'userAuth' || modelName === 'userStatistic') ? 'userId' : 'id';

        const item = await delegate.findUnique({
            where: { [pkField]: id },
            ...(includes && Object.keys(includes).length > 0 && { include: includes })
        });

        if (!item) return res.status(404).json({ error: `${table} item not found` });

        res.json(formatOutput(modelName, item));
    } catch (error) {
        console.error(`Generic GET /api/${table}/${id} failed:`, error);
        res.status(500).json({ error: `Failed to fetch ${table} item` });
    }
});

// Generic POST
app.post('/api/:table', contentLimiter, async (req, res, next) => {
    const { table } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        let data = req.body;

        // Safety coercion for numeric fields in POST payloads
        for (const [k, v] of Object.entries(data)) {
            if (numericFields.has(k) && typeof v === 'string' && !isNaN(v) && v.trim() !== '') {
                data[k] = Number(v);
            }
        }

        if (modelName === 'event') {
            data = await resolveEventData(data, false, null, req);
        } else if (modelName === 'bulletin') {
            data = await resolveBulletinData(data, false, req);
        }

        // Filter schema fields to prevent unknown field errors (e.g. donationId)
        data = filterModelFields(modelName, data);

        const item = await delegate.create({
            data,
            include: defaultIncludes[modelName] ? defaultIncludes[modelName] : undefined
        });

        if ((modelName === 'event' || modelName === 'bulletin') && item.authorId) {
            const link = modelName === 'event' ? `/events/${item.id}` : `/bulletin/${item.id}`;
            await createNotification(prisma, item.authorId, `Your ${modelName} "${item.title || 'submission'}" has been submitted and is currently under review.`, link);
        }

        res.status(201).json(formatOutput(modelName, item));
    } catch (error) {
        console.error(`Generic POST /api/${table} failed:`, error);
        res.status(500).json({ error: `Failed to create ${table} item` });
    }
});

// Generic PATCH
app.patch('/api/:table/:id', async (req, res, next) => {
    const { table, id } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        const pkField = (modelName === 'profile' || modelName === 'userAuth' || modelName === 'userStatistic') ? 'userId' : 'id';
        let data = req.body;

        // Safety coercion for numeric fields in PATCH payloads
        for (const [k, v] of Object.entries(data)) {
            if (numericFields.has(k) && typeof v === 'string' && !isNaN(v) && v.trim() !== '') {
                data[k] = Number(v);
            }
        }

        if (modelName === 'event') {
            const existingEvent = await prisma.event.findUnique({ where: { id } });
            data = await resolveEventData(data, true, existingEvent);
        } else if (modelName === 'bulletin') {
            data = await resolveBulletinData(data, true);
        }

        // Filter schema fields to prevent unknown field errors
        data = filterModelFields(modelName, data);

        const item = await delegate.update({
            where: { [pkField]: id },
            data,
            include: defaultIncludes[modelName] ? defaultIncludes[modelName] : undefined
        });

        res.json(formatOutput(modelName, item));
    } catch (error) {
        console.error(`Generic PATCH /api/${table}/${id} failed:`, error);
        res.status(500).json({ error: `Failed to update ${table} item` });
    }
});

// Generic PUT
app.put('/api/:table/:id', async (req, res, next) => {
    const { table, id } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        const pkField = (modelName === 'profile' || modelName === 'userAuth' || modelName === 'userStatistic') ? 'userId' : 'id';
        let data = req.body;

        // Safety coercion for numeric fields in PUT payloads
        for (const [k, v] of Object.entries(data)) {
            if (numericFields.has(k) && typeof v === 'string' && !isNaN(v) && v.trim() !== '') {
                data[k] = Number(v);
            }
        }

        // Strip seconds for event times
        if (modelName === 'event') {
            if (data.startTime && typeof data.startTime === 'string') data.startTime = data.startTime.substring(0, 5);
            if (data.endTime && typeof data.endTime === 'string') data.endTime = data.endTime.substring(0, 5);
            if (data.eventDate && typeof data.eventDate === 'string' && data.eventDate.includes('T')) {
                data.eventDate = data.eventDate.split('T')[0] + 'T00:00:00.000Z';
            }
        }

        // Filter schema fields to prevent unknown field errors
        data = filterModelFields(modelName, data);

        const item = await delegate.update({
            where: { [pkField]: id },
            data
        });

        res.json(formatOutput(modelName, item));
    } catch (error) {
        console.error(`Generic PUT /api/${table}/${id} failed:`, error);
        res.status(500).json({ error: `Failed to update ${table} item` });
    }
});

// Generic DELETE
app.delete('/api/:table/:id', async (req, res, next) => {
    const { table, id } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        const pkField = (modelName === 'profile' || modelName === 'userAuth' || modelName === 'userStatistic') ? 'userId' : 'id';

        await delegate.delete({
            where: { [pkField]: id }
        });

        res.status(204).end();
    } catch (error) {
        console.error(`Generic DELETE /api/${table}/${id} failed:`, error);
        res.status(500).json({ error: `Failed to delete ${table} item` });
    }
});





// =======================
// PAYMONGO CHECKOUT INTEGRATION
// =======================

app.post('/api/donations/checkout', async (req, res) => {
    try {
        const { amount, donationReference, donationAnonymous, donationEmail, userId } = req.body;

        const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
        if (!paymongoSecretKey || paymongoSecretKey === 'sk_test_...') {
            return res.status(500).json({ error: 'PayMongo Secret Key not configured in .env' });
        }

        const authString = Buffer.from(`${paymongoSecretKey}:`).toString('base64');
        // Dynamically resolve the frontend URL from the request Origin header.
        // Ensures that redirects seamlessly return to the exact same URL the user initiated the checkout from.
        const frontendUrl = req.headers.origin || `http://${req.headers.host}`;

        const checkoutPayload = {
            data: {
                attributes: {
                    send_email_receipt: true,
                    show_description: true,
                    show_line_items: true,
                    line_items: [
                        {
                            currency: 'PHP',
                            amount: Math.round(amount * 100), // PayMongo uses centavos
                            description: 'Donation',
                            name: 'Donation to USJ-R SEA Alumni',
                            quantity: 1
                        }
                    ],
                    payment_method_types: ['gcash', 'paymaya', 'grab_pay', 'qrph'],
                    reference_number: donationReference,
                    success_url: `${frontendUrl}/donate?status=success&ref=${donationReference}`,
                    cancel_url: `${frontendUrl}/donate?status=cancel&ref=${donationReference}`,
                    description: 'Alumni Donation'
                }
            }
        };

        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            body: JSON.stringify(checkoutPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PayMongo checkout error:", data);
            return res.status(500).json({ error: 'Failed to create PayMongo checkout session' });
        }

        // Pre-create the donation record with a 'Pending' status (Intent to Pay)
        const pendingStatus = await prisma.donationStatus.findFirst({ where: { statusName: 'Pending' } });
        if (pendingStatus) {
            await prisma.donation.create({
                data: {
                    donationReference: donationReference,
                    donationStatusId: pendingStatus.id,
                    donationAmount: amount,
                    donationAmountPhp: `₱${amount.toFixed(2)}`,
                    donationAnonymous: donationAnonymous,
                    donationEmail: donationEmail,
                    userId: userId || null,
                    bankName: data.data.id // Storing checkout_session_id for reconciliation
                }
            });
        }

        // Return the checkout URL to redirect the user
        res.json({ checkoutUrl: data.data.attributes.checkout_url });
    } catch (error) {
        console.error("PayMongo checkout exception:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/donations/webhook', async (req, res) => {
    try {
        const payload = req.body;
        console.log("PayMongo Webhook Payload Received:", payload?.data?.attributes?.type);

        if (payload && payload.data && payload.data.attributes) {
            const eventType = payload.data.attributes.type;

            if (eventType === 'checkout_session.payment.paid') {
                const checkoutData = payload.data.attributes.data;
                const donationReference = checkoutData.attributes.reference_number;

                // Extract the actual payment method (e.g. gcash, paymaya, card)
                let actualPaymentMethod = checkoutData.id; // Fallback to session ID
                const payments = checkoutData.attributes.payments;
                if (payments && payments.length > 0) {
                    const source = payments[0].attributes.source;
                    if (source && source.type) {
                        actualPaymentMethod = source.type.toUpperCase(); // e.g., 'GCASH'
                    }
                }

                if (donationReference) {
                    const completedStatus = await prisma.donationStatus.findFirst({ where: { statusName: 'Completed' } });

                    if (completedStatus) {
                        await prisma.donation.updateMany({
                            where: { donationReference: donationReference },
                            data: {
                                donationStatusId: completedStatus.id,
                                bankName: actualPaymentMethod
                            }
                        });

                        // Update user stats if the donation has a userId
                        const donation = await prisma.donation.findFirst({ where: { donationReference: donationReference } });
                        if (donation && donation.userId && !donation.donationAnonymous) {
                            const userStat = await prisma.userStatistic.findUnique({ where: { userId: donation.userId } });
                            if (userStat) {
                                await prisma.userStatistic.update({
                                    where: { userId: donation.userId },
                                    data: { donatedAmount: (userStat.donatedAmount || 0) + donation.donationAmount }
                                });
                            }
                        }
                    }
                }
            } else if (eventType === 'payment.failed') {
                console.log("[Demo] Received payment.failed event. Marking latest Pending donation as Failed.");

                const pendingStatus = await prisma.donationStatus.findFirst({ where: { statusName: 'Pending' } });
                const failedStatus = await prisma.donationStatus.findFirst({ where: { statusName: 'Failed' } });

                if (pendingStatus && failedStatus) {
                    // For demo purposes: Since payment.failed payloads don't contain the checkout session's reference_number,
                    // we will just grab the most recent Pending donation and fail it.
                    const latestPending = await prisma.donation.findFirst({
                        where: { donationStatusId: pendingStatus.id },
                        orderBy: { donationDate: 'desc' }
                    });

                    if (latestPending) {
                        await prisma.donation.update({
                            where: { id: latestPending.id },
                            data: { donationStatusId: failedStatus.id }
                        });
                        console.log(`[Demo] Successfully marked donation ${latestPending.donationReference} as Failed!`);
                    } else {
                        console.log(`[Demo] No Pending donations found to mark as Failed.`);
                    }
                }
            }
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send('Error processing webhook');
    }
});

// =======================
// CRON: ABANDONED CHECKOUT CLEANUP
// =======================
// Runs every hour to delete 'Pending' donations older than 24 hours.
setInterval(async () => {
    try {
        const pendingStatus = await prisma.donationStatus.findFirst({ where: { statusName: 'Pending' } });
        if (pendingStatus) {
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const deleted = await prisma.donation.deleteMany({
                where: {
                    donationStatusId: pendingStatus.id,
                    donationDate: { lt: yesterday }
                }
            });
            if (deleted.count > 0) {
                console.log(`[Cleanup] Removed ${deleted.count} abandoned checkouts.`);
            }
        }
    } catch (err) {
        console.error('[Cleanup] Failed to clean abandoned checkouts:', err);
    }
}, 1000 * 60 * 60); // Every hour

// Webhook handles reconciliation of PayMongo donations now.
// Catch-all route for the React Single Page Application (SPA)
// Must be placed after all API routes!
if (process.env.NODE_ENV === 'production') {
    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve('dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// ==============================================================================
// CONTENT CLASSIFIER & AUTO-REGISTRATION SYSTEM (MERGED)
// ==============================================================================

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_MODEL = "@cf/cloudflare/clef-flash";

async function askClef(stateStr, questions, imagePath) {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        console.warn("[Clef AI] Cloudflare credentials missing. Simulating 'Review'.");
        return { isUnsafe: 0.5, isSafe: 0.5, responseText: "Review" };
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${CLOUDFLARE_MODEL}`;

    const bodyObj = {
        state: stateStr,
        questions: questions
    };

    if (imagePath) {
        try {
            const fullPath = path.join(process.cwd(), imagePath);
            if (fs.existsSync(fullPath)) {
                const buffer = await sharp(fullPath)
                    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                const base64 = buffer.toString("base64");
                bodyObj.images = [{
                    content_type: "image/webp",
                    base64: base64
                }];
            }
        } catch (err) {
            console.error("[Clef AI] Error reading/resizing image:", err);
        }
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyObj),
            signal: AbortSignal.timeout(10000)
        });

        const result = await response.json();
        if (!result.success) {
            console.error("[Clef AI] API Error:", JSON.stringify(result.errors));
            return { isUnsafe: 0.5, isSafe: 0.5, responseText: "Review" };
        }

        const answers = result.result?.answers || {};
        const isUnsafeScore = answers.isUnsafe?.noul || 0;
        const isSafeScore = answers.isSafe?.noul || 0;

        return {
            isUnsafe: isUnsafeScore,
            isSafe: isSafeScore,
            responseText: JSON.stringify(answers)
        };
    } catch (e) {
        console.error("[Clef AI] Fetch Error:", e);
        return { isUnsafe: 0.5, isSafe: 0.5, responseText: "Review" };
    }
}

async function classifyPendingBulletins() {
    if (CLASSIFIER_INTERVAL_MINUTES <= 0) return;
    const pendingStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Pending' } });
    const approvedStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Approved' } });
    const rejectedStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Rejected' } });
    const flaggedStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Flagged' } });

    if (!pendingStatus || !approvedStatus || !rejectedStatus || !flaggedStatus) return;

    const pendingBulletins = await prisma.bulletin.findMany({
        where: { contentStatusId: pendingStatus.id },
        include: { author: true }
    });

    if (!pendingBulletins || pendingBulletins.length === 0) return;

    for (const bulletin of pendingBulletins) {
        try {
            console.log(`[Classifier] Classifying Bulletin: ${bulletin.id}`);
            const payload = {
                title: bulletin.title,
                content: bulletin.content
            };
            const payloadStr = JSON.stringify(payload);
            const stateStr = `
                Ensure people have predictable experiences by properly labeling content that is 
                graphic, sexually-explicit, or offensive. A user has submitted a new post: ${payloadStr}
            `;
            const questions = {
                isUnsafe: { type: "noul", instructions: "Is this post unsafe?" },
                isSafe: { type: "noul", instructions: "Is this safe to post?" }
            };

            const { isUnsafe, isSafe, responseText } = await askClef(stateStr, questions, bulletin.bulletinImage);

            let finalDecision = "Review";
            let newStatusId = flaggedStatus.id; // Mark as flagged by default so it escapes the infinite loop

            if (isUnsafe >= 0.45) {
                finalDecision = "Rejected";
                newStatusId = rejectedStatus.id;
            } else if (isSafe >= 0.80 && isUnsafe <= 0.15) {
                finalDecision = "Approved";
                newStatusId = approvedStatus.id;
            } else {
                finalDecision = "Review";
                newStatusId = flaggedStatus.id;
            }

            await prisma.bulletin.update({
                where: { id: bulletin.id },
                data: { contentStatusId: newStatusId }
            });

            // Update user statistics if approved
            if (finalDecision === "Approved" && bulletin.authorId) {
                const userStats = await prisma.userStatistic.findFirst({ where: { userId: bulletin.authorId } });
                if (userStats) {
                    await prisma.userStatistic.update({
                        where: { userId: userStats.userId },
                        data: { bulletinsCreated: { increment: 1 } }
                    });
                }
            }

            let action = "";
            if (finalDecision === "Approved") action = "automatically approved";
            else if (finalDecision === "Rejected") action = "automatically rejected";
            else action = "flagged for manual review";

            let sysNotifType = await prisma.notificationType.findFirst({ where: { notificationTypeName: "System" } });
            if (!sysNotifType) {
                sysNotifType = await prisma.notificationType.create({ data: { notificationTypeName: "System" } });
            }
            await prisma.notification.create({
                data: {
                    userId: bulletin.authorId,
                    notificationTypeId: sysNotifType.id,
                    notificationMessage: JSON.stringify({
                        text: `Your bulletin "${bulletin.title}" was ${action} by the AI filter.`,
                        link: `/bulletin/${bulletin.id}`
                    })
                }
            }).catch(e => console.warn(`Failed notification for bulletin ${bulletin.id}:`, e.message));

            await prisma.clefLog.create({
                data: {
                    targetId: bulletin.id,
                    targetType: 'Bulletin',
                    requestPayload: payloadStr,
                    responsePayload: responseText,
                    decision: finalDecision
                }
            }).catch(e => console.warn(`Failed clefLog for bulletin ${bulletin.id}:`, e.message));

            console.log(`[Classifier] Bulletin ${bulletin.id} -> ${finalDecision}`);
        } catch (bulletinErr) {
            console.error(`[Classifier] Error processing bulletin ${bulletin.id}:`, bulletinErr);
        }
    }
}

let isAutoApprovingUsers = false;
async function autoApprovePendingUsers() {
    if (CLASSIFIER_INTERVAL_MINUTES <= 0) return;
    if (isAutoApprovingUsers) return;
    isAutoApprovingUsers = true;
    try {
        const pendingUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Pending' } });
        const regularUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Regular' } });

        if (!pendingUserStatus || !regularUserStatus) {
            console.warn("[Auto-Register] Pending or Regular user status not found in database.");
            return;
        }

        const pendingUsers = await prisma.user.findMany({
            where: { userStatusId: pendingUserStatus.id },
            include: { profile: true, auth: true }
        });

        if (!pendingUsers || pendingUsers.length === 0) return;

        for (const user of pendingUsers) {
            try {
                console.log(`[Auto-Register] Approving user: ${user.id} (${user.auth?.email || user.profile?.email || 'unknown'})`);
                const newStatusId = regularUserStatus.id;

                await prisma.$transaction(async (tx) => {
                    const record = await tx.record.create({
                        data: {
                            userId: user.id,
                            userStatusId: newStatusId,
                            description: "Automatically approved by system",
                            adminId: null
                        }
                    });

                    await tx.user.update({
                        where: { id: user.id },
                        data: {
                            userStatusId: newStatusId,
                            currentRecordId: record.id
                        }
                    });
                });

                await prisma.clefLog.create({
                    data: {
                        targetId: user.id,
                        targetType: 'User',
                        requestPayload: null,
                        responsePayload: null,
                        decision: 'Approved'
                    }
                }).catch(e => console.warn("Failed to write clefLog for user auto-approval:", e.message));

                console.log(`[Auto-Register] User ${user.id} approved successfully`);
            } catch (userErr) {
                console.error(`[Auto-Register] Failed to approve user ${user.id}:`, userErr);
            }
        }
    } catch (err) {
        console.error("[Auto-Register] Error in autoApprovePendingUsers:", err);
    } finally {
        isAutoApprovingUsers = false;
    }
}

let isRunningClassifier = false;
async function runClassifierTasks() {
    if (CLASSIFIER_INTERVAL_MINUTES <= 0) return;
    if (isRunningClassifier) {
        console.log(`[${new Date().toISOString()}] Classifier tasks already running, skipping interval tick.`);
        return;
    }
    isRunningClassifier = true;
    try {
        console.log(`[${new Date().toISOString()}] Running classifier & auto-approval tasks...`);
        // Always run user auto-approval first
        try {
            await autoApprovePendingUsers();
        } catch (e) {
            console.error("[Classifier] User Task Error:", e);
        }

        // Run bulletin AI classification
        try {
            await classifyPendingBulletins();
        } catch (e) {
            console.error("[Classifier] Bulletin Task Error:", e);
        }
    } finally {
        isRunningClassifier = false;
    }
}

// Classifier & Auto-registration Scheduler
if (CLASSIFIER_INTERVAL_MINUTES > 0) {
    console.log(`[Classifier] Starting content classifier and auto-registration loop (every ${CLASSIFIER_INTERVAL_MINUTES} minute(s))...`);
    runClassifierTasks().catch(err => console.error("[Classifier] Startup task error:", err));
    setInterval(() => {
        runClassifierTasks().catch(err => console.error("[Classifier] Interval task error:", err));
    }, CLASSIFIER_INTERVAL_MINUTES * 60 * 1000);
} else {
    console.log(`[Classifier] CLASSIFIER_INTERVAL_MINUTES is ${CLASSIFIER_INTERVAL_MINUTES} (<= 0). Classification and auto-registration logic are disabled.`);
}

export { autoApprovePendingUsers, classifyPendingBulletins, runClassifierTasks };