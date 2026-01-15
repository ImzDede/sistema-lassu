"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Typography, Chip } from "@material-tailwind/react";
import Button from "@/components/Button";
import { CalendarClock } from "lucide-react";
import { formatTimeInterval } from "@/utils/format";

interface AvailabilitySlot {
  id?: string;
  dia: string;
  inicio: number;
  fim: number;
}

interface AvailabilityDialogProps {
  open: boolean;
  onClose: () => void;
  availabilities?: AvailabilitySlot[];
}

export default function AvailabilityDialog({ open, onClose, availabilities = [] }: AvailabilityDialogProps) {
  const peachText = "text-[#F2B694]";
  const peachBg = "!bg-[#F2B694]";
  const peachHover = "hover:!bg-[#e0a07d]";
  const peachBorder = "border-[#F2B694]";

  return (
    <Dialog open={open} handler={onClose} size="sm" className="p-4 bg-brand-surface rounded-2xl">
      <DialogHeader className="justify-center flex-col gap-3">
        <div className={`p-4 rounded-full ${peachBg}/20 ${peachText}`}>
          <CalendarClock size={32} />
        </div>
        <Typography variant="h5" className="text-brand-dark font-heading text-center">
          Horários de Atendimento
        </Typography>
      </DialogHeader>
      
      <DialogBody className="max-h-[60vh] overflow-y-auto pr-2 px-4">
        {availabilities.length > 0 ? (
          <div className="flex flex-col gap-3">
            {availabilities.map((slot, index) => (
              <div key={slot.id || index} className={`flex justify-between items-center bg-white p-3 rounded-lg border ${peachBorder}/30 shadow-sm`}>
                <Typography className="font-bold text-brand-dark text-sm">{slot.dia}</Typography>
                <Chip 
                  value={formatTimeInterval(slot.inicio, slot.fim)} 
                  variant="ghost" 
                  className={`${peachBg}/10 ${peachText} normal-case text-sm font-bold`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Typography>Nenhuma disponibilidade cadastrada.</Typography>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="justify-center pt-6">
        <Button 
            onClick={onClose} 
            fullWidth 
            className={`${peachBg} ${peachHover} text-white shadow-none hover:shadow-md transition-all`}
        >
          FECHAR
        </Button>
      </DialogFooter>
    </Dialog>
  );
}