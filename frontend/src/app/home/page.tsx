"use client";

import React, { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns"; 
import { Typography, Spinner } from "@material-tailwind/react";
import CalendarWidget from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import CardListagem from "@/components/CardListagem";
import { useUsers } from "@/hooks/useUsers";
import { useSessions } from "@/hooks/useSessions";
import SessionListModal from "@/components/SessionListModal";
import { Session } from "@/types/sessao";

export default function Home() {
  const { isTeacher, user } = useAuth();
  const { refreshUsers, loading: loadingUsers } = useUsers();
  const { sessions, loading: loadingSessions, fetchSessions } = useSessions();
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [daySessions, setDaySessions] = useState<Session[]>([]);
  const today = new Date();
  const formattedDate = format(today, "dd/MM");
  
  useEffect(() => {
    // Carrega lista de usuários apenas se for professor (para filtros futuros)
    if (isTeacher && user) refreshUsers();

    // 1. Define intervalo do mês visível no calendário
    const start = format(startOfMonth(currentCalendarDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentCalendarDate), "yyyy-MM-dd");

    // 2. Prepara filtros básicos
    const filters: any = { start, end };
    
    fetchSessions(filters);

  }, [isTeacher, user, refreshUsers, fetchSessions, currentCalendarDate]);

  // Encontra a sessão de "Hoje" para o card de destaque
  const myTodaySession = sessions.find(s => {
    // Normaliza a data para YYYY-MM-DD para evitar erros de hora/fuso
    const sessionDate = typeof s.dia === 'string' ? s.dia.split('T')[0] : s.dia;
    const todayStr = format(today, "yyyy-MM-dd");
    
    // Se a API já filtrou (aluno), qualquer sessão hoje é válida.
    // Se for professor, mostra qualquer uma (ou a primeira) do dia.
    return sessionDate === todayStr;
  });

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Filtra as sessões do dia clicado
    const sessionsOnThisDay = sessions.filter(s => {
        const sDate = typeof s.dia === 'string' ? s.dia.split('T')[0] : s.dia;
        return sDate === dateStr;
    });
    
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
            {isTeacher && <div className="text-center py-6 text-gray-400 text-sm">Selecione um dia no calendário para ver os detalhes da clínica.</div>}
            
            {!isTeacher && (
              myTodaySession ? (
                <CardListagem
                    nomePrincipal={myTodaySession.pacienteNome || "Paciente"}
                    detalhe={`Sala ${myTodaySession.sala}`}
                    horario={`${myTodaySession.hora}:00`}
                    status={myTodaySession.status}
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
            isTeacher={isTeacher}
            currentUserId={user?.id}
        />
      </section>

      <SessionListModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        date={selectedDay} 
        sessions={daySessions} 
        isTeacher={isTeacher} 
      />
    </div>
  );
}