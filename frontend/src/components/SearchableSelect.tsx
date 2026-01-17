"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { Spinner, Card, List, ListItem } from "@material-tailwind/react";
import Input from "@/components/Input";

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
  accentColorClass?: string;
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
  accentColorClass,
}: SearchableSelectProps) {
  const accent = accentColorClass ?? "brand-purple";

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption =
    options.find((opt) => opt.id === value) ||
    (value
      ? ({ label: "Item Selecionado", subLabel: "Carregado", id: value } as Option)
      : undefined);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpa busca se valor for resetado
  useEffect(() => {
    if (!value) setSearchTerm("");
  }, [value]);

  // Debounce da busca
  useEffect(() => {
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (isOpen || searchTerm) onSearch(searchTerm);
    }, 500);

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
    if (onSearch) onSearch("");
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

  const inputFocusClass = useMemo(
    () => `focus-within:!border-${accent} focus-within:!ring-1 focus-within:!ring-${accent}`,
    [accent]
  );

  const spinnerClass = `h-4 w-4 text-${accent}`;

  return (
    <div className="relative w-full flex flex-col gap-1.5" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-semibold text-brand-dark ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {selectedOption && !isOpen ? (
        <div
          onClick={() => !disabled && setIsOpen(true)}
          className={`
            relative flex items-center justify-between p-3 border rounded-lg transition-all cursor-pointer
            bg-${accent}/5 border-${accent}
            ${disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}
          `}
        >
          <div className="flex flex-col">
            <span className="font-bold text-brand-dark text-sm">{selectedOption.label}</span>
            {selectedOption.subLabel && <span className="text-xs text-gray-500">{selectedOption.subLabel}</span>}
          </div>

          <button
            onClick={handleClear}
            className={`
              p-1.5 bg-white text-${accent} rounded-full shadow-sm transition-colors z-10
              hover:bg-red-50 hover:text-red-500
            `}
            title="Remover seleção"
            type="button"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
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
            leftIcon={Search}
            focusColorClass={inputFocusClass}
            rightIcon={
              isLoading ? (
                <Spinner className={spinnerClass} />
              ) : (
                searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                )
              )
            }
          />

          {isOpen && (
            <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-xl border border-gray-100 rounded-lg bg-white">
              <List className="p-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <ListItem
                      key={opt.id}
                      onClick={() => handleSelect(opt)}
                      className={`
                        text-sm font-medium rounded-md px-3 py-2.5 flex items-center justify-between group transition-colors
                        hover:bg-${accent}/5 hover:text-${accent}
                      `}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`
                            font-bold text-gray-700 transition-colors
                            group-hover:text-${accent}
                          `}
                        >
                          {opt.label}
                        </span>
                        {opt.subLabel && (
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                            {opt.subLabel}
                          </span>
                        )}
                      </div>
                      {value === opt.id && <Check size={16} className={`text-${accent}`} />}
                    </ListItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400 italic">
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
