"use client";

import React from "react";
import CardCadastro from "@/components/CardCadastro";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";

export default function Cadastro() {
  const { user, isTeacher, isLoading } = useAuth();

  // Itens gerais
  const menuItemsGeneral = [
    { label: "SESSÕES", href: "/home/cadastro/sessoes" },
    { label: "ANOTAÇÕES", href: "/home/cadastro/anotacoes" },
    { label: "ANAMNESE", href: "/home/cadastro/anamnese" },
    { label: "SÍNTESES", href: "/home/cadastro/sintese" },
  ];

  // Itens restritos (Admin ou Equipe de Cadastro)
  const menuItemsSpecific = [
    { label: "PACIENTES", href: "/home/cadastro/paciente" },
    { label: "EXTENSIONISTAS", href: "/home/cadastro/extensionista" },
  ];

  // 3. Define quem pode ver os itens restritos
  const canSeeRestricted = isTeacher || user?.permCadastro;

  // Spinner enquanto carrega o contexto
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Typography
        variant="h3"
        className="font-bold uppercase mb-6 text-center md:text-left mt-4 md:mt-0 text-brand-dark"
      >
        CADASTRO
      </Typography>

      <div className="w-full h-full bg-brand-surface border border-brand-pink/30 p-4 md:p-8 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
          
          {/* Renderiza itens gerais para todos */}
          {menuItemsGeneral.map((item, index) => (
            <CardCadastro key={index} label={item.label} href={item.href} />
          ))}

          {/* Renderiza itens restritos só se tiver permissão */}
          {canSeeRestricted &&
            menuItemsSpecific.map((item, index) => (
              <CardCadastro key={index} label={item.label} href={item.href} />
            ))}
            
        </div>
      </div>
    </div>
  );
}