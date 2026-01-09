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

  const formatMessage = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <span key={index} className="text-brand-purple font-bold">
            {match[1]}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="sm" 
      className="p-0 overflow-hidden rounded-2xl bg-brand-bg" 
    >
      {/* HEADER */}
      <DialogHeader className="flex items-center justify-between p-4 border-b border-brand-purple/10 bg-white">
        <div className="w-8"></div> 
        <Typography variant="h5" className="font-bold text-center text-brand-dark font-heading">
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

      <DialogBody className="px-4 py-2 max-h-[65vh] overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-6 pb-6">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const styleClasses = getStyleClasses(notif.titulo);
            const displayTitle = notif.titulo || "Aviso"; 
            
            return (
              <div 
                key={notif.id}
                onClick={() => !notif.lida && markAsRead(notif.id)}
                className={`
                  relative border rounded-2xl p-4 pt-6 flex items-center justify-between cursor-pointer transition-all
                  ${!notif.lida 
                    ? "bg-white border-brand-purple/20 shadow-sm" 
                    : "bg-gray-50 border-gray-200 opacity-70 hover:opacity-100"
                  }
                  hover:shadow-md group hover:border-brand-purple/40
                `}
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
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${!notif.lida 
                      ? "bg-brand-purple/10 text-brand-purple" 
                      : "bg-gray-200 text-gray-400"
                    }
                  `}>
                    <User size={20} />
                  </div>

                  <div className="flex flex-col flex-1">
                    <Typography className={`text-sm leading-tight ${!notif.lida ? "text-brand-dark font-medium" : "text-gray-500 font-medium"}`}>
                      {formatMessage(notif.mensagem)}
                    </Typography>
                  </div>
                  
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
              <Typography className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                Fim das notificações
              </Typography>
            </div>
        )}
      </DialogBody>
    </Dialog>
  );
}