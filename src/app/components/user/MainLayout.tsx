import { useState, type ReactNode, lazy, Suspense } from 'react';
import { TopBar } from './TopBar';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

const MegaMenu = lazy(() => import('./MegaMenu').then(m => ({ default: m.MegaMenu })));
const Footer = lazy(() => import('./Footer').then(m => ({ default: m.Footer })));

interface LayoutProps {
    children?: ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col gap-10">
            <main className="flex-grow">
                <TopBar
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />
                <Suspense fallback={null}>
                    <MegaMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                </Suspense>
                <Navbar />
                {children ? children : <Outlet />}
            </main>
            <Suspense fallback={<div className="h-64 w-full bg-brand-footer animate-pulse" />}>
                <Footer />
            </Suspense>
        </div>
    );
}
