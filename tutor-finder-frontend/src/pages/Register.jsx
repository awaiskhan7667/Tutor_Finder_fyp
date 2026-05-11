import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
         FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import { register, uploadAvatar } from "../services/api";
import AvatarUpload from "../components/AvatarUpload";

export default function Register() {
  const [form,    setForm]    = useState({ name: "", email: "", password: "", role: "student" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [registered, setRegistered] = useState(null); // user after register
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      setRegistered(res.data.user); // show avatar upload step
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
    setLoading(false);
  };

  const handleSkip = () => {
    const role = registered?.role;
    navigate(role === "tutor" ? "/dashboard/tutor" : "/dashboard/student");
  };

  // ── Step 2: Avatar upload after registration ──
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center animate-card-in">
          <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-1">Account Created!</h2>
          <p className="text-gray-500 mb-8">Add a profile picture so others can recognise you</p>

          <AvatarUpload user={registered} onUpdate={() => {}} />

          <button onClick={handleSkip}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-xl">
            Continue to Dashboard →
          </button>
          <button onClick={handleSkip}
            className="mt-3 w-full text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-700 relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-pink-500 rounded-full opacity-20 blur-3xl animate-float-slow" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        <div className="relative text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 animate-glow">
              <FaGraduationCap size={48} className="text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Join Pakistan's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Best Platform
            </span>
          </h1>
          <p className="text-purple-100 text-lg leading-relaxed max-w-sm mx-auto">
            Whether you want to learn or teach — TutorFinder is the right place for you.
          </p>

          {/* Benefits */}
          <div className="mt-10 space-y-4 text-left">
            {[
              "✅ Free to register & browse tutors",
              "✅ Verified & experienced tutors",
              "✅ Online & in-person sessions",
              "✅ Secure booking & payments",
            ].map((b) => (
              <div key={b} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10 text-sm font-medium">
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <FaGraduationCap size={40} className="text-blue-600 mx-auto mb-2" />
            <h2 className="text-2xl font-black text-gray-800">TutorFinder</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-3xl font-black text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Join thousands of students & tutors</p>

            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { val: "student", label: "I'm a Student", icon: <FaGraduationCap size={20} /> },
                { val: "tutor",   label: "I'm a Tutor",   icon: <FaChalkboardTeacher size={20} /> },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.val })}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm border-2 transition-all duration-300 hover:scale-[1.02] ${
                    form.role === r.val
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 text-sm font-medium animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="group">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Awais Khan"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    placeholder="awais@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-12 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : `Register as ${form.role === "tutor" ? "Tutor" : "Student"} →`}
              </button>
            </form>

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-black hover:text-indigo-600 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}