import React from "react";
import { User, ChevronRight } from "lucide-react"; // 1. Importei ChevronRight
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";

type SessionListCardProps = {
  therapistName: string;
  patientName: string;
  patientAvatarUrl?: string | null;
  sessionLabel: string;
  roomLabel: string;
  timeLabel: string;
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
      {/* Faixa Superior (Badge) */}
      <div className="absolute top-0 left-0 z-10 max-w-[80%]">
        <div className="bg-brand-purple/10 border-b border-r border-brand-purple/20 px-4 py-1.5 rounded-br-xl rounded-tl-2xl backdrop-blur-sm truncate">
          <Typography
            variant="small"
            className="text-[10px] font-bold text-brand-purple uppercase tracking-widest leading-none whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {therapistName}
          </Typography>
        </div>
      </div>

      <CardBody className="p-5 pt-10 flex items-center gap-4">
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

        {/* Coluna Central: Informações */}
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

        {/* 2. Coluna Direita: Ícone de Ação */}
        <div className="shrink-0 pl-2">
          <div className="text-gray-300 group-hover:text-brand-purple transition-colors duration-300">
            <ChevronRight size={24} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}