"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import FeedbackAlert from "@/components/FeedbackAlert";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import { useFeedback } from "@/hooks/useFeedback";
import { userService } from "@/services/userServices";
import { TimeSlot } from "@/types/disponibilidade";
import { numberToDayMap, dayMap } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileAvailability() {
  const router = useRouter();
  const { user } = useAuth();
  const { feedback, showFeedback, closeFeedback } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  // Buscar Disponibilidade Atual
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const lista = await userService.getMyAvailability();

        if (Array.isArray(lista)) {
          const formatted: TimeSlot[] = lista.map((item: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            day:
              numberToDayMap[item.diaSemana] ||
              numberToDayMap[item.dia] ||
              "Segunda-feira",
            start: `${item.horaInicio.toString().padStart(2, "0")}:00`,
            end: `${item.horaFim.toString().padStart(2, "0")}:00`,
          }));
          setAvailability(formatted);
        }
      } catch (error) {
        console.error(error);
        showFeedback("Erro ao carregar disponibilidade.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showFeedback, user]);

  const handleSave = async () => {
    setSaving(true);
    closeFeedback();

    const hasInvalidTime = availability.some(
      (slot) =>
        parseInt(slot.start.split(":")[0], 10) >=
        parseInt(slot.end.split(":")[0], 10)
    );

    if (hasInvalidTime) {
      showFeedback("Horário final deve ser maior que o inicial.", "error");
      setSaving(false);
      return;
    }

    try {
      const payload = availability.map((slot) => ({
        diaSemana: dayMap[slot.day],
        horaInicio: parseInt(slot.start.split(":")[0], 10),
        horaFim: parseInt(slot.end.split(":")[0], 10),
      }));

      // Usa userService para salvar
      await userService.saveMyAvailability(payload);

      router.push("/home/perfil?success=disponibilidade");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao salvar horários.";
      showFeedback(msg, "error");
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
        color={feedback.type === "error" ? "red" : "green"}
        message={feedback.message}
        onClose={closeFeedback}
      />

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-brand-purple/10 text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Typography
          variant="h4"
          className="font-bold uppercase text-brand-dark"
        >
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
              <Typography variant="h6" className="font-bold text-brand-dark">
                Gerenciar Horários
              </Typography>
              <Typography variant="small" className="text-gray-500">
                Informe os dias que você pode atender.
              </Typography>
            </div>
          </div>

          <AvailabilityEditor
            availability={availability}
            setAvailability={setAvailability}
            onError={(msg) => showFeedback(msg, "error")}
            infoMessage="Você pode adicionar, remover ou alterar seus horários de atendimento a qualquer momento."
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
