import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1758270703262-2b40b6b66be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwYWx1bW5pJTIwY2VsZWJyYXRpb24lMjBncmFkdWF0aW9ufGVufDF8fHx8MTc3MDA5MTgzOHww&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/60 to-[#000000]/30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            USJ-R SEA Alumni
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            Build lasting relationships, advance your career, and give back to the community that shaped your future.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="bg-brand-accent text-white px-8 py-3 rounded-full hover:bg-brand-accent-hover transition-colors font-semibold"
            >
              Join the Community
            </Link>
            <Link
              to="/about"
              className="bg-white text-brand-primary px-8 py-3 rounded-full hover:bg-gray-100 transition-colors font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}