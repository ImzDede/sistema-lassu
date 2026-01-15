"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MoreVertical, Copy, Calendar, 
  FileText, Share, Stethoscope, Phone, UserCheck, Edit3, Clock, CreditCard
} from "lucide-react";
import { Spinner, Typography, Progress } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { patientService } from "@/services/patientServices";
import { sessionService } from "@/services/sessionServices";
import { calculateAge } from "@/utils/date";
import { Patient } from "@/types/paciente";
import { Session } from "@/types/sessao";
import ProfileCard from "@/components/ProfileCard";
import FolderAccordion from "@/components/FolderAccordion";
import { FolderItemCard } from "@/components/PatientFolderContent";
import { formatCPF, formatPhone } from "@/utils/format";

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { showFeedback } = useFeedback();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessionsList, setSessionsList] = useState<Session[]>([]); 
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState<string>("Buscando...");

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Paciente
      const data = await patientService.getById(id);
      setPatient(data.patient);
      if (data.therapist && data.therapist.nome) {
        setTherapistName(data.therapist.nome);
      } else {
        setTherapistName("Não atribuído");
      }

      // 2. Sessões
      try {
          // Busca histórico longo (ex: 2023 a 2030)
          const list = await sessionService.getAll({ 
              start: "2023-01-01", 
              end: "2030-12-31",
              patientTargetId: id, 
              orderBy: "dia",
              direction: "DESC" 
          });
          setSessionsList(list);
      } catch (sessionErr) {
          console.warn("Erro ao buscar sessões:", sessionErr);
          setSessionsList([]);
      }

    } catch (error) {
      console.error(error);
      showFeedback("Erro ao carregar dados.", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showFeedback]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const handleCopyPhone = () => {
    if (patient?.telefone) {
      navigator.clipboard.writeText(patient.telefone);
      showFeedback("Telefone copiado!", "success");
    }
  };

  // NAVEGAÇÃO PARA CRIAR (Novo Item)
  const handleNavigateToCreate = (type: string) => {
    if (!patient) return;
    const route = `/home/cadastro/${type}?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}`;
    router.push(route);
  };

  // NAVEGAÇÃO PARA EDITAR (Item Existente)
  const handleNavigateToEdit = (type: string, itemId: string | number) => {
    if (!patient) return;
    const route = `/home/cadastro/${type}?id=${itemId}&patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}&mode=edit`;
    router.push(route);
  };

  // --- PERMISSÕES ---
  const isMasterAdmin = user?.permAdmin;
  const canEdit = !isMasterAdmin && (user?.permCadastro || user?.permAtendimento);

  if (loading || authLoading) return <div className="flex justify-center h-[80vh] items-center bg-gray-50"><Spinner className="text-brand-purple" /></div>;
  if (!patient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 font-sans">

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

      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full mb-8">
         <ProfileCard 
            name={patient.nome}
            subtitle={`${patient.dataNascimento ? calculateAge(patient.dataNascimento) : "--"}`}
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
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <CreditCard size={16} className="text-brand-purple" />
                <span className="text-sm font-mono">{patient.cpf ? formatCPF(patient.cpf) : "--"}</span>
            </div>

            <div 
               onClick={handleCopyPhone}
               className="flex items-center gap-2 cursor-pointer hover:text-brand-purple transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 group"
            >
               <Phone size={16} className="text-brand-purple" />
               <span className="font-mono font-medium text-sm">
                 {patient.telefone ? formatPhone(patient.telefone) : "--"}
               </span>
               <Copy size={12} className="ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>

            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 text-blue-800">
               <UserCheck size={16} className="text-blue-500" />
               <span className="font-medium text-sm">Resp: {therapistName}</span>
            </div>
         </ProfileCard>
      </div>

      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-2">
         
         {/* SESSÕES */}
         <FolderAccordion 
            title="Sessões" 
            tabColorClass="bg-[#A78FBF]" 
            icon={<Calendar size={18} />} 
            isOpen={sections.sessoes} 
            onToggle={() => toggleSection("sessoes")}
            showAddButton={canEdit} 
            onAdd={() => handleNavigateToCreate("sessoes")}
            addLabel="Nova Sessão"
         >
             {sessionsList.length > 0 ? (
                 sessionsList.map((sessao, idx) => {
                     const [ano, mes, dia] = String(sessao.dia).split('-');
                     const dateStr = `${dia}/${mes}/${ano}`;
                     const horaStr = typeof sessao.hora === 'number' ? `${sessao.hora}:00` : sessao.hora;
                     
                     return (
                         <FolderItemCard 
                            key={sessao.id || idx}
                            title={`${sessionsList.length - idx}ª Sessão`} 
                            subtitle={<span>Sala {sessao.sala} <span className="mx-1">|</span> {dateStr} às {horaStr}</span>}
                            icon={<Clock size={16} />}
                            highlight={idx === 0} 
                            onEdit={canEdit ? () => handleNavigateToEdit("sessoes", sessao.id) : undefined}
                            onView={!canEdit ? () => handleNavigateToEdit("sessoes", sessao.id) : undefined}
                         />
                     );
                 })
             ) : (
                 <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">Nenhuma sessão registrada</div>
             )}
         </FolderAccordion>
         
         {/* ANAMNESE */}
         <FolderAccordion 
            title="Anamnese" 
            tabColorClass="bg-[#F2A9A2]" 
            icon={<Stethoscope size={18} />}
            isOpen={sections.anamnese}
            onToggle={() => toggleSection("anamnese")}
            showAddButton={false} 
         >
             <FolderItemCard
               title="Anamnese"
               variant="progress"
               progress={0}
               onClick={() => handleNavigateToEdit("anamnese", "current")}
               onEdit={canEdit ? () => handleNavigateToEdit("anamnese", "current") : undefined}
               onView={!canEdit ? () => handleNavigateToEdit("anamnese", "current") : undefined}
             />
         </FolderAccordion>

         {/* SÍNTESE */}
         <FolderAccordion 
            title="Síntese" 
            tabColorClass="bg-[#F2B694]" 
            icon={<FileText size={18} />}
            isOpen={sections.sintese}
            onToggle={() => toggleSection("sintese")}
            showAddButton={false}
         >
             <FolderItemCard
               title="Síntese"
               variant="progress"
               progress={0}
               onClick={() => handleNavigateToEdit("sintese", "current")}
               onEdit={canEdit ? () => handleNavigateToEdit("sintese", "current") : undefined}
               onView={!canEdit ? () => handleNavigateToEdit("sintese", "current") : undefined}
             />
         </FolderAccordion>

         {/* ENCAMINHAMENTO */}
         <FolderAccordion 
            title="Encaminhamento" 
            tabColorClass="bg-[#D9A3B6]" 
            icon={<Share size={18} />} 
            isOpen={sections.encaminhamento} 
            onToggle={() => toggleSection("encaminhamento")}
            showAddButton={canEdit}
            onAdd={() => handleNavigateToCreate("encaminhamento")}
            addLabel="Novo Encaminhamento"
         >
             <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">Sem histórico</div>
         </FolderAccordion>

         {/* ANOTAÇÕES */}
         <FolderAccordion 
            title="Anotações" 
            tabColorClass="bg-[#C1C7CE]" 
            icon={<Edit3 size={18} />} 
            isOpen={sections.anotacoes} 
            onToggle={() => toggleSection("anotacoes")}
            showAddButton={canEdit}
            onAdd={() => handleNavigateToEdit("anotacoes", "current")}
            addLabel="Editar Anotações"
         >
             {(patient as any).observacoes ? (
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{(patient as any).observacoes}</p>
                 </div>
             ) : (
                <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">Nenhuma anotação</div>
             )}
         </FolderAccordion>

      </div>
    </div>
  );
}