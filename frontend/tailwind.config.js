/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#eef4ff", 100: "#dbe7fe", 200: "#bfd3fe", 500: "#3b6ef5", 600: "#2754e0", 700: "#1f43b5", 900: "#172a63" },
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"] },
      keyframes: { fadein: { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } } },
      animation: { fadein: "fadein .35s ease-out both" },
    },
  },
  plugins: [],
};
