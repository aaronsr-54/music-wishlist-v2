/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: 'var(--color-bone)',
          100: 'var(--color-bone-100)',
          200: 'var(--color-bone-200)',
          300: 'var(--color-bone-300)',
          400: 'var(--color-bone-400)',
          500: 'var(--color-bone-500)',
          600: 'var(--color-bone-600)',
          700: 'var(--color-bone-700)',
          800: 'var(--color-bone-800)',
          900: 'var(--color-bone-900)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          100: 'var(--color-ink-100)',
          200: 'var(--color-ink-200)',
          300: 'var(--color-ink-300)',
          400: 'var(--color-ink-400)',
          500: 'var(--color-ink-500)',
          600: 'var(--color-ink-600)',
          700: 'var(--color-ink-700)',
          800: 'var(--color-ink-800)',
          900: 'var(--color-ink-900)',
        },
        accent: {
          track: 'var(--color-accent-track)',
          album: 'var(--color-accent-album)',
          ep: 'var(--color-accent-ep)',
        },
      },
      fontFamily: {
        display: '"Satoshi", sans-serif',
        body: '"Inter", sans-serif',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        pill: '999px',
        card: '12px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '160ms',
        'base': '240ms',
        'slow': '480ms',
      },
      screens: {
        'md': '768px',
      },
    },
  },
  plugins: [],
};
