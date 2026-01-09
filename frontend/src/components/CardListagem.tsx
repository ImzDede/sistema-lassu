"use client";

import React from "react";
import { User as UserIcon, CheckCircle } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

interface CardListagemProps {
  badge?: React.ReactNode;
  nomePrincipal: string;
  detalhe: React.ReactNode;
  horario?: string;
  status?: string;
  onClick?: () => void;
  selected?: boolean;
}

const CardListagem = ({
  badge,
  nomePrincipal,
  detalhe,
  horario,
  status,
  onClick,
  selected = false,
}: CardListagemProps) => {
  return (
    <div className="relative pt-4 w-full group" onClick={onClick}>
      
      {badge && (
        <div className="absolute top-0 left-4 z-20">
          {badge}
        </div>
      )}

      <div 
        className={`
          rounded-xl transition-all duration-300 relative
          ${selected 
            ? "p-[2px] bg-brand-gradient shadow-md scale-[1.01]" 
            : "p-0 bg-transparent"
          }
          ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}
        `}
      >
        <Card 
          className={`
            w-full shadow-sm rounded-xl transition-all h-full bg-brand-surface
            ${
              selected 
                ? "border-none" 
                : "border border-brand-purple/10 hover:border-brand-purple/30 group-hover:shadow-md"
            }
          `}
        >
          <CardBody className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              {/* Avatar */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center border transition-colors shrink-0
                ${selected 
                    ? "bg-brand-purple text-white border-brand-purple" 
                    : "bg-brand-bg text-brand-purple border-brand-purple/10"
                }
              `}>
                <UserIcon size={24} />
              </div>

              {/* Textos */}
              <div className="flex flex-col">
                <Typography
                  variant="h6"
                  className="text-brand-dark font-bold text-base leading-tight font-heading"
                >
                  {nomePrincipal}
                </Typography>
                <div className="text-gray-500 text-sm font-medium mt-0.5">
                  {detalhe}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {/* ÍCONE DE SELECIONADO */}
              {selected && (
                 <CheckCircle className="text-brand-purple w-6 h-6 fill-brand-purple/10" />
              )}

              {/* HORÁRIO */}
              {!selected && horario && (
                <Typography
                  variant="h6"
                  className="text-brand-dark font-bold text-sm bg-brand-bg px-2 py-1 rounded-md border border-brand-purple/10"
                >
                  {horario}
                </Typography>
              )}

              {/* STATUS */}
              {!selected && status && (
                <Typography
                  variant="h6"
                  className={`font-bold text-sm ${
                    status.toLowerCase() === "ativo" ? "text-feedback-success-text" : "text-gray-400"
                  }`}
                >
                  {status}
                </Typography>
              )}
            </div>

          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CardListagem;