"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Spinner, Card, List, ListItem } from "@material-tailwind/react";
import Input from "@/components/Input";
import CardListagem from "@/components/CardListagem";

interface Option {
  id: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (id: string | null) => void;
  isLoading?: boolean;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  isLoading = false,
  placeholder = "Digite para buscar...",
  required = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value) setSearchTerm("");
  }, [value]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(null);
    setSearchTerm("");
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {selectedOption && !isOpen ? (
        <div className="relative animate-fade-in group">
          {/* Botão X para remover */}
          <div 
            onClick={handleClear}
            className="absolute top-2 right-2 z-20 bg-brand-purple hover:bg-brand-dark text-white rounded-full p-1 cursor-pointer transition-all"
            title="Remover seleção"
          >
            <X size={16} />
          </div>

          <CardListagem
            nomePrincipal={selectedOption.label}
            detalhe={selectedOption.subLabel || "Selecionado"}
            onClick={() => setIsOpen(true)}
          />
        </div>
      ) : (
        <div className="relative">
          <Input
            label={label}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            required={required && !value}
            autoComplete="off"
            icon={
              isLoading ? (
                <Spinner className="h-4 w-4 text-brand-purple" />
              ) : (
                <Search size={18} className="text-gray-400" />
              )
            }
          />

          {isOpen && (
            <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-xl border border-brand-purple/20 rounded-lg">
              <List className="p-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <ListItem
                      key={opt.id}
                      onClick={() => handleSelect(opt)}
                      className="text-sm font-medium rounded-md px-3 py-2 hover:bg-brand-purple/5 hover:text-brand-purple flex flex-col items-start gap-0.5"
                    >
                      <span className="font-bold">{opt.label}</span>
                      {opt.subLabel && <span className="text-xs text-gray-400 font-normal">{opt.subLabel}</span>}
                    </ListItem>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-400 italic">
                    {searchTerm ? "Nenhum resultado encontrado." : "Digite para buscar..."}
                  </div>
                )}
              </List>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}