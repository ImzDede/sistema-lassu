const withMT = require("@material-tailwind/react/utils/withMT");

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
        brand: {
          purple: "#A78FBF", // Primária
          pink: "#D9A3B6",   // Secundária
          peach: "#F2B694",  // Acento
          error: "#F2A9A2",  // Erro/Deletar
          dark: "#5D4E6D",   // Texto Escuro
          bg: "#FAF9FC",     // Fundo da tela
          surface: "#FFFFFF" // Fundo dos Cards
        }
      }
    },
  },
  plugins: [],
});