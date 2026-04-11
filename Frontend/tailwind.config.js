/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'signatura-red': '#DC2626', // An aggressive crimson accent
      }
    },
  },
  plugins: [],
}