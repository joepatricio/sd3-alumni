import { useState, useEffect, useCallback } from 'react';
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
    contentStatusId: string;
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
}

export interface BulletinCommentData {
    id: string;
    profileId: string;
    bulletinId: string;
    commentDate: string;
    comment: string;
    likes: number;

    profile?: ProfileData;
}

export interface BulletinData {
    id: string;
    adminId: string;
    profileId: string;
    contentStatusId: string;
    bulletinDate: string;
    reviewDate: string | null;
    title: string;
    readTimeMinutes: number;
    content: string;
    bulletinImage: string;

    comments?: BulletinCommentData[];
    contentStatus?: ContentStatusData;
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
}

export interface ContentStatusData {
    id: string;
    statusName: string;
}

export interface UserStatusData {
    id: string;
    statusName: string;
}

let globalLookupMap: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

export const useSystemLookup = () => {
    const [lookupMap, setLookupMap] = useState<Record<string, string>>(globalLookupMap || {});
    const [loading, setLoading] = useState(!globalLookupMap);

    useEffect(() => {
        if (globalLookupMap) return;

        if (!fetchPromise) {
            fetchPromise = Promise.all([
                api.get('/degrees'),
                api.get('/connectionStatuses'),
                api.get('/contentStatuses'),
                api.get('/userStatuses'),
                api.get('/donationStatuses'),
                api.get('/eventCategories'),
                api.get('/profileStatuses')
            ]).then(([deg, conn, cont, usr, don, evt, prof]) => {
                const map: Record<string, string> = {};
                if (deg.data) (deg.data).forEach((d: any) => map[d.id] = `${d.degreeName} (${d.degreeAbbr})`);
                if (conn.data) (conn.data).forEach((d: any) => map[d.id] = d.connectionName);
                if (cont.data) (cont.data).forEach((d: any) => map[d.id] = d.statusName);
                if (usr.data) (usr.data).forEach((d: any) => map[d.id] = d.statusName);
                if (don.data) (don.data).forEach((d: any) => map[d.id] = d.statusName);
                if (evt.data) (evt.data).forEach((d: any) => map[d.id] = d.eventCategoryName);
                if (prof.data) (prof.data).forEach((d: any) => map[d.id] = d.statusName);
                return map;
            }).catch(err => {
                console.error("Failed to fetch lookup tables", err);
                return {};
            });
        }

        fetchPromise.then(map => {
            globalLookupMap = map;
            setLookupMap(map);
            setLoading(false);
        });
    }, []);

    const lookup = useCallback((id: string | null | undefined) => (id ? lookupMap[id] || 'N/A' : 'N/A'), [lookupMap]);

    const reverseLookup = useCallback((value: string) => {
        const entry = Object.entries(lookupMap).find(([_, val]) => val === value);
        return entry ? entry[0] : null;
    }, [lookupMap]);

    return { lookupMap, loading, lookup, reverseLookup };
};