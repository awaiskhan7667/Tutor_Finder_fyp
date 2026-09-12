import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getServerBaseURL } from "../services/api";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket,        setSocket]        = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.id) return;

    const socketURL = import.meta.env.VITE_SOCKET_URL || getServerBaseURL();
    const s = io(socketURL, {
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    // Register this user with the socket server
    s.emit("register", user.id);

    // Listen for incoming notifications
    s.on("receiveNotification", (notification) => {
      if (notification.recipient === user.id) {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        // Play sound
        playNotificationSound();
      }
    });

    return () => s.disconnect();
  }, [user?.id]);

  const playNotificationSound = () => {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 520;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const markAllRead  = () => setUnreadCount(0);
  const clearAll     = () => { setNotifications([]); setUnreadCount(0); };
  const addNotifications = (list) => {
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.isRead).length);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllRead, clearAll, addNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);