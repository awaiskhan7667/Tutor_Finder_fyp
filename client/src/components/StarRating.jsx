import { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function StarRating({ value = 0, onChange, readonly = false, size = 24 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-all duration-150 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-125"}`}
        >
          <FaStar size={size}
            className={`transition-colors duration-150 ${
              star <= (hovered || value) ? "text-yellow-400" : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}