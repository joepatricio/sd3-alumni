import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';
import {
    Star, Award, Trophy, BookOpen, Heart, HeartPulse, HandCoins,
    Calendar1, Calendar, CalendarDays, MessageSquare, MessageCircle,
    Sparkle, Sparkles, Newspaper, Cog
} from 'lucide-react';

export const AchievementIconMap: Record<string, any> = {
    Star, Award, Trophy, BookOpen, Heart, HeartPulse, HandCoins,
    Calendar1, Calendar, CalendarDays, MessageSquare, MessageCircle,
    Sparkle, Sparkles, Newspaper, Cog
};

export const useProfileRoute = () => {
    const { id } = useParams<{ id: string }>();
    const { session } = useAuth();

    const currentUserId = session?.userId?.toString() || '';
    const profileId = id || currentUserId || '1';
    const isOwner = !id || id === currentUserId;

    return { profileId, isOwner };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ensure that all requests correctly use the /api prefix or relative paths
api.interceptors.request.use(config => {
    // If the baseURL already ends with /api or /api/, and the request url starts with /,
    // Axios will strip the /api path. To fix this, we strip the leading slash from the request url.
    if (config.url && config.url.startsWith('/')) {
        config.url = config.url.substring(1);
    }
    return config;
});

export interface DegreeData {
    id: string;
    degreeName: string;
    degreeAbbr: string;
}

export interface ProfileData {
    id: string;
    userId: string;
    profileStatusId: string;
    userName: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
    currentJob: string;
    company: string;
    profileImage: string;
    degreeId: string;
    batch: number;
    birthday: string;
    gender: string;

    degree?: DegreeData;
}

export interface LocationData {
    id: string;
    regionCode: string;
    province: string;
    provinceCode: string;
    cityMunicipality: string;
    cityCode: string;
    barangay: string;
    landmark: string;
    street: string;
    lat: number;
    lng: number;
}

export interface RSVPData {
    id: string;
    userId: string;
    eventId: string;
    isAttending: boolean;
}

export interface EventData {
    id: string;
    adminId: string;
    authorId: string;
    eventStatusId: string;
    locationId: string;
    eventCategoryId: string;
    eventDate: string;
    reviewDate: string | null;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    responses: number;
    modality: string;
    eventImage: string;

    location?: LocationData;
    userRsvps?: RSVPData[];
    eventStatus?: { id: string, statusName: string };
    eventCategory?: { id: string, eventCategoryName: string };
}

export interface BulletinCommentData {
    id: string;
    profileId: string;
    bulletinId: string;
    commentDate: string;
    comment: string;
    likes: number;

    profile?: ProfileData;
    likesList?: any[];
}

export interface BulletinCategoryData {
    id: string;
    bulletinCategoryName: string;
}

export interface BulletinData {
    id: string;
    adminId: string;
    authorId: string;
    contentStatusId: string;
    bulletinCategoryId: string;
    bulletinDate: string;
    reviewDate: string | null;
    title: string;
    readTimeMinutes: number;
    content: string;
    bulletinImage: string;

    comments?: BulletinCommentData[];
    contentStatus?: ContentStatusData;
    bulletinCategory?: BulletinCategoryData;
    category?: BulletinCategoryData | string;
    profile?: ProfileData;
}


export interface UserStatisticsData {
    id: string;
    userId: string;
    dateRegistered: string;
    userConnections: number;
    eventsAttended: number;
    eventsCreated: number;
    bulletinsCreated: number;
    commentsWritten: number;
    achievements: number;
    donatedAmount: number;
}

export interface AlumniCard {
    userId: string;
    name: string;
    company: string;
    currentJob: string;
    batch: number;
    degreeName: string;
    profileImage: string;
}

export interface User {
    id: string;
    profileStatusId: string;
    userStatusId: string;
    recordId: string;

    userStatus?: UserStatusData;
    profileStatus?: ProfileStatusData;
    profile?: ProfileData;
}

export interface ContentStatusData {
    id: string;
    statusName: string;
}

export interface UserStatusData {
    id: string;
    statusName: string;
}

export interface ProfileStatusData {
    id: string;
    statusName: string;
}

export interface EventCategoryData {
    id: string;
    eventCategoryName: string;
}

export interface ConnectionStatusData {
    id: string;
    connectionName: string;
}

export interface DonationStatusData {
    id: string;
    statusName: string;
}

export interface UserConnectionData {
    id: string;
    userId: string;
    friendId: string;
    connectionStatusId: string;
    dateUpdated: string;
    status?: ConnectionStatusData;
    user?: User;
    friend?: User;
}

export interface UserStatusData {
    id: string;
    statusName: string;
}

export interface Donation {
    id: string;
    date: string;
    donor: string;
    amount: string;
    status: string;
    rawAmount: number;
    rawDate: number;
    bankName: string;
    donationReference: string;
}