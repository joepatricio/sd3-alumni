export const generatePreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100).trim() + '...' : content;
};

export const generateTime = (event: any) => {
    const base = `${event.startTimeHour}:${event.startTimeMinute} ${event.startTimeAmPm} - ${event.endTimeHour}:${event.endTimeMinute} ${event.endTimeAmPm}`;
    return event.id === '7' ? `${base} (PHT)` : base;
};

export const bulletins = [
    {
        "id": "1",
        "title": "Community Outreach",
        "author": {
            "name": "Mark Santos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "June 08, 2026",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "2",
        "title": "Mentorship Program",
        "author": {
            "name": "Maria Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "May 07, 2026",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "3",
        "title": "Mentorship Program 1",
        "author": {
            "name": "John Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "February 12, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "4",
        "title": "Scholarship Program Launch",
        "author": {
            "name": "Anne Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "June 05, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "5",
        "title": "Community Outreach 1",
        "author": {
            "name": "Paolo Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "April 22, 2026",
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
        "id": "6",
        "title": "Mentorship Program 2",
        "author": {
            "name": "Chris Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "January 13, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "7",
        "title": "Homecoming Highlights",
        "author": {
            "name": "Miguel Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "January 29, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "8",
        "title": "Campus Updates",
        "author": {
            "name": "Angela Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "May 26, 2026",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "9",
        "title": "Scholarship Program Launch 1",
        "author": {
            "name": "Paolo Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "February 27, 2026",
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
        "id": "10",
        "title": "Scholarship Program Launch 2",
        "author": {
            "name": "Rica Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "March 16, 2026",
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
        "id": "11",
        "title": "Campus Updates 1",
        "author": {
            "name": "John Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "February 15, 2026",
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
        "id": "12",
        "title": "Scholarship Program Launch 3",
        "author": {
            "name": "Juan Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "January 01, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "13",
        "title": "Alumni Startup Success",
        "author": {
            "name": "Angela Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "May 25, 2026",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "14",
        "title": "Alumni Startup Success 1",
        "author": {
            "name": "Miguel Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "February 21, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "15",
        "title": "Alumni Startup Success 2",
        "author": {
            "name": "Jose Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "May 29, 2026",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "16",
        "title": "Community Outreach 2",
        "author": {
            "name": "Chris Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "January 25, 2026",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "17",
        "title": "Scholarship Program Launch 4",
        "author": {
            "name": "Miguel Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "March 24, 2026",
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
        "id": "18",
        "title": "Mentorship Program 3",
        "author": {
            "name": "Jose Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "March 04, 2026",
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
        "id": "19",
        "title": "Campus Updates 2",
        "author": {
            "name": "Mark Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "January 23, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "20",
        "title": "Mentorship Program 4",
        "author": {
            "name": "Bea Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "May 12, 2026",
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
        "id": "21",
        "title": "Mentorship Program 5",
        "author": {
            "name": "Jose Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "April 27, 2026",
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
        "id": "22",
        "title": "Community Outreach 3",
        "author": {
            "name": "Jose Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "April 04, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "23",
        "title": "Scholarship Program Launch 5",
        "author": {
            "name": "Maria Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "June 03, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "24",
        "title": "Career Development Initiative",
        "author": {
            "name": "Miguel Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "April 12, 2026",
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
        "id": "25",
        "title": "Alumni Startup Success 3",
        "author": {
            "name": "Maria Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "April 13, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "26",
        "title": "Career Development Initiative 1",
        "author": {
            "name": "Sofia Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "June 03, 2026",
        "readTime": "6 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "27",
        "title": "Community Outreach 4",
        "author": {
            "name": "Maria Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "April 30, 2026",
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
        "id": "28",
        "title": "Scholarship Program Launch 6",
        "author": {
            "name": "Daniel Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "April 19, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "29",
        "title": "Scholarship Program Launch 7",
        "author": {
            "name": "Sofia Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "April 07, 2026",
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
        "id": "30",
        "title": "Campus Updates 3",
        "author": {
            "name": "Miguel Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "January 23, 2026",
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
        "id": "31",
        "title": "Alumni Startup Success 4",
        "author": {
            "name": "Miguel Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "June 07, 2026",
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
        "id": "32",
        "title": "Career Development Initiative 2",
        "author": {
            "name": "Daniel Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "June 21, 2026",
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
        "id": "33",
        "title": "Career Development Initiative 3",
        "author": {
            "name": "Miguel Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "March 14, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "34",
        "title": "Homecoming Highlights 1",
        "author": {
            "name": "Miguel Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "April 19, 2026",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "35",
        "title": "Campus Updates 4",
        "author": {
            "name": "Andrea Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "June 25, 2026",
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
        "id": "36",
        "title": "Alumni Startup Success 5",
        "author": {
            "name": "Andrea Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "February 07, 2026",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "37",
        "title": "Community Outreach 5",
        "author": {
            "name": "Sofia Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "April 10, 2026",
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
        "id": "38",
        "title": "Homecoming Highlights 2",
        "author": {
            "name": "Sofia Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "February 05, 2026",
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
        "id": "39",
        "title": "Community Outreach 6",
        "author": {
            "name": "Andrea Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "January 28, 2026",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "40",
        "title": "Homecoming Highlights 3",
        "author": {
            "name": "Rica Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "March 21, 2026",
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
        "id": "41",
        "title": "Homecoming Highlights 4",
        "author": {
            "name": "Daniel Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "May 22, 2026",
        "readTime": "5 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": false,
        "status": "Pending"
    },
    {
        "id": "42",
        "title": "Community Outreach 7",
        "author": {
            "name": "John Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "April 07, 2026",
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
        "title": "Community Outreach 8",
        "author": {
            "name": "Bea Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "February 27, 2026",
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
        "id": "44",
        "title": "Mentorship Program 6",
        "author": {
            "name": "Mark Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "June 26, 2026",
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
        "id": "45",
        "title": "Scholarship Program Launch 8",
        "author": {
            "name": "Angela Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "June 10, 2026",
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
        "id": "46",
        "title": "Homecoming Highlights 5",
        "author": {
            "name": "Jose Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "March 21, 2026",
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
        "id": "47",
        "title": "Scholarship Program Launch 9",
        "author": {
            "name": "Paolo Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "February 11, 2026",
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
        "id": "48",
        "title": "Homecoming Highlights 6",
        "author": {
            "name": "Carla Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "April 21, 2026",
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
        "id": "49",
        "title": "Scholarship Program Launch 10",
        "author": {
            "name": "Rica Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "May 17, 2026",
        "readTime": "3 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "50",
        "title": "Campus Updates 5",
        "author": {
            "name": "Jose Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "January 16, 2026",
        "readTime": "4 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    }
];

export const events = [
    {
        "id": "1",
        "title": "Reunion Event 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "February 25, 2026",
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
            "lat": 10.274845,
            "lng": 123.887681
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
            "contactName": "Angela Santos",
            "email": "reunion1@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 50,
            "invited": 201
        },
        "status": "Approved"
    },
    {
        "id": "2",
        "title": "Sports Event 2",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 04, 2026",
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
            "lat": 10.324017,
            "lng": 123.899418
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
            "contactName": "Mark Flores",
            "email": "sports2@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 21,
            "invited": 130
        },
        "status": "Approved"
    },
    {
        "id": "3",
        "title": "Conference Event 3",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 04, 2026",
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
            "lat": 10.34303,
            "lng": 123.943751
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Paolo Ramos",
            "email": "conference3@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 132,
            "invited": 852
        },
        "status": "Approved"
    },
    {
        "id": "4",
        "title": "Sports Event 4",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 23, 2026",
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
            "lat": 10.297635,
            "lng": 123.922574
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Andrea Flores",
            "email": "sports4@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 252,
            "invited": 651
        },
        "status": "Approved"
    },
    {
        "id": "5",
        "title": "Sports Event 5",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 21, 2026",
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
            "lat": 10.259695,
            "lng": 123.851987
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Maria Ramos",
            "email": "sports5@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 217,
            "invited": 556
        },
        "status": "Approved"
    },
    {
        "id": "6",
        "title": "Networking Event 6",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 17, 2026",
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
            "lat": 10.342436,
            "lng": 123.893065
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
            "contactName": "Maria Torres",
            "email": "networking6@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 333,
            "invited": 974
        },
        "status": "Pending"
    },
    {
        "id": "7",
        "title": "Conference Event 7",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "May 30, 2026",
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
            "lat": 10.30489,
            "lng": 123.8609
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "2",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Andrea Bautista",
            "email": "conference7@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 232,
            "invited": 614
        },
        "status": "Pending"
    },
    {
        "id": "8",
        "title": "Reunion Event 8",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "January 09, 2026",
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
            "lat": 10.341784,
            "lng": 123.888595
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
            "contactName": "Rica Garcia",
            "email": "reunion8@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 172,
            "invited": 930
        },
        "status": "Approved"
    },
    {
        "id": "9",
        "title": "Workshop Event 9",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 28, 2026",
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
            "lat": 10.295607,
            "lng": 123.947026
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Rica Mendoza",
            "email": "workshop9@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 175,
            "invited": 104
        },
        "status": "Approved"
    },
    {
        "id": "10",
        "title": "Sports Event 10",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 05, 2026",
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
            "lat": 10.297548,
            "lng": 123.860766
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Chris Ramos",
            "email": "sports10@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 93,
            "invited": 355
        },
        "status": "Approved"
    },
    {
        "id": "11",
        "title": "Sports Event 11",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 28, 2026",
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
            "lat": 10.290186,
            "lng": 123.882798
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "John Santos",
            "email": "sports11@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 30,
            "invited": 105
        },
        "status": "Pending"
    },
    {
        "id": "12",
        "title": "Networking Event 12",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 02, 2026",
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
            "lat": 10.292539,
            "lng": 123.861531
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Anne Flores",
            "email": "networking12@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 457,
            "invited": 945
        },
        "status": "Pending"
    },
    {
        "id": "13",
        "title": "Sports Event 13",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 14, 2026",
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
            "lat": 10.333354,
            "lng": 123.851561
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Juan Mendoza",
            "email": "sports13@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 496,
            "invited": 879
        },
        "status": "Approved"
    },
    {
        "id": "14",
        "title": "Workshop Event 14",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 13, 2026",
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
            "lat": 10.318047,
            "lng": 123.917272
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Maria Bautista",
            "email": "workshop14@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 345,
            "invited": 309
        },
        "status": "Approved"
    },
    {
        "id": "15",
        "title": "Conference Event 15",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 11, 2026",
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
            "lat": 10.316011,
            "lng": 123.866191
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "John Torres",
            "email": "conference15@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 107,
            "invited": 882
        },
        "status": "Approved"
    },
    {
        "id": "16",
        "title": "Networking Event 16",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 17, 2026",
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
            "lat": 10.277789,
            "lng": 123.857852
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Angela Aquino",
            "email": "networking16@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 97,
            "invited": 578
        },
        "status": "Pending"
    },
    {
        "id": "17",
        "title": "Conference Event 17",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 14, 2026",
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
            "lat": 10.299711,
            "lng": 123.912904
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
            "contactName": "Daniel Aquino",
            "email": "conference17@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 122,
            "invited": 203
        },
        "status": "Approved"
    },
    {
        "id": "18",
        "title": "Sports Event 18",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "May 20, 2026",
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
            "lat": 10.264402,
            "lng": 123.850221
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Daniel Reyes",
            "email": "sports18@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 450,
            "invited": 715
        },
        "status": "Approved"
    },
    {
        "id": "19",
        "title": "Workshop Event 19",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "May 20, 2026",
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
            "lat": 10.277065,
            "lng": 123.948894
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "John Aquino",
            "email": "workshop19@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 238,
            "invited": 355
        },
        "status": "Pending"
    },
    {
        "id": "20",
        "title": "Conference Event 20",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "January 20, 2026",
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
            "lat": 10.286036,
            "lng": 123.85114
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Bea Aquino",
            "email": "conference20@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 418,
            "invited": 947
        },
        "status": "Pending"
    },
    {
        "id": "21",
        "title": "Workshop Event 21",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 30, 2026",
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
            "lat": 10.324854,
            "lng": 123.92463
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Carla Mendoza",
            "email": "workshop21@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 439,
            "invited": 801
        },
        "status": "Approved"
    },
    {
        "id": "22",
        "title": "Reunion Event 22",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 06, 2026",
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
            "lat": 10.346743,
            "lng": 123.91091
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "6",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Chris Mendoza",
            "email": "reunion22@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 53,
            "invited": 738
        },
        "status": "Pending"
    },
    {
        "id": "23",
        "title": "Workshop Event 23",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 14, 2026",
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
            "lat": 10.307596,
            "lng": 123.914944
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Rica Torres",
            "email": "workshop23@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 240,
            "invited": 548
        },
        "status": "Pending"
    },
    {
        "id": "24",
        "title": "Reunion Event 24",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 04, 2026",
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
            "lat": 10.308099,
            "lng": 123.905011
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
            "contactName": "Bea Ramos",
            "email": "reunion24@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 233,
            "invited": 967
        },
        "status": "Pending"
    },
    {
        "id": "25",
        "title": "Conference Event 25",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 30, 2026",
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
            "lat": 10.266005,
            "lng": 123.93859
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "6",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Paolo Santos",
            "email": "conference25@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 53,
            "invited": 813
        },
        "status": "Approved"
    },
    {
        "id": "26",
        "title": "Reunion Event 26",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 27, 2026",
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
            "lat": 10.275503,
            "lng": 123.911556
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Bea Mendoza",
            "email": "reunion26@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 319,
            "invited": 500
        },
        "status": "Pending"
    },
    {
        "id": "27",
        "title": "Networking Event 27",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 10, 2026",
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
            "lat": 10.273156,
            "lng": 123.910751
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "11",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Maria Reyes",
            "email": "networking27@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 423,
            "invited": 636
        },
        "status": "Pending"
    },
    {
        "id": "28",
        "title": "Conference Event 28",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "February 27, 2026",
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
            "lat": 10.27282,
            "lng": 123.888464
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Daniel Mendoza",
            "email": "conference28@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 75,
            "invited": 383
        },
        "status": "Approved"
    },
    {
        "id": "29",
        "title": "Reunion Event 29",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 31, 2026",
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
            "lat": 10.271986,
            "lng": 123.881287
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "3",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "John Cruz",
            "email": "reunion29@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 182,
            "invited": 347
        },
        "status": "Approved"
    },
    {
        "id": "30",
        "title": "Workshop Event 30",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 12, 2026",
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
            "lat": 10.281563,
            "lng": 123.866644
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Chris Cruz",
            "email": "workshop30@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 321,
            "invited": 440
        },
        "status": "Pending"
    },
    {
        "id": "31",
        "title": "Networking Event 31",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 24, 2026",
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
            "lat": 10.339763,
            "lng": 123.916328
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Jose Mendoza",
            "email": "networking31@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 314,
            "invited": 414
        },
        "status": "Approved"
    },
    {
        "id": "32",
        "title": "Conference Event 32",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 26, 2026",
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
            "lat": 10.31298,
            "lng": 123.881399
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Maria Santos",
            "email": "conference32@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 233,
            "invited": 454
        },
        "status": "Pending"
    },
    {
        "id": "33",
        "title": "Networking Event 33",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 29, 2026",
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
            "lat": 10.289291,
            "lng": 123.915051
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "12",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Paolo Ramos",
            "email": "networking33@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 431,
            "invited": 537
        },
        "status": "Pending"
    },
    {
        "id": "34",
        "title": "Sports Event 34",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "February 07, 2026",
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
            "lat": 10.253864,
            "lng": 123.892902
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "8",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Rica Aquino",
            "email": "sports34@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 258,
            "invited": 548
        },
        "status": "Approved"
    },
    {
        "id": "35",
        "title": "Conference Event 35",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 12, 2026",
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
            "lat": 10.252864,
            "lng": 123.860446
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
            "contactName": "Angela Cruz",
            "email": "conference35@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 237,
            "invited": 720
        },
        "status": "Pending"
    },
    {
        "id": "36",
        "title": "Sports Event 36",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 24, 2026",
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
            "lat": 10.27449,
            "lng": 123.869139
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "8",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Juan Bautista",
            "email": "sports36@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 451,
            "invited": 509
        },
        "status": "Pending"
    },
    {
        "id": "37",
        "title": "Sports Event 37",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 03, 2026",
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
            "lat": 10.327293,
            "lng": 123.922586
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "4",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Carla Torres",
            "email": "sports37@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 213,
            "invited": 208
        },
        "status": "Approved"
    },
    {
        "id": "38",
        "title": "Sports Event 38",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "January 09, 2026",
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
            "lat": 10.305787,
            "lng": 123.927091
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
            "contactName": "Chris Garcia",
            "email": "sports38@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 257,
            "invited": 544
        },
        "status": "Pending"
    },
    {
        "id": "39",
        "title": "Sports Event 39",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "May 24, 2026",
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
            "lat": 10.33066,
            "lng": 123.876372
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Sofia Cruz",
            "email": "sports39@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 202,
            "invited": 773
        },
        "status": "Approved"
    },
    {
        "id": "40",
        "title": "Reunion Event 40",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "February 19, 2026",
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
            "lat": 10.274438,
            "lng": 123.946964
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Maria Flores",
            "email": "reunion40@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 390,
            "invited": 156
        },
        "status": "Pending"
    },
    {
        "id": "41",
        "title": "Conference Event 41",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "May 19, 2026",
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
            "lat": 10.287009,
            "lng": 123.949598
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Angela Santos",
            "email": "conference41@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 23,
            "invited": 776
        },
        "status": "Pending"
    },
    {
        "id": "42",
        "title": "Networking Event 42",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 12, 2026",
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
            "lat": 10.256216,
            "lng": 123.893648
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Mark Bautista",
            "email": "networking42@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 69,
            "invited": 176
        },
        "status": "Approved"
    },
    {
        "id": "43",
        "title": "Networking Event 43",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 09, 2026",
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
            "lat": 10.25373,
            "lng": 123.908232
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Bea Flores",
            "email": "networking43@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 240,
            "invited": 813
        },
        "status": "Approved"
    },
    {
        "id": "44",
        "title": "Sports Event 44",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "March 25, 2026",
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
            "lat": 10.346256,
            "lng": 123.873381
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "John Reyes",
            "email": "sports44@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 54,
            "invited": 940
        },
        "status": "Approved"
    },
    {
        "id": "45",
        "title": "Sports Event 45",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "February 06, 2026",
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
            "lat": 10.297309,
            "lng": 123.88686
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "6",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Jose Reyes",
            "email": "sports45@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 321,
            "invited": 608
        },
        "status": "Approved"
    },
    {
        "id": "46",
        "title": "Sports Event 46",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "May 30, 2026",
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
            "lat": 10.305692,
            "lng": 123.874073
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Sofia Santos",
            "email": "sports46@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 258,
            "invited": 896
        },
        "status": "Approved"
    },
    {
        "id": "47",
        "title": "Reunion Event 47",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "April 27, 2026",
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
            "lat": 10.261064,
            "lng": 123.86343
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
            "contactName": "Chris Cruz",
            "email": "reunion47@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 390,
            "invited": 335
        },
        "status": "Pending"
    },
    {
        "id": "48",
        "title": "Workshop Event 48",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "January 23, 2026",
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
            "lat": 10.280908,
            "lng": 123.943787
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Sofia Ramos",
            "email": "workshop48@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 448,
            "invited": 550
        },
        "status": "Approved"
    },
    {
        "id": "49",
        "title": "Reunion Event 49",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "June 29, 2026",
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
            "lat": 10.327616,
            "lng": 123.936626
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
            "contactName": "Sofia Garcia",
            "email": "reunion49@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 336,
            "invited": 661
        },
        "status": "Pending"
    },
    {
        "id": "50",
        "title": "Networking Event 50",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "January 20, 2026",
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
            "lat": 10.326731,
            "lng": 123.876826
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Daniel Flores",
            "email": "networking50@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 203,
            "invited": 667
        },
        "status": "Approved"
    }
];

