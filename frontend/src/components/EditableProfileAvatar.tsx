"use client";

import React from "react";
import { Avatar } from "@material-tailwind/react";
import { User, Pencil } from "lucide-react";

interface EditableProfileAvatarProps {
  avatarUrl?: string | null;
  alt?: string;
  onEdit?: () => void;
  className?: string;
  size?: "md" | "lg" | "xl" | "xxl";
}

export default function EditableProfileAvatar({
  avatarUrl,
  alt = "Avatar do Usuário",
  onEdit,
  className = ""
}: EditableProfileAvatarProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Container Circular Principal */}
      <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-gray-300 overflow-hidden ring-1 ring-gray-100 relative z-10">
        {avatarUrl ? (
          <Avatar
            src={avatarUrl}
            alt={alt}
            size="xxl"
            className="h-full w-full object-cover p-0"
          />
        ) : (
          // Ícone padrão se não tiver foto
          <User size={64} strokeWidth={1.5} />
        )}
      </div>

      {/* Botão de Edição (Lápis) */}
      {/* Só renderiza se a função onEdit for passada */}
      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Evita bolhas de evento indesejadas
            onEdit();
          }}
          className="absolute bottom-1 right-1 bg-brand-purple text-white p-2.5 rounded-full shadow-md hover:bg-brand-purple-dark transition-all transform hover:scale-105 border-2 border-white z-20 cursor-pointer"
          title="Alterar foto"
        >
          <Pencil size={16} />
        </button>
      )}
    </div>
  );
}