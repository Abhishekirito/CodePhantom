/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Courier New"', 'Courier', 'monospace'], 
      },
      colors: {
        'game-bg': '#4da6ff',     // Sky blue
        'game-ground': '#4d804d', // Grass green
        'panel-bg': '#fbf8e6',    // Creamy panel color
      },
    },
  },
  plugins: [],
}