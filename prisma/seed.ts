import pkg from '@prisma/client'
const { PrismaClient } = pkg
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const dbPath = path.resolve('db.json')
  const rawData = fs.readFileSync(dbPath, 'utf8')
  const db = JSON.parse(rawData)

  console.log('Seeding Database...')

  // 1. Lookup Tables
  for (const degree of db.degrees) {
    await prisma.degree.create({ data: degree })
  }
  for (const connectionStatus of db.connectionStatuses) {
    await prisma.connectionStatus.create({ data: connectionStatus })
  }
  for (const eventStatus of db.eventStatuses) {
    await prisma.eventStatus.create({ data: eventStatus })
  }
  for (const contentStatus of db.contentStatuses) {
    await prisma.contentStatus.create({ data: contentStatus })
  }
  for (const userStatus of db.userStatuses) {
    await prisma.userStatus.create({ data: userStatus })
  }
  for (const donationStatus of db.donationStatuses) {
    await prisma.donationStatus.create({ data: donationStatus })
  }
  for (const eventCategory of db.eventCategories) {
    await prisma.eventCategory.create({ data: eventCategory })
  }
  for (const profileStatus of db.profileStatuses) {
    await prisma.profileStatus.create({ data: profileStatus })
  }
  for (const notificationType of db.notificationTypes || []) {
    await prisma.notificationType.create({ data: notificationType })
  }

  // 2. Independent Tables
  for (const location of db.locations || []) {
    await prisma.location.create({ data: location })
  }
  for (const admin of db.admins || []) {
    await prisma.admin.create({ data: {
      id: admin.id,
      passwordHash: admin.passwordHash,
      lastLogin: new Date(admin.lastLogin)
    } })
  }
  for (const achievement of db.achievements || []) {
    await prisma.achievement.create({ data: achievement })
  }

  // 3. User & Associated
  for (const user of db.users) {
    const { userId, recordId, ...rest } = user
    await prisma.user.create({ data: {
      ...rest,
      currentRecordId: recordId
    } })
  }
  for (const profile of db.profiles) {
    // Remove duplicate id mapped from json-server
    const { id, birthday, ...rest } = profile
    await prisma.profile.create({ data: {
      ...rest,
      birthday: birthday ? new Date(birthday) : null
    } })
  }
  for (const userAuth of db.userAuths) {
    const { id, lastLogin, ...rest } = userAuth
    await prisma.userAuth.create({ data: {
      ...rest,
      lastLogin: new Date(lastLogin)
    } })
  }
  for (const userStatistic of db.userStatistics) {
    const { id, dateRegistered, ...rest } = userStatistic
    await prisma.userStatistic.create({ data: {
      ...rest,
      dateRegistered: new Date(dateRegistered)
    } })
  }

  // 4. Content (Events, Bulletins)
  for (const event of db.events) {
    const { eventDate, reviewDate, ...rest } = event
    await prisma.event.create({ data: {
      ...rest,
      eventDate: new Date(eventDate),
      reviewDate: reviewDate ? new Date(reviewDate) : null
    } })
  }
  for (const bulletin of db.bulletins) {
    const { bulletinDate, reviewDate, userId, ...rest } = bulletin
    await prisma.bulletin.create({ data: {
      ...rest,
      authorId: userId,
      bulletinDate: new Date(bulletinDate),
      reviewDate: reviewDate ? new Date(reviewDate) : null
    } })
  }

  // 5. Relations and Engagements
  for (const record of db.records) {
    const { dateCreated, dateExpires, ...rest } = record
    await prisma.record.create({ data: {
      ...rest,
      dateCreated: new Date(dateCreated),
      dateExpires: dateExpires ? new Date(dateExpires) : null
    } })
  }
  for (const comment of db.comments) {
    const { commentDate, ...rest } = comment
    await prisma.comment.create({ data: {
      ...rest,
      commentDate: new Date(commentDate)
    } })
  }
  for (const donation of db.donations) {
    const { donationDate, ...rest } = donation
    await prisma.donation.create({ data: {
      ...rest,
      donationDate: new Date(donationDate)
    } })
  }
  for (const userRsvp of db.userRsvps || []) {
    await prisma.userRsvp.create({ data: userRsvp })
  }
  for (const userConnection of db.userConnections || []) {
    const { dateUpdated, ...rest } = userConnection
    await prisma.userConnection.create({ data: {
      ...rest,
      dateUpdated: new Date(dateUpdated)
    } })
  }
  for (const userAchievement of db.userAchievements || []) {
    const { id, achievedDate, ...rest } = userAchievement
    await prisma.userAchievement.create({ data: {
      ...rest,
      achievedDate: new Date(achievedDate)
    } })
  }
  for (const bulletinLike of db.bulletinLikes || []) {
    await prisma.bulletinLike.create({ data: bulletinLike })
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
