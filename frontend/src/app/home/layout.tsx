"use client";

import React, { useState } from "react";
import {
  Spinner,
  IconButton,
  Badge,
  Typography,
} from "@material-tailwind/react";
import Image from "next/image";
import { Menu, Bell } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SidebarDesktop from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationBell from "@/components/NotificationBell";

function HomeInternal({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row font-sans">
      {/* SIDEBAR DESKTOP */}
      <SidebarDesktop
        isVisible={showDesktopSidebar}
        toggleSidebar={() => setShowDesktopSidebar(!showDesktopSidebar)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-brand-bg scroll-smooth">
        {/* HEADER */}
        <header className="flex justify-between items-center bg-brand-bg/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Botão para REABRIR a sidebar desktop */}
            {!showDesktopSidebar && (
              <IconButton
                variant="text"
                className="hidden lg:flex text-brand-dark hover:bg-brand-purple/10"
                onClick={() => setShowDesktopSidebar(true)}
              >
                <Menu className="w-6 h-6" />
              </IconButton>
            )}

            {/* Logo no Mobile (Header) */}
            <div className="lg:hidden">
              <Image
                src="/lassuLogoVerticalCor.svg"
                alt="Logo"
                width={80}
                height={30}
                className="w-36 h-auto"
              />
            </div>

            {/* Saudação (Desktop) */}
            <div className="hidden lg:flex flex-col">
              <Typography variant="h5" className="font-bold text-brand-dark">
                {user ? `Olá, ${user.nome.split(" ")[0]}!` : "Bem-vindo"}
              </Typography>
            </div>
          </div>

          {/* Notificações */}
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Área das Páginas */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-10">
          {children}
        </div>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HomeInternal>{children}</HomeInternal>
      </NotificationProvider>
    </AuthProvider>
  );
}
