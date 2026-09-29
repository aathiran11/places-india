/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#7A1F2B",
          dark: "#5A1620",
          light: "#9A2E3B",
        },
        gold: {
          DEFAULT: "#C99A3B",
          light: "#E0BE6E",
          dark: "#A87D28",
        },
        peacock: {
          DEFAULT: "#0F6E67",
          dark: "#0B4F4A",
        },
        sandstone: {
          DEFAULT: "#F3E7D3",
          light: "#FAF3E7",
          dark: "#E6D3B0",
        },
        ink: "#2B1B12",
        marigold: "#E8862B",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        signature: ["'Yatra One'", "cursive"],
        body: ["Mukta", "sans-serif"],
      },
    },
  },
  plugins: [],
};
