"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import CardListagem from "@/components/CardListagem";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import { calculateAge } from "@/utils/date";
import { usePagination } from "@/hooks/usePagination";
import { Patient } from "@/types/paciente";
import PaginationControls from "@/components/PaginationControls";

export default function PacientesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const { patients, loading: loadingData, fetchPatients } = usePatients();
  const pagination = usePagination();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");

  const getBackendStatus = (status: string) => {
      if (status === "ativo") return "atendimento";
      if (status === "inativo") return "encaminhada";
      return undefined;
  };

  const loadPatients = (pageToLoad: number) => {
      const backendStatus = getBackendStatus(statusFilter);
      
      fetchPatients({
          page: pageToLoad,
          nome: searchTerm,
          status: backendStatus
      }).then((meta) => {
          if (meta) {
              pagination.setMetadata({
                  currentPage: meta.page || pageToLoad,
                  totalPages: meta.totalPages || 1,
                  totalItems: meta.total || 0,
                  itemCount: 0,
                  itemsPerPage: 8
              });
          }
      });
  };

  // Carrega dados ao entrar ou mudar filtros
  useEffect(() => {
    if (!authLoading && user) {
      const canAccess = user.permCadastro || user.permAtendimento;
      if (!canAccess) {
          router.push("/home");
      } else {
          // Reseta para página 1 ao filtrar
          pagination.setPage(1); 
          loadPatients(1);
      }
    }
  }, [authLoading, user, searchTerm, statusFilter]); 

  const handlePageChange = (newPage: number) => {
      pagination.setPage(newPage); // Atualiza o número visualmente
      loadPatients(newPage);       // Busca os dados da nova página
  };

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
            {patients.length > 0 ? (
              <>
                {patients.map((p: Patient) => (
                  <CardListagem
                    key={p.id}
                    nomePrincipal={p.nome}
                    detalhe={
                      <div className="flex flex-col gap-1">
                         <span className="font-bold text-gray-700">
                             Idade: {p.dataNascimento ? calculateAge(p.dataNascimento) : '-'}
                         </span>
                      </div>
                    }
                    status={p.status}
                  />
                ))}

                <PaginationControls 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    onPageChange={handlePageChange}
                />
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