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
import {
  Typography,
  Spinner,
} from "@material-tailwind/react";
import Button from "@/components/Button";
import CardListagem from "@/components/CardListagem";
import FeedbackAlert from "@/components/FeedbackAlert";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import TherapistProfileCard from "@/components/TherapistProfileCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AvailabilityDialog from "@/components/AvailabilityDialog";
import PermissionsDialog from "@/components/PermissionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { usePatients } from "@/hooks/usePatients";
import { calculateAge } from "@/utils/date";
import { formatPhone, numberToDayMap } from "@/utils/format";
import { usePagination } from "@/hooks/usePagination";
import { useFeedback } from "@/hooks/useFeedback";

interface TherapistData {
  id: string;
  nome: string;
  matricula: number;
  email: string;
  telefone?: string;
  ativo: boolean;
  fotoUrl?: string;
  permAdmin: boolean;
  permCadastro: boolean;
  permAtendimento: boolean;
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

  const { getUserById, updateUser } = useUsers();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();

  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const { feedback, showAlert, closeAlert } = useFeedback();

  // Estados dos Modais
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);

  // Estados do Filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");

  const { visibleCount, loadMore, hasMore } = usePagination(8, 8);

  // 1. CARREGAR DADOS
  const loadData = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await getUserById(id);
      
      if (response) {
        // Extrai os dados da usuária do envelope 'user'
        const userData = response.user ? response.user : response;

        // Extrai a disponibilidade
        const rawAvailability = response.availability || response.disponibilidade || [];
        
        // Traduzi a disponibilidade para o Modal (1 -> "Segunda-feira")
        const mappedAvailability = rawAvailability.map((slot: any) => ({
          dia: numberToDayMap[Number(slot.dia)] || `Dia ${slot.dia}`,
          inicio: slot.horaInicio ?? slot.inicio,
          fim: slot.horaFim ?? slot.fim,
        }));

        // Salva tudo "achatado" no estado
        setTherapist({
          ...userData, // Espalha nome, ativo, perms... na raiz
          disponibilidade: mappedAvailability // Adiciona a lista formatada
        });

      } else {
        showAlert("red", "Terapeuta não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showAlert("red", "Erro de conexão.");
    }
  }, [id, getUserById, showAlert]);

  useEffect(() => {
    if (authLoading) return;
    if (!isTeacher) {
      router.push("/home");
      return;
    }
    loadData();
    fetchPatients();
  }, [authLoading, isTeacher, loadData, fetchPatients, router]);

  // LÓGICA DE FILTRO DE PACIENTES
  const myPatients =
    patients?.filter(
      (item: { patient: { profissionalResponsavelId: string } }) =>
        item.patient.profissionalResponsavelId === id
    ) || [];

  const filteredPatients = myPatients.filter((item: { patient: any }) => {
    const p = item.patient;
    const term = searchTerm.toLowerCase();

    // Busca por nome
    const matchesSearch = p.nome.toLowerCase().includes(term);

    // Filtro de Status
    const inactiveKeywords = [
      "arquivado",
      "inativo",
      "alta",
      "desistiu",
      "cancelado",
    ];

    const pStatus = p.status ? p.status.toLowerCase() : "";
    const isInactive = inactiveKeywords.some((keyword) =>
      pStatus.includes(keyword)
    );

    let matchesStatus = true;

    if (statusFilter === "ativo") {
      matchesStatus = !isInactive;
    } else if (statusFilter === "inativo") {
      matchesStatus = isInactive;
    }

    return matchesSearch && matchesStatus;
  });

  const paginatedPatients = filteredPatients.slice(0, visibleCount);

  // 3. AÇÕES
  const handleConfirmStatusChange = async () => {
    if (!id || !therapist) return; // Usa id da rota para segurança
    const novoStatus = !therapist.ativo;
    
    try {
      const success = await updateUser(id, { ativo: novoStatus });

      if (success) {
        setTherapist({ ...therapist, ativo: novoStatus });
        showAlert(
          novoStatus ? "green" : "red",
          novoStatus ? "Conta reativada com sucesso!" : "Conta desativada com sucesso."
        );
      } else {
        showAlert("red", "Erro ao alterar status.");
      }
    } catch (e) {
      showAlert("red", "Erro de comunicação.");
    }
  };

  const handlePermissionChange = async (key: keyof TherapistData) => {
    if (!id || !therapist) return;
    const newValue = !therapist[key];
    
    try {
      const success = await updateUser(id, { [key]: newValue });

      if (success) {
        setTherapist({ ...therapist, [key]: newValue });
      } else {
        showAlert("red", "Erro ao atualizar cargo.");
      }
    } catch (e) {
      showAlert("red", "Erro de comunicação.");
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
        color={feedback.color}
        message={feedback.message}
        onClose={closeAlert}
      />

      {/* HEADER NAV */}
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

      {/* PERFIL DA TERAPEUTA */}
      <TherapistProfileCard
        therapist={therapist}
        patientCount={myPatients.length}
      />

      {/* BOTÕES DE AÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Button
          variant="outline"
          onClick={() => setOpenRoleDialog(true)}
          className="flex items-center justify-center gap-2 !border-brand-purple !text-brand-purple hover:!bg-brand-purple hover:!text-white transition-all shadow-sm hover:shadow-md"
        >
          <UserCog size={18} /> Gerenciar Permissões
        </Button>

        <Button
          variant="outline"
          onClick={() => setOpenAvailabilityDialog(true)}
          className="flex items-center justify-center gap-2 !border-blue-500 !text-blue-600 hover:!bg-blue-500 hover:!text-white transition-all shadow-sm hover:shadow-md"
        >
          <CalendarClock size={18} /> Ver Disponibilidade
        </Button>

        <Button
          variant="outline"
          onClick={() => setOpenStatusDialog(true)}
          className={`flex items-center justify-center gap-2 border transition-all shadow-sm hover:shadow-md
            ${
              therapist.ativo
                ? "!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
                : "!border-green-500 !text-green-600 hover:!bg-green-500 hover:!text-white"
            }`}
        >
          <Power size={18} />{" "}
          {therapist.ativo ? "Desativar Conta" : "Reativar Conta"}
        </Button>
      </div>

      {/* LISTA DE PACIENTES COM FILTRO */}
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

        {/* Componente de Busca */}
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
                {paginatedPatients.length > 0 ? (
                  <>
                    {paginatedPatients.map(
                      (item: {
                        patient: {
                          id: React.Key | null | undefined;
                          nome: string;
                          dataNascimento: string;
                          telefone: string;
                          status: string | undefined;
                        };
                      }) => (
                        <CardListagem
                          key={item.patient.id}
                          nomePrincipal={item.patient.nome}
                          detalhe={
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-gray-700">
                                {calculateAge(item.patient.dataNascimento)}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {formatPhone(item.patient.telefone)}
                              </span>
                            </div>
                          }
                          status={item.patient.status}
                        />
                      )
                    )}

                    {/* 4. BOTÃO CARREGAR MAIS */}
                    {hasMore(filteredPatients.length) && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white"
                        >
                          Carregar Mais Pacientes
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Typography className="text-gray-400 text-sm">
                      Nenhum paciente encontrado com esses filtros.
                    </Typography>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* MODAIS */}
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
          message={
            therapist.ativo
              ? `Tem certeza que deseja desativar ${therapist.nome}? Ela perderá acesso ao sistema imediatamente.`
              : `Deseja reativar o acesso de ${therapist.nome}?`
          }
          confirmText={therapist.ativo ? "Sim, Desativar" : "Sim, Reativar"}
          isDestructive={therapist.ativo}
        />

        <AvailabilityDialog
          open={openAvailabilityDialog}
          onClose={() => setOpenAvailabilityDialog(false)}
          availabilities={therapist.disponibilidade}
        />
      </div>
    </div>
  );
}