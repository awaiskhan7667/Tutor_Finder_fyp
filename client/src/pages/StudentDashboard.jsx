import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaBook, FaSearch, FaVideo, FaCamera, FaStar,
         FaCheckCircle, FaTimesCircle, FaBan, FaSpinner, FaEdit, FaSave } from "react-icons/fa";
import { getMyBookings, cancelBooking, uploadAvatar, updateProfile, checkReviewed } from "../services/api";
import Avatar from "../components/Avatar";
import VideoClass from "../components/VideoClass";
import ReviewModal from "../components/ReviewModal";

const STATUS_STYLES = {
  pending:   "bg-yellow-50  text-yellow-700  border-yellow-200",
  accepted:  "bg-green-50   text-green-700   border-green-200",
  rejected:  "bg-red-50     text-red-600     border-red-200",
  completed: "bg-blue-50    text-blue-700    border-blue-200",
  cancelled: "bg-gray-100   text-gray-500    border-gray-200",
};

const STATUS_ICONS = {
  pending:   <FaSpinner    className="animate-spin" />,
  accepted:  <FaCheckCircle />,
  rejected:  <FaTimesCircle />,
  completed: <FaCheckCircle />,
  cancelled: <FaBan />,
};

export default function StudentDashboard() {
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [activeTab,   setActiveTab]   = useState("bookings");
  const [activeClass,   setActiveClass]   = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewedIds,   setReviewedIds]   = useState({});

  // Profile state
  const [user,        setUser]        = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user.name || "", phone: user.phone || "" });
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState({ text: "", type: "" });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [preview,     setPreview]     = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) { navigate("/login"); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings);
      // Check which completed bookings are already reviewed
      const completed = res.data.bookings.filter((b) => b.status === "completed");
      const checks = await Promise.all(
        completed.map((b) => checkReviewed(b._id).then((r) => ({ id: b._id, reviewed: r.data.reviewed })))
      );
      const map = {};
      checks.forEach(({ id, reviewed }) => { map[id] = reviewed; });
      setReviewedIds(map);
    } catch { setBookings([]); }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try { await cancelBooking(id); fetchBookings(); } catch {}
  };

  // ── Avatar upload ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSaveMsg({ text: "❌ Max file size is 2MB!", type: "error" }); return;
    }
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await uploadAvatar(fd);
      const updated = { ...user, avatar: res.data.avatar };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setSaveMsg({ text: "✅ Profile picture updated!", type: "success" });
    } catch { setSaveMsg({ text: "❌ Upload failed!", type: "error" }); }
    setAvatarLoading(false);
    setTimeout(() => setSaveMsg({ text: "", type: "" }), 3000);
  };

  // ── Save profile ──
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res  = await updateProfile(profileForm);
      const updated = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setEditProfile(false);
      setSaveMsg({ text: "✅ Profile updated!", type: "success" });
    } catch { setSaveMsg({ text: "❌ Failed to save!", type: "error" }); }
    setSaving(false);
    setTimeout(() => setSaveMsg({ text: "", type: "" }), 3000);
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const stats = [
    { label:"Total Bookings", value: bookings.length,                                      icon:"📚", color:"bg-blue-50   text-blue-600"   },
    { label:"Pending",        value: bookings.filter((b) => b.status==="pending").length,   icon:"⏳", color:"bg-yellow-50 text-yellow-600" },
    { label:"Accepted",       value: bookings.filter((b) => b.status==="accepted").length,  icon:"✅", color:"bg-green-50  text-green-600"  },
    { label:"Completed",      value: bookings.filter((b) => b.status==="completed").length, icon:"🎓", color:"bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 relative overflow-hidden px-6 py-14">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"30px 30px" }} />
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-float" />

        <div className="relative max-w-5xl mx-auto animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar user={user} size="xl" />
              <div>
                <p className="text-blue-200 text-sm font-medium mb-0.5">Welcome back 👋</p>
                <h1 className="text-3xl font-black text-white">{user.name}</h1>
                <p className="text-blue-200 text-sm">Student Dashboard</p>
              </div>
            </div>
            <button onClick={() => navigate("/tutors")}
              className="group bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black px-7 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2 self-start md:self-auto">
              <FaSearch /> Find a Tutor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 -mt-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} style={{ animationDelay:`${i*100}ms` }}
              className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 animate-card-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color.split(" ")[0]}`}>{s.icon}</div>
              <p className={`text-3xl font-black ${s.color.split(" ")[1]}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100 flex gap-2 mb-6 w-fit">
          {["bookings", "profile"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200 ${
                activeTab === tab ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {tab === "bookings" ? "📋 Bookings" : "👤 My Profile"}
            </button>
          ))}
        </div>

        {/* ══ BOOKINGS TAB ══ */}
        {activeTab === "bookings" && (
          <>
            <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100 flex flex-wrap gap-2 mb-6">
              {["all","pending","accepted","rejected","completed","cancelled"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200 hover:scale-105 ${
                    filter === f ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
                  }`}>{f}</button>
              ))}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-md animate-pulse">
                    <div className="flex gap-4"><div className="w-14 h-14 bg-gray-200 rounded-2xl" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 animate-fade-in">
                <span className="text-7xl block mb-4">📭</span>
                <h3 className="text-2xl font-black text-gray-400 mb-2">No bookings yet</h3>
                <p className="text-gray-400 mb-6">Find a tutor and book your first session!</p>
                <button onClick={() => navigate("/tutors")}
                  className="bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-all duration-300">Find Tutors →</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((b, i) => (
                  <div key={b._id} style={{ animationDelay:`${i*80}ms` }}
                    className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-card-in">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={b.tutor?.user} size="lg" />
                        <div>
                          <h3 className="font-black text-gray-800">{b.tutor?.user?.name || "Tutor"}</h3>
                          <p className="text-blue-600 text-sm font-medium">{b.subject}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLES[b.status]}`}>
                        {STATUS_ICONS[b.status]} {b.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaCalendarAlt size={10}/> Date</p>
                        <p className="text-sm font-bold text-gray-700">{new Date(b.date).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaClock size={10}/> Time</p>
                        <p className="text-sm font-bold text-gray-700">{b.startTime} – {b.endTime}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaBook size={10}/> Mode</p>
                        <p className="text-sm font-bold text-gray-700 capitalize">{b.teachingMode}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Total Price</p>
                        <p className="text-sm font-black text-green-600">Rs. {b.totalPrice}</p>
                      </div>
                    </div>
                    {b.message && (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2 mb-4 italic">"{b.message}"</p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/tutors/${b.tutor?._id}`)}
                        className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm">
                        View Tutor
                      </button>
                      {b.status === "accepted" && (
                        <button onClick={() => setActiveClass(b)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2">
                          <FaVideo /> Join Class
                        </button>
                      )}
                      {b.status === "completed" && (
                        reviewedIds[b._id] ? (
                          <div className="flex-1 bg-yellow-50 text-yellow-600 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                            <FaStar /> Reviewed
                          </div>
                        ) : (
                          <button onClick={() => setReviewBooking(b)}
                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2">
                            <FaStar /> Leave Review
                          </button>
                        )
                      )}
                      {b.status === "pending" && (
                        <button onClick={() => handleCancel(b._id)}
                          className="flex-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ PROFILE TAB ══ */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-800">My Profile</h2>
                <p className="text-gray-500 text-sm mt-1">Update your personal information</p>
              </div>
              <button onClick={() => setEditProfile(!editProfile)}
                className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all duration-300 ${
                  editProfile ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>
                <FaEdit /> {editProfile ? "Cancel" : "Edit"}
              </button>
            </div>

            {saveMsg.text && (
              <div className={`px-4 py-3 rounded-2xl mb-6 text-sm font-medium animate-fade-in ${
                saveMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
              }`}>{saveMsg.text}</div>
            )}

            {/* ── Avatar section ── */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-4">
                <Avatar user={preview ? { ...user, avatar: null } : user} size="2xl" />
                {preview && (
                  <img src={preview} alt="preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl border-4 border-blue-200" />
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <FaSpinner className="text-white animate-spin" size={24} />
                  </div>
                )}
                {/* Camera hover button */}
                <button onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 text-white">
                  <FaCamera size={22} />
                  <span className="text-xs font-bold">Change Photo</span>
                </button>
              </div>

              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-300 text-sm">
                <FaCamera /> {user.avatar ? "Change Picture" : "Add Profile Picture"}
              </button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP · Max 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* ── Profile fields ── */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">👤 Full Name</label>
                {editProfile ? (
                  <input type="text" value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-700 font-medium">{user.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">📞 Phone</label>
                {editProfile ? (
                  <input type="text" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="e.g. 03001234567"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600">{user.phone || "Not added"}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">📧 Email</label>
                <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">🎭 Role</label>
                <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>

            {editProfile && (
              <button onClick={handleSaveProfile} disabled={saving}
                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl">
                {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><FaSave /> Save Changes</>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={fetchBookings}
        />
      )}

      {/* Video Class */}
      {activeClass && (
        <VideoClass bookingId={activeClass._id} subject={activeClass.subject}
          otherPersonName={activeClass.tutor?.user?.name || "Tutor"}
          onClose={() => setActiveClass(null)} />
      )}
    </div>
  );
}