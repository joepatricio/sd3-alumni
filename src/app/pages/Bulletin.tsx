import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    List,
    LayoutGrid,
    Calendar,
    Filter,
    User,
    Clock,
} from 'lucide-react';

type ViewMode = 'headline' | 'article';

interface BulletinItem {
    id: string;
    title: string;
    author: {
        name: string;
        image: string;
    };
    date: string;
    preview: string;
    content: string;
    heroImage?: string;
    isUserSubmitted: boolean;
}

export function Bulletin() {
    const [viewMode, setViewMode] = useState<ViewMode>('headline');
    const [showUserSubmitted, setShowUserSubmitted] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const bulletinItems: BulletinItem[] = [
        {
            id: '1',
            title: 'USJR Alumni Association Announces New Scholarship Program',
            author: {
                name: 'Maria Santos',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 8, 2026',
            preview:
                'We are thrilled to announce the launch of our new scholarship program aimed at supporting deserving students...',
            content:
                'We are thrilled to announce the launch of our new scholarship program aimed at supporting deserving students from underserved communities. This initiative reflects our commitment to giving back and ensuring that quality education remains accessible to all. The scholarship will cover full tuition for qualified applicants and includes a mentorship component where recipients will be paired with successful alumni in their field of interest.',
            heroImage:
                'https://images.unsplash.com/photo-1725738704638-361eac814fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjYW1wdXMlMjBsaWZlfGVufDF8fHx8MTc3MDcwNTY0OXww&ixlib=rb-4.1.0&q=80&w=1080',
            isUserSubmitted: false,
        },
        {
            id: '2',
            title: 'Tech Startup Founded by USJR Alumnus Raises $2M in Seed Funding',
            author: {
                name: 'John Reyes',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 6, 2026',
            preview:
                'A technology startup founded by USJR alumnus Michael Torres has successfully raised $2 million in seed funding...',
            content:
                'A technology startup founded by USJR alumnus Michael Torres has successfully raised $2 million in seed funding from prominent venture capital firms. The company, which focuses on AI-powered educational tools, aims to revolutionize how students learn and engage with course materials. Torres, who graduated with a degree in Computer Science in 2018, credits his education at USJR for laying the foundation of his entrepreneurial journey.',
            heroImage:
                'https://images.unsplash.com/photo-1725203653092-494c7eec1a30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMGFydGljbGV8ZW58MXx8fHwxNzcwNzA1NjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
            isUserSubmitted: true,
        },
        {
            id: '3',
            title: 'Annual Homecoming 2026: A Grand Celebration of Josenian Spirit',
            author: {
                name: 'Alumni Relations Office',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 5, 2026',
            preview:
                'This year\'s homecoming was truly unforgettable! Over 5,000 alumni gathered to reconnect, reminisce...',
            content:
                'This year\'s homecoming was truly unforgettable! Over 5,000 alumni gathered to reconnect, reminisce, and celebrate the enduring Josenian spirit that binds us all. The event featured inspiring talks from distinguished alumni, cultural performances, and a grand alumni parade. Special recognition was given to the Golden Jubilarians - members of the Class of 1976 - who celebrated 50 years since graduation. The festivities concluded with a spectacular fireworks display that lit up the Cebu sky.',
            heroImage:
                'https://images.unsplash.com/photo-1758270703662-b7d58bf0a8a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZ3JhZHVhdGVzJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzcwNjkwNjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
            isUserSubmitted: false,
        },
        {
            id: '4',
            title: 'Looking for Batch 2010 Classmates for Mini Reunion',
            author: {
                name: 'Anna Cruz',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 3, 2026',
            preview:
                'Hello fellow Josenians from the Class of 2010! I\'m organizing a mini reunion for our batch...',
            content:
                'Hello fellow Josenians from the Class of 2010! I\'m organizing a mini reunion for our batch and would love to reconnect with everyone. We\'re planning to meet on March 15th at the campus. Please reach out if you\'re interested in joining! It\'s been 16 years since we graduated, and I think it would be wonderful to catch up, share stories, and see how everyone\'s journey has unfolded. Looking forward to seeing familiar faces!',
            isUserSubmitted: true,
        },
        {
            id: '5',
            title: 'New Alumni Mentorship Program Launches Next Month',
            author: {
                name: 'Career Development Office',
                image:
                    'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
            },
            date: 'February 1, 2026',
            preview:
                'We are excited to introduce our new Alumni Mentorship Program, connecting experienced professionals with recent graduates...',
            content:
                'We are excited to introduce our new Alumni Mentorship Program, connecting experienced professionals with recent graduates and current students. This program aims to foster meaningful relationships that will help guide the next generation of Josenians in their career paths. Mentors will provide insights, advice, and support based on their own professional experiences. If you\'re interested in becoming a mentor or mentee, registration opens next month through the alumni portal.',
            heroImage:
                'https://images.unsplash.com/photo-1741835698663-c1860b7d1f53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ld3MlMjBhcnRpY2xlfGVufDF8fHx8MTc3MDY5MjYwMXww&ixlib=rb-4.1.0&q=80&w=1080',
            isUserSubmitted: false,
        },
    ];

    const filteredItems = showUserSubmitted
        ? bulletinItems.filter((item) => !item.isUserSubmitted)
        : bulletinItems;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Alumni Bulletin</h1>
                            <p className="text-gray-600">
                                Stay updated with the latest news and announcements from the
                                USJR alumni community
                            </p>
                        </div>
                        <Link
                            to="/bulletin/create"
                            className="flex items-center justify-center gap-2 bg-[#1a5f3f] text-white px-6 py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Create Bulletin
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Filters */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            {/* View Mode */}
                            <div className="mb-6">
                                <h3 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-700">
                                    View
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setViewMode('article')}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${viewMode === 'article'
                                            ? 'bg-[#1a5f3f] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                        <span className="text-sm font-medium">Article view</span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('headline')}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${viewMode === 'headline'
                                            ? 'bg-[#1a5f3f] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                        <span className="text-sm font-medium">Headline view</span>
                                    </button>
                                </div>
                            </div>

                            {/* Scope Filter */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h3 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-700">
                                    Scope
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showUserSubmitted}
                                        onChange={(e) => setShowUserSubmitted(e.target.checked)}
                                        className="w-4 h-4 text-[#1a5f3f] border-gray-300 rounded focus:ring-[#1a5f3f]"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Official posts only
                                    </span>
                                </label>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <h3 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-700">
                                    Filter
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="space-y-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {viewMode === 'article' ? (
                                        /* Article View */
                                        <>
                                            {item.heroImage && (
                                                <div className="w-full h-64 overflow-hidden">
                                                    <img
                                                        src={item.heroImage}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                                    >
                                                        <img
                                                            src={item.author.image}
                                                            alt={item.author.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            {item.author.name}
                                                        </span>
                                                    </Link>
                                                    <span className="text-gray-400">•</span>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{item.date}</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/bulletin/${item.id}`}
                                                    className="block group"
                                                >
                                                    <h2 className="text-2xl font-bold mb-3 group-hover:text-[#1a5f3f] transition-colors">
                                                        {item.title}
                                                    </h2>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {item.content}
                                                    </p>
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        /* Headline View */
                                        <div className="p-6 flex gap-4">
                                            <Link
                                                to="/profile"
                                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                            >
                                                <img
                                                    src={item.author.image}
                                                    alt={item.author.name}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/bulletin/${item.id}`}
                                                    className="block group"
                                                >
                                                    <h2 className="text-xl font-bold mb-2 group-hover:text-[#1a5f3f] transition-colors">
                                                        {item.title}
                                                    </h2>
                                                </Link>
                                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                                    <Link
                                                        to="/profile"
                                                        className="hover:text-[#1a5f3f] transition-colors"
                                                    >
                                                        {item.author.name}
                                                    </Link>
                                                    <span>•</span>
                                                    <span>{item.date}</span>
                                                </div>
                                                <p className="text-gray-700 line-clamp-2">
                                                    {item.preview}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-gray-700">
                                    No Bulletin Items Found
                                </h3>
                                <p className="text-gray-600">
                                    Try adjusting your filters to see more results.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
