/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      height: {
        screen: ["100vh", "100dvh"],
      },
    },
  },
  plugins: [],
}
