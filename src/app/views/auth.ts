import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '@/app/views/api';

const AUTH_EVENT_KEY = 'usjr_alumni_auth_change';

export interface UserSession {
    userId: string;
    email: string;
}

let currentSession: UserSession | null = null;

export const getSession = (): UserSession | null => {
    return currentSession;
};

export const setSession = (sessionData: UserSession | string | null, _rememberMe: boolean = true): void => {
    if (sessionData && typeof sessionData === 'object') {
        currentSession = sessionData;
    } else if (typeof sessionData === 'string') {
        try {
            const decoded: any = jwtDecode(sessionData);
            currentSession = {
                userId: decoded.id,
                email: decoded.email
            };
        } catch {
            currentSession = null;
        }
    } else {
        currentSession = null;
        api.post('/auth/logout').catch(() => { });
        localStorage.setItem('logoutEvent', Date.now().toString());
        localStorage.removeItem('logoutEvent');
    }

    // Ensure legacy storage tokens are purged
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event(AUTH_EVENT_KEY));
};

export const getIsLoggedIn = (): boolean => {
    return currentSession !== null;
};

// Kept for backwards compatibility until all components are updated
export const setIsLoggedIn = (status: boolean): void => {
    if (!status) {
        setSession(null);
    }
};

let inFlightAuthMe: Promise<UserSession | null> | null = null;

const hydrateSession = async (): Promise<UserSession | null> => {
    if (currentSession) return currentSession;
    if (inFlightAuthMe) return inFlightAuthMe;

    inFlightAuthMe = api.get('/auth/me')
        .then(res => {
            if (res.data?.id) {
                currentSession = {
                    userId: res.data.id,
                    email: res.data.email
                };
                return currentSession;
            }
            return null;
        })
        .catch(() => {
            return null;
        })
        .finally(() => {
            inFlightAuthMe = null;
        });

    return inFlightAuthMe;
};

export function useAuth() {
    const [isLoggedIn, setLoggedInState] = useState<boolean>(() => currentSession !== null);
    const [session, setSessionState] = useState<UserSession | null>(() => currentSession);
    const [isLoading, setIsLoading] = useState<boolean>(() => currentSession === null);

    useEffect(() => {
        let isMounted = true;

        const handleAuthChange = () => {
            if (isMounted) {
                setLoggedInState(currentSession !== null);
                setSessionState(currentSession);
                setIsLoading(false);
            }
        };

        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === 'logoutEvent') {
                currentSession = null;
                handleAuthChange();
            }
        };

        window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
        window.addEventListener('storage', handleStorageEvent);

        if (!currentSession) {
            hydrateSession().then(sess => {
                if (isMounted) {
                    setLoggedInState(sess !== null);
                    setSessionState(sess);
                    setIsLoading(false);
                }
            });
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
            window.removeEventListener(AUTH_EVENT_KEY, handleAuthChange);
            window.removeEventListener('storage', handleStorageEvent);
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
