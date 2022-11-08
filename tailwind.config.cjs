const colors = require("tailwindcss/colors")

/**
 * @returns {import("tailwindcss").Config}
 */
function config() {
  const basicColors = {
    inherit: colors.inherit,
    current: colors.current,
    transparent: colors.transparent,
    black: colors.black,
    white: colors.white,
    neutral: colors.neutral,
  }

  const colorAliases = {
    light: colors.white,
    dark: colors.black,
  }

  return {
    content: ["./src/**/*.{ts,tsx}"],

    theme: {
      colors: {
        ...basicColors,
        ...tailwindNewRevisedPalette,
        ...colorAliases,
      },

      extend: {
        height: {
          screen: ["100vh", "100dvh"],
        },

        boxShadow: {
          screen: "0 0 0 100vmax rgb(0 0 0 / 0.1)",
        },

        animation: {
          spin: "spin 1s ease-out infinite",
          flash: "flash 1s ease-out",
        },

        keyframes: {
          flash: {
            from: {
              backgroundColor: colors.current,
            },
          },
        },
      },
    },

    plugins: [require("@tailwindcss/typography")],
  }
}

/**
 * @see https://tailwind.ink?p=10.f9fafbf0f1f3d9dbdfb7bbc28f959f6e7582555e6e3e4859283242131f30fff6f6ffefeff9d3d3eaa6a6e56d6dd93c3ebd0e0f930705680605470201fff8f1fbecdff6d7bfe5ad8bd67a4ac4540b9c43037137074a27022c1b01fdfdeafdf6bef5e27bd9bd2fb6930d967100805501643e02422a00271a00f3faf7daf5ebb6e5d385c8ac3ca773108835016d00005301003906072408edfafad5f5f6aae7ea69c8ce13a2ad0d828d05687406505c04374401222ff4faffe2f0ffc4defe95bbee5e95e42173e61358cc1242a21a2e6c161d38f5f8ffe5edffccdafca5b8e97c91e15c69e94a46e13a31b9282284191452faf9fff1effedcd7fcbcb2f29e86e5895ddb8335c86620a948147b2f0d4dfff5fbfdeaf5fbd2e9e9a7ccde6ea8d53485b9026390084c5e1734301820
 */
const tailwindNewRevisedPalette = {
  gray: {
    50: "#f9fafb",
    100: "#f0f1f3",
    200: "#d9dbdf",
    300: "#b7bbc2",
    400: "#8f959f",
    500: "#6e7582",
    600: "#555e6e",
    700: "#3e4859",
    800: "#283242",
    900: "#131f30",
  },
  cerise: {
    50: "#fff6f6",
    100: "#ffefef",
    200: "#f9d3d3",
    300: "#eaa6a6",
    400: "#e56d6d",
    500: "#d93c3e",
    600: "#bd0e0f",
    700: "#930705",
    800: "#680605",
    900: "#470201",
  },
  orange: {
    50: "#fff8f1",
    100: "#fbecdf",
    200: "#f6d7bf",
    300: "#e5ad8b",
    400: "#d67a4a",
    500: "#c4540b",
    600: "#9c4303",
    700: "#713707",
    800: "#4a2702",
    900: "#2c1b01",
  },
  lemon: {
    50: "#fdfdea",
    100: "#fdf6be",
    200: "#f5e27b",
    300: "#d9bd2f",
    400: "#b6930d",
    500: "#967100",
    600: "#805501",
    700: "#643e02",
    800: "#422a00",
    900: "#271a00",
  },
  green: {
    50: "#f3faf7",
    100: "#daf5eb",
    200: "#b6e5d3",
    300: "#85c8ac",
    400: "#3ca773",
    500: "#108835",
    600: "#016d00",
    700: "#005301",
    800: "#003906",
    900: "#072408",
  },
  leaf: {
    50: "#edfafa",
    100: "#d5f5f6",
    200: "#aae7ea",
    300: "#69c8ce",
    400: "#13a2ad",
    500: "#0d828d",
    600: "#056874",
    700: "#06505c",
    800: "#043744",
    900: "#01222f",
  },
  azure: {
    50: "#f4faff",
    100: "#e2f0ff",
    200: "#c4defe",
    300: "#95bbee",
    400: "#5e95e4",
    500: "#2173e6",
    600: "#1358cc",
    700: "#1242a2",
    800: "#1a2e6c",
    900: "#161d38",
  },
  blue: {
    50: "#f5f8ff",
    100: "#e5edff",
    200: "#ccdafc",
    300: "#a5b8e9",
    400: "#7c91e1",
    500: "#5c69e9",
    600: "#4a46e1",
    700: "#3a31b9",
    800: "#282284",
    900: "#191452",
  },
  indigo: {
    50: "#faf9ff",
    100: "#f1effe",
    200: "#dcd7fc",
    300: "#bcb2f2",
    400: "#9e86e5",
    500: "#895ddb",
    600: "#8335c8",
    700: "#6620a9",
    800: "#48147b",
    900: "#2f0d4d",
  },
  cerise: {
    50: "#fff5fb",
    100: "#fdeaf5",
    200: "#fbd2e9",
    300: "#e9a7cc",
    400: "#de6ea8",
    500: "#d53485",
    600: "#b90263",
    700: "#90084c",
    800: "#5e1734",
    900: "#301820",
  },
}

module.exports = config()
