import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';
import {
    Star, Award, Trophy, BookOpen, Heart, HeartPulse, HandCoins,
    Calendar1, Calendar, CalendarDays, MessageSquare, MessagesSquare,
    Sparkle, Sparkles, Newspaper, Cog, Landmark, type LucideIcon
} from 'lucide-react';

export const AchievementIconMap: Record<string, LucideIcon> = {
    Star, Award, Trophy, BookOpen, Heart, HeartPulse, HandCoins,
    Calendar1, Calendar, CalendarDays, MessageSquare, MessagesSquare,
    Sparkle, Sparkles, Newspaper, Cog, Landmark
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
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ensure that all requests correctly use the /api prefix or relative paths, and attach tokens
api.interceptors.request.use(config => {
    // If the baseURL already ends with /api or /api/, and the request url starts with /,
    // Axios will strip the /api path. To fix this, we strip the leading slash from the request url.
    if (config.url && config.url.startsWith('/')) {
        config.url = config.url.substring(1);
    }

    const headers = config.headers as unknown as Record<string, unknown>;
    const rawAuth = headers?.Authorization || headers?.authorization;
    const existingAuth = typeof rawAuth === 'string' ? rawAuth : undefined;
    if (existingAuth === 'Bearer null' || existingAuth === 'Bearer undefined') {
        if (headers?.set && typeof headers.set === 'function') {
            headers.set('Authorization', undefined);
        } else if (headers) {
            delete headers.Authorization;
            delete headers.authorization;
        }
    }

    if (!headers?.Authorization && !headers?.authorization) {
        const adminToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('adminToken') : null;
        const userToken = (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null) ||
            (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null);
        const isAdminRoute = config.url?.startsWith('admin/') ||
            config.url?.startsWith('api/admin/') ||
            config.url?.startsWith('auth/admin/') ||
            config.url?.startsWith('api/auth/admin/');
        const token = isAdminRoute ? adminToken : userToken;

        if (token && token !== 'null' && token !== 'undefined') {
            if (headers?.set && typeof headers.set === 'function') {
                headers.set('Authorization', `Bearer ${token}`);
            } else if (headers) {
                headers.Authorization = `Bearer ${token}`;
            }
        }
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
    isValid?: boolean | null;
    user?: User | null;
}

export interface EventData {
    id: string;
    adminId: string;
    authorId: string;
    adminNotes?: string | null;
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

    author?: User;
    location?: LocationData;
    userRsvps?: RSVPData[];
    eventStatus?: { id: string, statusName: string };
    eventCategory?: { id: string, eventCategoryName: string };
}

export interface BulletinCommentData {
    id: string;
    userId: string;
    bulletinId: string;
    commentDate: string;
    comment: string;
    likes: number;

    profile?: ProfileData;
    likesList?: { id?: string; userId: string; isLiked: boolean }[];
}

export interface BulletinCategoryData {
    id: string;
    bulletinCategoryName: string;
}

export interface BulletinData {
    id: string;
    adminId: string;
    authorId: string;
    adminNotes?: string | null;
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
    author?: User;
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

export interface AchievementData {
    id: string;
    achievementCategory: number;
    achievementTier: number;
    achievementTitle: string;
    achievementDescription: string;
    achievementIcon: string;
}

export interface UserAchievementData {
    id: string;
    userId: string;
    achievementId: string;
    achievementTier: number;
    achievedDate: string;
    achievement?: AchievementData;
}

export interface RecordData {
    id: string;
    userId: string;
    adminId?: string | null;
    userStatusId: string;
    dateCreated: string;
    description: string;
    dateExpires?: string | null;

    expirationDate?: string | null;
    userStatus?: UserStatusData;
}

export interface DonationData {
    id: string;
    userId?: string | null;
    donationAmount: number;
    donationDate: string;
    bankName?: string | null;
    donationReference?: string | null;
    donationStatusId: string;
    donationStatus?: DonationStatusData;
    user?: { profile?: ProfileData };
}

export interface DonorLeaderboardEntry {
    donor: string;
    amount: number;
    avgDonation: number;
    frequency: number;
    userId: string;
    profileImage: string;
    career: string;
    email: string;
    location: string;
    batch: string;
}

export interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    batch: string;
    status: string;
    reason?: string;
    grantedDate?: string;
    rawGrantedDate?: number;
    expiryDate?: string;
    rawExpiryDate?: number;
}

export interface PaginatedResponse<T> {
    first?: number;
    prev?: number | null;
    next?: number | null;
    last?: number;
    pages?: number;
    items?: number;
    data: T[];
}

export type ApiResponse<T> = PaginatedResponse<T> | T[];

export interface ListResult<T> {
    items: T[];
    total: number;
}

export function unwrapListResponse<T>(resData: unknown): ListResult<T> {
    if (!resData) return { items: [], total: 0 };

    const candidate = (typeof resData === "object" && resData !== null && "data" in resData)
        ? (resData as { data: unknown }).data
        : resData;

    if (Array.isArray(candidate)) {
        return { items: candidate as T[], total: candidate.length };
    }

    if (candidate && typeof candidate === "object") {
        const obj = candidate as Record<string, unknown>;
        if (Array.isArray(obj.data)) {
            const items = obj.data as T[];
            const total = typeof obj.items === "number" ? obj.items : items.length;
            return { items, total };
        }
    }

    return { items: [], total: 0 };
}
