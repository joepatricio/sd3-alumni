import { useLocation } from 'react-router-dom';
import { useLayoutEffect, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
    children?: React.ReactNode;
    scrollContainerRef?: React.RefObject<any>;
}

const ScrollToTop = ({ children, scrollContainerRef }: ScrollToTopProps) => {
    const location = useLocation();
    const [showScrollTop, setShowScrollTop] = useState(false);

    const scrollToTop = () => {
        if (scrollContainerRef?.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useLayoutEffect(() => {
        // Scroll to the top of the page when the route changes
        if (scrollContainerRef?.current) {
            scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    }, [location.pathname, scrollContainerRef]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = scrollContainerRef?.current
                ? scrollContainerRef.current.scrollTop
                : window.scrollY;

            if (scrollTop > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        const target = scrollContainerRef?.current || window;
        target.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        return () => target.removeEventListener('scroll', handleScroll as EventListener);
    }, [scrollContainerRef]);

    return (
        <>
            {children}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-[#d97706] text-white p-3 rounded-full shadow-lg hover:bg-[#92400e] transition-all flex items-center justify-center z-50 animate-in fade-in slide-in-from-bottom-2"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}
        </>
    );
};

export default ScrollToTop;