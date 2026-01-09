"use client";

import React from "react";
import { User as UserIcon, Mail, Phone, Users } from "lucide-react";
import { Avatar, Typography, Chip } from "@material-tailwind/react";
import { User } from "@/types/usuarios";

interface TherapistProfileCardProps {
  therapist: User; 
  patientCount: number;
}

export default function TherapistProfileCard({ therapist, patientCount }: TherapistProfileCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-purple/10 mb-6 relative overflow-hidden group hover:shadow-md transition-all">
      {/* Detalhe visual de fundo */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-gradient opacity-80" />

      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-brand-bg border-4 border-white shadow-lg flex items-center justify-center text-brand-purple shrink-0 relative z-10">
        {therapist.fotoUrl ? (
          <Avatar src={therapist.fotoUrl} alt="Foto" size="xxl" className="h-full w-full" />
        ) : (
          <UserIcon size={48} />
        )}
      </div>

      {/* Dados */}
      <div className="flex-1 text-center md:text-left w-full">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-2">
          <div>
            <Typography variant="h4" className="text-brand-dark font-bold uppercase font-heading">
              {therapist.nome}
            </Typography>
            <Typography className="text-gray-500 font-medium text-sm">
              Matrícula: {therapist.matricula}
            </Typography>
          </div>
          
          {/* Status */}
          <Chip 
            value={therapist.ativo ? "Ativo" : "Inativo"} 
            className={`mt-2 md:mt-0 ${therapist.ativo ? "bg-feedback-success-bg text-feedback-success-text" : "bg-feedback-error-bg text-feedback-error-text"}`} 
            size="sm"
            variant="ghost"
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
          <div className="flex items-center gap-2 font-bold text-brand-dark bg-brand-purple/5 px-2 py-0.5 rounded-md">
            <Users size={16} className="text-brand-purple" />
            {patientCount} Pacientes
          </div>
        </div>
        
        {/* Tags de Permissão (Cores Semânticas) */}
        <div className="flex gap-2 justify-center md:justify-start mt-4 flex-wrap">
          {therapist.permAdmin && <Chip value="Admin" className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20" size="sm" variant="ghost" />}
          {therapist.permCadastro && <Chip value="Cadastro" className="bg-brand-pink/10 text-brand-pink border border-brand-pink/20" size="sm" variant="ghost" />}
          {therapist.permAtendimento && <Chip value="Atendimento" className="bg-brand-peach/20 text-brand-dark border border-brand-peach/30" size="sm" variant="ghost" />}
        </div>
      </div>
    </div>
  );
}