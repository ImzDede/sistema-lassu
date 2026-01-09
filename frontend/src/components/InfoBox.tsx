"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface InfoBoxProps {
  children: React.ReactNode;
}

const InfoBox = ({ children }: InfoBoxProps) => {
  return (
    <div className="flex items-start gap-3 bg-brand-purple/5 p-3 rounded-lg text-brand-purple text-xs border border-brand-purple/10">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div className="font-medium">{children}</div>
    </div>
  );
};

export default InfoBox;