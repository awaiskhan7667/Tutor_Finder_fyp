import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch, FaStar, FaMapMarkerAlt, FaFilter,
         FaChalkboardTeacher, FaTimes } from "react-icons/fa";
import { getAllTutors } from "../services/api";
import Avatar from "../components/Avatar";

const SUBJECTS      = ["Mathematics","Physics","Chemistry","English","Computer","Biology","Urdu","Islamiat"];
const TEACHING_MODES = ["all","online","in-person","both"];

export default function Tutors() {
  const [tutors,   setTutors]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filters,  setFilters]  = useState({ subject:"", location:"", minRate:"", maxRate:"", teachingMode:"" });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const subject = searchParams.get("subject") || "";
    setFilters((f) => ({ ...f, subject }));
    fetchTutors({ subject });
  }, []);

  const fetchTutors = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = { ...filters, ...overrides };
      // Remove empty params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getAllTutors(params);
      setTutors(res.data.tutors);
    } catch {
      setTutors([]);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors();
  };

  const clearFilters = () => {
    setFilters({ subject:"", location:"", minRate:"", maxRate:"", teachingMode:"" });
    fetchTutors({ subject:"", location:"", minRate:"", maxRate:"", teachingMode:"" });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"30px 30px" }} />
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-float-slow" />

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Tutor</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8">Browse from 500+ verified tutors across Pakistan</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject..."
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-xl"
              />
            </div>
            <button type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl">
              Search
            </button>
            <button type="button" onClick={() => setShowFilter(!showFilter)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-5 py-4 rounded-2xl border border-white/20 transition-all duration-300 flex items-center gap-2">
              <FaFilter /> Filter
            </button>
          </form>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilter && (
        <div className="bg-white border-b border-gray-200 shadow-lg animate-slide-up">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="grid md:grid-cols-4 gap-4">

              {/* Location */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">📍 Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="e.g. Bannu, Peshawar"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Min Rate */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">💰 Min Rate (Rs.)</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={filters.minRate}
                  onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Max Rate */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">💰 Max Rate (Rs.)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Teaching Mode */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">🎓 Mode</label>
                <select
                  value={filters.teachingMode}
                  onChange={(e) => setFilters({ ...filters, teachingMode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {TEACHING_MODES.map((m) => (
                    <option key={m} value={m === "all" ? "" : m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject chips */}
            <div className="mt-4">
              <label className="text-sm font-bold text-gray-700 mb-2 block">📚 Subjects</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button key={s} type="button"
                    onClick={() => setFilters({ ...filters, subject: s })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      filters.subject === s
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => fetchTutors()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105">
                Apply Filters
              </button>
              <button onClick={clearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2">
                <FaTimes /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-medium">
            {loading ? "Searching..." : `${tutors.length} tutor${tutors.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md animate-pulse">
                <div className="h-24 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <FaChalkboardTeacher size={60} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-400 mb-2">No Tutors Found</h3>
            <p className="text-gray-400 mb-6">Try changing your filters or search term</p>
            <button onClick={clearFilters}
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-all duration-300">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor, i) => (
              <div
                key={tutor._id}
                style={{ animationDelay: `${i * 80}ms` }}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer border border-gray-100 animate-card-in"
                onClick={() => navigate(`/tutors/${tutor._id}`)}
              >
                {/* Card top */}
                <div className="h-20 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"15px 15px" }} />
                  {tutor.isAvailable && (
                    <span className="absolute top-3 right-3 bg-green-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Available
                    </span>
                  )}
                </div>

                <div className="px-5 pb-5 -mt-8">
                  {/* Avatar */}
                  <Avatar user={tutor.user} size="lg" className="-mt-8 mb-3 border-4 border-white" />

                  <h3 className="text-lg font-black text-gray-800">{tutor.user?.name}</h3>
                  <p className="text-blue-600 text-sm font-bold mb-1">{tutor.subjects?.join(", ")}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {tutor.location && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-red-400" /> {tutor.location}
                      </span>
                    )}
                    <span className="capitalize bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      {tutor.teachingMode}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">{tutor.bio}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                      <FaStar />
                      <span>{tutor.rating > 0 ? tutor.rating : "New"}</span>
                      {tutor.totalReviews > 0 && (
                        <span className="text-gray-400 font-normal">({tutor.totalReviews})</span>
                      )}
                    </div>
                    <span className="bg-green-50 text-green-600 font-black text-sm px-3 py-1 rounded-full">
                      Rs. {tutor.hourlyRate}/hr
                    </span>
                  </div>

                  <button className="mt-4 w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-sm group-hover:bg-blue-600 group-hover:text-white">
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}