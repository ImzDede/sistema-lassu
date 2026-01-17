"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import { userService } from "@/services/userServices";
import { TimeSlot } from "@/types/disponibilidade";
import { numberToDayMap, dayMap } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useFormHandler } from "@/hooks/useFormHandler";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ProfileAvailability() {
  const router = useRouter();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();
  const { loading: saving, handleSubmit } = useFormHandler();

  // TEMA: brand-peach
  const { color, borderClass, lightBgClass, textClass, bgClass } =
    useAppTheme();
  const themeAccentColor = `brand-${color}`;

  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

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
    const hasInvalidTime = availability.some(
      (slot) =>
        parseInt(slot.start.split(":")[0], 10) >=
        parseInt(slot.end.split(":")[0], 10)
    );

    if (hasInvalidTime) {
      showFeedback("Horário final deve ser maior que o inicial.", "error");
      return;
    }

    await handleSubmit(async () => {
      const payload = availability.map((slot) => ({
        diaSemana: dayMap[slot.day],
        horaInicio: parseInt(slot.start.split(":")[0], 10),
        horaFim: parseInt(slot.end.split(":")[0], 10),
      }));
      await userService.saveMyAvailability(payload);
      router.push("/home/perfil?success=disponibilidade");
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner className={`h-10 w-10 ${textClass}`} />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto w-full pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-full hover:bg-opacity-20 transition-colors ${lightBgClass} ${textClass}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Typography
          variant="h4"
          className="font-bold uppercase text-brand-peach"
        >
          Minha Disponibilidade
        </Typography>
      </div>

      <Card
        className={`w-full shadow-lg border-t-4 ${borderClass} bg-brand-surface`}
      >
        <CardBody className="p-6 md:p-8">
          <div
            className={`flex items-center gap-3 mb-6 pb-4 border-b border-${themeAccentColor}/20`}
          >
            <div className={`p-2 rounded-lg ${lightBgClass}`}>
              <Clock className={`w-6 h-6 ${textClass}`} />
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-brand-peach">
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
            accentColorClass={themeAccentColor}
          />

          <div className={`mt-8 pt-6 border-t border-${themeAccentColor}/20`}>
            <Button
              onClick={handleSave}
              loading={saving}
              fullWidth
              accentColorClass={themeAccentColor}
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
