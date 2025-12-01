"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, PlusSquare, Calendar, User, Bell, LogOut } from "lucide-react";
import NavItem from "@/components/NavItem";
import { parseCookies, destroyCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import Button from "@/components/Button";
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
    destroyCookie(undefined, 'lassuauth.token', { path: '/' });

    router.push('/');
  }

  useEffect(() => {
    const { 'lassuauth.token': token } = parseCookies();

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const tempoAtual = Date.now() / 1000;

        if (decoded.exp && decoded.exp < tempoAtual) {
            console.log("Token expirado (Data)! Deslogando...");
            handleLogout();
            return;
        }

        if (decoded.nome) {
            setNomeUsuario(decoded.nome);
        }

        axios.get('http://localhost:3001/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            if (response.data.nome) {
                setNomeUsuario(response.data.nome);
            }
        })
        .catch((error) => {
            console.error("Validação no backend falhou:", error);
            handleLogout();
        });

      } catch (error) {
        console.error("Token inválido localmente:", error);
        handleLogout();
      }
    } else {
        router.push('/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* === SIDEBAR (Apenas Desktop) === */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-200 min-h-screen border-r border-gray-300">
        <div className="p-6 flex justify-center">
          <Link href="/home">
            <Image
              src="/logoVertical.svg"
              alt="Logo"
              width={150}
              height={50}
              className="w-auto h-16"
            />
          </Link>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          <NavItem href="/home" icon={<Home />} label="PÁGINA INICIAL" active={pathname === "/home"} />
          <NavItem href="/home/pacientes" icon={<Users />} label="PACIENTES" active={pathname === "/home/pacientes"} />
          <NavItem href="/home/cadastro" icon={<PlusSquare />} label="CADASTRO" active={pathname === "/home/cadastro"} />
          <NavItem href="/home/calendario" icon={<Calendar />} label="CALENDÁRIO" active={pathname === "/home/calendario"} />
          <NavItem href="/home/perfil" icon={<User />} label="MEU PERFIL" active={pathname === "/home/perfil"} />
        </nav>

        {/* Botão Sair Desktop */}
        <div className="mt-auto p-6 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              SAIR
            </Button>
        </div>
      </aside>

      {/* === CONTEÚDO PRINCIPAL === */}
      <main className="flex-1 flex flex-col relative pb-20 md:pb-0">
        
        <header className="flex justify-between items-center bg-white p-4 md:p-8">
          <div>
            <div className="block md:hidden">
              <Link href="/home">
                <Image
                  src="/logoLassu.svg"
                  alt="Logo"
                  width={120}
                  height={120}
                  className="w-12 h-auto"
                />
              </Link>
            </div>

            <h1 className="hidden md:block text-xl font-bold uppercase">
              {nomeUsuario ? `Bem-vindo ${nomeUsuario}` : "Bem-vindo"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Botão Sair Mobile */}
            <button onClick={handleLogout} className="md:hidden text-gray-600">
                <LogOut className="w-6 h-6" />
            </button>

            <div className="relative cursor-pointer">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-8">{children}</div>
      </main>

      {/* === BOTTOM NAV (Apenas Mobile) === */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-black flex justify-around py-4 z-50">
        <Link href="/home" className={pathname === "/home" ? "text-black" : "text-gray-400"}>
          <Home className="w-8 h-8" />
        </Link>
        <Link href="/home/pacientes" className={pathname === "/home/pacientes" ? "text-black" : "text-gray-400"}>
          <Users className="w-8 h-8" />
        </Link>
        <Link href="/home/cadastro" className={pathname === "/home/cadastro" ? "text-black" : "text-gray-400"}>
          <PlusSquare className="w-8 h-8" />
        </Link>
        <Link href="/home/calendario" className={pathname === "/home/calendario" ? "text-black" : "text-gray-400"}>
          <Calendar className="w-8 h-8" />
        </Link>
        <Link href="/home/perfil" className={pathname === "/home/perfil" ? "text-black" : "text-gray-400"}>
          <User className="w-8 h-8" />
        </Link>
      </nav>
    </div>
  );
}