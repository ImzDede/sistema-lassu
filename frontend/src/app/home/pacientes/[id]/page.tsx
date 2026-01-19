"use client";

import React, { useEffect, useState, useCallback } from "react";
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

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { showFeedback } = useFeedback();

  const [patient, setPatient] = useState<any | null>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);

  // --- MOCK DE ANOTAÇÕES (Substituir pela chamada da API quando tiver) ---
  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 1,
      titulo: "Anotação Inicial",
      data: "2025-10-05",
      resumo: "Observações sobre o comportamento inicial.",
    },
    {
      id: 2,
      titulo: "Evolução Quinzenal",
      data: "2025-10-20",
      resumo: "Melhora significativa na comunicação.",
    },
  ]);

  // Progresso vindo do Back
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

      // 1. Busca Dados do Paciente
      const data = await patientService.getById(id);
      setPatient(data.patient);

      // Nome da terapeuta vindo do JSON (data.therapist.nome)
      setTherapistName(data.therapist?.nome || "Não atribuído");

      // 1.1 Processa Progresso (Do backend)
      const forms = data.forms || {
        anamnesePorcentagem: 0,
        sintesePorcentagem: 0,
      };
      setFormsProgress({
        anamnese: forms.anamnesePorcentagem,
        sintese: forms.sintesePorcentagem,
      });
      // Média para o Perfil (Frontend calcula apenas a média visual)
      setTotalProgress(
        Math.round((forms.anamnesePorcentagem + forms.sintesePorcentagem) / 2),
      );

      setHasEncaminhamento(data.patient.status === "encaminhada");

      // 2. Busca Sessões
      try {
        const list = await sessionService.getAll({
          start: "2023-01-01",
          end: "2030-12-31",
          patientTargetId: id,
          orderBy: "dia",
          direction: "ASC",
        });
        setSessionsList(Array.isArray(list) ? list : []);
      } catch (sessionErr) {
        setSessionsList([]);
      }

      // 3. Busca Forms
      try {
        const anamnese = await formService.getAnamnese(id);
        setAnamneseData(anamnese);
      } catch (e) {
        /* Ignora */
      }

      try {
        const sintese = await formService.getSintese(id);
        setSinteseData(sintese);
      } catch (e) {
        /* Ignora */
      }

      // 4. Aqui você buscaria as anotações reais:
      // const notes = await noteService.getAll(id);
      // setNotesList(notes);
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

  // --- Helpers ---
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
  const canEditGeneral =
    !isMasterAdmin && (user?.permCadastro || user?.permAtendimento);
  const isEncaminhada = patient?.status === "encaminhada";

  // Status Formatado
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
            {isMasterAdmin && isEncaminhada && (
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
                color="purple"
                className="bg-gray-100 rounded-full"
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

          {/* RESPONSÁVEL: SÓ PARA ADMIN E CADASTRO */}
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

      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-2">
        {/* 1. SESSÕES */}
        <FolderAccordion
          title="Sessões"
          tabColorClass="bg-brand-sessao"
          icon={<Calendar size={18} />}
          isOpen={sections.sessoes}
          onToggle={() => toggleSection("sessoes")}
          showAddButton={canEditGeneral}
          onAdd={() => handleNavigate("sessoes", 0, "create")}
          addLabel="Nova Sessão"
          accentColor="brand-sessao"
        >
          {sessionsList.length > 0 ? (
            sessionsList.map((sessao, idx) => (
              <FolderItemCard
                key={sessao.id || idx}
                title={`${idx + 1}ª Sessão`}
                subtitle={
                  <span>
                    Sala {sessao.sala} |{" "}
                    {sessao.dia
                      ? new Date(sessao.dia).toLocaleDateString("pt-BR")
                      : "-"}{" "}
                    às {sessao.hora}:00
                  </span>
                }
                icon={<Clock size={16} />}
                highlight={idx === sessionsList.length - 1}
                onEdit={
                  canEditGeneral
                    ? () => handleNavigate("sessoes", sessao.id, "edit")
                    : undefined
                }
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">
              Nenhuma sessão encontrada.
            </div>
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
              onView={() => handleNavigate("anamnese", "current", "view")}
              onEdit={
                canEditGeneral && !anamneseData.finalizada
                  ? () => handleNavigate("anamnese", "current", "edit")
                  : undefined
              }
              downloadComponent={
                <DownloadButton
                  exists={!!anamneseData.finalizada}
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
          ) : canEditGeneral ? (
            <button
              onClick={() => handleNavigate("anamnese", "current", "create")}
              className="text-sm text-brand-anamnese hover:underline p-4 w-full text-left"
            >
              + Iniciar Anamnese
            </button>
          ) : (
            <div className="p-4 text-gray-400 text-sm">
              Nenhuma anamnese iniciada.
            </div>
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
              onView={() => handleNavigate("sintese", "current", "view")}
              onEdit={
                canEditGeneral && !sinteseData.finalizada
                  ? () => handleNavigate("sintese", "current", "edit")
                  : undefined
              }
              downloadComponent={
                <DownloadButton
                  exists={!!sinteseData.finalizada}
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
          ) : canEditGeneral ? (
            <button
              onClick={() => handleNavigate("sintese", "current", "create")}
              className="text-sm text-brand-sintese hover:underline p-4 w-full text-left"
            >
              + Iniciar Síntese
            </button>
          ) : (
            <div className="p-4 text-gray-400 text-sm">
              Nenhuma síntese iniciada.
            </div>
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
          onAdd={() => handleNavigate("encaminhamento", 0, "create")}
          addLabel="Novo Encaminhamento"
          accentColor="brand-encaminhamento"
        >
          {/* Lógica: Se status == encaminhada, mostra o card */}
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
              // Botão de download (simulado, pois não temos arquivo ainda)
              downloadComponent={
                <DownloadButton exists={false} doc={null} fileName="" />
              }
            />
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">
              Nenhum encaminhamento.
            </div>
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
          onAdd={() => handleNavigate("anotacoes", 0, "create")}
          addLabel="Nova Anotação"
          accentColor="brand-anotacoes"
        >
          {/* MAP DAS ANOTAÇÕES (Usando lista mockada por enquanto) */}
          {notesList.length > 0 ? (
            notesList.map((note) => (
              <FolderItemCard
                key={note.id}
                title={note.titulo}
                subtitle={
                  <span>
                    {new Date(note.data).toLocaleDateString("pt-BR")} |{" "}
                    {note.resumo}
                  </span>
                }
                icon={<Edit3 size={16} />}
                onView={() => handleNavigate("anotacoes", note.id, "view")}
                onEdit={
                  canEditGeneral
                    ? () => handleNavigate("anotacoes", note.id, "edit")
                    : undefined
                }
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">
              Nenhuma anotação registrada.
            </div>
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
