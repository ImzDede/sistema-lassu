"use client";

import React from "react";
import { Alert, Typography } from "@material-tailwind/react";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface FeedbackAlertProps {
  open: boolean;
  color: "green" | "red";
  message: string;
  onClose: () => void;
}

const FeedbackAlert = ({
  open,
  color,
  message,
  onClose,
}: FeedbackAlertProps) => {
  const bgClass =
    color === "green"
      ? "bg-green-500 border-green-400"
      : "bg-[#F2A9A2] border-[#F2A9A2] text-white";

  return (
    <div className="fixed z-50 top-4 left-4 right-4 md:top-10 md:right-4 md:left-auto md:w-full md:max-w-sm">
      <Alert
        open={open}
        className={`flex items-center gap-3 shadow-xl border border-white/20 text-white ${bgClass}`}
        onClose={onClose}
        animate={{ mount: { y: 0 }, unmount: { y: -100 } }}
        icon={color === "green" ? <CheckCircle /> : <AlertTriangle />}
      >
        <Typography
          variant="small"
          className="font-bold"
          placeholder={undefined}
        >
          {color === "green" ? "Sucesso" : "Atenção"}
        </Typography>
        <Typography
          variant="small"
          className="font-normal opacity-95"
          placeholder={undefined}
        >
          {message}
        </Typography>
      </Alert>
    </div>
  );
};

export default FeedbackAlert;
