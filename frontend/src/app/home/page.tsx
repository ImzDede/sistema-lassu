"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Typography, Spinner } from "@material-tailwind/react";
import CalendarWidget from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import CardListagem from "@/components/CardListagem";
import { useUsers } from "@/hooks/useUsers";
import { useSessions } from "@/hooks/useSessions";
import SessionListModal from "@/components/SessionListModal";

export default function Home() {
  const { isTeacher, user } = useAuth();
  const { users, loading: loadingUsers, fetchUsers } = useUsers();
  const { sessions, loading: loadingSessions, fetchSessions } = useSessions();

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [daySessions, setDaySessions] = useState<any[]>([]);

  const today = new Date();
  const formattedDate = format(today, "dd/MM");
  
  useEffect(() => {
    if (isTeacher && user) fetchUsers();
    fetchSessions(currentCalendarDate);
  }, [isTeacher, user, fetchUsers, fetchSessions, currentCalendarDate]);

  // Card de Hoje da Terapeuta
  const myTodaySession = !isTeacher ? sessions.find(s => {
    // Blindagem para garantir comparação correta
    const sessionDate = typeof s.dia === 'string' ? s.dia.split('T')[0] : s.dia;
    const todayStr = format(today, "yyyy-MM-dd");
    const ownerId = s.usuarioId
    
    return sessionDate === todayStr && ownerId === user?.id;
  }) : null;

  // --- CORREÇÃO AQUI ---
  const handleDayClick = (date: Date) => {
    // 1. Removemos o bloqueio (!isTeacher return)
    
    const dateStr = format(date, "yyyy-MM-dd");
    
    // 2. Filtra as sessões do dia clicado
    let sessionsOnThisDay = sessions.filter(s => {
        const sDate = typeof s.dia === 'string' ? s.dia.split('T')[0] : s.dia;
        return sDate === dateStr;
    });

    // 3. Se NÃO for professora, filtra para mostrar apenas as sessões DELA
    if (!isTeacher) {
        sessionsOnThisDay = sessionsOnThisDay.filter(s => {
            const ownerId = s.usuarioId
            return ownerId === user?.id;
        });
    }
    
    // 4. Abre o modal com a lista filtrada
    setSelectedDay(date);
    setDaySessions(sessionsOnThisDay);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <Typography variant="h3" className="font-bold uppercase mb-2 text-center md:text-left mt-4 md:mt-0 text-brand-dark">INÍCIO</Typography>

      {/* SEÇÃO 1: LISTA PRINCIPAL (HOJE) */}
      <section className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface p-4 md:p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
          <h2 className="text-lg font-bold uppercase text-brand-dark">Hoje, {formattedDate}</h2>
        </div>

        {(loadingUsers || loadingSessions) ? (
          <div className="flex justify-center p-8"><Spinner className="text-brand-purple" /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {isTeacher && <div className="text-center py-6 text-gray-400 text-sm">Selecione um dia no calendário para ver os detalhes.</div>}
            {!isTeacher && (
              myTodaySession ? (
                <CardListagem
                    nomePrincipal={myTodaySession.pacienteNome || "Paciente"}
                    detalhe={`Sala ${myTodaySession.sala}`}
                    horario={`${myTodaySession.hora}:00`}
                    status="Agendada"
                />
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">Você não possui atendimentos hoje.</div>
              )
            )}
          </div>
        )}
      </section>

      {/* SEÇÃO 2: CALENDÁRIO */}
      <section className="w-full shadow-lg border-t-4 border-brand-purple bg-brand-surface p-4 md:p-6 rounded-xl mb-8">
        <h2 className="text-lg font-bold uppercase mb-4 text-brand-dark">Agenda</h2>
        <CalendarWidget 
            sessions={sessions} 
            onMonthChange={setCurrentCalendarDate} 
            onDayClick={handleDayClick}
        />
      </section>

      <SessionListModal open={modalOpen} onClose={() => setModalOpen(false)} date={selectedDay} sessions={daySessions} />
    </div>
  );
}