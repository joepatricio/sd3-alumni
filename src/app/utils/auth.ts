import { useState, useEffect } from 'react';

const AUTH_EVENT_KEY = 'usjr_alumni_auth_change';

export const getIsLoggedIn = (): boolean => {
    return localStorage.getItem('userIsLoggedIn') === 'true';
};

export const setIsLoggedIn = (status: boolean): void => {
    localStorage.setItem('userIsLoggedIn', String(status));
    window.dispatchEvent(new Event(AUTH_EVENT_KEY));
};

export function useAuth() {
    const [isLoggedIn, setLoggedInState] = useState<boolean>(getIsLoggedIn());

    useEffect(() => {
        const handleAuthChange = () => {
            setLoggedInState(getIsLoggedIn());
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
        setIsLoggedIn
    };
}
