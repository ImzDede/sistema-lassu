"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "@material-tailwind/react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import CardListagem from "@/components/CardListagem";
import SearchInputWithFilter from "@/components/SearchInputWithFilter";
import { calculateAge } from "@/utils/date";
import { formatPhone } from "@/utils/format";

export default function PacientesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { patients, loading: loadingData, fetchPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    if (!authLoading && user) {
      const canAccess =
        user.permCadastro || user.permAtendimento || user.permAdmin;
      if (!canAccess) {
        router.push("/home");
      }
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [fetchPatients, user]);

  const filteredList = patients.filter((item) => {
    const p = item.patient;
    if (!p) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.nome.toLowerCase().includes(term) || (p.cpf && p.cpf.includes(term));

    const matchesStatus =
      statusFilter === "todos" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="flex justify-center h-[80vh] items-center">
        <Spinner className="h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="mb-8 text-center md:text-left">
        <Typography
          variant="h3"
          className="font-bold uppercase text-brand-dark"
        >
          Meus Pacientes
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
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <CardListagem
                  key={item.patient.id}
                  nomePrincipal={item.patient.nome}
                  detalhe={
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-700">
                        Idade: {calculateAge(item.patient.dataNascimento)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        Tel: {formatPhone(item.patient.telefone)}
                      </span>
                    </div>
                  }
                  status={item.patient.status}
                />
              ))
            ) : (
              <div className="text-center p-8 bg-white/50 rounded-xl border border-gray-100">
                <Typography className="text-gray-500">
                  Nenhum paciente encontrado.
                </Typography>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
