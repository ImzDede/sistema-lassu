"use client";

import Link from "next/link";
import React from "react";
import { LucideIcon } from "lucide-react";

interface CardCadastroProps {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const CardCadastro = ({ label, href, icon: Icon, color }: CardCadastroProps) => {
  return (
    <Link href={href} className="w-full">
      <div 
        className="group relative flex items-center w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border cursor-pointer p-4 md:p-6 lg:p-8"
        style={{ borderColor: color }}
      >
        
        {/* Faixa lateral esquerda */}
        <div 
          className="absolute left-0 top-0 w-4 h-full shrink-0 transition-opacity duration-300 group-hover:opacity-80"
          style={{ backgroundColor: color }}
        />

        <div className="flex-1 flex items-center justify-center gap-3 pr-4">
          {/* Ícone colorido */}
          <div className="p-2 rounded-full transition-colors group-hover:bg-gray-50">
             <Icon 
                size={24} 
                strokeWidth={2.5}
                style={{ color: color }}
             />
          </div>
          
          {/* Texto colorido */}
          <span 
            className="font-bold uppercase text-sm tracking-wider"
            style={{ color: color }}
          >
            {label}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CardCadastro;