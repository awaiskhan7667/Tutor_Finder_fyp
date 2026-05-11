/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in":      "fadeIn 1s ease forwards",
        "slide-up":     "slideUp 0.8s ease forwards",
        "slide-left":   "slideLeft 0.8s ease forwards",
        "slide-right":  "slideRight 0.8s ease forwards",
        "float":        "float 4s ease-in-out infinite",
        "float-slow":   "float 6s ease-in-out infinite",
        "glow":         "glow 2s ease-in-out infinite",
        "shimmer":      "shimmer 2s linear infinite",
        "spin-slow":    "spin 8s linear infinite",
        "pulse-slow":   "pulse 4s ease-in-out infinite",
        "bounce-slow":  "bounce 3s infinite",
        "gradient":     "gradient 6s ease infinite",
        "count-up":     "countUp 2s ease forwards",
        "card-in":      "cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(60px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(60px)" },
          "100%": { opacity: "1", transform: "translateX(0)"    },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-60px)" },
          "100%": { opacity: "1", transform: "translateX(0)"     },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)"   },
          "50%":     { transform: "translateY(-20px)" },
        },
        glow: {
          "0%,100%": { boxShadow: "0 0 20px rgba(99,102,241,0.4)" },
          "50%":     { boxShadow: "0 0 60px rgba(99,102,241,0.8)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0"  },
        },
        gradient: {
          "0%,100%": { backgroundPosition: "0% 50%"   },
          "50%":     { backgroundPosition: "100% 50%" },
        },
        cardIn: {
          "0%":   { opacity: "0", transform: "scale(0.8) translateY(40px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)"      },
        },
      },
      backgroundSize: {
        "300%": "300%",
      },
    },
  },
  plugins: [],
}