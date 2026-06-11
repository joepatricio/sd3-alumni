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
                sessionStorage.removeItem('userSession');
                localStorage.removeItem('userSession');
                handleAuthChange();
            } else if (e.key === 'requestSession' && sessionStorage.getItem('userSession')) {
                localStorage.setItem('shareSession', sessionStorage.getItem('userSession')!);
                localStorage.removeItem('shareSession');
            } else if (e.key === 'shareSession' && e.newValue && !sessionStorage.getItem('userSession')) {
                sessionStorage.setItem('userSession', e.newValue);
                handleAuthChange();
            } else if (e.key === 'userSession') {
                handleAuthChange();
            }
        };

        window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
        window.addEventListener('storage', handleStorageEvent);
        
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
