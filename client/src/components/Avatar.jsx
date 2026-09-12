import { getServerBaseURL } from "../services/api";

// Shows user avatar or fallback initial
export default function Avatar({ user, size = "md", className = "" }) {
  const sizes = {
    sm:   "w-8  h-8  text-sm",
    md:   "w-12 h-12 text-lg",
    lg:   "w-16 h-16 text-2xl",
    xl:   "w-24 h-24 text-4xl",
    "2xl":"w-32 h-32 text-5xl",
  };

  const sizeClass = sizes[size] || sizes.md;

  if (user?.avatar) {
    const avatarSrc = user.avatar.startsWith("http")
      ? user.avatar
      : `${getServerBaseURL()}/${user.avatar.replace(/^\//, "")}`;

    return (
      <img
        src={avatarSrc}
        alt={user?.name || "User"}
        className={`${sizeClass} rounded-2xl object-cover border-2 border-white shadow-lg ${className}`}
        onError={(e) => {
          // If the image fails to load, gracefully hide it so parent or fallback is visible
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // Fallback — colorful initial
  const colors = [
    "from-blue-500   to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-green-500  to-teal-600",
    "from-orange-500 to-red-600",
    "from-yellow-500 to-orange-600",
  ];
  const color = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className={`${sizeClass} bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center font-black text-white shadow-lg border-2 border-white ${className}`}>
      {user?.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}