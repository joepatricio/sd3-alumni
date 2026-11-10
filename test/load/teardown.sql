-- ==============================================================================
-- POST-TEST DATABASE TEARDOWN & RESTORATION SCRIPT
-- Target: https://najealp.top (dev.db SQLite Database)
-- ==============================================================================
--
-- OPTION 1: COMPLETE DATABASE RESTORATION (RECOMMENDED)
-- In bash on the VPS:
--   cp dev.db.bak_pre_stress_* dev.db
--   pm2 restart sd3-alumni
--
-- OPTION 2: SELECTIVE SYNTHETIC RECORD PURGE (SQL)
-- Execute this script directly in SQLite to remove load test artifacts while preserving real alumni data:

BEGIN TRANSACTION;

-- 1. Remove synthetic load test user accounts created during registration bursts
DELETE FROM UserAuth WHERE email LIKE 'loadtest_%@najealp.top';
DELETE FROM Profile WHERE userId IN (SELECT id FROM User WHERE id NOT IN (SELECT userId FROM UserAuth));
DELETE FROM UserStatistic WHERE userId IN (SELECT id FROM User WHERE id NOT IN (SELECT userId FROM UserAuth));
DELETE FROM Record WHERE userId IN (SELECT id FROM User WHERE id NOT IN (SELECT userId FROM UserAuth));
DELETE FROM User WHERE id NOT IN (SELECT userId FROM UserAuth);

-- 2. Remove seeded official and regular test users
DELETE FROM UserAuth WHERE email LIKE 'test.official%@najealp.top' OR email LIKE 'test.regular%@najealp.top';
DELETE FROM Profile WHERE userId IN ('usr-off-01', 'usr-off-02', 'usr-off-03', 'usr-off-04', 'usr-off-05', 'usr-reg-01', 'usr-reg-02', 'usr-reg-03', 'usr-reg-04', 'usr-reg-05');
DELETE FROM UserStatistic WHERE userId IN ('usr-off-01', 'usr-off-02', 'usr-off-03', 'usr-off-04', 'usr-off-05', 'usr-reg-01', 'usr-reg-02', 'usr-reg-03', 'usr-reg-04', 'usr-reg-05');
DELETE FROM Record WHERE userId IN ('usr-off-01', 'usr-off-02', 'usr-off-03', 'usr-off-04', 'usr-off-05', 'usr-reg-01', 'usr-reg-02', 'usr-reg-03', 'usr-reg-04', 'usr-reg-05');
DELETE FROM User WHERE id IN ('usr-off-01', 'usr-off-02', 'usr-off-03', 'usr-off-04', 'usr-off-05', 'usr-reg-01', 'usr-reg-02', 'usr-reg-03', 'usr-reg-04', 'usr-reg-05');

-- 3. Remove synthetic admin accounts
DELETE FROM Admin WHERE id LIKE 'adm-loadtest-%';

-- 4. Remove synthetic test RSVPs
DELETE FROM UserRsvp WHERE eventId IN ('evt-pending-01', 'evt-pending-02', 'evt-active-rsvp-01', 'evt-active-rsvp-02');

-- 5. Remove synthetic test bulletins
DELETE FROM Bulletin WHERE id LIKE 'blt-pending-%' 
    OR title LIKE 'Community Question #%' 
    OR title LIKE 'Official Announcement #%';

-- 6. Remove synthetic test events
DELETE FROM Event WHERE id IN ('evt-pending-01', 'evt-pending-02', 'evt-active-rsvp-01', 'evt-active-rsvp-02');

COMMIT;

-- Reclaim freed disk space in SQLite
VACUUM;

