/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        app: {
          deep:           '#0E0D0B',
          base:           '#1A1C20',
          surface:        '#252421',
          border:         '#353230',
          high:           '#F0EDE6',
          mid:            '#9E9A94',
          low:            '#5C5956',
          accent:         '#E8982A',
          'accent-hover': '#F0A840',
          'accent-dim':   '#C97C0E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
