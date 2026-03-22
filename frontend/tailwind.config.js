/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blush:    { DEFAULT: '#FADADD', light: '#FFF0F2', dark: '#F5B8BF' },
        lavender: { DEFAULT: '#E6DEFF', light: '#F3EEFF', dark: '#C9B8F5' },
        mint:     { DEFAULT: '#D4F5E9', light: '#EDFFF7', dark: '#A8E8CE' },
        sky:      { DEFAULT: '#D6EEFF', light: '#EBF5FF', dark: '#A8CFEE' },
        peach:    { DEFAULT: '#FFE5D0', light: '#FFF4EC', dark: '#FFCCAA' },
        butter:   { DEFAULT: '#FFF3CD', light: '#FFFAED', dark: '#FFE690' },
        rose:     { DEFAULT: '#FF8FAB', light: '#FFB3C6', dark: '#E5637A' },
        text: {
          primary: '#3D2C2C',
          muted:   '#7A6060',
          light:   '#B09090',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft:  '0 2px 20px 0 rgba(180,140,140,0.10)',
        card:  '0 4px 32px 0 rgba(180,140,140,0.13)',
        float: '0 8px 40px 0 rgba(180,140,140,0.18)',
      },
    },
  },
  plugins: [],
}
