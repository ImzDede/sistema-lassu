"use client";

import React from "react";
import { Typography, Spinner } from "@material-tailwind/react";
import { 
  Calendar, 
  FileText, 
  ClipboardList, 
  Share, 
  PenTool, 
  Users, 
  User 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CardCadastro from "@/components/CardCadastro";

export default function Cadastro() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  // Definição de Permissões
  const isMasterAdmin = user?.permAdmin;
  const isCadastroTeam = user?.permCadastro;

  // --- DADOS DOS CARDS ---
  const items = {
    sessao: { label: "SESSÃO", href: "/home/cadastro/sessoes", icon: Calendar, color: "#6D538B" },
    sintese: { label: "SÍNTESE", href: "/home/cadastro/sintese", icon: FileText, color: "#F2B694" },
    anamnese: { label: "ANAMNESE", href: "/home/cadastro/anamnese", icon: ClipboardList, color: "#F2A9A2" },
    encaminhamento: { label: "ENCAMINHAMENTO", href: "/home/cadastro/encaminhamento", icon: Share, color: "#D9A3B6" },
    anotacao: { label: "ANOTAÇÃO", href: "/home/cadastro/anotacoes", icon: PenTool, color: "#71787E" },
    paciente: { label: "PACIENTE", href: "/home/cadastro/paciente", icon: Users, color: "#C2A598" }, 
    usuario: { label: "TERAPEUTA", href: "/home/cadastro/extensionista", icon: User, color: "#A78FBF" }, 
  };

  // --- LÓGICA DE EXIBIÇÃO ---
  const itemsRoutine = [
    items.sessao,
    items.sintese,
    items.anamnese,
    items.encaminhamento,
    items.anotacao
  ];

  let itemsToShow = [];

  if (isMasterAdmin) {
    itemsToShow = [items.usuario];
  } else if (isCadastroTeam) {
    itemsToShow = [...itemsRoutine, items.paciente, items.usuario];
  } else {
    itemsToShow = itemsRoutine;
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="text-center lg:text-left mb-8">
        <Typography variant="h4" className="font-bold uppercase text-brand-dark tracking-wide">
          CADASTRO RÁPIDO
        </Typography>
        <Typography variant="paragraph" className="text-gray-500 font-normal text-sm mt-1">
          Selecione opção que deseja cadastrar:
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {itemsToShow.map((item, index) => (
          <CardCadastro 
            key={index}
            label={item.label}
            href={item.href}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>
      
    </div>
  );
}