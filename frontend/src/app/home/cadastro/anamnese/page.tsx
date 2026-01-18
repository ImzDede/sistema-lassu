"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, FileDown, Stethoscope } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { FormularioBuilder } from "@/components/FormularioBuilder";
import SearchableSelect from "@/components/SearchableSelect";
import { useFeedback } from "@/contexts/FeedbackContext";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { formatCPF } from "@/utils/format";
import { AnamnesePDF } from "@/components/pdfs/AnamnesePDF";
import { useForm } from "@/hooks/useForm";

export default function AnamnesePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");
  const { user } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { showFeedback } = useFeedback();
  const { formData, fetchForm, saveForm, loading: loadingForm } = useForm();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(preSelectedPatientId || null);
  const [formularioFinalizado, setFormularioFinalizado] = useState(false);
  const [respostasFinais, setRespostasFinais] = useState<any>({});

  // 1. Carrega Pacientes
  useEffect(() => {
    if (user && !preSelectedPatientId) fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
  }, [user, fetchPatients, preSelectedPatientId]);

  // 2. Carrega Formulário
  useEffect(() => {
    if (selectedPatient) fetchForm("ANAMNESE", selectedPatient);
  }, [selectedPatient, fetchForm]);

  const handleSearchPatient = useCallback((term: string) => fetchPatients({ nome: term, page: 1, limit: 10, status: "atendimento" } as any), [fetchPatients]);
  const patientOptions = patients.map((p) => ({ id: p.id, label: p.nome, subLabel: p.cpf ? `CPF: ${formatCPF(p.cpf)}` : "Sem CPF" }));

  if (preSelectedPatientId && preSelectedPatientName && !patientOptions.find((p) => p.id === preSelectedPatientId)) {
    patientOptions.unshift({ id: preSelectedPatientId, label: decodeURIComponent(preSelectedPatientName), subLabel: "Selecionado" });
  }

  // --- AUTO SAVE (RASCUNHO) ---
  const handleSalvarRascunho = async (respostas: any) => {
    if (!selectedPatient) return;
    await saveForm("ANAMNESE", selectedPatient, respostas, false);
  };

  // --- FINALIZAR ---
  const handleFinalizar = async (respostas: any) => {
    if (!selectedPatient) {
      showFeedback("Selecione um paciente.", "error");
      return;
    }
    // 'true' indica finalizar.
    const sucesso = await saveForm("ANAMNESE", selectedPatient, respostas, true);
    
    if (sucesso) {
      setRespostasFinais(respostas);
      setFormularioFinalizado(true);
    }
  };

  // Prepara dados iniciais
  const getDadosIniciais = () => {
    if (!formData) return {};
    const iniciais: any = {};
    formData.secoes.forEach(secao => {
      secao.perguntas.forEach(perg => {
         if (perg.resposta) iniciais[perg.id] = perg.resposta; 
      });
    });
    return iniciais;
  }

  if (formularioFinalizado) {
    const nomePaciente = patientOptions.find((p) => p.id === selectedPatient)?.label || "Paciente";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <Typography variant="h4" className="text-brand-dark">Tudo pronto!</Typography>
        <PDFDownloadLink document={<AnamnesePDF pacienteNome={nomePaciente} respostas={respostasFinais} />} fileName={`anamnese.pdf`} className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold shadow-md hover:scale-105 transition-transform bg-brand-anamnese">
          {({ loading }) => (loading ? "Gerando..." : <><FileDown size={20} /> BAIXAR PDF</>)}
        </PDFDownloadLink>
        <button onClick={() => router.back()} className="text-sm text-gray-500 underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 rounded-full transition-colors bg-brand-anamnese/20 text-brand-anamnese hover:bg-brand-anamnese/30">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase tracking-wide text-brand-anamnese">Anamnese</Typography>
          <Typography variant="paragraph" className="text-gray-500 text-sm">Preencha o formulário inicial.</Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 bg-white border-brand-anamnese">
        <CardBody className="p-0">
          <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-2 rounded-lg bg-brand-anamnese/20"><Stethoscope className="w-6 h-6 text-brand-anamnese" /></div>
              <Typography variant="h6" className="font-bold text-brand-anamnese">Dados da Anamnese</Typography>
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
              accentColorClass="brand-anamnese"
              placeholder="Busque pelo nome..."
            />
          </div>

          <div className="px-6 md:px-10 py-8">
            {!selectedPatient ? (
                <div className="text-center text-gray-500 py-10">Selecione uma paciente.</div>
            ) : loadingForm ? (
                <div className="flex justify-center py-10"><Spinner className="h-8 w-8 text-brand-anamnese" /></div>
            ) : formData ? (
                <FormularioBuilder
                  modeloJson={{ data: formData } as any} 
                  dadosIniciais={getDadosIniciais()}
                  onFinalizar={handleFinalizar}
                  onSalvarRascunho={handleSalvarRascunho}
                  themeKey="anamnese"
                />
            ) : (
                <div className="text-center text-red-500 py-10">Erro ao carregar modelo.</div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
