"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import CardListagem from "@/components/CardListagem";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import RoleBadge from "@/components/RoleBadge";
import Button from "@/components/Button";
import { usePagination } from "@/hooks/usePagination";
import { User } from "@/types/usuarios";

export default function TerapeutasPage() {
  const router = useRouter();
  const { user, isTeacher, isLoading: authLoading } = useAuth();
  const { users, loading: loadingData, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");
  const { visibleCount, loadMore, hasMore } = usePagination(8, 8);

  useEffect(() => {
    if (!authLoading) {
        if (!user || !user.permAdmin) {
            router.push("/home");
        }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // filteredUsers
  const safeUsers = users || [];

  const filteredUsers = safeUsers.filter((usuario: User) => {
    if (usuario.permAdmin) return false; // Esconde admins

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (usuario.nome && usuario.nome.toLowerCase().includes(term)) ||
      (usuario.matricula && usuario.matricula.toString().includes(term));

    let matchesStatus = true;
    if (statusFilter === "ativo") matchesStatus = usuario.ativo === true;
    if (statusFilter === "inativo") matchesStatus = usuario.ativo === false;

    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(0, visibleCount);

  if (authLoading || !isTeacher) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
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
            {paginatedUsers.length > 0 ? (
              <>
                {paginatedUsers.map((user: User) => (
                  <CardListagem
                    key={user.id}
                    badge={<RoleBadge user={user} />} 
                    nomePrincipal={user.nome}
                    detalhe={user.matricula ? `Matrícula: ${user.matricula}` : "Sem matrícula"}
                    status={user.ativo ? "Ativo" : "Inativo"}
                    onClick={() => router.push(`/home/terapeutas/${user.id}`)}
                  />
                ))}
                
                {hasMore(filteredUsers.length) && (
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" onClick={loadMore} className="border-brand-purple text-brand-purple">
                      Carregar Mais Terapeutas
                    </Button>
                  </div>
                )}
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