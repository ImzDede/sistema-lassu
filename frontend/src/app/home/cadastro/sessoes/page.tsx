"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import Select from "@/components/SelectBox";
import SearchableSelect from "@/components/SearchableSelect";
import FeedbackAlert from "@/components/FeedbackAlert";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import { useSessions } from "@/hooks/useSessions";
import { useFeedback } from "@/hooks/useFeedback";
import { formatCPF } from "@/utils/format";
import { sessionHourOptions, roomOptions } from "@/utils/constants";

export default function RegisterSession() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { patients, fetchPatients, loading: loadingPatients } = usePatients();
  const { createSession } = useSessions();
  const { feedback, showAlert, closeAlert } = useFeedback();
  const [loadingSave, setLoadingSave] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");

  useEffect(() => {
    if (user) fetchPatients();
  }, [user, fetchPatients]);

  const patientOptions = patients
    .filter(p => ["ativo", "triagem", "encaminhada"].some(s => (p.patient?.status || "").toLowerCase().includes(s)))
    .map(p => {
        const detalhe = p.patient.cpf 
            ? `CPF: ${formatCPF(p.patient.cpf)}` 
            : `Status: ${p.patient.status}`;
        return { 
            id: p.patient.id, 
            label: p.patient.nome,
            subLabel: detalhe 
        };
    });

  const handleSave = async () => {
    closeAlert();

    if (!selectedPatient || !selectedRoom || !selectedDate || !selectedHour) {
      showAlert("red", "Preencha todos os campos.");
      return;
    }

    setLoadingSave(true);
    try {
      await createSession({
        pacienteId: selectedPatient,
        dia: selectedDate,
        hora: Number(selectedHour),
        sala: Number(selectedRoom),
        anotacoes: "Sessão registrada."
      });
      showAlert("green", "Sessão cadastrada!");
      setTimeout(() => router.push("/home"), 1500);
    } catch (error: any) {
        showAlert("red", error.message);
    } finally {
      setLoadingSave(false);
    }
  };

  if (authLoading) return <div className="flex justify-center h-[80vh] items-center"><Spinner className="text-brand-purple"/></div>;

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <FeedbackAlert open={feedback.open} color={feedback.color} message={feedback.message} onClose={closeAlert} />

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <Typography variant="h4" className="font-bold uppercase text-brand-dark">
            Registro de Sessão
          </Typography>
          <Typography className="text-gray-500 text-sm">
            Preencha os dados do agendamento.
          </Typography>
        </div>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-purple/10 rounded-lg">
              <Users className="w-6 h-6 text-brand-purple" />
            </div>
            <Typography variant="h6" className="font-bold text-brand-dark">
              Dados do Agendamento
            </Typography>
          </div>

          <form className="flex flex-col gap-8">
            
            {/* LINHA 1: PACIENTE */}
            <div className="w-full">
                <SearchableSelect 
                    label="Paciente"
                    options={patientOptions}
                    value={selectedPatient}
                    onChange={setSelectedPatient}
                    isLoading={loadingPatients}
                    required
                />
            </div>

            {/* LINHA 2: SALA, DATA, HORÁRIO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <Select 
                    label="Sala" 
                    value={selectedRoom} 
                    onChange={setSelectedRoom} 
                    options={roomOptions}
                    required
                />
                <DateInput 
                    label="Data" 
                    minDate={new Date().toISOString().split("T")[0]}
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    required
                />
                <Select 
                    label="Horário" 
                    value={selectedHour} 
                    onChange={setSelectedHour} 
                    options={sessionHourOptions} 
                    required
                />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
               <div className="w-full lg:w-1/2">
                <Button variant="outline" type="button" onClick={() => router.back()} fullWidth>
                  CANCELAR
                </Button>
              </div>
              <div className="w-full lg:w-1/2">
                <Button onClick={handleSave} loading={loadingSave} fullWidth>
                  CADASTRAR SESSÃO
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}