import { useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

// Thanks Caden Chen from Medium
// https://medium.com/@caden0002/fixing-scroll-position-issues-in-react-router-scroll-to-top-on-navigation-86bcfbdfc9db
// Works, but throws error, `Warning: Function components cannot be given refs.`
const ScrollToTop = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    useLayoutEffect(() => {
        // Scroll to the top of the page when the route changes
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    return children;
};

export default ScrollToTop;