"use client";

import { usePathname } from "next/navigation";

// Todas as chaves de cor disponíveis no seu tailwind.config
export type ThemeColor = 
  | "purple" | "pink" | "peach" | "terracota" 
  | "sessao" | "sintese" | "anamnese" | "encaminhamento" | "anotacoes" | "paciente" | "terapeuta";

interface ThemeProps {
  color: ThemeColor;
  bgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
  lightBgClass: string;
  hoverTextClass: string;
}

export function useAppTheme(): ThemeProps {
  const pathname = usePathname() || "";

  let theme: ThemeColor = "purple"; // Default (Home)

  // 1. Verificações Específicas de Cadastro (Prioridade Alta)
  if (pathname.includes("/cadastro/sessoes") || pathname.includes("/sessoes/")) {
    theme = "sessao";
  } else if (pathname.includes("/cadastro/sintese")) {
    theme = "sintese";
  } else if (pathname.includes("/cadastro/anamnese")) {
    theme = "anamnese";
  } else if (pathname.includes("/cadastro/encaminhamento")) {
    theme = "encaminhamento";
  } else if (pathname.includes("/cadastro/anotacoes")) {
    theme = "anotacoes";
  } else if (pathname.includes("/cadastro/paciente")) {
    theme = "paciente";
  } else if (pathname.includes("/cadastro/extensionista")) {
    theme = "terapeuta";
  
  // 2. Verificações de Rotas Gerais (Prioridade Média)
  } else if (pathname.includes("/pacientes") || pathname.includes("/terapeutas")) {
    theme = "pink";
  } else if (pathname.includes("/perfil")) {
    theme = "peach";
  } else if (pathname.includes("/cadastro")) { 
    // Cadastro "Home" (tela de seleção)
    theme = "terracota";
  }

  return {
    color: theme,
    bgClass: `bg-brand-${theme}`,
    textClass: `text-brand-${theme}`,
    borderClass: `border-brand-${theme}`,
    ringClass: `ring-brand-${theme}`,
    lightBgClass: `bg-brand-${theme}/10`,
    hoverTextClass: `hover:text-brand-${theme}`,
  };
}