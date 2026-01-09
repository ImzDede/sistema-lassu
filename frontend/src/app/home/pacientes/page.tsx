"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import CardListagem from "@/components/CardListagem";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import { calculateAge } from "@/utils/date";
import Button from "@/components/Button";
import { usePagination } from "@/hooks/usePagination";
import { Patient } from "@/types/paciente";

export default function PacientesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { patients, loading: loadingData, refreshPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");
  const { visibleCount, loadMore, hasMore } = usePagination(8, 8);

  useEffect(() => {
    if (!authLoading && user) {
      const canAccess = user.permCadastro || user.permAtendimento;
      if (!canAccess) {
          router.push("/home");
      } else {
          refreshPatients();
      }
    }
  }, [authLoading, user, router, refreshPatients]);

  const filteredList = patients.filter((p: Patient) => {
    const term = searchTerm.toLowerCase();
    
    // 1. Busca por nome ou CPF
    const matchesSearch =
      (p.nome && p.nome.toLowerCase().includes(term)) || 
      (p.cpf && p.cpf.includes(term));

    // 2. Lógica filtro
    // 'atendimento' = Ativo no sistema
    // 'encaminhada' = Inativo/Concluído no sistema
    const pStatus = p.status ? p.status.toLowerCase() : "";
    
    let matchesStatus = true;
    if (statusFilter === "ativo") {
      matchesStatus = pStatus === "atendimento";
    } else if (statusFilter === "inativo") {
      matchesStatus = pStatus === "encaminhada";
    }

    return matchesSearch && matchesStatus;
  });

  const paginatedList = filteredList.slice(0, visibleCount);

  if (authLoading) return <div className="flex justify-center h-[80vh] items-center"><Spinner className="h-12 w-12 text-brand-purple" /></div>;

  return (
    <div className="flex flex-col w-full h-full">
      <div className="mb-8 text-center lg:text-left">
        <Typography variant="h3" className="font-bold uppercase text-brand-dark">Meus Pacientes</Typography>
      </div>

      <SearchInputWithFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        searchLabel="Procurar pacientes"
      />

      <div className="flex flex-col gap-4 pb-20 md:pb-0">
        {loadingData ? (
          <div className="flex justify-center p-10"><Spinner className="text-brand-purple" /></div>
        ) : (
          <>
            {paginatedList.length > 0 ? (
              <>
                {paginatedList.map((p: Patient) => (
                  <CardListagem
                    key={p.id}
                    nomePrincipal={p.nome}
                    detalhe={
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-700">Idade: {calculateAge(p.dataNascimento)}</span>
                      </div>
                    }
                    status={p.status}
                  />
                ))}
                {hasMore(filteredList.length) && (
                   <div className="mt-4 flex justify-center">
                    <Button variant="outline" onClick={loadMore} className="border-brand-purple text-brand-purple">
                      Carregar Mais Pacientes
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-8 bg-white/50 rounded-xl border border-gray-100">
                <Typography className="text-gray-500">Nenhum paciente encontrado.</Typography>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}