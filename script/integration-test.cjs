const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, '../dev.db');
const db = new Database(dbPath);

const args = process.argv.slice(2);
const isClear = args.includes('--clear');
const isNoTesters = args.includes('--no-testers');

function main() {
    console.log("Starting integration test script...");

    // 1. Look for Miku
    const mikuProfile = db.prepare(`SELECT * FROM Profile WHERE userName = ?`).get('初音ミク');
    if (!mikuProfile) {
        console.log("Miku not found (userName=初音ミク)");
        process.exit(0);
    }
    const mikuId = mikuProfile.userId;
    console.log("Found Miku! User ID:", mikuId);

    if (isClear) {
        console.log("Clearing connections and testers...");
        db.transaction(() => {
            db.prepare(`DELETE FROM UserConnection WHERE userId = ? OR friendId = ?`).run(mikuId, mikuId);
            const testers = db.prepare(`SELECT userId FROM Profile WHERE currentJob = 'Tester'`).all();
            for (const tester of testers) {
                db.prepare(`DELETE FROM UserStatistic WHERE userId = ?`).run(tester.userId);
                db.prepare(`DELETE FROM Profile WHERE userId = ?`).run(tester.userId);
                db.prepare(`DELETE FROM User WHERE id = ?`).run(tester.userId);
            }
        })();
        console.log("Clear complete.");
        process.exit(0);
    }

    // 2. Get connection statuses
    const requestingStatus = db.prepare(`SELECT id FROM ConnectionStatus WHERE connectionName = ?`).get('Requesting');
    const requestedStatus = db.prepare(`SELECT id FROM ConnectionStatus WHERE connectionName = ?`).get('Requested');
    if (!requestingStatus || !requestedStatus) {
        console.error("Connection statuses not found.");
        process.exit(1);
    }

    // 3. Programmatically send friend requests from all users currently in the database to Miku.
    const allUsers = db.prepare(`SELECT id FROM User WHERE id != ?`).all(mikuId);
    console.log(`Sending friend requests from ${allUsers.length} users to Miku...`);

    const insertConnection = db.prepare(`
        INSERT OR IGNORE INTO UserConnection (id, userId, friendId, connectionStatusId, dateUpdated)
        VALUES (?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
        const now = new Date().toISOString();
        for (const user of allUsers) {
            // User to Miku (Requesting)
            insertConnection.run(crypto.randomUUID(), user.id, mikuId, requestingStatus.id, now);
            // Miku to User (Requested)
            insertConnection.run(crypto.randomUUID(), mikuId, user.id, requestedStatus.id, now);
        }
    })();

    if (isNoTesters) {
        console.log("Skipping tester creation due to --no-testers flag.");
        process.exit(0);
    }

    // 4. Create 40 Tester accounts
    console.log("Creating 40 Tester accounts...");
    const activeUserStatus = db.prepare(`SELECT id FROM UserStatus WHERE statusName = ?`).get('Regular');
    const publicProfileStatus = db.prepare(`SELECT id FROM ProfileStatus WHERE statusName = ?`).get('Public');
    const degree = db.prepare(`SELECT id FROM Degree LIMIT 1`).get();

    if (!activeUserStatus || !publicProfileStatus || !degree) {
        console.error("Required statuses or degree not found.");
        process.exit(1);
    }

    const insertUser = db.prepare(`
        INSERT INTO User (id, userStatusId, profileStatusId, currentRecordId) 
        VALUES (?, ?, ?, NULL)
    `);
    const insertProfile = db.prepare(`
        INSERT INTO Profile (userId, userName, currentJob, degreeId, batch, profileImage)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertStats = db.prepare(`
        INSERT INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
        VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?)
    `);

    const testerIds = [];

    db.transaction(() => {
        const now = new Date().toISOString();
        for (let i = 1; i <= 40; i++) {
            const testerId = crypto.randomUUID();
            testerIds.push(testerId);

            insertUser.run(testerId, activeUserStatus.id, publicProfileStatus.id);
            insertProfile.run(testerId, `Tester User ${i}`, 'Tester', degree.id, 2026, '/uploads/engineer.png');
            insertStats.run(testerId, now);
        }
    })();

    console.log("Tester accounts created. Miku is sending friend requests to them...");

    // Miku sends friend requests to all Tester accounts
    db.transaction(() => {
        const now = new Date().toISOString();
        for (const testerId of testerIds) {
            // Miku to Tester (Requesting)
            insertConnection.run(crypto.randomUUID(), mikuId, testerId, requestingStatus.id, now);
            // Tester to Miku (Requested)
            insertConnection.run(crypto.randomUUID(), testerId, mikuId, requestedStatus.id, now);
        }
    })();

    console.log("Integration setup complete.");
}

main();
