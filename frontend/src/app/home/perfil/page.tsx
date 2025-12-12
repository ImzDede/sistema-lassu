"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, List, Spinner } from "@material-tailwind/react";
import {
  ChevronLeft,
  User,
  Lock,
  Bell,
  Clock,
  History,
  Pencil,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/Button";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import { logout } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import RoleBadge from "@/components/RoleBadge";

export default function Perfil() {
  const router = useRouter();
  const { user, isTeacher, isLoading } = useAuth();

  // Função de logout
  function handleLogout() {
    logout();
    router.push("/");
  }

  // Definição dos itens do menu
  const menuItems = [
    {
      label: "DADOS PESSOAIS",
      icon: <User />,
      href: "/home/perfil/dados",
      showForAdmin: true,
      showForOthers: true,
    },
    {
      label: "SENHA",
      icon: <Lock />,
      href: "/home/perfil/senha",
      showForAdmin: true,
      showForOthers: true,
    },
    {
      label: "NOTIFICAÇÕES",
      icon: <Bell />,
      href: "/home/perfil/notificacoes",
      showForAdmin: false,
      showForOthers: true,
    },
    {
      label: "DISPONIBILIDADE",
      icon: <Clock />,
      href: "/home/perfil/disponibilidade",
      showForAdmin: false,
      showForOthers: true,
    },
    {
      label: "HISTÓRICO",
      icon: <History />,
      href: "/home/perfil/historico",
      showForAdmin: true,
      showForOthers: true,
    },
  ];

  // Filtra os itens baseado na permissão (isTeacher)
  const visibleItems = menuItems.filter((item) =>
    isTeacher ? item.showForAdmin : item.showForOthers
  );

  // Spinner de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full pb-20 md:pb-0 font-sans">
      {/* Cabeçalho Mobile com botão de Voltar */}
      <div className="mb-6 md:mb-8 flex items-center">
        <div>
          <Typography
            variant="h3"
            className="font-bold uppercase mb-2 text-center md:text-left mt-4 md:mt-0 text-brand-dark"
          >
            Meu Perfil
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-400 text-sm text-center md:text-left md:text-base"
          >
            Gerencie suas informações pessoais e configurações.
          </Typography>
        </div>
      </div>

      <Card className="w-full max-w-6xl mx-auto shadow-sm lg:shadow-md border border-brand-pink/30 bg-brand-surface overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* COLUNA ESQUERDA: Foto e Dados Básicos */}
          <div className="w-full lg:w-1/3 bg-brand-bg/50 lg:border-r border-brand-pink/20 p-6 lg:p-8 flex flex-col items-center">
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-gray-300 overflow-hidden ring-1 ring-gray-100">
                {/* fotoUrl no futuro */}
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
                {user?.nome || "Usuário"}
              </Typography>
              <Typography className="text-brand-purple font-medium text-sm mt-1">
                Matrícula: {user?.matricula || "N/A"}
              </Typography>
              
              <RoleBadge user={user} />
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

          {/* COLUNA DIREITA: Menu de Opções Dinâmico */}
          <div className="w-full lg:w-2/3 p-6 lg:p-8 bg-brand-surface flex flex-col">
            <Typography
              variant="small"
              className="font-bold text-gray-400 uppercase tracking-widest mb-6 text-xs"
            >
              Configurações da Conta
            </Typography>
            <div className="flex-1 w-full">
              <List className="p-0 min-w-full">
                {visibleItems.map((item, index) => (
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