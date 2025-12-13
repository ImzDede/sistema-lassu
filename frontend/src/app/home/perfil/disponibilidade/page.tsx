"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import { useFeedback } from "@/hooks/useFeedback";
import api from "@/services/api";
import { TimeSlot } from "@/types/disponibilidade";
import { numberToDayMap, dayMap } from "@/utils/format";

export default function ProfileAvailability() {
  const router = useRouter();
  const { feedback, showAlert, closeAlert } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  // Buscar Disponibilidade Atual
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/availability");
        const data = response.data;

        // Converte formato do Backend (dia: number) para Frontend (day: string)
        // e adiciona IDs temporários para o React list
        if (Array.isArray(data)) {
            const formatted: TimeSlot[] = data.map((item: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                day: numberToDayMap[item.dia] || "Segunda-feira",
                start: `${item.horaInicio.toString().padStart(2, "0")}:00`,
                end: `${item.horaFim.toString().padStart(2, "0")}:00`
            }));
            setAvailability(formatted);
        }
      } catch (error) {
        console.error(error);
        showAlert("red", "Erro ao carregar disponibilidade.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showAlert]);

  const handleSave = async () => {
    setSaving(true);
    closeAlert();

    // Validação básica
    const hasInvalidTime = availability.some(
      (slot) =>
        parseInt(slot.start.split(":")[0], 10) >=
        parseInt(slot.end.split(":")[0], 10)
    );

    if (hasInvalidTime) {
      showAlert("red", "Horário final deve ser maior que o inicial.");
      setSaving(false);
      return;
    }

    try {
      // Converter Frontend -> Backend
      const payload = availability.map((slot) => ({
        dia: dayMap[slot.day],
        horaInicio: parseInt(slot.start.split(":")[0], 10),
        horaFim: parseInt(slot.end.split(":")[0], 10),
      }));

      await api.put("/availability", payload);
      showAlert("green", "Disponibilidade atualizada!");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao salvar horários.";
      showAlert("red", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner className="h-10 w-10 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-20">
      <FeedbackAlert
        open={feedback.open}
        color={feedback.color}
        message={feedback.message}
        onClose={closeAlert}
      />

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Typography variant="h4" className="font-bold uppercase text-brand-dark">
          Minha Disponibilidade
        </Typography>
      </div>

      <Card className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface">
        <CardBody className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-brand-purple/10 rounded-lg">
                    <Clock className="w-6 h-6 text-brand-purple" />
                </div>
                <div>
                    <Typography variant="h6" className="font-bold text-brand-dark">Gerenciar Horários</Typography>
                    <Typography variant="small" className="text-gray-500">Informe os dias que você pode atender.</Typography>
                </div>
            </div>

            <AvailabilityEditor 
                availability={availability} 
                setAvailability={setAvailability} 
                onError={(msg) => showAlert("red", msg)}
            />

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button 
                onClick={handleSave} 
                loading={saving} 
                fullWidth 
                className="flex items-center justify-center gap-2"
              >
                <Save size={18} /> SALVAR DISPONIBILIDADE
              </Button>
            </div>
        </CardBody>
      </Card>
    </div>
  );
}