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
    stats: [
        { iconName: 'Users', label: 'Connections', value: '248' },
        { iconName: 'Calendar', label: 'Events Attended', value: '12' },
        { iconName: 'Award', label: 'Achievements', value: '5' },
        { iconName: 'Heart', label: 'Donated Amount', value: '₱36,000.00' },
    ],
    recentActivity: [
        {
            id: 1,
            type: 'event',
            title: 'Attended Annual Homecoming 2026',
            date: 'March 15, 2026',
        },
        {
            id: 2,
            type: 'connection',
            title: 'Connected with John Doe',
            date: 'March 10, 2026',
        },
        {
            id: 3,
            type: 'volunteer',
            title: 'Volunteered at Community Service Day',
            date: 'February 28, 2026',
        },
    ],
};

export const connectionsData = [
    {
        id: 1,
        name: 'John Doe',
        role: 'Software Engineer',
        company: 'Tech Corp',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'March 2026',
    },
    {
        id: 2,
        name: 'Jane Smith',
        role: 'Product Manager',
        company: 'Innovate Inc.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Feb 2026',
    },
    {
        id: 3,
        name: 'Michael Johnson',
        role: 'Data Scientist',
        company: 'Data Flows',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Jan 2026',
    },
    {
        id: 4,
        name: 'Sarah Williams',
        role: 'UX Designer',
        company: 'Creative Studio',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Dec 2025',
    },
    {
        id: 5,
        name: 'David Brown',
        role: 'Marketing Manager',
        company: 'Growth Ltd.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.1.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80',
        connectedSince: 'Nov 2025',
    },
];

export const bulletins = [
    {
        id: '1',
        title: 'USJR Alumni Association Announces New Scholarship Program',
        author: {
            name: 'Maria Santos',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Alumni Relations Director',
        },
        date: 'February 8, 2026',
        readTime: '5 min read',
        preview: 'We are thrilled to announce the launch of our new scholarship program aimed at supporting deserving students...',
        content: `We are thrilled to announce the launch of our new scholarship program aimed at supporting deserving students from underserved communities. This initiative reflects our commitment to giving back and ensuring that quality education remains accessible to all.

The scholarship will cover full tuition for qualified applicants and includes a mentorship component where recipients will be paired with successful alumni in their field of interest. This mentorship aspect is designed to provide not just financial support, but also guidance and networking opportunities that can help shape successful careers.

Our goal is to support 50 students in the first year, with plans to expand the program based on available funding and alumni contributions. We believe that investing in education is one of the most impactful ways we can contribute to society and honor the legacy of USJR.

Applications will open on March 1, 2026, and will be evaluated based on academic merit, financial need, and demonstrated commitment to community service. We encourage all eligible students to apply and take advantage of this opportunity.

We are grateful to the many alumni who have already pledged their support for this program. If you're interested in contributing or learning more about how you can help, please visit our donations page or contact the Alumni Relations Office directly.`,
        heroImage: 'https://images.unsplash.com/photo-1725738704638-361eac814fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjYW1wdXMlMjBsaWZlfGVufDF8fHx8MTc3MDcwNTY0OXww&ixlib=rb-4.1.0&q=80&w=1080',
        isUserSubmitted: false,
    },
    {
        id: '2',
        title: 'Tech Startup Founded by USJR Alumnus Raises $2M in Seed Funding',
        author: {
            name: 'John Reyes',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Tech Entrepreneur',
        },
        date: 'February 6, 2026',
        readTime: '4 min read',
        preview: 'A technology startup founded by USJR alumnus Michael Torres has successfully raised $2 million in seed funding...',
        content: 'A technology startup founded by USJR alumnus Michael Torres has successfully raised $2 million in seed funding from prominent venture capital firms. The company, which focuses on AI-powered educational tools, aims to revolutionize how students learn and engage with course materials. Torres, who graduated with a degree in Computer Science in 2018, credits his education at USJR for laying the foundation of his entrepreneurial journey.',
        heroImage: 'https://images.unsplash.com/photo-1725203653092-494c7eec1a30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMGFydGljbGV8ZW58MXx8fHwxNzcwNzA1NjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        isUserSubmitted: true,
    },
    {
        id: '3',
        title: 'Annual Homecoming 2026: A Grand Celebration of Josenian Spirit',
        author: {
            name: 'Alumni Relations Office',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Official',
        },
        date: 'February 5, 2026',
        readTime: '3 min read',
        preview: 'This year\'s homecoming was truly unforgettable! Over 5,000 alumni gathered to reconnect, reminisce...',
        content: 'This year\'s homecoming was truly unforgettable! Over 5,000 alumni gathered to reconnect, reminisce, and celebrate the enduring Josenian spirit that binds us all. The event featured inspiring talks from distinguished alumni, cultural performances, and a grand alumni parade. Special recognition was given to the Golden Jubilarians - members of the Class of 1976 - who celebrated 50 years since graduation. The festivities concluded with a spectacular fireworks display that lit up the Cebu sky.',
        heroImage: 'https://images.unsplash.com/photo-1758270703662-b7d58bf0a8a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZ3JhZHVhdGVzJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzcwNjkwNjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        isUserSubmitted: false,
    },
    {
        id: '4',
        title: 'Looking for Batch 2010 Classmates for Mini Reunion',
        author: {
            name: 'Anna Cruz',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Alumna',
        },
        heroImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        date: 'February 3, 2026',
        readTime: '2 min read',
        preview: 'Hello fellow Josenians from the Class of 2010! I\'m organizing a mini reunion for our batch...',
        content: 'Hello fellow Josenians from the Class of 2010! I\'m organizing a mini reunion for our batch and would love to reconnect with everyone. We\'re planning to meet on March 15th at the campus. Please reach out if you\'re interested in joining! It\'s been 16 years since we graduated, and I think it would be wonderful to catch up, share stories, and see how everyone\'s journey has unfolded. Looking forward to seeing familiar faces!',
        isUserSubmitted: true,
    },
    {
        id: '5',
        title: 'New Alumni Mentorship Program Launches Next Month',
        author: {
            name: 'Career Development Office',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Official',
        },
        date: 'February 1, 2026',
        readTime: '4 min read',
        preview: 'We are excited to introduce our new Alumni Mentorship Program, connecting experienced professionals with recent graduates...',
        content: 'We are excited to introduce our new Alumni Mentorship Program, connecting experienced professionals with recent graduates and current students. This program aims to foster meaningful relationships that will help guide the next generation of Josenians in their career paths. Mentors will provide insights, advice, and support based on their own professional experiences. If you\'re interested in becoming a mentor or mentee, registration opens next month through the alumni portal.',
        heroImage: 'https://images.unsplash.com/photo-1741835698663-c1860b7d1f53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ld3MlMjBhcnRpY2xlfGVufDF8fHx8MTc3MDY5MjYwMXww&ixlib=rb-4.1.0&q=80&w=1080',
        isUserSubmitted: false,
    },
    {
        id: '6',
        title: 'Virtual Campus Tour Now Available for Global Alumni',
        author: {
            name: 'Digital Services',
            image: 'https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBhZXJpYWx8ZW58MXx8fHwxNzcwMDQ5MzI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
            role: 'Official',
        },
        date: 'January 18, 2026',
        readTime: '2 min read',
        preview: 'Experience the newly renovated USJR campus from anywhere in the world with our interactive 360-degree virtual tour featuring all major facilities.',
        content: 'Experience the newly renovated USJR campus from anywhere in the world with our interactive 360-degree virtual tour featuring all major facilities. Walk through the halls, visit the library, and see the new sports complex from the comfort of your home. This virtual tour is part of our digital transformation initiative to keep alumni connected to the campus.',
        heroImage: 'https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBhZXJpYWx8ZW58MXx8fHwxNzcwMDQ5MzI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        isUserSubmitted: false,
    },
];

export const comments = [
    {
        id: 1,
        author: {
            name: 'John Reyes',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        date: 'February 8, 2026, 3:45 PM',
        content: 'This is wonderful news! So proud to be part of an alumni community that gives back. Count me in as a contributor!',
        likes: 12,
    },
    {
        id: 2,
        author: {
            name: 'Anna Cruz',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        date: 'February 8, 2026, 5:20 PM',
        content: 'Love the mentorship component! I\'d be happy to volunteer as a mentor. How do I sign up?',
        likes: 8,
    },
    {
        id: 3,
        author: {
            name: 'Robert Tan',
            image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        date: 'February 9, 2026, 9:10 AM',
        content: 'Excellent initiative! Will there be any information sessions for prospective applicants?',
        likes: 5,
    },
];

export const events = [
    {
        id: 1,
        title: 'Annual Homecoming Celebration 2026',
        description: 'Join us for the biggest alumni gathering of the year! Reconnect with classmates, enjoy live entertainment, campus tours, and celebrate Josenian pride together.',
        date: 'March 15, 2026',
        time: '9:00 AM - 5:00 PM',
        location: 'USJR Main Campus, Cebu City',
        category: 'Reunion',
        image: 'https://images.unsplash.com/photo-1770097042618-438684ff665f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjZWxlYnJhdGlvbiUyMGV2ZW50fGVufDF8fHx8MTc3MDI3MTkyOXww&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "9",
        startTimeMinute: "00",
        startTimeAmPm: "AM",
        endTimeHour: "5",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "Magallanes St, Cebu City, 6000 Cebu",
        organizer: {
            name: "USJR Alumni Association",
            contactName: "Maria Santos",
            email: "alumni@usjr.edu.ph",
            phone: "(032) 123-4567",
            website: "www.usjr-alumni.org",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 142,
            invited: 500
        }
    },
    {
        id: 2,
        title: 'Professional Networking Night: Tech & Innovation',
        description: 'Connect with fellow Josenian professionals in the technology and innovation sectors. Share insights, explore collaborations, and expand your network.',
        date: 'February 28, 2026',
        time: '6:00 PM - 9:00 PM',
        location: 'Oakridge Business Park, Cebu',
        category: 'Networking',
        image: 'https://images.unsplash.com/photo-1761195689615-9469b65dac01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudCUyMHByb2Zlc3Npb25hbHN8ZW58MXx8fHwxNzcwMTU3OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "6",
        startTimeMinute: "00",
        startTimeAmPm: "PM",
        endTimeHour: "9",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "A.S. Fortuna St, Mandaue City, Cebu",
        organizer: {
            name: "USJR Alumni Tech Club",
            contactName: "John Doe",
            email: "tech@usjr-alumni.org",
            phone: "(032) 987-6543",
            website: "www.usjr-tech.org",
            image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 45,
            invited: 100
        }
    },
    {
        id: 3,
        title: 'Leadership Summit: Alumni Edition',
        description: 'A full-day conference featuring keynote speakers, panel discussions, and workshops on leadership, entrepreneurship, and professional development.',
        date: 'March 22, 2026',
        time: '8:00 AM - 6:00 PM',
        location: 'Radisson Blu Hotel, Cebu City',
        category: 'Conference',
        image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25mZXJlbmNlJTIwc2VtaW5hcnxlbnwxfHx8fDE3NzAyNzE5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "8",
        startTimeMinute: "00",
        startTimeAmPm: "AM",
        endTimeHour: "6",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "Sergio Osmeña Jr Blvd, Cebu City, 6000 Cebu",
        organizer: {
            name: "USJR Business Alumni",
            contactName: "Jane Smith",
            email: "business@usjr-alumni.org",
            phone: "(032) 555-1212",
            website: "www.usjr-business.org",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 80,
            invited: 200
        }
    },
    {
        id: 4,
        title: 'Class of 2016 10-Year Reunion',
        description: 'Celebrate a decade since graduation! Reminisce about college memories, catch up with classmates, and see how far we\'ve all come in our respective journeys.',
        date: 'April 5, 2026',
        time: '5:00 PM - 11:00 PM',
        location: 'Waterfront Hotel, Cebu City',
        category: 'Reunion',
        image: 'https://images.unsplash.com/photo-1717944186818-c628ca7c2b99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBtaW5nbGluZyUyMHNvY2lhbCUyMGV2ZW50fGVufDF8fHx8MTc3MDI3MTkyOXww&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "5",
        startTimeMinute: "00",
        startTimeAmPm: "PM",
        endTimeHour: "11",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "Salinas Dr, Lahug, Cebu City, 6000 Cebu",
        organizer: {
            name: "Batch 2016 Committee",
            contactName: "Mike Chen",
            email: "batch2016@usjr-alumni.org",
            phone: "(032) 111-2222",
            website: "www.usjr-2016.org",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 200,
            invited: 300
        }
    },
    {
        id: 5,
        title: 'Mentorship Workshop: Guiding the Next Generation',
        description: 'Learn effective mentorship strategies and connect with current students seeking guidance. Make a lasting impact on the future of USJR.',
        date: 'February 18, 2026',
        time: '2:00 PM - 5:00 PM',
        location: 'USJR Alumni Center',
        category: 'Workshop',
        image: 'https://images.unsplash.com/photo-1760420940953-3958ad9f6287?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHRyYWluaW5nJTIwc2Vzc2lvbnxlbnwxfHx8fDE3NzAyNzE5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "2",
        startTimeMinute: "00",
        startTimeAmPm: "PM",
        endTimeHour: "5",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "USJR Campus, Cebu",
        organizer: {
            name: "Mentorship Program",
            contactName: "Sarah Li",
            email: "mentor@usjr.edu.ph",
            phone: "(032) 333-4444",
            website: "www.usjr-mentor.org",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 30,
            invited: 50
        }
    },
    {
        id: 6,
        title: 'Commencement Ceremony 2026',
        description: 'Witness the graduation of the newest members of the Josenian alumni community. Alumni are invited to attend and welcome the graduates.',
        date: 'April 20, 2026',
        time: '3:00 PM - 6:00 PM',
        location: 'USJR Gymnasium',
        category: 'Ceremony',
        image: 'https://images.unsplash.com/photo-1738949538943-e54722a44ffc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnklMjB1bml2ZXJzaXR5fGVufDF8fHx8MTc3MDI3MTkzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "3",
        startTimeMinute: "00",
        startTimeAmPm: "PM",
        endTimeHour: "6",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "USJR Basak Campus, Cebu City",
        organizer: {
            name: "USJR Administration",
            contactName: "Registrar Office",
            email: "registrar@usjr.edu.ph",
            phone: "(032) 888-9999",
            website: "www.usjr.edu.ph",
            image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 500,
            invited: 1000
        }
    },
    {
        id: 7,
        title: 'Global Alumni Virtual Summit',
        description: 'A virtual gathering for Josenians around the world. Join from anywhere to hear updates, participate in discussions, and connect globally.',
        date: 'March 8, 2026',
        time: '7:00 PM - 9:00 PM (PHT)',
        location: 'Virtual Event (Zoom)',
        category: 'Virtual',
        modality: 'Zoom',
        image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25mZXJlbmNlJTIwc2VtaW5hcnxlbnwxfHx8fDE3NzAyNzE5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "7",
        startTimeMinute: "00",
        startTimeAmPm: "PM",
        endTimeHour: "9",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "Online",
        organizer: {
            name: "Global Chapter",
            contactName: "David Kim",
            email: "global@usjr-alumni.org",
            phone: "+1 555 123 4567",
            website: "www.usjr-global.org",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 300,
            invited: 10000
        }
    },
    {
        id: 8,
        title: 'Sports Fest: Alumni Edition',
        description: 'Show your competitive spirit at the annual alumni sports festival. Basketball, volleyball, and other games await. All skill levels welcome!',
        date: 'May 10, 2026',
        time: '7:00 AM - 4:00 PM',
        location: 'USJR Sports Complex',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1770097042618-438684ff665f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjZWxlYnJhdGlvbiUyMGV2ZW50fGVufDF8fHx8MTc3MDI3MTkyOXww&ixlib=rb-4.1.0&q=80&w=1080',
        startTimeHour: "7",
        startTimeMinute: "00",
        startTimeAmPm: "AM",
        endTimeHour: "4",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        address: "USJR Basak Campus",
        organizer: {
            name: "Sports Committee",
            contactName: "Coach Rio",
            email: "sports@usjr.edu.ph",
            phone: "(032) 777-6666",
            website: "www.usjr-sports.org",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 120,
            invited: 300
        }
    },
];
