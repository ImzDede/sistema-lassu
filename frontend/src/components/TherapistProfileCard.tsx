"use client";

import React from "react";
import { User as UserIcon, Mail, Phone, Users } from "lucide-react";
import { Avatar, Typography, Chip } from "@material-tailwind/react";

interface TherapistProfileCardProps {
  therapist: {
    nome: string;
    matricula: number;
    email: string;
    telefone?: string;
    ativo: boolean;
    fotoUrl?: string;
    permAdmin: boolean;
    permCadastro: boolean;
    permAtendimento: boolean;
  };
  patientCount: number;
}

export default function TherapistProfileCard({ therapist, patientCount }: TherapistProfileCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
      {/* Detalhe visual de fundo */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-purple to-brand-pink opacity-50" />

      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-brand-bg border-4 border-white shadow-lg flex items-center justify-center text-brand-purple shrink-0">
        {therapist.fotoUrl ? (
          <Avatar src={therapist.fotoUrl} alt="Foto" size="xxl" />
        ) : (
          <UserIcon size={48} />
        )}
      </div>

      {/* Dados */}
      <div className="flex-1 text-center md:text-left w-full">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-2">
          <div>
            <Typography variant="h4" className="text-brand-dark font-bold uppercase">
              {therapist.nome}
            </Typography>
            <Typography className="text-gray-500 font-medium text-sm">
              Matrícula: {therapist.matricula}
            </Typography>
          </div>
          
          {/* Status Chip */}
          <Chip 
            value={therapist.ativo ? "Ativo" : "Inativo"} 
            className={`mt-2 md:mt-0 ${therapist.ativo ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"}`} 
            size="sm"
          />
        </div>

        {/* Informações de Contato e Stats */}
        <div className="flex flex-col md:flex-row gap-4 mt-3 text-sm text-gray-600 justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-brand-purple" />
            {therapist.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-brand-purple" />
            {therapist.telefone || "Sem telefone"}
          </div>
          <div className="flex items-center gap-2 font-bold text-brand-dark bg-gray-100 px-2 py-0.5 rounded-md">
            <Users size={16} />
            {patientCount} Pacientes
          </div>
        </div>
        
        {/* Tags de Permissão */}
        <div className="flex gap-2 justify-center md:justify-start mt-4 flex-wrap">
          {therapist.permAdmin && <Chip value="Admin" className="bg-purple-100 text-purple-700 border border-purple-200" size="sm" variant="ghost" />}
          {therapist.permCadastro && <Chip value="Cadastro" className="bg-pink-100 text-pink-700 border border-pink-200" size="sm" variant="ghost" />}
          {therapist.permAtendimento && <Chip value="Atendimento" className="bg-blue-100 text-blue-700 border border-blue-200" size="sm" variant="ghost" />}
        </div>
      </div>
    </div>
  );
}