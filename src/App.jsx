import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

/* ================= AUTH ================= */

import Login from "./pages/Login";
import { Register } from "./pages/Register";

/* ================= COURSES ================= */

import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import CourseRoom from "./pages/CourseRoom";
import CourseBuilderPage from "./pages/CourseBuilderPage";

/* ================= DASHBOARD ================= */

import Dashboard from "./pages/Dashboard";

/* ================= EVENTS ================= */

import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventRoom from "./pages/EventRoom";
import EventManage from "./pages/EventManage";

/* ================= SESSIONS ================= */

import SessionManage from "./pages/SessionManage";
import Session from "./pages/Session";
import SessionDetails from "./pages/SessionDetails";

/* ================= DIGITAL FILES ================= */

import DigitalManage from "./pages/DigitalManage";
import PublicDigitalFiles from "./pages/PublicDigitalFiles";
import DigitalFileDetails from "./pages/DigitalFileDetails";

/* ================= PACKAGES / BUNDLES ================= */

import PublicPackages from "./pages/PublicPackages";
import PackageDetails from "./pages/PackageDetails";
import PackageManage from "./pages/PackageManage";

/* ================= MEMBERSHIPS (NEW) ================= */

import PublicMemberships from "./pages/PublicMemberships";
import MembershipDetails from "./pages/MembershipDetails";
import MembershipManage from "./pages/MembershipManage";

/*==================AI COFOUNDER=================*/
import AICofounder from "./pages/AICofounder";

/* ================= USER ================= */

import MyBookmarks from "./pages/MyBookmarks";

/* ================= QUIZ ================= */

import QuizPage from "./pages/QuizPage";

/* ================= APP ================= */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ================= DEFAULT ================= */}

          <Route
            path="/"
            element={<Navigate to="/courses" />}
          />

          {/* ================= PUBLIC ================= */}

          {/* COURSES */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          {/* EVENTS */}
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* PACKAGES */}
          <Route path="/packages" element={<PublicPackages />} />
          <Route path="/packages/:id" element={<PackageDetails />} />

          {/* MEMBERSHIPS (NEW) */}
          <Route path="/memberships" element={<PublicMemberships />} />
          <Route path="/memberships/:id" element={<MembershipDetails />} />

          {/* DIGITAL FILES */}
          <Route path="/digitals" element={<PublicDigitalFiles />} />
          <Route path="/digitals/:id" element={<DigitalFileDetails />} />

          {/* SESSIONS */}
          <Route path="/sessions" element={<Session />} />
          <Route path="/sessions/:id" element={<SessionDetails />} />

          {/* ================= AUTH ================= */}

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ================= DASHBOARD ================= */}

          <Route path="/dashboard" element={<Dashboard />} />

          {/*====================AI COFOUNDER===============*/}
          <Route path="/ai-cofounder" element={<AICofounder />} />

          {/* ================= MANAGEMENT ================= */}

          {/* EVENT MANAGE */}
          <Route
            path="/events/:id/manage"
            element={<EventManage />}
          />

          {/* SESSION MANAGE */}
          <Route
            path="/sessions/:id/manage"
            element={<SessionManage />}
          />

          {/* DIGITAL MANAGE */}
          <Route
            path="/digital/:id/manage"
            element={<DigitalManage />}
          />

          {/* PACKAGE MANAGE */}
          <Route
            path="/packages/:id/manage"
            element={<PackageManage />}
          />

          {/* MEMBERSHIP MANAGE (NEW) */}
          <Route
            path="/memberships/:id/manage"
            element={<MembershipManage />}
          />

          {/* ================= COURSE ROOM ================= */}

          <Route
            path="/courses/:id/room"
            element={<CourseRoom />}
          />

          <Route
            path="/courses/:courseId/builder"
            element={<CourseBuilderPage />}
          />

          {/* ================= QUIZ ================= */}

          <Route
            path="/quiz/:chapterId"
            element={<QuizPage />}
          />

          {/* ================= EVENT ROOM ================= */}

          <Route
            path="/events/:id/room"
            element={<EventRoom />}
          />

          {/* ================= USER ================= */}

          <Route
            path="/bookmarks"
            element={<MyBookmarks />}
          />

          {/* ================= FALLBACK ================= */}

          <Route
            path="*"
            element={<Navigate to="/courses" />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}