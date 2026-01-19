"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import {
  UserRoundCog,
  Power,
  ArrowRightLeft,
  X,
  RefreshCcw,
} from "lucide-react";
import Button from "@/components/Button";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import SearchableSelect, { Option } from "@/components/SearchableSelect";
import { useUsers } from "@/hooks/useUsers";
import { useFeedback } from "@/contexts/FeedbackContext";
import { patientService } from "@/services/patientServices";
import { getErrorMessage } from "@/utils/error";

type FieldErrors = Record<string, string>;

interface PatientManageDialogProps {
  open: boolean;
  onClose: () => void;

  patient: {
    id: string;
    nome: string;
    status?: string | null;
    usuarioId?: string | null;
  } | null;

  onUpdated?: () => void;
  currentTherapistId?: string;
}

function extractFieldErrors(err: any): FieldErrors {
  const details = err?.response?.data?.error?.details;
  if (!details || typeof details !== "object") return {};

  const mapped: FieldErrors = {};
  Object.keys(details).forEach((k) => {
    const arr = details[k];
    if (Array.isArray(arr) && arr.length > 0) mapped[k] = String(arr[0]);
  });
  return mapped;
}

export default function PatientManageDialog({
  open,
  onClose,
  patient,
  onUpdated,
  currentTherapistId,
}: PatientManageDialogProps) {
  const { showFeedback } = useFeedback();
  const { users, loading: loadingUsers, fetchUsers } = useUsers();

  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"ativo" | "inativo">(
    "ativo",
  );

  // Delay para evitar ghost click
  const handleSafeClose = () => {
    setTimeout(() => {
      onClose();
    }, 150);
  };

  useEffect(() => {
    if (!open) return;
    fetchUsers({ page: 1, limit: 10, ativo: true });
  }, [open, fetchUsers]);

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setSelectedTherapistId(currentTherapistId || patient?.usuarioId || null);
  }, [open, currentTherapistId, patient?.usuarioId]);

  const therapistOptions: Option[] = useMemo(() => {
    return (users || [])
      .filter((u) => u?.id && u?.nome)
      .map((u) => ({
        id: u.id,
        label: u.nome,
        subLabel: u.matricula ? `CRP/Matr: ${u.matricula}` : "Terapeuta",
      }));
  }, [users]);

  const handleSearchTherapists = useCallback(
    (term: string) => {
      fetchUsers({ page: 1, limit: 10, ativo: true, nome: term });
    },
    [fetchUsers],
  );

  const handleTransfer = async () => {
    if (!patient?.id) return;

    setFieldErrors({});
    if (!selectedTherapistId) {
      setFieldErrors({ usuarioId: "Selecione uma terapeuta." });
      showFeedback("Selecione a nova profissional responsável.", "error");
      return;
    }

    if (selectedTherapistId === currentTherapistId) {
      showFeedback("A paciente já está vinculada a esta terapeuta.", "warning");
      return;
    }

    try {
      setSaving(true);
      await patientService.transfer(patient.id, selectedTherapistId);

      showFeedback("Transferência realizada com sucesso!", "success");
      onUpdated?.();
      handleSafeClose();
    } catch (err: any) {
      const errors = extractFieldErrors(err);
      if (Object.keys(errors).length > 0) setFieldErrors(errors);
      showFeedback(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusButtonClick = () => {
    if (!patient) return;
    const isCurrentlyActive = patient.status !== "inativo";
    setTargetStatus(isCurrentlyActive ? "inativo" : "ativo");
    setConfirmStatusOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!patient?.id) return;
    setFieldErrors({});

    try {
      setSaving(true);
      const statusToSend = targetStatus === "ativo" ? "atendimento" : "inativo";
      await patientService.update(patient.id, { status: statusToSend } as any);

      showFeedback(
        `Paciente ${targetStatus === "ativo" ? "reativada" : "desativada"} com sucesso.`,
        "success",
      );
      onUpdated?.();
      handleSafeClose();
    } catch (err: any) {
      showFeedback(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
      setConfirmStatusOpen(false);
    }
  };

  if (!patient) return null;

  const isPatientActive = patient.status !== "inativo";

  return (
    <>
      <Dialog
        open={open}
        handler={handleSafeClose}
        size="sm"
        className="p-4 bg-brand-surface z-[9999]"
        dismiss={{ enabled: true, escapeKey: true }}
      >
        <DialogHeader className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-brand-encaminhamento/10 text-brand-encaminhamento">
              <UserRoundCog size={22} />
            </div>
            <div className="flex flex-col">
              <Typography variant="h5" className="text-brand-dark font-heading">
                Gerenciar Paciente
              </Typography>
              <Typography className="text-gray-500 text-sm font-normal">
                {patient.nome}
              </Typography>
            </div>
          </div>

          <IconButton
            variant="text"
            color="blue-gray"
            onClick={handleSafeClose}
          >
            <X size={20} />
          </IconButton>
        </DialogHeader>

        <DialogBody className="pt-6 flex flex-col gap-8">
          {/* SEÇÃO 1: TRANSFERÊNCIA */}
          <div className="flex flex-col gap-3">
            <Typography className="text-xs uppercase font-bold text-gray-400">
              1. Transferência de Paciente
            </Typography>

            <div className="p-4 bg-white border border-gray-100 rounded-xl flex flex-col gap-4">
              <SearchableSelect
                label="Nova Terapeuta Responsável"
                options={therapistOptions}
                value={selectedTherapistId}
                onChange={setSelectedTherapistId}
                onSearch={handleSearchTherapists}
                isLoading={loadingUsers}
                placeholder="Busque pelo nome..."
                accentColorClass="brand-encaminhamento"
                error={fieldErrors.usuarioId}
                required
              />

              <Button
                onClick={handleTransfer}
                loading={saving}
                accentColorClass="brand-encaminhamento"
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                <ArrowRightLeft size={18} />
                CONFIRMAR TRANSFERÊNCIA
              </Button>
            </div>
          </div>
        </DialogBody>
      </Dialog>

      <ConfirmationDialog
        open={confirmStatusOpen}
        onClose={() => setConfirmStatusOpen(false)}
        onConfirm={confirmStatusChange}
        title={
          targetStatus === "inativo"
            ? "Desativar paciente?"
            : "Reativar paciente?"
        }
        message={
          targetStatus === "inativo"
            ? `Deseja desativar o cadastro de ${patient.nome}? Ela ficará com status "inativo" e a vaga da terapeuta atual será liberada.`
            : `Deseja reativar o cadastro de ${patient.nome} para atendimento?`
        }
        confirmText={
          targetStatus === "inativo"
            ? "Confirmar Desativação"
            : "Confirmar Reativação"
        }
        isDestructive={targetStatus === "inativo"}
      />
    </>
  );
}
