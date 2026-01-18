"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Spinner, IconButton, Typography } from "@material-tailwind/react";
import { Menu } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import SidebarDesktop from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import NotificationBell from "@/components/NotificationBell";
import { useAppTheme } from "@/hooks/useAppTheme";

function HomeInternal({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const { textClass } = useAppTheme();

  useEffect(() => {
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
  const isHomePage = pathname === "/home";

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
            {/* Toggle Sidebar Desktop */}
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
            <div className="lg:hidden flex flex-col items-start gap-1">
              {isHomePage && (
                <Link href="/home">
                  <Image
                    src="/lassuLogoVerticalCor.svg"
                    alt="Logo"
                    width={80}
                    height={30}
                    className="w-20 h-auto cursor-pointer"
                    priority
                  />
                </Link>
              )}
            </div>

            {/* 3. Desktop Greeting */}
            <div className="hidden lg:flex flex-col ml-0">
              <Typography
                variant="h6"
                className={`font-bold lg:text-xl ${textClass}`}
              >
                Olá, {firstName}!
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notificações */}
            <div className={`${isHomePage ? "block" : "hidden lg:block"}`}>
              <NotificationBell />
            </div>
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
