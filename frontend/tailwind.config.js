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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        editorial: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      colors: {
        slate: colors.neutral,
        surface: {
          50: '#FAF9F6',
          100: '#F5F5F2',
          200: '#EFEFEB',
          300: '#E5E4DE',
          400: '#D4D2CA',
          500: '#A3A096',
        },
        obsidian: {
          DEFAULT: '#121212',
          card: '#18181B',
          muted: '#27272A',
          border: '#3F3F46',
        },
        fashion: {
          black: '#111111',
          charcoal: '#1A1A1A',
          cream: '#FAF9F6',
          sand: '#F4F3EF',
          stone: '#EFEFED',
          border: '#E8E7E3',
          darkbg: '#0D0D0E',
          darkcard: '#161618',
          darkborder: '#232326',
        },
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#18181b', // Obsidian Primary
          600: '#09090b',
          700: '#000000',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 20px 40px -8px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
