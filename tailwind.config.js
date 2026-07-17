/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        paste: {
          bg: 'rgba(30, 30, 34, 0.72)',
          card: 'rgba(255, 255, 255, 0.06)',
          cardActive: 'rgba(255, 255, 255, 0.14)',
          border: 'rgba(255, 255, 255, 0.12)'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.25)'
      }
    }
  },
  plugins: []
}
