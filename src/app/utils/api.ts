import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ProfileData {
    user_id: number;
    user_name: string;
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