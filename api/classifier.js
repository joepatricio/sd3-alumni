import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from "@prisma-client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

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
            body: JSON.stringify(bodyObj)
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

        if (isUnsafe >= 0.6) {
            finalDecision = "Rejected";
            newStatusId = rejectedStatus.id;
        } else if (isSafe >= 0.6) {
            finalDecision = "Approved";
            newStatusId = approvedStatus.id;
        }

        await prisma.bulletin.update({
            where: { id: bulletin.id },
            data: { contentStatusId: newStatusId }
        });

        await prisma.clefLog.create({
            data: {
                targetId: bulletin.id,
                targetType: 'Bulletin',
                requestPayload: payloadStr,
                responsePayload: responseText,
                decision: finalDecision
            }
        });
        console.log(`Bulletin ${bulletin.id} -> ${finalDecision}`);
    }
}

async function classifyPendingUsers() {
    const pendingUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Pending' } });
    const regularUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Regular' } });

    if (!pendingUserStatus || !regularUserStatus) return;

    const pendingUsers = await prisma.user.findMany({
        where: { userStatusId: pendingUserStatus.id },
        include: { profile: true, auth: true }
    });

    for (const user of pendingUsers) {
        // Skip if already evaluated
        const existingLog = await prisma.clefLog.findFirst({
            where: { targetId: user.id, targetType: 'User' }
        });
        if (existingLog) continue;

        console.log(`Auto-approving User: ${user.id}`);
        // Commented out AI classification for users
        /*
        const payload = {
            userName: user.profile?.userName,
            email: user.auth?.email
        };
        const payloadStr = JSON.stringify(payload);
        const stateStr = `A user has registered: ${payloadStr}`;
        const questions = {
            isUnsafe: { type: "noul", instructions: "Is this user unsafe to register?" },
            isSafe: { type: "noul", instructions: "Is this user safe to register?" }
        };

        const { isUnsafe, isSafe, responseText } = await askClef(stateStr, questions, null);
        */

        let finalDecision = "Approved";
        let newStatusId = regularUserStatus.id;

        if (newStatusId !== pendingUserStatus.id) {
            await prisma.user.update({
                where: { id: user.id },
                data: { userStatusId: newStatusId }
            });
        }

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
    }
}

async function runTasks() {
    console.log(`[${new Date().toISOString()}] Running bulletin classifier task...`);
    try {
        await classifyPendingBulletins();
    } catch (e) {
        console.error("Task Error:", e);
    }
}

console.log("Starting automated content classifier (bulletins and users every 5 mins)...");
runTasks();
classifyPendingUsers();

setInterval(() => {
    Promise.all([
        runTasks(),
        classifyPendingUsers()
    ]).catch(console.error);
}, 5 * 60 * 1000);