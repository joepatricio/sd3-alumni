import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, GraduationCap, Users } from 'lucide-react';

export function AlumniDirectory() {
    const [searchName, setSearchName] = useState('');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // College filters
    const [collegeYear, setCollegeYear] = useState('');
    const [collegeIndustry, setCollegeIndustry] = useState('');
    const [collegeDegreeLevel, setCollegeDegreeLevel] = useState('');

    // SHS filters
    const [shsYear, setShsYear] = useState('');
    const [shsStrand, setShsStrand] = useState('');

    // JHS filters
    const [jhsYear, setJhsYear] = useState('');

    // Basic Education filters
    const [basicYear, setBasicYear] = useState('');

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleNameSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Searching for:', searchName);
        // Implement search logic
    };

    const handleCollegeSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('College search:', { collegeYear, collegeIndustry, collegeDegreeLevel });
        // Implement search logic
    };

    const handleSHSSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('SHS search:', { shsYear, shsStrand });
        // Implement search logic
    };

    const handleJHSSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('JHS search:', { jhsYear });
        // Implement search logic
    };

    const handleBasicSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Basic Education search:', { basicYear });
        // Implement search logic
    };

    const industries = [
        'Technology',
        'Healthcare',
        'Education',
        'Finance',
        'Engineering',
        'Business',
        'Law',
        'Arts & Design',
        'Media & Communications',
        'Government',
        'Non-profit',
        'Other',
    ];

    const degreeLevels = [
        'Undergraduate',
        'Masteral',
        'Doctorate',
    ];

    const strands = [
        'STEM (Science, Technology, Engineering, Mathematics)',
        'ABM (Accountancy, Business, Management)',
        'HUMSS (Humanities and Social Sciences)',
        'GAS (General Academic Strand)',
        'TVL (Technical-Vocational-Livelihood)',
        'Arts & Design',
        'Sports',
    ];

    // Generate year options (current year back to 1950)
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 1949 },
        (_, i) => currentYear - i
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="text-black py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a5f3f]">
                        Welcome to the home of
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[#d4af37]">
                        15,234 alumna
                    </h2>
                    <p className="text-lg mb-12 text-gray-700 max-w-2xl mx-auto">
                        Connect with fellow Josenians from across generations and around the
                        world
                    </p>

                    {/* Simple Search Box */}
                    <form
                        onSubmit={handleNameSearch}
                        className="max-w-2xl mx-auto relative"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder="Search alumni by name..."
                                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 outline-noen ring-2 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-lg"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1a5f3f] text-white px-6 py-2 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Advanced Search Sections */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Advanced Search</h2>
                    <p className="text-gray-600">
                        Use the filters below to find alumni from specific programs
                    </p>
                </div>

                <div className="space-y-4">
                    {/* College Alumni Directory */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                            onClick={() => toggleSection('college')}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-[#1a5f3f]" />
                                <h3 className="text-xl font-bold">College Alumni Directory</h3>
                            </div>
                            {expandedSection === 'college' ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSection === 'college' && (
                            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
                                <form onSubmit={handleCollegeSearch} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Graduation Year
                                            </label>
                                            <select
                                                value={collegeYear}
                                                onChange={(e) => setCollegeYear(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                            >
                                                <option value="">All Years</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Industry
                                            </label>
                                            <select
                                                value={collegeIndustry}
                                                onChange={(e) => setCollegeIndustry(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                            >
                                                <option value="">All Industries</option>
                                                {industries.map((industry) => (
                                                    <option key={industry} value={industry}>
                                                        {industry}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Degree Level
                                            </label>
                                            <select
                                                value={collegeDegreeLevel}
                                                onChange={(e) => setCollegeDegreeLevel(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                            >
                                                <option value="">All Degree Levels</option>
                                                {degreeLevels.map((degreeLevel) => (
                                                    <option key={degreeLevel} value={degreeLevel}>
                                                        {degreeLevel}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#1a5f3f] text-white py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                    >
                                        Search College Alumni
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Senior High School Alumni Directory */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                            onClick={() => toggleSection('shs')}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-[#1a5f3f]" />
                                <h3 className="text-xl font-bold">
                                    Senior High School Alumni Directory
                                </h3>
                            </div>
                            {expandedSection === 'shs' ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSection === 'shs' && (
                            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
                                <form onSubmit={handleSHSSearch} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Graduation Year
                                            </label>
                                            <select
                                                value={shsYear}
                                                onChange={(e) => setShsYear(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                            >
                                                <option value="">All Years</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Educational Strand
                                            </label>
                                            <select
                                                value={shsStrand}
                                                onChange={(e) => setShsStrand(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                            >
                                                <option value="">All Strands</option>
                                                {strands.map((strand) => (
                                                    <option key={strand} value={strand}>
                                                        {strand}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#1a5f3f] text-white py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                    >
                                        Search SHS Alumni
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Junior High School Alumni Directory */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                            onClick={() => toggleSection('jhs')}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-[#1a5f3f]" />
                                <h3 className="text-xl font-bold">
                                    Junior High School Alumni Directory
                                </h3>
                            </div>
                            {expandedSection === 'jhs' ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSection === 'jhs' && (
                            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
                                <form onSubmit={handleJHSSearch} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Graduation Year
                                        </label>
                                        <select
                                            value={jhsYear}
                                            onChange={(e) => setJhsYear(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                        >
                                            <option value="">All Years</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#1a5f3f] text-white py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                    >
                                        Search JHS Alumni
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Basic Education Alumni Directory */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                            onClick={() => toggleSection('basic')}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-[#1a5f3f]" />
                                <h3 className="text-xl font-bold">
                                    Basic Education Alumni Directory
                                </h3>
                            </div>
                            {expandedSection === 'basic' ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {expandedSection === 'basic' && (
                            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
                                <form onSubmit={handleBasicSearch} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Graduation Year
                                        </label>
                                        <select
                                            value={basicYear}
                                            onChange={(e) => setBasicYear(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                        >
                                            <option value="">All Years</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-[#1a5f3f] text-white py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                    >
                                        Search Basic Education Alumni
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Placeholder Results Section */}
                <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-700">
                        No Search Results Yet
                    </h3>
                    <p className="text-gray-600">
                        Use the search options above to find alumni. Results will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
}
