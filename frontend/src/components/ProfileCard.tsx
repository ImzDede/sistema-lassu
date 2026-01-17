import React from "react";
import { User } from "lucide-react";
import { Typography, Chip, Avatar } from "@material-tailwind/react";

interface ProfileCardProps {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
  status: string;
  statusColor?: "green" | "red" | "purple" | "blue" | "orange";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  stripeColorClass?: string;
}

export default function ProfileCard({ 
  name, 
  subtitle, 
  avatarUrl, 
  status, 
  statusColor = "purple",
  children,
  footer,
  stripeColorClass = "bg-brand-purple"
}: ProfileCardProps) {
  
  const chipColors: Record<string, string> = {
      purple: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
      green: "bg-green-50 text-green-600 border-green-200",
      red: "bg-red-50 text-red-600 border-red-200",
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-purple/10 relative overflow-hidden group hover:shadow-md transition-all">
        
        {/* 3. Faixa Superior Dinâmica */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${stripeColorClass} opacity-90`} />

        {/* Avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-purple/10 border-4 border-white shadow-lg flex items-center justify-center text-brand-purple shrink-0 relative z-10 overflow-hidden">
            {avatarUrl ? (
                <Avatar src={avatarUrl} alt={name} size="xxl" className="h-full w-full object-cover" />
            ) : (
                <User size={40} />
            )}
        </div>

        {/* Dados Principais */}
        <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-2">
                <div>
                    <Typography variant="h4" className="text-brand-dark font-bold uppercase font-heading leading-tight">
                        {name}
                    </Typography>
                    <Typography className="text-gray-500 font-medium text-sm">
                        {subtitle}
                    </Typography>
                </div>

                <Chip 
                    value={status} 
                    className={`mt-2 md:mt-0 border normal-case font-bold ${chipColors[statusColor] || chipColors.purple}`}
                    size="sm"
                    variant="ghost"
                />
            </div>

            {/* Conteúdo Variável */}
            <div className="flex flex-col md:flex-row gap-4 mt-3 text-sm text-gray-600 justify-center md:justify-start items-center md:items-stretch flex-wrap">
                {children}
            </div>
        </div>
      </div>

      {footer && (
         <div className="mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             {footer}
         </div>
      )}
    </div>
  );
}