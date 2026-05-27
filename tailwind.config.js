/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#0f172a",
        mist: "#f7f8fb",
        library: {
          emerald: "#16a34a",
          cyan: "#0891b2",
          coral: "#f97316",
          rose: "#e11d48",
          violet: "#7c3aed",
          graphite: "#1f2937",
        },
      },
      boxShadow: {
        glass: "0 18px 45px rgba(15, 23, 42, 0.11)",
        lift: "0 10px 30px rgba(15, 23, 42, 0.14)",
      },
      backgroundImage: {
        "surface-light":
          "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(246,248,251,0.78))",
        "surface-dark":
          "linear-gradient(135deg, rgba(30,41,59,0.86), rgba(17,24,39,0.78))",
        "premium-line":
          "linear-gradient(90deg, #0891b2, #16a34a, #f97316, #e11d48)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
