"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Typography, IconButton } from "@material-tailwind/react";
import { ChevronLeft, ChevronRight, Armchair } from "lucide-react";
import { Session } from "@/types/sessao";
import { useAuth } from "@/contexts/AuthContext";

const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface CalendarWidgetProps {
  sessions?: Session[];
  onMonthChange?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

export default function CalendarWidget({ sessions = [], onMonthChange, onDayClick }: CalendarWidgetProps) {
  const { user, isTeacher } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

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
    const dayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Filtra sessões do dia
    const sessionsOnDay = sessions.filter(s => {
        const sDate = typeof s.dia === 'string' ? s.dia.split('T')[0] : s.dia;
        return sDate === dayStr;
    });

    if (sessionsOnDay.length === 0) return { hasSession: false, isMine: false };

    // Se for Admin, qualquer sessão conta para marcar o dia
    if (isTeacher) return { hasSession: true, isMine: false };

    // Se for Terapeuta, verifica se é dona da sessão usando usuarioId
    const mySession = sessionsOnDay.find(s => {
        const ownerId = s.usuarioId;
        return ownerId === user?.id;
    });
    
    return { hasSession: !!mySession, isMine: true };
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
                  ? "bg-brand-purple text-white shadow-md shadow-brand-pink/40"
                  : "text-gray-600"
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
    <Card className="w-full shadow-sm border border-brand-pink/30 bg-brand-surface">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="capitalize font-bold text-brand-dark">
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
        <div className="grid grid-cols-7 mb-2 border-b border-brand-pink/20 pb-2">
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
        
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-brand-pink/20">
          <Armchair size={14} className="text-brand-purple" />
          <Typography variant="small" className="text-xs text-gray-400 font-medium">
            {isTeacher ? "Indica dias com agendamentos" : "Indica dias com atendimento"}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}