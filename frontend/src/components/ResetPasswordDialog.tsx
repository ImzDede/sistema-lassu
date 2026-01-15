"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Typography } from "@material-tailwind/react";
import Button from "@/components/Button";
import { LockKeyhole } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  therapistName: string;
  matricula?: string;
}

export default function ResetPasswordDialog({
  open,
  onClose,
  onConfirm,
  therapistName,
  matricula
}: ResetPasswordDialogProps) {
  const pinkText = "text-[#D9A3B6]";
  const pinkBg = "!bg-[#D9A3B6]";
  const pinkHover = "hover:!bg-[#c48d9f]";

  return (
    <Dialog open={open} handler={onClose} size="xs" className="p-4 bg-brand-surface rounded-2xl">
      <DialogHeader className="justify-center flex-col gap-3">
        <div className={`p-4 rounded-full bg-[#D9A3B6]/20 ${pinkText}`}>
          <LockKeyhole size={32} />
        </div>
        <Typography variant="h5" className="text-center text-brand-dark font-heading">
          Redefinir Senha?
        </Typography>
      </DialogHeader>
      
      <DialogBody className="text-center font-normal text-gray-600 px-4 flex flex-col gap-2">
        <span>
          A senha de <strong>{therapistName}</strong> será resetada para o padrão do sistema.
        </span>
        
        <div className={`bg-brand-bg p-3 rounded-lg border border-brand-purple/10 mt-2`}>
          <Typography variant="small" className={`font-bold ${pinkText} block mb-1`}>
            Nova Senha Padrão:
          </Typography>
          <code className="text-sm bg-white px-2 py-1 rounded border border-gray-200 font-mono text-gray-700">
            L{matricula || "0000"}
          </code>
        </div>
      </DialogBody>
      
      <DialogFooter className="justify-center gap-3 pt-6">
        <Button variant="outline" onClick={onClose} className="border-gray-200 text-gray-500 hover:bg-gray-50">
          Cancelar
        </Button>
        <Button 
          onClick={() => { onConfirm(); onClose(); }}
          className={`${pinkBg} ${pinkHover} text-white shadow-none hover:shadow-md transition-all border-none`}
        >
          Confirmar Reset
        </Button>
      </DialogFooter>
    </Dialog>
  );
}