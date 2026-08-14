import fs from 'fs'
import path from 'path'
import { PrismaClient } from "./generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { nanoid } from 'nanoid';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

export const prisma = new PrismaClient({ adapter });

function assignIds(items: any[], referenceLists: any[][], idField: string) {
  const ids = new Set<string>();
  for (const list of referenceLists) {
    for (const item of list || []) {
      if (item[idField]) {
        ids.add(item[idField]);
      }
    }
  }
  const idArray = Array.from(ids);
  let idIndex = 0;
  return items.map((item: any) => {
    if (item.id) return item;
    const assignedId = idIndex < idArray.length ? idArray[idIndex++] : nanoid(10);
    return { ...item, id: assignedId };
  });
}

async function main() {
  const dbPath = path.resolve('db.json')
  const rawData = fs.readFileSync(dbPath, 'utf8')
  const db = JSON.parse(rawData)

  console.log('Seeding Database...')

  // Clear existing database tables in reverse dependency order
  await prisma.commentLike.deleteMany({});
  await prisma.bulletinLike.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.userConnection.deleteMany({});
  await prisma.userRsvp.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.record.deleteMany({});
  await prisma.donation.deleteMany({});
  await prisma.bulletin.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.userStatistic.deleteMany({});
  await prisma.userAuth.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationType.deleteMany({});
  await prisma.profileStatus.deleteMany({});
  await prisma.bulletinCategory.deleteMany({});
  await prisma.eventCategory.deleteMany({});
  await prisma.donationStatus.deleteMany({});
  await prisma.userStatus.deleteMany({});
  await prisma.contentStatus.deleteMany({});
  await prisma.eventStatus.deleteMany({});
  await prisma.connectionStatus.deleteMany({});
  await prisma.degree.deleteMany({});
  await prisma.achievement.deleteMany({});
  const degrees = assignIds(db.degrees || [], [db.profiles], 'degreeId');
  for (const degree of degrees) {
    await prisma.degree.create({ data: degree })
  }

  const connectionStatuses = assignIds(db.connectionStatuses || [], [db.userConnections], 'connectionStatusId');
  for (const connectionStatus of connectionStatuses) {
    await prisma.connectionStatus.create({ data: connectionStatus })
  }

  const eventStatuses = assignIds(db.eventStatuses || [], [db.events], 'eventStatusId');
  for (const eventStatus of eventStatuses) {
    await prisma.eventStatus.create({ data: eventStatus })
  }

  const contentStatuses = assignIds(db.contentStatuses || [], [db.bulletins], 'contentStatusId');
  for (const contentStatus of contentStatuses) {
    await prisma.contentStatus.create({ data: contentStatus })
  }

  const userStatuses = assignIds(db.userStatuses || [], [db.users, db.records], 'userStatusId');
  for (const userStatus of userStatuses) {
    await prisma.userStatus.create({ data: userStatus })
  }

  const donationStatuses = assignIds(db.donationStatuses || [], [db.donations], 'donationStatusId');
  for (const donationStatus of donationStatuses) {
    await prisma.donationStatus.create({ data: donationStatus })
  }

  const eventCategories = assignIds(db.eventCategories || [], [db.events], 'eventCategoryId');
  for (const eventCategory of eventCategories) {
    await prisma.eventCategory.create({ data: eventCategory })
  }

  const bulletinCategories = assignIds(db.bulletinCategories || [], [db.bulletins], 'bulletinCategoryId');
  for (const bulletinCategory of bulletinCategories) {
    await prisma.bulletinCategory.create({ data: bulletinCategory })
  }

  const profileStatuses = assignIds(db.profileStatuses || [], [db.users], 'profileStatusId');
  for (const profileStatus of profileStatuses) {
    await prisma.profileStatus.create({ data: profileStatus })
  }

  const notificationTypes = assignIds(db.notificationTypes || [], [db.notifications], 'notificationTypeId');
  for (const notificationType of notificationTypes) {
    await prisma.notificationType.create({ data: notificationType })
  }

  // 2. Independent Tables
  const locations = assignIds(db.locations || [], [db.events], 'locationId');
  for (const location of locations) {
    await prisma.location.create({ data: location })
  }

  const adminIdMap: Record<string, string> = {}
  for (const admin of db.admins || []) {
    const createdAdmin = await prisma.admin.create({
      data: {
        username: admin.username,
        passwordHash: admin.passwordHash,
        lastLogin: new Date(admin.lastLogin)
      }
    })
    adminIdMap[admin.username] = createdAdmin.id
  }

  const achievements = assignIds(db.achievements || [], [db.userAchievements], 'achievementId');
  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement })
  }

  // 3. User & Associated
  for (const user of db.users) {
    const { userId, recordId, ...rest } = user
    await prisma.user.create({
      data: {
        id: userId,
        ...rest,
        currentRecordId: recordId
      }
    })
  }
  for (const profile of db.profiles) {
    // Remove duplicate id mapped from json-server
    const { birthday, ...rest } = profile
    await prisma.profile.create({
      data: {
        ...rest,
        birthday: birthday ? new Date(birthday) : null
      }
    })
  }
  for (const userAuth of db.userAuths) {
    const { lastLogin, ...rest } = userAuth
    await prisma.userAuth.create({
      data: {
        ...rest,
        lastLogin: new Date(lastLogin)
      }
    })
  }
  for (const userStatistic of db.userStatistics) {
    const { dateRegistered, ...rest } = userStatistic
    await prisma.userStatistic.create({
      data: {
        ...rest,
        dateRegistered: new Date(dateRegistered)
      }
    })
  }

  // 4. Content (Events, Bulletins)
  const events = assignIds(db.events || [], [db.userRsvps], 'eventId');
  for (const event of events) {
    const { eventDate, reviewDate, adminId, ...rest } = event
    await prisma.event.create({
      data: {
        ...rest,
        adminId: adminId ? (adminIdMap[adminId] || adminId) : null,
        eventDate: new Date(eventDate),
        reviewDate: reviewDate ? new Date(reviewDate) : null
      }
    })
  }
  const bulletins = assignIds(db.bulletins || [], [db.comments, db.bulletinLikes], 'bulletinId');
  const defaultCategoryId = bulletinCategories[0]?.id;
  for (let i = 0; i < bulletins.length; i++) {
    const bulletin = bulletins[i];
    const { bulletinDate, reviewDate, userId, adminId, bulletinCategoryId, ...rest } = bulletin;
    const categoryId = bulletinCategoryId || bulletinCategories[i % bulletinCategories.length]?.id || defaultCategoryId;
    await prisma.bulletin.create({
      data: {
        ...rest,
        adminId: adminId ? (adminIdMap[adminId] || adminId) : null,
        authorId: userId,
        bulletinCategoryId: categoryId,
        bulletinDate: new Date(bulletinDate),
        reviewDate: reviewDate ? new Date(reviewDate) : null
      }
    })
  }

  // 5. Relations and Engagements
  const records = assignIds(db.records || [], [db.users], 'recordId');
  for (const record of records) {
    const { dateCreated, dateExpires, adminId, recordId, ...rest } = record
    await prisma.record.create({
      data: {
        ...rest,
        adminId: adminId ? (adminIdMap[adminId] || adminId) : null,
        dateCreated: new Date(dateCreated),
        dateExpires: dateExpires ? new Date(dateExpires) : null
      }
    })
  }
  const comments = assignIds(db.comments || [], [db.commentLikes], 'commentId');
  for (const comment of comments) {
    const { commentDate, ...rest } = comment
    await prisma.comment.create({
      data: {
        ...rest,
        commentDate: new Date(commentDate)
      }
    })
  }
  for (const donation of db.donations) {
    const { donationDate, ...rest } = donation
    await prisma.donation.create({
      data: {
        ...rest,
        donationDate: new Date(donationDate)
      }
    })
  }
  for (const userRsvp of db.userRsvps || []) {
    await prisma.userRsvp.create({ data: userRsvp })
  }
  for (const userConnection of db.userConnections || []) {
    const { dateUpdated, ...rest } = userConnection
    await prisma.userConnection.create({
      data: {
        ...rest,
        dateUpdated: new Date(dateUpdated)
      }
    })
  }
  for (const userAchievement of db.userAchievements || []) {
    const { id, achievedDate, ...rest } = userAchievement
    await prisma.userAchievement.create({
      data: {
        ...rest,
        achievedDate: new Date(achievedDate)
      }
    })
  }
  for (const bulletinLike of db.bulletinLikes || []) {
    await prisma.bulletinLike.create({ data: bulletinLike })
  }
  for (const commentLike of db.commentLikes || []) {
    await prisma.commentLike.create({ data: commentLike })
  }

  console.log('Database Seeding Completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
