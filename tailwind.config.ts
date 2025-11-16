import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm wood-tone theme
        wood: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8ddd0',
          300: '#d4c4a8',
          400: '#b8a082',
          500: '#9d7f5f',
          600: '#8a6b4f',
          700: '#725842',
          800: '#5f4938',
          900: '#4f3d30',
        },
        accent: {
          light: '#d4a574',
          DEFAULT: '#c49464',
          dark: '#a67c52',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'wood-texture': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect fill='%23d4c4a8' width='100' height='100'/%3E%3Cpath d='M0 50 Q25 40, 50 50 T100 50' stroke='%23b8a082' stroke-width='1' fill='none' opacity='0.3'/%3E%3Cpath d='M0 30 Q25 20, 50 30 T100 30' stroke='%23b8a082' stroke-width='1' fill='none' opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23wood)' width='100' height='100'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;

