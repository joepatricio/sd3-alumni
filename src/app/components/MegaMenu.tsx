import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';

interface MegaMenuProps {
  isOpen: boolean;
}

export function MegaMenu({ isOpen }: MegaMenuProps) {
  const navigation = [
    { label: 'Alumni Directory', href: '/directory' },
    { label: 'Events', href: '/events' },
    { label: 'Bulletin', href: '/bulletin' },
    { label: 'About', href: '/about' },
  ];

  const socialLinks = [
    { icon: SiFacebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
    { icon: SiX, label: 'X (formerly Twitter)', href: '#', color: 'hover:bg-black' },
    { icon: SiInstagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
    { icon: SiLinkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed top-[60px] left-0 right-0 bg-white shadow-xl z-40 max-h-[calc(100vh-60px)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Navigation */}
          <div>
            <h3 className="text-[#1a5f3f] font-bold text-lg mb-4 uppercase tracking-wide">
              Navigate
            </h3>
            <ul className="space-y-3">
              {navigation.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-700 hover:text-[#1a5f3f] transition-colors text-lg font-medium block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#donate"
                  className="inline-block bg-[#d4af37] text-white px-6 py-2 rounded-full hover:bg-[#c19b2a] transition-colors font-semibold mt-2"
                >
                  Donate
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[#1a5f3f] font-bold text-lg mb-4 uppercase tracking-wide">
              Follow Us
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`flex items-center gap-3 p-3 bg-gray-100 rounded-lg ${social.color} transition-colors group`}
                >
                  <social.icon className="w-5 h-5 text-gray-700 group-hover:text-white" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Follow Us & Contact */}
          <div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-[#1a5f3f] font-bold mb-3 uppercase tracking-wide text-sm">
                Contact
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1a5f3f]" />
                  <span>Magallanes Street, Cebu City 6000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-[#1a5f3f]" />
                  <span>+63 (32) 253-7900</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-[#1a5f3f]" />
                  <span>alumni@usjr.edu.ph</span>
                </div>
              </div>

              <a
                href="https://usjr.edu.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-4 text-[#1a5f3f] hover:text-[#d4af37] transition-colors font-medium text-sm"
              >
                Visit USJR Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}