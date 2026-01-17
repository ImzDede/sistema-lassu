"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusSquare, User as UserIcon } from "lucide-react";
import { User } from "@/types/usuarios";
import { useAppTheme } from "@/hooks/useAppTheme";

interface BottomNavProps {
  user: User | null;
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();
  const { bgClass, textClass } = useAppTheme();

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
    <nav 
      className={`
        lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pb-3 pt-3 z-50 
        border-t border-white/10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] 
        transition-colors duration-500 ease-in-out
        ${bgClass}
      `}
    >
      {navItems.map((item) => {
        if (!item.show) return null;

        const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-full gap-1 group"
          >
            {/* Ícone */}
            <div 
              className={`
                p-1.5 rounded-full transition-all duration-300
                ${isActive 
                  ? `bg-white shadow-sm ${textClass}`
                  : "text-white/70 group-hover:text-white group-hover:bg-white/10"
                }
              `}
            >
              <item.icon 
                className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} 
              />
            </div>
            
            {/* Texto */}
            <span 
              className={`
                text-[10px] font-medium transition-colors
                ${isActive 
                  ? "text-white font-bold"
                  : "text-white/70 group-hover:text-white"
                }
              `}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}