-- ============================================================================
-- Fix Event Responses Count Script (SQLite)
--
-- This script corrects the Event.responses count in dev.db to match
-- the actual number of attending RSVPs (isAttending = 1) recorded in UserRsvp.
--
-- Usage:
--   sqlite3 dev.db < script/fix_event_responses.sql
--   or
--   sqlite3 dev.db ".read script/fix_event_responses.sql"
-- ============================================================================

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

UPDATE Event
SET responses = (
    SELECT COUNT(*)
    FROM UserRsvp
    WHERE UserRsvp.eventId = Event.id
      AND UserRsvp.isAttending = 1
);

COMMIT;

PRAGMA foreign_keys = ON;

-- Force WAL checkpoint to persist changes to the database file
PRAGMA wal_checkpoint(TRUNCATE);
