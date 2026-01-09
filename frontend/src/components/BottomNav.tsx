"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusSquare, User as UserIcon } from "lucide-react";
import { User } from "@/types/usuarios";

interface BottomNavProps {
  user: User | null;
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { 
      href: "/home", 
      icon: Home, 
      label: "Início",
      show: true 
    },
    { 
      href: "/home/pacientes", 
      icon: Users, 
      label: "Pacientes",
      show: user.permAtendimento && !user.permAdmin
    },
    { 
      href: "/home/terapeutas", 
      icon: Users, 
      label: "Terapeutas",
      show: user.permAdmin
    },
    { 
      href: "/home/cadastro", 
      icon: PlusSquare, 
      label: "Cadastro",
      show: true
    },
    { 
      href: "/home/perfil", 
      icon: UserIcon, 
      label: "Perfil",
      show: true 
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-brand-bg flex justify-around items-center pb-4 pt-3 z-50 border-t border-brand-purple/10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        if (!item.show) return null;

        const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-full gap-1"
          >
            <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-brand-purple/10 text-brand-purple" : "text-gray-400"}`}>
              <item.icon 
                className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} 
              />
            </div>
            
            <span className={`text-[10px] font-medium ${isActive ? "text-brand-purple font-bold" : "text-gray-400"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}