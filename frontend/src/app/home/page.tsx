"use client";

import React, { useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Spinner } from "@material-tailwind/react";
import CalendarWidget from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import CardListagem from "@/components/CardListagem";
import RoleBadge from "@/components/RoleBadge";
import { useUsers } from "@/hooks/useUsers";

export default function Home() {
  const { isTeacher, user } = useAuth();
  const { users, loading: loadingData, fetchUsers } = useUsers();
  const today = new Date();
  const formattedDate = format(today, "dd/MM");
  const currentMonth = format(today, "MMMM", { locale: ptBR });
  const weekOfMonth = Math.ceil(today.getDate() / 7);

  useEffect(() => {
    if (isTeacher && user) {
      fetchUsers();
    }
  }, [isTeacher, user, fetchUsers]);

  const displayedList = (isTeacher && users)
    ? users.filter((u: any) => u.user && !u.user.permAdmin)
    : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Seção 1: Lista Principal */}
      <section className="bg-brand-surface border border-brand-pink/30 p-4 md:p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold uppercase text-brand-dark">
            Hoje, {formattedDate}
          </h2>
        </div>

        {loadingData ? (
          <div className="flex justify-center p-8">
            <Spinner className="text-brand-purple" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            
            {/* CENÁRIO 1: PROFESSORA */}
            {isTeacher &&
              displayedList.map((item: any) => (
                <CardListagem
                  key={item.user.id}
                  badge={<RoleBadge user={item.user} />} 
                  nomePrincipal={item.user.nome} // Acessando .user
                  detalhe={
                    item.user.matricula
                      ? `Mat: ${item.user.matricula}`
                      : "Sem matrícula"
                  }
                  horario="Ver"
                />
              ))}

            {/* CENÁRIO 2: ALUNA (Mockado por enquanto, pois API de agendamento não foi dada) */}
            {!isTeacher && (
              <>
                <CardListagem
                  nomePrincipal="Neuza Barbosa"
                  detalhe="1ª Sessão"
                  horario="09:00"
                />
                <CardListagem
                  nomePrincipal="Francisca Lima"
                  detalhe="2ª Sessão"
                  horario="11:00"
                />
              </>
            )}

            {isTeacher && displayedList.length === 0 && (
              <p className="text-gray-400 text-sm">
                Nenhum usuário encontrado.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Calendário */}
      <section className="bg-brand-surface border border-brand-pink/30 p-4 md:p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-bold uppercase mb-4 text-brand-dark">
          Semana {weekOfMonth}, {currentMonth}
        </h2>
        <CalendarWidget />
      </section>
    </div>
  );
}
