/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'blue-concentration': '#60A5FA',
        'purple-concentration': '#A78BFA',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
