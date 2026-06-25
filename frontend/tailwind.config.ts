import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:                    '#b7122a',
        'primary-container':        '#db313f',
        'on-primary':               '#ffffff',
        'surface':                  '#fcf9f8',
        'surface-bright':           '#fcf9f8',
        'surface-dim':              '#dcd9d9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f6f3f2',
        'surface-container':        '#f0eded',
        'surface-container-high':   '#eae7e7',
        'surface-container-highest':'#e5e2e1',
        'surface-tint':             '#bb162c',
        'surface-variant':          '#e5e2e1',
        'on-surface':               '#1b1b1b',
        'on-surface-variant':       '#5b403f',
        'outline':                  '#8f6f6e',
        'outline-variant':          '#e4bebc',
        'inverse-surface':          '#313030',
        'inverse-on-surface':       '#f3f0ef',
        'error':                    '#ba1a1a',
        'error-container':          '#ffdad6',
        'secondary':                '#006c48',
        'secondary-container':      '#7cf7bc',
      },
      boxShadow: {
        resting: '0 4px 6px -1px rgba(0,0,0,0.04), 0 2px 4px -1px rgba(0,0,0,0.02)',
        raised:  '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
