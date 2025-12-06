"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";

const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const todayDate = new Date().getDate();
const eventDays = [5, 12, 15, 24, todayDate];

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++)
      days.push(<div key={`empty-${i}`} className="h-12 w-10" />);

    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day);
      const hasConsultation = eventDays.includes(day);

      days.push(
        <div
          key={day}
          className="flex flex-col items-center justify-start pt-1 h-12 w-10 relative cursor-pointer rounded-lg hover:bg-[#A78FBF]/10 transition-colors group"
        >
          <span
            className={`
              flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-all mb-0.5
              ${
                today
                  ? "bg-[#A78FBF] text-white shadow-md shadow-[#D9A3B6]/40"
                  : "text-gray-600"
              }
            `}
          >
            {day}
          </span>

          {hasConsultation && (
            <div
              className={`transition-colors ${
                today ? "text-[#F2B694]" : "text-[#A78FBF]"
              }`}
            >
              <Stethoscope size={14} strokeWidth={2.5} />
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <Card
      className="w-full shadow-sm border border-[#D9A3B6]/30 bg-white"
      placeholder={undefined}
    >
      <CardBody className="p-4" placeholder={undefined}>
        <div className="flex items-center justify-between mb-4">
          <Typography
            variant="h6"
            className="capitalize font-bold text-[#A78FBF]"
            placeholder={undefined}
          >
            {monthNames[month]}{" "}
            <span className="text-gray-400 font-normal">{year}</span>
          </Typography>
          <div className="flex gap-1">
            <IconButton
              variant="text"
              size="sm"
              onClick={handlePrevMonth}
              className="rounded-full hover:bg-[#A78FBF]/10 text-gray-500"
              placeholder={undefined}
            >
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
            <IconButton
              variant="text"
              size="sm"
              onClick={handleNextMonth}
              className="rounded-full hover:bg-[#A78FBF]/10 text-gray-500"
              placeholder={undefined}
            >
              <ChevronRight className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2 border-b border-[#D9A3B6]/20 pb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="flex justify-center">
              <Typography
                variant="small"
                className="font-bold text-xs text-[#D9A3B6] uppercase"
                placeholder={undefined}
              >
                {day}
              </Typography>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 place-items-center mt-2">
          {renderDays()}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[#D9A3B6]/20">
          <Stethoscope size={14} className="text-[#A78FBF]" />
          <Typography
            variant="small"
            className="text-xs text-gray-400 font-medium"
            placeholder={undefined}
          >
            Indica dia com consulta
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}
