/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        // School palette (semantic tokens)
        // - primary: green
        // - accent: gold
        // - neutral: black/gray
        // - cream: warm light surface
        primary: colors.green,
        accent: colors.amber,
        neutral: colors.slate,
        cream: colors.stone,

        // Convenience aliases for UI surfaces
        surface: {
          light: colors.white,
          dark: colors.slate[900]
        }
      }
    }
  },
  plugins: []
};
