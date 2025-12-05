"use client";

import React, { useEffect, useState } from "react";
import {
  List,
  Card,
  Badge,
  IconButton,
  Avatar,
  Typography,
  Button as MTButton,
} from "@material-tailwind/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  PlusSquare,
  Calendar,
  User,
  Bell,
  LogOut,
} from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <Card className="hidden md:flex flex-col w-72 min-h-screen rounded-none shadow-xl border-r border-gray-100 bg-white sticky top-0 h-screen">
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
        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
          <MTButton
            variant="outlined"
            color="red"
            onClick={handleLogout}
            fullWidth
            className="flex items-center justify-center gap-2 hover:shadow-none"
          >
            <LogOut size={18} /> SAIR
          </MTButton>
        </div>
      </Card>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-gray-50/50">
        <header className="flex flex-col-reverse md:flex-row md:justify-between md:items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-sm border-b border-gray-100 gap-4 md:gap-0">
          <div className="flex flex-col">
            <Typography variant="h5" color="blue-gray" className="font-bold">
              {nomeUsuario ? `Olá, ${nomeUsuario.split(" ")[0]}!` : "Bem-vindo"}
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
              <button
                onClick={handleLogout}
                className="md:hidden text-gray-500"
              >
                <LogOut className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-full border border-gray-100">
                <Badge
                  content="3"
                  withBorder
                  className="bg-deep-purple-500 border-white min-w-[18px] min-h-[18px]"
                >
                  <IconButton
                    variant="text"
                    color="blue-gray"
                    className="rounded-full hover:bg-white"
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
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <Link
          href="/home"
          className={`p-2 rounded-xl transition-colors ${
            pathname === "/home"
              ? "bg-deep-purple-50 text-deep-purple-600"
              : "text-gray-400"
          }`}
        >
          <Home className="w-6 h-6" />
        </Link>
        <Link
          href="/home/pacientes"
          className={`p-2 rounded-xl transition-colors ${
            pathname === "/home/pacientes"
              ? "bg-deep-purple-50 text-deep-purple-600"
              : "text-gray-400"
          }`}
        >
          <Users className="w-6 h-6" />
        </Link>
        <Link
          href="/home/cadastro"
          className={`p-2 rounded-xl transition-colors ${
            pathname.startsWith("/home/cadastro")
              ? "bg-deep-purple-50 text-deep-purple-600"
              : "text-gray-400"
          }`}
        >
          <PlusSquare className="w-6 h-6" />
        </Link>
        <Link
          href="/home/calendario"
          className={`p-2 rounded-xl transition-colors ${
            pathname === "/home/calendario"
              ? "bg-deep-purple-50 text-deep-purple-600"
              : "text-gray-400"
          }`}
        >
          <Calendar className="w-6 h-6" />
        </Link>
        <Link
          href="/home/perfil"
          className={`p-2 rounded-xl transition-colors ${
            pathname === "/home/perfil"
              ? "bg-deep-purple-50 text-deep-purple-600"
              : "text-gray-400"
          }`}
        >
          <User className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
}
