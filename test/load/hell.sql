-- ==============================================================================
-- PRE-TEST DATABASE SETUP SCRIPT FOR HIGH-CONCURRENCY LOAD TESTING
-- Target: https://najealp.top (dev.db SQLite Database)
-- Password for all generated test accounts: 123456
-- Bcrypt Hash (cost 10): $2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW
-- ==============================================================================
--
-- ------------------------------------------------------------------------------
-- STEP 1: VPS SAFETY BACKUP
-- Run this in bash on the VPS BEFORE running this SQL file:
--   cp dev.db dev.db.bak_pre_stress_$(date +%s)
-- ------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------
-- STEP 2: PROVISION 10 DEDICATED ADMINISTRATORS
-- Usernames: admin1 through admin10 | Password: "123456"
-- ------------------------------------------------------------------------------
INSERT INTO Admin (id, username, passwordHash, lastLogin)
VALUES 
    ('adm-loadtest-01', 'admin1', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-02', 'admin2', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-03', 'admin3', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-04', 'admin4', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-05', 'admin5', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-06', 'admin6', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-07', 'admin7', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-08', 'admin8', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-09', 'admin9', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP),
    ('adm-loadtest-10', 'admin10', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP)
ON CONFLICT(username) DO UPDATE SET 
    passwordHash = excluded.passwordHash,
    lastLogin = CURRENT_TIMESTAMP;

-- ------------------------------------------------------------------------------
-- STEP 3: PROVISION 5 VERIFIED OFFICIAL TEST USERS
-- Emails: test.official1@najealp.top to test.official5@najealp.top | Password: "123456"
-- Status: Official ('OWOyGJzHfV') | Profile: Public ('kvf-XCOljU')
-- ------------------------------------------------------------------------------

-- User 1 (Official)
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-off-01', 'OWOyGJzHfV', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-off-01', 'test.official1@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-off-01', 'Official Tester One', 'Female', 'Verified Official Load Test Account', 'test.official1@najealp.top', 'hd2F5ini8q', 2022);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-off-01', 5, 2, 5, 3, 10, 2, 500.0, CURRENT_TIMESTAMP);

-- User 2 (Official)
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-off-02', 'OWOyGJzHfV', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-off-02', 'test.official2@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-off-02', 'Official Tester Two', 'Male', 'Verified Official Load Test Account', 'test.official2@najealp.top', 'GISquVZHHs', 2021);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-off-02', 4, 1, 3, 2, 8, 1, 250.0, CURRENT_TIMESTAMP);

-- User 3 (Official)
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-off-03', 'OWOyGJzHfV', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-off-03', 'test.official3@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-off-03', 'Official Tester Three', 'Female', 'Verified Official Load Test Account', 'test.official3@najealp.top', 'AUG-4vBe6k', 2023);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-off-03', 6, 3, 4, 4, 15, 3, 1000.0, CURRENT_TIMESTAMP);

-- User 4 (Official)
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-off-04', 'OWOyGJzHfV', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-off-04', 'test.official4@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-off-04', 'Official Tester Four', 'Male', 'Verified Official Load Test Account', 'test.official4@najealp.top', 'YZcAIyFl6L', 2020);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-off-04', 3, 2, 2, 1, 5, 1, 100.0, CURRENT_TIMESTAMP);

-- User 5 (Official)
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-off-05', 'OWOyGJzHfV', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-off-05', 'test.official5@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-off-05', 'Official Tester Five', 'Female', 'Verified Official Load Test Account', 'test.official5@najealp.top', 'hd2F5ini8q', 2024);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-off-05', 8, 4, 6, 5, 20, 4, 1500.0, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- STEP 4: PROVISION 5 REGULAR TEST USERS
-- Emails: test.regular1@najealp.top to test.regular5@najealp.top | Password: "123456"
-- Status: Regular ('2Ue2cfwVMa') | Profile: Public ('kvf-XCOljU')
-- ------------------------------------------------------------------------------

-- Regular 1
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-reg-01', '2Ue2cfwVMa', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-reg-01', 'test.regular1@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-reg-01', 'Regular Tester One', 'Male', 'Regular Test Member', 'test.regular1@najealp.top', 'hd2F5ini8q', 2024);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-reg-01', 1, 0, 0, 0, 2, 0, 0.0, CURRENT_TIMESTAMP);

-- Regular 2
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-reg-02', '2Ue2cfwVMa', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-reg-02', 'test.regular2@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-reg-02', 'Regular Tester Two', 'Female', 'Regular Test Member', 'test.regular2@najealp.top', 'N3MmjKro9B', 2023);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-reg-02', 2, 1, 0, 1, 4, 0, 0.0, CURRENT_TIMESTAMP);

-- Regular 3
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-reg-03', '2Ue2cfwVMa', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-reg-03', 'test.regular3@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-reg-03', 'Regular Tester Three', 'Male', 'Regular Test Member', 'test.regular3@najealp.top', 'hAoJF3hX0R', 2022);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-reg-03', 0, 0, 0, 0, 1, 0, 0.0, CURRENT_TIMESTAMP);

-- Regular 4
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-reg-04', '2Ue2cfwVMa', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-reg-04', 'test.regular4@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-reg-04', 'Regular Tester Four', 'Female', 'Regular Test Member', 'test.regular4@najealp.top', 'GISquVZHHs', 2025);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-reg-04', 1, 0, 0, 0, 0, 0, 0.0, CURRENT_TIMESTAMP);

-- Regular 5
INSERT OR REPLACE INTO User (id, userStatusId, profileStatusId)
VALUES ('usr-reg-05', '2Ue2cfwVMa', 'kvf-XCOljU');
INSERT OR REPLACE INTO UserAuth (userId, email, passwordHash, lastLogin)
VALUES ('usr-reg-05', 'test.regular5@najealp.top', '$2b$10$OWJFhm7ALzwkqTNSmE0qYO0hwTnHlGLAG8s5qAMmfqvhHozxa4ZzW', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO Profile (userId, userName, gender, bio, email, degreeId, batch)
VALUES ('usr-reg-05', 'Regular Tester Five', 'Male', 'Regular Test Member', 'test.regular5@najealp.top', 'hd2F5ini8q', 2021);
INSERT OR REPLACE INTO UserStatistic (userId, userConnections, eventsAttended, eventsCreated, bulletinsCreated, commentsWritten, achievements, donatedAmount, dateRegistered)
VALUES ('usr-reg-05', 3, 1, 0, 1, 3, 1, 50.0, CURRENT_TIMESTAMP);

-- ------------------------------------------------------------------------------
-- STEP 5: PROVISION PENDING & APPROVED ITEMS FOR MODERATION TESTING
-- Creates 5 pending bulletins and 3 pending events for admins to approve/reject
-- ------------------------------------------------------------------------------

-- Pending Bulletins ('a6ze5OaKs0')
INSERT OR REPLACE INTO Bulletin (id, title, content, contentStatusId, authorId, bulletinDate)
VALUES 
    ('blt-pending-01', 'Alumni Homecoming Planning 2026', 'Draft agenda for the upcoming grand homecoming banquet and symposium.', 'a6ze5OaKs0', 'usr-off-01', CURRENT_TIMESTAMP),
    ('blt-pending-02', 'Mentorship Program Signups', 'Seeking senior engineers to mentor graduating batch of 2026.', 'a6ze5OaKs0', 'usr-off-02', CURRENT_TIMESTAMP),
    ('blt-pending-03', 'Robotics Lab Equipment Fund', 'Call for donations to upgrade university microcontroller kits.', 'a6ze5OaKs0', 'usr-reg-02', CURRENT_TIMESTAMP),
    ('blt-pending-04', 'Start-up Pitch Night Cebu', 'Calling all alumni founders to pitch in front of angel investors.', 'a6ze5OaKs0', 'usr-off-03', CURRENT_TIMESTAMP),
    ('blt-pending-05', 'Career Transition AMA', 'Join us next week for an AMA on transitioning from hardware to cloud dev.', 'a6ze5OaKs0', 'usr-reg-05', CURRENT_TIMESTAMP);

-- Pending Events ('G0sRtXA38I') & Approved Events for RSVP ('j3Ua4WQwdl')
INSERT OR REPLACE INTO Event (id, title, description, eventStatusId, authorId, eventDate, modality)
VALUES 
    ('evt-pending-01', 'Annual General Assembly 2026', 'Official election of new alumni board officers and annual report.', 'G0sRtXA38I', 'usr-off-01', '2026-12-15 09:00:00', 'In-Person'),
    ('evt-pending-02', 'Tech Leadership Panel', 'A keynote panel discussing AI agents and sustainable computing.', 'G0sRtXA38I', 'usr-off-02', '2026-11-25 14:00:00', 'Virtual'),
    ('evt-active-rsvp-01', 'High Concurrency Mega Meetup', 'Active event receiving massive RSVPs from Regular & Official members.', 'j3Ua4WQwdl', 'usr-off-01', '2026-11-30 18:00:00', 'In-Person'),
    ('evt-active-rsvp-02', 'Alumni Hackathon 2026', 'Active event receiving massive RSVPs to test event concluding workflow.', 'j3Ua4WQwdl', 'usr-off-03', '2026-11-28 10:00:00', 'Virtual');

