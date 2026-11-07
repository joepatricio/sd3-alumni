import { CallToAction } from '@components/user/CallToAction';
import { EventsFeed } from '@components/user/EventsFeed';
import { BulletinFeed } from '@components/user/BulletinFeed';
import CuratedHero from '@/app/components/user/CuratedHero';

export function Home() {
    return (
        <div className="overflow-x-clip">
            <CuratedHero />
            <CallToAction />
            <EventsFeed />
            <BulletinFeed />
        </div>
    );
}
