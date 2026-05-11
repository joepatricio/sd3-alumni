import { useState, useEffect } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type ProfileData, type DegreeData, type AlumniCard } from '@/app/views/api';

const ITEMS_PER_PAGE = 12;

export function AlumniDirectory() {
    const [loading, setLoading] = useState(true);
    const [displayedAlumni, setDisplayedAlumni] = useState<AlumniCard[]>([]);
    const [degrees, setDegrees] = useState<DegreeData[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [absoluteTotalAlumni, setAbsoluteTotalAlumni] = useState(0);

    // Form states
    const [searchName, setSearchName] = useState('');
    const [searchCompany, setSearchCompany] = useState('');
    const [collegeYear, setCollegeYear] = useState('');
    const [collegeDegreeId, setCollegeDegreeId] = useState('');

    // Active filters
    const [activeFilters, setActiveFilters] = useState({
        name: '',
        company: '',
        year: '',
        degreeId: ''
    });

    useEffect(() => {
        api.get<any>('/degrees').then(res => setDegrees(res.data || []));
        api.get('/profiles', { params: { _page: 1, _per_page: 1 } }).then(res => setAbsoluteTotalAlumni(res.data.items || 0));
    }, []);

    useEffect(() => {
        if (degrees.length === 0) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const params: Record<string, string | number> = {
                    _page: currentPage,
                    _per_page: ITEMS_PER_PAGE,
                    _sort: 'id',
                    _embed: 'degree'
                };

                if (activeFilters.name) params['userName:contains'] = activeFilters.name;
                if (activeFilters.company) params['company:contains'] = activeFilters.company;
                if (activeFilters.year) params.batch = activeFilters.year;
                if (activeFilters.degreeId) params.degreeId = activeFilters.degreeId;

                // json-server v1 returns { first, prev, next, last, pages, items, data }
                const res = await api.get<any>('/profiles', { params });

                const totalCount = res.data.items || 0;
                setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

                const profiles: ProfileData[] = res.data.data || [];
                const cards: AlumniCard[] = profiles.map((profile: ProfileData) => {
                    const deg = profile.degree;
                    return {
                        userId: profile.userId,
                        name: profile.userName,
                        company: profile.company || '',
                        currentJob: profile.currentJob || '',
                        batch: profile.batch,
                        degreeName: deg ? `${deg.degreeName} (${deg.degreeAbbr})` : 'Unknown Degree',
                        profileImage: profile.profileImage
                    };
                });

                setDisplayedAlumni(cards);
            } catch (err) {
                console.error('Error fetching directory:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage, activeFilters, degrees]);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setActiveFilters({
            name: searchName,
            company: searchCompany,
            year: collegeYear,
            degreeId: collegeDegreeId
        });
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchName('');
        setSearchCompany('');
        setCollegeYear('');
        setCollegeDegreeId('');
        setActiveFilters({ name: '', company: '', year: '', degreeId: '' });
        setCurrentPage(1);
    };

    // Generate year options (current year back to 1950)
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 1950 },
        (_, i) => currentYear - i
    );

    return (
        <div className="bg-gray-50 flex flex-col min-h-[calc(100vh-64px)] pb-12">
            {/* Hero Section */}
            <div className="text-black pt-16 pb-8">
                <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-primary">
                        Welcome to the home of
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-accent">
                        {loading && displayedAlumni.length === 0 ? '...' : absoluteTotalAlumni} alumna
                    </h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Connect with fellow Josenians from across generations and around the world
                    </p>
                </div>
            </div>

            <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8">
                {/* Search Sections */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 md:p-8 space-y-6">
                        {/* Unified Search Form */}
                        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Name Search */}
                            <div className="md:col-span-3 relative md:order-first">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    placeholder="Search alumni by name..."
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>

                            {/* Clear Button */}
                            <div className="md:col-span-1 flex order-last md:-order-1">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center justify-center"
                                >
                                    Clear Filters
                                </button>
                            </div>

                            {/* Company Search */}
                            <div className="md:col-span-1 relative">
                                <input
                                    type="text"
                                    value={searchCompany}
                                    onChange={(e) => setSearchCompany(e.target.value)}
                                    placeholder="Search by company..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>

                            {/* Batch Filter */}
                            <div className="md:col-span-1">
                                <select
                                    value={collegeYear}
                                    onChange={(e) => setCollegeYear(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white transition-all"
                                >
                                    <option value="">All Years</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year} Graduates
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Degree Filter */}
                            <div className="md:col-span-1">
                                <select
                                    value={collegeDegreeId}
                                    onChange={(e) => setCollegeDegreeId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white transition-all"
                                >
                                    <option value="">All Degree Programs</option>
                                    {degrees.map((deg) => {
                                        const name = `${deg.degreeName} (${deg.degreeAbbr})`;
                                        return (
                                            <option key={deg.id} value={deg.id}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Submit Button */}
                            <div className="md:col-span-1 order-last">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-lg transition-colors font-medium flex items-center justify-center"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                {loading && displayedAlumni.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                        <p className="text-gray-500">Loading directory...</p>
                    </div>
                ) : displayedAlumni.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-gray-700">
                            No Alumni Found
                        </h3>
                        <p className="text-gray-500">
                            We couldn't find anyone matching your current filters. Try adjusting your search criteria.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                        >
                            Reset Search
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedAlumni.map((person) => (
                                <Link
                                    key={person.userId}
                                    to={`/profile/${person.userId}`}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="p-6 flex items-start space-x-4">
                                        <img
                                            src={person.profileImage}
                                            alt={person.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-brand-primary transition-colors"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {person.name}
                                            </h3>
                                            <p className="text-sm text-brand-primary font-medium mb-1">
                                                Batch {person.batch}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                                {person.degreeName}
                                            </p>
                                            {(person.currentJob || person.company) && (
                                                <div className="mt-2 pt-2 border-t border-gray-50">
                                                    <p className="text-sm text-gray-700 truncate">
                                                        {person.currentJob && <span>{person.currentJob}</span>}
                                                        {person.currentJob && person.company && <span> at </span>}
                                                        {person.company && <span className="text-gray-600">{person.company}</span>}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-10 space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors border shadow-sm ${currentPage === page
                                                ? 'bg-brand-primary text-white border-brand-primary'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-brand-primary'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
