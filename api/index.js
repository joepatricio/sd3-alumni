import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import pkg from '@prisma/client';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const { PrismaClient } = pkg;

dotenv.config();

const app = express();
const prisma = new PrismaClient();

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

// =======================
// AUTH ROUTES & CUSTOM OVERRIDES
// =======================

// User limits check and registration
app.post('/api/auth/register', async (req, res) => {
    const { fullName, email, password, degreeProgram, batch } = req.body;

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
        const privateProfileStatus = await prisma.profileStatus.findFirst({ where: { statusName: 'Private' } });

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

        if (!pendingUserStatus || !privateProfileStatus) {
            return res.status(500).json({ error: 'Internal configuration error (missing statuses)' });
        }

        // Find or create a default Admin for the Record
        let defaultAdmin = await prisma.admin.findFirst();
        if (!defaultAdmin) {
            defaultAdmin = await prisma.admin.create({ data: { passwordHash: 'default' } });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);
        const userId = uuidv4();

        // Transaction to ensure atomic success with nested writes
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: userId,
                    profileStatusId: privateProfileStatus.id,
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
                            profileImage: "http://localhost:3000/engineer.png"
                        }
                    },
                    statistics: {
                        create: {}
                    },
                    records: {
                        create: {
                            adminId: defaultAdmin.id,
                            userStatusId: pendingUserStatus.id,
                            description: "User registered",
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

// Custom Auth Login (optional fallback, though frontend uses /api/userAuths query)
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

        const isValid = userAuth.passwordHash.startsWith('$2a$')
            ? await bcrypt.compare(password, userAuth.passwordHash)
            : password === userAuth.passwordHash;

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

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
    bulletinLikes: 'bulletinLike'
};

const defaultIncludes = {
    profile: { degree: true, user: true },
    user: { profile: { include: { degree: true } }, userStatus: true, profileStatus: true },
    bulletin: { comments: { include: { user: { include: { profile: true } } } }, status: true, author: { include: { profile: true } }, likes: true },
    event: { location: true, rsvps: true, status: true, category: true },
    userConnection: { status: true, user: { include: { profile: { include: { degree: true } } } }, friend: { include: { profile: { include: { degree: true } } } } },
    comment: { user: { include: { profile: true } }, bulletin: true },
    userAchievement: { achievement: true },
    userRsvp: { event: true },
    donation: { status: true },
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

const numericFields = new Set([
    'batch', 'donationAmount', 'achievementTier', 'lat', 'lng', 'responses', 'readTimeMinutes', 'likes', 'eventsAttended', 'eventsCreated', 'bulletinsCreated', 'commentsWritten', 'achievements', 'donatedAmount', 'userConnections'
]);

function parseQuery(query, modelName) {
    const where = {};
    for (let [key, val] of Object.entries(query)) {
        if (key.startsWith('_')) continue; // Skip pagination

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
                else if (numericFields.has(lastPart) && !isNaN(val) && val.trim() !== '') {
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
            else if (numericFields.has(key) && !isNaN(val) && val.trim() !== '') {
                parsedVal = Number(val);
            }
            where[key] = parsedVal;
        }
    }
    return where;
}

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
        }
        if (modelName === 'bulletin' && item.status) {
            item.contentStatus = item.status;
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
            item.eventCategory = item.category;
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


// Generic GET all
app.get('/api/:table', async (req, res, next) => {
    const { table } = req.params;
    const modelName = tableToModel[table];
    if (!modelName) return next();

    try {
        const delegate = prisma[modelName];
        if (!delegate) return res.status(404).json({ error: `Model for ${table} not found` });

        const where = parseQuery(req.query, modelName);
        const includes = defaultIncludes[modelName];

        const page = req.query._page ? parseInt(req.query._page, 10) : undefined;
        const perPage = req.query._per_page ? parseInt(req.query._per_page, 10) : (req.query._limit ? parseInt(req.query._limit, 10) : undefined);
        const isPaginated = page !== undefined && perPage !== undefined && !isNaN(page) && !isNaN(perPage);

        if (isPaginated) {
            const skip = (page - 1) * perPage;
            const take = perPage;
            
            const [data, totalItems] = await Promise.all([
                delegate.findMany({
                    where,
                    skip,
                    take,
                    ...(includes && { include: includes })
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
            const data = await delegate.findMany({
                where,
                ...(includes && { include: includes })
            });

            res.json(formatOutput(modelName, data));
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

        const includes = defaultIncludes[modelName];
        const pkField = (modelName === 'profile' || modelName === 'userAuth' || modelName === 'userStatistic') ? 'userId' : 'id';

        const item = await delegate.findUnique({
            where: { [pkField]: id },
            ...(includes && { include: includes })
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

        // Filter schema fields to prevent unknown field errors (e.g. donationId)
        data = filterModelFields(modelName, data);

        const item = await delegate.create({
            data
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

        // Filter schema fields to prevent unknown field errors
        data = filterModelFields(modelName, data);

        const item = await delegate.update({
            where: { [pkField]: id },
            data
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
