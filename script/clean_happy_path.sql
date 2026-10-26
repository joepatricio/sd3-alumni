-- ============================================================================
-- Happy Path Demo Cleanup Script (SQLite)
-- Equivalent to script/clean_happy_path.py
--
-- This script cleans up all database writes created by the demo:
--   1. Reverts like counts and activity statistics for retained users/comments
--   2. Deletes demo bulletin comments and associated likes
--   3. Deletes incoming/reciprocal friend requests to John Smith
--   4. Deletes demo events, event RSVPs, ClefLogs, and orphaned Locations
--   5. Deletes demo user accounts and all related child records
--   6. Forces a SQLite WAL checkpoint (TRUNCATE)
--
-- Usage:
--   sqlite3 dev.db < script/clean_happy_path.sql
--   or
--   sqlite3 dev.db ".read script/clean_happy_path.sql"
-- ============================================================================

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- ----------------------------------------------------------------------------
-- 1. STAGE TARGET ENTITIES INTO TEMPORARY TABLES
-- ----------------------------------------------------------------------------

-- A. Identify demo user account IDs
CREATE TEMP TABLE IF NOT EXISTS _demo_user_ids (id TEXT PRIMARY KEY);
DELETE FROM _demo_user_ids;

INSERT INTO _demo_user_ids (id)
SELECT DISTINCT u.id
FROM User u
LEFT JOIN Profile p ON u.id = p.userId
LEFT JOIN UserAuth a ON u.id = a.userId
WHERE p.userName = 'Jose Hortelano'
   OR p.userName LIKE 'Jose Hortelano%'
   OR a.email LIKE 'demo.%@example.com'
   OR a.email = 'joe.hortz@example.com'
   OR p.email LIKE 'demo.%@example.com'
   OR p.email = 'joe.hortz@example.com';

-- B. Identify demo bulletin comments to delete
CREATE TEMP TABLE IF NOT EXISTS _demo_comment_ids (id TEXT PRIMARY KEY, userId TEXT);
DELETE FROM _demo_comment_ids;

INSERT INTO _demo_comment_ids (id, userId)
SELECT id, userId
FROM Comment
WHERE comment LIKE '%Delighted to reconnect with the USJ-R alumni community%'
   OR userId IN (SELECT id FROM _demo_user_ids);

-- C. Identify demo events to delete
CREATE TEMP TABLE IF NOT EXISTS _demo_event_ids (id TEXT PRIMARY KEY, authorId TEXT, locationId TEXT);
DELETE FROM _demo_event_ids;

INSERT INTO _demo_event_ids (id, authorId, locationId)
SELECT id, authorId, locationId
FROM Event
WHERE title LIKE 'USJ-R Engineering Homecoming & Alumni Gala%'
   OR authorId IN (SELECT id FROM _demo_user_ids);

-- D. Identify target friend (John Smith) and connection status 'Requested'
CREATE TEMP TABLE IF NOT EXISTS _target_friend_id (userId TEXT PRIMARY KEY);
DELETE FROM _target_friend_id;

INSERT INTO _target_friend_id (userId)
SELECT userId FROM Profile WHERE userName = 'John Smith' OR userName LIKE 'John Smith%' LIMIT 1;

CREATE TEMP TABLE IF NOT EXISTS _requested_status_id (id TEXT PRIMARY KEY);
DELETE FROM _requested_status_id;

INSERT INTO _requested_status_id (id)
SELECT id FROM ConnectionStatus WHERE connectionName = 'Requested' LIMIT 1;

-- E. Identify UserConnection records to delete
CREATE TEMP TABLE IF NOT EXISTS _demo_conn_ids (id TEXT PRIMARY KEY);
DELETE FROM _demo_conn_ids;

INSERT INTO _demo_conn_ids (id)
SELECT id FROM UserConnection
WHERE 
    -- 1. Incoming requests to John Smith
    (userId IN (SELECT userId FROM _target_friend_id) AND connectionStatusId IN (SELECT id FROM _requested_status_id))
    -- 2. Reciprocal records where John Smith is friendId and sender is userId
    OR (friendId IN (SELECT userId FROM _target_friend_id) AND userId IN (
        SELECT friendId FROM UserConnection
        WHERE userId IN (SELECT userId FROM _target_friend_id)
          AND connectionStatusId IN (SELECT id FROM _requested_status_id)
    ))
    -- 3. Any connection involving demo users
    OR userId IN (SELECT id FROM _demo_user_ids)
    OR friendId IN (SELECT id FROM _demo_user_ids);

-- ----------------------------------------------------------------------------
-- 2. ADJUST COUNTERS FOR RETAINED USERS / COMMENTS
-- ----------------------------------------------------------------------------

-- Decrement likes count on retained comments liked by demo users
UPDATE Comment
SET likes = MAX(0, likes - (
    SELECT COUNT(*) FROM CommentLike cl
    WHERE cl.commentId = Comment.id
      AND cl.userId IN (SELECT id FROM _demo_user_ids)
))
WHERE id NOT IN (SELECT id FROM _demo_comment_ids)
  AND id IN (
    SELECT commentId FROM CommentLike WHERE userId IN (SELECT id FROM _demo_user_ids)
  );

-- Decrement commentsWritten for retained authors whose comments are being removed
UPDATE UserStatistic
SET commentsWritten = MAX(0, commentsWritten - (
    SELECT COUNT(*) FROM _demo_comment_ids c
    WHERE c.userId = UserStatistic.userId
))
WHERE userId NOT IN (SELECT id FROM _demo_user_ids)
  AND userId IN (SELECT userId FROM _demo_comment_ids);

-- Decrement eventsCreated for retained authors whose events are being removed
UPDATE UserStatistic
SET eventsCreated = MAX(0, eventsCreated - (
    SELECT COUNT(*) FROM _demo_event_ids e
    WHERE e.authorId = UserStatistic.userId
))
WHERE userId NOT IN (SELECT id FROM _demo_user_ids)
  AND userId IN (SELECT authorId FROM _demo_event_ids);

-- ----------------------------------------------------------------------------
-- 3. DELETE COMMENTS, LIKES, AND CONNECTIONS
-- ----------------------------------------------------------------------------

DELETE FROM CommentLike WHERE commentId IN (SELECT id FROM _demo_comment_ids);
DELETE FROM CommentLike WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM Comment WHERE id IN (SELECT id FROM _demo_comment_ids);
DELETE FROM UserConnection WHERE id IN (SELECT id FROM _demo_conn_ids);

-- ----------------------------------------------------------------------------
-- 4. DELETE EVENTS, RSVPS, LOGS, AND ORPHANED LOCATIONS
-- ----------------------------------------------------------------------------

DELETE FROM UserRsvp WHERE eventId IN (SELECT id FROM _demo_event_ids);
DELETE FROM ClefLog WHERE targetId IN (SELECT id FROM _demo_event_ids) AND targetType = 'Event';
DELETE FROM Event WHERE id IN (SELECT id FROM _demo_event_ids);

-- Delete orphaned locations (locations referenced by removed events and no remaining events)
DELETE FROM Location
WHERE id IN (SELECT locationId FROM _demo_event_ids WHERE locationId IS NOT NULL)
  AND id NOT IN (SELECT locationId FROM Event WHERE locationId IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 5. DELETE DEMO USER ACCOUNTS AND CHILD RECORDS
-- ----------------------------------------------------------------------------

-- Break circular reference User.currentRecordId -> Record.id
UPDATE User SET currentRecordId = NULL WHERE id IN (SELECT id FROM _demo_user_ids);

DELETE FROM Record WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM UserAchievement WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM UserConnection WHERE userId IN (SELECT id FROM _demo_user_ids) OR friendId IN (SELECT id FROM _demo_user_ids);
DELETE FROM UserRsvp WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM Notification WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM Donation WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM BulletinLike WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM CommentLike WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM ClefLog WHERE targetId IN (SELECT id FROM _demo_user_ids) AND targetType = 'User';
DELETE FROM Profile WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM UserAuth WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM UserStatistic WHERE userId IN (SELECT id FROM _demo_user_ids);
DELETE FROM User WHERE id IN (SELECT id FROM _demo_user_ids);

-- ----------------------------------------------------------------------------
-- 6. CLEAN UP TEMP TABLES & COMMIT
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS _demo_user_ids;
DROP TABLE IF EXISTS _demo_comment_ids;
DROP TABLE IF EXISTS _demo_event_ids;
DROP TABLE IF EXISTS _target_friend_id;
DROP TABLE IF EXISTS _requested_status_id;
DROP TABLE IF EXISTS _demo_conn_ids;

COMMIT;

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 7. FORCE WAL CHECKPOINT (TRUNCATE)
-- ----------------------------------------------------------------------------
PRAGMA wal_checkpoint(TRUNCATE);
