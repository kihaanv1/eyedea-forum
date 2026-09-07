/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forum: {
          bg: '#0c0f17',
          card: '#131826',
          'card-hover': '#1a2236',
          border: '#232d45',
          'border-light': '#313e60',
          accent: '#6366f1',
          'accent-glow': '#4f46e5',
          gold: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          text: '#f1f5f9',
          muted: '#94a3b8',
          subtle: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
