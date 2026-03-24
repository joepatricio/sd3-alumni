import { useState, type ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Navbar } from './Navbar';
import { MegaMenu } from './MegaMenu';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

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
                <MegaMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                <Navbar />
                {children ? children : <Outlet />}
            </main>
            <Footer />
        </div>
    );
}
