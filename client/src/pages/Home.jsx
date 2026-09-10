import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaStar, FaChalkboardTeacher, FaUserGraduate,
         FaCheckCircle, FaArrowRight, FaPlay } from "react-icons/fa";
import { getAllTutors } from "../services/api";
import Avatar from "../components/Avatar";

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

export default function Home() {
  const [search,  setSearch]  = useState("");
  const [tutors,  setTutors]  = useState([]);
  const [visible, setVisible] = useState(false);
  const [statsRef,  statsInView]  = useInView();
  const [stepsRef,  stepsInView]  = useInView();
  const [eduRef,    eduInView]    = useInView();
  const [tutorsRef, tutorsInView] = useInView();
  const [ctaRef,    ctaInView]    = useInView();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    getAllTutors()
      .then((res) => setTutors(res.data.tutors))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/tutors?subject=${search}`);
  };

  const subjects = ["Mathematics", "Physics", "Chemistry", "English", "Computer", "Biology", "Urdu", "Islamiat"];

  const stats = [
    { icon: <FaChalkboardTeacher size={32} />, value: "500+",  label: "Expert Tutors",  color: "text-blue-500"   },
    { icon: <FaUserGraduate      size={32} />, value: "2000+", label: "Happy Students", color: "text-purple-500" },
    { icon: <FaStar              size={32} />, value: "4.8",   label: "Average Rating", color: "text-yellow-500" },
    { icon: <FaCheckCircle       size={32} />, value: "98%",   label: "Success Rate",   color: "text-green-500"  },
  ];

  const educationCards = [
    { icon: "📐", title: "Mathematics", desc: "Algebra, Calculus, Statistics and more",   color: "from-blue-500   to-indigo-600",   students: "1200+" },
    { icon: "⚗️", title: "Chemistry",   desc: "Organic, Inorganic & Physical Chemistry",  color: "from-green-500  to-teal-600",     students: "980+"  },
    { icon: "⚡", title: "Physics",     desc: "Mechanics, Electricity, Quantum Physics",  color: "from-yellow-500 to-orange-600",   students: "870+"  },
    { icon: "💻", title: "Computer",    desc: "Programming, Web Dev, Data Science",       color: "from-purple-500 to-pink-600",     students: "1500+" },
    { icon: "🔬", title: "Biology",     desc: "Botany, Zoology, Genetics and more",       color: "from-red-500    to-pink-600",     students: "760+"  },
    { icon: "📖", title: "English",     desc: "Grammar, Writing, Speaking and IELTS",     color: "from-cyan-500   to-blue-600",     students: "2000+" },
    { icon: "🧮", title: "Urdu",        desc: "Literature, Grammar and Essay Writing",    color: "from-orange-500 to-red-600",      students: "640+"  },
    { icon: "☪️", title: "Islamiat",    desc: "Quran, Hadith and Islamic Studies",        color: "from-emerald-500 to-green-600",   students: "550+"  },
  ];

  const steps = [
    { num: "01", title: "Search a Tutor", desc: "Browse tutors by subject, location, or price range.", icon: "🔍" },
    { num: "02", title: "Book a Session", desc: "Pick a time slot and send a booking request easily.", icon: "📅" },
    { num: "03", title: "Start Learning", desc: "Meet online or in-person and achieve your goals.",    icon: "🚀" },
  ];

  return (
    <div className="overflow-x-hidden bg-white">

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full opacity-20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500 rounded-full opacity-20 blur-3xl animate-float" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-cyan-400 rounded-full opacity-10 blur-3xl animate-pulse-slow" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Floating badges */}
        <div className="absolute top-28 left-8 md:left-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white text-sm hidden md:flex items-center gap-2 animate-float shadow-lg">
          <span className="text-2xl">⭐</span>
          <div><p className="font-bold">Top Rated</p><p className="text-xs opacity-70">4.9 / 5.0</p></div>
        </div>
        <div className="absolute top-40 right-8 md:right-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white text-sm hidden md:flex items-center gap-2 animate-float-slow shadow-lg" style={{ animationDelay:"1s" }}>
          <span className="text-2xl">🎓</span>
          <div><p className="font-bold">500+ Tutors</p><p className="text-xs opacity-70">Ready to teach</p></div>
        </div>
        <div className="absolute bottom-32 left-8 md:left-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white text-sm hidden md:flex items-center gap-2 animate-float shadow-lg" style={{ animationDelay:"2s" }}>
          <span className="text-2xl">📚</span>
          <div><p className="font-bold">20+ Subjects</p><p className="text-xs opacity-70">All levels</p></div>
        </div>

        <div className={`relative max-w-5xl mx-auto px-6 text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-5 py-2 rounded-full mb-8 shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Pakistan's #1 Tutor Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Learn From The <br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 animate-gradient bg-300%">
                Best Tutors
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full" />
            </span>
          </h1>

          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified expert tutors for online and in-person sessions. Any subject, any level, anywhere in Pakistan.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search by subject e.g. Math, Physics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-5 rounded-2xl text-gray-800 text-base focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-2xl"
              />
            </div>
            <button type="submit"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black px-8 py-5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl flex items-center gap-2 justify-center">
              Search <FaArrowRight />
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {subjects.map((s, i) => (
              <button key={s} onClick={() => navigate(`/tutors?subject=${s}`)}
                style={{ animationDelay:`${i * 80}ms` }}
                className="bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 hover:border-yellow-400 animate-fade-in">
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white flex flex-col items-center gap-2 animate-bounce-slow opacity-70">
          <span className="text-xs tracking-widest">SCROLL</span>
          <div className="w-0.5 h-8 bg-white/50 rounded-full" />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section ref={statsRef} className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} style={{ animationDelay:`${i * 150}ms` }}
              className={`text-center group transition-all duration-700 ${statsInView ? "animate-fade-in opacity-100" : "opacity-0"}`}>
              <div className={`${s.color} flex justify-center mb-4 group-hover:scale-125 transition-transform duration-500`}>
                {s.icon}
              </div>
              <p className="text-5xl font-black text-gray-800 mb-1">{s.value}</p>
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section ref={stepsRef} className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-blue-600 font-bold tracking-widest text-sm mb-3 uppercase">Simple Process</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-500 mb-16 text-lg max-w-xl mx-auto">Get started in just 3 easy steps</p>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[25%] right-[25%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            {steps.map((step, i) => (
              <div key={i} style={{ animationDelay:`${i * 200}ms` }}
                className={`relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group border border-gray-100 ${stepsInView ? "animate-card-in" : "opacity-0"}`}>
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-300">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-3xl transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EDUCATION CATEGORIES ══ */}
      <section ref={eduRef} className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-bold tracking-widest text-sm mb-3 uppercase">Browse by Subject</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">Popular Subjects</h2>
            <p className="text-gray-500 text-lg">Find expert tutors in any subject you need</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {educationCards.map((card, i) => (
              <div key={card.title} style={{ animationDelay:`${i * 80}ms` }}
                onClick={() => navigate(`/tutors?subject=${card.title}`)}
                className={`group cursor-pointer ${eduInView ? "animate-card-in" : "opacity-0"}`}>
                <div className={`bg-gradient-to-br ${card.color} rounded-3xl p-6 text-white relative overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl`}>
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"15px 15px" }} />
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <span className="text-4xl mb-4 block">{card.icon}</span>
                  <h3 className="font-black text-lg mb-1">{card.title}</h3>
                  <p className="text-white/70 text-xs leading-relaxed mb-3">{card.desc}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    <span className="text-white/80 text-xs font-medium">{card.students} students</span>
                  </div>
                  <div className="absolute top-4 right-4 w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-white text-xs font-black">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED TUTORS ══ */}
      <section ref={tutorsRef} className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-bold tracking-widest text-sm mb-3 uppercase">Top Educators</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">Meet Our Tutors</h2>
            <p className="text-gray-500 text-lg">Hand-picked experts ready to help you succeed</p>
          </div>

          {tutors.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-7xl mb-4 block">👨‍🏫</span>
              <p className="text-gray-400 text-xl">No tutors yet — be the first to join!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {tutors.map((tutor, i) => (
                <div key={tutor._id} style={{ animationDelay:`${i * 150}ms` }}
                  className={`relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group cursor-pointer border border-gray-100 ${tutorsInView ? "animate-card-in" : "opacity-0"}`}
                  onClick={() => navigate(`/tutors/${tutor._id}`)}>
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage:"radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize:"20px 20px" }} />
                  </div>
                  <div className="px-6 pb-6 -mt-10 relative">
                    <Avatar user={tutor.user} size="lg" className="mb-4 border-4 border-white group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-lg font-black text-gray-800">{tutor.user?.name}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-2">{tutor.subjects?.join(", ")}</p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{tutor.bio}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-yellow-500 flex items-center gap-1 text-sm font-bold">
                        <FaStar /> {tutor.rating || "New"}
                      </span>
                      <span className="bg-green-50 text-green-600 font-black text-sm px-3 py-1 rounded-full">
                        Rs. {tutor.hourlyRate}/hr
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all duration-300 rounded-3xl flex items-end justify-center pb-6">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0">
                      View Profile →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <button onClick={() => navigate("/tutors")}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-12 py-5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-3 mx-auto">
              View All Tutors
              <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section ref={ctaRef} className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"radial-gradient(circle at 50% 50%, white 1px, transparent 1px)", backgroundSize:"30px 30px" }} />
        <div className={`relative max-w-3xl mx-auto px-6 text-center transition-all duration-1000 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="text-6xl block mb-6 animate-bounce-slow">🎓</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Are You a Tutor?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join TutorFinder and start earning by teaching students online and in-person across Pakistan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/register")}
              className="group bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-black px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl flex items-center gap-3 justify-center">
              Join as Tutor <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <button onClick={() => navigate("/tutors")}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-10 py-5 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105 flex items-center gap-3 justify-center">
              <FaPlay size={14} /> Find a Tutor
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 text-white font-black text-2xl mb-4">
            🎓 TutorFinder
          </div>
          <p className="text-sm mb-2">2026 TutorFinder Pakistan. All rights reserved.</p>
          <p className="text-sm">Made with love in Pakistan</p>
        </div>
      </footer>
    </div>
  );
}