"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { X, ChevronRight, User, Trash2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import Button from "@/components/Button";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDialog({ open, onClose }: NotificationDialogProps) {
  const router = useRouter();
  const { notifications, markAsRead, deleteNotification, loadMore, hasMore, loading } = useNotifications();

  // Função robusta para extrair a rota
  const getTargetRoute = (message: string) => {
    if (!message) return null;

    // 1. Tenta encontrar rota de paciente: (patient:ID)
    // Aceita espaços opcionais: (patient: 123)
    const patientMatch = message.match(/\(patient:\s*([^)]+)\)/i);
    if (patientMatch?.[1]) {
        return `/home/pacientes/${patientMatch[1].trim()}`;
    }

    // 2. Tenta encontrar rota de sessão: (session:ID)
    const sessionMatch = message.match(/\(session:\s*([^)]+)\)/i);
    if (sessionMatch?.[1]) {
        return `/home/sessoes/${sessionMatch[1].trim()}`; // Redireciona para detalhes da sessão
    }

    // 3. Fallback: Procura se existe alguma URL direta tipo (/home/...)
    const linkMatch = message.match(/\((\/home\/[^)]+)\)/);
    if (linkMatch?.[1]) {
        return linkMatch[1];
    }

    return null;
  };

  // Formata a mensagem para exibição
  const formatMessage = (text: string) => {
    if (!text) return "";
    
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, index) => {
      // Procura o padrão markdown [Texto](Link)
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      
      if (match) {
        // match[1] = Texto visível (ex: Maria)
        return (
          <span key={index} className="text-brand-purple font-bold">
            {match[1]}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleNotificationClick = (notif: any) => {
    // 1. Marca como lida visualmente e no back
    if (!notif.lida) {
        markAsRead(notif.id);
    }

    // 2. Tenta encontrar a rota
    const route = getTargetRoute(notif.mensagem || "");
    
    if (route) {
      onClose();
      router.push(route);
    }
  };

  const getStyleClasses = (title?: string) => {
    const t = (title || "").toLowerCase();
    if (t.includes("nova") || t.includes("novo") || t.includes("cadastrada")) return "bg-brand-purple border-brand-purple"; 
    if (t.includes("anamnese") || t.includes("síntese")) return "bg-brand-peach border-brand-peach"; 
    if (t.includes("sessão") || t.includes("atribuída")) return "bg-brand-pink border-brand-pink"; 
    return "bg-gray-400 border-gray-400"; 
  };

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="sm" 
      className="p-0 overflow-hidden rounded-2xl bg-brand-bg flex flex-col h-[85vh] md:h-auto md:max-h-[80vh]" 
    >
      <DialogHeader className="flex items-center justify-between p-4 border-b border-brand-purple/10 bg-white shrink-0">
        <div className="w-8"></div> 
        <Typography variant="h5" className="font-bold text-center text-brand-dark font-heading">
          Notificações
        </Typography>
        <div className="w-8 flex justify-end">
          <IconButton variant="text" size="sm" onClick={onClose} className="text-gray-400 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </IconButton>
        </div>
      </DialogHeader>

      <DialogBody className="px-4 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-3 pt-6 pb-6 flex-1">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notif) => {
              const styleClasses = getStyleClasses(notif.titulo);
              const displayTitle = notif.titulo || "Aviso"; 
              const hasLink = !!getTargetRoute(notif.mensagem || "");
              
              return (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`
                    relative border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all shrink-0
                    ${!notif.lida 
                      ? "bg-white border-brand-purple/20 shadow-sm" 
                      : "bg-gray-50 border-gray-200 opacity-70 hover:opacity-100"
                    }
                    hover:shadow-md group hover:border-brand-purple/40
                  `}
                >
                  {/* Badge e Botão Deletar (Mobile) */}
                  <div className="flex justify-between items-start w-full">
                    <div className={`
                        px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm
                        ${!notif.lida ? styleClasses : "bg-gray-400 border-gray-400"}
                      `}>
                      {displayTitle}
                    </div>
                    
                    {/* Botão Deletar Mobile */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="p-1 -mt-1 -mr-1 text-gray-300 hover:text-red-500 transition-colors md:hidden"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Conteúdo Principal */}
                  <div className="flex items-start gap-4">
                    {/* Ícone */}
                    <div className={`
                      hidden sm:flex w-10 h-10 rounded-full items-center justify-center shrink-0 transition-colors
                      ${!notif.lida ? "bg-brand-purple/10 text-brand-purple" : "bg-gray-200 text-gray-400"}
                    `}>
                      <User size={20} />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <Typography className={`text-sm leading-snug break-words ${!notif.lida ? "text-brand-dark font-medium" : "text-gray-500 font-medium"}`}>
                        {formatMessage(notif.mensagem)}
                      </Typography>
                      
                      {hasLink && (
                        <Typography variant="small" className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-bold">
                          Toque para visualizar <ChevronRight size={10} />
                        </Typography>
                      )}
                    </div>

                    {/* Ações Desktop */}
                    <div className="hidden md:flex items-center gap-2 self-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                            className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Excluir"
                        >
                            <Trash2 size={16} />
                        </button>
                        {hasLink && (
                            <ChevronRight size={18} className={`shrink-0 transition-colors ${!notif.lida ? "text-brand-purple" : "text-gray-300"}`} />
                        )}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore ? (
               <div className="flex justify-center pt-2 pb-2">
                  <Button 
                      variant="outline" 
                      onClick={loadMore} 
                      loading={loading}
                      className="text-xs h-9 px-6 border-brand-purple text-brand-purple"
                  >
                      {loading ? "Carregando..." : "Carregar antigas"}
                  </Button>
               </div>
            ) : (
               <div className="py-2 text-center border-t border-dashed border-gray-200 mt-2">
                  <Typography className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                    Fim das notificações
                  </Typography>
               </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
            <Typography className="text-gray-400 text-sm font-medium">
              Não há novas notificações
            </Typography>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}