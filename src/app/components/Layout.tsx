import { useState, ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Navbar } from './Navbar';
import { MegaMenu } from './MegaMenu';
import { Footer } from './Footer';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col gap-15">
            <main className="flex-grow">
                <TopBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <MegaMenu isOpen={isMenuOpen} />
                <Navbar />
                {children}
            </main>
            <Footer />
        </div>
    );
}
