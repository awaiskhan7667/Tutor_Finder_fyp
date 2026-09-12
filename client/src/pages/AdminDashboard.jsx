import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaChalkboardTeacher, FaCalendarCheck, FaStar, FaMoneyBillWave,
  FaCheck, FaTimes, FaTrash, FaUserShield, FaBan, FaCheckCircle, FaSearch,
} from "react-icons/fa";
import {
  getAdminStats,
  getAdminUsers, updateUserStatus, updateUserRole, deleteUser,
  getAdminTutors, setTutorApproval, deleteTutorAdmin,
  getAdminBookings, forceCancelBooking,
  getAdminReviews, deleteReviewAdmin,
} from "../services/api";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users",    label: "Users" },
  { key: "tutors",   label: "Tutors" },
  { key: "bookings", label: "Bookings" },
  { key: "reviews",  label: "Reviews" },
];

const STATUS_STYLES = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted:  "bg-green-50  text-green-700  border-green-200",
  rejected:  "bg-red-50    text-red-600    border-red-200",
  completed: "bg-blue-50   text-blue-700   border-blue-200",
  cancelled: "bg-gray-100  text-gray-500   border-gray-200",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [tutorFilter, setTutorFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user?.id) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/"); return; }
    loadAll();
  }, []);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2500); };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, t, b, r] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminTutors(),
        getAdminBookings(),
        getAdminReviews(),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setTutors(t.data.tutors);
      setBookings(b.data.bookings);
      setReviews(r.data.reviews);
    } catch (err) {
      console.error("Admin load error:", err);
    }
    setLoading(false);
  };

  // ── Users ──
  const toggleUserActive = async (u) => {
    try {
      await updateUserStatus(u._id, !u.isActive);
      setUsers((list) => list.map((x) => x._id === u._id ? { ...x, isActive: !u.isActive } : x));
      flash(`✅ ${u.name} ${!u.isActive ? "activated" : "deactivated"}`);
    } catch { flash("❌ Failed to update status"); }
  };

  const changeUserRole = async (u, role) => {
    try {
      await updateUserRole(u._id, role);
      setUsers((list) => list.map((x) => x._id === u._id ? { ...x, role } : x));
      flash(`✅ ${u.name} is now ${role}`);
    } catch { flash("❌ Failed to update role"); }
  };

  const removeUser = async (u) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(u._id);
      setUsers((list) => list.filter((x) => x._id !== u._id));
      flash("✅ User deleted");
    } catch (err) { flash("❌ " + (err.response?.data?.message || "Failed to delete")); }
  };

  // ── Tutors ──
  const approveTutor = async (t, isApproved) => {
    try {
      await setTutorApproval(t._id, isApproved);
      setTutors((list) => list.map((x) => x._id === t._id ? { ...x, isApproved } : x));
      flash(isApproved ? "✅ Tutor approved" : "⚠️ Approval revoked");
    } catch { flash("❌ Failed to update approval"); }
  };

  const removeTutor = async (t) => {
    if (!confirm(`Delete this tutor profile (${t.user?.name})?`)) return;
    try {
      await deleteTutorAdmin(t._id);
      setTutors((list) => list.filter((x) => x._id !== t._id));
      flash("✅ Tutor profile deleted");
    } catch { flash("❌ Failed to delete tutor"); }
  };

  // ── Bookings ──
  const cancelBookingAdmin = async (b) => {
    if (!confirm("Force-cancel this booking?")) return;
    try {
      await forceCancelBooking(b._id);
      setBookings((list) => list.map((x) => x._id === b._id ? { ...x, status: "cancelled" } : x));
      flash("✅ Booking cancelled");
    } catch { flash("❌ Failed to cancel booking"); }
  };

  // ── Reviews ──
  const removeReview = async (r) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReviewAdmin(r._id);
      setReviews((list) => list.filter((x) => x._id !== r._id));
      flash("✅ Review deleted");
    } catch { flash("❌ Failed to delete review"); }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const filteredTutors = tutors.filter((t) => {
    if (tutorFilter === "approved")   return t.isApproved;
    if (tutorFilter === "pending")    return !t.isApproved;
    return true;
  });

  const filteredBookings = bookingFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === bookingFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 relative overflow-hidden px-6 py-14">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <FaUserShield className="text-white" size={28} />
            </div>
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-0.5">Admin Panel 🛡️</p>
              <h1 className="text-3xl font-black text-white">{user.name}</h1>
              <p className="text-indigo-200 text-sm">Manage the whole platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 -mt-6">

        {msg && (
          <div className={`px-4 py-3 rounded-2xl mb-6 text-sm font-medium ${
            msg.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
          }`}>{msg}</div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === t.key ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-indigo-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users",    value: stats.totalUsers,        icon: <FaUsers />,              color: "text-blue-600   bg-blue-50" },
              { label: "Students",       value: stats.totalStudents,     icon: <FaUsers />,              color: "text-cyan-600   bg-cyan-50" },
              { label: "Tutors",         value: stats.totalTutors,       icon: <FaChalkboardTeacher />,  color: "text-purple-600 bg-purple-50" },
              { label: "Pending Approvals", value: stats.pendingApprovals, icon: <FaBan />,               color: "text-yellow-600 bg-yellow-50" },
              { label: "Total Bookings", value: stats.totalBookings,     icon: <FaCalendarCheck />,      color: "text-indigo-600 bg-indigo-50" },
              { label: "Pending Bookings", value: stats.pendingBookings, icon: <FaCalendarCheck />,      color: "text-orange-600 bg-orange-50" },
              { label: "Completed Bookings", value: stats.completedBookings, icon: <FaCheckCircle />,    color: "text-green-600  bg-green-50" },
              { label: "Total Reviews", value: stats.totalReviews,       icon: <FaStar />,               color: "text-pink-600   bg-pink-50" },
              { label: "Total Revenue", value: `Rs. ${stats.totalRevenue}`, icon: <FaMoneyBillWave />,   color: "text-emerald-600 bg-emerald-50" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64" />
              </div>
              <div className="flex gap-2">
                {["all", "student", "tutor", "admin"].map((r) => (
                  <button key={r} onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      userRoleFilter === r ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-100">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-bold text-gray-800">{u.name}</td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <select value={u.role} onChange={(e) => changeUserRole(u, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          u.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                        }`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => toggleUserActive(u)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-700 transition"
                          title={u.isActive ? "Deactivate" : "Activate"}>
                          {u.isActive ? <FaBan size={13} /> : <FaCheckCircle size={13} />}
                        </button>
                        <button onClick={() => removeUser(u)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition"
                          title="Delete user">
                          <FaTrash size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tutors ── */}
        {activeTab === "tutors" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex gap-2">
              {["all", "pending", "approved"].map((f) => (
                <button key={f} onClick={() => setTutorFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    tutorFilter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-100">
                    <th className="px-5 py-3">Tutor</th>
                    <th className="px-5 py-3">Subjects</th>
                    <th className="px-5 py-3">Rate</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutors.map((t) => (
                    <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-bold text-gray-800">{t.user?.name}</p>
                        <p className="text-gray-400 text-xs">{t.user?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{t.subjects?.join(", ")}</td>
                      <td className="px-5 py-3 text-gray-600">Rs. {t.hourlyRate}</td>
                      <td className="px-5 py-3 text-gray-600">⭐ {t.rating || 0} ({t.totalReviews || 0})</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          t.isApproved ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}>
                          {t.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                        {!t.isApproved ? (
                          <button onClick={() => approveTutor(t, true)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 transition" title="Approve">
                            <FaCheck size={13} />
                          </button>
                        ) : (
                          <button onClick={() => approveTutor(t, false)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-700 transition" title="Revoke approval">
                            <FaTimes size={13} />
                          </button>
                        )}
                        <button onClick={() => removeTutor(t)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition" title="Delete profile">
                          <FaTrash size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTutors.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No tutors found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Bookings ── */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex gap-2 flex-wrap">
              {["all", "pending", "accepted", "completed", "cancelled", "rejected"].map((f) => (
                <button key={f} onClick={() => setBookingFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    bookingFilter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-100">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Tutor</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-700">{b.student?.name}</td>
                      <td className="px-5 py-3 text-gray-700">{b.tutor?.user?.name}</td>
                      <td className="px-5 py-3 text-gray-600">{b.subject}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(b.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-gray-600">Rs. {b.totalPrice}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {["pending", "accepted"].includes(b.status) && (
                          <button onClick={() => cancelBookingAdmin(b)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition" title="Force cancel">
                            <FaBan size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-100">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Tutor</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Comment</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-700">{r.student?.name}</td>
                      <td className="px-5 py-3 text-gray-700">{r.tutor?.user?.name}</td>
                      <td className="px-5 py-3 text-yellow-500 font-bold">{"⭐".repeat(r.rating)}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{r.comment}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => removeReview(r)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition" title="Delete review">
                          <FaTrash size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No reviews found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
