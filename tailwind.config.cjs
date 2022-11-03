/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],

  theme: {
    extend: {
      height: {
        screen: ["100vh", "100dvh"],
      },

      animation: {
        spin: "spin 1s ease-out infinite",
        flash: "flash 1s ease-out",
      },
    },
  },

  plugins: [],
}
