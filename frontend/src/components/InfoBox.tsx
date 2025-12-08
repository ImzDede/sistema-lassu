"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface InfoBoxProps {
  children: React.ReactNode;
}

const InfoBox = ({ children }: InfoBoxProps) => {
  return (
    <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-blue-600 text-xs border border-blue-100">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export default InfoBox;