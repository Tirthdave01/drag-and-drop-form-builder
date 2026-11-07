/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a3bbfb',
          400: '#7295f7',
          500: '#4f6cf1',
          600: '#384ee4',
          700: '#2b39c6',
          800: '#2731a0',
          900: '#252e7e',
          950: '#161a49',
        }
      }
    },
  },
  plugins: [],
}
