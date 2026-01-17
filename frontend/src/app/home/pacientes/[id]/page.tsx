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
  FileUp,
  UserPlus,
  Trash2,
  FileText,
  Share,
  Stethoscope,
  Edit3,
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
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { patientService } from "@/services/patientServices";
import { sessionService } from "@/services/sessionServices";
import { calculateAge } from "@/utils/date";
import { formatCPF, formatPhone } from "@/utils/format";
import ProfileCard from "@/components/ProfileCard";
import FolderAccordion from "@/components/FolderAccordion";
import { FolderItemCard } from "@/components/PatientFolderContent";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function PatientDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { showFeedback } = useFeedback();

  const [patient, setPatient] = useState<any | null>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState<string>("Buscando...");

  // Dialog de confirmação para ações do menu
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<
    "refer" | "unrefer" | "delete" | null
  >(null);

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
      const data = await patientService.getById(id);
      setPatient(data.patient);
      setTherapistName(data.therapist?.nome || "Não atribuído");

      try {
        const list = await sessionService.getAll({
          start: "2023-01-01",
          end: "2030-12-31",
          patientTargetId: id,
          orderBy: "dia",
          direction: "DESC",
        });
        setSessionsList(list);
      } catch (sessionErr) {
        console.warn(sessionErr);
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

  // AÇÃO: Copiar Telefone
  const handleCopyPhone = () => {
    if (patient?.telefone) {
      navigator.clipboard.writeText(patient.telefone);
      showFeedback("Telefone copiado!", "success");
    }
  };

  // AÇÃO: Menu Dropdown
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
        showFeedback("Paciente encaminhada com sucesso.", "success");
      } else if (dialogAction === "unrefer") {
        await patientService.unreferPatient(patient.id);
        setPatient({ ...patient, status: "atendimento" });
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

  const handleNavigateToCreate = (type: string) => {
    if (!patient) return;
    router.push(
      `/home/cadastro/${type}?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}`,
    );
  };

  const handleNavigateToEdit = (type: string, itemId: string | number) => {
    if (!patient) return;
    router.push(
      `/home/cadastro/${type}?id=${itemId}&patientId=${patient.id}&patientName=${encodeURIComponent(patient.nome)}&mode=edit`,
    );
  };

  const isMasterAdmin = user?.permAdmin;
  const canEdit =
    !isMasterAdmin && (user?.permCadastro || user?.permAtendimento);

  // Status Helpers
  const isEncaminhada = patient?.status === "encaminhada";
  const isAtendimento = patient?.status === "atendimento";

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

        {/* MENU DE AÇÕES (3 PONTINHOS) */}
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
            {/* 1. Encaminhar (Apenas Terapeuta Dono se estiver Ativo) */}
            {!isMasterAdmin && isAtendimento && (
              <MenuItem
                onClick={() => handleActionClick("refer")}
                className="flex items-center gap-2 text-brand-dark hover:bg-brand-purple/5 p-3"
              >
                <FileUp size={16} />{" "}
                <span className="font-medium">Encaminhar</span>
              </MenuItem>
            )}

            {/* 2. Reativar (Apenas Admin se estiver Encaminhada) */}
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

      {/* PERFIL */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full mb-8">
        <ProfileCard
          name={patient.nome}
          subtitle={`${patient.dataNascimento ? calculateAge(patient.dataNascimento) : "--"}`}
          avatarUrl={null}
          status={patient.status}
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
                  className="font-bold text-brand-purple"
                >
                  20%
                </Typography>
              </div>
              <Progress
                value={20}
                size="lg"
                color="purple"
                className="bg-gray-100 rounded-full"
              />
            </div>
          }
        >
          {/* CPF */}
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <CreditCard size={16} className="text-brand-purple" />
            <span className="text-sm font-mono">
              {patient.cpf ? formatCPF(patient.cpf) : "--"}
            </span>
          </div>

          {/* TELEFONE */}
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

          {/* TERAPEUTA RESPONSÁVEL */}
          <div className="flex items-center gap-2 bg-brand-encaminhamento/10 px-3 py-1.5 rounded-full border border-brand-encaminhamento text-brand-encaminhamento">
            <UserCheck size={16} className="text-brand-encaminhamento" />
            <span className="font-medium text-sm truncate max-w-[150px]">
              Resp: {therapistName}
            </span>
          </div>
        </ProfileCard>
      </div>

      {/* PASTAS (ACCORDIONS) */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-2">
        {/* 1. SESSÕES */}
        <FolderAccordion
          title="Sessões"
          tabColorClass="bg-brand-sessao"
          icon={<Calendar size={18} />}
          isOpen={sections.sessoes}
          onToggle={() => toggleSection("sessoes")}
          showAddButton={canEdit}
          onAdd={() => handleNavigateToCreate("sessoes")}
          addLabel="Nova Sessão"
          accentColor="brand-sessao"
        >
          {sessionsList.length > 0 ? (
            sessionsList.map((sessao, idx) => (
              <FolderItemCard
                key={sessao.id || idx}
                title={`${sessionsList.length - idx}ª Sessão`}
                subtitle={
                  <span>
                    Sala {sessao.sala} |{" "}
                    {sessao.dia
                      ? String(sessao.dia)
                          .split("T")[0]
                          .split("-")
                          .reverse()
                          .join("/")
                      : "-"}{" "}
                    às {sessao.hora}:00
                  </span>
                }
                icon={<Clock size={16} />}
                highlight={idx === 0}
                onEdit={
                  canEdit
                    ? () => handleNavigateToEdit("sessoes", sessao.id)
                    : undefined
                }
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">
              Nenhuma sessão registrada
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
          <FolderItemCard
            title="Anamnese Inicial"
            variant="progress"
            progress={0}
            onClick={() => handleNavigateToEdit("anamnese", "current")}
            onEdit={
              canEdit
                ? () => handleNavigateToEdit("anamnese", "current")
                : undefined
            }
            onView={
              !canEdit
                ? () => handleNavigateToEdit("anamnese", "current")
                : undefined
            }
          />
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
          <FolderItemCard
            title="Síntese Diagnóstica"
            variant="progress"
            progress={0}
            onClick={() => handleNavigateToEdit("sintese", "current")}
            onEdit={
              canEdit
                ? () => handleNavigateToEdit("sintese", "current")
                : undefined
            }
            onView={
              !canEdit
                ? () => handleNavigateToEdit("sintese", "current")
                : undefined
            }
          />
        </FolderAccordion>

        {/* 4. ENCAMINHAMENTO */}
        <FolderAccordion
          title="Encaminhamento"
          tabColorClass="bg-brand-encaminhamento"
          icon={<Share size={18} />}
          isOpen={sections.encaminhamento}
          onToggle={() => toggleSection("encaminhamento")}
          showAddButton={canEdit}
          onAdd={() => handleNavigateToCreate("encaminhamento")}
          addLabel="Novo Encaminhamento"
          accentColor="brand-encaminhamento"
        >
          <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">
            Sem histórico
          </div>
        </FolderAccordion>

        {/* 5. ANOTAÇÕES */}
        <FolderAccordion
          title="Anotações"
          tabColorClass="bg-brand-anotacoes"
          icon={<Edit3 size={18} />}
          isOpen={sections.anotacoes}
          onToggle={() => toggleSection("anotacoes")}
          showAddButton={canEdit}
          onAdd={() => handleNavigateToCreate("anotacoes")}
          addLabel="Nova Anotação"
          accentColor="brand-anotacoes"
        >
          {/* Apenas exemplo, futuramente listar as anotações */}
          <div className="text-center py-4 text-gray-400 text-xs uppercase tracking-wider">
            Nenhuma anotação
          </div>
        </FolderAccordion>
      </div>

      {/* DIALOG DE CONFIRMAÇÃO */}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmAction}
        title={
          dialogAction === "refer"
            ? "Encaminhar Paciente?"
            : dialogAction === "unrefer"
              ? "Reativar Paciente?"
              : "Excluir Paciente?"
        }
        message={
          dialogAction === "refer"
            ? "O status será alterado para 'Encaminhada'. Use isso apenas em caso de alta ou transferência externa."
            : dialogAction === "unrefer"
              ? "O status voltará para 'Em Atendimento' e a paciente aparecerá na lista ativa."
              : "A paciente será movida para a lixeira (Status de inativo). Deseja continuar?"
        }
        isDestructive={dialogAction === "delete"}
        confirmText="Confirmar"
      />
    </div>
  );
}
