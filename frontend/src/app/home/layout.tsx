"use client";

import React, { useState } from "react";
import { Spinner, IconButton, Typography } from "@material-tailwind/react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SidebarDesktop from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationBell from "@/components/NotificationBell";
import { useRouter } from "next/navigation";

function HomeInternal({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isTeacher } = useAuth();
  const router = useRouter();
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);

  React.useEffect(() => {
    if (!isLoading && user && user.primeiroAcesso) {
      router.replace("/primeiroAcesso");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  const firstName = user?.nome ? user.nome.split(" ")[0] : "Usuário";

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row font-sans overflow-hidden">
      
      <SidebarDesktop
        isVisible={showDesktopSidebar}
        toggleSidebar={() => setShowDesktopSidebar(!showDesktopSidebar)}
        user={user}
      />

      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-brand-bg scroll-smooth">
        <header className="flex justify-between items-center bg-brand-bg/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-sm lg:shadow-none">
          <div className="flex items-center gap-4">
            
            {!showDesktopSidebar && (
              <IconButton
                variant="text"
                className="hidden lg:flex text-brand-dark hover:bg-brand-purple/10"
                onClick={() => setShowDesktopSidebar(true)}
              >
                <Menu className="w-6 h-6" />
              </IconButton>
            )}

            {/* Logo Mobile */}
            <div className="lg:hidden">
              <Image
                src="/lassuLogoVerticalCor.svg"
                alt="Logo"
                width={80}
                height={30}
                className="w-28 h-auto"
              />
            </div>

            <div className="hidden lg:flex flex-col ml-2 lg:ml-0">
              <Typography variant="h6" className="font-bold text-brand-dark lg:text-xl">
                Olá, {firstName}!
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-10">
          {children}
        </div>
      </main>
      
      <BottomNav user={user} />
    </div>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HomeInternal>{children}</HomeInternal>
      </NotificationProvider>
    </AuthProvider>
  );
}