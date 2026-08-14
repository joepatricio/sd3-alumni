import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "../prisma/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { parseWhere, parseSort, numericFields } from './queryParser.js';

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
});

export const prisma = new PrismaClient({ adapter });

const app = express();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
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
    res.json({ url: `http://localhost:3000/${req.file.filename}` });
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, admin) => {
        if (err || admin.role !== 'admin') return res.sendStatus(403);
        req.admin = admin;
        next();
    });
};

// =======================
// AUTH ROUTES & CUSTOM OVERRIDES
// =======================

// User limits check and registration
app.post('/api/auth/register', async (req, res) => {
    const { fullName, email, password, degreeProgram, batch, gender } = req.body;

    try {
        // Check user limit
        const userCount = await prisma.userAuth.count();
        if (userCount >= 100) {
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
                            profileImage: "http://localhost:3000/engineer.png",
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

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Custom Auth Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
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

        const token = jwt.sign(
            { id: userAuth.user.id, email: userAuth.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

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
app.post('/api/auth/admin/login', async (req, res) => {
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

        res.json({ token, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
            await prisma.$transaction([
                prisma.userConnection.create({
                    data: { userId: currentUserId, friendId: profileId, connectionStatusId: requestingCode }
                }),
                prisma.userConnection.create({
                    data: { userId: profileId, friendId: currentUserId, connectionStatusId: requestedCode }
                })
            ]);
            return res.json({ newStatusCode: requestingCode, statsUpdated: false });
        }
        else if (action === 'accept') {
            await prisma.$transaction(async (tx) => {
                if (c1) await tx.userConnection.update({ where: { id: c1.id }, data: { connectionStatusId: acceptedCode } });
                if (c2) await tx.userConnection.update({ where: { id: c2.id }, data: { connectionStatusId: acceptedCode } });

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
            return res.json({ newStatusCode: acceptedCode, statsUpdated: true, newConnectionsCount: newCount });
        }
        else if (action === 'reject' || action === 'remove' || action === 'unblock') {
            await prisma.$transaction(async (tx) => {
                if (c1) await tx.userConnection.delete({ where: { id: c1.id } });
                if (c2) await tx.userConnection.delete({ where: { id: c2.id } });

                if (action === 'remove' && wasAccepted) {
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
            return res.json({ newStatusCode: null, statsUpdated: action === 'remove' && wasAccepted, newConnectionsCount: newCount });
        }
        else if (action === 'block') {
            await prisma.$transaction(async (tx) => {
                if (c1) await tx.userConnection.update({ where: { id: c1.id }, data: { connectionStatusId: blockingCode } });
                else await tx.userConnection.create({ data: { userId: currentUserId, friendId: profileId, connectionStatusId: blockingCode } });

                if (c2) await tx.userConnection.update({ where: { id: c2.id }, data: { connectionStatusId: blockedCode } });
                else await tx.userConnection.create({ data: { userId: profileId, friendId: currentUserId, connectionStatusId: blockedCode } });

                if (wasAccepted) {
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
            return res.json({ newStatusCode: blockingCode, statsUpdated: wasAccepted, newConnectionsCount: newCount });
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

            const attendees = event.rsvps.filter(r => r.isAttending);
            for (const rsvp of attendees) {
                const stat = await tx.userStatistic.findFirst({ where: { userId: rsvp.userId } });
                if (stat) {
                    await tx.userStatistic.update({
                        where: { userId: rsvp.userId },
                        data: { eventsAttended: (stat.eventsAttended || 0) + 1 }
                    });
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
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded && (decoded.id || decoded.userId)) {
                        data.authorId = decoded.id || decoded.userId;
                    }
                } catch (e) { }
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
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded && (decoded.id || decoded.userId)) {
                        data.authorId = decoded.id || decoded.userId;
                    }
                } catch (e) { }
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

    if (data.readTimeMinutes !== undefined && data.readTimeMinutes !== null) {
        data.readTimeMinutes = parseInt(data.readTimeMinutes, 10) || 5;
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

// Admin PATCH Event Status
app.patch('/api/admin/events/:id/status', authenticateAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminId } = req.body;
        
        const effectiveAdminId = req.user?.id || adminId;
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
});

// Admin POST Event
app.post('/api/admin/events', authenticateAdminToken, async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({
            where: { userStatus: { statusName: 'Official' } }
        }) || await prisma.user.findFirst();

        const authorId = req.body.authorId || existingUser?.id;
        if (!authorId) return res.status(400).json({ error: 'Author user not found' });
        
        const effectiveAdminId = req.user?.id || req.body.adminId;
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

        // If newly created event is Approved or Concluded, increment author's eventsCreated stat
        const statusRec = await prisma.eventStatus.findUnique({ where: { id: newEvent.eventStatusId } });
        if (statusRec && ['Approved', 'Concluded'].includes(statusRec.statusName)) {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { eventsCreated: userStats.eventsCreated + 1 }
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
        const effectiveAdminId = req.user?.id || req.body.adminId;
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
    const existing = await prisma.event.findUnique({
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
        const statusRecord = await prisma.eventStatus.findFirst({
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

    const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: updateData,
        include: defaultIncludes['event']
    });

    const currentStatusRecord = await prisma.eventStatus.findUnique({
        where: { id: updatedEvent.eventStatusId }
    });
    const updatedStatusName = currentStatusRecord?.statusName || newStatusName;

    if (authorId && previousStatus && updatedStatusName && previousStatus !== updatedStatusName) {
        const validStatuses = ['Approved', 'Concluded'];
        const isNowValid = validStatuses.includes(updatedStatusName);
        const wasValid = validStatuses.includes(previousStatus);

        if (isNowValid && !wasValid) {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { eventsCreated: userStats.eventsCreated + 1 }
                });
            }
        } else if (wasValid && !isNowValid) {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats && userStats.eventsCreated > 0) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { eventsCreated: Math.max(0, userStats.eventsCreated - 1) }
                });
            }
        }
    }

    return updatedEvent;
}

// Helper to update bulletin status, admin audit info (adminId, reviewDate), and userStatistics bulletinsCreated count
async function updateBulletinStatusAndStats({ bulletinId, newStatusName, adminId, additionalData = {} }) {
    const existing = await prisma.bulletin.findUnique({
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
        const statusRecord = await prisma.contentStatus.findFirst({
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

    const updatedBulletin = await prisma.bulletin.update({
        where: { id: bulletinId },
        data: updateData,
        include: defaultIncludes['bulletin']
    });

    const currentStatusRecord = await prisma.contentStatus.findUnique({
        where: { id: updatedBulletin.contentStatusId }
    });
    const updatedStatusName = currentStatusRecord?.statusName || newStatusName;

    if (authorId && previousStatus && updatedStatusName && previousStatus !== updatedStatusName) {
        const isNowApproved = updatedStatusName === 'Approved';
        const wasApproved = previousStatus === 'Approved';

        if (isNowApproved && !wasApproved) {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { bulletinsCreated: userStats.bulletinsCreated + 1 }
                });
            }
        } else if (wasApproved && !isNowApproved) {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats && userStats.bulletinsCreated > 0) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { bulletinsCreated: Math.max(0, userStats.bulletinsCreated - 1) }
                });
            }
        }
    }

    return updatedBulletin;
}

// Admin PATCH Bulletin Status
app.patch('/api/admin/bulletins/:id/status', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { status, adminId } = req.body;
    try {
        const effectiveAdminId = req.user?.id || adminId;
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
});

// Admin POST Bulletin
app.post('/api/admin/bulletins', authenticateAdminToken, async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({
            where: { userStatus: { statusName: 'Official' } }
        }) || await prisma.user.findFirst();

        const authorId = req.body.authorId || existingUser?.id;
        if (!authorId) return res.status(400).json({ error: 'Author user not found' });

        const effectiveAdminId = req.user?.id || req.body.adminId;
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

        // If newly created bulletin is Approved, increment author's bulletinsCreated stat
        const statusRec = await prisma.contentStatus.findUnique({ where: { id: newBulletin.contentStatusId } });
        if (statusRec?.statusName === 'Approved') {
            const userStats = await prisma.userStatistic.findFirst({ where: { userId: authorId } });
            if (userStats) {
                await prisma.userStatistic.update({
                    where: { userId: userStats.userId },
                    data: { bulletinsCreated: userStats.bulletinsCreated + 1 }
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
        const effectiveAdminId = req.user?.id || req.body.adminId;
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
app.post('/api/admin/users', async (req, res) => {
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
                            profileImage: "http://localhost:3000/engineer.png",
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
                            adminId: null
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
app.post('/api/admin/users/:id/status', async (req, res) => {
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

        const dateExpires = expiryDate ? new Date(expiryDate) : null;
        const description = reason || `Status updated to ${statusObj.statusName}`;

        const updatedUser = await prisma.$transaction(async (tx) => {
            const record = await tx.record.create({
                data: {
                    userId: id,
                    userStatusId: statusObj.id,
                    description,
                    dateExpires,
                    adminId: null
                }
            });

            await tx.user.update({
                where: { id },
                data: {
                    userStatusId: statusObj.id,
                    currentRecordId: record.id
                }
            });

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
});

// =======================
// GENERIC FALLBACK CRUD ROUTER (COMPATIBILITY ENGINE)
// =======================

const tableToModel = {
    degrees: 'degree',
    connectionStatuses: 'connectionStatus',
    contentStatuses: 'contentStatus',
    userStatuses: 'userStatus',
    donationStatuses: 'donationStatus',
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
    userRsvps: 'userRsvp',
    profiles: 'profile',
    users: 'user'
};

const defaultIncludes = {
    profile: { degree: true, user: true },
    user: { profile: { include: { degree: true } }, userStatus: true, profileStatus: true, records: { include: { userStatus: true }, orderBy: { dateCreated: 'desc' } } },
    bulletin: { comments: { include: { user: { include: { profile: true } }, likesList: true } }, status: true, category: true, author: { include: { profile: true, userStatus: true } }, likes: true },
    event: { location: true, rsvps: true, status: true, category: true, author: { include: { profile: true, userStatus: true } } },
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
app.post('/api/:table', async (req, res, next) => {
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
