import { Clock, FileText, Calendar } from 'lucide-react';
import { bulletins } from '@assets/mockData';
import { Link } from 'react-router-dom';

const mockBulletins = bulletins.filter(b => b.status === "Approved");

export function BulletinFeed() {
  const bulletins = mockBulletins.slice(0, 7).map((b) => ({
    ...b,
    excerpt: b.preview,
    author: b.author.name,
    image: b.heroImage,
  }));

  if (bulletins.length === 0) {
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
          <a
            href="https://www.facebook.com/usjr.official"
            className="text-brand-primary hover:text-brand-primary-hover font-semibold hidden sm:block"
          >
            View All →
          </a>
        </div>

        {/* Featured Article */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-full max-h-[20rem] overflow-hidden bg-gray-100">
              {bulletins[0].image ? (
                <img
                  src={bulletins[0].image}
                  alt={bulletins[0].title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FileText className="w-12 h-12 opacity-50" />
                </div>
              )}
              <span className="absolute top-4 left-4 bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </span>
            </div>
            <div className="content-center p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(bulletins[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {bulletins[0].readTime}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{bulletins[0].title}</h3>
              <p className="text-gray-600 mb-4">{bulletins[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>By {bulletins[0].author}</p>
                </div>
                <Link to={`/bulletin/${bulletins[0].id}`} className="bg-brand-primary cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bulletins.slice(1).map((bulletin) => (
            <div
              key={bulletin.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {bulletin.image ? (
                  <img
                    src={bulletin.image}
                    alt={bulletin.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FileText className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(bulletin.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {bulletin.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {bulletin.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {bulletin.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {bulletin.author}</span>
                  <Link to={`/bulletin/${bulletin.id}`} className="text-brand-primary cursor-pointer hover:text-brand-primary-hover font-semibold">
                    Read →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <a
            href="https://www.facebook.com/usjr.official"
            className="text-brand-primary hover:text-brand-primary-hover font-semibold"
          >
            View All Bulletins →
          </a>
        </div>
      </div>
    </section>
  );
}