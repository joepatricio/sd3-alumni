import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@components/admin/AdminLayout';
import { MainLayout } from '@components/user/MainLayout';
import { NotFound } from '@pages/NotFound';
import { Donation } from '@pages/Donation';
import { Register } from '@pages/user/Register';
import { Home } from '@pages/user/Home';
import { Events } from '@pages/user/Events';
import { Bulletin } from '@pages/user/Bulletin';
import { EventDetail } from '@pages/user/EventDetail';
import { BulletinDetail } from '@pages/user/BulletinDetail';
import { About } from '@pages/user/About';
import { Login } from '@pages/user/Login';
import { ForgotPassword } from '@pages/user/ForgotPassword';
import { TermsOfService } from '@pages/user/TermsOfService';
import { PrivacyPolicy } from '@pages/user/PrivacyPolicy';
import { Profile } from '@pages/user/Profile';
import { EditProfile } from '@pages/user/EditProfile';
import { Connections } from '@pages/user/Connections';
import { UserEvents } from '@pages/user/UserEvents';
import { Achievements } from '@pages/user/Achievements';
import { AlumniDirectory } from '@pages/user/AlumniDirectory';
import { AdminDashboard } from '@pages/admin/AdminDashboard';
import { AdminUsers } from '@pages/admin/AdminUsers';
import { AdminEvents } from '@pages/admin/AdminEvents';
import { AdminBulletins } from '@pages/admin/AdminBulletins';
import { AdminDonations } from '@pages/admin/AdminDonations';
import { AdminLogin } from '@pages/admin/AdminLogin';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/donate" element={<Donation />} />

            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/directory" element={<AlumniDirectory />} />
                <Route path="/bulletin" element={<Bulletin />} />
                <Route path="/events" element={<Events />} />
                <Route path="/bulletin/:id" element={<BulletinDetail />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/connections" element={<Connections />} />
                <Route path="/profile/events" element={<UserEvents />} />
                <Route path="/profile/achievements" element={<Achievements />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="bulletins" element={<AdminBulletins />} />
                <Route path="donations" element={<AdminDonations />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
    );
}