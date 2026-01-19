"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  const { isTeacher, isLoading: authLoading } = useAuth();
  const { getUserById, updatePermissions } = useUsers();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const { showFeedback } = useFeedback();

  // Dialogs
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const pagination = usePagination();

  const filterOptions: FilterOption[] = [
    {
      label: "Todos",
      value: "todos",
      placeholder: "Buscar paciente por nome...",
    },
    { label: "Em Atendimento", value: "ativo" },
    { label: "Encaminhados", value: "encaminhado" },
    { label: "Inativos", value: "inativo" },
  ];

  const loadTherapistData = useCallback(async () => {
    if (!id) return;
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
    } catch (error) {
      console.error("Erro ao carregar terapeuta:", error);
      showFeedback("Erro ao carregar dados.", "error");
    }
  }, [id, getUserById, showFeedback]);

  const loadPatients = useCallback(
    (pageToLoad: number) => {
      let backendStatus = undefined;

      if (activeFilter === "ativo") backendStatus = "atendimento";
      if (activeFilter === "encaminhado") backendStatus = "encaminhada";
      if (activeFilter === "inativo") backendStatus = "inativo";

      const payload: any = {
        page: pageToLoad,
        limit: 8,
        status: backendStatus,
        userTargetId: id,
        nome: searchTerm || undefined,
      };

      fetchPatients(payload).then((meta) => {
        if (meta) {
          const rawTotal = (meta as any).totalItems ?? (meta as any).total ?? 0;

          pagination.setMetadata({
            currentPage: meta.page || pageToLoad,
            totalPages: meta.totalPages || 1,
            totalItems: rawTotal,
            itemCount: 0,
            itemsPerPage: 8,
          });
        }
      });
    },
    [id, searchTerm, activeFilter, fetchPatients, pagination],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isTeacher) {
      router.push("/home");
      return;
    }
    loadTherapistData();
  }, [authLoading, isTeacher]);

  useEffect(() => {
    const timer = setTimeout(() => {
      pagination.setPage(1);
      loadPatients(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeFilter]);

  const handlePatientsPageChange = (p: number) => {
    pagination.setPage(p);
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
    } catch (e) {
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
    } catch (e) {
      showFeedback("Erro ao atualizar cargo.", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    try {
      await userService.adminResetPassword(id);
      showFeedback("Senha redefinida para o padrão.", "success");
    } catch (error) {
      showFeedback("Erro ao redefinir senha.", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showFeedback("Número copiado!", "success");
  };

  const mapStatusToCard = (pStatus: string): PatientStatus | null => {
    if (pStatus === "atendimento") return "in_progress";
    if (pStatus === "alta") return "completed";
    if (pStatus === "desistência" || pStatus === "encaminhada")
      return "dropped";
    return null;
  };

  if (authLoading || !isTeacher || !therapist) {
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

      {/* Grid de Ações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        {/* 1. Permissões */}
        <Button
          variant="outline"
          onClick={() => setOpenRoleDialog(true)}
          className="flex items-center justify-center gap-2 !border-[#A78FBF] !text-[#A78FBF] hover:!bg-[#A78FBF]/10"
        >
          <UserCog size={18} /> Permissões
        </Button>

        {/* 2. Disponibilidade */}
        <Button
          variant="outline"
          onClick={() => setOpenAvailabilityDialog(true)}
          className="flex items-center justify-center gap-2 !border-[#F2B694] !text-[#F2B694] hover:!bg-[#F2B694]/10"
        >
          <CalendarClock size={18} /> Disponibilidade
        </Button>

        {/* 3. Redefinir Senha */}
        <Button
          variant="outline"
          onClick={() => setOpenResetDialog(true)}
          className="flex items-center justify-center gap-2 !border-[#D9A3B6] !text-[#D9A3B6] hover:!bg-[#D9A3B6]/10"
        >
          <Lock size={18} /> Redefinir Senha
        </Button>

        {/* 4. Status */}
        <Button
          variant="outline"
          onClick={() => setOpenStatusDialog(true)}
          className={`flex items-center justify-center gap-2 !border-brand-anotacoes !text-brand-anotacoes hover:!bg-brand-anotacoes/10`}
        >
          <Power size={18} />
          {therapist.ativo ? "Desativar" : "Reativar"}
        </Button>
      </div>

      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
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

        <div>
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
                            onClick={() =>
                              router.push(`/home/pacientes/${p.id}`)
                            }
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
        </div>

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
      </div>
    </div>
  );
}
