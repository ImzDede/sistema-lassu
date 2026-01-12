import React from "react";

interface FolderAccordionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function FolderAccordion({ title, icon, isOpen, onToggle, children }: FolderAccordionProps) {
  return (
    <div className="mb-4 relative z-0 transition-all duration-300 group">
      {/* ABA DA PASTA */}
      <div 
        onClick={onToggle}
        className={`
           cursor-pointer flex items-center gap-3 px-5 py-3 
           w-[70%] md:w-auto md:inline-flex min-w-[180px] max-w-[300px]
           rounded-t-xl border-t border-x border-gray-300 relative z-10
           transition-all duration-200 select-none
           ${isOpen 
              ? "bg-white border-b-0 top-[1px] shadow-none" 
              : "bg-gray-100 hover:bg-gray-200 border-b border-gray-300 top-0"}
        `}
      >
        <span className={`${isOpen ? "text-brand-purple" : "text-gray-500"}`}>{icon}</span>
        <span className={`font-bold text-sm tracking-wide uppercase truncate ${isOpen ? "text-gray-800" : "text-gray-500"}`}>
            {title}
        </span>
      </div>

      {/* CORPO DA PASTA */}
      <div className={`
        relative z-0 bg-white border border-gray-300 rounded-b-xl rounded-tr-xl shadow-sm overflow-hidden
        transition-all duration-300
        ${isOpen ? "min-h-[100px]" : "h-12 bg-gray-50 opacity-80"} 
      `}>
         {!isOpen && (
            <div 
                onClick={onToggle} 
                className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <div className="w-8 h-1 bg-gray-300 rounded-full" /> 
            </div>
         )}

         {isOpen && (
            <div className="p-4 md:p-6 bg-white animate-in fade-in duration-300">
               {children}
            </div>
         )}
      </div>
    </div>
  );
}