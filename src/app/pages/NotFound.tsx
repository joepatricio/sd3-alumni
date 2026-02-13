export function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-16">
                <section>
                    <h2 className="text-2xl font-bold text-[#1a5f3f] mb-8 flex items-center gap-2">
                        404 - Not Found
                    </h2>
                    <p className="text-gray-700">
                        The page you are looking for does not exist.
                    </p>
                </section>
            </div>
        </div>
    );
}