export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f3fff8',
          100: '#dffef0',
          200: '#b9f3d9',
          300: '#86e5b5',
          400: '#4ecb8c',
          500: '#1fbf73',
          600: '#149d5f',
          700: '#0d7d4d',
          800: '#095f3d',
          900: '#063f2a',
        },
      },
      boxShadow: {
        soft: '0 18px 38px rgba(19, 88, 61, 0.12)',
      },
    },
  },
  plugins: [],
};
