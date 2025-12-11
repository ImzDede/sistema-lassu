"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusSquare, Calendar, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { isTeacher } = useAuth();

  const navItems = [
    { href: "/home", icon: Home, label: "Início" },
    { 
      href: isTeacher ? "/home/terapeutas" : "/home/pacientes", 
      icon: Users, 
      label: isTeacher ? "Terapeutas" : "Pacientes" 
    },
    { href: "/home/cadastro", icon: PlusSquare, label: "Cadastro" },
    { href: "/home/calendario", icon: Calendar, label: "Calendário" },
    { href: "/home/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#F5F2FA] flex justify-around items-center pb-4 pt-3 z-50 border-t border-gray-200">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-full gap-1"
          >
            {/* Ícone com bolinha de fundo se estiver ativo */}
            <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-brand-purple/20 text-brand-dark" : "text-gray-600"}`}>
              <item.icon 
                className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} 
              />
            </div>
            
            {/* Texto */}
            <span className={`text-[10px] font-medium ${isActive ? "text-brand-dark font-bold" : "text-gray-500"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}