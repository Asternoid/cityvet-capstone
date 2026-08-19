/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./main.jsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal-deep': '#1B5E5C',
        'teal-mid': '#2A7A78',
        'green-forest': '#2E7D4F',
        'green-light': '#E8F5EE',
        'amber-warm': '#E0A438',
        'amber-light': '#FDF3DC',
        'off-white': '#F7F7F5',
        'charcoal': '#2B2B2B',
        'gray-light': '#D9D9D9',
        'gray-mid': '#6B7280',
        'red-muted': '#C0392B',
        'red-light': '#FDECEA',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        badge: '6px',
        btn: '8px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.08)',
        modal: '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
};