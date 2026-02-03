import { useState } from 'react';
import { TopBar } from '@/app/components/TopBar';
import { MegaMenu } from '@/app/components/MegaMenu';
import { Navbar } from '@/app/components/Navbar';
import { Hero } from '@/app/components/Hero';
import { CallToAction } from '@/app/components/CallToAction';
import { EventsFeed } from '@/app/components/EventsFeed';
import { BulletinFeed } from '@/app/components/BulletinFeed';
import { Footer } from '@/app/components/Footer';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <TopBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <MegaMenu isOpen={isMenuOpen} />
      <Navbar />
      <Hero />
      <CallToAction />
      <EventsFeed />
      <BulletinFeed />
      <Footer />
    </div>
  );
}
