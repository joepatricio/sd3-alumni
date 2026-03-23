export const generatePreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100).trim() + '...' : content;
};

export const generateTime = (event: any) => {
    const base = `${event.startTimeHour}:${event.startTimeMinute} ${event.startTimeAmPm} - ${event.endTimeHour}:${event.endTimeMinute} ${event.endTimeAmPm}`;
    return event.id === '7' ? `${base} (PHT)` : base;
};

export const bulletins = [
    {
        "id": "10",
        "title": "Career Development Initiative 1",
        "author": {
            "name": "Anne Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-06-30T00:00:00.000Z",
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
        "id": "35",
        "title": "Campus Updates 6",
        "author": {
            "name": "Bea Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-06-23T00:00:00.000Z",
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
        "id": "31",
        "title": "Campus Updates 5",
        "author": {
            "name": "Sofia Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-06-21T00:00:00.000Z",
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
        "id": "16",
        "title": "Homecoming Highlights 1",
        "author": {
            "name": "Mark Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-06-20T00:00:00.000Z",
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
        "id": "6",
        "title": "Campus Updates 1",
        "author": {
            "name": "Jose Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-06-18T00:00:00.000Z",
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
        "id": "41",
        "title": "Mentorship Program 5",
        "author": {
            "name": "Mark Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-06-17T00:00:00.000Z",
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
        "id": "14",
        "title": "Campus Updates 2",
        "author": {
            "name": "Bea Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-06-13T00:00:00.000Z",
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
        "id": "46",
        "title": "Mentorship Program 7",
        "author": {
            "name": "Miguel Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-06-12T00:00:00.000Z",
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
        "id": "20",
        "title": "Mentorship Program 2",
        "author": {
            "name": "Paolo Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-06-07T00:00:00.000Z",
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
        "id": "29",
        "title": "Campus Updates 4",
        "author": {
            "name": "Daniel Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-06-01T00:00:00.000Z",
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
            "name": "Anne Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-05-29T00:00:00.000Z",
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
        "id": "39",
        "title": "Community Outreach 3",
        "author": {
            "name": "Sofia Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-05-26T00:00:00.000Z",
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
        "id": "47",
        "title": "Alumni Startup Success 8",
        "author": {
            "name": "Angela Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-05-25T00:00:00.000Z",
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
        "id": "17",
        "title": "Homecoming Highlights 2",
        "author": {
            "name": "Rica Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-05-22T00:00:00.000Z",
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
        "id": "4",
        "title": "Community Outreach",
        "author": {
            "name": "Maria Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-05-14T00:00:00.000Z",
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
        "id": "28",
        "title": "Alumni Startup Success 3",
        "author": {
            "name": "Andrea Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-04-30T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "19",
        "title": "Campus Updates 3",
        "author": {
            "name": "Mark Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-04-28T00:00:00.000Z",
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
        "id": "45",
        "title": "Mentorship Program 6",
        "author": {
            "name": "Maria Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-04-28T00:00:00.000Z",
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
        "id": "42",
        "title": "Community Outreach 4",
        "author": {
            "name": "Maria Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-04-18T00:00:00.000Z",
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
        "id": "23",
        "title": "Scholarship Program Launch 4",
        "author": {
            "name": "Carla Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-04-16T00:00:00.000Z",
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
        "id": "12",
        "title": "Alumni Startup Success 2",
        "author": {
            "name": "Bea Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-04-05T00:00:00.000Z",
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
        "id": "15",
        "title": "Mentorship Program 1",
        "author": {
            "name": "John Cruz",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-04-04T00:00:00.000Z",
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
        "id": "18",
        "title": "Community Outreach 1",
        "author": {
            "name": "Maria Santos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-03-28T00:00:00.000Z",
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
        "id": "30",
        "title": "Alumni Startup Success 4",
        "author": {
            "name": "Paolo Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-03-27T00:00:00.000Z",
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
        "id": "40",
        "title": "Homecoming Highlights 6",
        "author": {
            "name": "Anne Torres",
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
        "id": "25",
        "title": "Scholarship Program Launch 5",
        "author": {
            "name": "Paolo Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-03-15T00:00:00.000Z",
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
        "id": "33",
        "title": "Alumni Startup Success 5",
        "author": {
            "name": "Andrea Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-03-10T00:00:00.000Z",
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
        "id": "49",
        "title": "Mentorship Program 8",
        "author": {
            "name": "Carla Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-03-10T00:00:00.000Z",
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
        "id": "34",
        "title": "Homecoming Highlights 4",
        "author": {
            "name": "Paolo Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-03-09T00:00:00.000Z",
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
        "id": "32",
        "title": "Scholarship Program Launch 6",
        "author": {
            "name": "Paolo Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-03-06T00:00:00.000Z",
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
        "id": "22",
        "title": "Mentorship Program 3",
        "author": {
            "name": "Jose Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-03-05T00:00:00.000Z",
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
        "id": "21",
        "title": "Scholarship Program Launch 3",
        "author": {
            "name": "Mark Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-02-24T00:00:00.000Z",
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
        "id": "38",
        "title": "Alumni Startup Success 6",
        "author": {
            "name": "Miguel Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-02-21T00:00:00.000Z",
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
        "id": "11",
        "title": "Scholarship Program Launch 1",
        "author": {
            "name": "Bea Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-02-12T00:00:00.000Z",
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
        "id": "43",
        "title": "Alumni Startup Success 7",
        "author": {
            "name": "John Aquino",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-02-10T00:00:00.000Z",
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
        "id": "8",
        "title": "Mentorship Program",
        "author": {
            "name": "Juan Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-02-07T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "27",
        "title": "Community Outreach 2",
        "author": {
            "name": "Angela Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-02-07T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "44",
        "title": "Career Development Initiative 3",
        "author": {
            "name": "Andrea Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-02-05T00:00:00.000Z",
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
        "title": "Scholarship Program Launch",
        "author": {
            "name": "Paolo Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-02-02T00:00:00.000Z",
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
        "id": "5",
        "title": "Alumni Startup Success 1",
        "author": {
            "name": "Juan Castro",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-30T00:00:00.000Z",
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
        "id": "26",
        "title": "Homecoming Highlights 3",
        "author": {
            "name": "John Torres",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-01-19T00:00:00.000Z",
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
        "title": "Career Development Initiative",
        "author": {
            "name": "Miguel Reyes",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-01-17T00:00:00.000Z",
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
        "id": "2",
        "title": "Campus Updates",
        "author": {
            "name": "Mark Bautista",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Tech Entrepreneur"
        },
        "date": "2026-01-16T00:00:00.000Z",
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
        "id": "37",
        "title": "Mentorship Program 4",
        "author": {
            "name": "Mark Garcia",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-11T00:00:00.000Z",
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
        "id": "50",
        "title": "Homecoming Highlights 8",
        "author": {
            "name": "Juan Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-01-11T00:00:00.000Z",
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
        "id": "24",
        "title": "Career Development Initiative 2",
        "author": {
            "name": "Angela Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-01-09T00:00:00.000Z",
        "readTime": "2 min read",
        get preview() {
            return generatePreview(this.content);
        },
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
        "isUserSubmitted": true,
        "status": "Pending"
    },
    {
        "id": "48",
        "title": "Homecoming Highlights 7",
        "author": {
            "name": "Paolo Flores",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Official"
        },
        "date": "2026-01-05T00:00:00.000Z",
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
        "id": "9",
        "title": "Homecoming Highlights",
        "author": {
            "name": "Andrea Ramos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-04T00:00:00.000Z",
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
        "id": "13",
        "title": "Scholarship Program Launch 2",
        "author": {
            "name": "Miguel Santos",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Coordinator"
        },
        "date": "2026-01-03T00:00:00.000Z",
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
        "id": "36",
        "title": "Homecoming Highlights 5",
        "author": {
            "name": "Carla Mendoza",
            "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
            "role": "Alumna"
        },
        "date": "2026-01-02T00:00:00.000Z",
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
        "id": "6",
        "title": "Workshop Event 6",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-29T00:00:00.000Z",
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
            "lat": 10.304956,
            "lng": 123.879941
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Maria Garcia",
            "email": "workshop6@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 393,
            "invited": 861
        },
        "status": "Approved"
    },
    {
        "id": "15",
        "title": "Networking Event 15",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-25T00:00:00.000Z",
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
            "lat": 10.293071,
            "lng": 123.940754
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
            "contactName": "Andrea Torres",
            "email": "networking15@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 217,
            "invited": 227
        },
        "status": "Approved"
    },
    {
        "id": "33",
        "title": "Virtual Event 33",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-22T00:00:00.000Z",
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
            "lat": 10.337,
            "lng": 123.927484
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "8",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Chris Cruz",
            "email": "virtual33@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 498,
            "invited": 505
        },
        "status": "Pending",
        "modality": "Microsoft Teams"
    },
    {
        "id": "39",
        "title": "Workshop Event 39",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-06-07T00:00:00.000Z",
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
            "lat": 10.349831,
            "lng": 123.892566
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
            "contactName": "John Castro",
            "email": "workshop39@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 497,
            "invited": 408
        },
        "status": "Pending"
    },
    {
        "id": "28",
        "title": "Sports Event 28",
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
            "lat": 10.342934,
            "lng": 123.911446
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
            "contactName": "Daniel Flores",
            "email": "sports28@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 342,
            "invited": 693
        },
        "status": "Pending"
    },
    {
        "id": "13",
        "title": "Conference Event 13",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-24T00:00:00.000Z",
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
            "lat": 10.331659,
            "lng": 123.886883
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Sofia Garcia",
            "email": "conference13@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 267,
            "invited": 780
        },
        "status": "Approved"
    },
    {
        "id": "24",
        "title": "Reunion Event 24",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-23T00:00:00.000Z",
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
            "lat": 10.313784,
            "lng": 123.929118
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Jose Garcia",
            "email": "reunion24@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 255,
            "invited": 723
        },
        "status": "Pending"
    },
    {
        "id": "8",
        "title": "Virtual Event 8",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-22T00:00:00.000Z",
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
            "lat": 10.316038,
            "lng": 123.879253
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Bea Aquino",
            "email": "virtual8@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 295,
            "invited": 1000
        },
        "status": "Approved",
        "modality": "Microsoft Teams"
    },
    {
        "id": "47",
        "title": "Networking Event 47",
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
            "lat": 10.334689,
            "lng": 123.947729
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
            "contactName": "Bea Bautista",
            "email": "networking47@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 275,
            "invited": 554
        },
        "status": "Pending"
    },
    {
        "id": "20",
        "title": "Sports Event 20",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-20T00:00:00.000Z",
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
            "lat": 10.289844,
            "lng": 123.94153
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "6",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Andrea Reyes",
            "email": "sports20@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 312,
            "invited": 638
        },
        "status": "Pending"
    },
    {
        "id": "30",
        "title": "Sports Event 30",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-13T00:00:00.000Z",
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
            "lat": 10.252723,
            "lng": 123.87677
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
            "contactName": "Daniel Bautista",
            "email": "sports30@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 137,
            "invited": 443
        },
        "status": "Approved"
    },
    {
        "id": "26",
        "title": "Networking Event 26",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-07T00:00:00.000Z",
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
            "lat": 10.314857,
            "lng": 123.868369
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Daniel Cruz",
            "email": "networking26@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 433,
            "invited": 916
        },
        "status": "Approved"
    },
    {
        "id": "31",
        "title": "Workshop Event 31",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-03T00:00:00.000Z",
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
            "lat": 10.314826,
            "lng": 123.872786
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
            "contactName": "Daniel Reyes",
            "email": "workshop31@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 183,
            "invited": 876
        },
        "status": "Approved"
    },
    {
        "id": "50",
        "title": "Virtual Event 50",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-05-02T00:00:00.000Z",
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
            "lat": 10.29815,
            "lng": 123.897109
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "2",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Carla Castro",
            "email": "virtual50@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 498,
            "invited": 806
        },
        "status": "Pending",
        "modality": "Microsoft Teams"
    },
    {
        "id": "29",
        "title": "Sports Event 29",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-28T00:00:00.000Z",
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
            "lat": 10.316229,
            "lng": 123.887305
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Anne Castro",
            "email": "sports29@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 425,
            "invited": 708
        },
        "status": "Pending"
    },
    {
        "id": "4",
        "title": "Reunion Event 4",
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
            "lat": 10.302346,
            "lng": 123.879702
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
            "contactName": "Rica Mendoza",
            "email": "reunion4@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 291,
            "invited": 726
        },
        "status": "Pending"
    },
    {
        "id": "27",
        "title": "Networking Event 27",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-03T00:00:00.000Z",
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
            "lat": 10.324684,
            "lng": 123.923303
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
            "contactName": "Bea Santos",
            "email": "networking27@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 183,
            "invited": 301
        },
        "status": "Pending"
    },
    {
        "id": "48",
        "title": "Conference Event 48",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-04-01T00:00:00.000Z",
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
            "lat": 10.309607,
            "lng": 123.929185
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "3",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Bea Aquino",
            "email": "conference48@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 440,
            "invited": 868
        },
        "status": "Pending"
    },
    {
        "id": "40",
        "title": "Reunion Event 40",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-30T00:00:00.000Z",
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
            "lat": 10.274216,
            "lng": 123.912384
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
            "contactName": "Miguel Santos",
            "email": "reunion40@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 114,
            "invited": 614
        },
        "status": "Pending"
    },
    {
        "id": "23",
        "title": "Sports Event 23",
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
            "lat": 10.2576,
            "lng": 123.919541
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
            "contactName": "Carla Flores",
            "email": "sports23@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 346,
            "invited": 942
        },
        "status": "Approved"
    },
    {
        "id": "1",
        "title": "Reunion Event 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-20T00:00:00.000Z",
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
            "lat": 10.2989,
            "lng": 123.855388
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "7",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Daniel Reyes",
            "email": "reunion1@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 327,
            "invited": 419
        },
        "status": "Pending"
    },
    {
        "id": "2",
        "title": "Sports Event 2",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-19T00:00:00.000Z",
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
            "lat": 10.330118,
            "lng": 123.935069
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
            "contactName": "Chris Garcia",
            "email": "sports2@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 471,
            "invited": 854
        },
        "status": "Pending"
    },
    {
        "id": "18",
        "title": "Sports Event 18",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-19T00:00:00.000Z",
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
            "lat": 10.284436,
            "lng": 123.917101
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
            "contactName": "Carla Garcia",
            "email": "sports18@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 385,
            "invited": 829
        },
        "status": "Approved"
    },
    {
        "id": "22",
        "title": "Conference Event 22",
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
            "lat": 10.292694,
            "lng": 123.91903
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
            "contactName": "Maria Ramos",
            "email": "conference22@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 311,
            "invited": 859
        },
        "status": "Pending"
    },
    {
        "id": "14",
        "title": "Conference Event 14",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-14T00:00:00.000Z",
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
            "lat": 10.334864,
            "lng": 123.928131
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Maria Castro",
            "email": "conference14@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 307,
            "invited": 495
        },
        "status": "Pending"
    },
    {
        "id": "42",
        "title": "Workshop Event 42",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-14T00:00:00.000Z",
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
            "lat": 10.32893,
            "lng": 123.861002
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
            "contactName": "Paolo Aquino",
            "email": "workshop42@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 304,
            "invited": 919
        },
        "status": "Pending"
    },
    {
        "id": "38",
        "title": "Sports Event 38",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-11T00:00:00.000Z",
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
            "lat": 10.284268,
            "lng": 123.931188
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Angela Ramos",
            "email": "sports38@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 454,
            "invited": 863
        },
        "status": "Approved"
    },
    {
        "id": "41",
        "title": "Networking Event 41",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-11T00:00:00.000Z",
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
            "lat": 10.276671,
            "lng": 123.915552
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "10",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Paolo Cruz",
            "email": "networking41@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 119,
            "invited": 470
        },
        "status": "Pending"
    },
    {
        "id": "45",
        "title": "Sports Event 45",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-11T00:00:00.000Z",
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
            "lat": 10.314935,
            "lng": 123.919664
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "9",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "11",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "John Torres",
            "email": "sports45@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 243,
            "invited": 626
        },
        "status": "Pending"
    },
    {
        "id": "16",
        "title": "Reunion Event 16",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-10T00:00:00.000Z",
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
            "lat": 10.307051,
            "lng": 123.915595
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "5",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "8",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Sofia Reyes",
            "email": "reunion16@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 221,
            "invited": 178
        },
        "status": "Pending"
    },
    {
        "id": "35",
        "title": "Reunion Event 35",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-07T00:00:00.000Z",
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
            "lat": 10.341971,
            "lng": 123.915338
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "3",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Carla Garcia",
            "email": "reunion35@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 290,
            "invited": 119
        },
        "status": "Approved"
    },
    {
        "id": "3",
        "title": "Networking Event 3",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-02T00:00:00.000Z",
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
            "lat": 10.304565,
            "lng": 123.904592
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
            "contactName": "Maria Bautista",
            "email": "networking3@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 356,
            "invited": 236
        },
        "status": "Pending"
    },
    {
        "id": "19",
        "title": "Workshop Event 19",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-03-02T00:00:00.000Z",
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
            "lat": 10.30714,
            "lng": 123.859855
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
            "contactName": "Miguel Flores",
            "email": "workshop19@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 85,
            "invited": 353
        },
        "status": "Pending"
    },
    {
        "id": "43",
        "title": "Sports Event 43",
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
            "lat": 10.314132,
            "lng": 123.940597
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "2",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Mark Castro",
            "email": "sports43@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 182,
            "invited": 918
        },
        "status": "Approved"
    },
    {
        "id": "5",
        "title": "Virtual Event 5",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-20T00:00:00.000Z",
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
            "lat": 10.289858,
            "lng": 123.916213
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Chris Torres",
            "email": "virtual5@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 212,
            "invited": 172
        },
        "status": "Pending",
        "modality": "Microsoft Teams"
    },
    {
        "id": "17",
        "title": "Networking Event 17",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-19T00:00:00.000Z",
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
            "lat": 10.311772,
            "lng": 123.948275
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
            "contactName": "Maria Ramos",
            "email": "networking17@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 78,
            "invited": 383
        },
        "status": "Pending"
    },
    {
        "id": "34",
        "title": "Virtual Event 34",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-15T00:00:00.000Z",
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
            "lat": 10.27703,
            "lng": 123.930443
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
            "contactName": "Rica Aquino",
            "email": "virtual34@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 451,
            "invited": 616
        },
        "status": "Pending",
        "modality": "Microsoft Teams"
    },
    {
        "id": "36",
        "title": "Networking Event 36",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-08T00:00:00.000Z",
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
            "lat": 10.327071,
            "lng": 123.915492
        },
        "category": "Networking",
        "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Networking Committee",
            "contactName": "Chris Ramos",
            "email": "networking36@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 217,
            "invited": 790
        },
        "status": "Pending"
    },
    {
        "id": "44",
        "title": "Virtual Event 44",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-07T00:00:00.000Z",
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
            "lat": 10.264116,
            "lng": 123.908214
        },
        "category": "Virtual",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080",
        "startTimeHour": "4",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Virtual Committee",
            "contactName": "Paolo Bautista",
            "email": "virtual44@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 408,
            "invited": 676
        },
        "status": "Approved",
        "modality": "Google Meet"
    },
    {
        "id": "9",
        "title": "Reunion Event 9",
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
            "lat": 10.278475,
            "lng": 123.856808
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "2",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Chris Garcia",
            "email": "reunion9@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 60,
            "invited": 313
        },
        "status": "Pending"
    },
    {
        "id": "21",
        "title": "Conference Event 21",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-04T00:00:00.000Z",
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
            "lat": 10.283509,
            "lng": 123.85936
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
            "contactName": "Paolo Mendoza",
            "email": "conference21@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 231,
            "invited": 995
        },
        "status": "Approved"
    },
    {
        "id": "25",
        "title": "Workshop Event 25",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-02-02T00:00:00.000Z",
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
            "lat": 10.318526,
            "lng": 123.860343
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
            "contactName": "Bea Garcia",
            "email": "workshop25@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 389,
            "invited": 793
        },
        "status": "Pending"
    },
    {
        "id": "11",
        "title": "Sports Event 11",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-31T00:00:00.000Z",
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
            "lat": 10.255653,
            "lng": 123.906134
        },
        "category": "Sports",
        "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
        "startTimeHour": "7",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Sports Committee",
            "contactName": "Rica Santos",
            "email": "sports11@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 47,
            "invited": 887
        },
        "status": "Pending"
    },
    {
        "id": "37",
        "title": "Sports Event 37",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-26T00:00:00.000Z",
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
            "lat": 10.268652,
            "lng": 123.903814
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
            "contactName": "Daniel Torres",
            "email": "sports37@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 163,
            "invited": 604
        },
        "status": "Pending"
    },
    {
        "id": "49",
        "title": "Conference Event 49",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-25T00:00:00.000Z",
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
            "lat": 10.260923,
            "lng": 123.939719
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
            "contactName": "Paolo Reyes",
            "email": "conference49@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 358,
            "invited": 498
        },
        "status": "Approved"
    },
    {
        "id": "10",
        "title": "Conference Event 10",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-22T00:00:00.000Z",
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
            "lat": 10.265702,
            "lng": 123.948168
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "8",
        "startTimeMinute": "00",
        "startTimeAmPm": "AM",
        "endTimeHour": "9",
        "endTimeMinute": "00",
        "endTimeAmPm": "AM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Anne Ramos",
            "email": "conference10@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 210,
            "invited": 928
        },
        "status": "Approved"
    },
    {
        "id": "46",
        "title": "Workshop Event 46",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-22T00:00:00.000Z",
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
            "lat": 10.336764,
            "lng": 123.916991
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
            "contactName": "Carla Reyes",
            "email": "workshop46@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 214,
            "invited": 686
        },
        "status": "Pending"
    },
    {
        "id": "12",
        "title": "Conference Event 12",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-21T00:00:00.000Z",
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
            "lat": 10.322022,
            "lng": 123.860888
        },
        "category": "Conference",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
        "startTimeHour": "6",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "10",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Conference Committee",
            "contactName": "Mark Mendoza",
            "email": "conference12@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 302,
            "invited": 111
        },
        "status": "Approved"
    },
    {
        "id": "7",
        "title": "Workshop Event 7",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-17T00:00:00.000Z",
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
            "lat": 10.286766,
            "lng": 123.91144
        },
        "category": "Workshop",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "5",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Workshop Committee",
            "contactName": "Chris Bautista",
            "email": "workshop7@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 324,
            "invited": 830
        },
        "status": "Approved"
    },
    {
        "id": "32",
        "title": "Reunion Event 32",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "date": "2026-01-07T00:00:00.000Z",
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
            "lat": 10.277276,
            "lng": 123.902243
        },
        "category": "Reunion",
        "image": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
        "startTimeHour": "1",
        "startTimeMinute": "00",
        "startTimeAmPm": "PM",
        "endTimeHour": "2",
        "endTimeMinute": "00",
        "endTimeAmPm": "PM",
        "address": "Cebu City, Philippines",
        "organizer": {
            "name": "Reunion Committee",
            "contactName": "Bea Castro",
            "email": "reunion32@example.com",
            "phone": "(032) 123-4567",
            "website": "www.example.com",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        "responses": {
            "going": 279,
            "invited": 972
        },
        "status": "Approved"
    }
];

