const colors = require("tailwindcss/colors")

/**
 * @returns {import("tailwindcss").Config}
 */
function config() {
  const basicColors = {
    transparent: colors.transparent,
    current: colors.current,
    black: colors.black,
    white: colors.white,
  }

  const colorAliases = {
    background: ibmPalette.gray[900],
    foreground: colors.white,
  }

  return {
    content: ["./src/**/*.{ts,tsx}"],

    theme: {
      colors: {
        ...basicColors,
        ...ibmPalette,
        ...colorAliases,
      },

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
}

/**
 * @see https://tailwind.ink/
 */
const ibmPalette = {
  vermilion: {
    50: "#fff1f1",
    100: "#ffd7d9",
    200: "#ffb3b8",
    300: "#ff8389",
    400: "#fa4d56",
    500: "#da1e28",
    600: "#a2191f",
    700: "#750e13",
    800: "#520408",
    900: "#2d0709",
  },
  cerise: {
    50: "#fff0f7",
    100: "#ffd6e8",
    200: "#ffafd2",
    300: "#ff7eb6",
    400: "#ee5396",
    500: "#d02670",
    600: "#9f1853",
    700: "#740937",
    800: "#510224",
    900: "#2a0a18",
  },
  purple: {
    50: "#f6f2ff",
    100: "#e8daff",
    200: "#d4bbff",
    300: "#be95ff",
    400: "#a56eff",
    500: "#8a3ffc",
    600: "#6929c4",
    700: "#491d8b",
    800: "#31135e",
    900: "#1c0f30",
  },
  azure: {
    50: "#edf5ff",
    100: "#d0e2ff",
    200: "#a6c8ff",
    300: "#78a9ff",
    400: "#4589ff",
    500: "#0f62fe",
    600: "#0043ce",
    700: "#002d9c",
    800: "#001d6c",
    900: "#001141",
  },
  cerulean: {
    50: "#e5f6ff",
    100: "#bae6ff",
    200: "#82cfff",
    300: "#33b1ff",
    400: "#1192e8",
    500: "#0072c3",
    600: "#00539a",
    700: "#003a6d",
    800: "#012749",
    900: "#061727",
  },
  submarine: {
    50: "#d9fbfb",
    100: "#9ef0f0",
    200: "#3ddbd9",
    300: "#08bdba",
    400: "#009d9a",
    500: "#007d79",
    600: "#005d5d",
    700: "#004144",
    800: "#022b30",
    900: "#081a1c",
  },
  green: {
    50: "#defbe6",
    100: "#a7f0ba",
    200: "#6fdc8c",
    300: "#42be65",
    400: "#24a148",
    500: "#198038",
    600: "#0e6027",
    700: "#044317",
    800: "#022d0d",
    900: "#071908",
  },
  gray: {
    50: "#f2f4f8",
    100: "#dde1e6",
    200: "#c1c7cd",
    300: "#a2a9b0",
    400: "#878d96",
    500: "#697077",
    600: "#4d5358",
    700: "#343a3f",
    800: "#21272a",
    900: "#121619",
  },
}

module.exports = config()
