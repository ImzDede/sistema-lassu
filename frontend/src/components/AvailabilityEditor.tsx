"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "@material-tailwind/react";
import Button from "@/components/Button";
import Select from "@/components/SelectBox";
import InfoBox from "@/components/InfoBox";
import { TimeSlot } from "@/types/disponibilidade";
import { daysOptions, hoursStartStrings, hoursEndStrings } from "@/utils/constants";

interface AvailabilityEditorProps {
  availability: TimeSlot[];
  setAvailability: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  onError?: (msg: string) => void;
  infoMessage?: string;
}

export default function AvailabilityEditor({ 
  availability, 
  setAvailability, 
  onError,
  infoMessage
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
            className="flex w-full bg-brand-bg rounded-lg border border-gray-200 transition-colors hover:border-brand-pink/50 group"
          >
            <div className="flex-1 p-4 flex flex-col gap-3">
              <div className="w-full"> 
                <Select
                  label="Dia da Semana"
                  options={daysOptions}
                  value={slot.day}
                  onChange={(val: string) => updateSlot(slot.id, "day", val)}
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                <div className="w-full md:w-1/2">
                  <Select
                    label="Início"
                    options={hoursStartStrings}
                    value={slot.start}
                    onChange={(val: string) => updateSlot(slot.id, "start", val)}
                  />
                </div>
                
                <span className="hidden md:block text-brand-purple font-bold shrink-0">-</span>

                <div className="w-full md:w-1/2">
                  <Select
                    label="Fim"
                    options={hoursEndStrings}
                    value={slot.end}
                    onChange={(val: string) => updateSlot(slot.id, "end", val)}
                  />
                </div>
              </div>
            </div>

            <div 
              className="w-14 border-l border-gray-200 flex flex-col items-center justify-center bg-gray-50 hover:bg-feedback-error-bg transition-colors cursor-pointer rounded-r-lg" 
              onClick={() => removeSlot(slot.id)}
            >
               <IconButton
                  variant="text"
                  className="rounded-full text-feedback-error-main hover:bg-transparent"
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
             {infoMessage || "Não se preocupe, você poderá alterar estes horários depois no seu Perfil."}
           </InfoBox>
        </div>
      </div>
    </div>
  );
}