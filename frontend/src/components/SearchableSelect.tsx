"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
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
  onSearch?: (term: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = "Digite para buscar...",
  required = false,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Ref para controlar o tempo de digitação
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Encontra a opção selecionada
  const selectedOption = options.find((opt) => opt.id === value) || (value ? { label: "Paciente Selecionado", subLabel: "Carregado", id: value } as Option : undefined);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpa o termo se o valor for resetado externamente
  useEffect(() => {
    if (!value) setSearchTerm("");
  }, [value]);

  // Só busca quando o usuário para de digitar
  useEffect(() => {
    if (!onSearch) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
        // Se estiver aberto ou tiver termo, dispara a busca
        if (isOpen || searchTerm) {
            onSearch(searchTerm);
        }
    }, 500); // 500ms de atraso

    return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, onSearch, isOpen]);

  const filteredOptions = onSearch 
      ? options 
      : options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSearchTerm("");
    if (onSearch) onSearch(""); // Limpa a busca no back para restaurar a lista padrão
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (disabled) return;
    e?.stopPropagation();
    onChange(null);
    setSearchTerm("");
    if (onSearch) onSearch("");
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {selectedOption && !isOpen ? (
        <div className="relative animate-fade-in group">
          <div 
            onClick={handleClear}
            className="absolute top-2 right-2 z-20 bg-brand-purple hover:bg-brand-dark text-white rounded-full p-1 cursor-pointer transition-all shadow-md"
            title="Remover seleção"
          >
            <X size={14} />
          </div>

          <CardListagem
            nomePrincipal={selectedOption.label}
            detalhe={selectedOption.subLabel || "Selecionado"}
            onClick={() => !disabled && setIsOpen(true)}
            selected={true}
          />
        </div>
      ) : (
        <div className="relative">
          <Input
            label={label}
            value={searchTerm}
            disabled={disabled}
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
            <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-xl border border-brand-purple/20 rounded-lg bg-white">
              <List className="p-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <ListItem
                      key={opt.id}
                      onClick={() => handleSelect(opt)}
                      className="text-sm font-medium rounded-md px-3 py-2 hover:bg-brand-purple/5 hover:text-brand-purple flex flex-col items-start gap-0.5"
                    >
                      <span className="font-bold text-brand-dark">{opt.label}</span>
                      {opt.subLabel && <span className="text-xs text-gray-400 font-normal">{opt.subLabel}</span>}
                    </ListItem>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-400 italic">
                    {isLoading ? "Buscando..." : "Nenhum resultado encontrado."}
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