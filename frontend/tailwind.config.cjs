/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: colors.green,
        accent: colors.amber,
        neutral: colors.slate,
        cream: colors.stone,
        surface: {
          light: colors.white,
          dark: colors.slate[900]
        }
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease both',
        'fade-in-slow': 'fadeIn 0.7s ease both',
        'slide-up': 'slideUp 0.4s ease both',
        'slide-up-slow': 'slideUp 0.6s ease both',
        'slide-in-left': 'slideInLeft 0.3s ease both',
        'scale-in': 'scaleIn 0.3s ease both',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        shimmer: 'shimmer 2.5s linear infinite'
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    }
  },
  plugins: []
};
