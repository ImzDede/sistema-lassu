"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import axios from "axios";
import { Card, CardBody, Typography, List } from "@material-tailwind/react";
import {
  ChevronLeft,
  User,
  Lock,
  Bell,
  Clock,
  Briefcase,
  Pencil,
  LogOut,
  ChevronRight, // Faltava importar para o botão mobile
} from "lucide-react";

import Button from "@/components/Button";
import ProfileMenuItem from "@/components/ProfileMenuItem";

const MENU_ITEMS = [
  { label: "DADOS PESSOAIS", icon: <User />, href: "/home/perfil/dados" },
  { label: "SENHA", icon: <Lock />, href: "/home/perfil/senha" },
  { label: "NOTIFICAÇÕES", icon: <Bell />, href: "/home/perfil/notificacoes" },
  { label: "DISPONIBILIDADE", icon: <Clock />, href: "/home/perfil/disponibilidade" },
  { label: "CARGOS", icon: <Briefcase />, href: "/home/perfil/cargos" },
];

export default function Perfil() {
  const router = useRouter();
  const [userData, setUserData] = useState({ nome: "Carregando...", matricula: "..." });

  useEffect(() => {
    const { "lassuauth.token": token } = parseCookies();
    if (token) {
      axios
        .get("http://localhost:3001/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data) {
            setUserData({
              nome: response.data.nome,
              matricula: response.data.matricula || "N/A",
            });
          }
        })
        .catch((error) => console.error("Erro perfil:", error));
    }
  }, []);

  function handleLogout() {
    destroyCookie(undefined, "lassuauth.token", { path: "/" });
    router.push("/");
  }

  return (
    <div className="flex flex-col w-full min-h-full pb-20 md:pb-0 font-sans">
      
      {/* === HEADER (Título) === */}
      <div className="mb-6 md:mb-8 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-[#A78FBF]/10 hover:text-[#A78FBF] rounded-full transition-colors"
        >
          <ChevronLeft size={28} />
        </button>

        <div>
          <Typography variant="h3" className="font-bold uppercase text-xl md:text-3xl text-[#A78FBF]" placeholder={undefined}>
            Meu Perfil
          </Typography>
          <Typography variant="paragraph" className="text-gray-400 text-sm md:text-base hidden md:block" placeholder={undefined}>
            Gerencie suas informações pessoais e configurações.
          </Typography>
        </div>
      </div>

      {/* === CARD PRINCIPAL === */}
      <Card className="w-full max-w-6xl mx-auto shadow-sm md:shadow-md border border-[#D9A3B6]/30 bg-white overflow-hidden" placeholder={undefined}>
        <div className="flex flex-col md:flex-row min-h-[500px]">
          
          {/* --- COLUNA ESQUERDA (User Info) --- */}
          <div className="w-full md:w-1/3 bg-gray-50/50 md:border-r border-[#D9A3B6]/20 p-6 md:p-8 flex flex-col items-center md:items-start">
            
            {/* Avatar */}
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-gray-300 overflow-hidden ring-1 ring-gray-100">
                <User size={64} strokeWidth={1.5} />
              </div>
              <button className="absolute bottom-1 right-1 bg-[#A78FBF] text-white p-2.5 rounded-full shadow-md hover:bg-[#967bb3] transition-all transform hover:scale-105 border-2 border-white">
                <Pencil size={16} />
              </button>
            </div>

            {/* Texto Info */}
            <div className="text-center md:text-left w-full mb-8">
              <Typography variant="h5" className="font-bold uppercase text-gray-800 break-words" placeholder={undefined}>
                {userData.nome}
              </Typography>
              <Typography className="text-[#A78FBF] font-medium text-sm mt-1" placeholder={undefined}>
                Matrícula: {userData.matricula}
              </Typography>
            </div>

            {/* Botão Logout (Desktop) */}
            <div className="mt-auto hidden md:block w-full">
               <Button
                onClick={handleLogout}
                variant="outline"
                fullWidth
                className="flex items-center justify-center gap-2 !border-[#F2A9A2]/50 !text-[#F2A9A2] hover:!bg-[#F2A9A2]/10 hover:!border-[#F2A9A2]"
              >
                <LogOut size={18} />
                <span>SAIR DA CONTA</span>
              </Button>
            </div>
          </div>

          {/* --- COLUNA DIREITA (Menu) --- */}
          <div className="w-full md:w-2/3 p-6 md:p-8 bg-white flex flex-col">
            <Typography variant="small" className="font-bold text-gray-400 uppercase tracking-widest mb-6 text-xs" placeholder={undefined}>
              Configurações da Conta
            </Typography>

            <div className="flex-1 w-full">
              <List className="p-0 min-w-full" placeholder={undefined}>
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

            {/* Botão Logout (Mobile) */}
            <div className="mt-8 md:hidden pt-6 border-t border-gray-100">
               <Button
                onClick={handleLogout}
                variant="outline"
                fullWidth
                className="flex items-center justify-between p-4 !border-[#F2A9A2]/50 !text-[#F2A9A2] hover:!bg-[#F2A9A2]/10 group"
              >
                 <div className="flex items-center gap-3">
                    <LogOut className="group-hover:text-[#e08e86]" size={20} />
                    <span className="font-bold group-hover:text-[#e08e86]">SAIR</span>
                 </div>
                 <ChevronRight className="text-[#F2A9A2]/50 group-hover:text-[#e08e86]" size={20} />
              </Button>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}