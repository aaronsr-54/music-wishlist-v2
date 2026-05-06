/** @type {import('tailwindcss').Config} */
const accentLight = {
  track: '#cea219',
  album: '#0891b2',
  ep: '#b40909',
  artist: '#674c29',
};

const accentDark = {
  track: '#ffffc7',
  album: '#3aa7a3',
  ep: '#9f4d40',
  artist: '#D1B490',
};

const accentTypes = ['track', 'album', 'ep', 'artist'];

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  safelist: [
    ...accentTypes.flatMap((t) => [
      `group-hover:text-accent-${t}`,
      `group-hover:opacity-80`,
      `!text-accent-${t}`,
      `dark:group-hover:text-accent-dark-${t}`,
      `dark:!text-accent-dark-${t}`,
    ]),
  ],
  theme: {
    extend: {
      colors: {
        light: '#f9f9f9',
        dark: '#0e0e0e',
        bone: {
          DEFAULT: '#cdc5b7',
          100: '#f9f8f6',
          200: '#f0ede8',
          300: '#e5e0d8',
          400: '#d8d0c5',
          500: '#cdc5b7',
          600: '#b8ae9e',
          700: '#a09080',
          800: '#8b7664',
          900: '#725c4a',
        },
        ink: {
          DEFAULT: '#22201f',
          100: '#403d32',
          200: '#35322a',
          300: '#2d2a22',
          400: '#28261e',
          500: '#22201f',
          600: '#1a1912',
          700: '#14130e',
          800: '#0d0d09',
          900: '#070705',
        },
        accent: accentLight,
        'accent-dark': accentDark,
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
  accentLight,
  accentDark,
  plugins: [],
};
