import { useState } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { createReview } from "../services/api";
import StarRating from "./StarRating";
import Avatar from "./Avatar";

const LABELS = { 1:"Poor", 2:"Fair", 3:"Good", 4:"Very Good", 5:"Excellent" };

export default function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating)         { setError("Please select a star rating!"); return; }
    if (!comment.trim()) { setError("Please write a comment!");       return; }
    setLoading(true);
    setError("");
    try {
      await createReview({ bookingId: booking._id, rating, comment });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-card-in">
        <div className="p-7">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-gray-800">Write a Review</h3>
              <p className="text-gray-500 text-sm mt-0.5">Share your experience</p>
            </div>
            <button onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-red-100 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all duration-300">
              <FaTimes />
            </button>
          </div>

          {/* Tutor info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 mb-6">
            <Avatar user={booking?.tutor?.user} size="md" />
            <div>
              <p className="font-black text-gray-800">{booking?.tutor?.user?.name || "Tutor"}</p>
              <p className="text-blue-600 text-sm font-medium">{booking?.subject}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Star rating */}
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-gray-700 mb-3">How was your session?</p>
              <StarRating value={rating} onChange={setRating} size={36} />
              {rating > 0 && (
                <p className="mt-2 text-sm font-bold text-yellow-500 animate-fade-in">
                  {LABELS[rating]}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Your Comment</label>
              <textarea rows={4} value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience with this tutor..."
                maxLength={500}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none" />
              <p className="text-right text-xs text-gray-400 mt-1">{comment.length}/500</p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm font-medium mb-4 animate-fade-in bg-red-50 px-4 py-2 rounded-xl">
                ⚠️ {error}
              </p>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                : <><FaStar /> Submit Review</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}