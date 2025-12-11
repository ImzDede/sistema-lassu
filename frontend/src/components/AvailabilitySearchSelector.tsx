"use client";

import React from "react";
import Select from "@/components/SelectBox";
import { TimeSlot } from "@/types/disponibilidade";
import { daysOptions } from "@/utils/format";

// Gera as horas (Mantenha a lógica igual)
const hoursStart = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const hoursEnd = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour.toString().padStart(2, "0")}:00`;
});

interface SearchSelectorProps {
  availability: TimeSlot[];
  setAvailability: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

export default function AvailabilitySearchSelector({ 
  availability, 
  setAvailability 
}: SearchSelectorProps) {
  
  // Garantimos que sempre editamos o índice 0 (o slot de busca)
  const slot = availability[0];

  const updateSlot = (field: keyof TimeSlot, value: string) => {
    const updatedSlot = { ...slot, [field]: value };

    setAvailability([updatedSlot]);
  };

  if (!slot) return null;

  return (
    <div className="bg-brand-bg p-4 rounded-xl border border-brand-purple/20 shadow-sm">
      <div className="flex flex-col gap-4">
        
        {/* Linha 1: Dia da Semana (Full Width) */}
        <div className="w-full">
          <Select
            label="Dia Preferencial"
            options={daysOptions}
            value={slot.day}
            onChange={(val: any) => updateSlot("day", val)}
          />
        </div>

        {/* Linha 2: Horários  */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mt-4">
          <div className="md:w-1/2">
            <Select
              label="De (Início)"
              options={hoursStart}
              value={slot.start}
              onChange={(val: any) => updateSlot("start", val)}
            />
          </div>
          
          <span className="text-gray-400 hidden md:block font-bold self-end mb-3">-</span>

          <div className="mt-4 md:w-1/2 md:mt-0">
            <Select
              label="Até (Fim)"
              options={hoursEnd}
              value={slot.end}
              onChange={(val: any) => updateSlot("end", val)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}