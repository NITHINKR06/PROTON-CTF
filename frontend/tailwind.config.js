/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0e27',
          'bg-light': '#1a1f3a',
          green: '#a4ff00',
          'green-bright': '#c4ff00',
          amber: '#ffa500',
          'amber-bright': '#ff9500',
          red: '#ff0040',
          cyan: '#00ffff',
          purple: '#9d00ff',
          gray: '#4a5568',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        terminal: ['VT323', 'Courier New', 'monospace'],
      },
      animation: {
        flicker: 'flicker 0.15s infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        scan: 'scan 8s linear infinite',
        typing: 'typing 3.5s steps(40, end)',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          'from': { textShadow: '0 0 10px #a4ff00, 0 0 20px #a4ff00, 0 0 30px #a4ff00' },
          'to': { textShadow: '0 0 20px #a4ff00, 0 0 30px #a4ff00, 0 0 40px #a4ff00' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
