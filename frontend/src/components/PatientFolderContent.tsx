// frontend/src/components/PatientFolderContent.tsx
import React from "react";
import { Edit3, Clock, Calendar, FileText } from "lucide-react";
import { Progress, Typography } from "@material-tailwind/react";

// CARD DE ITEM DA PASTA
interface FolderItemCardProps {
    title: string;
    subtitle?: React.ReactNode; // Pode ser "Sala 02 | Data" ou null
    progress?: number;
    icon?: React.ReactNode; // Ícone do canto superior direito (ex: Relógio)
    onClick?: () => void;
    highlight?: boolean; // Se true, põe a borda roxa esquerda (para sessões)
}

export const FolderItemCard = ({ title, subtitle, progress, icon, onClick, highlight = false }: FolderItemCardProps) => {
  return (
    <div 
        onClick={onClick}
        className={`
            bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 relative cursor-pointer 
            hover:border-brand-purple transition-all group
            ${highlight ? "border-l-4 border-l-brand-purple" : ""}
        `}
    >
        {/* Ícone opcional no topo direito (ex: Relógio) */}
        {icon && (
            <div className="absolute top-3 right-3 text-gray-400 group-hover:text-brand-purple transition-colors">
                {icon}
            </div>
        )}

        <div className="flex justify-between items-start pr-6">
            <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
                
                {/* Subtítulo (Data, Sala, etc) */}
                {subtitle && (
                    <div className="text-gray-500 text-sm mt-1">
                        {subtitle}
                    </div>
                )}

                {/* Barra de Progresso (Se houver) */}
                {progress !== undefined && (
                    <div className="mt-2 w-full max-w-xs">
                        <Progress value={progress} size="sm" color="purple" className="bg-gray-100" />
                        <span className="text-xs text-gray-400 mt-1 block">{progress}% preenchido</span>
                    </div>
                )}
            </div>

            {/* Ícone de Ação (Sempre Editar por padrão visual) */}
            <div className={`mt-2 ${!subtitle && !progress ? 'self-center' : ''}`}>
                <div className="p-2 rounded-full bg-gray-50 text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-colors">
                    <Edit3 size={18} />
                </div>
            </div>
        </div>
    </div>
  );
};