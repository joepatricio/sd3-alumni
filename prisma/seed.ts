import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from "./generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { nanoid } from 'nanoid';

import type {
  DegreeData,
  ConnectionStatusData,
  EventStatusData,
  ContentStatusData,
  UserStatusData,
  DonationStatusData,
  EventCategoryData,
  BulletinCategoryData,
  ProfileStatusData,
  LocationData,
  AchievementData,
  UserAchievementData,
  RecordData,
  DonationData,
  User,
  ProfileData,
  EventData,
  BulletinData,
  BulletinCommentData,
  UserStatisticsData,
  UserConnectionData,
  RSVPData,
} from '@/app/views/api';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "./dev.db",
});

export const prisma = new PrismaClient({ adapter });

interface DbRawSchema {
  notificationType?: Array<{ id?: string; notificationTypeName: string }>;
  notificationTypes?: Array<{ id?: string; notificationTypeName: string }>;
  notifications?: Array<{ id?: string;[key: string]: unknown }>;
  degrees?: Array<Partial<DegreeData> & { degreeName: string; degreeAbbr: string }>;
  connectionStatuses?: Array<Partial<ConnectionStatusData> & { connectionName: string }>;
  contentStatuses?: Array<Partial<ContentStatusData> & { statusName: string }>;
  eventStatuses?: Array<Partial<EventStatusData> & { statusName: string }>;
  userStatuses?: Array<Partial<UserStatusData> & { statusName: string }>;
  donationStatuses?: Array<Partial<DonationStatusData> & { statusName: string }>;
  eventCategories?: Array<Partial<EventCategoryData> & { eventCategoryName: string }>;
  bulletinCategories?: Array<Partial<BulletinCategoryData> & { bulletinCategoryName: string }>;
  profileStatuses?: Array<Partial<ProfileStatusData> & { statusName: string }>;
  achievements?: Array<Partial<AchievementData> & {
    achievementCategory: number;
    achievementTier: number;
    achievementTitle: string;
    achievementDescription: string;
    achievementIcon: string;
  }>;
  users?: Array<Partial<User> & {
    userId: string;
    profileStatusId: string;
    userStatusId: string;
    recordId?: string;
  }>;
  userAuths?: Array<{
    userId: string;
    email: string;
    passwordHash: string;
    lastLogin: string;
  }>;
  records?: Array<Partial<RecordData> & {
    recordId?: string;
    userId: string;
    adminId?: string | null;
    userStatusId: string;
    dateCreated: string;
    description: string;
    dateExpires?: string | null;
  }>;
  profiles?: Array<Partial<ProfileData> & {
    userId: string;
    userName: string;
    degreeId: string;
  }>;
  userStatistics?: Array<Partial<UserStatisticsData> & {
    userId: string;
    dateRegistered: string;
  }>;
  userConnections?: Array<Partial<UserConnectionData> & {
    userId: string;
    friendId: string;
    connectionStatusId: string;
    dateUpdated: string;
  }>;
  userAchievements?: Array<Partial<UserAchievementData> & {
    userId: string;
    achievementId: string;
    achievementTier: number;
    achievedDate: string;
  }>;
  admins?: Array<{
    id?: string;
    username: string;
    passwordHash: string;
    lastLogin: string;
  }>;
  locations?: Array<Partial<LocationData>>;
  bulletins?: Array<Partial<BulletinData> & {
    userId?: string;
    authorId?: string;
    contentStatusId: string;
    bulletinCategoryId?: string;
    bulletinDate: string;
    title: string;
    readTimeMinutes?: number;
    content: string;
  }>;
  events?: Array<Partial<EventData> & {
    authorId: string;
    eventStatusId: string;
    eventCategoryId: string;
    eventDate: string;
    title: string;
    description: string;
  }>;
  comments?: Array<Partial<BulletinCommentData> & {
    userId: string;
    bulletinId: string;
    commentDate: string;
    comment: string;
  }>;
  donations?: Array<Partial<DonationData> & {
    donationReference: string;
    donationStatusId: string;
    donationDate: string;
    donationAmount: number;
    donationAnonymous: boolean;
    donationAmountPhp?: string | null;
    donationEmail?: string | null;
  }>;
  userRsvps?: Array<Partial<RSVPData> & {
    userId: string;
    eventId: string;
    isAttending: boolean | number;
    isValid?: boolean | number | null;
  }>;
  bulletinLikes?: Array<{
    id?: string;
    userId: string;
    bulletinId: string;
    isLiked: boolean;
  }>;
  commentLikes?: Array<{
    id?: string;
    userId: string;
    commentId: string;
    isLiked: boolean;
  }>;
}

function assignIds<T extends { id?: string }>(
  items: T[],
  referenceLists: Array<Array<Record<string, unknown>>>,
  idField: string
): (T & { id: string })[] {
  const ids = new Set<string>();
  for (const list of referenceLists) {
    for (const item of list || []) {
      const val = item[idField];
      if (typeof val === 'string' && val.length > 0) {
        ids.add(val);
      }
    }
  }
  const idArray = Array.from(ids);
  let idIndex = 0;
  return items.map((item: T) => {
    if (item.id) return item as T & { id: string };
    const assignedId = idIndex < idArray.length ? idArray[idIndex++] : nanoid(10);
    return { ...item, id: assignedId };
  });
}

async function main() {
  const dbPath = path.resolve('db.json');
  const rawData = fs.readFileSync(dbPath, 'utf8');
  const db: DbRawSchema = JSON.parse(rawData);

  console.log('Seeding Database...');

  // Clear existing database tables in reverse dependency order
  await prisma.clefLog.deleteMany({});
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

  const degrees = assignIds(
    (db.degrees || []).map(d => ({ ...d })),
    [(db.profiles || []) as unknown as Record<string, unknown>[]],
    'degreeId'
  );
  for (const degree of degrees) {
    await prisma.degree.create({
      data: {
        id: degree.id,
        degreeName: degree.degreeName,
        degreeAbbr: degree.degreeAbbr,
      },
    });
  }

  const connectionStatuses = assignIds(
    (db.connectionStatuses || []).map(cs => ({ ...cs })),
    [(db.userConnections || []) as unknown as Record<string, unknown>[]],
    'connectionStatusId'
  );
  for (const connectionStatus of connectionStatuses) {
    await prisma.connectionStatus.create({
      data: {
        id: connectionStatus.id,
        connectionName: connectionStatus.connectionName,
      },
    });
  }

  const eventStatuses = assignIds(
    (db.eventStatuses || []).map(es => ({ ...es })),
    [(db.events || []) as unknown as Record<string, unknown>[]],
    'eventStatusId'
  );
  for (const eventStatus of eventStatuses) {
    await prisma.eventStatus.create({
      data: {
        id: eventStatus.id,
        statusName: eventStatus.statusName,
      },
    });
  }

  const contentStatuses = assignIds(
    (db.contentStatuses || []).map(cs => ({ ...cs })),
    [(db.bulletins || []) as unknown as Record<string, unknown>[]],
    'contentStatusId'
  );
  for (const contentStatus of contentStatuses) {
    await prisma.contentStatus.create({
      data: {
        id: contentStatus.id,
        statusName: contentStatus.statusName,
      },
    });
  }

  const userStatuses = assignIds(
    (db.userStatuses || []).map(us => ({ ...us })),
    [
      (db.users || []) as unknown as Record<string, unknown>[],
      (db.records || []) as unknown as Record<string, unknown>[],
    ],
    'userStatusId'
  );
  for (const userStatus of userStatuses) {
    await prisma.userStatus.create({
      data: {
        id: userStatus.id,
        statusName: userStatus.statusName,
      },
    });
  }

  const donationStatuses = assignIds(
    (db.donationStatuses || []).map(ds => ({ ...ds })),
    [(db.donations || []) as unknown as Record<string, unknown>[]],
    'donationStatusId'
  );
  for (const donationStatus of donationStatuses) {
    await prisma.donationStatus.create({
      data: {
        id: donationStatus.id,
        statusName: donationStatus.statusName,
      },
    });
  }

  const eventCategories = assignIds(
    (db.eventCategories || []).map(ec => ({ ...ec })),
    [(db.events || []) as unknown as Record<string, unknown>[]],
    'eventCategoryId'
  );
  for (const eventCategory of eventCategories) {
    await prisma.eventCategory.create({
      data: {
        id: eventCategory.id,
        eventCategoryName: eventCategory.eventCategoryName,
      },
    });
  }

  const bulletinCategories = assignIds(
    (db.bulletinCategories || []).map(bc => ({ ...bc })),
    [(db.bulletins || []) as unknown as Record<string, unknown>[]],
    'bulletinCategoryId'
  );
  for (const bulletinCategory of bulletinCategories) {
    await prisma.bulletinCategory.create({
      data: {
        id: bulletinCategory.id,
        bulletinCategoryName: bulletinCategory.bulletinCategoryName,
      },
    });
  }

  const profileStatuses = assignIds(
    (db.profileStatuses || []).map(ps => ({ ...ps })),
    [(db.users || []) as unknown as Record<string, unknown>[]],
    'profileStatusId'
  );
  for (const profileStatus of profileStatuses) {
    await prisma.profileStatus.create({
      data: {
        id: profileStatus.id,
        statusName: profileStatus.statusName,
      },
    });
  }

  const rawNotificationTypes = db.notificationType || db.notificationTypes || [];
  const notificationTypes = assignIds(
    rawNotificationTypes.map(nt => ({ ...nt })),
    [(db.notifications || []) as unknown as Record<string, unknown>[]],
    'notificationTypeId'
  );
  for (const notificationType of notificationTypes) {
    await prisma.notificationType.create({
      data: {
        id: notificationType.id,
        notificationTypeName: notificationType.notificationTypeName,
      },
    });
  }

  // 2. Independent Tables
  const locations = assignIds(
    (db.locations || []).map(loc => ({ ...loc })),
    [(db.events || []) as unknown as Record<string, unknown>[]],
    'locationId'
  );
  for (const location of locations) {
    await prisma.location.create({
      data: {
        id: location.id,
        regionCode: location.regionCode,
        province: location.province,
        provinceCode: location.provinceCode,
        cityMunicipality: location.cityMunicipality,
        cityCode: location.cityCode,
        barangay: location.barangay,
        landmark: location.landmark,
        street: location.street,
        lat: location.lat,
        lng: location.lng,
      },
    });
  }

  const adminIdMap: Record<string, string> = {};
  for (const admin of db.admins || []) {
    const createdAdmin = await prisma.admin.create({
      data: {
        username: admin.username,
        passwordHash: admin.passwordHash,
        lastLogin: new Date(admin.lastLogin),
      },
    });
    adminIdMap[admin.username] = createdAdmin.id;
  }

  const achievements = assignIds(
    (db.achievements || []).map(a => ({ ...a })),
    [(db.userAchievements || []) as unknown as Record<string, unknown>[]],
    'achievementId'
  );
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: {
        id: achievement.id,
        achievementCategory: achievement.achievementCategory,
        achievementTier: achievement.achievementTier,
        achievementTitle: achievement.achievementTitle,
        achievementDescription: achievement.achievementDescription,
        achievementIcon: achievement.achievementIcon,
      },
    });
  }

  // 3. User & Associated
  for (const user of db.users || []) {
    const { userId, recordId, profileStatusId, userStatusId } = user;
    await prisma.user.create({
      data: {
        id: userId,
        userStatusId,
        profileStatusId,
        currentRecordId: recordId,
      },
    });
  }

  for (const profile of db.profiles || []) {
    const { birthday, ...rest } = profile;
    await prisma.profile.create({
      data: {
        userId: rest.userId,
        userName: rest.userName,
        gender: rest.gender,
        bio: rest.bio,
        email: rest.email,
        phone: rest.phone,
        location: rest.location,
        currentJob: rest.currentJob,
        company: rest.company,
        profileImage: rest.profileImage,
        degreeId: rest.degreeId,
        batch: rest.batch,
        birthday: birthday ? new Date(birthday) : null,
      },
    });
  }

  for (const userAuth of db.userAuths || []) {
    const { lastLogin, userId, email, passwordHash } = userAuth;
    await prisma.userAuth.create({
      data: {
        userId,
        email,
        passwordHash,
        lastLogin: new Date(lastLogin),
      },
    });
  }

  for (const userStatistic of db.userStatistics || []) {
    const { dateRegistered, userId, ...rest } = userStatistic;
    await prisma.userStatistic.create({
      data: {
        userId,
        userConnections: rest.userConnections ?? 0,
        eventsAttended: rest.eventsAttended ?? 0,
        eventsCreated: rest.eventsCreated ?? 0,
        bulletinsCreated: rest.bulletinsCreated ?? 0,
        commentsWritten: rest.commentsWritten ?? 0,
        achievements: rest.achievements ?? 0,
        donatedAmount: rest.donatedAmount ?? 0,
        dateRegistered: new Date(dateRegistered),
      },
    });
  }

  // 4. Content (Events, Bulletins)
  const events = assignIds(
    (db.events || []).map(e => ({ ...e })),
    [(db.userRsvps || []) as unknown as Record<string, unknown>[]],
    'eventId'
  );
  for (const event of events) {
    const { eventDate, reviewDate, adminId, ...rest } = event;
    await prisma.event.create({
      data: {
        id: rest.id,
        authorId: rest.authorId,
        eventStatusId: rest.eventStatusId,
        locationId: rest.locationId,
        eventCategoryId: rest.eventCategoryId,
        title: rest.title,
        description: rest.description,
        startTime: rest.startTime,
        endTime: rest.endTime,
        responses: rest.responses ?? 0,
        modality: rest.modality,
        eventImage: rest.eventImage,
        adminNotes: rest.adminNotes,
        adminId: adminId ? (adminIdMap[adminId] || adminId) : null,
        eventDate: new Date(eventDate),
        reviewDate: reviewDate ? new Date(reviewDate) : null,
      },
    });
  }

  const bulletins = assignIds(
    (db.bulletins || []).map(b => ({ ...b })),
    [
      (db.comments || []) as unknown as Record<string, unknown>[],
      (db.bulletinLikes || []) as unknown as Record<string, unknown>[],
    ],
    'bulletinId'
  );
  const defaultCategoryId = bulletinCategories[0]?.id;
  for (let i = 0; i < bulletins.length; i++) {
    const bulletin = bulletins[i];
    const { bulletinDate, reviewDate, userId, authorId, adminId, bulletinCategoryId, ...rest } = bulletin;
    const categoryId = bulletinCategoryId || bulletinCategories[i % bulletinCategories.length]?.id || defaultCategoryId;
    await prisma.bulletin.create({
      data: {
        id: rest.id,
        contentStatusId: rest.contentStatusId,
        title: rest.title,
        readTimeMinutes: rest.readTimeMinutes ?? 5,
        content: rest.content,
        bulletinImage: rest.bulletinImage,
        adminNotes: rest.adminNotes,
        adminId: adminId ? (adminIdMap[adminId] || adminId) : null,
        authorId: authorId || userId || '',
        bulletinCategoryId: categoryId,
        bulletinDate: new Date(bulletinDate),
        reviewDate: reviewDate ? new Date(reviewDate) : null,
      },
    });
  }

  // 5. Relations and Engagements
  const rawRecords = (db.records || []).map(r => ({
    ...r,
    id: r.id || r.recordId,
  }));
  const records = assignIds(
    rawRecords,
    [(db.users || []) as unknown as Record<string, unknown>[]],
    'recordId'
  );
  for (const record of records) {
    const { dateCreated, dateExpires, adminId, recordId: _recId, ...rest } = record;
    await prisma.record.create({
      data: {
        id: rest.id,
        userId: rest.userId,
        userStatusId: rest.userStatusId,
        description: rest.description,
        adminId: adminId ? (adminIdMap[adminId] || adminId) : null,
        dateCreated: new Date(dateCreated),
        dateExpires: dateExpires ? new Date(dateExpires) : null,
      },
    });
  }

  const comments = assignIds(
    (db.comments || []).map(c => ({ ...c })),
    [(db.commentLikes || []) as unknown as Record<string, unknown>[]],
    'commentId'
  );
  for (const comment of comments) {
    const { commentDate, ...rest } = comment;
    await prisma.comment.create({
      data: {
        id: rest.id,
        userId: rest.userId,
        bulletinId: rest.bulletinId,
        comment: rest.comment,
        likes: rest.likes ?? 0,
        commentDate: new Date(commentDate),
      },
    });
  }

  for (const donation of db.donations || []) {
    const { donationDate, ...rest } = donation;
    await prisma.donation.create({
      data: {
        id: rest.id,
        donationReference: rest.donationReference,
        userId: rest.userId,
        bankName: rest.bankName,
        donationStatusId: rest.donationStatusId,
        donationAmount: rest.donationAmount,
        donationAmountPhp: rest.donationAmountPhp,
        donationAnonymous: rest.donationAnonymous,
        donationEmail: rest.donationEmail,
        donationDate: new Date(donationDate),
      },
    });
  }

  for (const userRsvp of db.userRsvps || []) {
    await prisma.userRsvp.create({
      data: {
        id: userRsvp.id,
        userId: userRsvp.userId,
        eventId: userRsvp.eventId,
        isAttending: Boolean(userRsvp.isAttending),
        isValid: userRsvp.isValid !== undefined && userRsvp.isValid !== null ? Boolean(userRsvp.isValid) : null,
      },
    });
  }

  for (const userConnection of db.userConnections || []) {
    const { dateUpdated, ...rest } = userConnection;
    await prisma.userConnection.create({
      data: {
        id: rest.id,
        userId: rest.userId,
        friendId: rest.friendId,
        connectionStatusId: rest.connectionStatusId,
        dateUpdated: new Date(dateUpdated),
      },
    });
  }

  for (const userAchievement of db.userAchievements || []) {
    const { achievedDate, ...rest } = userAchievement;
    await prisma.userAchievement.create({
      data: {
        id: rest.id,
        userId: rest.userId,
        achievementId: rest.achievementId,
        achievementTier: rest.achievementTier,
        achievedDate: new Date(achievedDate),
      },
    });
  }

  for (const bulletinLike of db.bulletinLikes || []) {
    await prisma.bulletinLike.create({
      data: {
        id: bulletinLike.id,
        userId: bulletinLike.userId,
        bulletinId: bulletinLike.bulletinId,
        isLiked: Boolean(bulletinLike.isLiked),
      },
    });
  }

  for (const commentLike of db.commentLikes || []) {
    await prisma.commentLike.create({
      data: {
        id: commentLike.id,
        userId: commentLike.userId,
        commentId: commentLike.commentId,
        isLiked: Boolean(commentLike.isLiked),
      },
    });
  }

  console.log('Database Seeding Completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
