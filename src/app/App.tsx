import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Events } from "./pages/Events";
import { EventDetail } from "./pages/EventDetail";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { AlumniDirectory } from "./pages/AlumniDirectory";
import { Bulletin } from "./pages/Bulletin";
import { BulletinDetail } from "./pages/BulletinDetail";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/bulletin" element={<Bulletin />} />
          <Route path="/bulletin/:id" element={<BulletinDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}