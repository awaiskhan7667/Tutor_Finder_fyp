import axios from "axios";

// Normalize baseURL so it always cleanly points to /api
export const getBaseURL = () => {
  const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const cleanUrl = rawUrl.trim().replace(/\/+$/, "");
  if (cleanUrl.endsWith("/api")) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
};

// Root server URL without /api for static assets and socket
export const getServerBaseURL = () => {
  const base = getBaseURL();
  return base.replace(/\/api\/?$/, "");
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// ── Attach token to every request automatically ──
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──
export const register = (data) => API.post("/auth/register", data);
export const login    = (data) => API.post("/auth/login", data);
export const getMe    = ()     => API.get("/auth/me");

// ── Tutors ──
export const getAllTutors      = (params)   => API.get("/tutors", { params });
export const getMyTutorProfile = ()         => API.get("/tutors/profile/me");
export const getTutor          = (id)       => API.get(`/tutors/${id}`);
export const createTutor       = (data)     => API.post("/tutors", data);
export const updateTutor       = (id, data) => API.put(`/tutors/${id}`, data);

// ── Reviews ──
export const createReview    = (data)     => API.post("/reviews", data);
export const getTutorReviews = (tutorId)  => API.get(`/reviews/tutor/${tutorId}`);
export const checkReviewed   = (bookingId)=> API.get(`/reviews/check/${bookingId}`);
export const deleteReview    = (id)       => API.delete(`/reviews/${id}`);

// ── Users ──
export const uploadAvatar   = (formData) => API.put("/users/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const getUserProfile = ()         => API.get("/users/profile");
export const updateProfile  = (data)     => API.put("/users/profile", data);

// ── Notifications ──
export const getNotifications      = ()  => API.get("/notifications");
export const markNotificationsRead = ()  => API.put("/notifications/mark-read");
export const clearNotifications    = ()  => API.delete("/notifications/clear");
export const createBooking      = (data) => API.post("/bookings", data);
export const getMyBookings      = ()     => API.get("/bookings/my");
export const getTutorBookings   = ()     => API.get("/bookings/tutor");
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const cancelBooking      = (id)   => API.put(`/bookings/${id}/cancel`);

// ── Admin ──
export const getAdminStats        = ()              => API.get("/admin/stats");
export const getAdminUsers        = (params)         => API.get("/admin/users", { params });
export const updateUserStatus     = (id, isActive)   => API.put(`/admin/users/${id}/status`, { isActive });
export const updateUserRole       = (id, role)       => API.put(`/admin/users/${id}/role`, { role });
export const deleteUser           = (id)             => API.delete(`/admin/users/${id}`);
export const getAdminTutors       = (params)         => API.get("/admin/tutors", { params });
export const setTutorApproval     = (id, isApproved) => API.put(`/admin/tutors/${id}/approval`, { isApproved });
export const deleteTutorAdmin     = (id)             => API.delete(`/admin/tutors/${id}`);
export const getAdminBookings     = (params)         => API.get("/admin/bookings", { params });
export const forceCancelBooking   = (id)             => API.put(`/admin/bookings/${id}/cancel`);
export const getAdminReviews      = ()                => API.get("/admin/reviews");
export const deleteReviewAdmin    = (id)              => API.delete(`/admin/reviews/${id}`);

export default API;