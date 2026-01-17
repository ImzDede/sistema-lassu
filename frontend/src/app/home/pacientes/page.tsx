"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import CardPaciente, { PatientStatus } from "@/components/CardPaciente";
import SearchInputWithFilter, { FilterOption } from "@/components/SearchInputWithFilter";
import PaginationControls from "@/components/PaginationControls";
import { differenceInYears, parseISO } from "date-fns"; 
import { usePagination } from "@/hooks/usePagination";
import { Patient } from "@/types/paciente";

export default function PacientesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const { patients, loading: loadingData, fetchPatients } = usePatients();
  const pagination = usePagination();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ativos" | "inativos" | "todos">("ativos");

  const filterOptions: FilterOption[] = [
    { label: "Ativos", value: "ativos", placeholder: "Procurar pacientes..." },
    { label: "Inativos", value: "inativos", placeholder: "Procurar pacientes..." },
    { label: "Todos", value: "todos", placeholder: "Procurar pacientes..." },
  ];

  const loadPatients = (pageToLoad: number) => {
    if (!user) return;

    const queryPayload: any = {
      page: pageToLoad,
      limit: 8,
      nome: searchTerm || undefined,
    };

    if (statusFilter === "ativos") queryPayload.status = "atendimento";
    if (statusFilter === "inativos") queryPayload.status = "encaminhada";
    
    fetchPatients(queryPayload).then((meta) => {
        if (meta) {
            pagination.setMetadata({
                currentPage: meta.page || pageToLoad,
                totalPages: meta.totalPages || 1,
                totalItems: meta.total || 0,
                itemCount: 0,
                itemsPerPage: 8
            });
        }
    }).catch(err => console.error("Erro listagem:", err));
  };

  useEffect(() => {
    if (!authLoading && user) {
      // Verifica permissões básicas de acesso à tela
      const hasAnyPermission = user.permCadastro || user.permAtendimento || user.permAdmin;
      
      if (!hasAnyPermission) {
          router.push("/home");
      } else {
          const timer = setTimeout(() => {
              pagination.setPage(1); 
              loadPatients(1);
          }, 500);
          return () => clearTimeout(timer);
      }
    }
  }, [authLoading, user, searchTerm, statusFilter]); 

  const handlePageChange = (newPage: number) => {
      pagination.setPage(newPage); 
      loadPatients(newPage); 
  };

  const mapStatusToCard = (pStatus: string): PatientStatus | null => {
      if (pStatus === "atendimento") return "in_progress";
      if (pStatus === "alta") return "completed";
      if (pStatus === "desistência") return "dropped";
      return null;
  };

  if (authLoading) return <div className="flex justify-center h-[80vh] items-center"><Spinner className="h-12 w-12 text-brand-purple" /></div>;

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <div className="text-center lg:text-left">
        <Typography variant="h3" className="font-bold uppercase text-brand-encaminhamento">Minhas Pacientes</Typography>
      </div>

      <SearchInputWithFilter
        value={searchTerm}
        onChange={setSearchTerm}
        filter={statusFilter}
        onFilterChange={(newFilter) => {
            setStatusFilter(newFilter as "ativos" | "inativos" | "todos");
            setSearchTerm("");
        }}
        options={filterOptions}
      />

      <div className="flex flex-col gap-4 pb-20 md:pb-0 min-h-[400px]">
        {loadingData ? (
          <div className="flex justify-center p-10"><Spinner className="text-brand-purple" /></div>
        ) : (
          <>
            {patients.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {patients.map((p: Patient) => {
                    const ageNumber = p.dataNascimento 
                      ? differenceInYears(new Date(), parseISO(p.dataNascimento)) 
                      : null;

                    return (
                      <CardPaciente
                        key={p.id}
                        name={p.nome}
                        age={ageNumber}
                        avatarUrl={null}
                        progressPercent={0}
                        showPercentLabel={true}
                        status={mapStatusToCard(p.status || "")}
                        onClick={() => router.push(`/home/pacientes/${p.id}`)}
                      />
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-center">
                    <PaginationControls 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        hasNext={pagination.hasNext}
                        hasPrev={pagination.hasPrev}
                        onPageChange={handlePageChange}
                        accentColorClass="brand-encaminhamento"
                    />
                </div>
              </>
            ) : (
              <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200 mt-4">
                <Typography className="text-gray-400 font-medium">Nenhum paciente encontrado.</Typography>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}