import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home          from "./pages/Home";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Tutors        from "./pages/Tutors";
import TutorProfile  from "./pages/TutorProfile";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard   from "./pages/TutorDashboard";
import Navbar        from "./components/Navbar";

// ── If logged in, redirect away from login/register ──
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  if (token) return <Navigate to={user.role === "tutor" ? "/dashboard/tutor" : "/dashboard/student"} replace />;
  return children;
};

// ── If NOT logged in, redirect to login ──
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"     element={<Home />} />
        <Route path="/tutors"     element={<Tutors />} />
        <Route path="/tutors/:id" element={<TutorProfile />} />

        {/* Guest only — redirect if already logged in */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Private — redirect if not logged in */}
        <Route path="/dashboard/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        <Route path="/dashboard/tutor"   element={<PrivateRoute><TutorDashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;