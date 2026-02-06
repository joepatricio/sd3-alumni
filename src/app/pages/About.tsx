import {
    Mail,
    Phone,
    MapPin,
    Youtube,
    Video,
} from "lucide-react";

export function About() {
    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-16">
                {/* Videos Section */}
                <section>
                    <h2 className="text-2xl font-bold text-[#1a5f3f] mb-8 flex items-center gap-2">
                        <Video className="w-6 h-6" />
                        Featured Videos
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <a
                            href="https://drive.google.com/file/d/1_WNzsMEypDZOgdiL59Py2ZZcAvLaCbOt/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                        >
                            <div className="bg-gray-100 aspect-video flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <Video className="w-12 h-12 text-[#1a5f3f] opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#1a5f3f] transition-colors">
                                    Grand Alumni Homecoming (2019)
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Watch video
                                </p>
                            </div>
                        </a>

                        <a
                            href="https://www.youtube.com/watch?v=Mqa-H5HpQEE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                        >
                            <div className="bg-gray-100 aspect-video flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <Youtube className="w-12 h-12 text-red-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#1a5f3f] transition-colors">
                                    Diamond Jubilee Celebration (2023)
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Watch on YouTube
                                </p>
                            </div>
                        </a>
                    </div>
                </section>

                {/* Main Content */}
                <section className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p>
                            The Alumni Unit under the Public Affairs and
                            International Relations Office serves as the vital
                            link between the university and its graduates,
                            strengthening lifelong connections across all
                            academic levels—from elementary to college. It
                            works closely with the USJ-R Alumni Association,
                            Inc. (USJ-R AAI) to engage alumni from the
                            College, Senior High School, Junior High School,
                            and Elementary departments. By fostering a strong
                            and inclusive alumni network, the office ensures
                            that every former student, regardless of level,
                            remains connected to the university's mission and
                            legacy.
                        </p>
                        <p>
                            Beyond maintaining contact, the Alumni Unit
                            facilitates programs that support the personal and
                            professional growth of its members. These include
                            alumni reunions, mentorship initiatives, volunteer
                            opportunities, and collaborative projects that
                            allow graduates to give back to their alma mater.
                            By cultivating school spirit and a culture of
                            service, the office empowers alumni to play an
                            active role in shaping the present and future of
                            the university community.
                        </p>
                    </div>

                    {/* Vision & Mission Card */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
                        <div>
                            <h3 className="text-[#1a5f3f] text-lg font-bold uppercase tracking-wider mb-3">
                                Our Vision
                            </h3>
                            <p className="text-gray-700 italic">
                                "A Recoletos University renowned for Education
                                Excellence, Research Impact, and Community
                                Transformation"
                            </p>
                        </div>
                        <div className="w-full h-px bg-gray-100"></div>
                        <div>
                            <h3 className="text-[#1a5f3f] text-lg font-bold uppercase tracking-wider mb-3">
                                Our Mission
                            </h3>
                            <p className="text-gray-700 italic">
                                "Imbued with the spirit of “Caritas et
                                Scientia”, we provide the highest level of
                                Quality Christian Community-oriented Education."
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a5f3f] mb-2">
                                Get in Touch
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Contact the Alumni Unit for inquiries and
                                updates.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-10 h-10 rounded-full bg-[#1a5f3f]/10 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-5 h-5 text-[#1a5f3f]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#1a5f3f]">
                                            Juvy Homecillo
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Alumni Relations Officer
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-10 h-10 rounded-full bg-[#1a5f3f]/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[#1a5f3f]" />
                                    </div>
                                    <a
                                        href="mailto:external.relations@usjr.edu.ph"
                                        className="hover:text-[#1a5f3f] underline"
                                    >
                                        external.relations@usjr.edu.ph
                                    </a>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-10 h-10 rounded-full bg-[#1a5f3f]/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-[#1a5f3f]" />
                                    </div>
                                    <span>(032) 253-7900</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="w-10 h-10 rounded-full bg-[#1a5f3f]/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-[#1a5f3f]" />
                                    </div>
                                    <span>
                                        Magallanes Street, 6000, Cebu City,
                                        Philippines
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}