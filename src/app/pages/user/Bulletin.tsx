// Create dialogue boxes for the Create Bulletin and the Create Events bulletin. Refer to the respective webpage for the required and optional fields. Additionally, create a popup to confirm that the entry has been "successfully created." For now, the create function does not need to actually create an entry in their corresponding feeds.



import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    List,
    LayoutGrid,
    FileText,
    Clock,
} from 'lucide-react';
import { CreateBulletinModal } from '@/app/components/user/CreateBulletinModal';

import { bulletins } from '@assets/mockData';

type ViewMode = 'headline' | 'article';

export function Bulletin() {
    const [viewMode, setViewMode] = useState<ViewMode>('headline');
    const [showUserSubmitted, setShowUserSubmitted] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredItems = showUserSubmitted
        ? bulletins.filter((item) => !item.isUserSubmitted && item.status === "Approved")
        : bulletins.filter(item => item.status === "Approved");

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
                                USJR alumni community
                            </p>
                        </div>
                        <CreateBulletinModal
                            trigger={
                                <button
                                    className="flex items-center justify-center gap-2 bg-[#1a5f3f] text-white px-6 py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
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
