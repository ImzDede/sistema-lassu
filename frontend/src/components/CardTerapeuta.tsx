import React from "react";
import { User } from "lucide-react";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

interface CardTerapeutaProps {
  secondaryLabel?: string;
  name: string;
  registration: string;
  avatarUrl?: string | null;
  occupiedSlots: number;
  capacity?: number;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

export default function CardTerapeuta({
  name,
  registration,
  secondaryLabel = "Matrícula",
  avatarUrl,
  occupiedSlots,
  capacity = 5,
  onClick,
  className = "",
  selected = false,
}: CardTerapeutaProps) {
  // Garante limites visuais (0 a capacity)
  const safeOccupied = Math.max(0, Math.min(occupiedSlots, capacity));
  const safeCapacity = Math.max(1, capacity); // Evita divisão por zero se capacity for 0

  return (
    <Card
      onClick={onClick}
      className={`
        w-full shadow-sm border transition-all cursor-pointer group relative overflow-hidden
        ${selected 
          ? "border-brand-purple ring-1 ring-brand-purple bg-brand-purple/5" 
          : "border-gray-200 hover:border-brand-purple/30 hover:shadow-md bg-white"
        }
        ${className}
      `}
    >
      {/* Borda Roxa Sutil no Topo (Opcional, remove se preferir full border) */}
      <div className={`absolute top-0 left-0 w-full h-1 ${selected ? "bg-brand-purple" : "bg-transparent group-hover:bg-brand-purple/20"} transition-colors`} />

      <CardBody className="p-4 flex items-center gap-4">
        {/* 1. Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            <Avatar 
              src={avatarUrl} 
              alt={name} 
              size="md" 
              className="border border-gray-100" 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-purple/10 flex items-center justify-center text-brand-purple">
              <User size={20} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* 2. Informações (Centro) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Typography 
            variant="h6" 
            color="blue-gray" 
            className="font-bold text-sm md:text-base text-brand-dark truncate leading-tight"
          >
            {name}
          </Typography>
          <Typography 
            variant="small" 
            className="text-xs text-gray-500 font-medium truncate mt-0.5"
          >
            {secondaryLabel}: {registration}
          </Typography>
        </div>

        {/* 3. Indicador de Vagas (Direita) */}
        <div className="flex flex-col items-end justify-center gap-1 pl-2">
          <div className="flex gap-1">
            {Array.from({ length: safeCapacity }).map((_, i) => {
              const isOccupied = i < safeOccupied;
              return (
                <div
                  key={i}
                  className={`
                    w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors
                    ${isOccupied ? "bg-brand-purple" : "bg-gray-200"}
                  `}
                />
              );
            })}
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            {safeOccupied}/{safeCapacity} Vagas
          </span>
        </div>
      </CardBody>
    </Card>
  );
}