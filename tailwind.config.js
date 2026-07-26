/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#07090e',
          card: 'rgba(15, 23, 42, 0.7)',
          border: 'rgba(30, 41, 59, 0.8)',
          cyan: '#00f0ff',
          purple: '#a855f7',
          pink: '#ec4899',
          green: '#10b981',
          red: '#f43f5e',
          yellow: '#eab308',
          blue: '#3b82f6',
        }
      },
      animation: {
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flashGreen 0.6s ease-out 1',
        'flash-red': 'flashRed 0.6s ease-out 1',
        'scan-line': 'scanLine 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)' },
          '50%': { opacity: 0.6, boxShadow: '0 0 5px rgba(0, 240, 255, 0.1)' },
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: '#10b981' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(244, 63, 94, 0.4)', borderColor: '#f43f5e' },
          '100%': { backgroundColor: 'transparent' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
