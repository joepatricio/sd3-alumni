// Create dialogue boxes for the Create Bulletin and the Create Events bulletin. 
// Refer to the respective webpage for the required and optional fields. 
// Additionally, create a popup to confirm that the entry has been "successfully created." 
// or now, the create function does not need to actually create an entry in their corresponding feeds.
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    List,
    LayoutGrid,
    FileText,
    Clock
} from 'lucide-react';
import { CreateBulletinModal } from '@components/user/CreateBulletinModal';
import { Button } from '@components/ui/button';
import { LazyImage } from '@components/user/LazyImage';
import { bulletins } from '@assets/mockData';

type ViewMode = 'headline' | 'article';
const ARTICLE_ITEMS_PER_PAGE = 5;
const HEADLINE_ITEMS_PER_PAGE = 10;

export function Bulletin() {
    const [viewMode, setViewMode] = useState<ViewMode>('article');
    const [officialOnly, setOfficialOnly] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [visibleCount, setVisibleCount] = useState(HEADLINE_ITEMS_PER_PAGE);

    const filteredItems = useMemo(() => {
        let filtered = officialOnly
            ? bulletins.filter((item) => item.isOfficial && item.status === "Approved")
            : bulletins.filter(item => item.status === "Approved");

        if (dateFrom) {
            filtered = filtered.filter(item => new Date(item.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter(item => new Date(item.date) <= new Date(dateTo));
        }

        return filtered;
    }, [officialOnly, dateFrom, dateTo]);

    const ITEMS_PER_PAGE = viewMode === 'article' ? ARTICLE_ITEMS_PER_PAGE : HEADLINE_ITEMS_PER_PAGE;

    const paginatedItems = filteredItems.slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Alumni Bulletin</h1>
                            <p className="text-gray-600">
                                Stay updated with the latest news and announcements from the
                                USJ-R alumni community
                            </p>
                        </div>
                        <CreateBulletinModal
                            trigger={
                                <button
                                    className="flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Bulletin
                                </button>
                            }
                        />
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
                                        onClick={() => { setViewMode('article'); setVisibleCount(ARTICLE_ITEMS_PER_PAGE); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${viewMode === 'article'
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                        <span className="text-sm font-medium">Article view</span>
                                    </button>
                                    <button
                                        onClick={() => { setViewMode('headline'); setVisibleCount(HEADLINE_ITEMS_PER_PAGE); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${viewMode === 'headline'
                                            ? 'bg-brand-primary text-white'
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
                                        checked={officialOnly}
                                        onChange={(e) => { setOfficialOnly(e.target.checked); setVisibleCount(ITEMS_PER_PAGE); }}
                                        className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
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
                                            onChange={(e) => { setDateFrom(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => { setDateTo(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="space-y-6">
                            {paginatedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {viewMode === 'article' ? (
                                        /* Article View */
                                        <>
                                            {item.heroImage && (
                                                <div className="w-full h-64 overflow-hidden">
                                                    <LazyImage
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
                                                        <span>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/bulletin/${item.id}`}
                                                    className="block group"
                                                >
                                                    <h2 className="text-2xl font-bold mb-3 group-hover:text-brand-primary transition-colors">
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
                                                    <h2 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors">
                                                        {item.title}
                                                    </h2>
                                                </Link>
                                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                                    <Link
                                                        to="/profile"
                                                        className="hover:text-brand-primary transition-colors"
                                                    >
                                                        {item.author.name}
                                                    </Link>
                                                    <span>•</span>
                                                    <span>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

                        {/* Pagination */}
                        {visibleCount < filteredItems.length && (
                            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                    className="px-8"
                                >
                                    Load More
                                </Button>
                            </div>
                        )}

                        {filteredItems.length === 0 && (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
