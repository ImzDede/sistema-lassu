"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Typography, IconButton } from "@material-tailwind/react";
import { ChevronLeft, ChevronRight, Armchair } from "lucide-react";
import { Session } from "@/types/sessao";

const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface CalendarWidgetProps {
  sessions?: Session[];
  onMonthChange?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  isTeacher: boolean;
  currentUserId?: string;
}

export default function CalendarWidget({ 
  sessions = [], 
  onMonthChange, 
  onDayClick,
  isTeacher,
  currentUserId
}: CalendarWidgetProps) {
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  useEffect(() => {
    console.log("📅 [CalendarWidget] Recebeu sessões:", sessions.length);
    if (sessions.length > 0) {
        console.log("📅 [CalendarWidget] Datas das sessões recebidas:");
        sessions.forEach(s => console.log("   - ", s.dia));
    }
  }, [sessions]);

  useEffect(() => {
    if (onMonthChange) onMonthChange(currentDate);
  }, [currentDate, onMonthChange]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    );
  };

  const getSessionStatus = (day: number) => {
    // Formata a data atual do loop para YYYY-MM-DD
    const dayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Verifica se existe alguma sessão nesta data
    const hasAnySession = sessions.some(s => {
        // Tenta pegar a data de forma segura
        const sDate = typeof s.dia === 'string' ? s.dia.split('T')[0] : s.dia;
        
        // LOG 4: Se achar uma data igual, avisa!
        if (sDate === dayStr) {
            // console.log(`🎉 MATCH FOUND! Dia: ${dayStr}, Sessão ID: ${s.id}`);
        }
        
        return sDate === dayStr;
    });

    if (!hasAnySession) return { hasSession: false, isMine: false };

    // Se houver sessão:
    // 1. Se sou professor, mostro o ponto (pode ser de qualquer um).
    // 2. Se sou aluno, a API já filtrou só as minhas, então se tem sessão, É MINHA.
    return { hasSession: true, isMine: !isTeacher };
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} className="h-12 w-10" />);

    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day);
      const { hasSession } = getSessionStatus(day);

      days.push(
        <div
          key={day}
          onClick={() => onDayClick && onDayClick(new Date(year, month, day))}
          className={`
            flex flex-col items-center justify-start pt-1 h-12 w-10 relative rounded-lg transition-colors group
            ${onDayClick ? "cursor-pointer hover:bg-brand-purple/10" : "cursor-default"}
          `}
        >
          <span
            className={`
              flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-all mb-0.5
              ${
                today
                  ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                  : "text-brand-dark"
              }
            `}
          >
            {day}
          </span>
          
          {hasSession && (
            <div className={`transition-colors ${today ? "text-brand-peach" : "text-brand-purple"}`}>
              <Armchair size={14} strokeWidth={2.5} />
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <Card className="w-full shadow-sm border border-brand-purple/10 bg-brand-surface">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="capitalize font-bold text-brand-dark font-heading">
            {monthNames[month]} <span className="text-gray-400 font-normal">{year}</span>
          </Typography>
          <div className="flex gap-1">
            <IconButton variant="text" size="sm" onClick={handlePrevMonth} className="rounded-full hover:bg-brand-purple/10 text-gray-500">
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
            <IconButton variant="text" size="sm" onClick={handleNextMonth} className="rounded-full hover:bg-brand-purple/10 text-gray-500">
              <ChevronRight className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
        <div className="grid grid-cols-7 mb-2 border-b border-brand-purple/10 pb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="flex justify-center">
              <Typography variant="small" className="font-bold text-xs text-brand-pink uppercase">
                {day}
              </Typography>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 place-items-center mt-2">
          {renderDays()}
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-brand-purple/10">
          <Armchair size={14} className="text-brand-purple" />
          <Typography variant="small" className="text-xs text-gray-400 font-medium">
            {isTeacher ? "Indica dias com agendamentos" : "Indica seus dias de atendimento"}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}