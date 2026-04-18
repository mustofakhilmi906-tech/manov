/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1a1a2e', light: '#2d2d44', muted: '#4a4a6a' },
        parchment: { DEFAULT: '#faf8f3', dark: '#f0ece0' },
        teal: { DEFAULT: '#0d7377', light: '#14a085', pale: '#e8f5f4' },
        amber: { DEFAULT: '#c8923a', light: '#e8b060', pale: '#fdf3e3' },
      },
    },
  },
  plugins: [],
};
