"use client";

import React from "react";
import { Avatar } from "@material-tailwind/react";
import { User, Pencil } from "lucide-react";

interface EditableProfileAvatarProps {
  avatarUrl?: string | null;
  alt?: string;
  onEdit?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  editable?: boolean;
  accentColorClass?: string;
}

export default function EditableProfileAvatar({
  avatarUrl,
  alt = "Avatar",
  onEdit,
  className = "",
  size = "xxl",
  editable = false,
  accentColorClass = "brand-purple"
}: EditableProfileAvatarProps) {
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    xxl: "w-24 h-24 md:w-32 md:h-32"
  };

  const containerSize = sizeClasses[size] || sizeClasses.xxl;

  return (
    <div className={`relative group ${className}`}>
      <div className={`${containerSize} rounded-full bg-brand-surface border-4 border-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-gray-100 relative z-10`}>
        {avatarUrl ? (
          <Avatar
            src={avatarUrl}
            alt={alt}
            size={size}
            className="h-full w-full object-cover p-0"
          />
        ) : (
          // Ícone padrão agora usa a cor do tema
          <div className={`flex items-center justify-center w-full h-full bg-gray-50 text-${accentColorClass}/50`}>
             <User className="w-1/2 h-1/2" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {editable && onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          // Botão de lápis agora usa a cor do tema
          className={`absolute bottom-0 right-0 bg-${accentColorClass} text-white p-2 rounded-full shadow-md hover:brightness-110 transition-all transform hover:scale-105 border-2 border-white z-20 cursor-pointer`}
          title="Alterar foto"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}