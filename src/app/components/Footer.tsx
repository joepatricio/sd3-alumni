import { Mail, Phone, MapPin } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';
import alumniLogo from "@/assets/alumni-logo.jpg";

export function Footer() {
  const footerLinks = {
    'Quick Links': [
      { label: 'Alumni Directory', href: '/directory' },
      { label: 'Events', href: '/events' },
      { label: 'Bulletin', href: '/bulletin' },
      { label: 'About', href: '/about' },
    ],
  };

  return (
    <footer className="bg-[#E4E2DC]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <a href="/" className="flex items-center gap-2">
                <img
                  src={alumniLogo}
                  alt="Alumni"
                  className="h-8 w-8 object-contain rounded"
                />
                <span className="font-bold text-[#1a5f3f] text-lg">USJR Alumni</span>
              </a>
            </div>
            <p className="text-sm mb-4 text-gray-700">
              University of San Jose-Recoletos Alumni Association connects Josenians
              worldwide through meaningful engagement and lifelong support.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/usjr.official"
                target='_blank'
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-[#1a5f3f] hover:text-white text-[#1a5f3f] transition-colors shadow-sm"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/USJR_official"
                target='_blank'
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-[#1a5f3f] hover:text-white text-[#1a5f3f] transition-colors shadow-sm"
              >
                <SiX className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/usjr_official/"
                target='_blank'
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-[#1a5f3f] hover:text-white text-[#1a5f3f] transition-colors shadow-sm"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/school/usjrofficial/"
                target='_blank'
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-[#1a5f3f] hover:text-white text-[#1a5f3f] transition-colors shadow-sm"
              >
                <SiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-[#1a5f3f] font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-700 hover:text-[#1a5f3f] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-[#1a5f3f] font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-[#1a5f3f]" />
                <span>
                  Magallanes Street, Cebu City
                  <br />
                  Cebu 6000, Philippines
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#1a5f3f]" />
                <span>+63 (32) 253-7900</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#1a5f3f]" />
                <span>alumni@usjr.edu.ph</span>
              </div>
            </div>
          </div>

          {/* Donate */}
          <div>
            <h3 className="text-[#1a5f3f] font-semibold mb-4">Donate</h3>
            <p className="text-sm mb-6 text-gray-700 w-2/3 md:w-full">
              Support the USJR Alumni Association through donations.
            </p>
            <a
              href="/donate"
              className="bg-[#d4af37] text-white px-6 py-2 rounded-full hover:bg-[#c19b2a] transition-colors font-semibold"
            >
              Donate
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 pt-8 text-center text-sm text-gray-600">
          <p>
            © 2026 University of San Jose-Recoletos Alumni Association. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}