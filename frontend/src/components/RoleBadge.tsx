import React from "react";
import { User } from "@/types/usuarios";

interface RoleBadgeProps {
  user?: User | null;
}

export default function RoleBadge({ user }: RoleBadgeProps) {
  if (!user) return null;

  let label = "Colaboradora";
  let colorClass = "bg-gray-100 text-gray-600";

  // Prioridade: Admin > Cadastro (Cadastro) > Atendimento > Colaboradora (Padrão)
  if (user.permAdmin) {
    label = "Administradora";
    colorClass = "bg-brand-purple/10 text-brand-purple border border-brand-purple/20";
  } else if (user.permAtendimento && !user.permCadastro) {
    label = "Atendimento";
    colorClass = "bg-brand-peach/20 text-brand-dark border border-brand-peach/30";
  } else if (user.permCadastro) {
    label = "Cadastro";
    colorClass = "bg-brand-pink/20 text-brand-dark border border-brand-pink/30";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${colorClass}`}
    >
      {label}
    </span>
  );
}