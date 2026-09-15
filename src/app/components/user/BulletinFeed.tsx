import { useState, useEffect } from 'react';
import { Clock, FileText, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type BulletinData, type ProfileData } from '@/app/views/api';
import { DEFAULT_PROFILE, formatDate } from '@/app/views/formatters';

export function BulletinFeed() {
  const [bulletins, setBulletins] = useState<BulletinData[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes] = await Promise.all([
          api.get('/bulletins', {
            params: {
              _where: JSON.stringify({ status: { statusName: 'Approved' } }),
              _sort: '-bulletinDate',
              _page: 1,
              _per_page: 7,
              _include: 'author, category'
            }
          })
        ]);
        const bData = bRes.data.data;

        setBulletins(bData || []);
        const pMap: Record<string, ProfileData> = {};
        (bData || []).forEach((b: any) => {
          if (b.author.profile) pMap[b.authorId] = b.author.profile;
        });
        setProfilesMap(pMap);
      } catch (err) {
        console.error("Failed to fetch bulletins:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayBulletins = bulletins;

  if (loading) {
    return (
      <section id="bulletin" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading recent bulletins...</p>
        </div>
      </section>
    );
  }

  if (displayBulletins.length === 0) {
    return (
      <section id="bulletin" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Latest Bulletin</h2>
          </div>
          <div className="py-12 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-gray-600 mb-1">No Recent Bulletins</h3>
            <p className="text-gray-500">Check back later for updates from the community.</p>
          </div>
        </div>
      </section>
    );
  }

  const featured = displayBulletins[0];
  const featuredAuthor = profilesMap[featured.authorId]?.userName || "Unknown Author";

  return (
    <section id="bulletin" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Bulletin</h2>
            <p className="text-gray-600">
              Stay informed with news and stories from the USJ-R community
            </p>
          </div>
          <Link
            to="/bulletin"
            className="text-brand-primary hover:text-brand-primary-hover font-semibold hidden sm:block"
          >
            View All →
          </Link>
        </div>

        {/* Featured Article */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow mb-8 group">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-full max-h-[20rem] overflow-hidden bg-gray-100 flex items-center justify-center">
              {!featured.bulletinImage && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                  <img
                    src={featured.bulletinImage || featured.author?.profile?.profileImage || DEFAULT_PROFILE}
                    alt=""
                    className="w-full h-full object-cover blur-3xl scale-140 opacity-75 transition-transform duration-500 group-hover:scale-150"
                  />
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-xs" />
                </div>
              )}
              <img
                src={featured.bulletinImage || featured.author?.profile?.profileImage || DEFAULT_PROFILE}
                alt={featured.title}
                className={`relative z-10 w-full h-full transition-transform duration-300 group-hover:scale-105 ${featured.bulletinImage
                  ? 'object-cover'
                  : 'object-contain drop-shadow-xl'
                  }`} />
              <span className="absolute top-4 left-4 z-20 bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                Featured
              </span>
            </div>
            <div className="content-center p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(featured.bulletinDate, 'long')}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featured.readTimeMinutes} min read
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 line-clamp-2">{featured.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{featured.content}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>By <Link to={`/profile/${featured.authorId}`} className="hover:text-brand-primary transition-colors">{featuredAuthor}</Link></p>
                </div>
                <Link to={`/bulletin/${featured.id}`} className="bg-brand-primary cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBulletins.slice(1).map((bulletin) => {
            const authorName = profilesMap[bulletin.authorId]?.userName || "Unknown Author";
            const bulletinImg = bulletin.bulletinImage || bulletin.author?.profile?.profileImage || DEFAULT_PROFILE;
            const isContain = !bulletin.bulletinImage;
            return (
              <div
                key={bulletin.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {isContain && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                      <img
                        src={bulletinImg}
                        alt=""
                        className="w-full h-full object-cover blur-3xl scale-140 opacity-75 transition-transform duration-500 group-hover:scale-150"
                      />
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-xs" />
                    </div>
                  )}
                  <img
                    src={bulletinImg}
                    alt={bulletin.title}
                    className={`relative z-10 w-full h-full transition-transform duration-300 group-hover:scale-105 ${isContain
                      ? 'object-contain drop-shadow-xl'
                      : 'object-cover'
                      }`} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(bulletin.bulletinDate, 'long')}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bulletin.readTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {bulletin.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {bulletin.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By <Link to={`/profile/${bulletin.authorId}`} className="hover:text-brand-primary transition-colors">{authorName}</Link></span>
                    <Link to={`/bulletin/${bulletin.id}`} className="text-brand-primary cursor-pointer hover:text-brand-primary-hover font-semibold">
                      Read →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            to="/bulletin"
            className="text-brand-primary hover:text-brand-primary-hover font-semibold"
          >
            View All Bulletins →
          </Link>
        </div>
      </div>
    </section>
  );
}