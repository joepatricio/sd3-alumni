import { User, Menu, X } from "lucide-react";
import alumniLogo from "@/assets/alumni-logo.jpg";
import { Link } from "react-router-dom";
import { useAuth } from "@utils/auth";

interface TopBarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function TopBar({
  isMenuOpen,
  setIsMenuOpen,
}: TopBarProps) {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  return (
    <div className="bg-brand-primary text-white py-3 px-4 md:px-8 sticky top-0 left-0 right-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
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
          <Link to="/" className="favi-alum">
            <div className="flex items-center gap-2">
              <img
                src={alumniLogo}
                alt="Alumni"
                className="h-8 w-8 object-contain rounded"
              />
              <span className="font-semibold hidden sm:inline">
                USJ-R SEA Alumni
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Login/Profile */}
          <button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="flex items-center gap-2 hover:text-brand-accent transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isLoggedIn ? "Profile" : "Login"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}