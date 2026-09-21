/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: '#E2E8F0',
          dark: '#E2E8F0',
          card: '#FFFFFF',
          cardLight: '#F1F5F9',
          border: '#CBD5E1',
          gold: '#D97706',
          goldHover: '#B45309',
          cyan: '#0284C7',
          orange: '#EA580C',
          red: '#E11D48',
          green: '#059669',
          purple: '#7C3AED',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        exo: ['Exo', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
