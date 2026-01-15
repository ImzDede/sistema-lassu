import React from "react";
import { User } from "lucide-react";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

type SessionListCardProps = {
  therapistName: string; // Ex: "RAQUEL MENDES"
  patientName: string;   // Ex: "Melissa Saldanha"
  patientAvatarUrl?: string | null;
  
  sessionLabel: string;  // Ex: "1ª Sessão"
  roomLabel: string;     // Ex: "Sala 02"
  timeLabel: string;     // Ex: "09:00"

  onClick?: () => void;
  className?: string;
};

export default function SessionListCard({
  therapistName,
  patientName,
  patientAvatarUrl,
  sessionLabel,
  roomLabel,
  timeLabel,
  onClick,
  className = "",
}: SessionListCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
        w-full relative overflow-visible mt-4 group
        border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl
        ${className}
      `}
    >
      {/* Faixa Superior (Badge) - Centralizada e Sobreposta (Overlay) */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 max-w-[80%]">
        <div className="bg-brand-purple/10 border border-brand-purple/20 px-4 py-1 rounded-full shadow-sm backdrop-blur-sm truncate">
          <Typography
            variant="small"
            className="text-[10px] font-bold text-brand-purple uppercase tracking-widest leading-none whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {therapistName}
          </Typography>
        </div>
      </div>

      <CardBody className="p-5 flex items-center gap-4">
        {/* Coluna Esquerda: Avatar */}
        <div className="shrink-0">
          {patientAvatarUrl ? (
            <Avatar
              src={patientAvatarUrl}
              alt={patientName}
              size="lg"
              className="border-2 border-brand-purple/10 p-0.5 box-border bg-white"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-surface border border-brand-purple/10 flex items-center justify-center text-brand-purple/60 group-hover:text-brand-purple transition-colors">
              <User size={24} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Coluna Direita: Informações */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          {/* Nome do Paciente */}
          <Typography
            variant="h5"
            className="font-bold text-brand-dark text-base md:text-lg truncate leading-tight"
          >
            {patientName}
          </Typography>
          
          {/* Linha de Detalhes com Separadores */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500 text-xs md:text-sm font-medium">
            <span className="text-brand-purple font-semibold whitespace-nowrap">
              {sessionLabel}
            </span>
            
            <span className="hidden xs:inline-block w-1 h-1 bg-gray-300 rounded-full" />
            
            <span className="whitespace-nowrap">
              {roomLabel}
            </span>
            
            <span className="hidden xs:inline-block w-1 h-1 bg-gray-300 rounded-full" />
            
            <span className="whitespace-nowrap text-brand-dark">
              {timeLabel}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}