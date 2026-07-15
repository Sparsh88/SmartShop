import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        slate: colors.neutral, // Automatically remaps all slate-X classes to neutral-X (charcoal)
        primary: {
          50: '#f5f3ff',
          100: '#eedeff',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          505: '#8b5cf6', // Indigo
          500: '#6366f1', // Main Primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        darkbg: {
          50: '#1e293b',
          100: '#0f172a',
          200: '#020617', // Deep pitch black
        }
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}
