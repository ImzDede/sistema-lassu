"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { FormularioBuilder } from "@/components/FormularioBuilder";
import SearchableSelect from "@/components/SearchableSelect";
import { useFeedback } from "@/contexts/FeedbackContext";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { useFormHandler } from "@/hooks/useFormHandler"; // ✅ Importado

export default function SintesePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");

  const mode = searchParams.get("mode");

  const { user } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { showFeedback } = useFeedback();
  
  // ✅ Hook de formulário e handler
  const { formData, fetchForm, saveForm, loading: loadingForm } = useForm();
  const { handleSubmit } = useFormHandler();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(
    preSelectedPatientId || null,
  );

  useEffect(() => {
    if (user && !preSelectedPatientId) {
      fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
    }
  }, [user, fetchPatients, preSelectedPatientId]);

  useEffect(() => {
    if (selectedPatient) {
      fetchForm("SINTESE", selectedPatient);
    }
  }, [selectedPatient, fetchForm]);

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
    subLabel: p.telefone || "Sem telefone",
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

  // AutoSave: Silencioso (sem handleSubmit)
  const handleSalvarRascunho = async (respostas: any) => {
    if (!selectedPatient) return;
    await saveForm("SINTESE", selectedPatient, respostas, false);
  };

  // Finalizar: Com tratamento de erro e feedback visual
  const handleFinalizar = async (respostas: any) => {
    if (!selectedPatient) {
      showFeedback("Selecione um paciente.", "error");
      return;
    }

    await handleSubmit(async () => {
      await saveForm("SINTESE", selectedPatient, respostas, true);
      // Sucesso
      router.back();
    });
  };

  const getDadosIniciais = () => {
    if (!formData) return {};
    const iniciais: any = {};
    formData.secoes.forEach((secao) => {
      secao.perguntas.forEach((perg) => {
        if (perg.resposta) iniciais[perg.id] = perg.resposta;
      });
    });
    return iniciais;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full transition-colors bg-brand-sintese/20 text-brand-sintese hover:bg-brand-sintese/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography
            variant="h4"
            className="font-bold uppercase tracking-wide text-brand-sintese"
          >
            {mode === "view" ? "Visualizar Síntese" : "Síntese"}
          </Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">
            {mode === "view"
              ? "Modo de leitura apenas."
              : "Relatório de fechamento ou evolução."}
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 bg-white border-brand-sintese">
        <CardBody className="p-0">
          <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-2 rounded-lg bg-brand-sintese/20">
                <FileText className="w-6 h-6 text-brand-sintese" />
              </div>
              <Typography variant="h6" className="font-bold text-brand-sintese">
                Dados da Síntese
              </Typography>
            </div>

            <SearchableSelect
              label="Selecione a Paciente"
              options={patientOptions}
              value={selectedPatient}
              onChange={setSelectedPatient}
              onSearch={handleSearchPatient}
              isLoading={loadingPatients}
              required
              disabled={!!preSelectedPatientId}
              placeholder="Busque pelo nome..."
              accentColorClass="brand-sintese"
            />
          </div>

          <div className="px-6 md:px-10 py-8">
            {!selectedPatient ? (
              <div className="text-center text-gray-500 py-10">
                Selecione uma paciente.
              </div>
            ) : loadingForm ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-8 w-8 text-brand-sintese" />
              </div>
            ) : formData ? (
              <FormularioBuilder
                modeloJson={{ data: formData } as any}
                dadosIniciais={getDadosIniciais()}
                onFinalizar={handleFinalizar}
                onSalvarRascunho={handleSalvarRascunho}
                themeKey="sintese"
                readOnly={mode === "view"}
              />
            ) : (
              <div className="text-center text-red-500 py-10">
                Erro ao carregar síntese.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}