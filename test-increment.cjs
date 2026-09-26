const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const basePrisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const API_URL = 'http://localhost:8080/api';

async function main() {
    // 1. Get an admin token
    const adminToken = jwt.sign({ id: '1', role: 'admin', username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    const headers = { Authorization: `Bearer ${adminToken}` };

    // 2. Find a Pending Bulletin
    const pendingStatus = await basePrisma.contentStatus.findFirst({ where: { statusName: 'Pending' } });
    let bulletin = await basePrisma.bulletin.findFirst({ where: { contentStatusId: pendingStatus.id } });

    if (!bulletin) {
        console.log("No pending bulletin found. Creating one...");
        const author = await basePrisma.user.findFirst();
        bulletin = await basePrisma.bulletin.create({
            data: {
                title: "Test Bulletin",
                content: "Test",
                authorId: author.id,
                contentStatusId: pendingStatus.id,
                bulletinDate: new Date()
            }
        });
    }

    const authorId = bulletin.authorId;

    // 3. Get initial stats
    let userStats = await basePrisma.userStatistic.findFirst({ where: { userId: authorId } });
    console.log(`Initial bulletinsCreated: ${userStats.bulletinsCreated}`);

    // 4. Send PATCH to approve
    console.log(`Sending PATCH /admin/bulletins/${bulletin.id}/status`);
    try {
        await axios.patch(`${API_URL}/admin/bulletins/${bulletin.id}/status`, { status: 'Approved' }, { headers });
    } catch (e) {
        console.error(e.response?.data || e.message);
    }

    // 5. Get final stats
    userStats = await basePrisma.userStatistic.findFirst({ where: { userId: authorId } });
    console.log(`Final bulletinsCreated: ${userStats.bulletinsCreated}`);
}

main().catch(console.error).finally(() => basePrisma.$disconnect());
