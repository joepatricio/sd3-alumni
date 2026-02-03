import { User, Menu, X, ExternalLink } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function TopBar({
  isMenuOpen,
  setIsMenuOpen,
}: TopBarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="bg-[#1a5f3f] text-white py-3 px-4 md:px-8 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-white/10 p-2 rounded transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <a href="" className="favi-alum">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4af37] rounded flex items-center justify-center font-bold text-[#1a5f3f]">
                U
              </div>
              <span className="font-semibold hidden sm:inline">
                USJR Alumni
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-4">
          {/* Alumni Directory */}
          <a
            href="#directory"
            className="hover:text-[#d4af37] transition-colors text-sm md:text-base"
          >
            Alumni Directory
          </a>

          {/* Login/Profile */}
          <button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="flex items-center gap-2 hover:text-[#d4af37] transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isLoggedIn ? "Profile" : "Login"}
            </span>
          </button>

          {/* USJR Website Link */}
          <a
            href="https://usjr.edu.ph/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            title="Visit USJR Website"
          >
            <img
              src="/images/usjr-logo.png"
              alt="USJR"
              className="h-8 w-8 object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}