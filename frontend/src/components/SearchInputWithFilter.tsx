"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export type FilterOption = {
  label: string;
  value: string;
  placeholder?: string;
};

interface SearchInputWithFilterProps {
  value: string;
  onChange: (value: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  options: FilterOption[];
  className?: string;
}

export default function SearchInputWithFilter({
  value,
  onChange,
  filter,
  onFilterChange,
  options,
  className = "",
}: SearchInputWithFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = options.find((opt) => opt.value === filter) || options[0];
  const placeholderText = currentOption.placeholder || `Buscar por ${currentOption.label}...`;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Container (Visual Pill) */}
      <div className="flex items-center w-full h-12 bg-gray-100 rounded-full px-4 border border-transparent focus-within:border-brand-encaminhamento focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-encaminhamento transition-all">
        
        {/* Ícone Lupa */}
        <Search className="text-gray-400 shrink-0 mr-3" size={20} />

        {/* Input Real */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText}
          className="flex-1 bg-transparent border-none outline-none text-brand-dark placeholder-gray-400 text-sm md:text-base h-full"
        />

        {/* Divisor Vertical */}
        <div className="h-5 w-px bg-gray-300 mx-2" />

        {/* Trigger do Filtro */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-encaminhamento uppercase tracking-wide px-2 py-1 rounded-md transition-colors"
        >
          {currentOption.label}
          <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Filtrar por
          </div>
          {options.map((opt) => {
            const isSelected = filter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onFilterChange(opt.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm flex items-center justify-between
                  ${isSelected ? "bg-brand-purple/5 text-brand-encaminhamento font-medium" : "text-gray-600 hover:bg-gray-50"}
                `}
              >
                {opt.label}
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}