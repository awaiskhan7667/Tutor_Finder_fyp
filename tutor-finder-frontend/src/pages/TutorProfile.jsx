import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaGraduationCap, FaClock,
         FaChalkboardTeacher, FaVideo, FaUserCheck, FaTimes } from "react-icons/fa";
import { getTutor, createBooking } from "../services/api";
import Avatar from "../components/Avatar";

export default function TutorProfile() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [tutor,   setTutor]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [booking,  setBooking]  = useState({
    subject:"", date:"", startTime:"", endTime:"", totalHours:1, teachingMode:"online", message:""
  });
  const [bookMsg,  setBookMsg]  = useState({ text:"", type:"" });
  const [bookLoading, setBookLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    getTutor(id)
      .then((res) => setTutor(res.data.tutor))
      .catch(() => navigate("/tutors"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user?.id) { navigate("/login"); return; }
    setBookLoading(true);
    try {
      await createBooking({ ...booking, tutorId: id });
      setBookMsg({ text:"✅ Booking sent successfully!", type:"success" });
      setTimeout(() => { setShowModal(false); navigate("/dashboard/student"); }, 1500);
    } catch (err) {
      setBookMsg({ text: err.response?.data?.message || "Booking failed.", type:"error" });
    }
    setBookLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading tutor profile...</p>
      </div>
    </div>
  );

  if (!tutor) return null;

  const totalPrice = tutor.hourlyRate * booking.totalHours;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 relative overflow-hidden pt-12 pb-24 px-6">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"30px 30px" }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-float" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 animate-fade-in">
          {/* Avatar */}
          <Avatar user={tutor.user} size="2xl" className="border-4 border-white/20 flex-shrink-0 animate-glow" />

          {/* Info */}
          <div className="text-white text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black">{tutor.user?.name}</h1>
              {tutor.isAvailable && (
                <span className="bg-green-400/20 border border-green-400/40 text-green-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Available
                </span>
              )}
            </div>
            <p className="text-blue-200 text-lg mb-3">{tutor.subjects?.join(" · ")}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-blue-100">
              {tutor.location && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" /> {tutor.location}</span>}
              <span className="flex items-center gap-1"><FaGraduationCap className="text-yellow-400" /> {tutor.education || "Not specified"}</span>
              <span className="flex items-center gap-1"><FaClock className="text-green-400" /> {tutor.experience} yrs experience</span>
              <span className="flex items-center gap-1 capitalize"><FaChalkboardTeacher className="text-purple-400" /> {tutor.teachingMode}</span>
            </div>
          </div>

          {/* Price card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white text-center flex-shrink-0 w-full md:w-48">
            <p className="text-blue-200 text-sm mb-1">Hourly Rate</p>
            <p className="text-4xl font-black text-yellow-400">Rs.{tutor.hourlyRate}</p>
            <p className="text-blue-200 text-sm mb-4">per hour</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(tutor.rating) ? "text-yellow-400" : "text-white/20"} size={14} />
              ))}
              <span className="text-sm text-blue-200 ml-1">({tutor.totalReviews})</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-sm"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 pb-20">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left — main info */}
          <div className="md:col-span-2 space-y-6">

            {/* About */}
            <div className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 animate-card-in">
              <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">📝</span>
                About Me
              </h2>
              <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 animate-card-in">
              <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">📚</span>
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects?.map((s) => (
                  <span key={s} className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-full text-sm hover:bg-blue-100 transition-colors">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 animate-card-in">
              <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-green-600">🌐</span>
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.languages?.map((l) => (
                  <span key={l} className="bg-green-50 text-green-700 font-bold px-4 py-2 rounded-full text-sm">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — quick info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 animate-card-in">
              <h2 className="text-lg font-black text-gray-800 mb-4">Quick Info</h2>
              <div className="space-y-4">
                {[
                  { icon:"🎓", label:"Education",  val: tutor.education || "N/A" },
                  { icon:"⏳", label:"Experience", val: `${tutor.experience} years` },
                  { icon:"📍", label:"Location",   val: tutor.location   || "N/A" },
                  { icon:"🖥️", label:"Mode",       val: tutor.teachingMode },
                  { icon:"⭐", label:"Rating",      val: tutor.rating > 0 ? `${tutor.rating}/5` : "New" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                      <p className="text-sm font-bold text-gray-700 capitalize">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teaching modes */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 animate-card-in">
              <h2 className="text-lg font-black text-gray-800 mb-4">Teaching Mode</h2>
              <div className="space-y-3">
                {(tutor.teachingMode === "online" || tutor.teachingMode === "both") && (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-3">
                    <FaVideo className="text-blue-600" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Online</p>
                      <p className="text-xs text-gray-500">Via Google Meet / Zoom</p>
                    </div>
                  </div>
                )}
                {(tutor.teachingMode === "in-person" || tutor.teachingMode === "both") && (
                  <div className="flex items-center gap-3 bg-green-50 rounded-2xl p-3">
                    <FaUserCheck className="text-green-600" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">In-Person</p>
                      <p className="text-xs text-gray-500">{tutor.location || "Location TBD"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Book CTA */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-blue-500/30"
            >
              📅 Book a Session
            </button>
          </div>
        </div>
      </div>

      {/* ══ BOOKING MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-card-in max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">Book a Session</h3>
                  <p className="text-gray-500 text-sm">with {tutor.user?.name}</p>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-red-100 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all duration-300">
                  <FaTimes />
                </button>
              </div>

              {/* Message */}
              {bookMsg.text && (
                <div className={`px-4 py-3 rounded-2xl mb-4 text-sm font-medium animate-fade-in ${
                  bookMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {bookMsg.text}
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">

                {/* Subject */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">Subject</label>
                  <select value={booking.subject} onChange={(e) => setBooking({ ...booking, subject: e.target.value })} required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                    <option value="">Select subject</option>
                    {tutor.subjects?.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">Date</label>
                  <input type="date" value={booking.date} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })} required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1.5 block">Start Time</label>
                    <input type="time" value={booking.startTime} onChange={(e) => setBooking({ ...booking, startTime: e.target.value })} required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1.5 block">End Time</label>
                    <input type="time" value={booking.endTime} onChange={(e) => setBooking({ ...booking, endTime: e.target.value })} required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
                  </div>
                </div>

                {/* Hours */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">Total Hours</label>
                  <input type="number" min="1" max="8" value={booking.totalHours}
                    onChange={(e) => setBooking({ ...booking, totalHours: parseInt(e.target.value) })} required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
                </div>

                {/* Mode */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">Teaching Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["online","in-person"].map((m) => (
                      <button key={m} type="button"
                        onClick={() => setBooking({ ...booking, teachingMode: m })}
                        className={`py-3 rounded-2xl font-bold text-sm capitalize transition-all duration-200 ${
                          booking.teachingMode === m
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                        }`}>
                        {m === "online" ? "🖥️" : "🏫"} {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">Message (optional)</label>
                  <textarea rows={3} placeholder="Tell the tutor what you need help with..."
                    value={booking.message} onChange={(e) => setBooking({ ...booking, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none" />
                </div>

                {/* Price summary */}
                <div className="bg-blue-50 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{booking.totalHours} hr × Rs. {tutor.hourlyRate}</p>
                    <p className="text-xs text-gray-400">Total price</p>
                  </div>
                  <p className="text-2xl font-black text-blue-600">Rs. {totalPrice}</p>
                </div>

                <button type="submit" disabled={bookLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2">
                  {bookLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
                  ) : "📅 Confirm Booking"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}