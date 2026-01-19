"use client";

import React from "react";
import { Typography, Progress } from "@material-tailwind/react";
import { Edit2, Eye } from "lucide-react";

interface FolderItemCardProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  onEdit?: () => void;
  onView?: () => void;
  highlight?: boolean;
  variant?: "default" | "progress";
  progress?: number;
  downloadComponent?: React.ReactNode;
  progressColorClass?: string; 
}

export function FolderItemCard({
  title,
  subtitle,
  icon,
  onEdit,
  onView,
  highlight = false,
  variant = "default",
  progress = 0,
  downloadComponent,
  progressColorClass, 
}: FolderItemCardProps) {
  return (
    <div
      className={`
        flex items-center justify-between p-4 bg-white border-l-4 transition-all
        ${highlight ? "border-l-brand-purple shadow-sm" : "border-l-transparent hover:border-l-gray-300"}
        border-y border-r border-gray-100 first:rounded-t-lg last:rounded-b-lg mb-[-1px]
      `}
    >
      {/* Container Esquerdo (Ícone + Textos + Barra) */}
      <div className="flex items-center gap-4 flex-1 w-full min-w-0">
        <div className="flex flex-col flex-1 w-full">
          <Typography variant="h6" color="blue-gray" className="font-bold text-sm truncate">
            {title}
          </Typography>
          
          {variant === "default" && subtitle && (
            <Typography variant="small" className="text-xs text-gray-500 font-normal mt-0.5 truncate">
              {subtitle}
            </Typography>
          )}

          {variant === "progress" && (
            <div className="w-full mt-2 flex items-center gap-3 pr-4">
              <Progress 
                value={progress} 
                size="sm" 
                className={`bg-gray-100 rounded-full flex-1 ${progressColorClass || "[&>div]:bg-brand-purple"}`} 
              />
              <Typography variant="small" className="text-xs font-bold text-gray-600 min-w-[35px] text-right">
                {Math.round(progress)}%
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* Container Direito (Ações) */}
      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
        {downloadComponent}

        {/* Botão de Edição (Lápis) */}
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-full transition-colors text-gray-600 hover:text-brand-purple hover:bg-brand-purple/10"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
        )}

        {/* Botão de Visualização (Olho) */}
        {onView && !onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-2 rounded-full transition-colors text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10"
            title="Visualizar"
          >
            <Eye size={20} />
          </button>
        )}
      </div>
    </div>
  );
}