"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface InfoBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentColor?: string;
}

const InfoBox = ({ 
  children, 
  className = "", 
  accentColor = "brand-purple",
  ...props 
}: InfoBoxProps) => {
  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg text-xs border
        bg-${accentColor}/10 
        text-${accentColor} 
        border-${accentColor}/10 
        ${className}
      `}
      {...props}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div className="font-medium">{children}</div>
    </div>
  );
};

export default InfoBox;