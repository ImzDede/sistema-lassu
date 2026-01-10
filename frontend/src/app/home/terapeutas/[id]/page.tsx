"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User as UserIcon,
  UserCog,
  Power,
  CalendarClock,
} from "lucide-react";
import { Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import CardListagem from "@/components/CardListagem";
import FeedbackAlert from "@/components/FeedbackAlert";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import TherapistProfileCard from "@/components/TherapistProfileCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AvailabilityDialog from "@/components/AvailabilityDialog";
import PermissionsDialog from "@/components/PermissionsDialog";
import PaginationControls from "@/components/PaginationControls";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { usePatients } from "@/hooks/usePatients";
import { calculateAge } from "@/utils/date";
import { numberToDayMap } from "@/utils/constants";
import { usePagination } from "@/hooks/usePagination";
import { useFeedback } from "@/hooks/useFeedback";
import { User } from "@/types/usuarios";

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
  const { feedback, showFeedback, closeFeedback } = useFeedback();

  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");
  const pagination = usePagination();

  // 1. Carrega dados APENAS do Terapeuta
  const loadTherapistData = useCallback(async () => {
    if (!id) return;
    try {
      const userResponse = await getUserById(id);
      
      if (userResponse) {
        // Mapeamento robusto da disponibilidade
        const rawAvailability = (userResponse as any).disponibilidade || (userResponse as any).availability || [];
        
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

  // 2. Carrega lista de Pacientes
  const loadPatients = useCallback((pageToLoad: number) => {
      const backendStatus = statusFilter === "ativo" ? "atendimento" : (statusFilter === "inativo" ? "encaminhada" : undefined);
      
      fetchPatients({
          page: pageToLoad,
          limit: 8,
          nome: searchTerm,
          status: backendStatus,
          userTargetId: id 
      }).then((meta) => {
          if (meta) {
              const rawTotal = (meta as any).total ?? (meta as any).count ?? 0;
              
              pagination.setMetadata({
                  currentPage: meta.page || pageToLoad,
                  totalPages: meta.totalPages || 1,
                  totalItems: rawTotal,
                  itemCount: 0,
                  itemsPerPage: 8
              });
          }
      });
  }, [id, searchTerm, statusFilter, fetchPatients, pagination]);

  // Validação de Acesso e Carga Inicial
  useEffect(() => {
    if (authLoading) return;

    if (!isTeacher) {
      router.push("/home");
      return;
    }

    // Carrega dados iniciais
    loadTherapistData();

  }, [authLoading, isTeacher]);

  // Recarrega pacientes quando filtros mudam
  useEffect(() => {
    // Reseta para página 1 sempre que mudar o filtro
    pagination.setPage(1);
    loadPatients(1);
  }, [searchTerm, statusFilter]);

  const handlePatientsPageChange = (p: number) => {
    pagination.setPage(p);
    loadPatients(p);
  };

  // --- Funções de Ação (Permissão/Status) ---
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
        novoStatus ? "success" : "warning"
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

  if (authLoading || !isTeacher || !therapist) {
    return (
      <div className="flex justify-center h-[80vh] items-center">
        <Spinner className="text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full pb-10">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.type === "error" ? "red" : "green"}
        message={feedback.message}
        onClose={closeFeedback}
      />

      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <Typography variant="h5" className="ml-2 text-gray-600 font-normal">
          Detalhes da Profissional
        </Typography>
      </div>

      <TherapistProfileCard
        therapist={therapist}
        patientCount={pagination.totalItems || patients.length || 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Button
          variant="outline"
          onClick={() => setOpenRoleDialog(true)}
          className="flex items-center justify-center gap-2 !border-brand-purple !text-brand-purple hover:!bg-brand-purple hover:!text-white"
        >
          <UserCog size={18} /> Gerenciar Permissões
        </Button>
        <Button
          variant="outline"
          onClick={() => setOpenAvailabilityDialog(true)}
          className="flex items-center justify-center gap-2 !border-blue-500 !text-blue-600 hover:!bg-blue-500 hover:!text-white"
        >
          <CalendarClock size={18} /> Ver Disponibilidade
        </Button>
        <Button
          variant="outline"
          onClick={() => setOpenStatusDialog(true)}
          className="flex items-center justify-center gap-2 !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
        >
          <Power size={18} />{" "}
          {therapist.ativo ? "Desativar Conta" : "Reativar Conta"}
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
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
            searchLabel="Procurar paciente"
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
                    {patients.map((p) => (
                      <CardListagem
                        key={p.id}
                        nomePrincipal={p.nome}
                        detalhe={
                          <span className="font-medium text-gray-700">
                            {p.dataNascimento
                              ? calculateAge(p.dataNascimento)
                              : "-"}
                          </span>
                        }
                        status={p.status}
                      />
                    ))}
                    <PaginationControls
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      hasNext={pagination.hasNext}
                      hasPrev={pagination.hasPrev}
                      onPageChange={handlePatientsPageChange}
                    />
                  </>
                ) : (
                  <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
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
      </div>
    </div>
  );
}
