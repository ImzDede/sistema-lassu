"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Typography, List, Spinner } from "@material-tailwind/react";
import { User, Lock, Clock, History, LogOut } from "lucide-react";
import Button from "@/components/Button";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import { logout } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import RoleBadge from "@/components/RoleBadge";
import { useFeedback } from "@/contexts/FeedbackContext";
import EditableProfileAvatar from "@/components/EditableProfileAvatar";

export default function Perfil() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const { showFeedback } = useFeedback();

  useEffect(() => {
    const successType = searchParams.get("success");
    if (successType) {
      const messages: Record<string, string> = {
        dados: "Dados pessoais atualizados com sucesso!",
        senha: "Senha alterada com sucesso!",
        disponibilidade: "Sua disponibilidade foi alterada com sucesso!",
      };
      const messageToShow = messages[successType] || "Operação realizada com sucesso.";
      showFeedback(messageToShow, "success");
      router.replace("/home/perfil");
    }
  }, [searchParams, showFeedback, router]);

  function handleLogout() {
    logout();
  }

  const canEditAvailability = (user?.permCadastro || user?.permAtendimento) && !user?.permAdmin;

  const menuItems = [
    { label: "DADOS PESSOAIS", icon: <User size={18} />, href: "/home/perfil/dados", show: true },
    { label: "SENHA", icon: <Lock size={18} />, href: "/home/perfil/senha", show: true },
    { label: "DISPONIBILIDADE", icon: <Clock size={18} />, href: "/home/perfil/disponibilidade", show: !!canEditAvailability },
    { label: "HISTÓRICO", icon: <History size={18} />, href: "/home/perfil/historico", show: true },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full pb-20 lg:pb-0 font-sans">

      <div className="mb-6 lg:mb-8 flex items-center justify-center lg:justify-start">
        <div>
          <Typography variant="h3" className="font-bold uppercase mb-2 text-center lg:text-left mt-4 lg:mt-0 text-brand-dark">
            Meu Perfil
          </Typography>
          <Typography variant="paragraph" className="text-gray-400 text-sm text-center lg:text-left lg:text-base">
            Gerencie suas informações pessoais e configurações.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface max-w-6xl mx-auto lg:shadow-md overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* COLUNA ESQUERDA */}
          <div className="w-full lg:w-1/3 bg-brand-bg/50 lg:border-r border-brand-pink/20 p-6 lg:p-8 flex flex-col items-center">
            
            <div className="mb-6">
                <EditableProfileAvatar 
                    avatarUrl={user?.fotoUrl}
                    onEdit={() => router.push("/home/perfil/dados")} 
                />
            </div>

            <div className="text-center w-full mb-8">
              <Typography variant="h5" className="font-bold uppercase text-brand-dark break-words">
                {user?.nome || "Usuário"}
              </Typography>
              <Typography className="text-brand-purple font-medium text-sm mt-1">
                Matrícula: {user?.matricula || "N/A"}
              </Typography>
              <div className="mt-2 flex justify-center">
                <RoleBadge user={user} />
              </div>
            </div>

            <div className="mt-auto hidden lg:block w-full">
              <Button
                onClick={handleLogout}
                variant="outline"
                fullWidth
                className="flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
              >
                <LogOut size={18} /> <span>SAIR DA CONTA</span>
              </Button>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="w-full lg:w-2/3 p-6 lg:p-8 bg-brand-surface flex flex-col">
            <Typography variant="small" className="font-bold text-gray-400 uppercase tracking-widest mb-6 text-xs">
              Configurações da Conta
            </Typography>
            <div className="flex-1 w-full">
              <List className="p-0 min-w-full">
                {menuItems.map((item, index) => (
                  item.show && (
                    <ProfileMenuItem
                      key={index}
                      label={item.label}
                      icon={item.icon}
                      href={item.href}
                    />
                  )
                ))}
              </List>
            </div>

            <div className="mt-8 lg:hidden pt-6 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-red-600 border-2 border-red-500 hover:bg-red-50"
              >
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <LogOut size={20} />
                </div>
                <span className="uppercase text-sm">SAIR DA CONTA</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}