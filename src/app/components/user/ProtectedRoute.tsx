import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';

export function ProtectedRoute() {
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
}
