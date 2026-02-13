import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
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
import { AlumniDirectory } from "./pages/AlumniDirectory";
import { Donation } from "./pages/Donation";
import { NotFound } from "./pages/NotFound";
import { Toaster } from "./components/ui/sonner";

function MainLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
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
          <Route path="/bulletin/:id" element={<BulletinDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
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