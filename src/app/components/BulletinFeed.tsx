import { Clock, Tag } from 'lucide-react';

export function BulletinFeed() {
  const bulletins = [
    {
      id: 1,
      title: 'USJR Alumni Launches New Scholarship Program for Underprivileged Students',
      excerpt:
        'The USJR Alumni Association announces a groundbreaking scholarship initiative aimed at providing educational opportunities to deserving students from low-income families.',
      date: 'February 1, 2026',
      author: 'Alumni Relations Office',
      category: 'Announcements',
      image:
        'https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBhZXJpYWx8ZW58MXx8fHwxNzcwMDQ5MzI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Distinguished Alumnus Receives National Recognition for Medical Research',
      excerpt:
        'Dr. Maria Santos (Class of 2005) has been awarded the prestigious National Science Award for her groundbreaking research in infectious disease prevention.',
      date: 'January 28, 2026',
      author: 'Communications Team',
      category: 'Alumni Spotlight',
      image:
        'https://images.unsplash.com/photo-1763718432504-7716caff6e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZXIlMjBwcm9mZXNzaW9uYWwlMjBzdWNjZXNzJTIwbWVudG9yfGVufDF8fHx8MTc3MDA5MTg0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '4 min read',
    },
    {
      id: 3,
      title: 'Record-Breaking Fundraiser Raises ₱5 Million for Campus Development',
      excerpt:
        'The annual alumni giving campaign exceeded all expectations, with contributions funding new laboratories, library resources, and student support programs.',
      date: 'January 25, 2026',
      author: 'Development Office',
      category: 'News',
      image:
        'https://images.unsplash.com/photo-1767274101063-a735a6849afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBwZW9wbGUlMjBkaXZlcnNlfGVufDF8fHx8MTc3MDA5MTgzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '3 min read',
    },
    {
      id: 4,
      title: 'New Alumni Chapter Established in Singapore',
      excerpt:
        'USJR alumni residing in Singapore have officially formed a regional chapter, creating new opportunities for networking and collaboration in Southeast Asia.',
      date: 'January 22, 2026',
      author: 'International Relations',
      category: 'Community',
      image:
        'https://images.unsplash.com/photo-1768508948485-a7adc1f3427f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzAwOTE4Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '6 min read',
    },
    {
      id: 5,
      title: 'Alumni Mentorship Program Celebrates 100th Match',
      excerpt:
        'The successful mentorship initiative has now connected over 100 recent graduates with experienced professionals in their fields of interest.',
      date: 'January 20, 2026',
      author: 'Career Services',
      category: 'Programs',
      image:
        'https://images.unsplash.com/photo-1684841565710-168022dfda52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWxsZXRpbiUyMGJvYXJkJTIwbmV3cyUyMGFubm91bmNlbWVudHxlbnwxfHx8fDE3NzAwOTE4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '4 min read',
    },
    {
      id: 6,
      title: 'Virtual Campus Tour Now Available for Global Alumni',
      excerpt:
        'Experience the newly renovated USJR campus from anywhere in the world with our interactive 360-degree virtual tour featuring all major facilities.',
      date: 'January 18, 2026',
      author: 'Digital Services',
      category: 'Updates',
      image:
        'https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBhZXJpYWx8ZW58MXx8fHwxNzcwMDQ5MzI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '2 min read',
    },
  ];

  return (
    <section id="bulletin" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Bulletin</h2>
            <p className="text-gray-600">
              Stay informed with news and stories from the USJR community
            </p>
          </div>
          <a
            href="#all-bulletins"
            className="text-[#1a5f3f] hover:text-[#2d7a4f] font-semibold hidden sm:block"
          >
            View All →
          </a>
        </div>

        {/* Featured Article */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img
                src={bulletins[0].image}
                alt={bulletins[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-4 left-4 bg-[#d4af37] text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </span>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {bulletins[0].category}
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
                  <p>{bulletins[0].author}</p>
                  <p>{bulletins[0].date}</p>
                </div>
                <button className="bg-[#1a5f3f] text-white px-6 py-2 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold">
                  Read More
                </button>
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
              <div className="relative h-48 overflow-hidden">
                <img
                  src={bulletin.image}
                  alt={bulletin.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {bulletin.category}
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
                  <span>{bulletin.date}</span>
                  <button className="text-[#1a5f3f] hover:text-[#2d7a4f] font-semibold">
                    Read →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <a
            href="#all-bulletins"
            className="text-[#1a5f3f] hover:text-[#2d7a4f] font-semibold"
          >
            View All Bulletins →
          </a>
        </div>
      </div>
    </section>
  );
}