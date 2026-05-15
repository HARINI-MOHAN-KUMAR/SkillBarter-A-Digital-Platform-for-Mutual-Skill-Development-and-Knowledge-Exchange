/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f5f1e8',
        'paper-dim': '#ede9de',
        ink: '#0f0e0c',
        accent: '#c84b2f',
        teal: '#1a7a62',
        gold: '#b8890a',
        muted: '#6b6660',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(15,14,12,0.08)',
        'card-hover': '0 8px 24px rgba(15,14,12,0.14)',
        glow: '0 0 20px rgba(200,75,47,0.2)',
      },
      backgroundImage: {
        'xp-gradient': 'linear-gradient(90deg, #1a7a62, #b8890a)',
      },
    },
  },
  plugins: [],
}
