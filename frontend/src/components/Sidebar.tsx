"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { List, Card, IconButton } from "@material-tailwind/react";
import { Menu, Home, Users, PlusSquare, Calendar, User } from "lucide-react";
import NavItem from "@/components/NavItem";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarDesktopProps {
  isVisible: boolean;
  toggleSidebar: () => void;
}

export default function SidebarDesktop({ isVisible, toggleSidebar }: SidebarDesktopProps) {
  const pathname = usePathname();
  const { isTeacher } = useAuth();

  // Se estiver fechada (isVisible = false), não renderiza nada
  if (!isVisible) return null;

  return (
    <Card className="hidden md:flex flex-col w-64 min-h-screen rounded-none shadow-xl border-r border-white/10 sticky top-0 h-screen bg-brand-purple z-50">
      
      {/* Cabeçalho com Logo e Botão Fechar */}
      <div className="p-4 flex items-center justify-between border-b border-white/20 mb-2">
        <Link href="/home">
          <Image
            src="/lassuLogoVertical.svg"
            // MELHORIA: Alt text descritivo
            alt="Lassu Logo"
            width={120}
            height={40}
            className="w-28 h-auto brightness-0 invert hover:scale-105 transition-transform"
          />
        </Link>
        <IconButton variant="text" color="white" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </IconButton>
      </div>

      {/* Lista de Navegação */}
      <List className="min-w-0 p-3 flex-1 overflow-y-auto">
        <NavItem
          href="/home"
          icon={<Home />}
          label="Início"
          active={pathname === "/home"}
        />
        <NavItem
          href={isTeacher ? "/home/terapeutas" : "/home/pacientes"}
          icon={<Users />}
          label={isTeacher ? "Terapeutas" : "Pacientes"}
          active={pathname.includes(isTeacher ? "terapeutas" : "pacientes")}
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
  );
}