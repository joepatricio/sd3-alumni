import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    List,
    LayoutGrid,
    FileText,
    Clock,
    Loader2
} from 'lucide-react';
import { CreateBulletinModal } from '@components/user/CreateBulletinModal';
import { Button } from '@components/ui/button';
import { LazyImage } from '@components/user/LazyImage';
import { api, type BulletinData, type ProfileData } from '@/app/views/api';
import { useAuth } from '@/app/views/auth';
import { formatDate } from '@/app/views/formatters';

type ViewMode = 'headline' | 'article';
const ARTICLE_ITEMS_PER_PAGE = 5;
const HEADLINE_ITEMS_PER_PAGE = 10;

export function Bulletin() {
    const [viewMode, setViewMode] = useState<ViewMode>('article');
    const [officialOnly, setOfficialOnly] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [visibleCount, setVisibleCount] = useState(ARTICLE_ITEMS_PER_PAGE);

    const { session } = useAuth();
    const [bulletins, setBulletins] = useState<BulletinData[]>([]);
    const [totalBulletins, setTotalBulletins] = useState(0);
    const [profilesMap, setProfilesMap] = useState<Record<string, ProfileData>>({});
    const [currentUserStatus, setCurrentUserStatus] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [uRes, allUsersRes] = await Promise.all([
                    api.get(`/users`, {
                        params: {
                            'userStatus.statusName': 'Official'
                        }
                    }),
                    api.get('/users')
                ]);
                const uData = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
                const allUsers = Array.isArray(allUsersRes.data) ? allUsersRes.data : (allUsersRes.data?.data || []);

                const restrictedProfileIds = allUsers
                    .filter((u: any) => u.userStatus?.statusName === 'Banned' || u.userStatus?.statusName === 'Suspended')
                    .map((u: any) => String(u.id));

                if (session?.userId) {
                    const currentU = allUsers.find((u: any) => String(u.id) === String(session.userId));
                    if (currentU) {
                        setCurrentUserStatus(currentU.userStatus?.statusName || '');
                    }
                }

                const officialUserIds = uData.map((user: any) => String(user.id)) || [];

                const whereClause: any = {
                    status: { statusName: 'Approved' }
                };

                if (restrictedProfileIds.length > 0) {
                    whereClause.authorId = { notIn: restrictedProfileIds };
                }

                if (officialOnly && officialUserIds.length > 0) {
                    whereClause.authorId = { in: officialUserIds };
                } else if (officialOnly) {
                    whereClause.authorId = { in: ['__none__'] };
                }

                if (dateFrom || dateTo) {
                    whereClause.bulletinDate = {};
                    if (dateFrom) whereClause.bulletinDate.gte = new Date(dateFrom).toISOString();
                    if (dateTo) {
                        const toDate = new Date(dateTo);
                        toDate.setHours(23, 59, 59, 999);
                        whereClause.bulletinDate.lte = toDate.toISOString();
                    }
                }

                const bRes = await api.get('/bulletins', {
                    params: {
                        _limit: visibleCount,
                        _sort: '-bulletinDate',
                        _where: JSON.stringify(whereClause),
                        _include: 'status,author'
                    }
                });

                const bData = Array.isArray(bRes.data) ? bRes.data : (bRes.data?.data || []);
                setBulletins(bData || []);
                setTotalBulletins(bRes.data?.items !== undefined ? bRes.data.items : bData.length);

                const pMap: Record<string, ProfileData> = {};
                (bData || []).forEach((b: BulletinData) => {
                    if (b.profile) pMap[b.authorId] = b.profile;
                });
                setProfilesMap(pMap);
            } catch (err) {
                console.error("Failed to fetch bulletins:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [visibleCount, officialOnly, dateFrom, dateTo, session?.userId]);

    const ITEMS_PER_PAGE = viewMode === 'article' ? ARTICLE_ITEMS_PER_PAGE : HEADLINE_ITEMS_PER_PAGE;

    const paginatedItems = bulletins;

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
                        {(currentUserStatus === 'Regular' || currentUserStatus === 'Official') && (
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
                        )}
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
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                                <p className="text-gray-500">Loading bulletins...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {paginatedItems.map((item) => {
                                    const authorProfile = profilesMap[item.authorId];
                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
                                        >
                                            {viewMode === 'article' ? (
                                                /* Article View */
                                                <>
                                                    {item.bulletinImage && (
                                                        <Link to={`/bulletin/${item.id}`} className="block w-full h-64 overflow-hidden group">
                                                            <LazyImage
                                                                src={item.bulletinImage}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </Link>
                                                    )}
                                                    <div className="p-6">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Link
                                                                to={`/profile/${item.authorId}`}
                                                                className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10"
                                                            >
                                                                <img
                                                                    src={authorProfile?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=64&h=64"}
                                                                    alt={authorProfile?.userName || "Author"}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                                <span className="text-sm text-gray-600">
                                                                    {authorProfile?.userName || "Unknown Author"}
                                                                </span>
                                                            </Link>
                                                            <span className="text-gray-400">•</span>
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <Clock className="w-4 h-4" />
                                                                <span>{formatDate(item.bulletinDate, 'long')}</span>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            to={`/bulletin/${item.id}`}
                                                            className="block group before:absolute before:inset-0 before:z-0"
                                                        >
                                                            <h2 className="text-2xl font-bold mb-3 group-hover:text-brand-primary transition-colors">
                                                                {item.title}
                                                            </h2>
                                                            <p className="text-gray-700 leading-relaxed line-clamp-3">
                                                                {item.content}
                                                            </p>
                                                        </Link>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Headline View */
                                                <div className="p-6 flex gap-4">
                                                    <Link
                                                        to={`/profile/${item.authorId}`}
                                                        className="flex-shrink-0 hover:opacity-80 transition-opacity relative z-10"
                                                    >
                                                        <img
                                                            src={authorProfile?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=64&h=64"}
                                                            alt={authorProfile?.userName || "Author"}
                                                            className="w-16 h-16 rounded-full object-cover"
                                                        />
                                                    </Link>
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            to={`/bulletin/${item.id}`}
                                                            className="block group before:absolute before:inset-0 before:z-0"
                                                        >
                                                            <h2 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors">
                                                                {item.title}
                                                            </h2>
                                                        </Link>
                                                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 relative z-10">
                                                            <Link
                                                                to={`/profile/${item.authorId}`}
                                                                className="hover:text-brand-primary transition-colors"
                                                            >
                                                                {authorProfile?.userName || "Unknown Author"}
                                                            </Link>
                                                            <span>•</span>
                                                            <span>{formatDate(item.bulletinDate, 'long')}</span>
                                                        </div>
                                                        <p className="text-gray-700 line-clamp-2">
                                                            {item.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && bulletins.length < totalBulletins && (
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

                        {!loading && bulletins.length === 0 && (
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
