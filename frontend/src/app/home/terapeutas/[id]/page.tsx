"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User as UserIcon,
  UserCog,
  Power,
  CalendarClock,
  Mail,
  Phone,
  Users,
  Copy,
  Lock,
} from "lucide-react";
import { Typography, Spinner, Chip } from "@material-tailwind/react";
import Button from "@/components/Button";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AvailabilityDialog from "@/components/AvailabilityDialog";
import PermissionsDialog from "@/components/PermissionsDialog";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import PaginationControls from "@/components/PaginationControls";
import ProfileCard from "@/components/ProfileCard";
import CardPaciente, { PatientStatus } from "@/components/CardPaciente";
import SearchInputWithFilter, {
  FilterOption,
} from "@/components/SearchInputWithFilter";
import PatientManageDialog from "@/components/PatientManageDialog";
import { differenceInYears, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { usePatients } from "@/hooks/usePatients";
import { numberToDayMap } from "@/utils/constants";
import { usePagination } from "@/hooks/usePagination";
import { useFeedback } from "@/contexts/FeedbackContext";
import { User } from "@/types/usuarios";
import { userService } from "@/services/userServices";
import { formatPhone } from "@/utils/format";

interface TherapistData extends User {
  disponibilidade?: any[];
}

export default function TherapistDetails({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { getUserById, updatePermissions } = useUsers();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { showFeedback } = useFeedback();
  const pagination = usePagination();

  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const [loadingTherapist, setLoadingTherapist] = useState(false);
  const [therapistForbidden, setTherapistForbidden] = useState(false);

  // Dialogs (admin)
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);

  // Modal (cadastro gerenciar paciente)
  const [openPatientManageModal, setOpenPatientManageModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");

  const isAdmin = !!user?.permAdmin;
  const isCadastroOnly = !!user?.permCadastro && !isAdmin;

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        label: "Todos",
        value: "todos",
        placeholder: "Buscar paciente por nome...",
      },
      { label: "Em Atendimento", value: "ativo" },
      { label: "Encaminhados", value: "encaminhado" },
      { label: "Inativos", value: "inativo" },
    ],
    [],
  );

  const mapStatusToCard = (pStatus: string): PatientStatus | null => {
    if (pStatus === "atendimento") return "in_progress";
    if (pStatus === "alta") return "completed";
    if (pStatus === "desistência" || pStatus === "encaminhada")
      return "dropped";
    return null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showFeedback("Número copiado!", "success");
  };

  const handlePatientCardClick = (patientId: string) => {
    if (isAdmin) {
      router.push(`/home/pacientes/${patientId}`);
      return;
    }
    if (isCadastroOnly) {
      setSelectedPatientId(patientId);
      setOpenPatientManageModal(true);
      return;
    }
    router.push(`/home/pacientes/${patientId}`);
  };

  const closePatientManageModal = () => {
    setOpenPatientManageModal(false);
    setSelectedPatientId(null);
  };

  const lastPatientsQueryRef = useRef<string>("");

  const buildPatientsQueryKey = (page: number) => {
    return JSON.stringify({
      id,
      page,
      searchTerm: searchTerm.trim(),
      activeFilter,
    });
  };

  const loadPatients = useCallback(
    async (pageToLoad: number) => {
      const queryKey = buildPatientsQueryKey(pageToLoad);
      if (lastPatientsQueryRef.current === queryKey) return;
      lastPatientsQueryRef.current = queryKey;

      let backendStatus: string | undefined = undefined;
      if (activeFilter === "ativo") backendStatus = "atendimento";
      if (activeFilter === "encaminhado") backendStatus = "encaminhada";
      if (activeFilter === "inativo") backendStatus = "inativo";

      const payload: any = {
        page: pageToLoad,
        limit: 8,
        status: backendStatus,
        userTargetId: id,
        nome: searchTerm.trim() || undefined,
      };

      const meta = await fetchPatients(payload);
      if (meta) {
        const rawTotal = (meta as any).totalItems ?? (meta as any).total ?? 0;

        const next = {
          currentPage: meta.page || pageToLoad,
          totalPages: meta.totalPages || 1,
          totalItems: rawTotal,
          itemCount: 0,
          itemsPerPage: 8,
        };

        const same =
          pagination.page === next.currentPage &&
          pagination.totalPages === next.totalPages &&
          pagination.totalItems === next.totalItems;

        if (!same) pagination.setMetadata(next);
      }
    },
    [id, searchTerm, activeFilter, fetchPatients, pagination],
  );

  const loadTherapistData = useCallback(async () => {
    if (!id) return;

    setLoadingTherapist(true);
    setTherapistForbidden(false);

    try {
      const userResponse = await getUserById(id);

      if (userResponse) {
        const rawAvailability =
          (userResponse as any).disponibilidade ||
          (userResponse as any).availability ||
          [];

        const mappedAvailability = rawAvailability.map((slot: any) => {
          const diaNumero = slot.diaSemana ?? slot.dia;
          return {
            dia: numberToDayMap[Number(diaNumero)] || "Dia Desconhecido",
            inicio: slot.horaInicio ?? slot.inicio,
            fim: slot.horaFim ?? slot.fim,
          };
        });

        setTherapist({ ...userResponse, disponibilidade: mappedAvailability });
      } else {
        showFeedback("Terapeuta não encontrada.", "error");
      }
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 403 && isCadastroOnly) {
        setTherapistForbidden(true);
        setTherapist({
          id,
          nome: "Profissional",
          email: "--",
          ativo: true,
        } as any);

        showFeedback(
          "Acesso restrito aos dados da terapeuta. Exibindo apenas pacientes vinculados.",
          "warning",
        );
      } else {
        showFeedback("Erro ao carregar dados.", "error");
      }
    } finally {
      setLoadingTherapist(false);
    }
  }, [id, getUserById, showFeedback, isCadastroOnly]);

  useEffect(() => {
    if (authLoading) return;
    if (!isTeacher) {
      router.push("/home");
      return;
    }
    loadTherapistData();
  }, [authLoading, isTeacher, router, loadTherapistData]);

  useEffect(() => {
    if (authLoading) return;
    if (!id) return;

    const timer = setTimeout(() => {
      lastPatientsQueryRef.current = "";
      if (pagination.page !== 1) pagination.setPage(1);
      loadPatients(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [id, searchTerm, activeFilter, authLoading]);

  const handlePatientsPageChange = (p: number) => {
    pagination.setPage(p);
    lastPatientsQueryRef.current = "";
    loadPatients(p);
  };

  const handleConfirmStatusChange = async () => {
    if (!id || !therapist) return;
    const novoStatus = !therapist.ativo;

    try {
      await updatePermissions(id, { ativo: novoStatus } as any);
      setTherapist({ ...therapist, ativo: novoStatus });

      showFeedback(
        novoStatus
          ? "Conta reativada com sucesso!"
          : "Conta desativada com sucesso.",
        novoStatus ? "success" : "warning",
      );
    } catch {
      showFeedback("Erro ao alterar status.", "error");
    }
  };

  const handlePermissionChange = async (key: keyof TherapistData) => {
    if (!id || !therapist) return;
    const newValue = !Boolean(therapist[key]);

    try {
      await updatePermissions(id, { [key]: newValue });
      setTherapist({ ...therapist, [key]: newValue });
      showFeedback("Permissão atualizada.", "success");
    } catch {
      showFeedback("Erro ao atualizar cargo.", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    try {
      await userService.adminResetPassword(id);
      showFeedback("Senha redefinida para o padrão.", "success");
    } catch {
      showFeedback("Erro ao redefinir senha.", "error");
    }
  };

  // LÓGICA PARA ENCONTRAR O OBJETO DO PACIENTE SELECIONADO
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  if (authLoading || !isTeacher || loadingTherapist || !therapist) {
    return (
      <div className="flex justify-center h-[80vh] items-center">
        <Spinner className="text-brand-purple" />
      </div>
    );
  }

  const formattedPhone = therapist.telefone
    ? formatPhone(therapist.telefone)
    : "--";

  return (
    <div className="flex flex-col w-full h-full pb-10">
      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full transition-colors bg-brand-encaminhamento/20 text-brand-encaminhamento hover:bg-brand-encaminhamento/30"
        >
          <ArrowLeft size={24} />
        </button>
        <Typography
          variant="h4"
          className="font-bold uppercase text-brand-encaminhamento"
        >
          Detalhes da Profissional
        </Typography>
      </div>

      <ProfileCard
        name={therapist.nome}
        subtitle={`Matrícula/CRP: ${therapist.matricula || "--"}`}
        avatarUrl={therapist.fotoUrl}
        status={therapist.ativo ? "Ativo" : "Inativo"}
        statusColor={therapist.ativo ? "green" : "red"}
        stripeColorClass="bg-brand-encaminhamento"
        footer={
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Typography
                variant="small"
                className="font-bold text-gray-500 uppercase text-xs"
              >
                Permissões de Acesso
              </Typography>
            </div>
            <div className="flex gap-2 flex-wrap">
              {therapist.permAdmin && (
                <Chip
                  value="Admin"
                  className="bg-purple-50 text-purple-900 border border-purple-100"
                  size="sm"
                  variant="ghost"
                />
              )}
              {therapist.permCadastro && (
                <Chip
                  value="Cadastro"
                  className="bg-pink-50 text-pink-900 border border-pink-100"
                  size="sm"
                  variant="ghost"
                />
              )}
              {therapist.permAtendimento && (
                <Chip
                  value="Atendimento"
                  className="bg-orange-50 text-orange-900 border border-orange-100"
                  size="sm"
                  variant="ghost"
                />
              )}
              {!therapist.permAdmin &&
                !therapist.permCadastro &&
                !therapist.permAtendimento && (
                  <span className="text-gray-400 text-sm">
                    Nenhuma permissão especial atribuída.
                  </span>
                )}
            </div>

            {therapistForbidden && (
              <div className="mt-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-2">
                Acesso limitado: o backend bloqueia detalhes completos do
                terapeuta para “Cadastro”.
              </div>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <Mail size={16} className="text-brand-purple" />
          <span className="text-sm">{therapist.email}</span>
        </div>

        <div
          className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 cursor-pointer hover:border-brand-purple/30 hover:text-brand-purple transition-all group"
          onClick={() =>
            therapist.telefone && copyToClipboard(therapist.telefone)
          }
        >
          <Phone size={16} className="text-brand-purple" />
          <span className="text-sm">{formattedPhone}</span>
          <Copy
            size={12}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        <div className="flex items-center gap-2 text-brand-encaminhamento bg-brand-encaminhamento/10 px-3 py-1.5 rounded-full border border-brand-encaminhamento">
          <Users size={16} className="text-brand-encaminhamento" />
          <span className="text-sm font-medium">
            {pagination.totalItems} Pacientes
          </span>
        </div>
      </ProfileCard>

      {/* ações administrativas — só admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
          <Button
            variant="outline"
            onClick={() => setOpenRoleDialog(true)}
            className="flex items-center justify-center gap-2 !border-[#A78FBF] !text-[#A78FBF] hover:!bg-[#A78FBF]/10"
          >
            <UserCog size={18} /> Permissões
          </Button>

          <Button
            variant="outline"
            onClick={() => setOpenAvailabilityDialog(true)}
            className="flex items-center justify-center gap-2 !border-[#F2B694] !text-[#F2B694] hover:!bg-[#F2B694]/10"
          >
            <CalendarClock size={18} /> Disponibilidade
          </Button>

          <Button
            variant="outline"
            onClick={() => setOpenResetDialog(true)}
            className="flex items-center justify-center gap-2 !border-[#D9A3B6] !text-[#D9A3B6] hover:!bg-[#D9A3B6]/10"
          >
            <Lock size={18} /> Redefinir Senha
          </Button>

          <Button
            variant="outline"
            onClick={() => setOpenStatusDialog(true)}
            className="flex items-center justify-center gap-2 !border-brand-anotacoes !text-brand-anotacoes hover:!bg-brand-anotacoes/10"
          >
            <Power size={18} />
            {therapist.ativo ? "Desativar" : "Reativar"}
          </Button>
        </div>
      )}

      {/* Lista de Pacientes */}
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between my-4 gap-4">
          <div className="flex items-center gap-2">
            <Typography
              variant="h5"
              className="text-brand-dark font-bold uppercase tracking-wide"
            >
              Pacientes Vinculados
            </Typography>
            <div className="p-1.5 bg-gray-100 rounded-full text-gray-500">
              <UserIcon size={16} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <SearchInputWithFilter
            value={searchTerm}
            onChange={setSearchTerm}
            filter={activeFilter}
            onFilterChange={(newFilter) => {
              setActiveFilter(newFilter);
              setSearchTerm("");
            }}
            options={filterOptions}
          />
        </div>

        <div className="flex flex-col gap-3">
          {loadingPatients ? (
            <div className="py-10 flex justify-center">
              <Spinner className="text-brand-purple" />
            </div>
          ) : (
            <>
              {patients.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    {patients.map((p) => {
                      const ageNumber = p.dataNascimento
                        ? differenceInYears(
                            new Date(),
                            parseISO(p.dataNascimento),
                          )
                        : null;

                      return (
                        <CardPaciente
                          key={p.id}
                          name={p.nome}
                          age={ageNumber}
                          avatarUrl={null}
                          progressPercent={0}
                          status={mapStatusToCard(p.status || "")}
                          onClick={() => handlePatientCardClick(p.id)}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-4 flex justify-center pb-6">
                    <PaginationControls
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      hasNext={pagination.hasNext}
                      hasPrev={pagination.hasPrev}
                      onPageChange={handlePatientsPageChange}
                      accentColorClass="brand-encaminhamento"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200 mt-4">
                  <Typography className="text-gray-400 text-sm">
                    Nenhum paciente encontrado.
                  </Typography>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dialogs admin */}
        {isAdmin && (
          <>
            <PermissionsDialog
              open={openRoleDialog}
              onClose={() => setOpenRoleDialog(false)}
              therapist={therapist}
              onUpdate={handlePermissionChange}
            />

            <ConfirmationDialog
              open={openStatusDialog}
              onClose={() => setOpenStatusDialog(false)}
              onConfirm={handleConfirmStatusChange}
              title={therapist.ativo ? "Desativar Conta?" : "Reativar Conta?"}
              message={`Deseja alterar o status de ${therapist.nome}?`}
              confirmText="Confirmar"
              isDestructive={therapist.ativo}
            />

            <AvailabilityDialog
              open={openAvailabilityDialog}
              onClose={() => setOpenAvailabilityDialog(false)}
              availabilities={therapist.disponibilidade || []}
            />

            <ResetPasswordDialog
              open={openResetDialog}
              onClose={() => setOpenResetDialog(false)}
              onConfirm={handleResetPassword}
              therapistName={therapist.nome}
              matricula={therapist.matricula}
            />
          </>
        )}
      </div>

      {/* --- MODAL REAL DE GERENCIAMENTO (CADASTRO) --- */}
      <PatientManageDialog
        open={openPatientManageModal && isCadastroOnly && !!selectedPatient}
        onClose={closePatientManageModal}
        patient={selectedPatient}
        onUpdated={() => {
          lastPatientsQueryRef.current = "";
          loadPatients(pagination.page);
        }}
        currentTherapistId={therapist.id}
      />
    </div>
  );
}
