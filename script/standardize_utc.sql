-- standardize_utc.sql
-- This script retroactively fixes DateTime entries in dev.db that are not already stored in UTC format.
-- It assumes that any date string NOT ending in '+00:00' or 'Z' was stored in local time (UTC+8) 
-- and converts it to UTC by subtracting 8 hours, then appending 'Z'.
-- If a date is already in UTC (ends with '+00:00' or 'Z'), it does nothing.

-- Table: Record
UPDATE Record 
SET dateCreated = strftime('%Y-%m-%dT%H:%M:%f', datetime(dateCreated, '-8 hours')) || 'Z'
WHERE dateCreated NOT LIKE '%+00:00' AND dateCreated NOT LIKE '%Z';

UPDATE Record 
SET dateExpires = strftime('%Y-%m-%dT%H:%M:%f', datetime(dateExpires, '-8 hours')) || 'Z'
WHERE dateExpires IS NOT NULL AND dateExpires NOT LIKE '%+00:00' AND dateExpires NOT LIKE '%Z';

-- Table: UserAuth
UPDATE UserAuth 
SET lastLogin = strftime('%Y-%m-%dT%H:%M:%f', datetime(lastLogin, '-8 hours')) || 'Z'
WHERE lastLogin NOT LIKE '%+00:00' AND lastLogin NOT LIKE '%Z';

-- Table: UserAchievement
UPDATE UserAchievement 
SET achievedDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(achievedDate, '-8 hours')) || 'Z'
WHERE achievedDate NOT LIKE '%+00:00' AND achievedDate NOT LIKE '%Z';

-- Table: UserConnection
UPDATE UserConnection 
SET dateUpdated = strftime('%Y-%m-%dT%H:%M:%f', datetime(dateUpdated, '-8 hours')) || 'Z'
WHERE dateUpdated NOT LIKE '%+00:00' AND dateUpdated NOT LIKE '%Z';

-- Table: UserStatistic
UPDATE UserStatistic 
SET dateRegistered = strftime('%Y-%m-%dT%H:%M:%f', datetime(dateRegistered, '-8 hours')) || 'Z'
WHERE dateRegistered NOT LIKE '%+00:00' AND dateRegistered NOT LIKE '%Z';

-- Table: Profile (birthday is usually just a date, but Prisma stores it as DateTime)
UPDATE Profile 
SET birthday = strftime('%Y-%m-%dT%H:%M:%f', datetime(birthday, '-8 hours')) || 'Z'
WHERE birthday IS NOT NULL AND birthday NOT LIKE '%+00:00' AND birthday NOT LIKE '%Z';

-- Table: Admin
UPDATE Admin 
SET lastLogin = strftime('%Y-%m-%dT%H:%M:%f', datetime(lastLogin, '-8 hours')) || 'Z'
WHERE lastLogin NOT LIKE '%+00:00' AND lastLogin NOT LIKE '%Z';

-- Table: Bulletin
UPDATE Bulletin 
SET bulletinDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(bulletinDate, '-8 hours')) || 'Z'
WHERE bulletinDate NOT LIKE '%+00:00' AND bulletinDate NOT LIKE '%Z';

UPDATE Bulletin 
SET reviewDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(reviewDate, '-8 hours')) || 'Z'
WHERE reviewDate IS NOT NULL AND reviewDate NOT LIKE '%+00:00' AND reviewDate NOT LIKE '%Z';

-- Table: Event
UPDATE Event 
SET eventDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(eventDate, '-8 hours')) || 'Z'
WHERE eventDate NOT LIKE '%+00:00' AND eventDate NOT LIKE '%Z';

UPDATE Event 
SET reviewDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(reviewDate, '-8 hours')) || 'Z'
WHERE reviewDate IS NOT NULL AND reviewDate NOT LIKE '%+00:00' AND reviewDate NOT LIKE '%Z';

-- Table: Comment
UPDATE Comment 
SET commentDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(commentDate, '-8 hours')) || 'Z'
WHERE commentDate NOT LIKE '%+00:00' AND commentDate NOT LIKE '%Z';

-- Table: Donation
UPDATE Donation 
SET donationDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(donationDate, '-8 hours')) || 'Z'
WHERE donationDate NOT LIKE '%+00:00' AND donationDate NOT LIKE '%Z';

-- Table: Notification
UPDATE Notification 
SET notificationDate = strftime('%Y-%m-%dT%H:%M:%f', datetime(notificationDate, '-8 hours')) || 'Z'
WHERE notificationDate NOT LIKE '%+00:00' AND notificationDate NOT LIKE '%Z';
