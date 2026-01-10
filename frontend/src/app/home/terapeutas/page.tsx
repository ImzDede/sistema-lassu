"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import CardListagem from "@/components/CardListagem";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import RoleBadge from "@/components/RoleBadge";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";
import { User } from "@/types/usuarios";

export default function TerapeutasPage() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { users, loading: loadingData, fetchUsers } = useUsers();
  const pagination = usePagination();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");

  const loadTherapists = (pageToLoad: number) => {
      // Converte filtro de status
      let ativoFilter: boolean | undefined = undefined;
      if (statusFilter === "ativo") ativoFilter = true;
      if (statusFilter === "inativo") ativoFilter = false;

      fetchUsers({
          page: pageToLoad,
          limit: 8,
          ativo: ativoFilter
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

  useEffect(() => {
    if (!authLoading) {
        if (!user || !user.permAdmin) {
            router.push("/home");
        } else {
            pagination.setPage(1);
            loadTherapists(1);
        }
    }
  }, [user, authLoading, statusFilter]); 

  const handlePageChange = (newPage: number) => {
      pagination.setPage(newPage);
      loadTherapists(newPage);
  };

  if (authLoading || !isTeacher) {
    return <div className="flex items-center justify-center h-[80vh]"><Spinner className="h-12 w-12 text-brand-purple" /></div>;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="mb-8 text-center lg:text-left">
        <Typography variant="h3" className="font-bold uppercase text-brand-dark">TERAPEUTAS</Typography>
      </div>

      <SearchInputWithFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        searchLabel="Procurar terapeuta" 
      />

      <div className="flex flex-col gap-4 pb-20 md:pb-0">
        {loadingData ? (
          <div className="flex justify-center p-10"><Spinner className="text-brand-purple" /></div>
        ) : (
          <>
            {users.length > 0 ? (
              <>
                {users.map((tUser: User) => (
                  <CardListagem
                    key={tUser.id}
                    badge={<RoleBadge user={tUser} />} 
                    nomePrincipal={tUser.nome}
                    detalhe={tUser.matricula ? `Matrícula: ${tUser.matricula}` : "Sem matrícula"}
                    status={tUser.ativo ? "Ativo" : "Inativo"}
                    onClick={() => router.push(`/home/terapeutas/${tUser.id}`)}
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
                <Typography className="text-gray-500">Nenhum resultado encontrado.</Typography>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}