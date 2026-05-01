/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        app: {
          deep:           'rgb(var(--app-deep) / <alpha-value>)',
          base:           'rgb(var(--app-base) / <alpha-value>)',
          surface:        'rgb(var(--app-surface) / <alpha-value>)',
          border:         'rgb(var(--app-border) / <alpha-value>)',
          high:           'rgb(var(--app-high) / <alpha-value>)',
          mid:            'rgb(var(--app-mid) / <alpha-value>)',
          low:            'rgb(var(--app-low) / <alpha-value>)',
          accent:         'rgb(var(--app-accent) / <alpha-value>)',
          'accent-hover': 'rgb(var(--app-accent-hover) / <alpha-value>)',
          'accent-dim':   'rgb(var(--app-accent-dim) / <alpha-value>)',
          'on-accent':    'rgb(var(--app-on-accent) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
