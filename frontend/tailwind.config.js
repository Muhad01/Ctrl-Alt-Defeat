/** @type {import('tailwindcss').Config} */
// Visual language adapted from the Lindy template in /lindy: Outfit type, white and gray-50 surfaces,
// near-black primary actions, one blue accent, soft blue-tinted shadows.
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Accent (template blue #2465ED). Kept under the existing "brand" name so every page picks it up.
        brand: { 50: "#eef4ff", 100: "#dce8fe", 200: "#bed3fd", 300: "#93b4fb", 400: "#5f8df6", 500: "#3b72f0", 600: "#2465ed", 700: "#1b4fcf", 800: "#1c43a6", 900: "#1d3b83" },
        ink: { DEFAULT: "#0b0d12", soft: "#1f2430" },
      },
      fontFamily: { sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"] },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.04)",
        lift: "0 12px 32px -12px rgba(36, 101, 237, 0.18), 0 2px 6px rgba(16, 24, 40, 0.05)",
        glow: "0 4px 20px rgba(36, 101, 237, 0.18)",
      },
      keyframes: {
        fadein: { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } },
        "scroll-left": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        caret: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
      },
      animation: {
        fadein: "fadein .35s ease-out both",
        "scroll-left": "scroll-left 40s linear infinite",
        caret: "caret 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
