"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody, Typography, IconButton, Chip } from "@material-tailwind/react";
import { X, Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Session } from "@/types/sessao";

interface SessionListModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  sessions: Session[];
}

export default function SessionListModal({ open, onClose, date, sessions }: SessionListModalProps) {
  if (!date) return null;

  const formattedDate = format(date, "dd 'de' MMMM", { locale: ptBR });
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const sortedSessions = [...sessions].sort((a, b) => a.hora - b.hora);

  return (
    <Dialog open={open} handler={onClose} size="sm" className="rounded-xl overflow-hidden">
      <DialogHeader className="flex items-center justify-between border-b border-gray-100 p-4 bg-brand-bg">
        <div className="flex items-center gap-2">
          <Calendar className="text-brand-purple" size={20} />
          <Typography variant="h6" color="blue-gray" className="capitalize">
            {formattedDate}
          </Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
          <X size={20} />
        </IconButton>
      </DialogHeader>

      <DialogBody className="p-0 max-h-[60vh] overflow-y-auto">
        {isWeekend ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Typography variant="h6" className="text-gray-400 mb-2">Fim de Semana</Typography>
            <Typography className="text-gray-400 text-sm">O laboratório não funciona aos sábados e domingos.</Typography>
          </div>
        ) : sortedSessions.length > 0 ? (
          <div className="flex flex-col">
            {sortedSessions.map((session) => {
                const startHour = session.hora.toString().padStart(2, '0');
                const endHour = (session.hora + 1).toString().padStart(2, '0');
                const timeLabel = `${startHour}:00 - ${endHour}:00`;
                const nomeTerapeuta = session.profissionalNome || "Desconhecido";
                const nomePaciente = session.pacienteNome || "Não informado";

                return (
                  <div key={session.id} className="flex gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center">
                    
                    {/* Coluna Horário */}
                    <div className="flex flex-col items-center justify-center min-w-[7rem] p-2 bg-brand-purple/5 rounded-lg border border-brand-purple/10 h-fit">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock size={14} className="text-brand-purple" />
                        <span className="text-[10px] uppercase font-bold text-brand-purple/70">Horário</span>
                      </div>
                      <span className="font-bold text-brand-dark text-sm whitespace-nowrap">
                        {timeLabel}
                      </span>
                    </div>

                    {/* Coluna Detalhes */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <Typography className="font-bold text-brand-dark text-sm truncate">
                          {nomeTerapeuta}
                        </Typography>
                        <Chip 
                            value={`Sala ${session.sala}`} 
                            size="sm" 
                            variant="ghost" 
                            className="rounded-full text-[10px] h-6 px-2 shrink-0" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <User size={12} />
                        <span className="truncate">Paciente: {nomePaciente}</span>
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Typography className="text-gray-400 font-medium">
              Nenhuma sessão marcada para este dia.
            </Typography>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}