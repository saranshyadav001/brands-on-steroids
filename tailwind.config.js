/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#080808", paper: "#F8F8F8", brand: "#F82870" }, // BrandsOnSteroids palette
      fontFamily: {
        display: ["Syne", "Arial Black", "sans-serif"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        hand: ["Caveat", "cursive"],
      },
    },
  },
  plugins: [],
};
