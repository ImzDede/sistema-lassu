"use client";

import React from "react";
import { User as UserIcon } from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

interface CardListagemProps {
  badge?: React.ReactNode;
  nomePrincipal: string;
  detalhe: string;
  horario?: string;
  status?: string;
}

const CardListagem = ({
  badge,
  nomePrincipal,
  detalhe,
  horario,
  status,
}: CardListagemProps) => {
  return (
    <div className="relative pt-4 w-full group">
      
      {/* Área da Etiqueta/Badge */}
      {badge && (
        <div className="absolute top-0 left-4 z-10">
          {badge}
        </div>
      )}

      {/* Card Principal */}
      <Card className="w-full shadow-sm rounded-xl border border-gray-100 group-hover:shadow-md transition-all cursor-pointer hover:border-brand-purple/30 z-0 relative bg-white">
        <CardBody className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Genérico */}
            <div className="w-12 h-12 rounded-full bg-[#F3E5F5] flex items-center justify-center text-brand-purple border border-brand-purple/10">
              <UserIcon size={24} />
            </div>

            {/* Informações de Texto */}
            <div className="flex flex-col">
              <Typography
                variant="h6"
                className="text-brand-dark font-bold text-base leading-tight"
              >
                {nomePrincipal}
              </Typography>
              <Typography
                variant="small"
                className="text-gray-500 text-sm font-medium mt-0.5"
              >
                {detalhe}
              </Typography>
            </div>
          </div>

          <div>
            {/* HORÁRIO */}
            {horario && (
              <Typography
                variant="h6"
                className="text-gray-700 font-bold text-sm bg-gray-50 px-2 py-1 rounded-md border border-gray-100"
              >
                {horario}
              </Typography>
            )}

            {/* STATUS */}
            {status && (
              <Typography
                variant="h6"
                className={`font-bold text-sm ${
                  status === "Ativo" ? "text-green-600" : "text-gray-400"
                }`}
              >
                {status}
              </Typography>
            )}
          </div>

        </CardBody>
      </Card>
    </div>
  );
};

export default CardListagem;