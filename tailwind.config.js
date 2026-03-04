/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        loading: {
          '0%': { textShadow: '0 0 0 #C0C0C0', color: '#C0C0C0' }, //C0C0C0, 17314d
          '100%': { textShadow: '20px 0 70px #3498db', color: '#3498db' }, //#3498db, ff0266
        },
      },
      animation: {
        loading: 'loading 1s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}

