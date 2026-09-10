import { useState, useRef } from "react";
import { FaCamera, FaSpinner, FaCheck } from "react-icons/fa";
import { uploadAvatar } from "../services/api";
import Avatar from "./Avatar";

export default function AvatarUpload({ user, onUpdate }) {
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState({ text:"", type:"" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate
    if (!["image/jpeg","image/jpg","image/png","image/webp"].includes(file.type)) {
      setMessage({ text:"❌ Only JPG, PNG, WEBP allowed!", type:"error" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text:"❌ Max file size is 2MB!", type:"error" });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    setMessage({ text:"", type:"" });
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await uploadAvatar(formData);

      // Update localStorage user
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.avatar = res.data.avatar;
      localStorage.setItem("user", JSON.stringify(stored));

      setMessage({ text:"✅ Profile picture updated!", type:"success" });
      if (onUpdate) onUpdate(res.data.avatar);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "❌ Upload failed", type:"error" });
      setPreview(null);
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Avatar preview */}
      <div className="relative group">
        {preview ? (
          <img src={preview} alt="preview"
            className="w-28 h-28 rounded-3xl object-cover border-4 border-blue-100 shadow-xl" />
        ) : (
          <Avatar user={user} size="2xl" />
        )}

        {/* Camera overlay */}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 text-white"
        >
          <FaCamera size={20} />
          <span className="text-xs font-bold">Change</span>
        </button>

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
            <FaSpinner className="text-white animate-spin" size={24} />
          </div>
        )}

        {/* Success checkmark */}
        {message.type === "success" && !loading && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white animate-card-in">
            <FaCheck size={12} className="text-white" />
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl px-6 py-4 text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <FaCamera className="mx-auto text-gray-400 mb-2" size={20} />
        <p className="text-sm font-bold text-gray-600">
          {dragging ? "Drop it here!" : "Click or drag photo here"}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 2MB</p>
      </div>

      {/* Message */}
      {message.text && (
        <p className={`text-sm font-medium animate-fade-in ${
          message.type === "success" ? "text-green-600" : "text-red-500"
        }`}>
          {message.text}
        </p>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}