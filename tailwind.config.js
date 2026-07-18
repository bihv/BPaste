/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        paste: {
          bg: 'rgba(242, 244, 247, 1)',
          card: 'rgba(255, 255, 255, 0.9)',
          cardActive: 'rgba(255, 255, 255, 1)',
          border: 'rgba(0, 0, 0, 0.08)',
          cardShadow: 'rgba(0, 0, 0, 0.06)',
          headerBg: 'rgba(255, 255, 255, 0.7)',
          headerBorder: 'rgba(0, 0, 0, 0.06)',
        },
        accent: {
          blue: 'rgba(0, 122, 255, 1)',
          pink: 'rgba(255, 96, 144, 1)',
          purple: 'rgba(146, 109, 255, 1)',
          green: 'rgba(48, 209, 88, 1)',
          orange: 'rgba(255, 149, 0, 1)',
          yellow: 'rgba(255, 204, 0, 1)',
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
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
        cardActive: '0 0 0 2px rgba(0, 122, 255, 0.5), 0 4px 16px rgba(0, 0, 0, 0.12)'
      }
    }
  },
  plugins: []
}
