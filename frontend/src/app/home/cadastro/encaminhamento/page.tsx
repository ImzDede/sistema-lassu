"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Share, FileUp } from "lucide-react";
import { Card, CardBody, Typography, Textarea } from "@material-tailwind/react";
import Button from "@/components/Button";
import FileUploadBox from "@/components/FileUploadBox";
import SearchableSelect from "@/components/SearchableSelect";
import Select from "@/components/SelectBox";
import { useFormHandler } from "@/hooks/useFormHandler";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { formatCPF } from "@/utils/format";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function EncaminhamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");
  const { user } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { loading: loadingSave, handleSubmit } = useFormHandler();

  const { borderClass, textClass, lightBgClass } = useAppTheme();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(
    preSelectedPatientId || null,
  );
  const [encaminhamentoTipo, setEncaminhamentoTipo] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user && !preSelectedPatientId)
      fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
  }, [user, fetchPatients, preSelectedPatientId]);
  const handleSearchPatient = useCallback(
    (term: string) =>
      fetchPatients({
        nome: term,
        page: 1,
        limit: 10,
        status: "atendimento",
      } as any),
    [fetchPatients],
  );
  const patientOptions = patients.map((p) => ({
    id: p.id,
    label: p.nome,
    subLabel: p.cpf ? `CPF: ${formatCPF(p.cpf)}` : "Sem CPF",
  }));
  if (
    preSelectedPatientId &&
    preSelectedPatientName &&
    !patientOptions.find((p) => p.id === preSelectedPatientId)
  ) {
    patientOptions.unshift({
      id: preSelectedPatientId,
      label: decodeURIComponent(preSelectedPatientName),
      subLabel: "Selecionado",
    });
  }
  const sessionOptions = [
    { value: "Sessão 1", label: "1ª Sessão" },
    { value: "Sessão 2", label: "2ª Sessão" },
    { value: "Sessão 3", label: "3ª Sessão" },
  ];

  const handleSave = async () => {
    await handleSubmit(async () => {
      console.log("Encaminhando:", {
        patientId: selectedPatient,
        sessao: encaminhamentoTipo,
        motivo: description,
        arquivo: selectedFile,
      });
      await new Promise((r) => setTimeout(r, 1000));
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
            <Typography
              variant="h6"
              className="font-bold text-brand-encaminhamento"
            >
              Dados do Encaminhamento
            </Typography>
          </div>

          <div className="w-full">
            <SearchableSelect
              label="Paciente"
              options={patientOptions}
              value={selectedPatient}
              onChange={setSelectedPatient}
              onSearch={handleSearchPatient}
              isLoading={loadingPatients}
              required
              disabled={!!preSelectedPatientId}
              placeholder="Busque pelo nome"
              accentColorClass="brand-encaminhamento"
            />
          </div>
          <div className="w-full">
            <Select
              label="Referente à Sessão"
              options={sessionOptions}
              value={encaminhamentoTipo}
              onChange={setEncaminhamentoTipo}
              placeholder="Selecione..."
              accentColorClass="brand-encaminhamento"
            />
          </div>
          <div>
            <Typography
              variant="small"
              className="font-bold text-gray-700 mb-2 flex gap-2"
            >
              Anexar Documento (Opcional)
            </Typography>
            <FileUploadBox
              selectedFile={selectedFile}
              onFileChange={(e) =>
                e.target.files && setSelectedFile(e.target.files[0])
              }
              onRemoveFile={() => setSelectedFile(null)}
            />
          </div>
          <div>
            <Typography
              variant="small"
              className="font-bold text-gray-700 mb-2 flex gap-2"
            >
              Motivo / Destino
            </Typography>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Descreva..."
              className="!border-gray-300 focus:!border-brand-encaminhamento focus:!ring-1 focus:!ring-brand-encaminhamento bg-white"
              labelProps={{ className: "hidden" }}
            />
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
                loading={loadingSave}
                fullWidth
                accentColorClass="brand-encaminhamento"
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
