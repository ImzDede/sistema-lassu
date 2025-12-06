"use client";

import React, { useEffect, useState } from "react";
import {
  List,
  Card,
  Badge,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, PlusSquare, Calendar, User, Bell } from "lucide-react";
import NavItem from "@/components/NavItem";
import { parseCookies, destroyCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import axios from "axios";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState("");

  function handleLogout() {
    destroyCookie(undefined, "lassuauth.token", { path: "/" });
    router.push("/");
  }

  useEffect(() => {
    const { "lassuauth.token": token } = parseCookies();
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const tempoAtual = Date.now() / 1000;

        if (decoded.exp && decoded.exp < tempoAtual) {
          handleLogout();
          return;
        }

        if (decoded.nome) setNomeUsuario(decoded.nome);
        axios
          .get("http://localhost:3001/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            if (response.data.nome) setNomeUsuario(response.data.nome);
          })
          .catch(() => handleLogout());
      } catch {
        handleLogout();
      }
    } else {
      router.push("/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <Card
        className="hidden md:flex flex-col w-72 min-h-screen rounded-none shadow-xl border-r border-[#D9A3B6]/20 bg-white sticky top-0 h-screen"
        placeholder={undefined}
      >
        <div className="p-8 flex justify-center mb-2 border-b border-gray-50">
          <Link href="/home">
            <Image
              src="/logoVertical.svg"
              alt="Logo"
              width={160}
              height={60}
              className="w-44 h-auto hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <List
          className="min-w-0 p-3 flex-1 overflow-y-auto"
          placeholder={undefined}
        >
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
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-[#FDFDFD]">
        <header className="flex flex-col-reverse md:flex-row md:justify-between md:items-center bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-sm border-b border-[#D9A3B6]/20 gap-4 md:gap-0">
          <div className="flex flex-col">
            <Typography
              variant="h5"
              className="font-bold text-[#A78FBF]"
              placeholder={undefined}
            >
              {nomeUsuario ? `Olá, ${nomeUsuario.split(" ")[0]}!` : "Bem-vindo"}
            </Typography>
            <Typography
              variant="small"
              className="text-gray-400 font-normal"
              placeholder={undefined}
            >
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
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-full border border-gray-100">
                <Badge
                  content="3"
                  withBorder
                  className="bg-[#F2B694] border-white min-w-[18px] min-h-[18px]" // Badge Pêssego
                >
                  <IconButton
                    variant="text"
                    color="blue-gray"
                    className="rounded-full hover:bg-white text-gray-500 hover:text-[#A78FBF]"
                    placeholder={undefined}
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
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#D9A3B6]/20 flex justify-around py-3 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        {[
          { href: "/home", icon: Home },
          { href: "/home/pacientes", icon: Users },
          { href: "/home/cadastro", icon: PlusSquare },
          { href: "/home/calendario", icon: Calendar },
          { href: "/home/perfil", icon: User },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-2 rounded-xl transition-colors ${
              (
                item.href === "/home"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              )
                ? "bg-[#A78FBF]/10 text-[#A78FBF]"
                : "text-gray-400"
            }`}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
