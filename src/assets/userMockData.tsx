// For now, directory and profile DB are isolated. Profile should refer to directory data in final product
// Remove generateUsers in adminMockData to actually refer to data here.
export const achievements = [
    { id: '1', achievement_tier: 1, achievement_title: '1-Year Club', description: 'Has been a member for 1 year.', achievement_icon: 'Star' },
    { id: '1', achievement_tier: 2, achievement_title: '3-Year Club', description: 'Has been a member for 3 years.', achievement_icon: 'Sparkle' },
    { id: '1', achievement_tier: 3, achievement_title: 'Prestige Alumni', description: 'Has been a member for 10+ years.', achievement_icon: 'Sparkles' },
    { id: '2', achievement_tier: 1, achievement_title: 'Philanthropist I', description: 'Donated up to ₱5,000.', achievement_icon: 'Heart' },
    { id: '2', achievement_tier: 2, achievement_title: 'Philanthropist II', description: 'Donated up to ₱20,000.', achievement_icon: 'HeartPulse' },
    { id: '2', achievement_tier: 3, achievement_title: 'Philanthropist III', description: 'Donated up to ₱50,000.', achievement_icon: 'HandCoins' },
    { id: '3', achievement_tier: 1, achievement_title: 'Event Enthusiast I', description: 'Attended 5 events.', achievement_icon: 'Calendar' },
    { id: '3', achievement_tier: 2, achievement_title: 'Event Enthusiast II', description: 'Attended 15 events.', achievement_icon: 'CalendarDays' },
    { id: '4', achievement_tier: 1, achievement_title: 'Conversation Starter I', description: 'Created 1 bulletin.', achievement_icon: 'Newspaper' },
    { id: '4', achievement_tier: 2, achievement_title: 'Conversation Starter II', description: 'Created 5 bulletins.', achievement_icon: 'Newspaper' },
    { id: '5', achievement_tier: 1, achievement_title: 'Contributor I', description: 'Written 10 comments.', achievement_icon: 'MessageSquare' },
    { id: '5', achievement_tier: 2, achievement_title: 'Contributor II', description: 'Written 50 comments.', achievement_icon: 'MessageCircle' },
    { id: '10000', achievement_tier: 1, achievement_title: 'READS Alumni', description: 'Part of the Recoletos Educational Assistance for Deserving Students.', achievement_icon: 'BookOpen' },
    { id: '10001', achievement_tier: 1, achievement_title: 'Verified', description: 'User has been verified.', achievement_icon: 'Gear' },
];
export const degree = [
    { degree_id: 100, degree_name: 'Mechanical Engineering', degree_abbr: 'BSME' },
    { degree_id: 101, degree_name: 'Civil Engineering', degree_abbr: 'BSCE' },
    { degree_id: 102, degree_name: 'Industrial Engineering', degree_abbr: 'BSIE' },
    { degree_id: 103, degree_name: 'Electrical Engineering', degree_abbr: 'BSEE' },
    { degree_id: 104, degree_name: 'Electronics and Communications Engineering', degree_abbr: 'BSECE' },
    { degree_id: 105, degree_name: 'Computer Engineering', degree_abbr: 'BSCpE' }
];
export const connectionStatus = { '500': 'Pending', '501': 'Accepted', '502': 'Blocked' };
export const userStatus = { '400': 'Pending', '401': 'Regular', '402': 'Official', '403': 'Suspended', '404': 'Banned' };

// User data
export const user = [
    { user_id: '1', status_id: '400', current_record_id: '1' },
    { user_id: '2', status_id: '401', current_record_id: '2' },
    { user_id: '3', status_id: '402', current_record_id: '3' },
    { user_id: '4', status_id: '403', current_record_id: '4' }
];
// Passwords hashed with bCrypt 
export const userAuth = [
    { user_id: '1', email: 'maria.santos@example.com', password_hash: '$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y', last_login: '2025-01-01' },
    { user_id: '2', email: 'juan.dela.cruz@example.com', password_hash: '$2a$10$WMKCQI6WaDp05xN3Z9EI2.U8vkWiMqDQqxoSBbhk1ZySIpJqzxRm.', last_login: '2025-01-01' },
    { user_id: '3', email: 'pedro.sanchez@example.com', password_hash: '$2a$10$7uOwsviOXiEL4L80plIJX.U/igdJW5/SkM8kboH2U.XW10bVBClaa', last_login: '2025-01-01' },
    { user_id: '4', email: 'maria.santos@example.com', password_hash: '$2a$10$OsanOVVGOk5T12X.TqAOb.zZCFAFwAKZ972kj8Ad1GPfEFQr//tJy', last_login: '2025-01-01' }
]
export const userRecords = [
    { record_id: '1', user_id: '1', status_id: '401', date_created: '2022-01-01', description: 'User created', date_expires: null },
    { record_id: '2', user_id: '2', status_id: '402', date_created: '2022-01-01', description: 'User verified', date_expires: null },
    { record_id: '3', user_id: '3', status_id: '403', date_created: '2022-01-01', description: 'User suspended', date_expires: '2022-01-07' },
    { record_id: '4', user_id: '4', status_id: '404', date_created: '2022-01-01', description: 'User banned', date_expires: null }
];
export const userStatistics = [
    { user_id: '1', date_created: '2022-01-01', connections: 0, events_attended: 0, achievements: 0, donated_amount: 0 },
    { user_id: '2', date_created: '2022-01-01', connections: 0, events_attended: 0, achievements: 0, donated_amount: 0 },
    { user_id: '3', date_created: '2022-01-01', connections: 0, events_attended: 0, achievements: 0, donated_amount: 0 },
    { user_id: '4', date_created: '2022-01-01', connections: 0, events_attended: 0, achievements: 0, donated_amount: 0 }
];
export const userAchievements = [
    { user_id: '1', achievement_id: '1', achievement_tier: 4, achieved_date: '2022-01-01' },
    { user_id: '1', achievement_id: '2', achievement_tier: 3, achieved_date: '2022-01-02' },
    { user_id: '1', achievement_id: '3', achievement_tier: 2, achieved_date: '2022-01-03' },
    { user_id: '1', achievement_id: '4', achievement_tier: 2, achieved_date: '2022-01-04' },
    { user_id: '3', achievement_id: '3', achievement_tier: 1, achieved_date: '2022-01-03' },
    { user_id: '3', achievement_id: '4', achievement_tier: 2, achieved_date: '2022-01-04' },
    { user_id: '3', achievement_id: '1', achievement_tier: 2, achieved_date: '2022-01-05' },
    { user_id: '4', achievement_id: '1', achievement_tier: 1, achieved_date: '2022-01-05' },
    { user_id: '3', achievement_id: '10001', achievement_tier: 1, achieved_date: '2022-01-05' },
    { user_id: '4', achievement_id: '10000', achievement_tier: 1, achieved_date: '2022-01-05' }
];
// Linked table with duplicate entries
// i.e. if user 1 is friends with user 2, there will be two entries: one for user 1 and one for user 2
export const userConnections = [
    { user_id: '1', friend_id: '2', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '2', friend_id: '1', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '1', friend_id: '3', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '3', friend_id: '1', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '1', friend_id: '4', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '4', friend_id: '1', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '2', friend_id: '4', connection_id: '501', date_updated: '2022-01-01' },
    { user_id: '4', friend_id: '2', connection_id: '501', date_updated: '2022-01-01' },
];
export const userRSVP = [
    { user_id: '1', event_id: '1', is_attending: true },
    { user_id: '2', event_id: '1', is_attending: false },
    { user_id: '3', event_id: '1', is_attending: true },
    { user_id: '4', event_id: '1', is_attending: false }
];
export const profileData = [
    {
        user_id: '1',
        user_name: 'Maria Santos',
        email: 'maria.santos@example.com',
        phone: '+63 917 123 4567',
        location: 'Cebu City, Philippines',
        currentJob: 'Senior Software Engineer',
        company: 'Tech Solutions Inc.',
        profileImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        user_id: '2',
        user_name: 'Pedro Sanchez',
        email: 'pedro.sanchez@example.com',
        phone: '+63 917 123 4567',
        location: 'Cebu City, Philippines',
        currentJob: 'Chief Executive Officer',
        company: 'Tech Solutions Inc.',
        profileImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        user_id: '3',
        user_name: 'Juan Dela Cruz',
        email: 'juan.dela.cruz@example.com',
        phone: '+63 917 123 4567',
        location: 'Cebu City, Philippines',
        currentJob: 'Software Engineer',
        company: 'Tech Solutions Inc.',
        profileImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        user_id: '4',
        user_name: 'Maria Piattos',
        email: 'maria.piattos@example.com',
        phone: '+63 917 123 4567',
        location: 'Cebu City, Philippines',
        currentJob: 'Scammer',
        company: 'Scam Inc.',
        profileImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080'
    }
];
export const profileIndexable = [
    {
        user_id: '1',
        degree_id: '105',
        batch: 2015,
        normalized_name: 'maria santos',
        normalized_company: 'tech solutions inc.'
    },
    {
        user_id: '2',
        degree_id: '104',
        batch: 2015,
        normalized_name: 'pedro sanchez',
        normalized_company: 'tech solutions inc.'
    },
    {
        user_id: '3',
        degree_id: '103',
        batch: 2015,
        normalized_name: 'juan dela cruz',
        normalized_company: 'tech solutions inc.'
    },
    {
        user_id: '4',
        degree_id: '102',
        batch: 2015,
        normalized_name: 'maria piattos',
        normalized_company: 'scam inc.'
    }
];