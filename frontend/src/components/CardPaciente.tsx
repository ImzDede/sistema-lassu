"use client";

import React, { ReactNode } from "react";
import { User, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

export type PatientStatus = "in_progress" | "completed" | "dropped";

interface CardPacienteProps {
  name: string;
  age?: number | string | null;
  avatarUrl?: string | null;
  progressPercent?: number; // Tornou-se opcional
  status?: PatientStatus | null;
  onClick?: () => void;
  rightAccessory?: ReactNode;
  className?: string;
  showPercentLabel?: boolean;
}

const statusConfig = {
  in_progress: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  dropped: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
};

export default function CardPaciente({
  name,
  age,
  avatarUrl,
  progressPercent, // Não tem mais valor padrão fixo
  status,
  onClick,
  rightAccessory,
  className = "",
  showPercentLabel = true,
}: CardPacienteProps) {
  const StatusIcon = status ? statusConfig[status].icon : null;
  
  // Só calcula se existir
  const safeProgress = progressPercent !== undefined ? Math.min(100, Math.max(0, progressPercent)) : 0;

  const isClickable = typeof onClick === "function";

  return (
    <Card
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (!isClickable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`
        w-full shadow-sm border border-gray-200 bg-white relative overflow-visible
        transition-all
        ${isClickable ? "cursor-pointer hover:shadow-md hover:border-brand-purple/30" : "cursor-default"}
        ${className}
      `}
    >
      {status && StatusIcon && (
        <div
          className={`
            absolute -top-2 -right-2 z-10 p-1 rounded-full shadow-sm border
            ${statusConfig[status].bg} ${statusConfig[status].border}
          `}
        >
          <StatusIcon size={16} className={statusConfig[status].color} />
        </div>
      )}

      <CardBody className="p-4 flex items-center gap-4">
        <div className="shrink-0 relative">
          {avatarUrl ? (
            <Avatar
              src={avatarUrl}
              alt={name}
              size="md"
              className="border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              <User size={22} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <Typography
              variant="h6"
              className="font-bold text-brand-dark text-sm md:text-base truncate leading-tight"
            >
              {name}
            </Typography>

            {age !== null && age !== undefined && (
              <Typography
                variant="small"
                className="text-gray-400 text-xs font-medium"
              >
                {age} anos
              </Typography>
            )}
          </div>

          {/* SÓ RENDERIZA A BARRA SE TIVER PROGRESSO DEFINIDO */}
          {progressPercent !== undefined && (
            <div className="w-full flex items-center gap-3 mt-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-purple rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${safeProgress}%` }}
                />
              </div>

              {showPercentLabel && (
                <span className="text-[10px] font-bold text-brand-purple w-8 text-right">
                  {Math.round(safeProgress)}%
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className="shrink-0 pl-2 text-gray-300"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {rightAccessory || <ChevronRight size={20} />}
        </div>
      </CardBody>
    </Card>
  );
}
