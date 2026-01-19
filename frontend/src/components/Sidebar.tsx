"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { List, Card, IconButton } from "@material-tailwind/react";
import { Menu, Users, PlusSquare, Home, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SidebarDesktopProps {
  isVisible: boolean;
  toggleSidebar: () => void;
  user?: any;
}

function NavItem({ href, icon, label, active, activeTextClass }: any) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-1
          ${
            active
              ? `bg-white shadow-md font-bold ${activeTextClass}`
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <div className={active ? "opacity-100" : "opacity-80"}>{icon}</div>
        <span className="tracking-wide uppercase text-sm">{label}</span>
      </div>
    </Link>
  );
}

export default function SidebarDesktop({ isVisible, toggleSidebar }: SidebarDesktopProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { bgClass, textClass } = useAppTheme();

  if (!isVisible || !user) return null;

  const cadastroHref = user.permAdmin ? "/home/cadastro/extensionista" : "/home/cadastro";
  const canAccessTherapists = !!(user.permAdmin || user.permCadastro); // ✅

  return (
    <Card
      className={`hidden lg:flex flex-col w-72 min-h-screen rounded-none shadow-xl border-r border-white/10 sticky top-0 h-screen z-50 transition-colors duration-500 ease-in-out ${bgClass}`}
    >
      <div className="p-6 flex items-center justify-between border-b border-white/10 mb-2">
        <Link href="/home">
          <Image
            src="/lassuLogoVertical.svg"
            alt="Lassu Logo"
            width={120}
            height={40}
            className="w-28 h-auto brightness-0 invert hover:scale-105 transition-transform"
            priority
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
          activeTextClass={textClass}
        />

        {!user.permAdmin && (
          <NavItem
            href="/home/pacientes"
            icon={<Users size={20} />}
            label="Pacientes"
            active={pathname.includes("/home/pacientes")}
            activeTextClass={textClass}
          />
        )}

        {canAccessTherapists && (
          <NavItem
            href="/home/terapeutas"
            icon={<Users size={20} />}
            label="Terapeutas"
            active={pathname.includes("/home/terapeutas")}
            activeTextClass={textClass}
          />
        )}

        <NavItem
          href={cadastroHref}
          icon={<PlusSquare size={20} />}
          label="Cadastro"
          active={pathname.startsWith("/home/cadastro")}
          activeTextClass={textClass}
        />

        <NavItem
          href="/home/perfil"
          icon={<UserIcon size={20} />}
          label="Perfil"
          active={pathname.startsWith("/home/perfil")}
          activeTextClass={textClass}
        />
      </List>

      <div className="p-4 border-t border-white/10 text-white/40 text-xs text-center">
        Sistema LASSU © 2026
      </div>
    </Card>
  );
}
