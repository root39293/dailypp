/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'osu-pink': '#FF66AB',
        'osu-purple': '#8E44AD',
        dark: {
          100: '#2D2D2D',
          200: '#252525',
          300: '#1E1E1E'
        }
      }
    },
  },
  plugins: [],
}

