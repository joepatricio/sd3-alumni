import { Hero } from '@components/user/Hero';
import { CallToAction } from '@components/user/CallToAction';
import { EventsFeed } from '@components/user/EventsFeed';
import { BulletinFeed } from '@components/user/BulletinFeed';

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
