import { useState } from "react";
import { FaVideo, FaTimes, FaExpand, FaCompress } from "react-icons/fa";

export default function VideoClass({ bookingId, subject, otherPersonName, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);

  // Unique room name based on bookingId
  const roomName = `tutorfinder-${bookingId}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(otherPersonName)}"`;

  return (
    <div className={`fixed z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-fade-in
      ${fullscreen ? "inset-0" : "inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[700px] md:h-[500px] md:rounded-3xl overflow-hidden"}`}>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
            <FaVideo size={14} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">{subject} Session</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <p className="text-green-400 text-xs font-medium">Live with {otherPersonName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all duration-200"
          >
            {fullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all duration-200"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full rounded-2xl border-0"
        title="Video Class"
      />
    </div>
  );
}