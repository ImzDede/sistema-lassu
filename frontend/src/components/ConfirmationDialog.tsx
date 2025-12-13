"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Typography } from "@material-tailwind/react";
import Button from "@/components/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  isDestructive = false
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} handler={onClose} size="xs" className="p-4">
      <DialogHeader className="justify-center flex-col gap-2">
        <div className={`p-3 rounded-full ${isDestructive ? "bg-red-50 text-red-500" : "bg-blue-50 text-brand-purple"}`}>
          <AlertTriangle size={32} />
        </div>
        <Typography variant="h5" className="text-center text-brand-purple">
          {title}
        </Typography>
      </DialogHeader>
      <DialogBody className="text-center font-normal">
        {message}
      </DialogBody>
      <DialogFooter className="justify-center gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="border-gray-300">
          Cancelar
        </Button>
        <Button 
          onClick={() => { onConfirm(); onClose(); }}
          className={isDestructive ? "bg-red-500 hover:bg-red-600" : "bg-brand-purple"}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}