"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns"; 
import { Typography, Spinner } from "@material-tailwind/react";
import Button from "@/components/Button";
import CalendarWidget from "@/components/Calendar";
import { useAuth } from "@/contexts/AuthContext";
import SessionListCard from "@/components/CardSessao";
import { useUsers } from "@/hooks/useUsers";
import { useSessions } from "@/hooks/useSessions";
import SessionListModal from "@/components/SessionListModal";
import { Session } from "@/types/sessao";

export default function Home() {
  const router = useRouter();
  const { isTeacher, user } = useAuth();
  const { refreshUsers, loading: loadingUsers } = useUsers();
  
  // HOOK 1: Sessões para a lista de "Hoje"
  const { 
    sessions: todaySessionsList, 
    loading: loadingToday, 
    fetchSessions: fetchTodaySessions 
  } = useSessions();

  // HOOK 2: Sessões para o Calendário
  const { 
    sessions: calendarSessions, 
    fetchSessions: fetchCalendarSessions 
  } = useSessions();
  
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [daySessions, setDaySessions] = useState<Session[]>([]);
  const today = new Date();
  const formattedDate = format(today, "dd/MM");
  const todayStr = format(today, "yyyy-MM-dd");
  
  useEffect(() => {
    if (isTeacher && user) refreshUsers();

    // 1. Busca Sessões de HOJE
    fetchTodaySessions({ 
        start: todayStr, 
        end: todayStr 
    });

  }, [isTeacher, user, refreshUsers, fetchTodaySessions, todayStr]);

  // 2. Busca Sessões do CALENDÁRIO
  useEffect(() => {
    const start = format(startOfMonth(currentCalendarDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentCalendarDate), "yyyy-MM-dd");
    fetchCalendarSessions({ start, end });
  }, [currentCalendarDate, fetchCalendarSessions]);

  // Filtra e ordena a lista de hoje
  const sessionsToday = todaySessionsList
    .filter((s) => {
      const sessionDate = typeof s.dia === "string" ? s.dia.split("T")[0] : s.dia;
      return sessionDate === todayStr;
    })
    .sort((a, b) => a.hora - b.hora);

  const myTodaySession = sessionsToday[0];

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Procura na lista do CALENDÁRIO
    const sessionsOnThisDay = calendarSessions.filter(s => {
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

        {(loadingUsers || loadingToday) ? (
          <div className="flex justify-center p-8"><Spinner className="text-brand-purple" /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {isTeacher && (
              sessionsToday.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {sessionsToday.slice(0, 3).map((s) => (
                    <SessionListCard
                      key={s.id}
                      therapistName={(s.profissionalNome || "Terapeuta").toUpperCase()}
                      patientName={s.pacienteNome || "Paciente"}
                      patientAvatarUrl={null}
                      sessionLabel={`Sessão ${s.hora}:00`}
                      roomLabel={`Sala ${s.sala}`}
                      timeLabel="Hoje"
                      onClick={() => {
                        if (s.pacienteId) router.push(`/home/pacientes/${s.pacienteId}`);
                      }}
                    />
                  ))}

                  {sessionsToday.length > 3 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDay(today);
                        setDaySessions(sessionsToday);
                        setModalOpen(true);
                      }}
                      className="w-full"
                    >
                      Ver todas as sessões de hoje
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">Nenhuma sessão hoje.</div>
              )
            )}
            
            {!isTeacher && (
              myTodaySession ? (
                <SessionListCard
                    therapistName={myTodaySession.profissionalNome || "Terapeuta"}
                    patientName={myTodaySession.pacienteNome || "Paciente"}
                    patientAvatarUrl={null}
                    sessionLabel={`${myTodaySession.hora}:00`}
                    roomLabel={`Sala ${myTodaySession.sala}`}
                    timeLabel="Hoje"
                    onClick={() => {
                        setSelectedDay(today);
                        setDaySessions([myTodaySession]);
                        setModalOpen(true);
                    }}
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
            sessions={calendarSessions}
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