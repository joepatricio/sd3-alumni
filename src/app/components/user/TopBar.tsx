import { User, Menu, X, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/views/auth";
import { api } from "@/app/views/api";

interface TopBarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function TopBar({
  isMenuOpen,
  setIsMenuOpen,
}: TopBarProps) {
  const { isLoggedIn, session } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn && session?.userId) {
      api.get('/notifications', { params: { userId: session.userId, isRead: false } })
        .then(res => {
          const count = Array.isArray(res.data) ? res.data.length : (res.data?.data?.length || 0);
          setUnreadCount(count);
        })
        .catch(console.error);
    }
  }, [isLoggedIn, session?.userId]);

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
                src="/uploads/alumni-logo.jpg"
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
          {/* Notifications */}
          {isLoggedIn && (
            <Link
              to="/notifications"
              className="relative flex items-center justify-center hover:text-brand-accent transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          {/* Login/Profile */}
          <Link
            to={isLoggedIn ? "/profile" : "/login"}
            className="flex items-center gap-2 hover:text-brand-accent transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isLoggedIn ? "Profile" : "Login"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}