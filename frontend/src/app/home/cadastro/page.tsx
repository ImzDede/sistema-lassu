"use client";

import React, { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import CardCadastro from "@/components/CardCadastro";

export default function Cadastro() {
  const [perms, setPerms] = useState({
    admin: false,
    cadastro: false,
    atendimento: false,
  });

  useEffect(() => {
    const { "lassuauth.token": token } = parseCookies();
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setPerms({
          admin: decoded.permAdmin,
          cadastro: decoded.permCadastro,
          atendimento: decoded.permAtendimento,
        });
      } catch (error) {
        console.error("Erro ao ler permissões", error);
      }
    }
  }, []);

  const menuItemsGeral = [
    { label: "CONSULTAS", href: "/home/cadastro/consulta" },
    { label: "ANOTAÇÕES", href: "/home/cadastro/anotacoes" },
    { label: "ANAMNESE", href: "/home/cadastro/anamnese" },
    { label: "SÍNTESE", href: "/home/cadastro/sintese" },
  ];

  const menuItemsEsp = [
    { label: "PACIENTES", href: "/home/cadastro/paciente" },
    { label: "EXTENSIONISTAS", href: "/cadastroExtensionista" },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <h1 className="text-2xl font-bold uppercase mb-6 text-black text-center md:text-left mt-4 md:mt-0">
        CADASTRO
      </h1>

      <div className="w-full h-full bg-gray-200 p-4 md:p-8 rounded-lg shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
          {menuItemsGeral.map((item, index) => (
            <CardCadastro key={index} label={item.label} href={item.href} />
          ))}

          {(perms.admin || perms.cadastro) &&
            menuItemsEsp.map((item, index) => (
              <CardCadastro key={index} label={item.label} href={item.href} />
            ))}
        </div>
      </div>
    </div>
  );
}
