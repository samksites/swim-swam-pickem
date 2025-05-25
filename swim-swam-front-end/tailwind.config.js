/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust if your source folder is different
  ],
  theme: {
    extend: {
      colors: {
        'background-white': '#FFFBF6',
      },
    },
  },
  plugins: [],
}