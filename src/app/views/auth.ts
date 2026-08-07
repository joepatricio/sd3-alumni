import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '@/app/views/api';

const AUTH_EVENT_KEY = 'usjr_alumni_auth_change';

export interface UserSession {
    userId: string;
    email: string;
}

export const getSession = (): UserSession | null => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded: any = jwtDecode(token);
        return {
            userId: decoded.id,
            email: decoded.email
        };
    } catch {
        return null;
    }
};

export const setSession = (token: string | null, rememberMe: boolean = true): void => {
    if (token) {
        if (rememberMe) {
            localStorage.setItem('token', token);
            sessionStorage.removeItem('token');
        } else {
            sessionStorage.setItem('token', token);
            localStorage.removeItem('token');
        }
    } else {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.setItem('logoutEvent', Date.now().toString());
        localStorage.removeItem('logoutEvent');
    }
    window.dispatchEvent(new Event(AUTH_EVENT_KEY));
};

export const getIsLoggedIn = (): boolean => {
    return getSession() !== null;
};

// Kept for backwards compatibility until all components are updated
export const setIsLoggedIn = (status: boolean): void => {
    if (!status) {
        setSession(null);
    }
};

export function useAuth() {
    const [isLoggedIn, setLoggedInState] = useState<boolean>(getIsLoggedIn());
    const [session, setSessionState] = useState<UserSession | null>(getSession());
    const [isLoading, setIsLoading] = useState<boolean>(() => !getSession());

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleAuthChange = () => {
            setLoggedInState(getIsLoggedIn());
            setSessionState(getSession());
            setIsLoading(false);
        };

        window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === 'logoutEvent') {
                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
                handleAuthChange();
            } else if (e.key === 'requestSession' && sessionStorage.getItem('token')) {
                localStorage.setItem('shareSession', sessionStorage.getItem('token')!);
                localStorage.removeItem('shareSession');
            } else if (e.key === 'shareSession' && e.newValue && !sessionStorage.getItem('token')) {
                sessionStorage.setItem('token', e.newValue);
                handleAuthChange();
            } else if (e.key === 'token') {
                handleAuthChange();
            }
        };

        window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
        window.addEventListener('storage', handleStorageEvent);
        
        // Background API validation
        if (getIsLoggedIn()) {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch((error) => {
                    console.error("Session validation failed:", error);
                    setSession(null);
                });
            }
        }
        
        if (!getSession()) {
            localStorage.setItem('requestSession', Date.now().toString());
            localStorage.removeItem('requestSession');
            const waitTime = document.visibilityState === 'hidden' ? 2500 : 500;
            timeoutId = setTimeout(() => {
                setIsLoading(false);
            }, waitTime);
        } else {
            setIsLoading(false);
        }

        return () => {
            window.removeEventListener(AUTH_EVENT_KEY, handleAuthChange);
            window.removeEventListener('storage', handleStorageEvent);
            clearTimeout(timeoutId);
        };
    }, []);

    return {
        isLoggedIn,
        isLoading,
        session,
        setIsLoggedIn,
        setSession
    };
}
