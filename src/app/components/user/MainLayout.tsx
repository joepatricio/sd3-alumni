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
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col gap-15">
            <main className="flex-grow">
                <TopBar
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />
                <MegaMenu isOpen={isMenuOpen} />
                <Navbar />
                {children ? children : <Outlet context={{ isLoggedIn }} />}
            </main>
            <Footer />
        </div>
    );
}
