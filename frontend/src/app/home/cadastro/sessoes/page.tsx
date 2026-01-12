"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import Select from "@/components/SelectBox";
import SearchableSelect from "@/components/SearchableSelect";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { usePatients } from "@/hooks/usePatients";
import { useSessions } from "@/hooks/useSessions";
import { formatCPF } from "@/utils/format";
import { sessionHourOptions, roomOptions } from "@/utils/constants";

export default function RegisterSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");
  const { user, isLoading: authLoading } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { createSession } = useSessions();
  const { showFeedback } = useFeedback();
  const { loading: loadingSave, handleSubmit } = useFormHandler();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");

  // 1. Lógica de Pré-Seleção (Vinda da tela de Detalhes Paciente)
  useEffect(() => {
    if (preSelectedPatientId) {
      setSelectedPatient(preSelectedPatientId);
      
      if (!preSelectedPatientName) {
         fetchPatients({ page: 1, limit: 1, nome: "", status: "atendimento" });
      }
    }
  }, [preSelectedPatientId, preSelectedPatientName, fetchPatients]);

  // 2. Carrega lista inicial se não tiver pré-seleção
  useEffect(() => {
    if (user && !preSelectedPatientId) {
      fetchPatients({ page: 1, limit: 10, status: "atendimento" });
    }
  }, [user, fetchPatients, preSelectedPatientId]);

  // Função de busca do Select
  const handleSearchPatient = useCallback(
    (term: string) => {
      fetchPatients({
        nome: term,
        page: 1,
        limit: 10,
        status: "atendimento",
      });
    },
    [fetchPatients]
  );

  // Mapeamento das opções
  const patientOptions = patients
    .filter((p) => p && p.id && p.nome)
    .map((p) => {
      const detalhe = p.cpf
        ? `CPF: ${formatCPF(p.cpf)}`
        : `Status: ${p.status || "Sem status"}`;

      return {
        id: p.id,
        label: p.nome,
        subLabel: detalhe,
      };
    });
    
  // Truque visual para pré-seleção
  if (preSelectedPatientId && preSelectedPatientName && !patientOptions.find(p => p.id === preSelectedPatientId)) {
      patientOptions.unshift({
          id: preSelectedPatientId,
          label: decodeURIComponent(preSelectedPatientName),
          subLabel: "Pré-selecionado"
      });
  }

  const handleSave = async () => {
    // Validações Locais
    if (!selectedPatient || !selectedRoom || !selectedDate || !selectedHour) {
      showFeedback("Preencha todos os campos.", "error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (selectedDate < todayStr) {
      showFeedback("Não é permitido agendar sessões para datas passadas.", "error");
      return;
    }

    await handleSubmit(async () => {
      await createSession({
        pacienteId: selectedPatient,
        dia: selectedDate,
        hora: Number(selectedHour),
        sala: Number(selectedRoom),
        anotacoes: "Sessão registrada.",
      });

      showFeedback("Sessão cadastrada com sucesso!", "success");
      setTimeout(() => router.push("/home"), 1500);
    });
  };

  if (authLoading) return <div className="flex justify-center h-[80vh] items-center"><Spinner className="text-brand-purple" /></div>;

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase text-brand-dark">Registro de Sessão</Typography>
          <Typography className="text-gray-500 text-sm">Preencha os dados do agendamento.</Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <Users className="w-6 h-6 text-brand-purple" />
            </div>
            <Typography variant="h6" className="font-bold text-brand-dark">Dados do Agendamento</Typography>
          </div>

          <form className="flex flex-col gap-8">
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
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <Select label="Sala" value={selectedRoom} onChange={setSelectedRoom} options={roomOptions} required />
              <DateInput label="Data" minDate={new Date().toISOString().split("T")[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
              <Select label="Horário" value={selectedHour} onChange={setSelectedHour} options={sessionHourOptions} required />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="w-full lg:w-1/2">
                <Button variant="outline" type="button" onClick={() => router.back()} fullWidth>CANCELAR</Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button onClick={handleSave} loading={loadingSave} fullWidth>CADASTRAR SESSÃO</Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}