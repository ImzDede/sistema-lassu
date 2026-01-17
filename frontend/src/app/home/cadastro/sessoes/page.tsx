"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, Calendar, Clock, MapPin, List, FileText } from "lucide-react";
import { Card, CardBody, Typography, Spinner, Textarea } from "@material-tailwind/react";
import Button from "@/components/Button";
import Input from "@/components/Input"; 
import Select from "@/components/SelectBox";
import SearchableSelect from "@/components/SearchableSelect";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { usePatients } from "@/hooks/usePatients";
import { sessionService } from "@/services/sessionServices";
import { sessionHourOptions, roomOptions } from "@/utils/constants";
import { validateSessionDateISO } from "@/utils/validation";
import { formatCPF } from "@/utils/format";

export default function RegisterSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const preSelectedPatientId = searchParams.get("patientId");
  const preSelectedPatientName = searchParams.get("patientName");
  
  const isEditing = !!sessionId;
  
  const { user, isLoading: authLoading } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { showFeedback } = useFeedback();
  const { loading: loadingSave, handleSubmit } = useFormHandler();
  
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedSessionNumber, setSelectedSessionNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [anotacoes, setAnotacoes] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);

  const sessionOptions = [
    { value: "1", label: "1ª Sessão" },
    { value: "2", label: "2ª Sessão" },
    { value: "3", label: "3ª Sessão" },
  ];

  // Carrega dados se for Edição
  useEffect(() => {
    if (isEditing && sessionId) {
      setIsLoadingData(true);
      sessionService.getById(Number(sessionId))
        .then((data) => {
          setSelectedPatient(data.pacienteId);
          setSelectedDate(String(data.dia).split("T")[0]);
          setSelectedHour(String(data.hora));
          setSelectedRoom(String(data.sala));
          setAnotacoes(data.anotacoes || "");
          
          if (!preSelectedPatientName && data.pacienteId) {
             fetchPatients({ page: 1, limit: 1, status: "atendimento" } as any); 
          }
        })
        .catch((err: any) => {
          console.error(err);
          showFeedback("Erro ao carregar sessão.", "error");
          router.back();
        })
        .finally(() => setIsLoadingData(false));
    } else if (preSelectedPatientId) {
      setSelectedPatient(preSelectedPatientId);
      if (!preSelectedPatientName) {
         fetchPatients({ page: 1, limit: 1, nome: "", status: "atendimento" } as any);
      }
    }
  }, [sessionId, isEditing, preSelectedPatientId, preSelectedPatientName, fetchPatients, router, showFeedback]);

  // Busca pacientes inicial
  useEffect(() => {
    if (user && !preSelectedPatientId && !isEditing) {
      fetchPatients({ page: 1, limit: 10, status: "atendimento" } as any);
    }
  }, [user, fetchPatients, preSelectedPatientId, isEditing]);

  const handleSearchPatient = useCallback((term: string) => {
      fetchPatients({ nome: term, page: 1, limit: 10, status: "atendimento" } as any);
  }, [fetchPatients]);

  const patientOptions = patients
    .filter((p) => p && p.id && p.nome)
    .map((p) => ({
      id: p.id,
      label: p.nome,
      subLabel: p.cpf ? `CPF: ${formatCPF(p.cpf)}` : "Sem CPF",
    }));
    
  if (preSelectedPatientId && preSelectedPatientName && !patientOptions.find(p => p.id === preSelectedPatientId)) {
      patientOptions.unshift({
          id: preSelectedPatientId,
          label: decodeURIComponent(preSelectedPatientName),
          subLabel: "Selecionado"
      });
  }

  const handleSave = async () => {
    if (!selectedPatient || !selectedRoom || !selectedDate || !selectedHour) {
      showFeedback("Preencha os campos obrigatórios.", "error");
      return;
    }

    const dateCheck = validateSessionDateISO(selectedDate);
    if (!dateCheck.valid) {
      showFeedback(dateCheck.message, "error");
      return;
    }

    await handleSubmit(async () => {
      const payload = {
        pacienteId: selectedPatient,
        dia: selectedDate,
        hora: Number(selectedHour),
        sala: Number(selectedRoom),
        anotacoes: selectedSessionNumber 
            ? `Sessão ${selectedSessionNumber} - ${anotacoes}`.trim() 
            : anotacoes
      };

      try {
          if (isEditing) {
            await sessionService.update(Number(sessionId), {
                dia: payload.dia,
                hora: payload.hora,
                sala: payload.sala,
                anotacoes: payload.anotacoes
            });
            showFeedback("Sessão atualizada com sucesso!", "success");
          } else {
            await sessionService.create(payload);
            showFeedback("Sessão agendada com sucesso!", "success");
          }
          
          setTimeout(() => router.back(), 1000);

      } catch (error: any) {
          if (error.response?.status === 409) {
              showFeedback("Conflito: Horário ou Sala indisponível.", "error");
          } else {
              showFeedback("Erro ao salvar sessão.", "error");
          }
      }
    });
  };

  if (authLoading || isLoadingData) return <div className="flex justify-center h-[80vh] items-center"><Spinner className="text-brand-purple" /></div>;

  return (
    <div className="max-w-4xl mx-auto w-full pb-10 relative">

      <div className="flex items-center gap-4 mb-6">
        {/* BOTÃO DE VOLTAR COM BOLA */}
        <button 
          onClick={() => router.back()} 
          className="p-3 rounded-full transition-colors bg-brand-sessao/20 text-brand-sessao hover:bg-brand-sessao/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase text-brand-dark">
            {isEditing ? "Editar Sessão" : "Nova Sessão"}
          </Typography>
          <Typography className="text-gray-500 text-sm">
            {isEditing ? "Altere os dados do agendamento." : "Preencha os dados para agendar."}
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 bg-brand-surface border-brand-sessao">
        <CardBody className="p-6 md:p-10">
          
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
            <div className="p-2 rounded-lg bg-brand-sessao/20">
              <Users className="w-6 h-6 text-brand-sessao" />
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
                disabled={!!preSelectedPatientId || isEditing} 
                placeholder="Busque pelo nome do paciente"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                type="date"
                label="Data" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                required 
                leftIcon={Calendar}
              />
              <Select 
                label="Horário" 
                value={selectedHour} 
                onChange={setSelectedHour} 
                options={sessionHourOptions} 
                required 
                placeholder="Selecione o horário..."
                leftIcon={Clock}
              />
              <Select 
                label="Sala de Atendimento" 
                value={selectedRoom} 
                onChange={setSelectedRoom} 
                options={roomOptions} 
                required 
                placeholder="Selecione a sala..."
                leftIcon={MapPin}
              />
              {!isEditing && (
                  <Select 
                    label="Nº da Sessão (Opcional)" 
                    value={selectedSessionNumber} 
                    onChange={setSelectedSessionNumber} 
                    options={sessionOptions} 
                    placeholder="Ex: 1ª Sessão"
                    leftIcon={List}
                  />
              )}
            </div>

            {/*<div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-gray-500" />
                    <label className="text-sm font-bold text-gray-700">Anotações / Observações</label>
                </div>
                <Textarea 
                    value={anotacoes}
                    onChange={(e) => setAnotacoes(e.target.value)}
                    rows={4}
                    placeholder="Detalhes sobre o atendimento..."
                    className="!border-gray-300 focus:!border-brand-sessao bg-white"
                    labelProps={{ className: "hidden" }}
                />
            </div>*/}

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="w-full lg:w-1/2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.back()} 
                  fullWidth
                  className="bg-transparent hover:bg-opacity-10 border transition-colors border-brand-sessao text-brand-sessao"
                >
                  CANCELAR
                </Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button 
                  onClick={handleSave} 
                  loading={loadingSave} 
                  fullWidth
                  className="bg-brand-sessao"
                >
                    {isEditing ? "SALVAR ALTERAÇÕES" : "AGENDAR SESSÃO"}
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}