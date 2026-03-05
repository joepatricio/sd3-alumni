import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import { Toaster } from '@components/ui/sonner';
import AppRoutes from '@/app/AppRoutes';

// Thanks Caden Chen from Medium
// https://medium.com/@caden0002/fixing-scroll-position-issues-in-react-router-scroll-to-top-on-navigation-86bcfbdfc9db
// Works, but throws error, `Warning: Function components cannot be given refs.`
const ScrollToTop = ({ children }) => {
  const location = useLocation();

  useLayoutEffect(() => {
    // Scroll to the top of the page when the route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return children;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop>
        <AppRoutes />
      </ScrollToTop>

      {/* Edit me to style the toasts */}
      <Toaster
        toastOptions={{
          style: {
            background: '#E4E2DC',
          },
          classNames: {
            success: '!text-[#1a5f3f]',
            title: '!text-[#1a5f3f]',
            description: '!text-black',
          },
          duration: 3000,
        }}
        closeButton
      />
    </Router >
  );
}