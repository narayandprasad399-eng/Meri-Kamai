/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: '#0a0a0a',      // Premium Black background
        brandCard: '#171717',      // Cards ke liye thoda light black
        brandGreen: '#00ff88',     // Neon Green for buttons & highlights
        brandText: '#e5e5e5',      // Clean white text
      }
    },
  },
  plugins: [],
}