import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';
import {
    Star, Award, Trophy, BookOpen, Heart, HeartPulse, HandCoins,
    Calendar, CalendarDays, MessageSquare, MessageCircle,
    Sparkle, Sparkles, Newspaper, Cog
} from 'lucide-react';

export const AchievementIconMap: Record<string, any> = {
    Star, Award, Trophy, BookOpen, Heart, HeartPulse, HandCoins,
    Calendar, CalendarDays, MessageSquare, MessageCircle,
    Sparkle, Sparkles, Newspaper, Cog
};

export const useProfileRoute = () => {
    const { id } = useParams<{ id: string }>();
    const { session } = useAuth();

    const currentUserId = session?.user_id?.toString() || '';
    const profileId = id || currentUserId || '1';
    const isOwner = !id || id === currentUserId;

    return { profileId, isOwner };
};

// Based on tests: 20ms is safe, 10ms dropped 1/2000 requests
const API_BASE_URL = 'http://localhost:3000';
const DELAY = 20;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Global queue for mutating requests to prevent json-server race conditions
let requestQueue = Promise.resolve();

const queueRequest = <T>(requestFn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        requestQueue = requestQueue.then(async () => {
            try {
                const res = await requestFn();
                await new Promise(r => setTimeout(r, DELAY));
                resolve(res);
            } catch (err) {
                reject(err);
            }
        });
    });
};

const originalPost = api.post;
const originalPut = api.put;
const originalPatch = api.patch;
const originalDelete = api.delete;

api.post = function (this: any, ...args: any[]) {
    return queueRequest(() => originalPost.apply(this, args));
} as typeof api.post;

api.put = function (this: any, ...args: any[]) {
    return queueRequest(() => originalPut.apply(this, args));
} as typeof api.put;

api.patch = function (this: any, ...args: any[]) {
    return queueRequest(() => originalPatch.apply(this, args));
} as typeof api.patch;

api.delete = function (this: any, ...args: any[]) {
    return queueRequest(() => originalDelete.apply(this, args));
} as typeof api.delete;

export interface ProfileData {
    user_id: number;
    user_name: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
    currentJob: string;
    company: string;
    profileImage: string;
    degree_id: number;
    batch: number;
    birthday: string;
}

export interface DegreeData {
    degree_id: number;
    degree_name: string;
    degree_abbr: string;
}

export interface UserStatisticsData {
    user_id: number;
    date_registered: string;
    user_connections: number;
    events_attended: number;
    events_created: number;
    bulletins_created: number;
    comments_written: number;
    achievements: number;
    donated_amount: number;
}

export interface AlumniCard {
    user_id: number;
    name: string;
    company: string;
    currentJob: string;
    batch: number;
    degreeName: string;
    profileImage: string;
}

let globalLookupMap: Record<number, string> | null = null;
let fetchPromise: Promise<Record<number, string>> | null = null;

export const useSystemLookup = () => {
    const [lookupMap, setLookupMap] = useState<Record<number, string>>(globalLookupMap || {});
    const [loading, setLoading] = useState(!globalLookupMap);

    useEffect(() => {
        if (globalLookupMap) return;

        if (!fetchPromise) {
            fetchPromise = Promise.all([
                api.get('/DEGREE'),
                api.get('/CONNECTION_STATUS'),
                api.get('/CONTENT_STATUS'),
                api.get('/USER_STATUS'),
                api.get('/DONATION_STATUS'),
                api.get('/EVENT_CATEGORY')
            ]).then(([deg, conn, cont, usr, don, evt]) => {
                const map: Record<number, string> = {};
                if (deg.data?.data || deg.data) (deg.data.data || deg.data).forEach((d: any) => map[d.degree_id] = `${d.degree_name} (${d.degree_abbr})`);
                if (conn.data?.data || conn.data) (conn.data.data || conn.data).forEach((d: any) => map[d.connection_code] = d.connection_name);
                if (cont.data?.data || cont.data) (cont.data.data || cont.data).forEach((d: any) => map[d.content_status_id] = d.status_name);
                if (usr.data?.data || usr.data) (usr.data.data || usr.data).forEach((d: any) => map[d.user_status_id] = d.status_name);
                if (don.data?.data || don.data) (don.data.data || don.data).forEach((d: any) => map[d.donation_status_id] = d.status_name);
                if (evt.data?.data || evt.data) (evt.data.data || evt.data).forEach((d: any) => map[d.event_category_id] = d.event_category_name);
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

    const lookup = (id: number | string) => lookupMap[Number(id)] || 'N/A';

    return { lookupMap, loading, lookup };
};