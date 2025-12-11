"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import CardListagem from "@/components/CardListagem";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import RoleBadge from "@/components/RoleBadge";

export default function TerapeutasPage() {
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const { users, loading: loadingData, fetchUsers } = useUsers(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !isTeacher) {
      router.push("/home");
    }
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher) {
      fetchUsers();
    }
  }, [isTeacher, fetchUsers]);

  const safeUsers = users || [];

  const filteredUsers = safeUsers.filter((item: any) => {
    // PROTEÇÃO: Garante que item e item.user existem
    if (!item || !item.user) return false;
    
    const usuario = item.user;

    // Não mostrar Admins na lista de Terapeutas
    if (usuario.permAdmin) return false;

    // Filtro de Texto
    const matchesSearch =
      (usuario.nome && usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.matricula && usuario.matricula.toString().includes(searchTerm));

    // Filtro de Status
    let matchesStatus = true;
    if (statusFilter === "ativo") matchesStatus = usuario.ativo === true;
    if (statusFilter === "inativo") matchesStatus = usuario.ativo === false;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || !isTeacher) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="mb-8 text-center md:text-left">
        <Typography variant="h3" className="font-bold uppercase text-brand-dark">
          TERAPEUTAS
        </Typography>
      </div>

      <SearchInputWithFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <div className="flex flex-col gap-4 pb-20 md:pb-0">
        {loadingData ? (
          <div className="flex justify-center p-10">
            <Spinner className="text-brand-purple" />
          </div>
        ) : (
          <>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((item: any) => (
                <CardListagem
                  key={item.user.id}
                  badge={<RoleBadge user={item.user} />}
                  nomePrincipal={item.user.nome}
                  detalhe={
                    item.user.matricula
                      ? `Matrícula: ${item.user.matricula}`
                      : "Sem matrícula"
                  }
                  status={item.user.ativo ? "Ativo" : "Inativo"}
                />
              ))
            ) : (
              <div className="text-center p-8 bg-white/50 rounded-xl border border-gray-100">
                <Typography className="text-gray-500">
                  Nenhum resultado encontrado.
                </Typography>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}