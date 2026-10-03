import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'ae573cec338aafd3579d22c7526be83ff4c9d5dc631438691c2c886b296591d9';
const API_URL = '/uploads/api';

async function main() {
    // 1. Get an admin token
    const adminToken = jwt.sign({ id: '1', role: 'admin', username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    const headers = { Authorization: `Bearer ${adminToken}` };

    // Get bulletin
    const bRes = await axios.get(`${API_URL}/bulletins`);
    let data = bRes.data.data || bRes.data;
    let bulletin = data.find(b => b.contentStatus.statusName === 'Pending');
    if (!bulletin) {
        console.log("No pending bulletin found!");
        // let's grab any bulletin and make it pending
        bulletin = data[0];
        if (!bulletin) return;
        await axios.patch(`${API_URL}/admin/bulletins/${bulletin.id}/status`, { status: 'Pending' }, { headers });
    }
    const authorId = bulletin.authorId;

    // 3. Get initial stats
    let sRes = await axios.get(`${API_URL}/userStatistics?userId=${authorId}`, { headers });
    let userStats = sRes.data.data ? sRes.data.data[0] : sRes.data[0];
    console.log(`Initial bulletinsCreated: ${userStats.bulletinsCreated}`);

    // 4. Send PATCH to approve
    console.log(`Sending PATCH /admin/bulletins/${bulletin.id}/status to Approved`);
    try {
        await axios.patch(`${API_URL}/admin/bulletins/${bulletin.id}/status`, { status: 'Approved' }, { headers });
    } catch (e) {
        console.error(e.response?.data || e.message);
    }

    // 5. Get final stats
    sRes = await axios.get(`${API_URL}/userStatistics?userId=${authorId}`, { headers });
    userStats = sRes.data.data ? sRes.data.data[0] : sRes.data[0];
    console.log(`Final bulletinsCreated: ${userStats.bulletinsCreated}`);

    // 6. Send PATCH to Pending
    console.log(`Sending PATCH /admin/bulletins/${bulletin.id}/status to Pending`);
    try {
        await axios.patch(`${API_URL}/admin/bulletins/${bulletin.id}/status`, { status: 'Pending' }, { headers });
    } catch (e) {
        console.error(e.response?.data || e.message);
    }
    sRes = await axios.get(`${API_URL}/userStatistics?userId=${authorId}`, { headers });
    userStats = sRes.data.data ? sRes.data.data[0] : sRes.data[0];
    console.log(`Final bulletinsCreated after Pending: ${userStats.bulletinsCreated}`);

}

main().catch(console.error);
