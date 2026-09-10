import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaGraduationCap, FaBars, FaTimes } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <FaGraduationCap size={28} />
          TutorFinder
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
          <Link to="/"       className="hover:text-blue-600 transition">Home</Link>
          <Link to="/tutors" className="hover:text-blue-600 transition">Find Tutors</Link>

          {token ? (
            <>
              <NotificationBell />
              <Link
                to={user.role === "tutor" ? "/dashboard/tutor" : "/dashboard/student"}
                className="hover:text-blue-600 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="hover:text-blue-600 transition">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600" onClick={() => setOpen(!open)}>
          {open ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4 text-gray-600 font-medium">
          <Link to="/"       onClick={() => setOpen(false)}>Home</Link>
          <Link to="/tutors" onClick={() => setOpen(false)}>Find Tutors</Link>
          {token ? (
            <>
              <Link to={user.role === "tutor" ? "/dashboard/tutor" : "/dashboard/student"} onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={logout} className="text-red-500 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}