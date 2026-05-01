/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: '#22201f',
          100: '#070705',
          200: '#0d0d09',
          300: '#14130e',
          400: '#1a1912',
          500: '#22201f',
          600: '#28261e',
          700: '#2d2a22',
          800: '#35322a',
          900: '#403d32',
        },
        ink: {
          DEFAULT: '#cdc5b7',
          100: '#725c4a',
          200: '#8b7664',
          300: '#a09080',
          400: '#b8ae9e',
          500: '#cdc5b7',
          600: '#d8d0c5',
          700: '#e5e0d8',
          800: '#f0ede8',
          900: '#f9f8f6',
        },
        accent: {
          track: '#ffffc7',
          album: '#3aa7a3',
          ep: '#a37871',
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
