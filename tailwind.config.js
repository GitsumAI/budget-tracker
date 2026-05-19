/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark panel surfaces
        panel: {
          950: '#070B12',
          900: '#0C1220',
          800: '#111927',
          700: '#162035',
          600: '#1E2A3D',
        },
        // Brand cyan
        brand: {
          DEFAULT: '#22D3EE',
          50:  'rgba(34,211,238,0.05)',
          100: 'rgba(34,211,238,0.10)',
          200: 'rgba(34,211,238,0.20)',
          300: 'rgba(34,211,238,0.30)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34,211,238,0.15)',
        'glow-sm':   '0 0 10px rgba(34,211,238,0.10)',
        'card':      '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.06)',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500',
    'bg-teal-500','bg-blue-500','bg-purple-500','bg-pink-500',
    'bg-rose-500','bg-indigo-500','bg-emerald-500','bg-amber-500',
    'bg-lime-500','bg-cyan-500','bg-violet-500','bg-slate-500',
  ],
}
