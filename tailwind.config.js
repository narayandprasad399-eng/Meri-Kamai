/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#ff6b00',
        accent2: '#ff9500',
        cyan: '#00d4ff',
        success: '#00ff88',
      },
      fontFamily: {
        teko: ['Teko', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
