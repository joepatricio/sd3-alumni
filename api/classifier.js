import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from "@prisma-client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
    timeout: 10000,
});
const prisma = new PrismaClient({ adapter });

(async () => {
    try {
        await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;');
        await prisma.$executeRawUnsafe('PRAGMA busy_timeout = 10000;');
    } catch (e) {
        console.warn("Could not set SQLite WAL mode in classifier:", e.message);
    }
})();

const INTERVAL = process.env.CLASSIFIER_INTERVAL_MINUTES || 5;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = "@cf/cloudflare/clef-flash";

async function askClef(stateStr, questions, imagePath) {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        console.warn("Cloudflare credentials missing. Simulating 'Review'.");
        return { isUnsafe: 0.5, isSafe: 0.5, responseText: "Review" };
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODEL}`;

    const bodyObj = {
        state: stateStr,
        questions: questions
    };

    if (imagePath) {
        try {
            // imagePath could be "/uploads/image.jpg"
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
            console.error("Error reading image:", err);
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
            console.error("Clef API Error:", JSON.stringify(result.errors));
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
        console.error("Fetch Error:", e);
        return { isUnsafe: 0.5, isSafe: 0.5, responseText: "Review" };
    }
}

async function classifyPendingBulletins() {
    const pendingStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Pending' } });
    const approvedStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Approved' } });
    const rejectedStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Rejected' } });
    const flaggedStatus = await prisma.contentStatus.findFirst({ where: { statusName: 'Flagged' } });

    if (!pendingStatus || !approvedStatus || !rejectedStatus || !flaggedStatus) return;

    const pendingBulletins = await prisma.bulletin.findMany({
        where: { contentStatusId: pendingStatus.id },
        include: { author: true }
    });

    for (const bulletin of pendingBulletins) {
        try {
            console.log(`Classifying Bulletin: ${bulletin.id}`);
            const payload = {
                title: bulletin.title,
                content: bulletin.content
            };
            const payloadStr = JSON.stringify(payload);
            const stateStr =
                `
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

            console.log(`Bulletin ${bulletin.id} -> ${finalDecision}`);
        } catch (bulletinErr) {
            console.error(`Error processing bulletin ${bulletin.id}:`, bulletinErr);
        }
    }
}

async function classifyPendingUsers() {
    try {
        const pendingUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Pending' } });
        const regularUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Regular' } });

        if (!pendingUserStatus || !regularUserStatus) {
            console.warn("Pending or Regular user status not found in database.");
            return;
        }

        const pendingUsers = await prisma.user.findMany({
            where: { userStatusId: pendingUserStatus.id },
            include: { profile: true, auth: true }
        });

        if (!pendingUsers || pendingUsers.length === 0) {
            return;
        }

        for (const user of pendingUsers) {
            try {
                console.log(`Auto-approving User: ${user.id}`);

                let finalDecision = "Approved";
                let newStatusId = regularUserStatus.id;

                // Atomically update user status and add status record
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
                        decision: finalDecision
                    }
                });
                console.log(`User ${user.id} -> ${finalDecision}`);
            } catch (userErr) {
                console.error(`Failed to auto-approve user ${user.id}:`, userErr);
            }
        }
    } catch (err) {
        console.error("Error in classifyPendingUsers:", err);
    }
}

let isRunning = false;
async function runTasks() {
    if (isRunning) {
        console.log(`[${new Date().toISOString()}] Tasks already running, skipping interval tick.`);
        return;
    }
    isRunning = true;
    try {
        console.log(`[${new Date().toISOString()}] Running classifier tasks...`);
        // Always run user auto-approval independently first
        try {
            await classifyPendingUsers();
        } catch (e) {
            console.error("User Task Error:", e);
        }

        // Run bulletin AI classification independently
        try {
            await classifyPendingBulletins();
        } catch (e) {
            console.error("Bulletin Task Error:", e);
        }
    } finally {
        isRunning = false;
    }
}

console.log(`Starting automated content classifier (bulletins and users every ${INTERVAL} mins)...`);
runTasks().catch(console.error);

setInterval(() => {
    runTasks().catch(console.error);
}, INTERVAL * 60 * 1000);

