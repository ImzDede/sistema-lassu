"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MoreVertical, Copy, Plus, Calendar, 
  FileText, Share, Stethoscope, Phone, UserCheck, Edit3, Clock
} from "lucide-react";
import { Spinner, Typography, Progress } from "@material-tailwind/react";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { patientService } from "@/services/patientServices";
import { calculateAge } from "@/utils/date";
import { Patient } from "@/types/paciente";
import ProfileCard from "@/components/ProfileCard";
import FolderAccordion from "@/components/FolderAccordion";
import { FolderItemCard } from "@/components/PatientFolderContent";

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { isLoading: authLoading } = useAuth();
  const { showFeedback } = useFeedback();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState<string>("Buscando...");

  // Estado dos Accordions
  const [sections, setSections] = useState({
    sessoes: true,
    sintese: false,
    anamnese: false,
    encaminhamento: false,
    anotacoes: false
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadPatient = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = await patientService.getById(id);
      
      // 1. Seta o paciente
      setPatient(data.patient);

      // 2. Seta o terapeuta (se existir)
      if (data.therapist && data.therapist.nome) {
        setTherapistName(data.therapist.nome);
      } else {
        setTherapistName("Não atribuído");
      }

    } catch (error) {
      console.error(error);
      showFeedback("Erro ao carregar paciente.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showFeedback]);

  useEffect(() => {
    if (!authLoading) loadPatient();
  }, [authLoading, loadPatient]);

  const handleCopyPhone = () => {
    if (patient?.telefone) {
      navigator.clipboard.writeText(patient.telefone);
      showFeedback("Telefone copiado!", "success");
    }
  };

  const handleNavigateToCreate = (type: string) => {
    if (!patient) return;
    const route = `/home/cadastro/${type}?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}`;
    router.push(route);
  };

  if (loading || authLoading) return <div className="flex justify-center h-[80vh] items-center bg-gray-50"><Spinner className="text-brand-purple" /></div>;
  if (!patient) return null;

  // Render do Botão Adicionar
  const renderAddButton = (type: string, label?: string) => (
    <div className="flex flex-col items-center justify-center py-6 gap-2">
       <Button 
          onClick={() => handleNavigateToCreate(type)}
          className="w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-md bg-brand-purple hover:bg-brand-purple-dark"
       >
          <Plus size={24} strokeWidth={3} />
       </Button>
       {label && <span className="text-gray-400 text-sm font-medium">{label}</span>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 font-sans">

      {/* Header Navegação */}
      <div className="pt-8 pb-4 px-4 md:px-8 max-w-6xl mx-auto w-full flex justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
               <ArrowLeft size={24} />
            </button>
            <Typography variant="h4" className="font-heading font-bold text-gray-800">Detalhes da Paciente</Typography>
         </div>
         <button className="p-2 -mr-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
            <MoreVertical size={24} />
         </button>
      </div>

      {/* Card Unificado */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full mb-8">
         <ProfileCard 
            name={patient.nome}
            subtitle={`${patient.dataNascimento ? calculateAge(patient.dataNascimento) : "--"} anos`}
            status={patient.status}
            statusColor="purple"
            footer={
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <Typography variant="small" className="font-bold text-gray-500 uppercase text-xs">Progresso</Typography>
                        <Typography variant="small" className="font-bold text-brand-purple">20%</Typography>
                    </div>
                    <Progress value={20} size="lg" color="purple" className="bg-gray-100 rounded-full" />
                </div>
            }
         >
            {/* Conteúdo Filho (Slots) */}
            <div 
               onClick={handleCopyPhone}
               className="flex items-center gap-2 cursor-pointer hover:text-brand-purple transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
            >
               <Phone size={16} className="text-brand-purple" />
               <span className="font-mono font-medium">{patient.telefone || "--"}</span>
               <Copy size={12} className="ml-1 opacity-50" />
            </div>

            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 text-blue-800">
               <UserCheck size={16} className="text-blue-500" />
               <span className="font-medium">Resp: {therapistName}</span>
            </div>
         </ProfileCard>
      </div>

      {/* Conteúdo das Pastas */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-2">
         
         {/* SESSÕES */}
         <FolderAccordion title="Sessões" icon={<Calendar size={18} />} isOpen={sections.sessoes} onToggle={() => toggleSection("sessoes")}>
             {/* Exemplo Mockado */}
             {true ? (
                 <>
                    <FolderItemCard 
                       title="1ª Sessão" 
                       subtitle={<span>Sala 02 <span className="mx-1">|</span> 19/11/2025 às 09:00</span>}
                       icon={<Clock size={16} />}
                       highlight
                    />
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
                        {renderAddButton("sessoes")}
                    </div>
                 </>
             ) : (
                 renderAddButton("sessoes", "Adicionar nova sessão")
             )}
         </FolderAccordion>
         

         {/* ANAMNESE */}
         <FolderAccordion title="Anamnese" icon={<Stethoscope size={18} />} isOpen={sections.anamnese} onToggle={() => toggleSection("anamnese")}>
              {true ? (
                 <FolderItemCard title="Anamnese Completa" progress={100} highlight />
              ) : (
                 renderAddButton("anamnese", "Preencher Anamnese")
              )}
         </FolderAccordion>

         {/* OUTRAS PASTAS */}
         <FolderAccordion title="Síntese" icon={<FileText size={18} />} isOpen={sections.sintese} onToggle={() => toggleSection("sintese")}>
             {renderAddButton("sintese", "Criar nova síntese")}
         </FolderAccordion>

         <FolderAccordion title="Encaminhamento" icon={<Share size={18} />} isOpen={sections.encaminhamento} onToggle={() => toggleSection("encaminhamento")}>
             {renderAddButton("encaminhamento", "Adicionar encaminhamento")}
         </FolderAccordion>

         <FolderAccordion title="Anotações" icon={<Edit3 size={18} />} isOpen={sections.anotacoes} onToggle={() => toggleSection("anotacoes")}>
             {(patient as any).observacoes ? (
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{(patient as any).observacoes}</p>
                 </div>
             ) : (
                 renderAddButton("anotacoes", "Criar anotação")
             )}
         </FolderAccordion>

      </div>
    </div>
  );
}