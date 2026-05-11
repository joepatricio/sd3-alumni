import { useState, useEffect } from 'react';

const AUTH_EVENT_KEY = 'usjr_alumni_auth_change';

export interface UserSession {
    userId: string;
    email: string;
}

export const getSession = (): UserSession | null => {
    const session = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    if (!session) return null;
    try {
        return JSON.parse(session);
    } catch {
        return null;
    }
};

export const setSession = (session: UserSession | null, rememberMe: boolean = true): void => {
    if (session) {
        if (rememberMe) {
            localStorage.setItem('userSession', JSON.stringify(session));
            sessionStorage.removeItem('userSession');
        } else {
            sessionStorage.setItem('userSession', JSON.stringify(session));
            localStorage.removeItem('userSession');
        }
    } else {
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('userSession');
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

    useEffect(() => {
        const handleAuthChange = () => {
            setLoggedInState(getIsLoggedIn());
            setSessionState(getSession());
        };

        window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        
        return () => {
            window.removeEventListener(AUTH_EVENT_KEY, handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    return {
        isLoggedIn,
        session,
        setIsLoggedIn,
        setSession
    };
}
