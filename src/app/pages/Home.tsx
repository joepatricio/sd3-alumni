import { Hero } from '../components/Hero';
import { CallToAction } from '../components/CallToAction';
import { EventsFeed } from '../components/EventsFeed';
import { BulletinFeed } from '../components/BulletinFeed';

export function Home() {
    return (
        <>
            <Hero />
            <CallToAction />
            <EventsFeed />
            <BulletinFeed />
        </>
    );
}
