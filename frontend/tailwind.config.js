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
          purple: "#A78FBF", // Primária (Roxo Suave)
          pink: "#D9A3B6",   // Secundária (Rosa)
          peach: "#F2B694",  // Acento (Pêssego)
          dark: "#5D4E6D",   // Texto Escuro
          bg: "#FAF9FC",     // Fundo da tela
          surface: "#FFFFFF", // Fundo dos Cards
        },
        // Sistema de Feedback (Cores Pastéis + Texto Forte)
        feedback: {
          error: {
            bg: "#FDE8E8",   // Fundo Pastel
            text: "#C04D4D", // Texto Legível
            main: "#F2A9A2"  // Cor original (botões de deletar)
          },
          success: {
            bg: "#E8FDF0",
            text: "#2E7D48",
            main: "#81C784"
          },
          warning: {
            bg: "#FFF8E1",
            text: "#B67B0F",
            main: "#FFD54F"
          },
          info: {
            bg: "#E3F2FD",
            text: "#1565C0",
            main: "#64B5F6"
          }
        }
      },
      backgroundImage: {
        // Gradiente LASSU
        'brand-gradient': "linear-gradient(135deg, #A78FBF 0%, #D9A3B6 50%, #F2B694 100%)",
      }
    },
  },
  plugins: [],
});