"use client";

import React from "react";
import Select from "@/components/SelectBox";
import { TimeSlot } from "@/types/disponibilidade";
import { daysOptions, hoursStartStrings, hoursEndStrings } from "@/utils/constants";

interface SearchSelectorProps {
  availability: TimeSlot[];
  setAvailability: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  accentColorClass?: string;
  focusColorClass?: string;
}

export default function AvailabilitySearchSelector({ 
  availability, 
  setAvailability,
  accentColorClass = "brand-purple",
  focusColorClass
}: SearchSelectorProps) {
  
  const slot = availability[0];

  const updateSlot = (field: keyof TimeSlot, value: string) => {
    const updatedSlot = { ...slot, [field]: value };
    setAvailability([updatedSlot]);
  };

  if (!slot) return null;

  return (
    <div className={`bg-white p-4 rounded-xl border shadow-sm`}>
      <div className="flex flex-col gap-4">
        
        <div className="w-full">
          <Select
            label="Dia Preferencial"
            options={daysOptions}
            value={slot.day}
            onChange={(val: string) => updateSlot("day", val)}
            accentColorClass={accentColorClass}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mt-4">
          <div className="md:w-1/2">
            <Select
              label="De (Início)"
              options={hoursStartStrings}
              value={slot.start}
              onChange={(val: string) => updateSlot("start", val)}
              accentColorClass={accentColorClass}
            />
          </div>
          
          <span className={`text-${accentColorClass} hidden md:block font-bold self-end mb-3`}>-</span>

          <div className="mt-4 md:w-1/2 md:mt-0">
            <Select
              label="Até (Fim)"
              options={hoursEndStrings}
              value={slot.end}
              onChange={(val: string) => updateSlot("end", val)}
              accentColorClass={accentColorClass}
            />
          </div>
        </div>

      </div>
    </div>
  );
}