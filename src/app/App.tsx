import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from '@components/ui/sonner';
import AppRoutes from '@/app/AppRoutes';
import ScrollToTop from '@/app/components/ScrollToTop';

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
            success: '!text-brand-primary',
            title: '!text-brand-primary',
            description: '!text-black',
          },
          duration: 3000,
        }}
        closeButton
      />
    </Router >
  );
}