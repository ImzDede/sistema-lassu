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
  accentColor?: string;
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
  accentColor = "brand-purple",
}: CardTerapeutaProps) {
  const safeOccupied = Math.max(0, Math.min(occupiedSlots, capacity));
  const safeCapacity = Math.max(1, capacity);

  return (
    <Card
      onClick={onClick}
      className={`
        w-full shadow-sm border transition-all cursor-pointer group relative overflow-hidden
        ${selected 
          ? `border-${accentColor} ring-1 ring-${accentColor} bg-${accentColor}/5` 
          : `border-gray-200 hover:border-${accentColor}/30 hover:shadow-md bg-white`
        }
        ${className}
      `}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${selected ? `bg-${accentColor}` : `bg-transparent group-hover:bg-${accentColor}/20`} transition-colors`} />

      <CardBody className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
        <div className="shrink-0">
          {avatarUrl ? (
            <Avatar 
              src={avatarUrl} 
              alt={name} 
              size="md" 
              className="border border-gray-100" 
            />
          ) : (
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-${accentColor}/20 flex items-center justify-center text-${accentColor}`}>
              <User size={20} strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Typography 
            variant="h6" 
            color="blue-gray" 
            className="font-bold text-sm md:text-base text-brand-dark truncate leading-tight"
          >
            {name}
          </Typography>
          
          <div className="flex flex-col md:flex-row md:items-center text-xs text-gray-500 font-medium mt-0.5 flex-wrap">
             <span className="md:mr-1 whitespace-nowrap">{secondaryLabel}:</span>
             <span className="text-brand-dark break-words line-clamp-1 md:line-clamp-none">{registration}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 pl-1 md:pl-2 shrink-0">
          <div className="flex gap-0.5 md:gap-1">
            {Array.from({ length: safeCapacity }).map((_, i) => {
              const isOccupied = i < safeOccupied;
              return (
                <div
                  key={i}
                  className={`
                    w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full transition-colors
                    ${isOccupied ? `bg-${accentColor}` : "bg-gray-200"}
                  `}
                />
              );
            })}
          </div>
          <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            {safeOccupied}/{safeCapacity} pacientes
          </span>
        </div>
      </CardBody>
    </Card>
  );
}