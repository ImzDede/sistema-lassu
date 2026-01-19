"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  Clock,
  CreditCard,
  Phone,
  UserCheck,
  Copy,
  UserPlus,
  Trash2,
  FileText,
  Share,
  Stethoscope,
  Edit3,
  FileDown,
  Eye, 
} from "lucide-react";
import {
  Spinner,
  Typography,
  Progress,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import { PDFDownloadLink } from "@react-pdf/renderer";

import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { patientService } from "@/services/patientServices";
import { sessionService } from "@/services/sessionServices";
import { formService } from "@/services/formServices";
import { calculateAge } from "@/utils/date";
import { formatCPF, formatPhone } from "@/utils/format";

import ProfileCard from "@/components/ProfileCard";
import FolderAccordion from "@/components/FolderAccordion";
import { FolderItemCard } from "@/components/PatientFolderContent";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { AnamnesePDF } from "@/components/pdfs/AnamnesePDF";
import { SintesePDF } from "@/components/pdfs/SintesePDF";

// Helper para formatar data ignorando timezone (UTC) - Resolve o problema do dia anterior
const formatDateUTC = (dateString: string) => {
  if (!dateString) return "-";
  // Pega apenas a parte da data YYYY-MM-DD
  const parts = dateString.split("T")[0].split("-");
  // Retorna DD/MM/YYYY sem converter para local time
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Helper para traduzir status e cor
const getStatusConfig = (status: string) => {
  switch (status) {
    case "realizada": return { label: "Realizada", color: "text-green-600 font-bold" };
    case "falta": return { label: "Falta", color: "text-red-500 font-bold" };
    case "cancelada_paciente": return { label: "Canc. pelo Paciente", color: "text-orange-500 font-bold" };
    case "cancelada_terapeuta": return { label: "Canc. pela Terapeuta", color: "text-orange-500 font-bold" };
    case "agendada": 
    default: return { label: "Agendada", color: "text-blue-500 font-medium" };
  }
};

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { showFeedback } = useFeedback();

  const [patient, setPatient] = useState<any | null>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);

  const [formsProgress, setFormsProgress] = useState({
    anamnese: 0,
    sintese: 0,
  });
  const [totalProgress, setTotalProgress] = useState(0);

  const [anamneseData, setAnamneseData] = useState<any>(null);
  const [sinteseData, setSinteseData] = useState<any>(null);

  const [hasEncaminhamento, setHasEncaminhamento] = useState(false);
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState<string>("Buscando...");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<any>(null);

  const [sections, setSections] = useState({
    sessoes: true,
    sintese: false,
    anamnese: false,
    encaminhamento: false,
    anotacoes: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const data = (await patientService.getById(id)) as any;
      setPatient(data.patient);
      setTherapistName(data.therapist?.nome || "Não atribuído");

      const forms = data.forms || {
        anamnesePorcentagem: 0,
        sintesePorcentagem: 0,
      };
      setFormsProgress({
        anamnese: forms.anamnesePorcentagem,
        sintese: forms.sintesePorcentagem,
      });
      setTotalProgress(
        Math.round((forms.anamnesePorcentagem + forms.sintesePorcentagem) / 2),
      );

      setHasEncaminhamento(data.patient.status === "encaminhada");

      try {
        const list = await sessionService.getAll({
          start: "2023-01-01",
          end: "2030-12-31",
          patientTargetId: id,
          orderBy: "dia",
          direction: "ASC",
        });
        console.log("DEBUG SESSÕES DO BACKEND:", list); // LOG DEBUG
        setSessionsList(Array.isArray(list) ? list : []);
      } catch (sessionErr) {
        setSessionsList([]);
      }

      try {
        const anamnese = await formService.getAnamnese(id);
        setAnamneseData(anamnese);
      } catch (e) { /* Ignora */ }

      try {
        const sintese = await formService.getSintese(id);
        setSinteseData(sintese);
      } catch (e) { /* Ignora */ }

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

  const notesList = useMemo(() => {
    return (sessionsList ?? [])
      .filter((s) => {
        const text = typeof s?.anotacoes === "string" ? s.anotacoes.trim() : "";
        return text.length > 0;
      })
      .map((s) => ({
        id: s.id,
        data: s.dia,
        titulo: "Anotação de Sessão",
        resumo: (typeof s.anotacoes === "string" ? s.anotacoes : "").trim(),
      }));
  }, [sessionsList]);

  const handleCopyPhone = () => {
    if (patient?.telefone) {
      navigator.clipboard.writeText(patient.telefone);
      showFeedback("Telefone copiado!", "success");
    }
  };

  const handleNavigate = (
    type: string,
    itemId: string | number,
    mode: "edit" | "view" | "create",
  ) => {
    if (!patient) return;
    const idParam = mode === "create" ? "" : `&id=${itemId}`;
    router.push(
      `/home/cadastro/${type}?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}${idParam}&mode=${mode}`,
    );
  };

  // Lógica de formulário finalizado (100% ou status 'finalizado')
  const isFormFinalized = (formData: any, progress: number) => {
    return (
      formData?.status === 'finalizado' || 
      formData?.finalizada === true || 
      progress === 100
    );
  };

  const anamneseFinalizada = isFormFinalized(anamneseData, formsProgress.anamnese);
  const sinteseFinalizada = isFormFinalized(sinteseData, formsProgress.sintese);

  const handleCreateReferral = () => {
    if (!anamneseFinalizada || !sinteseFinalizada) {
        showFeedback("Para encaminhar, a Anamnese e a Síntese devem estar finalizadas.", "warning");
        return;
    }
    handleNavigate("encaminhamento", 0, "create");
  };

  const getRespostasFormatadas = (formData: any) => {
    if (!formData || !formData.secoes) return {};
    const respostas: any = {};
    formData.secoes.forEach((sec: any) => {
      sec.perguntas.forEach((perg: any) => {
        if (perg.resposta) respostas[perg.id] = perg.resposta;
      });
    });
    return respostas;
  };

  const DownloadButton = ({
    doc,
    fileName,
    exists,
  }: {
    doc: any;
    fileName: string;
    exists: boolean;
  }) => {
    if (!exists) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            showFeedback("Não possui arquivo para baixar.", "warning");
          }}
          className="p-1.5 text-gray-300 hover:text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          title="Indisponível"
        >
          <FileDown size={16} />
        </button>
      );
    }
    return (
      <PDFDownloadLink
        document={doc}
        fileName={fileName}
        className="p-1.5 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-full transition-colors flex"
        onClick={(e) => {
          e.stopPropagation();
          setTimeout(
            () => showFeedback("Arquivo baixado com sucesso!", "success"),
            500,
          );
        }}
      >
        <FileDown size={16} />
      </PDFDownloadLink>
    );
  };

  const handleActionClick = (action: "refer" | "unrefer" | "delete") => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!patient || !dialogAction) return;
    try {
      if (dialogAction === "refer") {
        await patientService.referPatient(patient.id);
        setPatient({ ...patient, status: "encaminhada" });
        setHasEncaminhamento(true);
        showFeedback("Paciente encaminhada com sucesso.", "success");
      } else if (dialogAction === "unrefer") {
        await patientService.unreferPatient(patient.id);
        setPatient({ ...patient, status: "atendimento" });
        setHasEncaminhamento(false);
        showFeedback("Paciente reativada para atendimento.", "success");
      } else if (dialogAction === "delete") {
        await patientService.delete(patient.id);
        showFeedback("Paciente excluída.", "success");
        router.back();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao realizar ação.";
      showFeedback(msg, "error");
    }
  };

  const isMasterAdmin = user?.permAdmin;
  const canEditGeneral = !isMasterAdmin && (user?.permCadastro || user?.permAtendimento);
  
  const isEncaminhada = patient?.status === "encaminhada";
  const statusDisplay = isEncaminhada ? "Encaminhada" : "Em Atendimento";

  if (loading || authLoading)
    return (
      <div className="flex justify-center h-[80vh] items-center bg-gray-50">
        <Spinner className="text-brand-purple" />
      </div>
    );
  if (!patient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 font-sans">
      {/* HEADER */}
      <div className="pt-8 pb-4 px-4 md:px-8 max-w-6xl mx-auto w-full flex justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full transition-colors bg-brand-encaminhamento/20 text-brand-encaminhamento hover:bg-brand-encaminhamento/30"
          >
            <ArrowLeft size={24} />
          </button>
          <Typography
            variant="h4"
            className="font-heading font-bold text-brand-encaminhamento"
          >
            Detalhes da Paciente
          </Typography>
        </div>

        <Menu placement="bottom-end">
          <MenuHandler>
            <IconButton
              variant="text"
              className="rounded-full text-gray-700 hover:bg-gray-200"
            >
              <MoreVertical size={24} />
            </IconButton>
          </MenuHandler>
          <MenuList className="p-2 border border-gray-200 shadow-xl rounded-xl">
            {(isMasterAdmin || canEditGeneral) && isEncaminhada && (
              <MenuItem
                onClick={() => handleActionClick("unrefer")}
                className="flex items-center gap-2 text-brand-dark hover:bg-brand-purple/5 p-3"
              >
                <UserPlus size={16} />{" "}
                <span className="font-medium">Reativar Atendimento</span>
              </MenuItem>
            )}
            <hr className="my-1 border-gray-100" />
            <MenuItem
              onClick={() => handleActionClick("delete")}
              className="flex items-center gap-2 text-brand-encaminhamento hover:bg-red-50 hover:text-brand-encaminhamento/5 p-3"
            >
              <Trash2 size={16} />{" "}
              <span className="font-medium">Excluir Paciente</span>
            </MenuItem>
          </MenuList>
        </Menu>
      </div>

      {/* PERFIL */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full mb-8">
        <ProfileCard
          name={patient.nome}
          subtitle={`${patient.dataNascimento ? calculateAge(patient.dataNascimento) : "--"}`}
          avatarUrl={null}
          status={statusDisplay}
          statusColor={patient.status === "atendimento" ? "purple" : "orange"}
          stripeColorClass={"bg-brand-encaminhamento"}
          footer={
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Typography
                  variant="small"
                  className="font-bold text-gray-500 uppercase text-xs"
                >
                  Progresso
                </Typography>
                <Typography
                  variant="small"
                  className="font-bold text-brand-encaminhamento"
                >
                  {totalProgress}%
                </Typography>
              </div>
              <Progress
                value={totalProgress}
                size="lg"
                className="bg-gray-100 rounded-full [&>div]:bg-brand-encaminhamento"
              />
            </div>
          }
        >
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <CreditCard size={16} className="text-brand-purple" />
            <span className="text-sm font-mono">
              {patient.cpf ? formatCPF(patient.cpf) : "--"}
            </span>
          </div>

          <div
            onClick={handleCopyPhone}
            className="flex items-center gap-2 cursor-pointer hover:text-brand-purple transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 group"
            title="Clique para copiar"
          >
            <Phone size={16} className="text-brand-purple" />
            <span className="font-mono font-medium text-sm">
              {patient.telefone ? formatPhone(patient.telefone) : "--"}
            </span>
            <Copy
              size={12}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-brand-purple"
            />
          </div>

          {(user?.permAdmin || user?.permCadastro) && (
            <div className="flex items-center gap-2 bg-brand-encaminhamento/10 px-3 py-1.5 rounded-full border border-brand-encaminhamento text-brand-encaminhamento">
              <UserCheck size={16} className="text-brand-encaminhamento" />
              <span className="font-medium text-sm truncate max-w-[150px]">
                Resp: {therapistName}
              </span>
            </div>
          )}
        </ProfileCard>
      </div>

      {/* PASTAS */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-2">
        
        {/* 1. SESSÕES (CORRIGIDA DATA E STATUS) */}
        <FolderAccordion
          title="Sessões"
          tabColorClass="bg-brand-sessao"
          icon={<Calendar size={18} />}
          isOpen={sections.sessoes}
          onToggle={() => toggleSection("sessoes")}
          showAddButton={canEditGeneral && !hasEncaminhamento}
          onAdd={() => handleNavigate("sessoes", 0, "create")}
          addLabel="Nova Sessão"
          accentColor="brand-sessao"
        >
          {sessionsList.length > 0 ? (
            sessionsList.map((sessao, idx) => {
              // Pega a configuração de cor e label do status
              const statusConfig = getStatusConfig(sessao.status);
              
              return (
                <FolderItemCard
                  key={sessao.id || idx}
                  title={`${idx + 1}ª Sessão`}
                  // SUBTÍTULO COM DATA CORRETA (UTC) E STATUS COLORIDO
                  subtitle={
                    <div className="flex flex-col gap-1 mt-1">
                      <span>
                        Sala {sessao.sala} | {formatDateUTC(sessao.dia)} às {sessao.hora}:00
                      </span>
                      <span className={`text-[10px] uppercase ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  }
                  icon={<Clock size={16} />}
                  highlight={idx === sessionsList.length - 1}
                  onEdit={
                    canEditGeneral && !hasEncaminhamento
                      ? () => handleNavigate("sessoes", sessao.id, "edit")
                      : undefined
                  }
                />
              );
            })
          ) : (
            <div></div>
          )}
        </FolderAccordion>

        {/* 2. ANAMNESE */}
        <FolderAccordion
          title="Anamnese"
          tabColorClass="bg-brand-anamnese"
          icon={<Stethoscope size={18} />}
          isOpen={sections.anamnese}
          onToggle={() => toggleSection("anamnese")}
          showAddButton={false}
        >
          {anamneseData && anamneseData.versaoId ? (
            <FolderItemCard
              title="Anamnese Inicial"
              variant="progress"
              progress={formsProgress.anamnese}
              progressColorClass="[&>div]:bg-brand-anamnese"
              
              onView={
                anamneseFinalizada || !canEditGeneral
                  ? () => handleNavigate("anamnese", "current", "view")
                  : undefined
              }
              
              onEdit={
                canEditGeneral && !anamneseFinalizada && !hasEncaminhamento
                  ? () => handleNavigate("anamnese", "current", "edit")
                  : undefined
              }
              
              icon={anamneseFinalizada ? <Eye size={16} /> : <Edit3 size={16} />}
              
              downloadComponent={
                <DownloadButton
                  exists={anamneseFinalizada}
                  doc={
                    <AnamnesePDF
                      pacienteNome={patient.nome}
                      respostas={getRespostasFormatadas(anamneseData)}
                    />
                  }
                  fileName={`anamnese_${patient.nome}.pdf`}
                />
              }
            />
          ) : canEditGeneral && !hasEncaminhamento ? (
            <button
              onClick={() => handleNavigate("anamnese", "current", "create")}
              className="text-sm text-brand-anamnese hover:underline p-4 w-full text-left"
            >
              + Iniciar Anamnese
            </button>
          ) : (
            <div></div>
          )}
        </FolderAccordion>

        {/* 3. SÍNTESE */}
        <FolderAccordion
          title="Síntese"
          tabColorClass="bg-brand-sintese"
          icon={<FileText size={18} />}
          isOpen={sections.sintese}
          onToggle={() => toggleSection("sintese")}
          showAddButton={false}
        >
          {sinteseData && sinteseData.versaoId ? (
            <FolderItemCard
              title="Síntese Diagnóstica"
              variant="progress"
              progress={formsProgress.sintese}
              progressColorClass="[&>div]:bg-brand-sintese"
              
              onView={
                sinteseFinalizada || !canEditGeneral
                  ? () => handleNavigate("sintese", "current", "view")
                  : undefined
              }
              
              onEdit={
                canEditGeneral && !sinteseFinalizada && !hasEncaminhamento
                  ? () => handleNavigate("sintese", "current", "edit")
                  : undefined
              }

              icon={sinteseFinalizada ? <Eye size={16} /> : <Edit3 size={16} />}

              downloadComponent={
                <DownloadButton
                  exists={sinteseFinalizada}
                  doc={
                    <SintesePDF
                      pacienteNome={patient.nome}
                      respostas={getRespostasFormatadas(sinteseData)}
                    />
                  }
                  fileName={`sintese_${patient.nome}.pdf`}
                />
              }
            />
          ) : canEditGeneral && !hasEncaminhamento ? (
            <button
              onClick={() => handleNavigate("sintese", "current", "create")}
              className="text-sm text-brand-sintese hover:underline p-4 w-full text-left"
            >
              + Iniciar Síntese
            </button>
          ) : (
            <div></div>
          )}
        </FolderAccordion>

        {/* 4. ENCAMINHAMENTO */}
        <FolderAccordion
          title="Encaminhamento"
          tabColorClass="bg-brand-encaminhamento"
          icon={<Share size={18} />}
          isOpen={sections.encaminhamento}
          onToggle={() => toggleSection("encaminhamento")}
          showAddButton={canEditGeneral && !hasEncaminhamento}
          onAdd={handleCreateReferral} 
          addLabel="Novo Encaminhamento"
          accentColor="brand-encaminhamento"
        >
          {hasEncaminhamento ? (
            <FolderItemCard
              title="Encaminhamento Realizado"
              subtitle="Paciente encaminhada"
              icon={<Share size={16} />}
              onView={() => handleNavigate("encaminhamento", "current", "view")}
              onEdit={
                canEditGeneral
                  ? () => handleNavigate("encaminhamento", "current", "edit")
                  : undefined
              }
              downloadComponent={
                <DownloadButton exists={false} doc={null} fileName="" />
              }
            />
          ) : (
            <div></div>
          )}
        </FolderAccordion>

        {/* 5. ANOTAÇÕES */}
        <FolderAccordion
          title="Anotações"
          tabColorClass="bg-brand-anotacoes"
          icon={<Edit3 size={18} />}
          isOpen={sections.anotacoes}
          onToggle={() => toggleSection("anotacoes")}
          showAddButton={canEditGeneral}
          onAdd={() =>
            router.push(
              `/home/cadastro/anotacoes?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}`,
            )
          }
          addLabel="Nova Anotação"
          accentColor="brand-anotacoes"
        >
          {notesList.length > 0 ? (
            notesList.map((note) => (
              <FolderItemCard
                key={note.id}
                title={note.titulo}
                subtitle={
                  <span className="line-clamp-1">
                    {formatDateUTC(note.data)} | {note.resumo}
                  </span>
                }
                icon={<Edit3 size={16} />}
                onView={() =>
                  router.push(
                    `/home/cadastro/anotacoes?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}&sessionId=${note.id}`,
                  )
                }
                onEdit={
                  canEditGeneral
                    ? () =>
                        router.push(
                          `/home/cadastro/anotacoes?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}&sessionId=${note.id}`,
                        )
                    : undefined
                }
              />
            ))
          ) : (
            <div></div>
          )}
        </FolderAccordion>
      </div>

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmAction}
        title="Ação"
        message="Deseja continuar com esta ação?"
        isDestructive={dialogAction === "delete"}
        confirmText="Confirmar"
      />
    </div>
  );
}
