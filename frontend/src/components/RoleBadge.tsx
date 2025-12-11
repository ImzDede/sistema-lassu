"use client";

import React from "react";

interface UserPerms {
  permAdmin?: boolean;
  permCadastro?: boolean;
  permAtendimento?: boolean;
}

interface RoleBadgeProps {
  user: UserPerms | null;
  className?: string;
}

export default function RoleBadge({ user, className = "" }: RoleBadgeProps) {
  
  // Função que define Texto e Estilo baseada na hierarquia
  const getConfig = () => {
    if (user?.permAdmin) {
      return { 
        label: "Administradora", 
        style: "bg-brand-purple/30 text-brand-purple border-brand-purple/40" 
      };
    }
    if (user?.permCadastro) {
      return { 
        label: "Cadastro", 
        style: "bg-brand-pink/30 text-brand-pink border-brand-pink/40" 
      };
    }
    if (user?.permAtendimento) {
      return { 
        label: "Atendimento", 
        style: "bg-blue-50 text-blue-600 border-blue-100" 
      };
    }
    // Fallback
    return { 
      label: "Colaboradora", 
      style: "bg-gray-100 text-gray-500 border-gray-200" 
    };
  };

  const { label, style } = getConfig();

  return (
    <span
      className={`
        inline-flex items-center justify-center 
        px-3 py-1 rounded-full border
        text-[10px] font-bold uppercase tracking-wider 
        shadow-sm transition-all
        ${style} ${className}
      `}
    >
      {label}
    </span>
  );
}