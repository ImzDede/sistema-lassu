const withMT = require("@material-tailwind/react/utils/withMT");

// 1. DEFINIÇÃO DAS CORES
const brandColors = [
  'brand-purple', 
  'brand-pink', 
  'brand-peach', 
  'brand-terracota',
  'brand-sessao', 
  'brand-sintese', 
  'brand-anamnese', 
  'brand-encaminhamento', 
  'brand-anotacoes', 
  'brand-paciente', 
  'brand-terapeuta'
];

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // 2. Garante classes normais e com !important (ex: !border-brand-anotacoes)
    {
      pattern: new RegExp(`^!?((bg|text|border|ring|fill|stroke)-(${brandColors.join('|')}))`),
      variants: ['hover', 'focus', 'focus-within', 'group-hover', 'active', 'disabled'],
    },
    // 3. Garante classes com opacidade (ex: bg-brand-anotacoes/20)
    {
      pattern: new RegExp(`^!?((bg|text|border|ring)-(${brandColors.join('|')})/(5|10|20|30|50|70|90))`),
      variants: ['hover', 'focus', 'focus-within', 'group-hover', 'active', 'disabled'],
    }
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
        brand: {
          // --- Cores Base ---
          purple: "#A78FBF", 
          pink:   "#D9A3B6", 
          peach:  "#F2B694", 
          terracota: "#F2A9A2",
          
          dark: "#5D4E6D",
          bg: "#FAF9FC",
          surface: "#FFFFFF",

          // --- Cores Específicas ---
          sessao: "#6D538B", 
          sintese: "#F2B694", 
          anamnese: "#F2A9A2", 
          encaminhamento: "#D9A3B6", 
          anotacoes: "#71787E", 
          paciente: "#C2A598", 
          terapeuta: "#A78FBF", 
        },
        feedback: {
          error: { bg: "#FDE8E8", text: "#C04D4D", main: "#F2A9A2" },
          success: { bg: "#E8FDF0", text: "#2E7D48", main: "#81C784" },
          warning: { bg: "#FFF8E1", text: "#B67B0F", main: "#FFD54F" },
          info: { bg: "#E3F2FD", text: "#1565C0", main: "#64B5F6" }
        }
      },
      backgroundImage: {
        'brand-gradient': "linear-gradient(135deg, #A78FBF 0%, #D9A3B6 50%, #F2B694 100%)",
      }
    },
  },
  plugins: [],
});