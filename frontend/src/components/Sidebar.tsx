"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { List, Card, IconButton } from "@material-tailwind/react";
import { Menu, Users, User, PlusSquare, Home } from "lucide-react";
import { User as UserType } from "@/types/usuarios";

interface SidebarDesktopProps {
  isVisible: boolean;
  toggleSidebar: () => void;
  user: UserType | null;
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium mb-1
          ${
            active
              ? "bg-white text-brand-purple shadow-md"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <div className={active ? "text-brand-purple" : "text-white"}>{icon}</div>
        <span className="tracking-wide uppercase text-sm font-bold">{label}</span>
      </div>
    </Link>
  );
}

export default function SidebarDesktop({ isVisible, toggleSidebar, user }: SidebarDesktopProps) {
  const pathname = usePathname();

  if (!isVisible || !user) return null;

  return (
    <Card className="hidden lg:flex flex-col w-72 min-h-screen rounded-none shadow-xl border-r border-white/10 sticky top-0 h-screen bg-brand-purple z-50">
      
      <div className="p-6 flex items-center justify-between border-b border-white/10 mb-2">
        <Link href="/home">
          <Image
            src="/lassuLogoVertical.svg"
            alt="Lassu Logo"
            width={120}
            height={40}
            className="w-28 h-auto brightness-0 invert hover:scale-105 transition-transform"
          />
        </Link>
        <IconButton variant="text" color="white" onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-white" />
        </IconButton>
      </div>

      <List className="min-w-0 p-3 flex-1 overflow-y-auto bg-transparent shadow-none">
        
        <NavItem
          href="/home"
          icon={<Home size={20} />}
          label="Início"
          active={pathname === "/home"}
        />

        {/* PERMISSÕES ESTRITAS */}
        
        {/* Pacientes: Apenas Terapeuta (e NÃO Admin) */}
        {user.permAtendimento && !user.permAdmin && (
          <NavItem
            href="/home/pacientes"
            icon={<Users size={20} />}
            label="Pacientes"
            active={pathname.includes("/home/pacientes")}
          />
        )}

        {/* Terapeutas: Apenas Admin */}
        {user.permAdmin && (
          <NavItem
            href="/home/terapeutas"
            icon={<Users size={20} />}
            label="Terapeutas"
            active={pathname.includes("/home/terapeutas")}
          />
        )}

        <NavItem
          href="/home/cadastro"
          icon={<PlusSquare size={20} />}
          label="Cadastro"
          active={pathname.startsWith("/home/cadastro")}
        />

        <NavItem
          href="/home/perfil"
          icon={<User size={20} />}
          label="Perfil"
          active={pathname === "/home/perfil"}
        />
      </List>
      
      <div className="p-4 border-t border-white/10 text-white/40 text-xs text-center">
        Sistema LASSU © 2024
      </div>
    </Card>
  );
}