"use client";

import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { X, ChevronRight, User } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDialog({ open, onClose }: NotificationDialogProps) {
  const { notifications, markAsRead } = useNotifications();

  // Função para definir cores baseada no título
  const getStyleClasses = (title?: string) => {
    const t = (title || "").toLowerCase();
    
    if (t.includes("nova") || t.includes("novo") || t.includes("cadastrada")) {
      return "bg-brand-purple border-brand-purple"; 
    }
    if (t.includes("anamnese") || t.includes("síntese")) {
      return "bg-brand-peach border-brand-peach"; 
    }
    if (t.includes("sessão marcada") || t.includes("atribuída") || t.includes("vinculada")) {
      return "bg-brand-pink border-brand-pink"; 
    }
    return "bg-gray-400 border-gray-400"; 
  };

  // Procura padrões [Texto](link) e transforma o Texto em Roxo
  const formatMessage = (text: string) => {
    // Regex para encontrar [Nome](qualquer-coisa)
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, index) => {
      // Verifica se essa parte é o padrão [Nome](link)
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      
      if (match) {
        // Se for, retorna só o Nome (match[1]) colorido de ROXO
        return (
          <span key={index} className="text-brand-purple font-bold">
            {match[1]}
          </span>
        );
      }
      // Se for texto normal, retorna normal
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="sm" 
      className="p-0 overflow-hidden rounded-2xl" 
      placeholder={undefined}
    >
      {/* HEADER */}
      <DialogHeader placeholder={undefined} className="flex items-center justify-between p-4 border-b border-gray-50">
        <div className="w-8"></div> 
        <Typography variant="h5" color="blue-gray" className="font-bold text-center">
          Notificações
        </Typography>
        <div className="w-8 flex justify-end">
          <IconButton 
            variant="text" 
            size="sm" 
            onClick={onClose} 
            className="text-gray-400 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </IconButton>
        </div>
      </DialogHeader>

      <DialogBody className="px-4 py-2 max-h-[65vh] overflow-y-auto custom-scrollbar flex flex-col gap-5 pt-6 pb-6">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const styleClasses = getStyleClasses(notif.titulo);
            const displayTitle = notif.titulo || "Aviso"; 
            
            return (
              <div 
                key={notif.id}
                onClick={() => !notif.lida && markAsRead(notif.id)}
                className={`
                  relative border-2 rounded-2xl p-4 pt-6 flex items-center justify-between cursor-pointer transition-all
                  ${!notif.lida 
                    ? "bg-brand-surface border-opacity-100 shadow-sm" 
                    : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
                  }
                  hover:shadow-md group
                `}
                style={{ borderColor: notif.lida ? '#E5E7EB' : undefined }} 
              >
                {/* BADGE FLUTUANTE */}
                <div 
                  className={`
                    absolute -top-2.5 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm z-10
                    ${!notif.lida ? styleClasses : "bg-gray-400 border-gray-400"}
                  `}
                >
                  {displayTitle}
                </div>

                <div className="flex items-center gap-4 w-full">
                  {/* Avatar */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${!notif.lida 
                      ? "bg-brand-purple/10 text-brand-purple" 
                      : "bg-gray-200 text-gray-400"
                    }
                  `}>
                    <User size={20} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-col flex-1">
                    <Typography className={`text-sm leading-tight ${!notif.lida ? "text-brand-dark font-medium" : "text-gray-500 font-medium"}`}>
                      {formatMessage(notif.mensagem)}
                    </Typography>
                  </div>
                  
                  {/* Seta */}
                  <ChevronRight size={18} className={`shrink-0 transition-colors ${!notif.lida ? "text-brand-purple" : "text-gray-300"}`} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
            <Typography className="text-gray-400 text-sm font-medium">
              Não há novas notificações
            </Typography>
          </div>
        )}
        
        {notifications.length > 0 && (
           <div className="py-2 text-center">
             <Typography className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">
               Fim das notificações
             </Typography>
           </div>
        )}
      </DialogBody>
    </Dialog>
  );
}