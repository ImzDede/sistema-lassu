"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "@material-tailwind/react";
import Button from "@/components/Button";
import Select from "@/components/SelectBox";
import InfoBox from "@/components/InfoBox";
import { TimeSlot } from "@/types/disponibilidade";

const daysOfWeek = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"
];

// Gera as horas de início
const hoursStart = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Gera as horas de fim
const hoursEnd = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

interface AvailabilityEditorProps {
  availability: TimeSlot[];
  setAvailability: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  onError: (msg: string) => void;
}

export default function AvailabilityEditor({ 
  availability, 
  setAvailability, 
  onError 
}: AvailabilityEditorProps) {

  // Adc slot
  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      day: "Segunda-feira",
      start: "08:00",
      end: "18:00",
    };
    setAvailability([...availability, newSlot]);
  };

  // Remove slot
  const removeSlot = (id: string) => {
    if (availability.length === 1) {
      onError("Defina pelo menos um horário.");
      return;
    }
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  // Atualiza slot
  const updateSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  return (
    <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
      {availability.map((slot) => (
        <div
          key={slot.id}
          className="bg-brand-bg p-4 rounded-lg border border-gray-100 flex flex-col md:flex-row gap-3 md:items-center transition-colors hover:border-brand-pink/50"
        >
          {/* Dia da Semana */}
          <div className="flex items-center justify-between gap-2 w-full md:w-1/3">
            <div className="w-full">
              <Select
                options={daysOfWeek}
                value={slot.day}
                onChange={(e) => updateSlot(slot.id, "day", e.target.value)}
              />
            </div>
            {/* Lixeira Mobile */}
            <div className="md:hidden shrink-0">
              <IconButton
                variant="text"
                color="red"
                onClick={() => removeSlot(slot.id)}
                className="hover:bg-red-50"
                placeholder={undefined}
              >
                <Trash2 size={18} />
              </IconButton>
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full md:w-2/3">
            <div className="w-full">
              <Select
                options={hoursStart}
                value={slot.start}
                onChange={(e) => updateSlot(slot.id, "start", e.target.value)}
              />
            </div>

            <span className="hidden md:block text-gray-400 font-bold">-</span>

            <div className="w-full">
              <Select
                options={hoursEnd}
                value={slot.end}
                onChange={(e) => updateSlot(slot.id, "end", e.target.value)}
              />
            </div>

            {/* Lixeira Desktop */}
            <div className="hidden md:block ml-auto">
              <IconButton
                variant="text"
                color="red"
                onClick={() => removeSlot(slot.id)}
                className="hover:bg-red-50"
                placeholder={undefined}
              >
                <Trash2 size={18} />
              </IconButton>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addSlot}
        className="flex items-center justify-center gap-2 border-dashed border-2 mt-2"
      >
        <Plus size={18} /> ADICIONAR NOVO HORÁRIO
      </Button>

      <InfoBox>
        Não se preocupe, você poderá alterar ou adicionar novos horários a qualquer momento no seu <b>Perfil</b>.
      </InfoBox>
    </div>
  );
}