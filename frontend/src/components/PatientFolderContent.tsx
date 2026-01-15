import React, { ReactNode } from "react";
import { Edit2, Eye, Clock, ChevronRight } from "lucide-react";
import { Card, Typography } from "@material-tailwind/react";

// Variantes suportadas
type FolderItemVariant = "simple" | "progress" | "session_admin";

interface FolderItemCardProps {
  title: string;
  subtitle?: ReactNode; // Aceita string ou JSX
  variant?: FolderItemVariant;

  // Progresso
  progress?: number; // 0 a 100

  // Ícone Overlay (ex: relógio)
  highlight?: boolean;

  // Ações
  icon?: ReactNode; // Ícone principal à esquerda (opcional)
  onEdit?: () => void;
  onView?: () => void;
  onClick?: () => void;

  // Affordance (>)
  showChevron?: boolean;

  className?: string;
}

export function FolderItemCard({
  title,
  subtitle,
  variant = "simple",
  progress = 0,
  highlight = false,
  icon,
  onEdit,
  onView,
  onClick,
  showChevron = false,
  className = "",
}: FolderItemCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <Card
      onClick={onClick}
      className={`
        w-full p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-visible
        ${highlight ? "border-l-4 border-l-brand-purple" : ""}
        ${isClickable ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
    >
      {/* Badge Overlay (ex: Relógio no canto superior direito) */}
      {highlight && (
        <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full border border-gray-100 shadow-sm z-10 text-brand-purple">
          <Clock size={14} />
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Ícone Opcional à Esquerda */}
        {icon && (
          <div className="text-brand-purple bg-brand-purple/5 p-2 rounded-lg">
            {icon}
          </div>
        )}

        {/* Conteúdo Central */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 min-w-0">
              <Typography variant="h6" className="text-sm font-bold text-brand-dark truncate">
                {title}
              </Typography>

              {subtitle && (
                <div className="text-xs text-gray-500 font-medium truncate">
                  {subtitle}
                </div>
              )}
            </div>

            {/* Ações Rápidas (Direita) */}
            <div className="flex gap-2 pl-2 shrink-0 items-center">
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="p-1.5 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-full transition-colors"
                  aria-label="Visualizar"
                >
                  <Eye size={16} />
                </button>
              )}

              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  aria-label="Editar"
                >
                  <Edit2 size={16} />
                </button>
              )}

              {(showChevron && isClickable) && (
                <div className="p-1.5 text-gray-300">
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          </div>

          {/* Barra de Progresso */}
          {variant === "progress" && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-purple rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-brand-purple">
                {Math.round(Math.min(100, Math.max(0, progress)))}%
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}