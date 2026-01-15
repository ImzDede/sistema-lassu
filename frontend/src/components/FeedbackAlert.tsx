import React, { useEffect } from "react";
import { Alert, Typography } from "@material-tailwind/react";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

interface FeedbackAlertProps {
  open: boolean;
  color: "green" | "red" | "orange";
  message: string;
  onClose: () => void;
}

export default function FeedbackAlert({
  open,
  color,
  message,
  onClose,
}: FeedbackAlertProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  const colorMap = {
    green: {
      bg: "bg-green-100",
      text: "text-green-900",
      border: "border-green-200",
      icon: <CheckCircle className="h-6 w-6" />,
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-900",
      border: "border-red-200",
      icon: <XCircle className="h-6 w-6" />,
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-900",
      border: "border-orange-200",
      icon: <AlertTriangle className="h-6 w-6" />,
    },
  };

  const current = colorMap[color] || colorMap.green;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[9999] w-[90%] max-w-sm animate-slide-in-right">
      <Alert
        open={open}
        onClose={onClose}
        className={`${current.bg} ${current.border} border shadow-xl relative flex items-start gap-3`}
        icon={<span className={current.text}>{current.icon}</span>}
        action={
          <button
            className={`!absolute top-3 right-3 ${current.text} hover:opacity-70 transition-opacity p-1`}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        }
      >
        <Typography variant="small" className={`font-bold ${current.text} mt-1 mr-4`}>
          {message}
        </Typography>
      </Alert>
    </div>
  );
}