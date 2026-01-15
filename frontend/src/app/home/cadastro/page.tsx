"use client";

import CardCadastro from "@/components/CardCadastro";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";

export default function Cadastro() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  // Definição de Perfis
  const isMasterAdmin = user?.permAdmin;
  const isCadastroTeam = user?.permCadastro;

  // Itens de Rotina
  const itemsRoutine = [
    { label: "SESSÕES", href: "/home/cadastro/sessoes" },
    { label: "ANOTAÇÕES", href: "/home/cadastro/anotacoes" },
    { label: "ANAMNESE", href: "/home/cadastro/anamnese" },
    { label: "SÍNTESES", href: "/home/cadastro/sintese" },
    { label: "ENCAMINHAMENTO", href: "/home/cadastro/encaminhamento" }
  ];

  // Itens Administrativos (Pacientes, Terapeutas)
  const itemPatient = { label: "PACIENTES", href: "/home/cadastro/paciente" };
  const itemTherapist = { label: "TERAPEUTAS", href: "/home/cadastro/extensionista" };

  // Lógica de Exibição (MANTIDA A SUA LÓGICA)
  let itemsToShow: { label: string; href: string }[] = [];

  if (isMasterAdmin) {
    // Regra: Admin (Professora) vê APENAS cadastro de terapeuta nesta tela
    itemsToShow = [itemTherapist];
  } else if (isCadastroTeam) {
    // Regra: Equipe de cadastro vê TUDO
    itemsToShow = [...itemsRoutine, itemPatient, itemTherapist];
  } else {
    // Regra: Terapeuta comum vê apenas a rotina (incluindo o novo encaminhamento)
    itemsToShow = itemsRoutine;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Typography
        variant="h3"
        className="font-bold uppercase mb-6 text-center lg:text-left mt-4 md:mt-0 text-brand-dark"
      >
        CADASTRO
      </Typography>

      <div className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface h-full p-4 md:p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
          {itemsToShow.map((item, index) => (
            <CardCadastro key={index} label={item.label} href={item.href} />
          ))}
        </div>
      </div>
    </div>
  );
}