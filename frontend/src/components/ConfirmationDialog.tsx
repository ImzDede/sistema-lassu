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
    <Dialog open={open} handler={onClose} size="xs" className="p-4 bg-brand-surface">
      <DialogHeader className="justify-center flex-col gap-3">
        <div className={`p-4 rounded-full ${isDestructive ? "bg-feedback-error-bg text-feedback-error-text" : "bg-brand-purple/10 text-brand-purple"}`}>
          <AlertTriangle size={32} />
        </div>
        <Typography variant="h5" className="text-center text-brand-dark font-heading">
          {title}
        </Typography>
      </DialogHeader>
      <DialogBody className="text-center font-normal text-gray-600">
        {message}
      </DialogBody>
      <DialogFooter className="justify-center gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="border-gray-200 text-gray-500 hover:bg-gray-50">
          Cancelar
        </Button>
        <Button 
          onClick={() => { onConfirm(); onClose(); }}
          className={isDestructive ? "!bg-feedback-error-main hover:!bg-red-500 text-white shadow-none" : "bg-brand-purple"}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}