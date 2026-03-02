import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Register } from "./pages/Register";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Events } from "./pages/Events";
import { Bulletin } from "./pages/Bulletin";
import { EventDetail } from "./pages/EventDetail";
import { BulletinDetail } from "./pages/BulletinDetail";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Profile } from "./pages/Profile";
import { EditProfile } from "./pages/EditProfile";
import { Connections } from "./pages/Connections";
import { AlumniDirectory } from "./pages/AlumniDirectory";
import { Donation } from "./pages/Donation";
import { NotFound } from "./pages/NotFound";
import { Toaster } from "./components/ui/sonner";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminContent } from "./pages/admin/AdminContent";
import { AdminDonations } from "./pages/admin/AdminDonations";

function MainLayout() {
  return (
    <Layout />
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/donate" element={<Donation />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/bulletin" element={<Bulletin />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/connections" element={<Connections />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/bulletin/:id" element={<BulletinDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="donations" element={<AdminDonations />} />
        </Route>
      </Routes>
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
    </Router>
  );
}