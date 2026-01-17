import React, { ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Card, Typography } from "@material-tailwind/react";

interface FolderAccordionProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children?: ReactNode; 
  tabColorClass?: string;
  showAddButton?: boolean;
  onAdd?: (e: React.MouseEvent) => void;
  addLabel?: string;
  accentColor?: string;
}

export default function FolderAccordion({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  tabColorClass = "bg-gray-200",
  showAddButton = false,
  onAdd,
  addLabel,
  accentColor = "brand-purple",
}: FolderAccordionProps) {
  
  return (
    <div className="relative w-full mb-6 group">
      {/* Tab Colorida */}
      <div 
        className={`
          absolute -top-3 left-4 px-6 h-8 rounded-t-lg z-0 transition-all duration-300
          ${tabColorClass} w-32
        `} 
      />

      {/* Card Principal */}
      <Card className="w-full relative z-10 border border-gray-200 shadow-sm overflow-hidden bg-white rounded-xl">
        
        {/* Header Clicável */}
        <div 
          onClick={onToggle}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-transparent data-[open=true]:border-gray-100"
          data-open={isOpen}
        >
          <div className="flex items-center gap-3">
            <Typography variant="h6" className="font-bold text-brand-dark uppercase tracking-wide text-sm md:text-base">
              {title}
            </Typography>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            {icon}
            <ChevronDown 
              className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
            />
          </div>
        </div>

        {/* Corpo Expansível */}
        <div 
          className={`
            transition-all duration-300 ease-in-out overflow-hidden bg-brand-surface
            ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="p-4 flex flex-col gap-3">
            
            {children}

            {showAddButton && (
              <div 
                onClick={onAdd}
                className={`
                  flex flex-col items-center justify-center py-6 mt-2 rounded-xl border-2 border-dashed border-gray-300 
                  cursor-pointer group transition-all w-full
                  hover:border-${accentColor} hover:bg-${accentColor}/5
                `}
              >
                <div className={`w-10 h-10 rounded-full bg-${accentColor} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Plus size={24} strokeWidth={3} />
                </div>
                {addLabel && (
                  <span className={`mt-2 text-xs font-bold text-gray-400 group-hover:text-${accentColor} uppercase tracking-wider`}>
                    {addLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}