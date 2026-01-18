"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Typography, List, Spinner } from "@material-tailwind/react";
import { User, Lock, Clock, LogOut } from "lucide-react";
import Button from "@/components/Button";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import { logout } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import RoleBadge from "@/components/RoleBadge";
import { useFeedback } from "@/contexts/FeedbackContext";
import EditableProfileAvatar from "@/components/EditableProfileAvatar";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function Perfil() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const { showFeedback } = useFeedback();

  // TEMA: brand-peach
  const { color, borderClass, textClass, lightBgClass, bgClass } =
    useAppTheme();
  const themeAccentColor = `brand-${color}`;

  useEffect(() => {
    const successType = searchParams.get("success");
    if (successType) {
      showFeedback("Operação realizada com sucesso.", "success");
      router.replace("/home/perfil");
    }
  }, [searchParams, showFeedback, router]);

  const canEditAvailability =
    (user?.permCadastro || user?.permAtendimento) && !user?.permAdmin;

  const menuItems = [
    {
      label: "DADOS PESSOAIS",
      icon: <User size={18} />,
      href: "/home/perfil/dados",
      show: true,
    },
    {
      label: "SEGURANÇA",
      icon: <Lock size={18} />,
      href: "/home/perfil/senha",
      show: true,
    },
    {
      label: "DISPONIBILIDADE",
      icon: <Clock size={18} />,
      href: "/home/perfil/disponibilidade",
      show: !!canEditAvailability,
    },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center h-[50vh] items-center">
        <Spinner className={`h-10 w-10 ${textClass}`} />
      </div>
    );

  return (
    <div className="flex flex-col w-full min-h-full pb-20 lg:pb-0 font-sans">
      <div className="hidden md:flex mb-6 lg:mb-8 items-center justify-center lg:justify-start">
        <div>
          <Typography
            variant="h3"
            className="font-bold uppercase mb-2 text-center lg:text-left mt-4 lg:mt-0 text-brand-peach"
          >
            Meu Perfil
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-400 text-sm text-center lg:text-left"
          >
            Gerencie suas informações.
          </Typography>
        </div>
      </div>

      <Card
        className={`w-full shadow-lg border-t-4 ${borderClass} bg-brand-surface max-w-6xl mx-auto overflow-hidden`}
      >
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          <div className="w-full lg:w-1/3 bg-brand-bg/50 lg:border-r border-gray-100 p-6 lg:p-8 flex flex-col items-center">
            <div className="mb-6">
              {/* Avatar na cor do tema */}
              <EditableProfileAvatar
                avatarUrl={user?.fotoUrl}
                editable={true}
                onEdit={() => console.log("Edit")}
                accentColorClass={themeAccentColor}
              />
            </div>
            <div className="text-center w-full mb-8">
              <Typography
                variant="h5"
                className="text-base lg:text-xl font-bold uppercase text-brand-peach"
              >
                {user?.nome || "Usuário"}
              </Typography>
              <Typography className={`font-medium text-sm mt-1 text-gray-600`}>
                Matrícula: {user?.matricula || "N/A"}
              </Typography>
              <div className="mt-2 flex justify-center">
                <RoleBadge user={user} />
              </div>
            </div>

            <div className="mt-auto hidden lg:block w-full">
              {/* Botão Sair na cor do tema */}
              <Button
                onClick={logout}
                variant="outline"
                fullWidth
                accentColorClass={themeAccentColor}
                className="flex items-center justify-center gap-2 border-2 bg-transparent hover:bg-opacity-10"
              >
                <LogOut size={18} /> <span>SAIR DA CONTA</span>
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-2/3 p-6 lg:p-8 bg-brand-surface flex flex-col">
            <Typography
              variant="small"
              className="font-bold text-gray-400 uppercase tracking-widest mb-6 text-xs"
            >
              Configurações
            </Typography>
            <div className="flex-1 w-full">
              <List className="p-0 min-w-full">
                {menuItems.map(
                  (item, index) =>
                    item.show && (
                      <ProfileMenuItem
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        href={item.href}
                      />
                    )
                )}
              </List>
            </div>
            <div className="mt-8 lg:hidden pt-6 border-t border-gray-100">
              <button
                onClick={logout}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold border-2 transition-all duration-200 hover:bg-opacity-10 bg-transparent border-${themeAccentColor} text-${themeAccentColor} hover:bg-${themeAccentColor}`}
              >
                <div className={`p-2 rounded-lg ${lightBgClass} ${textClass}`}>
                  <LogOut size={20} />
                </div>
                <span className="text-xs uppercase">SAIR DA CONTA</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
