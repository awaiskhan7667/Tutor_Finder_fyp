import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaCheck, FaTimes, FaCamera,
         FaUserGraduate, FaMoneyBillWave, FaEdit, FaSave, FaSpinner } from "react-icons/fa";
import { getTutorBookings, updateBookingStatus, createTutor, updateTutor, uploadAvatar, updateProfile } from "../services/api";
import Avatar from "../components/Avatar";

const STATUS_STYLES = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted:  "bg-green-50  text-green-700  border-green-200",
  rejected:  "bg-red-50    text-red-600    border-red-200",
  completed: "bg-blue-50   text-blue-700   border-blue-200",
  cancelled: "bg-gray-100  text-gray-500   border-gray-200",
};

const SUBJECTS = ["Mathematics","Physics","Chemistry","English","Computer","Biology","Urdu","Islamiat"];

export default function TutorDashboard() {
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [activeTab,   setActiveTab]   = useState("bookings");
  const [editProfile, setEditProfile] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [preview,     setPreview]     = useState(null);
  const [user,        setUser]        = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [profile,     setProfile]     = useState({
    subjects:[], bio:"", hourlyRate:"", experience:"",
    education:"", location:"", teachingMode:"both", languages:["Urdu","English"]
  });
  const fileRef  = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) { navigate("/login"); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getTutorBookings();
      setBookings(res.data.bookings);
    } catch { setBookings([]); }
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch {}
  };

  const toggleSubject = (s) => {
    setProfile((p) => ({
      ...p,
      subjects: p.subjects.includes(s) ? p.subjects.filter((x) => x !== s) : [...p.subjects, s],
    }));
  };

  // ── Avatar upload ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveMsg("❌ Max 2MB!"); return; }
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
      setSaveMsg("✅ Profile picture updated!");
    } catch { setSaveMsg("❌ Upload failed!"); }
    setAvatarLoading(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateTutor(user.id, profile);
      setSaveMsg("✅ Profile updated!");
    } catch {
      try {
        await createTutor(profile);
        setSaveMsg("✅ Profile created!");
      } catch { setSaveMsg("❌ Error saving profile."); }
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const filtered  = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const earnings  = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.totalPrice, 0);

  const stats = [
    { label:"Total Requests", value: bookings.length,                                       icon:"📋", color:"text-blue-600   bg-blue-50"   },
    { label:"Pending",        value: bookings.filter((b) => b.status==="pending").length,    icon:"⏳", color:"text-yellow-600 bg-yellow-50" },
    { label:"Accepted",       value: bookings.filter((b) => b.status==="accepted").length,   icon:"✅", color:"text-green-600  bg-green-50"  },
    { label:"Earnings",       value: `Rs.${earnings}`,                                       icon:"💰", color:"text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-700 relative overflow-hidden px-6 py-14">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"30px 30px" }} />
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl animate-float" />

        <div className="relative max-w-5xl mx-auto animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar user={user} size="xl" />
              <div>
                <p className="text-purple-200 text-sm font-medium mb-0.5">Tutor Portal 🎓</p>
                <h1 className="text-3xl font-black text-white">{user.name}</h1>
                <p className="text-purple-200 text-sm">Manage your bookings & profile</p>
              </div>
            </div>
            <button onClick={() => { setActiveTab("profile"); setEditProfile(true); }}
              className="group bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black px-7 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2 self-start md:self-auto">
              <FaEdit /> Edit Profile
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color.split(" ")[1]}`}>
                {s.icon}
              </div>
              <p className={`text-2xl font-black ${s.color.split(" ")[0]}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100 flex gap-2 mb-6 w-fit">
          {["bookings","profile"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200 ${
                activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {tab === "bookings" ? "📋 Bookings" : "👤 My Profile"}
            </button>
          ))}
        </div>

        {/* ══ BOOKINGS TAB ══ */}
        {activeTab === "bookings" && (
          <>
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["all","pending","accepted","rejected","completed","cancelled"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm capitalize transition-all duration-200 hover:scale-105 ${
                    filter === f ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-100"
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-md animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 animate-fade-in">
                <span className="text-7xl block mb-4">📭</span>
                <h3 className="text-2xl font-black text-gray-400 mb-2">No booking requests yet</h3>
                <p className="text-gray-400">Complete your profile to attract students!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((b, i) => (
                  <div key={b._id} style={{ animationDelay:`${i*80}ms` }}
                    className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-card-in">

                    {/* Student info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                          <FaUserGraduate />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-800">{b.student?.name || "Student"}</h3>
                          <p className="text-purple-600 text-sm font-medium">{b.subject}</p>
                          <p className="text-gray-400 text-xs">{b.student?.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Booking details */}
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
                        <p className="text-xs text-gray-400 mb-0.5">Mode</p>
                        <p className="text-sm font-bold text-gray-700 capitalize">{b.teachingMode}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><FaMoneyBillWave size={10}/> Earning</p>
                        <p className="text-sm font-black text-green-600">Rs. {b.totalPrice}</p>
                      </div>
                    </div>

                    {b.message && (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2 mb-4 italic">"{b.message}"</p>
                    )}

                    {/* Actions */}
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(b._id, "accepted")}
                          className="flex-1 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2">
                          <FaCheck /> Accept
                        </button>
                        <button onClick={() => handleStatus(b._id, "rejected")}
                          className="flex-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2">
                          <FaTimes /> Reject
                        </button>
                      </div>
                    )}
                    {b.status === "accepted" && (
                      <button onClick={() => handleStatus(b._id, "completed")}
                        className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm">
                        ✅ Mark as Completed
                      </button>
                    )}
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
                <h2 className="text-2xl font-black text-gray-800">My Tutor Profile</h2>
                <p className="text-gray-500 text-sm mt-1">This is what students see when they search for tutors</p>
              </div>
              <button onClick={() => setEditProfile(!editProfile)}
                className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all duration-300 ${
                  editProfile ? "bg-gray-100 text-gray-600" : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}>
                <FaEdit /> {editProfile ? "Cancel" : "Edit"}
              </button>
            </div>

            {saveMsg && (
              <div className={`px-4 py-3 rounded-2xl mb-6 text-sm font-medium animate-fade-in ${
                saveMsg.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
              }`}>{saveMsg}</div>
            )}

            {/* ── Avatar section ── */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-4">
                <Avatar user={preview ? { ...user, avatar: null } : user} size="2xl" />
                {preview && (
                  <img src={preview} alt="preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl border-4 border-indigo-200" />
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <FaSpinner className="text-white animate-spin" size={24} />
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 text-white">
                  <FaCamera size={22} />
                  <span className="text-xs font-bold">Change Photo</span>
                </button>
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-300 text-sm">
                <FaCamera /> {user.avatar ? "Change Picture" : "Add Profile Picture"}
              </button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP · Max 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Bio */}
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-2 block">📝 Bio</label>
                {editProfile ? (
                  <textarea rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell students about yourself..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 resize-none" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600">{profile.bio || "No bio yet"}</p>
                )}
              </div>

              {/* Hourly rate */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">💰 Hourly Rate (Rs.)</label>
                {editProfile ? (
                  <input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600 font-bold text-green-600">Rs. {profile.hourlyRate || "Not set"}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">⏳ Experience (years)</label>
                {editProfile ? (
                  <input type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600">{profile.experience || "Not set"} years</p>
                )}
              </div>

              {/* Education */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">🎓 Education</label>
                {editProfile ? (
                  <input type="text" value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    placeholder="e.g. BS Mathematics"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600">{profile.education || "Not set"}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">📍 Location</label>
                {editProfile ? (
                  <input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Bannu, KPK"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600">{profile.location || "Not set"}</p>
                )}
              </div>

              {/* Teaching mode */}
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-2 block">🖥️ Teaching Mode</label>
                {editProfile ? (
                  <div className="grid grid-cols-3 gap-3">
                    {["online","in-person","both"].map((m) => (
                      <button key={m} type="button" onClick={() => setProfile({ ...profile, teachingMode: m })}
                        className={`py-3 rounded-2xl font-bold text-sm capitalize transition-all duration-200 hover:scale-105 ${
                          profile.teachingMode === m ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-600 capitalize">{profile.teachingMode}</p>
                )}
              </div>

              {/* Subjects */}
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-2 block">📚 Subjects</label>
                {editProfile ? (
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSubject(s)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 ${
                          profile.subjects.includes(s) ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.length > 0
                      ? profile.subjects.map((s) => (
                          <span key={s} className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-full text-sm">{s}</span>
                        ))
                      : <p className="text-gray-400">No subjects selected</p>
                    }
                  </div>
                )}
              </div>
            </div>

            {editProfile && (
              <button onClick={handleSaveProfile} disabled={saving}
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl">
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><FaSave /> Save Profile</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}