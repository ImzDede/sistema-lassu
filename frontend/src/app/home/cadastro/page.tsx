"use client";

import React, { useEffect, useState } from "react";
import { getUserFromToken } from "@/utils/auth";
import CardCadastro from "@/components/CardCadastro";
import { Typography, Spinner } from "@material-tailwind/react";
import { useRouter } from "next/navigation";

export default function Cadastro() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    admin: false,
    cadastro: false,
    atendimento: false,
  });

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setPermissions({
        admin: user.permAdmin,
        cadastro: user.permCadastro,
        atendimento: user.permAtendimento,
      });
      setLoading(false);
    } else {
      router.push("/");
    }
  }, [router]);

  const menuItemsGeneral = [
    { label: "CONSULTAS", href: "/home/cadastro/consulta" },
    { label: "ANOTAÇÕES", href: "/home/cadastro/anotacoes" },
    { label: "ANAMNESE", href: "/home/cadastro/anamnese" },
    { label: "SÍNTESE", href: "/home/cadastro/sintese" },
  ];

  const menuItemsSpecific = [
    { label: "PACIENTES", href: "/home/cadastro/paciente" },
    { label: "EXTENSIONISTAS", href: "/home/cadastro/extensionista" },
  ];

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
