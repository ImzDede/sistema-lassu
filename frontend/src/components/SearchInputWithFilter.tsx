"use client";

import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";
import Select from "@/components/SelectBox";

interface SearchInputWithFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onFilterChange: (value: string) => void;
}

export default function SearchInputWithFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onFilterChange,
}: SearchInputWithFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full mb-8 items-end">
      {/* Input de Busca */}
      <div className="w-full md:flex-1">
        <Input
          label="Procurar Terapeuta"
          icon={<Search className="h-5 w-5 text-gray-400" />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Select */}
      <div className="w-full md:w-48">
        <Select
          label="Status"
          value={statusFilter}
          onChange={onFilterChange}
          options={[
            { label: "Ativos", value: "ativo" },
            { label: "Inativos", value: "inativo" },
            { label: "Todos", value: "todos" },
          ]}
        />
      </div>
    </div>
  );
}