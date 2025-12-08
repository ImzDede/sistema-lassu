"use client";

import React, { useEffect, useState } from "react";
import {
  List,
  Card,
  Badge,
  IconButton,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, PlusSquare, Calendar, User, Bell } from "lucide-react";
import NavItem from "@/components/NavItem";
import axios from "axios";
import {
  getUserFromToken,
  logout,
  getToken,
  verifyUserRedirect,
} from "@/utils/auth";
import { getAuthHeader, getAuthHeader as getHeader } from "@/utils/api";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      // Verifica token e redirecionamentos obrigatórios (Login ou Primeiro Acesso)
      const user = verifyUserRedirect(router, pathname);

      if (!user || user.primeiroAcesso) {
        return;
      }

      try {
        if (user.nome) setUserName(user.nome);

        // Valida token no backend e busca dados atualizados
        const response = await axios.get(
          "http://localhost:3001/users/profile",
          getAuthHeader()
        );

        if (response.data.user && response.data.user.nome) {
          setUserName(response.data.user.nome);
        }

        setIsLoading(false);
      } catch (error) {
        logout();
        router.push("/");
      }
    };

    checkAccess();
  }, [router, pathname]);

  // Spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row font-sans">
      {/* SIDEBAR DESKTOP */}
      <Card className="hidden md:flex flex-col w-64 min-h-screen rounded-none shadow-xl border-r border-white/10 sticky top-0 h-screen bg-brand-purple">
        <div className="p-8 flex justify-center mb-2 border-b border-white/20">
          <Link href="/home">
            <Image
              src="/logoVertical.svg"
              alt="Logo"
              width={160}
              height={60}
              className="w-44 h-auto hover:scale-105 transition-transform duration-300 brightness-0 invert"
            />
          </Link>
        </div>
        <List className="min-w-0 p-3 flex-1 overflow-y-auto">
          <NavItem
            href="/home"
            icon={<Home />}
            label="Início"
            active={pathname === "/home"}
          />
          <NavItem
            href="/home/pacientes"
            icon={<Users />}
            label="Pacientes"
            active={pathname === "/home/pacientes"}
          />
          <NavItem
            href="/home/cadastro"
            icon={<PlusSquare />}
            label="Cadastro"
            active={pathname.startsWith("/home/cadastro")}
          />
          <NavItem
            href="/home/calendario"
            icon={<Calendar />}
            label="Calendário"
            active={pathname === "/home/calendario"}
          />
          <NavItem
            href="/home/perfil"
            icon={<User />}
            label="Perfil"
            active={pathname === "/home/perfil"}
          />
        </List>
      </Card>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-brand-bg">
        <header className="flex flex-col-reverse md:flex-row md:justify-between md:items-center bg-brand-bg/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-sm border-b border-brand-pink/20 gap-4 md:gap-0">
          <div className="flex flex-col">
            <Typography variant="h5" className="font-bold text-brand-dark">
              {userName ? `Olá, ${userName.split(" ")[0]}!` : "Bem-vindo"}
            </Typography>
            <Typography variant="small" className="text-gray-400 font-normal">
              Tenha um ótimo dia de trabalho.
            </Typography>
          </div>

          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="block md:hidden">
              <Link href="/home">
                <Image
                  src="/logoLassu.svg"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-10 h-auto"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4 ml-auto md:ml-0">
              <div className="flex items-center gap-4 bg-brand-surface p-2 rounded-full border border-gray-100">
                <Badge
                  content="3"
                  withBorder
                  className="bg-brand-peach border-white min-w-[18px] min-h-[18px]"
                >
                  <IconButton
                    variant="text"
                    className="rounded-full hover:bg-brand-bg text-gray-500 hover:text-brand-purple"
                  >
                    <Bell className="w-5 h-5" />
                  </IconButton>
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
          {children}
        </div>
      </main>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-brand-surface flex justify-around py-3 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[linear-gradient(to_right,_#A78FBF,_#D9A3B6,_#F2B694)]"></div>
        {[
          { href: "/home", icon: Home },
          { href: "/home/pacientes", icon: Users },
          { href: "/home/cadastro", icon: PlusSquare },
          { href: "/home/calendario", icon: Calendar },
          { href: "/home/perfil", icon: User },
        ].map((item) => {
          const isActive =
            item.href === "/home"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-xl transition-all ${
                isActive
                  ? "text-brand-purple bg-brand-purple/10"
                  : "text-gray-400"
              }`}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
