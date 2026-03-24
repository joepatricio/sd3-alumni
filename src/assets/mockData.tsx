export const generatePreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100).trim() + '...' : content;
};

export const generateTime = (event: any) => {
    const base = `${event.startTimeHour}:${event.startTimeMinute} ${event.startTimeAmPm} - ${event.endTimeHour}:${event.endTimeMinute} ${event.endTimeAmPm}`;
    return event.id === '7' ? `${base} (PHT)` : base;
};

export const userData = {
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    phone: '+63 917 123 4567',
    location: 'Cebu City, Philippines',
    graduationYear: '2015',
    degree: 'Bachelor of Science in Computer Science',
    school: 'University of San Jose-Recoletos',
    currentJob: 'Senior Software Engineer',
    company: 'Tech Solutions Inc.',
    bio: 'Passionate about technology and education. Proud Josenian alumna dedicated to giving back to the community through mentorship and volunteering.',
    profileImage:
        'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    primaryEducation: {
        school: 'Cebu Central Elementary School',
        year: '2005',
    },
    secondaryEducationJHS: {
        school: 'Cebu City National Science High School',
        year: '2009',
    },
    secondaryEducationSHS: {
        school: 'University of San Jose-Recoletos',
        year: '2011',
    },
    postGraduateEducation: {
        school: 'University of the Philippines Cebu',
        year: '2018',
        degree: 'Master of Science in Computer Science',
    },
    // TODO: 
    stats: [
        { iconName: 'Users', label: 'Connections', value: '248' },
        { iconName: 'Calendar', label: 'Events Attended', value: '12' },
        { iconName: 'Award', label: 'Achievements', value: '5' },
        { iconName: 'Heart', label: 'Donated Amount', value: '₱36,000.00' },
    ],
    recentActivity: [
        {
            id: '1',
            type: 'event',
            title: 'Attended Annual Homecoming 2026',
            date: 'March 15, 2026',
        },
        {
            id: '2',
            type: 'connection',
            title: 'Connected with John Doe',
            date: 'March 10, 2026',
        },
        {
            id: '3',
            type: 'volunteer',
            title: 'Volunteered at Community Service Day',
            date: 'February 28, 2026',
        },
    ],
};

export const connectionsData = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Software Engineer',
        company: 'Tech Corp',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'March 2026',
    },
    {
        id: '2',
        name: 'Jane Smith',
        role: 'Product Manager',
        company: 'Innovate Inc.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Feb 2026',
    },
    {
        id: '3',
        name: 'Michael Johnson',
        role: 'Data Scientist',
        company: 'Data Flows',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Jan 2026',
    },
    {
        id: '4',
        name: 'Sarah Williams',
        role: 'UX Designer',
        company: 'Creative Studio',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Dec 2025',
    },
    {
        id: '5',
        name: 'David Brown',
        role: 'Marketing Manager',
        company: 'Growth Ltd.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Nov 2025',
    },
];

export const comments = [
    {
        id: '1',
        author: {
            name: 'John Reyes',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        date: 'February 8, 2026, 3:45 PM',
        content: 'This is wonderful news! So proud to be part of an alumni community that gives back. Count me in as a contributor!',
        likes: 12,
    },
    {
        id: '2',
        author: {
            name: 'Anna Cruz',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        date: 'February 8, 2026, 5:20 PM',
        content: 'Love the mentorship component! I\'d be happy to volunteer as a mentor. How do I sign up?',
        likes: 8,
    },
    {
        id: '3',
        author: {
            name: 'Robert Tan',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        date: 'February 9, 2026, 9:10 AM',
        content: 'Excellent initiative! Will there be any information sessions for prospective applicants?',
        likes: 5,
    },
];

export const getDashboardContentStats = () => {
    const pendingEvents = events.filter(e => e.status === "Pending").length;
    const pendingBulletins = bulletins.filter(b => b.status === "Pending").length;

    const now = new Date();
    // Reset time for today to count events happening today as upcoming
    now.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => {
        if (e.status === "Rejected") return false;
        const eventDate = new Date(e.date);
        return eventDate >= now;
    }).length;

    return {
        pendingContent: pendingEvents + pendingBulletins,
        upcomingEvents: upcomingEvents
    };
};

export const bulletins = [
    {
        "id": "9",
        "title": "Mentorship Program 3",
        "author": {
            "name": "Sofia Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-06-30T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "5",
        "title": "Scholarship Program Launch 1",
        "author": {
            "name": "Juan Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-06-23T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "14",
        "title": "Campus Updates 1",
        "author": {
            "name": "Mark Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-06-20T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "47",
        "title": "Homecoming Highlights 5",
        "author": {
            "name": "Chris Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-06-16T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "31",
        "title": "Career Development Initiative 3",
        "author": {
            "name": "Juan Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-06-12T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "13",
        "title": "Scholarship Program Launch 4",
        "author": {
            "name": "Maria Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-06-09T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "6",
        "title": "Mentorship Program 2",
        "author": {
            "name": "Bea Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-06-06T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "19",
        "title": "Campus Updates 3",
        "author": {
            "name": "Bea Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-06-03T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "20",
        "title": "Career Development Initiative",
        "author": {
            "name": "Maria Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-06-02T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "46",
        "title": "Alumni Startup Success 9",
        "author": {
            "name": "Jose Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-05-31T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "23",
        "title": "Community Outreach",
        "author": {
            "name": "Jose Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-05-26T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "35",
        "title": "Alumni Startup Success 6",
        "author": {
            "name": "Paolo Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-05-21T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "30",
        "title": "Alumni Startup Success 4",
        "author": {
            "name": "Paolo Santos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-05-18T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "8",
        "title": "Alumni Startup Success 1",
        "author": {
            "name": "Bea Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-05-09T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "16",
        "title": "Scholarship Program Launch 5",
        "author": {
            "name": "John Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-05-07T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "42",
        "title": "Alumni Startup Success 8",
        "author": {
            "name": "Miguel Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-05-05T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "26",
        "title": "Career Development Initiative 2",
        "author": {
            "name": "Jose Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-04-29T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "25",
        "title": "Career Development Initiative 1",
        "author": {
            "name": "Juan Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-04-25T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "43",
        "title": "Mentorship Program 7",
        "author": {
            "name": "Angela Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-04-24T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "45",
        "title": "Career Development Initiative 4",
        "author": {
            "name": "Bea Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-04-24T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "18",
        "title": "Homecoming Highlights 2",
        "author": {
            "name": "John Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-04-16T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "3",
        "title": "Alumni Startup Success",
        "author": {
            "name": "Rica Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-04-15T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "28",
        "title": "Scholarship Program Launch 6",
        "author": {
            "name": "Chris Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-04-13T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "27",
        "title": "Alumni Startup Success 3",
        "author": {
            "name": "John Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-04-12T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "36",
        "title": "Homecoming Highlights 3",
        "author": {
            "name": "Sofia Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-04-11T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "37",
        "title": "Alumni Startup Success 7",
        "author": {
            "name": "Sofia Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-04-07T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "11",
        "title": "Campus Updates",
        "author": {
            "name": "Rica Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-04-05T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "7",
        "title": "Homecoming Highlights",
        "author": {
            "name": "Anne Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-04-01T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "38",
        "title": "Campus Updates 6",
        "author": {
            "name": "Bea Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-03-31T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "21",
        "title": "Alumni Startup Success 2",
        "author": {
            "name": "Paolo Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-03-26T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "39",
        "title": "Campus Updates 7",
        "author": {
            "name": "Miguel Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-03-24T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "1",
        "title": "Mentorship Program",
        "author": {
            "name": "Andrea Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-03-12T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "44",
        "title": "Community Outreach 1",
        "author": {
            "name": "Paolo Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-03-12T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "22",
        "title": "Mentorship Program 4",
        "author": {
            "name": "Paolo Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-03-10T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "12",
        "title": "Scholarship Program Launch 3",
        "author": {
            "name": "Juan Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-03-09T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "29",
        "title": "Mentorship Program 6",
        "author": {
            "name": "Chris Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-03-03T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "49",
        "title": "Career Development Initiative 6",
        "author": {
            "name": "Mark Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-02-27T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "48",
        "title": "Career Development Initiative 5",
        "author": {
            "name": "Angela Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-02-26T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "40",
        "title": "Homecoming Highlights 4",
        "author": {
            "name": "Anne Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-02-19T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "24",
        "title": "Mentorship Program 5",
        "author": {
            "name": "Chris Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-02-15T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "50",
        "title": "Scholarship Program Launch 8",
        "author": {
            "name": "Chris Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-02-11T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "33",
        "title": "Campus Updates 5",
        "author": {
            "name": "Anne Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-02-05T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "17",
        "title": "Homecoming Highlights 1",
        "author": {
            "name": "Rica Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-01-28T00:00:00.000Z",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "10",
        "title": "Scholarship Program Launch 2",
        "author": {
            "name": "Miguel Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-01-26T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "2",
        "title": "Mentorship Program 1",
        "author": {
            "name": "Miguel Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-01-23T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "15",
        "title": "Campus Updates 2",
        "author": {
            "name": "Jose Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-22T00:00:00.000Z",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Approved"
    },
    {
        "id": "32",
        "title": "Campus Updates 4",
        "author": {
            "name": "Daniel Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-21T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "34",
        "title": "Alumni Startup Success 5",
        "author": {
            "name": "Juan Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-01-18T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "41",
        "title": "Scholarship Program Launch 7",
        "author": {
            "name": "Daniel Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-01-11T00:00:00.000Z",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    },
    {
        "id": "4",
        "title": "Scholarship Program Launch",
        "author": {
            "name": "Paolo Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-07T00:00:00.000Z",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Approved"
    }
];

export const events = [
    {
        "id": "1",
        "title": "Virtual Event 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-04T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.337934,
            "lng": 123.92783
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Jose Reyes",
            "email": "virtual1@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 428,
            "invited": 609
        },
        "status": "Approved",
        "modality": "Zoom"
    },
    {
        "id": "2",
        "title": "Conference Event 2",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-11T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.258074,
            "lng": 123.926995
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "11",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "John Mendoza",
            "email": "conference2@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 226,
            "invited": 498
        },
        "status": "Approved"
    },
    {
        "id": "3",
        "title": "Networking Event 3",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-03T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.308461,
            "lng": 123.930352
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "3",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Andrea Flores",
            "email": "networking3@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 248,
            "invited": 577
        },
        "status": "Approved"
    },
    {
        "id": "4",
        "title": "Conference Event 4",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-25T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.297745,
            "lng": 123.926921
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Miguel Cruz",
            "email": "conference4@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 443,
            "invited": 222
        },
        "status": "Approved"
    },
    {
        "id": "5",
        "title": "Sports Event 5",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-23T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.344862,
            "lng": 123.87033
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "8",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Paolo Castro",
            "email": "sports5@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 24,
            "invited": 776
        },
        "status": "Approved"
    },
    {
        "id": "6",
        "title": "Networking Event 6",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-21T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.309817,
            "lng": 123.934732
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Daniel Cruz",
            "email": "networking6@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 395,
            "invited": 368
        },
        "status": "Approved"
    },
    {
        "id": "7",
        "title": "Sports Event 7",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-16T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.265315,
            "lng": 123.949908
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "8",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Miguel Mendoza",
            "email": "sports7@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 263,
            "invited": 824
        },
        "status": "Approved"
    },
    {
        "id": "8",
        "title": "Reunion Event 8",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-30T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.285363,
            "lng": 123.894578
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Anne Ramos",
            "email": "reunion8@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 91,
            "invited": 130
        },
        "status": "Approved"
    },
    {
        "id": "9",
        "title": "Conference Event 9",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-14T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.280887,
            "lng": 123.862492
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Angela Castro",
            "email": "conference9@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 117,
            "invited": 311
        },
        "status": "Approved"
    },
    {
        "id": "10",
        "title": "Workshop Event 10",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-10T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.265492,
            "lng": 123.867484
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Daniel Castro",
            "email": "workshop10@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 165,
            "invited": 196
        },
        "status": "Approved"
    },
    {
        "id": "11",
        "title": "Reunion Event 11",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-02T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.318671,
            "lng": 123.948921
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Paolo Ramos",
            "email": "reunion11@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 162,
            "invited": 151
        },
        "status": "Approved"
    },
    {
        "id": "12",
        "title": "Reunion Event 12",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-14T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.289082,
            "lng": 123.88621
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Rica Bautista",
            "email": "reunion12@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 57,
            "invited": 823
        },
        "status": "Approved"
    },
    {
        "id": "13",
        "title": "Networking Event 13",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-30T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.327692,
            "lng": 123.852201
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Chris Cruz",
            "email": "networking13@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 98,
            "invited": 413
        },
        "status": "Approved"
    },
    {
        "id": "14",
        "title": "Sports Event 14",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-30T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.265054,
            "lng": 123.926712
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Bea Aquino",
            "email": "sports14@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 377,
            "invited": 711
        },
        "status": "Approved"
    },
    {
        "id": "15",
        "title": "Networking Event 15",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-26T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.280102,
            "lng": 123.924803
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Andrea Castro",
            "email": "networking15@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 411,
            "invited": 554
        },
        "status": "Approved"
    },
    {
        "id": "16",
        "title": "Workshop Event 16",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-05T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.271963,
            "lng": 123.919962
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Maria Santos",
            "email": "workshop16@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 292,
            "invited": 138
        },
        "status": "Approved"
    },
    {
        "id": "17",
        "title": "Workshop Event 17",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-06T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.258988,
            "lng": 123.919493
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Maria Cruz",
            "email": "workshop17@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 23,
            "invited": 797
        },
        "status": "Approved"
    },
    {
        "id": "18",
        "title": "Workshop Event 18",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-12T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.304771,
            "lng": 123.854254
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Bea Torres",
            "email": "workshop18@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 62,
            "invited": 564
        },
        "status": "Approved"
    },
    {
        "id": "19",
        "title": "Workshop Event 19",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-05T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.313049,
            "lng": 123.896048
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Carla Torres",
            "email": "workshop19@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 72,
            "invited": 602
        },
        "status": "Approved"
    },
    {
        "id": "20",
        "title": "Networking Event 20",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-09T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.265959,
            "lng": 123.898656
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Carla Mendoza",
            "email": "networking20@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 190,
            "invited": 628
        },
        "status": "Approved"
    },
    {
        "id": "21",
        "title": "Networking Event 21",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-14T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.348468,
            "lng": 123.932069
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Angela Reyes",
            "email": "networking21@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 93,
            "invited": 728
        },
        "status": "Approved"
    },
    {
        "id": "22",
        "title": "Virtual Event 22",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-21T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.338289,
            "lng": 123.912625
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Andrea Santos",
            "email": "virtual22@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 290,
            "invited": 709
        },
        "status": "Approved",
        "modality": "Zoom"
    },
    {
        "id": "23",
        "title": "Sports Event 23",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-01T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.256973,
            "lng": 123.889216
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "6",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Rica Reyes",
            "email": "sports23@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 356,
            "invited": 518
        },
        "status": "Approved"
    },
    {
        "id": "24",
        "title": "Workshop Event 24",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-03T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.294248,
            "lng": 123.920367
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Angela Santos",
            "email": "workshop24@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 183,
            "invited": 884
        },
        "status": "Approved"
    },
    {
        "id": "25",
        "title": "Virtual Event 25",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-01T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.310542,
            "lng": 123.936931
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Anne Torres",
            "email": "virtual25@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 60,
            "invited": 120
        },
        "status": "Approved",
        "modality": "Google Meet"
    },
    {
        "id": "26",
        "title": "Workshop Event 26",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-29T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.281472,
            "lng": 123.873433
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "3",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Jose Torres",
            "email": "workshop26@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 18,
            "invited": 323
        },
        "status": "Approved"
    },
    {
        "id": "27",
        "title": "Virtual Event 27",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-18T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.295594,
            "lng": 123.945429
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "John Ramos",
            "email": "virtual27@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 468,
            "invited": 940
        },
        "status": "Approved",
        "modality": "Microsoft Teams"
    },
    {
        "id": "28",
        "title": "Virtual Event 28",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-24T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.265227,
            "lng": 123.884822
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Paolo Aquino",
            "email": "virtual28@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 132,
            "invited": 535
        },
        "status": "Approved",
        "modality": "Zoom"
    },
    {
        "id": "29",
        "title": "Reunion Event 29",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-25T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.343394,
            "lng": 123.892289
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Sofia Aquino",
            "email": "reunion29@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 109,
            "invited": 667
        },
        "status": "Approved"
    },
    {
        "id": "30",
        "title": "Reunion Event 30",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-30T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.323412,
            "lng": 123.862733
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Andrea Flores",
            "email": "reunion30@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 414,
            "invited": 400
        },
        "status": "Approved"
    },
    {
        "id": "31",
        "title": "Virtual Event 31",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-29T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.338929,
            "lng": 123.898123
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Daniel Flores",
            "email": "virtual31@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 117,
            "invited": 467
        },
        "status": "Approved",
        "modality": "Google Meet"
    },
    {
        "id": "32",
        "title": "Virtual Event 32",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-16T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.337383,
            "lng": 123.906707
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Anne Torres",
            "email": "virtual32@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 121,
            "invited": 574
        },
        "status": "Approved",
        "modality": "Google Meet"
    },
    {
        "id": "33",
        "title": "Networking Event 33",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-08T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.335339,
            "lng": 123.8804
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Andrea Castro",
            "email": "networking33@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 196,
            "invited": 992
        },
        "status": "Approved"
    },
    {
        "id": "34",
        "title": "Conference Event 34",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-03T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.297415,
            "lng": 123.913776
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Bea Ramos",
            "email": "conference34@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 176,
            "invited": 870
        },
        "status": "Approved"
    },
    {
        "id": "35",
        "title": "Networking Event 35",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-20T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.335446,
            "lng": 123.916989
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "2",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Anne Mendoza",
            "email": "networking35@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 372,
            "invited": 970
        },
        "status": "Approved"
    },
    {
        "id": "36",
        "title": "Reunion Event 36",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-13T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.33115,
            "lng": 123.867926
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Paolo Flores",
            "email": "reunion36@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 239,
            "invited": 306
        },
        "status": "Approved"
    },
    {
        "id": "37",
        "title": "Networking Event 37",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-15T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.349838,
            "lng": 123.870603
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Bea Torres",
            "email": "networking37@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 104,
            "invited": 675
        },
        "status": "Approved"
    },
    {
        "id": "38",
        "title": "Virtual Event 38",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-05T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.265455,
            "lng": 123.921455
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Chris Flores",
            "email": "virtual38@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 472,
            "invited": 245
        },
        "status": "Approved",
        "modality": "Microsoft Teams"
    },
    {
        "id": "39",
        "title": "Workshop Event 39",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-12T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.295767,
            "lng": 123.931991
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Juan Santos",
            "email": "workshop39@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 163,
            "invited": 163
        },
        "status": "Approved"
    },
    {
        "id": "40",
        "title": "Conference Event 40",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-06T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.276269,
            "lng": 123.941169
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Anne Torres",
            "email": "conference40@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 92,
            "invited": 306
        },
        "status": "Approved"
    },
    {
        "id": "41",
        "title": "Workshop Event 41",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-03T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.284072,
            "lng": 123.923197
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "2",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Sofia Torres",
            "email": "workshop41@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 52,
            "invited": 385
        },
        "status": "Approved"
    },
    {
        "id": "42",
        "title": "Sports Event 42",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-01T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.346976,
            "lng": 123.909217
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Daniel Flores",
            "email": "sports42@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 472,
            "invited": 993
        },
        "status": "Approved"
    },
    {
        "id": "43",
        "title": "Conference Event 43",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-13T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.274758,
            "lng": 123.885716
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "6",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Daniel Garcia",
            "email": "conference43@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 292,
            "invited": 791
        },
        "status": "Approved"
    },
    {
        "id": "44",
        "title": "Virtual Event 44",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-16T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.309018,
            "lng": 123.93549
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Sofia Cruz",
            "email": "virtual44@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 341,
            "invited": 590
        },
        "status": "Approved",
        "modality": "Zoom"
    },
    {
        "id": "45",
        "title": "Conference Event 45",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-11T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.274725,
            "lng": 123.898147
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Angela Mendoza",
            "email": "conference45@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 35,
            "invited": 759
        },
        "status": "Approved"
    },
    {
        "id": "46",
        "title": "Sports Event 46",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-01T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.336541,
            "lng": 123.943415
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Paolo Santos",
            "email": "sports46@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 334,
            "invited": 504
        },
        "status": "Approved"
    },
    {
        "id": "47",
        "title": "Workshop Event 47",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-30T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.335221,
            "lng": 123.854507
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "11",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Jose Flores",
            "email": "workshop47@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 55,
            "invited": 844
        },
        "status": "Approved"
    },
    {
        "id": "48",
        "title": "Virtual Event 48",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-22T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.297636,
            "lng": 123.882512
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Andrea Reyes",
            "email": "virtual48@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 280,
            "invited": 244
        },
        "status": "Approved",
        "modality": "Google Meet"
    },
    {
        "id": "49",
        "title": "Virtual Event 49",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-20T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.257913,
            "lng": 123.927976
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Sofia Aquino",
            "email": "virtual49@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 328,
            "invited": 699
        },
        "status": "Approved",
        "modality": "Zoom"
    },
    {
        "id": "50",
        "title": "Reunion Event 50",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-23T00:00:00.000Z",
        get time() {
            return generateTime(this);
        },
        "location": {
            "region": "Central Visayas",
            "regionCode": "070000000",
            "province": "Cebu",
            "provinceCode": "072200000",
            "cityMunicipality": "City of Cebu",
            "cityCode": "072217000",
            "barangay": "Sample Barangay",
            "landmark": "Sample Landmark",
            "street": "Sample Street",
            "lat": 10.331823,
            "lng": 123.912506
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "11",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Juan Bautista",
            "email": "reunion50@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 447,
            "invited": 989
        },
        "status": "Approved"
    }
];