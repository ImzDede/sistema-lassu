"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, Typography, List } from "@material-tailwind/react";
import {
  ChevronLeft,
  User,
  Lock,
  Bell,
  Clock,
  Briefcase,
  Pencil,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/Button";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import { logout } from "@/utils/auth";
import { getAuthHeader } from "@/utils/api"; 

// Menu estático de configurações
const MENU_ITEMS = [
  { label: "DADOS PESSOAIS", icon: <User />, href: "/home/perfil/dados" },
  { label: "SENHA", icon: <Lock />, href: "/home/perfil/senha" },
  { label: "NOTIFICAÇÕES", icon: <Bell />, href: "/home/perfil/notificacoes" },
  {
    label: "DISPONIBILIDADE",
    icon: <Clock />,
    href: "/home/perfil/disponibilidade",
  },
  { label: "CARGOS", icon: <Briefcase />, href: "/home/perfil/cargos" },
];

export default function Perfil() {
  const router = useRouter();

  // Estado para armazenar dados vindos da API
  const [userData, setUserData] = useState({
    name: "Carregando...",
    registration: "...",
  });

  useEffect(() => {
    // Busca dados atualizados do perfil ao montar a tela.
    // Utiliza getAuthHeader para injetar o token automaticamente.
    axios
      .get("http://localhost:3001/users/profile", getAuthHeader())
      .then((response) => {
        if (response.data.user) {
          setUserData({
            name: response.data.user.nome,
            registration: response.data.user.matricula || "N/A",
          });
        }
      })
      .catch((error) => console.error("Erro perfil:", error));
  }, []);

  // Função de logout
  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="flex flex-col w-full min-h-full pb-20 md:pb-0 font-sans">

      {/* Cabeçalho Mobile com botão de Voltar */}
      <div className="mb-6 md:mb-8 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-brand-purple/10 hover:text-brand-purple rounded-full transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <div>
          <Typography
            variant="h3"
            className="font-bold uppercase text-xl md:text-3xl text-brand-dark"
          >
            Meu Perfil
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-400 text-sm md:text-base hidden md:block"
          >
            Gerencie suas informações pessoais e configurações.
          </Typography>
        </div>
      </div>

      <Card className="w-full max-w-6xl mx-auto shadow-sm lg:shadow-md border border-brand-pink/30 bg-brand-surface overflow-hidden">
        {/* Layout Responsivo: Coluna no Mobile, Linha no Desktop */}
        <div className="flex flex-col lg:flex-row min-h-[500px]">

          {/* COLUNA ESQUERDA: Foto e Dados Básicos */}
          <div className="w-full lg:w-1/3 bg-brand-bg/50 lg:border-r border-brand-pink/20 p-6 lg:p-8 flex flex-col items-center">
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-gray-300 overflow-hidden ring-1 ring-gray-100">
                <User size={64} strokeWidth={1.5} />
              </div>
              <button className="absolute bottom-1 right-1 bg-brand-purple text-white p-2.5 rounded-full shadow-md hover:bg-[#967bb3] transition-all transform hover:scale-105 border-2 border-white">
                <Pencil size={16} />
              </button>
            </div>
            <div className="text-center w-full mb-8">
              <Typography
                variant="h5"
                className="font-bold uppercase text-brand-dark break-words"
              >
                {userData.name}
              </Typography>
              <Typography className="text-brand-purple font-medium text-sm mt-1">
                Matrícula: {userData.registration}
              </Typography>
            </div>

            {/* Botão de Sair (Versão Desktop) */}
            <div className="mt-auto hidden lg:block w-full">
              <Button
                onClick={handleLogout}
                variant="outline"
                fullWidth
                className="flex items-center justify-center gap-2 !border-brand-error/50 !text-brand-error hover:!bg-brand-error/10 hover:!border-brand-error"
              >
                <LogOut size={18} />
                <span>SAIR DA CONTA</span>
              </Button>
            </div>
          </div>

          {/* COLUNA DIREITA: Menu de Opções */}
          <div className="w-full lg:w-2/3 p-6 lg:p-8 bg-brand-surface flex flex-col">
            <Typography
              variant="small"
              className="font-bold text-gray-400 uppercase tracking-widest mb-6 text-xs"
            >
              Configurações da Conta
            </Typography>
            <div className="flex-1 w-full">
              <List className="p-0 min-w-full">
                {MENU_ITEMS.map((item, index) => (
                  <ProfileMenuItem
                    key={index}
                    label={item.label}
                    icon={item.icon}
                    href={item.href}
                  />
                ))}
              </List>
            </div>

            {/* Botão de Sair (Versão Mobile) */}
            <div className="mt-8 lg:hidden pt-6 border-t border-gray-100">
              <Button
                onClick={handleLogout}
                variant="outline"
                fullWidth
                className="flex items-center justify-between p-4 !border-brand-error/50 !text-brand-error hover:!bg-brand-error/10 group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="group-hover:text-[#e08e86]" size={20} />
                  <span className="font-bold group-hover:text-[#e08e86]">
                    SAIR
                  </span>
                </div>
                <ChevronRight
                  className="text-brand-error/50 group-hover:text-[#e08e86]"
                  size={20}
                />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
