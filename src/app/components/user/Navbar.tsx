import { Link } from 'react-router-dom';

export function Navbar() {
  const navLinks = [
    { label: 'Alumni Directory', href: '/directory' },
    { label: 'Events', href: '/events' },
    { label: 'Bulletin', href: '/bulletin' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mt-[60px]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                target={link.href.startsWith('http') ? '_blank' : '_self'}
                className="text-gray-700 hover:text-[#1a5f3f] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Donate Button */}
          <div className="hidden lg:block ml-auto">
            <Link
              to="/donate"
              className="bg-[#d4af37] text-white px-6 py-2 rounded-full hover:bg-[#c19b2a] transition-colors font-semibold"
            >
              Donate
            </Link>
          </div>

          {/* Mobile view - centered text */}
          <div className="lg:hidden w-full text-center text-gray-600 text-sm">
            Open menu to navigate
          </div>
        </div>
      </div>
    </nav>
  );
}
