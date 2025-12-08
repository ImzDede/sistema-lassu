"use client";

import React, { useEffect, useState } from "react";
import { getUserFromToken, verifyUserRedirect } from "@/utils/auth";
import CardCadastro from "@/components/CardCadastro";
import { Typography, Spinner } from "@material-tailwind/react";
import { usePathname, useRouter } from "next/navigation";

export default function Cadastro() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // Estado local para armazenar as permissões decodificadas do token
  const [permissions, setPermissions] = useState({
    admin: false,
    cadastro: false,
    atendimento: false,
  });

  useEffect(() => {
    // Verifica segurança da rota
    const user = verifyUserRedirect(router, pathname);
    
    if (user) {
      // Extrai as permissões do payload do token
      setPermissions({
        admin: user.permAdmin,
        cadastro: user.permCadastro,
        atendimento: user.permAtendimento,
      });
      setLoading(false);
    }
  }, [router, pathname]);

  // Itens gerais acessíveis a todos os níveis de permissão
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

  // Spinner
  if (loading) {
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
          {menuItemsGeneral.map((item, index) => (
            <CardCadastro key={index} label={item.label} href={item.href} />
          ))}
          {(permissions.admin || permissions.cadastro) &&
            menuItemsSpecific.map((item, index) => (
              <CardCadastro key={index} label={item.label} href={item.href} />
            ))}
        </div>
      </div>
    </div>
  );
}
