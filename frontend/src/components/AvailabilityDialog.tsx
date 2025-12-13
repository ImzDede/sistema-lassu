"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Typography, Chip } from "@material-tailwind/react";
import Button from "@/components/Button";
import { Calendar } from "lucide-react";
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
  return (
    <Dialog open={open} handler={onClose} size="sm" className="p-4">
      <DialogHeader className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <Calendar className="text-brand-purple" />
        <Typography variant="h5" className="text-brand-purple">
          Horários de Atendimento
        </Typography>
      </DialogHeader>
      <DialogBody placeholder={undefined} className="max-h-[60vh] overflow-y-auto">
        {availabilities.length > 0 ? (
          <div className="flex flex-col gap-3">
            {availabilities.map((slot, index) => (
              <div key={slot.id || index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Typography className="font-bold text-gray-700">{slot.dia}</Typography>
                <Chip 
                  value={formatTimeInterval(slot.inicio, slot.fim)} 
                  variant="ghost" 
                  className="bg-brand-purple/10 text-brand-purple normal-case text-sm"
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
      <DialogFooter>
        <Button onClick={onClose} fullWidth>Fechar</Button>
      </DialogFooter>
    </Dialog>
  );
}