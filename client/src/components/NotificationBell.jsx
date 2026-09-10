import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheck, FaTrash } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import * as api from "../services/api";

const TYPE_COLORS = {
  booking_request:   "bg-blue-100   text-blue-600",
  booking_accepted:  "bg-green-100  text-green-600",
  booking_rejected:  "bg-red-100    text-red-500",
  booking_cancelled: "bg-orange-100 text-orange-500",
  booking_completed: "bg-purple-100 text-purple-600",
  general:           "bg-gray-100   text-gray-600",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearAll, addNotifications } = useSocket();
  const ref      = useRef(null);
  const navigate = useNavigate();

  // Load notifications from DB on mount
  useEffect(() => {
    api.getNotifications().then((res) => {
      addNotifications(res.data.notifications);
    }).catch(() => {});
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async () => {
    await api.markNotificationsRead().catch(() => {});
    markAllRead();
  };

  const handleClear = async () => {
    await api.clearNotifications().catch(() => {});
    clearAll();
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all duration-200 group"
      >
        <FaBell
          size={18}
          className={`transition-all duration-300 ${unreadCount > 0 ? "text-blue-600 animate-bounce-slow" : "text-gray-500 group-hover:text-blue-600"}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-card-in">

          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-black text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-blue-600 font-medium">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkRead} title="Mark all read"
                  className="w-8 h-8 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200">
                  <FaCheck size={12} />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClear} title="Clear all"
                  className="w-8 h-8 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200">
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl block mb-3">🔔</span>
                <p className="text-gray-400 font-medium text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n._id || i}
                  className={`px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${!n.isRead ? "bg-blue-50/50" : ""}`}
                  onClick={() => {
                    setOpen(false);
                    navigate(n.type?.includes("tutor") ? "/dashboard/tutor" : "/dashboard/student");
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${TYPE_COLORS[n.type] || "bg-gray-100 text-gray-600"}`}>
                      {n.type === "booking_request"   && "📅"}
                      {n.type === "booking_accepted"  && "✅"}
                      {n.type === "booking_rejected"  && "❌"}
                      {n.type === "booking_cancelled" && "🚫"}
                      {n.type === "booking_completed" && "🎓"}
                      {n.type === "general"           && "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm leading-tight">{n.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}