export function Navbar() {
  const navLinks = [
    { label: 'Communities', href: '#communities' },
    { label: 'Events', href: '#events' },
    { label: 'Careers', href: '#careers' },
    { label: 'Bulletin', href: '#bulletin' },
    { label: 'About', href: '#about' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mt-[60px]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-700 hover:text-[#1a5f3f] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Donate Button */}
          <div className="hidden lg:block ml-auto">
            <a
              href="#donate"
              className="bg-[#d4af37] text-white px-6 py-2 rounded-full hover:bg-[#c19b2a] transition-colors font-semibold"
            >
              Donate
            </a>
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
