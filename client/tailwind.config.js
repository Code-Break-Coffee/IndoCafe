/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--brand-primary) / <alpha-value>)',
        secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
        background: 'rgb(var(--brand-background) / <alpha-value>)',
        surface: 'rgb(var(--brand-surface) / <alpha-value>)',
        text: 'rgb(var(--brand-text) / <alpha-value>)',
        'on-primary': 'rgb(var(--brand-on-primary) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
