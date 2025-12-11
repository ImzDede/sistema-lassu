"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "@material-tailwind/react";
import Button from "@/components/Button";
import Select from "@/components/SelectBox";
import InfoBox from "@/components/InfoBox";
import { TimeSlot } from "@/types/disponibilidade";
import { daysOptions } from "@/utils/format"; 

const hoursStart = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const hoursEnd = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

interface AvailabilityEditorProps {
  availability: TimeSlot[];
  setAvailability: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  onError?: (msg: string) => void;
}

export default function AvailabilityEditor({ 
  availability, 
  setAvailability, 
  onError
}: AvailabilityEditorProps) {

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).slice(2, 11),
      day: "Segunda-feira",
      start: "08:00",
      end: "18:00",
    };
    setAvailability([...availability, newSlot]);
  };

  const removeSlot = (id: string) => {
    if (availability.length === 1) {
      if (onError) onError("Defina pelo menos um horário.");
      return;
    }
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const updateSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 w-full">
        {availability.map((slot) => (
          <div
            key={slot.id}
            className="flex w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-colors hover:border-brand-pink/50"
          >
            <div className="flex-1 p-4 flex flex-col gap-3">
              <div className="w-full"> 
                <Select
                  label="Dia da Semana"
                  options={daysOptions}
                  value={slot.day}
                  onChange={(val: any) => updateSlot(slot.id, "day", val)}
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                <div className="w-full md:w-1/2">
                  <Select
                    label="Início"
                    options={hoursStart}
                    value={slot.start}
                    onChange={(val: any) => updateSlot(slot.id, "start", val)}
                  />
                </div>
                
                <span className="hidden md:block text-gray-400 font-bold shrink-0">-</span>

                <div className="w-full md:w-1/2">
                  <Select
                    label="Fim"
                    options={hoursEnd}
                    value={slot.end}
                    onChange={(val: any) => updateSlot(slot.id, "end", val)}
                  />
                </div>
              </div>
            </div>

            <div className="w-14 border-l border-gray-200 flex flex-col items-center justify-center bg-gray-100 hover:bg-red-50 transition-colors" onClick={() => removeSlot(slot.id)}>
               <IconButton
                  variant="text"
                  color="red"
                  className="rounded-full hover:bg-red-100"
                  title="Remover horário"
                >
                  <Trash2 size={20} />
                </IconButton>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 w-full">
        <Button
          variant="outline"
          onClick={addSlot}
          fullWidth
          className="flex items-center justify-center gap-2 border-dashed border-2"
        >
          <Plus size={18} /> ADICIONAR NOVO HORÁRIO
        </Button>
        <div className="mt-4">
           <InfoBox>
             Não se preocupe, você poderá alterar estes horários depois no seu Perfil.
           </InfoBox>
        </div>
      </div>
    </div>
  );
}