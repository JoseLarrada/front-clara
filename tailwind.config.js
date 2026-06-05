/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1BA0F2',
          cyan: '#22CCF2',
          green: '#2ABF5E',
          lime: '#A7F272',
          gray: '#F2F2F2',
          navy: '#0F2942',
        }
      },
      fontFamily: {
        heading: ['Fira Code', 'monospace'],
        body: ['Fira Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
