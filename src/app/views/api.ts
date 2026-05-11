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