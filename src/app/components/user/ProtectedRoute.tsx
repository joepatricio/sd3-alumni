import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';

export function ProtectedRoute() {
    const { isLoggedIn, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
}
