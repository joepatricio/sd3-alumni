import { PrismaClient } from '../prisma/generated/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
    url: "file:./dev.db"
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Updating Profile images...");
    const profiles = await prisma.profile.findMany({
        where: { profileImage: { contains: 'http://localhost:3000' } }
    });
    for (const profile of profiles) {
        if (profile.profileImage) {
            await prisma.profile.update({
                where: { userId: profile.userId },
                data: { profileImage: profile.profileImage.replace('http://localhost:3000', '/uploads') }
            });
        }
    }
    console.log(`Updated ${profiles.length} profiles.`);

    console.log("Updating Bulletin images...");
    const bulletins = await prisma.bulletin.findMany({
        where: { bulletinImage: { contains: 'http://localhost:3000' } }
    });
    for (const bulletin of bulletins) {
        if (bulletin.bulletinImage) {
            await prisma.bulletin.update({
                where: { id: bulletin.id },
                data: { bulletinImage: bulletin.bulletinImage.replace('http://localhost:3000', '/uploads') }
            });
        }
    }
    console.log(`Updated ${bulletins.length} bulletins.`);

    console.log("Updating Event images...");
    const events = await prisma.event.findMany({
        where: { eventImage: { contains: 'http://localhost:3000' } }
    });
    for (const event of events) {
        if (event.eventImage) {
            await prisma.event.update({
                where: { id: event.id },
                data: { eventImage: event.eventImage.replace('http://localhost:3000', '/uploads') }
            });
        }
    }
    console.log(`Updated ${events.length} events.`);

    console.log("Done updating database image URLs!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
