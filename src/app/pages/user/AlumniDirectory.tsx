import { useState } from 'react';
import { Search, Users } from 'lucide-react';

export function AlumniDirectory() {
    const [searchName, setSearchName] = useState('');

    // College filters
    const [collegeYear, setCollegeYear] = useState('');
    const [collegeDegree, setCollegeDegree] = useState('');

    const handleNameSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        console.log('Searching for:', searchName);
        // Implement search logic
    };

    const handleCollegeSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        console.log('College search:', { collegeYear, collegeDegree });
        // Implement search logic
    };

    const degrees = [
        'Mechanical Engineering (BSME)',
        'Civil Engineering (BSCE)',
        'Industrial Engineering (BSIE)',
        'Electrical Engineering (BSEE)',
        'Electronics and Communications Engineering (BSECE)',
        'Computer Engineering (BSCpE)'
    ];

    // Generate year options (current year back to 1950)
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 1950 },
        (_, i) => currentYear - i
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="text-black py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 text-brand-primary">
                        Welcome to the home of
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-brand-accent">
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
                                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 outline-noen ring-2 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-accent text-lg"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
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
                        Use the filters below to refine your search.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* College Alumni Directory */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">

                        {/* TODO: Improve responsive design */}
                        <div className="px-6 py-6 bg-gray-50">
                            <form onSubmit={handleCollegeSearch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Company search */}
                                    <div>
                                        <input
                                            type="text"
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                            placeholder="Search alumni by company..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>
                                    {/* Filters / Submit button */}
                                    <div className="grid grid-cols-1 md:col-span-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <select
                                                value={collegeYear}
                                                onChange={(e) => setCollegeYear(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                            >
                                                <option value="">All Years</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year + ' Graduates'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={collegeDegree}
                                                onChange={(e) => setCollegeDegree(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                            >
                                                <option value="">All Degree Programs</option>
                                                {degrees.map((industry) => (
                                                    <option key={industry} value={industry}>
                                                        {industry}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
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
