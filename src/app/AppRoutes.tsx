import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@components/admin/AdminLayout';
import { MainLayout } from '@components/user/MainLayout';
import { ProtectedRoute } from '@components/user/ProtectedRoute';

// Lazy loaded page components
const NotFound = lazy(() => import('@pages/NotFound').then(m => ({ default: m.NotFound })));
const Donation = lazy(() => import('@pages/Donation').then(m => ({ default: m.Donation })));
const Register = lazy(() => import('@pages/user/Register').then(m => ({ default: m.Register })));
const Home = lazy(() => import('@pages/user/Home').then(m => ({ default: m.Home })));
const Events = lazy(() => import('@pages/user/Events').then(m => ({ default: m.Events })));
const Bulletin = lazy(() => import('@pages/user/Bulletin').then(m => ({ default: m.Bulletin })));
const EventDetail = lazy(() => import('@pages/user/EventDetail').then(m => ({ default: m.EventDetail })));
const BulletinDetail = lazy(() => import('@pages/user/BulletinDetail').then(m => ({ default: m.BulletinDetail })));
const About = lazy(() => import('@pages/user/About').then(m => ({ default: m.About })));
const Login = lazy(() => import('@pages/user/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('@pages/user/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const TermsOfService = lazy(() => import('@pages/user/TermsOfService').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import('@pages/user/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Profile = lazy(() => import('@pages/user/Profile').then(m => ({ default: m.Profile })));
const EditProfile = lazy(() => import('@pages/user/EditProfile').then(m => ({ default: m.EditProfile })));
const Connections = lazy(() => import('@pages/user/Connections').then(m => ({ default: m.Connections })));
const UserEvents = lazy(() => import('@/assets/UserEvents').then(m => ({ default: m.UserEvents })));
const Achievements = lazy(() => import('@pages/user/Achievements').then(m => ({ default: m.Achievements })));
const AlumniDirectory = lazy(() => import('@pages/user/AlumniDirectory').then(m => ({ default: m.AlumniDirectory })));
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('@pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminEvents = lazy(() => import('@pages/admin/AdminEvents').then(m => ({ default: m.AdminEvents })));
const AdminBulletins = lazy(() => import('@pages/admin/AdminBulletins').then(m => ({ default: m.AdminBulletins })));
const AdminDonations = lazy(() => import('@pages/admin/AdminDonations').then(m => ({ default: m.AdminDonations })));
const AdminLogin = lazy(() => import('@pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));

const withSuspense = (Component: ComponentType) => (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-gray-500">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
            <p className="text-sm font-medium animate-pulse text-brand-text-muted">Loading content...</p>
        </div>
    }>
        <Component />
    </Suspense>
);

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="*" element={withSuspense(NotFound)} />
            <Route path="/donate" element={withSuspense(Donation)} />

            <Route element={<MainLayout />}>
                <Route path="/" element={withSuspense(Home)} />
                <Route path="/about" element={withSuspense(About)} />
                <Route path="/bulletin" element={withSuspense(Bulletin)} />
                <Route path="/events" element={withSuspense(Events)} />
                <Route path="/bulletin/:id" element={withSuspense(BulletinDetail)} />
                <Route path="/events/:id" element={withSuspense(EventDetail)} />
                <Route path="/login" element={withSuspense(Login)} />
                <Route path="/register" element={withSuspense(Register)} />
                <Route path="/forgot-password" element={withSuspense(ForgotPassword)} />
                <Route path="/terms" element={withSuspense(TermsOfService)} />
                <Route path="/privacy" element={withSuspense(PrivacyPolicy)} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/directory" element={withSuspense(AlumniDirectory)} />
                    <Route path="/profile" element={withSuspense(Profile)} />
                    <Route path="/profile/:id" element={withSuspense(Profile)} />
                    <Route path="/profile/edit" element={withSuspense(EditProfile)} />
                    <Route path="/profile/connections" element={withSuspense(Connections)} />
                    <Route path="/profile/connections/:id" element={withSuspense(Connections)} />
                    <Route path="/profile/events" element={withSuspense(UserEvents)} />
                    <Route path="/profile/achievements" element={withSuspense(Achievements)} />
                    <Route path="/profile/achievements/:id" element={withSuspense(Achievements)} />
                </Route>
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={withSuspense(AdminDashboard)} />
                <Route path="users" element={withSuspense(AdminUsers)} />
                <Route path="events" element={withSuspense(AdminEvents)} />
                <Route path="bulletins" element={withSuspense(AdminBulletins)} />
                <Route path="donations" element={withSuspense(AdminDonations)} />
            </Route>
            <Route path="/admin/login" element={withSuspense(AdminLogin)} />
        </Routes>
    );
}