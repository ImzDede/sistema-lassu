"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { patientService } from "@/services/patientServices";
import CardTerapeuta from "@/components/CardTerapeuta";
import SearchInputWithFilter, { FilterOption } from "@/components/SearchInputWithFilter";
import PaginationControls from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { User } from "@/types/usuarios";

export default function TerapeutasPage() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { users, loading: loadingData, fetchUsers } = useUsers();
  const pagination = usePagination();
  const [searchTerm, setSearchTerm] = useState("");
  const [patientCounts, setPatientCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState("ativos"); 

  const filterOptions: FilterOption[] = [
    { label: "Ativos", value: "ativos", placeholder: "Procurar terapeutas..." },
    { label: "Inativos", value: "inativos", placeholder: "Procurar terapeutas..." },
    { label: "Todos", value: "todos", placeholder: "Procurar terapeutas..." },
  ];

  const loadTherapists = (pageToLoad: number) => {
    const queryPayload: any = {
        page: pageToLoad,
        limit: 8,
        nome: searchTerm || undefined,
    };

    if (statusFilter === "ativos") queryPayload.ativo = true;
    if (statusFilter === "inativos") queryPayload.ativo = false;

    fetchUsers(queryPayload).then((meta) => {
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

  useEffect(() => {
    if (!authLoading) {
        if (!user || !user.permAdmin) {
            router.push("/home");
        } else {
            const timer = setTimeout(() => {
                pagination.setPage(1);
                loadTherapists(1);
            }, 500);
            return () => clearTimeout(timer);
        }
    }
  }, [user, authLoading, searchTerm, statusFilter]);

  // Busca contagem real de pacientes por terapeuta
  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      if (!users || users.length === 0) {
        setPatientCounts({});
        return;
      }

      try {
        const results = await Promise.all(
          users.map(async (u) => {
            try {
              // Busca pacientes vinculados a este terapeuta
              const resp = await patientService.getAll({ 
                  page: 1, 
                  limit: 1, 
                  userTargetId: u.id,
                  status: "atendimento" // Conta apenas os em atendimento
              });
              
              const meta: any = resp.meta;
              const total = meta?.totalItems ?? meta?.total ?? meta?.count ?? 0;
              
              return [u.id, total] as const;
            } catch {
              return [u.id, 0] as const;
            }
          })
        );

        if (!cancelled) {
          const map: Record<string, number> = {};
          results.forEach(([id, total]) => (map[id] = total));
          setPatientCounts(map);
        }
      } catch {
        if (!cancelled) setPatientCounts({});
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [users]);
 

  const handlePageChange = (newPage: number) => {
      pagination.setPage(newPage);
      loadTherapists(newPage);
  };

  if (authLoading || !isTeacher) {
    return <div className="flex items-center justify-center h-[80vh]"><Spinner className="h-12 w-12 text-brand-purple" /></div>;
  }

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <div className="text-center lg:text-left">
        <Typography variant="h3" className="font-bold uppercase text-brand-encaminhamento">TERAPEUTAS</Typography>
      </div>

      <SearchInputWithFilter
        value={searchTerm}
        onChange={setSearchTerm}
        filter={statusFilter}
        onFilterChange={(newFilter) => {
            setStatusFilter(newFilter); 
            setSearchTerm(""); 
        }}
        options={filterOptions}
      />

      <div className="flex flex-col gap-4 pb-20 md:pb-0 min-h-[400px]">
        {loadingData ? (
          <div className="flex justify-center p-10"><Spinner className="text-brand-purple" /></div>
        ) : (
          <>
            {users.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((tUser: User) => (
                      <CardTerapeuta
                        key={tUser.id}
                        name={tUser.nome}
                        registration={tUser.matricula || "S/M"}
                        avatarUrl={null} 
                        occupiedSlots={patientCounts[tUser.id] ?? 0} 
                        capacity={5}
                        onClick={() => router.push(`/home/terapeutas/${tUser.id}`)}
                        className={!tUser.ativo ? "opacity-60 grayscale" : ""}
                        accentColor='brand-encaminhamento'
                      />
                    ))}
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
                <Typography className="text-gray-400 font-medium">Nenhum terapeuta encontrado.</Typography>
                <Typography className="text-gray-300 text-sm mt-1">Tente ajustar os filtros de busca.</Typography>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}