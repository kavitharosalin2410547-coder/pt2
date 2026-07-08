import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8f9fe',
          3: '#f1f3fb',
        },
        ink: {
          DEFAULT: '#0f0f1b',
          2: '#1e1e30',
          3: '#2a2a42',
        },
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
        card: '0 0 0 1px rgb(15 15 27 / 0.06), 0 2px 6px -1px rgb(15 15 27 / 0.08)',
        'card-hover': '0 4px 24px -6px rgb(79 70 229 / 0.25), 0 0 0 1px rgb(79 70 229 / 0.12)',
        glow: '0 0 0 1px rgb(99 102 241 / 0.2), 0 4px 20px -4px rgb(99 102 241 / 0.35)',
        'inner-light': 'inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #4338ca 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 65%, #6366f1 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0f0f1b 0%, #0d0d17 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
