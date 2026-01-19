"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Share } from "lucide-react";
import { Card, CardBody, Typography, Textarea } from "@material-tailwind/react";
import Button from "@/components/Button";
import FileUploadBox from "@/components/FileUploadBox";
import SearchableSelect from "@/components/SearchableSelect";
import { useEncaminhamento } from "@/hooks/useEncaminhamento";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { formatCPF } from "@/utils/format";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler"; // ✅ Importado

type FieldErrors = {
  patientId?: string;
  destino?: string;
};

export default function EncaminhamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");

  const { user } = useAuth();
  const { showFeedback } = useFeedback();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  
  // ✅ useFormHandler substitui o loading manual para controlar erros
  const { loading: formLoading, handleSubmit } = useFormHandler();
  
  const { saveReferral } = useEncaminhamento();

  const { borderClass, textClass, lightBgClass } = useAppTheme();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(
    preSelectedPatientId || null
  );
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (user && !preSelectedPatientId) {
      fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
    }
  }, [user, fetchPatients, preSelectedPatientId]);

  const handleSearchPatient = useCallback(
    (term: string) =>
      fetchPatients({ nome: term, page: 1, limit: 10, status: "atendimento" } as any),
    [fetchPatients]
  );

  const patientOptions = useMemo(() => {
    const opts = patients.map((p) => ({
      id: p.id,
      label: p.nome,
      subLabel: p.cpf ? formatCPF(p.cpf) : undefined,
      cpf: p.cpf ? formatCPF(p.cpf) : undefined,
    }));

    if (
      preSelectedPatientId &&
      preSelectedPatientName &&
      !opts.find((p) => p.id === preSelectedPatientId)
    ) {
      opts.unshift({
        id: preSelectedPatientId,
        label: decodeURIComponent(preSelectedPatientName),
        subLabel: "Selecionado",
        cpf: undefined,
      });
    }

    return opts;
  }, [patients, preSelectedPatientId, preSelectedPatientName]);

  const canSubmit = !!selectedPatient && description.trim().length > 0 && !formLoading;

  const handleSave = async () => {
    // 1. Validação Front
    const nextErrors: FieldErrors = {};
    if (!selectedPatient) nextErrors.patientId = "Selecione um paciente.";
    if (!description.trim()) nextErrors.destino = "Campo obrigatório.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showFeedback("Verifique os campos em destaque.", "error");
      return;
    }

    // 2. Validação Back via useFormHandler
    await handleSubmit(async () => {
      // O saveReferral precisa lançar erro (throw) se falhar no axios.
      // Se ele retornar booleano (true/false), verificamos aqui:
      const success = await saveReferral(selectedPatient!, description, selectedFile);
      
      if (!success) {
        // Se o hook antigo engole o erro e retorna false, forçamos um erro aqui
        // para o useFormHandler exibir a mensagem genérica ou o hook antigo já exibiu.
        // O ideal é que saveReferral dê throw.
        throw new Error("Não foi possível salvar o encaminhamento.");
      }

      // Sucesso
      await new Promise((r) => setTimeout(r, 400));
      router.back();
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className={`p-3 rounded-full transition-colors ${lightBgClass} ${textClass} hover:bg-opacity-20`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            className="font-bold uppercase tracking-wide text-brand-encaminhamento"
          >
            Encaminhamento
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">
            Registre a alta ou transferência.
          </Typography>
        </div>
      </div>

      <Card className={`w-full shadow-lg border-t-4 ${borderClass} bg-white`}>
        <CardBody className="p-6 md:p-10 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
            <div className={`p-2 rounded-lg ${lightBgClass}`}>
              <Share className={`w-6 h-6 ${textClass}`} />
            </div>
            <Typography variant="h6" className="font-bold text-brand-encaminhamento">
              Dados do Encaminhamento
            </Typography>
          </div>

          <div className="w-full">
            <SearchableSelect
              label="Paciente"
              options={patientOptions}
              value={selectedPatient}
              onChange={(id) => {
                setSelectedPatient(id);
                setErrors((prev) => ({ ...prev, patientId: "" }));
              }}
              onSearch={handleSearchPatient}
              isLoading={loadingPatients}
              required
              disabled={!!preSelectedPatientId}
              placeholder="Busque pelo nome"
              accentColorClass="brand-encaminhamento"
              error={errors.patientId}
            />
          </div>

          <div>
            <Typography variant="small" className="font-bold text-gray-700 mb-2 flex gap-2">
              Anexar Documento{" "}
              <span className="text-gray-400 font-semibold">(Opcional)</span>
            </Typography>

            <FileUploadBox
              selectedFile={selectedFile}
              onFileChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
              onRemoveFile={() => setSelectedFile(null)}
            />
          </div>

          <div>
            <Typography variant="small" className="font-bold text-gray-700 mb-2 flex gap-2">
              Motivo / Destino
            </Typography>

            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, destino: "" }));
              }}
              rows={5}
              placeholder="Descreva o motivo e o destino do encaminhamento..."
              className={`
                bg-white
                ${errors.destino
                  ? "!border-feedback-error-text focus:!border-feedback-error-text focus:!ring-1 focus:!ring-feedback-error-text"
                  : "!border-gray-300 focus:!border-brand-encaminhamento focus:!ring-1 focus:!ring-brand-encaminhamento"}
              `}
              labelProps={{ className: "hidden" }}
            />

            {errors.destino && (
              <span className="text-xs text-feedback-error-text font-bold ml-1 mt-1 animate-pulse">
                {errors.destino}
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse lg:flex-row gap-4 mt-2 border-t border-gray-100 pt-4">
            <div className="w-full lg:w-1/2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                fullWidth
                accentColorClass="brand-encaminhamento"
                className="bg-transparent hover:bg-opacity-10 border"
              >
                CANCELAR
              </Button>
            </div>

            <div className="w-full lg:w-1/2">
              <Button
                onClick={handleSave}
                loading={formLoading}
                fullWidth
                accentColorClass="brand-encaminhamento"
                disabled={!canSubmit}
                title={!canSubmit ? "Selecione um paciente e preencha o destino" : undefined}
              >
                REGISTRAR ENCAMINHAMENTO
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
