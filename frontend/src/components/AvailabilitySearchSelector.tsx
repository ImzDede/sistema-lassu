"use client";

import React from "react";
import Select from "@/components/SelectBox";
import { TimeSlot } from "@/types/disponibilidade";
import { daysOptions, hoursStartStrings, hoursEndStrings } from "@/utils/constants";

interface SearchSelectorProps {
  availability: TimeSlot[];
  setAvailability: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

export default function AvailabilitySearchSelector({ 
  availability, 
  setAvailability 
}: SearchSelectorProps) {
  
  const slot = availability[0];

  const updateSlot = (field: keyof TimeSlot, value: string) => {
    const updatedSlot = { ...slot, [field]: value };
    setAvailability([updatedSlot]);
  };

  if (!slot) return null;

  return (
    <div className="bg-brand-bg p-4 rounded-xl border border-brand-purple/20 shadow-sm">
      <div className="flex flex-col gap-4">
        
        <div className="w-full">
          <Select
            label="Dia Preferencial"
            options={daysOptions}
            value={slot.day}
            onChange={(val: string) => updateSlot("day", val)}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mt-4">
          <div className="md:w-1/2">
            <Select
              label="De (Início)"
              options={hoursStartStrings}
              value={slot.start}
              onChange={(val: string) => updateSlot("start", val)}
            />
          </div>
          
          <span className="text-brand-purple hidden md:block font-bold self-end mb-3">-</span>

          <div className="mt-4 md:w-1/2 md:mt-0">
            <Select
              label="Até (Fim)"
              options={hoursEndStrings}
              value={slot.end}
              onChange={(val: string) => updateSlot("end", val)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}